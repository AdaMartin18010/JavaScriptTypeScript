# 事件循环（Event Loop）

> 浏览器与 Node.js 的事件循环机制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 浏览器事件循环

### 1.1 核心组件

```
┌─────────────────────────────────────────┐
│               Call Stack                │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Microtask Queue                 │
│  (Promise.then, queueMicrotask,         │
│   MutationObserver)                     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Macrotask Queue                 │
│  (setTimeout, setInterval, setImmediate,│
│   I/O, UI rendering)                    │
└─────────────────────────────────────────┘
```

### 1.2 执行顺序

```javascript
console.log("1"); // 同步

setTimeout(() => console.log("2"), 0); // 宏任务

Promise.resolve().then(() => console.log("3")); // 微任务

console.log("4"); // 同步

// 输出：1 → 4 → 3 → 2
```

### 1.3 微任务 draining

每次事件循环迭代中，微任务队列会**完全清空**后才执行宏任务：

```javascript
Promise.resolve()
  .then(() => {
    console.log("1");
    return Promise.resolve("2");
  })
  .then(v => console.log(v));

Promise.resolve().then(() => console.log("3"));

// 输出：1 → 3 → 2
// 解释：第一个 then 的回调执行后，返回的 Promise 加入微任务队列
// 在继续下一个 then 之前，先清空所有微任务（包括第三个 Promise）
```

---

## 2. Node.js 事件循环

### 2.1 阶段（Phases）

```
┌─────────────────────────────────────────┐
│  1. timers (setTimeout, setInterval)    │
│  2. pending callbacks (I/O callbacks)   │
│  3. idle, prepare                       │
│  4. poll (retrieve new I/O events)      │
│  5. check (setImmediate)                │
│  6. close callbacks                     │
└─────────────────────────────────────────┘
```

### 2.2 process.nextTick

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// 输出：nextTick → promise → timeout/immediate
```

`process.nextTick` 在微任务之前执行，可能饥饿 I/O。

---

**参考规范**：HTML Living Standard §8.1.6.2 Processing model | Node.js Event Loop
