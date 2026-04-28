---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
category-boundary: language-core
---

# 语言核心（Language Core）

> 本分类专注于 **JavaScript / TypeScript 语言本身**，与框架、运行时平台、工程工具链保持清晰的边界。
>
> **边界说明**：本文档仅收录与语法、语义、类型系统、执行模型、规范直接相关的内容。前端框架（React/Vue）、构建工具（Vite/Webpack）、运行时平台（Node.js/Deno 平台特性而非语言语义）等请参见其他分类。

---

## 📋 分类边界

### ✅ 属于语言核心

- 语法与语义（Syntax & Semantics）
- 类型系统（Type System）与类型推断
- 变量声明、作用域链、闭包
- 控制流：条件、循环、异常、生成器
- 执行模型：调用栈、执行上下文、事件循环
- 模块系统：ESM、CommonJS、模块解析
- 对象模型、原型链、Proxy / Reflect
- 异步编程：Promise、async/await、Task Queues
- ECMAScript 规范基础（抽象操作、内部方法、Realm）
- JavaScript / TypeScript 语义差异与类型擦除

### ❌ 不属于语言核心（参见其他分类）

| 内容 | 所属分类 |
|------|---------|
| React / Vue / Angular 等前端框架 | [01-frontend-frameworks.md](./01-frontend-frameworks.md) |
| Vite / Webpack / Rollup 等构建工具 | [03-build-tools.md](./03-build-tools.md) |
| Node.js 平台 API（fs、http、cluster） | [14-backend-frameworks.md](./14-backend-frameworks.md) |
| 测试框架（Jest / Vitest） | [12-testing.md](./12-testing.md) |
| 部署与 CI/CD | [24-ci-cd-devops.md](./24-ci-cd-devops.md) |
| 数据库与 ORM | [11-orm-database.md](./11-orm-database.md) |

---

## 🗺️ 内容导航

### 深度理论系统

| 目录 | 专题 | 文件数 |
|------|------|--------|
| [jsts-language-core-system/01-type-system/](../../jsts-language-core-system/01-type-system/) | 类型系统 | 12+ |
| [jsts-language-core-system/02-variable-system/](../../jsts-language-core-system/02-variable-system/) | 变量系统 | 9+ |
| [jsts-language-core-system/03-control-flow/](../../jsts-language-core-system/03-control-flow/) | 控制流 | 9+ |
| [jsts-language-core-system/04-execution-model/](../../jsts-language-core-system/04-execution-model/) | 执行模型 | 11+ |
| [jsts-language-core-system/05-execution-flow/](../../jsts-language-core-system/05-execution-flow/) | 执行流 | 6+ |
| [jsts-language-core-system/06-ecmascript-spec-foundation/](../../jsts-language-core-system/06-ecmascript-spec-foundation/) | 规范基础 | 6+ |
| [jsts-language-core-system/07-js-ts-symmetric-difference/](../../jsts-language-core-system/07-js-ts-symmetric-difference/) | JS/TS 对称差 | 6 |
| [jsts-language-core-system/08-module-system/](../../jsts-language-core-system/08-module-system/) | 模块系统 | 6+ |
| [jsts-language-core-system/09-object-model/](../../jsts-language-core-system/09-object-model/) | 对象模型 | 5+ |

### 代码实验室

| 目录 | 主题 |
|------|------|
| [jsts-code-lab/00-language-core/](../../jsts-code-lab/00-language-core/) | 语言核心基础（类型、变量、控制流、函数、对象、模块、元编程） |
| [jsts-code-lab/01-ecmascript-evolution/](../../jsts-code-lab/01-ecmascript-evolution/) | ECMAScript 演进史（ES2015–ES2026） |
| [jsts-code-lab/02-design-patterns/](../../jsts-code-lab/02-design-patterns/) | 设计模式（创建型 / 结构型 / 行为型 / JS-TS 特定模式） |
| [jsts-code-lab/03-concurrency/](../../jsts-code-lab/03-concurrency/) | 并发编程（Promise、async/await、Worker、Atomics、事件循环） |
| [jsts-code-lab/04-data-structures/](../../jsts-code-lab/04-data-structures/) | 数据结构（内置 / 自定义 / 函数式） |
| [jsts-code-lab/05-algorithms/](../../jsts-code-lab/05-algorithms/) | 算法（排序、搜索、动态规划、图、递归） |
| [jsts-code-lab/10-js-ts-comparison/](../../jsts-code-lab/10-js-ts-comparison/) | JavaScript / TypeScript 对比分析 |

### 全景综述

| 文档 | 说明 |
|------|------|
| [JSTS全景综述/01_language_core.md](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md) | ES2020–ES2026 特性全览 |
| [JSTS全景综述/04_concurrency.md](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md) | 并发模型全景 |
| [JSTS全景综述/ecmascript-features/](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ecmascript-features/) | 分版本 ECMAScript 特性深度文档 |

---

## 📚 学习路径

| 阶段 | 目标 | 推荐文档 |
|------|------|---------|
| 入门 | 掌握语法与基础语义 | `jsts-code-lab/00-language-core/` → `jsts-language-core-system/02-variable-system/` |
| 进阶 | 理解类型系统与执行模型 | `jsts-language-core-system/01-type-system/` → `04-execution-model/` |
| 深入 | 掌握规范与引擎原理 | `jsts-language-core-system/06-ecmascript-spec-foundation/` → `JSTS全景综述/JS_TS_语言语义模型全面分析.md` |

---

## 🔗 相关索引

- [语言核心总索引](../language-core-index.md) — 完整的跨目录导航与学习路径
- [TypeScript 速查表](../cheatsheets/TYPESCRIPT_CHEATSHEET.md)
- [JS 语言核心速查表](../cheatsheets/JS_LANGUAGE_CORE_CHEATSHEET.md)
