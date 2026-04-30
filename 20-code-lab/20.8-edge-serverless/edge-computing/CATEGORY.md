---
dimension: 综合
sub-dimension: Edge computing
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Edge computing 核心概念与工程实践。

## 包含内容

- 本模块聚焦 edge computing 核心概念与工程实践。
- 涵盖边缘运行时模型、Edge-First 架构模式与地理感知路由策略。
- 边缘缓存策略、WebAssembly 边缘计算、流式渲染与实时协作。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 边缘计算架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 边缘计算理论形式化定义 |
| edge-first-patterns/ | 目录 | 边缘优先设计模式 |
| edge-runtime.ts | 源码 | 边缘运行时抽象 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// edge-runtime.ts — 轻量边缘运行时适配器
interface EdgeContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

class EdgeRuntimeAdapter {
  constructor(
    private handler: (req: Request, ctx: EdgeContext) => Promise<Response>
  ) {}

  async execute(request: Request): Promise<Response> {
    const pending: Promise<unknown>[] = [];
    const context: EdgeContext = {
      waitUntil: (p) => pending.push(p),
      passThroughOnException: () => { /* no-op in adapter */ },
    };

    try {
      const response = await this.handler(request, context);
      // 等待后台任务
      await Promise.allSettled(pending);
      return response;
    } catch (err) {
      return new Response('Edge Runtime Error', { status: 500 });
    }
  }
}
```

### 地理感知路由示例

```typescript
// geo-routing.ts — 基于 CF-IPCountry 的地理感知路由
interface GeoConfig {
  defaultOrigin: string;
  regions: Record<string, string>;
}

function createGeoRouter(config: GeoConfig) {
  return async (request: Request): Promise<Response> => {
    const country = request.headers.get('CF-IPCountry') || 'UNKNOWN';
    const origin = config.regions[country] ?? config.defaultOrigin;

    // 根据地理位置选择最近的数据中心
    const url = new URL(request.url);
    const upstream = new URL(url.pathname + url.search, origin);

    return fetch(upstream, {
      headers: {
        'X-Edge-Region': country,
        'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
      },
    });
  };
}

// 使用示例
const router = createGeoRouter({
  defaultOrigin: 'https://us-central.example.com',
  regions: {
    CN: 'https://ap-east.example.com',
    JP: 'https://ap-northeast.example.com',
    DE: 'https://eu-west.example.com',
    GB: 'https://eu-west.example.com',
  },
});
```

### 边缘缓存策略示例

```typescript
// edge-cache.ts — 基于 Cache API 的边缘缓存封装
async function edgeCacheFetch(
  request: Request,
  ttlSeconds: number = 60
): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });

  // 尝试读取边缘缓存
  let response = await cache.match(cacheKey);
  if (response) {
    response = new Response(response.body, {
      ...response,
      headers: {
        ...Object.fromEntries(response.headers),
        'X-Edge-Cache': 'HIT',
      },
    });
    return response;
  }

  // 回源并写入缓存
  response = await fetch(request);
  const cloned = response.clone();

  const headers = new Headers(cloned.headers);
  headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
  headers.set('X-Edge-Cache', 'MISS');

  await cache.put(cacheKey, new Response(cloned.body, { headers, status: cloned.status }));
  return response;
}
```

### WebAssembly 边缘模块加载

```typescript
// wasm-edge.ts — 在边缘运行时加载 WASM 模块
async function runWasmAtEdge(
  wasmModule: WebAssembly.Module,
  input: Uint8Array
): Promise<Uint8Array> {
  const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });
  const imports = {
    env: {
      memory,
      abort: () => { throw new Error('WASM abort'); },
    },
  };

  const instance = await WebAssembly.instantiate(wasmModule, imports);
  const exports = instance.exports as {
    process(inputPtr: number, len: number): number;
    memory: WebAssembly.Memory;
  };

  // 写入输入数据到 WASM 内存
  const view = new Uint8Array(memory.buffer);
  view.set(input, 0);

  const outputPtr = exports.process(0, input.length);
  // 解析输出...
  return new Uint8Array(memory.buffer, outputPtr, input.length);
}
```

### Deno Deploy Edge Function

```typescript
// deno-deploy.ts
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (pathname === '/hello') {
    return new Response(JSON.stringify({ message: 'Hello from Deno Deploy' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Not Found', { status: 404 });
});
```

### Vercel Edge Config 读取

```typescript
// vercel-edge-config.ts
import { get } from '@vercel/edge-config';

export async function middleware(request: Request) {
  const featureFlags = await get('featureFlags');
  if (featureFlags?.newHomepage) {
    return new Response(null, { status: 307, headers: { Location: '/home-v2' } });
  }
  return new Response('OK');
}
```

### Cloudflare Durable Objects 协作编辑

```typescript
// durable-object-collab.ts
export class CollaborativeEditor {
  private sessions: WebSocket[] = [];
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.sessions.push(server);
    server.accept();

    server.addEventListener('message', (event) => {
      // 广播给所有连接的客户端
      this.sessions.forEach((ws) => {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          ws.send(event.data);
        }
      });
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
```

### Next.js Edge Middleware Rewrite

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US';
  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/zh-CN' + request.nextUrl.pathname, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 edge-first-patterns
- 📄 edge-runtime.test.ts
- 📄 edge-runtime.ts
- 📄 index.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Cloudflare Workers Runtime | 官方文档 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| V8 Lite Mode & Resource Constraints | 博客 | [v8.dev/blog/v8-lite](https://v8.dev/blog/v8-lite) |
| Fastly Compute@Edge | 官方文档 | [developer.fastly.com/learning/compute](https://developer.fastly.com/learning/compute/) |
| Edge Computing Patterns (ACM) | 论文 | [dl.acm.org/doi/10.1145/3409973.3410734](https://dl.acm.org/doi/10.1145/3409973.3410734) |
| WASI Preview 2 | 规范 | [github.com/WebAssembly/WASI](https://github.com/WebAssembly/WASI) |
| Vercel Edge Runtime | 官方文档 | [vercel.com/docs/functions/runtimes/edge-runtime](https://vercel.com/docs/functions/runtimes/edge-runtime) |
| WinterCG Runtime Standards | 规范 | [wintercg.org/work](https://wintercg.org/work) |
| Deno Deploy Edge Functions | 官方文档 | [deno.com/deploy/docs/edge-functions](https://deno.com/deploy/docs/edge-functions) |
| Cache API (Cloudflare) | 参考 | [developers.cloudflare.com/workers/runtime-apis/cache](https://developers.cloudflare.com/workers/runtime-apis/cache/) |
| WebAssembly at the Edge | 指南 | [developer.mozilla.org/en-US/docs/WebAssembly/Concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts) |
| State of the Edge (Linux Foundation) | 报告 | [github.com/State-of-the-Edge](https://github.com/State-of-the-Edge) |
| Cloudflare Workers KV | 官方文档 | [developers.cloudflare.com/kv](https://developers.cloudflare.com/kv/) |
| Fly.io Edge Apps | 官方文档 | [fly.io/docs](https://fly.io/docs/) |
| Cloudflare Durable Objects | 官方文档 | [developers.cloudflare.com/durable-objects](https://developers.cloudflare.com/durable-objects) |
| Vercel Edge Config | 官方文档 | [vercel.com/docs/storage/edge-config](https://vercel.com/docs/storage/edge-config) |
| Deno Deploy Runtime APIs | 官方文档 | [deno.com/deploy/docs/runtime-api](https://deno.com/deploy/docs/runtime-api) |

---

*最后更新: 2026-04-30*
