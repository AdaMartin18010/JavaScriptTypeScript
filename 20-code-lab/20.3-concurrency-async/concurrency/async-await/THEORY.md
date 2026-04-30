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
| 协程挂起 | await 暂停执行并释放事件循环 | event-loop.md |
| 顶层 await | ES2022 模块级 await | top-level-await.ts |

---

## 二、设计原理

### 2.1 为什么存在

回调函数和 Promise 链在处理复杂异步流程时可读性差。async/await 语法将异步代码转换为类似同步的结构，显著降低了认知负担。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| async/await | 可读性强 | 错误堆栈可能丢失原始上下文 | 顺序异步 |
| Promise 链 | 组合灵活 | 嵌套地狱 | 复杂并行 |
| 生成器 + co | 可中断、可恢复 | 需额外库支持 | 遗留代码维护 |

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

#### 错误恢复与重试模式

```typescript
// error-handling.ts — 指数退避重试

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; backoff?: number; maxDelay?: number } = {}
): Promise<T> {
  const { retries = 3, backoff = 100, maxDelay = 10000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = Math.min(backoff * 2 ** attempt, maxDelay);
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 使用
try {
  const data = await fetchWithRetry(() => fetch('/api/flaky').then(r => r.json()), {
    retries: 5,
    backoff: 200
  });
} catch (err) {
  console.error('All retries exhausted', err);
}
```

#### 顶层 Await 与动态导入

```typescript
// top-level-await.ts — ES2022 模块级 await

// 条件加载 polyfill
const { fetch: fetchImpl } = globalThis.fetch
  ? { fetch: globalThis.fetch }
  : await import('node-fetch');

// 并行配置加载
const [config, secrets] = await Promise.all([
  import('./config.json', { assert: { type: 'json' } }),
  import('./secrets.json', { assert: { type: 'json' } }).catch(() => ({ default: {} }))
]);

export const appConfig = { ...config.default, ...secrets.default };
```

#### Async 迭代器处理大文件流

```typescript
// async-iterators.ts — 逐行读取大文件而不占用大量内存

async function* readLines(filePath: string): AsyncGenerator<string, void, unknown> {
  const file = await open(filePath, 'r');
  const decoder = new TextDecoder();
  let buffer = new Uint8Array(4096);
  let leftover = '';

  while (true) {
    const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
    if (bytesRead === 0) break;

    const chunk = leftover + decoder.decode(buffer.subarray(0, bytesRead));
    const lines = chunk.split('\n');
    leftover = lines.pop()!; // 最后一行可能不完整

    for (const line of lines) yield line;
  }

  if (leftover) yield leftover;
  await file.close();
}

// 使用
for await (const line of readLines('/var/log/app.log')) {
  if (line.includes('CRITICAL')) console.log(line);
}
```

#### 结构化并发：AsyncTaskGroup

```typescript
// structured-concurrency.ts — 仿 Go errgroup / Swift TaskGroup

class AsyncTaskGroup<T> {
  private tasks: Promise<T>[] = [];

  add(task: Promise<T>) {
    this.tasks.push(task);
  }

  async waitAll(): Promise<T[]> {
    return Promise.all(this.tasks);
  }

  async race(): Promise<T> {
    return Promise.race(this.tasks);
  }

  // 全部完成或任一失败即终止（fail-fast）
  async waitAllOrFail(): Promise<T[]> {
    return Promise.all(this.tasks);
  }
}

// 使用：并行获取多个资源，任一失败全部中断
async function fetchUserDashboard(userId: string) {
  const group = new AsyncTaskGroup<unknown>();

  group.add(fetch(`/api/users/${userId}`).then(r => r.json()));
  group.add(fetch(`/api/users/${userId}/orders`).then(r => r.json()));
  group.add(fetch(`/api/users/${userId}/preferences`).then(r => r.json()));

  const [profile, orders, preferences] = await group.waitAllOrFail();
  return { profile, orders, preferences };
}
```

#### AsyncLocalStorage 上下文传播

```typescript
// async-context.ts — Node.js AsyncLocalStorage 实现请求上下文追踪

import { AsyncLocalStorage } from 'async_hooks';

const requestStore = new AsyncLocalStorage<{ requestId: string; startTime: number }>();

async function handleRequest(requestId: string) {
  return requestStore.run({ requestId, startTime: Date.now() }, async () => {
    await doWork();
    await doMoreWork();
    const ctx = requestStore.getStore();
    console.log(`Request ${ctx?.requestId} completed in ${Date.now() - (ctx?.startTime ?? 0)}ms`);
  });
}

async function doWork() {
  const ctx = requestStore.getStore();
  console.log(`[${ctx?.requestId}] Doing work...`);
  // 即使在异步操作后，上下文仍然保留
  await new Promise(resolve => setTimeout(resolve, 10));
  console.log(`[${ctx?.requestId}] Work done`);
}

async function doMoreWork() {
  const ctx = requestStore.getStore();
  console.log(`[${ctx?.requestId}] More work...`);
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| await 会阻塞线程 | await 挂起协程，不阻塞事件循环 |
| async 函数总是并行执行 | 连续的 await 是顺序执行 |
| try/catch 能捕获所有异步错误 | 未 await 的 Promise 错误会触发 unhandledRejection |
| async 函数返回值就是 Promise.resolve | 同步 throw 会 reject，return 会 resolve |

### 3.3 扩展阅读

- [Async Functions V8](https://v8.dev/features/async-await)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [TC39 — Async Functions Proposal](https://github.com/tc39/ecmascript-asyncawait)
- [JavaScript Visualizer 9000](https://www.jsv9000.app/)
- [Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [MDN — Async iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
- [Promise with finally (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)
- [web.dev — Async functions: making promises friendly](https://web.dev/articles/async-functions)
- [Exploring JS — Async functions](https://exploringjs.com/es2016-es2017/ch_async-functions.html)
- [Node.js — unhandledRejection event](https://nodejs.org/api/process.html#event-unhandledrejection)
- `20.3-concurrency-async/concurrency/`

---

### AbortController 与异步取消模式

```typescript
async function fetchWithCancel(url: string, signal: AbortSignal): Promise<Response> {
  return fetch(url, { signal });
}

const controller = new AbortController();
fetchWithCancel('/api/data', controller.signal);
document.getElementById('cancel')!.addEventListener('click', () => controller.abort());
```

### Async Generator 管道处理

```typescript
async function* map<T, R>(source: AsyncIterable<T>, fn: (x: T) => R): AsyncGenerator<R> {
  for await (const item of source) yield fn(item);
}

async function* filter<T>(source: AsyncIterable<T>, predicate: (x: T) => boolean): AsyncGenerator<T> {
  for await (const item of source) if (predicate(item)) yield item;
}

const lines = readLines('/var/log/app.log');
const errors = filter(lines, line => line.includes('ERROR'));
const timestamps = map(errors, line => ({ ts: new Date(), msg: line }));

for await (const entry of timestamps) {
  console.log(entry.ts.toISOString(), entry.msg);
}
```

### Promise.withResolvers 与 async/await 的协同

```typescript
function createFileWatcher(path: string) {
  const { promise: ready, resolve, reject } = Promise.withResolvers<void>();
  const watcher = fs.watch(path, (event) => { if (event === 'change') resolve(); });
  watcher.on('error', reject);
  return { ready, stop: () => watcher.close() };
}

const watcher = createFileWatcher('./config.json');
await watcher.ready;
watcher.stop();
```

---

## 更多权威参考链接

- [AbortController — MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — 取消异步操作标准 API
- [Async Iteration — TC39 Proposal](https://github.com/tc39/proposal-async-iteration) — 异步迭代协议规范
- [web.dev: Abortable Fetch](https://web.dev/articles/abortable-fetch) — 可取消的请求实践指南
- [Promise.withResolvers — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) — ES2024 Promise 构造辅助
- [Exploring JS — Async Iteration](https://exploringjs.com/es2018-es2019/ch_async-iteration.html) — 异步迭代深度解析
- [Node.js: AbortController](https://nodejs.org/api/globals.html#class-abortcontroller) — Node.js 环境支持
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) — 异步上下文存储
- [WHATWG Streams Standard](https://streams.spec.whatwg.org/) — 流标准与异步迭代
- [Structured Concurrency in Swift](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) — 结构化并发设计参考
- [Bluebird Promise Cancellation](http://bluebirdjs.com/docs/api/cancellation.html) — Promise 取消先驱设计

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
