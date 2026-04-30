# 定理 3：运行时收敛定理

> **定位**：`10-fundamentals/10.1-language-semantics/theorems/`
> **关联**：`30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_TS_现代运行时深度分析.md`

---

## 定理陈述

**运行时收敛定理**：在开放源码和标准化压力（WinterCG、W3C）下，Node.js、Bun、Deno 三运行时的 Nash 均衡趋向于互操作性收敛，而非差异化最大化。差异化竞争是收敛的催化剂而非分裂的驱动力。

---

## 推理树

```
                    [公理1: 开放源码公理]
                    三大运行时均为开源项目
                           |
                    [公理2: 标准化压力公理]
                    WinterCG + W3C 定义 Web API 标准
                           |
              +------------+------------+
              |                         |
    [引理: Node.js 存量优势]        [引理: Bun/Deno 差异化创新]
    200万+ npm 包，企业采用率 85%      性能/安全/体验创新
              |                         |
              +------------+------------+
                           |
              [三体竞争动态]
              Node.js <-> 竞争 <-> Bun
                  ^       \     /
                  +---- 竞争 -> Deno
                           |
              差异化策略有效？
              +------------+------------+
              |                         |
         [是] 获得用户              [是] 被领先者采纳
              |                         |
              |                    Node.js v24+
              |                    · 采纳原生 Fetch API
              |                    · 采纳内置测试运行器
              |                    · 采纳 watch-mode
              |                         |
              |                    Bun/Deno 反向兼容
              |                    · Bun npm 兼容改进
              |                    · Deno node: 前缀支持
              |                         |
              +------------+------------+
                           |
              [运行时收敛]
              · API 标准化（WinterCG）
              · 行为一致性提升
              · 混合策略成为主流
                           |
              [2026 混合架构模式]
              Node.js 主服务 + Bun 边缘函数
              Deno 敏感计算 + Node.js UI
                           |
              [开发者受益]
              多运行时协同，而非单一押注
```

---

## 历史类比：浏览器引擎收敛

| 阶段 | 引擎格局 | 收敛动力 |
|------|---------|---------|
| 2000 | IE6 垄断 | 无竞争 |
| 2005 | IE vs Firefox | 标准推动（CSS2/ES3） |
| 2010 | IE vs Firefox vs Chrome | WebKit 开源 |
| 2015 | Chrome 主导 | Chromium 共识 |
| 2020 | Chromium 生态 | 标准化成熟 |

**推论**：运行时竞争遵循类似轨迹——差异化创新 -> 最佳实践被标准化 -> 整体基线提升。

---

## 运行时深度对比表（Node.js / Deno / Bun / WinterCG）

| 维度 | Node.js (v24+) | Deno (v2+) | Bun (v1.2+) | WinterCG 标准 |
|------|----------------|-----------|-------------|--------------|
| **首次发布** | 2009 | 2020 | 2022 | 2022 (社区) |
| **JS 引擎** | V8 | V8 | JavaScriptCore | 引擎无关 |
| **TS 支持** | `--experimental-strip-types` | 原生 | 原生 | 不涉及 |
| **权限模型** | `--permission` (实验) | 默认零权限 | 无 | 不涉及 |
| **内置测试** | `node --test` | `deno test` | `bun test` | 不涉及 |
| **包管理器** | npm / pnpm / yarn | JSR + npm 兼容 | 内置 npm 兼容 | 不涉及 |
| **Fetch API** | 原生 (v18+) | 原生 | 原生 | 标准基线 |
| **Web Streams** | 原生 (v16+) | 原生 | 原生 | 标准基线 |
| **Blob / File** | 原生 | 原生 | 原生 | 标准基线 |
| **Crypto (WebCrypto)** | 原生 | 原生 | 原生 | 标准基线 |
| **启动延迟** | ~80ms | ~50ms | ~20ms | 不涉及 |
| **ESM 优先级** | CJS 为主，ESM 并存 | ESM 优先 | ESM 优先 | ESM |
| **边缘部署** | Cloudflare Workers 适配 | Deno Deploy | 内置 Worker 支持 | WinterCG 运行时 |
| **原生 FFI** | N-API / node-api | Deno FFI (不稳定) | `bun:ffi` | 不涉及 |
| **HTTP 服务器** | `http` 模块 | `Deno.serve()` | `Bun.serve()` | `fetch` 事件 |
| **兼容性层** | 无需 | `node:` 前缀 | 内置 Node 兼容 | 不涉及 |
| **锁文件** | `package-lock.json` | `deno.lock` | `bun.lockb` | 不涉及 |
| **TSConfig 支持** | 完整 | 部分 | 部分 | 不涉及 |

---

## 代码示例：WinterCG 标准代码跨运行时运行

```typescript
// 基于 WinterCG 标准编写的代码，可在 Node.js / Deno / Bun / Cloudflare Workers 中无修改运行
// 来源：WinterCG Runtime Keys 提案 + Common Minimum API

// 1. 标准 HTTP 服务（WinterCG 兼容入口）
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/time') {
      // 2. 标准 WebCrypto（非 Node crypto 模块）
      const data = new TextEncoder().encode(Date.now().toString());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return new Response(JSON.stringify({ utc: new Date().toISOString(), hash: hashHex }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/api/stream') {
      // 3. 标准 Web Streams（ReadableStream / WritableStream）
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      const encoder = new TextEncoder();
      let count = 0;
      const interval = setInterval(() => {
        count++;
        writer.write(encoder.encode(`data: chunk ${count}\n\n`));
        if (count >= 5) {
          clearInterval(interval);
          writer.close();
        }
      }, 100);

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

// 4. Node.js 适配层（仅在 Node 环境需要）
// Node v24+ 支持 `import { createServer } from 'node:http';` 但推荐使用标准 fetch handler
// 通过 @miniflare/http-polyfill 或类似库，WinterCG 代码可在任何环境启动

// 5. 环境检测（渐进增强模式）
function detectRuntime(): 'node' | 'deno' | 'bun' | 'workerd' | 'unknown' {
  // @ts-ignore
  if (typeof Bun !== 'undefined') return 'bun';
  // @ts-ignore
  if (typeof Deno !== 'undefined') return 'deno';
  // @ts-ignore
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  // Cloudflare Workers
  // @ts-ignore
  if (typeof caches !== 'undefined' && !typeof window !== 'undefined') return 'workerd';
  return 'unknown';
}

console.log(`Running on: ${detectRuntime()}`);
```

```javascript
// package.json 中的多运行时配置示例
{
  "name": "universal-wintercg-app",
  "type": "module",
  "scripts": {
    "node": "node --experimental-strip-types server.ts",
    "deno": "deno run --allow-net server.ts",
    "bun": "bun run server.ts",
    "cf": "wrangler dev server.ts"
  },
  "engines": {
    "node": ">=24.0.0"
  }
}
```

---

## 收敛证据矩阵（2024-2026）

| 特性 | Node.js 采纳时间 | 来源 | 状态 |
|------|----------------|------|------|
| Fetch API | v18+ (2022) | Deno 首创 | 成熟 |
| Web Streams | v16+ (2021) | 标准驱动 | 成熟 |
| 内置测试运行器 | v20+ (2023) | Bun/Deno | 稳定 |
| Watch mode | v18+ (2022) | Bun | 稳定 |
| `--experimental-strip-types` | v22+ (2024) | Bun/Deno | 实验 |
| Permission model | 讨论中 | Deno | 提案 |

---

## 代码示例：运行时无关的模块加载器

```typescript
// lib/runtime.ts — 抹平 Node.js / Bun / Deno 的差异

declare const Bun: { file(path: string): { text(): Promise<string> } } | undefined;
declare const Deno: { readTextFile(path: string): Promise<string> } | undefined;

export async function readTextFile(path: string): Promise<string> {
  if (typeof Bun !== 'undefined') {
    return Bun.file(path).text();
  }
  if (typeof Deno !== 'undefined') {
    return Deno.readTextFile(path);
  }
  // Node.js fallback
  const { readFile } = await import('node:fs/promises');
  return readFile(path, 'utf-8');
}

export function serve(handler: (req: Request) => Response | Promise<Response>, port = 3000): void {
  if (typeof Bun !== 'undefined') {
    // @ts-ignore
    Bun.serve({ port, fetch: handler });
    return;
  }
  if (typeof Deno !== 'undefined') {
    // @ts-ignore
    Deno.serve({ port }, handler);
    return;
  }
  // Node.js fallback
  import('node:http').then(({ createServer }) => {
    createServer((req, res) => {
      const url = `http://${req.headers.host}${req.url}`;
      const request = new Request(url, {
        method: req.method,
        headers: new Headers(Object.entries(req.headers).filter(([_, v]) => typeof v === 'string') as [string, string][]),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });
      Promise.resolve(handler(request)).then((response) => {
        res.writeHead(response.status, Object.fromEntries(response.headers));
        response.body ? response.body.pipeTo(new WritableStream({ write(chunk) { res.write(chunk); } })) : res.end();
      });
    }).listen(port);
  });
}
```

> 该模式展示了 WinterCG 标准化之前，社区如何通过运行时检测实现库的可移植性。

---

## 代码示例：多运行时测试矩阵

```typescript
// tests/runtime-compat.test.ts — 使用 Vitest 测试跨运行时行为一致性
import { describe, it, expect } from 'vitest';

// 运行时标识
declare const Bun: unknown;
declare const Deno: { version: { deno: string } };

const runtime =
  typeof Bun !== 'undefined' ? 'bun' :
  typeof Deno !== 'undefined' ? 'deno' :
  typeof process !== 'undefined' ? 'node' : 'unknown';

describe(`Runtime Compatibility (${runtime})`, () => {
  it('should support standard Fetch API', async () => {
    const resp = await fetch('https://httpbin.org/get');
    expect(resp.status).toBe(200);
    expect(typeof resp.json).toBe('function');
  });

  it('should support WebCrypto', async () => {
    const data = new TextEncoder().encode('hello');
    const hash = await crypto.subtle.digest('SHA-256', data);
    expect(hash.byteLength).toBe(32);
  });

  it('should support Web Streams', () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('hello'));
        controller.close();
      },
    });
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it('should support Blob and File', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    expect(blob.size).toBe(5);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    expect(file.name).toBe('test.txt');
  });
});
```

---

## 代码示例：package.json exports 字段实现双运行时适配

```json
{
  "name": "universal-utils",
  "type": "module",
  "exports": {
    ".": {
      "bun": "./src/bun.ts",
      "deno": "./src/deno.ts",
      "node": "./src/node.ts",
      "workerd": "./src/workerd.ts",
      "default": "./src/node.ts"
    }
  }
}
```

```typescript
// src/node.ts
export { readFile } from 'node:fs/promises';
export { createServer } from 'node:http';

// src/deno.ts
export const readFile = Deno.readTextFile;
export const createServer = () => {
  throw new Error('Use Deno.serve() instead in Deno runtime');
};

// src/bun.ts
export const readFile = Bun.file;
export const createServer = () => {
  throw new Error('Use Bun.serve() instead in Bun runtime');
};

// src/workerd.ts
export const readFile = async (path: string) => {
  const file = await fetch(path);
  return file.text();
};
```

> 📚 参考：[Node.js Conditional Exports](https://nodejs.org/api/packages.html#conditional-exports) | [Deno Node.js Compatibility](https://docs.deno.com/runtime/fundamentals/node/) | [Bun Node.js APIs](https://bun.sh/docs/runtime/nodejs-apis)

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **WinterCG Runtime Keys** | 跨运行时标准 API 定义 | [wintercg.org](https://wintercg.org) |
| **WinterCG: Minimum Common Web Platform API** | 运行时最低公共 API 规范 | [github.com/wintercg/proposal-common-minimum-api](https://github.com/wintercg/proposal-common-minimum-api) |
| **Node.js 版本发布计划** | Node.js 官方 Release 时间表 | [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases) |
| **Deno 2.0 发布公告** | Deno v2 重大变更与 Node 兼容 | [deno.com/blog/v2.0](https://deno.com/blog/v2.0) |
| **Bun 路线图与兼容性** | Bun 的 Node 兼容承诺 | [bun.sh/docs/runtime/nodejs-apis](https://bun.sh/docs/runtime/nodejs-apis) |
| **Cloudflare Workers Runtime** | 边缘运行时 WinterCG 实践 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis) |
| **TC39 ECMA-262** | JavaScript 语言标准 | [tc39.es/ecma262](https://tc39.es/ecma262/) |
| **W3C Web Platform Tests** | 跨运行时兼容性测试集 | [github.com/web-platform-tests/wpt](https://github.com/web-platform-tests/wpt) |
| **Node.js TypeScript Support** | Node.js 原生 TS 运行文档 | [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html) |
| **Deno Standard Library** | Deno 官方标准库 | [jsr.io/@std](https://jsr.io/@std) |
| **Bun Documentation** | Bun 运行时官方文档 | [bun.sh/docs](https://bun.sh/docs) |
| **Workerd (Cloudflare)** | Cloudflare Workers 运行时源码 | [github.com/cloudflare/workerd](https://github.com/cloudflare/workerd) |
| **Web Platform Tests for WinterCG** | WinterCG 兼容性测试 | [github.com/wintercg/admin](https://github.com/wintercg/admin) |
| **CommonJS vs ESM** | Node.js 模块系统演进 | [nodejs.org/api/esm.html](https://nodejs.org/api/esm.html) |
| **Deno Permission Model** | Deno 权限系统文档 | [docs.deno.com/runtime/fundamentals/security/](https://docs.deno.com/runtime/fundamentals/security/) |
| **Bun FFI Documentation** | Bun 原生 FFI 调用 | [bun.sh/docs/api/ffi](https://bun.sh/docs/api/ffi) |
| **Node.js N-API** | Node.js 原生插件 API | [nodejs.org/api/n-api.html](https://nodejs.org/api/n-api.html) |
| **JSR Registry** | Deno/JavaScript 注册表 | [jsr.io](https://jsr.io/) |
| **Cloudflare Workers Compatibility Dates** | 兼容性日期机制 | [developers.cloudflare.com/workers/configuration/compatibility-dates/](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) |
| **WinterCG Runtime Keys Proposal** | 运行时标识标准化 | [github.com/wintercg/runtime-keys](https://github.com/wintercg/runtime-keys) |

---

*本定理为 TS/JS 软件堆栈全景分析论证的五大核心定理之三。*
