---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
category: frameworks
---

# 框架生态总索引 (Frameworks Index)

> 本项目所有**框架（Frameworks）**相关内容的单一入口。涵盖前端框架、元框架、后端框架、状态管理、UI 组件库及其选型决策体系。
>
> **维度归属**：`frameworks`

---

## 📑 导航目录

| 领域 | 分类文档 | 对比矩阵 | 代码实验室 | 速查表 |
|------|----------|----------|------------|--------|
| **前端框架** | [01-frontend-frameworks](./categories/01-frontend-frameworks.md) | [frontend-frameworks-compare](./comparison-matrices/frontend-frameworks-compare.md) | [18-frontend-frameworks](../jsts-code-lab/18-frontend-frameworks/) | [REACT_CHEATSHEET](./cheatsheets/REACT_CHEATSHEET.md) |
| **元框架 / SSR** | [09-ssr-meta-frameworks](./categories/09-ssr-meta-frameworks.md) | [ssr-metaframeworks-compare](./comparison-matrices/ssr-metaframeworks-compare.md) | — | — |
| **后端框架** | [14-backend-frameworks](./categories/14-backend-frameworks.md) | [backend-frameworks-compare](./comparison-matrices/backend-frameworks-compare.md) | [19-backend-development](../jsts-code-lab/19-backend-development/) | — |
| **状态管理** | [05-state-management](./categories/05-state-management.md) | [state-management-compare](./comparison-matrices/state-management-compare.md) | [18-frontend-frameworks/state-management*](../jsts-code-lab/18-frontend-frameworks/) | [FRAMEWORKS_CHEATSHEET](./cheatsheets/FRAMEWORKS_CHEATSHEET.md) |
| **UI 组件库** | [02-ui-component-libraries](./categories/02-ui-component-libraries.md) | [ui-libraries-compare](./comparison-matrices/ui-libraries-compare.md) | [51-ui-components](../jsts-code-lab/51-ui-components/) | — |
| **路由** | [06-routing](./categories/06-routing.md) | — | [18-frontend-frameworks/router*](../jsts-code-lab/18-frontend-frameworks/) | [FRAMEWORKS_CHEATSHEET](./cheatsheets/FRAMEWORKS_CHEATSHEET.md) |
| **React 模式** | — | — | [18-frontend-frameworks/react-patterns*](../jsts-code-lab/18-frontend-frameworks/) | [REACT_PATTERNS](../docs/patterns/REACT_PATTERNS.md) |
| **浏览器运行时** | — | — | [50-browser-runtime](../jsts-code-lab/50-browser-runtime/) | — |
| **Web 渲染** | — | — | [52-web-rendering](../jsts-code-lab/52-web-rendering/) | — |

> *注：带 `*` 的路径表示该模块内的子目录或具体文件。*

---

## 1. 前端框架对比导航

主流 UI 框架及其核心特征一览：

| 框架 | 类型 | Stars | 响应式模型 | 最佳场景 |
|------|------|-------|-----------|---------|
| [React](./categories/01-frontend-frameworks.md#1-react-生态) | 虚拟 DOM 库 | 230k+ | 显式状态 + VDOM diff | 大型生态、跨平台、团队协作 |
| [Vue](./categories/01-frontend-frameworks.md#2-vue-生态) | 渐进式框架 | 202k+ | Proxy 响应式 | 渐进升级、中大型应用 |
| [Angular](./categories/01-frontend-frameworks.md#3-angular-生态) | 平台级框架 | 96k+ | RxJS + Zone.js | 企业级、严格规范 |
| [Svelte](./categories/01-frontend-frameworks.md#4-svelte-生态) | 编译时框架 | 80k+ | 编译时细粒度更新 | 性能敏感、轻量应用 |
| [SolidJS](./categories/01-frontend-frameworks.md#5-solid-生态) | 细粒度响应式 | 34k+ | 细粒度信号 | 极致性能、实时交互 |
| [Qwik](./categories/01-frontend-frameworks.md#6-其他新兴框架) | 可恢复性框架 | 20k+ | 可恢复性 + 懒加载 | 内容型站点、首屏极致优化 |
| [Preact](./categories/01-frontend-frameworks.md#14-preact) | React 替代品 | 35k+ | 轻量 VDOM | 体积敏感、嵌入式 widget |

**深度对比**：前往 [frontend-frameworks-compare.md](./comparison-matrices/frontend-frameworks-compare.md) 查看完整的技术选型矩阵。

---

## 2. 元框架对比导航

基于前端框架构建的全栈/服务端渲染框架：

| 元框架 | 基础框架 | 渲染模式 | Stars | 定位 |
|--------|----------|----------|-------|------|
| [Next.js](./categories/09-ssr-meta-frameworks.md#react-元框架) | React | SSR/SSG/ISR/PPR | 127k+ | React 全栈首选 |
| [Nuxt](./categories/09-ssr-meta-frameworks.md#vue-元框架) | Vue | SSR/SSG/SPA | 55k+ | Vue 官方全栈方案 |
| [SvelteKit](./categories/09-ssr-meta-frameworks.md#多框架支持) | Svelte | SSR/SSG | 18k+ | Svelte 官方全栈方案 |
| [Astro](./categories/09-ssr-meta-frameworks.md#多框架支持) | 多框架 | 内容驱动/群岛架构 | 48k+ | 内容站点首选 |
| [Remix](./categories/09-ssr-meta-frameworks.md#react-元框架) | React | SSR/渐进增强 | 28k+ | Web 标准优先 |
| [TanStack Start](./categories/22-tanstack-start.md) | React | SSR/流式传输 | — | 类型安全全栈 |
| [SolidStart](./categories/09-ssr-meta-frameworks.md#多框架支持) | SolidJS | SSR/细粒度 | 5k+ | Solid 全栈方案 |
| [Analog](./categories/09-ssr-meta-frameworks.md#多框架支持) | Angular | SSR/文件路由 | 3k+ | Angular 现代化全栈 |

**深度对比**：前往 [ssr-metaframeworks-compare.md](./comparison-matrices/ssr-metaframeworks-compare.md)。

---

## 3. 后端框架对比导航

Node.js 及现代 JavaScript 运行时后端框架：

| 框架 | 类型 | Stars | 运行时 | 定位 |
|------|------|-------|--------|------|
| [Express](./categories/14-backend-frameworks.md#express) | 传统 Web | 67k+ | Node.js | 历史标准（维护模式）|
| [Fastify](./categories/14-backend-frameworks.md#fastify) | 高性能 Web | 31k+ | Node.js | 性能优先 |
| [NestJS](./categories/14-backend-frameworks.md#nestjs) | 企业级全栈 | 65k+ | Node.js | 架构规范、企业首选 |
| [Hono](./categories/14-backend-frameworks.md#hono) | 多运行时 Web | 45k+ | Node/Bun/Deno/Edge | WinterTC 世界的 Express |
| [Elysia](./categories/14-backend-frameworks.md#elysia) | Bun 优先 | 26k+ | Bun | 极致性能、编译期优化 |
| [tRPC](./categories/14-backend-frameworks.md#trpc) | RPC | 35k+ | Node.js | 端到端类型安全 |
| [Socket.io](./categories/14-backend-frameworks.md#socketio) | 实时通信 | 61k+ | Node.js | 实时通信标准 |

**深度对比**：前往 [backend-frameworks-compare.md](./comparison-matrices/backend-frameworks-compare.md)。

---

## 4. 状态管理方案导航

| 方案 | 框架 | 范式 | 包体积 | Stars | 定位 |
|------|------|------|--------|-------|------|
| [Zustand](./categories/05-state-management.md#11-zustand-48k-) | React | 集中式 Store | ~1KB | 48k | 2025 最热，极简无样板 |
| [Redux / RTK](./categories/05-state-management.md#12-redux--redux-toolkit-61k) | React | Flux / 集中式 | ~11KB | 61k | 企业级标准 |
| [Jotai](./categories/05-state-management.md#13-jotai-18k) | React | 原子化 | ~3KB | 18k | 细粒度、派生状态 |
| [Pinia](./categories/05-state-management.md#21-pinia-35k-) | Vue | 集中式 Store | ~1KB | 35k | Vue 官方推荐 |
| [MobX](./categories/05-state-management.md#16-mobx-27k) | 跨框架 | 响应式 / OOP | ~16KB | 27k | 复杂领域模型 |
| [XState](./categories/05-state-management.md#17-xstate-27k) | 跨框架 | 状态机 | ~8KB | 27k | 复杂流程、可视化 |
| [TanStack Query](./categories/05-state-management.md#18-react-query-tanstack-query-43k) | 跨框架 | 服务端状态 | ~12KB | 43k | 服务端状态管理首选 |

**深度对比**：前往 [state-management-compare.md](./comparison-matrices/state-management-compare.md)。

---

## 5. UI 组件库导航

### React 生态

| 库 | 风格 | Stars | 特点 |
|----|------|-------|------|
| [shadcn/ui](./categories/02-ui-component-libraries.md#react-ui-组件库) | Copy-paste / Headless | 82k+ | 无 NPM 包、完全可定制 |
| [Material UI (MUI)](./categories/02-ui-component-libraries.md#react-ui-组件库) | Material Design | 94k+ | 功能最全面 |
| [Ant Design](./categories/02-ui-component-libraries.md#react-ui-组件库) | 企业级 | 93k+ | 中后台首选 |
| [Radix UI](./categories/02-ui-component-libraries.md#react-ui-组件库) | Headless 原语 | 18k+ | 可访问性优先 |
| [Chakra UI](./categories/02-ui-component-libraries.md#react-ui-组件库) | 现代简约 | 38k+ | 开发体验优秀 |

### Vue 生态

| 库 | 风格 | Stars | 特点 |
|----|------|-------|------|
| [Element Plus](./categories/02-ui-component-libraries.md#vue-ui-组件库) | 桌面端 | 24k+ | 中后台经典 |
| [Vuetify](./categories/02-ui-component-libraries.md#vue-ui-组件库) | Material Design | 38k+ | Vue 官方推荐 |
| [Quasar](./categories/02-ui-component-libraries.md#vue-ui-组件库) | 全平台 | 25k+ | SPA/SSR/PWA/桌面/移动端 |

**深度对比**：前往 [ui-libraries-compare.md](./comparison-matrices/ui-libraries-compare.md)。

---

## 6. 框架选型决策树

```text
开始选型
│
├─ 项目类型？
│   ├─ 内容型网站/博客 ──→ Astro / Next.js SSG / Gatsby
│   ├─ 中后台管理系统 ──→ React + Ant Design / MUI / shadcn/ui
│   ├─ 电商平台 ──→ Next.js / Nuxt (SEO + 全栈)
│   ├─ 实时交互应用 ──→ SolidJS / Svelte + 合适元框架
│   ├─ 企业级大型应用 ──→ Angular / NestJS + 严格架构
│   └─ 微服务/高性能 API ──→ Fastify / Hono / Elysia
│
├─ 团队背景？
│   ├─ 熟悉 React ──→ Next.js / Remix / TanStack Start
│   ├─ 熟悉 Vue ──→ Nuxt
│   ├─ 熟悉 Angular ──→ Analog
│   └─ 追求极致性能 ──→ SolidJS / Svelte + 对应元框架
│
├─ 部署目标？
│   ├─ 传统服务器 ──→ Express / Fastify / NestJS
│   ├─ 边缘/Serverless ──→ Hono / Next.js Edge / SvelteKit
│   ├─ Cloudflare Workers ──→ Hono / Nitro / SvelteKit
│   └─ Bun 运行时 ──→ Elysia / Hono
│
└─ 状态管理复杂度？
    ├─ 简单全局状态 ──→ Zustand / Pinia
    ├─ 复杂业务逻辑 ──→ Redux / MobX
    ├─ 细粒度派生 ──→ Jotai / Signals
    ├─ 复杂流程/状态机 ──→ XState
    └─ 服务端数据为主 ──→ TanStack Query / SWR / RTK Query
```

---

## 7. 各框架学习路径

### React 学习路径

1. **基础**：JSX → 组件与 Props → State → 事件处理 → 条件/列表渲染
2. **Hooks**：useState → useEffect → useContext → useReducer → 自定义 Hooks
3. **进阶**：useMemo / useCallback → Refs → Portals → Error Boundary
4. **React 19+**：React Compiler → Server Components → Actions → use() / useOptimistic
5. **生态**：React Router → Zustand/Redux → TanStack Query → shadcn/ui
6. **全栈**：Next.js App Router → Server Actions → PPR → 部署优化

### Vue 学习路径

1. **基础**：模板语法 → 响应式基础 → 计算属性 → 条件/列表渲染 → 事件处理
2. **组件化**：Props / Emits → 插槽 →  provide/inject → 生命周期
3. **Composition API**：setup → ref/reactive → computed → watch → 组合式函数
4. **生态**：Vue Router → Pinia → Element Plus / Vuetify
5. **全栈**：Nuxt → 服务端渲染 → 自动导入 → Nitro 引擎

### Angular 学习路径

1. **基础**：模块 → 组件 → 模板 → 指令 → 管道
2. **核心**：依赖注入 → 服务 → RxJS 基础 → HTTP 客户端
3. **进阶**：路由守卫 → 懒加载 → 表单（Reactive Forms）→ 动画
4. **架构**：NgRx / Signals → 模块化设计 → 测试策略
5. **全栈**：Angular Universal → Analog

### 后端框架学习路径

1. **入门**：HTTP 基础 → RESTful API 设计 → 中间件机制
2. **Node.js 框架**：Express（理解基础）→ Fastify（性能）→ NestJS（企业架构）
3. **现代运行时**：Hono（跨平台）→ Elysia（Bun 生态）
4. **类型安全**：tRPC → Zod 验证 → 端到端类型
5. **实时通信**：WebSocket → Socket.io → SSE

---

## 8. 相关资源速查

| 资源 | 说明 |
|------|------|
| [FRAMEWORKS_CHEATSHEET](./cheatsheets/FRAMEWORKS_CHEATSHEET.md) | 框架综合速查表：Hooks、Composition API、状态管理选型、路由配置 |
| [REACT_CHEATSHEET](./cheatsheets/REACT_CHEATSHEET.md) | React 19+ 完整速查表 |
| [REACT_PATTERNS](./patterns/REACT_PATTERNS.md) | React 设计模式指南（10 种经典模式）|
| [jsts-code-lab/frameworks-README](../jsts-code-lab/frameworks-README.md) | 代码实验室框架模块总览 |

---

> 📅 本文档最后更新：2026-04-27
>
> 🔄 若发现框架链接失效或内容分散，请优先向本索引反馈，由维护者统一调度。
