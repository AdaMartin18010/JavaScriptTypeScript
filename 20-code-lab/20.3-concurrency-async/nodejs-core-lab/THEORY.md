# Node.js 核心实验室 — 理论基础

## 1. Node.js 运行时架构

### 1.1 事件驱动模型

Node.js 基于 libuv 实现跨平台异步 IO：

- **事件循环**: 单线程执行 JavaScript，异步操作委托给线程池
- **线程池**: libuv 管理的线程池处理文件系统、DNS 等阻塞操作
- **回调队列**: 异步操作完成后回调进入队列，等待事件循环执行

---

## 2. Node.js 并发模型对比

| 维度 | Event Loop | Worker Threads | Cluster |
|------|-----------|----------------|---------|
| **并行类型** | 单线程 + 异步非阻塞 I/O | 真多线程（V8 Isolate） | 多进程（主进程 + 工作进程） |
| **内存模型** | 共享堆（单线程安全） | 共享 ArrayBuffer / StructuredClone | 独立堆（通过 IPC 通信） |
| **适用场景** | I/O 密集型（HTTP、文件、DB） | CPU 密集型（图像处理、复杂计算） | 多核利用、故障隔离、零停机重启 |
| **通信方式** | 无需（单线程） | MessagePort / SharedArrayBuffer | `cluster.fork()` + IPC |
| **崩溃影响** | 整个进程退出 | 单个线程退出（可捕获） | 单个工作进程退出（主进程可重启） |
| **资源共享** | N/A | `Atomics` + `SharedArrayBuffer` | 无共享（状态需外部存储） |
| **复杂度** | 低 | 高（线程同步、死锁风险） | 中等 |
| **典型应用** | Express / Fastify Web 服务 | 视频转码、ML 推理、压缩 | 高并发 HTTP 服务 |

> **选型决策**：
>
> - HTTP API 服务 + 高并发 → **Event Loop + Cluster**
> - 图像/视频/数据处理 → **Worker Threads**
> - 需要利用全部 CPU 核心且保持单代码库 → **Cluster**（主进程只负责调度）

---

## 3. Cluster 模块代码示例

```typescript
// cluster-server.ts — 生产级 Cluster 模式 HTTP 服务
import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';
import process from 'node:process';

const PORT = parseInt(process.env.PORT || '3000', 10);
const WORKER_COUNT = parseInt(process.env.WORKERS || String(os.availableParallelism()), 10);

if (cluster.isPrimary) {
  console.log(`主进程 ${process.pid} 正在运行，计划启动 ${WORKER_COUNT} 个工作进程`);

  // 记录工作进程状态
  const workers = new Map<number, number>();

  // Fork 工作进程
  for (let i = 0; i < WORKER_COUNT; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, worker.process.pid!);
  }

  // 工作进程退出时自动重启（故障恢复）
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`工作进程 ${worker.process.pid} 退出，代码: ${code}, 信号: ${signal}`);
    workers.delete(worker.id);

    // 意外退出才重启，正常退出（如部署）不重启
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      const newWorker = cluster.fork();
      workers.set(newWorker.id, newWorker.process.pid!);
      console.log(`已重启新工作进程 ${newWorker.process.pid}`);
    }
  });

  // 优雅关闭：SIGTERM 时通知所有工作进程
  process.on('SIGTERM', () => {
    console.log('主进程收到 SIGTERM，开始优雅关闭...');
    for (const id of workers.keys()) {
      cluster.workers?.[id]?.disconnect();
    }
  });

} else {
  // 工作进程：启动 HTTP 服务
  const server = http.createServer((req, res) => {
    // 模拟 CPU 密集型任务时主动拒绝，提示使用 Worker Threads
    if (req.url === '/heavy-task') {
      // 错误示范：不应在 Event Loop 做重计算
      // 正确做法：通过 MessageChannel 交给 Worker Thread
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Use Worker Threads for CPU-intensive tasks' }));
      return;
    }

    // 模拟异步 I/O（Event Loop 的舒适区）
    if (req.url === '/api/users') {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users: [], workerPid: process.pid }));
      }, 10);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Hello from worker ${process.pid}\n`);
  });

  server.listen(PORT, () => {
    console.log(`工作进程 ${process.pid} 开始监听端口 ${PORT}`);
  });

  // 优雅关闭：处理完当前连接后退出
  server.on('close', () => {
    console.log(`工作进程 ${process.pid} 服务器已关闭`);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(`工作进程 ${process.pid} 收到 SIGTERM`);
    server.close(() => {
      process.exit(0);
    });
  });
}
```

Worker Threads 计算密集型任务示例：

```typescript
// fibonacci.worker.ts
import { parentPort, workerData } from 'node:worker_threads';

function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

const result = fib(workerData.n);
parentPort?.postMessage({ input: workerData.n, result });

// 主线程调用
import { Worker } from 'node:worker_threads';

function runFibonacci(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./fibonacci.worker.ts', {
      workerData: { n },
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

---

## 4. Stream 管道处理

```typescript
// stream-pipeline.ts — 可组合的流式数据处理
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { Transform } from 'node:stream';

// 自定义 Transform：JSON 行解析
const jsonParser = new Transform({
  objectMode: true,
  transform(chunk: Buffer, _encoding, callback) {
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        this.push(JSON.parse(line));
      } catch {
        this.emit('error', new Error(`Invalid JSON: ${line}`));
      }
    }
    callback();
  },
});

// 自定义 Transform：过滤 + 映射
const filterMap = new Transform({
  objectMode: true,
  transform(record: { status: string; value: number }, _enc, cb) {
    if (record.status === 'ok') {
      this.push(JSON.stringify({ value: record.value * 2 }) + '\n');
    }
    cb();
  },
});

// 可运行示例：读取 → 解析 → 过滤 → 压缩 → 写入
async function runPipeline(input: string, output: string) {
  await pipeline(
    createReadStream(input),
    jsonParser,
    filterMap,
    createGzip(),
    createWriteStream(output)
  );
  console.log('Pipeline completed');
}
```

---

## 5. AbortController 取消异步操作

```typescript
// abortable-fetch.ts — 请求取消与超时
import { setTimeout as delay } from 'node:timers/promises';

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const controller = new AbortController();
  const { timeout = 5000, ...fetchOptions } = options;

  const timer = setTimeout(() => controller.abort(new Error('Request timeout')), timeout);

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// 可运行示例：批量请求，任一失败即全部取消
async function fetchAll(urls: string[]) {
  const controller = new AbortController();
  try {
    const promises = urls.map(url =>
      fetch(url, { signal: controller.signal }).then(r => r.json())
    );
    return await Promise.all(promises);
  } catch (e) {
    controller.abort(); // 取消所有未完成的请求
    throw e;
  }
}
```

---

## 6. ESM/CJS 互操作

```typescript
// esm-cjs-interop.ts — 混合模块系统最佳实践

// ESM 中导入 CJS：直接默认导入
import cjsModule from 'cjs-package';

// CJS 中导入 ESM：动态 import（返回 Promise）
async function loadEsm() {
  const { default: esmModule, namedExport } = await import('esm-package');
  return { esmModule, namedExport };
}

// package.json 配置（type: "module" 时）
// {
//   "type": "module",
//   "exports": {
//     ".": {
//       "import": "./dist/index.mjs",
//       "require": "./dist/index.cjs"
//     }
//   }
// }

// 条件导出辅助
export function createDualPackage(name: string) {
  return `Hello from ${name} (works in both ESM and CJS)`;
}
```

---

## 7. 核心模块

| 模块 | 用途 |
|------|------|
| **fs** | 文件系统操作（同步/异步/Stream） |
| **http/https** | HTTP 服务器和客户端 |
| **stream** | 流处理（Readable/Writable/Transform） |
| **buffer** | 二进制数据处理 |
| **crypto** | 加密、哈希、HMAC |
| **events** | 事件发射器（EventEmitter） |
| **path** | 路径解析和拼接 |
| **os** | 操作系统信息 |

## 8. Stream 处理

Node.js 的 Stream 是处理大数据的核心抽象：

```
Readable → Transform → Writable
```

- **Readable**: 数据来源（文件、网络、生成器）
- **Transform**: 数据转换（压缩、加密、解析）
- **Writable**: 数据目的地（文件、网络、stdout）

背压（Backpressure）处理：当 Writable 消费速度慢于 Readable 生产速度时，自动暂停读取。

## 9. 模块系统

- **CommonJS**: `require()` / `module.exports`，运行时同步加载
- **ESM**: `import` / `export`，静态解析，支持顶级 await
- **互操作**: Node.js 的 ESM/CJS 互操作规则

## 10. 进程管理

- **Cluster**: 主进程 + 工作进程模型，利用多核 CPU
- **Worker Threads**: 真正的多线程，共享内存（SharedArrayBuffer）
- **Child Process**: 子进程.spawn() / .exec()，适合 CPU 密集型任务

## 11. 与相邻模块的关系

- **19-backend-development**: 后端服务开发
- **12-package-management**: npm 包管理
- **50-browser-runtime**: 浏览器运行时对比

## 权威参考链接

- [Node.js Event Loop — Node.js Docs](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Worker Threads — Node.js Docs](https://nodejs.org/api/worker_threads.html)
- [Cluster — Node.js Docs](https://nodejs.org/api/cluster.html)
- [Don't Block the Event Loop — Node.js Docs](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [libuv Design Overview](https://docs.libuv.org/en/v1.x/design.html)
- [Node.js Streams — substack](https://github.com/substack/stream-handbook)
- [Node.js Stream API — Node.js Docs](https://nodejs.org/api/stream.html)
- [AbortController — Node.js Docs](https://nodejs.org/api/globals.html#abortcontroller)
- [ESM Modules — Node.js Docs](https://nodejs.org/api/esm.html)
- [CJS Modules — Node.js Docs](https://nodejs.org/api/modules.html)
- [Node.js Best Practices — GitHub](https://github.com/goldbergyoni/nodebestpractices)
- [Understanding Node.js Performance — nearForm](https://www.nearform.com/blog/understanding-node-js-performance/)
- [Node.js Design Patterns Book](https://nodejsdesignpatterns.com/)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
