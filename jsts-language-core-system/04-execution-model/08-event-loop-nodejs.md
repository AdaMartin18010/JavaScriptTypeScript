# Node.js 事件循环

> libuv 驱动的六阶段事件循环与 process.nextTick
>
> 对齐版本：ECMAScript 2025 (ES16) | Node.js 22+

---

## 1. 六阶段模型

Node.js 事件循环由 libuv 实现，分为六个阶段：

```
┌─────────────────────────────────────────────┐
│              Node.js Event Loop              │
├─────────────────────────────────────────────┤
│  1. timers（定时器阶段）                      │
│     └── setTimeout、setInterval 回调          │
│                                              │
│  2. pending callbacks（待定回调阶段）          │
│     └── 系统操作回调（如 TCP 错误）            │
│                                              │
│  3. idle, prepare（空闲/准备阶段）             │
│     └── 内部使用                              │
│                                              │
│  4. poll（轮询阶段）                          │
│     └── 执行 I/O 回调                         │
│     └── 检查是否有新 I/O 事件                  │
│                                              │
│  5. check（检查阶段）                         │
│     └── setImmediate 回调                     │
│                                              │
│  6. close callbacks（关闭回调阶段）            │
│     └── socket.on('close', ...)              │
└─────────────────────────────────────────────┘
        ↑                                       │
        └──────────── 循环执行 ──────────────────┘
```

---

## 2. 各阶段详解

### 2.1 timers 阶段

执行 `setTimeout` 和 `setInterval` 的回调。注意：**定时器的回调在达到延迟时间后入队，但不保证精确执行时间**。

```javascript
setTimeout(() => console.log("timeout"), 100);
// 100ms 后回调入队，但如果事件循环正忙，可能延迟执行
```

### 2.2 poll 阶段

事件循环在此阶段等待新的 I/O 事件：

- 如果 poll 队列不为空，执行所有 I/O 回调
- 如果 poll 队列为空：
  - 如果有 `setImmediate` 等待，进入 check 阶段
  - 否则等待新的 I/O 事件

### 2.3 check 阶段

执行 `setImmediate` 回调。`setImmediate` 设计为在当前 poll 阶段完成后尽快执行。

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));

// 输出不确定！取决于上下文
// 如果在 I/O 回调中，immediate 先执行
// 如果在主模块中，timeout 可能先执行
```

---

## 3. process.nextTick

`process.nextTick` 在 Node.js 中具有**最高优先级**，在微任务之前执行：

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// 输出：nextTick → promise → timeout/immediate
```

### 3.1 nextTick 的危险性

```javascript
// ❌ nextTick 可能饿死 I/O
function dangerous() {
  process.nextTick(dangerous);
}
dangerous();
// 事件循环永远无法进入 poll 阶段，I/O 事件被饿死！
```

### 3.2 官方建议

Node.js 文档建议使用 `queueMicrotask` 替代 `process.nextTick`：

```javascript
// ✅ 更安全的替代方案
queueMicrotask(() => {
  console.log("microtask");
});
```

---

## 4. 完整执行顺序示例

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  process.nextTick(() => console.log("3"));
  setTimeout(() => console.log("4"), 0);
}, 0);

setImmediate(() => {
  console.log("5");
  process.nextTick(() => console.log("6"));
});

Promise.resolve().then(() => {
  console.log("7");
  process.nextTick(() => console.log("8"));
});

process.nextTick(() => console.log("9"));

console.log("10");

// 输出分析：
// 同步：1 → 10
// nextTick：9
// Promise 微任务：7 → 8（7 中注册的 nextTick）
// Timers：2 → 3（2 中注册的 nextTick）
// Check：5 → 6（5 中注册的 nextTick）
// Timers（第二轮）：4
//
// 最终输出（可能）：1 → 10 → 9 → 7 → 8 → 2 → 3 → 5 → 6 → 4
```

---

## 5. 浏览器 vs Node.js 对比

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 事件循环实现 | 浏览器引擎 | libuv |
| 微任务 | Promise、queueMicrotask、MutationObserver | Promise、queueMicrotask |
| 额外微任务 | 无 | process.nextTick |
| 宏任务队列 | 单个任务队列 | 多个阶段 |
| setImmediate | 无（可用 polyfill） | 有（check 阶段） |
| I/O 处理 | 通过 Web APIs | 原生 libuv |
| 渲染 | 有 | 无 |

---

**参考规范**：
- [Node.js Event Loop Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Documentation](http://docs.libuv.org/en/v1.x/design.html)
