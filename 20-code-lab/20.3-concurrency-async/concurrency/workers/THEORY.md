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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Worker 可访问 DOM | Worker 无 window/document，需通过消息通信 |
| postMessage 传递引用 | 结构化克隆复制数据，非共享引用 |

### 3.3 扩展阅读

- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Comlink — GoogleChromeLabs](https://github.com/GoogleChromeLabs/comlink)
- [Using Web Workers with WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API#using_web_workers)
- [Structured Clone Algorithm MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
