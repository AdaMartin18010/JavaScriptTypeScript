# 并发与异步：理论基础

> **定位**：`20-code-lab/20.3-concurrency-async/`
> **关联**：`10-fundamentals/10.3-execution-model/` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md`

---

## 一、核心理论

### 1.1 问题域定义

JavaScript 的并发模型基于**单线程事件循环**（Single-Threaded Event Loop），所有用户代码执行于同一主线程。异步操作通过**事件队列**与**回调机制**实现非阻塞处理。理解这一模型是掌握 Node.js 服务端编程、浏览器性能优化和避免竞态条件的关键。

### 1.2 形式化基础

**事件循环的形式化描述**：

```
Event Loop:
  while (true) {
    1. 执行宏任务队列（Macrotask Queue）中的最老任务
    2. 执行所有微任务（Microtask Queue）直至为空
    3. 渲染更新（如果需要）
    4. 重复
  }
```

**宏任务 vs 微任务**：

| 类型 | 来源 | 优先级 | 示例 |
|------|------|--------|------|
| **Macrotask** | 宿主环境 | 低 | setTimeout, setInterval, I/O, UI事件 |
| **Microtask** | JS引擎 | 高 | Promise.then, queueMicrotask, MutationObserver |

---

## 二、设计原理

### 2.1 为什么单线程

JavaScript 设计于浏览器环境，核心约束是**DOM 操作安全**：

- 多线程同时操作 DOM 会导致不可预测的状态
- 单线程消除了锁竞争和死锁
- 代价：CPU 密集型任务会阻塞主线程

### 2.2 异步演进

```
Callbacks (1995)
  ↓
Promises (ES2015)
  ↓
async/await (ES2017)
  ↓
Async Iterators (ES2018)
  ↓
Structured Concurrency (未来)
```

### 2.3 Node.js vs 浏览器事件循环

| 维度 | 浏览器 | Node.js |
|------|--------|---------|
| 宏任务 | 任务队列 | `libuv` 6阶段（timers→poll→check） |
| 微任务 | Promise + queueMicrotask | 同浏览器 |
| 渲染 | 每帧检查 | 无 |
| 特殊 | `requestIdleCallback` | `setImmediate`, `process.nextTick` |

---

## 三、并发模型对比

现代 JavaScript/TypeScript 运行环境提供三种核心并发机制，适用于不同场景：

| 维度 | 事件循环（Event Loop） | Web Workers / Worker Threads | Atomics + SharedArrayBuffer |
|------|----------------------|------------------------------|----------------------------|
| **执行位置** | 主线程 | 独立线程（V8 Isolate） | 主线程 + Worker 线程 |
| **内存模型** | 共享同一份堆（单线程安全） | 完全隔离（postMessage 通信） | 共享内存（SharedArrayBuffer） |
| **通信方式** | 无需通信（顺序执行） | `postMessage`（结构化克隆） | `Atomics.wait/notify` + `Atomics.pause` |
| **DOM 访问** | ✅ 完全访问 | ❌ 无法访问 DOM | ❌ Worker 中无法访问 DOM |
| **适用任务** | I/O 密集型、UI 交互 | CPU 密集型计算、数据并行 | 高并发同步原语、锁、无锁数据结构 |
| **启动开销** | 无 | 中高（~5-50ms + 内存） | 低（复用现有 Worker） |
| **编程复杂度** | 低 | 中（消息传递心智负担） | **高**（需处理竞态、内存序） |
| **典型应用** | HTTP 请求、文件 I/O、定时器 | 图像处理、大数组计算、压缩加密 | 游戏引擎、实时音频、高频计数器 |
| **Node.js 支持** | 原生 | `worker_threads` 模块 | `worker_threads` + `SharedArrayBuffer` |
| **浏览器支持** | 原生 | `Web Workers` / `SharedWorker` | `SharedArrayBuffer`（需 COOP/COEP） |

> **选型决策树**：
>
> - **I/O 等待 / 网络请求** → 事件循环 + async/await（无需额外线程）
> - **CPU 密集型任务 > 50ms** → Worker Threads / Web Workers（避免阻塞主线程）
> - **多 Worker 协作 / 共享状态** → SharedArrayBuffer + Atomics（低延迟同步）
> - **组合策略**：主线程负责 I/O 调度，Worker Pool 负责 CPU 计算，SharedArrayBuffer 负责共享计数器/状态

---

## 四、实践映射

### 4.1 常见模式

- **Promise 组合器**：`Promise.all` vs `Promise.race` vs `Promise.allSettled`
- **并发控制**：限制同时进行的异步操作数（p-limit 模式）
- **取消模式**：`AbortController` 的信号传播
- **背压处理**：Readable/Writable Stream 的流量控制

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| `async` 函数返回 Promise | `async` 函数**总是**返回 Promise，即使显式返回非 Promise |
| `await` 阻塞线程 | `await` 暂停**当前函数执行**，不阻塞事件循环 |
| `Promise` 创建即执行 | `new Promise(fn)` 中的 `fn` 立即同步执行 |
| `forEach` + `async` 并行 | `forEach` 不等待异步回调，应使用 `for...of` + `await` |

### 4.3 Worker Pool 代码示例（Node.js worker_threads）

```typescript
// worker-pool.ts
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { availableParallelism } from 'os';
import { EventEmitter } from 'events';

// ============================================================
// Worker 线程逻辑（实际执行计算任务）
// ============================================================
if (!isMainThread) {
  // 接收主线程传递的任务数据
  const { taskId, payload } = workerData as { taskId: string; payload: number[] };

  // 模拟 CPU 密集型任务：大规模数组排序 + 聚合
  const startTime = performance.now();
  const sorted = payload.sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / sorted.length;

  // 将结果返回主线程
  parentPort?.postMessage({
    taskId,
    result: { sum, avg, median: sorted[Math.floor(sorted.length / 2)] },
    durationMs: performance.now() - startTime,
  });
}

// ============================================================
// 主线程：Worker Pool 管理器
// ============================================================
interface Task<T = any, R = any> {
  id: string;
  payload: T;
  resolve: (value: R) => void;
  reject: (reason: Error) => void;
}

export class WorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private idleWorkers: Set<number> = new Set();
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, { workerIndex: number; startTime: number }> = new Map();

  constructor(private poolSize: number = availableParallelism()) {
    super();
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(__filename); // 当前文件同时作为 Worker 入口
      worker.on('message', (msg) => this.handleMessage(msg, i));
      worker.on('error', (err) => this.emit('error', err));
      worker.on('exit', (code) => {
        if (code !== 0) this.emit('error', new Error(`Worker ${i} stopped with code ${code}`));
      });
      this.workers.push(worker);
      this.idleWorkers.add(i);
    }
  }

  private handleMessage(msg: any, workerIndex: number) {
    const { taskId, result, durationMs } = msg;
    const taskMeta = this.activeTasks.get(taskId);
    if (!taskMeta) return;

    this.activeTasks.delete(taskId);
    this.idleWorkers.add(workerIndex);
    this.emit('taskComplete', { taskId, durationMs, workerIndex });

    // 查找并解析对应的 Task
    // 实际实现中需维护 taskMap，此处简化
    this.processQueue();
  }

  private processQueue() {
    if (this.taskQueue.length === 0 || this.idleWorkers.size === 0) return;

    const task = this.taskQueue.shift()!;
    const workerIndex = this.idleWorkers.values().next().value as number;
    this.idleWorkers.delete(workerIndex);

    this.activeTasks.set(task.id, { workerIndex, startTime: performance.now() });
    this.workers[workerIndex].postMessage({ taskId: task.id, payload: task.payload });
  }

  /**
   * 提交任务到 Worker Pool
   */
  execute<T, R>(payload: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const task: Task<T, R> = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        payload,
        resolve,
        reject,
      };
      this.taskQueue.push(task as Task);
      this.processQueue();
    });
  }

  terminate(): Promise<number[]> {
    return Promise.all(this.workers.map((w) => w.terminate()));
  }
}

// ============================================================
// 使用示例
// ============================================================
async function main() {
  const pool = new WorkerPool(4); // 创建 4 个 Worker 的线程池

  pool.on('taskComplete', ({ taskId, durationMs, workerIndex }) => {
    console.log(`[Pool] Task ${taskId} completed in ${durationMs.toFixed(2)}ms on worker ${workerIndex}`);
  });

  // 并行提交 10 个 CPU 密集型任务
  const tasks = Array.from({ length: 10 }, (_, i) =>
    pool.execute<number[], any>(
      Array.from({ length: 1_000_000 }, () => Math.random() * 1000)
    )
  );

  const results = await Promise.all(tasks);
  console.log('[Main] All tasks completed:', results.length);

  await pool.terminate();
}

if (isMainThread) {
  main().catch(console.error);
}
```

### 4.4 Atomics + SharedArrayBuffer 高并发计数器

```typescript
// atomic-counter.ts
import { Worker, isMainThread, workerData } from 'worker_threads';

if (!isMainThread) {
  const { sab, workerId, iterations } = workerData as {
    sab: SharedArrayBuffer;
    workerId: number;
    iterations: number;
  };

  const counter = new Int32Array(sab);

  for (let i = 0; i < iterations; i++) {
    // Atomics.add 保证原子性，无需显式锁
    Atomics.add(counter, 0, 1);

    // 可选：每 1000 次迭代 pause 一次，降低缓存竞争
    if (i % 1000 === 0) {
      if (typeof Atomics.pause === 'function') {
        Atomics.pause(10);
      }
    }
  }

  console.log(`Worker ${workerId} finished`);
}

// 主线程
async function runAtomicCounter() {
  const WORKERS = 4;
  const ITERATIONS = 1_000_000;

  // 创建共享内存：4 字节（一个 32 位整数）
  const sab = new SharedArrayBuffer(4);
  const counter = new Int32Array(sab);

  const workers = Array.from({ length: WORKERS }, (_, i) =>
    new Worker(__filename, {
      workerData: { sab, workerId: i, iterations: ITERATIONS },
    })
  );

  await Promise.all(workers.map((w) => new Promise((resolve) => w.on('exit', resolve))));

  // 预期结果：4 * 1_000_000 = 4_000_000
  console.log(`Final counter: ${counter[0]} (expected: ${WORKERS * ITERATIONS})`);
}

if (isMainThread) {
  runAtomicCounter();
}
```

---

## 五、扩展阅读

- `10-fundamentals/10.3-execution-model/` — V8 引擎执行模型
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md` — 并发模型深度分析
- `docs/guides/ai-coding-workflow.md` — AI 辅助异步代码审查

## 六、权威参考链接

- [ECMAScript Specification: Jobs and Job Queues](https://tc39.es/ecma262/#sec-jobs-and-job-queues) — ECMA-262 微任务规范
- [HTML Standard: Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) — WHATWG HTML 事件循环规范
- [Node.js Event Loop Guide](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — Node.js 官方事件循环指南
- [Node.js worker_threads](https://nodejs.org/api/worker_threads.html) — Node.js Worker Threads API 文档
- [MDN Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — MDN Web Workers 完整指南
- [MDN Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) — Atomics 全局对象文档
- [MDN SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) — 共享内存缓冲区
- [V8 Blog: Workers](https://v8.dev/features/worker) — V8 引擎官方 Worker 特性介绍
- [JavaScript Concurrency Model on Node.js](https://nodejs.org/en/learn/asynchronous-work/introduction-to-nodejs) — Node.js 异步编程介绍
- [Structured Concurrency Proposal (tc39)](https://github.com/tc39/proposal-structured-clone) — TC39 结构化并发相关提案

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
