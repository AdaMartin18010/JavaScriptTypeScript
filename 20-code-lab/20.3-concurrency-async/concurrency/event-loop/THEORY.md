# 事件循环（Event Loop）

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/event-loop`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 JavaScript **单线程并发模型**的理解问题。深入分析宏任务（Macrotasks）、微任务（Microtasks）和渲染周期的调度机制。事件循环是 JS 异步编程的底层基石，理解它是写出非阻塞代码的前提。

### 1.2 形式化基础

- **调用栈（Call Stack）**：同步代码的执行上下文栈，LIFO。
- **宏任务队列**：`setTimeout`、`setInterval`、I/O、UI 事件回调。
- **微任务队列**：`Promise.then`、`queueMicrotask`、`MutationObserver`。
- **事件循环步骤**：执行同步代码 → 清空微任务队列 → 执行单个宏任务 → 重复。

### 1.3 运行时事件循环对比

| 维度 | 浏览器（V8 + Blink） | Node.js（libuv） | Deno（Tokio + Rust） |
|------|---------------------|------------------|---------------------|
| **宏任务来源** | setTimeout, I/O, UI | timers, I/O, close callbacks | timers, I/O, Web APIs |
| **微任务触发时机** | 每轮任务后、渲染前 | 每 phase 结束后 | 每轮任务后 |
| **渲染时机** | 微任务后可能触发 | 无 GUI 渲染 | 无 GUI 渲染 |
| **nextTick** | 无（用 queueMicrotask） | `process.nextTick` 优先级高于微任务 | 无（用 queueMicrotask） |
| **典型陷阱** | 微任务阻塞渲染 | `nextTick` 饿死 Promise | 与浏览器模型更接近 |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 单线程模型简化了并发编程，但理解任务调度机制对于避免阻塞和优化性能至关重要。事件循环是异步编程的底层核心。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微任务优先 | 快速响应 Promise | 可能饿死宏任务 | 用户交互 |
| 宏任务节流 | 避免阻塞渲染 | 延迟增加 | 批量更新 |

### 2.3 与相关技术的对比

与多线程调度对比：事件循环单线程简化并发，多线程利用多核。现代 JS 通过 `Worker Threads` / `Web Workers` 结合二者。

---

## 三、实践映射

### 3.1 从理论到代码

**事件循环可视化（可运行脚本）**

```typescript
// 在浏览器 DevTools 或 Node.js 中直接运行
console.log('1. 同步：script start');

setTimeout(() => {
  console.log('5. 宏任务：setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3. 微任务：Promise 1');
  Promise.resolve().then(() => {
    console.log('4. 微任务：嵌套 Promise');
  });
});

queueMicrotask(() => {
  console.log('3. 微任务：queueMicrotask');
});

console.log('2. 同步：script end');

// ====== 预期输出顺序 ======
// 1. 同步：script start
// 2. 同步：script end
// 3. 微任务：Promise 1
// 3. 微任务：queueMicrotask
// 4. 微任务：嵌套 Promise
// 5. 宏任务：setTimeout
```

**Node.js 事件循环 Phase 演示**

```typescript
import { setImmediate } from 'timers';

console.log('1. 同步代码');

process.nextTick(() => {
  console.log('2. nextTick');
});

Promise.resolve().then(() => {
  console.log('3. microtask (Promise)');
});

setTimeout(() => {
  console.log('5. timers phase');
}, 0);

setImmediate(() => {
  console.log('6. check phase (setImmediate)');
});

// I/O 回调（fs.readFile 等）会进入 poll phase
// 4. poll phase callbacks (if any I/O)

// ====== Node.js 输出顺序 ======
// 1. 同步代码
// 2. nextTick        ← 优先级最高
// 3. microtask (Promise)
// 5. timers phase
// 6. check phase (setImmediate)
// 注意：setTimeout(0) 与 setImmediate 的顺序取决于系统负载和启动时间
```

**避免阻塞事件循环**

```typescript
// ❌ 错误：计算密集型任务阻塞事件循环
function heavyComputationBad(n: number): number {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.sqrt(i);
  return sum;
}

// ✅ 正确：拆分为微任务释放事件循环
async function heavyComputationGood(n: number, chunkSize = 1_000_000): Promise<number> {
  let sum = 0;
  for (let i = 0; i < n; i += chunkSize) {
    const end = Math.min(i + chunkSize, n);
    for (let j = i; j < end; j++) sum += Math.sqrt(j);
    // 每 chunk 让出事件循环
    await new Promise(resolve => setImmediate(resolve));
  }
  return sum;
}

// 可运行示例（Node.js）
(async () => {
  const start = Date.now();
  const result = await heavyComputationGood(10_000_000);
  console.log(`Result: ${result}, took ${Date.now() - start}ms`);
  // 期间其他 I/O 和定时器仍可正常调度
})();
```

#### 示例：requestAnimationFrame + 任务调度协作

```typescript
// raf-scheduler.ts — 与浏览器渲染周期协作的调度器

class RafScheduler {
  private tasks: Array<() => void> = [];
  private running = false;

  add(task: () => void) {
    this.tasks.push(task);
    if (!this.running) this.run();
  }

  private run() {
    this.running = true;
    requestAnimationFrame(() => {
      // 在渲染前执行高优先级任务
      const start = performance.now();
      while (this.tasks.length && performance.now() - start < 16) {
        const task = this.tasks.shift()!;
        task();
      }
      if (this.tasks.length) {
        // 剩余任务放到下一帧
        this.run();
      } else {
        this.running = false;
      }
    });
  }
}

// 使用：批量 DOM 更新不阻塞渲染
const scheduler = new RafScheduler();
for (let i = 0; i < 1000; i++) {
  scheduler.add(() => {
    document.body.appendChild(document.createElement('div'));
  });
}
```

#### 示例：MessageChannel 作为零延迟宏任务

```typescript
// message-channel-task.ts — 比 setTimeout(fn, 0) 更快的宏任务调度

function createMacroTaskScheduler() {
  const channel = new MessageChannel();
  const pending: Array<() => void> = [];

  channel.port2.onmessage = () => {
    const tasks = pending.splice(0);
    tasks.forEach((t) => t());
  };

  return (fn: () => void) => {
    pending.push(fn);
    channel.port1.postMessage(null);
  };
}

const scheduleMacroTask = createMacroTaskScheduler();

// 使用：比 setTimeout(..., 0) 更早执行，不受 4ms 节流限制
scheduleMacroTask(() => console.log('Macro task via MessageChannel'));
setTimeout(() => console.log('Macro task via setTimeout'), 0);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| `setTimeout(0)` 立即执行 | 最小延迟受限于宏任务队列和浏览器节流（通常 ≥ 4ms） |
| 微任务在每次宏任务后清空 | 微任务队列会递归清空直到为空（包括微任务中产生的微任务） |
| `await` 创建新的宏任务 | `await` 将后续代码包装为微任务，而非宏任务 |
| Node.js `nextTick` 是微任务 | `nextTick` 优先级高于 Promise 微任务，且不在事件循环的 phase 中 |

### 3.3 扩展阅读

- [What the heck is the event loop? — Philip Roberts (JSConf)](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [The Node.js Event Loop — Official Docs](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [HTML Standard: Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [Jake Archibald: Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [V8 Blog — The cost of JavaScript (Event Loop)](https://v8.dev/blog/cost-of-javascript-2019)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [Node.js — Don't Block the Event Loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
- [MDN — Concurrency model and the event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [web.dev — Optimize long tasks](https://web.dev/articles/optimize-long-tasks)
- `20.3-concurrency-async/concurrency/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
