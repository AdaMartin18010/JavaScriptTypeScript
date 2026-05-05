---
title: Promise 状态机转换图
description: "Promise 的三种状态转换机制，含 then/catch/finally 的调用流程与错误传播规则"
---

# Promise 状态机转换图

> Promise 是 JavaScript 异步编程的核心抽象。理解其状态机模型对于编写可靠的异步代码至关重要。

## Promise 状态机

```mermaid
stateDiagram-v2
    [*] --> Pending: new Promise()
    Pending --> Fulfilled: resolve(value)
    Pending --> Rejected: reject(reason)
    Fulfilled --> [*]
    Rejected --> [*]
    note right of Pending
        初始状态
        可以转换为
        Fulfilled 或 Rejected
    end note
    note right of Fulfilled
        终态
        不可再次改变
    end note
    note right of Rejected
        终态
        不可再次改变
    end note
```

## then/catch 的调用链

```mermaid
flowchart LR
    A[Promise.resolve1] --> B[.then]
    B --> C[返回值x]
    C --> D[.then]
    D --> E[抛出错误]
    E --> F[.catch]
    F --> G[恢复]
    G --> H[.finally]
    H --> I[Promise.resolve2]
```

## 关键规则

### 规则1：状态不可变

```javascript
const p = new Promise((resolve, reject) => &#123;
  resolve('first');
  resolve('second'); // 被忽略，状态已确定
  reject('error');   // 被忽略
&#125;);

p.then(v => console.log(v)); // 输出: first
```

### 规则2：then 返回新 Promise

```javascript
const p1 = Promise.resolve(1);
const p2 = p1.then(v => v * 2);

console.log(p1 === p2); // false，总是返回新 Promise
```

### 规则3：错误传播

```javascript
Promise.resolve()
  .then(() => &#123; throw new Error('A'); &#125;)
  .then(() => console.log('B'))  // 跳过
  .catch(e => console.log(e))     // 捕获: Error A
  .then(() => console.log('C'));  // 继续执行: C
```

## Promise 组合

```mermaid
flowchart TB
    subgraph Promise.all
        A[p1] --> D[全部成功]
        B[p2] --> D
        C[p3] --> D
        E[任一失败] --> F[整体失败]
    end
    subgraph Promise.race
        G[p1] --> H[最先 settled]
        I[p2] --> H
    end
    subgraph Promise.allSettled
        J[p1] --> K[等待全部完成]
        L[p2] --> K
        K --> L[返回所有结果]
    end
```

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|----------|----------|--------|
| `Promise.all` | 全部 resolve | 任一 reject | 结果数组 |
| `Promise.race` | 最先 settle | 最先 reject | 单个结果 |
| `Promise.allSettled` | 全部完成 | 不会失败 | 状态对象数组 |
| `Promise.any` | 任一 resolve | 全部 reject | 单个结果 |

## async/await 的本质

```mermaid
flowchart LR
    A[async function] --> B[返回 Promise]
    C[await expr] --> D[暂停执行]
    D --> E[expr resolve]
    E --> F[恢复执行]
```

```javascript
// async/await 是 Promise 的语法糖
async function example() &#123;
  const result = await fetch('/api'); // 等待 Promise resolve
  return result.json();               // 自动包装为 Promise
&#125;

// 等价于：
function example() &#123;
  return fetch('/api')
    .then(result => result.json());
&#125;
```

## 高级模式与陷阱

### 微任务队列与事件循环

Promise 的回调通过微任务（microtask）队列执行，优先级高于宏任务（macrotask）：

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')

// 输出: 1, 4, 3, 2
// 解释: 同步 → 微任务 → 宏任务
```

### Promise 链中的常见陷阱

| 陷阱 | 错误写法 | 正确写法 |
|------|----------|----------|
| 忘记返回 | `.then(() => { fetch('/a') })` | `.then(() => fetch('/a'))` |
| 嵌套地狱 | `.then(() => { return fetch().then() })` | `.then(() => fetch()).then()` |
| 吞掉错误 | `.catch(() => {})` | `.catch(e => { log(e); throw e })` |
| 并发误用 | `await Promise.all([await a, await b])` | `await Promise.all([a, b])` |

### Promise.withResolvers（ES2024）

```javascript
const { promise, resolve, reject } = Promise.withResolvers()

// 典型场景：将事件转化为 Promise
function waitForEvent(emitter, event) {
  const { promise, resolve } = Promise.withResolvers()
  emitter.once(event, resolve)
  return promise
}
```

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — 事件循环与异步机制
- [JavaScript 语法速查表](/cheatsheets/javascript-cheatsheet) — async/await 模式
- [ES2024+ 新特性速查表](/cheatsheets/es2024-cheatsheet) — Promise.withResolvers

---

 [← 返回架构图首页](./)
