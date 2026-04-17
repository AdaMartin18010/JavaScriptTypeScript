/**
 * @file 任务调度器（优先级队列）
 * @category Autonomous Systems → Task Scheduling
 * @difficulty medium
 * @tags task-scheduler, priority-queue, heap, deadline, autonomous-agent
 *
 * @description
 * 实现自主智能体的任务调度系统：
 * - 最小堆/最大堆优先级队列
 * - 支持任务优先级、截止时间、可抢占标记
 * - 调度策略：最早截止时间优先（EDF）、最高优先级优先（HPF）
 * - 任务执行状态跟踪
 */

/** 任务状态 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/** 任务定义 */
export interface Task {
  /** 任务 ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 优先级（数字越大优先级越高） */
  priority: number;
  /** 截止时间戳（可选） */
  deadline?: number;
  /** 预计执行时长（ms） */
  estimatedDuration?: number;
  /** 是否可抢占 */
  preemptible?: boolean;
  /** 任务执行函数 */
  execute: () => unknown;
}

/** 已调度任务（内部扩展） */
interface ScheduledTask extends Task {
  /** 入队时间 */
  enqueueTime: number;
  /** 当前状态 */
  status: TaskStatus;
  /** 开始执行时间 */
  startTime?: number;
  /** 完成时间 */
  endTime?: number;
  /** 执行结果 */
  result?: unknown;
  /** 错误信息 */
  error?: string;
}

/** 调度结果 */
export interface ScheduleResult {
  /** 成功执行的任务数 */
  completed: number;
  /** 失败的任务数 */
  failed: number;
  /** 被取消的任务数 */
  cancelled: number;
  /** 各任务执行详情 */
  tasks: ScheduledTask[];
}

/** 调度策略 */
export type SchedulingPolicy = 'priority' | 'deadline' | 'fifo';

/** 堆比较函数 */
type CompareFn<T> = (a: T, b: T) => number;

/**
 * 二叉堆优先级队列
 *
 * 支持自定义比较函数，可作为最小堆或最大堆使用。
 */
export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private compare: CompareFn<T>) {}

  enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  toArray(): T[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[parent], this.heap[index]) <= 0) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let best = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[best]) < 0) best = left;
      if (right < length && this.compare(this.heap[right], this.heap[best]) < 0) best = right;
      if (best === index) break;

      [this.heap[index], this.heap[best]] = [this.heap[best], this.heap[index]];
      index = best;
    }
  }
}

/**
 * 任务调度器
 *
 * 为自治系统提供任务排队与执行能力，
 * 支持多种调度策略和任务生命周期管理。
 */
export class TaskScheduler {
  private tasks = new Map<string, ScheduledTask>();
  private queue: PriorityQueue<ScheduledTask>;
  private running = false;

  constructor(private policy: SchedulingPolicy = 'priority') {
    this.queue = new PriorityQueue<ScheduledTask>((a, b) => this.compareTasks(a, b));
  }

  /**
   * 提交任务到调度器
   * @param task - 任务定义
   */
  submit(task: Task): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with id "${task.id}" already exists`);
    }

    const scheduled: ScheduledTask = {
      ...task,
      enqueueTime: Date.now(),
      status: 'pending',
    };

    this.tasks.set(task.id, scheduled);
    this.queue.enqueue(scheduled);
  }

  /**
   * 取消已提交但未执行的任务
   * @param taskId - 任务 ID
   */
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') return false;

    task.status = 'cancelled';
    return true;
  }

  /**
   * 执行所有待处理任务（同步模拟）
   * @returns 调度结果
   */
  runAll(): ScheduleResult {
    const result: ScheduleResult = { completed: 0, failed: 0, cancelled: 0, tasks: [] };
    this.running = true;

    while (!this.queue.isEmpty() && this.running) {
      const task = this.queue.dequeue()!;

      if (task.status === 'cancelled') {
        result.cancelled++;
        result.tasks.push(task);
        continue;
      }

      if (task.status !== 'pending') continue;

      task.status = 'running';
      task.startTime = Date.now();

      try {
        task.result = task.execute();
        task.status = 'completed';
        task.endTime = Date.now();
        result.completed++;
      } catch (err) {
        task.status = 'failed';
        task.endTime = Date.now();
        task.error = err instanceof Error ? err.message : String(err);
        result.failed++;
      }

      result.tasks.push(task);
    }

    this.running = false;

    // 补充已取消但未出队的任务
    for (const task of this.tasks.values()) {
      if (task.status === 'cancelled' && !result.tasks.find(t => t.id === task.id)) {
        result.cancelled++;
        result.tasks.push(task);
      }
    }

    return result;
  }

  /**
   * 停止调度器
   */
  stop(): void {
    this.running = false;
  }

  /**
   * 获取任务状态
   * @param taskId - 任务 ID
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    return this.tasks.get(taskId)?.status;
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取待处理任务数量
   */
  getPendingCount(): number {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending').length;
  }

  /**
   * 切换调度策略
   * @param policy - 新策略
   */
  setPolicy(policy: SchedulingPolicy): void {
    this.policy = policy;
    // 重新构建队列
    const items = this.queue.toArray();
    this.queue = new PriorityQueue<ScheduledTask>((a, b) => this.compareTasks(a, b));
    for (const item of items) {
      if (item.status === 'pending') {
        this.queue.enqueue(item);
      }
    }
  }

  private compareTasks(a: ScheduledTask, b: ScheduledTask): number {
    switch (this.policy) {
      case 'priority': {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.enqueueTime - b.enqueueTime;
      }
      case 'deadline': {
        const da = a.deadline ?? Infinity;
        const db = b.deadline ?? Infinity;
        if (da !== db) return da - db;
        return b.priority - a.priority;
      }
      case 'fifo':
      default:
        return a.enqueueTime - b.enqueueTime;
    }
  }
}

export function demo(): void {
  console.log('=== 任务调度器 ===\n');

  const scheduler = new TaskScheduler('priority');

  scheduler.submit({
    id: 't1',
    name: '低优先级任务',
    priority: 1,
    execute: () => 'done-1',
  });

  scheduler.submit({
    id: 't2',
    name: '高优先级任务',
    priority: 10,
    execute: () => 'done-2',
  });

  scheduler.submit({
    id: 't3',
    name: '中等优先级任务',
    priority: 5,
    execute: () => { throw new Error('task failed'); },
  });

  console.log('待处理任务数:', scheduler.getPendingCount());

  const result = scheduler.runAll();
  console.log('\n执行结果:');
  console.log('  完成:', result.completed);
  console.log('  失败:', result.failed);
  console.log('  取消:', result.cancelled);

  console.log('\n任务执行顺序:');
  result.tasks.forEach(t => {
    console.log(`  ${t.name} [${t.status}]`);
  });
}
