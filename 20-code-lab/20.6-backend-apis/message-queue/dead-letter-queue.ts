/**
 * @file 死信队列
 * @category Message Queue → Dead Letter Queue
 * @difficulty hard
 * @tags message-queue, dead-letter, retry, failure-handling
 *
 * @description
 * 死信队列（DLQ）实现：处理消费失败的消息，支持重试策略和最终归档
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface DeadLetterMessage<T = unknown> {
  id: string;
  originalTopic: string;
  payload: T;
  timestamp: number;
  failureReason: string;
  retryCount: number;
  maxRetries: number;
  lastAttemptTime: number;
}

export interface DLQOptions {
  maxRetries?: number;
  retryDelays?: number[];
  retentionPeriod?: number;
}

export type DLQHandler<T> = (message: DeadLetterMessage<T>) => Promise<void> | void;

// ============================================================================
// 死信队列
// ============================================================================

export class DeadLetterQueue<T = unknown> {
  private messages: DeadLetterMessage<T>[] = [];
  private handlers = new Set<DLQHandler<T>>();
  private options: Required<DLQOptions>;

  constructor(options: DLQOptions = {}) {
    this.options = {
      maxRetries: 3,
      retryDelays: [1000, 5000, 30000],
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...options
    };
  }

  /**
   * 将失败消息送入死信队列
   */
  enqueue(
    id: string,
    originalTopic: string,
    payload: T,
    failureReason: string,
    retryCount = 0
  ): DeadLetterMessage<T> {
    const message: DeadLetterMessage<T> = {
      id,
      originalTopic,
      payload,
      timestamp: Date.now(),
      failureReason,
      retryCount,
      maxRetries: this.options.maxRetries,
      lastAttemptTime: Date.now()
    };

    this.messages.push(message);
    this.notifyHandlers(message);

    return message;
  }

  /**
   * 注册死信处理器
   */
  onDeadLetter(handler: DLQHandler<T>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * 获取可重试的消息
   */
  getRetryableMessages(): DeadLetterMessage<T>[] {
    return this.messages.filter(m => m.retryCount < m.maxRetries);
  }

  /**
   * 获取指定消息的下一次重试延迟
   */
  getRetryDelay(message: DeadLetterMessage<T>): number {
    const delays = this.options.retryDelays;
    return delays[Math.min(message.retryCount, delays.length - 1)];
  }

  /**
   * 尝试重试消息
   */
  async retry(messageId: string, retryFn: (payload: T) => Promise<void>): Promise<boolean> {
    const index = this.messages.findIndex(m => m.id === messageId);
    if (index === -1) return false;

    const message = this.messages[index];

    if (message.retryCount >= message.maxRetries) {
      return false;
    }

    try {
      await retryFn(message.payload);
      this.messages.splice(index, 1);
      return true;
    } catch (error) {
      message.retryCount++;
      message.lastAttemptTime = Date.now();
      message.failureReason = error instanceof Error ? error.message : 'Retry failed';
      return false;
    }
  }

  /**
   * 获取所有死信消息
   */
  getMessages(): DeadLetterMessage<T>[] {
    return [...this.messages];
  }

  /**
   * 获取死信消息数量
   */
  getSize(): number {
    return this.messages.length;
  }

  /**
   * 按原始主题分类统计
   */
  getStatsByTopic(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const message of this.messages) {
      stats[message.originalTopic] = (stats[message.originalTopic] || 0) + 1;
    }

    return stats;
  }

  /**
   * 清理过期消息
   */
  purgeExpired(): number {
    const now = Date.now();
    const originalLength = this.messages.length;

    this.messages = this.messages.filter(
      m => now - m.timestamp < this.options.retentionPeriod
    );

    return originalLength - this.messages.length;
  }

  /**
   * 清空死信队列
   */
  clear(): void {
    this.messages = [];
  }

  private notifyHandlers(message: DeadLetterMessage<T>): void {
    for (const handler of this.handlers) {
      try {
        handler(message);
      } catch {
        // 忽略处理器错误
      }
    }
  }
}

// ============================================================================
// 带 DLQ 的消费者包装器
// ============================================================================

export interface ConsumableMessage<T = unknown> {
  id: string;
  topic: string;
  payload: T;
}

export class DLQConsumer<T = unknown> {
  private dlq: DeadLetterQueue<T>;
  private consumerFn: (message: ConsumableMessage<T>) => Promise<void>;

  constructor(
    consumerFn: (message: ConsumableMessage<T>) => Promise<void>,
    dlqOptions?: DLQOptions
  ) {
    this.consumerFn = consumerFn;
    this.dlq = new DeadLetterQueue<T>(dlqOptions);
  }

  /**
   * 消费消息（失败时自动送入 DLQ）
   */
  async consume(message: ConsumableMessage<T>): Promise<void> {
    try {
      await this.consumerFn(message);
    } catch (error) {
      this.dlq.enqueue(
        message.id,
        message.topic,
        message.payload,
        error instanceof Error ? error.message : 'Consumer failed'
      );
    }
  }

  /**
   * 获取关联的死信队列
   */
  getDLQ(): DeadLetterQueue<T> {
    return this.dlq;
  }

  /**
   * 重试所有可重试的死信
   */
  async retryAll(): Promise<{ success: number; failed: number }> {
    const retryable = this.dlq.getRetryableMessages();
    let success = 0;
    let failed = 0;

    for (const message of retryable) {
      const ok = await this.dlq.retry(message.id, async payload => {
        await this.consumerFn({ id: message.id, topic: message.originalTopic, payload });
      });

      if (ok) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 死信队列 ===\n');

  const dlq = new DeadLetterQueue({ maxRetries: 3, retryDelays: [1000, 5000, 30000] });

  dlq.enqueue('msg-1', 'orders', { orderId: 123 }, 'Database connection failed');
  dlq.enqueue('msg-2', 'payments', { paymentId: 456 }, 'Timeout');
  dlq.enqueue('msg-3', 'orders', { orderId: 789 }, 'Validation error');

  console.log('DLQ size:', dlq.getSize());
  console.log('Stats by topic:', dlq.getStatsByTopic());
  console.log('Retryable messages:', dlq.getRetryableMessages().length);

  // DLQ Consumer
  const consumer = new DLQConsumer(async (msg) => {
    if (Math.random() > 0.5) throw new Error('Random failure');
    console.log('Consumed:', msg.id);
  });

  consumer.consume({ id: 'msg-4', topic: 'events', payload: { data: 'test' } })
    .then(() => {
      console.log('DLQ size after consume:', consumer.getDLQ().getSize());
    });
}
