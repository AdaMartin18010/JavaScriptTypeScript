# 宏任务与微任务队列

> 任务优先级、drain 机制与经典题目解析
>
> 对齐版本：ECMAScript 2025 (ES16) | HTML Living Standard

---

## 1. 任务分类

```
同步代码
    ↓
微任务队列（Microtask Queue）—— 高优先级
    ├── Promise.then/catch/finally
    ├── queueMicrotask()
    ├── MutationObserver
    └── async/await 的 await 后续
    ↓（完全 drain）
渲染（浏览器）
    ↓
宏任务队列（Macrotask Queue / Task Queue）—— 低优先级
    ├── setTimeout/setInterval
    ├── setImmediate（Node.js）
    ├── I/O 操作
    ├── UI 事件
    └── MessageChannel
```

---

## 2. 优先级规则

### 2.1 执行顺序

```javascript
console.log("1. 同步");

setTimeout(() => console.log("2. setTimeout"), 0);

Promise.resolve().then(() => {
  console.log("3. Promise 1");
  Promise.resolve().then(() => console.log("4. Promise 2"));
});

queueMicrotask(() => console.log("5. queueMicrotask"));

console.log("6. 同步结束");

// 输出：
// 1. 同步
// 6. 同步结束
// 3. Promise 1
// 5. queueMicrotask
// 4. Promise 2
// 2. setTimeout
```

### 2.2 微任务的 drain 机制

事件循环会在执行下一个宏任务之前，**完全清空微任务队列**：

```javascript
Promise.resolve().then(() => {
  console.log("微任务 1");
  Promise.resolve().then(() => {
    console.log("微任务 2");
    Promise.resolve().then(() => {
      console.log("微任务 3");
    });
  });
});

// 所有嵌套微任务都在同一个检查点执行
// 输出：微任务 1 → 微任务 2 → 微任务 3
```

---

## 3. 常见宏任务源

| 来源 | 说明 |
|------|------|
| `setTimeout(fn, delay)` | 最小延迟 4ms（HTML5 规范） |
| `setInterval(fn, delay)` | 与 setTimeout 类似，重复执行 |
| `setImmediate(fn)` | Node.js 特有，check 阶段执行 |
| I/O 回调 | 文件读写、网络请求完成 |
| UI 事件 | click、scroll、keydown 等 |
| `MessageChannel` | 跨上下文通信，常用于 polyfill |

---

## 4. 常见微任务源

| 来源 | 说明 |
|------|------|
| `Promise.then/catch/finally` | Promise 解决后的回调 |
| `queueMicrotask(fn)` | 显式添加微任务 |
| `MutationObserver` | DOM 变更观察回调 |
| `async/await` | `await` 后的代码作为微任务执行 |

---

## 5. 经典题目体系

### Level 1: 基础

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// 输出：1, 4, 3, 2
```

### Level 2: 嵌套微任务

```javascript
Promise.resolve().then(() => {
  console.log("1");
  setTimeout(() => console.log("2"), 0);
  Promise.resolve().then(() => console.log("3"));
});
setTimeout(() => console.log("4"), 0);
// 输出：1, 3, 4, 2
```

### Level 3: async/await

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

// 输出：
// script start
// async1 start
// async2
// script end
// async1 end
```

### Level 4: 浏览器 vs Node.js

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// Node.js 输出：
// nextTick
// promise
// timeout
// immediate
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 微任务递归导致的阻塞 | 微任务中不断创建微任务 | 使用 setTimeout 将工作转移到宏任务 |
| 对 setTimeout(fn, 0) 的误解 | 最小延迟不是 0 | 使用 queueMicrotask 或 Promise.resolve() |
| await 后的代码执行时机 | await 后的代码是微任务 | 理解 async/await 的转换语义 |

---

**参考规范**：ECMA-262 §9.7 Jobs and Job Queues | HTML Living Standard §8.1.4 Event loops
