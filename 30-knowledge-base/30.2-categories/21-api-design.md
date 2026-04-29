# API 设计 (API Design)

> JavaScript/TypeScript 生态 API 设计范式对比：REST、GraphQL、tRPC、gRPC 与 Server Actions 的选型框架。

---

## 核心概念

现代 API 设计按**通信范式**分类：

| 范式 | 协议 | 数据格式 | 类型安全 | 实时性 |
|------|------|---------|---------|--------|
| **REST** | HTTP/1.1, HTTP/2 | JSON | 需 OpenAPI + Codegen | 轮询 / SSE |
| **GraphQL** | HTTP/1.1, HTTP/2 | JSON | Schema + Codegen | 订阅 |
| **tRPC / oRPC** | HTTP | JSON | 端到端 TypeScript | 无 |
| **gRPC** | HTTP/2 | Protobuf（二进制） | 原生 | 双向流 |
| **Server Actions** | HTTP | JSON | 端到端 TypeScript | 无 |
| **WebSocket** | WS | 任意 | 需自定义 | 原生双向 |

---

## 方案对比矩阵

| 维度 | REST | GraphQL | tRPC | gRPC | Server Actions |
|------|------|---------|------|------|----------------|
| **学习曲线** | 低 | 高 | 低 | 高 | 低 |
| **类型安全** | 需 Codegen | Schema 驱动 | ✅ 原生 TS | ✅ Protobuf | ✅ 原生 TS |
| **Over-fetching** | ❌ 常见 | ✅ 客户端决定 | ✅ 精确 | ✅ 精确 | ✅ 精确 |
| **缓存策略** | HTTP 原生 | 需 DataLoader | HTTP 缓存 | 有限 | 框架级缓存 |
| **生态系统** | 最大 | 大 | 中（TS 生态） | 大（跨语言） | Next.js 绑定 |
| **跨语言** | ✅ | ✅ | ❌（仅 TS） | ✅ | ❌ |
| **浏览器支持** | 原生 | 原生 | 原生 | 需 gRPC-Web | 原生 |
| **调试工具** | Postman, curl | GraphiQL, Playground | 无专用 | grpcurl | 浏览器 DevTools |

---

## 选型决策树

```
团队技术栈？
├── 多语言后端（Go/Python/Java）→ gRPC（内部）+ REST/GraphQL（外部）
├── 全 TypeScript 栈 →
│   ├── Next.js React Server Components → Server Actions（首选）
│   ├── 独立 API 服务 → tRPC / oRPC
│   └── 需要外部消费 → REST + OpenAPI
├── 前端驱动数据需求（复杂查询/聚合）→ GraphQL
└── 简单 CRUD，无复杂关联 → REST + OpenAPI
```

---

## 2026 生态动态

### tRPC → oRPC 演进

tRPC 的局限性（HTTP 语义模糊、中间件生态薄弱）催生了 **oRPC**：

- **标准 HTTP**：遵循 REST 语义，兼容现有缓存和代理
- **Contract-First**：先定义契约，再生成服务端和客户端
- **中间件生态**：Express/Fastify/Hono 中间件直接复用

```typescript
// oRPC 示例
import { orpc, router } from '@orpc/server';
import { z } from 'zod';

const UserSchema = z.object({ id: z.string(), name: z.string(), email: z.string().email() });

const appRouter = router({
  user: router({
    get: orpc
      .input(z.object({ id: z.string() }))
      .output(UserSchema)
      .handler(async ({ input }) => {
        return db.user.findById(input.id);
      }),
    list: orpc
      .input(z.object({ limit: z.number().max(100).default(20) }))
      .output(z.array(UserSchema))
      .handler(async ({ input }) => {
        return db.user.findMany({ take: input.limit });
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

### Server Actions 成熟

Next.js 15 中 Server Actions 的改进：

- **缓存策略**：`revalidatePath` / `revalidateTag` 精确控制
- **乐观更新**：`useOptimistic` Hook 实现无刷新 UI
- **错误处理**：服务端抛出的错误自动序列化到客户端

### GraphQL 的反思

2026 年 GraphQL 采用趋于理性：

- **优势仍在**：复杂数据图、前端驱动查询、订阅
- **成本显现**：Resolver 性能调优、N+1 查询、缓存复杂性
- **趋势**：小型团队回归 REST + OpenAPI，大型平台保留 GraphQL

---

## 最佳实践

### REST API 设计

```
GET    /api/v1/users          # 列表（分页 + 过滤）
GET    /api/v1/users/:id      # 详情
POST   /api/v1/users          # 创建
PATCH  /api/v1/users/:id      # 部分更新
DELETE /api/v1/users/:id      # 删除
```

- **版本化**：URL 路径（`/v1/`）或 Header（`Accept: application/vnd.api.v1+json`）
- **分页**：Cursor-based 优于 Offset-based（避免数据漂移）
- **标准化错误**：RFC 7807 `application/problem+json`

### REST 错误响应（RFC 7807 Problem Details）

```typescript
// lib/errors.ts
import { z } from 'zod';

export const ProblemDetailSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().url().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;

// Usage in Fastify / Express error handler
export function createValidationProblem(errors: Record<string, string[]>): ProblemDetail {
  return {
    type: 'https://api.example.com/errors/validation-failed',
    title: 'Validation Failed',
    status: 422,
    detail: 'One or more fields failed validation.',
    errors,
  };
}
```

### GraphQL 订阅（Apollo Server + PubSub）

```typescript
// server/resolvers.ts
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';

export const resolvers = {
  Query: {
    messages: (_: unknown, __: unknown, { db }: Context) => db.message.findMany(),
  },
  Mutation: {
    async addMessage(_: unknown, { content }: { content: string }, { db, userId }: Context) {
      const msg = await db.message.create({ data: { content, authorId: userId } });
      await pubsub.publish(MESSAGE_ADDED, { messageAdded: msg });
      return msg;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};
```

### tRPC 端到端路由

```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

// server/routers/post.ts
export const postRouter = router({
  list: publicProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input, ctx }) => {
      return ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
    }),
  create: publicProcedure
    .input(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.post.create({ data: { ...input, authorId: ctx.userId } });
    }),
});

// app/_trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

// app/page.tsx — 客户端组件
const { data } = trpc.post.list.useQuery({ limit: 10 });
```

### gRPC-Web 浏览器通信

```typescript
// proto/calculator.proto
syntax = "proto3";
package calculator;

service Calculator {
  rpc Add (AddRequest) returns (AddResponse);
  rpc StreamPrimes (PrimeRequest) returns (stream PrimeResponse);
}

message AddRequest { int32 a = 1; int32 b = 2; }
message AddResponse { int32 result = 1; }

// client.ts (gRPC-Web + protobuf-ts)
import { CalculatorClient } from './gen/calculator.client';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

const transport = new GrpcWebFetchTransport({ baseUrl: 'http://localhost:8080' });
const client = new CalculatorClient(transport);

const { response } = await client.add({ a: 3, b: 5 });
console.log(response.result); // 8
```

### 类型安全端到端

```typescript
// shared/api.ts — 共享契约
export const UserSchema = z.object({ id: z.string(), name: z.string() })
export type User = z.infer<typeof UserSchema>

// server/router.ts — 服务端实现
// client/hooks.ts — 客户端消费（自动生成类型）
```

### Next.js 15 Server Actions

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateTodoSchema = z.object({ title: z.string().min(1).max(200) });

export async function createTodo(formData: FormData) {
  const parsed = CreateTodoSchema.safeParse({
    title: formData.get('title'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.todo.create({ data: { title: parsed.data.title, completed: false } });
  revalidatePath('/todos');
  return { success: true };
}

// app/todos/page.tsx
import { createTodo } from './actions';

export default function TodoPage() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="New todo..." />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 安全基线

- **认证**：JWT（短期）+ Refresh Token（长期，HttpOnly）
- **授权**：RBAC / ABAC，每个端点校验权限
- **限流**：Redis 滑动窗口，防止暴力攻击
- **CORS**：白名单策略，生产环境禁止 `*`
- **输入校验**：Zod / Valibot 严格校验所有输入

---

## 参考资源

- [REST API Design Best Practices](https://restfulapi.net/)
- [GraphQL Documentation](https://graphql.org/)
- [tRPC Documentation](https://trpc.io/)
- [oRPC Documentation](https://orpc.dev/)
- [gRPC Documentation](https://grpc.io/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [OpenAPI Specification v3.1](https://spec.openapis.org/oas/v3.1.0)
- [JSON:API Specification](https://jsonapi.org/)
- [Apollo Server — Subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
- [gRPC-Web — GitHub](https://github.com/grpc/grpc-web)
- [Zod — TypeScript-first Schema Validation](https://zod.dev/)
- [Hono — Web Framework (oRPC compatible)](https://hono.dev/)
- [Fastify — High Performance REST Framework](https://fastify.dev/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Mozilla — Web Authentication](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

---

## 关联文档

- `30-knowledge-base/30.2-categories/25-security.md`
- `20-code-lab/20.6-backend-apis/`
- `40-ecosystem/comparison-matrices/backend-frameworks-compare.md`

---

*最后更新: 2026-04-29*
