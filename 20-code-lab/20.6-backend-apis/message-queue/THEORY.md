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

## 代码示例：死信队列（DLQ）实现

```typescript
// dead-letter-queue.ts — 消费失败消息转入死信队列
interface DLQMessage {
  originalTopic: string;
  originalMessage: unknown;
  failedAt: string;
  errorMessage: string;
  retryCount: number;
}

class DeadLetterQueue {
  private dlq = new Queue('dead-letter', { connection });

  async enqueue(message: DLQMessage): Promise<void> {
    await this.dlq.add('failed', message, {
      attempts: 0, // DLQ 不再重试
      removeOnComplete: 100,
    });
  }

  async reprocess(dlqJobId: string, targetQueue: Queue): Promise<void> {
    const job = await this.dlq.getJob(dlqJobId);
    if (!job) throw new Error('DLQ job not found');
    await targetQueue.add(job.data.originalMessage);
    await job.remove();
  }
}

// 在 Worker 中使用
const worker = new Worker('email', async (job) => {
  try {
    await sendEmail(job.data);
  } catch (err) {
    if (job.attemptsMade >= 2) {
      await dlq.enqueue({
        originalTopic: 'email',
        originalMessage: job.data,
        failedAt: new Date().toISOString(),
        errorMessage: (err as Error).message,
        retryCount: job.attemptsMade,
      });
      throw err; // 让 BullMQ 标记为失败
    }
    throw err; // 继续重试
  }
}, { connection });
```

## 代码示例：Outbox 模式（保证消息至少发送一次）

```typescript
// outbox-pattern.ts — 数据库事务内写消息，后台轮询发送
import { PoolClient } from 'pg';

interface OutboxRecord {
  id: string;
  topic: string;
  payload: string;
  headers: string;
  created_at: Date;
  processed_at: Date | null;
}

async function publishEvent(
  client: PoolClient,
  topic: string,
  payload: unknown,
  headers: Record<string, string> = {}
): Promise<void> {
  // 在同一个数据库事务中写入业务表 + outbox 表
  await client.query(
    `INSERT INTO outbox (id, topic, payload, headers, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [crypto.randomUUID(), topic, JSON.stringify(payload), JSON.stringify(headers)]
  );
}

// 后台轮询发送器
async function outboxPoller(
  db: Pool,
  producer: KafkaProducer,
  intervalMs = 5000
): Promise<() => void> {
  let running = true;

  async function poll() {
    while (running) {
      const { rows } = await db.query<OutboxRecord>(
        `SELECT * FROM outbox WHERE processed_at IS NULL ORDER BY created_at LIMIT 100`
      );

      for (const row of rows) {
        try {
          await producer.send({
            topic: row.topic,
            messages: [{ value: row.payload, headers: JSON.parse(row.headers) }],
          });
          await db.query(
            `UPDATE outbox SET processed_at = NOW() WHERE id = $1`,
            [row.id]
          );
        } catch (err) {
          console.error(`Failed to publish outbox message ${row.id}:`, err);
        }
      }

      await new Promise(r => setTimeout(r, intervalMs));
    }
  }

  poll();
  return () => { running = false; };
}
```

## 代码示例：Saga 模式 — 分布式事务协调

```typescript
// saga-orchestrator.ts — 基于消息队列的 Saga 编排器
interface SagaStep {
  name: string;
  action: () => Promise<void>;
  compensate: () => Promise<void>;
}

class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private executed: string[] = [];

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.action();
        this.executed.push(step.name);
      } catch (err) {
        console.error(`Saga step "${step.name}" failed, starting compensation...`);
        await this.compensate();
        throw new Error(`Saga failed at step: ${step.name}`);
      }
    }
  }

  private async compensate(): Promise<void> {
    // 反向补偿已执行的步骤
    for (const name of this.executed.reverse()) {
      const step = this.steps.find(s => s.name === name)!;
      try {
        await step.compensate();
      } catch (compErr) {
        console.error(`Compensation failed for "${name}":`, compErr);
        // 实际生产环境需告警 + 人工介入
      }
    }
  }
}

// 订单创建 Saga 示例
const createOrderSaga = new SagaOrchestrator()
  .addStep({
    name: 'reserve-inventory',
    action: () => inventoryQueue.add('reserve', { productId, qty }),
    compensate: () => inventoryQueue.add('release', { productId, qty }),
  })
  .addStep({
    name: 'process-payment',
    action: () => paymentQueue.add('charge', { orderId, amount }),
    compensate: () => paymentQueue.add('refund', { orderId }),
  })
  .addStep({
    name: 'send-confirmation',
    action: () => emailQueue.add('order-confirmed', { orderId }),
    compensate: () => Promise.resolve(), // 不可撤销，无需补偿
  });

await createOrderSaga.execute();
```

## 代码示例：延迟队列实现（基于 Redis 有序集合）

```typescript
// delay-queue.ts — 轻量级延迟队列（无 BullMQ 依赖场景）
import Redis from 'ioredis';

const redis = new Redis();

interface DelayedJob {
  id: string;
  payload: unknown;
  executeAt: number; // Unix timestamp (ms)
}

export class DelayQueue {
  private readonly key: string;

  constructor(queueName: string) {
    this.key = `delayqueue:${queueName}`;
  }

  async enqueue(job: DelayedJob): Promise<void> {
    await redis.zadd(this.key, job.executeAt, JSON.stringify(job));
  }

  async poll(handler: (job: DelayedJob) => Promise<void>): Promise<void> {
    const now = Date.now();
    // 获取所有已到期的任务
    const jobs = await redis.zrangebyscore(this.key, 0, now);

    for (const raw of jobs) {
      const job: DelayedJob = JSON.parse(raw);
      // 使用 Lua 脚本原子移除并处理，防止并发重复消费
      const removed = await redis.zrem(this.key, raw);
      if (removed === 1) {
        await handler(job).catch(err => console.error('DelayQueue handler error:', err));
      }
    }
  }
}

// 定时轮询（生产环境建议用独立进程/Worker）
setInterval(() => {
  delayQueue.poll(async (job) => {
    console.log(`Executing delayed job ${job.id} at ${new Date().toISOString()}`);
  });
}, 1000);
```

---

## 代码示例：NATS JetStream 持久化消费

```typescript
// nats-jetstream.ts — NATS JetStream 保证有序持久化消费
import { connect, JSONCodec, consumerOpts } from 'nats';

const nc = await connect({ servers: ['localhost:4222'] });
const js = nc.jetstream();
const jc = JSONCodec<OrderEvent>();

interface OrderEvent {
  id: string;
  status: 'created' | 'paid' | 'shipped';
  amount: number;
}

// 发布事件到 Stream（自动创建 Stream 若不存在）
async function publishOrderEvent(order: OrderEvent): Promise<void> {
  await js.publish('ORDERS.created', jc.encode(order), {
    msgID: order.id, // 幂等：相同 msgID 的去重窗口内只接受一次
  });
  console.log('Published:', order.id);
}

// 创建持久化消费者（Durable Consumer）
const opts = consumerOpts()
  .durable('order-processor')
  .deliverAll()
  .ackExplicit()
  .maxDeliver(3)
  .replayInstantly();

const sub = await js.subscribe('ORDERS.created', opts);
(async () => {
  for await (const msg of sub) {
    const order = jc.decode(msg.data);
    try {
      await processOrder(order);
      msg.ack(); // 显式确认
    } catch (err) {
      console.error('Processing failed:', err);
      msg.nak(5000); // 否定确认，5 秒后重新投递
    }
  }
})();

// 批量发布示例
await Promise.all([
  publishOrderEvent({ id: 'ord-101', status: 'created', amount: 199.99 }),
  publishOrderEvent({ id: 'ord-102', status: 'created', amount: 49.50 }),
]);
```

## 代码示例：AWS SQS 消费者（@aws-sdk/client-sqs）

```typescript
// sqs-consumer.ts — 基于 AWS SDK v3 的 SQS 长轮询消费
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';

const client = new SQSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const queueUrl = process.env.SQS_QUEUE_URL!;

async function pollMessages(): Promise<void> {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,      // 长轮询，减少空请求
    VisibilityTimeout: 60,    // 处理窗口
    AttributeNames: ['All'],
    MessageAttributeNames: ['All'],
  });

  const response = await client.send(command);
  if (!response.Messages || response.Messages.length === 0) return;

  for (const msg of response.Messages) {
    try {
      const body = JSON.parse(msg.Body!);
      await handleSQSMessage(body);

      // 消费成功后删除消息
      await client.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle!,
        })
      );
    } catch (err) {
      console.error('SQS message processing failed:', err);
      // 不删除消息，等待 VisibilityTimeout 后自动重新可见
      // 或主动延长可见性超时以获得更多处理时间
      await client.send(
        new ChangeMessageVisibilityCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle!,
          VisibilityTimeout: 300,
        })
      );
    }
  }
}

// 持续轮询（生产环境建议使用官方 sqs-consumer 库）
setInterval(pollMessages, 1000);
```

## 代码示例：CloudEvents 规范兼容的消息封装

```typescript
// cloudevent-wrapper.ts — 遵循 CNCF CloudEvents 规范的消息封装
interface CloudEvent<T = unknown> {
  specversion: '1.0';
  type: string;           // 事件类型，如 com.example.order.created
  source: string;         // 事件源 URI
  id: string;             // 唯一标识
  time: string;           // ISO 8601 时间戳
  datacontenttype?: string;
  data?: T;
}

function createCloudEvent<T>(
  type: string,
  source: string,
  data: T
): CloudEvent<T> {
  return {
    specversion: '1.0',
    type,
    source,
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data,
  };
}

// 使用示例：序列化后投递到 Kafka / RabbitMQ / SQS
const event = createCloudEvent(
  'com.example.order.created',
  '/services/order-service',
  { orderId: 'ord-789', amount: 299.99 }
);

// Kafka 投递
await producer.send({
  topic: 'orders',
  messages: [
    {
      key: event.id,
      value: JSON.stringify(event),
      headers: { 'ce-specversion': '1.0', 'ce-type': event.type },
    },
  ],
});
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
- [Apache Pulsar Documentation](https://pulsar.apache.org/docs/next/)
- [NATS Streaming / JetStream](https://docs.nats.io/nats-concepts/jetstream) — NATS 持久化流
- [CloudEvents Specification](https://cloudevents.io/) — 事件数据标准化规范
- [The Outbox Pattern (Chris Richardson)](https://microservices.io/patterns/data/transactional-outbox.html) — 事务性发件箱模式
- [Saga Pattern (Chris Richardson)](https://microservices.io/patterns/data/saga.html) — Saga 分布式事务模式
- [AWS re:Invent — Amazon SQS Deep Dive](https://www.youtube.com/watch?v=17vHzM5lISw) — AWS 官方深度讲解
- [Google Cloud — Event-Driven Architecture](https://cloud.google.com/eventarc/docs/event-driven-architectures) — 事件驱动架构指南
- [Martin Fowler — What do you mean by "Event-Driven"?](https://martinfowler.com/articles/201701-event-driven.html) — 事件驱动架构经典文
- [Confluent — Kafka Streams Documentation](https://docs.confluent.io/platform/current/streams/index.html) — Kafka Streams 权威文档
- [CNCF Cloud Events Primer](https://github.com/cncf/cloudevents/blob/main/primer.md) — CloudEvents 入门
- [AWS SDK for JavaScript v3 — SQS](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sqs/) — AWS SQS 客户端官方文档
- [NATS.js Documentation](https://github.com/nats-io/nats.js) — NATS Node.js 客户端仓库
- [Google Cloud Pub/Sub Documentation](https://cloud.google.com/pubsub/docs) — Google Cloud 官方文档
- [Azure Service Bus Documentation](https://learn.microsoft.com/en-us/azure/service-bus-messaging/) — Azure 官方文档
- [NSQ — Realtime Distributed Messaging](https://nsq.io/) — 轻量级分布式消息队列
- [Apache RocketMQ](https://rocketmq.apache.org/) — 阿里巴巴开源消息队列
- [ZeroMQ Guide](https://zguide.zeromq.org/) — 高性能异步消息库指南
- [The Log: What every software engineer should know](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) — Jay Kreps 经典文章
- [CNCF Cloud Native Interactive Landscape](https://landscape.cncf.io/) — CNCF 云原生全景图

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

本模块涉及的核心设计模式包括：

1. **发布-订阅模式（Pub-Sub）**：解耦生产者和消费者，支持一对多消息分发
2. **Outbox 模式**：在数据库事务中同步写入业务数据和待发送消息，保证最终一致性
3. **Saga 模式**：通过补偿事务实现跨服务的最终一致性，替代分布式事务
4. **死信队列（DLQ）**：隔离处理失败的消息，防止阻塞正常消费流程
5. **延迟队列**：基于有序集合实现精确的定时/延迟任务调度

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `10-fundamentals/10.2-type-system/` — 类型系统基础 |
| 后续进阶 | `20.6-backend-apis/microservices/` — 微服务架构深入 |
| 横向关联 | `30-knowledge-base/30.2-categories/message-queue.md` — 消息队列分类总览 |

---

> 📅 理论深化更新：2026-04-29
