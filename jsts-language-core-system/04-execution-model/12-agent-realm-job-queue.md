# Agent、Realm 与 Job Queue

> ECMAScript 规范中的并发原语与执行环境抽象
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Agent

Agent 是 ECMAScript 的执行上下文集合，对应一个线程：

```
Agent = {
  [[LittleEndian]]: Boolean,
  [[CanBlock]]: Boolean,
  [[Signifier]]: Symbol,
  [[IsLockFree1]]: Boolean,
  [[IsLockFree2]]: Boolean,
  [[CandidateExecution]]: Record,
  [[KeptAlive]]: List<Object>
}
```

### 1.1 Agent Cluster

多个 Agent 可以组成 Agent Cluster，共享内存（SharedArrayBuffer）：

```javascript
const shared = new SharedArrayBuffer(1024);
const worker = new Worker("worker.js");
worker.postMessage(shared, [shared]);

// worker.js
self.onmessage = (e) => {
  const shared = e.data;
  const arr = new Int32Array(shared);
  Atomics.store(arr, 0, 42);
};
```

---

## 2. Realm

Realm 是一个完整的 ECMAScript 环境，包含全局对象和内置对象：

```
Realm = {
  [[Intrinsics]]: Record,      // 内置对象（Object、Array 等）
  [[GlobalObject]]: Object,    // 全局对象
  [[GlobalEnv]]: Environment Record, // 全局环境
  [[TemplateMap]]: List,       // 模板字面量缓存
  [[LoadedModules]]: List      // 已加载模块
}
```

### 2.1 多 Realm 场景

- **iframe**：每个 iframe 有自己的 Realm
- **eval()**：在相同 Realm 中执行
- **vm 模块（Node.js）**：创建新 Realm

```javascript
// iframe 创建新 Realm
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);

// iframe 的全局对象与当前页面不同
console.log(iframe.contentWindow.Array === Array); // false（不同 Realm）
```

---

## 3. Job Queue

Job Queue 是 ECMAScript 的任务队列抽象：

```
Job Queue = List<Job>
Job = {
  [[JobCallback]]: Function,
  [[Arguments]]: List
}
```

### 3.1 队列类型

| 队列 | 用途 |
|------|------|
| ScriptJobs | 脚本执行 |
| PromiseJobs | Promise 回调（微任务） |
| PromiseResolveThenableJobs | thenable 解析 |

### 3.2 与事件循环的关系

```
浏览器事件循环 ≈ ECMAScript Job Queue + 宿主环境扩展
```

ECMAScript 规范定义了 Job Queue 的抽象，浏览器和 Node.js 在此基础上扩展了宏任务队列：

| 规范概念 | 浏览器实现 | Node.js 实现 |
|---------|-----------|-------------|
| Job Queue | Microtask Queue | Microtask Queue |
| ScriptJobs | 脚本执行 | 脚本执行 |
| PromiseJobs | Promise.then/catch/finally | Promise.then/catch/finally |

---

## 4. Agent 的 [[CanBlock]]

```javascript
// 主线程的 [[CanBlock]] 是 false
// Worker 的 [[CanBlock]] 是 true

// 在 Worker 中可以使用 Atomics.wait（阻塞）
// worker.js
const shared = new Int32Array(sharedBuffer);
Atomics.wait(shared, 0, 0); // 阻塞直到被唤醒
```

---

**参考规范**：ECMA-262 §9.7 Agents | ECMA-262 §9.3 Realms | ECMA-262 §9.5 Jobs and Job Queues
