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

#### 3.1.3 无锁环形缓冲区（Lock-Free Ring Buffer）

```typescript
// lockfree-ring-buffer.ts
/**
 * 基于 Atomics 的无锁单生产者单消费者 (SPSC) 环形队列
 * 适用于 Worker 之间高吞吐消息传递
 */
export class AtomicRingBuffer<T> {
  private buffer: SharedArrayBuffer;
  private header: Int32Array;  // [writeIndex, readIndex, capacity]
  private data: Int32Array;    // 存储序列化后的索引或句柄

  constructor(capacity: number) {
    // header: 3 个 32-bit 整数；data: capacity 个 32-bit 整数
    this.buffer = new SharedArrayBuffer((3 + capacity) * 4);
    this.header = new Int32Array(this.buffer, 0, 3);
    this.data = new Int32Array(this.buffer, 3 * 4, capacity);
    Atomics.store(this.header, 2, capacity);
  }

  enqueue(value: number): boolean {
    const capacity = Atomics.load(this.header, 2);
    const writeIndex = Atomics.load(this.header, 0);
    const readIndex = Atomics.load(this.header, 1);

    if ((writeIndex - readIndex) >= capacity) return false; // 满

    const slot = writeIndex % capacity;
    Atomics.store(this.data, slot, value);
    Atomics.store(this.header, 0, writeIndex + 1);
    return true;
  }

  dequeue(): number | undefined {
    const capacity = Atomics.load(this.header, 2);
    const writeIndex = Atomics.load(this.header, 0);
    const readIndex = Atomics.load(this.header, 1);

    if (readIndex >= writeIndex) return undefined; // 空

    const slot = readIndex % capacity;
    const value = Atomics.load(this.data, slot);
    Atomics.store(this.header, 1, readIndex + 1);
    return value;
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 使用示例
const rb = new AtomicRingBuffer(1024);
rb.enqueue(42);
console.log(rb.dequeue()); // 42
```

#### 3.1.4 原子自旋锁（用于保护临界区元数据）

```typescript
// atomic-spinlock.ts
/**
 * 基于 Atomics.exchange 的轻量级自旋锁
 * 注意：自旋锁应只用于极短临界区，避免浪费 CPU
 */
export class SpinLock {
  private flag: Int32Array;

  constructor(sharedBuffer?: SharedArrayBuffer, byteOffset = 0) {
    this.flag = new Int32Array(sharedBuffer ?? new SharedArrayBuffer(4), byteOffset, 1);
  }

  lock() {
    // exchange(old, new): 原子地设置 flag=1，返回旧值
    // 如果旧值为 1，说明锁已被占用，持续自旋
    while (Atomics.exchange(this.flag, 0, 1) === 1) {
      // 可选：调用 Atomics.wait 短暂挂起，减少 CPU 占用
      Atomics.wait(this.flag, 0, 1, 1);
    }
  }

  unlock() {
    Atomics.store(this.flag, 0, 0);
    Atomics.notify(this.flag, 0, 1); // 唤醒一个等待者
  }

  withLock<T>(fn: () => T): T {
    this.lock();
    try {
      return fn();
    } finally {
      this.unlock();
    }
  }
}
```

#### 3.1.5 CAS 循环与无锁递增（compareExchange）

```typescript
const buffer = new SharedArrayBuffer(4);
const counter = new Int32Array(buffer);

function atomicIncrement(index: number): number {
  let current = Atomics.load(counter, index);
  while (true) {
    const next = current + 1;
    const prev = Atomics.compareExchange(counter, index, current, next);
    if (prev === current) return next;
    current = prev;
  }
}
```

#### 3.1.6 内存顺序与可见性保证

```typescript
const buffer = new SharedArrayBuffer(8);
const flags = new Int32Array(buffer);
const data = new Int32Array(buffer, 4);

Atomics.store(data, 1, 42);
Atomics.store(flags, 0, 1);

while (Atomics.load(flags, 0) !== 1) {}
console.log(Atomics.load(data, 1)); // 保证看到 42
```

> ECMAScript 规定 `Atomics.load`/`store` 具有顺序一致性（sequentially consistent）。

#### 3.1.7 原子位运算（Atomics.and / or / xor）

```typescript
// flags.ts — 使用位掩码管理多 Worker 状态
const buffer = new SharedArrayBuffer(4);
const flags = new Int32Array(buffer);

// 设置第 2 位 (0b0100)
Atomics.or(flags, 0, 0b0100);

// 清除第 2 位
Atomics.and(flags, 0, ~0b0100);

// 翻转第 0 位
Atomics.xor(flags, 0, 0b0001);

// 读取当前值
const current = Atomics.load(flags, 0);
console.log(current & 0b0100 ? 'bit 2 set' : 'bit 2 clear');
```

#### 3.1.8 多 Worker 共享状态机（Atomics.sub + notifyAll）

```typescript
// barrier.ts — 简易屏障同步：等待 N 个 Worker 到达某点
const N = 4;
const buffer = new SharedArrayBuffer(4);
const remaining = new Int32Array(buffer);
Atomics.store(remaining, 0, N);

const workerCode = `
  const { workerData, parentPort } = require('worker_threads');
  const { buffer, workerId } = workerData;
  const remaining = new Int32Array(buffer);

  // 模拟工作
  console.log('Worker', workerId, 'working...');

  // 到达屏障
  const left = Atomics.sub(remaining, 0, 1);
  if (left === 1) {
    // 最后一个到达，唤醒所有等待者
    Atomics.notify(remaining, 0, N);
    parentPort.postMessage('all-reached');
  } else {
    Atomics.wait(remaining, 0, 0);
    parentPort.postMessage('released');
  }
`;

async function barrierDemo() {
  const { Worker } = await import('worker_threads');
  const workers = Array.from({ length: N }, (_, i) =>
    new Worker(workerCode, { eval: true, workerData: { buffer, workerId: i } })
  );
  const msgs = await Promise.all(workers.map(w => new Promise(r => w.once('message', r))));
  console.log('Barrier results:', msgs);
}
barrierDemo();
```

#### 3.1.9 Atomics.exchange 原子值交换

```typescript
// atomic-swap.ts — 基于 exchange 的原子引用更新
const buffer = new SharedArrayBuffer(4);
const slot = new Int32Array(buffer);

class AtomicReference<T> {
  private handles = new Map<number, T>();
  private nextId = 1;

  store(value: T): number {
    const id = this.nextId++;
    this.handles.set(id, value);
    const oldId = Atomics.exchange(slot, 0, id);
    if (oldId !== 0) this.handles.delete(oldId);
    return id;
  }

  load(): T | undefined {
    const id = Atomics.load(slot, 0);
    return id === 0 ? undefined : this.handles.get(id);
  }
}

// 使用：Worker 间共享配置快照
const configRef = new AtomicReference<Record<string, unknown>>();
configRef.store({ version: 1, featureFlags: { beta: true } });
console.log(configRef.load());
```

#### 3.1.10 多线程安全的引用计数器（Atomics.add + Atomics.sub）

```typescript
// refcount.ts — 共享对象生命周期管理
const buffer = new SharedArrayBuffer(4);
const refCount = new Int32Array(buffer);
Atomics.store(refCount, 0, 1); // 初始引用

function retain() {
  Atomics.add(refCount, 0, 1);
}

function release(): boolean {
  const remaining = Atomics.sub(refCount, 0, 1) - 1;
  if (remaining === 0) {
    // 最后一个引用释放，执行清理
    console.log('Resource freed');
    return true;
  }
  return false;
}

retain();
retain();
release(); // 2
release(); // 1
release(); // 0 → Resource freed
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Atomics 替代所有锁 | Atomics 适合简单操作，复杂临界区仍需锁或消息传递 |
| SharedArrayBuffer 总是可用 | 受 Spectre 影响，需要跨域隔离策略（COOP/COEP） |
| `Atomics.wait` 可在主线程使用 | 仅 Worker 线程可调用 `wait`，主线程会抛出异常 |
| 原子操作自动保证全序 | 仅保证单个内存位置的原子性，多位置仍需显式同步 |

### 3.3 扩展阅读

#### MDN 与规范

- [Atomics — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [Atomics.compareExchange — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/compareExchange)
- [Atomics.load — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/load)
- [Atomics.store — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/store)
- [Atomics.wait() — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait)
- [Atomics.notify() — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/notify)
- [SharedArrayBuffer — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [ECMAScript Shared Memory and Atomics Specification](https://tc39.es/ecma262/multipage/structured-data.html#sec-atomics-object)
- [ECMAScript Memory Model](https://tc39.es/ecma262/multipage/memory-model.html)

#### 平台与性能

- [WebAssembly Threads Proposal](https://github.com/WebAssembly/threads/blob/main/proposals/threads/Overview.md)
- [COOP and COEP Explained — web.dev](https://web.dev/articles/coop-coep)
- [V8 Blog — Concurrent Marking in V8](https://v8.dev/blog/concurrent-marking)
- [V8 Blog — Elements Kinds and Performance](https://v8.dev/blog/elements-kinds)
- [V8 Blog — Atomics and SharedArrayBuffer](https://v8.dev/blog/atomics)

#### 学术与进阶

- [Lock-Free Data Structures — Cambridge University Lecture Notes](https://www.cl.cam.ac.uk/research/srg/netos/lock-free/)
- [Lock-Free Programming — Herb Sutter](https://www.drdobbs.com/lock-free-code-a-false-sense-of-security/210600279)
- [Intel Intrinsics Guide — _mm_pause / SSE2](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html)
- [A Primer on Memory Consistency and Cache Coherence (Morgan & Claypool)](https://www.morganclaypool.com/doi/abs/10.2200/S00962ED2V01Y201910CAC049)
- [Is Parallel Programming Hard? And, If So, What Can You Do About It? — Paul E. McKenney](https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html)
- [C++ Memory Order and JS Atomics — V8 Team](https://v8.dev/blog/atomics)
- [LLVM Atomic Instructions and Concurrency Guide](https://llvm.org/docs/Atomics.html)
- [What Every Systems Programmer Should Know About Concurrency — Matt Trout](https://assets.bitbashing.io/papers/concurrency-primer.pdf)
- [Java Concurrency in Practice — Brian Goetz](https://jcip.net/)
- [Intel 64 and IA-32 Architectures Software Developer's Manual Vol. 3A — Chapter 8.2 Memory Ordering](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)

#### 关联模块

- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
