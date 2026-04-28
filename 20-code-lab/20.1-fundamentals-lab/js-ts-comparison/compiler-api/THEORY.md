# TypeScript 编译器 API

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/compiler-api`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块探索 TypeScript 编译器 API 的能力边界，解决程序化地操作 AST、类型检查和代码生成的问题。通过编译器 API 可以实现自定义代码转换、lint 工具和文档生成。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| AST | 抽象语法树，源代码的结构化表示 | parser.ts |
| TypeChecker | 类型检查与推断引擎 | checker.ts |
| Emitter | 代码生成与输出模块 | emitter.ts |

---

## 二、设计原理

### 2.1 为什么存在

TypeScript 编译器不仅是一个命令行工具，其内部 API 暴露了整个语言服务的管道。这使得社区能够构建代码生成器、自定义 linter、迁移工具和 IDE 扩展。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ts-morph | 高阶抽象、易用 | 额外依赖体积 | 代码生成工具 |
| 原生 Compiler API | 功能完整、官方维护 | 学习曲线陡峭 | 深度定制编译流程 |

### 2.3 与相关技术的对比

与 Babel AST 工具对比：TS Compiler API 提供类型信息，Babel 专注语法转换。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 TypeScript 编译器 API 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 编译器 API 仅用于构建工具 | 也可用于代码生成、迁移工具、IDE 插件 |
| AST 操作不会影响类型检查 | 结构修改后需重新触发类型分析 |

### 3.3 扩展阅读

- [TypeScript Compiler API 文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- `10-fundamentals/10.5-type-system/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
