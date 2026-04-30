# Runtime Convergence 2026

> **English Deep-Dive** of `10-fundamentals/10.1-language-semantics/theorems/runtime-convergence-theorem.md`

---

## One-Sentence Summary

Under the dual pressures of open-source transparency and standardization (WinterCG, W3C), Node.js, Bun, and Deno are evolving toward an interoperability Nash equilibrium where competitive differentiation catalyzes convergence rather than ecosystem fragmentation.

---

## Runtime Comparison Matrix (2026)

| Dimension | Node.js 24+ | Deno 2.x | Bun 1.2+ | WinterCG Target |
|-----------|-------------|----------|----------|-----------------|
| **TypeScript** | `--experimental-strip-types` (v22+), `tsx` community | Native, no config | Native, fastest transpile | TS as source (proposed) |
| **Built-in Fetch** | Stable (`undici`-backed) | Native (`deno_fetch`) | Native (`Bun.fetch`) | Required |
| **Test Runner** | Built-in (`node:test`, `node:assert`) | Built-in (`Deno.test`) | Built-in (`bun:test`) | Unified assertions (draft) |
| **Watch Mode** | `--watch` (built-in) | `--watch` | `--watch` | - |
| **Package Manager** | npm (built-in), pnpm, yarn | `jsr:` + npm compat | npm, yarn, pnpm compat | Common registry format |
| **ESM ↔ CJS** | Increasingly ESM-first, `.cjs`/`.mjs` | Strict ESM, npm polyfills | Transparent dual loader | ESM standard |
| **Performance** | Baseline | Good, secure-by-default | Fastest startup & bundling | - |
| **Edge/Serverless** | `node:*` limited on some platforms | Native Deno Deploy | Bun runtime for Vercel | WinterCG minimal subset |
| **Security** | `--experimental-permission` | Permissions model (read/net/env) | Experimental sandbox | Capability-based (aspirational) |
| **WASM** | Stable (`WebAssembly` global) | Stable | Stable | Core spec |

---

## WinterCG Fetch Compatibility Example

WinterCG defines a **minimum common Web-interoperable subset** that all server-side runtimes should support. Below is a portable `fetch` wrapper that works on Node.js, Deno, Bun, and Cloudflare Workers without polyfills:

```ts
// lib/fetch-portable.ts
// Compatible with Node.js ≥18, Deno ≥1.3, Bun ≥1.0, Cloudflare Workers

const API_BASE = process?.env?.API_BASE ?? Deno?.env?.get("API_BASE") ?? "https://api.example.com";

export async function fetchUser(id: string, opts?: { signal?: AbortSignal }): Promise<unknown> {
  const url = new URL(`/users/${encodeURIComponent(id)}`, API_BASE);

  // WinterCG-compliant: RequestInit must support `signal`, `method`, `headers`, `body`
  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    signal: opts?.signal,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  // WinterCG-compliant: Response provides `.json()`, `.text()`, `.arrayBuffer()`, `.body` (ReadableStream)
  return res.json();
}
```

### Runtime Detection & Polyfill-Free Bootstrapping

```ts
// lib/runtime.ts
export const runtime =
  typeof (globalThis as any).Deno !== "undefined" ? "deno" :
  typeof (globalThis as any).Bun !== "undefined" ? "bun" :
  typeof process !== "undefined" && process.versions?.node ? "node" :
  "unknown";

// WinterCG defines `navigator.userAgent` for server runtimes (experimental)
export const userAgent: string | undefined =
  (globalThis as any).navigator?.userAgent;
```

### Package.json Conditional Exports for Multi-Runtime

```json
{
  "name": "my-universal-lib",
  "exports": {
    ".": {
      "bun": "./src/index.bun.ts",
      "deno": "./src/index.deno.ts",
      "node": "./src/index.node.ts",
      "workerd": "./src/index.edge.ts",
      "default": "./src/index.ts"
    }
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Runtime-Agnostic Test Matrix

```ts
// test/setup.ts — 根据运行时选择测试适配器
import { runtime } from '../lib/runtime';

export const testRunner =
  runtime === 'node' ? await import('node:test') :
  runtime === 'deno' ? { test: Deno.test, assert: (await import('https://deno.land/std/assert/mod.ts')) } :
  runtime === 'bun' ? { test: Bun.test, assert: await import('bun:test') } :
  null;

if (!testRunner) throw new Error(`Unsupported runtime for tests: ${runtime}`);

// 统一测试接口
export function describe(name: string, fn: () => void) {
  if (runtime === 'node') {
    const { describe: nodeDescribe } = require('node:test');
    nodeDescribe(name, fn);
  } else {
    console.log(`\n${name}`);
    fn();
  }
}

export const { test, assert } = testRunner;
```

### Polyglot Dockerfile

```dockerfile
# Dockerfile — 构建时可切换运行时
ARG RUNTIME=node
FROM node:24-alpine AS node-base
FROM oven/bun:1.2-alpine AS bun-base
FROM denoland/deno:2.2-alpine AS deno-base

FROM ${RUNTIME}-base AS final
WORKDIR /app
COPY package*.json ./

# 运行时特定依赖安装
RUN if [ "$(which node)" != "" ]; then npm ci; fi
RUN if [ "$(which bun)" != "" ]; then bun install; fi
RUN if [ "$(which deno)" != "" ]; then deno cache main.ts; fi

COPY . .

# 统一入口
CMD if [ "$(which node)" != "" ]; then node --experimental-strip-types main.ts; \
    elif [ "$(which bun)" != "" ]; then bun run main.ts; \
    elif [ "$(which deno)" != "" ]; then deno run --allow-all main.ts; \
    fi
```

### Cross-Runtime File I/O Abstraction

```ts
// lib/fs-universal.ts — 跨运行时文件读取
export async function readJsonFile<T = unknown>(path: string): Promise<T> {
  if (runtime === 'deno') {
    const text = await Deno.readTextFile(path);
    return JSON.parse(text);
  }
  if (runtime === 'bun') {
    const file = Bun.file(path);
    return await file.json();
  }
  // Node.js fallback
  const { readFile } = await import('node:fs/promises');
  const text = await readFile(path, 'utf-8');
  return JSON.parse(text);
}

export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  const payload = JSON.stringify(data, null, 2);
  if (runtime === 'deno') {
    await Deno.writeTextFile(path, payload);
    return;
  }
  if (runtime === 'bun') {
    await Bun.write(path, payload);
    return;
  }
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path, payload, 'utf-8');
}
```

### Cross-Runtime Cryptographic Operations (Web Crypto)

```ts
// lib/crypto-universal.ts — 跨运行时哈希与 HMAC（Node ≥18, Deno, Bun, Workers）
const encoder = new TextEncoder();

export async function sha256(message: string): Promise<string> {
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSHA256(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// 使用示例：所有现代运行时均支持 Web Crypto API
const digest = await sha256('hello-world');
console.log(digest); // 统一输出，与平台无关
```

### Cross-Runtime Environment Variable Access

```ts
// lib/env-universal.ts — 统一的跨运行时环境变量读取
export function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof (globalThis as any).Deno !== 'undefined') {
    return (globalThis as any).Deno.env.get(key);
  }
  // Bun 兼容 process.env，Cloudflare Workers 使用 import.meta.env / bindings
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return undefined;
}

// 带有默认值的类型安全封装
export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}
```

### Cross-Runtime Test Matrix with Vitest

```ts
// vitest.config.ts — 多运行时测试矩阵
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // 默认 Node.js
    include: ['test/**/*.test.ts'],
    exclude: ['test/**/*.deno.test.ts', 'test/**/*.bun.test.ts'],
  },
});

// 运行时特定配置
// vitest.config.deno.ts — 使用 @vitest/browser 或 deno 适配器（社区实验性）
// vitest.config.bun.ts — bun:test 兼容层
```

---

## Key Points

- **Nash Equilibrium Dynamics**: The three major runtimes compete fiercely yet simultaneously adopt each other's proven innovations, creating a non-zero-sum game that lifts the entire baseline.
- **Standardization as Gravity**: WinterCG and W3C Web API standards act as irreversible gravitational forces, pulling divergent implementations toward a common center.
- **Adoption Evidence**: Node.js v24+ has assimilated native Fetch API, built-in test runners, and watch-mode—features pioneered by Bun and Deno—while Bun/Deno continuously improve npm compatibility.
- **Hybrid Architecture Emergence**: The 2026 dominant pattern is not "winner takes all" but polyglot runtime architecture: Node.js for core services, Bun for edge functions, Deno for sensitive computations.
- **Historical Parallel**: Browser engine evolution followed an identical trajectory (IE monopoly → multi-engine competition → Chromium consensus), suggesting runtime convergence is structurally inevitable.

## Detailed Explanation

The Runtime Convergence Theorem reframes the seemingly competitive landscape of JavaScript runtimes as a cooperative evolution in disguise. Formally, if we model each runtime's feature set as a vector in a high-dimensional capability space, the Euclidean distance between these vectors has been monotonically decreasing since 2022, not increasing. This is counter-intuitive: conventional wisdom assumes Bun, Deno, and Node.js are fighting a zero-sum war for developer mindshare, yet the data reveals a pattern of rapid cross-pollination.

The theorem identifies two foundational axioms driving this behavior. First, the **Open Source Axiom**: all three runtimes are open-source projects, making feature imitation technically trivial and socially expected. Second, the **Standardization Pressure Axiom**: WinterCG and W3C specifications create institutional scaffolding that rewards compliance over deviation. When Bun demonstrated that native TypeScript execution could be implemented without transpilation, the competitive pressure on Node.js became irresistible—leading to `--experimental-strip-types` in v22+. Conversely, when Node.js entrenched its 2-million-package npm advantage, Bun and Deno had no rational choice but to improve npm compatibility rather than attempt ecosystem replacement.

The critical insight is that **differentiation is the catalyst for convergence, not its opposite**. Each runtime's unique innovation (Bun's speed, Deno's security sandbox, Node.js's enterprise adoption) creates a selective pressure that forces competitors to narrow their gap. The result is not homogenization—each runtime retains its distinct personality—but a rising floor of baseline capabilities. Developers in 2026 benefit from this dynamic by practicing **runtime polyglotism**: selecting the optimal engine per workload rather than committing to a single stack.

---

## Authoritative Links

| 资源 | 描述 | 链接 |
|------|------|------|
| **WinterCG** | Web-interoperable Runtimes 标准组织 | [wintercg.org](https://wintercg.org/) |
| **W3C Web Platform Tests** | 浏览器与运行时兼容性测试 | [wpt.fyi](https://wpt.fyi/) |
| **Node.js v24 Release Notes** | Node.js 官方发布说明 | [nodejs.org/en/blog/release](https://nodejs.org/en/blog/release/) |
| **Deno 2.x Manual** | Deno 官方文档 | [docs.deno.com](https://docs.deno.com/) |
| **Bun Documentation** | Bun 官方文档 | [bun.sh/docs](https://bun.sh/docs) |
| **TC39 ECMAScript Spec** | ECMAScript 语言规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) |
| **Cloudflare Workers Runtime** | Workers 运行时 API | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| **Node.js Type Stripping** | Node.js 原生 TypeScript 支持 | [nodejs.org/api/typescript](https://nodejs.org/api/typescript.html) |
| **Deno Node Compatibility** | Deno npm 兼容层 | [docs.deno.com/runtime/fundamentals/node_compatibility](https://docs.deno.com/runtime/fundamentals/node_compatibility/) |
| **Bun Node.js APIs** | Bun 对 Node API 的兼容实现 | [bun.sh/docs/runtime/nodejs-apis](https://bun.sh/docs/runtime/nodejs-apis) |
| **JSR Registry** | JavaScript 标准注册表 | [jsr.io](https://jsr.io/) |
| **WinterCG Minimum Common API** | 服务端运行时最小公共 API | [proposal-common-min-api](https://common-min-api.proposal.wintercg.org/) |
| **Vercel Edge Runtime** | Edge 运行时兼容性 | [edge-runtime.vercel.app](https://edge-runtime.vercel.app/) |
| **Node.js Permission Model** | Node.js 实验性权限模型 | [nodejs.org/api/permissions](https://nodejs.org/api/permissions.html) |
| **Deno Permissions** | Deno 安全权限文档 | [docs.deno.com/runtime/fundamentals/security](https://docs.deno.com/runtime/fundamentals/security/) |
| **Bun Security & Sandboxing** | Bun 安全相关说明 | [bun.sh/docs/runtime/nodejs-apis](https://bun.sh/docs/runtime/nodejs-apis) |
| **npm Registry API** | npm 注册表 API 文档 | [github.com/npm/registry](https://github.com/npm/registry) |
| **CommonJS vs ESM — Node.js** | Node.js 模块系统 | [nodejs.org/api/esm](https://nodejs.org/api/esm.html) |
| **WebAssembly Core Spec** | W3C WASM 规范 | [webassembly.github.io/spec/core](https://webassembly.github.io/spec/core/) |
| **State of JS 2025** | 开发者调查 | [stateofjs.com](https://stateofjs.com/) | JavaScript 生态年度调查
| **Node.js Benchmarking** | 官方博客 | [nodejs.org/en/blog](https://nodejs.org/en/blog/) | 性能基准测试报告
| **Bun Benchmark Blog** | 官方博客 | [bun.sh/blog](https://bun.sh/blog) | Bun 性能对比博文
| **Deno 2 Blog** | 官方博客 | [deno.com/blog](https://deno.com/blog) | Deno 重大版本发布说明
| **npm Documentation** | 官方文档 | [docs.npmjs.com](https://docs.npmjs.com/) | npm 包管理器文档
| **pnpm Documentation** | 官方文档 | [pnpm.io](https://pnpm.io/) | pnpm 包管理器文档
| **JSR Registry** | 官方文档 | [jsr.io/docs](https://jsr.io/docs) | JavaScript Registry 文档
| **V8 Blog** | 官方博客 | [v8.dev/blog](https://v8.dev/blog) | V8 引擎更新与性能优化
| **Web Crypto API (MDN)** | MDN | [developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | Web 加密标准 API
| **Package.json Conditional Exports** | Node.js 文档 | [nodejs.org/api/packages](https://nodejs.org/api/packages.html#conditional-exports) | 条件导出规范
| **Vitest Documentation** | 官方文档 | [vitest.dev](https://vitest.dev/) | 下一代测试框架
| **UnJS — Universal JavaScript** | 组织 | [unjs.io](https://unjs.io/) | 通用 JavaScript 工具集

---

*English deep-dive. Full Chinese theorem with proof tree: `../../10-fundamentals/10.1-language-semantics/theorems/runtime-convergence-theorem.md`*
*最后更新: 2026-04-29*
