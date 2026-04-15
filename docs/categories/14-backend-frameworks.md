# 后端框架生态 (Backend Frameworks)

> 本文档梳理 Node.js 及现代 JavaScript 运行时后端框架，数据参考自 GitHub Stars、JavaScript Rising Stars 2024/2025 及 npm 下载趋势

---

## 📊 生态概览

| 框架 | Stars | 趋势 | 定位 |
|------|-------|------|------|
| Express | 67k+ | ⭐ 标准稳定 | Web框架标准 |
| Fastify | 31k+ | ⭐ 性能优先 | 极速低开销框架 |
| Nest | 65k+ | ⭐ 企业级 | 企业级全栈框架 |
| Koa | 35k+ | ⭐ 经典稳定 | 下一代Web框架 |
| Hono | 28k+ | 🚀 快速崛起 | 边缘优先框架 |
| tRPC | 35k+ | ⭐ 类型安全 | 端到端类型安全RPC |
| Socket.io | 61k+ | ⭐ 实时通信 | 实时通信标准 |
| hapi | 14k+ | ⭐ 成熟稳定 | 企业级框架 |
| Elysia | 19k+ | 🚀 新兴热门 | Bun优先框架 |

---

## 1. Node.js 传统框架

### Express

| 属性 | 详情 |
|------|------|
| **名称** | Express |
| **Stars** | ⭐ 67,000+ |
| **TS支持** | ⚠️ 需 @types/express |
| **GitHub** | [expressjs/express](https://github.com/expressjs/express) |
| **官网** | [expressjs.com](https://expressjs.com) |
| **npm** | 每周下载 2500万+ |

**一句话描述**：Node.js Web 框架的事实标准，极简、灵活、生态最丰富。

**核心特点**：

- 极简核心，中间件机制成熟
- 庞大的生态系统，中间件数量最多
- 学习曲线平缓，文档丰富
- 2024年发布 v5.0，2025年 v5.1.0 持续维护
- 加入 OpenJS Foundation，治理结构完善

**适用场景**：

- 中小型 Web 应用和 API
- 需要丰富中间件生态的项目
- 快速原型开发
- 遗留项目维护

---

### Fastify

| 属性 | 详情 |
|------|------|
| **名称** | Fastify |
| **Stars** | ⭐ 31,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [fastify/fastify](https://github.com/fastify/fastify) |
| **官网** | [fastify.io](https://fastify.io) |
| **npm** | 每月下载 780万+ |

**一句话描述**：专注于性能和企业级开发者体验的低开销 Web 框架。

**核心特点**：

- 极高性能：每秒可处理 7.6万+ 请求（比 Express 快 5倍）
- JSON Schema 验证：内置高性能验证和序列化
- 强大的插件架构：解耦的插件系统
- 内置日志：集成 Pino 日志库
- TypeScript 原生支持
- 2024年9月发布 v5.0

**适用场景**：

- 高性能 API 服务
- 微服务架构
- 对延迟敏感的应用
- 需要类型安全的大型项目

---

### NestJS

| 属性 | 详情 |
|------|------|
| **名称** | NestJS |
| **Stars** | ⭐ 65,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [nestjs/nest](https://github.com/nestjs/nest) |
| **官网** | [nestjs.com](https://nestjs.com) |
| **npm** | 每月下载 500万+ |

**一句话描述**：企业级 Node.js 框架，受 Angular 启发，提供完整的架构解决方案。

**核心特点**：

- 模块化架构：依赖注入、装饰器模式
- 完整的生态：支持 GraphQL、WebSocket、Microservices
- 开箱即用的企业级功能：认证、授权、配置、日志
- 支持多种 HTTP 框架：Express 或 Fastify 作为底层
- 优秀的测试支持

**适用场景**：

- 大型企业级后端应用
- 微服务架构
- 需要严格架构规范的项目
- 团队协作开发

---

### Koa

| 属性 | 详情 |
|------|------|
| **名称** | Koa |
| **Stars** | ⭐ 35,000+ |
| **TS支持** | ⚠️ 需 @types/koa |
| **GitHub** | [koajs/koa](https://github.com/koajs/koa) |
| **官网** | [koajs.com](https://koajs.com) |

**一句话描述**：Express 团队打造的下一代 Web 框架，基于 async/await。

**核心特点**：

- 更小的内核，更强大的表现力
- 中间件基于 async/await，告别回调地狱
- 没有内置中间件，极度灵活
- 轻量级，核心代码约 2000 行

**适用场景**：

- 需要精细控制中间件的项目
- 异步流程复杂的应用
- 轻量级 API 服务

---

### hapi

| 属性 | 详情 |
|------|------|
| **名称** | hapi |
| **Stars** | ⭐ 14,000+ |
| **TS支持** | ✅ 社区类型定义 |
| **GitHub** | [hapijs/hapi](https://github.com/hapijs/hapi) |
| **官网** | [hapi.dev](https://hapi.dev) |

**一句话描述**：企业级应用框架，强调配置优于编码，提供完整的业务逻辑分离。

**核心特点**：

- 配置驱动的开发模式
- 内置输入验证（Joi）
- 强大的插件系统
- 完善的错误处理
- 适合大型团队协作

**适用场景**：

- 大型企业级应用
- 需要严格输入验证的 API
- 团队协作项目

---

### Restify

| 属性 | 详情 |
|------|------|
| **名称** | restify |
| **Stars** | ⭐ 11,000+ |
| **TS支持** | ⚠️ 需 @types/restify |
| **GitHub** | [restify/node-restify](https://github.com/restify/node-restify) |
| **官网** | [restify.com](http://restify.com) |

**一句话描述**：专为构建语义正确的 RESTful Web 服务而优化的框架。

**核心特点**：

- DTrace 内置支持（性能追踪）
- 语义版本化路由
- 内容协商和格式化
- 专注于 REST API 构建

**适用场景**：

- 严格的 RESTful API 服务
- 需要 DTrace 监控的生产环境
- JSON API 服务

---

### micro

| 属性 | 详情 |
|------|------|
| **名称** | micro |
| **Stars** | ⭐ 10,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [vercel/micro](https://github.com/vercel/micro) |

**一句话描述**：异步 HTTP 微服务框架，Vercel 出品，极简设计。

**核心特点**：

- 单文件微服务
- 自动解析 JSON 请求/响应
- 内置错误处理
- 专为 Serverless 优化

**适用场景**：

- 微服务架构
- Serverless 函数
- 轻量级 HTTP 服务

---

## 2. 新兴运行时框架

### Hono

| 属性 | 详情 |
|------|------|
| **名称** | Hono |
| **Stars** | ⭐ 28,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [honojs/hono](https://github.com/honojs/hono) |
| **官网** | [hono.dev](https://hono.dev) |

**一句话描述**：基于 Web 标准的极速、轻量 Web 框架，可运行在任何 JavaScript 运行时。

**核心特点**：

- 边缘优先：支持 Cloudflare Workers、Deno、Bun、Node.js
- 基于 Fetch API 和 Web 标准
- 极小的包体积（~14KB）
- 与 Express 类似的 API 设计
- 内置中间件生态（CORS、缓存、验证等）
- JavaScript Rising Stars 2025 增长最快框架之一

**适用场景**：

- 边缘计算和 Serverless
- Cloudflare Workers 开发
- 跨平台部署需求
- 追求极致性能的新项目

---

### Elysia

| 属性 | 详情 |
|------|------|
| **名称** | Elysia |
| **Stars** | ⭐ 19,000+ |
| **TS支持** | ✅ 原生支持，类型推断出色 |
| **GitHub** | [elysiajs/elysia](https://github.com/elysiajs/elysia) |
| **官网** | [elysiajs.com](https://elysiajs.com) |

**一句话描述**：以 Bun 为首选运行时的 TypeScript 框架，追求人体工程学和性能。

**核心特点**：

- Bun 优先优化，性能出色
- 流式接口（Fluent API）设计
- 静态代码分析优化（Sucrose）
- 端到端类型安全
- 类似 Fastify 的插件系统
- 2024年3月发布 v1.0 稳定版

**适用场景**：

- Bun 运行时项目
- 追求极致性能的应用
- 需要强类型约束的项目

---

### Nitro

| 属性 | 详情 |
|------|------|
| **名称** | Nitro |
| **Stars** | ⭐ 5,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [unjs/nitro](https://github.com/unjs/nitro) |
| **文档** | [nitro.unjs.io](https://nitro.unjs.io) |

**一句话描述**：通用的服务端引擎，Nuxt 3 的底层核心，支持多种部署目标。

**核心特点**：

- 基于 H3（HTTP 框架）构建
- 文件系统路由
- 多平台部署：Node.js、Deno、Cloudflare Workers、Vercel 等
- 自动代码分割
- 存储抽象层（Key-Value、FS 等）
- 属于 UnJS 生态

**适用场景**：

- Nuxt 3 服务端开发
- 需要多平台部署的服务端应用
- 全栈框架构建

---

## 3. 全栈/元框架

### Next.js API Routes

| 属性 | 详情 |
|------|------|
| **名称** | Next.js |
| **Stars** | ⭐ 137,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [vercel/next.js](https://github.com/vercel/next.js) |
| **官网** | [nextjs.org](https://nextjs.org) |

**一句话描述**：React 全栈框架，提供 Pages Router 和 App Router 两种 API 路由方案。

**核心特点**：

- Pages Router：传统 `/pages/api` 路由
- App Router：基于 React Server Components 的 Route Handlers
- 边缘运行时支持
- 内置 API 中间件
- 与前端深度集成

**适用场景**：

- 全栈 React 应用
- 需要前后端同构的项目
- 边缘部署需求

---

### Nuxt Server

| 属性 | 详情 |
|------|------|
| **名称** | Nuxt |
| **Stars** | ⭐ 55,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| **官网** | [nuxt.com](https://nuxt.com) |

**一句话描述**：Vue 全栈框架，基于 Nitro 引擎提供服务端能力。

**核心特点**：

- Server API：`~/server/api` 自动路由
- Server Middleware：请求拦截处理
- Server Utils：工具函数集合
- 与 Nitro 深度集成
- 支持多种渲染模式

**适用场景**：

- 全栈 Vue 应用
- 需要服务端渲染的项目

---

### SvelteKit

| 属性 | 详情 |
|------|------|
| **名称** | SvelteKit |
| **Stars** | ⭐ 18,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [sveltejs/kit](https://github.com/sveltejs/kit) |
| **官网** | [kit.svelte.dev](https://kit.svelte.dev) |

**一句话描述**：Svelte 的官方全栈框架，提供服务端路由和数据获取。

**核心特点**：

- 文件系统路由 + `+server.js` 端点
- 表单 actions 和渐进增强
- 多种适配器：Node、Vercel、Netlify、Cloudflare 等
- 基于 Web 标准的 Request/Response

**适用场景**：

- 全栈 Svelte 应用
- 边缘部署

---

## 4. 实时/通信框架

### Socket.io

| 属性 | 详情 |
|------|------|
| **名称** | Socket.io |
| **Stars** | ⭐ 61,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [socketio/socket.io](https://github.com/socketio/socket.io) |
| **官网** | [socket.io](https://socket.io) |

**一句话描述**：实时双向通信库的标准，支持 WebSocket 和长轮询自动降级。

**核心特点**：

- 自动传输降级（WebSocket → 长轮询）
- 房间（Room）和命名空间（Namespace）支持
- 自动重连和心跳检测
- 支持二进制数据
- 跨浏览器兼容
- 服务端和客户端配对使用

**适用场景**：

- 实时聊天应用
- 协作编辑工具
- 实时数据推送
- 游戏服务器

---

### ws

| 属性 | 详情 |
|------|------|
| **名称** | ws |
| **Stars** | ⭐ 22,000+ |
| **TS支持** | ⚠️ 需 @types/ws |
| **GitHub** | [websockets/ws](https://github.com/websockets/ws) |

**一句话描述**：Node.js 最快的 WebSocket 库，简洁高效。

**核心特点**：

- 纯 WebSocket 实现，无降级机制
- 极高的性能和低内存占用
- 简洁的 API
- 支持 permessage-deflate 压缩

**适用场景**：

- 纯 WebSocket 应用
- 对性能要求极高的场景
- 游戏和实时数据流

---

### uWebSockets.js

| 属性 | 详情 |
|------|------|
| **名称** | uWebSockets.js |
| **TS支持** | ⚠️ 社区类型定义 |
| **GitHub** | [uNetworking/uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) |

**一句话描述**：基于 C++ 的极速 WebSocket 和 HTTP 服务器实现。

**核心特点**：

- C++ 核心，Node.js 绑定
- 业界最快的 WebSocket 实现
- 支持 SSL/TLS
- Pub/Sub 内置支持

**适用场景**：

- 超高并发 WebSocket 服务
- 金融交易系统
- 高频实时数据

---

## 5. RPC 框架

### tRPC

| 属性 | 详情 |
|------|------|
| **名称** | tRPC |
| **Stars** | ⭐ 35,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [trpc/trpc](https://github.com/trpc/trpc) |
| **官网** | [trpc.io](https://trpc.io) |

**一句话描述**：端到端类型安全的 RPC 框架，让 API 调用像调用本地函数一样简单。

**核心特点**：

- 全自动类型推断，无需代码生成
- 与 Zod 等验证库完美集成
- 支持订阅（实时数据）
- 与 React Query、Svelte 等前端框架集成
- 中间件支持
- Batch 请求合并

**适用场景**：

- 全栈 TypeScript 项目
- 需要类型安全的 API
- 前后端紧密协作的团队

---

### trpc-openapi

| 属性 | 详情 |
|------|------|
| **名称** | trpc-openapi |
| **GitHub** | [jlalmes/trpc-openapi](https://github.com/jlalmes/trpc-openapi) |

**一句话描述**：为 tRPC 添加 OpenAPI/Swagger 支持，生成 REST API。

**核心特点**：

- 从 tRPC 路由生成 OpenAPI 规范
- 自动生成 Swagger UI
- 支持 RESTful 端点暴露

---

### @ts-rest/core

| 属性 | 详情 |
|------|------|
| **名称** | ts-rest |
| **GitHub** | [ts-rest/ts-rest](https://github.com/ts-rest/ts-rest) |
| **官网** | [ts-rest.com](https://ts-rest.com) |

**一句话描述**：基于 TypeScript 的契约优先 REST API 框架。

**核心特点**：

- 共享契约定义
- 支持多种服务端框架（Express、Fastify、Nest 等）
- 支持多种客户端（React Query、SWR、Axios 等）
- OpenAPI 生成

**适用场景**：

- 需要 REST API 但想要类型安全
- 跨团队 API 契约管理

---

## 📈 框架选型建议

### 按项目类型

| 项目类型 | 推荐框架 | 理由 |
|----------|----------|------|
| 传统 Web API | **Express** / **Fastify** | 生态丰富，团队熟悉度高 |
| 企业级后端 | **NestJS** | 架构规范，功能完整 |
| 高性能 API | **Fastify** / **Hono** | 性能优异，开销低 |
| 边缘/Serverless | **Hono** | 跨平台，边缘优化 |
| Bun 项目 | **Elysia** | Bun 原生优化 |
| 实时应用 | **Socket.io** / **ws** | 成熟的实时通信方案 |
| 全栈类型安全 | **tRPC** / **ts-rest** | 端到端类型安全 |

### 按团队背景

| 团队背景 | 推荐框架 |
|----------|----------|
| 有 Angular 经验 | NestJS |
| 追求极致性能 | Fastify、Hono、Elysia |
| 初创项目快速迭代 | Express、Hono |
| 大型企业项目 | NestJS、Fastify |

### 按部署目标

| 部署目标 | 推荐框架 |
|----------|----------|
| 传统服务器 | Express、Fastify、NestJS |
| Cloudflare Workers | Hono、Nitro |
| Vercel Edge | Hono、Next.js |
| Bun 运行时 | Elysia、Hono |
| Deno | Hono、Oak |

---

## 🔗 参考资源

- [Fastify 官方文档](https://fastify.io/)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Hono 官方文档](https://hono.dev/)
- [Elysia 官方文档](https://elysiajs.com/)
- [tRPC 官方文档](https://trpc.io/)
- [Socket.io 官方文档](https://socket.io/)
- [JavaScript Rising Stars 2025](https://risingstars.js.org/2025/en)
- [State of JS 2024](https://stateofjs.com)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据
