# 基础设置

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/01-basic-setup`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘平台的部署问题。涵盖 SSR、服务端函数和边缘缓存的集成。

### 1.2 形式化基础

- **边缘运行时**：Cloudflare Workers 基于 V8 Isolates，无 Node.js 兼容层，支持 Web Standard API。
- **冷启动**：边缘函数冷启动 < 1ms，但首次连接 D1/KV 等绑定仍有延迟。
- **流式 SSR**：TanStack Start 支持 `renderToPipeableStream` 的 Web 等价物，通过 `ReadableStream` 向边缘推送 HTML。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| SSR | 服务端渲染的流式传输 | ssr-streaming.ts |
| API 路由 | 文件系统约定的服务端端点 | api-routes.ts |
| 边缘适配器 | 将 Node.js 框架适配到边缘运行时的层 | edge-adapter.ts |
| 平台绑定 | Cloudflare D1 / KV / R2 / AI 的运行时注入 | platform-bindings.ts |

---

## 二、设计原理

### 2.1 为什么存在

TanStack Start 提供了类型安全的路由和数据层，结合 Cloudflare 的边缘计算能力，可以在全球范围提供低延迟的全栈应用体验。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘 SSR | 首屏快、SEO | 函数冷启动 | 内容站点 |
| CSR | 交互丰富 | 首屏慢 | 后台应用 |

### 2.3 与相关技术的对比

| 维度 | TanStack Start + Cloudflare | Next.js + Vercel | Remix + Cloudflare |
|------|---------------------------|------------------|-------------------|
| 路由类型 | 文件系统 + 配置化 | 文件系统 | 文件系统 |
| 数据层 | TanStack Query 原生集成 | Server Actions / Route Handlers | Loader/Action |
| 边缘运行时 | Cloudflare Workers | Vercel Edge Functions | Cloudflare Workers |
| 框架耦合 | 框架无关（React/Solid/Vue） | React 强耦合 | React 强耦合 |
| 包体积 | 轻量（~30KB 路由） | 较大 | 中等 |
| 流式 SSR | 原生支持 | 原生支持 | 原生支持 |
| 类型安全 | 端到端（TSRPC 风格） | 部分 | 部分 |

---

## 三、实践映射

### 3.1 最小项目配置

```typescript
// app.config.ts — TanStack Start + Cloudflare 最小配置
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
    rollupConfig: {
      // 输出 Cloudflare Pages Functions 格式
      output: {
        format: 'esm',
      },
    },
  },
  tsr: {
    appDirectory: 'app',
    generatedRouteTree: 'app/routeTree.gen.ts',
    routesDirectory: 'app/routes',
  },
  vite: {
    plugins: [],
  },
});

// app/routes/__root.tsx — 根布局
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
```

### 3.2 类型安全路由定义

```typescript
// app/routes/index.tsx — 首页路由
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
  loader: async () => {
    // 服务端预取数据（SSR 时执行）
    return { message: 'Hello from TanStack Start!' };
  },
  head: () => ({
    meta: [{ title: 'Home' }],
  }),
});

function HomeComponent() {
  const data = Route.useLoaderData();
  return <h1>{data.message}</h1>;
}

// app/routes/posts.$postId.tsx — 动态路由
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    if (!post) throw notFound();
    return post;
  },
});

function PostComponent() {
  const post = Route.useLoaderData();
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### 3.3 Cloudflare 绑定类型声明

```typescript
// worker-configuration.d.ts — Cloudflare 平台绑定类型
declare global {
  interface Env {
    DB: D1Database;
    KV: KVNamespace;
    R2: R2Bucket;
    AI: Ai;
  }
}

export {};
```

### 3.4 环境变量与绑定访问

```typescript
// app/utils/env.ts — 安全访问 Cloudflare 绑定
import { getEvent } from '@tanstack/react-start/server';

export function getBindings(): Env {
  const event = getEvent();
  // Cloudflare Pages 将绑定挂载在 context.cloudflare.env
  const cf = (event as any).context?.cloudflare?.env as Env | undefined;
  if (!cf) throw new Error('Cloudflare bindings not available');
  return cf;
}

// 在服务端函数中使用
import { createServerFn } from '@tanstack/react-start';

export const getPostCount = createServerFn({ method: 'GET' })
  .handler(async () => {
    const env = getBindings();
    const { results } = await env.DB.prepare('SELECT COUNT(*) as count FROM posts').all<{ count: number }>();
    return results?.[0]?.count ?? 0;
  });
```

### 3.5 边缘中间件 — 认证与请求日志

```typescript
// app/utils/middleware.ts — 可组合的 H3 风格中间件

import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const event = getEvent();
  const authHeader = event.request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  // 可在此解析 JWT 并注入上下文
  return next();
});

export const loggerMiddleware = createMiddleware().server(async ({ next }) => {
  const start = performance.now();
  const result = await next();
  console.log(`[${new Date().toISOString()}] ${(event as any).request.url} — ${(performance.now() - start).toFixed(2)}ms`);
  return result;
});

// 在路由中使用
export const Route = createFileRoute('/api/protected')({
  middleware: [authMiddleware, loggerMiddleware],
  loader: async () => {
    return { secret: 'data' };
  },
});
```

### 3.6 KV 边缘缓存策略

```typescript
// app/utils/kv-cache.ts — 基于 Cloudflare KV 的响应缓存

import { getBindings } from './env';

interface CacheOptions {
  ttlSeconds?: number; // 默认 60s
  key?: string;
}

export async function withKVCache<T>(
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttlSeconds = 60, key = fn.toString() } = options;
  const { KV } = getBindings();

  const cached = await KV.get(key, 'json');
  if (cached) return cached as T;

  const result = await fn();
  await KV.put(key, JSON.stringify(result), { expirationTtl: ttlSeconds });
  return result;
}

// 在 loader 中使用
export const Route = createFileRoute('/api/trending')({
  loader: async () => {
    return withKVCache(
      () => fetchTrendingFromDB(),
      { ttlSeconds: 300, key: 'trending:top10' }
    );
  },
});
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 基础设置 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |
| Cloudflare Workers 支持所有 Node API | Workers 使用 Web Standard API，需 polyfill 或适配 |
| D1 适合高并发写入 | D1 基于 SQLite，写入有单区域限制，读可全球缓存 |

### 3.8 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TanStack Start Docs | 官方文档 | [tanstack.com/start/latest](https://tanstack.com/start/latest) |
| TanStack Router Docs | 官方文档 | [tanstack.com/router/latest](https://tanstack.com/router/latest) |
| Cloudflare Pages Functions | 官方文档 | [developers.cloudflare.com/pages/functions](https://developers.cloudflare.com/pages/functions/) |
| Vinxi (Universal Dev Server) | 源码 | [github.com/nksaraf/vinxi](https://github.com/nksaraf/vinxi) |
| Nitro (Universal Server Engine) | 官方文档 | [nitro.unjs.io](https://nitro.unjs.io/) |
| Cloudflare Workers Runtime APIs | 官方文档 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| TanStack Start + Cloudflare 部署指南 | 官方文档 | [tanstack.com/start/latest/docs/framework/react/hosting](https://tanstack.com/start/latest/docs/framework/react/hosting) |
| D1 Database — SQL API | 官方文档 | [developers.cloudflare.com/d1/build-with-d1/d1-client-api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/) |
| Vite SSR 概念 | 官方文档 | [vitejs.dev/guide/ssr](https://vitejs.dev/guide/ssr.html) |
| React Server Components | 官方文档 | [react.dev/reference/react/use-server](https://react.dev/reference/react/use-server) |
| Cloudflare KV — REST API | 官方文档 | [developers.cloudflare.com/kv/api](https://developers.cloudflare.com/kv/api/) |
| Cloudflare D1 — Limits & Pricing | 官方文档 | [developers.cloudflare.com/d1/platform/limits](https://developers.cloudflare.com/d1/platform/limits/) |
| H3 — HTTP Framework for JavaScript | 官方文档 | [h3.unjs.io](https://h3.unjs.io/) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
