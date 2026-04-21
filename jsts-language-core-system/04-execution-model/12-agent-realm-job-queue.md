# Agent、Realm 与 Job Queue

> ECMAScript 规范中的并发原语与执行环境抽象
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Agent

Agent 是 ECMAScript 的执行上下文集合，对应一个线程。多个 Agent 可以组成 Agent Cluster，共享内存（SharedArrayBuffer）。

```javascript
const shared = new SharedArrayBuffer(1024);
const worker = new Worker("worker.js");
worker.postMessage(shared, [shared]);
```

---

## 2. Realm

Realm 是一个完整的 ECMAScript 环境，包含全局对象和内置对象。

- **iframe**：每个 iframe 有自己的 Realm
- **eval()**：在相同 Realm 中执行
- **vm 模块（Node.js）**：创建新 Realm

```javascript
// iframe 创建新 Realm
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);
console.log(iframe.contentWindow.Array === Array); // false
```

---

## 3. Job Queue

Job Queue 是 ECMAScript 的任务队列抽象：

| 队列 | 用途 |
|------|------|
| ScriptJobs | 脚本执行 |
| PromiseJobs | Promise 回调（微任务） |
| PromiseResolveThenableJobs | thenable 解析 |

浏览器事件循环 ≈ ECMAScript Job Queue + 宿主环境扩展。

---

**参考规范**：ECMA-262 §9.7 Agents | ECMA-262 §9.3 Realms | ECMA-262 §9.5 Jobs and Job Queues
