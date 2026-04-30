# Promise

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/promises`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决回调地狱与错误处理困难的问题。通过 Promise 链式调用和组合子实现异步流程的声明式管理。

### 1.2 形式化基础

- **Promise/A+ 规范**：定义了 `then` 方法的语义，要求必须异步调用回调（通过微任务队列）。
- **状态机**：一个 Promise 处于 `pending`、`fulfilled` 或 `rejected` 三者之一，且状态转换不可逆。
- **Monad 类比**：Promise 可视为单值异步 Monad，支持 `map`（`.then`）、`flatMap`（链式 `.then`）和错误处理（`.catch`）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 链式调用 | then/catch 的顺序组合 | chaining.ts |
| Promise.all | 并发执行的同步点 | concurrency.ts |
| Promise.withResolvers | ES2024 手动 resolve/reject 句柄 | with-resolvers.ts |
| 微任务队列 | Promise 回调的调度机制 | microtask.md |
| AbortController | 取消长期运行的异步操作 | abort-patterns.ts |

---

## 二、设计原理

### 2.1 为什么存在

回调地狱是 Node.js 早期异步编程的主要痛点。Promise 通过链式调用和组合子统一了异步操作的接口，使错误处理和并发控制更加直观。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Promise.all | 并发执行 | 单失败全失败 | 独立请求 |
| Promise.allSettled | 全部完成，不中断 | 需手动过滤结果 | 批量写入 |
| Promise.race | 最快响应 | 可能返回 rejection | 超时控制 |
| Promise.any | 首个成功 | 全失败时异常复杂 | 冗余服务 |
| 串行 await | 错误隔离 | 总时长累加 | 有依赖请求 |

### 2.3 与相关技术的对比

| 特性 | JS Promise | Java Future | C# Task | Rust Future | Python asyncio.Future |
|------|-----------|-------------|---------|-------------|----------------------|
| 可变性 | 不可变（不可取消） | 部分可取消 | 可取消 | 可取消 | 可取消 |
| 链式组合 | `.then()` | `CompletableFuture` | `ContinueWith` | `.await` / 组合子 | `add_done_callback` |
| 错误传播 | `.catch()` | `exceptionally` | `try/catch` | `?` / `Result` | `set_exception` |
| 静态方法 | `all`, `race`, `allSettled`, `any` | `allOf`, `anyOf` | `WhenAll`, `WhenAny` | `join!`, `select!` | `gather`, `wait` |
| 执行时机 | 立即执行（eager） | 立即执行 | 立即执行 | 惰性执行（lazy） | 立即执行 |

与 Futures/Tasks 对比：Promise 不可变，有些语言 Future 可取消。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Promise 核心机制的理解，并观察不同实现选择带来的行为差异。

#### Promise 组合子实战

```typescript
// concurrency.ts — Promise 组合子模式库

/** 带超时的 fetch */
function fetchWithTimeout(url: string, ms: number) {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([fetch(url), timeout]);
}

/** 所有 settled，无论成败 */
async function allSettledTyped<T>(promises: Promise<T>[]) {
  return Promise.allSettled(promises);
}

/** 优先成功：返回第一个 fulfilled，忽略 rejections */
function firstSuccess<T>(promises: Promise<T>[]) {
  return Promise.any(promises);
}

/** 可取消的 Promise 包装 */
function makeCancellable<T>(promise: Promise<T>) {
  let cancelled = false;
  const wrapped = new Promise<T>((resolve, reject) => {
    promise.then(
      val => cancelled ? reject(new Error('Cancelled')) : resolve(val),
      err => reject(err)
    );
  });
  return {
    promise: wrapped,
    cancel: () => { cancelled = true; },
  };
}
```

#### Promise.withResolvers — 手动控制异步流程

```typescript
// with-resolvers.ts — ES2024 标准模式

function createDeferred<T>() {
  // 兼容旧环境：若原生不存在则 polyfill
  if (Promise.withResolvers) {
    return Promise.withResolvers<T>();
  }
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// 使用：将基于回调的 API 包装为 Promise
function readFileAsync(path: string): Promise<string> {
  const { promise, resolve, reject } = createDeferred<string>();
  const fs = require('fs');
  fs.readFile(path, 'utf8', (err: Error | null, data: string) => {
    if (err) reject(err);
    else resolve(data);
  });
  return promise;
}
```

#### 顺序执行与 Map + Promise 组合

```typescript
// sequential-map.ts — 控制并发的同时保持顺序映射

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const p = mapper(items[i], i).then(r => { results[i] = r; });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

// 使用：最多 3 个并发请求，结果按原数组顺序排列
const enriched = await mapLimit(
  userIds,
  3,
  async (id) => fetch(`/api/users/${id}`).then(r => r.json())
);
```

#### allSettled 结果过滤与类型收窄

```typescript
// all-settled-filter.ts — 类型安全的批量操作结果处理

type SettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: unknown };

function filterFulfilled<T>(
  results: PromiseSettledResult<T>[]
): T[] {
  return results
    .filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled')
    .map(r => r.value);
}

function filterRejected(
  results: PromiseSettledResult<unknown>[]
): unknown[] {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);
}

// 使用
const uploads = files.map(f => uploadToCDN(f));
const results = await Promise.allSettled(uploads);
const succeeded = filterFulfilled(results);
const failed = filterRejected(results);
console.log(`Success: ${succeeded.length}, Failed: ${failed.length}`);
```

#### AbortController 与 Promise 取消模式

```typescript
// abort-patterns.ts — 基于 AbortSignal 的资源清理与请求取消

/** 将 fetch 包装为支持 AbortSignal 的函数 */
async function cancellableFetch(
  url: string,
  signal: AbortSignal
): Promise<Response> {
  const res = await fetch(url, { signal });
  return res;
}

/** 超时自动取消的封装 */
function fetchWithAbortTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('Request timeout')), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

/** 竞争请求：先返回的先被采用，其他的自动取消 */
async function raceWithCleanup<T>(promises: (signal: AbortSignal) => Promise<T>[]): Promise<T> {
  const controller = new AbortController();
  try {
    return await Promise.race(promises(controller.signal));
  } finally {
    controller.abort();
  }
}

// 使用示例
const controller = new AbortController();
document.getElementById('cancel')!.addEventListener('click', () => controller.abort());
try {
  const data = await fetch('/api/heavy-computation', { signal: controller.signal });
  console.log(await data.json());
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    console.log('用户取消操作');
  }
}
```

#### 指数退避重试 + 退避上限

```typescript
// retry-backoff.ts — 稳定的网络请求重试策略

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 300, maxDelay = 10000 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// 使用：最多重试 3 次，退避间隔 300ms → 600ms → 1200ms
const result = await retryWithBackoff(() => fetchJson('/api/flaky-endpoint'));
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| new Promise 中不调用 resolve 会静默失败 | 未 settle 的 Promise 导致内存泄漏 |
| Promise.catch 捕获所有错误 | 同步抛出的错误需用 try/catch 或 reject |
| .then() 中 return Promise 会嵌套 | return Promise 会自动展平（flatten） |
| Promise.all 中一个 reject 会取消其他 | 其他 Promise 仍继续执行，只是结果被丢弃 |
| async 函数返回非 Promise 值 | 会被自动包装为 resolved Promise |
| await 在 forEach 中生效 | forEach 不会等待异步回调，应使用 for…of |

### 3.3 扩展阅读

- [Promises/A+ Specification](https://promisesaplus.com/) — Promise 行为权威规范
- [Promises MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Promisees — Interactive Playground](https://bevacqua.github.io/promisees/)
- [V8 — Promise Internals](https://v8.dev/blog/fast-async)
- [TC39 — Promise.withResolvers](https://github.com/tc39/proposal-promise-with-resolvers)
- [We have a problem with promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
- [MDN — Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [MDN — Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [Exploring JS — Promises for asynchronous programming](https://exploringjs.com/es6/ch_promises.html)
- [Node.js — Promise anti-patterns](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [WHATWG — DOM Standard: AbortController](https://dom.spec.whatwg.org/#aborting-ongoing-activities) — 取消信号规范
- [MDN — AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [JavaScript Event Loop: Microtasks and Macrotasks](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) — Jake Archibald 经典可视化解析
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
