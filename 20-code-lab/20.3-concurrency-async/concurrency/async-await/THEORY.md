# Async/Await

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/async-await`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决异步代码可读性的问题。通过 async/await 语法糖将基于 Promise 的异步流程转换为同步风格的代码结构。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 语法糖 | Promise 的同步风格封装 | async-await.ts |
| 错误传播 | try/catch 对 reject 的捕获 | error-handling.ts |

---

## 二、设计原理

### 2.1 为什么存在

回调函数和 Promise 链在处理复杂异步流程时可读性差。async/await 语法将异步代码转换为类似同步的结构，显著降低了认知负担。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| async/await | 可读性强 | 错误堆栈丢失 | 顺序异步 |
| Promise 链 | 组合灵活 | 嵌套地狱 | 复杂并行 |

### 2.3 与相关技术的对比

与 Goroutines 对比：async/await 显式调度，Goroutines 隐式调度。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Async/Await 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| await 会阻塞线程 | await 挂起协程，不阻塞事件循环 |
| async 函数总是并行执行 | 连续的 await 是顺序执行 |

### 3.3 扩展阅读

- [Async Functions V8](https://v8.dev/features/async-await)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
