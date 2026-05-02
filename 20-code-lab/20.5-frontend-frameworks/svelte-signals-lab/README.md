# Svelte Signals Lab — 前端框架代码实验室

> **专题**: 20.5-frontend-frameworks | **技术栈**: Svelte 5 + SvelteKit + TypeScript

本实验室包含三个由浅入深的 Svelte 5 实战项目，覆盖从基础 Runes 语法到全栈应用、再到高级数据可视化的完整学习路径。

---

## 📁 项目总览

| 序号 | 项目名称 | 难度等级 | 核心主题 |
|:----:|---------|:--------:|---------|
| 01 | [Todo App](./01-todo-app/) | ⭐ 入门 (Level 1–2) | Svelte 5 Runes 基础、组件通信、状态管理 |
| 02 | [Blog Platform](./02-blog-platform/) | ⭐⭐⭐ 进阶 (Level 4) | 全栈路由、服务端加载、Form Actions、API 路由 |
| 03 | [Dashboard Analytics](./03-dashboard-analytics/) | ⭐⭐⭐⭐⭐ 高级 (Level 5–6) | Actions、D3 集成、实时数据、复杂组件交互 |

---

## 🎯 学习路径建议

```
01-todo-app
    ↓ 掌握 Runes 基础与组件化思维
02-blog-platform
    ↓ 理解 SvelteKit 全栈能力与数据流
03-dashboard-analytics
    ↓ 深入 Actions、外部库集成与性能优化
```

1. **从 01 开始**：即使你有 Svelte 4 经验，也建议先过一遍 Todo App，熟悉 `$state`、`$derived`、`$effect`、`$props` 的新范式。
2. **进入 02**：学习 SvelteKit 的文件系统路由、`+page.server.ts` 的 `load` / `actions`、以及渐进增强表单。
3. **挑战 03**：综合运用 Runes + Svelte Actions + D3.js，理解如何在复杂 Dashboard 中管理多维度响应式数据。

---

## 📋 前置知识要求

- **HTML / CSS / JavaScript** 基础扎实
- **TypeScript** 基本类型语法（接口、泛型、类型推断）
- **现代前端概念**：组件化、响应式编程、ESM 模块
- **（推荐）Node.js** 环境：`>= 20`
- **（可选）Svelte 4 经验**：有助于快速对比理解 Runes 的变化

---

## 🚀 快速开始

每个子项目都是独立的 SvelteKit 应用，可分别进入运行：

```bash
cd 01-todo-app
npm install
npm run dev

# 或进入其他项目
cd ../02-blog-platform
npm install
npm run dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run test` / `npm run test:unit` | 运行 Vitest 单元测试 |
| `npm run test:e2e` | 运行 Playwright E2E 测试 |
| `npm run check` | Svelte 类型检查 |

---

## 🏗 技术栈版本

| 依赖 | 版本要求 | 说明 |
|------|---------|------|
| Svelte | `^5.55.0` | UI 框架（Runes 语法） |
| SvelteKit | `^2.59.0` | 全栈应用框架 |
| Vite | `^6.3.0` | 构建工具与开发服务器 |
| TypeScript | `^5.x` | 类型安全 |
| Vitest | `^1.x / ^2.x` | 单元测试 |
| Playwright | `^1.x` | E2E 测试 |

---

## 📚 对应知识库章节

- **10.2-type-system** — TypeScript 与 Svelte 5 类型集成
- **20.5-frontend-frameworks** — Svelte 5 Runes 深度实践
- **20.12-build-free-typescript** — Vite + Svelte 构建工具链

---

## 📄 License

MIT
