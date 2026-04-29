# 消息队列深度理论：从解耦到流处理

> **目标读者**：后端工程师、分布式系统开发者、架构师
> **关联文档**：``30-knowledge-base/30.2-categories/message-queue.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,500 字

---

## 1. 消息队列的核心价值

### 1.1 为什么需要消息队列

```
同步调用                    异步消息
┌─────────┐                ┌─────────┐
│  服务 A  │──HTTP──→│  服务 B  │    │  服务 A  │──MQ──→│  队列    │
│ (阻塞)   │←──响应──│ (处理)   │    │ (立即返回)│        │  ↓      │
└─────────┘                └─────────┘    └─────────┘        │  服务 B  │
                                                          └─────────┘
```

**三大核心价值**：

| 价值 | 说明 | 场景 |
|------|------|------|
| **解耦** | 生产者与消费者独立演进 | 微服务间通信 |
| **异步** | 非阻塞处理，提升吞吐量 | 订单创建后异步发邮件 |
| **削峰** | 平滑流量突发 | 秒杀活动 |

---

## 2. 消息模型对比

### 2.1 队列 vs 发布-订阅

| 模型 | 路由方式 | 消费者数 | 消息保留 |
|------|---------|---------|---------|
| **队列（Queue）** | 点对点 | 1 个消费者 | 消费后删除 |
| **发布-订阅（Pub-Sub）** | Topic | 多个消费者 | 按策略保留 |
| **日志（Log）** | Partition | 消费者组 | 持久保留 |

### 2.2 主流消息系统选型

| 系统 | 模型 | 吞吐量 | 延迟 | 最佳场景 |
|------|------|--------|------|---------|
| **RabbitMQ** | Queue + Pub-Sub | 中 | 极低 (<1ms) | 企业级、复杂路由 |
| **Kafka** | Log | 极高 | 低 (~10ms) | 大数据、事件溯源 |
| **Redis Streams** | Log | 高 | 极低 (<1ms) | 轻量级、缓存级 |
| **NATS** | Pub-Sub | 极高 | 极低 (<1ms) | 云原生、简单场景 |
| **Pulsar** | 分层存储 | 极高 | 低 | 多租户、地理复制 |
| **SQS/SNS** | 托管 | 高 | 中 | AWS 生态 |

---

## 3. 可靠性保证

### 3.1 投递语义

| 语义 | 含义 | 实现成本 |
|------|------|---------|
| **At-most-once** | 最多投递一次，可能丢失 | 低 |
| **At-least-once** | 至少投递一次，可能重复 | 中 |
| **Exactly-once** | 恰好一次 | 高（需要幂等消费） |

**推荐**：大多数场景使用 At-least-once + 消费者幂等。

### 3.2 消息持久化

```
生产者 → 写入磁盘 → 确认 ACK → 消费者读取 → 确认 ACK → 删除
           ↑                                        ↑
        主从复制                                手动 ACK
```

---

## 4. 流处理架构

### 4.1 Kafka Streams 模式

```
Topic A (订单事件)
    ↓
Stream Processing (聚合/转换)
    ↓
Topic B (订单统计)
    ↓
Consumer (写入数据库)
```

### 4.2 事件溯源

```typescript
// 事件溯源：状态是事件的折叠
interface Event {
  type: 'OrderCreated' | 'OrderPaid' | 'OrderShipped';
  payload: Record<string, unknown>;
  timestamp: Date;
}

// 当前状态 = fold(初始状态, 事件列表)
const currentState = events.reduce(applyEvent, initialState);
```

---

## 5. 反模式

### 反模式 1：用 MQ 做同步调用

❌ 发送消息后立即轮询结果。
✅ MQ 用于异步场景，同步调用用 RPC/HTTP。

### 反模式 2：消息过大

❌ 在消息中传递整个文件内容。
✅ 消息传递引用（URL），实际数据走对象存储。

### 反模式 3：忽视死信队列

❌ 消费失败的消息无限重试。
✅ 设置最大重试次数，超限进入死信队列（DLQ）。

---

## 6. 总结

消息队列是**分布式系统的神经系统**。

**选型建议**：
- 简单任务队列 → BullMQ (Redis)
- 企业级消息 → RabbitMQ
- 大数据流 → Kafka
- 云原生 → NATS

**核心原则**：
1. 默认使用 At-least-once + 幂等消费
2. 消息体保持小巧，大文件走对象存储
3. 监控消费延迟，防止消息堆积

---

## 7. 代码示例：BullMQ 生产者与消费者

```typescript
// BullMQ 基于 Redis 的高性能任务队列
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

// 生产者：定义队列并添加任务
const emailQueue = new Queue('email', { connection });

async function sendWelcomeEmail(userId: string, email: string) {
  await emailQueue.add('welcome', { userId, email }, {
    delay: 5000,           // 5秒后执行
    attempts: 3,           // 失败重试 3 次
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 10,  // 保留最近 10 条完成记录
  });
}

// 消费者：处理队列任务
const worker = new Worker('email', async (job: Job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'welcome') {
    const { userId, email } = job.data;
    // 调用邮件服务
    await emailService.send({ to: email, template: 'welcome', userId });
  }
  
  return { sent: true, timestamp: Date.now() };
}, { connection });

// 事件监听
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
```

## 代码示例：RabbitMQ 发布-订阅模式

```typescript
// RabbitMQ 使用 amqplib 实现 pub-sub 与路由
import amqp from 'amqplib';

async function rabbitPubSub() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  const exchange = 'orders.topic';
  await channel.assertExchange(exchange, 'topic', { durable: true });

  // 生产者：发送带路由键的消息
  const order = { id: 'order-123', status: 'created', amount: 299.99 };
  channel.publish(exchange, 'order.created', Buffer.from(JSON.stringify(order)), {
    persistent: true, // 消息持久化
  });

  // 消费者 1：监听所有订单创建事件
  const q1 = await channel.assertQueue('inventory-service');
  await channel.bindQueue(q1.queue, exchange, 'order.created');
  channel.consume(q1.queue, (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log('[Inventory] Reserve stock for order:', content.id);
      channel.ack(msg); // 手动确认
    }
  });

  // 消费者 2：监听所有支付相关事件
  const q2 = await channel.assertQueue('notification-service');
  await channel.bindQueue(q2.queue, exchange, 'order.*'); // 通配符匹配
  channel.consume(q2.queue, (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log('[Notification] Send alert for:', content.status);
      channel.ack(msg);
    }
  });
}
```

## 代码示例：Kafka 生产者与消费者（kafkajs）

```typescript
// Kafka 流处理：生产者与消费者组
import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

// 生产者
const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
await producer.connect();

async function sendOrderEvent(orderId: string, event: string) {
  await producer.send({
    topic: 'orders',
    messages: [
      {
        key: orderId,               // 同一 orderId 始终进入同一分区，保证顺序
        value: JSON.stringify({ orderId, event, timestamp: Date.now() }),
        headers: { 'content-type': 'application/json' },
      },
    ],
  });
}

// 消费者组
const consumer = kafka.consumer({ groupId: 'order-processors' });
await consumer.connect();
await consumer.subscribe({ topic: 'orders', fromBeginning: false });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const value = JSON.parse(message.value!.toString());
    console.log(`[Partition ${partition}] Processing order ${value.orderId}: ${value.event}`);
    
    // 幂等处理：检查是否已处理过该事件
    if (await isProcessed(value.orderId, value.event)) {
      console.log('Duplicate event detected, skipping.');
      return;
    }
    
    await processOrderEvent(value);
    await markAsProcessed(value.orderId, value.event);
  },
});

// 辅助函数：幂等性校验（实际应使用 Redis/数据库）
async function isProcessed(orderId: string, event: string): Promise<boolean> { /* ... */ return false; }
async function markAsProcessed(orderId: string, event: string): Promise<void> { /* ... */ }
```

## 代码示例：Redis Streams 轻量级消息流

```typescript
// Redis Streams：轻量级、低延迟的消息日志
import Redis from 'ioredis';

const redis = new Redis();

// 生产者：向 stream 添加事件
async function addEvent(stream: string, event: Record<string, string>) {
  await redis.xadd(stream, '*', ...Object.entries(event).flat()); // '*' = Redis 自动生成 ID
}

// 消费者组（持久化消费进度）
async function createConsumerGroup(stream: string, group: string) {
  try {
    await redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
  } catch (err: any) {
    if (!err.message.includes('BUSYGROUP')) throw err;
  }
}

async function consumeFromGroup(stream: string, group: string, consumer: string) {
  const messages = await redis.xreadgroup(
    'GROUP', group, consumer,
    'COUNT', 10,
    'BLOCK', 5000,
    'STREAMS', stream, '>' // '>' 表示只读取新消息
  );

  if (!messages) return;

  for (const [_, entries] of messages as any) {
    for (const [id, fields] of entries) {
      const event = Object.fromEntries(
        (fields as string[]).reduce((acc, val, i, arr) => {
          if (i % 2 === 0) acc.push([val, arr[i + 1]]);
          return acc;
        }, [] as [string, string][])
      );

      console.log(`[${consumer}] Processing ${id}:`, event);
      
      // 业务处理...
      await processEvent(event);
      
      // 确认消费
      await redis.xack(stream, group, id);
    }
  }
}

// 使用示例
await addEvent('sensor:data', { deviceId: 'd-001', temperature: '23.5', humidity: '60' });
await createConsumerGroup('sensor:data', 'analytics-group');
await consumeFromGroup('sensor:data', 'analytics-group', 'worker-1');
```

---

## 参考资源

- [Kafka 官方文档](https://kafka.apache.org/documentation/)
- [RabbitMQ 教程](https://www.rabbitmq.com/tutorials)
- [NATS 文档](https://docs.nats.io/)
- [Designing Data-Intensive Applications](https://dataintensive.net/)
- [BullMQ Documentation](https://docs.bullmq.io/) — Redis 任务队列官方文档
- [amqplib (Node.js RabbitMQ)](https://amqp-node.github.io/amqplib/) — RabbitMQ Node.js 客户端
- [KafkaJS Documentation](https://kafka.js.org/docs/getting-started) — Kafka Node.js 客户端
- [Redis Streams Intro](https://redis.io/docs/latest/develop/data-types/streams/) — Redis Streams 官方指南
- [AWS SQS Developer Guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub/docs/overview)
- [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) — Hohpe & Woolf 经典

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `consumer-group.ts`
- `dead-letter-queue.ts`
- `delay-queue.ts`
- `index.ts`
- `message-broker.ts`
- `priority-queue.ts`
- `pub-sub.ts`
- `queue-implementation.ts`
- `stream-processing.ts`
- `task-queue.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-29
