---
title: 'RPC 框架与类型安全传输'
description: 'RPC Frameworks and Type-Safe Transport: tRPC, Connect, gRPC-Web, JSON-RPC 2.0, Schema Evolution'
last-updated: 2026-05-06
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive technical analysis of type-safe RPC frameworks in the TypeScript ecosystem, covering tRPC, Connect, gRPC-Web, and JSON-RPC 2.0, with deep dives into schema evolution, transport protocols, batching strategies, and edge-specific optimization patterns.'
references:
  - 'tRPC, Documentation'
  - 'Connect RPC, Protocol Documentation'
  - 'Google, gRPC-Web'
  - 'JSON-RPC 2.0 Specification'
  - 'W3C, WebTransport'
---

# RPC 框架与类型安全传输

> **理论深度**: 高级
> **前置阅读**: [23-websocket-and-realtime-protocols.md](../70.4-web-platform-fundamentals/23-websocket-and-realtime-protocols.md), [32-module-system-and-web-components.md](../70.4-web-platform-fundamentals/32-module-system-and-web-components.md)
> **目标读者**: 全栈架构师、API 设计师、类型系统爱好者
> **核心问题**: 如何在保持类型安全的前提下，实现前后端之间的高效通信？Schema 演化如何不破坏现有客户端？

---

## 目录

- [RPC 框架与类型安全传输](#rpc-框架与类型安全传输)
  - [目录](#目录)
  - [1. 类型安全 RPC 的设计哲学](#1-类型安全-rpc-的设计哲学)
    - [1.1 从 REST 到 RPC 的范式迁移](#11-从-rest-到-rpc-的范式迁移)
    - [1.2 类型安全的三层保证](#12-类型安全的三层保证)
  - [2. tRPC：端到端类型安全](#2-trpc端到端类型安全)
    - [2.1 架构核心](#21-架构核心)
    - [2.2 传输协议与批处理](#22-传输协议与批处理)
    - [2.3 中间件与上下文](#23-中间件与上下文)
  - [5. Connect RPC：Protobuf 与 HTTP/2 的融合](#3-connect-rpcprotobuf-与-http2-的融合)
    - [5.1 Connect 的三协议支持](#31-connect-的三协议支持)
    - [5.2 Protobuf 与 TypeScript 的绑定](#32-protobuf-与-typescript-的绑定)
  - [6. gRPC-Web：从数据中心到浏览器](#4-grpc-web从数据中心到浏览器)
    - [6.1 gRPC-Web 的代理需求](#41-grpc-web-的代理需求)
    - [6.2 流式调用的限制](#42-流式调用的限制)
  - [7. JSON-RPC 2.0：轻量级替代方案](#5-json-rpc-20轻量级替代方案)
    - [7.1 协议语义](#51-协议语义)
    - [7.2 与 tRPC/Connect 的对比](#52-与-trpcconnect-的对比)
  - [8. Schema 演化与版本兼容性](#6-schema-演化与版本兼容性)
    - [8.1 Protobuf 的向后兼容性规则](#61-protobuf-的向后兼容性规则)
    - [8.2 TypeScript 类型的演化挑战](#62-typescript-类型的演化挑战)
  - [9. Edge 场景下的 RPC 优化](#7-edge-场景下的-rpc-优化)
    - [9.1 Edge 函数的 RPC 调用模式](#71-edge-函数的-rpc-调用模式)
    - [7.3 Hono RPC：边缘原生的类型安全客户端](#73-hono-rpc边缘原生的类型安全客户端)
    - [7.4 oRPC：OpenAPI 优先的类型安全 RPC](#74-orpcopenapi-优先的类型安全-rpc)
    - [9.2 流式与订阅的边缘化](#72-流式与订阅的边缘化)
  - [10. 范畴论语义：RPC 作为远程态射](#8-范畴论语义rpc-作为远程态射)
  - [11. 对称差分析：REST vs RPC vs GraphQL](#9-对称差分析rest-vs-rpc-vs-graphql)
  - [12. 工程决策矩阵](#10-工程决策矩阵)
  - [13. 反例与局限性](#11-反例与局限性)
    - [13.1 tRPC 的版本锁定反例](#111-trpc-的版本锁定反例)
    - [13.2 Protobuf 的 JSON 互操作陷阱](#112-protobuf-的-json-互操作陷阱)
    - [13.3 gRPC-Web 的双向流缺失](#113-grpc-web-的双向流缺失)
    - [13.4 RPC 的"本地调用幻觉"](#114-rpc-的本地调用幻觉)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：tRPC 路由类型提取器](#示例-1trpc-路由类型提取器)
    - [示例 2：Protobuf 兼容性检查器](#示例-2protobuf-兼容性检查器)
    - [示例 3：JSON-RPC 2.0 客户端](#示例-3json-rpc-20-客户端)
    - [示例 4：RPC 批处理调度器](#示例-4rpc-批处理调度器)
    - [示例 5：Schema 演化版本适配器](#示例-5schema-演化版本适配器)
    - [示例 6：RPC 调用性能分析器](#示例-6rpc-调用性能分析器)
  - [参考文献](#参考文献)

---

## 1. 类型安全 RPC 的设计哲学

### 1.1 从 REST 到 RPC 的范式迁移

REST（Representational State Transfer）的设计核心是**资源**（Resource）和**统一接口**（GET/POST/PUT/DELETE）。
然而，在复杂的业务系统中，REST 的 CRUD 语义往往无法自然表达操作：

```
POST /orders/123/cancel    // 不是创建资源
POST /carts/merge          // 不是标准 CRUD
POST /users/123/deactivate // 部分更新，但 PATCH 语义模糊
```

**RPC（Remote Procedure Call）** 将网络通信建模为**过程调用**（Procedure Call），更贴近开发者的心智模型：

```typescript
const result = await api.orders.cancel({ orderId: "123" });
const merged = await api.carts.merge({ sourceCartId: "a", targetCartId: "b" });
```

**类型安全 RPC 的额外承诺**：客户端调用的类型签名与服务器实现保持**编译时同步**，避免运行时的 schema 不匹配。

### 1.2 类型安全的三层保证

**Level 1 — 请求/响应类型共享**：

- 使用共享的 TypeScript 类型定义请求体和响应体
- 运行时仍需序列化/反序列化，类型只在编译时检查

**Level 2 — 路由级类型推断**：

- 路由器定义中嵌入类型，客户端根据路由自动推断参数和返回类型
- tRPC 和 Connect 属于这一层

**Level 3 — 编译时契约验证**：

- 构建流程中验证客户端生成的代码是否与服务器 schema 兼容
- gRPC 的 protoc 编译属于这一层

---

## 2. tRPC：端到端类型安全

### 2.1 架构核心

tRPC 的设计理念是**"不要分割你的类型系统"**：前后端共享同一个 TypeScript 类型定义，通过类型推断自动同步 API 契约。

**tRPC v11** 于 2026 年 3 月正式发布，带来两大核心升级：

- **TanStack Query v5 深度集成**：官方 `@trpc/tanstack-react-query` 包实现 query/mutation/infiniteQuery 的全面类型同步，缓存策略与失效逻辑原生互通
- **原生 React Server Components（RSC）支持**：通过 `createTRPCReact` 的 RSC 适配层，Server Component 可直接调用 tRPC 路由而无需客户端 JavaScript 开销

**服务端定义**：

```typescript
const appRouter = router({
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return db.user.findById(input.id); // 返回类型自动推断
      }),
  }),
});

type AppRouter = typeof appRouter; // 导出类型给客户端
```

**客户端调用**：

```typescript
const trpc = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url: '/api/trpc' })] });
const user = await trpc.user.getById.query({ id: "123" }); // 完全类型安全
```

### 2.2 传输协议与批处理

tRPC v11（2026-03 发布）默认使用 **HTTP/1.1 JSON**，但支持多种传输层，并深度集成了 TanStack Query v5：

**HTTP Batch Link**：

- 在单个 tick 内收集多个查询，合并为一个 HTTP 请求
- 减少网络往返，但增加了首字节延迟（TTFB）
- 批处理窗口默认 0ms（即同步收集同一事件循环内的调用）

**HTTP Streaming Link**：

- 使用 HTTP/2 或 HTTP/3 的多路复用，支持服务器推送
- 适合订阅（Subscription）场景

**WebSocket Link**：

- 全双工通信，支持真正的实时订阅
- 增加了连接管理复杂度（心跳、重连）

### 2.3 中间件与上下文

tRPC 的中间件系统类似于 Express/Koa：

```typescript
const authedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

**上下文传递**：

- 服务端中间件可以向后续解析器注入数据（如用户对象、数据库连接）
- 类型系统会自动将注入的数据合并到上下文中

---

## 5. Hono RPC：Edge 场景下的零开销 RPC

### 5.1 `hc` 类型安全客户端

Hono RPC 是 Hono 框架的配套类型安全客户端，通过 `hc`（Hono Client）实现端到端类型推断。

**核心特性**：

- **零运行时开销**：`hc` 客户端仅在编译时提供类型，运行时是普通 `fetch` 调用
- **Edge Runtime 原生**：在 Cloudflare Workers、Deno Deploy、Vercel Edge 等环境中无额外依赖
- **轻量高效**：Hono 生态目前达到 **2.8M 周下载量**，是构建轻量级 Edge API 的首选

**服务端定义**：

```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/api/user/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: 'Alice' });
  })
  .post('/api/order', async (c) => {
    const body = await c.req.json<{ item: string; qty: number }>();
    return c.json({ orderId: crypto.randomUUID(), ...body });
  });

export type AppType = typeof app;
```

**客户端调用**：

```typescript
import { hc } from 'hono/client';

const client = hc<AppType>('http://localhost:8787');

// 完全类型安全：URL 参数、请求体、响应体均自动推断
const user = await client.api.user[':id'].$get({ param: { id: '123' } });
const order = await client.api.order.$post({ json: { item: 'book', qty: 2 } });
```

### 5.2 与 tRPC 的差异化定位

| 维度 | tRPC v11 | Hono RPC |
|------|---------|----------|
| 运行时开销 | 需要 tRPC 运行时（序列化、链路） | 零运行时，纯 `fetch` |
| 类型推断层级 | 路由器级深度推断 | 路由级推断 |
| Edge 适配 | 良好（需配置 Link） | 原生零依赖 |
| 生态规模 | 大型全栈框架 | 2.8M 周下载，轻量专注 |
| 适用场景 | 复杂全栈 TypeScript 应用 | 轻量 Edge API、微服务网关 |

---

## 6. oRPC：OpenAPI 与类型安全的融合

### 6.1 中间件架构与多 Schema 支持

oRPC 是 2025–2026 年崛起的 RPC 新 challenger，设计目标是**同时提供端到端类型安全与自动 OpenAPI 文档生成**。

**核心特性**：

- **OpenAPI 3.1 自动生成**：无需手动维护 Swagger 文档，schema 变更自动同步
- **多验证库支持**：原生支持 Zod、Valibot、ArkType，不绑定单一 schema 库
- **中间件架构**：类似 tRPC 的 `.use()` 中间件链，支持上下文注入与权限校验
- **类型安全**：客户端通过类型导出实现编译时契约验证

### 6.2 代码示例与定位

```typescript
import { os } from '@orpc/server';
import { z } from 'zod';

const router = os.router({
  user: os.router({
    getById: os
      .input(z.object({ id: z.string() }))
      .output(z.object({ id: z.string(), name: z.string() }))
      .handler(({ input }) => ({ id: input.id, name: 'Alice' })),
  }),
});

// 自动生成 OpenAPI 3.1 文档
const openAPIDoc = generateOpenAPI(router, { version: '3.1.0' });
```

**与 tRPC 的对比**：

- **tRPC v11**：专注全栈 TypeScript 体验，TanStack Query 深度集成，React Server Components 原生支持
- **oRPC**：当你**既需要类型安全又需要 OpenAPI 文档**时的最佳选择，适合对外暴露 API 的场景

---

## 7. Connect RPC：Protobuf 与 HTTP/2 的融合

### 5.1 Connect 的三协议支持

Connect RPC（当前稳定版 2.1.1，2026）是一个同时支持三种传输协议的框架：

**Connect Protocol**：

- 基于 HTTP/2 或 HTTP/3
- 使用标准的 `Content-Type: application/json` 或 `application/proto`
- 支持一元调用和流式调用（Server Streaming、Client Streaming、Bidirectional Streaming）
- 浏览器原生可用（无需 gRPC-Web 代理）

**gRPC Protocol**：

- 完全兼容标准 gRPC（HTTP/2 + protobuf）
- 服务端可同时处理 Connect 客户端和 gRPC 客户端

**gRPC-Web Protocol**：

- 兼容现有 gRPC-Web 客户端
- 通过 Envoy 或 Connect 自己的兼容层支持

### 5.2 Protobuf 与 TypeScript 的绑定

Connect 使用 `protoc-gen-connect-es` 生成 TypeScript 代码：

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
}
```

生成的 TypeScript 代码包含：

- 消息类型的 TypeScript 接口（使用 `protobuf-es`）
- 服务接口（客户端存根和服务端处理器）
- JSON 序列化/反序列化代码（支持 proto3 的 JSON 映射规范）

**与 tRPC 的关键差异**：

- tRPC 使用 TypeScript 原生类型 + Zod 进行运行时验证
- Connect 使用 Protobuf schema，类型定义在 `.proto` 文件中，多语言共享

---

## 6. gRPC-Web：从数据中心到浏览器

### 6.1 gRPC-Web 的代理需求

原生 gRPC 依赖 HTTP/2 的特性（如 trailers、流控制、二进制 framing），这些在浏览器环境中受限：

- 浏览器无法直接发送 HTTP/2 trailers（Fetch API 不支持）
- 浏览器无法直接控制 HTTP/2 流的优先级

**gRPC-Web 的解决方案**：

- 使用 `application/grpc-web` Content-Type
- 将 gRPC 的 trailers 编码到消息体的最后一段
- 需要**代理层**（Envoy、grpcwebproxy 或 Connect）将 gRPC-Web 翻译为标准 gRPC

### 6.2 流式调用的限制

gRPC-Web 支持三种调用类型：

- **Unary**：完整支持
- **Server Streaming**：完整支持（通过 HTTP/2 的响应流）
- **Client Streaming / Bidirectional Streaming**：**不支持**（浏览器 Fetch API 限制）

这意味着某些 gRPC 服务（如文件上传、实时双向通信）无法直接通过 gRPC-Web 暴露给浏览器。

---

## 7. JSON-RPC 2.0：轻量级替代方案

### 7.1 协议语义

JSON-RPC 2.0 是一个极简的 RPC 协议：

```json
// 请求
{"jsonrpc": "2.0", "method": "user.getById", "params": {"id": "123"}, "id": 1}

// 响应
{"jsonrpc": "2.0", "result": {"id": "123", "name": "Alice"}, "id": 1}
```

**关键特性**：

- **通知（Notification）**：无 `id` 字段的请求，不期望响应（如日志上报）
- **批量调用（Batch）**：数组形式的请求，原子执行
- **错误编码**：标准化的错误码（-32700 解析错误、-32600 无效请求等）

### 7.2 与 tRPC/Connect 的对比

JSON-RPC 2.0 不提供原生类型安全，但优势在于：

- **极轻量**：无代码生成，无 schema 文件
- **通用性**：任何支持 JSON 的客户端/服务器都可以互操作
- **调试友好**：curl 可直接调用

**类型安全的补充**：

- 使用 JSON Schema 或 TypeScript 类型守卫手动添加类型检查
- 或使用 `jsonrpc-lite` + `zod` 进行运行时验证

---

## 8. Schema 演化与版本兼容性

### 8.1 Protobuf 的向后兼容性规则

Protobuf 设计了一套严格的 schema 演化规则：

**安全变更**：

- 添加新字段（使用新的字段编号）
- 将字段标记为 `optional`（proto3 中所有字段默认 optional）
- 将单数字段改为 `repeated`（二进制兼容，JSON 不兼容）
- 添加 `reserved` 标记回收旧字段编号

**破坏性变更**：

- 修改现有字段的编号
- 修改字段类型（如 `int32` → `string`）
- 删除字段（除非所有客户端已升级）

### 8.2 TypeScript 类型的演化挑战

tRPC 不使用显式 schema 文件，演化依赖于 TypeScript 的类型系统：

**安全模式**：

- 在输入解析器中使用 `.optional()` 或 `.default()`
- 使用联合类型扩展返回值（`{ oldField: string } | { oldField: string; newField: number }`）

**风险模式**：

- 直接修改 `z.object()` 的形状，导致旧客户端编译失败
- 删除路由处理程序（旧客户端在类型检查时即报错）

**最佳实践**：

- 使用 API 版本前缀（`api.v1.user.get` → `api.v2.user.get`）
- 在 Zod schema 中使用 `.transform()` 和 `.pipe()` 进行向后兼容的数据转换

---

## 9. Edge 场景下的 RPC 优化

### 9.1 Edge 函数的 RPC 调用模式

在 Edge Runtime 中，RPC 调用面临特殊约束：

- **CPU 时间限制**：Cloudflare Workers 50ms/10ms，不适合复杂序列化
- **无 Node.js 模块**：不能直接使用 `@grpc/grpc-js`（依赖原生模块）
- **HTTP/2 支持有限**：部分 Edge Runtime 仅支持 HTTP/1.1 fetch

**优化策略**：

- 使用 Connect Protocol 的 JSON 模式（无需 protobuf 编译器，纯 TypeScript）
- 启用 tRPC 的 HTTP Batch Link，减少请求数
- 对高频调用使用 Edge Config 或 KV 缓存响应
- 在 Cloudflare Workers / Deno 等边缘环境优先选择 **Hono RPC**（`hc` 客户端），零运行时开销

### 9.3 Hono RPC：边缘原生的类型安全客户端

**Hono** 是一个轻量级的 Web 框架，专为 Edge Runtime 设计。其 `hc`（Hono Client）提供了类型安全的 RPC 能力，在边缘环境中具有独特优势：

```typescript
import { Hono } from 'hono';
import { hc } from 'hono/client';

// 服务端
const app = new Hono()
  .get('/api/user/:id', (c) => c.json({ id: c.req.param('id'), name: 'Alice' }));

// 客户端（类型安全）
const client = hc<typeof app>('https://api.example.com');
const res = await client.api.user[':id'].$get({ param: { id: '123' } });
const data = await res.json(); // { id: string; name: string }
```

**边缘优势**：

- **零开销**：`hc` 是纯类型层，编译后无额外运行时代码，bundle 大小接近零；
- **全边缘平台支持**：原生支持 Cloudflare Workers、Deno Deploy、Vercel Edge、Bun；
- **周下载量 2.8M+**（2026），生态快速增长；
- **与 tRPC 的对比**：Hono RPC 更轻量，适合简单的 RESTful API；tRPC v11 更适合复杂的路由嵌套和中间件链。

### 9.4 oRPC：OpenAPI 优先的类型安全 RPC

**oRPC** 是 2026 年新兴的 RPC 框架，定位介于 tRPC 和 Connect 之间：

```typescript
import { oc } from '@orpc/server';
import { z } from 'zod';

const router = oc.router({
  user: oc.router({
    get: oc
      .input(z.object({ id: z.string() }))
      .output(z.object({ id: z.string(), name: z.string() }))
      .handler(({ input }) => ({ id: input.id, name: 'Alice' })),
  }),
});

// 自动生成 OpenAPI 3.1 文档
const openAPISpec = generateOpenAPI(router);
```

**核心特性**：

- **OpenAPI 3.1 原生输出**：自动生成标准 OpenAPI 文档，无需额外工具；
- **多 schema 支持**：Zod、Valibot、ArkType 均可作为输入/输出验证器；
- **中间件架构**：与 tRPC 类似的中间件系统，支持上下文注入和错误处理；
- **边缘友好**：无 Node.js 原生依赖，可在 Cloudflare Workers 和 Deno Deploy 直接运行。

**选型建议**：当你需要**类型安全** + **OpenAPI 文档** + **边缘部署**三者兼备时，oRPC 是比 tRPC + 第三方 OpenAPI 生成器更简洁的选择。

### 9.2 流式与订阅的边缘化

传统 WebSocket 订阅在 Edge 环境中有替代方案：

- **Server-Sent Events (SSE)**：通过 HTTP 流推送，无需 WebSocket 握手，兼容 Edge 函数
- **Long Polling**：fallback 方案，适用于不支持流的客户端
- **CRDT Sync**：将实时状态同步转化为定期 CRDT 合并操作，减少实时连接需求

---

## 10. 范畴论语义：RPC 作为远程态射

从范畴论视角，RPC 可以建模为**局部范畴**到**远程范畴**的**分布式函子**：

**客户端范畴 C_client**：

- 对象：本地数据类型（TypeScript interfaces）
- 态射：本地函数调用

**服务端范畴 C_server**：

- 对象：服务端数据类型（可能不同，如数据库实体）
- 态射：服务端处理函数

**RPC 函子 F: C_client → C_server**：

- 将客户端类型映射到服务端类型（通过序列化/反序列化）
- 将客户端函数调用映射到网络请求（通过 HTTP/WebSocket）

**函子的保持性质**：

- **对象映射**：类型安全 RPC 要求 F 是**忠实函子**（Faithful Functor），即不同的客户端类型映射到不同的服务端类型
- **态射复合**：客户端的 `f ∘ g` 应映射到服务端的 `F(f) ∘ F(g)`。但网络延迟破坏了这种同步性，RPC 实际上是**伪函子**（Pseudofunctor），复合只在异步意义上保持

---

## 11. 对称差分析：REST vs RPC vs GraphQL

| 维度 | REST | RPC (tRPC/Connect) | GraphQL |
|------|------|-------------------|---------|
| 核心抽象 | 资源（URL） | 过程/操作 | 图查询 |
| 类型安全 | 无（OpenAPI 可补充） | 编译时类型安全 | Schema 类型安全 |
| 版本控制 | URL 版本（/v1/） | Schema 演化/路由版本 | Schema 演化（弃用字段） |
| 批量获取 | 多次 HTTP 请求 | Batch Link 合并 | 单次查询嵌套获取 |
| 实时更新 | WebSocket/SSE 手动实现 | Subscription 原生支持 | Subscription 支持 |
| 缓存策略 | HTTP Cache 成熟 | 需自定义缓存键 | 需 Apollo/Relay 缓存 |
| 浏览器兼容 | 完美 | gRPC-Web 需代理 | 完美 |
| Edge 运行 | 完美 | Connect Protocol 完美 | 需查询解析，CPU 消耗大 |
| 学习曲线 | 低 | 中（需理解路由器） | 高（需理解 Schema/Resolver）|

---

## 12. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 全栈 TypeScript 单体应用 | tRPC v11 | 端到端类型安全，TanStack Query v5 深度集成，RSC 原生支持 | 与外部系统（非 TS）集成困难 |
| 多语言微服务 | Connect + Protobuf | Protobuf 跨语言，gRPC/Connect/Web 三协议兼容 | 需要 .proto 文件管理流程 |
| 浏览器直接调用数据中心 gRPC | gRPC-Web + Envoy | 利用现有 gRPC 服务 | 仅支持 Unary + Server Streaming |
| 极简 IoT/嵌入式客户端 | JSON-RPC 2.0 | 极轻量，无代码生成 | 无原生类型安全，需手动校验 |
| Edge 函数间通信 | Hono RPC (`hc`) | 零运行时开销，全边缘平台原生支持 | 功能较简单，无复杂中间件链 |
| 实时协作应用 | tRPC v11 Subscriptions / SSE | 内置订阅支持，类型安全 | WebSocket 在 Edge 环境受限 |
| 第三方 API 暴露 | oRPC / REST + OpenAPI | 类型安全 + 自动 OpenAPI 3.1 输出 | 新兴框架，社区资源较少 |
| 复杂数据图查询 | GraphQL | 客户端控制返回字段，减少 over-fetch | 服务器解析开销大，缓存复杂 |

---

## 13. 反例与局限性

### 13.1 tRPC 的版本锁定反例

某团队使用 tRPC 构建内部 API，半年后需要拆分单体为微服务：

- tRPC 的路由类型深度耦合在 monorepo 中
- 拆分时发现无法优雅地跨仓库共享类型（除非发布 npm 包或使用 git submodule）
- 迁移到 Connect + Protobuf 花费了一个月

**教训**：tRPC 最适合**单体全栈 TS 项目**，跨服务边界时 Protobuf 更稳定。

### 13.2 Protobuf 的 JSON 互操作陷阱

Protobuf 的 proto3 定义了 JSON 映射规范，但并非所有类型都能无损转换：

- `int64` 在 JSON 中可能丢失精度（JavaScript 的 `number` 最大安全整数为 2^53-1）
- `bytes` 在 JSON 中编码为 base64，增加 33% 体积
- 字段名在 JSON 中使用 camelCase，但 protobuf 使用 snake_case，需要显式配置

### 13.3 gRPC-Web 的双向流缺失

某实时游戏尝试用 gRPC-Web 实现客户端输入流：

- 发现 gRPC-Web 不支持 Client Streaming
- 被迫降级为 WebSocket + 自定义协议，丧失了类型安全

**教训**：浏览器端的 gRPC-Web 有硬性限制，设计前需确认调用类型兼容性。

### 13.4 RPC 的"本地调用幻觉"

RPC 的最大陷阱是让开发者忘记**网络边界**的存在：

- 本地调用耗时 < 1μs，RPC 调用耗时 > 10ms（跨地域 > 100ms）
- 在循环中调用 RPC 会导致性能灾难（N+1 问题）
- 异常处理复杂：网络超时、部分失败、重试风暴

**缓解**：使用 DataLoader 模式批量获取、断路器（Circuit Breaker）防止级联故障、显式超时配置。

---

## TypeScript 代码示例

### 示例 1：tRPC v11 路由类型提取器

```typescript
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  user: t.router({
    getById: t.procedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val) return val as { id: string };
        throw new Error('Invalid input');
      })
      .query(({ input }) => ({ id: input.id, name: 'Alice' })),
  }),
});

type AppRouter = typeof appRouter;

class TRPCClient<T> {
  async query<K extends string>(path: K, input: any): Promise<any> {
    const response = await fetch(`/api/trpc/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: input }),
    });
    const result = await response.json();
    return result.result.data;
  }
}
```

### 示例 2：Protobuf 兼容性检查器

```typescript
interface ProtoField {
  number: number;
  name: string;
  type: string;
}

interface ProtoMessage {
  name: string;
  fields: ProtoField[];
}

class ProtoCompatibilityChecker {
  check(oldMsg: ProtoMessage, newMsg: ProtoMessage): string[] {
    const issues: string[] = [];
    const oldFields = new Map(oldMsg.fields.map(f => [f.number, f]));
    const newFields = new Map(newMsg.fields.map(f => [f.number, f]));

    for (const [num, field] of oldFields) {
      if (!newFields.has(num)) issues.push(`Field ${field.name} (#${num}) deleted`);
    }

    for (const [num, newField] of newFields) {
      const oldField = oldFields.get(num);
      if (oldField && oldField.type !== newField.type) {
        issues.push(`Field ${newField.name} (#${num}) changed type`);
      }
    }

    return issues;
  }
}
```

### 示例 3：JSON-RPC 2.0 客户端

```typescript
interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: string | number | null;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: { code: number; message: string };
  id: string | number | null;
}

class JSONRPCClient {
  private idCounter = 0;
  constructor(private endpoint: string) {}

  async call<T>(method: string, params?: unknown): Promise<T> {
    const id = ++this.idCounter;
    const request: JSONRPCRequest = { jsonrpc: '2.0', method, params, id };
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data: JSONRPCResponse = await response.json();
    if (data.error) throw new Error(`JSON-RPC Error ${data.error.code}: ${data.error.message}`);
    return data.result as T;
  }
}
```

### 示例 4：RPC 批处理调度器

```typescript
interface PendingCall {
  method: string;
  params: unknown;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

class RPCBatcher {
  private queue: PendingCall[] = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private endpoint: string) {}

  call(method: string, params: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({ method, params, resolve, reject });
      if (!this.timeout) this.timeout = setTimeout(() => this.flush(), 10);
    });
  }

  private async flush() {
    this.timeout = null;
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0);
    const payload = batch.map((call, index) => ({
      jsonrpc: '2.0', method: call.method, params: call.params, id: index,
    }));

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const results = await response.json();
      for (const result of Array.isArray(results) ? results : [results]) {
        const call = batch[result.id];
        if (result.error) call.reject(new Error(result.error.message));
        else call.resolve(result.result);
      }
    } catch (err) {
      batch.forEach(call => call.reject(err as Error));
    }
  }
}
```

### 示例 5：Schema 演化版本适配器

```typescript
interface VersionedSchema {
  version: number;
  migrate(data: unknown): unknown;
}

class SchemaEvolutionAdapter {
  private schemas = new Map<number, VersionedSchema>();
  private currentVersion = 0;

  register(schema: VersionedSchema) {
    this.schemas.set(schema.version, schema);
    this.currentVersion = Math.max(this.currentVersion, schema.version);
  }

  adapt(data: unknown, fromVersion: number): unknown {
    let current = data;
    for (let v = fromVersion; v < this.currentVersion; v++) {
      const schema = this.schemas.get(v + 1);
      if (schema) current = schema.migrate(current);
    }
    return current;
  }
}
```

### 示例 6：RPC 调用性能分析器

```typescript
interface RPCMetrics {
  method: string;
  latency: number;
  success: boolean;
  retryCount: number;
}

class RPCProfiler {
  private metrics: RPCMetrics[] = [];

  async profile<T>(method: string, operation: () => Promise<T>, options: { retries?: number; timeout?: number } = {}): Promise<T> {
    const start = performance.now();
    let retries = 0;
    const maxRetries = options.retries ?? 3;

    while (true) {
      try {
        const result = await Promise.race([
          operation(),
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), options.timeout ?? 5000)),
        ]);
        this.metrics.push({ method, latency: performance.now() - start, success: true, retryCount: retries });
        return result;
      } catch (error) {
        if (++retries > maxRetries) {
          this.metrics.push({ method, latency: performance.now() - start, success: false, retryCount: retries });
          throw error;
        }
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 100));
      }
    }
  }

  getReport(): Record<string, { avgLatency: number; errorRate: number }> {
    const result: Record<string, any> = {};
    for (const m of this.metrics) {
      if (!result[m.method]) result[m.method] = { latencies: [], errors: 0, total: 0 };
      result[m.method].latencies.push(m.latency);
      if (!m.success) result[m.method].errors++;
      result[m.method].total++;
    }
    const report: Record<string, any> = {};
    for (const [method, data] of Object.entries(result)) {
      report[method] = {
        avgLatency: data.latencies.reduce((a: number, b: number) => a + b, 0) / data.latencies.length,
        errorRate: data.errors / data.total,
      };
    }
    return report;
  }
}
```

---

## 参考文献

1. tRPC. *Documentation.* <https://trpc.io/docs>
2. Connect RPC. *Protocol Documentation.* <https://connectrpc.com/docs>
3. Google. *gRPC-Web.* <https://github.com/grpc/grpc-web>
4. JSON-RPC Working Group. *JSON-RPC 2.0 Specification.* <https://www.jsonrpc.org/specification>
5. Fielding, R. *Architectural Styles and the Design of Network-based Software Architectures.* PhD Dissertation, 2000.
6. GraphQL Foundation. *GraphQL Specification.* <https://spec.graphql.org/>
7. Protobuf Team. *Protocol Buffers Version 3 Language Specification.* <https://protobuf.dev/>
8. Vercel. *tRPC on Vercel Edge Runtime.* <https://vercel.com/docs/concepts/functions/edge-functions>
9. Connect RPC. *Edge Support and WinterCG Compliance.* <https://connectrpc.com/docs/web/getting-started/>
10. Google. *API Design Guide.* <https://cloud.google.com/apis/design>
