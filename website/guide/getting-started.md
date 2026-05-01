---
title: 快速开始
description: "Awesome JS/TS Ecosystem 指南: 快速开始"
---

# 快速开始

欢迎来到 **Awesome JS/TS Ecosystem**！本指南将帮助你快速了解如何使用本站资源。

## 站点导航

### 🔍 搜索功能

本站提供强大的全文搜索功能：
- 点击导航栏的 **搜索框** 或按 `Ctrl + K`（Mac: `Cmd + K`）
- 支持中文关键词搜索
- 实时显示搜索结果，包含标题和内容匹配

### 📑 分类浏览

所有资源按类别组织，你可以通过以下方式浏览：

1. **左侧边栏** - 查看完整分类目录
2. **首页卡片** - 点击感兴趣的分类快速进入
3. **导航菜单** - 顶部导航栏的"分类"入口

### 🌓 主题切换

点击右上角的 **太阳/月亮图标** 切换：
- ☀️ 浅色模式
- 🌙 深色模式

## 分类体系说明

### 📦 P0 - 前端核心

这些是现代 Web 开发的核心技术，建议优先掌握：

| 分类 | 说明 | 主要技术 |
|------|------|----------|
| [前端框架](../categories/frontend-frameworks) | UI 框架基础 | React, Vue, Angular, Svelte, Solid |
| [UI 组件库](../categories/ui-component-libraries) | 现成组件方案 | shadcn/ui, Ant Design, MUI, Chakra |
| [构建工具](../categories/build-tools) | 项目构建 | Vite, Webpack, Rollup, esbuild |
| [数据可视化](../categories/data-visualization) | 图表与 3D | D3.js, ECharts, Chart.js, Three.js |
| [状态管理](../categories/state-management) | 数据状态 | Zustand, Redux, Jotai, Pinia |
| [路由](../categories/routing) | 页面路由 | React Router, TanStack Router, Vue Router |

### 🛠️ P1 - 工程化

提升开发效率和代码质量的工具：

| 分类 | 说明 | 主要技术 |
|------|------|----------|
| [SSR/Meta 框架](../categories/ssr-meta-frameworks) | 全栈框架 | Next.js, Nuxt, Remix, Astro |
| [表单处理](../categories/form-handling) | 表单管理 | React Hook Form, Formik |
| [验证](../categories/validation) | 数据校验 | Zod, Yup, Joi |
| [样式处理](../categories/styling) | CSS 方案 | Tailwind CSS, Styled Components |

### 🔧 P2 - 后端与工具

服务器端和开发工具：

| 分类 | 说明 | 主要技术 |
|------|------|----------|
| [ORM/数据库](../categories/orm-database) | 数据访问 | Prisma, Drizzle, TypeORM |
| [测试](../categories/testing) | 测试框架 | Vitest, Jest, Playwright |
| [Linting](../categories/linting-formatting) | 代码规范 | ESLint, Prettier, Biome |
| [后端框架](../categories/backend-frameworks) | 服务端 | Express, Fastify, NestJS |

## 如何阅读

### 库信息卡片

每个库的介绍都包含以下信息：

```
┌─────────────────────────────────────┐
│  库名称                              │
│  ⭐ GitHub Stars                     │
│  ✅ TypeScript 支持状态               │
│  🔗 GitHub 链接 | 官网链接            │
│                                     │
│  一句话描述                          │
│                                     │
│  核心特点：                          │
│  • 特点 1                           │
│  • 特点 2                           │
│                                     │
│  适用场景：                          │
│  • 场景 1                           │
│  • 场景 2                           │
└─────────────────────────────────────┘
```

### 选型对比表

每个分类都包含对比表格，帮助你快速决策：

| 框架 | Stars | 趋势 | TS支持 | 适用场景 |
|------|-------|------|--------|----------|
| React | 230k+ | ⭐ | ✅ | 大型应用 |
| Vue | 202k+ | ⭐ | ✅ | 中小型应用 |

## 常用工作流

### 新项目技术选型

1. **确定项目规模**
   - 小型项目 → Vue / Svelte / Alpine.js
   - 中型项目 → React / Vue 3 / Next.js
   - 大型企业应用 → Angular / Next.js

2. **选择配套生态**
   - UI 组件库：Ant Design / MUI / shadcn/ui
   - 状态管理：Zustand / Pinia / Redux
   - 构建工具：Vite（推荐）

3. **工程化配置**
   - 代码规范：ESLint + Prettier
   - 测试框架：Vitest + Playwright
   - 类型安全：TypeScript + Zod

### 迁移升级指南

查看 [各分类页面](../categories/frontend-frameworks) 的升级建议部分，了解：
- 从 Vue 2 迁移到 Vue 3
- React Class 组件迁移到 Hooks
- Webpack 迁移到 Vite

## 贡献与反馈

### 提交新资源

发现优质资源未被收录？欢迎提交：

1. Fork 项目仓库
2. 在对应分类文件中添加内容
3. 提交 Pull Request

详见 [贡献指南](./contributing)。

### 报告问题

发现以下问题请提交 Issue：
- 信息过时或错误
- 链接失效
- 排版显示问题
- 功能建议

---

## 下一步

- 🔥 [浏览前端框架 →](../categories/frontend-frameworks)
- ⚡ [探索构建工具 →](../categories/build-tools)
- 📝 [查看贡献指南 →](./contributing)