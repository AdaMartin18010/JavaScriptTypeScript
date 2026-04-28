/**
 * @file 流处理
 * @category Message Queue → Stream Processing
 * @difficulty hard
 * @tags stream-processing, event-sourcing, message-log
 *
 * @description
 * 流处理实现：消息日志、消费者组、偏移量管理、事件溯源
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface StreamMessage {
  id: string;
  payload: unknown;
  timestamp: number;
  stream: string;
}

export interface StreamEntry {
  id: string;
  fields: Record<string, unknown>;
}

export interface ConsumerGroupInfo {
  name: string;
  stream: string;
  consumers: Map<string, ConsumerInfo>;
  pending: Map<string, PendingMessage>;
  lastDeliveredId: string;
}

export interface ConsumerInfo {
  name: string;
  seenTime: number;
  pending: number;
}

export interface PendingMessage {
  id: string;
  consumer: string;
  deliveryTime: number;
  deliveryCount: number;
}

export interface ReadOptions {
  count?: number;
  block?: number;
  lastId?: string;
}

// ============================================================================
// 消息流
// ============================================================================

export class MessageStream {
  private messages: StreamEntry[] = [];
  private maxLength: number;
  private trimStrategy: 'maxlen' | 'minid';

  constructor(options: { maxLength?: number; trimStrategy?: 'maxlen' | 'minid' } = {}) {
    this.maxLength = options.maxLength || 10000;
    this.trimStrategy = options.trimStrategy || 'maxlen';
  }

  /**
   * 添加消息到流
   */
  add(fields: Record<string, unknown>, id?: string): string {
    const entryId = id || this.generateId();
    
    const entry: StreamEntry = {
      id: entryId,
      fields
    };

    this.messages.push(entry);

    // 自动裁剪
    if (this.messages.length > this.maxLength) {
      this.trim(this.maxLength);
    }

    return entryId;
  }

  /**
   * 读取消息
   */
  read(start: string, count = 10): StreamEntry[] {
    let index = 0;
    
    if (start !== '-') {
      // 找到起始位置
      index = this.messages.findIndex(m => m.id > start);
      if (index === -1) index = this.messages.length;
    }

    return this.messages.slice(index, index + count);
  }

  /**
   * 获取指定 ID 的条目
   */
  getEntry(id: string): StreamEntry | undefined {
    return this.messages.find(m => m.id === id);
  }

  /**
   * 反向读取（从最新开始）
   */
  xrevrange(end: string, count = 10): StreamEntry[] {
    let index = this.messages.length - 1;
    
    if (end !== '+') {
      index = this.messages.findIndex(m => m.id > end);
      if (index === -1) index = this.messages.length;
      index--;
    }

    const start = Math.max(0, index - count + 1);
    return this.messages.slice(start, index + 1).reverse();
  }

  /**
   * 裁剪流
   */
  trim(maxlen: number): number {
    const removed = Math.max(0, this.messages.length - maxlen);
    if (removed > 0) {
      this.messages.splice(0, removed);
    }
    return removed;
  }

  /**
   * 删除消息
   */
  delete(id: string): boolean {
    const index = this.messages.findIndex(m => m.id === id);
    if (index > -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取流长度
   */
  length(): number {
    return this.messages.length;
  }

  /**
   * 获取范围
   */
  range(start: string, end: string): StreamEntry[] {
    return this.messages.filter(m => m.id >= start && m.id <= end);
  }

  /**
   * 获取流信息
   */
  info(): { length: number; firstId: string | null; lastId: string | null } {
    return {
      length: this.messages.length,
      firstId: this.messages[0]?.id || null,
      lastId: this.messages[this.messages.length - 1]?.id || null
    };
  }

  private generateId(): string {
    const now = Date.now();
    const seq = this.messages.filter(m => m.id.startsWith(String(now))).length;
    return `${now}-${seq}`;
  }
}

// ============================================================================
// 流处理管理器 (类似 Redis Streams)
// ============================================================================

export class StreamProcessor {
  private streams = new Map<string, MessageStream>();
  private consumerGroups = new Map<string, ConsumerGroupInfo>();

  /**
   * 创建流
   */
  createStream(name: string, options?: { maxLength?: number }): MessageStream {
    const stream = new MessageStream(options);
    this.streams.set(name, stream);
    return stream;
  }

  /**
   * 删除流
   */
  deleteStream(name: string): boolean {
    return this.streams.delete(name);
  }

  /**
   * 向流添加消息
   */
  xadd(stream: string, fields: Record<string, unknown>, id?: string, options?: { maxLength?: number }): string | null {
    let s = this.streams.get(stream);
    if (!s) {
      s = this.createStream(stream, options);
    }
    return s.add(fields, id);
  }

  /**
   * 读取流（类似 XREAD）
   */
  xread(streams: string[], options: ReadOptions = {}): Map<string, StreamEntry[]> {
    const result = new Map<string, StreamEntry[]>();

    for (const streamName of streams) {
      const stream = this.streams.get(streamName);
      if (stream) {
        const entries = stream.read(options.lastId || '-', options.count || 10);
        if (entries.length > 0) {
          result.set(streamName, entries);
        }
      }
    }

    return result;
  }

  /**
   * 创建消费者组
   */
  xgroupCreate(stream: string, group: string, startId = '$'): boolean {
    if (!this.streams.has(stream)) {
      return false;
    }

    const key = `${stream}:${group}`;
    const groupInfo: ConsumerGroupInfo = {
      name: group,
      stream,
      consumers: new Map(),
      pending: new Map(),
      lastDeliveredId: startId
    };

    this.consumerGroups.set(key, groupInfo);
    return true;
  }

  /**
   * 消费者组读取（类似 XREADGROUP）
   */
  xreadgroup(stream: string, group: string, consumer: string, count = 10): StreamEntry[] {
    const groupKey = `${stream}:${group}`;
    const groupInfo = this.consumerGroups.get(groupKey);
    
    if (!groupInfo) {
      throw new Error(`Consumer group ${group} not found`);
    }

    const messageStream = this.streams.get(stream);
    if (!messageStream) {
      return [];
    }

    // 更新消费者信息
    groupInfo.consumers.set(consumer, {
      name: consumer,
      seenTime: Date.now(),
      pending: (groupInfo.consumers.get(consumer)?.pending || 0) + 1
    });

    // 读取消息
    const entries = messageStream.read(groupInfo.lastDeliveredId, count);
    
    // 更新偏移量并记录 pending
    for (const entry of entries) {
      groupInfo.lastDeliveredId = entry.id;
      groupInfo.pending.set(entry.id, {
        id: entry.id,
        consumer,
        deliveryTime: Date.now(),
        deliveryCount: 1
      });
    }

    return entries;
  }

  /**
   * 确认消息（类似 XACK）
   */
  xack(stream: string, group: string, ...ids: string[]): number {
    const groupKey = `${stream}:${group}`;
    const groupInfo = this.consumerGroups.get(groupKey);
    
    if (!groupInfo) return 0;

    let acked = 0;
    for (const id of ids) {
      if (groupInfo.pending.delete(id)) {
        acked++;
      }
    }

    return acked;
  }

  /**
   * 获取 pending 消息
   */
  xpending(stream: string, group: string): PendingMessage[] {
    const groupKey = `${stream}:${group}`;
    const groupInfo = this.consumerGroups.get(groupKey);
    
    if (!groupInfo) return [];

    return Array.from(groupInfo.pending.values());
  }

  /**
   * 转移消息所有权（类似 XCLAIM）
   */
  xclaim(stream: string, group: string, consumer: string, minIdleTime: number, ...ids: string[]): StreamEntry[] {
    const groupKey = `${stream}:${group}`;
    const groupInfo = this.consumerGroups.get(groupKey);
    const messageStream = this.streams.get(stream);
    
    if (!groupInfo || !messageStream) return [];

    const now = Date.now();
    const result: StreamEntry[] = [];

    for (const id of ids) {
      const pending = groupInfo.pending.get(id);
      if (pending && (now - pending.deliveryTime) >= minIdleTime) {
        // 转移所有权
        pending.consumer = consumer;
        pending.deliveryTime = now;
        pending.deliveryCount++;

        const entry = messageStream.getEntry(id);
        if (entry) {
          result.push(entry);
        }
      }
    }

    return result;
  }

  /**
   * 获取流信息
   */
  xinfo(stream: string): ReturnType<MessageStream['info']> | null {
    return this.streams.get(stream)?.info() || null;
  }

  /**
   * 获取消费者组信息
   */
  xinfoGroups(stream: string): ConsumerGroupInfo[] {
    const groups: ConsumerGroupInfo[] = [];
    
    for (const [key, group] of this.consumerGroups) {
      if (group.stream === stream) {
        groups.push(group);
      }
    }

    return groups;
  }
}

// ============================================================================
// 事件溯源 (Event Sourcing)
// ============================================================================

export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  type: string;
  payload: unknown;
  version: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class EventStore {
  private events = new Map<string, DomainEvent[]>(); // aggregateId -> events
  private allEvents: DomainEvent[] = [];
  private streams: StreamProcessor;

  constructor() {
    this.streams = new StreamProcessor();
    this.streams.createStream('events', { maxLength: 100000 });
  }

  /**
   * 追加事件
   */
  append(event: Omit<DomainEvent, 'id' | 'timestamp'>): DomainEvent {
    const fullEvent: DomainEvent = {
      ...event,
      id: `${event.aggregateType}:${event.aggregateId}:${event.version}`,
      timestamp: Date.now()
    };

    // 存储到聚合事件列表
    if (!this.events.has(event.aggregateId)) {
      this.events.set(event.aggregateId, []);
    }
    this.events.get(event.aggregateId)!.push(fullEvent);

    // 存储到全局事件列表
    this.allEvents.push(fullEvent);

    // 添加到流
    this.streams.xadd('events', {
      aggregateId: fullEvent.aggregateId,
      aggregateType: fullEvent.aggregateType,
      type: fullEvent.type,
      payload: JSON.stringify(fullEvent.payload),
      version: fullEvent.version,
      timestamp: fullEvent.timestamp
    });

    return fullEvent;
  }

  /**
   * 获取聚合的所有事件
   */
  getEvents(aggregateId: string): DomainEvent[] {
    return [...(this.events.get(aggregateId) || [])];
  }

  /**
   * 从版本号开始获取事件
   */
  getEventsFromVersion(aggregateId: string, fromVersion: number): DomainEvent[] {
    const events = this.events.get(aggregateId) || [];
    return events.filter(e => e.version >= fromVersion);
  }

  /**
   * 获取聚合的最新版本
   */
  getCurrentVersion(aggregateId: string): number {
    const events = this.events.get(aggregateId);
    if (!events || events.length === 0) return 0;
    return events[events.length - 1].version;
  }

  /**
   * 快照支持：获取聚合到特定版本的状态
   */
  getEventsToVersion(aggregateId: string, toVersion: number): DomainEvent[] {
    const events = this.events.get(aggregateId) || [];
    return events.filter(e => e.version <= toVersion);
  }

  /**
   * 投影：获取所有事件的流
   */
  getAllEvents(fromTimestamp?: number): DomainEvent[] {
    if (fromTimestamp) {
      return this.allEvents.filter(e => e.timestamp >= fromTimestamp);
    }
    return [...this.allEvents];
  }

  /**
   * 按类型获取事件
   */
  getEventsByType(type: string): DomainEvent[] {
    return this.allEvents.filter(e => e.type === type);
  }

  /**
   * 重播聚合事件
   */
  replay<T>(aggregateId: string, reducer: (state: T, event: DomainEvent) => T, initialState: T): T {
    const events = this.getEvents(aggregateId);
    return events.reduce(reducer, initialState);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 流处理演示 ===\n');

  // 1. 消息流基础操作
  console.log('--- 消息流 ---');
  const stream = new MessageStream({ maxLength: 100 });

  // 添加消息
  const id1 = stream.add({ user: 'alice', action: 'login' });
  const id2 = stream.add({ user: 'bob', action: 'purchase', item: 'laptop' });
  const id3 = stream.add({ user: 'alice', action: 'logout' });

  console.log(`  Added 3 messages, last ID: ${id3}`);
  console.log(`  Stream length: ${stream.length()}`);

  // 读取消息
  const entries = stream.read('-', 10);
  console.log(`  Read ${entries.length} entries:`);
  entries.forEach(e => { console.log(`    ${e.id}: ${JSON.stringify(e.fields)}`); });

  // 2. 流处理管理器
  console.log('\n--- 流处理管理器 ---');
  const processor = new StreamProcessor();

  // 创建消费者组
  processor.xgroupCreate('orders', 'order-processors');
  processor.xgroupCreate('orders', 'analytics');

  // 添加消息
  processor.xadd('orders', { orderId: '1001', amount: 99.99, status: 'created' });
  processor.xadd('orders', { orderId: '1002', amount: 149.99, status: 'created' });
  processor.xadd('orders', { orderId: '1003', amount: 29.99, status: 'created' });

  // 消费者组读取
  const consumer1 = processor.xreadgroup('orders', 'order-processors', 'worker-1', 2);
  console.log(`  Worker-1 read ${consumer1.length} messages`);

  const consumer2 = processor.xreadgroup('orders', 'order-processors', 'worker-2', 2);
  console.log(`  Worker-2 read ${consumer2.length} messages`);

  // 确认消息
  const acked = processor.xack('orders', 'order-processors', consumer1[0].id);
  console.log(`  Acked ${acked} message`);

  // 查看 pending
  const pending = processor.xpending('orders', 'order-processors');
  console.log(`  Pending messages: ${pending.length}`);

  // 3. 事件溯源
  console.log('\n--- 事件溯源 ---');
  const eventStore = new EventStore();

  // 添加订单事件
  const orderId = 'order-123';
  
  eventStore.append({
    aggregateId: orderId,
    aggregateType: 'Order',
    type: 'OrderCreated',
    payload: { customerId: 'cust-1', items: [{ sku: 'A001', qty: 2 }] },
    version: 1
  });

  eventStore.append({
    aggregateId: orderId,
    aggregateType: 'Order',
    type: 'OrderPaid',
    payload: { amount: 199.98, method: 'credit_card' },
    version: 2
  });

  eventStore.append({
    aggregateId: orderId,
    aggregateType: 'Order',
    type: 'OrderShipped',
    payload: { carrier: 'FedEx', trackingNumber: '1234567890' },
    version: 3
  });

  // 重播事件重建状态
  interface OrderState {
    id: string;
    customerId?: string;
    items: { sku: string; qty: number }[];
    status: string;
    paid?: boolean;
    shipped?: boolean;
  }

  const orderState = eventStore.replay<OrderState>(
    orderId,
    (state, event) => {
      switch (event.type) {
        case 'OrderCreated':
          const payload = event.payload as { customerId: string; items: { sku: string; qty: number }[] };
          return {
            ...state,
            customerId: payload.customerId,
            items: payload.items,
            status: 'created'
          };
        case 'OrderPaid':
          return { ...state, paid: true, status: 'paid' };
        case 'OrderShipped':
          return { ...state, shipped: true, status: 'shipped' };
        default:
          return state;
      }
    },
    { id: orderId, items: [], status: 'new' }
  );

  console.log('  Order state after replay:', orderState);
  console.log('  Current version:', eventStore.getCurrentVersion(orderId));

  // 4. 流信息
  console.log('\n--- 流信息 ---');
  const info = processor.xinfo('orders');
  console.log('  Orders stream:', info);
}
