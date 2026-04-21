# Agent / Realm / Job Queue

> ECMAScript 规范层面的执行抽象模型
>
> 对齐版本：ECMAScript 2025 (ES16) §9

---

## 1. Agent（执行代理）

### 1.1 定义

**Agent** 是具有独立事件循环的执行线程，包含：

- 一组执行上下文
- 一个执行上下文栈
- 一个运行中的执行上下文
- 一个 Agent Record
- 一个 Job Queue

### 1.2 Agent Cluster

多个 Agent 可以组成 **Agent Cluster**，通过 `SharedArrayBuffer` 共享内存：

```javascript
// main.js
const worker = new Worker("worker.js");
const sharedBuffer = new SharedArrayBuffer(1024);
worker.postMessage(sharedBuffer);
```

### 1.3 同步阻塞能力

同一 Agent Cluster 中的 Agent 可以通过 `Atomics.wait`/`Atomics.notify` 进行同步：

```javascript
const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);

// 等待位置 0 的值变为 1
Atomics.wait(view, 0, 0);
```

---

## 2. Realm（领域）

### 2.1 定义

**Realm** 是具有独立全局环境的作用域，包含：

- 一个全局对象（global object）
- 一组内置对象（Object、Array、Function 等）
- 一个全局环境记录

### 2.2 多个 Realm 的场景

```javascript
// iframe 创建新的 Realm
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);

// iframe 的全局对象与当前页面不同
const iframeArray = iframe.contentWindow.Array;
console.log(Array === iframeArray); // false

// 但 [[Prototype]] 链相同
console.log(iframeArray.prototype.map === Array.prototype.map); // true
```

---

## 3. Job Queue（任务队列）

### 3.1 规范定义

ECMAScript 定义了两种 Job：

- **ScriptJobs**：执行脚本代码
- **PromiseJobs**：Promise 的 resolve/reject 回调

### 3.2 与 HTML Event Loop 的映射

```
ECMAScript Job Queue        HTML Event Loop
─────────────────────────────────────────────
ScriptJobs          →       任务队列（Task Queue）
PromiseJobs         →       微任务队列（Microtask Queue）
```

### 3.3 Job 的执行

```javascript
// Promise.resolve() 创建一个 PromiseJob
Promise.resolve().then(() => console.log("microtask"));

// 宿主环境（浏览器/Node.js）负责调度 Job 的执行
```

---

## 4. 执行上下文栈

### 4.1 规范中的执行栈管理

```
ExecutionContextStack: [GlobalContext, FunctionContextA, FunctionContextB]
                                      ↑
                                Running Execution Context
```

### 4.2 Suspend / Resume 语义

`await` 和 `yield` 涉及执行上下文的挂起与恢复：

```javascript
async function foo() {
  const data = await fetch("/api"); // 挂起当前执行上下文
  console.log(data);                 // 恢复执行上下文
}
```

---

## 5. 与宿主环境的关系

### 5.1 浏览器

```javascript
// Window 对应一个 Realm
// 每个 iframe 有自己的 Realm
// 同源 iframe 可以共享 Agent Cluster
```

### 5.2 Node.js

```javascript
// vm.Module / vm.Script 创建新的 Realm
const vm = require("vm");
const context = vm.createContext({ console });
vm.runInContext("console.log('Hello')", context);
```

---

**参考规范**：ECMA-262 §9.7 Agents | ECMA-262 §9.8 Agent Clusters | ECMA-262 §9.9 Realms
