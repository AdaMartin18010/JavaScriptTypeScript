# Advanced Compiler Workshop —— TypeScript 类型系统底层实现

> **目标受众**：已掌握 TypeScript 日常使用、希望深入理解类型系统底层机制的高级开发者。
>
> **前置知识**：基本编译原理（词法/语法分析概念）、TypeScript 泛型基础。

---

## 工作坊概述

本工作坊通过**手写一个 Mini TypeScript 编译器子集**，带你从递归下降解析器出发，逐步实现：

1. **词法分析与语法分析** —— 理解 Token → AST 的转换
2. **基础类型检查器** —— 实现结构化类型系统（Structural Typing）
3. **泛型推断** —— 基于约束的局部推断（Constraint-based Inference）
4. **条件类型** —— 实现 `extends ? :` 与 `infer` 的求值机制
5. **类型体操** —— 12 道渐进式挑战，从递归映射到 JSON Parser 类型

每一阶段都建立在上一阶段的基础上，最终你将拥有一个**可运行的类型检查器原型**，并能理解 TypeScript 编译器 `checker.ts` 中核心算法的简化版。

---

## 项目结构

```
examples/advanced-compiler-workshop/
├── README.md                           # 本文件
├── MILESTONES.md                       # 总路线图与理论关联
├── milestone-01-mini-parser/           # 迷你解析器
├── milestone-02-type-checker-basics/   # 基础类型检查器
├── milestone-03-generic-inference/     # 泛型推断
├── milestone-04-conditional-types/     # 条件类型与映射类型
└── milestone-05-type-challenges/       # 类型体操工坊（12 题）
```

---

## 快速开始

```bash
# 在项目根目录安装依赖（若尚未安装）
pnpm install

# 运行全部测试
pnpm test examples/advanced-compiler-workshop

# 运行单个里程碑的测试
pnpm test examples/advanced-compiler-workshop/milestone-01-mini-parser
```

---

## 与现有代码模块的关联

| 工作坊里程碑 | 关联的代码实验室模块 | 理论文档 |
|-------------|-------------------|---------|
| Milestone 1 | `jsts-code-lab/79-compiler-design/` | 词法分析、语法分析、AST |
| Milestone 2 | `jsts-code-lab/40-type-theory-formal/02-subtyping/` | 结构子类型 |
| Milestone 3 | `jsts-code-lab/40-type-theory-formal/01-type-inference/` | Hindley-Milner 推断 |
| Milestone 4 | `jsts-code-lab/40-type-theory-formal/THEORY.md` | 条件类型理论 |
| Milestone 5 | `jsts-code-lab/78-metaprogramming/` | 模板字面量类型、类型级编程 |

---

## 核心设计理念

### 1. 教学优先，严谨第二

代码刻意保持精简，省略了真实编译器中 90% 的边界情况处理，但**保留核心算法骨架**。例如：

- 解析器只支持 TypeScript 子集（无类、无模块、无装饰器）
- 类型检查器不做控制流分析（CFA）
- 错误恢复策略采用简单的 panic mode

### 2. 类型即值（Types as Values）

本工作坊在**值层面**实现类型检查器（运行时操作类型对象），而 Milestone 5 的类型体操则在**类型层面**（纯 TS 类型系统）解决问题。两者对照，可深刻理解 TS 编译器如何将类型逻辑"编译"到类型检查过程中。

### 3. 渐进式复杂度

| 里程碑 | 代码行数（约） | 新概念 |
|-------|-------------|--------|
| M1 | 400 | Token, AST, 递归下降 |
| M2 | 500 | 环境、子类型、类型错误 |
| M3 | 400 | 类型参数、替换、约束 |
| M4 | 450 | 条件类型求值、映射类型 |
| M5 | 600 | 递归类型、模板字面量、分布式条件类型 |

---

## 延伸阅读

- **Books**
  - Pierce, B.C. *Types and Programming Languages* (TaPL) —— 类型系统圣经
  - Harper, R. *Practical Foundations for Programming Languages* (PFPL)
- **Papers**
  - Milner, R. "A Theory of Type Polymorphism in Programming" (1978) —— HM 算法原文
  - Microsoft. "TypeScript 编译器内部文档" —— `checker.ts` 架构
- **Online**
  - [TypeScript Compiler Internals](https://github.com/RichardLitt/meta-knowledge/blob/master/typescript-compiler-internals.md)
  - [Type Challenge](https://github.com/type-challenges/type-challenges) —— 本 Milestone 5 的灵感来源

---

> **注意**：本工作坊的代码**不是生产级编译器**。它是教学工具，用于揭示 TypeScript 类型系统的核心机制。如果你需要构建真实编译器，请参考 TypeScript 官方源码或 SWC、Oxc 等现代工具链。
