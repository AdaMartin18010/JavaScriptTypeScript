/**
 * @file 优先级队列
 * @category Message Queue → Priority Queue
 * @difficulty medium
 * @tags message-queue, priority-queue, heap, scheduling
 *
 * @description
 * 基于二叉堆的优先级队列实现，支持消息优先级调度
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface PriorityMessage<T = unknown> {
  id: string;
  payload: T;
  priority: number;
  timestamp: number;
  attempts?: number;
}

export interface PriorityQueueOptions {
  maxSize?: number;
  defaultPriority?: number;
}

// ============================================================================
// 二叉堆优先级队列
// ============================================================================

export class PriorityQueue<T = unknown> {
  private heap: PriorityMessage<T>[] = [];
  private options: Required<PriorityQueueOptions>;

  constructor(options: PriorityQueueOptions = {}) {
    this.options = {
      maxSize: Number.MAX_SAFE_INTEGER,
      defaultPriority: 5,
      ...options
    };
  }

  /**
   * 入队
   */
  enqueue(message: PriorityMessage<T>): boolean {
    if (this.heap.length >= this.options.maxSize) {
      return false;
    }

    this.heap.push(message);
    this.bubbleUp(this.heap.length - 1);
    return true;
  }

  /**
   * 出队（最高优先级）
   */
  dequeue(): PriorityMessage<T> | undefined {
    if (this.heap.length === 0) return undefined;

    const top = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  /**
   * 查看最高优先级元素（不出队）
   */
  peek(): PriorityMessage<T> | undefined {
    return this.heap[0];
  }

  /**
   * 队列大小
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * 是否为空
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * 获取指定优先级范围的消息
   */
  getByPriorityRange(minPriority: number, maxPriority: number): PriorityMessage<T>[] {
    return this.heap.filter(m => m.priority >= minPriority && m.priority <= maxPriority);
  }

  /**
   * 批量出队
   */
  dequeueMany(count: number): PriorityMessage<T>[] {
    const result: PriorityMessage<T>[] = [];
    for (let i = 0; i < count && !this.isEmpty(); i++) {
      const msg = this.dequeue();
      if (msg) result.push(msg);
    }
    return result;
  }

  /**
   * 更新消息优先级
   */
  updatePriority(id: string, newPriority: number): boolean {
    const index = this.heap.findIndex(m => m.id === id);
    if (index === -1) return false;

    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;

    if (newPriority < oldPriority) {
      this.bubbleUp(index);
    } else if (newPriority > oldPriority) {
      this.bubbleDown(index);
    }

    return true;
  }

  /**
   * 移除指定消息
   */
  remove(id: string): PriorityMessage<T> | undefined {
    const index = this.heap.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    const removed = this.heap[index];
    const last = this.heap.pop()!;

    if (index < this.heap.length) {
      this.heap[index] = last;
      this.bubbleDown(index);
    }

    return removed;
  }

  /**
   * 转换为有序数组（按优先级降序）
   */
  toSortedArray(): PriorityMessage<T>[] {
    const copy = [...this.heap];
    const result: PriorityMessage<T>[] = [];

    // 使用临时堆提取所有元素
    const temp = new PriorityQueue<T>();
    temp.heap = copy;

    while (!temp.isEmpty()) {
      const msg = temp.dequeue();
      if (msg) result.push(msg);
    }

    return result;
  }

  private bubbleUp(index: number): void {
    const message = this.heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (message.priority >= parent.priority) break;

      this.heap[index] = parent;
      index = parentIndex;
    }

    this.heap[index] = message;
  }

  private bubbleDown(index: number): void {
    const message = this.heap[index];
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      this.heap[index] = this.heap[smallest];
      index = smallest;
    }

    this.heap[index] = message;
  }
}

// ============================================================================
// 优先级调度器
// ============================================================================

export class PriorityScheduler<T = unknown> {
  private queue = new PriorityQueue<T>();
  private processing = false;
  private handler?: (message: PriorityMessage<T>) => Promise<void>;

  /**
   * 提交任务
   */
  submit(id: string, payload: T, priority: number): boolean {
    return this.queue.enqueue({
      id,
      payload,
      priority,
      timestamp: Date.now()
    });
  }

  /**
   * 注册处理器
   */
  onProcess(handler: (message: PriorityMessage<T>) => Promise<void>): void {
    this.handler = handler;
  }

  /**
   * 处理下一条消息
   */
  async processNext(): Promise<boolean> {
    if (this.processing || this.queue.isEmpty() || !this.handler) {
      return false;
    }

    this.processing = true;
    const message = this.queue.dequeue();

    try {
      if (message) {
        await this.handler(message);
      }
    } finally {
      this.processing = false;
    }

    return true;
  }

  /**
   * 连续处理所有消息
   */
  async processAll(): Promise<void> {
    while (await this.processNext()) {
      // 持续处理
    }
  }

  /**
   * 获取队列状态
   */
  getStats(): { size: number; isProcessing: boolean } {
    return {
      size: this.queue.size(),
      isProcessing: this.processing
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 优先级队列 ===\n');

  const queue = new PriorityQueue<string>({ maxSize: 100 });

  queue.enqueue({ id: '1', payload: 'normal-task', priority: 5, timestamp: Date.now() });
  queue.enqueue({ id: '2', payload: 'urgent-task', priority: 1, timestamp: Date.now() });
  queue.enqueue({ id: '3', payload: 'low-task', priority: 10, timestamp: Date.now() });
  queue.enqueue({ id: '4', payload: 'critical-task', priority: 0, timestamp: Date.now() });

  console.log('Queue size:', queue.size());
  console.log('Peek:', queue.peek()?.payload);

  console.log('\nDequeue order:');
  while (!queue.isEmpty()) {
    const msg = queue.dequeue();
    console.log(`  [P${msg!.priority}] ${msg!.payload}`);
  }

  // 调度器
  console.log('\n--- Priority Scheduler ---');
  const scheduler = new PriorityScheduler<string>();
  scheduler.submit('a', 'background-job', 10);
  scheduler.submit('b', 'user-request', 2);
  scheduler.submit('c', 'alert', 0);

  scheduler.onProcess(async msg => {
    console.log(`  Processing: ${msg.payload} (priority: ${msg.priority})`);
  });
}
