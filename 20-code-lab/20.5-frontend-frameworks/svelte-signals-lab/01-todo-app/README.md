# Svelte 5 TODO 应用 — 代码实验室

> **学习阶梯**: Level 1-2 | **专题**: 10.2-type-system / 20.5-frontend-frameworks
> **核心语法**: Svelte 5 Runes（`$state`, `$derived`, `$effect`, `$props`, Snippets）

---

## 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 生产构建
npm run build

# Docker 构建
 docker build -t svelte5-todo .
```

---

## 学习要点

### 1. Runes 基础

- `$state` — 声明响应式状态（替代 Svelte 4 的 `let` 自动响应式）
- `$derived` — 计算派生值（替代 `$:` 语句）
- `$effect` — 副作用处理（替代 `$:` + `{...}` 或 `onMount`+`afterUpdate`）
- `$props` — 接收组件 Props（替代 `export let`）

### 2. 组件交互

- Props 向下传递（`$props`）
- 回调向上传递（Props 中的函数）
- 条件渲染 `{#if}` / `{:else}`
- 列表渲染 `{#each}` + `key`
- 过渡动画 `transition:fade`

### 3. 状态管理

- `.svelte.ts` 模块 — 跨组件共享状态
- 本地存储持久化（`localStorage` + `$effect`）
- 状态操作方法封装

---

## 项目结构

```
01-todo-app/
├── src/
│   ├── app.html              # HTML 模板
│   ├── app.d.ts              # 类型声明
│   ├── routes/
│   │   ├── +layout.svelte    # 根布局（全局样式、主题）
│   │   ├── +page.svelte      # TODO 主页面
│   │   ├── TodoItem.svelte   # 单个 TODO 组件
│   │   └── TodoFilter.svelte # 筛选组件
│   └── lib/stores/
│       └── todoStore.ts      # 共享状态（.svelte.ts）
├── tests/
│   ├── todo.spec.ts          # Vitest 单元测试
│   └── e2e/
│       └── todo.e2e.spec.ts  # Playwright E2E 测试
├── package.json
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
└── Dockerfile
```

---

## 对应专题章节

- **10.2-type-system** — TypeScript 与 Svelte 5 类型集成
- **20.5-frontend-frameworks** — Svelte 5 Runes 深度实践
- **20.12-build-free-typescript** — Vite + Svelte 构建工具链

---

## 参考文档

- [Svelte 5 Runes 官方文档](https://svelte.dev/docs/svelte/what-are-runes)
- [SvelteKit 路由](https://kit.svelte.dev/docs/routing)
