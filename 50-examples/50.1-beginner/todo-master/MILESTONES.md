# 🗺️ Todo Master 学习路线图

> 本文档是 6 个里程碑的总览与导航，建议按顺序完成。每个里程碑的详细内容请进入对应目录查看 `README.md`。

---

## 里程碑总览

```
里程碑 1: Vanilla JS + DOM ───────┐
                                   ├──→ 里程碑 3: React 组件化 ──→ 里程碑 4: 状态管理 ──→ 里程碑 5: 测试 ──→ 里程碑 6: 部署
里程碑 2: TypeScript 迁移 ─────────┘
```

---

## 里程碑 1：原生 JavaScript + DOM

**目标**：不借助任何框架，用原生技术实现完整功能

- **前置知识**：HTML/CSS 基础、JS 基本语法
- **新学技能**：
  - DOM API（`querySelector`、`addEventListener`、`createElement`）
  - ES6+ 语法（箭头函数、解构赋值、模板字符串、展开运算符）
  - 事件委托模式
  - `localStorage` 本地持久化
  - 模块化拆分（ES Modules）
- **关键产出**：`src/app.js`、`src/storage.js`、`src/dom-utils.js`
- **下一步**：理解「为什么需要类型」→ 进入里程碑 2

---

## 里程碑 2：TypeScript 迁移

**目标**：在里程碑 1 基础上，全面引入类型系统

- **前置知识**：里程碑 1 的全部内容
- **新学技能**：
  - 基础类型（`string`、`number`、`boolean`、`[]`、`{}`）
  - 接口（`interface`）与类型别名（`type`）
  - 函数类型、可选参数、返回值类型
  - 类型推断与类型断言
  - `tsconfig.json` 配置（`strict: true`）
- **关键产出**：类型化的 `storage.ts`、`dom-utils.ts`、`app.ts`
- **下一步**：理解「为什么需要组件化」→ 进入里程碑 3

---

## 里程碑 3：React 组件化

**目标**：用 React 18 重构，体验声明式 UI 与组件化思维

- **前置知识**：里程碑 2 的全部内容
- **新学技能**：
  - Vite 项目脚手架
  - JSX 语法与编译原理
  - 函数组件与 Props 传递
  - `useState` Hook 管理本地状态
  - 组件拆分策略（容器组件 / 展示组件）
- **关键产出**：`App.tsx`、`TodoList.tsx`、`TodoItem.tsx`、`TodoForm.tsx`
- **下一步**：状态分散在组件间难以管理 → 进入里程碑 4

---

## 里程碑 4：状态管理

**目标**：用 `useReducer` + `Context API` 实现全局状态管理

- **前置知识**：里程碑 3 的全部内容
- **新学技能**：
  - `useReducer`：Redux 模式轻量化实现
  - `createContext` + `useContext`：跨组件通信
  - 中间件思想：localStorage 持久化层
  - 状态设计原则（单一数据源、不可变更新）
  - 筛选功能（全部 / 进行中 / 已完成）
- **关键产出**：`todoReducer.ts`、`TodoContext.tsx`、`FilterBar.tsx`
- **下一步**：代码变复杂，需要自动化测试保障 → 进入里程碑 5

---

## 里程碑 5：测试驱动

**目标**：为应用添加单元测试和组件测试

- **前置知识**：里程碑 4 的全部内容
- **新学技能**：
  - Vitest 测试框架配置与使用
  - React Testing Library（查询、事件、断言）
  - 测试用例设计（AAA 模式：Arrange-Act-Assert）
  - Mock `localStorage` 与外部依赖
  - 测试覆盖率（Coverage）
- **关键产出**：`todoReducer.test.ts`、`TodoList.test.tsx`、`TodoItem.test.tsx`
- **下一步**：测试通过，准备上线 → 进入里程碑 6

---

## 里程碑 6：构建与部署

**目标**：工程化收尾，将应用部署到互联网

- **前置知识**：里程碑 5 的全部内容
- **新学技能**：
  - Vite 生产构建配置（`vite.config.ts`）
  - 环境变量管理（`.env`）
  - Vercel 部署配置（`vercel.json`）
  - GitHub Actions CI/CD 工作流
  - 自动化流水线：安装 → 测试 → 构建 → 部署
- **关键产出**：`vercel.json`、`.github/workflows/deploy.yml`
- **完成标志**：获得一个 `https://xxx.vercel.app` 的线上地址

---

## 🎯 完成检查清单

- [ ] 里程碑 1：能在浏览器中添加/完成/删除 Todo，刷新后数据不丢失
- [ ] 里程碑 2：`npm run build` 无类型错误，`tsc --noEmit` 通过
- [ ] 里程碑 3：React 版本与里程碑 1 功能一致，代码更清晰
- [ ] 里程碑 4：支持「全部/进行中/已完成」筛选，状态管理无 Prop Drilling
- [ ] 里程碑 5：`npm test` 全部通过，核心逻辑测试覆盖
- [ ] 里程碑 6：成功部署到 Vercel，每次 push 自动更新

---

## 💡 学习建议

1. **不要复制粘贴**：手敲每一行代码，肌肉记忆是编程学习的关键
2. **故意犯错**：尝试修改代码看会发生什么，README 中的「常见错误」都是真实踩坑记录
3. **对比学习**：完成里程碑 3 后，回头对比里程碑 1 的代码，体会「为什么需要框架」
4. **记录笔记**：建议在学习过程中维护一个「疑问清单」，完成后统一查阅 [全景知识库](../../README.md)
