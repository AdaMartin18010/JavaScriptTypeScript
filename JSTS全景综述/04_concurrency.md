# JavaScript 执行模型与并发语义深度解析

> 本文档面向研究者与高级开发者，系统梳理 JavaScript 并发机制的三层边界：V8 引擎实现、宿主环境调度与 ECMAScript 语言规范。所有核心论断均引用自 HTML Living Standard（2025）、ECMA-262（2025，即 ES16）及 V8 引擎源码与文档。

---

## 目录

- [JavaScript 执行模型与并发语义深度解析](#javascript-执行模型与并发语义深度解析)
  - [目录](#目录)
  - [1. 三层边界：从规范到实现的宏观框架](#1-三层边界从规范到实现的宏观框架)
    - [1.1 为什么需要三层边界](#11-为什么需要三层边界)
    - [1.2 各层职责与交互关系](#12-各层职责与交互关系)
  - [2. V8 引擎层：执行上下文与任务调度](#2-v8-引擎层执行上下文与任务调度)
    - [2.1 v8::Isolate：执行上下文的物理隔离](#21-v8isolate执行上下文的物理隔离)
    - [2.2 v8::MicrotaskQueue：微任务的生命周期管理](#22-v8microtaskqueue微任务的生命周期管理)
    - [2.3 v8::TaskRunner：宏任务的宿主注入](#23-v8taskrunner宏任务的宿主注入)
  - [3. 宿主环境层：Event Loop 的分野](#3-宿主环境层event-loop-的分野)
    - [3.1 浏览器的 HTML Event Loop（2024–2025 更新）](#31-浏览器的-html-event-loop20242025-更新)
      - [3.1.1 从单一队列到 Per-Source Task Queues](#311-从单一队列到-per-source-task-queues)
      - [3.1.2 Microtask Checkpoint 的精确触发时机](#312-microtask-checkpoint-的精确触发时机)
      - [3.1.3 "Perform a microtask checkpoint" 算法步骤](#313-perform-a-microtask-checkpoint-算法步骤)
    - [3.2 Node.js 的 libuv Event Loop](#32-nodejs-的-libuv-event-loop)
      - [3.2.1 七个阶段与 nextTick 的特权](#321-七个阶段与-nexttick-的特权)
      - [3.2.2 浏览器与 Node.js 的本质差异](#322-浏览器与-nodejs-的本质差异)
  - [4. 语言规范层：ECMA-262 的 Job 与模块语义](#4-语言规范层ecma-262-的-job-与模块语义)
    - [4.1 Job Queues 与宿主环境的桥接](#41-job-queues-与宿主环境的桥接)
    - [4.2 Promise 的反应任务（Reaction Jobs）](#42-promise-的反应任务reaction-jobs)
    - [4.3 async/await 的状态机转换](#43-asyncawait-的状态机转换)
      - [4.3.1 async function 的挂起与恢复](#431-async-function-的挂起与恢复)
      - [4.3.2 `Await` 抽象操作的展开语义](#432-await-抽象操作的展开语义)
    - [4.4 Top-level await 的模块语义](#44-top-level-await-的模块语义)
      - [4.4.1 模块图中的 AsyncModuleExecutionFulfilled / Rejected](#441-模块图中的-asyncmoduleexecutionfulfilled--rejected)
      - [4.4.2 求值冻结与并行加载的边界](#442-求值冻结与并行加载的边界)
    - [4.5 Node.js 24 的 require(esm) 与模块并发](#45-nodejs-24-的-requireesm-与模块并发)
      - [同步求值约束](#同步求值约束)
      - [求值冻结与模块缓存语义](#求值冻结与模块缓存语义)
      - [与 `import()` 的本质差异](#与-import-的本质差异)
      - [对并发与启动性能的影响](#对并发与启动性能的影响)
  - [5. SharedArrayBuffer、Agent Cluster 与 Atomics](#5-sharedarraybufferagent-cluster-与-atomics)
    - [5.1 Agent Cluster 与共享内存边界](#51-agent-cluster-与共享内存边界)
    - [5.2 `Atomics.pause`（ES2025 新增）的语义与工程意义](#52-atomicspausees2025-新增的语义与工程意义)
      - [规范语义](#规范语义)
      - [与 `Atomics.wait` 的本质区别](#与-atomicswait-的本质区别)
      - [工程应用：带退避的自旋锁](#工程应用带退避的自旋锁)
  - [6. 总结](#6-总结)
  - [7. Async Context（Stage 2）前瞻分析](#7-async-contextstage-2前瞻分析)
    - [核心问题：异步边界上的上下文断裂](#核心问题异步边界上的上下文断裂)
    - [Async Context 的语义](#async-context-的语义)
    - [与现有解决方案的对比](#与现有解决方案的对比)
    - [工程意义](#工程意义)
  - [参考文献与来源索引](#参考文献与来源索引)

---

## 1. 三层边界：从规范到实现的宏观框架

### 1.1 为什么需要三层边界

JavaScript 的并发模型长期被简化为"一个 Event Loop + 一个 Call Stack"的通俗描述，这种描述在三个维度上存在严重失真：

1. **实现失真**：将 V8 引擎内部的调度机制（`v8::MicrotaskQueue`、`v8::TaskRunner`）与宿主环境的 Event Loop 混为一谈，忽略了引擎与宿主之间存在明确的 C++ API 边界。
2. **宿主失真**：将浏览器的 HTML Event Loop 与 Node.js 的 libuv Event Loop 视为同一概念的不同" flavor "，未能认识到两者在任务来源（task source）、渲染时机（rendering opportunity）和 I/O 模型上的根本差异。
3. **规范失真**：将 ECMA-262 定义的抽象 Job Queue 直接等同于"微任务队列"，忽略了规范层面并不存在"microtask"或"macrotask"术语，只有 Job 和 Host 对 Job 的调度承诺。

要建立准确的认知，必须将系统划分为三层：**V8 引擎层**（C++ 实现）、**宿主环境层**（HTML/libuv 调度器）与**语言规范层**（ECMA-262 抽象语义）。

### 1.2 各层职责与交互关系

| 层级 | 核心实体 | 职责 |
|------|---------|------|
| **V8 引擎层** | `v8::Isolate`, `v8::MicrotaskQueue`, `v8::TaskRunner` | 提供独立的 JS 执行环境、管理微任务队列的 checkpoint、接收宿主注入的宏任务 [V8 Docs] |
| **宿主环境层** | HTML Event Loop / libuv `uv_loop_t` | 定义任务队列结构、决定何时执行脚本、何时进行渲染、何时调用 V8 的 checkpoint [HTML Standard §8.1] |
| **语言规范层** | ECMAScript Job Queues, Promise, Module Record | 定义 Promise 反应任务、async/await 状态转换、模块异步求值的抽象算法 [ECMA-262 §9.5] |

三层之间的数据流如下：

- **规范层 → 引擎层**：ECMA-262 算法（如 `PerformPromiseThen`）将 Job 排入 `v8::MicrotaskQueue`（规范中的 `[[HostDefined]]` 字段由 V8 实现为指向具体队列的指针）。
- **引擎层 → 宿主层**：V8 通过 `v8::TaskRunner::PostTask` 将需要延迟执行的宏任务（如 WebAssembly 的异步编译回调）回传给宿主。
- **宿主层 → 引擎层**：宿主在合适的时机（如 HTML Event Loop 的每个 task 结束后）调用 V8 的 `MicrotaskQueue::PerformCheckpoint`，从而触发规范层的 Job 执行。

---

## 2. V8 引擎层：执行上下文与任务调度

### 2.1 v8::Isolate：执行上下文的物理隔离

`v8::Isolate` 是 V8 暴露给宿主的最核心 C++ 类，代表一个完全独立的 JavaScript 执行实例 [V8 API Docs]。每个 Isolate 拥有：

- **独立的堆（Heap）**：包括新生代（New Space）、老生代（Old Space）、大对象区（Large Object Space）和代码区（Code Space）。不同 Isolate 之间的对象不可直接引用，除非通过显式的 `v8::External` 或 `v8::SharedArrayBuffer`。
- **独立的垃圾回收器（GC）**：V8 的 Stop-the-World 回收以 Isolate 为边界进行。这意味着一个 Isolate 的 GC 停顿不会阻塞另一个 Isolate 的执行——这是 Web Worker / Node.js `worker_threads` 能够实现真正并行的根本原因。
- **独立的编译缓存与内联缓存（IC）**：每个 Isolate 维护自己的反馈向量（feedback vector）和优化编译后的 TurboFan 代码。

在浏览器中，每个 Renderer Process（标签页或 iframe）通常对应一个 Isolate（Site Isolation 后可能对应多个）；在 Node.js 主线程中，主线程 Isolate 通过 `node::Environment` 与 libuv 绑定；在 Worker Threads 中，每个 Worker 由 `Node::WorkerThreadsData` 创建新的 Isolate [V8 Blog, "Design Elements"]。

### 2.2 v8::MicrotaskQueue：微任务的生命周期管理

V8 内部通过 `v8::MicrotaskQueue` 管理 ECMA-262 中定义的 Promise 反应任务和其他微任务（如 `queueMicrotask`）[^1]。关键接口包括：

```cpp
class V8_EXPORT MicrotaskQueue {
 public:
  // 将微任务入队
  void EnqueueMicrotask(v8::Local<v8::Function> microtask);

  // 执行 checkpoint：清空当前队列中的所有微任务
  void PerformCheckpoint(v8::Isolate* isolate);

  // 获取当前是否正在执行微任务（用于防止嵌套过深）
  int GetMicrotasksScopeDepth() const;
};
```

[^1]: V8 源码 `include/v8-microtask-queue.h`

规范层面，ECMA-262 要求宿主在执行完一个 script/job 后执行 microtask checkpoint [ECMA-262 §9.5]。V8 的 `PerformCheckpoint` 正是这一规范要求的实现：它会循环从队列头部取出微任务并调用，直到队列为空。如果在执行过程中又产生了新的微任务（如 `Promise.then` 链），它们也会被同步清空——这解释了为什么微任务具有"高优先级"的表象。

### 2.3 v8::TaskRunner：宏任务的宿主注入

V8 自身并不实现宏任务调度器（如 `setTimeout` 或 I/O 轮询），而是通过 `v8::platform::TaskRunner` 将宏任务的调度委托给宿主 [V8 API Docs, `libplatform`]：

```cpp
class TaskRunner {
 public:
  // 延迟任务（对应 setTimeout）
  virtual void PostDelayedTask(
      std::unique_ptr<Task> task,
      double delay_in_seconds) = 0;

  // 非延迟任务（对应 setImmediate 或 I/O 回调）
  virtual void PostTask(std::unique_ptr<Task> task) = 0;

  // 非阻塞的 Idle 任务（对应 requestIdleCallback）
  virtual void PostIdleTask(std::unique_ptr<IdleTask> task) = 0;
};
```

浏览器通过 Chromium 的 `Blink::Scheduler` 实现 `TaskRunner`；Node.js 则通过 libuv 的 `uv_loop_t` 实现。因此，**"宏任务队列"的形态完全由宿主定义**，V8 只负责在宿主回调时执行 JS 代码。

---

## 3. 宿主环境层：Event Loop 的分野

### 3.1 浏览器的 HTML Event Loop（2024–2025 更新）

#### 3.1.1 从单一队列到 Per-Source Task Queues

HTML Living Standard 在 2024–2025 年间对 Event Loop 的算法进行了关键修订，核心变化是：**不再使用单一的 task queue，而是为不同的 task source 维护独立的 task queue** [HTML Standard §8.1.4.3, "Generic task sources"]。

在旧模型中，Event Loop 被描述为：

> "一个 event loop 有一个或多个 task queues。"

这导致开发者误以为浏览器只有一个统一的"宏任务队列"。新模型更精确地表述为：

> "An event loop has one or more task queues. ... A task queue is a set of tasks. ... Each task is associated with a specific task source." [HTML Standard §8.1.4.2]

关键差异在于：

- **Task source 的语义优先级**：某些 task source（如用户交互的 `user interaction task source`）在调度时可能被浏览器赋予更高的实际优先级，尽管规范本身不要求严格的优先级排序 [HTML Standard §8.1.4.4]。
- **Per-event-loop 而非 per-agent**：每个 browsing context 的 event loop 独立维护自己的 task queues，不同标签页之间不存在共享的宏任务队列。
- **Task 的选择算法**：Event Loop processing model 第 1 步会"从 task queues 中选择一个可运行任务（runnable task）"，具体选择哪个 queue 由用户代理（User Agent）决定，但规范要求不得饿死任何 queue [HTML Standard §8.1.4.2]。

#### 3.1.2 Microtask Checkpoint 的精确触发时机

HTML Standard 对 microtask checkpoint 的触发有严格限制，并非"每次执行完代码就清一次"。规范明确列出以下触发点 [HTML Standard §8.1.4.2]：

1. **每个 task 执行完毕后**（Event loop processing model 步骤 6）。
2. **脚本执行完毕后**（When the user agent is to "execute a script block"，步骤 29）。
3. **JavaScript 执行上下文栈为空时**，如果存在 pending parsing-blocking script 被解除阻塞的情况。
4. **进入或退出 `await` 的 fulfill/reject 处理时**，由 ECMA-262 的 Job 调度机制触发（通过 `EnqueueJob` 的 Host Hook）。

值得注意的是，**渲染（rendering）发生在 microtask checkpoint 之后**。这意味着在一个 task 内产生的所有微任务（包括嵌套产生的）都会在任何重绘之前执行完毕。如果你在微任务中连续修改 DOM，浏览器只会在微任务队列清空后进行一次渲染。

#### 3.1.3 "Perform a microtask checkpoint" 算法步骤

HTML Standard 将 microtask checkpoint 定义为以下精确算法 [HTML Standard §8.1.4.2, "Perform a microtask checkpoint"]：

1. 设置 **performing a microtask checkpoint** 标志为 true。
2. 只要 event loop 的 microtask queue 不为空：
   a. 从 queue 中取出最老的 microtask；
   b. 将该 microtask 的 event loop 设为当前 event loop；
   c. 运行该 microtask；
   d. 如果 event loop 是 window event loop，检查并处理 `ResizeObserver` 的回调（这是一个特殊的微任务类机制）。
3. 清理 IndexedDB 事务的终止逻辑（如果适用）。
4. 执行 `ClearKeptObjects()`（ECMA-262 中用于释放被 `WeakRef.prototype.deref()` 保持存活的对象）。
5. 执行 `PerformMicrotaskCheckpoint()` 的 Host 扩展（如 V8 的内部 GC 提示）。
6. 将 **performing a microtask checkpoint** 标志设回 false。

这个算法解释了为什么以下代码中，`MutationObserver` 和 `Promise.then` 总会在 `setTimeout` 之前执行：因为它们都属于 microtask，在同一个 task 结束后被批量清空，而 `setTimeout` 属于一个新的 task（来自 `timer task source`），必须等待当前 task 及其 microtask checkpoint 完全结束后才能被选中。

```javascript
// 演示：Microtask 优先于下一个 Task
setTimeout(() => console.log('task'), 0);
Promise.resolve().then(() => console.log('microtask'));
// 输出：microtask → task
```

### 3.2 Node.js 的 libuv Event Loop

#### 3.2.1 七个阶段与 nextTick 的特权

Node.js 的 Event Loop 基于 libuv，其核心是 `uv_loop_t` 结构体。libuv 将事件循环划分为七个阶段 [libuv Docs, "The event loop"]：

1. **timers**：执行到期的 `setTimeout` / `setInterval` 回调。
2. **pending callbacks**：执行上一轮 I/O 延迟到本轮的回调（如某些 TCP 错误处理）。
3. **idle / prepare**：内部使用，对开发者透明。
4. **poll**：等待新的 I/O 事件并执行对应的回调；如果 timers 已到期，则跳过等待。
5. **check**：执行 `setImmediate` 回调。
6. **close callbacks**：执行 `socket.on('close', ...)` 等关闭事件的回调。

在这七个阶段之间，Node.js 还插入了一个**不在 ECMA-262 规范中**的机制：`process.nextTick`。它的优先级甚至高于 microtask [Node.js Docs, "The Node.js Event Loop"]：

> "`nextTickQueue` will be processed after the current operation is completed, regardless of the current phase of the event loop."

这意味着在一个 libuv 阶段内，如果 `process.nextTick` 产生了新的 `nextTick` 回调，它们会被同步递归清空（类似于 microtask，但优先级更高）。

#### 3.2.2 浏览器与 Node.js 的本质差异

| 维度 | 浏览器（HTML Event Loop） | Node.js（libuv） |
|------|------------------------|-----------------|
| **任务来源** | 基于 Task Source 的多个 queue（DOM 操作、网络、定时器、用户交互） | 基于 C++ handle 和 watcher queue（文件描述符、定时器、信号） |
| **渲染集成** | 与 Compositor Thread 协作，每 16.6ms（60Hz）可能存在 rendering opportunity | 无渲染概念，不存在 rAF / rIC |
| **微任务触发** | 每个 task 结束后、脚本执行结束后、特定 Host Hook 触发后 | 每个 C++ 回调边界（`MakeCallback`）触发，以及每个 libuv 阶段结束后 |
| **额外机制** | `queueMicrotask`, `MutationObserver` | `process.nextTick`（优先级高于 Promise 微任务） |
| **定时器精度** | `setTimeout(fn, 0)` 最小延迟约 4ms（HTML 规范要求） | `setTimeout(fn, 0)` 在 poll 阶段可能立即执行，受系统调度影响 |

一个常见的面试题可以说明差异：

```javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
```

在浏览器中，`setImmediate` 不存在，只有 `setTimeout` [HTML Standard §8.7]。在 Node.js 中，如果这段代码在主模块中直接运行（即处于 poll 阶段之前），`timeout` 和 `immediate` 的输出顺序**不确定**；但如果代码位于 I/O 回调内部（即已进入 poll 阶段），则 `immediate` 一定在 `timeout` 之后输出 [Node.js Docs]。这种不确定性在浏览器中不存在，因为浏览器只有 timers queue。

---

## 4. 语言规范层：ECMA-262 的 Job 与模块语义

### 4.1 Job Queues 与宿主环境的桥接

ECMA-262 并不定义"Event Loop"或"微任务"，而是使用更抽象的 **Job** 和 **Job Queue** [ECMA-262 §9.5]。

- **Job**：一个抽象的记录，包含 `[[Job]]`（一个无参函数）和 `[[Realm]]`（执行领域）。Promise 的反应任务（reaction jobs）和 `await` 的恢复任务（async function resumption jobs）都是 Job 的具体实例。
- **Job Queue**：一个 FIFO 队列。ECMA-262 定义了 `ScriptJobs` 和 `PromiseJobs` 两个概念性队列，但允许宿主定义更多。
- **HostEnqueueGenericJob / HostEnqueuePromiseJob**：这是 ECMA-262 暴露给宿主的 Host Hook。V8 的实现会将 Promise Job 排入 `v8::MicrotaskQueue`，而浏览器/Node.js 则通过 Event Loop 最终触发 V8 的 checkpoint [ECMA-262 §9.5.2]。

**关键洞察**：规范层只保证 Job 会按照"先进先出"的顺序在同一个 Realm 内执行，但不保证 Job 与宿主 task 的精确时序关系——这完全取决于 Host Hook 的实现。因此，不同浏览器对 microtask 的调度可能存在细微差异（尽管现代浏览器已高度一致）。

### 4.2 Promise 的反应任务（Reaction Jobs）

当一个 Promise 从 `pending` 转变为 `fulfilled` 或 `rejected` 时，ECMA-262 执行 `TriggerPromiseReactions` 抽象操作 [ECMA-262 §27.2.1.7]。该操作的核心逻辑是：

1. 遍历该 Promise 的 `[[PromiseFulfillReactions]]` 或 `[[PromiseRejectReactions]]` 链表。
2. 为每个 reaction 创建一个 **PromiseReaction Job**。
3. 通过 `HostEnqueuePromiseJob` 将该 Job 排入队列。

PromiseReaction Job 的算法步骤如下 [ECMA-262 §27.2.1.8]：

1. 断言：存在一个对应的 handler（`onFulfilled` 或 `onRejected`）。
2. 调用该 handler，传入 Promise 的 resolution value 或 rejection reason。
3. 如果 handler 正常返回，则以返回值为参数调用 `FulfillPromise` 处理下游 Promise；如果抛出异常，则调用 `RejectPromise`。
4. 如果该 reaction 没有 handler（即 `undefined`），则执行"透传"（pass-through）：下游 Promise 直接采用与上游相同的状态和值/reason。

这个机制解释了以下行为：

```javascript
const p = Promise.resolve(1);
p.then(v => { console.log('A:', v); return v * 2; })
 .then(v => console.log('B:', v));

// 输出：A: 1 → B: 2
```

当 `p` fulfill 时，第一个 `then` 的 reaction job 进入 microtask queue 并执行，打印 `A: 1` 且返回 `2`。这个返回值使得第二个 `then` 创建的 Promise 立即 fulfill，其 reaction job 又被**同步**排入同一个 microtask queue，因此 `B: 2` 紧接着输出。

### 4.3 async/await 的状态机转换

#### 4.3.1 async function 的挂起与恢复

一个 async function 在 ECMA-262 中被表示为一个 **AsyncFunction Object** [ECMA-262 §27.7]。其执行过程可以看作是一个状态机，状态包括：

- **Running**：函数体正在同步执行（直到遇到第一个 `await`）。
- **Suspended-Yield**：函数在 `await` 处挂起，等待一个 Promise settle。
- **Fulfilled / Rejected**：函数体执行完毕或抛出异常，对应的 Promise 已 settle。

当 async function 执行到 `await expr` 时：

1. 引擎首先对 `expr` 求值，得到 `value`。
2. 调用 `Await(value)` 抽象操作（详见下节）。
3. `Await` 会创建一个新的内部 Promise，并将其 resolution 绑定到 async function 的恢复逻辑上。
4. async function 的执行上下文从调用栈弹出，函数进入 **Suspended-Yield** 状态 [ECMA-262 §27.7.5.2]。
5. 当内部 Promise fulfill 后，一个 **AsyncFunctionResume** Job 被排入 Job Queue。该 Job 的职责是恢复 async function 的执行，将 `await` 的返回值压入栈，并继续执行后续代码。

#### 4.3.2 `Await` 抽象操作的展开语义

ECMA-262 §27.7.5.3 定义了 `Await(value)` 的精确算法。为了理解其行为，我们需要"展开"这个抽象操作：

```
1. Let asyncContext be the running execution context.
2. Let promise be ? PromiseResolve(%Promise%, value).
3. Let fulfilledClosure be a new Abstract Closure with parameters (result) that captures asyncContext and performs the following steps when called:
   a. Let prevContext be the running execution context.
   b. Suspend prevContext.
   c. Resume asyncContext with NormalCompletion(result).
   d. Assert: If we get here, asyncContext was resumed normally.
   e. Return undefined.
4. Let onFulfilled be CreateBuiltinFunction(fulfilledClosure, 1, "", « »).
5. Let rejectedClosure be a new Abstract Closure ... (类似 fulfilledClosure，但携带 ThrowCompletion).
6. Let onRejected be CreateBuiltinFunction(rejectedClosure, 1, "", « »).
7. Perform PerformPromiseThen(promise, onFulfilled, onRejected).
8. Remove asyncContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
9. Set the code evaluation state of asyncContext such that when the evaluation is resumed with a Completion completion, the following steps of the algorithm that invoked Await will be carried out ...
10. Return a Promise resolved with undefined. (注：实际返回的是对调用方的控制转移)
```

[ECMA-262 §27.7.5.3]

关键细节：

- **`PromiseResolve`**：`Await` 会对传入的 `value` 进行 `PromiseResolve`。如果 `value` 本身不是 Promise，它会被包装为 `Promise.resolve(value)`；如果 `value` 已经是 Promise，则直接返回该 Promise（但不一定是同一个对象，因为 `PromiseResolve` 会调用 `NewPromiseResolveThenableJob` 处理 thenable）。
- **Builtin Function**：`onFulfilled` 和 `onRejected` 是引擎内部创建的闭包，它们不是 JavaScript 层面的函数对象，无法被用户代码拦截。
- **Suspend / Resume**：步骤 8 将 async context 从调用栈移除，这意味着在 `await` 挂起期间，调用栈回退到 async function 的调用者。这解释了为什么 `await` 能够"让出主线程"——它实际上让出了调用栈。

这个语义也解释了一个常见现象：

```javascript
async function foo() {
  console.log(1);
  await 2; // 不是 Promise，但仍会被包装
  console.log(3);
}
foo();
console.log(4);
// 输出：1 → 4 → 3
```

`await 2` 等价于 `await Promise.resolve(2)`。函数挂起后，控制流回到调用者（输出 `4`），然后 `Promise.resolve(2)` 的 fulfill reaction job 进入 microtask queue，在下一个 checkpoint 恢复函数并输出 `3`。

### 4.4 Top-level await 的模块语义

Top-level await（TLA）是 ECMA-2022 引入的模块级特性，但在 ECMA-262 2025 中，其语义与模块图（Module Graph）的异步求值算法已被多次澄清和细化。

#### 4.4.1 模块图中的 AsyncModuleExecutionFulfilled / Rejected

当一个模块包含 Top-level await 时，该模块的求值（Evaluation）不再是一个同步操作，而是异步的。ECMA-262 为模块记录（Module Record）引入了以下字段 [ECMA-262 §16.2.1.5]：

- `[[AsyncEvaluation]]`：布尔值，表示该模块是否处于异步求值状态。
- `[[AsyncParentModules]]`：一个模块列表，记录哪些模块因为依赖此模块而进入了异步等待。
- `[[PendingAsyncDependencies]]`：整数，记录尚未完成的异步依赖数量。

当一个异步模块执行完成时，引擎调用 `AsyncModuleExecutionFulfilled(module)` [ECMA-262 §16.2.1.5.3.2]：

1. 断言：`module.[[Status]]` 为 `evaluating-async`。
2. 将 `module.[[Status]]` 设为 `evaluated`，`module.[[EvaluationError]]` 设为 `empty`。
3. 遍历 `module.[[AsyncParentModules]]`：
   a. 对每个父模块 `m`，将 `m.[[PendingAsyncDependencies]]` 减 1。
   b. 如果减至 0，则调用 `ExecuteAsyncModule(m)` 开始执行该父模块。
4. 如果该模块是入口模块（没有 async parents），则向宿主报告模块求值完成。

对应的 `AsyncModuleExecutionRejected` 算法 [ECMA-262 §16.2.1.5.3.3] 类似，但会将 `module.[[EvaluationError]]` 设为错误，并向所有 `AsyncParentModules` 传播该错误。

#### 4.4.2 求值冻结与并行加载的边界

Top-level await 的"冻结"语义是理解其并发行为的关键：

- **求值冻结（Evaluation Freeze）**：一个模块一旦开始求值（`evaluating` 或 `evaluating-async` 状态），就不能再次求值。如果其求值因 TLA 而挂起，则该模块及其所有 `AsyncParentModules` 的求值完成都被延迟，直到 TLA settle [ECMA-262 §16.2.1.5.3]。
- **不影响并行加载（Loading）**：求值（Evaluation）与加载（Loading / Linking）是两个独立的阶段。一个模块的 TLA 挂起只阻塞其依赖树中向上传播的求值，**不会阻塞其他独立模块的加载或链接**。这意味着浏览器仍然可以并行下载其他不依赖此模块的模块资源 [V8 Blog, "Top-level await"]。

用图论语言描述：

```
A (入口)
├── B (含 TLA: await fetch())
│   └── C
└── D (独立分支)
    └── E
```

在这个模块图中：

- B 的 TLA 挂起会阻塞 A 的求值完成（因为 A 依赖 B）。
- C 的求值也必须在 B 的 TLA 之后（如果 C 是 B 的静态依赖，它实际上已经在 B 执行前被加载和链接，但如果是动态 `import()`，则另当别论）。
- **D 和 E 的加载、链接和求值完全不受影响**，它们可以与 B 的 `fetch()` 并行进行。

这个语义使得 Top-level await 在模块初始化场景中非常强大，但也要求开发者注意：不要在共享模块中放置长时间的 TLA，否则会导致大量依赖该模块的代码被延迟执行。

### 4.5 Node.js 24 的 require(esm) 与模块并发

Node.js 24 起，`--experimental-require-module` 标志默认启用，标志着 CommonJS（CJS）与 ECMAScript Modules（ESM）互操作性进入新阶段 [Node.js 24 Release Notes]。这一变化对模块加载的并发语义产生了直接影响。

#### 同步求值约束

`require()` 是一个**同步调用**。为了保持这一语义不变，Node.js 24 的 `require(esm)` 机制对被加载的 ESM 图施加了严格的**同步求值约束**：被 `require()` 加载的 ESM 模块及其整个静态依赖图中，**不能包含任何 Top-level await（TLA）** [Node.js Docs: require(esm)]。

如果被 `require()` 的 ESM 或其任何依赖链中存在 TLA，Node.js 将立即抛出 `ERR_REQUIRE_ASYNC_MODULE` 错误。这确保了 `require()` 的调用者无需等待 Promise，可以像传统 CJS 模块一样同步获得导出的命名空间对象。

#### 求值冻结与模块缓存语义

`require(esm)` 不仅继承了 `require()` 的同步调用语义，还完整继承了 ESM 模块图的**求值冻结（Evaluation Freeze）**特性 [ECMA-262 §16.2.1.5.3]。当一个 ESM 模块首次被 `require()` 加载并求值后，其模块记录的状态会从 `evaluating` 转变为 `evaluated`，并在模块缓存（Module Map）中永久固化。后续无论通过 `require()` 还是 `import()` 再次访问同一模块，Node.js 都会直接返回已求值的模块命名空间对象，而不会重新执行模块体。

这一语义对并发编程具有双重意义：

1. **无副作用的重复导入**：在复杂的混用项目中，CJS 与 ESM 模块可能形成多对多依赖图。求值冻结确保了即使多个 CJS 模块同时 `require()` 同一个 ESM 依赖，该依赖也只会被执行一次，避免了传统动态链接库中常见的重复初始化问题。
2. **与 Top-level await 的互斥边界**：由于求值冻结要求模块在首次求值时就必须完成所有同步和异步初始化，Node.js 24 通过 `ERR_REQUIRE_ASYNC_MODULE` 强制拒绝了任何含 TLA 的 ESM 被 `require()`。这本质上是将"异步初始化"隔离在 `import()` 的 Promise 边界内，防止异步状态泄漏到 CJS 的同步执行上下文中。

#### 与 `import()` 的本质差异

这与 `import()` 的动态导入形成了鲜明对比：

| 维度 | `require(esm)` | `import()` |
|------|---------------|------------|
| **求值方式** | 同步求值，立即执行模块体 | 异步求值，返回 Promise |
| **TLA 支持** | **不支持**。依赖链中若存在 TLA，则抛出 `ERR_REQUIRE_ASYNC_MODULE` | **支持**。可以加载含 TLA 的 ESM，待 TLA settle 后 resolve |
| **返回值** | 模块命名空间对象（同步返回） | Promise（异步 resolve 为模块命名空间对象） |
| **加载时机** | 运行时按需同步加载 | 运行时按需异步加载 |

这种差异本质上反映了两种模块系统的根本张力：CJS 假设模块求值是同步、原子的；而 ESM 允许模块在求值过程中让出主线程（通过 TLA），从而实现 I/O 密集型初始化（如读取配置文件或建立数据库连接）。

#### 对并发与启动性能的影响

从并发模型角度看，`require(esm)` 的引入有以下工程意义：

1. **启动路径的同步性得以保留**：CJS 入口文件可以无缝地 `require()` ESM 依赖，而无需将自身重构为异步模块或包裹在 `async` IIFE 中。这对于大量现有 CJS 工具链和测试框架的平滑迁移至关重要。
2. **模块求值仍按图顺序单线程执行**：无论是 `require(esm)` 还是 `import()`，模块的实际求值（Evaluation）仍然严格遵循 ECMA-262 的模块图算法，**在单个 Agent（即单线程）内按深度优先或拓扑顺序依次执行**。`require(esm)` 并不会引入并行求值；它仅仅是在 CJS 的同步边界内允许加载 ESM。
3. **TLA 的"传染"效应被显式阻断**：在纯 ESM 项目中，一个深层依赖引入 TLA 会通过 `AsyncParentModules` 向上传播异步性。`require(esm)` 通过强制抛出错误，将这种异步性阻隔在 CJS 同步入口之外，防止了无意识的"异步泄漏"。

---

## 5. SharedArrayBuffer、Agent Cluster 与 Atomics

### 5.1 Agent Cluster 与共享内存边界

ECMA-262 使用 **Agent** 和 **Agent Cluster** 来定义 JavaScript 的并发边界 [ECMA-262 §9.7]。

- **Agent**：一个逻辑执行线程，包含一个执行上下文栈、一个正在运行的执行上下文、一个 Agent Record 以及一组可访问的代码领域（Realms）。在浏览器中，一个 window 或一个 Worker 通常对应一个 Agent；在 Node.js 中，主线程或一个 Worker Thread 对应一个 Agent。
- **Agent Cluster**：一组可以通过 `SharedArrayBuffer` 共享内存的 Agent。它们必须满足：
  - 属于同一个**凭证源（agent cluster key）**，通常是 `origin` 的三元组 `(scheme, host, port)`。
  - 能够通过某种实现机制（如共享的进程地址空间）直接访问相同的物理内存。

**共享内存的边界**由 Agent Cluster 严格划定：

> "If two agents are in the same agent cluster, they can share memory. If they are not, they cannot." [ECMA-262 §9.7.2]

浏览器的安全模型通过以下机制控制 Agent Cluster 的边界：

1. **COOP / COEP**：`Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy` 头决定哪些跨源文档可以加入同一个 Agent Cluster。如果没有正确的头设置，`SharedArrayBuffer` 和 `Atomics` 将无法使用 [HTML Standard §7.1.1.1]。
2. **Site Isolation**：现代浏览器（如 Chrome）可能将不同 site 的文档放入不同的进程，这会物理上阻止它们共享内存，即使它们的 origin 相同 [Chromium Docs]。

在 Node.js 中，Agent Cluster 的边界更宽松：所有在同一个进程内通过 `worker_threads` 创建的 Worker 默认属于同一个 Agent Cluster，因此可以自由共享 `SharedArrayBuffer`。

### 5.2 `Atomics.pause`（ES2025 新增）的语义与工程意义

ES2025（ECMA-262 第 16 版）在 `Atomics` 对象上新增了一个静态方法：`Atomics.pause([hint])` [ECMA-262 §25.4.8]。

#### 规范语义

> "Atomics.pause([ hint ])"
>
> 1. If hint is not present, let hint be 0.
> 2. Perform implementation-defined steps to reduce CPU usage, power consumption, or contention for shared memory.
> 3. Return undefined.

[ECMA-262 §25.4.8]

`Atomics.pause` 是一个**自旋锁提示（spinlock hint）**。它不执行任何内存操作，也不会阻塞线程，而是向底层 CPU 发出一个建议：当前线程正在自旋等待某个条件，可以暂时降低执行频率或进入低功耗状态，以减少内存总线竞争和能量消耗。

#### 与 `Atomics.wait` 的本质区别

| 特性 | `Atomics.wait` | `Atomics.pause` |
|------|---------------|-----------------|
| **阻塞性** | 是，线程会进入阻塞状态，直到被 `notify` 或超时 | 否，线程继续执行，只是建议 CPU 降速 |
| **使用场景** | 需要精确线程同步的临界区（如 Mutex、Condition Variable） | 自旋锁（spinlock）的循环体中 |
| **开销** | 高，涉及系统调用和上下文切换 | 极低，通常只是一个 CPU 指令（如 x86 的 `PAUSE`） |
| **唤醒机制** | 必须通过 `Atomics.notify` 唤醒 | 无唤醒机制，循环继续检查条件 |

#### 工程应用：带退避的自旋锁

在 ES2025 之前，使用 `SharedArrayBuffer` 实现自旋锁时，开发者通常需要写如下代码：

```javascript
// 旧式自旋锁（高功耗、高总线竞争）
while (Atomics.load(lock, 0) !== 0) {
  // 忙等，疯狂占用总线带宽
}
```

引入 `Atomics.pause` 后，推荐的写法是：

```javascript
// ES2025 推荐的自旋锁
while (Atomics.load(lock, 0) !== 0) {
  Atomics.pause();
}
```

在 x86 架构上，`Atomics.pause()` 会被编译为 `PAUSE` 指令，该指令的核心作用是：

- 避免在超线程（Hyper-Threading）环境中因自旋导致的核心资源争抢；
- 减少内存序乱序执行（memory order violation）带来的流水线刷新开销；
- 允许 CPU 在进入下一次总线请求前进入低功耗状态。

对于更复杂的场景，可以结合 `hint` 参数实现指数退避（exponential back-off）策略：

```javascript
let spins = 0;
while (Atomics.load(lock, 0) !== 0) {
  const hint = Math.min(spins, 255); // hint 通常被截断到 255
  Atomics.pause(hint);
  spins++;
}
```

[ECMA-262 §25.4.8] 指出 `hint` 的具体解释是 implementation-defined，因此不同引擎或 CPU 可能对同一个 `hint` 值产生不同的延迟效果。但在工程实践中，它提供了一种标准化的、跨平台的自旋锁优化手段。

---

## 6. 总结

JavaScript 的并发模型是一个跨越三层边界的复杂系统：

1. **V8 引擎层**通过 `v8::Isolate` 提供物理隔离的执行环境，通过 `v8::MicrotaskQueue` 和 `v8::TaskRunner` 分别管理微任务和宿主宏任务的注入。
2. **宿主环境层**中，浏览器的 HTML Event Loop 在 2024–2025 年已从单一 task queue 演进为 per-source task queues 模型，microtask checkpoint 的触发被严格限定在 task 结束、脚本执行结束等特定时机；Node.js 的 libuv Event Loop 则基于七个阶段和 `process.nextTick` 构建了一套完全不同的调度语义。
3. **语言规范层**中，ECMA-262 使用 Job Queues 和抽象操作（如 `Await`、`AsyncModuleExecutionFulfilled`）精确定义了 Promise、async/await 和 Top-level await 的行为。Top-level await 会冻结其模块依赖链的求值，但不影响独立模块的并行加载。
4. **共享内存与原子操作**由 Agent Cluster 划定边界，ES2025 新增的 `Atomics.pause` 为高性能自旋锁提供了跨平台的标准化优化手段。

对于研究者与高级开发者而言，理解这三层边界的交互方式，是准确预测代码执行时序、调试复杂并发 Bug 和设计高性能并发架构的基石。

---

## 7. Async Context（Stage 2）前瞻分析

`Async Context` 是 TC39 当前处于 Stage 2 的提案，旨在从语言层面解决 JavaScript 异步代码中长期存在的**上下文传播丢失**问题 [TC39 Proposals: async-context]。它的出现标志着 JavaScript 并发模型在"隐式状态管理"维度上的重要演进。

### 核心问题：异步边界上的上下文断裂

在当前的 JavaScript 执行模型中，调用栈（Call Stack）是上下文信息（如请求 ID、用户身份、分布式追踪的 span、区域设置 locale）最自然的载体。然而，一旦代码进入异步领域，这种连续性就会被打破：

- 在 `Promise.then` 链中，回调函数的执行上下文与创建该 Promise 的上下文之间没有隐式关联。
- 在 `async/await` 函数中，每次 `await` 都会挂起当前执行上下文，恢复时调用栈已经发生了切换。
- 在 `EventEmitter` 或 `stream` 的事件回调中，事件处理函数的执行上下文与事件订阅时的上下文完全隔离。

这导致开发者不得不通过**显式参数传递**（如在每个函数签名中增加 `ctx` 参数）或**全局变量**来维系上下文，前者造成严重的代码侵入（俗称为"context drilling"），后者在并发处理多个请求时极易产生串扰。

### Async Context 的语义

`Async Context` 提案引入了一种**在异步操作之间隐式传播上下文**的机制。其核心抽象是 `AsyncContext.Variable`：

```javascript
const requestId = new AsyncContext.Variable();

function handleRequest(req) {
  requestId.run(req.id, async () => {
    await db.query('...');
    // 即使在 await 恢复后，仍然可以访问到原始的 requestId
    console.log(requestId.get()); // => req.id
  });
}
```

与 Zone.js 的 monkey-patching 方案不同，`Async Context` 的语义被直接嵌入 ECMA-262 的 Job 调度算法中 [TC39 Proposals: async-context]：

- 当一个 Promise reaction job 或 async function resumption job 被创建时，引擎会**自动捕获**当前 `AsyncContext` 的快照。
- 当该 job 稍后被执行时，引擎会**恢复**这个快照，使得 job 的执行环境看起来像是"从创建点无缝延续"的。

这种隐式传播覆盖了 Promise、async/await、`queueMicrotask`、`setTimeout`、事件监听器等几乎所有标准的异步边界。

### 与现有解决方案的对比

| 方案 | 实现层级 | 侵入性 | 跨运行时 | 主要局限 |
|------|---------|--------|----------|----------|
| **Zone.js** | 用户空间库 | 高。通过 monkey-patch 原生 API（Promise、EventTarget、`setTimeout` 等） | 浏览器为主 | 补丁范围难以穷尽，容易与新 API 或库不兼容；增加运行时开销 |
| **Node.js AsyncLocalStorage** | Node.js 运行时 API | 中。仅对 Node.js 内部异步资源进行包装 | **仅限 Node.js** | 不适用于浏览器、边缘运行时（Edge Runtime）或其他 JS 宿主 |
| **Async Context** | **语言规范层** | **低。内置语义，无需补丁** | **跨运行时通用** | 仍在 Stage 2，API 细节可能调整；无法传播到某些非标准异步边界（如 Web Worker `postMessage`） |

Zone.js 是 Angular 生态中广泛使用的补丁方案，它的核心思想是拦截所有异步 API 的入口和出口，在任务切换时手动保存/恢复上下文。这种方法虽然有效，但本质上是对引擎和宿主的一种"逆向工程"，每当平台新增 API（如 `navigator.scheduling.isInputPending()`）时，Zone.js 都需要跟进补丁 [TC39 Proposals: async-context]。

Node.js 的 `AsyncLocalStorage`（ALS）提供了更为优雅的运行时支持，但它是一个 **Node.js 特有的 API**。对于需要在浏览器、Node.js 服务端渲染（SSR）和边缘计算（如 Cloudflare Workers、Vercel Edge Functions）之间共享代码的现代全栈框架而言，ALS 的不可移植性是一个重大障碍。

`Async Context` 作为 TC39 的语言级提案，其价值在于提供了**统一的、无侵入的、跨运行时的标准**。一旦进入 Stage 4 并被各引擎实现，它将成为所有 JavaScript 宿主环境的基础能力。

### 工程意义

`Async Context` 的实现将为多个高阶工程能力奠定基石：

1. **OpenTelemetry 分布式追踪**：目前 JS 中的自动链路追踪（automatic instrumentation）严重依赖对 HTTP 客户端、数据库驱动等库的 monkey-patch。有了 `Async Context`，trace context 可以在异步 I/O 边界自然流动，实现真正的**无侵入式可观测性**。
2. **AOP 与日志关联**：在服务端，将一个请求的所有日志自动关联到同一个 `requestId`，无需修改业务代码中的每一个 `console.log` 或日志工具调用。
3. **React Server Components 与并发渲染**：React 的异步服务器渲染和 Suspense 边界需要精确跟踪组件树的异步上下文。`Async Context` 有望取代或简化当前复杂的 context propagation 实现。
4. **边缘运行时的安全与隔离**：在边缘计算环境中，多个请求可能共享同一个 Isolate 或 Agent。`Async Context` 提供了一种轻量级的请求级隔离手段，防止上下文串扰。

尽管 `Async Context` 仍处于 Stage 2，但其语义设计已经相对成熟，且得到了 V8、SpiderMonkey 等引擎实现者的积极反馈。对于需要设计长期并发架构的开发者而言，提前理解这一提案的语义，是把握 JavaScript 执行模型演进方向的关键。

---

## 参考文献与来源索引

- [HTML Standard §8.1] HTML Living Standard, "Web application APIs — Event loops". <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops>
- [HTML Standard §8.1.4.2] "Event loops — Microtask queuing". <https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queuing>
- [HTML Standard §8.1.4.3] "Generic task sources". <https://html.spec.whatwg.org/multipage/webappapis.html#generic-task-sources>
- [HTML Standard §8.1.4.4] "Per-... task sources" (2024–2025 update).
- [ECMA-262 §9.5] ECMAScript® 2025 Language Specification, "Jobs and Job Queues". <https://tc39.es/ecma262/2025/#sec-jobs-and-job-queues>
- [ECMA-262 §9.7] "Agents and Agent Clusters". <https://tc39.es/ecma262/2025/#sec-agents>
- [ECMA-262 §16.2.1.5] "Module Semantics". <https://tc39.es/ecma262/2025/#sec-module-semantics>
- [ECMA-262 §16.2.1.5.3.2] "AsyncModuleExecutionFulfilled". <https://tc39.es/ecma262/2025/#sec-async-module-execution-fulfilled>
- [ECMA-262 §25.4] "Atomics Object". <https://tc39.es/ecma262/2025/#sec-atomics-object>
- [ECMA-262 §25.4.8] "Atomics.pause". <https://tc39.es/ecma262/2025/#sec-atomics.pause>
- [ECMA-262 §27.2] "Promise Objects". <https://tc39.es/ecma262/2025/#sec-promise-objects>
- [ECMA-262 §27.7] "Async Function Objects". <https://tc39.es/ecma262/2025/#sec-async-function-objects>
- [ECMA-262 §27.7.5.3] "Await". <https://tc39.es/ecma262/2025/#await>
- [V8 API Docs] V8 API Reference, `v8::Isolate`, `v8::MicrotaskQueue`, `v8::TaskRunner`. <https://v8.github.io/api/head/>
- [V8 Blog, "Top-level await"] V8 Blog, "Top-level await". <https://v8.dev/features/top-level-await>
- [V8 Blog, "Design Elements"] V8 Blog, "Design Elements". <https://v8.dev/docs/design-elements>
- [libuv Docs] libuv Documentation, "The event loop". <https://docs.libuv.org/en/v1.x/design.html>
- [Node.js Docs] Node.js Documentation, "The Node.js Event Loop". <https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/>
- [Chromium Docs] Chromium Documentation, "Site Isolation". <https://www.chromium.org/Home/chromium-security/site-isolation/>
- [TC39 Proposals: async-context] TC39, "Async Context". <https://github.com/tc39/proposal-async-context>
- [ECMA-262 §16.2.1.5.3] ECMAScript® 2025 Language Specification, "ModuleEvaluation". <https://tc39.es/ecma262/2025/#sec-moduleevaluation>
- [Node.js 24 Release Notes] Node.js v24.0.0 Release Notes. <https://nodejs.org/en/blog/release/v24.0.0>
- [Node.js Docs: require(esm)] Node.js Documentation, "Modules: require(esm)". <https://nodejs.org/api/modules.html#requiring-ecmascript-modules>
