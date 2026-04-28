# 🎯 Todo Master — 零基础到部署的渐进式实战项目

> **JavaScript / TypeScript 全景知识库** 官方配套实战项目
> 通过 6 个渐进式里程碑，从零构建一个功能完整的 Todo 应用，掌握现代前端开发核心技能。

---

## 📖 项目介绍

本项目专为**零基础或初级开发者**设计，采用「渐进式增强」的教学理念：

- **不跳步**：每一里程碑都基于上一里程碑演化，代码可追踪
- **可运行**：每个里程碑都是独立可运行的完整项目
- **重基础**：强调语言核心（JS/TS）与工程思维，而非框架 API 背诵
- **真实战**：最终产物可直接部署到生产环境（Vercel）

### 你将学会什么

| 阶段 | 技能 | 工程思维 |
|------|------|----------|
| Milestone 1 | 原生 JS、DOM API、ES6+ 语法 | 事件委托、模块化拆分 |
| Milestone 2 | TypeScript 类型系统 | 类型安全、接口设计 |
| Milestone 3 | React 18、JSX、Hooks | 组件化思维、单向数据流 |
| Milestone 4 | useReducer、Context API | 状态设计模式、中间件思想 |
| Milestone 5 | Vitest、Testing Library | TDD、测试用例设计 |
| Milestone 6 | Vite、Vercel、GitHub Actions | CI/CD、现代部署流程 |

---

## 🚀 前置要求

- **Node.js**: `>= 18.0.0`（推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理）
- **包管理器**: `npm`（v9+）或 `pnpm` / `yarn`
- **编辑器**: [VS Code](https://code.visualstudio.com/)（推荐安装 ESLint、Prettier 插件）
- **Git 基础**: 了解基本的 `clone`、`commit`、`push` 操作

验证环境：

```bash
node -v    # v18.x.x 或更高
npm -v     # 9.x.x 或更高
```

---

## 📁 总体目录结构

```
beginner-todo-master/
├── README.md                    # 本文件：项目总览与学习指南
├── MILESTONES.md               # 6 个里程碑的详细路线图
│
├── milestone-01-vanilla-js/    # 原生 JavaScript + DOM
├── milestone-02-typescript/    # 迁移到 TypeScript
├── milestone-03-react/         # React 组件化重构
├── milestone-04-state-mgmt/    # useReducer + Context 状态管理
├── milestone-05-testing/       # Vitest + Testing Library 测试
└── milestone-06-deploy/        # Vite 构建 + Vercel 部署 + CI/CD
```

> **学习建议**：按数字顺序逐个完成，每个里程碑的 `README.md` 都包含学习目标、关键代码讲解和常见错误排查。

---

## 🛠️ 如何运行

每个里程碑都是独立的，进入对应目录后：

```bash
# 以里程碑 1 为例
cd milestone-01-vanilla-js
npm install      # 安装依赖（里程碑1无需此步）
npm run dev      # 启动开发服务器
```

| 里程碑 | 启动命令 | 访问地址 |
|--------|----------|----------|
| 01 | `npx serve src` 或直接用 Live Server | `http://localhost:3000` |
| 02 | `npm run dev` | `http://localhost:5173` |
| 03-06 | `npm run dev` | `http://localhost:5173` |

---

## 🧭 学习路线图速览

| 里程碑 | 主题 | 预计用时 | 核心产出 |
|--------|------|----------|----------|
| [01](milestone-01-vanilla-js/) | Vanilla JS + DOM | 2-3 小时 | 可交互的 Todo 页面 |
| [02](milestone-02-typescript/) | TypeScript 迁移 | 1-2 小时 | 类型安全的代码 |
| [03](milestone-03-react/) | React 组件化 | 2-3 小时 | 组件化 Todo 应用 |
| [04](milestone-04-state-mgmt/) | 状态管理 | 2-3 小时 | 带筛选的全局状态应用 |
| [05](milestone-05-testing/) | 测试驱动 | 2-3 小时 | 高测试覆盖率的代码 |
| [06](milestone-06-deploy/) | 构建与部署 | 1-2 小时 | 线上可访问的应用 |

> 总预计用时：**10-16 小时**，建议分 2-3 天完成。

---

## 🎓 教学理念

1. **最小可行知识**：每个里程碑只引入必要的新概念，不堆砌技术
2. **代码即文档**：所有代码包含详细中文注释，解释「为什么」而非「是什么」
3. **错误驱动学习**：每个里程碑的 README 都包含「常见错误排查」，从真实错误中学习
4. **现代最佳实践**：即使里程碑 1 的原生 JS，也使用 ES6+ 现代语法和模块化思维

---

## 📚 相关资源

- [JavaScript/TypeScript 全景知识库](../README.md)
- [MILESTONES.md](MILESTONES.md) — 详细学习路线图
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 如何贡献改进

---

## 📝 License

MIT © JavaScript/TypeScript 全景知识库贡献者


---

## 🔗 关联知识库模块

完成本项目后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本项目的关联 |
|------|------|---------------|
| 语言核心 | `jsts-code-lab/00-language-core/` | ES2025+ 语法、闭包、原型链、事件循环 |
| 设计模式 | `jsts-code-lab/02-design-patterns/` | 观察者模式、策略模式、工厂模式在 UI 中的应用 |
| 前端框架 | `jsts-code-lab/18-frontend-frameworks/` | React/Vue 组件化、Hooks 原理、状态管理 |
| 测试基础 | `jsts-code-lab/07-testing/` | 单元测试、TDD、Testing Library 最佳实践 |
| 类型系统 | `jsts-code-lab/10-js-ts-comparison/` | TypeScript 类型推断、泛型、类型体操 |

> 📚 [返回知识库首页](../README.md)
