# TanStack Start + Cloudflare 理论解读

## 概述

本模块探索 TanStack Start 全栈框架与 Cloudflare Workers 边缘运行时的深度集成，涵盖类型安全路由、Server Function 模型与边缘渲染原理。该组合让开发者能够以端到端类型安全的方式构建低延迟、全球分布的现代 Web 应用。

## 核心概念

### 文件系统路由与类型安全

TanStack Start 基于 TanStack Router 构建，采用约定式文件系统路由。所有路由定义、链接参数与数据加载器（loader）均享有完整的 TypeScript 类型推断，彻底消除前端路由中的字符串拼接与参数类型错误。

### Server Function 模型

`createServerFn` 将服务端逻辑以函数形态直接嵌入前端代码中，编译阶段自动抽取为 RPC 端点。相比传统 REST/GraphQL，Server Function 减少了网络层抽象，使前后端数据流转更加直观且类型一致。

### 边缘渲染与 Bindings

Cloudflare Workers 提供 D1（SQLite 边缘数据库）、KV（全局键值存储）与 R2（对象存储）等原生 Binding。TanStack Start 的 SSR 在边缘节点执行，Server Function 与渲染逻辑共享同一个 Worker 实例，数据访问延迟被压缩到物理最近的边缘位置。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| SSR Streaming | 首屏性能敏感页面，渐进式输出 HTML | 需正确处理 Suspense 边界，避免流中断 |
| Router Preloading | 预判用户下一步操作并预加载数据 | 合理设置 staleTime 与 gcTime，避免过度请求 |
| Edge-first DB | 利用 D1/KV 在边缘完成数据读写 | 注意 D1 的写入最终一致性，关键事务需兜底校验 |

## 关联模块

- `18-frontend-frameworks` — React 框架对比与选型指南
- `32-edge-computing` — 边缘计算架构与运行时特性
- `93-deployment-edge-lab` — 边缘部署实践与 CI/CD 配置

## 参考

- 本模块 `README.md` — 完整目录结构、快速使用指南与关键约束
- 本模块 `02-server-functions/api-server-fn.ts` — Server Function 基础与输入验证示例
- 本模块 `02-server-functions/d1-example.ts` — D1 数据库查询与写入示例
- 本模块 `04-performance/ssr-streaming.ts` — 流式 SSR 处理器配置
