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
| Atomics | 对 SharedArrayBuffer 执行原子读写的全局对象 | — |
| Futex | 底层快速用户空间互斥原语，`wait`/`notify` 的实现基础 | — |

---

## 二、设计原理

### 2.1 为什么存在

SharedArrayBuffer 使多线程共享内存成为可能，但也引入了数据竞争风险。原子操作提供了无锁的并发安全机制，是高性能并发编程的基础。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原子操作 | 无锁高性能 | 编程复杂 | 计数器/标志 |
| 锁机制 | 逻辑简单 | 阻塞、死锁风险 | 复杂临界区 |

### 2.3 同步原语对比

| 维度 | Atomics (JS) | 语言级锁 (Java/C#) | Mutex (pthread) |
|------|-------------|-------------------|-----------------|
| 阻塞行为 | `wait`/`notify` 可选阻塞 | 默认阻塞线程 | 默认阻塞线程 |
| 死锁风险 | 极低（无显式加锁解锁） | 中等（需保证顺序） | 高（需配对 lock/unlock） |
| 适用粒度 | 单个 32-bit 整数 | 任意代码块 | 任意临界区 |
| 跨 Worker | ✅ 通过 SharedArrayBuffer | ❌ 仅同进程线程 | ❌ 仅同进程线程 |
| 性能 | 用户空间原子指令 | 内核态开销 | 内核态上下文切换 |
| 典型用途 | 引用计数、标志位、自旋锁 | 业务临界区 | 操作系统级资源保护 |

> **结论**：Atomics 适合 JS 轻量级共享内存同步；复杂临界区仍需通过 `Atomics.wait`/`notify` 构建更高层抽象，或回退到单 Worker 消息传递。

---

## 三、实践映射

### 3.1 代码示例

#### 3.1.1 原子计数器（Atomics.add）

```typescript
// main.ts
const buffer = new SharedArrayBuffer(4);
const counter = new Int32Array(buffer);

const workerCode = `
  const { parentPort, workerData } = require('worker_threads');
  const counter = new Int32Array(workerData.buffer);
  for (let i = 0; i < 100000; i++) {
    Atomics.add(counter, 0, 1);        // 原子加 1
  }
  parentPort.postMessage('done');
`;

async function run() {
  const { Worker } = await import('worker_threads');
  const workers = Array.from({ length: 4 }, () =>
    new Worker(workerCode, { eval: true, workerData: { buffer } })
  );
  await Promise.all(workers.map(w => new Promise(r => w.once('message', r))));
  console.log('Final counter:', counter[0]); // 400000（无竞争）
}
run();
```

#### 3.1.2 条件等待与通知（Atomics.wait / Atomics.notify）

```typescript
// main.ts — 生产者-消费者模式
const buffer = new SharedArrayBuffer(8);
const state = new Int32Array(buffer); // state[0]: 数据就绪标志
const data  = new Int32Array(buffer); // data[1]:  共享数据

const consumerCode = `
  const { workerData } = require('worker_threads');
  const state = new Int32Array(workerData.buffer);
  while (true) {
    // 若标志仍为 0，则阻塞当前 Worker 线程
    const status = Atomics.wait(state, 0, 0);
    if (status === 'ok') {
      const value = Atomics.load(state, 1);
      console.log('Consumer received:', value);
      if (value < 0) break; // 退出信号
      Atomics.store(state, 0, 0); // 重置标志
    }
  }
`;

const { Worker } = require('worker_threads');
const consumer = new Worker(consumerCode, { eval: true, workerData: { buffer } });

// 生产数据
for (let i = 1; i <= 5; i++) {
  Atomics.store(state, 1, i);
  Atomics.store(state, 0, 1);          // 设置就绪标志
  Atomics.notify(state, 0, 1);         // 唤醒最多 1 个等待者
}
Atomics.store(state, 1, -1);
Atomics.store(state, 0, 1);
Atomics.notify(state, 0, 1);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Atomics 替代所有锁 | Atomics 适合简单操作，复杂临界区仍需锁或消息传递 |
| SharedArrayBuffer 总是可用 | 受 Spectre 影响，需要跨域隔离策略（COOP/COEP） |
| `Atomics.wait` 可在主线程使用 | 仅 Worker 线程可调用 `wait`，主线程会抛出异常 |
| 原子操作自动保证全序 | 仅保证单个内存位置的原子性，多位置仍需显式同步 |

### 3.3 扩展阅读

- [Atomics — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [SharedArrayBuffer — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [Atomics.wait() — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait)
- [Atomics.notify() — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/notify)
- [ECMAScript Shared Memory and Atomics Specification](https://tc39.es/ecma262/multipage/structured-data.html#sec-atomics-object)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
