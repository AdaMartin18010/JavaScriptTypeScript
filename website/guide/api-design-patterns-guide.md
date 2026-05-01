---
title: API 设计模式指南
description: 'REST、GraphQL、gRPC、tRPC 等 API 设计模式的深度指南，覆盖资源建模、版本控制、安全、性能与可观测性'
---

# API 设计模式指南

> 最后更新: 2026-05-01

---

## 概述

API 设计是软件架构的核心。
本指南覆盖从 RESTful 资源建模到 GraphQL 类型系统的完整 API 设计模式，帮助开发者构建可维护、可扩展、类型安全的 API。

---

## RESTful API 设计

### 资源建模

```http
GET    /api/v1/users          # 列表
GET    /api/v1/users/:id      # 详情
POST   /api/v1/users          # 创建
PATCH  /api/v1/users/:id      # 部分更新
DELETE /api/v1/users/:id      # 删除
```

### 状态码规范

| 状态码 | 场景 | 示例 |
|--------|------|------|
| 200 | 成功 | GET /users 返回列表 |
| 201 | 创建成功 | POST /users 返回新用户 |
| 204 | 无内容 | DELETE 成功 |
| 400 | 请求参数错误 | 缺少必填字段 |
| 401 | 未认证 | Token 缺失 |
| 403 | 无权限 | 角色不足 |
| 404 | 资源不存在 | 用户 ID 无效 |
| 409 | 冲突 | 邮箱已注册 |
| 422 | 业务逻辑错误 | 余额不足 |
| 429 | 限流 | 请求过于频繁 |
| 500 | 服务器错误 | 数据库连接失败 |

### 版本策略

| 策略 | 示例 | 适用场景 |
|------|------|---------|
| URL 路径 | `/api/v1/users` | 简单项目 |
| 请求头 | `Accept: application/vnd.api.v1+json` | 企业级 |
| 查询参数 | `/api/users?version=1` | 兼容性过渡 |

---

## GraphQL 设计模式

### Schema 设计原则

```graphql
type User {
  id: ID!
  email: String!
  name: String
  posts: [Post!]!        # 1:N 关系
  profile: Profile        # 1:1 关系
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!           # N:1 关系
}

type Query {
  user(id: ID!): User
  users(limit: Int = 20): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

### N+1 问题与 DataLoader

```ts
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await db.user.findMany({
    where: { id: { in: userIds } }
  })
  return userIds.map(id => users.find(u => u.id === id))
})

// 解析器中使用
const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId)
  }
}
```

---

## tRPC 端到端类型安全

```ts
// server/router.ts
import { initTRPC } from '@trpc/server'
const t = initTRPC.create()

export const appRouter = t.router({
  user: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.user.findById(input.id)
    }),
})

export type AppRouter = typeof appRouter

// client/client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from './server/router'

const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })]
})

// 完全类型安全！
const user = await trpc.user.query({ id: '123' })
```

---

## API 安全

### 认证模式

| 模式 | 适用场景 | 安全性 |
|------|---------|--------|
| API Key | 内部服务 | 中 |
| JWT | 用户认证 | 高 |
| OAuth 2.0 | 第三方集成 | 高 |
| mTLS | 微服务间 | 最高 |

### 速率限制策略

```ts
// 滑动窗口限流
import { RateLimiterRedis } from 'rate-limiter-flexible'

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api_limit',
  points: 100,      // 100 请求
  duration: 60,     // 每 60 秒
})
```

---

## 可观测性

### 结构化日志

```ts
import { logger } from './logger'

logger.info({
  event: 'api_request',
  method: 'GET',
  path: '/users',
  durationMs: 45,
  statusCode: 200,
  userId: '123',
  traceId: 'abc-123'
})
```

### 分布式追踪

```ts
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('api-service')

async function getUser(id: string) {
  return tracer.startActiveSpan('getUser', async (span) => {
    span.setAttribute('user.id', id)
    const user = await db.user.findById(id)
    span.end()
    return user
  })
}
```

---

## API 版本控制策略

### URL 路径版本

```http
GET /api/v1/users
GET /api/v2/users
```

**优点**: 简单直观、CDN 缓存友好
**缺点**: URL 污染、破坏 REST 资源语义

### 请求头版本

```http
GET /api/users
Accept: application/vnd.api.v1+json
API-Version: 2024-01-15
```

**优点**: 资源 URL 不变、符合 REST
**缺点**: 调试复杂、CDN 需配置

### 版本策略对比

| 策略 | 示例 | 优点 | 缺点 | 适用 |
|------|------|------|------|------|
| URL | `/v1/` | 直观 | URL 污染 | 简单项目 |
| Header | `Accept:` | RESTful | 调试难 | 企业级 |
| 参数 | `?version=1` | 兼容 | 不规范 | 过渡 |
| 内容协商 | `Accept:` | 标准 | 复杂 | API 平台 |

---

## API 安全

### 认证模式

| 模式 | 适用场景 | 安全性 | 复杂度 |
|------|---------|--------|--------|
| **API Key** | 内部服务 | 中 | 低 |
| **JWT** | 用户认证 | 高 | 中 |
| **OAuth 2.0** | 第三方集成 | 高 | 高 |
| **mTLS** | 微服务间 | 最高 | 高 |
| **Passkeys** | 用户登录 | 最高 | 中 |

### JWT 最佳实践

```ts
import { SignJWT, jwtVerify } from 'jose'

// 签发
const token = await new SignJWT({ userId: '123', role: 'admin' })
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(privateKey)

// 验证
try {
  const { payload } = await jwtVerify(token, publicKey, { clockTolerance: 60 })
} catch (e) {
  // Token 过期或无效
}
```

### 速率限制

```ts
// Token Bucket
import { RateLimiterRedis } from 'rate-limiter-flexible'

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api_limit',
  points: 100,
  duration: 60,
})

// 滑动窗口
const slidingWindow = new RateLimiterRedis({
  keyPrefix: 'api_sliding',
  points: 10,
  duration: 1,
})
```

---

## 错误处理

### RFC 7807 Problem Details

```json
{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 402,
  "detail": "Your account balance is insufficient for this transaction.",
  "instance": "/transactions/550e8400",
  "balance": 30.00,
  "required": 50.00
}
```

### 统一错误格式

```ts
interface ApiError {
  code: string        // 机器可读错误码
  message: string     // 人类可读消息
  details?: unknown   // 额外上下文
  requestId: string   // 用于追踪
  timestamp: string   // ISO 8601
}
```

---

## 可观测性

### 结构化日志

```ts
import { logger } from './logger'

logger.info({
  event: 'api_request',
  method: 'GET',
  path: '/users',
  durationMs: 45,
  statusCode: 200,
  userId: '123',
  traceId: 'abc-123',
  userAgent: 'Mozilla/5.0...',
})
```

### 分布式追踪

```ts
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('api-service')

async function getUser(id: string) {
  return tracer.startActiveSpan('getUser', async (span) => {
    span.setAttribute('user.id', id)
    const user = await db.user.findById(id)
    span.setAttribute('user.found', !!user)
    span.end()
    return user
  })
}
```

---

## 缓存策略

| 策略 | 适用 | 实现 | 失效 |
|------|------|------|------|
| **Cache-Control** | 静态资源 | `max-age=3600` | 时间 |
| **ETag** | 动态资源 | 内容哈希 | 内容变化 |
| **Last-Modified** | 低频更新 | 时间戳 | 时间 |
| **CDN 缓存** | 全球分发 | Cloudflare/Vercel | 手动清除 |
| **应用缓存** | 高频查询 | Redis | 业务逻辑 |

---

## 案例研究

### Stripe API 设计

- **RESTful 资源**: `/v1/charges`, `/v1/customers`
- **版本控制**: URL 路径 `/v1/`
- **幂等性**: `Idempotency-Key` 头
- **分页**: Cursor-based
- **Webhook**: 事件驱动通知

### GitHub API v3

- **HATEOAS**: 响应含 `_links`
- **条件请求**: `If-None-Match` + ETag
- **分页**: Link Header
- **速率限制**: `X-RateLimit-*` 头

---

## 2026 最佳实践

| 实践 | 说明 |
|------|------|
| **API-first** | 先设计 API，再实现前后端 |
| **OpenAPI 3.1** | 自动生成文档、客户端 SDK、模拟服务器 |
| **类型共享** | tRPC / GraphQL Codegen / OpenAPI Generator |
| **边缘缓存** | Cloudflare Workers / Vercel Edge 缓存 |
| **流式响应** | SSE / HTTP/2 Server Push |
| **契约测试** | Pact / Spring Cloud Contract |
| **API 网关** | Kong / AWS API Gateway / Traefik |
| **文档即代码** | OpenAPI 规范纳入版本控制 |

---

## 参考资源

- [REST API Design Best Practices](https://docs.microsoft.com/azure/architecture/best-practices/api-design) 📚
- [GraphQL Spec](https://spec.graphql.org/) 📚
- [tRPC 文档](https://trpc.io/) 📚
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0) 📚
- [Stripe API 设计](https://stripe.com/docs/api) 📚
- [GitHub API v3](https://docs.github.com/en/rest) 📚
- [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807) 📚
