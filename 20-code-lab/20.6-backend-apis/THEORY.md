# 后端与 API：理论基础

> **定位**：`20-code-lab/20.6-backend-apis/`
> **关联**：``30-knowledge-base/30.2-categories/backend-frameworks.md`` (Legacy)

---

## 一、核心理论

### 1.1 问题域定义

Node.js 生态的后端开发涵盖 HTTP 服务器、API 设计、数据库交互、认证授权等。2026 年的关键趋势是**类型安全端到端**（tRPC、GraphQL Codegen）和**边缘优先部署**（Cloudflare Workers、Vercel Edge）。

### 1.2 API 范式对比

| 范式 | 类型安全 | 灵活性 | 适用场景 |
|------|---------|--------|---------|
| REST | 手动（OpenAPI） | 高 | 通用、公开 API |
| GraphQL | 自动（Schema） | 极高 | 复杂查询、聚合 |
| tRPC | 完全自动 | 中 | 全栈 TS 项目 |
| gRPC | 完全自动 | 低 | 内部微服务 |
| Server Actions | 自动 | 中 | React 全栈框架 |

---

## 二、设计原理

### 2.1 类型安全 API 的经济学

```
传统 REST 开发成本：
  后端定义接口 → 手写文档 → 前端手动对接 → 运行时发现类型错误 → 修复循环

tRPC 开发成本：
  后端定义路由（TS类型自动推导） → 前端直接调用（编译期类型检查）
  节省：API文档维护 + 类型不匹配bug修复
```

### 2.2 运行时选型

```
后端服务类型
├── I/O 密集型 API
│   └── → Node.js / Bun（事件循环优势）
├── 计算密集型
│   └── → Worker Threads / Rust/WASM 扩展
├── 边缘部署
│   └── → Cloudflare Workers / Deno Deploy
└── 实时通信
    └── → Bun uWebSockets / Node.js + Socket.io
```

---

## 三、扩展阅读

- `30-knowledge-base/30.4-decision-trees/runtime-selection.md`
- `40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
