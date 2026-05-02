---
title: Svelte Signals 代码实验室
description: '3个完整可运行的 SvelteKit 项目：TODO应用、博客平台、Dashboard面板'
---

# Svelte Signals 代码实验室

> 3 个完整可运行的 Svelte/SvelteKit 项目，覆盖从基础到进阶的全栈开发

## 实验室概览

| 项目 | 难度 | 对应专题 | 技术栈 | 学习重点 |
|------|:----:|----------|--------|----------|
| **01-TODO 应用** | 🌿 | 02, 12, 13 | Svelte 5 + Vite | Runes、组件交互、状态管理 |
| **02-博客平台** | 🌳 | 03, 04, 18 | SvelteKit 2 + TypeScript | 路由、Form Actions、API、SSR |
| **03-Dashboard** | 🌳 | 13, 14, 15 | Svelte 5 + D3.js | Action、数据可视化、实时更新 |

## 01-TODO 应用

### 项目简介

基础 TODO 应用，覆盖 Svelte 5 核心概念。

### 技术栈

- Svelte 5.53.x
- Vite 6.3
- TypeScript 5.8
- Vitest + Playwright

### 核心功能

- ✅ $state 管理任务列表
- ✅ $derived 计算完成统计
- ✅ $effect 本地存储持久化
- ✅ 组件拆分（TodoItem / TodoFilter）
- ✅ 过渡动画（fade/slide）
- ✅ 响应式筛选（全部/未完成/已完成）

### 文件结构

```
01-todo-app/
├── src/routes/+page.svelte      # 主页面
├── src/routes/TodoItem.svelte   # 单个任务组件
├── src/routes/TodoFilter.svelte # 筛选组件
├── src/lib/stores/todoStore.ts  # 共享状态
├── tests/                       # 测试
└── Dockerfile                   # 部署
```

### 运行方式

```bash
cd 01-todo-app
npm install
npm run dev
npm test        # Vitest
npm run test:e2e  # Playwright
```

### 学习路径

1. 阅读 `src/lib/stores/todoStore.ts` — 理解 .svelte.ts 共享状态
2. 阅读 `src/routes/+page.svelte` — 理解 Runes 在页面中的使用
3. 阅读 `src/routes/TodoItem.svelte` — 理解 Props 和事件
4. 运行测试 — 理解测试策略

## 02-博客平台

### 项目简介

全栈博客平台，基于 SvelteKit 2。

### 技术栈

- SvelteKit 2.53.x
- Svelte 5.53.x
- TypeScript 5.8
- 内存数据库（可替换为 SQLite/Drizzle）

### 核心功能

- ✅ 文件系统路由（/blog/[slug]）
- ✅ load 函数（服务端数据获取）
- ✅ Form Actions（创建文章 + 验证）
- ✅ API 路由（REST API）
- ✅ Markdown 渲染
- ✅ SEO 优化（SSR）

### 文件结构

```
02-blog-platform/
├── src/routes/+page.svelte                  # 首页（文章列表）
├── src/routes/+page.server.ts               # 首页 load
├── src/routes/blog/[slug]/+page.svelte      # 文章详情
├── src/routes/blog/[slug]/+page.server.ts   # 文章 load
├── src/routes/blog/new/+page.svelte         # 新建文章
├── src/routes/blog/new/+page.server.ts      # Form Actions
├── src/routes/api/posts/+server.ts          # API 路由
├── src/lib/db/posts.ts                      # 数据层
└── tests/                                   # 测试
```

### 运行方式

```bash
cd 02-blog-platform
npm install
npm run dev
npm run build    # 生产构建
npm test
```

### 学习路径

1. 阅读 `src/lib/db/posts.ts` — 数据层设计
2. 阅读 `src/routes/+page.server.ts` — load 函数
3. 阅读 `src/routes/blog/new/+page.server.ts` — Form Actions
4. 阅读 `src/routes/api/posts/+server.ts` — API 路由

## 03-Dashboard 面板

### 项目简介

数据可视化 Dashboard，展示 Svelte Action 和高级组件模式。

### 技术栈

- Svelte 5.53.x
- Vite 6.3
- D3.js（通过 Action 集成）
- TypeScript 5.8

### 核心功能

- ✅ KPI 卡片（$derived 聚合计算）
- ✅ SVG 折线图/柱状图/饼图（Action + D3）
- ✅ 数据表格（排序、搜索、分页）
- ✅ 暗色主题切换
- ✅ ResizeObserver Action（响应式图表）
- ✅ 模拟实时数据更新

### 文件结构

```
03-dashboard-analytics/
├── src/routes/+page.svelte              # Dashboard 首页
├── src/lib/components/KpiCard.svelte    # KPI 卡片
├── src/lib/components/LineChart.svelte  # 折线图
├── src/lib/components/BarChart.svelte   # 柱状图
├── src/lib/components/DataTable.svelte  # 数据表格
├── src/lib/actions/resizeObserver.ts    # Resize Action
├── src/lib/stores/dataStore.ts          # 数据存储
└── tests/                               # 测试
```

### 运行方式

```bash
cd 03-dashboard-analytics
npm install
npm run dev
npm test
```

### 学习路径

1. 阅读 `src/lib/actions/resizeObserver.ts` — Action 设计
2. 阅读 `src/lib/components/LineChart.svelte` — Action + D3 集成
3. 阅读 `src/lib/stores/dataStore.ts` — 复杂状态管理
4. 阅读 `src/lib/components/DataTable.svelte` — 高级组件模式

## 源码位置

所有项目源码位于：`../../20-code-lab/20.5-frontend-frameworks/svelte-signals-lab/`

## 相关专题

| 学习阶段 | 推荐阅读 |
|----------|----------|
| 入门 | [Svelte 5 Runes 深度指南](/svelte-signals-stack/02-svelte-5-runes) |
| 语法 | [Svelte 语言完全参考](/svelte-signals-stack/12-svelte-language-complete) |
| 组件 | [组件开发模式大全](/svelte-signals-stack/13-component-patterns) |
| 全栈 | [SvelteKit 全栈框架](/svelte-signals-stack/03-sveltekit-fullstack) |
| 原理 | [响应式系统深度原理](/svelte-signals-stack/14-reactivity-deep-dive) |
| 学习路径 | [渐进式学习阶梯](/svelte-signals-stack/16-learning-ladder) |

> 最后更新: 2026-05-01
