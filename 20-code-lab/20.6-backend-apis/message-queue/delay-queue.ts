/**
 * @file 延迟队列
 * @category Message Queue → Delay Queue
 * @difficulty medium
 * @tags delay-queue, scheduled-tasks, timed-messages
 *
 * @description
 * 延迟队列实现：支持精确延迟、定时任务、周期性任务、时间轮算法
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface DelayedMessage<T = unknown> {
  id: string;
  payload: T;
  executeAt: number;
  attempts: number;
  maxAttempts: number;
  priority: number;
  createdAt: number;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  nextRun: number;
  handler: () => void | Promise<void>;
  enabled: boolean;
}

export type DelayHandler<T> = (message: T) => void | Promise<void>;

// ============================================================================
// 时间轮 (Timing Wheel)
// ============================================================================

export class TimingWheel {
  private wheel = new Map<number, DelayedMessage[]>();
  private tickMs: number;
  private wheelSize: number;
  private currentTick = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private handlers = new Map<string, DelayHandler<unknown>>();

  constructor(tickMs = 100, wheelSize = 20) {
    this.tickMs = tickMs;
    this.wheelSize = wheelSize;
  }

  /**
   * 启动时间轮
   */
  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.tick();
    }, this.tickMs);
  }

  /**
   * 停止时间轮
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 添加消息
   */
  schedule<T>(delayMs: number, message: Omit<DelayedMessage<T>, 'executeAt'>): void {
    const executeAt = Date.now() + delayMs;
    const tick = Math.floor(delayMs / this.tickMs) % this.wheelSize;
    
    const fullMessage: DelayedMessage<T> = {
      ...message,
      executeAt
    };

    if (!this.wheel.has(tick)) {
      this.wheel.set(tick, []);
    }
    
    this.wheel.get(tick)!.push(fullMessage as DelayedMessage);
  }

  /**
   * 注册处理器
   */
  registerHandler<T>(type: string, handler: DelayHandler<T>): void {
    this.handlers.set(type, handler as DelayHandler<unknown>);
  }

  private tick(): void {
    const messages = this.wheel.get(this.currentTick) || [];
    this.wheel.delete(this.currentTick);

    const now = Date.now();
    const ready: DelayedMessage[] = [];
    const requeue: DelayedMessage[] = [];

    for (const msg of messages) {
      if (msg.executeAt <= now) {
        ready.push(msg);
      } else {
        // 还没到时间，重新计算 tick
        const remainingMs = msg.executeAt - now;
        if (remainingMs > this.tickMs * this.wheelSize) {
          // 超出当前轮范围，放入下一轮
          requeue.push(msg);
        } else {
          const tick = (this.currentTick + Math.ceil(remainingMs / this.tickMs)) % this.wheelSize;
          if (!this.wheel.has(tick)) {
            this.wheel.set(tick, []);
          }
          this.wheel.get(tick)!.push(msg);
        }
      }
    }

    // 处理就绪的消息
    for (const msg of ready) {
      this.handleMessage(msg);
    }

    // 重新入队超范围的消息
    for (const msg of requeue) {
      const tick = this.currentTick;
      if (!this.wheel.has(tick)) {
        this.wheel.set(tick, []);
      }
      this.wheel.get(tick)!.push(msg);
    }

    this.currentTick = (this.currentTick + 1) % this.wheelSize;
  }

  private handleMessage(message: DelayedMessage): void {
    // 这里简化处理，实际应该根据消息类型调用对应的 handler
    console.log(`[TimingWheel] Executing message ${message.id} at ${new Date().toISOString()}`);
  }
}

// ============================================================================
// 延迟队列实现
// ============================================================================

export class DelayQueue<T = unknown> {
  private messages: DelayedMessage<T>[] = [];
  private handlers = new Map<string, DelayHandler<T>>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private processing = false;
  private checkInterval: number;

  constructor(options: { checkInterval?: number } = {}) {
    this.checkInterval = options.checkInterval || 1000;
  }

  /**
   * 启动队列
   */
  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.processDueMessages();
    }, this.checkInterval);
  }

  /**
   * 停止队列
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 延迟推送消息
   */
  delay(payload: T, delayMs: number, options: {
    id?: string;
    priority?: number;
    type?: string;
    maxAttempts?: number;
  } = {}): string {
    const id = options.id || `delay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const message: DelayedMessage<T> = {
      id,
      payload,
      executeAt: Date.now() + delayMs,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      priority: options.priority ?? 10,
      createdAt: Date.now()
    };

    // 按执行时间排序插入
    const index = this.messages.findIndex(m => m.executeAt > message.executeAt);
    if (index === -1) {
      this.messages.push(message);
    } else {
      this.messages.splice(index, 0, message);
    }

    if (options.type) {
      // 存储类型信息（简化实现）
      (message as DelayedMessage<T> & { messageType: string }).messageType = options.type;
    }

    return id;
  }

  /**
   * 注册处理器
   */
  registerHandler(type: string, handler: DelayHandler<T>): void {
    this.handlers.set(type, handler);
  }

  /**
   * 取消延迟消息
   */
  cancel(messageId: string): boolean {
    const index = this.messages.findIndex(m => m.id === messageId);
    if (index > -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    pending: number;
    nextExecution: number | null;
    running: boolean;
  } {
    return {
      pending: this.messages.length,
      nextExecution: this.messages[0]?.executeAt || null,
      running: this.timer !== null
    };
  }

  /**
   * 查看即将执行的消息
   */
  peek(): DelayedMessage<T> | undefined {
    return this.messages[0];
  }

  private async processDueMessages(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    const now = Date.now();
    const ready: DelayedMessage<T>[] = [];

    // 收集所有到期的消息
    while (this.messages.length > 0 && this.messages[0].executeAt <= now) {
      ready.push(this.messages.shift()!);
    }

    // 执行消息
    for (const message of ready) {
      await this.executeMessage(message);
    }

    this.processing = false;
  }

  private async executeMessage(message: DelayedMessage<T>): Promise<void> {
    const type = (message as DelayedMessage<T> & { messageType?: string }).messageType || 'default';
    const handler = this.handlers.get(type);

    if (!handler) {
      console.warn(`[DelayQueue] No handler for type: ${type}`);
      return;
    }

    try {
      await handler(message.payload);
    } catch (error) {
      message.attempts++;
      
      if (message.attempts < message.maxAttempts) {
        // 重试：指数退避
        const retryDelay = Math.pow(2, message.attempts) * 1000;
        message.executeAt = Date.now() + retryDelay;
        
        // 重新插入队列
        const index = this.messages.findIndex(m => m.executeAt > message.executeAt);
        if (index === -1) {
          this.messages.push(message);
        } else {
          this.messages.splice(index, 0, message);
        }
        
        console.log(`[DelayQueue] Retrying ${message.id} after ${retryDelay}ms`);
      } else {
        console.error(`[DelayQueue] Message ${message.id} failed after ${message.attempts} attempts`);
      }
    }
  }
}

// ============================================================================
// Cron 表达式解析器
// ============================================================================

export class CronParser {
  /**
   * 解析 Cron 表达式，获取下一次执行时间
   * 支持: * * * * * (分 时 日 月 周)
   */
  static getNextRun(cron: string, from: Date = new Date()): Date {
    const parts = cron.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression, expected 5 parts');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    const next = new Date(from);
    next.setSeconds(0, 0);
    next.setMinutes(next.getMinutes() + 1);

    // 简化实现：只支持 * 和数字
    for (let i = 0; i < 366 * 24 * 60; i++) { // 最多查找一年
      if (this.matches(next, minute, hour, dayOfMonth, month, dayOfWeek)) {
        return next;
      }
      next.setMinutes(next.getMinutes() + 1);
    }

    throw new Error('Could not find next run time');
  }

  private static matches(date: Date, minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string): boolean {
    return this.matchField(date.getMinutes(), minute) &&
           this.matchField(date.getHours(), hour) &&
           this.matchField(date.getDate(), dayOfMonth) &&
           this.matchField(date.getMonth() + 1, month) &&
           this.matchField(date.getDay(), dayOfWeek);
  }

  private static matchField(value: number, pattern: string): boolean {
    if (pattern === '*') return true;
    
    const num = parseInt(pattern, 10);
    if (!isNaN(num)) return value === num;
    
    return true; // 简化处理
  }
}

// ============================================================================
// 调度器
// ============================================================================

export class Scheduler {
  private tasks = new Map<string, ScheduledTask>();
  private timer: ReturnType<typeof setInterval> | null = null;

  /**
   * 启动调度器
   */
  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.checkTasks();
    }, 60000); // 每分钟检查一次
  }

  /**
   * 停止调度器
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 添加定时任务
   */
  schedule(name: string, cron: string, handler: () => void | Promise<void>): string {
    const id = `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const task: ScheduledTask = {
      id,
      name,
      cron,
      nextRun: CronParser.getNextRun(cron).getTime(),
      handler,
      enabled: true
    };

    this.tasks.set(id, task);
    return id;
  }

  /**
   * 禁用任务
   */
  disable(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 启用任务
   */
  enable(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = true;
      task.nextRun = CronParser.getNextRun(task.cron).getTime();
      return true;
    }
    return false;
  }

  /**
   * 获取所有任务
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  private checkTasks(): void {
    const now = Date.now();

    for (const task of this.tasks.values()) {
      if (!task.enabled) continue;

      if (now >= task.nextRun) {
        this.executeTask(task);
        task.nextRun = CronParser.getNextRun(task.cron).getTime();
      }
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    console.log(`[Scheduler] Executing task: ${task.name}`);
    try {
      await task.handler();
    } catch (error) {
      console.error(`[Scheduler] Task ${task.name} failed:`, error);
    }
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 延迟队列演示 ===\n');

  // 1. 延迟队列基础用法
  console.log('--- 延迟队列 ---');
  const delayQueue = new DelayQueue<string>();
  
  delayQueue.registerHandler('default', (msg) => {
    console.log(`  [Delayed] ${msg} at ${new Date().toLocaleTimeString()}`);
  });

  const now = Date.now();
  delayQueue.delay('Task 1', 100);
  delayQueue.delay('Task 2', 200);
  delayQueue.delay('Task 3 (high priority)', 150, { priority: 1 });

  console.log('Queue status:', delayQueue.getStatus());

  // 2. Cron 解析器
  console.log('\n--- Cron 表达式解析 ---');
  const cronExamples = [
    '*/5 * * * *',    // 每5分钟
    '0 * * * *',      // 每小时
    '0 0 * * *',      // 每天零点
    '0 9 * * 1',      // 每周一早上9点
  ];

  for (const cron of cronExamples) {
    const nextRun = CronParser.getNextRun(cron);
    console.log(`  "${cron}" -> next run: ${nextRun.toLocaleString()}`);
  }

  // 3. 调度器
  console.log('\n--- 任务调度器 ---');
  const scheduler = new Scheduler();

  scheduler.schedule('Daily Report', '0 9 * * *', () => {
    console.log('  [Scheduled] Generating daily report...');
  });

  scheduler.schedule('Health Check', '*/5 * * * *', () => {
    console.log('  [Scheduled] Running health check...');
  });

  console.log('Scheduled tasks:');
  scheduler.getTasks().forEach(task => {
    console.log(`  - ${task.name} (${task.cron}): next at ${new Date(task.nextRun).toLocaleString()}`);
  });

  // 4. 时间轮
  console.log('\n--- 时间轮 ---');
  const timingWheel = new TimingWheel(100, 10); // 100ms tick, 10 slots
  
  // 模拟调度
  console.log('Timing wheel slots:', 10);
  console.log('Tick interval: 100ms');
  console.log('Max delay precision: 100ms');

  console.log('\n--- 延迟队列使用场景 ---');
  console.log('  1. 订单超时取消');
  console.log('  2. 延迟发送邮件/短信');
  console.log('  3. 定时任务调度');
  console.log('  4. 消息重试退避');
  console.log('  5. 会话过期处理');
}
