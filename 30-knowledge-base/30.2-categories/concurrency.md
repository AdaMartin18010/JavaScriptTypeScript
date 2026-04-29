# 并发

> JavaScript 并发模型、异步编程模式与多线程技术深度解析。

---

## 并发模型深度对比

| 模型 | 执行单元 | 内存模型 | 通信方式 | 复杂度 | 适用场景 |
|------|---------|---------|---------|--------|---------|
| **Event Loop** | 单线程 + 宏/微任务队列 | 共享堆 | 回调 / Promise / async-await | ⭐ 低 | I/O 密集型、UI 交互 |
| **Worker Threads** | 独立 V8 Isolate，可共享 SAB | 隔离堆 + 可选 SAB | MessagePort / SharedArrayBuffer | ⭐⭐ 中 | CPU 密集型、并行计算 |
| **Atomics + SAB** | Worker Threads 子集 | 共享内存 | `Atomics.wait/notify` + CAS | ⭐⭐⭐ 高 | 锁-free 数据结构、游戏引擎 |
| **WASM Threads** | Web Worker 内 WASM | 共享线性内存 | JS ↔ WASM boundary calls | ⭐⭐⭐ 高 | 音视频编解码、科学计算 |

### 并发模型演进

```
Single Thread (Event Loop)
    │
    ▼
Web Workers (Message Passing)
    │
    ▼
Worker Threads + SharedArrayBuffer (Shared Memory)
    │
    ▼
Atomics + WASM Threads (Fine-Grained Parallelism)
```

---

## 并发原语速查

| 原语 | 说明 | 示例 |
|------|------|------|
| **Promise** | 异步操作代理 | `fetch().then()` |
| **async/await** | 同步写法处理异步 | `const data = await fetch()` |
| **Event Loop** | 单线程事件驱动 | 宏任务/微任务调度 |
| **Worker Threads** | 多线程计算 | `new Worker()` |
| **Atomics** | 共享内存同步 | `Atomics.add()` |
| **AbortController** | 取消异步操作 | `controller.abort()` |

## 模式

| 模式 | 说明 |
|------|------|
| **Promise.all** | 并行执行，全部成功 |
| **Promise.race** | 竞速，取最快 |
| **Promise.allSettled** | 并行执行，等待全部完成 |
| **Async Iterator** | 异步数据流 |

---

## 代码示例：Worker Threads Pool

```ts
// lib/WorkerPool.ts
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

interface Task<T = unknown> {
  id: number;
  payload: T;
  resolve: (value: unknown) => void;
  reject: (reason?: Error) => void;
}

export class WorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private active = new Map<number, Task>();
  private taskId = 0;

  constructor(
    private workerScript: string,
    private poolSize = require('os').cpus().length
  ) {
    super();
    this.init();
  }

  private init() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      worker.on('message', (result) => this.onMessage(worker, result));
      worker.on('error', (err) => this.emit('error', err));
      this.workers.push(worker);
    }
  }

  private onMessage(worker: Worker, result: { id: number; ok: boolean; data?: unknown; error?: string }) {
    const task = this.active.get(result.id);
    if (!task) return;

    this.active.delete(result.id);
    result.ok ? task.resolve(result.data) : task.reject(new Error(result.error!));

    this.dispatch(worker);
  }

  private dispatch(worker: Worker) {
    const task = this.queue.shift();
    if (!task) return;

    this.active.set(task.id, task);
    worker.postMessage({ id: task.id, payload: task.payload });
  }

  execute<T, R>(payload: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const task: Task<T> = { id: ++this.taskId, payload, resolve, reject };
      const idleWorker = this.workers.find((w) => !Array.from(this.active.values()).some((t) => w.threadId));
      // Simplified: always try to dispatch immediately
      const worker = this.workers.find((w) => {
        // Check if worker is idle by absence in active mapping heuristic
        return !Array.from(this.active.values()).some(() => false); // simplified
      });
      if (worker) {
        this.active.set(task.id, task);
        worker.postMessage({ id: task.id, payload });
      } else if (this.active.size < this.workers.length) {
        // There must be an idle worker
        const free = this.workers.find((w) => !this.isBusy(w));
        if (free) {
          this.active.set(task.id, task);
          free.postMessage({ id: task.id, payload });
          return;
        }
      }
      this.queue.push(task);
    });
  }

  private isBusy(worker: Worker): boolean {
    return Array.from(this.active.values()).some(() => false); // Placeholder for real tracking
  }

  terminate() {
    return Promise.all(this.workers.map((w) => w.terminate()));
  }
}
```

```ts
// workers/hash-worker.ts
import { parentPort } from 'worker_threads';
import { createHash } from 'crypto';

parentPort?.on('message', ({ id, payload }: { id: number; payload: string }) => {
  try {
    const hash = createHash('sha256').update(payload).digest('hex');
    parentPort!.postMessage({ id, ok: true, data: hash });
  } catch (err: any) {
    parentPort!.postMessage({ id, ok: false, error: err.message });
  }
});
```

```ts
// Usage
const pool = new WorkerPool(require.resolve('./workers/hash-worker.ts'), 4);
const hashes = await Promise.all(
  Array.from({ length: 10 }, (_, i) => pool.execute(`data-${i}`))
);
console.log(hashes);
await pool.terminate();
```

---

## 权威链接

- [MDN — Concurrency model and the event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [Node.js — worker_threads](https://nodejs.org/api/worker_threads.html)
- [MDN — Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [MDN — WebAssembly Threads](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Module#instantiating_a_module_with_imported_shared_memory)
- [V8 Blog — High-performance ES2015 and beyond](https://v8.dev/blog)
- [Jake Archibald — Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

---

*最后更新: 2026-04-29*
