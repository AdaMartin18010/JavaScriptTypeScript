# 网络编程知识中枢

> **路径**: `30-knowledge-base/30.5-networking/`
> **定位**: JavaScript/TypeScript 网络编程与通信协议的核心知识索引。本目录系统梳理现代 Web 通信的关键协议、技术栈及性能优化策略，覆盖从底层传输到高层应用协议的完整链路。

---

## 目录

- [网络编程知识中枢](#网络编程知识中枢)
  - [目录](#目录)
  - [核心主题](#核心主题)
    - [1. HTTP/2 与 HTTP/3](#1-http2-与-http3)
    - [2. WebSocket 实时通信](#2-websocket-实时通信)
    - [3. gRPC 高性能 RPC](#3-grpc-高性能-rpc)
    - [4. GraphQL 查询语言](#4-graphql-查询语言)
    - [5. CDN 与边缘加速](#5-cdn-与边缘加速)
    - [6. TCP/UDP 与底层网络](#6-tcpudp-与底层网络)
  - [性能优化要点](#性能优化要点)
  - [关联文档](#关联文档)

---

## 核心主题

### 1. HTTP/2 与 HTTP/3

HTTP 协议是现代 Web 的基石，2026 年 HTTP/3 已逐步进入主流生产环境：

- **HTTP/1.1**：持久连接与管道化，但受队头阻塞困扰；建议仅作为兼容 fallback。
- **HTTP/2**：二进制分帧、多路复用、头部压缩（HPACK）、服务器推送。Node.js 原生 `http2` 模块、Nginx 均支持。
- **HTTP/3**：基于 QUIC（UDP + TLS 1.3），彻底解决传输层队头阻塞，0-RTT 握手显著降低延迟。Cloudflare、Fastly 已全面支持。

> 在 Node.js 中可通过 `node:http2` 或 `undici` 客户端启用 HTTP/2；HTTP/3 支持仍在实验阶段，可借助 `node-quic` 或反向代理（如 Caddy、Nginx 1.25+）实现。

### 2. WebSocket 实时通信

WebSocket 提供全双工、低延迟的持久连接，是实时应用的首选：

- **原生 `ws` 库**：Node.js 最流行的 WebSocket 实现，轻量、稳定、API 简洁。
- **Socket.IO**：自动降级、房间广播、命名空间，适合需要复杂实时交互的场景。
- **µWebSockets.js**：基于 C++ 的高性能实现，吞吐量比 `ws` 高一个数量级。
- **Deno / Bun 内置**：现代运行时原生支持 WebSocket API，无需额外依赖。

应用场景：在线协作（文档、白板）、即时通讯、实时数据面板、游戏对战。

### 3. gRPC 高性能 RPC

gRPC 基于 HTTP/2 和 Protocol Buffers，专为服务间高性能通信设计：

- **四种通信模式**：Unary、Server Streaming、Client Streaming、Bidirectional Streaming。
- **TypeScript 支持**：`@grpc/grpc-js` + `@grpc/proto-loader` 为官方 Node.js 实现；`ts-proto` 可生成类型安全的客户端/服务端代码。
- **与 REST 对比**：gRPC 在内部微服务调用中延迟更低、契约更强；对外暴露 API 时建议配合 gRPC-Gateway 提供 REST 兼容层。

### 4. GraphQL 查询语言

GraphQL 让客户端精确获取所需数据，减少过度/不足取数：

- **Schema 优先**：使用 SDL（Schema Definition Language）定义类型系统， Apollo Server、GraphQL Yoga、Pothos 等工具支持 TypeScript 类型推导。
- **DataLoader**：解决 N+1 查询问题的批处理与去重库。
- **联邦架构（Apollo Federation）**：大型系统可按域拆分 GraphQL 服务，统一网关聚合。
- **与 tRPC 对比**：GraphQL 面向外部 API 和多种客户端；tRPC 更适合全栈 TypeScript 内部调用。

### 5. CDN 与边缘加速

内容分发网络是前端性能优化的基础设施：

- **边缘函数**：Cloudflare Workers、Vercel Edge Functions、AWS CloudFront Functions 允许在 CDN 节点运行轻量逻辑，实现边缘渲染、A/B 测试、地理围栏。
- **缓存策略**：Cache-Control、`stale-while-revalidate`、`s-maxage` 的合理配置可显著降低源站压力。
- **HTTP/3 + 0-RTT**：现代 CDN 已默认开启，静态资源加载延迟大幅降低。

### 6. TCP/UDP 与底层网络

- **Node.js `net` / `dgram` 模块**：构建自定义 TCP/UDP 服务器，适合物联网、游戏服务端、音视频传输。
- **QUIC 与 WebTransport**：WebTransport API 基于 QUIC，为浏览器提供类似 WebSocket 但更现代的传输层接口，支持可靠流、非可靠数据报和双向通信。

---

## 性能优化要点

| 优化手段 | 适用协议 | 效果 |
|---------|---------|------|
| 连接复用（Keep-Alive / Multiplexing） | HTTP/1.1、HTTP/2 | 减少 TCP/TLS 握手开销 |
| 头部压缩（HPACK / QPACK） | HTTP/2、HTTP/3 | 降低传输体积 |
| 边缘缓存 | CDN | 降低延迟与源站负载 |
| 二进制序列化（Protobuf / MessagePack） | gRPC、WebSocket | 减少 Payload 体积 |
| 连接预热与连接池 | 所有协议 | 降低请求延迟 |

---

## 关联文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库总览 | [../README.md](../README.md) | `30-knowledge-base` 根目录索引 |
| 后端知识中枢 | [../30.4-backend/README.md](../30.4-backend/README.md) | 服务端架构、API 设计、数据库 |
| 生态全景 | [../../40-ecosystem/README.md](../../40-ecosystem/README.md) | Awesome JS/TS 生态库导航 |
| 对比矩阵 | [../30.3-comparison-matrices/](../30.3-comparison-matrices/) | 框架与工具横向对比 |

---

*最后更新: 2026-04-29*
