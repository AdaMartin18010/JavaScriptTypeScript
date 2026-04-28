# Promise

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/promises`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决回调地狱与错误处理困难的问题。通过 Promise 链式调用和组合子实现异步流程的声明式管理。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 链式调用 | then/catch 的顺序组合 | chaining.ts |
| Promise.all | 并发执行的同步点 | concurrency.ts |

---

## 二、设计原理

### 2.1 为什么存在

回调地狱是 Node.js 早期异步编程的主要痛点。Promise 通过链式调用和组合子统一了异步操作的接口，使错误处理和并发控制更加直观。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Promise.all | 并发执行 | 单失败全失败 | 独立请求 |
| 串行 await | 错误隔离 | 总时长累加 | 有依赖请求 |

### 2.3 与相关技术的对比

与 Futures/Tasks 对比：Promise 不可变，有些语言 Future 可取消。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Promise 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| new Promise 中不调用 resolve 会静默失败 | 未 settle 的 Promise 导致内存泄漏 |
| Promise.catch 捕获所有错误 | 同步抛出的错误需用 try/catch 或 reject |

### 3.3 扩展阅读

- [Promises MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
