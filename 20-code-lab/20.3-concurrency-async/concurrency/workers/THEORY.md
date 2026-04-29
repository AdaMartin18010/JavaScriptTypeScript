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

| 技术 | 环境 | 共享内存 | 通信方式 | 启动开销 | 适用场景 |
|------|------|---------|---------|---------|---------|
| Web Worker (Dedicated) | Browser | 不共享（结构化克隆） | `postMessage` | 中等 | 图像处理、大数组计算 |
| Web Worker (Shared) | Browser | 不共享 | `postMessage` / `BroadcastChannel` | 中等 | 多页面协作 |
| Service Worker | Browser | 不共享 | `postMessage` | 低（事件驱动） | 离线缓存、推送 |
| Node.js Worker Threads | Node.js | `SharedArrayBuffer` | `MessageChannel` | 低 | CPU 密集型任务 |
| WebAssembly + Worker | Browser | 线性内存可转移 | `postMessage` | 较高 | 高性能计算 |
| Process Fork (Node cluster) | Node.js | 不共享 | IPC | 高 | 多核负载均衡 |

与进程 fork 对比：Workers 轻量但共享内存受限，进程隔离强但开销大。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Web Workers 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 基于 Comlink 的 Worker 封装

```typescript
// dedicated-worker.ts — 主线程侧
import * as Comlink from 'comlink';

interface ImageProcessor {
  blur(imageData: ImageData, radius: number): ImageData;
}

const worker = new Worker(new URL('./image-worker.ts', import.meta.url), {
  type: 'module',
});

const api = Comlink.wrap<ImageProcessor>(worker);

// 在 UI 线程中调用，实际运行在 Worker 中
async function applyBlur(source: ImageData) {
  const result = await api.blur(source, 5);
  return result;
}
```

```typescript
// image-worker.ts — Worker 线程侧
import * as Comlink from 'comlink';

function blur(imageData: ImageData, radius: number): ImageData {
  // 模拟耗时的卷积运算
  const data = new Uint8ClampedArray(imageData.data);
  // ... 大量计算 ...
  return new ImageData(data, imageData.width, imageData.height);
}

Comlink.expose({ blur });
```

#### Node.js Worker Threads + SharedArrayBuffer

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  const shared = new SharedArrayBuffer(4);
  const counter = new Int32Array(shared);

  const w = new Worker(__filename, { workerData: shared });
  w.on('message', () => console.log('Final counter:', counter[0]));
} else {
  const shared = workerData as SharedArrayBuffer;
  const counter = new Int32Array(shared);
  Atomics.add(counter, 0, 1); // 原子操作，无竞态
  parentPort!.postMessage('done');
}
```

### 3.2 高级代码示例

#### Worker Pool 模式

```typescript
// worker-pool.ts — 浏览器环境下的 Worker 线程池
interface Task<T, R> {
  id: string;
  payload: T;
  resolve: (result: R) => void;
  reject: (err: Error) => void;
}

class WorkerPool<T, R> {
  private workers: Worker[] = [];
  private queue: Task<T, R>[] = [];
  private busy = new Set<Worker>();

  constructor(
    private workerScript: URL,
    poolSize: number = navigator.hardwareConcurrency || 4
  ) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript, { type: 'module' });
      worker.onmessage = (e) => this.handleResult(worker, e.data);
      this.workers.push(worker);
    }
  }

  private handleResult(worker: Worker, data: { id: string; result?: R; error?: string }) {
    this.busy.delete(worker);
    const task = this.queue.find(t => t.id === data.id);
    if (task) {
      this.queue = this.queue.filter(t => t.id !== data.id);
      if (data.error) task.reject(new Error(data.error));
      else task.resolve(data.result!);
    }
    this.dispatch();
  }

  private dispatch() {
    const available = this.workers.filter(w => !this.busy.has(w));
    const pending = this.queue.filter(t => !this.busy.has(t as unknown as Worker));
    for (let i = 0; i < Math.min(available.length, pending.length); i++) {
      const worker = available[i];
      const task = pending[i];
      this.busy.add(worker);
      worker.postMessage({ id: task.id, payload: task.payload });
    }
  }

  execute(payload: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      this.queue.push({ id, payload, resolve, reject });
      this.dispatch();
    });
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}

// worker-script.ts
self.onmessage = ({ data }: MessageEvent<{ id: string; payload: number[] }>) => {
  const { id, payload } = data;
  try {
    // 模拟 CPU 密集型计算：大数组排序
    const result = payload.sort((a, b) => a - b);
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message });
  }
};
```

#### BroadcastChannel 跨上下文通信

```typescript
// broadcast-channel.ts — 跨 Tab / Window / Worker 的消息广播
const channel = new BroadcastChannel('app_sync_channel');

// 在任何上下文（主页面、Worker、iframe）中发送
function broadcastStateUpdate(state: AppState) {
  channel.postMessage({
    type: 'STATE_UPDATE',
    timestamp: Date.now(),
    payload: state,
  });
}

// 接收广播消息
channel.onmessage = (event) => {
  const { type, payload } = event.data;
  if (type === 'STATE_UPDATE') {
    console.log('Received state from another context:', payload);
    updateLocalState(payload);
  }
};

// 清理
window.addEventListener('beforeunload', () => channel.close());
```

#### OffscreenCanvas 在 Worker 中渲染

```typescript
// offscreen-renderer.ts — 将 Canvas 渲染 offload 到 Worker
// 主线程
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const offscreen = canvas.transferControlToOffscreen();

const rendererWorker = new Worker(
  new URL('./render-worker.ts', import.meta.url),
  { type: 'module' }
);

// 将 OffscreenCanvas 转移给 Worker
rendererWorker.postMessage({ canvas: offscreen }, [offscreen]);

// 发送渲染指令
rendererWorker.postMessage({ cmd: 'render', sceneData: { ... } });
```

```typescript
// render-worker.ts
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

self.onmessage = (e) => {
  if (e.data.canvas) {
    canvas = e.data.canvas;
    ctx = canvas.getContext('2d');
  }
  if (e.data.cmd === 'render' && ctx) {
    const { sceneData } = e.data;
    // 在 Worker 线程中执行所有绘制操作，完全不阻塞主线程
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    for (const entity of sceneData.entities) {
      ctx.fillStyle = entity.color;
      ctx.fillRect(entity.x, entity.y, entity.w, entity.h);
    }
  }
};
```

#### Node.js Worker Threads + Atomics 实现锁

```typescript
// atomic-lock.ts
import { Worker, isMainThread, workerData } from 'worker_threads';

class AtomicsMutex {
  private sab: SharedArrayBuffer;
  private state: Int32Array;

  constructor() {
    this.sab = new SharedArrayBuffer(4);
    this.state = new Int32Array(this.sab);
    Atomics.store(this.state, 0, 0); // 0 = unlocked, 1 = locked
  }

  get buffer() { return this.sab; }

  lock() {
    // 自旋锁：尝试将 0 改为 1
    while (Atomics.compareExchange(this.state, 0, 0, 1) !== 0) {
      Atomics.wait(this.state, 0, 1); // 等待直到 state[0] !== 1
    }
  }

  unlock() {
    Atomics.store(this.state, 0, 0);
    Atomics.notify(this.state, 0, 1); // 唤醒一个等待者
  }
}

// main.ts
if (isMainThread) {
  const mutex = new AtomicsMutex();
  const sharedCounter = new SharedArrayBuffer(4);
  const counter = new Int32Array(sharedCounter);

  for (let i = 0; i < 4; i++) {
    new Worker(__filename, {
      workerData: { mutexBuffer: mutex.buffer, counterBuffer: sharedCounter },
    });
  }

  setTimeout(() => console.log('Final counter:', counter[0]), 2000);
} else {
  const { MutexBuffer, counterBuffer } = workerData as {
    mutexBuffer: SharedArrayBuffer;
    counterBuffer: SharedArrayBuffer;
  };

  const state = new Int32Array(MutexBuffer);
  const counter = new Int32Array(counterBuffer);

  for (let i = 0; i < 10000; i++) {
    // 获取锁
    while (Atomics.compareExchange(state, 0, 0, 1) !== 0) {
      Atomics.wait(state, 0, 1);
    }
    // 临界区
    const current = Atomics.load(counter, 0);
    Atomics.store(counter, 0, current + 1);
    // 释放锁
    Atomics.store(state, 0, 0);
    Atomics.notify(state, 0, 1);
  }
}
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| Worker 可访问 DOM | Worker 无 window/document，需通过消息通信 |
| postMessage 传递引用 | 结构化克隆复制数据，非共享引用 |

### 3.4 扩展阅读

- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Comlink — GoogleChromeLabs](https://github.com/GoogleChromeLabs/comlink)
- [Using Web Workers with WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API#using_web_workers)
- [Structured Clone Algorithm MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [MDN: BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [MDN: Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [Chrome Developers: Inside look at modern web browser (Part 3)](https://developer.chrome.com/blog/inside-browser-part3)
- [Node.js: Worker Threads Best Practices](https://nodejs.org/api/worker_threads.html#worker-threads)
- [Web.dev: Offmainthread](https://web.dev/articles/off-main-thread)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
