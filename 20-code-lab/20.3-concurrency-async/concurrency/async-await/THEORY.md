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

| 技术 | 调度方式 | 错误处理 | 并发表达 | 适用平台 |
|------|---------|---------|---------|---------|
| async/await (JS) | 显式（事件循环） | try/catch | Promise.all | Browser / Node.js |
| Goroutines (Go) | 隐式（M:N 线程） | 多返回值 | `go` 关键字 | Go |
| Kotlin Coroutines | 挂起函数 + 调度器 | try/catch | `async/await` | JVM / Android |
| C# async/await | Task + 线程池 | try/catch | `Task.WhenAll` | .NET |
| Python asyncio | 事件循环 + 协程 | try/catch | `asyncio.gather` | Python |

与 Goroutines 对比：async/await 显式调度，Goroutines 隐式调度。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Async/Await 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 并发控制：顺序 vs 并行 vs 受控并发

```typescript
// async-await.ts

// 1. 顺序执行（总时长 = 各任务之和）
async function sequential(urls: string[]) {
  const results = [];
  for (const url of urls) {
    results.push(await fetch(url).then(r => r.json()));
  }
  return results;
}

// 2. 无限制并行（总时长 ≈ 最慢任务，但可能触发限流）
async function parallel(urls: string[]) {
  return Promise.all(urls.map(url => fetch(url).then(r => r.json())));
}

// 3. 受控并发（p-limit 思想）
async function concurrentPool<T>(
  tasks: (() => Promise<T>)[],
  poolLimit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const p = tasks[i]().then(res => { results[i] = res; });
    executing.push(p);
    if (executing.length >= poolLimit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(x => x === p), 1);
    }
  }
  await Promise.all(executing);
  return results;
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| await 会阻塞线程 | await 挂起协程，不阻塞事件循环 |
| async 函数总是并行执行 | 连续的 await 是顺序执行 |

### 3.3 扩展阅读

- [Async Functions V8](https://v8.dev/features/async-await)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [TC39 — Async Functions Proposal](https://github.com/tc39/ecmascript-asyncawait)
- [JavaScript Visualizer 9000](https://www.jsv9000.app/)
- [Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
