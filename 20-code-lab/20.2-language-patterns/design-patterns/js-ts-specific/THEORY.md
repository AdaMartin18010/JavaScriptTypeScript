# JS/TS 特定模式

> **定位**：`20-code-lab/20.2-language-patterns/design-patterns/js-ts-specific`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 JavaScript 与 TypeScript 生态中特有的设计问题。涵盖模块模式、混入、branded types 等语言特定的惯用法。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 模块模式 | IIFE 封装私有作用域 | module-pattern.ts |
| Branded Type | 名义类型的模拟实现 | branded-types.ts |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 的动态特性和 TypeScript 的类型系统产生了独特的编程模式。这些模式充分利用了语言特性，是在 JS/TS 生态中高效开发的必备知识。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 模块模式 | 私有作用域 | 内存占用 | 兼容旧环境 |
| 类与接口 | 传统 OOP 熟悉感 | 运行时无类型 | 大型团队协作 |

### 2.3 与相关技术的对比

与经典 GoF 对比：JS/TS 模式充分利用动态特性和类型系统。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 JS/TS 特定模式 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| TS 类型影响运行时 | 类型擦除后运行时无类型信息 |
| any 是类型系统的逃生舱 | 过度使用 any 等于放弃类型安全 |

### 3.3 扩展阅读

- [JavaScript Patterns](https://shichuan.github.io/javascript-patterns/)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
