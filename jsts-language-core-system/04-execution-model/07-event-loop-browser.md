# 浏览器事件循环

> HTML 标准定义的事件循环：任务队列、微任务与渲染时机

---

## 内容大纲（TODO）

### 1. HTML 规范模型

- Event Loop 的定义
- 任务队列（Task Queues）
- 微任务队列（Microtask Queue）

### 2. 任务类型

- 宏任务（Macrotask）：setTimeout, setInterval, I/O, UI事件
- 微任务（Microtask）：Promise, queueMicrotask, MutationObserver

### 3. 事件循环步骤

1. 执行最老的可运行任务
2. 执行所有微任务（直至为空）
3. 更新渲染（如有必要）
4. 重复

### 4. 渲染时机

- requestAnimationFrame
- 重排（Reflow）与重绘（Repaint）
- 渲染与事件循环的交互

### 5. 与规范的对照

- HTML Living Standard §8.1.4
- ECMAScript Job Queues 的映射

### 6. 常见陷阱

- 微任务饥饿宏任务
- 同步代码阻塞渲染
