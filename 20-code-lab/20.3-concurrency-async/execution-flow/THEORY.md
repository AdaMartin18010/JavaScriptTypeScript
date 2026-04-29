# 执行流 — 理论基础

## 1. 调用栈（Call Stack）

JavaScript 使用单线程调用栈管理函数调用：

- 每次函数调用压入栈帧（包含参数、局部变量、返回地址）
- 函数返回时弹出栈帧
- 栈溢出: 递归过深或循环引用导致 `RangeError: Maximum call stack size exceeded`

## 2. 执行上下文栈

```
全局上下文
  ├── 函数A上下文
  │     ├── 函数B上下文
  │     └── 返回函数A
  └── 返回全局
```

每个执行上下文包含：

- **变量环境（Variable Environment）**: var 声明、函数声明
- **词法环境（Lexical Environment）**: let/const 声明、块级作用域
- **this 绑定**: 由调用方式决定

## 3. 事件循环（Event Loop）

```
调用栈 → 清空 → 检查微任务队列 → 清空 → 检查宏任务队列 → 取出一个执行
```

- **宏任务（Macrotask）**: setTimeout、setInterval、I/O、UI 渲染
- **微任务（Microtask）**: Promise.then、MutationObserver、queueMicrotask
- **关键规则**: 每次宏任务执行后，清空所有微任务

## 4. 异步执行顺序

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 输出: 1 → 4 → 3 → 2
```

## 5. 运行时事件循环深度对比

| 特性 | Node.js | 浏览器（Chromium） | Deno |
|------|---------|-------------------|------|
| **事件循环库** | libuv | 各浏览器实现（Blink/V8） | Tokio（Rust）+ V8 |
| **宏任务队列** | 7 阶段（timers/pending/check/close 等）| 任务队列（HTML 规范）| 类似 Node，基于 Tokio |
| **微任务队列** | `process.nextTick` + `Promise` | `Promise` + `MutationObserver` | `Promise` + `queueMicrotask` |
| **nextTick 优先级** | 高于 Promise.then | 无 nextTick | 无 nextTick |
| **I/O 模型** | 非阻塞 I/O，线程池 | Web APIs（网络、存储、GPU）| 非阻塞 I/O，权限模型 |
| **定时器精度** | ~4ms（受事件循环影响）| ~4ms | ~1ms |
| **并发模型** | 单线程 + Worker Threads / 子进程 | Web Workers / Service Workers | Web Workers |
| **任务优先级** | 无内置优先级 | `postTask` API（实验性）| 无内置优先级 |
| **渲染时机** | 无（服务端）| 宏任务边界后渲染帧 | 无（服务端）|
| **模块系统** | CommonJS / ESM | ESM / Script | ESM 原生 |
| **全局对象** | `global` / `globalThis` | `window` / `globalThis` | `globalThis` |
| **诊断工具** | `node --prof`, clinic.js | Chrome DevTools Performance | `deno --prof` |

### Node.js 事件循环阶段详解

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  系统操作回调（如 TCP 错误）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  检索新的 I/O 事件；执行 I/O 回调
│  │     (执行到队列为空或       │  适当时候会阻塞在这里
│  │      达到系统上限)         │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │  socket.on('close', ...)
│  └───────────────────────────┘
│                              ↓  nextTickQueue & microTaskQueue
└──────────────────────────────┘  每个阶段结束后检查
```

## 6. 代码示例：跨平台异步任务调度

```typescript
// src/event-loop-demo.ts — 跨运行时异步调度演示

/**
 * 统一微任务调度 API（跨 Node.js / 浏览器 / Deno）
 */
function scheduleMicrotask(callback: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback)
  } else if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(callback)
  } else {
    Promise.resolve().then(callback)
  }
}

/**
 * 统一宏任务调度 API（优先使用更高精度的调度器）
 */
function scheduleMacrotask(callback: () => void, delay = 0): () => void {
  const id = setTimeout(callback, delay)
  return () => clearTimeout(id)
}

/**
 * 优先级任务队列：模拟浏览器 Scheduler API
 * 高优先级：user-blocking（用户交互）
 * 中优先级：user-visible（默认）
 * 低优先级：background（分析、日志）
 */
type TaskPriority = 'user-blocking' | 'user-visible' | 'background'

interface PrioritizedTask {
  id: number
  priority: TaskPriority
  callback: () => void
}

class PriorityTaskScheduler {
  private tasks: PrioritizedTask[] = []
  private running = false
  private nextId = 1
  private priorityWeight: Record<TaskPriority, number> = {
    'user-blocking': 3,
    'user-visible': 2,
    'background': 1
  }

  schedule(callback: () => void, priority: TaskPriority = 'user-visible'): number {
    const id = this.nextId++
    this.tasks.push({ id, priority, callback })
    this.tasks.sort((a, b) => this.priorityWeight[b.priority] - this.priorityWeight[a.priority])

    if (!this.running) {
      this.running = true
      scheduleMicrotask(() => this.flush())
    }

    return id
  }

  private flush(): void {
    // 模拟浏览器每帧时间预算（16ms @ 60fps）
    const frameBudget = 16
    const start = performance.now()

    while (this.tasks.length > 0) {
      const elapsed = performance.now() - start

      // 如果时间预算耗尽，将剩余任务推迟到下一帧
      if (elapsed >= frameBudget) {
        scheduleMacrotask(() => this.flush(), 0)
        return
      }

      const task = this.tasks.shift()!
      try {
        task.callback()
      } catch (err) {
        console.error(`Task ${task.id} failed:`, err)
      }
    }

    this.running = false
  }
}

// ==================== 事件循环可视化追踪 ====================

interface TaskLog {
  phase: string
  type: 'sync' | 'microtask' | 'macrotask'
  label: string
  timestamp: number
}

class EventLoopTracer {
  private logs: TaskLog[] = []

  log(phase: string, type: TaskLog['type'], label: string): void {
    this.logs.push({
      phase,
      type,
      label,
      timestamp: performance.now()
    })
  }

  print(): void {
    const baseTime = this.logs[0]?.timestamp ?? 0
    console.log('\n=== Event Loop Execution Trace ===\n')

    this.logs.forEach((log, i) => {
      const offset = (log.timestamp - baseTime).toFixed(2)
      const icon = log.type === 'sync' ? '🟦' : log.type === 'microtask' ? '🟩' : '🟨'
      console.log(`${i + 1}. ${icon} [${log.phase}] ${log.label} (+${offset}ms)`)
    })

    console.log('\n🟦 = Sync (Call Stack)')
    console.log('🟩 = Microtask (Promise/nextTick)')
    console.log('🟨 = Macrotask (setTimeout/setImmediate)')
  }

  clear(): void {
    this.logs = []
  }
}

// ==================== 综合演示 ====================

async function runEventLoopDemo(): Promise<void> {
  const tracer = new EventLoopTracer()
  const scheduler = new PriorityTaskScheduler()

  console.log('=== Starting Event Loop Demo ===\n')

  // 同步代码（调用栈）
  tracer.log('Call Stack', 'sync', 'console.log("A")')
  console.log('A')

  // 宏任务：setTimeout
  setTimeout(() => {
    tracer.log('Timers Phase', 'macrotask', 'setTimeout callback')
    console.log('B — setTimeout')

    // setTimeout 内部的 Promise → 进入微任务队列
    Promise.resolve().then(() => {
      tracer.log('Timers Phase → Microtask', 'microtask', 'Promise inside setTimeout')
      console.log('C — Promise inside setTimeout')
    })
  }, 0)

  // Node.js 特有：setImmediate（浏览器无此 API）
  if (typeof setImmediate === 'function') {
    setImmediate(() => {
      tracer.log('Check Phase', 'macrotask', 'setImmediate callback')
      console.log('D — setImmediate')
    })
  }

  // 微任务：Promise
  Promise.resolve().then(() => {
    tracer.log('Microtask Queue', 'microtask', 'Promise.then #1')
    console.log('E — Promise #1')
  })

  Promise.resolve().then(() => {
    tracer.log('Microtask Queue', 'microtask', 'Promise.then #2')
    console.log('F — Promise #2')
  })

  // 微任务：queueMicrotask
  queueMicrotask(() => {
    tracer.log('Microtask Queue', 'microtask', 'queueMicrotask')
    console.log('G — queueMicrotask')
  })

  // Node.js 特有：process.nextTick（优先级最高）
  if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(() => {
      tracer.log('nextTickQueue', 'microtask', 'process.nextTick')
      console.log('H — nextTick')
    })
  }

  // 同步代码继续
  tracer.log('Call Stack', 'sync', 'console.log("I")')
  console.log('I')

  // 优先级任务调度器演示
  scheduler.schedule(() => {
    tracer.log('Custom Scheduler', 'macrotask', 'background task: analytics')
    console.log('J — background task')
  }, 'background')

  scheduler.schedule(() => {
    tracer.log('Custom Scheduler', 'macrotask', 'user-blocking task: click handler')
    console.log('K — user-blocking task')
  }, 'user-blocking')

  // 等待所有异步完成
  await new Promise((resolve) => setTimeout(resolve, 100))
  tracer.print()
}

// Node.js / Deno 直接运行
if (typeof window === 'undefined') {
  runEventLoopDemo()
}

// 预期输出顺序（Node.js）：
// A → I → H(nextTick) → E(Promise#1) → F(Promise#2) → G(queueMicrotask) →
// K(user-blocking) → J(background) → B(setTimeout) → C(Promise inside) → D(setImmediate)
```

```typescript
// src/async-patterns.ts — 生产级异步模式

/**
 * 并发控制：限制同时执行的 Promise 数量
 */
function pLimit<T>(concurrency: number) {
  const queue: (() => void)[] = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) {
      queue.shift()!()
    }
  }

  return (fn: () => Promise<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      const run = () => {
        activeCount++
        fn().then(resolve, reject).finally(next)
      }

      if (activeCount < concurrency) {
        run()
      } else {
        queue.push(run)
      }
    })
}

/**
 * 批量请求合并（Debounce + Batching）
 * 将短时间内多个独立请求合并为一个批量请求
 */
class BatchRequester<K, V> {
  private pending = new Map<K, { resolve: (v: V) => void; reject: (e: Error) => void }>()
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private batchFn: (keys: K[]) => Promise<Map<K, V>>,
    private delay = 10
  ) {}

  async request(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      this.pending.set(key, { resolve, reject })

      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.flush(), this.delay)
    })
  }

  private async flush(): Promise<void> {
    const keys = Array.from(this.pending.keys())
    const resolvers = new Map(this.pending)
    this.pending = new Map()
    this.timer = null

    try {
      const results = await this.batchFn(keys)
      for (const [key, { resolve, reject }] of resolvers) {
        if (results.has(key)) {
          resolve(results.get(key)!)
        } else {
          reject(new Error(`Key not found in batch: ${key}`))
        }
      }
    } catch (err) {
      for (const { reject } of resolvers.values()) {
        reject(err as Error)
      }
    }
  }
}
```

## 7. 权威外部资源

- [MDN — Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [Node.js — Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [HTML Spec — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [Jake Archibald — Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [Philip Roberts — What the heck is the event loop anyway? (JSConf)](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [Deno — Architecture Overview](https://docs.deno.com/runtime/fundamentals/architecture/)
- [libuv Documentation](https://docs.libuv.org/en/v1.x/design.html)
- [Chrome Developers — Inside look at modern web browser](https://developer.chrome.com/blog/inside-browser-part1/)

## 8. 与相邻模块的关系

- **03-concurrency**: 并发编程的深层机制
- **15-data-flow**: 数据在应用中的流动方式
- **05-execution-flow**: L1 层的执行流形式化分析
