# 后端开发知识中枢

> **路径**: `30-knowledge-base/30.4-backend/`
> **定位**: JavaScript/TypeScript 后端开发领域的核心知识索引与导航中心。本目录汇聚服务端架构、API 设计、数据持久化、认证授权及部署运维等关键主题，为全栈与后端开发者提供体系化的参考入口。

---

## 目录

- [后端开发知识中枢](#后端开发知识中枢)
  - [目录](#目录)
  - [核心主题](#核心主题)
    - [1. 运行时与执行环境](#1-运行时与执行环境)
    - [2. API 设计与协议](#2-api-设计与协议)
    - [3. 数据库与 ORM](#3-数据库与-orm)
    - [4. 认证与授权](#4-认证与授权)
    - [5. Serverless 与边缘计算](#5-serverless-与边缘计算)
    - [6. 微服务与消息队列](#6-微服务与消息队列)
  - [相关资源](#相关资源)
  - [关联文档](#关联文档)

---

## 核心主题

### 1. 运行时与执行环境

JavaScript/TypeScript 后端生态在 2026 年已形成 **Node.js、Bun、Deno** 三足鼎立的格局：

- **Node.js v24+ LTS**：企业级首选，原生类型剥离、权限模型成熟，npm 生态最丰富。
- **Bun v1.2+**：极致性能，内置打包器、测试运行器和 SQLite/S3 客户端，适合高吞吐场景。
- **Deno v2.x**：安全沙箱内置、TypeScript 原生支持，适合边缘函数和敏感计算。

> 选型建议：主服务使用 Node.js 保证兼容性；性能瓶颈模块可试用 Bun；边缘/无服务器场景考虑 Deno Deploy。

### 2. API 设计与协议

现代后端 API 设计已从单一 REST 演进到多协议共存：

| 协议 | 适用场景 | 关键特性 |
|------|---------|---------|
| **REST** | 通用 CRUD、公开 API | 成熟、缓存友好、无状态 |
| **GraphQL** | 复杂数据关联、前端驱动查询 | 精确取数、强类型 Schema |
| **tRPC** | 全栈 TypeScript 项目 | 端到端类型安全、零代码生成 |
| **gRPC** | 微服务内部通信 | HTTP/2、Protobuf、流式传输 |
| **WebSocket** | 实时推送、双向通信 | 全双工、低延迟 |

### 3. 数据库与 ORM

后端数据层涵盖关系型、文档型、键值型和向量数据库。主流 ORM 与查询工具包括：

- **Prisma**：类型安全的声明式 ORM，迁移与可视化工具完善。
- **Drizzle ORM**：SQL 风格、轻量、性能优越，适合熟悉原生 SQL 的开发者。
- **TypeORM / Sequelize**：传统 ORM，功能全面，社区资料丰富。
- **Kysely / Knex.js**：类型安全/链式查询构建器，灵活性高。

### 4. 认证与授权

安全身份管理是后端开发的核心环节：

- **Session + Cookie**：传统服务端会话方案，适合同源 Web 应用。
- **JWT / JOSE**：无状态令牌，适合分布式与移动端场景；注意刷新机制与令牌撤销。
- **OAuth 2.0 / OpenID Connect**：第三方登录与单点登录标准协议。
- **RBAC / ABAC**：基于角色或属性的访问控制模型，NestJS、Fastify 均有成熟插件。

### 5. Serverless 与边缘计算

2026 年 Serverless 架构已深入生产环境：

- **Vercel Functions / Netlify Functions**：前端托管平台的配套无服务器函数。
- **AWS Lambda / Azure Functions / Cloudflare Workers**：主流云厂商的边缘计算方案。
- **Hono**：轻量边缘优先框架，支持 Cloudflare Workers、Deno、Bun、Node.js 多运行时。

### 6. 微服务与消息队列

- **框架**：NestJS 提供开箱即用的微服务支持（TCP、Redis、NATS、MQTT、RabbitMQ、gRPC）。
- **消息队列**：BullMQ（Redis 队列）、RabbitMQ、Apache Kafka、NATS Streaming。
- **服务发现与可观测性**：结合 Consul、Prometheus、OpenTelemetry 构建完整的微服务治理体系。

---

## 相关资源

- [backend-frameworks.md](../30.2-categories/backend-frameworks.md) — 主流后端框架选型对比矩阵
- [14-backend-frameworks.md](../30.2-categories/14-backend-frameworks.md) — 后端框架深度解析

---

## 关联文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库总览 | [../README.md](../README.md) | `30-knowledge-base` 根目录索引 |
| 生态全景 | [../../40-ecosystem/README.md](../../40-ecosystem/README.md) |  Awesome JS/TS 生态库导航 |
| 生态趋势 | [../../40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md](../../40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md) | 2026 年度 JS/TS 生态趋势报告 |
| 对比矩阵 | [../30.3-comparison-matrices/](../30.3-comparison-matrices/) | 框架与工具横向对比 |

---

*最后更新: 2026-04-29*
