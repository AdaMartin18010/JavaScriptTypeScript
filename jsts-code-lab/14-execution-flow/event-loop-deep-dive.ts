/**
 * @file 事件循环深度解析
 * @category Execution Flow → Event Loop
 * @difficulty hard
 * @tags event-loop, call-stack, task-queue, microtask, v8
 *
 * @description
 * JavaScript 事件循环的学术精确模拟器，基于三层边界模型：
 * 1. V8 引擎层（V8Engine）：负责同步代码执行与调用栈管理。
 * 2. Host 层（HTML / Node.js）：负责任务队列（macrotask、microtask、animation、idle）的调度。
 * 3. 事件循环层（EventLoop）：将 Engine 与 Host 组合，驱动 tick 循环。
 *
 * 关键行为：
 * - 每次同步代码执行完毕后，Host 触发 microtask checkpoint，清空 microtask queue。
 * - 每个 tick 执行一个到期的宏任务，随后清空微任务队列。
 * - 在渲染机会（rendering opportunity）时，先执行 animation frame callbacks，然后执行 rendering（日志模拟）。
 */

// ============================================================================
// 0. 工具函数
// ============================================================================

const sleep = (ms: number): Promise<void> => new Promise(resolve => { setTimeout(resolve, ms); });

// ============================================================================
// 1. 调用栈与执行上下文（JavaScript / V8 层）
// ============================================================================

export interface StackFrame {
  functionName: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export class CallStack {
  private stack: StackFrame[] = [];

  push(frame: StackFrame): void {
    this.stack.push(frame);
    this.visualize('push');
  }

  pop(): StackFrame | undefined {
    const frame = this.stack.pop();
    this.visualize('pop');
    return frame;
  }

  peek(): StackFrame | undefined {
    return this.stack[this.stack.length - 1];
  }

  currentContext(): StackFrame | undefined {
    return this.peek();
  }

  get depth(): number {
    return this.stack.length;
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  private visualize(action: 'push' | 'pop'): void {
    console.log(`\n[Call Stack] ${action.toUpperCase()}`);
    console.log('┌─────────────────────────────────────┐');
    [...this.stack].reverse().forEach((frame, i) => {
      const prefix = i === 0 ? '►' : '│';
      console.log(`${prefix} ${frame.functionName.padEnd(35)} │`);
    });
    console.log('└─────────────────────────────────────┘');
  }
}

// ============================================================================
// 2. 任务类型系统（Host 层）
// ============================================================================

export type TaskPriority = 'high' | 'normal' | 'low';

type BaseTask = {
  id: string;
  priority: TaskPriority;
  createdAt: number;
};

export type MacroTask = BaseTask & {
  type: 'macro';
  fn: () => void;
  scheduledAt: number;
  delay: number;
};

export type MicroTask = BaseTask & {
  type: 'micro';
  fn: () => void;
};

export type AnimationTask = BaseTask & {
  type: 'animation';
  fn: () => void;
};

export type IdleTask = BaseTask & {
  type: 'idle';
  fn: () => void;
};

export type Task = MacroTask | MicroTask | AnimationTask | IdleTask;

// ============================================================================
// 3. V8Engine —— 引擎层：同步执行与调用栈
// ============================================================================

export class V8Engine {
  private callStack = new CallStack();

  /**
   * 在调用栈上执行一段同步代码。
   * 执行前后分别 push / pop 执行上下文。
   */
  executeSync<T>(fn: () => T, contextName: string): T {
    this.callStack.push({ functionName: contextName });
    try {
      return fn();
    } catch (error: unknown) {
      console.error(`[V8Engine] Error in ${contextName}:`, error);
      throw error;
    } finally {
      this.callStack.pop();
    }
  }

  get stack(): CallStack {
    return this.callStack;
  }
}

// ============================================================================
// 4. HostScheduler —— Host 层：任务队列管理与调度
// ============================================================================

export class HostScheduler {
  private macrotaskQueue: MacroTask[] = [];
  private microtaskQueue: MicroTask[] = [];
  private animationQueue: AnimationTask[] = [];
  private idleQueue: IdleTask[] = [];
  private nextTaskId = 1;

  scheduleMacrotask(
    fn: () => void,
    delay: number,
    priority: TaskPriority = 'normal',
    now: number = Date.now()
  ): string {
    const id = `macro-${this.nextTaskId++}`;
    this.macrotaskQueue.push({
      id,
      type: 'macro',
      fn,
      priority,
      createdAt: now,
      scheduledAt: now,
      delay
    });
    console.log(`[HostScheduler] setTimeout scheduled: ${id}, delay=${delay}ms`);
    return id;
  }

  scheduleMicrotask(fn: () => void): string {
    const id = `micro-${this.nextTaskId++}`;
    this.microtaskQueue.push({
      id,
      type: 'micro',
      fn,
      priority: 'high',
      createdAt: Date.now()
    });
    console.log(`[HostScheduler] queueMicrotask: ${id}`);
    return id;
  }

  scheduleAnimationTask(fn: () => void): string {
    const id = `anim-${this.nextTaskId++}`;
    this.animationQueue.push({
      id,
      type: 'animation',
      fn,
      priority: 'high',
      createdAt: Date.now()
    });
    console.log(`[HostScheduler] requestAnimationFrame: ${id}`);
    return id;
  }

  /**
   * 获取并移除一个已到期的宏任务。
   * 优先返回优先级最高、且最先创建的到期任务。
   */
  getDueMacrotask(now: number): MacroTask | null {
    const eligible = this.macrotaskQueue.filter(t => t.scheduledAt + t.delay <= now);
    if (eligible.length === 0) {
      return null;
    }
    const priorityOrder: Record<TaskPriority, number> = { high: 0, normal: 1, low: 2 };
    eligible.sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return a.createdAt - b.createdAt;
    });
    const task = eligible[0]!;
    const index = this.macrotaskQueue.indexOf(task);
    if (index > -1) {
      this.macrotaskQueue.splice(index, 1);
    }
    return task;
  }

  /**
   * microtask checkpoint。
   * 循环清空 microtask queue，直到不再产生新的微任务。
   * 体现规范：一个宏任务执行完毕后，必须清空全部微任务。
   */
  drainMicrotasks(engine: V8Engine): void {
    if (this.microtaskQueue.length === 0) {
      return;
    }
    console.log('[HostScheduler] microtask checkpoint start');
    while (this.microtaskQueue.length > 0) {
      const task = this.microtaskQueue.shift()!;
      console.log(`[HostScheduler] running microtask: ${task.id}`);
      engine.executeSync(task.fn, task.id);
    }
    console.log('[HostScheduler] microtask checkpoint end');
  }

  /**
   * 处理渲染机会（rendering opportunity）。
   * 先执行 animation frame callbacks，然后执行 rendering（仅日志模拟）。
   */
  processRenderingOpportunity(engine: V8Engine): void {
    if (this.animationQueue.length > 0) {
      console.log('[HostScheduler] rendering opportunity: animation frame callbacks');
      while (this.animationQueue.length > 0) {
        const task = this.animationQueue.shift()!;
        console.log(`[HostScheduler] running animation task: ${task.id}`);
        engine.executeSync(task.fn, task.id);
      }
    }
    console.log('[HostScheduler] rendering (style & layout calculation, paint, composite)');
  }

  /**
   * 检查是否还有任何已到期或待处理的任务。
   */
  hasPendingTasks(now: number): boolean {
    return (
      this.microtaskQueue.length > 0 ||
      this.animationQueue.length > 0 ||
      this.idleQueue.length > 0 ||
      this.macrotaskQueue.some(t => t.scheduledAt + t.delay <= now)
    );
  }

  get stats(): {
    macro: number;
    micro: number;
    animation: number;
    idle: number;
  } {
    return {
      macro: this.macrotaskQueue.length,
      micro: this.microtaskQueue.length,
      animation: this.animationQueue.length,
      idle: this.idleQueue.length
    };
  }
}

// ============================================================================
// 5. EventLoop —— 将 V8Engine 与 HostScheduler 组合，驱动 tick 循环
// ============================================================================

export class EventLoop {
  private engine = new V8Engine();
  private scheduler = new HostScheduler();
  private isRunning = false;
  private tickCount = 0;

  /**
   * 执行同步代码，并在同步代码结束后触发 microtask checkpoint。
   * 对应初始脚本或 eval 的同步执行阶段。
   */
  executeSync<T>(fn: () => T, name: string): T {
    const result = this.engine.executeSync(fn, name);
    this.scheduler.drainMicrotasks(this.engine);
    return result;
  }

  /**
   * 模拟 setTimeout：仅将回调推入 HostScheduler 的 macrotask queue。
   * 不使用原生 setTimeout，避免真实异步与模拟器混淆。
   */
  setTimeout(fn: () => void, delay: number, priority: TaskPriority = 'normal'): void {
    this.scheduler.scheduleMacrotask(fn, delay, priority);
  }

  queueMicrotask(fn: () => void): void {
    this.scheduler.scheduleMicrotask(fn);
  }

  requestAnimationFrame(fn: () => void): void {
    this.scheduler.scheduleAnimationTask(fn);
  }

  /**
   * 启动事件循环。
   * 使用基于 Date.now() 的轮询循环（while + await sleep(50)）模拟时间推进。
   */
  async run(duration: number = 5000): Promise<void> {
    console.log('[EventLoop] 开始运行');
    this.isRunning = true;
    const startTime = Date.now();

    while (this.isRunning) {
      const now = Date.now();
      if (now - startTime >= duration) {
        break;
      }

      this.tickCount++;
      console.log(`\n========== Tick ${this.tickCount} @ ${now - startTime}ms ==========`);

      // Host 层：调度并执行一个到期的宏任务
      const macro = this.scheduler.getDueMacrotask(now);
      if (macro) {
        console.log(`[EventLoop] 执行宏任务: ${macro.id}`);
        this.engine.executeSync(macro.fn, macro.id);
        // 宏任务结束后触发 microtask checkpoint（V8 规范行为）
        this.scheduler.drainMicrotasks(this.engine);
      }

      // 若外部直接插入了微任务，也一并清空
      if (!macro && this.scheduler.stats.micro > 0) {
        this.scheduler.drainMicrotasks(this.engine);
      }

      // 渲染机会：每 3 个 tick 或存在动画任务时触发
      const isRenderingOpportunity = this.tickCount % 3 === 0 || this.scheduler.stats.animation > 0;
      if (isRenderingOpportunity) {
        this.scheduler.processRenderingOpportunity(this.engine);
      }

      const hasPending = this.scheduler.hasPendingTasks(now);
      if (!hasPending && this.engine.stack.isEmpty()) {
        console.log('[EventLoop] 无更多到期任务，等待时间推进...');
      }

      await sleep(50);
    }

    console.log(`\n[EventLoop] 停止，共运行 ${this.tickCount} ticks`);
    this.isRunning = false;
  }

  stop(): void {
    this.isRunning = false;
  }

  get callStack(): CallStack {
    return this.engine.stack;
  }

  get stats(): { tickCount: number; macro: number; micro: number; animation: number; idle: number } {
    return { tickCount: this.tickCount, ...this.scheduler.stats };
  }
}

// ============================================================================
// 6. 执行顺序示例分析
// ============================================================================

/**
 * 经典面试题执行顺序分析：
 *
 * console.log('1');
 * setTimeout(() => console.log('2'), 0);
 * Promise.resolve().then(() => console.log('3'));
 * console.log('4');
 *
 * 执行顺序：
 * 1. console.log('1') — [V8 同步执行] 立即执行
 * 2. setTimeout — [Host 调度宏任务] 加入 macrotask queue
 * 3. Promise.then — [Host 调度微任务] 加入 microtask queue
 * 4. console.log('4') — [V8 同步执行] 立即执行
 * 5. 同步代码执行完毕 — [Host 调度微任务] 触发 microtask checkpoint → 执行 '3'
 * 6. 微任务队列为空 — [Host 调度宏任务] 执行宏任务 → 执行 '2'
 *
 * 最终输出: 1, 4, 3, 2
 */

export function analyzeExecutionOrder(): void {
  console.log('=== 执行顺序分析 ===\n');

  console.log('代码:');
  console.log(`
console.log('1');                              // [V8 同步执行]
setTimeout(() => console.log('2'), 0);         // [Host 调度宏任务]
Promise.resolve().then(() => console.log('3')); // [Host 调度微任务]
console.log('4');                              // [V8 同步执行]
  `);

  console.log('\n执行流程:');
  console.log('1. console.log("1") → [V8 同步执行] 立即输出: 1');
  console.log('2. setTimeout → [Host 调度宏任务] 宏任务入队');
  console.log('3. Promise.then → [Host 调度微任务] 微任务入队');
  console.log('4. console.log("4") → [V8 同步执行] 立即输出: 4');
  console.log('5. 同步代码结束 → [Host 调度微任务] 触发 microtask checkpoint → 输出: 3');
  console.log('6. 微任务队列为空 → [Host 调度宏任务] 执行宏任务 → 输出: 2');

  console.log('\n最终输出: 1, 4, 3, 2');
}

// ============================================================================
// 7. 性能优化建议
// ============================================================================

export interface PerformanceTip {
  title: string;
  description: string;
  badExample: string;
  goodExample: string;
}

export const performanceTips: PerformanceTip[] = [
  {
    title: '避免长时间运行的同步代码',
    description: '同步代码会阻塞事件循环',
    badExample: 'for (let i = 0; i < 1e9; i++) {}',
    goodExample: '使用 setTimeout 或 requestIdleCallback 分片执行'
  },
  {
    title: '优先使用微任务',
    description: 'Promise 比 setTimeout 更快执行',
    badExample: 'setTimeout(fn, 0)',
    goodExample: 'Promise.resolve().then(fn)'
  },
  {
    title: '使用 requestAnimationFrame 进行视觉更新',
    description: '确保在渲染前执行视觉相关的代码',
    badExample: 'setTimeout(updateUI, 16)',
    goodExample: 'requestAnimationFrame(updateUI)'
  },
  {
    title: '批量处理 DOM 操作',
    description: '减少重排重绘次数',
    badExample: '循环中多次修改 DOM',
    goodExample: '使用 DocumentFragment 批量插入'
  }
];

// ============================================================================
// 8. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 事件循环深度解析 ===\n');

  // 执行顺序分析
  analyzeExecutionOrder();

  // 事件循环模拟
  console.log('\n--- 事件循环模拟 ---');
  const loop = new EventLoop();

  // 1. 同步代码执行 + 微任务 + 宏任务 + 嵌套微任务
  loop.executeSync(() => {
    console.log('同步任务 1');

    loop.queueMicrotask(() => {
      console.log('微任务 A');
      // 嵌套微任务：在 microtask checkpoint 中继续产生的新微任务
      loop.queueMicrotask(() => {
        console.log('嵌套微任务 A1');
      });
    });

    loop.setTimeout(() => {
      console.log('宏任务 X');
    }, 0);

    console.log('同步任务 2');
  }, 'main');

  // 启动事件循环，让宏任务得以执行
  await loop.run(500);

  // 性能建议
  console.log('\n--- 性能优化建议 ---');
  performanceTips.forEach((tip, i) => {
    console.log(`${i + 1}. ${tip.title}`);
    console.log(`   ${tip.description}`);
  });

  console.log('\n事件循环要点:');
  console.log('1. 同步代码最先执行（V8Engine.executeSync）');
  console.log('2. 微任务（Promise / queueMicrotask）在同步代码结束后由 HostScheduler 立即清空');
  console.log('3. 宏任务（setTimeout）在每个 tick 中由 HostScheduler 调度');
  console.log('4. 每一轮事件循环先清空微任务队列，再进入下一轮宏任务');
  console.log('5. 长时间任务会阻塞 UI 渲染');
}
