---
title: 'Edge Runtime 架构对比'
description: 'Edge Runtime Architecture: Cloudflare Workers, Vercel Edge, Deno Deploy, Bun Edge, WinterCG interoperability standards'
---

# Edge Runtime 架构对比

> 理论深度: 高级 | 目标读者: 边缘架构师、基础设施工程师、全栈开发者

## 核心观点

1. **Edge Runtime 的本质是隔离模型的革新**：从操作系统进程/容器降级为 V8 Isolate 或轻量级进程，将冷启动从数百毫秒压缩到亚毫秒级，内存开销从数十 MB 降至数 KB。

2. **四大运行时代表两种架构哲学**：Cloudflare Workers 与 Vercel Edge 采用「进程内 V8 Isolate」模型，追求极致密度与零冷启动；Deno Deploy 与 Bun Edge 采用「独立进程/线程」模型，追求生态兼容性与开发者灵活性。

3. **WinterCG 是跨平台互操作的关键**：标准化 `fetch`、`Web Streams`、`Web Crypto` 等 API，使得边缘代码可在不同平台间移植，降低供应商锁定风险。

4. **状态管理决定适用边界**：无状态函数适合认证、路由、A/B 测试等轻量场景；Durable Objects、Deno KV 和嵌入式 SQLite 使有状态边缘计算成为可能，但引入新的一致性复杂性。

5. **混合架构是生产最优解**：边缘层处理无状态轻量逻辑（Workers/Vercel Edge），应用层处理渲染与业务逻辑（Next.js/Remix），状态层处理持久化（Durable Objects/Deno KV/外部数据库）。没有单一运行时能满足所有需求。

## 关键概念

### 从容器到 Isolate：计算模型的第四次跃迁

Web 计算模型经历了四个阶段的演进：

- **CGI 进程级隔离（1993–2005）**：每个 HTTP 请求 fork 新进程，隔离性强但启动开销极高（数十到数百毫秒）。
- **多线程应用服务器与容器化（2005–2015）**：Java Servlet、Node.js 事件循环、Docker/Kubernetes，应用长期驻留内存，但容器启动仍需秒级。
- **Serverless 函数即服务（2015–2020）**：AWS Lambda 标志 FaaS 成熟，Firecracker microVM 将冷启动优化到数百毫秒，但对边缘亚毫秒需求仍过重。
- **Edge Runtime 与 Isolate 模型（2020–至今）**：Cloudflare Workers 于 2017 年首次将 V8 Isolate 大规模应用于边缘，冷启动 <1ms，单进程可运行数万 Isolate。

V8 **Isolate** 是引擎内部的轻量级沙箱。多个 Isolate 运行在同一操作系统进程内，共享底层内存分配器但拥有独立的堆空间与全局上下文。Isolate 创建成本仅需数百微秒，配合 **Heap Snapshot** 机制，新 Isolate 从预编译快照恢复状态，实现近乎零的冷启动。

### 四大运行时深度对比

#### Cloudflare Workers：V8 Isolate 的极致密度

Workers 部署在全球 300+ 城市，其核心特征：

- **单进程多 Isolate 模型**：一个边缘节点的一个 OS 进程内同时运行数万个 Isolate，请求完成后 Isolate 休眠复用，消除「请求结束即销毁」的开销。
- **CPU 时间计费**：不按墙钟时间计费，只按 CPU 时间计费。等待外部 I/O 的 `fetch` 等待时间不计费。
- **Durable Objects**：为需要状态的场景提供单例有状态对象，全球唯一活跃实例，所有请求路由到该实例所在节点，保证强一致性。

局限：原生仅支持 JS/TS/WASM；Node.js 兼容性有限（`node_compat` 覆盖不全）；Free 计划单次 Wall Clock 上限 100ms。

#### Vercel Edge Functions：Web API 优先的中间件运行时

Vercel Edge Runtime 的核心设计哲学是 **「Web API 优先」**：

- 不提供 Node.js 的 `fs`、`http`、`net` 等模块，直接暴露 `fetch`、`Request`、`Response`、`Headers`、`ReadableStream`、`crypto` 等标准化 API。
- Next.js Middleware 是最广泛的应用场景，在路由匹配前执行身份验证、地理围栏、A/B 测试。
- Node.js Compatible Runtime 通过 polyfill 提供部分 npm 兼容，但增加代码体积。

局限：无原生有状态组件（依赖外部存储）；`NextRequest`/`NextResponse` 等平台 API 存在供应商锁定。

#### Deno Deploy：Rust + Tokio 的异步边缘

Deno Deploy 的底层是 **Rust + Tokio** 异步运行时：

- **Tokio** 管理数百万并发连接，JavaScript 异步 I/O 时 V8 交还控制权给 Tokio，I/O 就绪后重新调度。
- **Ops 系统**：所有系统调用（网络、文件、加密）通过 Rust Ops 实现，内存安全由 Rust 所有权系统保证。
- **Deno KV**：内置全球分布式键值存储，支持强一致与最终一致两种模式，以及多键原子事务。

局限：原生生态规模小于 npm；边缘节点密度不及 Cloudflare 全球网络。

#### Bun Edge：Zig + JavaScriptCore 的极致性能

Bun 选择 **JavaScriptCore（JSC）** 而非 V8，以 **Zig** 语言实现：

- **启动速度**比 Node.js 快 4–10 倍，HTTP 吞吐量高 3–5 倍，内存占用低 30–50%。
- 内置 **SQLite** 支持（`bun:sqlite`），可在边缘节点本地执行结构化查询。
- `Bun.serve` 原生支持 WebSocket 升级，无需额外库。

局限：生产环境验证仍在积累中；复杂 npm 包（原生 C++ 插件）存在边缘兼容问题。

### WinterCG 标准化

WinterCG（Web-interoperable Runtimes Community Group）由 Cloudflare、Deno、Vercel、Node.js 等于 2022 年联合成立，使命是**定义最小化的 Web 标准 API 集合**。

核心 API 包括六大类：
- **全局对象**：`globalThis`、`console`、`setTimeout`/`setInterval`、`structuredClone`
- **网络**：`fetch`、`Request`、`Response`、`Headers`、`FormData`、`Blob`、`AbortController`
- **流**：`ReadableStream`、`WritableStream`、`TransformStream`、`TextEncoderStream`
- **加密**：`crypto`（Web Crypto API）、`CryptoKey`、`SubtleCrypto`
- **编码**：`TextEncoder`、`TextDecoder`、`atob`、`btoa`
- **其他**：`Performance`、`Event`、`EventTarget`

任何仅使用这些 API 的代码，理论上可在 Workers、Deno、Node.js、Vercel Edge、Bun 之间无修改运行。框架（Next.js、Astro、Remix、SvelteKit）正在基于 WinterCG API 重构适配层，实现「一次编写，多处部署」。

### 冷启动与隔离模型对比

| 运行时 | 冷启动模型 | 典型延迟 | 隔离强度 |
|--------|-----------|---------|----------|
| AWS Lambda (Node.js) | 容器创建 + 运行时初始化 | 100–800ms | 强（OS 级） |
| Cloudflare Workers | Isolate 从 Snapshot 恢复 | **<1ms** | 中（引擎内） |
| Vercel Edge Functions | Isolate 创建 + 代码加载 | **1–5ms** | 中（引擎内） |
| Deno Deploy | 轻进程创建 + 模块加载 | **5–10ms** | 较强（命名空间） |
| Bun Edge | 进程创建 + 模块加载 | **1–5ms** | 强（OS 级） |

三种隔离模型的权衡：
- **V8 Isolate（进程内）**：启动最快、密度最高（单进程数万 Isolate），但理论上存在 Spectre/Meltdown 侧信道风险。Cloudflare 通过严格同源策略、定时器精度限制和 seccomp-bpf 缓解。
- **轻量级进程（命名空间）**：Deno Deploy 使用 Linux namespaces + seccomp-bpf，隔离强度高于 Isolate，启动仍控制在毫秒级。
- **超轻量进程**：Bun 标准 OS 进程，灵活性最高（文件系统、子进程、信号处理），但密度低于 Isolate。

## 工程决策矩阵

| 决策维度 | 权重 | Workers | Vercel Edge | Deno Deploy | Bun Edge |
|---------|------|---------|-------------|-------------|----------|
| 延迟敏感性（全球分布、冷启动） | 25% | 5/5 | 4/5 | 3/5 | 3/5 |
| 状态需求（有状态逻辑、持久化） | 20% | 4/5 | 2/5 | 4/5 | 4/5 |
| 生态兼容性（npm 包、框架支持） | 20% | 3/5 | 5/5 | 3/5 | 4/5 |
| 开发者体验（调试、工具链、文档） | 15% | 4/5 | 5/5 | 4/5 | 3/5 |
| 成本效率（计费模型、资源密度） | 15% | 5/5 | 4/5 | 4/5 | 4/5 |
| 供应商锁定风险 | 5% | 3/5 | 2/5 | 3/5 | 4/5 |
| **加权总分** | 100% | **4.05** | **3.75** | **3.55** | **3.65** |

**场景化选型建议：**

- **全球低延迟 API 网关**（身份验证、地理围栏、A/B 测试）→ **Cloudflare Workers**。全球 300+ 城市节点、亚毫秒冷启动、Durable Objects 支持有状态会话。
- **Next.js 全栈应用**（SSR、API Routes、Middleware）→ **Vercel Edge Functions**。与 Next.js 深度集成、流式 SSR 原生支持、最大的 Node.js/npm 兼容生态。
- **原生 TypeScript 微服务**（高并发 API、实时通信）→ **Deno Deploy**。原生 TypeScript 无需构建步骤、Tokio 百万级并发、Deno KV 原生状态管理、权限模型安全默认。
- **自托管高性能边缘节点**（游戏服务器、实时协作、本地 SQLite）→ **Bun Edge**（部署于 Fly.io 或自有基础设施）。极致启动速度与吞吐量、嵌入式 SQLite 本地查询、原生 WebSocket 服务器。
- **跨平台可移植应用** → WinterCG 兼容代码 + 抽象适配层。使用标准 API 编写核心逻辑，通过条件编译或运行时检测适配平台特有功能。

**混合架构模式：**

```
CDN/WAF Layer
    ├── Edge Auth / Rate Limit (Workers)
    ├── Edge Cache / A/B Testing (Workers)
    ├── Geo Routing / Redirect (Vercel Edge)
    └── Application Logic (Next.js / Remix / SvelteKit)
            ├── Stateful Sessions (Durable Objects)
            ├── Database (Postgres / PlanetScale)
            └── Message Queue (Kafka / Upstash)
```

## TypeScript 示例

### 运行时能力检测器

```typescript
interface RuntimeCapabilities {
  platform: 'cloudflare-workers' | 'deno' | 'bun' | 'node' | 'unknown';
  supportsFetch: boolean;
  supportsWebCrypto: boolean;
  supportsWebStreams: boolean;
  supportsWebSocket: boolean;
  supportsCacheAPI: boolean;
  supportsKV: boolean;
  supportsDurableObjects: boolean;
  supportsNativeTypeScript: boolean;
  cpuTimeLimitMs: number | null;
  memoryLimitMb: number | null;
}

function detectRuntime(): RuntimeCapabilities {
  const caps: RuntimeCapabilities = {
    platform: 'unknown',
    supportsFetch: typeof globalThis.fetch === 'function',
    supportsWebCrypto: typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.subtle !== 'undefined',
    supportsWebStreams: typeof globalThis.ReadableStream === 'function',
    supportsWebSocket: typeof globalThis.WebSocket === 'function',
    supportsCacheAPI: typeof (globalThis as any).caches !== 'undefined',
    supportsKV: false,
    supportsDurableObjects: false,
    supportsNativeTypeScript: false,
    cpuTimeLimitMs: null,
    memoryLimitMb: null,
  };

  if (typeof (globalThis as any).Deno !== 'undefined') {
    caps.platform = 'deno';
    caps.supportsNativeTypeScript = true;
    caps.supportsKV = typeof (globalThis as any).Deno.openKv === 'function';
    return caps;
  }

  if (typeof (globalThis as any).Bun !== 'undefined') {
    caps.platform = 'bun';
    caps.supportsNativeTypeScript = true;
    return caps;
  }

  if (typeof (globalThis as any).WebSocketPair !== 'undefined' ||
      (typeof (globalThis as any).caches !== 'undefined' && typeof process === 'undefined')) {
    caps.platform = 'cloudflare-workers';
    caps.supportsCacheAPI = true;
    caps.supportsDurableObjects = typeof (globalThis as any).DurableObject !== 'undefined';
    caps.cpuTimeLimitMs = 50;
    caps.memoryLimitMb = 128;
    return caps;
  }

  if (typeof process !== 'undefined' && process.versions?.node) {
    caps.platform = 'node';
    return caps;
  }

  return caps;
}

export function assertCapability(
  caps: RuntimeCapabilities,
  capability: keyof Omit<RuntimeCapabilities, 'platform' | 'cpuTimeLimitMs' | 'memoryLimitMb'>,
  errorMessage?: string
): void {
  if (!caps[capability]) {
    throw new Error(errorMessage || `Capability '${capability}' unsupported on '${caps.platform}'`);
  }
}
```

### WinterCG 兼容性检查器

```typescript
interface WinterCGCheckResult {
  api: string;
  required: boolean;
  available: boolean;
  category: 'network' | 'streams' | 'crypto' | 'encoding' | 'timers' | 'structured-clone';
}

interface WinterCGReport {
  runtime: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  failedRequired: WinterCGCheckResult[];
}

class WinterCGChecker {
  private checks: Array<Omit<WinterCGCheckResult, 'available'>> = [
    { api: 'fetch', required: true, category: 'network' },
    { api: 'Request', required: true, category: 'network' },
    { api: 'Response', required: true, category: 'network' },
    { api: 'Headers', required: true, category: 'network' },
    { api: 'ReadableStream', required: true, category: 'streams' },
    { api: 'WritableStream', required: true, category: 'streams' },
    { api: 'TransformStream', required: true, category: 'streams' },
    { api: 'crypto', required: true, category: 'crypto' },
    { api: 'TextEncoder', required: true, category: 'encoding' },
    { api: 'TextDecoder', required: true, category: 'encoding' },
    { api: 'atob', required: true, category: 'encoding' },
    { api: 'btoa', required: true, category: 'encoding' },
    { api: 'setTimeout', required: true, category: 'timers' },
    { api: 'structuredClone', required: true, category: 'structured-clone' },
    { api: 'console', required: true, category: 'structured-clone' },
  ];

  check(): WinterCGReport {
    const results = this.checks.map(check => ({
      ...check,
      available: typeof (globalThis as any)[check.api] !== 'undefined' ||
        (check.api === 'console' && typeof console !== 'undefined'),
    }));

    const failedRequired = results.filter(r => r.required && !r.available);
    const passed = results.filter(r => r.available).length;

    return {
      runtime: this.detectRuntimeName(),
      score: Math.round((passed / results.length) * 100),
      totalChecks: results.length,
      passedChecks: passed,
      failedRequired,
    };
  }

  private detectRuntimeName(): string {
    if (typeof (globalThis as any).Deno !== 'undefined') return 'Deno';
    if (typeof (globalThis as any).Bun !== 'undefined') return 'Bun';
    if (typeof (globalThis as any).WebSocketPair !== 'undefined') return 'Cloudflare Workers';
    if (typeof process !== 'undefined' && process.versions?.node) return 'Node.js';
    return 'Unknown';
  }
}

export const wintercgChecker = new WinterCGChecker();
```

### 边缘部署验证器

```typescript
interface DeploymentConstraint {
  maxBundleSizeKb: number;
  forbiddenModules: string[];
  maxStartupTimeMs: number;
}

interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
}

class EdgeDeploymentValidator {
  private constraints = new Map<string, DeploymentConstraint>([
    ['cloudflare-workers', {
      maxBundleSizeKb: 1024,
      forbiddenModules: ['fs', 'path', 'child_process', 'cluster', 'os', 'net', 'tls', 'http', 'https', 'dgram'],
      maxStartupTimeMs: 50,
    }],
    ['vercel-edge', {
      maxBundleSizeKb: 4500,
      forbiddenModules: ['fs', 'child_process', 'cluster'],
      maxStartupTimeMs: 100,
    }],
    ['deno-deploy', {
      maxBundleSizeKb: 20000,
      forbiddenModules: [],
      maxStartupTimeMs: 200,
    }],
  ]);

  validate(
    targetRuntime: string,
    sourceCode: string,
    bundleSizeKb: number
  ): { targetRuntime: string; passed: boolean; issues: ValidationIssue[] } {
    const constraint = this.constraints.get(targetRuntime);
    if (!constraint) {
      return {
        targetRuntime,
        passed: false,
        issues: [{ severity: 'error', code: 'UNKNOWN_RUNTIME', message: `Unknown: ${targetRuntime}` }],
      };
    }

    const issues: ValidationIssue[] = [];

    if (bundleSizeKb > constraint.maxBundleSizeKb) {
      issues.push({
        severity: 'error',
        code: 'BUNDLE_TOO_LARGE',
        message: `${bundleSizeKb}KB > limit ${constraint.maxBundleSizeKb}KB`,
        suggestion: 'Use tree shaking, code splitting, or externalize large deps.',
      });
    }

    for (const mod of constraint.forbiddenModules) {
      const patterns = [
        new RegExp(`require\\s*\\(\\s*["']${mod}["']\\s*\\)`, 'g'),
        new RegExp(`import\\s+.*?\\s+from\\s+["']${mod}["']`, 'g'),
      ];
      for (const p of patterns) {
        if (p.test(sourceCode)) {
          issues.push({
            severity: 'error',
            code: 'FORBIDDEN_MODULE',
            message: `Module '${mod}' unavailable in ${targetRuntime}`,
            suggestion: 'Use WinterCG-compatible APIs instead.',
          });
          break;
        }
      }
    }

    const estimatedStartup = 5 + bundleSizeKb * 0.01;
    if (estimatedStartup > constraint.maxStartupTimeMs) {
      issues.push({
        severity: 'warning',
        code: 'SLOW_STARTUP',
        message: `Estimated ${Math.round(estimatedStartup)}ms may exceed ${constraint.maxStartupTimeMs}ms`,
        suggestion: 'Reduce bundle size or use runtime snapshots.',
      });
    }

    return { targetRuntime, passed: !issues.some(i => i.severity === 'error'), issues };
  }
}

export const deploymentValidator = new EdgeDeploymentValidator();
```

## 延伸阅读

- [完整理论文档](../../70-theoretical-foundations/70.5-edge-runtime-and-serverless/34-edge-runtime-architecture.md)
- [WebAssembly Edge Computing](./35-webassembly-edge.md)
- [同构渲染与 Edge SSR](./36-isomorphic-rendering-and-edge-ssr.md)
- [Edge KV 与缓存策略](./38-edge-kv-and-caching.md)
- [WinterCG 官方规范](https://wintercg.org/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
- [Deno Deploy](https://deno.com/deploy)
