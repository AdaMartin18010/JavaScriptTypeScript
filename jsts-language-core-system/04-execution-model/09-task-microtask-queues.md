# 宏任务与微任务队列

> 任务优先级、drain 机制与经典题目解析
>
> 对齐版本：ECMAScript 2025 (ES16) | HTML Living Standard

---

## 1. 任务分类全景图

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

---

## 2. 优先级规则详解

### 2.1 执行顺序核心规则

```javascript
console.log("1. 同步代码");

setTimeout(() => console.log("2. 宏任务（setTimeout）"), 0);

Promise.resolve().then(() => {
  console.log("3. 微任务（Promise）");
});

queueMicrotask(() => {
  console.log("4. 微任务（queueMicrotask）");
});

console.log("5. 同步代码结束");

// 输出：
// 1. 同步代码
// 5. 同步代码结束
// 3. 微任务（Promise）
// 4. 微任务（queueMicrotask）
// 2. 宏任务（setTimeout）
```

### 2.2 微任务的 drain 机制

事件循环会在执行下一个宏任务之前，**完全清空微任务队列**（包括微任务中新创建的微任务）：

```javascript
Promise.resolve().then(() => {
  console.log("微任务 1");
  Promise.resolve().then(() => {
    console.log("微任务 1-1");
    Promise.resolve().then(() => {
      console.log("微任务 1-1-1");
    });
  });
});

Promise.resolve().then(() => {
  console.log("微任务 2");
});

// 输出：
// 微任务 1
// 微任务 2
// 微任务 1-1
// 微任务 1-1-1
```

**解析**：

1. 第一次微任务检查点：执行"微任务 1"和"微任务 2"（按注册顺序）
2. "微任务 1"执行过程中注册了"微任务 1-1"
3. 第一次检查点结束后发现还有微任务
4. 第二次微任务检查点：执行"微任务 1-1"
5. "微任务 1-1"执行过程中注册了"微任务 1-1-1"
6. 第三次微任务检查点：执行"微任务 1-1-1"
7. 微任务队列为空，可以执行下一个宏任务

---

## 3. 常见宏任务源详解

| 来源 | 进入队列时机 | 说明 |
|------|-------------|------|
| `setTimeout(fn, delay)` | delay 毫秒后 | 最小延迟 4ms（HTML5） |
| `setInterval(fn, delay)` | 每 delay 毫秒 | 如果回调执行时间 > delay，会积压 |
| `setImmediate(fn)` | 立即（Node.js）| 浏览器不支持（除 IE） |
| I/O 回调 | I/O 完成时 | 文件读写、网络请求 |
| UI 事件 | 用户交互时 | click、scroll、keydown |
| `MessageChannel` | postMessage 时 | 常用于 polyfill setImmediate |

---

## 4. 常见微任务源详解

| 来源 | 说明 |
|------|------|
| `Promise.then/catch/finally` | Promise 状态改变后的回调 |
| `queueMicrotask(fn)` | 显式添加微任务 |
| `MutationObserver` | DOM 变更后的异步回调 |
| `async/await` | `await` 表达式后的代码作为微任务执行 |

---

## 5. 经典题目体系（含详细解析）

### Level 1: 基础

**题目 1**

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

<details>
<summary>答案与解析</summary>

```
1, 4, 3, 2
```

解析：

1. 同步代码：`1`, `4`
2. 微任务：`3`
3. 宏任务：`2`

</details>

---

### Level 2: 进阶

**题目 2**

```javascript
Promise.resolve().then(() => {
  console.log("1");
  setTimeout(() => console.log("2"), 0);
  Promise.resolve().then(() => console.log("3"));
});
setTimeout(() => console.log("4"), 0);
```

<details>
<summary>答案与解析</summary>

```
1, 3, 4, 2
```

解析：

1. 第一个微任务检查点：执行第一个 Promise.then
   - 输出 `1`
   - 注册宏任务 `setTimeout("2")`
   - 注册微任务 `Promise("3")`
2. 第一个检查点还有微任务吗？有！执行 `Promise("3")`，输出 `3`
3. 微任务队列为空
4. 宏任务队列：`setTimeout("4")`（先注册） → `setTimeout("2")`（后注册）
5. 执行 `setTimeout("4")`，输出 `4`
6. 执行 `setTimeout("2")`，输出 `2`

</details>

---

### Level 3: async/await

**题目 3**

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");
async1();
console.log("script end");
```

<details>
<summary>答案与解析</summary>

```
script start
async1 start
async2
script end
async1 end
```

解析：

1. `script start`（同步）
2. `async1()` 被调用：
   - `async1 start`（同步，在 await 之前）
   - `await async2()`：
     - 调用 `async2()`，输出 `async2`
     - `async2()` 返回 resolved Promise
     - `await` 将 `console.log("async1 end")` 注册为微任务
   - `async1()` 暂停，控制权交回
3. `script end`（同步）
4. 微任务检查点：执行 `async1` 的恢复，输出 `async1 end`

</details>

---

### Level 4: 地狱模式

**题目 4**

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => console.log("5"), 0);
});

console.log("6");
```

<details>
<summary>答案与解析</summary>

```
1, 6, 4, 2, 3, 5
```

解析：

1. 同步：`1`, `6`
2. 微任务检查点：
   - 执行 Promise.then（输出 `4`），注册 setTimeout("5")
3. 微任务队列为空
4. 宏任务：取出先注册的 setTimeout("2")
   - 输出 `2`
   - 注册微任务 Promise("3")
5. 微任务检查点：执行 Promise("3")，输出 `3`
6. 宏任务：取出 setTimeout("5")，输出 `5`

</details>

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 微任务递归导致的阻塞 | 微任务中不断创建微任务，宏任务永远无法执行 | 将递归放入 `setTimeout` |
| 对 setTimeout(fn, 0) 的误解 | 最小延迟不是 0，实际至少 4ms | 使用 `queueMicrotask` 或 `MessageChannel` |
| await 后的代码执行时机 | `await` 后的代码是微任务，不是同步的 | 理解 async/await 的转换语义 |
| 多个 Promise.then 的顺序 | 按注册顺序执行，不是按 resolve 顺序 | 记住 FIFO |

---

**参考规范**：ECMA-262 §9.7 Jobs and Job Queues | HTML Living Standard §8.1.4 Event loops
