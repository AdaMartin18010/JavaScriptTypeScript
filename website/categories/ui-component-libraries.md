---
title: UI 组件库
description: JavaScript/TypeScript UI 组件库 完整指南
---


> 用于构建用户界面的组件库和UI框架

---

## React UI 组件库

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **shadcn/ui** | 82k⭐ | Copy-paste 组件，基于 Radix UI 和 Tailwind CSS，无需安装依赖 | ⭐⭐⭐⭐⭐ | [ui.shadcn.com](https://ui.shadcn.com) | [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) |
| **@mui/material** | 94k⭐ | Google Material Design 设计规范的 React 实现，功能全面 | ⭐⭐⭐⭐⭐ | [mui.com](https://mui.com) | [github.com/mui/material-ui](https://github.com/mui/material-ui) |
| **antd** | 93k⭐ | 企业级 UI 设计语言和 React 组件库，阿里巴巴出品 | ⭐⭐⭐⭐⭐ | [ant.design](https://ant.design) | [github.com/ant-design/ant-design](https://github.com/ant-design/ant-design) |
| **chakra-ui** | 38k⭐ | 现代简约风格的 React 组件库，注重开发体验和可访问性 | ⭐⭐⭐⭐⭐ | [chakra-ui.com](https://chakra-ui.com) | [github.com/chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui) |
| **radix-ui** | 18k⭐ | 无样式、可访问的 UI 原语，用于构建自定义组件 | ⭐⭐⭐⭐⭐ | [radix-ui.com](https://www.radix-ui.com) | [github.com/radix-ui/primitives](https://github.com/radix-ui/primitives) |
| **headlessui** | 26k⭐ | Tailwind Labs 官方出品，完全无样式、可访问的 UI 组件 | ⭐⭐⭐⭐⭐ | [headlessui.com](https://headlessui.com) | [github.com/tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) |
| **nextui** | 22k⭐ | 现代化、快速、美观的 React UI 库，基于 Tailwind CSS | ⭐⭐⭐⭐⭐ | [nextui.org](https://nextui.org) | [github.com/nextui-org/nextui](https://github.com/nextui-org/nextui) |
| **mantine** | 16k⭐ | 全功能 React 组件库，包含 120+ 组件和 Hook | ⭐⭐⭐⭐⭐ | [mantine.dev](https://mantine.dev) | [github.com/mantinedev/mantine](https://github.com/mantinedev/mantine) |

---

## Vue UI 组件库

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **element-plus** | 24k⭐ | Element UI 的 Vue 3 版本，桌面端组件库 | ⭐⭐⭐⭐⭐ | [element-plus.org](https://element-plus.org) | [github.com/element-plus/element-plus](https://github.com/element-plus/element-plus) |
| **ant-design-vue** | 19k⭐ | Ant Design 的 Vue 实现，企业级 UI 组件 | ⭐⭐⭐⭐⭐ | [antdv.com](https://www.antdv.com) | [github.com/vueComponent/ant-design-vue](https://github.com/vueComponent/ant-design-vue) |
| **vuetify** | 38k⭐ | Material Design 组件框架，Vue 3 官方推荐 | ⭐⭐⭐⭐⭐ | [vuetifyjs.com](https://vuetifyjs.com) | [github.com/vuetifyjs/vuetify](https://github.com/vuetifyjs/vuetify) |
| **naive-ui** | 16k⭐ | 图森未来出品，Vue 3 组件库，注重性能和类型安全 | ⭐⭐⭐⭐⭐ | [naiveui.com](https://www.naiveui.com) | [github.com/tusen-ai/naive-ui](https://github.com/tusen-ai/naive-ui) |
| **quasar** | 25k⭐ | 高性能 Vue 框架，支持 SPA、SSR、PWA、桌面和移动端 | ⭐⭐⭐⭐⭐ | [quasar.dev](https://quasar.dev) | [github.com/quasarframework/quasar](https://github.com/quasarframework/quasar) |

---

## 跨框架 UI 组件

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **@tanstack/table** | 11k⭐ | 用于构建表格和数据网格的 Headless UI，支持 React、Vue、Svelte、Solid | ⭐⭐⭐⭐⭐ | [tanstack.com/table](https://tanstack.com/table) | [github.com/TanStack/table](https://github.com/TanStack/table) |
| **@tanstack/virtual** | 5k⭐ | 用于虚拟化长列表的 Headless UI，支持多个框架 | ⭐⭐⭐⭐⭐ | [tanstack.com/virtual](https://tanstack.com/virtual) | [github.com/TanStack/virtual](https://github.com/TanStack/virtual) |

---

## 选型建议

### React 项目

| 场景 | 推荐库 |
|------|--------|
| 快速搭建/企业后台 | **antd** / **@mui/material** |
| 高度定制化设计 | **shadcn/ui** / **radix-ui** |
| 极简现代风格 | **chakra-ui** / **nextui** |
| 已有 Tailwind 项目 | **shadcn/ui** / **headlessui** |
| 全功能一站式 | **mantine** |

### Vue 项目

| 场景 | 推荐库 |
|------|--------|
| 企业后台系统 | **element-plus** / **ant-design-vue** |
| Material Design | **vuetify** |
| 高性能要求 | **naive-ui** |
| 多端统一开发 | **quasar** |

---

## 相关分类

- [状态管理](./state-management.md)
- [表单处理](./form-handling.md)
- [样式处理](./styling.md)
