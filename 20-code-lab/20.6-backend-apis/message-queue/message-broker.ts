/**
 * @file 消息代理
 * @category Message Queue → Message Broker
 * @difficulty hard
 * @tags message-broker, amqp, mqtt, message-routing
 *
 * @description
 * 消息代理实现：消息路由、交换机、队列绑定、消息确认
 */

// ============================================================================
// 类型定义
// ============================================================================

export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers';

export interface Exchange {
  name: string;
  type: ExchangeType;
  durable: boolean;
  bindings: Binding[];
}

export interface Queue {
  name: string;
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  messages: BrokerMessage[];
  consumers: Consumer[];
  maxLength?: number;
  ttl?: number;
}

export interface Binding {
  exchange: string;
  queue: string;
  routingKey: string;
  headers?: Record<string, string>;
}

export interface BrokerMessage {
  id: string;
  content: unknown;
  headers: Record<string, unknown>;
  routingKey: string;
  exchange: string;
  timestamp: number;
  deliveryCount: number;
  redelivered: boolean;
}

export interface Consumer {
  id: string;
  queue: string;
  handler: (msg: BrokerMessage, ack: () => void, nack: (requeue?: boolean) => void) => void;
  prefetch: number;
  unacked: Set<string>;
}

// ============================================================================
// 消息代理
// ============================================================================

export class MessageBroker {
  private exchanges = new Map<string, Exchange>();
  private queues = new Map<string, Queue>();
  private bindings: Binding[] = [];
  private consumers = new Map<string, Consumer>();
  private stats = { published: 0, delivered: 0, acknowledged: 0 };

  // 交换机操作
  /**
   * 声明交换机
   */
  declareExchange(name: string, type: ExchangeType, options: { durable?: boolean } = {}): Exchange {
    const exchange: Exchange = {
      name,
      type,
      durable: options.durable ?? true,
      bindings: []
    };

    this.exchanges.set(name, exchange);
    console.log(`[Broker] Declared ${type} exchange: ${name}`);
    return exchange;
  }

  /**
   * 删除交换机
   */
  deleteExchange(name: string): boolean {
    // 删除相关绑定
    this.bindings = this.bindings.filter(b => b.exchange !== name);
    return this.exchanges.delete(name);
  }

  // 队列操作
  /**
   * 声明队列
   */
  declareQueue(name: string, options: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    maxLength?: number;
    ttl?: number;
  } = {}): Queue {
    const queue: Queue = {
      name,
      durable: options.durable ?? true,
      exclusive: options.exclusive ?? false,
      autoDelete: options.autoDelete ?? false,
      messages: [],
      consumers: [],
      maxLength: options.maxLength,
      ttl: options.ttl
    };

    this.queues.set(name, queue);
    console.log(`[Broker] Declared queue: ${name}`);
    return queue;
  }

  /**
   * 删除队列
   */
  deleteQueue(name: string): boolean {
    // 删除相关绑定
    this.bindings = this.bindings.filter(b => b.queue !== name);
    return this.queues.delete(name);
  }

  /**
   * 清空队列
   */
  purgeQueue(name: string): number {
    const queue = this.queues.get(name);
    if (!queue) return 0;
    const count = queue.messages.length;
    queue.messages = [];
    return count;
  }

  // 绑定操作
  /**
   * 绑定队列到交换机
   */
  bindQueue(exchange: string, queue: string, routingKey: string, headers?: Record<string, string>): void {
    if (!this.exchanges.has(exchange)) {
      throw new Error(`Exchange ${exchange} does not exist`);
    }
    if (!this.queues.has(queue)) {
      throw new Error(`Queue ${queue} does not exist`);
    }

    const binding: Binding = { exchange, queue, routingKey, headers };
    this.bindings.push(binding);

    // 更新交换机的绑定列表
    const ex = this.exchanges.get(exchange)!;
    ex.bindings.push(binding);

    console.log(`[Broker] Bound queue ${queue} to exchange ${exchange} with key "${routingKey}"`);
  }

  /**
   * 解绑队列
   */
  unbindQueue(exchange: string, queue: string, routingKey: string): void {
    this.bindings = this.bindings.filter(
      b => !(b.exchange === exchange && b.queue === queue && b.routingKey === routingKey)
    );

    const ex = this.exchanges.get(exchange);
    if (ex) {
      ex.bindings = ex.bindings.filter(
        b => !(b.queue === queue && b.routingKey === routingKey)
      );
    }
  }

  // 消息发布
  /**
   * 发布消息
   */
  publish(exchange: string, routingKey: string, content: unknown, headers: Record<string, unknown> = {}): boolean {
    const ex = this.exchanges.get(exchange);
    if (!ex) {
      console.error(`[Broker] Exchange ${exchange} not found`);
      return false;
    }

    const message: BrokerMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      content,
      headers,
      routingKey,
      exchange,
      timestamp: Date.now(),
      deliveryCount: 0,
      redelivered: false
    };

    // 根据交换机类型路由消息
    const routed = this.routeMessage(ex, message);
    
    if (routed) {
      this.stats.published++;
    }

    return routed;
  }

  /**
   * 直接发送到队列
   */
  sendToQueue(queue: string, content: unknown, headers: Record<string, unknown> = {}): boolean {
    const q = this.queues.get(queue);
    if (!q) {
      console.error(`[Broker] Queue ${queue} not found`);
      return false;
    }

    const message: BrokerMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      content,
      headers,
      routingKey: queue,
      exchange: '',
      timestamp: Date.now(),
      deliveryCount: 0,
      redelivered: false
    };

    return this.enqueueMessage(q, message);
  }

  // 消费操作
  /**
   * 消费队列
   */
  consume(queue: string, handler: Consumer['handler'], options: { prefetch?: number } = {}): string {
    const q = this.queues.get(queue);
    if (!q) {
      throw new Error(`Queue ${queue} does not exist`);
    }

    const consumerId = `consumer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const consumer: Consumer = {
      id: consumerId,
      queue,
      handler,
      prefetch: options.prefetch ?? 1,
      unacked: new Set()
    };

    this.consumers.set(consumerId, consumer);
    q.consumers.push(consumer);

    // 立即分发队列中已有的消息
    this.dispatchMessages(q);

    return consumerId;
  }

  /**
   * 取消消费
   */
  cancel(consumerId: string): boolean {
    const consumer = this.consumers.get(consumerId);
    if (!consumer) return false;

    const queue = this.queues.get(consumer.queue);
    if (queue) {
      const index = queue.consumers.findIndex(c => c.id === consumerId);
      if (index > -1) {
        queue.consumers.splice(index, 1);
      }
    }

    return this.consumers.delete(consumerId);
  }

  // 消息确认
  /**
   * 确认消息
   */
  ack(consumerId: string, messageId: string): void {
    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      consumer.unacked.delete(messageId);
      this.stats.acknowledged++;
      
      // 继续分发消息
      const queue = this.queues.get(consumer.queue);
      if (queue) {
        this.dispatchMessages(queue);
      }
    }
  }

  /**
   * 否定确认消息
   */
  nack(consumerId: string, messageId: string, requeue = true): void {
    const consumer = this.consumers.get(consumerId);
    if (!consumer) return;

    consumer.unacked.delete(messageId);

    if (requeue) {
      // 重新入队
      const queue = this.queues.get(consumer.queue);
      if (queue) {
        // 找到消息并重新入队（简化实现）
        console.log(`[Broker] Requeueing message ${messageId}`);
      }
    }

    // 继续分发消息
    const queue = this.queues.get(consumer.queue);
    if (queue) {
      this.dispatchMessages(queue);
    }
  }

  // 查询操作
  /**
   * 获取交换机列表
   */
  getExchanges(): Exchange[] {
    return Array.from(this.exchanges.values());
  }

  /**
   * 获取队列列表
   */
  getQueues(): Queue[] {
    return Array.from(this.queues.values());
  }

  /**
   * 获取队列信息
   */
  getQueueInfo(name: string): { messages: number; consumers: number } | null {
    const queue = this.queues.get(name);
    if (!queue) return null;

    return {
      messages: queue.messages.length,
      consumers: queue.consumers.length
    };
  }

  /**
   * 获取统计
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  // 私有方法
  private routeMessage(exchange: Exchange, message: BrokerMessage): boolean {
    switch (exchange.type) {
      case 'direct':
        return this.routeDirect(exchange, message);
      case 'fanout':
        return this.routeFanout(exchange, message);
      case 'topic':
        return this.routeTopic(exchange, message);
      case 'headers':
        return this.routeHeaders(exchange, message);
      default:
        return false;
    }
  }

  private routeDirect(exchange: Exchange, message: BrokerMessage): boolean {
    let routed = false;

    for (const binding of exchange.bindings) {
      if (binding.routingKey === message.routingKey) {
        const queue = this.queues.get(binding.queue);
        if (queue) {
          this.enqueueMessage(queue, { ...message });
          routed = true;
        }
      }
    }

    return routed;
  }

  private routeFanout(exchange: Exchange, message: BrokerMessage): boolean {
    let routed = false;

    for (const binding of exchange.bindings) {
      const queue = this.queues.get(binding.queue);
      if (queue) {
        this.enqueueMessage(queue, { ...message });
        routed = true;
      }
    }

    return routed;
  }

  private routeTopic(exchange: Exchange, message: BrokerMessage): boolean {
    let routed = false;

    for (const binding of exchange.bindings) {
      if (this.matchTopicPattern(binding.routingKey, message.routingKey)) {
        const queue = this.queues.get(binding.queue);
        if (queue) {
          this.enqueueMessage(queue, { ...message });
          routed = true;
        }
      }
    }

    return routed;
  }

  private routeHeaders(exchange: Exchange, message: BrokerMessage): boolean {
    let routed = false;

    for (const binding of exchange.bindings) {
      if (binding.headers && this.matchHeaders(binding.headers, message.headers)) {
        const queue = this.queues.get(binding.queue);
        if (queue) {
          this.enqueueMessage(queue, { ...message });
          routed = true;
        }
      }
    }

    return routed;
  }

  private matchTopicPattern(pattern: string, routingKey: string): boolean {
    const patternParts = pattern.split('.');
    const keyParts = routingKey.split('.');

    let pIdx = 0;
    let kIdx = 0;

    while (pIdx < patternParts.length && kIdx < keyParts.length) {
      if (patternParts[pIdx] === '#') {
        return true; // 多层匹配
      }
      if (patternParts[pIdx] === '+' || patternParts[pIdx] === '*') {
        // 单层匹配
        pIdx++;
        kIdx++;
      } else if (patternParts[pIdx] === keyParts[kIdx]) {
        pIdx++;
        kIdx++;
      } else {
        return false;
      }
    }

    return pIdx === patternParts.length && kIdx === keyParts.length;
  }

  private matchHeaders(bindingHeaders: Record<string, string>, messageHeaders: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(bindingHeaders)) {
      if (messageHeaders[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private enqueueMessage(queue: Queue, message: BrokerMessage): boolean {
    // 检查队列长度限制
    if (queue.maxLength && queue.messages.length >= queue.maxLength) {
      console.warn(`[Broker] Queue ${queue.name} is full, dropping message`);
      return false;
    }

    queue.messages.push(message);
    
    // 尝试分发给消费者
    this.dispatchMessages(queue);
    
    return true;
  }

  private dispatchMessages(queue: Queue): void {
    if (queue.messages.length === 0 || queue.consumers.length === 0) return;

    for (const consumer of queue.consumers) {
      // 检查 prefetch 限制
      if (consumer.unacked.size >= consumer.prefetch) continue;

      // 获取消息
      const message = queue.messages.shift();
      if (!message) break;

      message.deliveryCount++;
      consumer.unacked.add(message.id);
      this.stats.delivered++;

      // 调用消费者处理器
      try {
        consumer.handler(
          message,
          () => { this.ack(consumer.id, message.id); },
          (requeue = true) => { this.nack(consumer.id, message.id, requeue); }
        );
      } catch (error) {
        console.error(`[Broker] Consumer error:`, error);
        this.nack(consumer.id, message.id, true);
      }
    }
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 消息代理演示 ===\n');

  const broker = new MessageBroker();

  // 1. 直接交换机 (Direct Exchange)
  console.log('--- 直接交换机 ---');
  broker.declareExchange('direct-logs', 'direct');
  broker.declareQueue('info-logs');
  broker.declareQueue('error-logs');
  broker.bindQueue('direct-logs', 'info-logs', 'info');
  broker.bindQueue('direct-logs', 'error-logs', 'error');

  broker.consume('info-logs', (msg) => {
    console.log(`  [Info Consumer] ${msg.content}`);
  });

  broker.publish('direct-logs', 'info', 'Application started');
  broker.publish('direct-logs', 'error', 'Connection failed');

  // 2. 扇出交换机 (Fanout Exchange)
  console.log('\n--- 扇出交换机 ---');
  broker.declareExchange('notifications', 'fanout');
  broker.declareQueue('email-service');
  broker.declareQueue('push-service');
  broker.declareQueue('sms-service');

  broker.bindQueue('notifications', 'email-service', '');
  broker.bindQueue('notifications', 'push-service', '');
  broker.bindQueue('notifications', 'sms-service', '');

  broker.consume('email-service', (msg) => { console.log(`  [Email] ${msg.content}`); });
  broker.consume('push-service', (msg) => { console.log(`  [Push] ${msg.content}`); });

  broker.publish('notifications', '', 'New order received');

  // 3. 主题交换机 (Topic Exchange)
  console.log('\n--- 主题交换机 ---');
  broker.declareExchange('events', 'topic');
  broker.declareQueue('all-orders');
  broker.declareQueue('us-orders');
  broker.declareQueue('critical-errors');

  broker.bindQueue('events', 'all-orders', 'order.*');
  broker.bindQueue('events', 'us-orders', 'order.us.*');
  broker.bindQueue('events', 'critical-errors', 'error.critical.#');

  broker.consume('all-orders', (msg) => { console.log(`  [All Orders] ${msg.routingKey}: ${msg.content}`); });
  broker.consume('us-orders', (msg) => { console.log(`  [US Orders] ${msg.routingKey}: ${msg.content}`); });

  broker.publish('events', 'order.created', 'Order #123');
  broker.publish('events', 'order.us.california', 'Order #456 in CA');
  broker.publish('events', 'error.critical.db.connection', 'DB is down');

  // 4. 统计信息
  console.log('\n--- 统计信息 ---');
  console.log('  Exchanges:', broker.getExchanges().length);
  console.log('  Queues:', broker.getQueues().length);
  console.log('  Stats:', broker.getStats());

  // 5. 队列信息
  console.log('\n--- 队列信息 ---');
  for (const queue of broker.getQueues()) {
    const info = broker.getQueueInfo(queue.name);
    console.log(`  ${queue.name}: ${info?.messages} messages, ${info?.consumers} consumers`);
  }
}
