# 浏览器事件循环

> HTML Living Standard 定义的事件循环处理模型
>
> 对齐版本：ECMAScript 2025 (ES16) | HTML Living Standard

---

## 1. 核心组件

浏览器事件循环由以下组件构成：

```
┌─────────────────────────────────────────┐
│               Call Stack                │
│         （当前执行的 JavaScript）         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Microtask Queue                 │
│  • Promise.then / catch / finally       │
│  • queueMicrotask()                     │
│  • MutationObserver                     │
│  • async/await 的 await 后续            │
│  特性：递归清空（checkpoint 完全 drain）  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Rendering（每帧最多一次，约 16.67ms）  │
│  • requestAnimationFrame 回调            │
│  • 样式计算、布局（Reflow）               │
│  • 绘制（Repaint）、合成                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Macrotask Queue                 │
│  • setTimeout / setInterval             │
│  • DOM 事件（click, scroll...）          │
│  • fetch / XMLHttpRequest 回调           │
│  • MessageChannel / postMessage         │
│  特性：每次事件循环取出一个执行           │
└─────────────────────────────────────────┘
```

---

## 2. 处理模型（HTML Standard §8.1.4）

事件循环的每一步：

```
1. 从 macrotask queue 取出最老的任务并执行
2. Microtask checkpoint：
   a. 当微任务队列非空时：
      i.   取出最老的微任务
      ii.  执行
      iii. 重复（包括执行过程中新添加的微任务）
3. 如果有必要，更新渲染
4. 如果 macrotask queue 为空，等待新任务
5. 回到步骤 1
```

### 2.1 关键规则

**规则 1**：微任务在**每个任务之后**执行，且**递归清空**

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// 输出：1 → 4 → 3 → 2
```

**规则 2**：微任务可以**阻塞渲染**

```javascript
// ❌ 微任务过多会阻塞渲染，导致卡顿
function blockRender() {
  Promise.resolve().then(() => {
    heavyComputation();
    blockRender(); // 递归添加微任务
  });
}
// 页面永远不会渲染！
```

**规则 3**：每帧渲染前，微任务队列必须为空

```javascript
// 以下代码在微任务中修改 DOM，会在下一帧前批量渲染
document.body.textContent = "Before";
Promise.resolve().then(() => {
  document.body.textContent = "After";
});
// 用户只会看到 "After"（不会看到 "Before"）
```

---

## 3. 渲染时机

### 3.1 渲染的触发条件

浏览器不会每轮事件循环都渲染，而是在满足条件时渲染：

- 浏览器判断需要更新（如 DOM 变更、CSS 动画）
- `requestAnimationFrame` 有回调等待
- 距离上一帧渲染已超过 16.67ms（60fps）

### 3.2 requestAnimationFrame

```javascript
// rAF 回调在渲染前执行
requestAnimationFrame(() => {
  // 在下一帧渲染前执行
  // 适合 DOM 更新和动画
});
```

### 3.3 强制同步布局（Forced Synchronous Layout）

```javascript
// ❌ 强制同步布局（性能杀手）
const width = element.offsetWidth; // 读取布局属性
element.style.width = width + 10 + "px"; // 修改样式

// ✅ 批量读取和写入
const width = element.offsetWidth;
// ... 所有读取 ...
requestAnimationFrame(() => {
  element.style.width = width + 10 + "px";
  // ... 所有写入 ...
});
```

---

## 4. 与规范的对齐

### 4.1 HTML Living Standard 定义

> [§8.1.4 Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops):
>
> "Each event loop has a microtask queue, which is a queue of microtasks, initially empty. A microtask is a colloquial way of referring to a task that was created via the queue a microtask algorithm."
>
> "When a user agent is to perform a microtask checkpoint..."

### 4.2 微任务来源

| 来源 | 说明 |
|------|------|
| Promise | `then/catch/finally` 回调 |
| queueMicrotask | 显式入队 |
| MutationObserver | DOM 变更观察 |
| async/await | `await` 后续代码 |

---

## 5. 与 Node.js 事件循环的对比

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 微任务 | Promise、queueMicrotask、MutationObserver | Promise、queueMicrotask、process.nextTick |
| 宏任务 | setTimeout、DOM 事件、fetch | timers、I/O、setImmediate |
| 渲染 | 有 | 无 |
| nextTick | 无 | 有（优先级高于微任务） |

---

**参考规范**：[HTML Living Standard §8.1.4 Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
