# 浏览器事件循环

> HTML 标准定义的事件循环：任务队列、微任务与渲染时机
>
> 对齐版本：HTML Living Standard §8.1.4 | ECMAScript 2025 (ES16)

---

## 1. HTML 规范模型

浏览器的事件循环由 HTML Living Standard 定义，核心组件：

- **事件循环（Event Loop）**：一个或多个任务队列 + 微任务队列
- **任务（Task）**：macrotask，如 setTimeout、用户交互事件
- **微任务（Microtask）**：Promise 回调、MutationObserver

---

## 2. 任务类型

### 2.1 宏任务（Macrotask）

- `setTimeout` / `setInterval`
- I/O 操作（文件、网络）
- UI 渲染事件
- 用户交互事件（click、scroll 等）
- `setImmediate`（IE/Edge 遗留）
- `MessageChannel`

### 2.2 微任务（Microtask）

- `Promise.then` / `.catch` / `.finally`
- `queueMicrotask()`
- `MutationObserver`
- `async/await` 的 `await` 后续代码

---

## 3. 事件循环步骤

```
1. 从任务队列中取出最老的可执行任务
2. 执行该任务（及由此产生的同步代码）
3. 执行所有微任务（直到微任务队列为空）
4. 更新渲染（如有必要）
5. 重复步骤 1
```

### 3.1 微任务检查点

每次任务执行完毕后，浏览器会执行一个**微任务检查点（Microtask Checkpoint）**：

```javascript
console.log("Start");

setTimeout(() => console.log("Timeout"), 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
  Promise.resolve().then(() => console.log("Promise 2"));
});

console.log("End");

// 输出：
// Start
// End
// Promise 1
// Promise 2
// Timeout
```

---

## 4. 渲染时机

### 4.1 requestAnimationFrame

在渲染之前执行，与屏幕刷新率同步（通常 60Hz）：

```javascript
function animate() {
  // 更新动画
  updateAnimation();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 4.2 渲染流程在事件循环中的位置

```
执行任务 → 清空微任务 → 渲染（样式计算、布局、绘制）→ 下一帧
```

### 4.3 长时间任务阻塞渲染

```javascript
// 阻塞主线程 1 秒
const start = Date.now();
while (Date.now() - start < 1000) {}
// 这期间 UI 无法更新，用户感知卡顿
```

**解决方案**：使用 `requestIdleCallback` 或 Web Workers。

---

## 5. 与规范的对照

| 概念 | HTML 标准 | ECMAScript |
|------|----------|-----------|
| 事件循环 | §8.1.4 Event loops | §9.7 Jobs and Job Queues |
| 任务 | task | ScriptJob / PromiseJob |
| 微任务 | microtask | PromiseJobs |
| 渲染 | update the rendering | N/A（宿主环境定义）|

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 微任务饥饿宏任务 | 大量微任务阻止宏任务执行 | 将低优先级工作放入 setTimeout |
| 同步代码阻塞渲染 | 长时间同步计算阻塞 UI | 使用 requestIdleCallback 或 Worker |
| setTimeout(fn, 0) 不精确 | 最小延迟 4ms（HTML5 规范）| 使用 queueMicrotask 或 MessageChannel |

---

**参考规范**：HTML Living Standard §8.1.4 Event loops | ECMA-262 §9.7 Jobs and Job Queues
