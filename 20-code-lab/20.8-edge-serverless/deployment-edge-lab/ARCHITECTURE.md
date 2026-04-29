# 边缘部署实验室 — 架构设计

## 1. 架构概述

本模块实现了边缘环境的部署编排系统，包括构建优化、全球分发、边缘配置管理和回滚机制。展示从代码提交到全球边缘节点的完整部署流程。架构采用"构建一次，全球运行"的边缘原生理念，通过函数级部署粒度实现秒级全球分发，结合智能流量控制和自动回滚保障服务可靠性。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         源码层 (Source Layer)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   TypeScript │  │   Static     │  │   Edge       │                   │
│  │   Source     │  │   Assets     │  │   Config     │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      构建系统 (Build System)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Edge       │  │   Tree       │  │   Polyfill   │  │   Bundle    │ │
│  │   Bundler    │  │   Shaker     │  │   Injector   │  │   Analyzer  │ │
│  │ (ESM /       │  │ (Dead Code   │  │ (Runtime API│  │ (Size /     │ │
│  │  WASM)       │  │  Elimination)│  │  Polyfill)  │  │  Chunks)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      配置管理 (Configuration Management)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Edge       │  │   Environment│  │   Feature    │                   │
│  │   Config     │  │   Mapper     │  │   Flags      │                   │
│  │ (Global KV)  │  │ (dev/staging/│  │ (Rollout     │                   │
│  │              │  │  prod)       │  │  Control)    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      全球分发 (Global Distribution)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Upload     │  │   Replicate  │  │   Anycast    │  │   Edge      │ │
│  │   to Origin  │  │   to Regions │  │   DNS        │  │   Nodes     │ │
│  │              │  │              │  │              │  │ (100+)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      流量控制 (Traffic Control)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Canary     │  │   A/B Test   │  │   Failover   │  │   Geo       │ │
│  │   Router     │  │   Engine     │  │   Controller │  │   Router    │ │
│  │ (Percent /   │  │ (Bucketing / │  │ (Origin      │  │ (Nearest    │ │
│  │  Region)     │  │  Metrics)    │  │  Fallback)   │  │  Edge)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      回滚引擎 (Rollback Engine)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Version    │  │   Health     │  │   Auto       │                   │
│  │   Registry   │  │   Checker    │  │   Rollback   │                   │
│  │ (Immutable   │  │ (HTTP /      │  │ (Error Rate  │                   │
│  │  Artifacts)  │  │  Synthetic)  │  │  Threshold)  │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 构建系统

| 组件 | 职责 | 关键技术 | 优化目标 |
|------|------|----------|----------|
| Edge Bundler | 针对边缘运行时的代码打包（排除 Node.js 原生模块）| esbuild / rollup | 启动速度 |
| Tree Shaker | 死代码消除，减少 Bundle 体积 | 静态分析 + 副作用标记 | 包体积 |
| Polyfill Injector | 边缘运行时缺失 API 的 Polyfill | 运行时检测 + 条件加载 | 兼容性 |

### 3.2 配置管理

| 组件 | 职责 | 同步延迟 | 一致性 |
|------|------|----------|--------|
| Edge Config | 全局配置分发，秒级同步到所有节点 | < 1s | 最终一致 |
| Environment Mapper | 多环境变量映射（dev/staging/prod）| — | — |
| Feature Flag Distributor | 边缘特性开关管理 | < 1s | 最终一致 |

### 3.3 流量控制

| 组件 | 职责 | 分流维度 | 决策速度 |
|------|------|----------|----------|
| Canary Router | 按百分比/地域/用户属性分流 | 多维 | 请求级 |
| A/B Test Engine | 实验分组和指标收集 | 用户哈希 | 请求级 |
| Failover Controller | 源站故障时的降级策略 | 健康状态 | 秒级 |

### 3.4 回滚引擎

| 组件 | 职责 | 检测方式 | 回滚速度 |
|------|------|----------|----------|
| Version Registry | 历史版本存储和快速切换 | — | 秒级 |
| Health Checker | 部署后自动健康检查 | HTTP / 合成监控 | 秒级 |
| Auto Rollback | 异常指标触发自动回滚 | 错误率 / 延迟阈值 | 秒级 |

## 4. 数据流

```
Code Push -> Build -> Validate -> Deploy to Edge -> Health Check -> Monitor -> (Fail -> Rollback)
```

## 5. 边缘平台对比

| 平台 | 运行时 | 全球节点 | 冷启动 | KV 存储 | WASM | 免费额度 | 适用场景 |
|------|--------|----------|--------|---------|------|----------|----------|
| Vercel Edge | V8 Isolate | 100+ | <50ms | Edge Config | 是 | 100GB | 全栈框架 |
| Cloudflare Workers | V8 Isolate | 300+ | <1ms | Workers KV | 是 | 100k/天 | 边缘计算 |
| Deno Deploy | V8 Isolate | 35+ | <10ms | Deno KV | 否 | 免费 | Deno 生态 |
| AWS Lambda@Edge | Node.js | 400+ | 10-100ms | CloudFront | 否 | 无 | AWS 生态 |
| Netlify Edge | Deno | 100+ | <50ms | Blob Store | 否 | 125k/月 | Jamstack |
| Fly.io | Firecracker | 30+ | <300ms | SQLite (LiteFS) | 是 | 无 | 容器边缘 |

## 6. 代码示例

### 6.1 边缘函数构建配置

```typescript
// deployment-edge-lab/src/build/EdgeBundler.ts
interface EdgeFunction {
  path: string;
  handler: string;
  runtime: 'v8-isolate' | 'node';
  memory?: number;
  maxDuration?: number;
}

interface BuildConfig {
  functions: EdgeFunction[];
  externals: string[];      // 排除的 Node.js 原生模块
  polyfills: string[];      // 需要的 Polyfill
  analyze: boolean;         // 是否输出 Bundle 分析
}

class EdgeBundler {
  async build(config: BuildConfig): Promise<BuildResult> {
    const outputs: Record<string, { code: string; size: number }> = {};

    for (const fn of config.functions) {
      const bundle = await this.bundleFunction(fn, config);
      outputs[fn.path] = bundle;
    }

    if (config.analyze) {
      this.printAnalysis(outputs);
    }

    return { outputs, totalSize: Object.values(outputs).reduce((s, o) => s + o.size, 0) };
  }

  private async bundleFunction(
    fn: EdgeFunction,
    config: BuildConfig
  ): Promise<{ code: string; size: number }> {
    // 使用 esbuild 打包
    const result = await esbuild.build({
      entryPoints: [fn.handler],
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2022',
      platform: 'browser', // 边缘运行时使用 Web API
      external: config.externals,
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    let code = result.outputFiles[0].text;

    // 注入 Polyfill
    for (const poly of config.polyfills) {
      code = await this.injectPolyfill(code, poly);
    }

    return { code, size: new TextEncoder().encode(code).length };
  }

  private async injectPolyfill(code: string, name: string): Promise<string> {
    const polyfills: Record<string, string> = {
      'crypto': `import { webcrypto } from 'node:crypto'; globalThis.crypto = webcrypto;`,
      'buffer': `import { Buffer } from 'buffer'; globalThis.Buffer = Buffer;`,
    };
    return (polyfills[name] ?? '') + '\n' + code;
  }

  private printAnalysis(outputs: Record<string, { size: number }>): void {
    console.log('Bundle Analysis:');
    for (const [path, { size }] of Object.entries(outputs)) {
      console.log(`  ${path}: ${(size / 1024).toFixed(2)} KB`);
    }
  }
}

// 使用示例
const config: BuildConfig = {
  functions: [
    { path: '/api/hello', handler: './src/api/hello.ts', runtime: 'v8-isolate' },
    { path: '/api/edge-ai', handler: './src/api/edge-ai.ts', runtime: 'v8-isolate' },
  ],
  externals: ['fs', 'path', 'crypto'],
  polyfills: ['crypto'],
  analyze: true,
};
```

### 6.2 金丝雀部署路由

```typescript
// deployment-edge-lab/src/deploy/CanaryRouter.ts
interface RouteConfig {
  currentVersion: string;
  newVersion: string;
  rolloutPercent: number;
  regionFilter?: string[];
  userFilter?: { header?: string; cookie?: string };
}

class EdgeCanaryRouter {
  route(request: Request, config: RouteConfig): string {
    // 区域过滤
    const country = request.headers.get('cf-ipcountry') ?? 'unknown';
    if (config.regionFilter && !config.regionFilter.includes(country)) {
      return config.currentVersion;
    }

    // 用户属性过滤
    if (config.userFilter?.header) {
      const headerValue = request.headers.get(config.userFilter.header);
      if (headerValue) return config.newVersion;
    }

    // 百分比分流
    const hash = this.hashString(request.headers.get('user-agent') ?? Math.random().toString());
    const bucket = hash % 100;
    return bucket < config.rolloutPercent ? config.newVersion : config.currentVersion;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 部署单位 | 函数级 | 粒度细，影响范围小 |
| 配置分发 | 边缘 KV | 全球低延迟 |
| 回滚策略 | 流量切换 | 秒级回滚 |

## 8. 质量属性

- **速度**: 全球部署分钟级完成
- **安全性**: 渐进式发布降低风险
- **可靠性**: 自动回滚保障稳定性

## 9. 参考链接

- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) — Vercel 边缘函数文档
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) — Cloudflare Workers 平台文档
- [Deno Deploy](https://deno.com/deploy/docs) — Deno 边缘部署平台
- [Edge-First Architecture - Vercel](https://vercel.com/blog/edge-first-applications) — 边缘优先架构设计
- [WebAssembly at the Edge](https://bytecodealliance.org/articles/wasmtime-10-0-0) — 边缘 WASM 运行时
- [Fly.io Docs](https://fly.io/docs/) — 容器边缘部署平台
