---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 03-concurrency

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 JavaScript 并发模型的语言级机制：事件循环、Promise、async/await、Worker Threads、Atomics、SharedArrayBuffer。这些是 ECMAScript 规范或 HTML 规范定义的语言/平台核心能力，不是某个库或框架的抽象。

**非本模块内容**：特定框架的并发工具（如 React Concurrent Features）、Node.js 特定的集群模块（属于平台扩展）。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法基础
  ├── 03-concurrency（本模块）→ 异步与并发机制
  └── jsts-language-core-system/05-execution-flow → 执行流理论
```

## 子模块目录

| 子模块 | 说明 | 关键文件 |
|---|---|---|
| promises | Promise 的创建、链式调用、组合与错误处理 | `promises/README.md` |
| async-await | async/await 语法、并发控制与错误恢复模式 | `async-await/README.md` |
| workers | Web Workers / Worker Threads 多线程与离屏计算 | `workers/README.md` |
| atomics | Atomics 与 SharedArrayBuffer 的同步原语 | `atomics/README.md` |
| streams | 流式数据处理、管道与背压控制 | `streams/README.md` |

## 核心代码示例

### Promise 并发控制

```js
const urls = [
  'https://api.example.com/users',
  'https://api.example.com/posts'
];

// 使用 Promise.all 并行请求
const [users, posts] = await Promise.all(
  urls.map(url => fetch(url).then(r => r.json()))
);
console.log(users, posts);
```

### Worker Thread 并行计算（Node.js）

```js
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename, {
    workerData: { start: 1, end: 1e6 }
  });
  worker.on('message', result => console.log('Sum:', result));
  worker.on('error', err => console.error(err));
} else {
  const { start, end } = workerData;
  let sum = 0;
  for (let i = start; i <= end; i++) sum += i;
  parentPort.postMessage(sum);
}
```

### Atomics 自增计数器

```js
const buffer = new SharedArrayBuffer(4);
const counter = new Int32Array(buffer);

// 在 Worker 中安全自增
Atomics.add(counter, 0, 1);
const current = Atomics.load(counter, 0);
console.log(current);
```

## 权威外部链接

- [MDN — Concurrency model and the event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [MDN — Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN — Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN — Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [Node.js — worker_threads](https://nodejs.org/api/worker_threads.html)
- [Node.js — stream](https://nodejs.org/api/stream.html)
- [Node.js — async_hooks](https://nodejs.org/api/async_hooks.html)

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
