/**
 * @file 发布订阅模式
 * @category Message Queue → Pub/Sub
 * @difficulty medium
 * @tags pub-sub, event-bus, message-broker
 *
 * @description
 * 发布订阅模式实现：主题订阅、通配符匹配、消息持久化、订阅者组
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface PubSubMessage<T = unknown> {
  id: string;
  topic: string;
  payload: T;
  timestamp: number;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export type MessageHandler<T = unknown> = (message: PubSubMessage<T>) => void | Promise<void>;

export interface Subscription {
  id: string;
  topic: string;
  handler: MessageHandler;
  options: SubscriptionOptions;
}

export interface SubscriptionOptions {
  priority?: number;
  once?: boolean;
  filter?: (message: PubSubMessage) => boolean;
}

// ============================================================================
// 主题匹配器
// ============================================================================

export class TopicMatcher {
  /**
   * 检查主题是否匹配模式（支持通配符）
   * 
   * 规则：
   * - 精确匹配: "user.created" 匹配 "user.created"
   * - 单层通配符 +: "user.+" 匹配 "user.created", "user.deleted" 但不匹配 "user.profile.updated"
   * - 多层通配符 #: "user.#" 匹配 "user.created", "user.profile.updated", "user"
   */
  static match(pattern: string, topic: string): boolean {
    // 精确匹配
    if (pattern === topic) return true;

    const patternParts = pattern.split('.');
    const topicParts = topic.split('.');

    let patternIndex = 0;
    let topicIndex = 0;

    while (patternIndex < patternParts.length && topicIndex < topicParts.length) {
      const patternPart = patternParts[patternIndex];
      const topicPart = topicParts[topicIndex];

      if (patternPart === '#') {
        // 多层通配符匹配剩余所有
        return true;
      }

      if (patternPart === '+') {
        // 单层通配符，匹配当前层级
        patternIndex++;
        topicIndex++;
      } else if (patternPart === topicPart) {
        // 精确匹配当前层级
        patternIndex++;
        topicIndex++;
      } else {
        // 不匹配
        return false;
      }
    }

    // 检查是否都处理完了
    return patternIndex === patternParts.length && topicIndex === topicParts.length;
  }

  /**
   * 从订阅列表中找出匹配主题的所有模式
   */
  static findMatchingPatterns(topic: string, patterns: string[]): string[] {
    return patterns.filter(pattern => this.match(pattern, topic));
  }
}

// ============================================================================
// 发布订阅中心
// ============================================================================

export class PubSubHub {
  private subscriptions: Map<string, Subscription[]> = new Map(); // topic -> subscriptions
  private patterns: Set<string> = new Set();
  private stats = { published: 0, delivered: 0 };
  private messageHistory: PubSubMessage[] = [];
  private maxHistory: number;

  constructor(options: { maxHistory?: number } = {}) {
    this.maxHistory = options.maxHistory || 1000;
  }

  /**
   * 订阅主题
   */
  subscribe<T>(topic: string, handler: MessageHandler<T>, options: SubscriptionOptions = {}): () => void {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const subscription: Subscription = {
      id: subscriptionId,
      topic,
      handler: handler as MessageHandler,
      options
    };

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    
    const subs = this.subscriptions.get(topic)!;
    subs.push(subscription);
    
    // 按优先级排序
    subs.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

    // 如果是模式订阅，记录下来
    if (topic.includes('+') || topic.includes('#')) {
      this.patterns.add(topic);
    }

    // 返回取消订阅函数
    return () => this.unsubscribe(subscriptionId);
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [topic, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index > -1) {
        subs.splice(index, 1);
        
        // 清理空主题
        if (subs.length === 0) {
          this.subscriptions.delete(topic);
          this.patterns.delete(topic);
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * 发布消息
   */
  publish<T>(topic: string, payload: T, metadata?: Record<string, unknown>): void {
    const message: PubSubMessage<T> = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      topic,
      payload,
      timestamp: Date.now(),
      metadata
    };

    // 保存历史
    this.messageHistory.push(message as PubSubMessage);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }

    this.stats.published++;

    // 找到所有匹配的订阅
    const matchingSubs: Subscription[] = [];

    // 精确匹配
    const exactSubs = this.subscriptions.get(topic);
    if (exactSubs) {
      matchingSubs.push(...exactSubs);
    }

    // 模式匹配
    for (const pattern of this.patterns) {
      if (TopicMatcher.match(pattern, topic)) {
        const patternSubs = this.subscriptions.get(pattern);
        if (patternSubs) {
          matchingSubs.push(...patternSubs);
        }
      }
    }

    // 分发消息
    for (const sub of matchingSubs) {
      // 应用过滤器
      if (sub.options.filter && !sub.options.filter(message as PubSubMessage)) {
        continue;
      }

      this.deliver(sub, message as PubSubMessage);
    }
  }

  /**
   * 一次性订阅
   */
  once<T>(topic: string, handler: MessageHandler<T>): void {
    this.subscribe(topic, handler, { once: true });
  }

  /**
   * 获取主题订阅数
   */
  getSubscriberCount(topic: string): number {
    const exact = this.subscriptions.get(topic)?.length || 0;
    
    let patternCount = 0;
    for (const pattern of this.patterns) {
      if (TopicMatcher.match(pattern, topic)) {
        patternCount += this.subscriptions.get(pattern)?.length || 0;
      }
    }

    return exact + patternCount;
  }

  /**
   * 获取所有主题
   */
  getTopics(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 获取统计信息
   */
  getStats(): { published: number; delivered: number; topics: number; subscriptions: number } {
    let totalSubs = 0;
    for (const subs of this.subscriptions.values()) {
      totalSubs += subs.length;
    }

    return {
      ...this.stats,
      topics: this.subscriptions.size,
      subscriptions: totalSubs
    };
  }

  /**
   * 获取消息历史
   */
  getHistory(topic?: string): PubSubMessage[] {
    if (topic) {
      return this.messageHistory.filter(m => m.topic === topic);
    }
    return [...this.messageHistory];
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  private deliver(sub: Subscription, message: PubSubMessage): void {
    try {
      const result = sub.handler(message);
      
      if (result instanceof Promise) {
        result.catch(err => {
          console.error(`[PubSub] Handler error for ${sub.topic}:`, err);
        });
      }
      
      this.stats.delivered++;

      // 一次性订阅自动取消
      if (sub.options.once) {
        this.unsubscribe(sub.id);
      }
    } catch (err) {
      console.error(`[PubSub] Handler error for ${sub.topic}:`, err);
    }
  }
}

// ============================================================================
// 订阅者组 (Consumer Groups)
// ============================================================================

export interface ConsumerGroup {
  name: string;
  subscribers: Map<string, MessageHandler>;
  messageQueue: PubSubMessage[];
  processing: boolean;
}

export class ConsumerGroupManager {
  private groups: Map<string, ConsumerGroup> = new Map();
  private messageOffset: Map<string, number> = new Map(); // group -> offset

  /**
   * 创建消费者组
   */
  createGroup(name: string): ConsumerGroup {
    const group: ConsumerGroup = {
      name,
      subscribers: new Map(),
      messageQueue: [],
      processing: false
    };
    this.groups.set(name, group);
    return group;
  }

  /**
   * 加入消费者组
   */
  joinGroup(groupName: string, consumerId: string, handler: MessageHandler): boolean {
    const group = this.groups.get(groupName);
    if (!group) return false;

    group.subscribers.set(consumerId, handler);
    return true;
  }

  /**
   * 离开消费者组
   */
  leaveGroup(groupName: string, consumerId: string): boolean {
    const group = this.groups.get(groupName);
    if (!group) return false;

    return group.subscribers.delete(consumerId);
  }

  /**
   * 向组内分发消息（每条消息只被一个消费者处理）
   */
  publishToGroup(groupName: string, message: PubSubMessage): void {
    const group = this.groups.get(groupName);
    if (!group) return;

    group.messageQueue.push(message);
    this.processGroupQueue(groupName);
  }

  /**
   * 获取消费者组信息
   */
  getGroupInfo(groupName: string): { consumers: number; queueSize: number } | null {
    const group = this.groups.get(groupName);
    if (!group) return null;

    return {
      consumers: group.subscribers.size,
      queueSize: group.messageQueue.length
    };
  }

  private async processGroupQueue(groupName: string): Promise<void> {
    const group = this.groups.get(groupName);
    if (!group || group.processing || group.messageQueue.length === 0) return;

    group.processing = true;

    while (group.messageQueue.length > 0) {
      const message = group.messageQueue.shift()!;
      const consumers = Array.from(group.subscribers.entries());

      if (consumers.length === 0) {
        // 没有消费者，重新入队
        group.messageQueue.unshift(message);
        break;
      }

      // 轮询选择消费者
      const offset = this.messageOffset.get(groupName) || 0;
      const [consumerId, handler] = consumers[offset % consumers.length];
      this.messageOffset.set(groupName, offset + 1);

      try {
        await handler(message);
      } catch (err) {
        console.error(`[ConsumerGroup] Handler error for ${consumerId}:`, err);
      }
    }

    group.processing = false;
  }
}

// ============================================================================
// 消息持久化
// ============================================================================

export interface MessageStore {
  save(message: PubSubMessage): Promise<void>;
  load(since: number): Promise<PubSubMessage[]>;
  cleanup(maxAge: number): Promise<void>;
}

export class InMemoryMessageStore implements MessageStore {
  private messages: PubSubMessage[] = [];

  async save(message: PubSubMessage): Promise<void> {
    this.messages.push(message);
  }

  async load(since: number): Promise<PubSubMessage[]> {
    return this.messages.filter(m => m.timestamp >= since);
  }

  async cleanup(maxAge: number): Promise<void> {
    const cutoff = Date.now() - maxAge;
    this.messages = this.messages.filter(m => m.timestamp >= cutoff);
  }
}

export class PersistentPubSub extends PubSubHub {
  private store: MessageStore;

  constructor(store: MessageStore, options?: { maxHistory?: number }) {
    super(options);
    this.store = store;
  }

  publish<T>(topic: string, payload: T, metadata?: Record<string, unknown>): void {
    super.publish(topic, payload, metadata);

    // 异步持久化
    const message: PubSubMessage<T> = {
      id: `msg_${Date.now()}`,
      topic,
      payload,
      timestamp: Date.now(),
      metadata
    };
    
    this.store.save(message as PubSubMessage).catch(err => {
      console.error('[PersistentPubSub] Failed to save message:', err);
    });
  }

  /**
   * 重放历史消息
   */
  async replay(topic: string, since: number): Promise<void> {
    const messages = await this.store.load(since);
    
    for (const message of messages) {
      if (message.topic === topic) {
        this.publish(message.topic, message.payload, message.metadata);
      }
    }
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 发布订阅模式演示 ===\n');

  // 1. 基础发布订阅
  console.log('--- 基础 Pub/Sub ---');
  const pubsub = new PubSubHub();

  // 订阅用户创建事件
  const unsubscribe1 = pubsub.subscribe('user.created', (msg) => {
    console.log(`  [Handler 1] User created:`, msg.payload);
  });

  pubsub.subscribe('user.created', (msg) => {
    console.log(`  [Handler 2] Sending welcome email to:`, (msg.payload as { email: string }).email);
  });

  // 发布消息
  pubsub.publish('user.created', { id: 1, name: 'Alice', email: 'alice@example.com' });
  
  console.log('  Subscribers to user.created:', pubsub.getSubscriberCount('user.created'));

  // 2. 通配符订阅
  console.log('\n--- 通配符订阅 ---');
  
  // 订阅所有 user 相关事件
  pubsub.subscribe('user.+', (msg) => {
    console.log(`  [Wildcard +] User event: ${msg.topic}`);
  });

  // 订阅所有事件
  pubsub.subscribe('#', (msg) => {
    console.log(`  [Wildcard #] Any event: ${msg.topic}`);
  });

  pubsub.publish('user.updated', { id: 1, name: 'Alice Smith' });
  pubsub.publish('order.created', { orderId: 123 });

  // 3. 主题匹配测试
  console.log('\n--- 主题匹配测试 ---');
  const testCases = [
    { pattern: 'user.created', topic: 'user.created', expected: true },
    { pattern: 'user.+', topic: 'user.created', expected: true },
    { pattern: 'user.+', topic: 'user.profile.updated', expected: false },
    { pattern: 'user.#', topic: 'user.profile.updated', expected: true },
    { pattern: 'user.#', topic: 'user', expected: true },
    { pattern: 'order.*.status', topic: 'order.123.status', expected: false } // * 不是有效的通配符
  ];

  for (const tc of testCases) {
    const result = TopicMatcher.match(tc.pattern, tc.topic);
    console.log(`  ${tc.pattern} matches ${tc.topic}: ${result} (expected: ${tc.expected}) ${result === tc.expected ? '✓' : '✗'}`);
  }

  // 4. 消费者组
  console.log('\n--- 消费者组 ---');
  const groupManager = new ConsumerGroupManager();
  groupManager.createGroup('email-processor');

  // 添加消费者
  groupManager.joinGroup('email-processor', 'worker-1', (msg) => {
    console.log(`  [Worker 1] Processing: ${msg.id}`);
  });
  groupManager.joinGroup('email-processor', 'worker-2', (msg) => {
    console.log(`  [Worker 2] Processing: ${msg.id}`);
  });

  // 发布消息到组
  for (let i = 0; i < 4; i++) {
    groupManager.publishToGroup('email-processor', {
      id: `email-${i}`,
      topic: 'send-email',
      payload: { to: `user${i}@example.com` },
      timestamp: Date.now()
    });
  }

  console.log('  Group info:', groupManager.getGroupInfo('email-processor'));

  // 5. 统计
  console.log('\n--- 统计信息 ---');
  console.log('  Pub/Sub stats:', pubsub.getStats());
}
