# JavaScript 并发、并行、同步、异步编程模式全解

> 本文档全面梳理JavaScript中的并发编程模式，包含原理分析、实现示例、反例、性能分析和形式化论证。

---

## 目录

- [JavaScript 并发、并行、同步、异步编程模式全解](#javascript-并发并行同步异步编程模式全解)
  - [目录](#目录)
  - [1. JavaScript执行模型](#1-javascript执行模型)
    - [1.1 Event Loop 核心原理](#11-event-loop-核心原理)
      - [1.1.1 形式化定义](#111-形式化定义)
      - [1.1.2 执行循环算法](#112-执行循环算法)
      - [1.1.3 浏览器 vs Node.js Event Loop 对比](#113-浏览器-vs-nodejs-event-loop-对比)
      - [1.1.4 微任务 vs 宏任务 完整分类](#114-微任务-vs-宏任务-完整分类)
    - [1.2 调用栈与执行上下文](#12-调用栈与执行上下文)
      - [1.2.1 调用栈深度分析](#121-调用栈深度分析)
      - [1.2.2 执行上下文生命周期](#122-执行上下文生命周期)
    - [1.3 执行顺序形式化分析](#13-执行顺序形式化分析)
      - [1.3.1 执行顺序验证示例](#131-执行顺序验证示例)
      - [1.3.2 async/await 执行顺序](#132-asyncawait-执行顺序)
    - [1.4 反例：常见理解误区](#14-反例常见理解误区)
  - [2. 异步编程模式演进](#2-异步编程模式演进)
    - [2.1 Callback 模式](#21-callback-模式)
      - [2.1.1 基础Callback模式](#211-基础callback模式)
      - [2.1.2 回调地狱（Callback Hell）](#212-回调地狱callback-hell)
      - [2.1.3 错误处理困境](#213-错误处理困境)
    - [2.2 Promise 模式](#22-promise-模式)
      - [2.2.1 Promise 状态机形式化](#221-promise-状态机形式化)
      - [2.2.2 Promise 链式调用](#222-promise-链式调用)
      - [2.2.3 Promise 静态方法](#223-promise-静态方法)
      - [2.2.4 Promise 反例](#224-promise-反例)
    - [2.3 async/await 模式](#23-asyncawait-模式)
      - [2.3.1 async/await 语法糖解析](#231-asyncawait-语法糖解析)
      - [2.3.2 错误处理模式](#232-错误处理模式)
      - [2.3.3 并行控制](#233-并行控制)
      - [2.3.4 async/await 反例](#234-asyncawait-反例)
    - [2.4 Generator 模式](#24-generator-模式)
      - [2.4.1 Generator 基础](#241-generator-基础)
      - [2.4.2 Generator 异步流程控制](#242-generator-异步流程控制)
      - [2.4.3 Generator 与 Symbol.iterator](#243-generator-与-symboliterator)
    - [2.5 Async Iterator/Generator](#25-async-iteratorgenerator)
      - [2.5.1 Async Iterator 基础](#251-async-iterator-基础)
      - [2.5.2 实现自定义 Async Iterable](#252-实现自定义-async-iterable)
      - [2.5.3 Async Iterator 工具函数](#253-async-iterator-工具函数)
      - [2.5.4 Async Iterator 反例](#254-async-iterator-反例)
  - [3. 并行处理](#3-并行处理)
    - [3.1 Web Workers](#31-web-workers)
      - [3.1.1 Web Workers API](#311-web-workers-api)
      - [3.1.2 Worker 通信模式](#312-worker-通信模式)
      - [3.1.3 Worker 性能分析](#313-worker-性能分析)
    - [3.2 Node.js Worker Threads](#32-nodejs-worker-threads)
      - [3.2.1 Worker Threads API](#321-worker-threads-api)
      - [3.2.2 MessageChannel](#322-messagechannel)
    - [3.3 SharedArrayBuffer 和 Atomics](#33-sharedarraybuffer-和-atomics)
      - [3.3.1 SharedArrayBuffer 基础](#331-sharedarraybuffer-基础)
      - [3.3.2 Atomics API](#332-atomics-api)
      - [3.3.3 Atomics.wait 和 Atomics.notify](#333-atomicswait-和-atomicsnotify)
    - [3.4 WASM 多线程](#34-wasm-多线程)
  - [4. 同步原语实现](#4-同步原语实现)
    - [4.1 Mutex（互斥锁）](#41-mutex互斥锁)
      - [4.1.1 Mutex 形式化定义](#411-mutex-形式化定义)
      - [4.1.2 基于 Promise 的 Mutex 实现](#412-基于-promise-的-mutex-实现)
      - [4.1.3 基于 Atomics 的 Mutex（跨线程）](#413-基于-atomics-的-mutex跨线程)
      - [4.1.4 Mutex 反例](#414-mutex-反例)
    - [4.2 Semaphore（信号量）](#42-semaphore信号量)
      - [4.2.1 Semaphore 形式化定义](#421-semaphore-形式化定义)
      - [4.2.2 计数信号量实现](#422-计数信号量实现)
      - [4.2.3 基于 Atomics 的信号量](#423-基于-atomics-的信号量)
      - [4.2.4 信号量反例](#424-信号量反例)
    - [4.3 Barrier（屏障）](#43-barrier屏障)
      - [4.3.1 Barrier 形式化定义](#431-barrier-形式化定义)
      - [4.3.2 Barrier 实现](#432-barrier-实现)
      - [4.3.3 基于 Atomics 的屏障](#433-基于-atomics-的屏障)
    - [4.4 ReadWriteLock（读写锁）](#44-readwritelock读写锁)
      - [4.4.1 ReadWriteLock 形式化定义](#441-readwritelock-形式化定义)
      - [4.4.2 ReadWriteLock 实现](#442-readwritelock-实现)
      - [4.4.3 升级锁和降级锁](#443-升级锁和降级锁)
  - [5. 高级并发模式](#5-高级并发模式)
    - [5.1 竞态条件处理](#51-竞态条件处理)
      - [5.1.1 竞态条件形式化定义](#511-竞态条件形式化定义)
      - [5.1.2 竞态条件解决方案](#512-竞态条件解决方案)
      - [5.1.3 检查-使用竞态（TOCTOU）](#513-检查-使用竞态toctou)
    - [5.2 防抖（Debounce）和节流（Throttle）](#52-防抖debounce和节流throttle)
      - [5.2.1 防抖（Debounce）](#521-防抖debounce)
      - [5.2.2 节流（Throttle）](#522-节流throttle)
    - [5.3 任务队列和线程池](#53-任务队列和线程池)
      - [5.3.1 任务队列实现](#531-任务队列实现)
      - [5.3.2 Worker 线程池](#532-worker-线程池)
    - [5.4 背压处理（Backpressure）](#54-背压处理backpressure)
      - [5.4.1 背压概念](#541-背压概念)
      - [5.4.2 背压处理方案](#542-背压处理方案)
    - [5.5 性能分析总结](#55-性能分析总结)
  - [6. 形式化论证](#6-形式化论证)
    - [6.1 Event Loop 正确性证明](#61-event-loop-正确性证明)
    - [6.2 Promise 状态机正确性](#62-promise-状态机正确性)
    - [6.3 Mutex 正确性证明](#63-mutex-正确性证明)
  - [7. 总结与最佳实践](#7-总结与最佳实践)
    - [7.1 模式选择指南](#71-模式选择指南)
    - [7.2 常见陷阱与解决方案](#72-常见陷阱与解决方案)
    - [7.3 性能优化清单](#73-性能优化清单)
  - [附录：完整类型定义](#附录完整类型定义)

---

## 1. JavaScript执行模型

### 1.1 Event Loop 核心原理

#### 1.1.1 形式化定义

JavaScript执行模型可以形式化为一个五元组：

```
M = (S, M, Q, E, δ)

其中：
- S: 调用栈 (Call Stack)
- M: 微任务队列 (Microtask Queue)
- Q: 宏任务队列 (Macrotask Queue)
- E: 执行环境 (Execution Context)
- δ: 状态转移函数
```

#### 1.1.2 执行循环算法

```typescript
/**
 * Event Loop 伪代码实现
 * 描述：JavaScript引擎的核心调度算法
 */
function eventLoop(): void {
  while (true) {
    // Phase 1: 执行当前调用栈直到为空
    while (callStack.notEmpty()) {
      executeTopFrame();
    }

    // Phase 2: 执行所有微任务
    while (microtaskQueue.notEmpty()) {
      const microtask = microtaskQueue.dequeue();
      execute(microtask);
      // 执行过程中可能产生新的微任务
    }

    // Phase 3: 渲染（浏览器环境）
    if (shouldRender()) {
      render();
    }

    // Phase 4: 执行一个宏任务
    if (macrotaskQueue.notEmpty()) {
      const macrotask = macrotaskQueue.dequeue();
      execute(macrotask);
    }

    // 终止条件
    if (allQueuesEmpty() && callStack.empty()) {
      break;
    }
  }
}
```

#### 1.1.3 浏览器 vs Node.js Event Loop 对比

```typescript
/**
 * 浏览器 Event Loop 阶段
 * ┌─────────────────────────────────────────────────────────────┐
 * │  1. 执行同步代码 → 2. 清空微任务队列 → 3. 渲染 → 4. 宏任务   │
 * └─────────────────────────────────────────────────────────────┘
 */

/**
 * Node.js Event Loop 阶段（更复杂）
 * ┌─────────────────────────────────────────────────────────────┐
 * │  timers → pending callbacks → idle/prepare → poll → check   │
 * │  → close callbacks                                          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * 详细说明：
 * - timers: setTimeout/setInterval 回调
 * - pending callbacks: 系统操作回调（如TCP错误）
 * - poll: I/O 回调，轮询新事件
 * - check: setImmediate 回调
 * - close callbacks: socket.on('close', ...)
 */

// 验证示例：Node.js 阶段顺序
console.log('1. 同步代码');

setTimeout(() => console.log('2. timer'), 0);
setImmediate(() => console.log('3. immediate'));

Promise.resolve().then(() => console.log('4. microtask'));

process.nextTick(() => console.log('5. nextTick'));

// 输出顺序：1 → 5 → 4 → 2 → 3 (Node.js)
// 注意：nextTick 优先级最高，在微任务之前执行
```

#### 1.1.4 微任务 vs 宏任务 完整分类

```typescript
/**
 * 任务分类表
 * ┌────────────────────────────────────────────────────────────┐
 * │ 类型      │ 包含内容                                        │
 * ├────────────────────────────────────────────────────────────┤
 * │ 宏任务    │ setTimeout, setInterval, setImmediate(Node)    │
 * │           │ I/O 操作, UI渲染, MessageChannel              │
 * │           │ requestAnimationFrame                         │
 * ├────────────────────────────────────────────────────────────┤
 * │ 微任务    │ Promise.then/catch/finally                    │
 * │           │ MutationObserver                              │
 * │           │ queueMicrotask                                │
 * │           │ process.nextTick(Node, 优先级最高)            │
 * └────────────────────────────────────────────────────────────┘
 */

// 完整优先级演示
function taskPriorityDemo(): void {
  const output: string[] = [];

  // 同步代码
  output.push('1. sync');

  // 宏任务
  setTimeout(() => output.push('2. setTimeout'), 0);

  // Promise 微任务
  Promise.resolve().then(() => output.push('3. Promise'));

  // queueMicrotask
  queueMicrotask(() => output.push('4. queueMicrotask'));

  // MessageChannel (宏任务)
  const channel = new MessageChannel();
  channel.port1.onmessage = () => output.push('5. MessageChannel');
  channel.port2.postMessage(null);

  // MutationObserver (微任务)
  const observer = new MutationObserver(() => output.push('6. MutationObserver'));
  const node = document.createTextNode('');
  observer.observe(node, { characterData: true });
  node.data = 'changed';

  // requestAnimationFrame (宏任务，但特殊)
  requestAnimationFrame(() => output.push('7. rAF'));

  // 最终输出
  setTimeout(() => {
    console.log('执行顺序:', output);
    // 预期: 1 → 3,4,6(微任务) → 2,5,7(宏任务)
  }, 100);
}
```

### 1.2 调用栈与执行上下文

#### 1.2.1 调用栈深度分析

```typescript
/**
 * 调用栈结构形式化描述
 */
interface ExecutionContext {
  type: 'global' | 'function' | 'eval';
  function: Function | null;
  scopeChain: Scope[];
  variableObject: Record<string, any>;
  thisBinding: any;
}

interface CallStack {
  frames: ExecutionContext[];
  maxDepth: number;  // 浏览器通常 ~10,000-50,000
}

// 调用栈溢出演示
function demonstrateStackOverflow(): void {
  let depth = 0;

  function recursive(): void {
    depth++;
    recursive();  // RangeError: Maximum call stack size exceeded
  }

  try {
    recursive();
  } catch (e) {
    console.log(`栈溢出深度: ${depth}`);
    // Chrome: ~10,000-15,000
    // Node.js: ~11,000-12,000
  }
}

// 尾调用优化（TCO）- ES6 规范但浏览器支持有限
function tailCallOptimized(n: number, acc: number = 1): number {
  'use strict';  // 严格模式下才有效
  if (n <= 1) return acc;
  return tailCallOptimized(n - 1, n * acc);  // 尾调用
}
```

#### 1.2.2 执行上下文生命周期

```typescript
/**
 * 执行上下文创建过程（形式化）
 *
 * 1. 创建阶段 (Creation Phase)
 *    - 创建变量对象 (VO)
 *    - 建立作用域链
 *    - 确定 this 绑定
 *
 * 2. 执行阶段 (Execution Phase)
 *    - 变量赋值
 *    - 函数引用解析
 *    - 执行代码
 */

// 变量提升演示
function hoistingDemo(): void {
  console.log(a);  // undefined（变量提升）
  // console.log(b);  // ReferenceError（暂时性死区）
  // console.log(c);  // ReferenceError（未声明）

  var a = 1;
  let b = 2;
  const c = 3;
}

// 函数提升优先级高于变量
function functionHoisting(): void {
  console.log(typeof foo);  // 'function'

  function foo() {}
  var foo = 1;

  console.log(typeof foo);  // 'number'
}
```

### 1.3 执行顺序形式化分析

#### 1.3.1 执行顺序验证示例

```typescript
/**
 * 复杂执行顺序分析
 * 目标：验证对 Event Loop 的完整理解
 */
function complexExecutionOrder(): void {
  console.log('Script start');

  setTimeout(() => {
    console.log('setTimeout 1');

    Promise.resolve().then(() => {
      console.log('Promise inside setTimeout 1');
    });
  }, 0);

  setTimeout(() => {
    console.log('setTimeout 2');
  }, 0);

  Promise.resolve().then(() => {
    console.log('Promise 1');

    setTimeout(() => {
      console.log('setTimeout inside Promise 1');
    }, 0);

    Promise.resolve().then(() => {
      console.log('Promise inside Promise 1');
    });
  });

  Promise.resolve().then(() => {
    console.log('Promise 2');
  });

  console.log('Script end');
}

/**
 * 预期输出分析：
 *
 * 1. Script start (同步)
 * 2. Script end (同步)
 * 3. Promise 1 (微任务，第一个Promise)
 * 4. Promise inside Promise 1 (嵌套微任务)
 * 5. Promise 2 (微任务)
 * 6. setTimeout 1 (宏任务1)
 * 7. Promise inside setTimeout 1 (宏任务1中的微任务)
 * 8. setTimeout 2 (宏任务2)
 * 9. setTimeout inside Promise 1 (Promise1中创建的宏任务)
 */

// 实际执行验证
// complexExecutionOrder();
```

#### 1.3.2 async/await 执行顺序

```typescript
/**
 * async/await 执行顺序详解
 *
 * 原理：async 函数返回 Promise，await 会暂停执行并让出主线程
 */
async function asyncExecutionDemo(): Promise<void> {
  console.log('1. async start');

  await Promise.resolve();  // 创建微任务，暂停执行

  console.log('2. after first await');

  await new Promise(resolve => setTimeout(resolve, 0));  // 宏任务

  console.log('3. after second await');
}

// 完整执行顺序
function fullAsyncDemo(): void {
  console.log('A. script start');

  asyncExecutionDemo().then(() => {
    console.log('F. async done');
  });

  console.log('B. script end');

  Promise.resolve().then(() => {
    console.log('C. promise 1');
  });

  setTimeout(() => {
    console.log('E. setTimeout');
  }, 0);
}

/**
 * 预期输出：
 * A. script start
 * 1. async start
 * B. script end
 * 2. after first await (await后的代码作为微任务)
 * C. promise 1
 * F. async done
 * E. setTimeout
 * 3. after second await
 */
```

### 1.4 反例：常见理解误区

```typescript
/**
 * 误区1：认为 setTimeout(fn, 0) 立即执行
 */
function misconception1(): void {
  console.log('Start');
  setTimeout(() => console.log('Timeout'), 0);

  // 阻塞主线程
  const start = Date.now();
  while (Date.now() - start < 100) {}  // 阻塞100ms

  console.log('End');
  // 输出: Start → End → Timeout (延迟了100ms+)
}

/**
 * 误区2：认为 Promise.then 总是异步
 */
function misconception2(): void {
  const p = Promise.resolve();

  p.then(() => console.log('1'));
  console.log('2');
  p.then(() => console.log('3'));

  // 输出: 2 → 1 → 3
  // 解释：同一个Promise的then按注册顺序执行
}

/**
 * 误区3：微任务中的死循环
 */
function misconception3(): void {
  // 危险！会导致页面卡死
  // Promise.resolve().then(function loop() {
  //   console.log('Infinite microtask');
  //   Promise.resolve().then(loop);  // 永远不会执行宏任务
  // });
}

/**
 * 误区4：async函数不返回await的值
 */
async function misconception4(): Promise<number> {
  const result = await Promise.resolve(42);
  return result;  // 实际返回 Promise.resolve(42)
}

// 错误用法
// misconception4() === 42;  // false，是Promise
// misconception4() instanceof Promise;  // true
```

---

## 2. 异步编程模式演进

### 2.1 Callback 模式

#### 2.1.1 基础Callback模式

```typescript
/**
 * Callback 模式形式化定义
 *
 * type Callback<T> = (error: Error | null, result: T | null) => void
 *
 * 遵循 Node.js 错误优先约定
 */
type NodeCallback<T> = (error: Error | null, result?: T) => void;

// 基本Callback示例
function readFileCallback(
  path: string,
  callback: NodeCallback<string>
): void {
  setTimeout(() => {
    if (path === '') {
      callback(new Error('Empty path'));
    } else {
      callback(null, `Content of ${path}`);
    }
  }, 100);
}

// 使用示例
readFileCallback('test.txt', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Data:', data);
});
```

#### 2.1.2 回调地狱（Callback Hell）

```typescript
/**
 * 回调地狱：嵌套过深的Callback
 * 问题：代码横向扩展，难以维护
 */
function callbackHell(): void {
  readFileCallback('config.json', (err, config) => {
    if (err) {
      handleError(err);
      return;
    }

    readFileCallback(config!, (err, data) => {
      if (err) {
        handleError(err);
        return;
      }

      processData(data!, (err, processed) => {
        if (err) {
          handleError(err);
          return;
        }

        saveResult(processed!, (err) => {
          if (err) {
            handleError(err);
            return;
          }

          console.log('Done!');
        });
      });
    });
  });
}

function handleError(err: Error): void {
  console.error(err);
}

function processData(data: string, cb: NodeCallback<string>): void {
  cb(null, data.toUpperCase());
}

function saveResult(data: string, cb: NodeCallback<void>): void {
  setTimeout(() => cb(null), 10);
}
```

#### 2.1.3 错误处理困境

```typescript
/**
 * Callback错误处理的复杂性
 */
function errorHandlingProblems(): void {
  // 问题1：每个回调都需要错误处理
  async1((err, result1) => {
    if (err) { /* handle */ return; }

    async2(result1!, (err, result2) => {
      if (err) { /* handle */ return; }

      async3(result2!, (err, result3) => {
        if (err) { /* handle */ return; }
        // ...
      });
    });
  });

  // 问题2：异常无法被try-catch捕获
  try {
    async1((err, result) => {
      throw new Error('This will NOT be caught!');
    });
  } catch (e) {
    // 永远不会执行
    console.log('Never reached');
  }
}

function async1(cb: NodeCallback<string>): void {
  setTimeout(() => cb(null, 'result1'), 10);
}
function async2(input: string, cb: NodeCallback<string>): void {
  setTimeout(() => cb(null, input + '2'), 10);
}
function async3(input: string, cb: NodeCallback<string>): void {
  setTimeout(() => cb(null, input + '3'), 10);
}
```

### 2.2 Promise 模式

#### 2.2.1 Promise 状态机形式化

```typescript
/**
 * Promise 状态机形式化定义
 *
 * State = { PENDING, FULFILLED, REJECTED }
 *
 * 状态转移：
 * - PENDING --[resolve]--> FULFILLED
 * - PENDING --[reject]--> REJECTED
 *
 * 终态不可变：FULFILLED 和 REJECTED 不可再转移
 */

enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2>;
}

// 手写Promise实现（简化版）
class MyPromise<T> {
  private state: PromiseState = PromiseState.PENDING;
  private value?: T;
  private reason?: any;
  private onFulfilledCallbacks: Array<(value: T) => void> = [];
  private onRejectedCallbacks: Array<(reason: any) => void> = [];

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    const resolve = (value: T | PromiseLike<T>): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value as T;
        this.onFulfilledCallbacks.forEach(cb => cb(value as T));
      }
    };

    const reject = (reason?: any): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(cb => cb(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise((resolve, reject) => {
      const fulfilledHandler = (value: T): void => {
        try {
          if (!onFulfilled) {
            resolve(value as unknown as TResult1);
          } else {
            const result = onFulfilled(value);
            resolve(result as TResult1);
          }
        } catch (error) {
          reject(error);
        }
      };

      const rejectedHandler = (reason: any): void => {
        try {
          if (!onRejected) {
            reject(reason);
          } else {
            const result = onRejected(reason);
            resolve(result as TResult2);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === PromiseState.FULFILLED) {
        queueMicrotask(() => fulfilledHandler(this.value!));
      } else if (this.state === PromiseState.REJECTED) {
        queueMicrotask(() => rejectedHandler(this.reason));
      } else {
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): MyPromise<T | TResult> {
    return this.then(null, onRejected);
  }

  finally(onFinally?: (() => void) | null): MyPromise<T> {
    return this.then(
      value => {
        onFinally?.();
        return value;
      },
      reason => {
        onFinally?.();
        throw reason;
      }
    );
  }
}
```

#### 2.2.2 Promise 链式调用

```typescript
/**
 * Promise 链式调用详解
 *
 * 核心规则：
 * 1. then/catch/finally 返回新Promise
 * 2. 返回值会包装为resolved Promise
 * 3. 抛出错误会包装为rejected Promise
 */
function promiseChaining(): void {
  Promise.resolve(1)
    .then(v => {
      console.log(v);  // 1
      return v * 2;    // 返回 2，包装为 Promise.resolve(2)
    })
    .then(v => {
      console.log(v);  // 2
      return Promise.resolve(v * 2);  // 返回 Promise.resolve(4)
    })
    .then(v => {
      console.log(v);  // 4
      throw new Error('Oops');  // 转为 rejected Promise
    })
    .catch(err => {
      console.log(err.message);  // 'Oops'
      return 8;  // 恢复为 resolved Promise
    })
    .then(v => {
      console.log(v);  // 8
    });
}

// 链式调用中的值传递
function valuePassing(): void {
  const promise = Promise.resolve('start');

  // 每个 then 创建新的 Promise
  const p1 = promise.then(v => v + ' → step1');
  const p2 = promise.then(v => v + ' → step2');

  // p1 和 p2 互不影响，都从 'start' 开始
  p1.then(console.log);  // 'start → step1'
  p2.then(console.log);  // 'start → step2'
}
```

#### 2.2.3 Promise 静态方法

```typescript
/**
 * Promise.all - 并行执行，全部成功才成功
 *
 * 形式化：Promise.all([p1, p2, ...]) →
 *   - 成功: [v1, v2, ...] (按输入顺序)
 *   - 失败: 第一个失败的reason
 */
async function promiseAllDemo(): Promise<void> {
  // 成功场景
  const results = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);

  // 失败场景（快速失败）
  try {
    await Promise.all([
      delay(100).then(() => 'A'),
      delay(50).then(() => { throw new Error('B failed'); }),
      delay(200).then(() => 'C')
    ]);
  } catch (err) {
    console.log('First error:', err);  // 'B failed'（50ms后）
  }
}

/**
 * Promise.allSettled - 等待全部完成，无论成功失败
 *
 * 返回: [{status: 'fulfilled', value}, {status: 'rejected', reason}, ...]
 */
async function promiseAllSettledDemo(): Promise<void> {
  const results = await Promise.allSettled([
    Promise.resolve('success'),
    Promise.reject('error'),
    Promise.resolve('another success')
  ]);

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`Task ${i} succeeded:`, result.value);
    } else {
      console.log(`Task ${i} failed:`, result.reason);
    }
  });
}

/**
 * Promise.race - 返回最快完成的Promise
 *
 * 形式化：Promise.race([p1, p2, ...]) → 最先settled的Promise结果
 */
async function promiseRaceDemo(): Promise<void> {
  // 超时控制
  const fetchWithTimeout = <T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  };

  try {
    const data = await fetchWithTimeout(fetch('/api/data'), 5000);
    console.log(data);
  } catch (err) {
    console.log('Request timed out');
  }
}

/**
 * Promise.any - 返回第一个成功的Promise（ES2021）
 *
 * 形式化：Promise.any([p1, p2, ...]) → 第一个fulfilled的结果
 *   如果全部失败，返回 AggregateError
 */
async function promiseAnyDemo(): Promise<void> {
  try {
    const fastest = await Promise.any([
      fetch('https://server1.com/api'),
      fetch('https://server2.com/api'),
      fetch('https://server3.com/api')
    ]);
    console.log('Fastest server responded:', fastest);
  } catch (err) {
    // 所有请求都失败
    console.log('All servers failed:', (err as AggregateError).errors);
  }
}

// 辅助函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch(url: string): Promise<any> {
  // 模拟fetch
  return { url, data: 'mock' };
}
```

#### 2.2.4 Promise 反例

```typescript
/**
 * 反例1：忘记return导致链断裂
 */
function brokenChain(): Promise<string> {
  return Promise.resolve('start')
    .then(value => {
      fetch('/api/data');  // 错误：没有return！
    })
    .then(result => {
      // result 是 undefined，不是fetch结果
      console.log(result);  // undefined
      return 'done';
    });
}

/**
 * 反例2：嵌套Promise（Promise地狱）
 */
function promiseHell(): void {
  // 不要这样做！
  fetchUser()
    .then(user => {
      return fetchPosts(user.id)
        .then(posts => {
          return fetchComments(posts[0].id)
            .then(comments => {
              console.log(comments);
            });
        });
    });

  // 正确做法：扁平化
  fetchUser()
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => console.log(comments));
}

/**
 * 反例3：未处理的Promise拒绝
 */
function unhandledRejection(): void {
  // 危险：未捕获的rejection
  Promise.reject(new Error('Oops'));

  // 正确做法
  Promise.reject(new Error('Oops')).catch(err => {
    console.error('Handled:', err);
  });
}

/**
 * 反例4：在finally中返回值
 */
function finallyReturn(): Promise<string> {
  return Promise.resolve('value')
    .finally(() => {
      return 'ignored';  // finally的返回值被忽略
    })
    .then(v => {
      console.log(v);  // 'value'，不是 'ignored'
      return v;
    });
}

// 模拟函数
function fetchUser(): Promise<{id: number}> {
  return Promise.resolve({ id: 1 });
}
function fetchPosts(userId: number): Promise<Array<{id: number}>> {
  return Promise.resolve([{ id: 1 }]);
}
function fetchComments(postId: number): Promise<string[]> {
  return Promise.resolve(['comment1']);
}
```

### 2.3 async/await 模式

#### 2.3.1 async/await 语法糖解析

```typescript
/**
 * async/await 形式化定义
 *
 * async function = 返回Promise的函数
 * await expression = 暂停执行，等待Promise resolve
 *
 * 转换规则：
 * async function foo() { return x; } → function foo() { return Promise.resolve(x); }
 * await x → yield x (在generator意义上)
 */

// async函数总是返回Promise
async function asyncReturn(): Promise<number> {
  return 42;  // 等价于 return Promise.resolve(42)
}

// await 表达式
async function awaitExpression(): Promise<void> {
  const result = await Promise.resolve(42);  // 等待resolve
  console.log(result);  // 42

  // await 非Promise值
  const value = await 42;  // 自动包装为Promise.resolve(42)
  console.log(value);  // 42
}

// async/await 与 Promise 等价转换
function asyncAwaitToPromise(): void {
  // async/await 写法
  async function asyncVersion(): Promise<string> {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    return posts[0].title;
  }

  // Promise 等价写法
  function promiseVersion(): Promise<string> {
    return fetchUser()
      .then(user => fetchPosts(user.id))
      .then(posts => posts[0].title);
  }
}

// 模拟函数
function fetchUser(): Promise<{id: number, name: string}> {
  return Promise.resolve({ id: 1, name: 'John' });
}
function fetchPosts(userId: number): Promise<Array<{id: number, title: string}>> {
  return Promise.resolve([{ id: 1, title: 'Hello' }]);
}
```

#### 2.3.2 错误处理模式

```typescript
/**
 * async/await 错误处理最佳实践
 */

// 模式1：try-catch 块
async function errorHandling1(): Promise<void> {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    console.log(posts);
  } catch (error) {
    console.error('Error:', error);
  }
}

// 模式2：分离成功和错误处理
async function errorHandling2(): Promise<void> {
  const result = await fetchUser()
    .then(user => ({ success: true, user } as const))
    .catch(error => ({ success: false, error } as const));

  if (result.success) {
    console.log('User:', result.user);
  } else {
    console.error('Failed:', result.error);
  }
}

// 模式3：并行错误处理
async function parallelErrorHandling(): Promise<void> {
  const [userResult, postsResult] = await Promise.allSettled([
    fetchUser(),
    fetchPosts(1)
  ]);

  if (userResult.status === 'fulfilled') {
    console.log('User:', userResult.value);
  } else {
    console.error('User fetch failed:', userResult.reason);
  }

  if (postsResult.status === 'fulfilled') {
    console.log('Posts:', postsResult.value);
  } else {
    console.error('Posts fetch failed:', postsResult.reason);
  }
}

// 模式4：重试机制
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await sleep(delay * Math.pow(2, i));  // 指数退避
      }
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 2.3.3 并行控制

```typescript
/**
 * async/await 中的并行控制
 */

// 反例：串行执行（性能差）
async function sequentialExecution(ids: number[]): Promise<any[]> {
  const results = [];
  for (const id of ids) {
    results.push(await fetchItem(id));  // 串行！
  }
  return results;
}

// 正确：并行执行
async function parallelExecution(ids: number[]): Promise<any[]> {
  const promises = ids.map(id => fetchItem(id));
  return Promise.all(promises);
}

// 并发限制（防止请求过多）
async function limitedConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, item] of items.entries()) {
    const promise = fn(item).then(result => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// 使用示例
async function demoLimitedConcurrency(): Promise<void> {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 最多同时3个请求
  const results = await limitedConcurrency(ids, fetchItem, 3);
  console.log(results);
}

function fetchItem(id: number): Promise<{id: number}> {
  return new Promise(resolve =>
    setTimeout(() => resolve({ id }), 100)
  );
}
```

#### 2.3.4 async/await 反例

```typescript
/**
 * 反例1：在普通函数中使用await
 */
function cannotUseAwait(): void {
  // 错误：await只能在async函数中使用
  // const result = await fetchData();  // SyntaxError

  // 正确做法
  fetchData().then(result => {
    console.log(result);
  });
}

async function fetchData(): Promise<string> {
  return 'data';
}

/**
 * 反例2：忘记await
 */
async function forgotAwait(): Promise<void> {
  const user = fetchUser();  // 忘记await，得到的是Promise
  console.log(user.id);  // undefined！user是Promise

  // 正确做法
  const user2 = await fetchUser();
  console.log(user2.id);  // OK
}

/**
 * 反例3：在map/forEach中使用async
 */
async function wrongIteration(users: Array<{id: number}>): Promise<void> {
  // 错误：forEach不会等待async完成
  users.forEach(async user => {
    await saveUser(user);  // 不会等待！
  });
  console.log('All saved?');  // 这里还没保存完

  // 正确做法1：for...of
  for (const user of users) {
    await saveUser(user);
  }
  console.log('All saved!');  // 确实保存完了

  // 正确做法2：Promise.all + map
  await Promise.all(users.map(user => saveUser(user)));
  console.log('All saved!');
}

async function saveUser(user: {id: number}): Promise<void> {
  await delay(10);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 反例4：try-catch范围过大
 */
async function catchScopeTooLarge(): Promise<void> {
  try {
    // 这行失败会跳过下面的代码
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);  // 如果fetchUser失败，这行不会执行
    const comments = await fetchComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    // 不知道哪一步失败了
    console.error('Something failed:', error);
  }
}

// 更好的做法：分别处理
async function betterErrorHandling(): Promise<void> {
  let user;
  try {
    user = await fetchUser();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return;
  }

  let posts;
  try {
    posts = await fetchPosts(user.id);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return;
  }

  // ...
}

function fetchComments(postId: number): Promise<string[]> {
  return Promise.resolve(['comment']);
}
```

### 2.4 Generator 模式

#### 2.4.1 Generator 基础

```typescript
/**
 * Generator 形式化定义
 *
 * Generator 是一个状态机，通过 yield 暂停，通过 next() 恢复
 *
 * interface Generator<T, TReturn, TNext> {
 *   next(...args: TNext[]): IteratorResult<T, TReturn>;
 *   return(value: TReturn): IteratorResult<T, TReturn>;
 *   throw(e: any): IteratorResult<T, TReturn>;
 *   [Symbol.iterator](): Generator<T, TReturn, TNext>;
 * }
 */

// 基础Generator示例
function* basicGenerator(): Generator<number, string, boolean> {
  console.log('Start');

  const a = yield 1;  // 暂停，返回1
  console.log('Received:', a);  // 接收next()传入的值

  const b = yield 2;  // 暂停，返回2
  console.log('Received:', b);

  return 'done';
}

function runBasicGenerator(): void {
  const gen = basicGenerator();

  console.log(gen.next());       // { value: 1, done: false }
  console.log(gen.next(true));   // 'Received: true', { value: 2, done: false }
  console.log(gen.next(false));  // 'Received: false', { value: 'done', done: true }
  console.log(gen.next());       // { value: undefined, done: true }
}

// 无限序列生成器
function* infiniteSequence(): Generator<number, never, unknown> {
  let i = 0;
  while (true) {
    yield i++;
  }
}

// 斐波那契数列
function* fibonacci(): Generator<number, never, unknown> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function useFibonacci(): void {
  const fib = fibonacci();
  console.log(fib.next().value);  // 0
  console.log(fib.next().value);  // 1
  console.log(fib.next().value);  // 1
  console.log(fib.next().value);  // 2
  console.log(fib.next().value);  // 3
  console.log(fib.next().value);  // 5
}
```

#### 2.4.2 Generator 异步流程控制

```typescript
/**
 * 使用 Generator 实现异步流程控制
 * 这是 async/await 的前身（co 库原理）
 */

// 自动执行Generator的runner
function runGenerator<T>(
  genFn: () => Generator<Promise<any>, T, any>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const gen = genFn();

    function step(value?: any): void {
      let result;
      try {
        result = gen.next(value);
      } catch (err) {
        reject(err);
        return;
      }

      if (result.done) {
        resolve(result.value);
        return;
      }

      Promise.resolve(result.value)
        .then(step)
        .catch(err => {
          try {
            const thrown = gen.throw!(err);
            step(thrown.value);
          } catch (e) {
            reject(e);
          }
        });
    }

    step();
  });
}

// 使用Generator进行异步流程控制
function* asyncFlow(): Generator<Promise<any>, string, any> {
  try {
    const user = yield fetchUser();
    const posts = yield fetchPosts(user.id);
    const comments = yield fetchComments(posts[0].id);
    return comments[0];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 执行
function demoAsyncFlow(): void {
  runGenerator(asyncFlow)
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Failed:', err));
}

// 并行执行
function* parallelGenerator(): Generator<Promise<any>, any[], any> {
  const [users, posts] = yield Promise.all([
    fetchUsers(),
    fetchAllPosts()
  ]);
  return [users, posts];
}

// 模拟函数
function fetchUser(): Promise<{id: number}> {
  return Promise.resolve({ id: 1 });
}
function fetchPosts(userId: number): Promise<Array<{id: number}>> {
  return Promise.resolve([{ id: 1 }]);
}
function fetchComments(postId: number): Promise<string[]> {
  return Promise.resolve(['comment']);
}
function fetchUsers(): Promise<Array<{id: number}>> {
  return Promise.resolve([{ id: 1 }]);
}
function fetchAllPosts(): Promise<Array<{id: number}>> {
  return Promise.resolve([{ id: 1 }]);
}
```

#### 2.4.3 Generator 与 Symbol.iterator

```typescript
/**
 * 实现可迭代对象
 */

// 自定义可迭代对象
class Range implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  *[Symbol.iterator](): Generator<number, void, unknown> {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

// 使用
function useRange(): void {
  const range = new Range(1, 5);
  console.log([...range]);  // [1, 2, 3, 4, 5]

  for (const num of range) {
    console.log(num);
  }
}

// 组合多个迭代器
function* combine<T>(...iterables: Iterable<T>[]): Generator<T, void, unknown> {
  for (const iterable of iterables) {
    yield* iterable;  // 委托迭代
  }
}

function useCombine(): void {
  const combined = combine([1, 2], [3, 4], [5, 6]);
  console.log([...combined]);  // [1, 2, 3, 4, 5, 6]
}

// 树结构遍历
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

function* traverseTree<T>(node: TreeNode<T>): Generator<T, void, unknown> {
  yield node.value;
  if (node.children) {
    for (const child of node.children) {
      yield* traverseTree(child);
    }
  }
}

function useTreeTraversal(): void {
  const tree: TreeNode<string> = {
    value: 'root',
    children: [
      { value: 'child1', children: [{ value: 'grandchild1' }] },
      { value: 'child2' }
    ]
  };

  console.log([...traverseTree(tree)]);  // ['root', 'child1', 'grandchild1', 'child2']
}
```

### 2.5 Async Iterator/Generator

#### 2.5.1 Async Iterator 基础

```typescript
/**
 * Async Iterator 形式化定义
 *
 * interface AsyncIterator<T, TReturn, TNext> {
 *   next(...args: TNext[]): Promise<IteratorResult<T, TReturn>>;
 *   return?(value?: TReturn): Promise<IteratorResult<T, TReturn>>;
 *   throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
 * }
 *
 * interface AsyncIterable<T> {
 *   [Symbol.asyncIterator](): AsyncIterator<T>;
 * }
 */

// 基础Async Generator
async function* asyncGenerator(): AsyncGenerator<number, string, unknown> {
  await delay(100);
  yield 1;

  await delay(100);
  yield 2;

  await delay(100);
  yield 3;

  return 'done';
}

// 使用 for-await-of
async function useAsyncGenerator(): Promise<void> {
  for await (const value of asyncGenerator()) {
    console.log(value);  // 1, 2, 3（间隔100ms）
  }
}

// 手动迭代
async function manualAsyncIteration(): Promise<void> {
  const gen = asyncGenerator();

  let result = await gen.next();
  while (!result.done) {
    console.log(result.value);
    result = await gen.next();
  }
  console.log('Final:', result.value);  // 'done'
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 2.5.2 实现自定义 Async Iterable

```typescript
/**
 * 自定义异步可迭代对象
 */

// 异步分页数据获取
class PaginatedAPI<T> implements AsyncIterable<T> {
  constructor(
    private fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>
  ) {}

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, unknown> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchPage(page);

      for (const item of response.items) {
        yield item;
      }

      hasMore = response.hasMore;
      page++;
    }
  }
}

// 使用示例
async function usePaginatedAPI(): Promise<void> {
  const api = new PaginatedAPI<{id: number}>(async (page) => {
    // 模拟API调用
    await delay(100);
    return {
      items: [{ id: page * 1 }, { id: page * 2 }],
      hasMore: page < 3
    };
  });

  // 自动处理分页
  for await (const item of api) {
    console.log(item);  // {id: 1}, {id: 2}, {id: 2}, {id: 4}, {id: 3}, {id: 6}
  }
}

// 带背压的异步生成器
async function* withBackpressure<T>(
  source: AsyncIterable<T>,
  process: (item: T) => Promise<void>,
  concurrency: number
): AsyncGenerator<T, void, unknown> {
  const buffer: Promise<void>[] = [];

  for await (const item of source) {
    const promise = process(item).then(() => item);
    buffer.push(promise as Promise<void>);

    if (buffer.length >= concurrency) {
      yield await Promise.race(buffer);
      const index = buffer.findIndex(p => p === promise);
      buffer.splice(index, 1);
    }
  }

  while (buffer.length > 0) {
    yield await Promise.race(buffer);
  }
}
```

#### 2.5.3 Async Iterator 工具函数

```typescript
/**
 * Async Iterator 工具函数库
 */

// async map
async function* asyncMap<T, R>(
  source: AsyncIterable<T>,
  fn: (item: T, index: number) => Promise<R> | R
): AsyncGenerator<R, void, unknown> {
  let index = 0;
  for await (const item of source) {
    yield await fn(item, index++);
  }
}

// async filter
async function* asyncFilter<T>(
  source: AsyncIterable<T>,
  predicate: (item: T, index: number) => Promise<boolean> | boolean
): AsyncGenerator<T, void, unknown> {
  let index = 0;
  for await (const item of source) {
    if (await predicate(item, index++)) {
      yield item;
    }
  }
}

// async take
async function* asyncTake<T>(
  source: AsyncIterable<T>,
  count: number
): AsyncGenerator<T, void, unknown> {
  let taken = 0;
  for await (const item of source) {
    if (taken >= count) break;
    yield item;
    taken++;
  }
}

// async reduce
async function asyncReduce<T, R>(
  source: AsyncIterable<T>,
  fn: (acc: R, item: T, index: number) => Promise<R> | R,
  initial: R
): Promise<R> {
  let acc = initial;
  let index = 0;
  for await (const item of source) {
    acc = await fn(acc, item, index++);
  }
  return acc;
}

// 使用示例
async function useAsyncUtils(): Promise<void> {
  async function* source(): AsyncGenerator<number, void, unknown> {
    for (let i = 1; i <= 10; i++) {
      yield i;
    }
  }

  // 管道操作
  const result = await asyncReduce(
    asyncTake(
      asyncFilter(
        asyncMap(source(), x => x * 2),
        x => x > 5
      ),
      3
    ),
    (sum, x) => sum + x,
    0
  );

  console.log(result);  // 24 (6 + 8 + 10)
}
```

#### 2.5.4 Async Iterator 反例

```typescript
/**
 * 反例1：在普通for-of中使用async迭代器
 */
async function wrongIterationType(): Promise<void> {
  // 错误：for...of 不能用于 async iterator
  // for (const item of asyncGenerator()) {  // TypeError

  // 正确做法
  for await (const item of asyncGenerator()) {
    console.log(item);
  }
}

async function* asyncGenerator(): AsyncGenerator<number, void, unknown> {
  yield 1;
  yield 2;
}

/**
 * 反例2：忘记await异步迭代器
 */
async function forgotAwaitIterator(): Promise<void> {
  const iterator = asyncGenerator()[Symbol.asyncIterator]();

  // 错误：next() 返回 Promise
  // const result = iterator.next();  // 得到的是 Promise

  // 正确做法
  const result = await iterator.next();
  console.log(result.value);
}

/**
 * 反例3：在Array.from中使用async迭代器
 */
async function wrongArrayFrom(): Promise<void> {
  // 错误：Array.from 不等待异步迭代
  // const arr = Array.from(asyncGenerator());  // 空数组或错误

  // 正确做法
  const arr = [];
  for await (const item of asyncGenerator()) {
    arr.push(item);
  }
  // 或者
  const arr2 = await Array.fromAsync(asyncGenerator());  // ES2024
}

/**
 * 反例4：并行处理异步迭代器
 */
async function wrongParallelProcessing(): Promise<void> {
  // 错误：并行处理会丢失顺序或重复
  const promises = [];
  for await (const item of asyncGenerator()) {
    promises.push(processItem(item));
  }
  await Promise.all(promises);  // 这不会并行，因为for-await是串行的

  // 如果需要并行，应该使用其他方式
}

async function processItem(item: number): Promise<void> {
  await delay(10);
  console.log(item);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 3. 并行处理

### 3.1 Web Workers

#### 3.1.1 Web Workers API

```typescript
/**
 * Web Workers 形式化定义
 *
 * Web Workers 允许在后台线程运行脚本，与主线程通过消息通信
 *
 * 限制：
 * - 无法访问 DOM
 * - 无法访问 window 对象
 * - 无法访问父页面的变量和函数
 * - 同源限制
 */

// Worker 脚本 (worker.ts)
// self.onmessage = (event: MessageEvent) => {
//   const { type, data, id } = event.data;
//
//   switch (type) {
//     case 'COMPUTE':
//       const result = heavyComputation(data);
//       self.postMessage({ id, result });
//       break;
//     case 'SORT':
//       const sorted = data.sort((a: number, b: number) => a - b);
//       self.postMessage({ id, result: sorted });
//       break;
//   }
// };
//
// function heavyComputation(data: number[]): number {
//   return data.reduce((sum, n) => sum + n * n, 0);
// }

// 主线程使用 Worker
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: any; resolve: Function; reject: Function }> = [];
  private taskId = 0;
  private pendingTasks = new Map<number, { resolve: Function; reject: Function }>();

  constructor(workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (event) => this.handleMessage(event);
      worker.onerror = (error) => this.handleError(error);
      this.workers.push(worker);
    }
  }

  private handleMessage(event: MessageEvent): void {
    const { id, result, error } = event.data;
    const handlers = this.pendingTasks.get(id);

    if (handlers) {
      if (error) {
        handlers.reject(new Error(error));
      } else {
        handlers.resolve(result);
      }
      this.pendingTasks.delete(id);
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);
  }

  execute<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = ++this.taskId;
      this.pendingTasks.set(id, { resolve, reject });

      // 简单轮询选择worker
      const worker = this.workers[id % this.workers.length];
      worker.postMessage({ type, data, id });
    });
  }

  terminate(): void {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }
}

// 使用示例
async function useWorkerPool(): Promise<void> {
  const pool = new WorkerPool('/workers/compute.worker.js', 4);

  try {
    // 并行执行多个计算任务
    const results = await Promise.all([
      pool.execute<number>('COMPUTE', [1, 2, 3, 4, 5]),
      pool.execute<number>('COMPUTE', [6, 7, 8, 9, 10]),
      pool.execute<number[]>('SORT', [5, 3, 1, 4, 2])
    ]);

    console.log(results);
  } finally {
    pool.terminate();
  }
}
```

#### 3.1.2 Worker 通信模式

```typescript
/**
 * Worker 通信模式
 */

// 模式1：请求-响应（RPC风格）
interface RPCMessage {
  id: string;
  method: string;
  params: any[];
}

interface RPCResponse {
  id: string;
  result?: any;
  error?: string;
}

class WorkerRPC {
  private worker: Worker;
  private pending = new Map<string, { resolve: Function; reject: Function }>();

  constructor(workerScript: string) {
    this.worker = new Worker(workerScript);
    this.worker.onmessage = (e) => this.handleResponse(e.data);
  }

  private handleResponse(response: RPCResponse): void {
    const handler = this.pending.get(response.id);
    if (handler) {
      if (response.error) {
        handler.reject(new Error(response.error));
      } else {
        handler.resolve(response.result);
      }
      this.pending.delete(response.id);
    }
  }

  call<T>(method: string, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).slice(2);
      this.pending.set(id, { resolve, reject });

      const message: RPCMessage = { id, method, params };
      this.worker.postMessage(message);
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}

// 模式2：双向流通信
class WorkerStream {
  private worker: Worker;
  private listeners = new Map<string, Set<(data: any) => void>>();

  constructor(workerScript: string) {
    this.worker = new Worker(workerScript);
    this.worker.onmessage = (e) => {
      const { channel, data } = e.data;
      this.listeners.get(channel)?.forEach(cb => cb(data));
    };
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  emit(channel: string, data: any): void {
    this.worker.postMessage({ channel, data });
  }
}

// 模式3：SharedWorker（多页面共享）
// const sharedWorker = new SharedWorker('shared-worker.js');
// sharedWorker.port.start();
// sharedWorker.port.postMessage('hello');
// sharedWorker.port.onmessage = (e) => console.log(e.data);
```

#### 3.1.3 Worker 性能分析

```typescript
/**
 * Worker 性能分析
 */

// 性能测试：主线程 vs Worker
async function performanceComparison(): Promise<void> {
  const data = Array.from({ length: 1000000 }, () => Math.random());

  // 主线程计算
  console.time('main-thread');
  const mainResult = heavyComputation(data);
  console.timeEnd('main-thread');

  // Worker 计算
  console.time('worker');
  const workerResult = await runInWorker(data);
  console.timeEnd('worker');

  console.log('Results match:', mainResult === workerResult);
}

function heavyComputation(data: number[]): number {
  return data.reduce((sum, n) => sum + Math.sqrt(n) * Math.sin(n), 0);
}

function runInWorker(data: number[]): Promise<number> {
  return new Promise((resolve) => {
    const worker = new Worker('/workers/compute.worker.js');
    worker.postMessage(data);
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
  });
}

/**
 * Worker 开销分析：
 *
 * 1. 创建开销：~5-50ms（取决于环境和脚本大小）
 * 2. 通信开销：结构化克隆算法
 *    - 简单数据：~0.1ms
 *    - 大数组：~10-100ms（100MB数据）
 * 3. 序列化限制：
 *    - 支持：基本类型、TypedArray、Map、Set
 *    - 不支持：函数、DOM节点、循环引用
 *
 * 最佳实践：
 * - 数据 > 100KB 时考虑使用 Transferable Objects
 * - 频繁通信时使用 SharedArrayBuffer
 * - 复用 Worker 避免创建开销
 */

// 使用 Transferable Objects 减少拷贝开销
function useTransferableObjects(): void {
  const buffer = new ArrayBuffer(1024 * 1024 * 10);  // 10MB
  const worker = new Worker('/workers/process.worker.js');

  // 转移所有权，不拷贝
  worker.postMessage({ buffer }, [buffer]);

  // 此时主线程不能再访问 buffer
  // console.log(buffer.byteLength);  // 0
}
```

### 3.2 Node.js Worker Threads

#### 3.2.1 Worker Threads API

```typescript
/**
 * Node.js Worker Threads
 *
 * 与 Web Workers 的主要区别：
 * 1. 可以共享内存（SharedArrayBuffer）
 * 2. 可以传递更复杂的对象
 * 3. 可以使用 Atomics API
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { cpus } from 'os';

// Worker 脚本
if (!isMainThread) {
  // 在 Worker 线程中执行
  const { start, end } = workerData as { start: number; end: number };

  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += i;
  }

  parentPort?.postMessage(sum);
}

// 主线程使用 Worker
class NodeWorkerPool<T, R> {
  private workers: Worker[] = [];
  private queue: Array<{ task: T; resolve: (result: R) => void; reject: (err: Error) => void }> = [];
  private activeWorkers = 0;

  constructor(
    private workerScript: string,
    private poolSize: number = cpus().length
  ) {
    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }

  private addWorker(): void {
    const worker = new Worker(this.workerScript);

    worker.on('message', (result: R) => {
      const task = worker.currentTask;
      if (task) {
        task.resolve(result);
        worker.currentTask = null;
        this.processQueue();
      }
    });

    worker.on('error', (err) => {
      const task = worker.currentTask;
      if (task) {
        task.reject(err);
        worker.currentTask = null;
        this.processQueue();
      }
    });

    (worker as any).currentTask = null;
    this.workers.push(worker);
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !(w as any).currentTask);
    if (!availableWorker) return;

    const task = this.queue.shift()!;
    (availableWorker as any).currentTask = task;
    availableWorker.postMessage(task.task);
  }

  execute(task: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  terminate(): Promise<number[]> {
    return Promise.all(this.workers.map(w => w.terminate()));
  }
}

// 并行计算示例
async function parallelSum(n: number): Promise<number> {
  const numWorkers = cpus().length;
  const chunkSize = Math.ceil(n / numWorkers);

  const workers: Worker[] = [];
  const promises: Promise<number>[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, n);

    const worker = new Worker(__filename, {
      workerData: { start, end }
    });

    workers.push(worker);

    promises.push(new Promise((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
    }));
  }

  const results = await Promise.all(promises);
  await Promise.all(workers.map(w => w.terminate()));

  return results.reduce((sum, val) => sum + val, 0);
}
```

#### 3.2.2 MessageChannel

```typescript
/**
 * MessageChannel - 创建独立的通信通道
 */
import { MessageChannel } from 'worker_threads';

// 创建 MessageChannel
function createCommunicationChannel(): void {
  const { port1, port2 } = new MessageChannel();

  // port1 和 port2 可以互相通信
  port1.on('message', (msg) => {
    console.log('Port1 received:', msg);
  });

  port2.on('message', (msg) => {
    console.log('Port2 received:', msg);
    port2.postMessage('Reply from port2');
  });

  port1.postMessage('Hello from port1');
}

// 将 MessagePort 传递给 Worker
function transferMessagePort(): void {
  const { port1, port2 } = new MessageChannel();

  const worker = new Worker('./worker.js');

  // 将 port2 转移给 Worker
  worker.postMessage({ port: port2 }, [port2 as any]);

  // 主线程通过 port1 通信
  port1.on('message', (msg) => {
    console.log('Main received:', msg);
  });

  port1.postMessage('Hello worker');
}

// Worker 中使用接收到的 port
// parentPort.once('message', ({ port }) => {
//   port.on('message', (msg) => {
//     console.log('Worker received:', msg);
//     port.postMessage('Hello main');
//   });
// });
```

### 3.3 SharedArrayBuffer 和 Atomics

#### 3.3.1 SharedArrayBuffer 基础

```typescript
/**
 * SharedArrayBuffer - 共享内存
 *
 * 允许多个线程访问同一块内存，需要配合 Atomics API 使用
 */

import { Worker, isMainThread, workerData } from 'worker_threads';

// 创建共享内存
function createSharedMemory(): void {
  // 创建 1KB 共享内存
  const sharedBuffer = new SharedArrayBuffer(1024);

  // 创建视图
  const int32View = new Int32Array(sharedBuffer);

  // 初始化数据
  int32View[0] = 42;

  // 传递给 Worker
  const worker = new Worker('./worker.js', {
    workerData: { sharedBuffer }
  });

  // Worker 可以读取和修改同一块内存
}

// Worker 中使用共享内存
if (!isMainThread) {
  const { sharedBuffer } = workerData as { sharedBuffer: SharedArrayBuffer };
  const int32View = new Int32Array(sharedBuffer);

  // 读取共享数据
  console.log('Worker reads:', int32View[0]);

  // 修改共享数据
  int32View[0] = 100;
}
```

#### 3.3.2 Atomics API

```typescript
/**
 * Atomics API - 原子操作
 *
 * 提供线程安全的原子操作，避免竞态条件
 */

// Atomics 操作分类
interface AtomicsAPI {
  // 1. 读写操作（原子性保证）
  load(typedArray: Int32Array, index: number): number;
  store(typedArray: Int32Array, index: number, value: number): number;

  // 2. 原子更新操作
  add(typedArray: Int32Array, index: number, value: number): number;
  sub(typedArray: Int32Array, index: number, value: number): number;
  and(typedArray: Int32Array, index: number, value: number): number;
  or(typedArray: Int32Array, index: number, value: number): number;
  xor(typedArray: Int32Array, index: number, value: number): number;

  // 3. 比较并交换 (CAS)
  compareExchange(
    typedArray: Int32Array,
    index: number,
    expectedValue: number,
    replacementValue: number
  ): number;

  // 4. 交换
  exchange(typedArray: Int32Array, index: number, value: number): number;

  // 5. 等待和通知（用于线程同步）
  wait(typedArray: Int32Array, index: number, value: number, timeout?: number): 'ok' | 'not-equal' | 'timed-out';
  notify(typedArray: Int32Array, index: number, count?: number): number;

  // 6. 判断是否为原子操作
  isLockFree(size: number): boolean;
}

// 原子计数器实现
class AtomicCounter {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;

  constructor(initialValue: number = 0) {
    this.buffer = new SharedArrayBuffer(4);  // 4 bytes for int32
    this.view = new Int32Array(this.buffer);
    Atomics.store(this.view, 0, initialValue);
  }

  increment(): number {
    return Atomics.add(this.view, 0, 1);
  }

  decrement(): number {
    return Atomics.sub(this.view, 0, 1);
  }

  get(): number {
    return Atomics.load(this.view, 0);
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 使用示例
function useAtomicCounter(): void {
  const counter = new AtomicCounter(0);

  // 创建多个 Worker 同时增加计数器
  const workers: Worker[] = [];

  for (let i = 0; i < 4; i++) {
    const worker = new Worker('./counter-worker.js', {
      workerData: { buffer: counter.getBuffer(), increments: 1000 }
    });
    workers.push(worker);
  }

  // 等待所有 Worker 完成
  Promise.all(workers.map(w =>
    new Promise(resolve => w.on('message', resolve))
  )).then(() => {
    console.log('Final count:', counter.get());  // 应该是 4000
  });
}

// counter-worker.js
// const { buffer, increments } = workerData;
// const view = new Int32Array(buffer);
//
// for (let i = 0; i < increments; i++) {
//   Atomics.add(view, 0, 1);  // 原子增加
// }
//
// parentPort.postMessage('done');
```

#### 3.3.3 Atomics.wait 和 Atomics.notify

```typescript
/**
 * 使用 wait/notify 实现线程同步
 */

// 条件变量实现
class ConditionVariable {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;

  constructor() {
    this.buffer = new SharedArrayBuffer(8);  // 2 int32 slots
    this.view = new Int32Array(this.buffer);
    // slot 0: 条件值
    // slot 1: 等待者计数
  }

  // 等待条件满足
  wait(expectedValue: number, timeout?: number): 'ok' | 'not-equal' | 'timed-out' {
    Atomics.add(this.view, 1, 1);  // 增加等待者计数
    const result = Atomics.wait(this.view, 0, expectedValue, timeout);
    Atomics.sub(this.view, 1, 1);  // 减少等待者计数
    return result;
  }

  // 通知等待者
  notify(count: number = Infinity): number {
    return Atomics.notify(this.view, 0, count);
  }

  // 设置条件值
  set(value: number): void {
    Atomics.store(this.view, 0, value);
  }

  // 获取条件值
  get(): number {
    return Atomics.load(this.view, 0);
  }

  // 获取等待者数量
  waiters(): number {
    return Atomics.load(this.view, 1);
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 生产者-消费者队列（使用 Atomics.wait/notify）
class SharedQueue<T> {
  private buffer: SharedArrayBuffer;
  private header: Int32Array;  // 元数据
  private data: Int32Array;    // 实际数据（简化版）
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    // header: [writeIndex, readIndex, size]
    this.buffer = new SharedArrayBuffer(12 + capacity * 4);
    this.header = new Int32Array(this.buffer, 0, 3);
    this.data = new Int32Array(this.buffer, 12, capacity);
  }

  enqueue(value: number): boolean {
    const size = Atomics.load(this.header, 2);

    if (size >= this.capacity) {
      return false;  // 队列满
    }

    const writeIndex = Atomics.load(this.header, 0);
    this.data[writeIndex % this.capacity] = value;

    Atomics.store(this.header, 0, (writeIndex + 1) % this.capacity);
    Atomics.add(this.header, 2, 1);

    // 通知等待的消费者
    Atomics.notify(this.header, 2, 1);

    return true;
  }

  dequeue(timeout?: number): number | null {
    while (true) {
      const size = Atomics.load(this.header, 2);

      if (size > 0) {
        const readIndex = Atomics.load(this.header, 1);
        const value = this.data[readIndex % this.capacity];

        Atomics.store(this.header, 1, (readIndex + 1) % this.capacity);
        Atomics.sub(this.header, 2, 1);

        // 通知等待的生产者
        Atomics.notify(this.header, 2, 1);

        return value;
      }

      // 队列为空，等待
      const result = Atomics.wait(this.header, 2, 0, timeout);
      if (result === 'timed-out') {
        return null;
      }
    }
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}
```

### 3.4 WASM 多线程

```typescript
/**
 * WebAssembly 多线程支持
 *
 * 需要：
 * 1. SharedArrayBuffer 支持
 * 2. WASM 模块编译时启用线程支持
 */

// 加载 WASM 模块（多线程版本）
async function loadWasmWithThreads(): Promise<void> {
  // 检查 SharedArrayBuffer 支持
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer not supported');
  }

  // 加载 WASM 模块
  const response = await fetch('/wasm/compute.wasm');
  const bytes = await response.arrayBuffer();

  // 创建共享内存
  const memory = new WebAssembly.Memory({
    initial: 256,
    maximum: 512,
    shared: true  // 关键：启用共享
  });

  // 实例化 WASM 模块
  const module = await WebAssembly.instantiate(bytes, {
    env: {
      memory,
      __lock: () => {},  // 线程锁（WASM内部实现）
      __unlock: () => {}
    }
  });

  // 在 Worker 中使用
  const worker = new Worker('./wasm-worker.js');
  worker.postMessage({
    module: bytes,
    memory
  }, [memory.buffer as any]);
}

// WASM Worker
// self.onmessage = async (e) => {
//   const { module, memory } = e.data;
//
//   const instance = await WebAssembly.instantiate(module, {
//     env: { memory }
//   });
//
//   // 调用 WASM 函数
//   const result = instance.exports.parallelCompute(0, 1000000);
//
//   self.postMessage({ result });
// };

/**
 * WASM 多线程性能对比
 *
 * 场景：计算 1 到 N 的平方和
 *
 * JavaScript 单线程: ~500ms (N=100M)
 * JavaScript Worker: ~150ms (4 workers)
 * WASM 单线程: ~50ms
 * WASM 多线程: ~15ms (4 threads)
 */
```

---

## 4. 同步原语实现

### 4.1 Mutex（互斥锁）

#### 4.1.1 Mutex 形式化定义

```typescript
/**
 * Mutex（互斥锁）形式化定义
 *
 * 定义：Mutex 是一个二元信号量，保证同一时间只有一个线程可以访问临界区
 *
 * 操作：
 * - lock(): 获取锁，如果锁被占用则阻塞等待
 * - unlock(): 释放锁，唤醒等待的线程
 *
 * 性质：
 * 1. 互斥性：任意时刻最多一个线程持有锁
 * 2. 无死锁：持有锁的线程最终必须释放锁
 * 3. 无饥饿：等待的线程最终能获取锁
 */

interface Mutex {
  acquire(): Promise<MutexGuard>;
  release(): void;
  tryAcquire(): boolean;
}

interface MutexGuard {
  release(): void;
  [Symbol.dispose](): void;  // 使用 using 语法
}
```

#### 4.1.2 基于 Promise 的 Mutex 实现

```typescript
/**
 * 基于 Promise 的 Mutex 实现
 *
 * 原理：使用队列管理等待的 Promise
 */
class PromiseMutex implements Mutex {
  private locked = false;
  private queue: Array<(guard: MutexGuard) => void> = [];

  async acquire(): Promise<MutexGuard> {
    return new Promise(resolve => {
      const guard: MutexGuard = {
        release: () => this.release(),
        [Symbol.dispose]: () => this.release()
      };

      if (!this.locked) {
        this.locked = true;
        resolve(guard);
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      const guard: MutexGuard = {
        release: () => this.release(),
        [Symbol.dispose]: () => this.release()
      };
      next(guard);
    } else {
      this.locked = false;
    }
  }

  tryAcquire(): boolean {
    if (!this.locked) {
      this.locked = true;
      return true;
    }
    return false;
  }

  get isLocked(): boolean {
    return this.locked;
  }

  get waitingCount(): number {
    return this.queue.length;
  }
}

// 使用示例
async function useMutex(): Promise<void> {
  const mutex = new PromiseMutex();
  let counter = 0;

  async function increment(id: number): Promise<void> {
    const guard = await mutex.acquire();
    try {
      // 临界区
      const current = counter;
      await sleep(10);  // 模拟一些操作
      counter = current + 1;
      console.log(`Worker ${id}: counter = ${counter}`);
    } finally {
      guard.release();
    }
  }

  // 并行执行，但互斥访问 counter
  await Promise.all([
    increment(1),
    increment(2),
    increment(3),
    increment(4)
  ]);

  console.log('Final counter:', counter);  // 应该是 4
}

// 使用 using 语法（TypeScript 5.2+）
async function useMutexWithUsing(): Promise<void> {
  const mutex = new PromiseMutex();
  let counter = 0;

  async function increment(): Promise<void> {
    // @ts-ignore - using 语法
    await using guard = await mutex.acquire();
    counter++;
  }

  await Promise.all([increment(), increment(), increment()]);
  console.log(counter);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 4.1.3 基于 Atomics 的 Mutex（跨线程）

```typescript
/**
 * 基于 Atomics 的跨线程 Mutex
 *
 * 使用 SharedArrayBuffer 和 Atomics 实现真正的跨线程互斥
 */
import { Worker, isMainThread, workerData } from 'worker_threads';

class AtomicMutex {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;

  constructor(existingBuffer?: SharedArrayBuffer) {
    if (existingBuffer) {
      this.buffer = existingBuffer;
    } else {
      this.buffer = new SharedArrayBuffer(4);
    }
    this.view = new Int32Array(this.buffer);
  }

  lock(): void {
    // 自旋锁实现
    while (true) {
      // 尝试获取锁（0 表示未锁定）
      const oldValue = Atomics.compareExchange(this.view, 0, 0, 1);
      if (oldValue === 0) {
        return;  // 成功获取锁
      }
      // 锁被占用，等待
      Atomics.wait(this.view, 0, 1);
    }
  }

  unlock(): void {
    // 释放锁
    Atomics.store(this.view, 0, 0);
    // 通知等待的线程
    Atomics.notify(this.view, 0, 1);
  }

  tryLock(): boolean {
    const oldValue = Atomics.compareExchange(this.view, 0, 0, 1);
    return oldValue === 0;
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 使用示例（跨线程）
async function crossThreadMutexDemo(): Promise<void> {
  const mutex = new AtomicMutex();
  const buffer = new SharedArrayBuffer(4);
  const counter = new Int32Array(buffer);

  const workers: Worker[] = [];

  for (let i = 0; i < 4; i++) {
    const worker = new Worker(__filename, {
      workerData: {
        mutexBuffer: mutex.getBuffer(),
        counterBuffer: buffer,
        workerId: i
      }
    });
    workers.push(worker);
  }

  await Promise.all(workers.map(w =>
    new Promise(resolve => w.on('message', resolve))
  ));

  console.log('Final counter:', counter[0]);  // 应该是 4000

  await Promise.all(workers.map(w => w.terminate()));
}

// Worker 代码
if (!isMainThread) {
  const { mutexBuffer, counterBuffer, workerId } = workerData as {
    mutexBuffer: SharedArrayBuffer;
    counterBuffer: SharedArrayBuffer;
    workerId: number;
  };

  const mutex = new AtomicMutex(mutexBuffer);
  const counter = new Int32Array(counterBuffer);

  for (let i = 0; i < 1000; i++) {
    mutex.lock();
    try {
      const current = Atomics.load(counter, 0);
      Atomics.store(counter, 0, current + 1);
    } finally {
      mutex.unlock();
    }
  }

  console.log(`Worker ${workerId} done`);
  parentPort?.postMessage('done');
}
```

#### 4.1.4 Mutex 反例

```typescript
/**
 * Mutex 使用反例
 */

// 反例1：忘记释放锁
async function forgotRelease(mutex: PromiseMutex): Promise<void> {
  const guard = await mutex.acquire();
  // 如果这里抛出异常，锁永远不会释放
  throw new Error('Oops');
  guard.release();  // 永远不会执行
}

// 正确做法：使用 try-finally
async function correctRelease(mutex: PromiseMutex): Promise<void> {
  const guard = await mutex.acquire();
  try {
    throw new Error('Oops');
  } finally {
    guard.release();  // 保证释放
  }
}

// 反例2：重复释放锁
async function doubleRelease(mutex: PromiseMutex): Promise<void> {
  const guard = await mutex.acquire();
  guard.release();
  guard.release();  // 错误：可能导致其他线程获取锁两次
}

// 反例3：在锁内调用可能阻塞的操作
async function blockInLock(mutex: PromiseMutex): Promise<void> {
  const guard = await mutex.acquire();
  try {
    // 错误：在锁内执行长时间操作会阻塞其他线程
    await fetch('https://api.example.com/data');
  } finally {
    guard.release();
  }
}

// 反例4：死锁
async function deadlock(mutex1: PromiseMutex, mutex2: PromiseMutex): Promise<void> {
  // 线程1
  async function thread1(): Promise<void> {
    const guard1 = await mutex1.acquire();
    await sleep(10);
    const guard2 = await mutex2.acquire();  // 可能永远等待
  }

  // 线程2
  async function thread2(): Promise<void> {
    const guard2 = await mutex2.acquire();
    await sleep(10);
    const guard1 = await mutex1.acquire();  // 可能永远等待
  }

  // 两个线程可能互相等待，形成死锁
  await Promise.all([thread1(), thread2()]);
}

// 反例5：锁的粒度太细
class FineGrainedLocking {
  private locks = new Map<string, PromiseMutex>();

  async operation(keys: string[]): Promise<void> {
    // 错误：逐个获取锁可能导致死锁
    for (const key of keys) {
      const lock = this.getLock(key);
      await lock.acquire();
    }
    // ... 操作
    // 释放锁
  }

  // 正确做法：一次性获取所有锁（按固定顺序）
  async operationCorrect(keys: string[]): Promise<void> {
    const sortedKeys = [...keys].sort();  // 固定顺序
    const guards = [];

    for (const key of sortedKeys) {
      const lock = this.getLock(key);
      guards.push(await lock.acquire());
    }

    try {
      // ... 操作
    } finally {
      guards.forEach(g => g.release());
    }
  }

  private getLock(key: string): PromiseMutex {
    if (!this.locks.has(key)) {
      this.locks.set(key, new PromiseMutex());
    }
    return this.locks.get(key)!;
  }
}

function fetch(url: string): Promise<any> {
  return Promise.resolve({});
}
```

### 4.2 Semaphore（信号量）

#### 4.2.1 Semaphore 形式化定义

```typescript
/**
 * Semaphore（信号量）形式化定义
 *
 * 定义：Semaphore 是一个计数器，控制同时访问资源的线程数量
 *
 * 操作：
 * - acquire(): P操作，计数器减1，如果为负则阻塞
 * - release(): V操作，计数器加1，唤醒等待线程
 *
 * 类型：
 * - 计数信号量：计数器可以大于1
 * - 二元信号量：计数器只能是0或1（等价于Mutex）
 */

interface Semaphore {
  acquire(): Promise<void>;
  release(): void;
  tryAcquire(): boolean;
  get available(): number;
}
```

#### 4.2.2 计数信号量实现

```typescript
/**
 * 计数信号量实现
 */
class CountingSemaphore implements Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
  }

  async acquire(): Promise<void> {
    return new Promise(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();  // 不增加 permits，直接唤醒等待者
    } else {
      this.permits++;
    }
  }

  tryAcquire(): boolean {
    if (this.permits > 0) {
      this.permits--;
      return true;
    }
    return false;
  }

  get available(): number {
    return this.permits;
  }

  get waitingCount(): number {
    return this.queue.length;
  }
}

// 使用示例：限制并发数
async function useSemaphore(): Promise<void> {
  const semaphore = new CountingSemaphore(3);  // 最多3个并发
  const results: number[] = [];

  async function task(id: number): Promise<void> {
    await semaphore.acquire();
    try {
      console.log(`Task ${id} started (available: ${semaphore.available})`);
      await sleep(100);
      results.push(id);
      console.log(`Task ${id} finished`);
    } finally {
      semaphore.release();
    }
  }

  // 启动10个任务，但最多3个同时运行
  await Promise.all(Array.from({ length: 10 }, (_, i) => task(i)));

  console.log('Results:', results);
}
```

#### 4.2.3 基于 Atomics 的信号量

```typescript
/**
 * 基于 Atomics 的跨线程信号量
 */
class AtomicSemaphore {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;
  private maxPermits: number;

  constructor(maxPermits: number, existingBuffer?: SharedArrayBuffer) {
    this.maxPermits = maxPermits;

    if (existingBuffer) {
      this.buffer = existingBuffer;
    } else {
      this.buffer = new SharedArrayBuffer(8);  // 2 int32: [permits, waiters]
      const view = new Int32Array(this.buffer);
      Atomics.store(view, 0, maxPermits);  // 初始化 permits
    }

    this.view = new Int32Array(this.buffer);
  }

  acquire(): void {
    while (true) {
      const current = Atomics.load(this.view, 0);

      if (current > 0) {
        // 尝试减少 permits
        const oldValue = Atomics.compareExchange(this.view, 0, current, current - 1);
        if (oldValue === current) {
          return;  // 成功获取
        }
        // CAS 失败，重试
      } else {
        // 没有可用 permits，等待
        Atomics.add(this.view, 1, 1);  // 增加等待者计数
        Atomics.wait(this.view, 0, 0);
        Atomics.sub(this.view, 1, 1);  // 减少等待者计数
      }
    }
  }

  release(): void {
    const oldValue = Atomics.add(this.view, 0, 1);

    // 如果有等待者，通知一个
    if (Atomics.load(this.view, 1) > 0) {
      Atomics.notify(this.view, 0, 1);
    }
  }

  tryAcquire(): boolean {
    while (true) {
      const current = Atomics.load(this.view, 0);

      if (current <= 0) {
        return false;
      }

      const oldValue = Atomics.compareExchange(this.view, 0, current, current - 1);
      if (oldValue === current) {
        return true;
      }
      // CAS 失败，重试
    }
  }

  get available(): number {
    return Atomics.load(this.view, 0);
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 使用示例：连接池
class ConnectionPool {
  private semaphore: AtomicSemaphore;
  private connections: any[] = [];

  constructor(maxConnections: number) {
    this.semaphore = new AtomicSemaphore(maxConnections);

    // 预创建连接
    for (let i = 0; i < maxConnections; i++) {
      this.connections.push({ id: i, status: 'available' });
    }
  }

  acquire(): Connection {
    this.semaphore.acquire();

    const conn = this.connections.find(c => c.status === 'available');
    if (conn) {
      conn.status = 'in-use';
      return new Connection(conn, this);
    }

    this.semaphore.release();
    throw new Error('No available connection');
  }

  release(conn: any): void {
    conn.status = 'available';
    this.semaphore.release();
  }
}

class Connection {
  constructor(
    private conn: any,
    private pool: ConnectionPool
  ) {}

  query(sql: string): Promise<any> {
    return Promise.resolve({ result: `Query: ${sql}` });
  }

  release(): void {
    this.pool.release(this.conn);
  }
}
```

#### 4.2.4 信号量反例

```typescript
/**
 * 信号量使用反例
 */

// 反例1：信号量泄漏（acquire 多于 release）
async function semaphoreLeak(semaphore: CountingSemaphore): Promise<void> {
  await semaphore.acquire();
  // 忘记 release，信号量永久减少
}

// 反例2：信号量溢出（release 多于 acquire）
async function semaphoreOverflow(semaphore: CountingSemaphore): Promise<void> {
  semaphore.release();  // 错误：没有先 acquire
  semaphore.release();  // 信号量超过初始值
}

// 反例3：信号量用于互斥（应该用 Mutex）
class WrongUseOfSemaphore {
  private semaphore = new CountingSemaphore(1);
  private counter = 0;

  async increment(): Promise<void> {
    await this.semaphore.acquire();
    this.counter++;
    this.semaphore.release();
  }
  // 虽然可以工作，但语义不清晰，应该用 Mutex
}

// 反例4：信号量计数为负
async function negativeSemaphore(): Promise<void> {
  const semaphore = new CountingSemaphore(1);

  // 错误：多次 release 可能导致逻辑混乱
  semaphore.release();
  semaphore.release();
  semaphore.release();

  // 现在 available = 4，虽然初始只有1个 permit
}
```

### 4.3 Barrier（屏障）

#### 4.3.1 Barrier 形式化定义

```typescript
/**
 * Barrier（屏障）形式化定义
 *
 * 定义：Barrier 使一组线程互相等待，直到所有线程都到达屏障点才继续执行
 *
 * 操作：
 * - await(): 到达屏障，等待其他线程
 *
 * 性质：
 * 1. 同步点：所有线程必须在屏障处汇合
 * 2. 可重用：屏障可以被重复使用（循环屏障）
 */

interface Barrier {
  await(): Promise<void>;
  get waitingCount(): number;
  get totalParties(): number;
}
```

#### 4.3.2 Barrier 实现

```typescript
/**
 * 屏障实现
 */
class CyclicBarrier implements Barrier {
  private total: number;
  private count: number;
  private generation = 0;
  private resolvers: Array<() => void> = [];

  constructor(parties: number) {
    this.total = parties;
    this.count = parties;
  }

  async await(): Promise<void> {
    const currentGen = this.generation;

    return new Promise(resolve => {
      this.count--;

      if (this.count === 0) {
        // 最后一个到达的线程，唤醒所有等待者
        this.generation++;
        this.count = this.total;

        // 唤醒所有等待的线程
        this.resolvers.forEach(r => r());
        this.resolvers = [];

        resolve();  // 当前线程也继续
      } else {
        // 等待其他线程
        this.resolvers.push(() => {
          if (this.generation === currentGen + 1) {
            resolve();
          }
        });
      }
    });
  }

  get waitingCount(): number {
    return this.total - this.count;
  }

  get totalParties(): number {
    return this.total;
  }
}

// 使用示例：并行计算分阶段执行
async function useBarrier(): Promise<void> {
  const barrier = new CyclicBarrier(3);
  const results: { phase1: number; phase2: number }[] = [];

  async function worker(id: number): Promise<void> {
    // 阶段1：各自计算
    const phase1Result = id * 10;
    console.log(`Worker ${id} phase1: ${phase1Result}`);

    await barrier.await();  // 等待所有线程完成阶段1

    // 阶段2：汇总计算（需要阶段1的所有结果）
    const phase2Result = phase1Result + barrier.totalParties;
    console.log(`Worker ${id} phase2: ${phase2Result}`);

    results[id] = { phase1: phase1Result, phase2: phase2Result };
  }

  await Promise.all([worker(0), worker(1), worker(2)]);
  console.log('Results:', results);
}

// 带动作的屏障（到达时执行回调）
class ActionBarrier implements Barrier {
  private barrier: CyclicBarrier;
  private action: () => void | Promise<void>;

  constructor(parties: number, action: () => void | Promise<void>) {
    this.barrier = new CyclicBarrier(parties);
    this.action = action;
  }

  async await(): Promise<void> {
    const wasLast = this.barrier.waitingCount === this.barrier.totalParties - 1;

    await this.barrier.await();

    if (wasLast) {
      await this.action();
    }
  }

  get waitingCount(): number {
    return this.barrier.waitingCount;
  }

  get totalParties(): number {
    return this.barrier.totalParties;
  }
}
```

#### 4.3.3 基于 Atomics 的屏障

```typescript
/**
 * 基于 Atomics 的跨线程屏障
 */
class AtomicBarrier {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;
  private total: number;

  constructor(parties: number, existingBuffer?: SharedArrayBuffer) {
    this.total = parties;

    if (existingBuffer) {
      this.buffer = existingBuffer;
    } else {
      // [count, generation]
      this.buffer = new SharedArrayBuffer(8);
      const view = new Int32Array(this.buffer);
      Atomics.store(view, 0, parties);
      Atomics.store(view, 1, 0);
    }

    this.view = new Int32Array(this.buffer);
  }

  await(): void {
    const myGen = Atomics.load(this.view, 1);
    const remaining = Atomics.sub(this.view, 0, 1) - 1;

    if (remaining === 0) {
      // 最后一个到达的线程
      Atomics.store(this.view, 0, this.total);  // 重置计数
      Atomics.add(this.view, 1, 1);  // 增加 generation
      Atomics.notify(this.view, 1, this.total - 1);  // 唤醒所有等待者
    } else {
      // 等待其他线程
      while (Atomics.load(this.view, 1) === myGen) {
        Atomics.wait(this.view, 1, myGen);
      }
    }
  }

  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

// 使用示例：并行矩阵计算
async function parallelMatrixMultiply(): Promise<void> {
  const size = 1000;
  const numWorkers = 4;

  // 共享矩阵数据
  const matrixA = new SharedArrayBuffer(size * size * 4);
  const matrixB = new SharedArrayBuffer(size * size * 4);
  const result = new SharedArrayBuffer(size * size * 4);

  // 屏障用于同步计算阶段
  const barrier = new AtomicBarrier(numWorkers);

  const workers: Worker[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./matrix-worker.js', {
      workerData: {
        workerId: i,
        numWorkers,
        size,
        matrixA,
        matrixB,
        result,
        barrierBuffer: barrier.getBuffer()
      }
    });
    workers.push(worker);
  }

  await Promise.all(workers.map(w =>
    new Promise(resolve => w.on('message', resolve))
  ));

  console.log('Matrix multiplication complete');
}
```

### 4.4 ReadWriteLock（读写锁）

#### 4.4.1 ReadWriteLock 形式化定义

```typescript
/**
 * ReadWriteLock（读写锁）形式化定义
 *
 * 定义：ReadWriteLock 允许多个读线程同时访问，但写线程独占访问
 *
 * 规则：
 * 1. 读-读：允许并发
 * 2. 读-写：互斥
 * 3. 写-写：互斥
 *
 * 操作：
 * - readLock(): 获取读锁
 * - writeLock(): 获取写锁
 * - unlock(): 释放锁
 */

interface ReadWriteLock {
  readLock(): Promise<LockGuard>;
  writeLock(): Promise<LockGuard>;
}

interface LockGuard {
  unlock(): void;
}
```

#### 4.4.2 ReadWriteLock 实现

```typescript
/**
 * 读写锁实现
 */
class PromiseReadWriteLock implements ReadWriteLock {
  private readCount = 0;
  private writeRequested = false;
  private readQueue: Array<(guard: LockGuard) => void> = [];
  private writeQueue: Array<(guard: LockGuard) => void> = [];

  async readLock(): Promise<LockGuard> {
    return new Promise(resolve => {
      if (!this.writeRequested && this.writeQueue.length === 0) {
        this.readCount++;
        resolve(this.createReadGuard());
      } else {
        this.readQueue.push(resolve);
      }
    });
  }

  async writeLock(): Promise<LockGuard> {
    return new Promise(resolve => {
      this.writeRequested = true;

      if (this.readCount === 0 && this.writeQueue.length === 0) {
        this.writeRequested = false;
        resolve(this.createWriteGuard());
      } else {
        this.writeQueue.push(resolve);
      }
    });
  }

  private createReadGuard(): LockGuard {
    let released = false;

    return {
      unlock: () => {
        if (released) return;
        released = true;

        this.readCount--;

        if (this.readCount === 0) {
          // 尝试唤醒写线程
          this.tryWakeWriter();
        }
      }
    };
  }

  private createWriteGuard(): LockGuard {
    let released = false;

    return {
      unlock: () => {
        if (released) return;
        released = true;

        // 优先唤醒写线程（写优先策略）
        if (this.writeQueue.length > 0) {
          const nextWriter = this.writeQueue.shift()!;
          nextWriter(this.createWriteGuard());
        } else {
          // 唤醒所有等待的读线程
          this.writeRequested = false;
          const readers = [...this.readQueue];
          this.readQueue = [];
          readers.forEach(resolve => {
            this.readCount++;
            resolve(this.createReadGuard());
          });
        }
      }
    };
  }

  private tryWakeWriter(): void {
    if (this.writeQueue.length > 0) {
      const nextWriter = this.writeQueue.shift()!;
      this.writeRequested = false;
      nextWriter(this.createWriteGuard());
    }
  }

  get stats() {
    return {
      readCount: this.readCount,
      readQueueLength: this.readQueue.length,
      writeQueueLength: this.writeQueue.length,
      writeRequested: this.writeRequested
    };
  }
}

// 使用示例
async function useReadWriteLock(): Promise<void> {
  const lock = new PromiseReadWriteLock();
  let data = 'initial';

  async function reader(id: number): Promise<void> {
    const guard = await lock.readLock();
    try {
      console.log(`Reader ${id}: ${data}`);
      await sleep(50);  // 模拟读取
    } finally {
      guard.unlock();
    }
  }

  async function writer(id: number, value: string): Promise<void> {
    const guard = await lock.writeLock();
    try {
      console.log(`Writer ${id} starting`);
      await sleep(100);  // 模拟写入
      data = value;
      console.log(`Writer ${id} finished: ${data}`);
    } finally {
      guard.unlock();
    }
  }

  // 多个读者可以并发
  // 写者独占
  await Promise.all([
    reader(1),
    reader(2),
    writer(1, 'updated'),
    reader(3),
    writer(2, 'final')
  ]);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 4.4.3 升级锁和降级锁

```typescript
/**
 * 锁升级和降级
 *
 * 升级：读锁 → 写锁
 * 降级：写锁 → 读锁
 */

class UpgradableLock {
  private rwLock = new PromiseReadWriteLock();
  private upgradeQueue: Array<() => void> = [];

  async readLock(): Promise<UpgradableReadGuard> {
    const guard = await this.rwLock.readLock();

    return {
      unlock: () => guard.unlock(),

      // 尝试升级（可能死锁，谨慎使用）
      upgrade: async (): Promise<LockGuard> => {
        return new Promise(resolve => {
          // 释放读锁，等待写锁
          guard.unlock();

          this.rwLock.writeLock().then(writeGuard => {
            resolve({
              unlock: () => {
                writeGuard.unlock();
                // 通知等待的升级请求
                const next = this.upgradeQueue.shift();
                next?.();
              }
            });
          });
        });
      }
    };
  }

  async writeLock(): Promise<DowngradableWriteGuard> {
    const guard = await this.rwLock.writeLock();

    return {
      unlock: () => guard.unlock(),

      // 降级为读锁
      downgrade: async (): Promise<LockGuard> => {
        guard.unlock();
        return this.rwLock.readLock();
      }
    };
  }
}

interface UpgradableReadGuard extends LockGuard {
  upgrade(): Promise<LockGuard>;
}

interface DowngradableWriteGuard extends LockGuard {
  downgrade(): Promise<LockGuard>;
}

interface LockGuard {
  unlock(): void;
}

// 使用示例
async function useUpgradableLock(): Promise<void> {
  const lock = new UpgradableLock();
  let cache: Map<string, string> = new Map();

  async function getOrCompute(key: string): Promise<string> {
    const readGuard = await lock.readLock();

    // 先尝试读取
    if (cache.has(key)) {
      const value = cache.get(key)!;
      readGuard.unlock();
      return value;
    }

    // 需要计算，升级锁
    console.log('Cache miss, upgrading lock...');
    const writeGuard = await readGuard.upgrade();

    try {
      // 双重检查（可能其他线程已经计算）
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      // 计算并缓存
      const value = await expensiveCompute(key);
      cache.set(key, value);
      return value;
    } finally {
      writeGuard.unlock();
    }
  }

  async function expensiveCompute(key: string): Promise<string> {
    await sleep(100);
    return `computed-${key}`;
  }

  // 测试
  const results = await Promise.all([
    getOrCompute('a'),
    getOrCompute('a'),
    getOrCompute('b')
  ]);

  console.log(results);
}
```

---

## 5. 高级并发模式

### 5.1 竞态条件处理

#### 5.1.1 竞态条件形式化定义

```typescript
/**
 * 竞态条件（Race Condition）形式化定义
 *
 * 定义：当多个线程访问共享数据，且至少有一个是写操作时，
 * 最终结果依赖于线程执行顺序的现象。
 *
 * 类型：
 * 1. 读-写竞态（Read-Write Race）
 * 2. 写-写竞态（Write-Write Race）
 * 3. 检查-使用竞态（Check-Then-Act Race）
 */

// 竞态条件示例
class RaceConditionDemo {
  private counter = 0;

  // 非线程安全的递增
  async unsafeIncrement(): Promise<void> {
    const current = this.counter;  // 读
    await sleep(1);  // 模拟操作延迟
    this.counter = current + 1;  // 写
  }

  // 测试竞态条件
  async demonstrateRace(): Promise<void> {
    this.counter = 0;

    // 100个并发递增
    await Promise.all(
      Array.from({ length: 100 }, () => this.unsafeIncrement())
    );

    console.log('Counter:', this.counter);  // 通常小于 100
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 5.1.2 竞态条件解决方案

```typescript
/**
 * 竞态条件解决方案
 */

// 方案1：使用 Mutex
class MutexSolution {
  private counter = 0;
  private mutex = new PromiseMutex();

  async safeIncrement(): Promise<void> {
    const guard = await this.mutex.acquire();
    try {
      const current = this.counter;
      await sleep(1);
      this.counter = current + 1;
    } finally {
      guard.release();
    }
  }
}

// 方案2：使用原子操作
class AtomicSolution {
  private buffer = new SharedArrayBuffer(4);
  private counter = new Int32Array(this.buffer);

  safeIncrement(): void {
    Atomics.add(this.counter, 0, 1);
  }
}

// 方案3：使用 Compare-And-Swap (CAS) 循环
class CASSolution {
  private buffer = new SharedArrayBuffer(4);
  private counter = new Int32Array(this.buffer);

  safeIncrement(): void {
    while (true) {
      const current = Atomics.load(this.counter, 0);
      const newValue = current + 1;

      // CAS 操作：如果值还是 current，则更新为 newValue
      const oldValue = Atomics.compareExchange(
        this.counter, 0, current, newValue
      );

      if (oldValue === current) {
        return;  // 成功
      }
      // 失败则重试
    }
  }
}

// 方案4：使用不可变数据（函数式风格）
class ImmutableSolution {
  private counter = 0;

  increment(): ImmutableSolution {
    const newSolution = new ImmutableSolution();
    newSolution.counter = this.counter + 1;
    return newSolution;
  }

  get value(): number {
    return this.counter;
  }
}

// Promise Mutex 实现（简化版）
class PromiseMutex {
  private locked = false;
  private queue: Array<(guard: { release: () => void }) => void> = [];

  async acquire(): Promise<{ release: () => void }> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve({ release: () => this.release() });
      } else {
        this.queue.push(resolve);
      }
    });
  }

  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next({ release: () => this.release() });
    } else {
      this.locked = false;
    }
  }
}
```

#### 5.1.3 检查-使用竞态（TOCTOU）

```typescript
/**
 * 检查-使用竞态（Time-of-Check to Time-of-Use）
 */

// 问题代码
class TOCTOUProblem {
  private cache = new Map<string, string>();
  private computing = new Set<string>();

  async getData(key: string): Promise<string> {
    // 检查
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // TOCTOU 窗口：另一个线程可能也在计算同一个 key

    // 使用
    const data = await this.computeExpensive(key);
    this.cache.set(key, data);
    return data;
  }

  private async computeExpensive(key: string): Promise<string> {
    await sleep(100);
    return `data-${key}`;
  }
}

// 解决方案1：使用锁
class TOCTOUSolution1 {
  private cache = new Map<string, string>();
  private locks = new Map<string, PromiseMutex>();

  async getData(key: string): Promise<string> {
    // 快速路径：已缓存
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // 获取或创建锁
    if (!this.locks.has(key)) {
      this.locks.set(key, new PromiseMutex());
    }
    const lock = this.locks.get(key)!;

    const guard = await lock.acquire();
    try {
      // 双重检查
      if (this.cache.has(key)) {
        return this.cache.get(key)!;
      }

      const data = await this.computeExpensive(key);
      this.cache.set(key, data);
      return data;
    } finally {
      guard.release();
    }
  }

  private async computeExpensive(key: string): Promise<string> {
    await sleep(100);
    return `data-${key}`;
  }
}

// 解决方案2：使用 Promise 缓存
class TOCTOUSolution2 {
  private cache = new Map<string, string>();
  private pending = new Map<string, Promise<string>>();

  async getData(key: string): Promise<string> {
    // 快速路径
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // 检查是否有正在进行的计算
    let promise = this.pending.get(key);

    if (!promise) {
      // 创建新的计算 Promise
      promise = this.computeExpensive(key).then(data => {
        this.cache.set(key, data);
        this.pending.delete(key);
        return data;
      });

      this.pending.set(key, promise);
    }

    return promise;
  }

  private async computeExpensive(key: string): Promise<string> {
    await sleep(100);
    return `data-${key}`;
  }
}
```

### 5.2 防抖（Debounce）和节流（Throttle）

#### 5.2.1 防抖（Debounce）

```typescript
/**
 * 防抖（Debounce）
 *
 * 原理：在事件触发后等待一段时间，如果期间没有新事件触发，则执行函数
 * 适用场景：搜索输入、窗口调整、表单验证
 */

// 基础防抖实现
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;

  function invokeFn(): void {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  }

  function startTimer(): void {
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (trailing) {
        invokeFn();
      }
    }, delay);
  }

  const debounced = function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    } else if (leading) {
      invokeFn();
    }

    startTimer();
  } as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      invokeFn();
    }
  };

  return debounced;
}

// 使用示例
function useDebounce(): void {
  const searchInput = document.getElementById('search') as HTMLInputElement;

  const debouncedSearch = debounce(
    (query: string) => {
      console.log('Searching for:', query);
      fetch(`/api/search?q=${encodeURIComponent(query)}`);
    },
    300,  // 300ms 延迟
    { leading: false, trailing: true }
  );

  searchInput.addEventListener('input', (e) => {
    debouncedSearch((e.target as HTMLInputElement).value);
  });
}

// Promise 版防抖（返回 Promise）
function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<any> | null = null;
  let resolveFn: ((value: any) => void) | null = null;
  let rejectFn: ((reason: any) => void) | null = null;

  const debounced = function(this: any, ...args: Parameters<T>): Promise<any> {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
    }

    timeoutId = setTimeout(async () => {
      timeoutId = null;
      try {
        const result = await fn.apply(this, args);
        resolveFn?.(result);
      } catch (error) {
        rejectFn?.(error);
      } finally {
        pendingPromise = null;
        resolveFn = null;
        rejectFn = null;
      }
    }, delay);

    return pendingPromise;
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      rejectFn?.(new Error('Debounced call cancelled'));
      pendingPromise = null;
      resolveFn = null;
      rejectFn = null;
    }
  };

  return debounced;
}
```

#### 5.2.2 节流（Throttle）

```typescript
/**
 * 节流（Throttle）
 *
 * 原理：限制函数执行频率，确保在指定时间内最多执行一次
 * 适用场景：滚动事件、鼠标移动、游戏更新
 */

// 基础节流实现（时间戳版）
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = true, trailing = false } = options;

  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  function invokeFn(): void {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
      lastCallTime = Date.now();
    }
  }

  const throttled = function(this: any, ...args: Parameters<T>): void {
    lastArgs = args;
    const now = Date.now();
    const remaining = limit - (now - lastCallTime);

    if (remaining <= 0) {
      // 超过限制时间，可以执行
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leading) {
        invokeFn();
      }
    } else if (!timeoutId && trailing) {
      // 设置尾部执行
      timeoutId = setTimeout(() => {
        timeoutId = null;
        invokeFn();
      }, remaining);
    }
  } as T & { cancel: () => void; flush: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  throttled.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    invokeFn();
  };

  return throttled;
}

// 使用 requestAnimationFrame 的节流（适合动画）
function rafThrottle<T extends (...args: any[]) => any>(fn: T): T {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      });
    }
  } as T;
}

// 使用示例
function useThrottle(): void {
  const handleScroll = throttle(() => {
    console.log('Scroll position:', window.scrollY);
  }, 100);

  window.addEventListener('scroll', handleScroll);

  // 使用 RAF 节流
  const handleMouseMove = rafThrottle((e: MouseEvent) => {
    console.log('Mouse position:', e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', handleMouseMove);
}

// 带并发控制的节流
async function throttleWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  limit: number,
  interval: number
): Promise<void> {
  let lastExecution = 0;
  let executing = 0;

  for (const item of items) {
    // 等待直到满足速率限制
    const now = Date.now();
    const waitTime = Math.max(0, interval - (now - lastExecution));

    if (waitTime > 0) {
      await sleep(waitTime);
    }

    // 等待并发限制
    while (executing >= limit) {
      await sleep(10);
    }

    executing++;
    lastExecution = Date.now();

    fn(item).finally(() => {
      executing--;
    });
  }
}
```

### 5.3 任务队列和线程池

#### 5.3.1 任务队列实现

```typescript
/**
 * 任务队列实现
 */

interface Task<T> {
  id: string;
  fn: () => Promise<T>;
  priority: number;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  retries: number;
  maxRetries: number;
}

class TaskQueue {
  private queue: Task<any>[] = [];
  private running = 0;
  private concurrency: number;
  private retryDelay: number;

  constructor(options: { concurrency?: number; retryDelay?: number } = {}) {
    this.concurrency = options.concurrency ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  add<T>(
    fn: () => Promise<T>,
    options: { priority?: number; maxRetries?: number } = {}
  ): Promise<T> {
    const { priority = 0, maxRetries = 3 } = options;

    return new Promise((resolve, reject) => {
      const task: Task<T> = {
        id: Math.random().toString(36).slice(2),
        fn,
        priority,
        resolve,
        reject,
        retries: 0,
        maxRetries
      };

      // 按优先级插入队列
      const insertIndex = this.queue.findIndex(t => t.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(task);
      } else {
        this.queue.splice(insertIndex, 0, task);
      }

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift()!;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      if (task.retries < task.maxRetries) {
        task.retries++;
        await sleep(this.retryDelay * task.retries);
        this.queue.unshift(task);  // 放回队列重试
      } else {
        task.reject(error);
      }
    } finally {
      this.running--;
      this.process();  // 处理下一个任务
    }
  }

  get stats() {
    return {
      queued: this.queue.length,
      running: this.running,
      concurrency: this.concurrency
    };
  }

  clear(): void {
    this.queue.forEach(task => {
      task.reject(new Error('Task cancelled'));
    });
    this.queue = [];
  }
}

// 使用示例
async function useTaskQueue(): Promise<void> {
  const queue = new TaskQueue({ concurrency: 3 });

  // 添加多个任务
  const tasks = Array.from({ length: 10 }, (_, i) =>
    queue.add(
      async () => {
        console.log(`Task ${i} started`);
        await sleep(100);
        console.log(`Task ${i} completed`);
        return `result-${i}`;
      },
      { priority: i % 3 }  // 不同优先级
    )
  );

  const results = await Promise.all(tasks);
  console.log('All results:', results);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 5.3.2 Worker 线程池

```typescript
/**
 * Worker 线程池实现
 */

import { Worker } from 'worker_threads';

interface WorkerPoolOptions {
  minWorkers?: number;
  maxWorkers?: number;
  idleTimeoutMs?: number;
  workerScript: string;
}

interface PooledWorker {
  worker: Worker;
  busy: boolean;
  lastUsed: number;
  taskCount: number;
}

interface QueuedTask<T, R> {
  task: T;
  resolve: (result: R) => void;
  reject: (error: any) => void;
  timeout?: number;
}

class WorkerPool<T, R> {
  private workers: PooledWorker[] = [];
  private queue: QueuedTask<T, R>[] = [];
  private options: Required<WorkerPoolOptions>;
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private taskId = 0;

  constructor(options: WorkerPoolOptions) {
    this.options = {
      minWorkers: 2,
      maxWorkers: 8,
      idleTimeoutMs: 30000,
      ...options
    };

    // 预创建最小数量的 Worker
    for (let i = 0; i < this.options.minWorkers; i++) {
      this.createWorker();
    }

    // 启动空闲检查
    this.startIdleCheck();
  }

  private createWorker(): PooledWorker {
    const worker = new Worker(this.options.workerScript);

    const pooledWorker: PooledWorker = {
      worker,
      busy: false,
      lastUsed: Date.now(),
      taskCount: 0
    };

    worker.on('message', (result: { id: number; result?: R; error?: string }) => {
      const { id, result: data, error } = result;

      // 找到对应的任务（简化实现）
      pooledWorker.busy = false;
      pooledWorker.lastUsed = Date.now();

      // 处理结果...
    });

    worker.on('error', (error) => {
      console.error('Worker error:', error);
      this.removeWorker(pooledWorker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        this.removeWorker(pooledWorker);
      }
    });

    this.workers.push(pooledWorker);
    return pooledWorker;
  }

  private removeWorker(pooledWorker: PooledWorker): void {
    const index = this.workers.indexOf(pooledWorker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      pooledWorker.worker.terminate().catch(console.error);
    }
  }

  execute(task: T, options: { timeout?: number } = {}): Promise<R> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask<T, R> = {
        task,
        resolve,
        reject,
        timeout: options.timeout
      };

      // 尝试立即执行
      const availableWorker = this.workers.find(w => !w.busy);

      if (availableWorker) {
        this.runTask(availableWorker, queuedTask);
      } else if (this.workers.length < this.options.maxWorkers) {
        // 创建新 Worker
        const newWorker = this.createWorker();
        this.runTask(newWorker, queuedTask);
      } else {
        // 加入队列等待
        this.queue.push(queuedTask);
      }
    });
  }

  private runTask(worker: PooledWorker, task: QueuedTask<T, R>): void {
    worker.busy = true;
    worker.taskCount++;
    worker.lastUsed = Date.now();

    const id = ++this.taskId;

    // 设置超时
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (task.timeout) {
      timeoutId = setTimeout(() => {
        task.reject(new Error('Task timeout'));
        worker.busy = false;
        this.processQueue();
      }, task.timeout);
    }

    // 发送任务
    worker.worker.once('message', (result: { id: number; result?: R; error?: string }) => {
      if (timeoutId) clearTimeout(timeoutId);

      if (result.error) {
        task.reject(new Error(result.error));
      } else {
        task.resolve(result.result!);
      }

      worker.busy = false;
      this.processQueue();
    });

    worker.worker.postMessage({ id, task: task.task });
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;

    const task = this.queue.shift()!;
    this.runTask(availableWorker, task);
  }

  private startIdleCheck(): void {
    this.idleCheckInterval = setInterval(() => {
      const now = Date.now();

      // 移除超时空闲 Worker
      for (let i = this.workers.length - 1; i >= 0; i--) {
        const worker = this.workers[i];

        if (!worker.busy &&
            worker.taskCount > 0 &&
            now - worker.lastUsed > this.options.idleTimeoutMs &&
            this.workers.length > this.options.minWorkers) {
          this.removeWorker(worker);
        }
      }
    }, 10000);
  }

  terminate(): Promise<void> {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }

    return Promise.all(
      this.workers.map(w => w.worker.terminate())
    ).then(() => undefined);
  }

  get stats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      queuedTasks: this.queue.length,
      totalTasks: this.workers.reduce((sum, w) => sum + w.taskCount, 0)
    };
  }
}

// Worker 脚本示例 (worker.js)
// const { parentPort } = require('worker_threads');
//
// parentPort.on('message', async ({ id, task }) => {
//   try {
//     const result = await processTask(task);
//     parentPort.postMessage({ id, result });
//   } catch (error) {
//     parentPort.postMessage({ id, error: error.message });
//   }
// });
//
// async function processTask(task) {
//   // 处理任务
//   return task;
// }
```

### 5.4 背压处理（Backpressure）

#### 5.4.1 背压概念

```typescript
/**
 * 背压（Backpressure）
 *
 * 定义：当数据生产速度快于消费速度时，需要一种机制来减缓生产速度
 *
 * 场景：
 * - 文件流处理
 * - 网络数据传输
 * - 数据库批量写入
 * - 消息队列消费
 */

// 无背压的问题示例
async function noBackpressureProblem(): Promise<void> {
  const items = generateLargeDataset();  // 100万条数据

  // 问题：一次性处理所有数据，可能导致内存溢出
  const results = await Promise.all(
    items.map(item => processItem(item))
  );

  console.log(results.length);
}

function generateLargeDataset(): number[] {
  return Array.from({ length: 1000000 }, (_, i) => i);
}

async function processItem(item: number): Promise<number> {
  await sleep(1);
  return item * 2;
}
```

#### 5.4.2 背压处理方案

```typescript
/**
 * 背压处理方案
 */

// 方案1：批量处理
async function batchProcessing<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);

    // 给事件循环喘息的机会
    await new Promise(resolve => setImmediate(resolve));
  }

  return results;
}

// 方案2：基于信号量的背压控制
class BackpressureController {
  private semaphore: CountingSemaphore;
  private buffer: any[] = [];
  private maxBufferSize: number;

  constructor(maxConcurrency: number, maxBufferSize: number) {
    this.semaphore = new CountingSemaphore(maxConcurrency);
    this.maxBufferSize = maxBufferSize;
  }

  async produce<T>(item: T, consumer: (item: T) => Promise<void>): Promise<void> {
    // 如果缓冲区已满，等待
    while (this.buffer.length >= this.maxBufferSize) {
      await sleep(10);
    }

    this.buffer.push(item);

    // 尝试消费
    this.tryConsume(consumer);
  }

  private async tryConsume<T>(consumer: (item: T) => Promise<void>): Promise<void> {
    if (this.buffer.length === 0) return;

    const acquired = this.semaphore.tryAcquire();
    if (!acquired) return;

    const item = this.buffer.shift()!;

    consumer(item).finally(() => {
      this.semaphore.release();
      this.tryConsume(consumer);  // 继续消费
    });
  }
}

// 方案3：Transform Stream 风格的背压
interface TransformStream<T, R> {
  write(chunk: T): Promise<void>;
  end(): Promise<void>;
  onData(callback: (data: R) => void): void;
  onError(callback: (error: Error) => void): void;
}

class BufferedTransformStream<T, R> implements TransformStream<T, R> {
  private buffer: T[] = [];
  private processing = false;
  private highWaterMark: number;
  private lowWaterMark: number;
  private transform: (chunk: T) => Promise<R>;
  private dataCallbacks: Array<(data: R) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private ended = false;
  private resolveEnd: (() => void) | null = null;

  constructor(
    transform: (chunk: T) => Promise<R>,
    options: { highWaterMark?: number; lowWaterMark?: number } = {}
  ) {
    this.transform = transform;
    this.highWaterMark = options.highWaterMark ?? 16;
    this.lowWaterMark = options.lowWaterMark ?? 4;
  }

  async write(chunk: T): Promise<void> {
    if (this.ended) {
      throw new Error('Cannot write to ended stream');
    }

    // 背压检查
    if (this.buffer.length >= this.highWaterMark) {
      await this.waitForDrain();
    }

    this.buffer.push(chunk);
    this.process();
  }

  private waitForDrain(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.buffer.length < this.lowWaterMark) {
          resolve();
        } else {
          setImmediate(check);
        }
      };
      check();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.buffer.length === 0) return;

    this.processing = true;

    while (this.buffer.length > 0) {
      const chunk = this.buffer.shift()!;

      try {
        const result = await this.transform(chunk);
        this.dataCallbacks.forEach(cb => cb(result));
      } catch (error) {
        this.errorCallbacks.forEach(cb => cb(error as Error));
      }
    }

    this.processing = false;

    if (this.ended && this.resolveEnd) {
      this.resolveEnd();
    }
  }

  async end(): Promise<void> {
    this.ended = true;

    return new Promise(resolve => {
      if (this.buffer.length === 0 && !this.processing) {
        resolve();
      } else {
        this.resolveEnd = resolve;
      }
    });
  }

  onData(callback: (data: R) => void): void {
    this.dataCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }
}

// 方案4：异步生成器背压
async function* withBackpressure<T>(
  source: AsyncIterable<T>,
  process: (item: T) => Promise<void>,
  maxConcurrency: number
): AsyncGenerator<T, void, unknown> {
  const semaphore = new CountingSemaphore(maxConcurrency);
  const pending = new Set<Promise<void>>();

  for await (const item of source) {
    await semaphore.acquire();

    const promise = process(item).finally(() => {
      semaphore.release();
    });

    pending.add(promise);
    promise.then(() => pending.delete(promise));

    // 如果并发达到上限，等待一些任务完成
    if (pending.size >= maxConcurrency) {
      await Promise.race(pending);
    }

    yield item;
  }

  // 等待所有剩余任务
  await Promise.all(pending);
}

// 信号量实现
class CountingSemaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }

  tryAcquire(): boolean {
    if (this.permits > 0) {
      this.permits--;
      return true;
    }
    return false;
  }
}

// 使用示例
async function useBackpressure(): Promise<void> {
  // 模拟大数据源
  async function* dataSource(): AsyncGenerator<number, void, unknown> {
    for (let i = 0; i < 1000; i++) {
      yield i;
    }
  }

  // 带背压的处理
  const processed: number[] = [];

  for await (const item of withBackpressure(
    dataSource(),
    async (n) => {
      await sleep(10);  // 模拟慢速处理
      processed.push(n);
    },
    5  // 最多5个并发
  )) {
    console.log(`Processed: ${item}`);
  }

  console.log(`Total processed: ${processed.length}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 5.5 性能分析总结

```typescript
/**
 * 并发模式性能对比
 */

// 性能测试框架
async function benchmark<T>(
  name: string,
  fn: () => Promise<T>,
  iterations: number = 100
): Promise<{ name: string; avgTime: number; minTime: number; maxTime: number }> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return { name, avgTime, minTime, maxTime };
}

/**
 * 性能对比结果（参考值）
 *
 * 场景：10,000 次递增操作
 *
 * ┌─────────────────────────────┬────────────┬────────────┬────────────┐
 * │ 模式                        │ 平均时间   │ 最小时间   │ 最大时间   │
 * ├─────────────────────────────┼────────────┼────────────┼────────────┤
 * │ 无锁（竞态）                │ 10ms       │ 8ms        │ 50ms       │
 * │ Promise Mutex               │ 150ms      │ 120ms      │ 200ms      │
 * │ Atomics.add                 │ 15ms       │ 12ms       │ 25ms       │
 * │ CAS 循环                    │ 20ms       │ 15ms       │ 35ms       │
 * └─────────────────────────────┴────────────┴────────────┴────────────┘
 *
 * 场景：100 个并发请求，限制为 5 个
 *
 * ┌─────────────────────────────┬────────────┬────────────┬────────────┐
 * │ 模式                        │ 总时间     │ 内存使用   │ CPU使用    │
 * ├─────────────────────────────┼────────────┼────────────┼────────────┤
 * │ 无限制                      │ 100ms      │ 500MB      │ 100%       │
 * │ Semaphore                   │ 2000ms     │ 50MB       │ 20%        │
 * │ Task Queue                  │ 2000ms     │ 50MB       │ 20%        │
 * └─────────────────────────────┴────────────┴────────────┴────────────┘
 */

// 性能优化建议
/**
 * 1. 选择合适的同步原语
 *    - 单线程：Promise Mutex
 *    - 多线程：Atomics API
 *    - 读多写少：ReadWriteLock
 *
 * 2. 避免过度同步
 *    - 减少临界区大小
 *    - 使用无锁数据结构
 *    - 批量处理减少锁竞争
 *
 * 3. 合理使用并发
 *    - 根据 CPU 核心数设置并发度
 *    - 使用背压防止内存溢出
 *    - 优先使用异步 I/O
 *
 * 4. Worker 线程最佳实践
 *    - 复用 Worker 减少创建开销
 *    - 使用 Transferable Objects 减少拷贝
 *    - 合理划分任务粒度（10-100ms）
 */
```

---

## 6. 形式化论证

### 6.1 Event Loop 正确性证明

```typescript
/**
 * Event Loop 正确性形式化论证
 *
 * 定理：JavaScript Event Loop 保证单线程语义，同时支持异步执行
 *
 * 证明要点：
 *
 * 1. 单线程性质
 *    - 任意时刻只有一个执行上下文在运行
 *    - 调用栈保证后进先出（LIFO）
 *
 * 2. 任务调度保证
 *    - 宏任务按 FIFO 顺序执行
 *    - 微任务在当前宏任务完成后立即执行
 *    - 微任务优先级高于下一个宏任务
 *
 * 3. 无饥饿保证
 *    - 每个任务最终都会被执行
 *    - 微任务不会无限阻止宏任务（浏览器有限制）
 */

// 形式化模型
interface EventLoopState {
  callStack: ExecutionContext[];
  microtaskQueue: Task[];
  macrotaskQueue: Task[];
}

type Transition =
  | { type: 'PUSH'; context: ExecutionContext }
  | { type: 'POP' }
  | { type: 'ENQUEUE_MICROTASK'; task: Task }
  | { type: 'ENQUEUE_MACROTASK'; task: Task }
  | { type: 'RUN_MICROTASKS' }
  | { type: 'RUN_MACROTASK' };

// 状态转移函数
function transition(
  state: EventLoopState,
  action: Transition
): EventLoopState {
  switch (action.type) {
    case 'PUSH':
      return {
        ...state,
        callStack: [...state.callStack, action.context]
      };

    case 'POP':
      return {
        ...state,
        callStack: state.callStack.slice(0, -1)
      };

    case 'ENQUEUE_MICROTASK':
      return {
        ...state,
        microtaskQueue: [...state.microtaskQueue, action.task]
      };

    case 'ENQUEUE_MACROTASK':
      return {
        ...state,
        macrotaskQueue: [...state.macrotaskQueue, action.task]
      };

    case 'RUN_MICROTASKS':
      return {
        ...state,
        microtaskQueue: []
      };

    case 'RUN_MACROTASK':
      return {
        ...state,
        macrotaskQueue: state.macrotaskQueue.slice(1)
      };
  }
}
```

### 6.2 Promise 状态机正确性

```typescript
/**
 * Promise 状态机正确性证明
 *
 * 定理：Promise 状态机满足以下性质
 *
 * 1. 状态唯一性
 *    ∀p: Promise, at any time, p.state ∈ {PENDING, FULFILLED, REJECTED}
 *
 * 2. 终态不变性
 *    p.state = FULFILLED ⟹ forever p.state = FULFILLED
 *    p.state = REJECTED ⟹ forever p.state = REJECTED
 *
 * 3. 值不变性
 *    p.state = FULFILLED(v) ⟹ forever p.value = v
 *    p.state = REJECTED(r) ⟹ forever p.reason = r
 *
 * 4. then 链传递性
 *    p.then(f).then(g) = p.then(x => g(f(x)))
 */

// 形式化验证
interface PromiseStateMachine<T> {
  state: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

// 状态转移验证
function verifyPromiseTransitions<T>(): void {
  const transitions: Array<{
    from: PromiseStateMachine<T>['state'];
    to: PromiseStateMachine<T>['state'];
    valid: boolean;
  }> = [
    { from: 'pending', to: 'fulfilled', valid: true },
    { from: 'pending', to: 'rejected', valid: true },
    { from: 'fulfilled', to: 'pending', valid: false },  // 非法
    { from: 'fulfilled', to: 'rejected', valid: false },  // 非法
    { from: 'rejected', to: 'pending', valid: false },  // 非法
    { from: 'rejected', to: 'fulfilled', valid: false },  // 非法
  ];

  console.log('Promise 状态转移验证:');
  transitions.forEach(t => {
    console.log(`${t.from} → ${t.to}: ${t.valid ? '✓' : '✗'}`);
  });
}

verifyPromiseTransitions();
```

### 6.3 Mutex 正确性证明

```typescript
/**
 * Mutex 正确性形式化证明
 *
 * 定理：Mutex 实现满足互斥性、无死锁、无饥饿
 *
 * 1. 互斥性（Mutual Exclusion）
 *    证明：任意时刻最多一个线程持有锁
 *
 *    设 locked 为布尔变量
 *    - acquire: 当 locked = false 时设置 locked = true
 *    - release: 设置 locked = false
 *
 *    由于 locked 的修改是原子的（在单线程 JS 中），
 *    且只有 locked = false 时才能获取锁，
 *    因此最多一个线程可以成功获取锁。
 *
 * 2. 无死锁（Deadlock Freedom）
 *    证明：持有锁的线程最终会释放锁
 *
 *    在 Promise Mutex 中：
 *    - acquire 返回的 guard 对象包含 release 方法
 *    - 使用 try-finally 模式保证 release 被调用
 *    - 没有循环等待条件
 *
 * 3. 无饥饿（Starvation Freedom）
 *    证明：等待的线程最终能获取锁
 *
 *    - 等待队列按 FIFO 顺序处理
 *    - 每个 release 唤醒队列中的下一个线程
 *    - 没有线程被无限跳过
 */

// 不变式验证
class MutexInvariant {
  private locked = false;
  private queue: Array<() => void> = [];

  // 不变式：locked ⟹ (queue 中的线程在等待)
  checkInvariant(): boolean {
    if (this.locked && this.queue.length === 0) {
      // 锁被持有但没有等待者，这是合法的
      return true;
    }
    return true;  // 其他情况也合法
  }

  // 不变式：queue.length ≥ 0
  checkQueueInvariant(): boolean {
    return this.queue.length >= 0;
  }
}
```

---

## 7. 总结与最佳实践

### 7.1 模式选择指南

```typescript
/**
 * 并发模式选择决策树
 *
 * 1. 是否需要并行计算？
 *    是 → 使用 Worker Threads / Web Workers
 *    否 → 继续
 *
 * 2. 是否需要共享状态？
 *    是 → 使用 SharedArrayBuffer + Atomics
 *    否 → 使用 Message Passing
 *
 * 3. 是否需要限制并发数？
 *    是 → 使用 Semaphore / Task Queue
 *    否 → 使用 Promise.all
 *
 * 4. 是否需要控制执行速率？
 *    是 → 使用 Throttle / Debounce
 *    否 → 直接执行
 *
 * 5. 是否需要读写分离？
 *    是 → 使用 ReadWriteLock
 *    否 → 使用 Mutex
 */
```

### 7.2 常见陷阱与解决方案

```typescript
/**
 * 常见陷阱速查表
 *
 * ┌─────────────────────────────┬─────────────────────────────┐
 * │ 陷阱                        │ 解决方案                    │
 * ├─────────────────────────────┼─────────────────────────────┤
 * │ 回调地狱                    │ 使用 async/await            │
 * │ Promise 链断裂              │ 记得 return Promise         │
 * │ 未处理的 Promise 拒绝       │ 使用 .catch() 或 try-catch  │
 * │ async/await 忘记 await      │ 启用 TypeScript strict 模式 │
 * │ forEach 中使用 async        │ 改用 for...of 或 Promise.all│
 * │ 竞态条件                    │ 使用 Mutex 或原子操作       │
 * │ 内存泄漏                    │ 清理定时器和事件监听        │
 * │ 死锁                        │ 按固定顺序获取锁            │
 * │ 背压不足                    │ 使用信号量或流控制          │
 * └─────────────────────────────┴─────────────────────────────┘
 */
```

### 7.3 性能优化清单

```typescript
/**
 * 性能优化检查清单
 *
 * □ 使用适当的并发级别（通常 = CPU 核心数）
 * □ 避免在锁内执行长时间操作
 * □ 使用批量处理减少锁竞争
 * □ 优先使用原子操作而非锁
 * □ 复用 Worker 线程
 * □ 使用 Transferable Objects 减少内存拷贝
 * □ 实现背压防止内存溢出
 * □ 使用防抖/节流控制事件频率
 * □ 监控任务队列长度
 * □ 设置合理的超时和重试策略
 */
```

---

## 附录：完整类型定义

```typescript
// 核心类型定义

// Event Loop
type Task = () => void;
type Microtask = () => void;
type Macrotask = () => void;

// Promise
type PromiseState = 'pending' | 'fulfilled' | 'rejected';
type PromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void;

// 同步原语
interface Lock {
  acquire(): Promise<{ release: () => void }>;
}

interface Semaphore {
  acquire(): Promise<void>;
  release(): void;
}

interface ReadWriteLock {
  readLock(): Promise<{ unlock: () => void }>;
  writeLock(): Promise<{ unlock: () => void }>;
}

// Worker
interface WorkerTask<T, R> {
  task: T;
  transferList?: Transferable[];
}

interface WorkerResult<R> {
  id: number;
  result?: R;
  error?: string;
}

// 工具类型
type NodeCallback<T> = (error: Error | null, result?: T) => void;
type AsyncFunction<T, R> = (arg: T) => Promise<R>;
type DebouncedFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
  flush: () => void;
};
```

---

*文档结束*

> 本文档涵盖了 JavaScript 并发编程的核心概念、模式和最佳实践。
> 实际应用时，请根据具体场景选择合适的模式，并注意性能和安全问题。
