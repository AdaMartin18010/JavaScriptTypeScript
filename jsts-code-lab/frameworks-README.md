---
category: frameworks
dimension: 框架生态
last-updated: 2026-04-27
---

# 框架生态代码实验室总览

> 本目录汇总 `jsts-code-lab/` 中所有归属「框架（Frameworks）」维度的代码模块。涵盖前端框架、后端框架、UI 组件、浏览器运行时与 Web 渲染。

---

## 模块目录

| 模块编号 | 模块名称 | 路径 | 说明 |
|----------|----------|------|------|
| 18 | 前端框架 | [18-frontend-frameworks](./18-frontend-frameworks/) | React/Vue/Angular/Svelte/Solid 核心概念、状态管理、路由、设计模式 |
| 19 | 后端开发 | [19-backend-development](./19-backend-development/) | Express/Fastify/NestJS/Hono 服务端模式、API 设计、WebSocket |
| 50 | 浏览器运行时 | [50-browser-runtime](./50-browser-runtime/) | 事件循环、V8 执行模型、内存管理、渲染管线、DOM 虚拟化 |
| 51 | UI 组件 | [51-ui-components](./51-ui-components/) | 组件生命周期、组合模式、通信模式、状态管理架构、渲染策略 |
| 52 | Web 渲染 | [52-web-rendering](./52-web-rendering/) | 智能渲染、CSS 布局、动画与动效、输入处理、响应式设计、无障碍模型 |

---

## 快速导航

### 前端框架 (18-frontend-frameworks)

- `react-patterns.tsx` — React 设计模式实现
- `state-management.ts` — 状态管理核心模式
- `router-implementation.ts` — 前端路由实现原理
- `signals-patterns/` — 信号（Signals）响应式模式
- `THEORY.md` — 前端框架理论基础
- `ARCHITECTURE.md` — 前端架构设计

### 后端开发 (19-backend-development)

- `express-patterns.ts` — Express 中间件与路由模式
- `api-design.ts` — RESTful / RPC API 设计模式
- `websocket-patterns.ts` — WebSocket 实时通信模式
- `THEORY.md` — 后端框架理论基础
- `ARCHITECTURE.md` — 后端架构设计

### 浏览器运行时 (50-browser-runtime)

- `event-loop-architecture.ts` — 事件循环与任务调度
- `v8-execution-model.ts` — V8 引擎执行模型
- `memory-management-model.ts` — 内存管理与垃圾回收
- `rendering-pipeline.ts` — 浏览器渲染管线
- `dom-virtualization-models.ts` — DOM 与虚拟 DOM 对比模型

### UI 组件 (51-ui-components)

- `component-lifecycle-models.ts` — 组件生命周期模型
- `component-composition-models.ts` — 组件组合模式
- `component-communication-patterns.ts` — 组件通信模式
- `state-management-architectures.ts` — 组件级状态管理架构
- `rendering-strategies.ts` — 组件渲染策略

### Web 渲染 (52-web-rendering)

- `intelligent-rendering.ts` — 智能渲染策略
- `css-layout-models.ts` — CSS 布局模型
- `animations-motion-models.ts` — 动画与动效模型
- `input-handling-models.ts` — 输入处理与事件模型
- `responsive-design-models.ts` — 响应式设计模型
- `accessibility-models.ts` — 无障碍（a11y）模型

---

## 与文档体系的对照

| 代码实验室模块 | 对应分类文档 | 对应对比矩阵 | 对应速查表 |
|---------------|-------------|-------------|-----------|
| 18-frontend-frameworks | [docs/categories/01-frontend-frameworks.md](../docs/categories/01-frontend-frameworks.md) | [frontend-frameworks-compare.md](../docs/comparison-matrices/frontend-frameworks-compare.md) | [REACT_CHEATSHEET.md](../docs/cheatsheets/REACT_CHEATSHEET.md) |
| 19-backend-development | [docs/categories/14-backend-frameworks.md](../docs/categories/14-backend-frameworks.md) | [backend-frameworks-compare.md](../docs/comparison-matrices/backend-frameworks-compare.md) | — |
| 51-ui-components | [docs/categories/02-ui-component-libraries.md](../docs/categories/02-ui-component-libraries.md) | [ui-libraries-compare.md](../docs/comparison-matrices/ui-libraries-compare.md) | — |
| 52-web-rendering | [docs/categories/09-ssr-meta-frameworks.md](../docs/categories/09-ssr-meta-frameworks.md) | [ssr-metaframeworks-compare.md](../docs/comparison-matrices/ssr-metaframeworks-compare.md) | — |

---

## 框架总索引入口

> 完整的框架文档索引请参见：[docs/frameworks-index.md](../docs/frameworks-index.md)
