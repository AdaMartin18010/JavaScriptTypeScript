# Web Workers

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/workers`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决主线程阻塞导致的 UI 卡顿问题。通过 Web Workers 和 Worker Threads 将计算密集型任务 offload 到后台线程。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Dedicated Worker | 页面独占的后台线程 | dedicated-worker.ts |
| Transferable | 零拷贝的所有权转移对象 | transferable.ts |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 主线程承担 UI 渲染和事件处理，长时间计算会导致界面卡顿。Workers 将任务 offload 到后台线程，保持主线程响应性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Worker | 不阻塞主线程 | 通信开销 | 计算密集型 |
| 主线程 | 无通信成本 | 阻塞 UI | 轻量计算 |

### 2.3 与相关技术的对比

与进程 fork 对比：Workers 轻量但共享内存受限，进程隔离强但开销大。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Web Workers 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Worker 可访问 DOM | Worker 无 window/document，需通过消息通信 |
| postMessage 传递引用 | 结构化克隆复制数据，非共享引用 |

### 3.3 扩展阅读

- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
