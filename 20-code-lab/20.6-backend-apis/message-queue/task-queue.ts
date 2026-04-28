/**
 * @file 任务队列
 * @category Message Queue → Task Queue
 * @difficulty medium
 * @tags task-queue, job-queue, worker-queue, background-jobs
 *
 * @description
 * 任务队列实现：任务调度、优先级队列、重试机制、死信队列
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Task<T = unknown> {
  id: string;
  type: string;
  payload: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  scheduledAt: number;
  timeout?: number;
  retries?: number[]; // 重试延迟（毫秒）
}

export type TaskHandler<T = unknown> = (task: Task<T>) => Promise<void>;

export interface TaskResult {
  success: boolean;
  error?: Error;
  retryAfter?: number;
}

export interface QueueOptions {
  concurrency?: number;
  autoStart?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

// ============================================================================
// 优先队列
// ============================================================================

export class PriorityQueue<T extends { priority: number }> {
  private items: T[] = [];

  /**
   * 添加元素（按优先级排序，数字小的优先）
   */
  enqueue(item: T): void {
    const index = this.items.findIndex(i => i.priority > item.priority);
    if (index === -1) {
      this.items.push(item);
    } else {
      this.items.splice(index, 0, item);
    }
  }

  /**
   * 移除并返回优先级最高的元素
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * 查看优先级最高的元素
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * 队列大小
   */
  size(): number {
    return this.items.length;
  }

  /**
   * 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * 移除指定元素
   */
  remove(predicate: (item: T) => boolean): T | undefined {
    const index = this.items.findIndex(predicate);
    if (index > -1) {
      return this.items.splice(index, 1)[0];
    }
    return undefined;
  }

  /**
   * 获取所有元素
   */
  toArray(): T[] {
    return [...this.items];
  }
}

// ============================================================================
// 任务队列
// ============================================================================

export class TaskQueue {
  private queue = new PriorityQueue<Task>();
  private handlers = new Map<string, TaskHandler>();
  private running = new Set<string>();
  private processing = false;
  private paused = false;
  private options: Required<QueueOptions>;
  private stats = { completed: 0, failed: 0, retried: 0 };
  private listeners = new Map<string, ((task: Task, result?: TaskResult) => void)[]>();

  constructor(options: QueueOptions = {}) {
    this.options = {
      concurrency: 1,
      autoStart: true,
      retryDelay: 5000,
      maxRetries: 3,
      ...options
    };
  }

  /**
   * 注册任务处理器
   */
  registerHandler<T>(type: string, handler: TaskHandler<T>): void {
    this.handlers.set(type, handler as TaskHandler);
  }

  /**
   * 添加任务
   */
  add<T>(type: string, payload: T, options: {
    priority?: number;
    delay?: number;
    timeout?: number;
    maxAttempts?: number;
  } = {}): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const task: Task<T> = {
      id,
      type,
      payload,
      priority: options.priority ?? 10,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? this.options.maxRetries + 1,
      createdAt: Date.now(),
      scheduledAt: options.delay ? Date.now() + options.delay : Date.now(),
      timeout: options.timeout
    };

    this.queue.enqueue(task);
    this.emit('added', task);

    if (this.options.autoStart && !this.processing && !this.paused) {
      this.process();
    }

    return id;
  }

  /**
   * 延迟执行任务
   */
  schedule<T>(type: string, payload: T, delayMs: number, options: { priority?: number } = {}): string {
    return this.add(type, payload, { ...options, delay: delayMs });
  }

  /**
   * 开始处理队列
   */
  start(): void {
    this.paused = false;
    if (!this.processing) {
      this.process();
    }
  }

  /**
   * 暂停队列
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * 清空队列
   */
  clear(): void {
    while (!this.queue.isEmpty()) {
      this.queue.dequeue();
    }
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    pending: number;
    running: number;
    paused: boolean;
    processing: boolean;
  } {
    return {
      pending: this.queue.size(),
      running: this.running.size,
      paused: this.paused,
      processing: this.processing
    };
  }

  /**
   * 获取统计
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * 订阅事件
   */
  on(event: string, listener: (task: Task, result?: TaskResult) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  private async process(): Promise<void> {
    if (this.processing || this.paused) return;
    
    this.processing = true;

    while (!this.paused && (this.running.size < this.options.concurrency)) {
      const task = this.getNextTask();
      
      if (!task) {
        break;
      }

      this.running.add(task.id);
      this.executeTask(task).finally(() => {
        this.running.delete(task.id);
      });
    }

    this.processing = false;

    // 如果没有任务了，检查是否需要继续处理
    if (!this.paused && !this.queue.isEmpty()) {
      this.process();
    }
  }

  private getNextTask(): Task | undefined {
    const now = Date.now();
    
    // 查看队列中的任务，找到可以执行的
    const tasks = this.queue.toArray();
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].scheduledAt <= now) {
        // 从队列中移除并返回
        return this.queue.remove(t => t.id === tasks[i].id);
      }
    }
    
    return undefined;
  }

  private async executeTask(task: Task): Promise<void> {
    const handler = this.handlers.get(task.type);
    
    if (!handler) {
      console.error(`[TaskQueue] No handler for task type: ${task.type}`);
      this.stats.failed++;
      this.emit('failed', task, { success: false, error: new Error('No handler') });
      this.scheduleNext();
      return;
    }

    task.attempts++;
    this.emit('started', task);

    try {
      // 设置超时
      if (task.timeout) {
        await this.runWithTimeout(handler, task, task.timeout);
      } else {
        await handler(task);
      }

      this.stats.completed++;
      this.emit('completed', task, { success: true });
    } catch (error) {
      await this.handleTaskError(task, error as Error);
    } finally {
      this.scheduleNext();
    }
  }

  private async runWithTimeout(handler: TaskHandler, task: Task, timeout: number): Promise<void> {
    return Promise.race([
      handler(task),
      new Promise<void>((_, reject) => 
        setTimeout(() => { reject(new Error('Task timeout')); }, timeout)
      )
    ]);
  }

  private async handleTaskError(task: Task, error: Error): Promise<void> {
    const shouldRetry = task.attempts < task.maxAttempts;

    if (shouldRetry) {
      this.stats.retried++;
      
      // 计算重试延迟（指数退避）
      const retryDelay = this.options.retryDelay * Math.pow(2, task.attempts - 1);
      task.scheduledAt = Date.now() + retryDelay;
      
      console.log(`[TaskQueue] Retrying task ${task.id} after ${retryDelay}ms (attempt ${task.attempts})`);
      
      this.queue.enqueue(task);
      this.emit('retrying', task, { success: false, error, retryAfter: retryDelay });
    } else {
      this.stats.failed++;
      console.error(`[TaskQueue] Task ${task.id} failed after ${task.attempts} attempts:`, error);
      this.emit('failed', task, { success: false, error });
    }
  }

  private scheduleNext(): void {
    // 延迟调度下一个任务，避免堆栈溢出
    setImmediate(() => {
      if (!this.paused && !this.queue.isEmpty() && this.running.size < this.options.concurrency) {
        this.process();
      }
    });
  }

  private emit(event: string, task: Task, result?: TaskResult): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(task, result);
        } catch (err) {
          console.error(`[TaskQueue] Event listener error:`, err);
        }
      });
    }
  }
}

// ============================================================================
// 工作池
// ============================================================================

export class WorkerPool {
  private queue: TaskQueue;
  private workers = new Map<string, { busy: boolean; task?: Task }>();

  constructor(workerCount: number) {
    this.queue = new TaskQueue({ concurrency: workerCount });
    
    // 创建工作线程标识
    for (let i = 0; i < workerCount; i++) {
      this.workers.set(`worker-${i}`, { busy: false });
    }
  }

  /**
   * 执行任务
   */
  execute<T>(type: string, payload: T, options?: Parameters<TaskQueue['add']>[2]): Promise<void> {
    return new Promise((resolve, reject) => {
      const taskId = this.queue.add(type, payload, options);

      const checkComplete = () => {
        const status = this.queue.getStatus();
        if (status.pending === 0 && status.running === 0) {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };

      // 简单实现：等待队列清空
      setTimeout(checkComplete, 100);
    });
  }

  /**
   * 注册处理器
   */
  registerHandler<T>(type: string, handler: TaskHandler<T>): void {
    this.queue.registerHandler(type, handler);
  }

  /**
   * 获取工作池状态
   */
  getStatus(): ReturnType<TaskQueue['getStatus']> {
    return this.queue.getStatus();
  }
}

// ============================================================================
// 死信队列
// ============================================================================

export class DeadLetterQueue {
  private failedTasks: { task: Task; error: Error; failedAt: number }[] = [];
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * 添加失败任务
   */
  add(task: Task, error: Error): void {
    this.failedTasks.push({
      task,
      error,
      failedAt: Date.now()
    });

    // 限制大小
    if (this.failedTasks.length > this.maxSize) {
      this.failedTasks.shift();
    }
  }

  /**
   * 获取所有失败任务
   */
  getAll(): { task: Task; error: Error; failedAt: number }[] {
    return [...this.failedTasks];
  }

  /**
   * 重新处理任务
   */
  retry(taskId: string, queue: TaskQueue): boolean {
    const index = this.failedTasks.findIndex(item => item.task.id === taskId);
    if (index === -1) return false;

    const { task } = this.failedTasks[index];
    
    // 重置任务状态
    task.attempts = 0;
    task.scheduledAt = Date.now();
    
    // 重新添加到队列
    queue.add(task.type, task.payload, {
      priority: task.priority,
      maxAttempts: task.maxAttempts
    });

    // 从死信队列移除
    this.failedTasks.splice(index, 1);
    
    return true;
  }

  /**
   * 清空死信队列
   */
  clear(): void {
    this.failedTasks = [];
  }

  /**
   * 获取统计
   */
  getStats(): { count: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    for (const { task } of this.failedTasks) {
      byType[task.type] = (byType[task.type] || 0) + 1;
    }

    return {
      count: this.failedTasks.length,
      byType
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 任务队列演示 ===\n');

  // 1. 优先队列
  console.log('--- 优先队列 ---');
  const pq = new PriorityQueue<{ id: string; priority: number; data: string }>();
  
  pq.enqueue({ id: '1', priority: 10, data: 'Low priority' });
  pq.enqueue({ id: '2', priority: 1, data: 'High priority' });
  pq.enqueue({ id: '3', priority: 5, data: 'Medium priority' });
  pq.enqueue({ id: '4', priority: 1, data: 'Also high priority' });

  console.log('Queue order:');
  while (!pq.isEmpty()) {
    const item = pq.dequeue();
    console.log(`  ${item?.id}: ${item?.data} (priority: ${item?.priority})`);
  }

  // 2. 任务队列
  console.log('\n--- 任务队列 ---');
  const queue = new TaskQueue({ concurrency: 2 });

  // 注册处理器
  queue.registerHandler('email', async (task) => {
    console.log(`  [Email] Sending to: ${(task.payload as { to: string }).to}`);
    await delay(100);
  });

  queue.registerHandler('report', async (task) => {
    console.log(`  [Report] Generating: ${(task.payload as { name: string }).name}`);
    await delay(200);
  });

  // 添加任务
  queue.add('email', { to: 'user1@example.com' }, { priority: 5 });
  queue.add('email', { to: 'user2@example.com' }, { priority: 3 });
  queue.add('report', { name: 'monthly' }, { priority: 1 });

  // 监听事件
  queue.on('completed', (task) => {
    console.log(`  ✓ Task completed: ${task.id}`);
  });

  // 等待任务完成
  setTimeout(() => {
    console.log('\n--- 队列统计 ---');
    console.log('  Status:', queue.getStatus());
    console.log('  Stats:', queue.getStats());
  }, 500);

  // 3. 延迟任务
  console.log('\n--- 延迟任务 ---');
  const delayQueue = new TaskQueue();
  
  delayQueue.registerHandler('reminder', async (task) => {
    console.log(`  [Reminder] ${task.payload} at ${new Date().toLocaleTimeString()}`);
  });

  const now = Date.now();
  delayQueue.schedule('reminder', 'Meeting in 5 minutes', 100);
  delayQueue.schedule('reminder', 'Lunch time', 200);

  // 4. 死信队列
  console.log('\n--- 死信队列 ---');
  const dlq = new DeadLetterQueue();
  
  const failedTask: Task = {
    id: 'task-1',
    type: 'critical-job',
    payload: { data: 'important' },
    priority: 1,
    attempts: 3,
    maxAttempts: 3,
    createdAt: Date.now(),
    scheduledAt: Date.now()
  };

  dlq.add(failedTask, new Error('Connection timeout'));
  console.log('DLQ stats:', dlq.getStats());
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
