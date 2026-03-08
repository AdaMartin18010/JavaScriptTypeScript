/**
 * @file 事件循环深度解析
 * @category Execution Flow → Event Loop
 * @difficulty hard
 * @tags event-loop, call-stack, task-queue, microtask, v8
 * 
 * @description
 * JavaScript 事件循环的深入解析：
 * - 调用栈 (Call Stack)
 * - 任务队列 (Task Queue / Macrotask)
 * - 微任务队列 (Microtask Queue)
 * - 渲染流程
 * - 性能优化
 */

// ============================================================================
// 1. 调用栈可视化
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

  private visualize(action: 'push' | 'pop'): void {
    console.log(`\n[Call Stack] ${action.toUpperCase()}`);
    console.log('┌─────────────────────────────────────┐');
    [...this.stack].reverse().forEach((frame, i) => {
      const prefix = i === 0 ? '►' : '│';
      console.log(`${prefix} ${frame.functionName.padEnd(35)} │`);
    });
    console.log('└─────────────────────────────────────┘');
  }

  get depth(): number {
    return this.stack.length;
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}

// ============================================================================
// 2. 任务队列系统
// ============================================================================

type TaskPriority = 'high' | 'normal' | 'low';

export interface Task {
  id: string;
  type: 'macro' | 'micro' | 'animation' | 'idle';
  fn: () => void;
  priority: TaskPriority;
  createdAt: number;
}

export class TaskQueue {
  private macrotaskQueue: Task[] = [];
  private microtaskQueue: Task[] = [];
  private animationQueue: Task[] = [];
  private idleQueue: Task[] = [];
  private nextTaskId = 1;

  addMacrotask(fn: () => void, priority: TaskPriority = 'normal'): string {
    const id = `macro-${this.nextTaskId++}`;
    this.macrotaskQueue.push({
      id,
      type: 'macro',
      fn,
      priority,
      createdAt: Date.now()
    });
    this.sortQueue(this.macrotaskQueue);
    return id;
  }

  addMicrotask(fn: () => void): string {
    const id = `micro-${this.nextTaskId++}`;
    this.microtaskQueue.push({
      id,
      type: 'micro',
      fn,
      priority: 'high',
      createdAt: Date.now()
    });
    return id;
  }

  addAnimationTask(fn: () => void): string {
    const id = `anim-${this.nextTaskId++}`;
    this.animationQueue.push({
      id,
      type: 'animation',
      fn,
      priority: 'high',
      createdAt: Date.now()
    });
    return id;
  }

  // 获取下一个要执行的任务
  nextTask(): Task | null {
    // 微任务优先
    if (this.microtaskQueue.length > 0) {
      return this.microtaskQueue.shift()!;
    }
    
    // 然后是动画任务
    if (this.animationQueue.length > 0) {
      return this.animationQueue.shift()!;
    }
    
    // 最后是宏任务
    if (this.macrotaskQueue.length > 0) {
      return this.macrotaskQueue.shift()!;
    }
    
    return null;
  }

  private sortQueue(queue: Task[]): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    queue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });
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
// 3. 事件循环模拟器
// ============================================================================

export class EventLoopSimulator {
  private callStack: CallStack = new CallStack();
  private taskQueue: TaskQueue = new TaskQueue();
  private isRunning = false;
  private tickCount = 0;

  // 模拟执行代码
  async executeSync(fn: () => void, name: string): Promise<void> {
    this.callStack.push({ functionName: name });
    
    try {
      fn();
    } catch (error) {
      console.error(`Error in ${name}:`, error);
    }
    
    this.callStack.pop();
    
    // 执行完同步代码后，处理微任务
    await this.processMicrotasks();
  }

  // 安排异步任务
  setTimeout(fn: () => void, delay: number, priority: TaskPriority = 'normal'): void {
    console.log(`[setTimeout] 安排任务，延迟 ${delay}ms`);
    setTimeout(() => {
      this.taskQueue.addMacrotask(fn, priority);
    }, delay);
  }

  queueMicrotask(fn: () => void): void {
    console.log('[queueMicrotask] 添加微任务');
    this.taskQueue.addMicrotask(fn);
  }

  // 处理微任务队列
  private async processMicrotasks(): Promise<void> {
    console.log('[Event Loop] 检查微任务队列...');
    
    while (this.taskQueue.stats.micro > 0) {
      const task = this.taskQueue.nextTask();
      if (task && task.type === 'micro') {
        console.log(`[Microtask] 执行任务: ${task.id}`);
        task.fn();
      }
    }
    
    console.log('[Event Loop] 微任务队列清空');
  }

  // 运行事件循环
  async run(duration: number = 5000): Promise<void> {
    console.log('[Event Loop] 开始运行');
    this.isRunning = true;
    
    const startTime = Date.now();
    
    while (this.isRunning && Date.now() - startTime < duration) {
      this.tickCount++;
      console.log(`\n========== Tick ${this.tickCount} ==========`);
      
      // 1. 执行调用栈中的同步代码
      // 2. 清空微任务队列
      await this.processMicrotasks();
      
      // 3. 执行一个宏任务
      const task = this.taskQueue.nextTask();
      if (task && task.type === 'macro') {
        console.log(`[Macrotask] 执行任务: ${task.id}`);
        task.fn();
        
        // 宏任务执行后再次清空微任务
        await this.processMicrotasks();
      }
      
      // 4. 渲染（简化模拟）
      if (this.tickCount % 5 === 0) {
        console.log('[Render] 检查是否需要渲染');
      }
      
      // 短暂休眠模拟事件循环间隔
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查是否还有任务
      const stats = this.taskQueue.stats;
      if (this.callStack.isEmpty() && 
          stats.macro === 0 && 
          stats.micro === 0) {
        console.log('[Event Loop] 无更多任务，等待中...');
      }
    }
    
    console.log(`\n[Event Loop] 停止，共运行 ${this.tickCount} ticks`);
  }

  stop(): void {
    this.isRunning = false;
  }
}

// ============================================================================
// 4. 执行顺序示例分析
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
 * 1. console.log('1') - 同步，立即执行
 * 2. setTimeout - 宏任务，加入宏任务队列
 * 3. Promise.then - 微任务，加入微任务队列
 * 4. console.log('4') - 同步，立即执行
 * 5. 同步代码执行完毕，检查微任务队列 -> 执行 '3'
 * 6. 微任务队列为空，检查宏任务队列 -> 执行 '2'
 * 
 * 最终输出: 1, 4, 3, 2
 */

export function analyzeExecutionOrder(): void {
  console.log('=== 执行顺序分析 ===\n');
  
  console.log('代码:');
  console.log(`
console.log('1');                              // 同步
setTimeout(() => console.log('2'), 0);         // 宏任务
Promise.resolve().then(() => console.log('3')); // 微任务
console.log('4');                              // 同步
  `);
  
  console.log('\n执行流程:');
  console.log('1. console.log("1") → 立即输出: 1');
  console.log('2. setTimeout → 宏任务入队');
  console.log('3. Promise.then → 微任务入队');
  console.log('4. console.log("4") → 立即输出: 4');
  console.log('5. 同步代码结束 → 执行微任务 → 输出: 3');
  console.log('6. 微任务队列为空 → 执行宏任务 → 输出: 2');
  
  console.log('\n最终输出: 1, 4, 3, 2');
}

// ============================================================================
// 5. 性能优化建议
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
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 事件循环深度解析 ===\n');

  // 执行顺序分析
  analyzeExecutionOrder();

  // 事件循环模拟
  console.log('\n--- 事件循环模拟 ---');
  const simulator = new EventLoopSimulator();
  
  // 添加一些任务
  simulator.executeSync(() => {
    console.log('同步任务 1');
    
    simulator.queueMicrotask(() => {
      console.log('微任务 A');
    });
    
    simulator.setTimeout(() => {
      console.log('宏任务 X');
    }, 0);
    
    console.log('同步任务 2');
  }, 'main');

  // 性能建议
  console.log('\n--- 性能优化建议 ---');
  performanceTips.forEach((tip, i) => {
    console.log(`${i + 1}. ${tip.title}`);
    console.log(`   ${tip.description}`);
  });

  console.log('\n事件循环要点:');
  console.log('1. 同步代码最先执行');
  console.log('2. 微任务 (Promise) 优先于宏任务 (setTimeout)');
  console.log('3. 每一轮事件循环先清空微任务队列');
  console.log('4. 长时间任务会阻塞 UI 渲染');
}

// ============================================================================
// 导出
// ============================================================================

export {
  CallStack,
  TaskQueue,
  EventLoopSimulator,
  analyzeExecutionOrder,
  performanceTips
};

export type {
  StackFrame,
  Task,
  TaskPriority,
  PerformanceTip
};
