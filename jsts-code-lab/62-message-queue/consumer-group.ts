/**
 * @file 消费者组
 * @category Message Queue → Consumer Group
 * @difficulty hard
 * @tags message-queue, consumer-group, partition, load-balancing
 *
 * @description
 * 消费者组实现：分区分配、再平衡、偏移量管理
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Partition {
  id: number;
  topic: string;
}

export interface Consumer {
  id: string;
  partitions: Partition[];
  lastHeartbeat: number;
}

export interface Message<T = unknown> {
  offset: number;
  partition: number;
  topic: string;
  payload: T;
  timestamp: number;
}

export interface ConsumerGroupOptions {
  sessionTimeout?: number;
  rebalanceDelay?: number;
}

export type PartitionAssignor = (consumers: string[], partitions: Partition[]) => Map<string, Partition[]>;

// ============================================================================
// 分区分配策略
// ============================================================================

export class PartitionAssignors {
  /**
   * 轮询分配（Round-Robin）
   */
  static roundRobin(consumers: string[], partitions: Partition[]): Map<string, Partition[]> {
    const assignment = new Map<string, Partition[]>();
    for (const consumer of consumers) {
      assignment.set(consumer, []);
    }

    if (consumers.length === 0) return assignment;

    for (let i = 0; i < partitions.length; i++) {
      const consumer = consumers[i % consumers.length];
      assignment.get(consumer)!.push(partitions[i]);
    }

    return assignment;
  }

  /**
   * 范围分配（Range）— 连续分配
   */
  static range(consumers: string[], partitions: Partition[]): Map<string, Partition[]> {
    const assignment = new Map<string, Partition[]>();
    for (const consumer of consumers) {
      assignment.set(consumer, []);
    }

    const partitionsPerConsumer = Math.floor(partitions.length / consumers.length);
    const remainder = partitions.length % consumers.length;

    let start = 0;
    for (let i = 0; i < consumers.length; i++) {
      const count = partitionsPerConsumer + (i < remainder ? 1 : 0);
      assignment.set(consumers[i], partitions.slice(start, start + count));
      start += count;
    }

    return assignment;
  }

  /**
   * 粘性分配（Sticky）— 尽量保持现有分配
   */
  static sticky(
    consumers: string[],
    partitions: Partition[],
    currentAssignment: Map<string, Partition[]>
  ): Map<string, Partition[]> {
    const assignment = new Map<string, Partition[]>();
    const unassigned: Partition[] = [...partitions];

    // 保留现有分配中仍然有效的分区
    for (const consumer of consumers) {
      const current = currentAssignment.get(consumer) || [];
      const valid = current.filter(p => unassigned.some(u => u.id === p.id && u.topic === p.topic));
      assignment.set(consumer, valid);

      for (const v of valid) {
        const index = unassigned.findIndex(u => u.id === v.id && u.topic === v.topic);
        if (index > -1) unassigned.splice(index, 1);
      }
    }

    // 将未分配的分区轮询分配给各个消费者
    let consumerIndex = 0;
    for (const partition of unassigned) {
      const consumer = consumers[consumerIndex % consumers.length];
      assignment.get(consumer)!.push(partition);
      consumerIndex++;
    }

    return assignment;
  }
}

// ============================================================================
// 消费者组
// ============================================================================

export class ConsumerGroup {
  private consumers = new Map<string, Consumer>();
  private partitions: Partition[] = [];
  private currentAssignment = new Map<string, Partition[]>();
  private offsets = new Map<string, number>(); // "topic:partition" -> offset
  private options: Required<ConsumerGroupOptions>;
  private assignor: PartitionAssignor;

  constructor(
    groupId: string,
    partitions: Partition[],
    options: ConsumerGroupOptions = {},
    assignor: PartitionAssignor = PartitionAssignors.roundRobin
  ) {
    this.partitions = partitions;
    this.options = {
      sessionTimeout: 30000,
      rebalanceDelay: 3000,
      ...options
    };
    this.assignor = assignor;
  }

  /**
   * 加入消费者组
   */
  join(consumerId: string): Partition[] {
    if (this.consumers.has(consumerId)) {
      this.heartbeat(consumerId);
      return this.currentAssignment.get(consumerId) || [];
    }

    this.consumers.set(consumerId, {
      id: consumerId,
      partitions: [],
      lastHeartbeat: Date.now()
    });

    this.rebalance();
    return this.currentAssignment.get(consumerId) || [];
  }

  /**
   * 离开消费者组
   */
  leave(consumerId: string): void {
    this.consumers.delete(consumerId);
    this.rebalance();
  }

  /**
   * 发送心跳
   */
  heartbeat(consumerId: string): void {
    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      consumer.lastHeartbeat = Date.now();
    }
  }

  /**
   * 提交偏移量
   */
  commitOffset(topic: string, partition: number, offset: number): void {
    const key = `${topic}:${partition}`;
    const current = this.offsets.get(key) || 0;
    if (offset > current) {
      this.offsets.set(key, offset);
    }
  }

  /**
   * 获取偏移量
   */
  getOffset(topic: string, partition: number): number {
    return this.offsets.get(`${topic}:${partition}`) || 0;
  }

  /**
   * 获取消费者列表
   */
  getConsumers(): Consumer[] {
    return Array.from(this.consumers.values());
  }

  /**
   * 获取当前分配
   */
  getAssignment(): Map<string, Partition[]> {
    return new Map(this.currentAssignment);
  }

  /**
   * 检查消费者是否存活
   */
  isConsumerAlive(consumerId: string): boolean {
    const consumer = this.consumers.get(consumerId);
    if (!consumer) return false;
    return Date.now() - consumer.lastHeartbeat < this.options.sessionTimeout;
  }

  /**
   * 清理失效消费者并触发再平衡
   */
  cleanup(): string[] {
    const removed: string[] = [];

    for (const [id, consumer] of this.consumers) {
      if (Date.now() - consumer.lastHeartbeat >= this.options.sessionTimeout) {
        this.consumers.delete(id);
        removed.push(id);
      }
    }

    if (removed.length > 0) {
      this.rebalance();
    }

    return removed;
  }

  /**
   * 执行再平衡
   */
  private rebalance(): void {
    const consumerIds = Array.from(this.consumers.keys()).sort();

    if (consumerIds.length === 0) {
      this.currentAssignment.clear();
      return;
    }

    this.currentAssignment = this.assignor(consumerIds, this.partitions);

    // 更新消费者分区信息
    for (const [consumerId, partitions] of this.currentAssignment) {
      const consumer = this.consumers.get(consumerId);
      if (consumer) {
        consumer.partitions = partitions;
      }
    }
  }
}

// ============================================================================
// 分区消费者
// ============================================================================

export class PartitionConsumer<T = unknown> {
  private group: ConsumerGroup;
  private consumerId: string;
  private messageHandler?: (message: Message<T>) => Promise<void>;
  private running = false;

  constructor(group: ConsumerGroup, consumerId: string) {
    this.group = group;
    this.consumerId = consumerId;
  }

  /**
   * 加入消费者组并获取分配的分区
   */
  join(): Partition[] {
    return this.group.join(this.consumerId);
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: (message: Message<T>) => Promise<void>): void {
    this.messageHandler = handler;
  }

  /**
   * 处理单条消息
   */
  async process(message: Message<T>): Promise<void> {
    if (!this.messageHandler) return;

    await this.messageHandler(message);
    this.group.commitOffset(message.topic, message.partition, message.offset);
  }

  /**
   * 发送心跳
   */
  heartbeat(): void {
    this.group.heartbeat(this.consumerId);
  }

  /**
   * 离开消费者组
   */
  leave(): void {
    this.group.leave(this.consumerId);
    this.running = false;
  }

  /**
   * 获取分配的分区
   */
  getPartitions(): Partition[] {
    return this.group.getAssignment().get(this.consumerId) || [];
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 消费者组 ===\n');

  const partitions: Partition[] = [
    { id: 0, topic: 'orders' },
    { id: 1, topic: 'orders' },
    { id: 2, topic: 'orders' },
    { id: 3, topic: 'orders' }
  ];

  const group = new ConsumerGroup('order-consumers', partitions);

  console.log('--- Round Robin Assignment ---');
  const consumer1 = group.join('consumer-1');
  const consumer2 = group.join('consumer-2');
  console.log('Consumer 1:', consumer1.map(p => p.id));
  console.log('Consumer 2:', consumer2.map(p => p.id));

  console.log('\n--- Range Assignment ---');
  const rangeGroup = new ConsumerGroup('range-group', partitions, {}, PartitionAssignors.range);
  rangeGroup.join('c1');
  rangeGroup.join('c2');
  console.log('Assignment:', Array.from(rangeGroup.getAssignment().entries()).map(([k, v]) => `${k}: [${v.map(p => p.id).join(', ')}]`));

  console.log('\n--- Offset Management ---');
  group.commitOffset('orders', 0, 100);
  group.commitOffset('orders', 0, 150);
  console.log('Offset for orders:0:', group.getOffset('orders', 0));
}
