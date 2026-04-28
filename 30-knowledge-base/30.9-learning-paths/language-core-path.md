---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 语言核心专项学习路径 (Language Core Path)

> 从能写代码到理解代码为什么这样运行，最终触及 JavaScript/TypeScript 的形式化本质。
>
> **覆盖维度**：语言核心

## 路径目标与预期产出

完成本路径后，你将能够：

- **入门**：熟练编写类型安全的 TS 代码，掌握 ES2024/ES2025 核心特性
- **进阶**：进行"类型体操"设计、准确画出事件循环时序图、理解模块解析语义
- **专家**：阅读 ECMAScript 规格说明，理解形式化语义，甚至参与编译器/类型系统的设计

**预计总周期**：6–9 周（每天 2–3 小时）

---

## 目录

- [语言核心专项学习路径 (Language Core Path)](#语言核心专项学习路径-language-core-path)
  - [路径目标与预期产出](#路径目标与预期产出)
  - [阶段一：入门 —— TypeScript 基础与 ECMAScript 现代语法 (1–2 周)](#阶段一入门--typescript-基础与-ecmascript-现代语法-12-周)
    - [节点 1.1 基础类型系统](#节点-11-基础类型系统)
    - [节点 1.2 现代 ECMAScript 特性](#节点-12-现代-ecmascript-特性)
    - [节点 1.3 变量与作用域](#节点-13-变量与作用域)
  - [阶段二：进阶 —— 类型系统深度与执行模型 (2–3 周)](#阶段二进阶--类型系统深度与执行模型-23-周)
    - [节点 2.1 高级类型与类型体操](#节点-21-高级类型与类型体操)
    - [节点 2.2 执行模型与事件循环](#节点-22-执行模型与事件循环)
    - [节点 2.3 模块系统与解析语义](#节点-23-模块系统与解析语义)
  - [阶段三：专家 —— 形式化语义与编译器设计 (3–4 周)](#阶段三专家--形式化语义与编译器设计-34-周)
    - [节点 3.1 形式化语义基础](#节点-31-形式化语义基础)
    - [节点 3.2 类型理论](#节点-32-类型理论)
    - [节点 3.3 编译器前端与元编程](#节点-33-编译器前端与元编程)
  - [阶段验证 Checkpoint](#阶段验证-checkpoint)
    - [Checkpoint 1：类型安全 EventEmitter](#checkpoint-1类型安全-eventemitter)
    - [Checkpoint 2：类型体操挑战 + 事件循环可视化](#checkpoint-2类型体操挑战--事件循环可视化)
    - [Checkpoint 3：形式化验证或玩具编译器](#checkpoint-3形式化验证或玩具编译器)
  - [推荐资源](#推荐资源)

---

## 阶段一：入门 —— TypeScript 基础与 ECMAScript 现代语法 (1–2 周)

### 节点 1.1 基础类型系统

- **关联文件/模块**：
  - `jsts-code-lab/00-language-core/`
  - `docs/cheatsheets/TYPESCRIPT_CHEATSHEET.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md`
- **关键技能**：
  - `interface` vs `type` 的核心区别
  - 泛型约束与条件类型基础
  - 类型守卫（`typeof` / `instanceof` / `in` / 自定义守卫）

### 节点 1.2 现代 ECMAScript 特性

- **关联文件/模块**：
  - `jsts-code-lab/01-ecmascript-evolution/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ecmascript-features/`
- **关键技能**：
  - ES2024/ES2025 新语法（如 `Array.prototype.toSorted`、Decorators、Records & Tuples 提案）
  - 理解 TC39 阶段流程（Stage 0–3）

### 节点 1.3 变量与作用域

- **关联文件/模块**：
  - `jsts-language-core-system/02-variable-system/`
  - `jsts-language-core-system/03-control-flow/`
- **关键技能**：
  - 词法作用域 vs 动态作用域
  - 变量提升（Hoisting）与 TDZ（Temporal Dead Zone）
  - 闭包与内存泄漏防范

---

## 阶段二：进阶 —— 类型系统深度与执行模型 (2–3 周)

### 节点 2.1 高级类型与类型体操

- **关联文件/模块**：
  - `jsts-code-lab/10-js-ts-comparison/`
  - `jsts-code-lab/40-type-theory-formal/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ADVANCED_TYPE_SYSTEM_FEATURES.md`
- **关键技能**：
  - 映射类型、模板字面量类型、递归类型
  - 类型推断的极限与边界
  - 结构类型系统 vs 名义类型系统

### 节点 2.2 执行模型与事件循环

- **关联文件/模块**：
  - `jsts-code-lab/14-execution-flow/`
  - `jsts-language-core-system/04-execution-model/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/V8_RUNTIME_THEORY.md`
- **关键技能**：
  - 宏任务 / 微任务 / `requestAnimationFrame` 的完整时序
  - V8 引擎的 Ignition + TurboFan 流水线
  - 零成本抽象在 JS/TS 中的含义与局限

### 节点 2.3 模块系统与解析语义

- **关联文件/模块**：
  - `jsts-language-core-system/08-module-system/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/MODULE_RESOLUTION_SEMANTICS.md`
- **关键技能**：
  - ESM vs CJS 的语义差异与互操作
  - `package.json` exports / imports 条件解析
  - TypeScript 的模块解析策略（`classic` vs `node` vs `bundler`）

---

## 阶段三：专家 —— 形式化语义与编译器设计 (3–4 周)

### 节点 3.1 形式化语义基础

- **关联文件/模块**：
  - `jsts-code-lab/41-formal-semantics/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/FORMAL_SEMANTICS_COMPLETE.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_TS_语言语义模型全面分析.md`
- **关键技能**：
  - 操作语义（Operational Semantics）
  - 指称语义（Denotational Semantics）
  - 使用 TLA+ 描述并发协议

### 节点 3.2 类型理论

- **关联文件/模块**：
  - `jsts-code-lab/40-type-theory-formal/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/TYPE_SOUNDNESS_ANALYSIS.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/GRADUAL_TYPING_THEORY.md`
- **关键技能**：
  - 简单类型 λ 演算
  - 子类型与 F-子类型
  - 类型健全性（Type Soundness）证明思路

### 节点 3.3 编译器前端与元编程

- **关联文件/模块**：
  - `jsts-code-lab/79-compiler-design/`
  - `jsts-code-lab/78-metaprogramming/`
  - `examples/advanced-compiler-workshop/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/COMPILER_LANGUAGE_DESIGN.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/METAPROGRAMMING_REFLECTION.md`
- **关键技能**：
  - 词法分析 / 语法分析 / AST 遍历
  - TypeScript Compiler API 与转换器编写
  - 装饰器、宏与代码生成的边界

---

## 阶段验证 Checkpoint

### Checkpoint 1：类型安全 EventEmitter

- **项目**：实现一个类型安全的 `EventEmitter`
- **代码位置**：`jsts-code-lab/00-language-core/event-emitter-typed.ts`
- **通过标准**：`vitest run` 全部通过，支持泛型事件名称与回调参数类型
- **难度**：⭐⭐ | **预计时间**：1 周

### Checkpoint 2：类型体操挑战 + 事件循环可视化

- **项目 A（类型体操）**：不借助库实现 `DeepPick<T, Path>`、 `TupleToUnion<T>` 等工具类型
  - **代码位置**：`jsts-code-lab/10-js-ts-comparison/type-challenges/`
  - **通过标准**：通过 5 道以上 hard 难度类型挑战
- **项目 B（执行模型）**：用代码 + 时序图解释一段包含 `Promise` / `setTimeout` / `async-await` 的代码执行顺序
  - **代码位置**：`jsts-code-lab/14-execution-flow/event-loop-visualization/`
  - **通过标准**：时序图与 Node.js/V8 实际输出 100% 一致
- **难度**：⭐⭐⭐⭐ | **预计时间**：2 周

### Checkpoint 3：形式化验证或玩具编译器

- **选项 A（形式化验证）**：用 TLA+ 描述并验证一个简化版的分布式锁或读写锁协议
  - **代码位置**：`jsts-code-lab/41-formal-semantics/`
  - **通过标准**：TLC 模型检查通过，所有不变量保持
- **选项 B（玩具编译器）**：实现一个支持变量声明、算术表达式、函数调用的迷你语言到 JS 的转译器
  - **代码位置**：`examples/advanced-compiler-workshop/mini-compiler/`
  - **通过标准**：通过 20+ 条测试用例，含错误处理
- **难度**：⭐⭐⭐⭐⭐ | **预计时间**：3–4 周

---

## 推荐资源

- [ECMAScript® 2025 Language Specification](https://tc39.es/ecma262/)
- [TypeScript Compiler Internals](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- *Types and Programming Languages* — Benjamin C. Pierce
- *Compilers: Principles, Techniques, and Tools* (Dragon Book)
- [TLA+ Video Course](https://lamport.azurewebsites.net/video/videos.html)

---

*最后更新: 2026-04-27*
