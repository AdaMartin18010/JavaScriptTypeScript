# 并发与异步：理论基础

> **定位**：`20-code-lab/20.3-concurrency-async/`
> **关联**：`10-fundamentals/10.3-execution-model/` | `JSTS全景综述/04_concurrency.md`

---

## 一、核心理论

### 1.1 问题域定义

JavaScript 的并发模型基于**单线程事件循环**（Single-Threaded Event Loop），所有用户代码执行于同一主线程。异步操作通过**事件队列**与**回调机制**实现非阻塞处理。理解这一模型是掌握 Node.js 服务端编程、浏览器性能优化和避免竞态条件的关键。

### 1.2 形式化基础

**事件循环的形式化描述**：

```
Event Loop:
  while (true) {
    1. 执行宏任务队列（Macrotask Queue）中的最老任务
    2. 执行所有微任务（Microtask Queue）直至为空
    3. 渲染更新（如果需要）
    4. 重复
  }
```

**宏任务 vs 微任务**：

| 类型 | 来源 | 优先级 | 示例 |
|------|------|--------|------|
| **Macrotask** | 宿主环境 | 低 | setTimeout, setInterval, I/O, UI事件 |
| **Microtask** | JS引擎 | 高 | Promise.then, queueMicrotask, MutationObserver |

---

## 二、设计原理

### 2.1 为什么单线程

JavaScript 设计于浏览器环境，核心约束是**DOM 操作安全**：

- 多线程同时操作 DOM 会导致不可预测的状态
- 单线程消除了锁竞争和死锁
- 代价：CPU 密集型任务会阻塞主线程

### 2.2 异步演进

```
Callbacks (1995)
  ↓
Promises (ES2015)
  ↓
async/await (ES2017)
  ↓
Async Iterators (ES2018)
  ↓
Structured Concurrency (未来)
```

### 2.3 Node.js vs 浏览器事件循环

| 维度 | 浏览器 | Node.js |
|------|--------|---------|
| 宏任务 | 任务队列 | `libuv` 6阶段（timers→poll→check） |
| 微任务 | Promise + queueMicrotask | 同浏览器 |
| 渲染 | 每帧检查 | 无 |
| 特殊 | `requestIdleCallback` | `setImmediate`, `process.nextTick` |

---

## 三、实践映射

### 3.1 常见模式

- **Promise 组合器**：`Promise.all` vs `Promise.race` vs `Promise.allSettled`
- **并发控制**：限制同时进行的异步操作数（p-limit 模式）
- **取消模式**：`AbortController` 的信号传播
- **背压处理**：Readable/Writable Stream 的流量控制

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| `async` 函数返回 Promise | `async` 函数**总是**返回 Promise，即使显式返回非 Promise |
| `await` 阻塞线程 | `await` 暂停**当前函数执行**，不阻塞事件循环 |
| `Promise` 创建即执行 | `new Promise(fn)` 中的 `fn` 立即同步执行 |
| `forEach` + `async` 并行 | `forEach` 不等待异步回调，应使用 `for...of` + `await` |

---

## 四、扩展阅读

- `10-fundamentals/10.3-execution-model/` — V8 引擎执行模型
- `JSTS全景综述/04_concurrency.md` — 并发模型深度分析
- `docs/guides/ai-coding-workflow.md` — AI 辅助异步代码审查

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
