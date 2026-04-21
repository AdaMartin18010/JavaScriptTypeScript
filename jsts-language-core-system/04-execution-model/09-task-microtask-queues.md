# 任务队列与微任务队列

> 事件循环的核心机制：macrotask vs microtask 的执行语义与 drain 机制
>
> 对齐版本：ECMAScript 2025 (ES16) | HTML Living Standard

---

## 1. 任务分类全景图

JavaScript 的并发模型基于**事件循环（Event Loop）**。理解事件循环的关键在于理解两类任务的优先级差异。

```
┌─────────────────────────────────────────────────────────────┐
│                        执行优先级                            │
├─────────────────────────────────────────────────────────────┤
│  1. 同步代码（Call Stack）                                   │
│     └── 当前正在执行的 JavaScript 代码                        │
├─────────────────────────────────────────────────────────────┤
│  2. 微任务队列（Microtask Queue）                            │
│     ├── Promise.then / .catch / .finally                     │
│     ├── queueMicrotask()                                     │
│     ├── MutationObserver                                     │
│     └── async/await 的 await 后续                            │
│     └── drain 机制：递归清空直到为空                           │
├─────────────────────────────────────────────────────────────┤
│  3. 渲染（浏览器）                                           │
│     ├── requestAnimationFrame                                │
│     ├── 样式计算                                             │
│     ├── 布局（重排）                                         │
│     ├── 绘制（重绘）                                         │
│     └── 合成                                                 │
├─────────────────────────────────────────────────────────────┤
│  4. 宏任务队列（Task Queue / Macrotask Queue）               │
│     ├── setTimeout / setInterval                             │
│     ├── setImmediate（Node.js）                              │
│     ├── I/O 操作                                             │
│     ├── UI 事件（click, scroll 等）                          │
│     └── MessageChannel                                       │
│     └── 每次事件循环只取出一个执行                             │
└─────────────────────────────────────────────────────────────┘
```

**核心规则**（来自 HTML Living Standard）：

> 每个事件循环有一个 **微任务队列（microtask queue）**。微任务队列初始为空。微任务是通过 queue-a-microtask 算法创建的任务。
>
> 每执行完一个**任务（task）**后，事件循环执行一个 **microtask checkpoint**——即处理微任务队列中的所有微任务。如果在处理微任务的过程中又有新的微任务入队，它们也会被处理。

---

## 2. 微任务的 Drain 机制

### 2.1 关键特性：递归清空

微任务队列在**单次 checkpoint 中会被完全清空**，即使新微任务在 checkpoint 过程中入队：

```javascript
console.log("1");

Promise.resolve().then(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
    Promise.resolve().then(() => {
      console.log("4");
    });
  });
});

console.log("5");

// 输出：1 → 5 → 2 → 3 → 4
```

**解释**：当同步代码执行完毕后，事件循环进入 microtask checkpoint。第一个微任务（输出"2"）执行时入队的第二个微任务（输出"3"）被添加到队列末尾，在**同一次 checkpoint** 中被处理。第三个微任务同理。

### 2.2 await 的展开

`await x` 等价于 `Promise.resolve(x).then(value => /* 后续代码 */)`，因此 `await` 后的代码作为微任务执行：

```javascript
async function async1() {
  console.log("async1 start");
  await async2();           // 等效于：Promise.resolve(async2()).then(...)
  console.log("async1 end"); // 微任务
}

async function async2() {
  console.log("async2");     // 同步执行
}

console.log("script start");
async1();
console.log("script end");

// 输出：
// script start
// async1 start
// async2
// script end
// async1 end
```

**步骤分解**：
1. `async1()` 调用 → 输出 `"async1 start"`
2. `await async2()` → `async2()` 立即执行，输出 `"async2"`
3. `await` 将后续代码（`console.log("async1 end")`）作为微任务入队
4. 同步代码继续 → 输出 `"script end"`
5. 同步代码结束 → microtask checkpoint → 执行微任务 → 输出 `"async1 end"`

---

## 3. 经典题目解析

### 3.1 题目一：Promise 链与微任务

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
});

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => console.log("5"), 0);
});

Promise.resolve().then(() => {
  console.log("6");
});

console.log("7");

// 输出：1 → 7 → 3 → 4 → 6 → 2 → 5
```

**执行步骤**：

| 步骤 | 操作 | 输出 | 队列状态 |
|------|------|------|---------|
| 1 | 同步代码 | 1 | - |
| 2 | setTimeout 回调入队 | - | Macrotask: [t1] |
| 3 | Promise.then 微任务入队 | - | Microtask: [m1] |
| 4 | Promise.then 微任务入队 | - | Microtask: [m1, m2] |
| 5 | Promise.then 微任务入队 | - | Microtask: [m1, m2, m3] |
| 6 | 同步代码 | 7 | - |
| 7 | Microtask checkpoint | 3 | Microtask: [m2, m3] |
| 8 | Microtask checkpoint | 4 | Microtask: [m3], Macrotask: [t1, t2] |
| 9 | Microtask checkpoint | 6 | Microtask: [] |
| 10 | Macrotask (t1) | 2 | Macrotask: [t2] |
| 11 | Microtask checkpoint | - | - |
| 12 | Macrotask (t2) | 5 | Macrotask: [] |

### 3.2 题目二：async/await 与 Promise.resolve

```javascript
async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
  await Promise.resolve();
  console.log("C");
}

test();
Promise.resolve().then(() => console.log("D"));
Promise.resolve().then(() => console.log("E"));

// 输出：A → D → B → E → C
```

**解释**：`await Promise.resolve()` 将后续代码作为微任务入队。第一个 `await` 后的 `"B"` 与外部的 `D`、`E` 一起竞争微任务队列。

### 3.3 题目三：Node.js process.nextTick

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// 输出：nextTick → promise → timeout/immediate
```

**Node.js 优先级**：`process.nextTick` > 微任务（Promise）> 定时器（timeout/immediate）

**警告**：`process.nextTick` 在 Node.js 中优先级过高，可能导致 I/O 饥饿。Node.js 文档建议使用 `queueMicrotask` 替代。

---

## 4. 实战影响

### 4.1 微任务饿死宏任务

```javascript
// ❌ 危险：微任务可以阻塞宏任务 indefinitely
function loop() {
  Promise.resolve().then(loop);
}
loop();
// setTimeout、I/O 事件永远不会被处理！
```

### 4.2 批量 DOM 更新

```javascript
// ✅ 使用微任务批量处理 DOM 更新
const updates = [];

function scheduleUpdate(fn) {
  updates.push(fn);
  if (updates.length === 1) {
    queueMicrotask(flushUpdates);
  }
}

function flushUpdates() {
  const batch = updates.splice(0);
  batch.forEach(fn => fn());
}
```

### 4.3 React 的批量更新

React 18 的自动批量更新（Automatic Batching）基于微任务机制：

```javascript
// React 18: 以下所有 setState 合并为一次重渲染
function handleClick() {
  setCount(c => c + 1); // 不立即重渲染
  setFlag(f => !f);     // 不立即重渲染
  // 微任务 checkpoint 时批量更新
}
```

---

## 5. 规范来源

| 概念 | 规范来源 |
|------|---------|
| 事件循环 | [HTML Living Standard §8.1.4](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) |
| 微任务 | [HTML Living Standard §8.1.4.2](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue) |
| Job Queue | [ECMA-262 §9.5](https://tc39.es/ecma262/#sec-jobs-and-job-queues) |
| Promise 行为 | [ECMA-262 §27.2](https://tc39.es/ecma262/#sec-promise-objects) |

---

**参考资源**：
- ["Tasks, microtasks, queues and schedules" by Jake Archibald](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) —— 事件循环的权威解释
- ["In the Loop" by Jake Archibald (JSConf 2018)](https://www.youtube.com/watch?v=cCOL7MC4Pl0) —— 视频演示
- ["JavaScript Visualized - Event Loop" by Lydia Hallie](https://www.youtube.com/watch?v=eiC58R16hb8) —— 现代可视化解释
