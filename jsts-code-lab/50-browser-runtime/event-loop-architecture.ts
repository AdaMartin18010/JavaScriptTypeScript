/**
 * @file 事件循环架构模型
 * @category Browser Runtime → Event Loop
 * @difficulty hard
 * @tags event-loop, microtask, macrotask, concurrency, scheduling
 * 
 * @model_overview
 * JavaScript 单线程并发模型的核心机制
 * 
 * 核心抽象: Event Loop (事件循环)
 * - 协调执行栈、任务队列、渲染流程
 * - 实现非阻塞 I/O
 * - 保证执行顺序和时机
 * 
 * 关键组件:
 * 1. Call Stack (执行栈)
 * 2. Heap (内存堆)
 * 3. Task Queue (Macrotask队列)
 * 4. Microtask Queue (微任务队列)
 * 5. Web APIs (浏览器提供的异步API)
 * 6. Event Loop (调度器)
 * 
 * @architecture_components
 * 
 * ## 1. 执行栈 (Call Stack)
 * 
 * LIFO (后进先出) 数据结构
 * 
 * 操作:
 * - push: 函数调用时压入栈帧
 * - pop: 函数返回时弹出栈帧
 * 
 * 栈帧包含:
 * - 局部变量
 * - 参数
 * - 返回地址
 * 
 * 栈溢出 (Stack Overflow):
 * ```javascript
 * function recursive() {
 *   recursive(); // RangeError: Maximum call stack size exceeded
 * }
 * ```
 * 
 * ## 2. 任务队列模型 (Task Queue Model)
 * 
 * ### Macrotask (宏任务) 队列
 * 任务源:
 * - setTimeout / setInterval
 * - setImmediate (Node.js)
 * - I/O 操作
 * - UI 渲染事件
 * - MessageChannel
 * 
 * 特点:
 * - 每个事件循环迭代执行一个
 * - 执行完可能触发重新渲染
 * 
 * ### Microtask (微任务) 队列
 * 任务源:
 * - Promise.then / catch / finally
 * - MutationObserver
 * - queueMicrotask()
 * - process.nextTick (Node.js)
 * 
 * 特点:
 * - 当前任务执行后立即执行
 * - 执行完所有微任务后才进行下一步
 * - 可能阻塞渲染
 * 
 * ### 队列优先级
 * ```
 * 1. 执行当前 Call Stack
 * 2. 执行所有 Microtasks (直到队列为空)
 * 3. 执行一个 Macrotask
 * 4. 渲染 (如果需要)
 * 5. 回到步骤1
 * ```
 * 
 * ## 3. Web APIs
 * 
 * 浏览器提供的异步API，运行在独立线程:
 * - DOM API
 * - Ajax (XMLHttpRequest, fetch)
 * - Timer (setTimeout, setInterval)
 * - File API
 * - Geolocation
 * 
 * 回调注册流程:
 * ```
 * 调用Web API → 异步操作 → 完成 → 回调放入队列
 * ```
 * 
 * ## 4. 渲染协调 (Rendering Coordination)
 * 
 * 浏览器渲染时机:
 * - 在Macrotask之间检查渲染
 * - 如果满足条件(60fps)则执行渲染
 * 
 * requestAnimationFrame:
 * - 在下一次渲染前执行
 * - 与显示器刷新同步 (通常60Hz)
 * 
 * requestIdleCallback:
 * - 在浏览器空闲时执行
 * - 有截止时间 (deadline)
 * 
 * @interaction_flow
 * 
 * ## 完整事件循环流程
 * 
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │                    Event Loop                       │
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                         ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 1. Is Call Stack empty?                             │
 * │    No → 继续执行栈                                  │
 * │    Yes → 继续下一步                                 │
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                         ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 2. Execute all Microtasks                           │
 * │    - 从队列取出所有微任务执行                       │
 * │    - 微任务执行中产生的微任务也立即执行             │
 * │    - 直到微任务队列为空                             │
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                         ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 3. Execute one Macrotask                            │
 * │    - 从队列取出一个宏任务执行                       │
 * │    - 只执行一个!                                    │
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                         ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 4. Render (if needed)                               │
 * │    - 检查是否需要重新渲染                           │
 * │    - 执行 requestAnimationFrame 回调                │
 * │    - 执行渲染流程                                   │
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                         ▼
 * │ 5. Go back to 1                                     │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * ## 代码执行示例分析
 * 
 * ```javascript
 * console.log('Script start');
 * 
 * setTimeout(() => {
 *   console.log('setTimeout');
 * }, 0);
 * 
 * Promise.resolve().then(() => {
 *   console.log('Promise 1');
 * });
 * 
 * Promise.resolve().then(() => {
 *   console.log('Promise 2');
 * });
 * 
 * console.log('Script end');
 * ```
 * 
 * 执行顺序分析:
 * 1. "Script start" (同步)
 * 2. setTimeout 回调注册到 Web API，0ms后加入 Macrotask 队列
 * 3. Promise 1 回调加入 Microtask 队列
 * 4. Promise 2 回调加入 Microtask 队列
 * 5. "Script end" (同步)
 * 6. 执行栈空，检查 Microtask 队列
 * 7. "Promise 1" (微任务)
 * 8. "Promise 2" (微任务)
 * 9. 执行一个 Macrotask
 * 10. "setTimeout"
 * 
 * 输出:
 * ```
 * Script start
 * Script end
 * Promise 1
 * Promise 2
 * setTimeout
 * ```
 * 
 * ## 复杂场景: 微任务递归
 * 
 * ```javascript
 * Promise.resolve().then(() => {
 *   console.log('Promise 1');
 *   Promise.resolve().then(() => {
 *     console.log('Promise 2');
 *   });
 * });
 * 
 * setTimeout(() => {
 *   console.log('setTimeout');
 * }, 0);
 * ```
 * 
 * 分析:
 * - Promise 1 执行时产生 Promise 2
 * - Promise 2 也是微任务，在同一个周期执行
 * - setTimeout 在下一个周期执行
 * 
 * 输出:
 * ```
 * Promise 1
 * Promise 2
 * setTimeout
 * ```
 * 
 * @performance_characteristics
 * 
 * ## Microtask 饥饿问题
 * 
 * 如果微任务不断产生新的微任务，会导致:
 * - Macrotask 无法执行
 * - 渲染被阻塞
 * - 页面卡顿
 * 
 * 示例:
 * ```javascript
 * function loop() {
 *   Promise.resolve().then(loop); // 危险! 递归微任务
 * }
 * loop();
 * // 页面将完全冻结
 * ```
 * 
 * 解决方案:
 * - 使用 setTimeout 让出控制权
 * - 使用 requestAnimationFrame
 * 
 * ## 定时器精度
 * 
 * setTimeout/setInterval 的最小延迟:
 * - 现代浏览器: 4ms (HTML5 spec)
 * - 嵌套5层以上: 最小4ms
 * - 后台标签: 最小1000ms
 * 
 * 不保证精确:
 * ```javascript
 * const start = Date.now();
 * setTimeout(() => {
 *   console.log(Date.now() - start); // 可能 > 0ms
 * }, 0);
 * ```
 * 
 * @optimization_strategies
 * 
 * ## 策略1: 任务拆分 (Yield to Main Thread)
 * 
 * 长任务阻塞问题:
 * ```javascript
 * // ❌ 阻塞主线程100ms
 * function heavyTask() {
 *   for (let i = 0; i < 1e9; i++) {} // 阻塞!
 * }
 * ```
 * 
 * 解决方案: 使用 setTimeout 让出
 * ```javascript
 * // ✅ 拆分为小任务
 * async function chunkedTask(items) {
 *   const chunkSize = 100;
 *   
 *   for (let i = 0; i < items.length; i += chunkSize) {
 *     await new Promise(resolve => setTimeout(resolve, 0));
 *     processChunk(items.slice(i, i + chunkSize));
 *   }
 * }
 * ```
 * 
 * ## 策略2: 使用 requestIdleCallback 执行低优先级任务
 * 
 * ```javascript
 * requestIdleCallback((deadline) => {
 *   while (deadline.timeRemaining() > 0) {
 *     // 执行任务
 *     doWork();
 *   }
 * });
 * ```
 * 
 * ## 策略3: 使用 MessageChannel 实现微任务
 * 
 * 比 Promise.then 更快的微任务:
 * ```javascript
 * const channel = new MessageChannel();
 * const port = channel.port2;
 * 
 * function nextTick(callback) {
 *   channel.port1.onmessage = callback;
 *   port.postMessage(null);
 * }
 * ```
 * 
 * ## 策略4: 合理使用 Microtask 和 Macrotask
 * 
 * - Microtask: 需要立即执行、需要原子性操作
 * - Macrotask: 可以延迟、需要让出控制权
 * 
 * @comparison_with_alternatives
 * 
 * ## 浏览器 vs Node.js 事件循环
 * 
 * | 特性 | 浏览器 | Node.js |
 * |------|--------|---------|
 * | Microtask | Promise, queueMicrotask | 同上 + process.nextTick |
 * | Macrotask | setTimeout, I/O | setTimeout, I/O, setImmediate |
 * | 阶段 | 简化 | 6个阶段 (timers, I/O, idle, poll, check, close) |
 * | nextTick | 无 | 有，优先级最高 |
 * 
 * @implementation
 */

declare global {
  interface Scheduler {
    yield(): Promise<void>;
  }
  interface Window {
    scheduler?: Scheduler;
    requestIdleCallback(callback: IdleRequestCallback, options?: { timeout?: number }): number;
    cancelIdleCallback(handle: number): void;
  }
}

// ============================================================================
// 任务调度器实现
// ============================================================================

export type TaskPriority = 'high' | 'normal' | 'low';

export interface Task {
  id: string;
  fn: () => void;
  priority: TaskPriority;
  timestamp: number;
}

export class TaskScheduler {
  private microtasks: Task[] = [];
  private macrotasks: Task[] = [];
  private isRunning = false;

  // 添加微任务
  queueMicrotask(fn: () => void, priority: TaskPriority = 'normal'): void {
    this.microtasks.push({
      id: generateId(),
      fn,
      priority,
      timestamp: Date.now()
    });
    
    // 按优先级排序
    this.microtasks.sort((a, b) => this.priorityValue(b.priority) - this.priorityValue(a.priority));
    
    this.schedule();
  }

  // 添加宏任务
  queueMacrotask(fn: () => void, delay = 0): void {
    const task: Task = {
      id: generateId(),
      fn,
      priority: 'normal',
      timestamp: Date.now()
    };

    if (delay === 0) {
      this.macrotasks.push(task);
      this.schedule();
    } else {
      setTimeout(() => {
        this.macrotasks.push(task);
        this.schedule();
      }, delay);
    }
  }

  // 执行事件循环
  private async runEventLoop(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.microtasks.length > 0 || this.macrotasks.length > 0) {
      // 1. 执行所有微任务
      while (this.microtasks.length > 0) {
        const task = this.microtasks.shift()!;
        try {
          task.fn();
        } catch (error) {
          console.error('Microtask error:', error);
        }
      }

      // 2. 执行一个宏任务
      if (this.macrotasks.length > 0) {
        const task = this.macrotasks.shift()!;
        try {
          task.fn();
        } catch (error) {
          console.error('Macrotask error:', error);
        }

        // 3. 让出控制权 (模拟渲染)
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    this.isRunning = false;
  }

  private schedule(): void {
    if (!this.isRunning) {
      this.runEventLoop();
    }
  }

  private priorityValue(priority: TaskPriority): number {
    const map = { high: 3, normal: 2, low: 1 };
    return map[priority];
  }

  getQueueStats(): { micro: number; macro: number } {
    return {
      micro: this.microtasks.length,
      macro: this.macrotasks.length
    };
  }
}

// ============================================================================
// 长任务拆分器
// ============================================================================

export class LongTaskSplitter {
  private isCancelled = false;

  // 将长任务拆分为小块
  async split<T>(
    items: T[],
    processor: (item: T) => void,
    options: {
      chunkSize?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<void> {
    const { chunkSize = 100, onProgress } = options;
    const total = items.length;
    
    for (let i = 0; i < total; i += chunkSize) {
      if (this.isCancelled) break;

      // 处理当前块
      const chunk = items.slice(i, i + chunkSize);
      chunk.forEach(processor);

      // 报告进度
      onProgress?.(Math.min(i + chunkSize, total), total);

      // 让出控制权
      if (i + chunkSize < total) {
        await this.yieldToMainThread();
      }
    }
  }

  // 使用多种策略让出控制权
  private async yieldToMainThread(): Promise<void> {
    return new Promise(resolve => {
      // 优先使用 scheduler.yield (如果可用)
      if ('scheduler' in globalThis) {
        (globalThis as unknown as Window).scheduler?.yield().then(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  cancel(): void {
    this.isCancelled = true;
  }
}

// ============================================================================
// 批量微任务处理器
// ============================================================================

export class BatchedMicrotaskProcessor {
  private batch: (() => void)[] = [];
  private scheduled = false;

  add(task: () => void): void {
    this.batch.push(task);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    queueMicrotask(() => {
      this.flush();
    });
  }

  private flush(): void {
    const tasks = this.batch;
    this.batch = [];
    this.scheduled = false;

    for (const task of tasks) {
      try {
        task();
      } catch (error) {
        console.error('Batched task error:', error);
      }
    }
  }
}

// ============================================================================
// 空闲任务调度器
// ============================================================================

export interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

export class IdleTaskScheduler {
  private tasks: Array<{
    callback: (deadline: IdleDeadline) => void;
    timeout?: number;
  }> = [];

  addTask(callback: (deadline: IdleDeadline) => void, timeout?: number): void {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout });
    } else {
      // 降级方案
      this.polyfillIdleCallback(callback);
    }
  }

  private polyfillIdleCallback(callback: (deadline: IdleDeadline) => void): void {
    const start = performance.now();
    
    setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (performance.now() - start))
      });
    }, 1);
  }
}

// ============================================================================
// 演示
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function demo(): void {
  console.log('=== 事件循环架构模型 ===\n');

  console.log('1. 任务优先级');
  const scheduler = new TaskScheduler();
  
  scheduler.queueMicrotask(() => console.log('   微任务 1'), 'normal');
  scheduler.queueMicrotask(() => console.log('   微任务 2 (高优先级)'), 'high');
  scheduler.queueMacrotask(() => console.log('   宏任务 1'));
  
  setTimeout(() => {
    const stats = scheduler.getQueueStats();
    console.log(`   队列状态: 微任务=${stats.micro}, 宏任务=${stats.macro}`);
  }, 10);

  console.log('\n2. 长任务拆分');
  const splitter = new LongTaskSplitter();
  const items = Array.from({ length: 1000 }, (_, i) => i);
  
  splitter.split(items, (item) => {
    // 处理每个项目
  }, {
    chunkSize: 100,
    onProgress: (completed, total) => {
      console.log(`   进度: ${completed}/${total}`);
    }
  });

  console.log('\n3. 批量微任务');
  const batcher = new BatchedMicrotaskProcessor();
  
  batcher.add(() => console.log('   批量任务 1'));
  batcher.add(() => console.log('   批量任务 2'));
  batcher.add(() => console.log('   批量任务 3'));

  console.log('\n4. 执行顺序示例分析');
  console.log('   console.log("Start")');
  console.log('   → 同步执行');
  console.log('   setTimeout(..., 0)');
  console.log('   → 宏任务，下次循环执行');
  console.log('   Promise.resolve().then(...)');
  console.log('   → 微任务，当前循环结束后执行');
  console.log('   console.log("End")');
  console.log('   → 同步执行');
  console.log('   最终顺序: Start → End → Promise → setTimeout');

  console.log('\n事件循环要点:');
  console.log('- 微任务优先于宏任务执行');
  console.log('- 所有微任务执行完才执行宏任务');
  console.log('- 长任务需要拆分为小块');
  console.log('- 使用 requestIdleCallback 执行低优先级任务');
  console.log('- 避免递归微任务导致页面冻结');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
