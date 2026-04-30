# 服务端函数

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/02-server-functions`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘平台的服务端函数设计与实现问题。涵盖 RPC 风格服务端函数、环境变量安全访问与边缘数据库集成。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| createServerFn | 类型安全的服务端函数工厂 | server-fn.ts |
| 环境绑定 | Cloudflare 平台绑定（KV/D1/R2） | bindings.ts |
| RPC 调用 | 编译时生成客户端存根 | rpc-client.ts |

---

## 二、设计原理

### 2.1 为什么存在

服务端函数让前端开发者无需维护独立的 API 路由文件，通过类型安全的 RPC 调用直接复用服务端逻辑，降低全栈开发的心智负担。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| createServerFn | 类型安全、同文件编写 | 框架耦合 | TanStack Start 项目 |
| 传统 REST API | 通用、解耦 | 类型不同步、样板多 | 多客户端项目 |
| tRPC | 端到端类型 | 需额外配置适配器 | 已有 tRPC 项目 |

### 2.3 与相关技术的对比

| 维度 | createServerFn (TanStack) | Next.js Server Actions | tRPC | Remix Actions |
|------|--------------------------|----------------------|------|---------------|
| 调用方式 | RPC（自动客户端） | RPC（React useTransition） | RPC（React Query） | Form POST |
| 类型安全 | 端到端（编译时） | 端到端（编译时） | 端到端（编译时） | 运行时 Zod |
| 序列化 | SuperJSON | 原生（限制多） | SuperJSON | 原生 |
| 流式响应 | 支持 | 支持 | 支持 | 有限 |
| 边缘兼容 | Cloudflare/Deno/Node | Vercel/Node | 需适配器 | Cloudflare/Node |
| 错误处理 | 类型化错误 | 原生 Error | TRPCError | 原生 Error |

---

## 三、实践映射

### 3.1 CRUD 服务端函数

```typescript
// server-functions/todo.ts — 类型安全服务端函数
import { createServerFn } from '@tanstack/react-start';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

// 读取 — 自动暴露为 HTTP POST /api/todo/list
export const listTodos = createServerFn({ method: 'GET' })
  .handler(async () => {
    const env = process.env as unknown as Env;
    const { results } = await env.DB.prepare(
      'SELECT * FROM todos ORDER BY created_at DESC'
    ).all<Todo>();
    return results ?? [];
  });

// 创建 — 带输入校验
export const createTodo = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (typeof data !== 'string' || data.length === 0) {
      throw new Error('Todo text is required');
    }
    return data;
  })
  .handler(async ({ data: text }) => {
    const env = process.env as unknown as Env;
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO todos (id, text, done) VALUES (?, ?, ?)')
      .bind(id, text, 0)
      .run();
    return { id, text, done: false };
  });

// 客户端调用（完全类型安全）
// const todos = await listTodos(); // inferred: Todo[]
```

### 3.2 带身份验证的服务端函数

```typescript
// server-functions/auth.ts — JWT 验证与受保护函数
import { createServerFn } from '@tanstack/react-start';
import { verify } from 'jose';

interface AuthContext {
  userId: string;
  email: string;
}

async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await verify(token, secret, { clockTolerance: 60 });
    return { userId: payload.sub!, email: payload.email as string };
  } catch {
    return null;
  }
}

export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const auth = await getAuthContext(new Request('http://localhost'));
    if (!auth) throw new Error('Unauthorized');
    return auth;
  });

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid payload');
    const d = data as Record<string, unknown>;
    if (typeof d.displayName !== 'string' || d.displayName.length > 50) {
      throw new Error('displayName must be a string ≤ 50 chars');
    }
    return { displayName: d.displayName };
  })
  .handler(async ({ data }) => {
    const auth = await getAuthContext(new Request('http://localhost'));
    if (!auth) throw new Error('Unauthorized');
    const env = process.env as unknown as Env;
    await env.DB.prepare('UPDATE users SET display_name = ? WHERE id = ?')
      .bind(data.displayName, auth.userId)
      .run();
    return { success: true };
  });
```

### 3.3 流式响应服务端函数

```typescript
// server-functions/stream.ts — 流式文本/JSON 输出
import { createServerFn } from '@tanstack/react-start';

export const streamProgress = createServerFn({ method: 'GET' })
  .handler(async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i <= 100; i += 10) {
          const chunk = JSON.stringify({ progress: i, status: i === 100 ? 'done' : 'working' });
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          await new Promise(r => setTimeout(r, 200));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  });

// 客户端消费流
// const response = await streamProgress();
// const reader = response.body?.getReader();
// while (reader) { const { done, value } = await reader.read(); ... }
```

### 3.4 KV 缓存与 D1 结合模式

```typescript
// server-functions/cache-pattern.ts — 边缘缓存 + 数据库回源
import { createServerFn } from '@tanstack/react-start';

export const getProduct = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    if (typeof data !== 'string') throw new Error('Product ID required');
    return data;
  })
  .handler(async ({ data: productId }) => {
    const env = process.env as unknown as Env;

    // 1. 读边缘 KV 缓存
    const cached = await env.KV.get(`product:${productId}`, { cacheTtl: 60 });
    if (cached) return JSON.parse(cached);

    // 2. KV 未命中，回源 D1
    const { results } = await env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(productId).all<Record<string, unknown>>();
    const product = results?.[0] ?? null;

    // 3. 写入 KV（异步，不阻塞响应）
    if (product) {
      env.KV.put(`product:${productId}`, JSON.stringify(product), { expirationTtl: 300 })
        .catch(console.error);
    }

    return product;
  });
```

### 3.5 批量操作服务端函数

```typescript
// server-functions/batch.ts — 批量插入与事务
import { createServerFn } from '@tanstack/react-start';

export const batchCreateTodos = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!Array.isArray(data) || data.length === 0 || data.length > 100) {
      throw new Error('Expected 1–100 items');
    }
    for (const item of data) {
      if (typeof item !== 'string' || item.length === 0) {
        throw new Error('Each item must be a non-empty string');
      }
    }
    return data as string[];
  })
  .handler(async ({ data: items }) => {
    const env = process.env as unknown as Env;
    const stmt = env.DB.prepare('INSERT INTO todos (id, text, done) VALUES (?, ?, ?)');

    // D1 支持批量绑定
    const bindings = items.map((text) => [crypto.randomUUID(), text, 0]);
    const result = await env.DB.batch(
      bindings.map((args) => stmt.bind(...args))
    );

    return {
      inserted: result.length,
      ids: bindings.map((b) => b[0]),
    };
  });
```

### 3.6 R2 文件上传服务端函数

```typescript
// server-functions/upload.ts — 边缘文件上传至 R2
import { createServerFn } from '@tanstack/react-start';

export const uploadFile = createServerFn({ method: 'POST' })
  .validator(async (data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    const file = data.get('file');
    if (!(file instanceof File)) throw new Error('file field required');
    if (file.size > 10 * 1024 * 1024) throw new Error('Max 10MB');
    return file;
  })
  .handler(async ({ data: file }) => {
    const env = process.env as unknown as Env;
    const key = `uploads/${crypto.randomUUID()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    await env.R2.put(key, buffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { uploadedAt: new Date().toISOString() },
    });

    return { key, url: `${env.R2_PUBLIC_URL}/${key}` };
  });
```

### 3.7 错误边界与类型化错误处理

```typescript
// server-functions/error-handler.ts — 类型化的服务端错误响应
import { createServerFn } from '@tanstack/react-start';

class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export const safeDivide = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object') throw new AppError('INVALID_INPUT', 'Expected object');
    const d = data as { a: number; b: number };
    if (typeof d.a !== 'number' || typeof d.b !== 'number') {
      throw new AppError('INVALID_INPUT', 'Both a and b must be numbers', 400);
    }
    return d;
  })
  .handler(async ({ data }) => {
    if (data.b === 0) {
      throw new AppError('DIVISION_BY_ZERO', 'Cannot divide by zero', 422);
    }
    return { result: data.a / data.b };
  });

// 客户端调用时自动推断错误类型
// try {
//   const { result } = await safeDivide({ data: { a: 10, b: 0 } });
// } catch (err) {
//   err.code === 'DIVISION_BY_ZERO' // 类型安全
// }
```

### 3.8 Durable Objects 协作状态（跨请求有状态）

```typescript
// server-functions/collaboration.ts — 基于 Durable Objects 的协作编辑
import { createServerFn } from '@tanstack/react-start';

interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  color: string;
}

export const updateCursor = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as CursorPosition;
    if (!d.userId || typeof d.x !== 'number' || typeof d.y !== 'number') {
      throw new Error('Invalid cursor data');
    }
    return d;
  })
  .handler(async ({ data }) => {
    const env = process.env as unknown as Env;

    // 每个文档对应一个 Durable Object ID
    const id = env.COLLAB.idFromName('doc:123');
    const stub = env.COLLAB.get(id);

    await stub.fetch('http://internal/update-cursor', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return { success: true };
  });

// Durable Object 实现（通常在单独文件中）
export class CollaborationRoom implements DurableObject {
  private cursors = new Map<string, CursorPosition>();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/update-cursor') {
      const data = await request.json<CoveragePosition>();
      this.cursors.set(data.userId, data);
      await this.state.storage.put('cursors', Array.from(this.cursors.entries()));
      return new Response(JSON.stringify({ cursors: Array.from(this.cursors.values()) }));
    }
    return new Response('Not Found', { status: 404 });
  }
}
```

### 3.9 服务端函数组合：认证 + 授权中间件

```typescript
// server-functions/middleware.ts — 可复用的服务端函数中间件
import { createServerFn } from '@tanstack/react-start';
import { verify } from 'jose';

type Middleware<T> = (ctx: { request: Request; data: T }) => Promise<AuthContext>;

interface AuthContext {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}

async function requireAuth<T>({ request }: { request: Request; data: T }): Promise<AuthContext> {
  const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  if (!token) throw new Error('Unauthorized');

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await verify(token, secret, { clockTolerance: 60 });
  return { userId: payload.sub!, role: payload.role as AuthContext['role'] };
}

function requireRole(role: AuthContext['role']) {
  return async (ctx: { request: Request; data: unknown; auth: AuthContext }) => {
    if (ctx.auth.role !== role) {
      throw new Error(`Forbidden: requires ${role} role`);
    }
  };
}

export const deleteUser = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (typeof data !== 'string') throw new Error('User ID required');
    return data;
  })
  .handler(async ({ data: userId, request }) => {
    const auth = await requireAuth({ request, data: userId });
    await requireRole('admin')({ request, data: userId, auth });

    const env = process.env as unknown as Env;
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return { deleted: userId };
  });
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 服务端函数 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |

### 3.3 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TanStack Start Server Functions | 官方文档 | [tanstack.com/start/latest/docs/framework/react/server-functions](https://tanstack.com/start/latest/docs/framework/react/server-functions) |
| Cloudflare D1 Database | 官方文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| SuperJSON | 源码 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) |
| tRPC Server Actions | 官方文档 | [trpc.io/docs/client/react/server-components](https://trpc.io/docs/client/react/server-components) |
| Remix Action & Loader | 官方文档 | [remix.run/docs/en/main/discussion/data-flow](https://remix.run/docs/en/main/discussion/data-flow) |
| Next.js Server Actions | 官方文档 | [nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) |
| Cloudflare KV API | 官方文档 | [developers.cloudflare.com/kv/api](https://developers.cloudflare.com/kv/api/) |
| jose — JWT Library | 源码 | [github.com/panva/jose](https://github.com/panva/jose) |
| MDN — ReadableStream | 文档 | [developer.mozilla.org/en-US/docs/Web/API/ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) |
| Server-sent Events | 指南 | [developer.mozilla.org/en-US/docs/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) |
| Cloudflare R2 API | 官方文档 | [developers.cloudflare.com/r2/api/worker/worker-api](https://developers.cloudflare.com/r2/api/worker/worker-api/) |
| D1 Batch API | 官方文档 | [developers.cloudflare.com/d1/best-practices/use-indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) |
| TanStack Start — Cloudflare Adapter | 官方文档 | [tanstack.com/start/latest/docs/framework/react/hosting](https://tanstack.com/start/latest/docs/framework/react/hosting) |
| WinterCG — Web Standard APIs | 规范 | [wintercg.org](https://wintercg.org/) |
| Web Crypto API | MDN | [developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) |
| Cloudflare Workers — Environment Variables | 官方文档 | [developers.cloudflare.com/workers/configuration/environment-variables](https://developers.cloudflare.com/workers/configuration/environment-variables/) |
| TanStack Query Documentation | 官方文档 | [tanstack.com/query/latest](https://tanstack.com/query/latest) | React 异步状态管理
| Vinxi Documentation | 官方文档 | [vinxi.vercel.app](https://vinxi.vercel.app/) | TanStack Start 底层元框架
| Cloudflare Workers Types | 仓库 | [github.com/cloudflare/workers-types](https://github.com/cloudflare/workers-types) | TypeScript 类型定义
| Durable Objects Documentation | 官方文档 | [developers.cloudflare.com/durable-objects](https://developers.cloudflare.com/durable-objects/) | 有状态边缘对象
| Hono Middleware Documentation | 官方文档 | [hono.dev/docs/guides/middleware](https://hono.dev/docs/guides/middleware) | 中间件编写指南
| jose — JWT Library | 文档 | [github.com/panva/jose](https://github.com/panva/jose) | 边缘友好 JWT 库
| Cloudflare D1 Migrations | 官方文档 | [developers.cloudflare.com/d1/reference/migrations](https://developers.cloudflare.com/d1/reference/migrations/) | D1 数据库迁移
| Zod Documentation | 官方文档 | [zod.dev](https://zod.dev/) | Schema 校验库
| SuperJSON Documentation | 仓库 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) | 序列化库

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
