# TanStack Start + Cloudflare 理论解读

## 概述

本模块探索 TanStack Start 全栈框架与 Cloudflare Workers 边缘运行时的深度集成，涵盖类型安全路由、Server Function 模型与边缘渲染原理。该组合让开发者能够以端到端类型安全的方式构建低延迟、全球分布的现代 Web 应用。

## 核心概念

### 文件系统路由与类型安全

TanStack Start 基于 TanStack Router 构建，采用约定式文件系统路由。所有路由定义、链接参数与数据加载器（loader）均享有完整的 TypeScript 类型推断，彻底消除前端路由中的字符串拼接与参数类型错误。

### Server Function 模型

`createServerFn` 将服务端逻辑以函数形态直接嵌入前端代码中，编译阶段自动抽取为 RPC 端点。相比传统 REST/GraphQL，Server Function 减少了网络层抽象，使前后端数据流转更加直观且类型一致。

### 边缘渲染与 Bindings

Cloudflare Workers 提供 D1（SQLite 边缘数据库）、KV（全局键值存储）与 R2（对象存储）等原生 Binding。TanStack Start 的 SSR 在边缘节点执行，Server Function 与渲染逻辑共享同一个 Worker 实例，数据访问延迟被压缩到物理最近的边缘位置。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| SSR Streaming | 首屏性能敏感页面，渐进式输出 HTML | 需正确处理 Suspense 边界，避免流中断 |
| Router Preloading | 预判用户下一步操作并预加载数据 | 合理设置 staleTime 与 gcTime，避免过度请求 |
| Edge-first DB | 利用 D1/KV 在边缘完成数据读写 | 注意 D1 的写入最终一致性，关键事务需兜底校验 |

## 部署配置对比

| 配置项 | Cloudflare Pages (Workers) | Node.js (传统 VPS) | Vercel Edge |
|--------|---------------------------|-------------------|-------------|
| **构建输出** | `.output/` → Workers 兼容 | `.output/` → Node server | `.vercel/output/` |
| **运行时适配器** | `@tanstack/react-start-cloudflare` | `@tanstack/react-start-node` | `@tanstack/react-start-vercel` |
| **SSR 执行位置** | 330+ Cloudflare PoP | 单数据中心 | 100+ Vercel Edge |
| **环境变量注入** | `wrangler.toml` / Secrets | `process.env` | `process.env` (Edge) |
| **原生存储** | D1, KV, R2, Durable Objects | 文件系统 / 外部 DB | KV, Edge Config |
| **WebSocket** | ✅ Durable Objects | ✅ 原生 | ⚠️ 有限 |
| **Pricing** |  generous free tier | 服务器租金 | 按请求/带宽 |
| **最佳场景** | 全球低延迟、边缘存储亲和 | 传统后台、长任务 | Next.js 生态锁定 |

## 代码示例

### Cloudflare Pages 适配器配置

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';
import cloudflare from '@tanstack/react-start-cloudflare';

export default defineConfig({
  server: {
    // 使用 Cloudflare Workers 预设
    preset: cloudflare({
      // 可选：自定义 wrangler 配置路径
      wranglerConfigPath: './wrangler.toml',
    }),
  },
  // 确保构建产物兼容 Workers 环境
  tsconfig: {
    compilerOptions: {
      jsx: 'react-jsx',
      target: 'ES2022',
      module: 'ESNext',
    },
  },
});
```

```toml
# wrangler.toml
name = "tanstack-start-app"
compatibility_date = "2026-04-28"
compatibility_flags = ["nodejs_compat"]

# 绑定 D1 数据库（边缘 SQLite）
[[d1_databases]]
binding = "DB"
database_name = "tanstack-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 绑定 KV（全局缓存）
[[kv_namespaces]]
binding = "CACHE"
id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
```

### 类型安全的 Server Function + D1

```typescript
// app/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

// 定义环境类型（与 wrangler.toml 绑定对应）
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

// Server Function：自动抽取为 RPC，类型端到端安全
export const getPost = createServerFn({ method: 'GET' })
  .validator((postId: string) => {
    if (!postId) throw new Error('postId is required');
    return postId;
  })
  .handler(async ({ data: postId }) => {
    // 在 Cloudflare Worker 边缘节点执行
    const { env } = await import('cloudflare:workers').then((m) => m.getRequestContext());
    const db = env.DB as Env['DB'];

    const cached = await (env.CACHE as Env['CACHE']).get(`post:${postId}`);
    if (cached) return JSON.parse(cached);

    const row = await db
      .prepare('SELECT id, title, content, created_at FROM posts WHERE id = ?')
      .bind(postId)
      .first<{ id: string; title: string; content: string; created_at: string }>();

    if (!row) throw new Error('Post not found');

    await (env.CACHE as Env['CACHE']).put(`post:${postId}`, JSON.stringify(row), { expirationTtl: 60 });
    return row;
  });

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
  loader: async ({ params }) => {
    // loader 在 SSR 阶段直接调用 Server Function，零客户端往返
    const post = await getPost({ data: params.postId });
    return { post };
  },
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.created_at}</time>
      <div>{post.content}</div>
    </article>
  );
}
```

### SSR Streaming 配合 Suspense

```typescript
// app/routes/dashboard.tsx
import { Suspense } from 'react';
import { createFileRoute, Await } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const getSlowData = createServerFn({ method: 'GET' }).handler(async () => {
  await new Promise((r) => setTimeout(r, 800)); // 模拟慢查询
  return { metrics: [120, 340, 210, 450] };
});

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  loader: async () => {
    // 返回 Promise，让 Suspense 接管流式输出
    return { slowDataPromise: getSlowData({ data: undefined }) };
  },
});

function DashboardPage() {
  const { slowDataPromise } = Route.useLoaderData();
  return (
    <div>
      <h1>Dashboard</h1>
      <div>Static content rendered immediately!</div>
      <Suspense fallback={<div>Loading charts...</div>}>
        <Await promise={slowDataPromise}>
          {(data) => <Chart metrics={data.metrics} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

## 代码示例：TanStack Router 类型安全导航

```typescript
// router-navigation-typesafe.ts — 零字符串硬编码的链接

import { Link, createFileRoute } from '@tanstack/react-router';

// 路由定义自动生成类型，无需手动维护
export const Route = createFileRoute('/posts/$postId/edit')({
  component: EditPostPage,
});

function EditPostPage() {
  const { postId } = Route.useParams(); // postId 类型为 string

  return (
    <div>
      <h1>Edit Post {postId}</h1>
      {/* Link 组件在编译期验证目标路由是否存在 */}
      <Link
        to="/posts/$postId"
        params={{ postId }}
        search={{ preview: true }}
        className="text-blue-600"
      >
        返回详情页
      </Link>
      {/* 以下代码会在编译期报错：to="/non-existent" */}
    </div>
  );
}
```

## 代码示例：Durable Objects + WebSocket 实时协作

```typescript
// durable-objects-websocket.ts — 边缘状态ful连接

import { DurableObject } from 'cloudflare:workers';

export class CollaborationRoom extends DurableObject {
  private sessions: Set<WebSocket> = new Set();

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.sessions.add(server);

    server.accept();
    server.addEventListener('message', (msg) => {
      // 广播给房间内所有客户端
      for (const ws of this.sessions) {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          ws.send(msg.data as string);
        }
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}

// Worker 入口
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/ws/room/')) {
      const roomId = url.pathname.split('/').pop()!;
      const id = env.COLLAB_ROOM.idFromName(roomId);
      const room = env.COLLAB_ROOM.get(id);
      return room.fetch(request);
    }
    return new Response('Not Found', { status: 404 });
  },
};
```

## 代码示例：边缘 KV 缓存与失效策略

```typescript
// edge-kv-cache.ts — 分层缓存：KV + D1

import { createServerFn } from '@tanstack/react-start';

export const getProduct = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { env } = await import('cloudflare:workers').then(m => m.getRequestContext());

    // L1: KV 高速缓存（全球边缘节点）
    const cacheKey = `product:${id}`;
    const cached = await env.CACHE.get(cacheKey, { cacheTtl: 300 });
    if (cached) return JSON.parse(cached);

    // L2: D1 数据库查询
    const product = await env.DB
      .prepare('SELECT * FROM products WHERE id = ?')
      .bind(id)
      .first<{ id: string; name: string; price: number }>();

    if (!product) throw new Error('Product not found');

    // 回填缓存（异步，不阻塞响应）
    ctx.waitUntil(env.CACHE.put(cacheKey, JSON.stringify(product), { expirationTtl: 3600 }));

    return product;
  });
```

## 关联模块

- `18-frontend-frameworks` — React 框架对比与选型指南
- `32-edge-computing` — 边缘计算架构与运行时特性
- `93-deployment-edge-lab` — 边缘部署实践与 CI/CD 配置

## 参考

- [TanStack Start Documentation](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/framework/react/overview)
- [Cloudflare Workers — Framework Guides](https://developers.cloudflare.com/workers/frameworks/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Hono + TanStack Start Examples](https://github.com/TanStack/router/tree/main/examples)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Workers — WebSocket](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [TanStack Start — Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
- [TanStack Router — Type Safety](https://tanstack.com/router/latest/docs/framework/react/guide/type-safety)
- [Cloudflare Workers — Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
- [Vite — SSR Documentation](https://vitejs.dev/guide/ssr.html)
- [React — Server Components](https://react.dev/reference/react/use-server)
- 本模块 `README.md` — 完整目录结构、快速使用指南与关键约束
- 本模块 `02-server-functions/api-server-fn.ts` — Server Function 基础与输入验证示例
- 本模块 `02-server-functions/d1-example.ts` — D1 数据库查询与写入示例
- 本模块 `04-performance/ssr-streaming.ts` — 流式 SSR 处理器配置
