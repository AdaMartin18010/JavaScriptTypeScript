# Promise 执行流（Promise Execution Flow）

> **形式化定义**：Promise 是 ECMAScript 2015（ES6）引入的异步编程抽象，表示一个可能尚未完成但预期将来会完成的操作。Promise 具有三种状态：pending（待定）、fulfilled（已完成）、rejected（已拒绝），状态一旦改变不可再次修改。ECMA-262 §27.2 定义了 Promise 的完整语义，包括 `then`、`catch`、`finally` 方法和静态方法（`all`、`race`、`allSettled`、`any`）。
>
> 对齐版本：ECMAScript 2025 (ES16) §27.2 | TypeScript 5.8–6.0

---

## 1. 概念定义 (Concept Definition)

### 1.1 形式化定义

ECMA-262 §27.2 定义了 Promise：

> *"A Promise is an object that is used as a placeholder for the eventual results of a deferred (and possibly asynchronous) computation."*

Promise 状态机：

```
States: { pending, fulfilled, rejected }
Transitions:
  pending --resolve(v)--> fulfilled(v)
  pending --reject(e)--> rejected(e)
  fulfilled --(no transition)--
  rejected --(no transition)--
```

---

## 2. 属性与特征 (Properties & Characteristics)

### 2.1 Promise 状态属性矩阵

| 状态 | 转换来源 | 可转换到 | 说明 |
|------|---------|---------|------|
| pending | 初始状态 | fulfilled / rejected | 唯一可变状态 |
| fulfilled | pending | — | 成功完成，有值 |
| rejected | pending | — | 失败，有原因 |

### 2.2 Promise 链式调用

| 方法 | 输入 | 输出 | 用途 |
|------|------|------|------|
| `then(onFulfilled, onRejected)` | Promise | 新 Promise | 处理成功/失败 |
| `catch(onRejected)` | Promise | 新 Promise | 仅处理失败 |
| `finally(onFinally)` | Promise | 新 Promise | 无论结果都执行 |

---

## 3. 关系分析 (Relationship Analysis)

### 3.1 Promise 链的执行流

```mermaid
graph TD
    P1[Promise 1] -->|then| P2[Promise 2]
    P2 -->|then| P3[Promise 3]
    P3 -->|catch| P4[错误处理]
    P3 -->|finally| P5[清理]
```

---

## 4. 机制解释 (Mechanism Explanation)

### 4.1 Promise 的调度机制

```mermaid
flowchart TD
    A[Promise.resolve(v)] --> B[状态变为 fulfilled]
    B --> C[then 回调加入微任务队列]
    C --> D[当前同步代码完成]
    D --> E[执行微任务队列]
    E --> F[then 回调执行]
```

### 4.2 微任务 vs 宏任务

Promise 回调通过 **微任务（microtask）** 调度，优先级高于宏任务（macrotask，如 `setTimeout`）。这保证了 Promise 链在同一次事件循环迭代内尽可能早地执行。

```javascript
console.log('1. 同步开始');

setTimeout(() => console.log('2. setTimeout（宏任务）'), 0);

Promise.resolve().then(() => console.log('3. Promise then（微任务）'));

console.log('4. 同步结束');

// 输出顺序：1 → 4 → 3 → 2
```

---

## 5. 论证与分析 (Argumentation & Analysis)

### 5.1 Promise 静态方法对比

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|---------|---------|--------|
| `Promise.all` | 全部 fulfilled | 首个 rejected | 结果数组 |
| `Promise.race` | 首个 settled | 首个 rejected | 首个结果 |
| `Promise.allSettled` | 全部 settled | 永不 reject | 状态数组 |
| `Promise.any` | 首个 fulfilled | 全部 rejected | 首个结果 |

### 5.2 `Promise.withResolvers`（ES2024）

ES2024 新增了 `Promise.withResolvers`，将 `resolve` 和 `reject` 暴露给外部调用者，解决了“先创建 Promise、后决定其命运”的常见模式：

```javascript
function createDelayedTask(ms) {
  const { promise, resolve, reject } = Promise.withResolvers();

  setTimeout(() => {
    if (ms > 5000) reject(new Error('Timeout too long'));
    else resolve(`Done after ${ms}ms`);
  }, ms);

  return promise;
}

createDelayedTask(100)
  .then(console.log)   // "Done after 100ms"
  .catch(console.error);
```

---

## 6. 实例与示例 (Examples)

### 6.1 正例：Promise 链

```javascript
fetch("/api/user")
  .then(response => response.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));
```

### 6.2 正例：Promise.all 并行

```javascript
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json())
]);
```

### 6.3 正例：`Promise.allSettled` 安全聚合

```javascript
const results = await Promise.allSettled([
  fetch('/api/a'),
  fetch('/api/b'),
  fetch('/api/c')
]);

const ok = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

const failed = results
  .filter(r => r.status === 'rejected')
  .map(r => r.reason);

console.log('成功:', ok.length, '失败:', failed.length);
```

### 6.4 正例：带 AbortController 的取消模式

```javascript
const controller = new AbortController();
const { signal } = controller;

// 5 秒后自动取消
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('/api/slow-endpoint', { signal });
  const data = await response.json();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('请求已被取消');
  }
}
```

### 6.5 正例：`Promise.any` 与降级策略

```javascript
const cdn1 = fetch('https://cdn-a.example.com/lib.js');
const cdn2 = fetch('https://cdn-b.example.com/lib.js');
const fallback = fetch('https://origin.example.com/lib.js');

try {
  const fastest = await Promise.any([cdn1, cdn2, fallback]);
  console.log('首个可用 CDN:', fastest.url);
} catch (error) {
  // AggregateError: 所有源均失败
  console.error('所有 CDN 不可用:', error.errors);
}
```

### 6.6 正例：异步迭代器 (`for await...of`)

```javascript
async function* paginatedUsers(pageSize = 10) {
  let page = 1;
  while (true) {
    const res = await fetch(`/api/users?page=${page}&size=${pageSize}`);
    const data = await res.json();
    if (data.length === 0) break;
    yield* data;
    page++;
  }
}

// 消费
for await (const user of paginatedUsers()) {
  console.log(user.name);
}
```

---

## 7. 权威参考与国际化对齐 (References)

- **ECMA-262 §27.2** — Promise Objects: <https://tc39.es/ecma262/#sec-promise-objects>
- **MDN: Promise** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise>
- **MDN: async function** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function>
- **V8 Blog — JavaScript Promises** — <https://v8.dev/blog/fast-async>
- **Jake Archibald: Tasks, microtasks, queues and schedules** — <https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/>
- **Node.js — Event Loop, Timers, and `process.nextTick()`** — <https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick>
- **WhatWG — DOM Standard: AbortSignal** — <https://dom.spec.whatwg.org/#abortsignal>
- **TC39 Proposal — `Promise.withResolvers`** — <https://github.com/tc39/proposal-promise-with-resolvers>

---

## 8. 思维表征总结 (Cognitive Representations)

### 8.1 Promise 状态转换图

```mermaid
stateDiagram-v2
    [*] --> pending: new Promise
    pending --> fulfilled: resolve()
    pending --> rejected: reject()
    fulfilled --> [*]
    rejected --> [*]
```

---

## 9. 公理化表述与形式证明 (Axiomatization & Formal Proof)

### 9.1 公理化基础

**公理 1（Promise 的不可变性）**：
> Promise 一旦 settled（fulfilled 或 rejected），状态不可再次改变。

**公理 2（then 的链式性）**：
> `then` 总是返回新的 Promise，支持链式调用。

### 9.2 定理与证明

**定理 1（Promise.all 的短路性）**：
> `Promise.all` 在首个 Promise reject 时立即 reject。

*证明*：
> ECMA-262 §27.2.4.1.1 规定，若任一 Promise 变为 rejected，Promise.all 返回的 Promise 立即变为 rejected。
> ∎

---

## 10. 推理链与演绎分析 (Deductive Reasoning Chain)

### 10.1 演绎推理

```mermaid
graph TD
    A[创建 Promise] --> B[执行异步操作]
    B --> C{结果?}
    C -->|成功| D[resolve(value)]
    C -->|失败| E[reject(error)]
    D --> F[then 回调执行]
    E --> G[catch 回调执行]
```

### 10.2 反事实推理

> **反设**：ES6 没有引入 Promise。
> **推演结果**：异步编程仍依赖回调地狱，async/await 无法实现，现代 Web 开发效率大幅下降。
> **结论**：Promise 是 JavaScript 异步编程现代化的基石。

---

**参考规范**：ECMA-262 §27.2 | MDN: Promise
