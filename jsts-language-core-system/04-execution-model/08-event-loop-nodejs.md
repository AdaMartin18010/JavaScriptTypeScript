# Node.js 事件循环

> libuv 的事件循环阶段详解与浏览器差异
>
> 对齐版本：Node.js 22+ | libuv 1.48+

---

## 1. libuv 概述

libuv 是 Node.js 使用的**跨平台异步 I/O 库**，提供：

- 事件循环
- 异步文件系统操作
- 异步网络（TCP/UDP）
- 线程池
- 进程间通信

---

## 2. 事件循环阶段

Node.js 事件循环分为 6 个阶段，按顺序执行：

```
┌───────────────────────────┐
│           timers          │  ← setTimeout/setInterval
├───────────────────────────┤
│     pending callbacks     │  ← 系统操作回调（如 TCP 错误）
├───────────────────────────┤
│   idle, prepare (内部)    │
├───────────────────────────┤
│           poll            │  ← 检索新的 I/O 事件
├───────────────────────────┤
│           check           │  ← setImmediate
├───────────────────────────┤
│      close callbacks      │  ← socket.on('close', ...)
└───────────────────────────┘
```

### 2.1 timers 阶段

执行 `setTimeout` 和 `setInterval` 的回调：

```javascript
setTimeout(() => console.log("timer"), 0);
```

**注意**：timer 回调的实际执行时间可能晚于设定的延迟，因为需要等待前面的阶段完成。

### 2.2 poll 阶段

- 执行 I/O 回调
- 如果 poll 队列为空：
  - 如果有 `setImmediate` 等待，进入 check 阶段
  - 否则等待新的 I/O 事件

### 2.3 check 阶段

执行 `setImmediate` 回调：

```javascript
setImmediate(() => console.log("immediate"));
```

---

## 3. process.nextTick

`process.nextTick` **不属于事件循环的阶段**，它在当前操作完成后立即执行：

```javascript
setTimeout(() => console.log("timer"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));

// 输出：
// nextTick
// timer
// immediate
```

**优先级**：`process.nextTick` > Promise 微任务 > 事件循环阶段

### 3.1 nextTick 的危险

```javascript
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
recursiveNextTick();
// 事件循环被饿死，I/O 永远不会处理！
```

---

## 4. setImmediate vs setTimeout

### 4.1 I/O 循环中的确定性

```javascript
const fs = require("fs");

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});

// 输出：
// immediate
// timeout
```

在 I/O 回调内部，`setImmediate` 总是在 `setTimeout` 之前执行。

### 4.2 非 I/O 循环中的不确定性

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));

// 输出顺序不确定（取决于进程性能）
```

---

## 5. 与浏览器事件循环的差异

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 事件循环定义 | HTML Standard | libuv |
| 阶段划分 | 任务 + 微任务 + 渲染 | 6 个阶段 |
| process.nextTick | 无 | 有（优先级最高）|
| setImmediate | 无（IE 除外）| 有 |
| 宏任务类型 | UI 事件为主 | I/O、文件系统为主 |
| 微任务 | Promise、queueMicrotask | Promise、queueMicrotask、nextTick |

---

**参考资源**：Node.js Docs: Event Loop | libuv Documentation
