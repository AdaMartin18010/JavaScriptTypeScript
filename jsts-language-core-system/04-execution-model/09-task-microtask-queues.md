# 宏任务与微任务队列

> 任务优先级、drain 机制与经典题目解析

---

## 内容大纲（TODO）

### 1. 任务分类

- 宏任务（Macrotask / Task）
- 微任务（Microtask）
- 浏览器特定任务（requestAnimationFrame）

### 2. 优先级规则

- 同步代码 > 微任务 > 渲染 > 宏任务
- 微任务的 drain 机制

### 3. 常见宏任务源

- setTimeout / setInterval
- setImmediate（Node.js）
- I/O 操作
- UI 渲染事件
- MessageChannel

### 4. 常见微任务源

- Promise.then / catch / finally
- queueMicrotask
- MutationObserver
- async/await 的 await 后续

### 5. 经典题目体系

- 基础题：Promise vs setTimeout
- 进阶题：嵌套微任务
- 高难度：结合 async/await 与事件循环

### 6. 常见陷阱

- 微任务递归导致的阻塞
- 对 setTimeout(fn, 0) 的误解
