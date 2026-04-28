# 原子操作

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/atomics`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决多线程共享内存的并发安全问题。通过原子操作和内存顺序保证无锁数据结构的正确性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| SharedArrayBuffer | 多线程共享的线性内存 | shared-memory.ts |
| 内存顺序 | 操作可见性的同步保证 | ordering.ts |

---

## 二、设计原理

### 2.1 为什么存在

SharedArrayBuffer 使多线程共享内存成为可能，但也引入了数据竞争风险。原子操作提供了无锁的并发安全机制，是高性能并发编程的基础。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原子操作 | 无锁高性能 | 编程复杂 | 计数器/标志 |
| 锁机制 | 逻辑简单 | 阻塞、死锁风险 | 复杂临界区 |

### 2.3 与相关技术的对比

与锁对比：Atomics 无阻塞但能力有限，锁通用但可能死锁。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 原子操作 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Atomics 替代所有锁 | Atomics 适合简单操作，复杂临界区仍需锁 |
| SharedArrayBuffer 总是可用 | 受 Spectre 影响，需要跨域隔离策略 |

### 3.3 扩展阅读

- [Atomics MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
