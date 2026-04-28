---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 框架生态专项学习路径 (Frameworks Ecosystem Path)

> 从使用框架到设计框架，再到理解框架背后的编译与运行时权衡。
>
> **覆盖维度**：框架生态

## 路径目标与预期产出

完成本路径后，你将能够：

- **入门**：独立使用 React/Vue 等主流框架开发组件化应用，掌握基础状态管理
- **进阶**：在企业级项目中应用六边形架构、CQRS、事件溯源，能驾驭全栈元框架
- **专家**：理解元框架的编译时优化原理，具备设计自定义框架或 DSL 的能力

**预计总周期**：6–10 周（每天 2–3 小时）

---

## 目录

- [框架生态专项学习路径 (Frameworks Ecosystem Path)](#框架生态专项学习路径-frameworks-ecosystem-path)
  - [路径目标与预期产出](#路径目标与预期产出)
  - [目录](#目录)
  - [阶段一：入门 —— 组件化开发与状态管理 (1–2 周)](#阶段一入门--组件化开发与状态管理-12-周)
    - [节点 1.1 组件化思维与 JSX/TSX](#节点-11-组件化思维与-jsxtsx)
    - [节点 1.2 状态管理与响应式原理](#节点-12-状态管理与响应式原理)
    - [节点 1.3 设计系统与可复用组件](#节点-13-设计系统与可复用组件)
  - [阶段二：进阶 —— 架构模式与元框架 (2–3 周)](#阶段二进阶--架构模式与元框架-23-周)
    - [节点 2.1 企业级架构模式](#节点-21-企业级架构模式)
    - [节点 2.2 全栈与元框架](#节点-22-全栈与元框架)
    - [节点 2.3 服务端渲染与边缘渲染](#节点-23-服务端渲染与边缘渲染)
  - [阶段三：专家 —— 元框架架构与编译时优化 (3–4 周)](#阶段三专家--元框架架构与编译时优化-34-周)
    - [节点 3.1 框架运行时原理](#节点-31-框架运行时原理)
    - [节点 3.2 编译时优化与代码生成](#节点-32-编译时优化与代码生成)
    - [节点 3.3 开发者体验 (DX) 与平台工程](#节点-33-开发者体验-dx-与平台工程)
  - [阶段验证 Checkpoint](#阶段验证-checkpoint)
    - [Checkpoint 1：React + TS Todo 应用](#checkpoint-1react--ts-todo-应用)
    - [Checkpoint 2：六边形架构订单系统](#checkpoint-2六边形架构订单系统)
    - [Checkpoint 3：迷你元框架原型](#checkpoint-3迷你元框架原型)
  - [推荐资源](#推荐资源)

---

## 阶段一：入门 —— 组件化开发与状态管理 (1–2 周)

### 节点 1.1 组件化思维与 JSX/TSX

- **关联文件/模块**：
  - `jsts-code-lab/18-frontend-frameworks/`
  - `docs/cheatsheets/REACT_CHEATSHEET.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/FRONTEND_FRAMEWORK_THEORY.md`
- **关键技能**：
  - props / state / 单向数据流
  - 组合优于继承（Composition over Inheritance）
  - Hooks 规则与闭包陷阱

### 节点 1.2 状态管理与响应式原理

- **关联文件/模块**：
  - `jsts-code-lab/15-data-flow/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/Signals_范式深度分析.md`
- **关键技能**：
  - Redux / Zustand / Jotai 的选型差异
  - Signals 范式的细粒度响应式
  - 状态 colocation 与 lifting 的权衡

### 节点 1.3 设计系统与可复用组件

- **关联文件/模块**：
  - `jsts-code-lab/51-ui-components/`
  - `jsts-code-lab/57-design-system/`
  - `examples/design-patterns-ts/`
- **关键技能**：
  - Headless UI 与样式解耦
  - Compound Components 模式
  - 无障碍（a11y）基础

---

## 阶段二：进阶 —— 架构模式与元框架 (2–3 周)

### 节点 2.1 企业级架构模式

- **关联文件/模块**：
  - `jsts-code-lab/06-architecture-patterns/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ARCHITECTURE_PATTERNS_THEORY.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/07_architecture.md`
- **关键技能**：
  - 分层架构、六边形架构、洋葱架构
  - CQRS + 事件溯源的实现与取舍
  - DDD 限界上下文在前端的映射

### 节点 2.2 全栈与元框架

- **关联文件/模块**：
  - `jsts-code-lab/59-fullstack-patterns/`
  - `examples/fullstack-tanstack-start/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/React_Server_Components_范式转变分析.md`
- **关键技能**：
  - Next.js / Nuxt / TanStack Start 的架构差异
  - Server Components vs Client Components 的边界
  - 全栈类型安全（tRPC / GraphQL Codegen）

### 节点 2.3 服务端渲染与边缘渲染

- **关联文件/模块**：
  - `jsts-code-lab/52-web-rendering/`
  - `jsts-code-lab/32-edge-computing/`
- **关键技能**：
  - SSR / SSG / ISR / DPR 的渲染模式矩阵
  - 流式传输（Streaming）与 Suspense
  - 边缘运行时（Edge Runtime）的限制与优化

---

## 阶段三：专家 —— 元框架架构与编译时优化 (3–4 周)

### 节点 3.1 框架运行时原理

- **关联文件/模块**：
  - `jsts-code-lab/53-app-architecture/`
  - `jsts-code-lab/50-browser-runtime/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/V8_RUNTIME_THEORY.md`
- **关键技能**：
  - Virtual DOM vs Fine-grained Reactivity 的性能模型
  - 调度器（Scheduler）与优先级中断
  - 内存管理与组件生命周期泄漏排查

### 节点 3.2 编译时优化与代码生成

- **关联文件/模块**：
  - `jsts-code-lab/79-compiler-design/`
  - `jsts-code-lab/56-code-generation/`
  - `examples/advanced-compiler-workshop/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/COMPILER_LANGUAGE_DESIGN.md`
- **关键技能**：
  - AST 转换与 Tree-shaking 原理
  - 编译时宏（Macro）与 AOT 优化
  - Bundler 插件体系（Rollup / Vite / Rspack）

### 节点 3.3 开发者体验 (DX) 与平台工程

- **关联文件/模块**：
  - `jsts-code-lab/60-developer-experience/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/TOOLCHAIN_BUILD_THEORY.md`
- **关键技能**：
  - HMR（热更新）的实现原理
  - Monorepo 工具链与远程缓存
  - 度量与改进团队级 DX 指标

---

## 阶段验证 Checkpoint

### Checkpoint 1：React + TS Todo 应用

- **项目**：完成 `examples/beginner-todo-master` 的 Milestone 3
- **要求**：使用 React + TypeScript 实现可交互的 Todo 列表，含本地存储持久化与筛选
- **通过标准**：功能完整 + TypeScript 无错误 + 通过 E2E 测试
- **难度**：⭐⭐⭐ | **预计时间**：1–2 周

### Checkpoint 2：六边形架构订单系统

- **项目**：实现一个六边形架构的订单系统
- **代码位置**：`jsts-code-lab/06-architecture-patterns/hexagonal-order/`
- **要求**：
  - 领域层：Order 实体、Order 值对象
  - 应用层：PlaceOrder 用例
  - 基础设施层：InMemoryRepository、ConsoleLogger
- **通过标准**：领域层无外部依赖 + 单元测试覆盖 ≥ 80%
- **难度**：⭐⭐⭐⭐ | **预计时间**：2 周

### Checkpoint 3：迷你元框架原型

- **项目**：设计并原型验证一个迷你前端元框架
- **代码位置**：`jsts-code-lab/60-developer-experience/mini-metaframework/`（自建目录）
- **要求**：
  - 支持基于文件系统的路由
  - 支持编译时数据获取（类似 `getStaticProps`）
  - 支持客户端 hydration
  - 提供 HMR 或快速刷新能力
- **通过标准**：
  - 能渲染 3 个以上页面并切换
  - Lighthouse Performance ≥ 85
  - 提供架构决策记录（ADR）
- **难度**：⭐⭐⭐⭐⭐ | **预计时间**：3–4 周

---

## 推荐资源

- [React Architecture Patterns](https://react.dev/)
- [Patterns.dev](https://www.patterns.dev/) — 现代 Web 应用设计模式
- *Frameworkless Front-End Development* — Francesco Strazzullo
- *Building Micro-Frontends* — Michael Geers
- Vite / Rollup / esbuild 官方文档与源码

---

*最后更新: 2026-04-27*
