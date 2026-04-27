# 初学者学习路径 (Beginner Path)

> 目标人群：零基础或初级前端开发者
> 预计周期：4-6 周
> 前置要求：了解基本的 HTML/CSS

---

## 路径概览

```
Week 1-2: JavaScript 语言核心
    ├── 变量与数据类型
    ├── 控制流与函数
    ├── 数组与对象操作
    └── 作用域与闭包

Week 3-4: TypeScript 基础
    ├── 类型系统入门
    ├── 接口与类型别名
    ├── 泛型基础
    └── 类型推断与类型断言

Week 5: 现代开发工具链
    ├── Node.js 与 npm
    ├── Vite 项目搭建
    ├── Git 版本控制
    └── 调试技巧

Week 6: 实战项目
    ├── Todo 应用 (Vanilla JS)
    ├── Todo 应用 (TypeScript)
    └── 代码审查与重构
```

---

## Week 1-2: JavaScript 语言核心

### 学习目标
- 掌握 JavaScript 基础语法和核心概念
- 理解同步/异步执行模型
- 能够编写简洁、可维护的函数

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 变量系统 | `JSTS全景综述/01_language_core.md` §变量 | `jsts-code-lab/00-language-core/` | 4h |
| 控制流 | `jsts-language-core-system/03-control-flow/` | `jsts-code-lab/00-language-core/control-flow.ts` | 3h |
| 函数与高阶函数 | `JSTS全景综述/01_language_core.md` §函数 | `jsts-code-lab/02-design-patterns/functional-patterns.ts` | 4h |
| 数组方法 | `JSTS全景综述/01_language_core.md` §数组 | `jsts-code-lab/04-data-structures/array-operations.ts` | 3h |
| 异步编程 | `JSTS全景综述/04_concurrency.md` §Promise | `jsts-code-lab/03-concurrency/promise-basics.ts` | 5h |

### Checkpoint 1: JavaScript 基础验证

完成以下挑战以验证掌握程度：

1. **数据类型挑战**：编写一个函数 `deepClone(obj)`，正确处理 `Date`、`RegExp`、`Map`、`Set` 和循环引用。
2. **闭包挑战**：实现一个计数器工厂 `createCounter(initial)`，支持 `increment()`、`decrement()`、`getValue()` 和 `reset()`。
3. **异步挑战**：使用 `fetch` 并行请求 3 个 API，当任一请求失败时重试最多 2 次，最终返回所有成功结果。

---

## Week 3-4: TypeScript 基础

### 学习目标
- 理解静态类型的价值
- 掌握常用类型注解和接口定义
- 能够阅读和使用第三方库的类型定义

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 类型基础 | `jsts-language-core-system/01-type-system/01-basic-types.md` | `jsts-code-lab/10-js-ts-comparison/type-basics.ts` | 4h |
| 接口与类型 | `jsts-language-core-system/01-type-system/03-interfaces-vs-types.md` | `jsts-code-lab/10-js-ts-comparison/interface-patterns.ts` | 3h |
| 泛型 | `jsts-language-core-system/01-type-system/05-generics.md` | `jsts-code-lab/10-js-ts-comparison/generics-lab.ts` | 5h |
| 类型推断 | `jsts-language-core-system/01-type-system/02-type-inference.md` | `jsts-code-lab/10-js-ts-comparison/inference-patterns.ts` | 2h |
| 类型体操入门 | `jsts-language-core-system/01-type-system/08-conditional-types.md` | `jsts-code-lab/10-js-ts-comparison/conditional-types.ts` | 4h |

### Checkpoint 2: TypeScript 基础验证

1. **类型安全挑战**：为以下数据结构编写完整的类型定义：一个博客系统（Post、Comment、User、Tag 及其关系）。
2. **泛型挑战**：实现一个类型安全的 `EventEmitter<T>`，其中 `T` 是事件名称到参数类型的映射。
3. **类型推导挑战**：不使用 `any`，实现一个 `deepPartial<T>` 工具类型，将所有嵌套属性变为可选。

---

## Week 5: 现代开发工具链

### 学习目标
- 能够独立搭建开发环境
- 理解模块化开发和包管理
- 掌握基本的调试和测试方法

### 学习资源

| 主题 | 文档/实践 | 预计时间 |
|------|----------|---------|
| Node.js 基础 | `jsts-code-lab/90-web-apis-lab/nodejs-basics.ts` | 3h |
| npm/pnpm 包管理 | `jsts-code-lab/12-package-management/npm-basics.ts` | 2h |
| Vite 项目搭建 | `examples/beginner-todo-master/` | 4h |
| Vitest 测试入门 | `jsts-code-lab/07-testing/vitest-basics.ts` | 3h |
| Git 工作流 | `docs/guides/git-workflow-guide.md` | 2h |

### Checkpoint 3: 工具链验证

1. 从零搭建一个 Vite + TypeScript 项目，配置 ESLint + Prettier + Vitest。
2. 为 Week 3 的类型挑战编写单元测试，覆盖率 >80%。
3. 使用 Git 管理项目，包含 feature branch、PR、merge 的完整流程。

---

## Week 6: 实战项目

### 项目：完整的 Todo 应用

**功能要求**：
- ✅ 添加/编辑/删除任务
- ✅ 任务分类（工作/个人/学习）
- ✅ 优先级和截止日期
- ✅ 本地存储持久化
- ✅ 筛选和排序
- ✅ TypeScript 全类型覆盖
- ✅ 单元测试覆盖率 >70%

**关联资源**：
- 示例项目：`examples/beginner-todo-master/`
- 代码实践：`jsts-code-lab/00-language-core/`, `jsts-code-lab/02-design-patterns/`
- 理论文档：`JSTS全景综述/01_language_core.md`

### 最终 Checkpoint：项目评审

- [ ] 代码通过 ESLint + TypeScript 严格模式检查
- [ ] 所有功能有对应的单元测试
- [ ] README 包含项目说明、安装步骤和截图
- [ ] 使用 Git 提交历史清晰（至少 10 个有意义的 commit）

---

## 完成此路径后，你应该能够...

- 熟练编写现代 JavaScript (ES2025+) 代码
- 使用 TypeScript 构建类型安全的应用
- 独立搭建开发环境和项目结构
- 理解异步编程和事件驱动模型
- 编写基本的单元测试

**下一步**：进入 [进阶工程师路径](./advanced-path.md)

---

*最后更新: 2026-04-27*
*review-cycle: 6 months*
*next-review: 2026-10-27*
*status: current*
