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

## gRPC 深度实践

gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers，支持四种通信模式。以下示例基于 `@grpc/grpc-js` v1.12+ 和 `ts-proto`。数据来源: [gRPC 官方文档](https://grpc.io/docs/languages/node/) 📚

### Protocol Buffers 定义

```protobuf
// proto/user.proto
syntax = "proto3";
package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);          // 服务端流
  rpc CreateUsers (stream CreateUserRequest) returns (UserList);   // 客户端流
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);      // 双向流
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
}

message CreateUserRequest {
  string email = 1;
  string name = 2;
}

message ChatMessage {
  string user = 1;
  string text = 2;
  int64 timestamp = 3;
}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
}

message UserList {
  repeated User users = 1;
}
```

编译命令（可运行）:

```bash
# 依赖: npm install -D ts-proto protoc-gen-ts_proto
npx protoc \
  --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./generated \
  --ts_proto_opt=outputServices=grpc-js,esModuleInterop=true \
  ./proto/user.proto
```

### 服务端流 RPC

服务端持续推送数据，适用于实时通知、日志流。

```ts
// server/streaming.ts
import * as grpc from '@grpc/grpc-js'
import { UserServiceService, IUserServiceServer } from './generated/user'

const userService: IUserServiceServer = {
  listUsers: (call) => {
    const { page, limit } = call.request
    const users = Array.from({ length: limit }, (_, i) => ({
      id: `${page}-${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
    }))

    users.forEach((u, idx) => {
      setTimeout(() => call.write(u), idx * 100)
    })
    setTimeout(() => call.end(), limit * 100)
  },
}

const server = new grpc.Server()
server.addService(UserServiceService, userService)
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start()
  console.log('gRPC server on :50051')
})
```

### 客户端流 RPC

客户端分批上传数据，服务端聚合后返回结果。

```ts
// client/clientStream.ts
import * as grpc from '@grpc/grpc-js'
import { UserServiceClient } from './generated/user'

const client = new UserServiceClient('localhost:50051', grpc.credentials.createInsecure())
const call = client.createUsers((err, response) => {
  if (err) console.error(err)
  else console.log('Created:', response.users.length)
})

// 模拟分批上传
const batch = [
  { email: 'a@ex.com', name: 'A' },
  { email: 'b@ex.com', name: 'B' },
  { email: 'c@ex.com', name: 'C' },
]
batch.forEach((u, i) => setTimeout(() => call.write(u), i * 50))
setTimeout(() => call.end(), batch.length * 50 + 100)
```

### 双向流 RPC

典型场景：聊天室、协同编辑、实时游戏状态同步。

```ts
// server/bidi.ts (节选)
const userService: IUserServiceServer = {
  chat: (call) => {
    call.on('data', (msg) => {
      console.log(`[${msg.user}] ${msg.text}`)
      // 广播回声
      call.write({ user: 'bot', text: `Echo: ${msg.text}`, timestamp: Date.now() })
    })
    call.on('end', () => call.end())
  },
}

// client/bidi.ts
const call = client.chat()
call.on('data', (msg) => console.log(`${msg.user}: ${msg.text}`))
call.write({ user: 'alice', text: 'hello', timestamp: Date.now() })
```

### 服务网格集成

在 Kubernetes 环境中，gRPC 通常与 Istio/Linkerd 服务网格配合使用。数据来源: [Istio gRPC 文档](https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/) 📚

```yaml
# istio-virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-grpc
spec:
  hosts:
    - user-service
  http:
    - match:
        - port: 50051
      route:
        - destination:
            host: user-service
            port:
              number: 50051
      retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: gateway-error,connect-failure,refused-stream
```

---

## tRPC 深度实践

tRPC 消除了前后端之间的类型鸿沟。以下示例基于 `@trpc/server` v11 与 `@trpc/client` v11，搭配 React Query。数据来源: [tRPC 官方文档](https://trpc.io/docs/) 📚

### 上下文与中间件

```ts
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { z } from 'zod'

interface Context {
  req: typeof createHTTPServer extends (...args: any[]) => infer R ? R : never
  user?: { id: string; role: 'admin' | 'user' }
}

const t = initTRPC.context<Context>().create()

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' })
  // 实际场景: 验证 JWT
  const user = { id: 'u1', role: 'admin' as const }
  return next({ ctx: { ...ctx, user } })
})

const authedProcedure = t.procedure.use(authMiddleware)

export const appRouter = t.router({
  // 公开接口
  health: t.procedure.query(() => ({ status: 'ok' })),

  // 受保护接口
  me: authedProcedure.query(({ ctx }) => ctx.user),

  // 管理员接口
  adminOnly: authedProcedure
    .use(t.middleware(async ({ ctx, next }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' })
      }
      return next({ ctx })
    }))
    .query(() => ({ secret: 'admin-data' })),
})

export type AppRouter = typeof appRouter
```

### 错误处理

```ts
// server/errorHandler.ts
import { TRPCError } from '@trpc/server'
import { appRouter } from './trpc'

// 在 router 中抛出结构化错误
export const appRouterWithErrors = appRouter._def.procedures
  // 实际使用时在 resolver 中捕获并转换

// 客户端统一处理
try {
  await trpc.adminOnly.query()
} catch (err: any) {
  if (err.data?.code === 'FORBIDDEN') {
    console.error('权限不足:', err.message)
  } else if (err.data?.code === 'UNAUTHORIZED') {
    console.error('请先登录')
  }
}
```

### React Query 集成

```tsx
// client/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import type { AppRouter } from '../server/trpc'

export const trpc = createTRPCReact<AppRouter>()

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            return { authorization: `Bearer ${localStorage.getItem('token')}` }
          },
        }),
      ],
    })
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

// client/UserCard.tsx
export function UserCard() {
  const { data, isLoading, error } = trpc.me.useQuery()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>Hello, {data?.id}</div>
}
```

### 文件上传

tRPC 本身基于 JSON，但可通过 `multipart/form-data` 与 `Presigned URL` 模式支持文件上传。

```ts
// server/upload.ts
import { router, publicProcedure } from './trpc'
import { z } from 'zod'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: 'us-east-1' })

export const uploadRouter = router({
  getPresignedUrl: publicProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input }) => {
      const key = `uploads/${Date.now()}-${input.filename}`
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ContentType: input.contentType,
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 300 })
      return { url, key }
    }),
})

// client/upload.tsx
async function uploadFile(file: File) {
  const { url, key } = await trpc.getPresignedUrl.mutate({
    filename: file.name,
    contentType: file.type,
  })
  await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  return key
}
```

---

## WebSocket API 设计

WebSocket 提供全双工通信，适用于高频实时场景。数据来源: [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455) 📚

### 连接管理与心跳

```ts
// server/wsServer.ts
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

const HEARTBEAT_INTERVAL = 30000
const server = createServer()
const wss = new WebSocketServer({ server, path: '/ws' })

function heartbeat(this: WebSocket) {
  ;(this as any).isAlive = true
}

wss.on('connection', (ws, req) => {
  ;(ws as any).isAlive = true
  ws.on('pong', heartbeat)
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    handleMessage(ws, msg)
  })
})

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!(ws as any).isAlive) return ws.terminate()
    ;(ws as any).isAlive = false
    ws.ping()
  })
}, HEARTBEAT_INTERVAL)

server.listen(8080)
```

### 重连策略（客户端）

```ts
// client/reconnectWs.ts
export class ReconnectingWebSocket extends EventTarget {
  private ws?: WebSocket
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private attempt = 0
  private maxAttempts = 10
  private baseDelay = 1000

  constructor(private url: string) {
    super()
    this.connect()
  }

  private connect() {
    this.ws = new WebSocket(this.url)
    this.ws.onopen = () => {
      this.attempt = 0
      this.dispatchEvent(new Event('open'))
    }
    this.ws.onmessage = (e) => this.dispatchEvent(new MessageEvent('message', { data: e.data }))
    this.ws.onclose = () => this.scheduleReconnect()
    this.ws.onerror = () => this.ws?.close()
  }

  private scheduleReconnect() {
    if (this.attempt >= this.maxAttempts) return
    const delay = Math.min(this.baseDelay * 2 ** this.attempt, 30000)
    this.reconnectTimer = setTimeout(() => {
      this.attempt++
      this.connect()
    }, delay)
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data)
  }

  close() {
    clearTimeout(this.reconnectTimer)
    this.ws?.close()
  }
}

// 使用
const rws = new ReconnectingWebSocket('wss://api.example.com/ws')
rws.addEventListener('message', (e) => console.log(e.data))
```

### 广播与房间/命名空间

```ts
// server/roomManager.ts
import { WebSocket } from 'ws'

class RoomManager {
  private rooms = new Map<string, Set<WebSocket>>()

  join(room: string, ws: WebSocket) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set())
    this.rooms.get(room)!.add(ws)
    ws.on('close', () => this.leave(room, ws))
  }

  leave(room: string, ws: WebSocket) {
    this.rooms.get(room)?.delete(ws)
  }

  broadcast(room: string, message: unknown, exclude?: WebSocket) {
    const data = JSON.stringify(message)
    this.rooms.get(room)?.forEach((ws) => {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) ws.send(data)
    })
  }

  broadcastAll(message: unknown) {
    const data = JSON.stringify(message)
    this.rooms.forEach((clients) => {
      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data)
      })
    })
  }
}

export const roomManager = new RoomManager()

// 在 connection handler 中使用
// roomManager.join('chat:general', ws)
// roomManager.broadcast('chat:general', { type: 'message', text: 'hello' })
```

---

## Server-Sent Events (SSE) 设计

SSE 是 HTTP 上的单向服务器推送，比 WebSocket 更轻量，适合新闻流、股票行情、日志推送。数据来源: [MDN - Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) 📚

### 服务端实现

```ts
// server/sse.ts
import { Request, Response } from 'express'

export function sseHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sendEvent = (data: unknown, event?: string, id?: string) => {
    if (id) res.write(`id: ${id}\n`)
    if (event) res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // 模拟股票行情推送
  const interval = setInterval(() => {
    sendEvent(
      { symbol: 'AAPL', price: 150 + Math.random() * 10, time: Date.now() },
      'price-update',
      `${Date.now()}`
    )
  }, 2000)

  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
}

// Express 路由
// app.get('/events/stocks', sseHandler)
```

### EventSource API 与自动重连

浏览器原生 `EventSource` 自带自动重连机制，通过 `Last-Event-ID` 头恢复断点。

```ts
// client/sseClient.ts
const evtSource = new EventSource('/events/stocks')

evtSource.addEventListener('price-update', (e) => {
  const data = JSON.parse(e.data)
  console.log(`${data.symbol}: $${data.price.toFixed(2)}`)
})

evtSource.addEventListener('error', () => {
  // 浏览器会自动重连；如需自定义退避逻辑，需手动 fetch + ReadableStream
  console.warn('SSE connection error, browser will retry automatically')
})

// 手动断点续传（当原生 EventSource 不满足需求时）
async function* streamingFetch(url: string, lastId?: string) {
  const headers: Record<string, string> = { Accept: 'text/event-stream' }
  if (lastId) headers['Last-Event-ID'] = lastId
  const res = await fetch(url, { headers })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop()!
    for (const chunk of lines) {
      const lines = chunk.split('\n')
      const event: any = {}
      for (const line of lines) {
        if (line.startsWith('id:')) event.id = line.slice(3).trim()
        if (line.startsWith('event:')) event.event = line.slice(6).trim()
        if (line.startsWith('data:')) event.data = line.slice(5).trim()
      }
      yield event
    }
  }
}
```

---

## API 网关模式

API 网关是微服务架构的流量入口，负责路由、认证、限流、熔断。数据来源: [AWS API Gateway 文档](https://docs.aws.amazon.com/apigateway/) 📚、[Kong 文档](https://docs.konghq.com/) 📚

### Kong 网关配置

```yaml
# kong declarative config (kong.yml)
_format_version: '3.0'
services:
  - name: user-service
    url: http://user-svc:8080
    routes:
      - name: user-routes
        paths:
          - /api/users
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
          redis_host: redis
      - name: jwt
        config:
          uri_param_names: []
          cookie_names: []
          key_claim_name: iss
          secret_is_base64: false
          claims_to_verify:
            - exp
      - name: cors
        config:
          origins:
            - 'https://app.example.com'
          methods:
            - GET
            - POST
            - PATCH
            - DELETE
```

### AWS API Gateway (OpenAPI 导入)

```yaml
# openapi-with-extensions.yaml
openapi: 3.1.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      x-amazon-apigateway-integration:
        uri: arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:getUser/invocations
        httpMethod: POST
        type: aws_proxy
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
```

### Traefik 反向代理

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3.1
    command:
      - --api.insecure=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  api:
    build: ./api
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=Host(`api.example.com`)
      - traefik.http.routers.api.entrypoints=websecure
      - traefik.http.routers.api.tls.certresolver=letsencrypt
      - traefik.http.middlewares.api-ratelimit.ratelimit.average=100
      - traefik.http.routers.api.middlewares=api-ratelimit
```

---

## 微服务通信模式

微服务间的通信分为同步与异步两种范式。数据来源: [AWS 微服务白皮书](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html) 📚、[Microsoft 微服务架构](https://learn.microsoft.com/azure/architecture/microservices/) 📚

### 同步通信: REST + gRPC

```ts
// shared/serviceDiscovery.ts
// 使用 Consul 或 etcd 进行服务发现
export async function resolveService(name: string): Promise<string> {
  // 简化示例：实际使用 Consul HTTP API 或 DNS SRV 记录
  const services: Record<string, string> = {
    'user-service': 'http://user-service:8080',
    'order-service': 'http://order-service:8080',
  }
  return services[name]
}

// 同步调用示例（带熔断）
import CircuitBreaker from 'opossum'

const breaker = new CircuitBreaker(
  async (userId: string) => {
    const base = await resolveService('user-service')
    const res = await fetch(`${base}/users/${userId}`)
    if (!res.ok) throw new Error('User service failed')
    return res.json()
  },
  { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 }
)

breaker.on('open', () => console.warn('Circuit breaker OPEN'))

// 使用
const user = await breaker.fire('123')
```

### 异步通信: 消息队列与 Event Bus

```ts
// shared/eventBus.ts
import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'api-gateway' })
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'order-service' })

export const eventBus = {
  async connect() {
    await producer.connect()
    await consumer.connect()
  },

  async publish<T>(topic: string, event: { type: string; payload: T; timestamp: number }) {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    })
  },

  async subscribe(topic: string, handler: (payload: unknown) => Promise<void>) {
    await consumer.subscribe({ topic })
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) await handler(JSON.parse(message.value.toString()))
      },
    })
  },
}

// 使用示例
await eventBus.publish('order.created', {
  type: 'order.created',
  payload: { orderId: 'o1', amount: 100 },
  timestamp: Date.now(),
})

await eventBus.subscribe('order.created', async (payload) => {
  console.log('Handling order created:', payload)
})
```

### Saga 分布式事务模式

```ts
// order/saga/createOrderSaga.ts
interface SagaStep {
  action: () => Promise<void>
  compensate: () => Promise<void>
}

export async function runSaga(steps: SagaStep[]) {
  const completed: SagaStep[] = []
  try {
    for (const step of steps) {
      await step.action()
      completed.push(step)
    }
  } catch (err) {
    // 逆向补偿
    for (const step of completed.reverse()) {
      await step.compensate().catch((e) => console.error('Compensation failed', e))
    }
    throw err
  }
}

// 使用
await runSaga([
  {
    action: async () => await reserveInventory(order),
    compensate: async () => await releaseInventory(order),
  },
  {
    action: async () => await chargePayment(order),
    compensate: async () => await refundPayment(order),
  },
])
```

---

## GraphQL Federation 与 Schema 组合

当单一 GraphQL Schema 无法满足大型组织需求时，可通过 Federation 将多个子服务组合为统一网关。数据来源: [Apollo Federation 文档](https://www.apollographql.com/docs/federation/) 📚、[GraphQL Mesh 文档](https://the-guild.dev/graphql/mesh) 📚

### Apollo Federation v2

```ts
// subgraphs/users/subgraph.ts
import { ApolloServer } from '@apollo/server'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { gql } from 'graphql-tag'

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    email: String!
    orders: [Order!]! @requires(fields: "id")
  }

  type Order @key(fields: "id") {
    id: ID!
    userId: ID! @shareable
  }
`

const resolvers = {
  User: {
    orders: (user) => fetchOrdersByUserId(user.id),
  },
}

const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) })

// gateway/gateway.ts
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway'
import { ApolloServer } from '@apollo/server'

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4001/graphql' },
      { name: 'orders', url: 'http://localhost:4002/graphql' },
    ],
  }),
})

const server = new ApolloServer({ gateway })
```

### GraphQL Mesh（跨协议统一）

GraphQL Mesh 可将 REST/OpenAPI/gRPC/SOAP/GraphQL 等异构 API 统一为单一 GraphQL 端点。

```yaml
# .meshrc.yaml
sources:
  - name: UserService
    handler:
      openapi:
        source: ./openapi/user-api.yaml
        baseUrl: http://user-service:8080
  - name: OrderService
    handler:
      graphql:
        endpoint: http://order-service:4002/graphql
  - name: LegacySoap
    handler:
      soap:
        wsdl: http://legacy-service/soap?wsdl

transforms:
  - filterSchema:
      filters:
        - Query.!{me}
  - namingConvention:
      typeNames: PascalCase
      fieldNames: camelCase

serve:
  playground: true
```

运行命令:

```bash
npx graphql-mesh dev
```

---

## API 文档自动化

文档应与代码同步演进。数据来源: [OpenAPI Generator](https://openapi-generator.tech/) 📚、[Swagger Codegen](https://swagger.io/tools/swagger-codegen/) 📚

### OpenAPI Generator

```bash
# 安装
npm install @openapitools/openapi-generator-cli -g

# 生成 TypeScript 客户端
openapi-generator-cli generate \
  -i ./openapi.yaml \
  -g typescript-fetch \
  -o ./generated-client \
  --additional-properties=supportsES6=true,npmName=@myapi/client

# 生成服务端 stub (Spring Boot / Node.js Express)
openapi-generator-cli generate \
  -i ./openapi.yaml \
  -g nodejs-express-server \
  -o ./generated-server
```

### 从 tRPC Router 生成 OpenAPI

```ts
// server/openapiFromTrpc.ts
import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from './trpc'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'User API',
  description: 'tRPC to OpenAPI',
  version: '1.0.0',
  baseUrl: 'https://api.example.com',
})

// 导出为 JSON 供 Swagger UI 使用
// fs.writeFileSync('./openapi.json', JSON.stringify(openApiDocument, null, 2))
```

### Swagger UI 集成

```ts
// server/swagger.ts
import swaggerUi from 'swagger-ui-express'
import openApiSpec from './openapi.json'
import express from 'express'

const app = express()
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
app.listen(3000, () => console.log('Docs at http://localhost:3000/docs'))
```

---

## 案例深度分析

### Stripe API 设计

Stripe API 是 REST 设计的行业标杆。数据来源: [Stripe API 参考](https://stripe.com/docs/api) 📚

| 设计维度 | Stripe 实践 | 可借鉴点 |
|----------|------------|---------|
| **资源建模** | `/v1/charges`, `/v1/customers`, `/v1/subscriptions` | 名词复数、层级清晰 |
| **版本控制** | URL 路径 `/v1/` | 稳定版本、向后兼容承诺 |
| **幂等性** | `Idempotency-Key` 请求头 | 网络抖动时防止重复扣款 |
| **分页** | Cursor-based (`starting_after`, `ending_before`) | 避免偏移分页在大数据下的性能问题 |
| **Webhook** | 事件类型 + 签名验证 (`Stripe-Signature`) | 安全性与可观测性并重 |
| **错误格式** | 结构化 JSON，含 `type`, `code`, `decline_code` | 机器可读、用户可理解 |

```ts
// Stripe 风格幂等性请求
const res = await fetch('https://api.stripe.com/v1/charges', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${sk_test_key}`,
    'Idempotency-Key': uuidv4(), // 同一业务键多次请求只执行一次
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({ amount: '2000', currency: 'usd', source: 'tok_visa' }),
})
```

### GitHub API v3

GitHub REST API 在超媒体驱动和缓存方面表现突出。数据来源: [GitHub REST API 文档](https://docs.github.com/en/rest) 📚

| 设计维度 | GitHub 实践 | 可借鉴点 |
|----------|------------|---------|
| **HATEOAS** | 响应含 `_links`（self, next, prev, last） | 客户端无需硬编码 URL |
| **条件请求** | `If-None-Match` + ETag / `If-Modified-Since` | 节省带宽与配额 |
| **分页** | Link Header (`<url>; rel="next"`) | 标准 HTTP 机制，不污染 Body |
| **速率限制** | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | 透明、可编程 |
| **Preview** | `Accept: application/vnd.github.v3+json` | 功能预览与版本协商结合 |

```ts
// GitHub 风格条件请求
const res = await fetch('https://api.github.com/users/octocat', {
  headers: {
    Authorization: `token ${ghToken}`,
    'If-None-Match': cachedETag, // 若资源未变，返回 304 Not Modified
  },
})
if (res.status === 304) {
  console.log('Use cached data')
} else {
  const data = await res.json()
  const etag = res.headers.get('ETag')
  // 缓存 data + etag
}
```

### Twilio API 设计

Twilio 在异步状态机与 Webhook 设计上极具参考价值。数据来源: [Twilio API 文档](https://www.twilio.com/docs/usage/api) 📚

| 设计维度 | Twilio 实践 | 可借鉴点 |
|----------|------------|---------|
| **状态机** | `queued` -> `sending` -> `sent` -> `delivered` / `failed` | 每个资源都有明确生命周期 |
| **Webhook** | 状态变化时 POST 到用户配置的 URL | 事件驱动、减少轮询 |
| **子资源** | `/Messages/{sid}/Media` | 子资源归属清晰 |
| **分页** | `Page`, `PageSize`, `NextPageUri` | URI 驱动分页 |
| **调试** | `X-Twilio-Webhook-Event-Id` | 全链路追踪 |

```ts
// Twilio 风格 Webhook 验证
import { createHmac, timingSafeEqual } from 'crypto'

function validateTwilioWebhook(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('')
  const expected = createHmac('sha1', authToken)
    .update(Buffer.from(url + sorted, 'utf-8'))
    .digest('base64')
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
```

---

## 2026 趋势与前沿实践

API 设计领域在 2026 年呈现以下关键趋势。数据来源: [Postman State of the API Report 2025](https://www.postman.com/state-of-api/) 📚、[Gartner API Management 2025](https://www.gartner.com/) 📚

### API-first 设计

API-first 指在编写任何前端或后端代码之前，先定义 API 契约（OpenAPI / AsyncAPI / Protobuf）。

```yaml
# api-first-workflow.yaml
# 1. 设计阶段：Product + Backend + Frontend 共同评审 OpenAPI
# 2. 并行开发：基于 OpenAPI 生成 mock server 与前端类型
# 3. 契约测试：CI 中验证实现与 OpenAPI 的一致性

# 使用 Prism 作为 Mock Server
# npx @stoplight/prism-cli mock openapi.yaml
```

### Contract Testing

契约测试确保服务提供方与消费者之间的契约不被破坏。数据来源: [Pact 文档](https://docs.pact.io/) 📚

```ts
// __tests__/contract/user.pact.spec.ts
import { PactV3 } from '@pact-foundation/pact'
import { like, string } from '@pact-foundation/pact/dsl/matchers'

const provider = new PactV3({
  consumer: 'web-frontend',
  provider: 'user-service',
  dir: './pacts',
})

test('get user by id', async () => {
  await provider
    .given('user exists')
    .uponReceiving('a request for user 123')
    .withRequest({ method: 'GET', path: '/users/123' })
    .willRespondWith({
      status: 200,
      body: {
        id: like('123'),
        email: string('alice@example.com'),
      },
    })

  await provider.executeTest(async (mockserver) => {
    const res = await fetch(`${mockserver.url}/users/123`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('123')
  })
})

// CI 中验证 provider 是否满足所有 pact
// npx pact-verifier --provider-base-url http://localhost:8080 --pact-broker-base-url ...
```

### AI API 生成

大语言模型（LLM）正被用于从自然语言描述或数据库 Schema 自动生成 API 定义与实现。数据来源: [OpenAPI Generator + LLM 集成趋势](https://openapi-generator.tech/) 📚

```ts
// ai-generated-api-pattern.ts
// 提示词模板（用于 GPT-4o / Claude 3.5 Sonnet）
const prompt = `
根据以下 Prisma Schema 生成完整的 tRPC Router，包含：
1. Zod 输入校验
2. 中间件（认证 + RBAC）
3. OpenAPI 扩展注解

Schema:
model User {
  id    String @id @default(uuid())
  email String @unique
  role  Role   @default(USER)
}

输出要求：TypeScript，可直接运行。
`

// 实际工具链：
// - Vercel AI SDK 生成 OpenAPI YAML
// - Mintlify / Fern 自动生成 SDK 与文档
// - Postman AI Assistant 生成测试集合
```

### 2026 技术栈全景

| 领域 | 推荐技术 | 说明 |
|------|---------|------|
| **REST 框架** | Hono / Elysia / Fastify | 边缘运行时友好、性能极致 |
| **RPC** | tRPC / gRPC / Connect | 类型安全优先 |
| **实时** | SSE / WebSocket / WebTransport | 按场景选择：SSE 单向、WS 双向、WT 低延迟 |
| **网关** | Kong / AWS API Gateway / Traefik | 云原生、插件生态丰富 |
| **文档** | OpenAPI 3.1 + Scalar / Swagger UI | 交互式文档、自动生成 SDK |
| **测试** | Pact / Schemathesis / REST Assured | 契约测试 + 模糊测试 |
| **可观测性** | OpenTelemetry + Jaeger + Prometheus | 全链路追踪与指标 |
| **AI 集成** | Vercel AI SDK / LangChain / OpenAI Assistants API | 自然语言到 API 的桥接 |

---

## 参考资源

- [REST API Design Best Practices](https://docs.microsoft.com/azure/architecture/best-practices/api-design) 📚
- [GraphQL Spec](https://spec.graphql.org/) 📚
- [tRPC 文档](https://trpc.io/) 📚
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0) 📚
- [Stripe API 设计](https://stripe.com/docs/api) 📚
- [GitHub API v3](https://docs.github.com/en/rest) 📚
- [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807) 📚
