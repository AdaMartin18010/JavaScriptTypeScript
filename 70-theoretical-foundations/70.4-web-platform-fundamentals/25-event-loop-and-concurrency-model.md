---
title: 'JavaScript 事件循环与并发模型'
description: 'JavaScript Event Loop and Concurrency Model: Task Queues, Microtasks, V8 Internals, Atomics, Scheduling APIs'
english-abstract: >
  A comprehensive deep-dive into the JavaScript event loop and concurrency model, covering the WHATWG HTML Standard specification, task and microtask queues, rendering steps, task sources, V8 internals, Node.js libuv differences, starvation and INP metrics, Atomics/SharedArrayBuffer memory model, Web Locks API, scheduler.yield(), scheduler.postTask(), and modern scheduling APIs. Includes categorical semantics, symmetric diffs, decision matrices, counter-examples, and six production-grade TypeScript simulators.
last-updated: 2026-05-05
status: complete
priority: P0
---

# JavaScript Event Loop and Concurrency Model

## 1. Introduction and Foundational Concepts

The JavaScript concurrency model is, at its core, a cooperative single-threaded event loop with selective multi-threading extensions. Unlike preemptive threading models found in Java, C++, or Go, JavaScript delegates concurrency to an external scheduler—the event loop—that mediates between the execution of JavaScript code, the rendering pipeline, and external I/O. This architecture was not an accident of history but a deliberate design choice rooted in the browser's need to coordinate script execution with DOM mutation, user input, and network activity without exposing developers to data races on the primary document tree.

The modern specification for this mechanism lives in the WHATWG HTML Standard, specifically in the "Event loops" section. However, the event loop is not merely a single queue of callbacks. It is a hierarchy of task queues, a microtask checkpoint system, a rendering opportunity loop, and—on the Node.js side—a libuv-powered asynchronous I/O polling mechanism. Understanding JavaScript concurrency requires traversing at least four layers of abstraction: the specification layer (WHATWG and ECMAScript), the runtime layer (V8, SpiderMonkey, JavaScriptCore), the platform layer (Browser or Node.js), and the hardware layer (CPU cores, memory ordering, and atomic operations).

This document provides a systematic decomposition of each layer. We begin with the WHATWG specification, move through task sources and microtask semantics, compare browser and Node.js implementations, investigate V8 internals, analyze starvation and priority inversion phenomena, explore shared-memory concurrency via Atomics and SharedArrayBuffer, and conclude with modern scheduling APIs such as `scheduler.yield()`, `scheduler.postTask()`, and `isInputPending()`.

To ground these concepts, we introduce categorical semantics as a unifying language. Tasks, microtasks, and rendering steps form a category where morphisms are scheduling dependencies. The event loop is a functor from this category to the category of execution traces. This perspective is not merely academic: it reveals why certain scheduling anomalies—such as microtask starvation or rendering jank—are structural rather than incidental.

### 1.1 The Single-Threaded Illusion

JavaScript's primary execution context—often called the "main thread" in browsers or the "main event loop" in Node.js—executes code in run-to-completion fashion. No two JavaScript functions ever run concurrently within the same realm. This property simplifies reasoning about state: if function `A` mutates a variable and function `B` reads it, we can determine the order of operations by inspection, provided both functions run on the same thread.

However, this illusion breaks down at the boundaries. Web Workers run JavaScript on separate threads with isolated heaps. SharedArrayBuffer allows two threads to share a single block of linear memory. Atomics provide sequential consistency guarantees for operations on that shared memory. Thus, JavaScript is not inherently single-threaded; it is single-threaded by default in the main execution context, with opt-in shared-memory concurrency.

### 1.2 Why the Event Loop Matters

The event loop is the bridge between synchronous run-to-completion semantics and asynchronous programming. Every asynchronous API—whether `setTimeout`, `fetch`, `addEventListener`, or `Promise.resolve`—ultimately delegates to the event loop to schedule continuation code. The order in which continuations execute, the priority they receive relative to rendering and user input, and the guarantees provided about their relative ordering, constitute the observable semantics of JavaScript concurrency.

Performance metrics such as Total Blocking Time (TBT), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) are direct consequences of event loop scheduling decisions. A long task on the main thread delays all subsequent tasks, microtasks, and rendering steps. Understanding the event loop is therefore not an esoteric concern but a practical requirement for building responsive applications.

### 1.3 Historical Evolution of the Event Loop

The event loop was not formally specified in early JavaScript. In the Netscape era, there was only `setTimeout` and event handlers, with implementation-defined ordering. The rise of AJAX in 2005 exposed the need for predictable asynchronous semantics, as developers began chaining `XMLHttpRequest` callbacks. The introduction of Promises in ECMAScript 2015 (ES6) formalized the concept of a "Job"—a unit of work queued on an abstract "Job Queue." The HTML Standard then mapped these ECMAScript Jobs to its microtask checkpoint mechanism.

Node.js, introduced in 2009, inherited its event loop from libuv, which was designed for server-side I/O multiplexing rather than UI coordination. This divergence created the browser/Node.js schism that persists today. The `process.nextTick` API was added early in Node.js history as a way to schedule callbacks before I/O events, predating Promises and creating a third priority tier (nextTick > Promise microtask > macrotask) unique to Node.js.

The addition of Web Workers (2009-2012) introduced true parallelism but required message-passing rather than shared memory. `SharedArrayBuffer` and `Atomics` (ES2017) finally brought shared-memory concurrency to JavaScript, though the Spectre vulnerability led to temporary deprecation and subsequent resurrection under cross-origin isolation requirements.

Modern proposals such as `scheduler.yield()` and `scheduler.postTask()` represent an explicit recognition that the legacy event loop is insufficient for complex applications. They provide developers with direct control over scheduling priorities, reducing the need to hack around the event loop with `setTimeout` or `MessageChannel`.

## 2. The WHATWG Event Loop Specification

The WHATWG HTML Standard defines the event loop in precise algorithmic terms. An event loop is a processing model that coordinates the execution of tasks, microtasks, and rendering updates. The standard explicitly states that there is not a single global event loop but rather multiple event loops, each associated with a specific agent (such as a window, a worker, or a worklet).

### 2.1 Formal Definition

Per the HTML Standard, an event loop has one or more task queues. A task queue is a set of tasks. Each task is associated with a document, a script evaluation environment setting object, and a series of steps to execute. The event loop continuously performs the following steps:

1. Let `oldestTask` be the oldest task on one of the event loop's task queues, if any, ignoring tasks whose associated documents are not fully active. The user agent may pick any task queue.
2. If `oldestTask` is not null, then:
   a. Set the event loop's currently running task to `oldestTask`.
   b. Perform `oldestTask`'s steps.
   c. Set the event loop's currently running task back to null.
3. Perform a microtask checkpoint.
4. Update the rendering.

This algorithm appears simple but contains deep subtleties. Step 1 allows user agents to prioritize among task queues. Step 3 flushes all microtasks before any rendering can occur. Step 4 is itself a complex sub-procedure involving style recalculation, layout, paint, and composite operations.

The "fully active" check in step 1 is particularly important. A document that is not fully active—for example, a document in a background tab or a detached iframe—does not have its tasks processed. This prevents background pages from consuming event loop time at the expense of the foreground page. However, it also means that timers and network callbacks in background documents may be delayed or coalesced.

### 2.2 Task Queues and Task Sources

Tasks are not dumped into a single FIFO queue. Instead, the standard defines multiple task sources, and each task source typically has its own task queue. The standard explicitly mentions the following task sources:

- **DOM manipulation task source**: Tasks queued by the DOM standard, such as inserting or removing elements.
- **User interaction task source**: Tasks queued in response to user actions such as mouse clicks, key presses, and touch events.
- **Networking task source**: Tasks queued in response to network activity, such as the completion of an HTTP request via `fetch` or `XMLHttpRequest`.
- **History traversal task source**: Tasks queued in response to `history.back()`, `history.forward()`, or `history.go()`.
- **Timer task source**: Tasks queued by `setTimeout` and `setInterval`.
- **Idle callback task source**: Tasks queued by `requestIdleCallback`.
- **Port message task source**: Tasks queued by `MessagePort.postMessage`.

The user agent is permitted to select which task queue to process at each iteration of the event loop. This means that a timer task and a user interaction task may be interleaved in implementation-dependent ways, provided that tasks from the same source are processed in order relative to each other.

### 2.3 The Microtask Checkpoint

A microtask checkpoint is a procedure that executes all microtasks until the microtask queue is empty. The standard defines the following microtask sources:

- **Promise callbacks**: The `then`, `catch`, `finally`, and `async function` continuations.
- **`queueMicrotask`**: The explicit API for enqueueing a microtask.
- **MutationObserver callbacks**: Legacy microtask source for DOM mutation observations.
- **Object.observe callbacks**: Deprecated but historically significant.

The critical property of the microtask checkpoint is that it runs to completion before the event loop proceeds to rendering or the next task. If a microtask enqueues another microtask, that new microtask is also executed during the same checkpoint. This creates a "microtask drain" that can starve the event loop of rendering updates and user input processing.

Formally, if we model the microtask queue as a list `M`, the checkpoint algorithm is:

```
while M is not empty:
  remove the oldest microtask from M
  execute that microtask
```

This is a fixed-point computation: the loop terminates only when `M` reaches a fixed point (emptiness). Because microtasks can enqueue more microtasks, the checkpoint is not guaranteed to terminate in bounded time.

### 2.4 Update the Rendering

The rendering step is where the browser updates the visual presentation of the document. It is not guaranteed to run on every event loop iteration. The user agent may throttle rendering to match the display refresh rate (typically 60Hz, 120Hz, or 240Hz). When rendering does occur, it typically involves:

1. **Resize**: Process pending resize events.
2. **Scroll**: Process pending scroll events.
3. **Media queries**: Evaluate media queries and dispatch change events.
4. **CSS animations**: Update CSS animations and transitions.
5. **Full-screen**: Process full-screen transitions.
6. **Animation frame callbacks**: Execute `requestAnimationFrame` callbacks.
7. **Style**: Recalculate styles.
8. **Layout**: Compute layout ("reflow").
9. **Paint**: Paint the document.
10. **Composite**: Composite layers and submit to the GPU.

The `requestAnimationFrame` API schedules a callback to run just before the paint step. This is the only JavaScript-scheduled callback that runs during the rendering phase; all other callbacks run as tasks or microtasks.

### 2.5 Categorical Semantics of the Event Loop

We can model the event loop as a category **Task** where:

- **Objects** are execution states: `Idle`, `RunningTask(t)`, `RunningMicrotask(m)`, `Rendering`.
- **Morphisms** are transitions between states, labeled by the operation that causes them.
- **Composition** is sequential execution.

The event loop functor `E: Task → Trace` maps each task execution to a trace in the category of program traces **Trace**, where objects are program states and morphisms are state transitions caused by statement execution.

Under this model, the microtask checkpoint is a transitive closure operation. If `μ: M → M'` is the operation of executing the oldest microtask and enqueueing any resulting microtasks, then the checkpoint is the least fixed point of `μ*` such that `μ*(M) = ∅`.

The rendering step introduces a synchronization barrier. No rendering morphism can be composed with a task or microtask morphism; rendering is atomic relative to JavaScript execution. This is why `getBoundingClientRect()` during a task sees the results of the last rendering step, not the current DOM state if layout is dirty.

### 2.6 Per-Agent Event Loops and Agent Clusters

The HTML Standard specifies that each agent has its own event loop. An agent is a set of JavaScript execution contexts that share an execution thread. The standard defines three types of agents:

1. **Similar-origin window agents**: All windows (tabs, iframes) that are same-origin and same-site share an event loop. Cross-origin iframes have separate event loops.
2. **Dedicated worker agents**: Each `Worker` or `SharedWorker` has its own event loop.
3. **Worklet agents**: Service worklets, audio worklets, and paint worklets each have specialized event loops.

An **agent cluster** is a group of agents that can share memory via `SharedArrayBuffer`. Agents in the same cluster may run on different threads but can synchronize via `Atomics`. Agents in different clusters are fully isolated.

This architecture has important implications for event loop behavior. A `window.postMessage` call to a same-origin iframe posts a task on the target window's event loop, which may be the same event loop as the sender (if same agent) or a different one (if cross-origin). Similarly, `MessagePort` communication between a window and a worker posts tasks across event loop boundaries.

The event loop per-agent design ensures that synchronous JavaScript execution never spans multiple agents. Even with `SharedArrayBuffer`, one agent cannot execute JavaScript code in another agent's context. The only cross-agent communication mechanisms are the asynchronous task-posting APIs (`postMessage`, `Atomics.notify`). This architectural boundary is fundamental: it means that data races can only occur on `SharedArrayBuffer` memory, never on ordinary JavaScript objects, because ordinary objects are confined to a single agent's heap and event loop.

## 3. Task Sources in Depth

Understanding task sources is essential for predicting execution order and diagnosing performance issues. Each task source has distinct characteristics regarding priority, throttling, and interaction with the rendering pipeline.

### 3.1 DOM Manipulation Task Source

The DOM manipulation task source is used for tasks that must run asynchronously but are triggered by DOM operations. For example, when an `<img>` element's `src` attribute is set, the image loading process begins, and the `load` or `error` event is queued on the DOM manipulation task source. Similarly, `form.submit()` may queue tasks for form validation or navigation.

These tasks are generally processed at normal priority. However, user agents may prioritize them lower than user interaction tasks to ensure responsiveness.

### 3.2 User Interaction Task Source

User interaction tasks are among the highest-priority tasks. They include:

- `click`, `mousedown`, `mouseup`, `mousemove`
- `keydown`, `keyup`, `keypress`
- `touchstart`, `touchmove`, `touchend`
- `focus`, `blur`
- `input`, `change`, `submit`

Browsers typically process user interaction tasks ahead of timer tasks and network tasks. This prioritization is not mandated by the standard but is observable in practice. A user interaction task may enqueue microtasks (e.g., via `Promise.resolve()` in an event handler), and those microtasks are processed immediately after the interaction task but before any rendering.

### 3.3 Networking Task Source

Network tasks include the resolution of `fetch` promises, `XMLHttpRequest` callbacks, and WebSocket message events. These tasks are typically lower priority than user interaction tasks. The standard does not mandate a specific priority, but browsers generally process them in FIFO order within their queue.

A subtle point: the networking task source is where the JavaScript-visible completion of an I/O operation occurs. The actual I/O happens on a separate thread or process (the "network thread" or "IO thread"). When the response is ready, a task is posted to the event loop to deliver the result to JavaScript.

### 3.4 Timer Task Source

The timer task source handles `setTimeout`, `setInterval`, and `setImmediate` (in environments that support it). The HTML Standard specifies that `setTimeout` with delay `d` must not fire before `d` milliseconds have elapsed. However, it may fire later if the event loop is busy processing other tasks.

This "minimum delay" semantics is critical. `setTimeout(fn, 0)` does not mean "run immediately"; it means "run as soon as possible after the current task and microtasks complete." In modern browsers, nested `setTimeout` calls (where depth exceeds 5) are clamped to a minimum of 4ms to prevent timer-based denial-of-service attacks on the event loop.

`setImmediate` is non-standard but supported in Node.js and some browsers via polyfills. It queues a task on the "immediate" queue, which is processed before timer tasks in Node.js's event loop.

### 3.5 History Traversal Task Source

History traversal tasks handle `popstate` and `hashchange` events, as well as the asynchronous completion of `history.back()`, `history.forward()`, and `history.go()`. These tasks are typically processed at normal priority but may be deferred if the document is not fully active.

### 3.6 Port Message Task Source

The port message task source handles `MessagePort` and `BroadcastChannel` messages. When `postMessage` is called, a task is queued on the target port's event loop. This task source is important for cross-context communication: a message posted from a Web Worker to the main thread becomes a task on the main thread's event loop.

### 3.7 Task Queue Selection and Prioritization Algorithms

While the HTML Standard specifies that user agents may select any task queue for processing, real browsers implement sophisticated prioritization. Chromium, for example, uses a multi-queue system with priority classes:

- **High priority**: User input, composition events, touch events
- **Normal priority**: JavaScript execution, DOM timers, most network responses
- **Best effort**: Background fetch, passive event listeners, some media events

WebKit (Safari) uses a simpler model but gives user interaction tasks implicit priority through input device monitoring. Gecko (Firefox) uses a cooperative scheduling model with explicit priority levels on runnable objects.

The standard explicitly allows task queue selection to be implementation-defined in order to permit continued innovation in browser scheduling algorithms. However, this creates non-interoperability: a page may perform differently in Chrome than in Safari due to different queue selection heuristics. For example, a timer task and a network task scheduled at the same time may execute in either order, and both orders are spec-compliant.

Developers should not rely on cross-browser task ordering except within the same task source. If ordering matters, use explicit synchronization via Promises or `postMessage`.

## 4. Microtasks vs. Macrotasks

The distinction between microtasks and macrotasks (often called "tasks" in the WHATWG standard) is one of the most important concepts in JavaScript concurrency. Microtasks have a higher effective priority than macrotasks because the microtask queue is drained completely before the event loop proceeds to the next macrotask or rendering step.

### 4.1 Macrotasks: The Task Queues

Macrotasks are the units of work processed in step 1 of the event loop algorithm. Each event loop iteration processes exactly one macrotask (from any task queue) before moving to microtasks and rendering. Common macrotask sources include:

- `setTimeout` / `setInterval`
- `setImmediate` (Node.js)
- `MessageChannel` / `postMessage`
- `requestAnimationFrame` (debatably; it runs during rendering)
- I/O callbacks (`fs.readFile`, network responses)
- UI rendering events

Because only one macrotask runs per loop iteration, a long-running macrotask blocks all other macrotasks, all microtasks, and rendering for its entire duration. This is the primary mechanism by which JavaScript achieves its cooperative multitasking model: each macrotask is implicitly trusted to complete promptly, and the runtime provides no preemption mechanism to interrupt a running task. Consequently, developers must be diligent about keeping macrotasks short or explicitly yielding control.

### 4.2 Microtasks: The High-Priority Queue

Microtasks are processed after each macrotask and before rendering. The complete list of microtask sources in modern JavaScript is:

1. **Promise handlers**: `then`, `catch`, `finally`, and the implicit resolution/rejection of async functions.
2. **`queueMicrotask(callback)`**: The explicit standard API.
3. **MutationObserver**: Legacy but still widely used in frameworks and polyfills.
4. **Process.nextTick** (Node.js): Technically not a microtask per the HTML Standard but behaviorally similar; it runs before Promise microtasks in Node.js.

The key difference from macrotasks is that the microtask queue is fully drained after every macrotask. If microtask A enqueues microtask B, B runs before any macrotask or rendering. This can lead to starvation if microtasks recursively enqueue themselves.

### 4.3 Visualizing the Difference

Consider the following code:

```javascript
console.log('script start');

setTimeout(() => console.log('timeout 1'), 0);
setTimeout(() => console.log('timeout 2'), 0);

Promise.resolve().then(() => {
  console.log('promise 1');
  Promise.resolve().then(() => console.log('promise 2'));
});

queueMicrotask(() => console.log('microtask 1'));

console.log('script end');
```

The execution order is:

1. `script start` (synchronous)
2. `script end` (synchronous)
3. `promise 1` (microtask from initial script task)
4. `microtask 1` (microtask from initial script task)
5. `promise 2` (microtask enqueued by promise 1, drained in same checkpoint)
6. `timeout 1` (macrotask)
7. `timeout 2` (macrotask)

Notice that `promise 2`, despite being enqueued during the execution of `promise 1`, runs before any `setTimeout` callback. This is the microtask drain in action.

### 4.4 MessageChannel as a Macrotask Scheduler

Because microtasks can starve rendering, some libraries (notably Vue.js and React in certain configurations) use `MessageChannel` to schedule updates as macrotasks rather than microtasks. `MessageChannel` provides a way to queue a macrotask without the 4ms clamping of nested `setTimeout`.

```javascript
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = () => {
  console.log('MessageChannel macrotask');
};
port.postMessage(null);
```

This queues a task on the port message task source, which is processed as a macrotask in the next event loop iteration.

### 4.5 Symmetric Diff: Microtasks vs. Macrotasks

| Property | Macrotasks (Tasks) | Microtasks |
|----------|-------------------|------------|
| **Standard term** | Task | Microtask |
| **Queue** | One or more task queues | Single microtask queue per event loop |
| **Drain behavior** | One per loop iteration | Fully drained per checkpoint |
| **Rendering interleaving** | May interleave with rendering | Never interleaves; runs before rendering |
| **Starvation risk** | Low (bounded by one per loop) | High (recursive enqueueing possible) |
| **Typical sources** | setTimeout, I/O, UI events, postMessage | Promise, queueMicrotask, MutationObserver |
| **Node.js equivalent** | timers, I/O, immediate | nextTick, Promise |
| **Scheduling guarantee** | FIFO within task source | FIFO within microtask queue |
| **Clamp/throttle** | 4ms clamp for nested setTimeout | No clamp |
| **Use case** | Deferred work, I/O completion | Immediate async continuation |

### 4.6 Framework Scheduling Internals

Modern JavaScript frameworks interact deeply with the event loop. React's Fiber architecture explicitly models component rendering as units of work that can be interrupted and resumed across event loop iterations. React uses `MessageChannel` in browsers and `setImmediate` in Node.js to schedule "lanes" of updates as macrotasks, ensuring that high-priority updates (e.g., user input) can interrupt low-priority updates (e.g., data fetching).

Vue.js uses a combination of `Promise.resolve()` (microtasks) and `requestAnimationFrame` (rendering) for its reactivity system. When reactive state changes, Vue enqueues a microtask to batch updates. If multiple state changes occur synchronously, they are all processed in a single microtask checkpoint, minimizing DOM mutations.

Angular uses `zone.js` to monkey-patch all asynchronous APIs and track macro- and microtask execution within a "zone." This allows Angular to know when the application has stabilized (no pending tasks) and trigger change detection. The patching covers `setTimeout`, `Promise`, `requestAnimationFrame`, `addEventListener`, and even `XMLHttpRequest`.

Svelte compiles away its reactivity system, generating direct DOM update code. However, it still uses microtasks (via `Promise.resolve()`) to batch updates and avoid redundant layout calculations.

Understanding a framework's event loop integration is essential for debugging performance issues. A React "stale closure" bug may manifest as incorrect task ordering. A Vue "nextTick" issue may be caused by misunderstanding microtask draining.

## 5. Node.js vs. Browser Event Loop

While browsers follow the WHATWG HTML Standard, Node.js implements a different event loop based on libuv. Understanding the differences is crucial for writing portable code and diagnosing cross-platform bugs.

### 5.1 libuv Event Loop Phases

Node.js uses libuv for its event loop. The libuv loop is divided into distinct phases, processed in the following order:

1. **Timers**: Execute callbacks scheduled by `setTimeout` and `setInterval` that have reached their threshold.
2. **Pending callbacks**: Execute I/O callbacks deferred from the previous loop iteration, plus errors like TCP errors.
3. **Idle, prepare**: Internal libuv phases used for housekeeping.
4. **Poll**: Retrieve new I/O events and execute their callbacks. Node.js may block here if there are no timers.
5. **Check**: Execute `setImmediate` callbacks.
6. **Close callbacks**: Execute callbacks for closed handles, such as `socket.on('close', ...)`.

After each phase, Node.js checks for nextTickQueue and microtaskQueue (Promise handlers) and drains them completely before proceeding to the next phase.

### 5.2 Key Differences from Browser Event Loop

| Aspect | Browser (WHATWG) | Node.js (libuv) |
|--------|-----------------|----------------|
| **Architecture** | Task queues + microtask checkpoint + rendering | Phased loop with I/O polling |
| **Rendering** | Explicit rendering step | No rendering (no DOM) |
| **`setImmediate`** | Not standard, polyfilled via MessageChannel | Native; runs after poll phase |
| **`process.nextTick`** | Not available | Runs before Promise microtasks |
| **I/O model** | Task-based network tasks | libuv thread pool for file I/O, epoll/kqueue/IOCP for network |
| **Timer precision** | 4ms clamp for nested timers | No clamp (system-dependent) |
| **Phase guarantees** | No phases; pick any task queue | Strict phase ordering |
| **Multiple loops** | Per-agent loops | Single loop per process (by default) |

### 5.3 process.nextTick: The Highest Priority Queue

`process.nextTick` is a Node.js-specific API that schedules a callback on the `nextTickQueue`. This queue is drained after every C++-to-JavaScript transition and after every phase of the event loop. It has even higher priority than Promise microtasks.

```javascript
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('immediate'));
setTimeout(() => console.log('timeout'), 0);
```

Output in Node.js:

1. `nextTick`
2. `promise`
3. `timeout` (or `immediate`; order between timers and immediates depends on context)
4. `immediate` (or `timeout`)

The `nextTickQueue` is dangerous because, like microtasks, it can be recursively drained. A `nextTick` callback that calls `process.nextTick` will prevent the event loop from proceeding. The Node.js documentation explicitly warns against this pattern.

### 5.4 setImmediate vs. setTimeout(fn, 0)

In Node.js, `setImmediate` and `setTimeout(fn, 0)` are not equivalent. `setImmediate` schedules a callback in the "check" phase, while `setTimeout(fn, 0)` schedules a callback in the "timers" phase. If called from within an I/O callback, `setImmediate` always executes before `setTimeout(fn, 0)` because the check phase follows the poll phase, while timers are checked at the beginning of the next loop iteration.

```javascript
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
```

Output:

1. `immediate`
2. `timeout`

This ordering is guaranteed by libuv's phase structure.

### 5.5 Worker Threads and Isolated Event Loops

Node.js Worker Threads have their own event loops, V8 isolates, and libuv instances. They do not share the main thread's event loop. However, `MessagePort` communication between workers uses the port message task source, posting tasks to the target thread's event loop. This is analogous to Web Workers in browsers but uses Node.js's libuv implementation underneath.

### 5.6 Node.js Event Loop Internals: Handles and Requests

At the libuv level, the event loop manipulates two core abstractions: **handles** and **requests**. A handle is a long-lived object that can fire callbacks multiple times (e.g., a TCP server socket, a timer). A request is a short-lived operation that fires a callback once (e.g., a file read, a DNS lookup).

The `uv_run()` function is the core event loop driver. It accepts a mode parameter:

- `UV_RUN_DEFAULT`: Run until there are no active handles or requests.
- `UV_RUN_ONCE`: Block for I/O once, process all pending callbacks, then return.
- `UV_RUN_NOWAIT`: Process pending callbacks without blocking for I/O.

Node.js uses `UV_RUN_DEFAULT` for its main loop. In this mode, libuv cycles through the phases described in Section 5.1 indefinitely. The loop exits only when `uv_loop_close()` is called or when all handles are closed.

The timer phase uses a binary heap (min-heap) to track active timers. This gives `O(log n)` insertion and `O(1)` access to the next expiring timer. The poll phase uses the most efficient I/O multiplexing mechanism available: `epoll` on Linux, `kqueue` on macOS/BSD, and `IOCP` on Windows.

Understanding these internals helps explain Node.js behavior. For example, the `UV_THREADPOOL_SIZE` environment variable controls the number of threads available for file system and DNS operations (default 4). If all thread pool threads are busy, subsequent `fs.readFile` calls are queued until a thread becomes available, regardless of the event loop's timer or poll phases.

## 6. V8 Internals: The JavaScript Engine Perspective

The event loop specification defines when tasks run, but the JavaScript engine (typically V8 in Chrome and Node.js) defines how they run. V8's internal architecture includes a job system, concurrent compilation, background parsing, and garbage collection—each of which interacts with the event loop in subtle ways.

### 6.1 V8 Job System

V8 abstracts asynchronous work through a "job system." A `v8::JobHandle` represents parallel work that can be executed on multiple threads. Jobs are used for:

- **Concurrent compilation**: Optimizing JavaScript code in the background while the main thread continues execution.
- **Background parsing**: Parsing JavaScript source code off the main thread.
- **Garbage collection**: Parallel and concurrent GC phases.

These jobs do not directly interact with the JavaScript-visible event loop. Instead, they run on V8's internal thread pool. When a job completes (e.g., optimized code is ready), V8 may post a task to the event loop to install the optimized code or signal completion.

### 6.2 Concurrent Compilation (TurboFan)

V8 uses the TurboFan optimizing compiler to generate highly optimized machine code. The compilation pipeline is:

1. **Parsing**: Convert source to an Abstract Syntax Tree (AST).
2. **Ignition**: Compile AST to bytecode and execute immediately.
3. **Profiling**: Collect type feedback and execution counts during bytecode execution.
4. **TurboFan**: Generate optimized machine code based on profiling data.

Steps 3 and 4 can run concurrently with JavaScript execution. If the profiling data changes (e.g., a type assumption is violated), V8 deoptimizes back to bytecode. This deoptimization is synchronous from the perspective of the executing function but may be prepared in the background.

### 6.3 Background Parsing

When a `<script>` tag is encountered, the browser must parse the JavaScript before execution. Modern browsers use streaming parsers that parse the script while it is still downloading. V8's background parsing allows the AST to be constructed on a separate thread. When parsing completes, the main thread receives a task to execute the parsed code.

This has event loop implications: a large script may not block the event loop during parsing, but it will block during execution. The gap between parsing completion and execution is determined by the event loop's task scheduling.

### 6.4 Garbage Collection and the Event Loop

V8's garbage collector (Orinoco) uses a mostly-concurrent, generational approach. The key phases are:

- **Scavenges**: Fast, stop-the-world minor GC for the young generation. Typically < 1ms.
- **Mark-Compact**: Major GC for the old generation. Can be partially concurrent but requires stop-the-world pauses for certain operations.

Long GC pauses manifest as long tasks on the main thread, contributing to INP and TBT. V8 provides flags such as `--max-old-space-size` and `--optimize-for-size` to tune GC behavior, but the fundamental tension between automatic memory management and predictable latency remains.

### 6.5 Decision Matrix: Engine Behaviors

| Behavior | V8 (Chrome/Node.js) | SpiderMonkey (Firefox) | JavaScriptCore (Safari) |
|----------|---------------------|------------------------|-------------------------|
| **Optimizing compiler** | TurboFan | IonMonkey | FTL (Faster Than Light) |
| **Concurrent compilation** | Yes | Yes | Yes |
| **Background parsing** | Yes | Yes | Yes |
| **GC type** | Generational, mostly concurrent | Generational, incremental | Generational, concurrent |
| **Microtask implementation** | Internal queue, drained at C++ boundaries | Similar | Similar |
| **Promise hooks** | Yes (debugging/profiling) | Yes | Yes |
| **Top-level await** | Async module evaluation | Async module evaluation | Async module evaluation |

### 6.6 V8 Compilation Pipeline: Sparkplug, Maglev, and TurboFan

V8's compilation strategy has evolved significantly. Modern V8 (versions 9.9+) uses a three-tier compilation pipeline:

1. **Sparkplug**: A non-optimizing baseline compiler that generates machine code directly from bytecode without an intermediate representation. Sparkplug provides fast startup with better performance than pure bytecode interpretation.
2. **Maglev**: A new optimizing compiler (introduced 2023) that sits between Sparkplug and TurboFan. Maglev compiles faster than TurboFan and handles most common optimization cases, reducing the need to reach TurboFan for many functions.
3. **TurboFan**: The highest-tier optimizing compiler, using sea-of-nodes IR and sophisticated type speculation. TurboFan handles complex inlining, escape analysis, and loop optimizations.

The event loop interacts with this pipeline because compilation jobs run on background threads. When Maglev or TurboFan finishes optimizing a function, it must post a task to the main thread to install the optimized code. During this installation, the function may be briefly deoptimized if it is currently executing. This "on-stack replacement" (OSR) mechanism ensures that long-running loops can switch from baseline code to optimized code mid-execution.

Garbage collection also posts tasks to the event loop. V8's concurrent marker runs alongside JavaScript execution, but the final atomic pause (for compaction or pointer updates) must synchronize with the main thread. V8 attempts to schedule these pauses during idle time or between macrotasks, but they can still manifest as long tasks if the heap is large and fragmented.

## 7. Starvation, Priority Inversion, and INP

The cooperative nature of the event loop creates inherent vulnerabilities. Long tasks, microtask drains, and improper scheduling can starve critical work such as user input handling and rendering.

### 7.1 Long Tasks and the 50ms Threshold

The Long Tasks API defines a "long task" as any task that occupies the main thread for more than 50ms. During a long task, the event loop cannot process user input, execute microtasks, or update rendering. The user perceives this as jank or unresponsiveness.

Common causes of long tasks include:

- Large synchronous DOM manipulations
- Expensive JavaScript computations (e.g., sorting large arrays, JSON parsing)
- Synchronous layout thrashing (reading layout properties after DOM mutations)
- Long-running event handlers
- Synchronous XHR or `fetch` in non-async contexts

The Total Blocking Time (TBT) metric sums the duration beyond 50ms of all long tasks between First Contentful Paint (FCP) and Time to Interactive (TTI). Improving TBT requires breaking long tasks into smaller chunks.

### 7.2 Interaction to Next Paint (INP)

INP is a Core Web Vital that measures the latency of every tap, click, or keyboard interaction throughout the entire page lifecycle. It reports the worst (or near-worst) interaction latency, defined as the time from interaction to the next frame paint.

An interaction's latency includes:

1. **Input delay**: Time waiting for the main thread to be free.
2. **Processing time**: Time spent in event handlers.
3. **Presentation delay**: Time to render the next frame.

INP is directly affected by event loop scheduling. If a user clicks during a long task, the input delay is the remaining duration of that long task plus any microtasks that run before the interaction task is processed.

### 7.3 Priority Inversion

Priority inversion occurs when a high-priority task (e.g., user input) is blocked by a low-priority task (e.g., a timer or network callback). Because JavaScript uses cooperative scheduling without preemption, a long-running timer callback can delay a user interaction indefinitely.

This is distinct from classical priority inversion in operating systems, where a low-priority thread holds a lock needed by a high-priority thread. In JavaScript, the "lock" is the main thread itself. Any running task implicitly holds the lock until it completes.

Mitigation strategies include:

- **Yielding**: Breaking tasks into smaller chunks with `scheduler.yield()` or `setTimeout(..., 0)`.
- **Prioritized scheduling**: Using `scheduler.postTask()` with `"user-blocking"` priority for critical work.
- **Off-main-thread work**: Moving computation to Web Workers.

### 7.4 Microtask Starvation

Microtask starvation occurs when a continuous stream of microtasks prevents macrotasks and rendering from running. This can happen with:

- Runaway Promise chains: `Promise.resolve().then(() => Promise.resolve().then(...))`
- MutationObserver in a loop that triggers itself
- `queueMicrotask` recursion

Because the microtask queue is drained completely after each macrotask, a recursive microtask enqueue effectively blocks the event loop. Unlike `while(true)` which blocks synchronously, microtask starvation is asynchronous but equally effective at freezing the UI.

### 7.5 Counter-Examples: Common Misconceptions

**Misconception 1**: `setTimeout(fn, 0)` runs immediately after the current function.
**Counter-example**: It runs after the current task and all microtasks, not after the current function.

```javascript
function demo() {
  setTimeout(() => console.log('timeout'), 0);
  Promise.resolve().then(() => console.log('promise'));
  console.log('sync');
}
demo();
// Output: sync, promise, timeout
```

**Misconception 2**: `Promise.resolve()` always creates a microtask.
**Counter-example**: `Promise.resolve(value)` where `value` is not a thenable resolves synchronously in some paths, but the `then` handler is always deferred as a microtask.

**Misconception 3**: `requestAnimationFrame` is a microtask.
**Counter-example**: `requestAnimationFrame` callbacks run during the rendering phase, after all microtasks have been drained. They are not tasks or microtasks in the strict sense.

**Misconception 4**: Node.js `setImmediate` is the same as `setTimeout(fn, 0)`.
**Counter-example**: As shown in Section 5.4, their relative ordering depends on context.

**Misconception 5**: Web Workers share the main thread's event loop.
**Counter-example**: Each Worker has its own event loop, V8 isolate, and execution context. Only `SharedArrayBuffer` + `Atomics` provides synchronous communication.

### 7.6 Real-World INP Case Studies

**Case Study 1: E-Commerce Product List**
A major e-commerce site experienced poor INP (380ms) on mobile. Investigation revealed that clicking "Add to Cart" triggered a synchronous analytics call (`gtag('event', ...)`) that blocked the main thread for 120ms, followed by a state update that caused 80ms of layout thrashing. The input delay was 150ms due to a preceding image decode task.

Resolution: The analytics call was moved to `scheduler.yield()`, the state update was batched with `requestAnimationFrame`, and images were decoded asynchronously with `img.decode()`.

**Case Study 2: Real-Time Dashboard**
A financial dashboard updating at 1Hz via WebSocket experienced periodic jank. The WebSocket `onmessage` handler parsed a 2MB JSON payload synchronously, causing 200ms+ long tasks every second.

Resolution: JSON parsing was moved to a Web Worker, and the worker posted only the diff to the main thread. INP improved from 450ms to 45ms.

**Case Study 3: Document Editor**
A collaborative document editor used Operational Transformation (OT) on the main thread. As document size grew, OT computation exceeded 50ms per keystroke.

Resolution: The OT engine was compiled to WebAssembly and run in a Web Worker. The main thread received only the transformed operations, which were applied in a single microtask batch.

## 8. Atomics and SharedArrayBuffer: Shared-Memory Concurrency

While the event loop provides cooperative concurrency within a single thread, `SharedArrayBuffer` and `Atomics` enable true shared-memory parallelism across threads (Web Workers in browsers, Worker Threads in Node.js).

### 8.1 SharedArrayBuffer

`SharedArrayBuffer` is an array buffer that can be transferred (shared) between threads without copying. Multiple threads can read and write to the same underlying memory. Without synchronization, this leads to data races.

```javascript
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);
// Post to worker: worker.postMessage(sab, [sab]);
```

### 8.2 The Memory Model

ECMAScript defines a formal memory model for shared memory. Key concepts include:

- **Data race**: Two accesses to the same memory location, at least one of which is a write, with no happens-before relationship between them.
- **Happens-before**: A partial order on events. Synchronous code within a single agent has a total happens-before order. Cross-agent happens-before is established via `Atomics` operations and agent communication.
- **Sequential consistency for data race free programs**: If a program has no data races, its execution appears to be sequentially consistent.
- **Sequentially consistent atomics**: `Atomics.load`, `Atomics.store`, `Atomics.add`, etc., are sequentially consistent. They act as synchronization points.

### 8.3 Atomics API

The `Atomics` object provides atomic operations on shared memory:

- `Atomics.load(typedArray, index)`: Atomic read.
- `Atomics.store(typedArray, index, value)`: Atomic write.
- `Atomics.add`, `Atomics.sub`, `Atomics.and`, `Atomics.or`, `Atomics.xor`: Read-modify-write.
- `Atomics.compareExchange(typedArray, index, expected, replacement)`: CAS operation.
- `Atomics.wait(typedArray, index, value, timeout)`: Block the agent until notified.
- `Atomics.notify(typedArray, index, count)`: Wake blocked agents.

`Atomics.wait` and `Atomics.notify` implement a futex-like synchronization primitive. They are the only blocking operations in standard JavaScript and can only be used in agents that support blocking (Web Workers and Node.js Worker Threads, not the main thread).

### 8.4 Lock-Free Programming

JavaScript shared-memory concurrency is intentionally limited. There are no mutexes, semaphores, or condition variables in the standard library. Programmers must implement these using `Atomics.compareExchange` (spinlocks) or `Atomics.wait/notify` (blocking synchronization).

A basic spinlock:

```javascript
class SpinLock {
  constructor(sab, index = 0) {
    this.sab = sab;
    this.index = index;
    this.view = new Int32Array(sab);
  }
  lock() {
    while (Atomics.compareExchange(this.view, this.index, 0, 1) !== 0) {
      // Spin
    }
  }
  unlock() {
    Atomics.store(this.view, this.index, 0);
  }
}
```

Spinlocks are inefficient if contention is high. For better performance, combine `Atomics.wait` and `Atomics.notify`:

```javascript
class Mutex {
  constructor(sab, index = 0) {
    this.view = new Int32Array(sab);
    this.index = index;
  }
  lock() {
    while (Atomics.compareExchange(this.view, this.index, 0, 1) !== 0) {
      Atomics.wait(this.view, this.index, 1);
    }
  }
  unlock() {
    Atomics.store(this.view, this.index, 0);
    Atomics.notify(this.view, this.index, 1);
  }
}
```

### 8.5 Categorical Semantics of Shared Memory

We can model shared memory as a presheaf over a category of memory locations. Each location `l` has a type (e.g., `Int32`), and the presheaf assigns to each location its set of possible values. The `Atomics` operations are natural transformations that preserve the structure of this presheaf.

In simpler terms, the category **Mem** has:

- **Objects**: Memory states `S: Locations → Values`
- **Morphisms**: State transitions caused by atomic operations
- **Composition**: Sequential execution of operations

The `Atomics` object is a functor `A: Mem → Mem` that guarantees atomicity: for any operation `a ∈ A`, the transition is indivisible. `Atomics.wait/notify` introduces a blocking morphism that waits for a notification morphism from another thread. In categorical terms, `Atomics.wait` is a terminal object in the category of waiting states, and `Atomics.notify` is the unique morphism that maps from the notification event to the terminal object, unblocking the waiting agent.

### 8.6 Memory Ordering, Acquire-Release, and Sequential Consistency

While JavaScript `Atomics` operations are sequentially consistent by default, understanding memory ordering is essential for implementing efficient lock-free data structures. Sequential consistency means that all agents agree on a single total order of atomic operations. This is the strongest guarantee and the easiest to reason about, but it can be slower than weaker orderings on some architectures.

The ECMAScript memory model defines:

- **Sequentially Consistent Atomics**: `Atomics.load`, `Atomics.store`, `Atomics.exchange`, `Atomics.compareExchange`, and read-modify-write operations. These synchronize-with each other across agents.
- **Happens-Before Relation**: If operation A happens-before operation B, then the effects of A are visible to B. Within a single agent, program order defines happens-before. Across agents, atomic operations define happens-before.
- **Data Race Freedom**: A program without data races (unsynchronized concurrent access with at least one write) has sequentially consistent semantics. If a data race exists, the behavior is undefined.

Consider the classic Dekker's algorithm for mutual exclusion:

```javascript
// Thread A
Atomics.store(flagA, 0, 1);
if (Atomics.load(flagB, 0) === 0) {
  // Enter critical section
}

// Thread B
Atomics.store(flagB, 0, 1);
if (Atomics.load(flagA, 0) === 0) {
  // Enter critical section
}
```

Because `Atomics` are sequentially consistent, this works correctly in JavaScript. In languages with weaker atomics, the stores and loads could be reordered, causing both threads to enter the critical section.

For higher-level synchronization, JavaScript programmers typically use:

1. **Spinlocks**: For very short critical sections where context switching overhead exceeds spinning time.
2. **Futex-based mutexes**: Using `Atomics.wait/notify` for longer critical sections.
3. **Lock-free queues**: Using `Atomics.compareExchange` to implement Michael-Scott queues or similar structures.

The lack of weak atomics in JavaScript simplifies reasoning at the cost of some performance. However, for the typical use cases of `SharedArrayBuffer` (image processing, scientific computing, game engines), sequential consistency is usually sufficient.

## 9. Modern Scheduling APIs

Recognizing the limitations of the legacy event loop, the Web Platform has introduced several APIs for more explicit task scheduling and yielding.

### 9.1 scheduler.yield()

`scheduler.yield()` is a proposal (with experimental implementations) that yields control to the event loop, allowing the browser to process higher-priority work, and then resumes the original task with the same priority.

```javascript
async function processLargeArray(items) {
  for (const item of items) {
    process(item);
    if (shouldYield()) {
      await scheduler.yield();
    }
  }
}
```

Unlike `setTimeout(..., 0)`, which places the continuation at the back of the task queue (potentially behind many other tasks), `scheduler.yield()` is designed to maintain the task's relative priority. This is critical for INP: if a user interaction triggers a long task that yields, the yielded continuation should not be delayed by unrelated timer tasks.

### 9.2 scheduler.postTask()

The Prioritized Task Scheduling API provides `scheduler.postTask(callback, options)` for scheduling tasks with explicit priorities:

- `"user-blocking"`: Highest priority. For critical user-facing work.
- `"user-visible"`: Normal priority. For work the user expects to complete soon.
- `"background"`: Lowest priority. For work that can be deferred indefinitely.

```javascript
scheduler.postTask(() => {
  updateUIInResponseToUserInteraction();
}, { priority: 'user-blocking' });

scheduler.postTask(() => {
  prefetchNextPageContent();
}, { priority: 'background' });
```

`postTask` returns a `TaskController` that allows cancellation and priority changes:

```javascript
const controller = new TaskController({ priority: 'background' });
scheduler.postTask(() => { /* work */ }, { signal: controller.signal });
controller.setPriority('user-visible');
controller.abort();
```

This API gives developers direct control over event loop prioritization, addressing many of the starvation and priority inversion issues discussed in Section 7.

### 9.3 isInputPending()

`navigator.scheduling.isInputPending()` allows a long task to check whether user input is waiting to be processed. If input is pending, the task can yield to ensure responsiveness.

```javascript
while (hasMoreWork()) {
  if (navigator.scheduling.isInputPending()) {
    await scheduler.yield();
  }
  doChunkOfWork();
}
```

This is particularly useful for games, data visualization, and other applications with continuous main-thread work.

### 9.4 Web Locks API

The Web Locks API provides a mutex-like mechanism for coordinating access to shared resources across tabs, workers, and frames within the same origin.

```javascript
await navigator.locks.request('resource-name', async (lock) => {
  // Exclusive access to the resource
  await performCoordinatedWork();
});
```

Locks can be shared or exclusive:

```javascript
// Multiple readers allowed
await navigator.locks.request('resource', { mode: 'shared' }, async (lock) => {
  await readResource();
});

// Only one writer allowed
await navigator.locks.request('resource', { mode: 'exclusive' }, async (lock) => {
  await writeResource();
});
```

The Web Locks API is not about thread-level locking (it does not prevent concurrent JavaScript execution) but about coordinating asynchronous operations across execution contexts. It is useful for preventing race conditions in IndexedDB transactions, cache updates, and cross-tab state management.

### 9.5 Decision Matrix: Scheduling APIs

| API | Granularity | Priority Control | Cancellation | Cross-Context | Use Case |
|-----|-------------|------------------|--------------|---------------|----------|
| `setTimeout` | Macrotask | No | No (manual) | No | Simple deferral |
| `queueMicrotask` | Microtask | No | No | No | Immediate continuation |
| `requestAnimationFrame` | Rendering | No | No | No | Visual updates |
| `requestIdleCallback` | Idle | No | No | No | Non-urgent work |
| `scheduler.yield()` | Task continuation | Preserved | No | No | Cooperative multitasking |
| `scheduler.postTask()` | Task | Yes (3 levels) | Yes | No | Explicit prioritization |
| `isInputPending()` | Check only | N/A | N/A | No | Input-aware yielding |
| `Web Locks API` | Resource | N/A | N/A | Yes (same-origin) | Coordination |

### 9.6 Service Workers, Push Events, and Specialized Event Loops

Service Workers have a specialized event loop designed for handling push notifications, background sync, and fetch interception. Unlike window event loops, service worker event loops have no rendering step. They are also more aggressively suspended by the browser to conserve battery.

When a push notification arrives, the browser wakes the service worker (potentially starting it cold), queues a `push` event on its event loop, and waits for the event handler to complete. If the handler calls `event.waitUntil(promise)`, the browser keeps the worker alive until the promise settles. This is a macrotask-level extension mechanism.

Background Sync uses a similar model. The `sync` event is queued when connectivity returns, and the handler can perform deferred uploads. The event loop here must coordinate with the browser's network scheduler, which operates at a lower level than JavaScript tasks.

Push and sync events are high-priority tasks because they are time-sensitive. However, browsers may throttle them to prevent abuse. For example, Chrome limits the frequency of push events and may coalesce multiple notifications.

### 9.7 Worklets and the CSS Paint API

Worklets (PaintWorklet, AudioWorklet, AnimationWorklet) run on separate threads with their own event loops, but with restricted APIs. A PaintWorklet cannot access the DOM, `fetch`, or timers. Its event loop only processes paint requests from the main thread.

When the main thread needs to paint a custom CSS image, it serializes the paint parameters and posts a task to the PaintWorklet's event loop. The worklet executes the paint callback and returns an `ImageBitmap`. This architecture ensures that slow paint worklets do not block the main thread's event loop.

AudioWorklet is even more constrained: its event loop runs on a high-priority real-time thread with a fixed callback period (e.g., every 128 samples). Missing a deadline causes audio glitches, so the AudioWorklet event loop has no microtask checkpoint and no rendering step—only a direct callback invocation.

## 10. TypeScript Examples and Simulators

The following TypeScript examples implement simulators and utilities for understanding and profiling the event loop. Each example is self-contained, type-safe, and production-oriented.

### 10.1 Task Queue Simulator

This simulator models the WHATWG event loop with multiple task queues, a microtask queue, and a rendering step.

```typescript
/**
 * Task Queue Simulator
 * Models WHATWG event loop with task queues, microtasks, and rendering.
 */

type TaskSource = 'dom' | 'user' | 'network' | 'timer' | 'history' | 'port';
type TaskPriority = number;

interface Task {
  id: number;
  source: TaskSource;
  priority: TaskPriority;
  fn: () => void;
  timestamp: number;
}

interface Microtask {
  id: number;
  fn: () => void;
  timestamp: number;
}

interface EventLoopConfig {
  taskQueueCount: number;
  enableRendering: boolean;
  renderIntervalMs: number;
}

class EventLoopSimulator {
  private taskQueues: Map<TaskSource, Task[]> = new Map();
  private microtaskQueue: Microtask[] = [];
  private currentTask: Task | null = null;
  private taskIdCounter = 0;
  private microtaskIdCounter = 0;
  private lastRenderTime = 0;
  private logs: string[] = [];

  constructor(private config: EventLoopConfig) {
    const sources: TaskSource[] = ['dom', 'user', 'network', 'timer', 'history', 'port'];
    for (const source of sources) {
      this.taskQueues.set(source, []);
    }
  }

  enqueueTask(source: TaskSource, fn: () => void, priority: TaskPriority = 0): void {
    const queue = this.taskQueues.get(source)!;
    const task: Task = {
      id: ++this.taskIdCounter,
      source,
      priority,
      fn,
      timestamp: performance.now(),
    };
    queue.push(task);
    queue.sort((a, b) => a.priority - b.priority || a.timestamp - b.timestamp);
    this.log(`Enqueued task #${task.id} [${source}]`);
  }

  enqueueMicrotask(fn: () => void): void {
    const microtask: Microtask = {
      id: ++this.microtaskIdCounter,
      fn,
      timestamp: performance.now(),
    };
    this.microtaskQueue.push(microtask);
    this.log(`Enqueued microtask #${microtask.id}`);
  }

  private selectNextTask(): Task | null {
    const queues = Array.from(this.taskQueues.values()).filter(q => q.length > 0);
    if (queues.length === 0) return null;
    // Round-robin selection across non-empty queues
    const selectedQueue = queues[Math.floor(Math.random() * queues.length)];
    return selectedQueue.shift() ?? null;
  }

  private runMicrotaskCheckpoint(): void {
    while (this.microtaskQueue.length > 0) {
      const mt = this.microtaskQueue.shift()!;
      this.log(`Running microtask #${mt.id}`);
      mt.fn();
    }
  }

  private shouldRender(): boolean {
    if (!this.config.enableRendering) return false;
    return performance.now() - this.lastRenderTime >= this.config.renderIntervalMs;
  }

  private render(): void {
    this.lastRenderTime = performance.now();
    this.log('--- Rendering ---');
  }

  tick(): boolean {
    const task = this.selectNextTask();
    if (task) {
      this.currentTask = task;
      this.log(`Running task #${task.id} [${task.source}]`);
      task.fn();
      this.currentTask = null;
    }

    this.runMicrotaskCheckpoint();

    if (this.shouldRender()) {
      this.render();
    }

    return this.hasWork();
  }

  hasWork(): boolean {
    const hasTasks = Array.from(this.taskQueues.values()).some(q => q.length > 0);
    return hasTasks || this.microtaskQueue.length > 0;
  }

  runAll(limit: number = 1000): void {
    let iterations = 0;
    while (this.hasWork() && iterations < limit) {
      this.tick();
      iterations++;
    }
  }

  private log(msg: string): void {
    this.logs.push(msg);
  }

  getLogs(): readonly string[] {
    return this.logs;
  }

  printLogs(): void {
    console.log(this.logs.join('\n'));
  }
}

// Usage
const sim = new EventLoopSimulator({
  taskQueueCount: 6,
  enableRendering: true,
  renderIntervalMs: 16,
});

sim.enqueueTask('timer', () => {
  console.log('Timer task running');
  sim.enqueueMicrotask(() => console.log('Microtask from timer'));
});

sim.enqueueTask('user', () => {
  console.log('User interaction');
});

sim.runAll();
sim.printLogs();
```

### 10.2 Microtask vs. Macrotask Visualizer

This utility visualizes the relative ordering of microtasks and macrotasks with timing information.

```typescript
/**
 * Microtask vs. Macrotask Visualizer
 * Demonstrates execution ordering with high-resolution timing.
 */

interface ExecutionRecord {
  type: 'sync' | 'microtask' | 'macrotask';
  name: string;
  startTime: number;
  endTime: number;
}

class TaskVisualizer {
  private records: ExecutionRecord[] = [];
  private startTime = performance.now();

  private now(): number {
    return performance.now() - this.startTime;
  }

  private log(type: ExecutionRecord['type'], name: string, fn: () => void): void {
    const start = this.now();
    fn();
    const end = this.now();
    this.records.push({ type, name, startTime: start, endTime: end });
  }

  sync(name: string, fn: () => void): void {
    this.log('sync', name, fn);
  }

  microtask(name: string, fn: () => void): void {
    queueMicrotask(() => this.log('microtask', name, fn));
  }

  macrotask(name: string, fn: () => void, delay: number = 0): void {
    setTimeout(() => this.log('macrotask', name, fn), delay);
  }

  async waitForIdle(timeout: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  generateReport(): string {
    const sorted = [...this.records].sort((a, b) => a.startTime - b.startTime);
    const lines = sorted.map(r => {
      const pad = ' '.repeat(20 - r.name.length);
      return `${r.type.padEnd(10)} | ${r.name}${pad} | ${r.startTime.toFixed(2)}ms - ${r.endTime.toFixed(2)}ms [${(r.endTime - r.startTime).toFixed(2)}ms]`;
    });
    return ['Type       | Name                 | Timing', '-'.repeat(60), ...lines].join('\n');
  }

  printReport(): void {
    console.log(this.generateReport());
  }

  getRecords(): readonly ExecutionRecord[] {
    return this.records;
  }
}

// Usage
async function demoVisualizer(): Promise<void> {
  const viz = new TaskVisualizer();

  viz.sync('main-script', () => {
    console.log('A: main script start');
    viz.microtask('promise-1', () => console.log('B: promise 1'));
    viz.macrotask('timeout-0', () => console.log('C: timeout 0'));
    viz.microtask('queueMicrotask-1', () => console.log('D: queueMicrotask 1'));
    console.log('E: main script end');
  });

  await viz.waitForIdle(100);
  viz.printReport();
}

demoVisualizer();
```

### 10.3 Long Task Detector

This utility monitors the main thread for tasks exceeding a specified duration, useful for INP and TBT analysis.

```typescript
/**
 * Long Task Detector
 * Monitors main thread blocking using MessageChannel-based macrotask sampling.
 */

interface LongTaskReport {
  startTime: number;
  duration: number;
  category: 'long-task' | 'microtask-drain' | 'render-blocking';
  context?: string;
}

type LongTaskCallback = (report: LongTaskReport) => void;

class LongTaskDetector {
  private observer: PerformanceObserver | null = null;
  private callbacks: LongTaskCallback[] = [];
  private sampling = false;
  private sampleInterval = 5; // ms
  private lastSampleTime = 0;
  private channel: MessageChannel | null = null;

  constructor(private threshold: number = 50) {}

  onLongTask(callback: LongTaskCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const idx = this.callbacks.indexOf(callback);
      if (idx >= 0) this.callbacks.splice(idx, 1);
    };
  }

  start(): void {
    if (typeof PerformanceObserver !== 'undefined' && 'PerformanceLongTaskTiming' in window) {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const report: LongTaskReport = {
            startTime: entry.startTime,
            duration: entry.duration,
            category: 'long-task',
            context: (entry as any).attribution?.[0]?.containerSrc || 'unknown',
          };
          this.notify(report);
        }
      });
      this.observer.observe({ entryTypes: ['longtask'] as any });
    } else {
      this.startPolyfill();
    }
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.sampling = false;
    if (this.channel) {
      this.channel.port1.onmessage = null;
      this.channel = null;
    }
  }

  private startPolyfill(): void {
    this.sampling = true;
    this.channel = new MessageChannel();
    this.lastSampleTime = performance.now();

    const sample = () => {
      if (!this.sampling) return;
      const now = performance.now();
      const delta = now - this.lastSampleTime;
      this.lastSampleTime = now;

      if (delta > this.threshold) {
        this.notify({
          startTime: now - delta,
          duration: delta,
          category: delta > this.sampleInterval * 10 ? 'microtask-drain' : 'long-task',
        });
      }

      this.channel!.port2.postMessage(null);
    };

    this.channel.port1.onmessage = sample;
    this.channel.port2.postMessage(null);
  }

  private notify(report: LongTaskReport): void {
    for (const cb of this.callbacks) {
      try { cb(report); } catch {}
    }
  }

  static createInstrumentation(threshold?: number): LongTaskDetector {
    const detector = new LongTaskDetector(threshold);
    detector.onLongTask(report => {
      console.warn('[LongTask]', `${report.duration.toFixed(1)}ms`, report.category, report.context);
    });
    return detector;
  }
}

// Usage
const detector = LongTaskDetector.createInstrumentation(50);
detector.start();

// Simulate long task
const start = performance.now();
while (performance.now() - start < 100) {} // block for ~100ms

detector.stop();
```

### 10.4 Scheduler Priority Queue

This implements a priority queue for task scheduling, modeling the behavior of `scheduler.postTask()`.

```typescript
/**
 * Scheduler Priority Queue
 * Models prioritized task scheduling with cancellation and dynamic reprioritization.
 */

export type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

interface PriorityValue {
  value: number;
  label: TaskPriority;
}

const PRIORITY_MAP: Record<TaskPriority, PriorityValue> = {
  'user-blocking': { value: 0, label: 'user-blocking' },
  'user-visible': { value: 1, label: 'user-visible' },
  'background': { value: 2, label: 'background' },
};

interface ScheduledTask<T = unknown> {
  id: number;
  priority: PriorityValue;
  fn: () => T | Promise<T>;
  signal?: AbortSignal;
  enqueueTime: number;
  started: boolean;
  completed: boolean;
  result?: T;
  error?: Error;
}

class SchedulerPriorityQueue {
  private queue: ScheduledTask[] = [];
  private idCounter = 0;
  private running = false;
  private currentTask: ScheduledTask | null = null;

  postTask<T>(
    fn: () => T | Promise<T>,
    options: { priority?: TaskPriority; signal?: AbortSignal } = {}
  ): Promise<T> {
    const priority = PRIORITY_MAP[options.priority ?? 'user-visible'];
    const id = ++this.idCounter;

    const task: ScheduledTask<T> = {
      id,
      priority,
      fn,
      signal: options.signal,
      enqueueTime: performance.now(),
      started: false,
      completed: false,
    };

    if (options.signal?.aborted) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    options.signal?.addEventListener('abort', () => {
      this.removeTask(id);
    });

    this.queue.push(task);
    this.sortQueue();

    return new Promise((resolve, reject) => {
      const originalFn = task.fn;
      task.fn = async () => {
        try {
          if (task.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          task.started = true;
          const result = await originalFn();
          task.result = result;
          task.completed = true;
          resolve(result);
          return result;
        } catch (err) {
          task.error = err as Error;
          reject(err);
          throw err;
        }
      };

      if (!this.running) {
        this.runLoop();
      }
    });
  }

  setPriority(taskId: number, newPriority: TaskPriority): boolean {
    const task = this.queue.find(t => t.id === taskId);
    if (!task || task.started) return false;
    task.priority = PRIORITY_MAP[newPriority];
    this.sortQueue();
    return true;
  }

  private removeTask(id: number): void {
    const idx = this.queue.findIndex(t => t.id === id);
    if (idx >= 0 && !this.queue[idx].started) {
      this.queue.splice(idx, 1);
    }
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority.value !== b.priority.value) {
        return a.priority.value - b.priority.value;
      }
      return a.enqueueTime - b.enqueueTime;
    });
  }

  private async runLoop(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      // Yield to browser between tasks
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      const task = this.queue.shift();
      if (!task) continue;

      if (task.signal?.aborted) {
        continue;
      }

      this.currentTask = task;
      try {
        await task.fn();
      } catch {
        // Error handled in wrapped fn
      }
      this.currentTask = null;
    }
    this.running = false;
  }

  getQueueSnapshot(): Array<{ id: number; priority: TaskPriority; started: boolean }> {
    return this.queue.map(t => ({
      id: t.id,
      priority: t.priority.label,
      started: t.started,
    }));
  }

  abortAll(): void {
    this.queue = this.queue.filter(t => {
      if (!t.started) {
        // Ideally trigger abort signal here if controller exposed
        return false;
      }
      return true;
    });
  }
}

// Usage
const scheduler = new SchedulerPriorityQueue();

scheduler.postTask(() => console.log('Background work'), { priority: 'background' });
scheduler.postTask(() => console.log('Blocking UI update'), { priority: 'user-blocking' });
scheduler.postTask(() => console.log('Visible content'), { priority: 'user-visible' });
```

### 10.5 Atomics Barrier Simulator

This simulates a synchronization barrier using `Atomics.wait` and `Atomics.notify` across conceptual worker threads.

```typescript
/**
 * Atomics Barrier Simulator
 * Simulates a thread synchronization barrier using SharedArrayBuffer and Atomics.
 */

interface WorkerContext {
  id: number;
  sab: SharedArrayBuffer;
  barrierIndex: number;
  threadCount: number;
}

class AtomicsBarrierSimulator {
  private sab: SharedArrayBuffer;
  private view: Int32Array;
  private barrierState = 0;
  private readonly barrierIndex = 0;
  private readonly doneIndex = 1;
  private workers: Array<() => void> = [];

  constructor(private threadCount: number) {
    // Int32Array: [barrierCounter, doneFlag]
    this.sab = new SharedArrayBuffer(8);
    this.view = new Int32Array(this.sab);
  }

  createWorker(id: number, work: (ctx: WorkerContext) => void): () => void {
    const run = () => {
      const ctx: WorkerContext = {
        id,
        sab: this.sab,
        barrierIndex: this.barrierIndex,
        threadCount: this.threadCount,
      };
      work(ctx);
    };
    this.workers.push(run);
    return run;
  }

  barrier(ctx: WorkerContext): void {
    const view = new Int32Array(ctx.sab);
    const count = Atomics.add(view, ctx.barrierIndex, 1);

    if (count + 1 === ctx.threadCount) {
      // Last thread to arrive: reset and notify all
      Atomics.store(view, ctx.barrierIndex, 0);
      Atomics.notify(view, ctx.barrierIndex, ctx.threadCount);
      console.log(`[Worker ${ctx.id}] Releasing barrier`);
    } else {
      // Wait for release
      console.log(`[Worker ${ctx.id}] Waiting at barrier`);
      Atomics.wait(view, ctx.barrierIndex, count + 1);
      console.log(`[Worker ${ctx.id}] Passed barrier`);
    }
  }

  async runAll(): Promise<void> {
    // In a real environment, these would run in parallel Web Workers.
    // Here we simulate with async execution.
    Atomics.store(this.view, this.barrierIndex, 0);
    Atomics.store(this.view, this.doneIndex, 0);

    const promises = this.workers.map(worker => new Promise<void>(resolve => {
      setTimeout(() => {
        worker();
        resolve();
      }, Math.random() * 10);
    }));

    await Promise.all(promises);
  }
}

// Usage
const barrierSim = new AtomicsBarrierSimulator(3);

for (let i = 0; i < 3; i++) {
  barrierSim.createWorker(i, (ctx) => {
    console.log(`[Worker ${ctx.id}] Phase 1`);
    barrierSim.barrier(ctx);
    console.log(`[Worker ${ctx.id}] Phase 2`);
    barrierSim.barrier(ctx);
    console.log(`[Worker ${ctx.id}] Done`);
  });
}

barrierSim.runAll();
```

### 10.6 Event Loop Profiler

This profiler instruments macrotask and microtask execution to identify bottlenecks and scheduling anomalies.

```typescript
/**
 * Event Loop Profiler
 * Instruments task execution to identify event loop bottlenecks.
 */

interface ProfileEntry {
  type: 'task' | 'microtask' | 'render' | 'idle';
  startTime: number;
  duration: number;
  label?: string;
}

interface ProfileReport {
  totalTime: number;
  taskTime: number;
  microtaskTime: number;
  idleTime: number;
  longTasks: ProfileEntry[];
  taskDistribution: Record<string, number>;
}

class EventLoopProfiler {
  private entries: ProfileEntry[] = [];
  private active = false;
  private currentEntry: ProfileEntry | null = null;
  private lastEndTime = 0;
  private labelStack: string[] = [];

  start(): void {
    this.active = true;
    this.lastEndTime = performance.now();
    this.instrumentGlobals();
  }

  stop(): ProfileReport {
    this.active = false;
    return this.generateReport();
  }

  private instrumentGlobals(): void {
    if (typeof window === 'undefined') return;

    // Instrument setTimeout
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
      const label = this.labelStack[this.labelStack.length - 1] || 'setTimeout';
      const wrapped = typeof handler === 'function'
        ? () => this.wrapTask('task', label, () => handler(...args))
        : () => this.wrapTask('task', label, () => eval(handler as string));
      return originalSetTimeout(wrapped, timeout);
    };

    // Instrument queueMicrotask
    const originalQueueMicrotask = queueMicrotask;
    window.queueMicrotask = (callback: VoidFunction) => {
      const label = this.labelStack[this.labelStack.length - 1] || 'queueMicrotask';
      originalQueueMicrotask(() => this.wrapTask('microtask', label, callback));
    };

    // Instrument requestAnimationFrame
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return originalRAF((time) => this.wrapTask('render', 'rAF', () => callback(time)));
    };
  }

  wrapTask<T>(type: ProfileEntry['type'], label: string, fn: () => T): T {
    if (!this.active) return fn();

    const idleTime = performance.now() - this.lastEndTime;
    if (idleTime > 0) {
      this.entries.push({ type: 'idle', startTime: this.lastEndTime, duration: idleTime });
    }

    const start = performance.now();
    this.currentEntry = { type, startTime: start, duration: 0, label };

    this.labelStack.push(label);
    try {
      return fn();
    } finally {
      this.labelStack.pop();
      const end = performance.now();
      this.currentEntry.duration = end - start;
      this.entries.push(this.currentEntry);
      this.lastEndTime = end;
      this.currentEntry = null;
    }
  }

  private generateReport(): ProfileReport {
    const totalTime = this.entries.length > 0
      ? (this.entries[this.entries.length - 1].startTime + this.entries[this.entries.length - 1].duration) - this.entries[0].startTime
      : 0;

    const taskTime = this.entries.filter(e => e.type === 'task').reduce((s, e) => s + e.duration, 0);
    const microtaskTime = this.entries.filter(e => e.type === 'microtask').reduce((s, e) => s + e.duration, 0);
    const idleTime = this.entries.filter(e => e.type === 'idle').reduce((s, e) => s + e.duration, 0);
    const longTasks = this.entries.filter(e => e.type === 'task' && e.duration > 50);

    const taskDistribution: Record<string, number> = {};
    for (const entry of this.entries) {
      if (entry.type === 'task' && entry.label) {
        taskDistribution[entry.label] = (taskDistribution[entry.label] || 0) + entry.duration;
      }
    }

    return { totalTime, taskTime, microtaskTime, idleTime, longTasks, taskDistribution };
  }

  printReport(report: ProfileReport): void {
    console.log('=== Event Loop Profile ===');
    console.log(`Total time: ${report.totalTime.toFixed(2)}ms`);
    console.log(`Task time: ${report.taskTime.toFixed(2)}ms (${(report.taskTime / report.totalTime * 100).toFixed(1)}%)`);
    console.log(`Microtask time: ${report.microtaskTime.toFixed(2)}ms`);
    console.log(`Idle time: ${report.idleTime.toFixed(2)}ms`);
    console.log(`Long tasks (>50ms): ${report.longTasks.length}`);
    for (const lt of report.longTasks) {
      console.log(`  - ${lt.label || 'unknown'}: ${lt.duration.toFixed(2)}ms`);
    }
    console.log('Task distribution:', report.taskDistribution);
  }
}

// Usage
const profiler = new EventLoopProfiler();
profiler.start();

setTimeout(() => {
  console.log('Task 1');
  queueMicrotask(() => console.log('Microtask 1'));
}, 10);

setTimeout(() => {
  console.log('Task 2');
  const start = performance.now();
  while (performance.now() - start < 60) {} // simulate long task
}, 20);

setTimeout(() => {
  const report = profiler.stop();
  profiler.printReport(report);
}, 200);
```

## 11. Categorical Semantics and Formal Analysis

To conclude our theoretical treatment, we develop the categorical semantics of event loop concurrency in greater depth. This section is aimed at readers with a background in category theory, though we keep the discussion grounded in concrete JavaScript semantics.

### 11.1 The Category of Scheduling States

Let **Sched** be the category where:

- **Objects** are tuples `(T, M, R, S)` where:
  - `T` is a multiset of macrotasks,
  - `M` is a list of microtasks,
  - `R` is a rendering state (dirty/clean),
  - `S` is the JavaScript heap state.
- **Morphisms** `f: (T, M, R, S) → (T', M', R', S')` are valid event loop transitions.

The event loop is an endofunctor `Loop: Sched → Sched` defined by the WHATWG algorithm. We can decompose `Loop` into a composition of functors:

```
Loop = Render ∘ Microtask ∘ Task
```

where:

- `Task` selects and executes one macrotask,
- `Microtask` performs the microtask checkpoint (a Kleene star operation),
- `Render` optionally updates rendering.

### 11.2 The Microtask Functor as a Kleene Star

The microtask checkpoint is the Kleene star of the single-microtask execution functor `μ`. In category theory, the Kleene star `μ*` is the free monoid generated by `μ`. In our context:

```
μ*(M) = M ∪ μ(M) ∪ μ(μ(M)) ∪ ...
```

The checkpoint terminates because the microtask queue is finite at each step and microtasks cannot enqueue infinitely many microtasks without recursion (which would be a programming error, not a structural property). Formally, we assume well-foundedness: the relation "microtask `m` was enqueued by microtask `n`" is a well-founded partial order.

### 11.3 Event Loop as a Monad

The event loop can be viewed as a monad `E` on the category of JavaScript values. A value `a` is lifted into `E(a)`, representing a computation that produces `a` asynchronously. The unit `η: a → E(a)` is `Promise.resolve(a)`. The multiplication `μ: E(E(a)) → E(a)` is `Promise.prototype.then` with identity.

Macrotasks are computations in a related monad `T` (the task monad), where `T(a)` represents a computation that produces `a` in a future event loop iteration. The relationship between `E` and `T` is that `E` is a submonad of `T` with a natural transformation `ι: E → T` that embeds microtasks into macrotasks by delaying them one additional loop iteration. However, no such natural transformation exists in the other direction: not all macrotasks can be expressed as microtasks because microtasks cannot span rendering steps.

### 11.4 Symmetric Diff: Browser vs. Node.js Event Loops

From a categorical perspective, the browser event loop and the Node.js event loop are both algebras for the "event loop signature" but with different models. Let **Σ** be the signature with operations:

- `enqueue_task: Source × Task → Unit`
- `enqueue_microtask: Microtask → Unit`
- `next_task: Unit → Maybe Task`
- `drain_microtasks: Unit → Unit`
- `render: Unit → Unit`

The browser algebra **B** interprets `render` as the full WHATWG rendering pipeline. The Node.js algebra **N** interprets `render` as a no-op and adds operations `next_tick: Unit → Unit` and `poll_io: Unit → Unit`.

The symmetric difference between **B** and **N** consists of:

1. **Rendering**: Present in **B**, absent in **N**.
2. **Phases**: **N** has a fixed phase order; **B** has task-source priority but no explicit phases.
3. **nextTick**: Present in **N** as a higher-priority queue than microtasks; absent in **B**.
4. **I/O model**: **N** uses libuv's thread pool for file I/O; **B** uses OS-level async I/O via the browser's network process.

This symmetric diff explains why code that assumes phase ordering (e.g., relying on `setImmediate` after I/O) works in Node.js but not browsers, and why rendering-dependent code (e.g., `requestAnimationFrame`) is meaningless in Node.js.

### 11.5 Shared Memory as a Limit

In category theory, a limit is a universal cone over a diagram. The shared memory state in `SharedArrayBuffer` can be seen as a limit over the diagram of agent-local heaps. Each agent has a functor `H_i: Agent → Set` representing its local heap. The `SharedArrayBuffer` is the pullback (a type of limit) of these functors over the subset of shared memory locations.

The `Atomics` operations are the mediating morphisms of this limit. They ensure that the diagram commutes: if agent A writes to location `l` and agent B reads from `l`, the `Atomics.store` and `Atomics.load` morphisms compose to give a consistent result.

### 11.6 Trace Semantics and Observational Equivalence

Two JavaScript programs are observationally equivalent with respect to the event loop if they produce the same sequence of observable actions (console output, DOM mutations, network requests) for all possible event loop schedules. Formally, let `Tr(P)` be the set of all possible traces of program `P`. Then `P ≈ Q` if `Tr(P) = Tr(Q)`.

The event loop introduces non-determinism through task queue selection. This means that even deterministic programs can have multiple traces. For example:

```javascript
setTimeout(() => console.log('A'), 0);
setTimeout(() => console.log('B'), 0);
```

This program has two valid traces: `['A', 'B']` and `['B', 'A']`, because the HTML Standard permits the user agent to select either timer task first. However, if both timers are from the same source and have the same delay, most browsers process them in FIFO order. The standard does not guarantee this, so portable code must not rely on it.

Observational equivalence is coarser than syntactic equality. Two programs may be syntactically different but observationally equivalent if the event loop schedules hide the differences. For example, using `queueMicrotask` versus `Promise.resolve().then` produces observationally equivalent behavior in most contexts, though they may differ in edge cases involving thenable coercion.

### 11.7 Fixed Points and Event Loop Termination

A natural question is whether the event loop always terminates. In the general case, no: a program with `setInterval(..., 0)` will enqueue a new timer task on every iteration, preventing termination. However, we can characterize terminating programs as those where the set of pending tasks reaches a fixed point (emptiness) after finitely many iterations.

Formally, let `Pending: Sched → ℕ` be the function that counts the total number of pending tasks and microtasks. A program is **event-loop terminating** if there exists an `n` such that after `n` iterations of `Loop`, `Pending(Loop^n(s₀)) = 0`, where `s₀` is the initial state.

Programs that only use finite chains of Promises, finite timers, and finite I/O operations are event-loop terminating. Programs with infinite `setInterval` loops, recursive `process.nextTick`, or infinite microtask chains are not. This distinction is important for testing and formal verification: test frameworks must handle non-terminating event loops by injecting sentinel values or timeouts.

### 11.8 Functoriality of Agent Communication

Cross-agent communication (`postMessage`, `Atomics.notify`) can be modeled as a natural transformation between event loop functors. If `Loop_A` and `Loop_B` are the event loop functors of agents A and B, then a message from A to B is a morphism `m: Loop_A → Loop_B` in the category of functors. The `MessageChannel` API provides the unit and counit of an adjunction between agent event loops, allowing bidirectional communication.

`Atomics.notify` is a more constrained natural transformation: it only propagates wake-up signals, not arbitrary data. Its functoriality is captured by the fact that `Atomics.wait` followed by `Atomics.notify` is observationally equivalent to a no-op if the value matches, preserving the identity morphism.

## 12. Counter-Examples and Edge Cases

Robust understanding requires examining cases where intuition fails. This section collects counter-examples that violate common assumptions.

### 12.1 Counter-Example: Promise Resolution Order

Assumption: `Promise.resolve().then(f)` always defers `f` to a microtask.
Reality: If `Promise.resolve` is called with a thenable that resolves synchronously, the exact timing can vary between engines.

```javascript
const thenable = {
  then(resolve) {
    resolve(42);
  }
};

Promise.resolve(thenable).then(v => console.log('thenable resolved:', v));
Promise.resolve(1).then(v => console.log('direct resolved:', v));
```

In V8, the thenable resolution may enqueue additional microtasks, and the relative order between the two `then` handlers is engine-dependent in edge cases involving foreign thenables.

### 12.2 Counter-Example: Timer Clamping in Nested Contexts

Assumption: `setTimeout(fn, 0)` always fires after 0ms.
Reality: In browsers, nested timers (depth > 5) are clamped to 4ms minimum.

```javascript
function nestedTimeout(depth: number): void {
  if (depth > 10) return;
  const start = performance.now();
  setTimeout(() => {
    const elapsed = performance.now() - start;
    console.log(`Depth ${depth}: ${elapsed.toFixed(2)}ms`);
    nestedTimeout(depth + 1);
  }, 0);
}
nestedTimeout(0);
```

After depth 5, the elapsed time will be approximately 4ms, not 0ms.

### 12.3 Counter-Example: requestAnimationFrame During Page Hidden

Assumption: `requestAnimationFrame` callbacks fire at the display refresh rate.
Reality: When the page is hidden (e.g., in a background tab), `requestAnimationFrame` callbacks are typically paused entirely.

```javascript
let frames = 0;
function countFrames() {
  frames++;
  requestAnimationFrame(countFrames);
}
countFrames();

setInterval(() => {
  console.log('Frames in last second:', frames);
  frames = 0;
}, 1000);
```

When the tab is backgrounded, `frames` will drop to 0 despite the `setInterval` continuing.

### 12.4 Counter-Example: Atomics.wait on Main Thread

Assumption: `Atomics.wait` can be used anywhere `SharedArrayBuffer` is available.
Reality: `Atomics.wait` throws a `TypeError` on the main thread in browsers because blocking the main thread would freeze the UI.

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
try {
  Atomics.wait(view, 0, 0); // TypeError on main thread
} catch (e) {
  console.error(e); // "Atomics.wait cannot be called in this context"
}
```

### 12.5 Counter-Example: Microtask Starvation with MutationObserver

Assumption: MutationObserver is a safe, performant way to observe DOM changes.
Reality: If a MutationObserver callback mutates the DOM in a way that triggers itself, it can cause microtask starvation.

```javascript
const target = document.createElement('div');
let count = 0;
const observer = new MutationObserver(() => {
  if (count++ < 1000) {
    target.setAttribute('data-x', String(count));
  }
});
observer.observe(target, { attributes: true });
target.setAttribute('data-x', '0');
// This will enqueue 1000 microtasks before any macrotask or rendering
```

### 12.6 Counter-Example: Web Locks and Nested Acquisition

Assumption: `navigator.locks.request` can be called recursively for the same resource.
Reality: Nested acquisition of the same lock in the same context can deadlock if not using `{ mode: 'shared' }` carefully.

```javascript
await navigator.locks.request('resource', async lock1 => {
  console.log('Got lock1');
  // This will DEADLOCK if 'resource' is held exclusively:
  await navigator.locks.request('resource', async lock2 => {
    console.log('Got lock2'); // Never reached
  });
});
```

Web Locks do not support reentrancy for exclusive locks.

### 12.7 Counter-Example: postMessage Structured Clone Cost

Assumption: `postMessage` with a `SharedArrayBuffer` is free because no copy occurs.
Reality: While the `SharedArrayBuffer` itself is not copied, the surrounding message object (the "transfer list" wrapper) still undergoes structured clone serialization. For large composite objects with nested `ArrayBuffer`s, this can be expensive.

```javascript
const sab = new SharedArrayBuffer(1024 * 1024);
const hugeObject = { data: sab, metadata: new Array(10000).fill({ x: 1 }) };
worker.postMessage(hugeObject, [sab]);
// The metadata array is cloned, which may take milliseconds
```

### 12.8 Counter-Example: async/await and Error Stack Traces

Assumption: `await` preserves the full call stack for error reporting.
Reality: Before V8's zero-cost async stack traces, `await` would reset the stack trace at the await point. Even with modern engines, deep async stacks can be truncated or elided.

```javascript
async function deep() {
  await Promise.resolve();
  throw new Error('boom');
}
async function caller() {
  await deep();
}
caller().catch(e => console.log(e.stack));
// The stack may not include the original caller context across engine versions
```

### 12.9 Counter-Example: Promise.race with Never-Settling Promises

Assumption: `Promise.race` always resolves when the first promise resolves.
Reality: If a never-settling promise is in the race, memory is leaked because the other promises continue to hold their resolution handlers indefinitely.

```javascript
const never = new Promise(() => {});
const quick = Promise.resolve(42);
Promise.race([never, quick]).then(console.log);
// quick resolves, but 'never' retains its closure forever
```

This is particularly dangerous in long-running applications where `Promise.race` is used with timeouts.

### 12.10 Counter-Example: Event Listener Order and stopImmediatePropagation

Assumption: Event listeners for the same event on the same target always fire in the order they were added.
Reality: While this is true for standard `addEventListener` calls, `stopImmediatePropagation()` in an earlier listener prevents subsequent listeners from firing. Additionally, capture-phase listeners fire before bubble-phase listeners, and `once: true` listeners remove themselves after firing.

```javascript
element.addEventListener('click', () => console.log('A'));
element.addEventListener('click', (e) => { e.stopImmediatePropagation(); console.log('B'); });
element.addEventListener('click', () => console.log('C'));
// Only A and B fire; C is suppressed
```

## 13. Performance Optimization Patterns

### 13.1 Yielding to the Event Loop

For long-running computations, yield control periodically to allow input and rendering:

```typescript
async function chunkedProcess<T>(
  items: T[],
  processFn: (item: T) => void,
  chunkSize: number = 10
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    for (const item of chunk) {
      processFn(item);
    }
    if (i + chunkSize < items.length) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }
}
```

### 13.2 Scheduling with postTask

Use `scheduler.postTask` for work with different urgency levels:

```typescript
function scheduleWork<T>(
  work: () => T,
  priority: TaskPriority = 'user-visible'
): Promise<T> {
  if (typeof scheduler !== 'undefined' && 'postTask' in scheduler) {
    return (scheduler as any).postTask(work, { priority });
  }
  // Fallback to requestIdleCallback or setTimeout
  return new Promise(resolve => {
    if (priority === 'background' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => resolve(work()));
    } else {
      setTimeout(() => resolve(work()), 0);
    }
  });
}
```

### 13.3 Measuring INP with Event Loop Awareness

```typescript
class INPMonitor {
  private interactions: number[] = [];
  private observer: PerformanceObserver | null = null;

  start(): void {
    this.observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'event') {
          const duration = (entry as any).processingEnd - entry.startTime;
          this.interactions.push(duration);
        }
      }
    });
    this.observer.observe({ entryTypes: ['event'] as any, buffered: true });
  }

  getINP(): number {
    if (this.interactions.length === 0) return 0;
    const sorted = [...this.interactions].sort((a, b) => b - a);
    // INP is typically the 98th percentile or worst interaction
    return sorted[Math.floor(sorted.length * 0.02)] || sorted[0];
  }

  stop(): void {
    this.observer?.disconnect();
  }
}
```

### 13.4 Avoiding Layout Thrashing

Layout thrashing occurs when JavaScript alternates between reading layout properties and mutating the DOM, forcing synchronous layout recalculation.

```typescript
// BAD: interleaved read/write
function badUpdate(elements: HTMLElement[]): void {
  for (const el of elements) {
    const height = el.offsetHeight; // forces layout
    el.style.height = `${height * 2}px`; // invalidates layout
  }
}

// GOOD: batch reads, then batch writes
function goodUpdate(elements: HTMLElement[]): void {
  const heights = elements.map(el => el.offsetHeight); // read phase
  requestAnimationFrame(() => {
    elements.forEach((el, i) => {
      el.style.height = `${heights[i] * 2}px`; // write phase
    });
  });
}
```

### 13.5 Event Loop Testing Patterns

Testing asynchronous code requires controlling the event loop. Common patterns include:

**Pattern A: Flush Microtasks**

```typescript
function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => queueMicrotask(resolve));
}
```

**Pattern B: Advance Timers**

```typescript
function advanceTimers(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Pattern C: Wait for Animation Frame**

```typescript
function nextFrame(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve));
}
```

**Pattern D: Jest/Vitest Integration**

```typescript
// Use fake timers to control setTimeout/setInterval
jest.useFakeTimers();

async function runAllTimers(): Promise<void> {
  jest.runAllTimers();
  await flushMicrotasks();
}
```

These patterns are essential for deterministic testing of event loop-dependent code. Without them, tests may flake due to real timer variance or microtask ordering differences between environments.

### 13.6 Event Loop-Aware State Management

State management libraries like Redux, Zustand, and Pinia interact with the event loop through batching and subscription mechanisms. Redux traditionally uses `store.subscribe` to notify listeners synchronously, which can cause cascading updates. Modern implementations batch notifications to microtasks:

```typescript
function createBatchedStore<T>(reducer: (state: T, action: unknown) => T, initialState: T) {
  let state = initialState;
  let listeners: Array<() => void> = [];
  let scheduled = false;

  function notify() {
    scheduled = false;
    const currentListeners = listeners.slice();
    for (const listener of currentListeners) {
      listener();
    }
  }

  return {
    dispatch(action: unknown) {
      state = reducer(state, action);
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(notify);
      }
    },
    subscribe(listener: () => void) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    getState() { return state; },
  };
}
```

This pattern ensures that multiple synchronous dispatches result in a single notification batch, reducing layout thrashing and improving INP.

## 14. Decision Matrix: Choosing the Right Concurrency Primitive

| Scenario | Primitive | Priority | Risk |
|----------|-----------|----------|------|
| Immediate async continuation | `queueMicrotask` | Highest | Starvation |
| Defer to next tick | `setTimeout(fn, 0)` | Normal | 4ms clamp, low priority |
| UI update before paint | `requestAnimationFrame` | Rendering | Paused when hidden |
| Background data sync | `scheduler.postTask` (background) | Low | Cancellation needed |
| Critical user interaction | `scheduler.postTask` (user-blocking) | Highest | May starve other work |
| Cross-tab coordination | `Web Locks API` | N/A | Deadlock possible |
| Thread-parallel computation | `Web Worker` + `SharedArrayBuffer` | Parallel | Data races |
| Synchronization between threads | `Atomics.wait/notify` | Blocking | Main-thread restriction |
| Idle-time prefetch | `requestIdleCallback` | Lowest | May never run |
| Input-aware yielding | `isInputPending()` + `scheduler.yield()` | Preserved | Limited browser support |

## 15. Debugging and Profiling the Event Loop

Understanding the event loop is incomplete without tools to observe it in practice. Modern browsers and Node.js provide several mechanisms for inspecting event loop behavior.

### 15.1 Chrome DevTools Performance Panel

The Performance panel in Chrome DevTools records a trace of all event loop activity. Key features include:

- **Main thread track**: Visualizes tasks, microtasks, and rendering steps as flame charts. Long tasks are highlighted with red triangles.
- **JavaScript call stacks**: Shows exactly which functions executed during each task, enabling identification of long-task culprits.
- **Frame rendering**: Displays frame times and identifies dropped frames (those exceeding 16.6ms at 60Hz).
- **Long task annotations**: Tasks exceeding 50ms are flagged, with attribution to the responsible script.

To use the Performance panel effectively, start recording before the interaction of interest, trigger the interaction, and stop recording. Look for long blocks of uninterrupted JavaScript execution—these are long tasks that harm INP.

### 15.2 Node.js --prof and --prof-process

Node.js provides built-in CPU profiling via the `--prof` flag. This generates a V8 log file that can be processed with `--prof-process` to produce a human-readable profile.

```bash
node --prof app.js
node --prof-process isolate-0x*.log > profile.txt
```

The output shows tick counts per function, helping identify hot paths that consume main-thread time. However, `--prof` does not directly show event loop latency. For that, use `clinic.js` or `0x`.

### 15.3 clinic.js and Bubbleprof

`clinic.js` is a suite of profiling tools for Node.js. `clinic bubbleprof` visualizes asynchronous flow across the event loop, showing where time is spent in callbacks, promises, and I/O operations. It generates an HTML report with interactive bubble charts representing event loop activity.

### 15.4 PerformanceObserver and User Timing

The `PerformanceObserver` API allows JavaScript code to observe its own event loop behavior:

```typescript
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry.duration, 'ms');
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

The User Timing API (`performance.mark` and `performance.measure`) allows developers to annotate specific code regions and measure their duration within the event loop context. These marks appear in Chrome DevTools alongside native event loop tasks.

### 15.5 Node.js Event Loop Lag

Event loop lag is the duration between scheduling a callback and its execution. In Node.js, it can be measured as:

```typescript
function measureEventLoopLag(): Promise<number> {
  const start = process.hrtime.bigint();
  return new Promise(resolve => {
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1e6; // ms
      resolve(lag);
    });
  });
}
```

High event loop lag (>10ms consistently) indicates that the main thread is overloaded with synchronous work. Monitoring this metric in production (via libraries like `event-loop-lag`) is essential for Node.js server health.

## 16. Future Directions and Emerging APIs

The JavaScript concurrency landscape continues to evolve. Several proposals and emerging APIs warrant attention:

### 15.1 Async Context

The Async Context proposal (previously AsyncLocalStorage) provides a way to propagate context through asynchronous operations without explicit parameter passing. This is crucial for tracing, logging, and request-scoped state in asynchronous call graphs.

### 15.2 Explicit Resource Management

The `using` declaration and `Symbol.dispose`/`Symbol.asyncDispose` proposals enable deterministic cleanup of resources, including event loop subscriptions and locks.

### 15.3 Promise.withResolvers

Standardized as `Promise.withResolvers()`, this utility simplifies manual promise construction—a common pattern in task scheduling and synchronization.

### 15.4 SharedArrayBuffer Evolution

Following the Spectre/Meltdown mitigations, `SharedArrayBuffer` requires cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`). Future standards may relax these requirements with safer defaults while preserving the shared-memory concurrency model.

### 15.5 scheduler.yield() Standardization

`scheduler.yield()` is progressing through the standards track. Once widely available, it will replace many ad-hoc yielding patterns and provide a unified, priority-preserving yield primitive.

### 15.6 WebAssembly Threads

WebAssembly Threads extends the WebAssembly specification with shared memory and atomic operations, closely mirroring JavaScript's `SharedArrayBuffer` and `Atomics` model. Wasm threads run on separate Web Workers and communicate via shared linear memory. The integration with JavaScript's event loop occurs through `postMessage` and shared memory access. As WebAssembly becomes more prevalent for compute-intensive tasks (image processing, physics simulation, cryptography), understanding the interaction between Wasm threads and the JavaScript event loop becomes essential. Wasm modules can spawn threads that run independently of the main thread's event loop, but callbacks into JavaScript must still be scheduled as tasks on the appropriate event loop.

### 15.7 Temporal API and High-Resolution Scheduling

The Temporal API proposal introduces modern date/time handling to JavaScript. While not directly an event loop feature, it includes high-resolution duration types that can improve timer precision. Combined with `scheduler.postTask()`, Temporal durations could enable more precise scheduling for animations, media synchronization, and scientific simulations that require sub-millisecond accuracy.

### 15.8 Standardization of isInputPending

`navigator.scheduling.isInputPending()` is currently implemented in Chromium but not standardized across all browsers. Standardization would provide a reliable signal for input-aware yielding, reducing the need for heuristic-based approaches (such as yielding every N milliseconds). A standardized `isInputPending` with consistent behavior across browsers would be a significant win for interactive applications.

## 16. References

1. **WHATWG HTML Standard - Event Loops**: <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops>
2. **ECMAScript Specification - Jobs and Job Queues**: <https://tc39.es/ecma262/#sec-jobs-and-job-queues>
3. **ECMAScript Shared Memory and Atomics**: <https://tc39.es/ecma262/#sec-shared-memory>
4. **Node.js Event Loop Documentation**: <https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/>
5. **libuv Design Overview**: <http://docs.libuv.org/en/v1.x/design.html>
6. **V8 Blog - TurboFan**: <https://v8.dev/docs/turbofan>
7. **V8 Blog - Orinoco GC**: <https://v8.dev/blog/orinoco>
8. **Google Developers - Optimize INP**: <https://web.dev/articles/optimize-inp>
9. **Google Developers - Total Blocking Time**: <https://web.dev/articles/tbt>
10. **W3C Prioritized Task Scheduling**: <https://wicg.github.io/scheduling-apis/>
11. **W3C Web Locks API**: <https://w3c.github.io/web-locks/>
12. **MDN - Atomics**: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics>
13. **MDN - SharedArrayBuffer**: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer>
14. **Philip Roberts - "What the heck is the event loop anyway?"**: <https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html>
15. **Jake Archibald - "Tasks, microtasks, queues and schedules"**: <https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/>
16. **Domenic Denicola - "The Node.js Event Loop, Timers, and process.nextTick()"**: <https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick>
17. **Surma - "Is postMessage slow?"**: <https://surma.dev/things/is-postmessage-slow/>
18. **V8 Blog - "Faster async functions and promises"**: <https://v8.dev/blog/fast-async>
19. **W3C - Cooperative Scheduling of Background Tasks**: <https://www.w3.org/TR/requestidlecallback/>
20. **Chrome Platform Status - scheduler.yield()**: <https://chromestatus.com/feature/6266249336586240>

## 17. Glossary

**Agent**: A set of JavaScript execution contexts that share an execution thread and an event loop. Types include window agents, dedicated worker agents, and worklet agents.

**Agent Cluster**: A group of agents that can share memory via `SharedArrayBuffer`. Agents in different clusters are fully isolated.

**Atomics**: A global object providing atomic operations on shared memory, including `load`, `store`, `add`, `compareExchange`, `wait`, and `notify`.

**Blocking Time**: The duration of a task that exceeds 50ms. Total Blocking Time (TBT) sums these excess durations.

**Categorical Semantics**: The use of category theory (functors, natural transformations, limits) to model programming language semantics.

**Concurrent Compilation**: The compilation of JavaScript to optimized machine code on a background thread while the main thread continues execution.

**Cooperative Scheduling**: A scheduling model where tasks voluntarily yield control, rather than being preempted by the operating system.

**Data Race**: Two unsynchronized accesses to the same memory location, at least one of which is a write.

**Event Loop**: The scheduling mechanism that coordinates task execution, microtask processing, and rendering updates in JavaScript environments.

**Futex**: Fast Userspace muTEX, a low-level synchronization primitive implemented by `Atomics.wait` and `Atomics.notify`.

**Happens-Before**: A partial order on memory operations. If A happens-before B, then the effects of A are visible to B.

**INP (Interaction to Next Paint)**: A Core Web Vital measuring the latency from user interaction to the next frame paint.

**Job Queue**: The ECMAScript term for the microtask queue.

**Kleene Star**: In formal language theory, the operation that repeats a pattern zero or more times. Applied to microtasks, it represents the fully-drained microtask checkpoint.

**Layout Thrashing**: Alternating between reading layout properties and mutating the DOM, forcing synchronous reflow.

**libuv**: The C library that provides Node.js's event loop and asynchronous I/O capabilities.

**Limit**: In category theory, a universal cone over a diagram. Used here to model shared memory as a limit over agent-local heaps.

**Macrotask**: A task processed by the event loop's main task queues. One macrotask runs per loop iteration.

**Microtask**: A high-priority task processed in a checkpoint after each macrotask and before rendering. The microtask queue is fully drained.

**Monad**: A design pattern in category theory and functional programming representing computations in a context. Promises and async operations form monads.

**MutationObserver**: A legacy API that observes DOM mutations and fires callbacks as microtasks.

**Natural Transformation**: A morphism between functors. Used here to model relationships between scheduling functors.

**Observational Equivalence**: Two programs are observationally equivalent if they produce the same observable behavior for all inputs and schedules.

**On-Stack Replacement (OSR)**: A V8 optimization technique that switches executing code from unoptimized to optimized mid-loop.

**Phase (libuv)**: A distinct stage in the Node.js event loop (timers, pending callbacks, poll, check, close callbacks).

**Presheaf**: A functor from a category of open sets to a category of values. Used here to model memory locations and their values.

**Priority Inversion**: A situation where a high-priority task is blocked by a low-priority task due to cooperative scheduling.

**Promise**: An object representing the eventual completion or failure of an asynchronous operation, with `then`, `catch`, and `finally` handlers queued as microtasks.

**Race Condition**: A bug that occurs when the behavior of a program depends on the relative timing of events.

**Rendering**: The browser process of converting the DOM and CSS into pixels on the screen, including style, layout, paint, and composite steps.

**Run-to-Completion**: The property that a JavaScript function executes entirely before any other function begins.

**Sequential Consistency**: A memory model where all agents agree on a single total order of operations.

**SharedArrayBuffer**: An array buffer that can be shared between multiple threads without copying.

**Spinlock**: A lock that waits by repeatedly checking a condition, consuming CPU until the lock is available.

**Starvation**: A condition where a task is perpetually delayed because other tasks monopolize the event loop.

**Structured Clone**: The algorithm used by `postMessage` to copy JavaScript values between contexts.

**Symmetric Diff**: In this document, a structured comparison highlighting differences between two systems (browser vs. Node.js, microtasks vs. macrotasks).

**Task Queue**: A FIFO queue associated with a task source, holding macrotasks waiting to execute.

**Task Source**: A category of tasks (DOM manipulation, user interaction, networking, timers, etc.) that share a queue.

**TBT (Total Blocking Time)**: The sum of blocking time beyond 50ms for all long tasks between FCP and TTI.

**Transfer List**: An array of `ArrayBuffer` and `MessagePort` objects passed to `postMessage` that are moved rather than cloned.

**TurboFan**: V8's highest-tier optimizing compiler, using advanced techniques like type speculation and escape analysis.

**UV_THREADPOOL_SIZE**: The environment variable controlling Node.js's libuv thread pool size for file I/O and DNS.

**Web Locks API**: An API for coordinating resource access across same-origin browsing contexts.

**Well-Foundedness**: A property of relations ensuring no infinite descending chains. Assumed for microtask enqueueing to guarantee termination.

**WHATWG**: The Web Hypertext Application Technology Working Group, maintainers of the HTML Standard including the event loop specification.

**Worker**: A thread that runs JavaScript code independently of the main thread, with its own event loop and heap.

**Yielding**: Voluntarily pausing a long task to allow the event loop to process other work.

---

*Document generated for the JavaScript/TypeScript theoretical foundations knowledge base project. This document provides a comprehensive, specification-grounded analysis of the JavaScript event loop and concurrency model, accompanied by production-ready TypeScript utilities for simulation, visualization, profiling, and scheduling.*
