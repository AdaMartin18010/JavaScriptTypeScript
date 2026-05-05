# 70.5 Edge Runtime and Serverless

## 目录概览

本目录收录基于 TypeScript 堆栈的边缘计算与 Serverless 架构的 L0 级理论深度分析，覆盖 Edge Runtime、WASM 边缘化、同构渲染、Edge 数据库、RPC、Serverless 冷启动、边缘安全、CRDT、边缘 AI 推理等前沿主题。

### Edge Runtime 与执行模型

- [x] **34** Edge Runtime 架构对比 — Cloudflare Workers (V8 Isolates)、Vercel Edge、Deno Deploy、Bun Edge
- [x] **35** WebAssembly 边缘化 — WASM 模块加载、WASI Preview 2、Component Model、WASM ↔ JS 边界
- [x] **36** 同构渲染与边缘 SSR — React Server Components、Islands、Partial Hydration、Resumability
- [x] **37** Edge 数据库与状态管理 — Turso (libSQL)、Cloudflare D1、PlanetScale、Fauna、一致性模型

### 网络与通信

- [x] **38** Edge KV 与缓存策略 — Cloudflare KV、Vercel Edge Config、Deno KV、CAP 定理在边缘
- [x] **39** RPC 框架与类型安全传输 — tRPC、Connect、gRPC-Web、JSON-RPC 2.0、Schema 演化

### Serverless 与分布式

- [x] **40** Serverless 冷启动与成本模型 — 启动延迟、并发扩展、请求隔离、计费模型
- [x] **41** 边缘安全与零信任架构 — JWT/JWS、mTLS、WAF、DDoS 缓解、TEE 机密计算
- [x] **42** 实时协同与 CRDT — Yjs、Automerge、Loro、OT vs CRDT、半格合并

### AI 与部署

- [x] **43** 边缘 AI 推理与模型服务 — ONNX Runtime Web、Transformers.js、WebGPU 推理、模型分片
- [x] **44** 全栈 TypeScript 部署拓扑 — Monorepo + Turborepo、Docker vs V8 Isolate、平台锁定分析
- [x] **45** 边缘可观测性与调试 — OpenTelemetry、结构化日志、分布式追踪、Cold Start 诊断

## 写作规范

每篇文档遵循统一标准：

- YAML frontmatter（含 `english-abstract`）
- `last-updated: 2026-05-05`
- ≥6 个可运行的 TypeScript 代码示例
- `对称差分析` 章节
- `工程决策矩阵` 章节
- `反例与局限性` 章节
- 参考文献 ≥8 条
