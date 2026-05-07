# 🌐 Edge Runtime 深度专题

> 探索 JavaScript 在边缘计算时代的运行时演进 —— 从 Vercel Edge Functions 到 Cloudflare Workers，从冷启动优化到全球低延迟架构。

## 为什么需要 Edge Runtime？

| 维度 | 传统 Node.js 服务端 | Edge Runtime |
|------|---------------------|--------------|
| **启动延迟** | 100-500ms | 0-50ms |
| **地理分布** | 单区域/多区域部署 | 全球 300+ 节点 |
| **运行时隔离** | VM/Container | V8 Isolates |
| **资源限制** | GB 级内存 | 128MB-1GB |
| **成本模型** | 按实例/时长计费 | 按请求/CPU 时间 |

Edge Runtime 不是替代 Node.js，而是填补了「低延迟交互」与「全球分布」之间的空白。

## 学习路径

```mermaid
flowchart LR
    A[V8 Isolates] --> B[Vercel Edge]
    B --> C[Cloudflare Workers]
    C --> D[边缘数据库]
    D --> E[缓存策略]
    E --> F[安全与部署]
```

### Phase 1: 基础概念

- [01. Edge Runtime 核心概念](./01-edge-runtime-fundamentals)
- [02. Vercel Edge Functions 实战](./02-vercel-edge-functions)
- [03. Cloudflare Workers 深度解析](./03-cloudflare-workers)

### Phase 2: 数据与状态

- [04. 边缘数据库与存储](./04-edge-databases)
- [05. 边缘缓存策略](./05-edge-caching-strategies)

### Phase 3: 工程与安全

- [06. 安全模型与隔离机制](./06-security-isolation)
- [07. 框架集成模式](./07-framework-integration)
- [08. 生产部署与监控](./08-production-deployment)

## 三大主流平台对比

| 特性 | Vercel Edge | Cloudflare Workers | Deno Deploy |
|------|-------------|-------------------|-------------|
| **运行时** | V8 Isolates | V8 Isolates | Deno (V8) |
| **Node API 兼容** | 部分 (`edge-light`) | 自定义 (`node_compat`) | 原生支持 |
| **cold start** | ~0ms | ~0ms | ~0ms |
| **Wasm 支持** | ✅ | ✅ | ✅ |
| **TCP/UDP** | ❌ | ❌ (TCP via Sockets API) | ✅ |
| **最大执行时间** | 30s | 50ms-30min | 无限制 |
| **本地开发** | `next dev` | `wrangler dev` | `deployctl` |

## 与其他专题的关系

- [React + Next.js App Router](../react-nextjs-app-router/) — Next.js Edge Runtime 配置
- [服务器优先前端](../server-first-frontend/) — HTMX + Edge Functions 结合模式
- [数据库层](../database-layer/) — Edge 数据库选型（Turso, PlanetScale, Supabase）

## 相关专题

| 专题 | 关联点 |
|------|--------|
| [AI-Native Development](../ai-native-development/) | 边缘 AI 推理：低延迟 LLM API 代理 |
| [数据库层与 ORM](../database-layer/) | [Edge 环境 ORM 模式](../database-layer/05-edge-orm-patterns.md) |
| [React + Next.js App Router](../react-nextjs-app-router/) | [Vercel Edge Functions](../edge-runtime/02-vercel-edge-functions.md) 实战 |
| [移动端跨平台](../mobile-cross-platform/) | 移动端边缘计算与离线优先架构 |
| [WebAssembly](../webassembly/) | 边缘 Wasm 运行时：Cloudflare Workers、Fastly、WasmEdge |
| [测试工程](../testing-engineering/) | 边缘函数的单元测试与集成测试 |
| [性能工程](../performance-engineering/) | 边缘计算低延迟架构与全局缓存策略 |
| [应用设计](../application-design/) | Serverless 架构设计与微服务拆分策略 |

## 参考资源

- [WinterCG](https://wintercg.org/) — Web-interoperable Runtimes Community Group
- [Vercel Edge Runtime Docs](https://edge-runtime.vercel.app/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Deno Deploy Docs](https://docs.deno.com/deploy/manual/)
