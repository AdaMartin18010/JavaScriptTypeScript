---
dimension: 综合
sub-dimension: Message queue
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Message queue 核心概念与工程实践。

## 包含内容

- **消息代理核心**：发布/订阅模式、路由键、交换机类型（direct/topic/fanout/headers）。
- **消费者组与负载均衡**：分区分配策略（range/round-robin/sticky）、再平衡协议、背压控制。
- **死信队列与重试策略**：最大重试次数、指数退避、 poison-pill 处理。
- **延迟队列与定时投递**：基于 TTL + DLX、基于优先级队列、基于时间轮算法。
- **优先级队列调度**：加权优先级、饥饿预防、多级反馈队列。
- **流式消息处理**：有序消费、窗口聚合、exactly-once 语义。
- **任务队列与异步执行**：BullMQ 工作流、任务幂等性、速率限制。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 consumer-group.test.ts
- 📄 consumer-group.ts
- 📄 dead-letter-queue.test.ts
- 📄 dead-letter-queue.ts
- 📄 delay-queue.test.ts
- 📄 delay-queue.ts
- 📄 index.ts
- 📄 message-broker.test.ts
- 📄 message-broker.ts
- 📄 priority-queue.test.ts
- 📄 priority-queue.ts
- 📄 pub-sub.test.ts
- 📄 pub-sub.ts
- 📄 queue-implementation.test.ts
- 📄 queue-implementation.ts
- 📄 stream-processing.test.ts
- 📄 stream-processing.ts
- 📄 task-queue.test.ts
- 📄 task-queue.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `message-broker/` | 消息代理核心（发布/订阅、路由） | `message-broker.ts`, `message-broker.test.ts` |
| `pub-sub/` | 发布订阅模式实现 | `pub-sub.ts`, `pub-sub.test.ts` |
| `consumer-group/` | 消费者组与负载均衡 | `consumer-group.ts`, `consumer-group.test.ts` |
| `dead-letter-queue/` | 死信队列与失败重试策略 | `dead-letter-queue.ts`, `dead-letter-queue.test.ts` |
| `delay-queue/` | 延迟队列与定时投递 | `delay-queue.ts`, `delay-queue.test.ts` |
| `priority-queue/` | 优先级队列调度 | `priority-queue.ts`, `priority-queue.test.ts` |
| `queue-implementation/` | 基础队列数据结构 | `queue-implementation.ts`, `queue-implementation.test.ts` |
| `stream-processing/` | 流式消息处理 | `stream-processing.ts`, `stream-processing.test.ts` |
| `task-queue/` | 任务队列与异步执行 | `task-queue.ts`, `task-queue.test.ts` |

## 代码示例

### 基于 Redis 的优先级任务队列

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function enqueue(queue: string, task: unknown, priority = 0) {
  await redis.zAdd(queue, { score: priority, value: JSON.stringify(task) });
}

async function dequeue(queue: string) {
  const [item] = await redis.zPopMax(queue);
  return item ? JSON.parse(item.value) : null;
}
```

### BullMQ 任务队列（含重试与死信）

```typescript
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

// 生产者
const emailQueue = new Queue('email', { connection });
await emailQueue.add('send-welcome', { userId: 'u123', email: 'a@b.com' }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  priority: 10,
});

// 消费者
const worker = new Worker('email', async (job: Job) => {
  console.log(`Processing job ${job.id} attempt ${job.attemptsMade + 1}`);
  await sendEmail(job.data);
}, { connection, concurrency: 5 });

// 死信监听器
worker.on('failed', (job, err) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    console.error(`Job ${job.id} moved to DLQ after max retries`, err);
    // 持久化到 DLQ 存储
  }
});
```

### RabbitMQ Topic 路由（amqplib）

```typescript
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();

const exchange = 'orders.topic';
await ch.assertExchange(exchange, 'topic', { durable: true });

// 发布者：按路由键发送订单事件
ch.publish(exchange, 'order.created.us', Buffer.from(JSON.stringify({ orderId: 'O1' })));
ch.publish(exchange, 'order.shipped.eu', Buffer.from(JSON.stringify({ orderId: 'O2' })));

// 消费者：订阅所有美国订单事件
const q = await ch.assertQueue('', { exclusive: true });
await ch.bindQueue(q.queue, exchange, 'order.*.us');
ch.consume(q.queue, (msg) => {
  if (msg) {
    console.log('Received:', msg.fields.routingKey, msg.content.toString());
    ch.ack(msg);
  }
});
```

### Kafka 消费者组（kafkajs）

```typescript
import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({ clientId: 'payment-service', brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'payment-processor' });

await consumer.connect();
await consumer.subscribe({ topic: 'payments', fromBeginning: false });

await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
    const payload = JSON.parse(message.value?.toString() ?? '{}');
    await processPayment(payload);
    // 手动提交偏移量，实现 at-least-once 语义
    await consumer.commitOffsets([{
      topic,
      partition,
      offset: (Number(message.offset) + 1).toString(),
    }]);
  },
});
```

### AWS SQS 标准队列消费者

```typescript
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: 'us-east-1' });
const queueUrl = process.env.SQS_QUEUE_URL!;

async function poll() {
  const { Messages } = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20, // 长轮询
    VisibilityTimeout: 60,
  }));

  for (const msg of Messages ?? []) {
    try {
      await handleMessage(JSON.parse(msg.Body!));
      await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle! }));
    } catch (err) {
      console.error('Processing failed, message will retry after visibility timeout', err);
    }
  }
}

setInterval(poll, 1000);
```

### 基于 Redis Streams 的延迟队列

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const STREAM_KEY = 'delayed:tasks';
const CONSUMER_GROUP = 'workers';

// 生产者：发布带延迟的任务
async function scheduleTask(task: object, delayMs: number) {
  const id = await redis.xAdd(STREAM_KEY, '*', {
    payload: JSON.stringify(task),
    executeAt: (Date.now() + delayMs).toString(),
  });
  return id;
}

// 消费者：只处理到达执行时间的消息
async function processDueTasks() {
  const now = Date.now();
  const messages = await redis.xReadGroup(
    CONSUMER_GROUP, 'worker-1',
    { key: STREAM_KEY, id: '>' },
    { COUNT: 100, BLOCK: 5000 }
  );

  for (const stream of messages ?? []) {
    for (const msg of stream.messages) {
      const executeAt = Number(msg.message.executeAt);
      if (executeAt > now) {
        // 未到时间，放回流中（或 ack 后重新 schedule）
        await redis.xAck(STREAM_KEY, CONSUMER_GROUP, msg.id);
        await scheduleTask(JSON.parse(msg.message.payload), executeAt - now);
        continue;
      }
      await executeTask(JSON.parse(msg.message.payload));
      await redis.xAck(STREAM_KEY, CONSUMER_GROUP, msg.id);
    }
  }
}
```

### NATS JetStream 消费者（现代云原生消息队列）

```typescript
import { connect, JSONCodec, consumerOpts } from 'nats';

const nc = await connect({ servers: ['nats://localhost:4222'] });
const js = nc.jetstream();
const jc = JSONCodec();

// 发布消息到 Stream
await js.publish('ORDERS.new', jc.encode({ orderId: 'O123', amount: 99.99 }));

// 创建持久化消费者（Durable Consumer）
const opts = consumerOpts();
opts.durable('order-processor');
opts.deliverAll(); // 从最早未确认消息开始投递
opts.ackExplicit(); // 需要显式确认

const sub = await js.subscribe('ORDERS.new', opts);
(async () => {
  for await (const m of sub) {
    const data = jc.decode(m.data);
    console.log('Processing order:', data);
    await processOrder(data);
    m.ack();
  }
})();
```

### 基于 Redis 的速率限制队列（Token Bucket）

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function rateLimitedEnqueue(
  queue: string,
  task: unknown,
  options: { maxPerSecond: number; burstSize: number }
): Promise<boolean> {
  const tokenKey = `tokens:${queue}`;
  const lastRefillKey = `last_refill:${queue}`;

  const now = Date.now();
  const pipeline = redis.multi();
  pipeline.get(lastRefillKey);
  pipeline.get(tokenKey);

  const [lastRefillStr, tokensStr] = await pipeline.exec() as [string, string];
  const lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;
  let tokens = tokensStr ? parseFloat(tokensStr) : options.burstSize;

  // 补充令牌
  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(options.burstSize, tokens + elapsed * options.maxPerSecond);

  if (tokens < 1) {
    return false; // 限流拒绝
  }

  const writePipeline = redis.multi();
  writePipeline.set(tokenKey, String(tokens - 1));
  writePipeline.set(lastRefillKey, String(now));
  writePipeline.lPush(queue, JSON.stringify(task));
  await writePipeline.exec();
  return true;
}
```

### 基于 Pulsar 的 Geo-Replication 消息生产者

```typescript
import { Client, Producer } from 'pulsar-client';

const client = new Client({
  serviceUrl: 'pulsar://localhost:6650',
});

const producer: Producer = await client.createProducer({
  topic: 'persistent://public/default/global-orders',
  producerName: 'order-service',
  sendTimeoutMs: 30000,
});

async function publishOrderEvent(order: object) {
  const messageId = await producer.send({
    data: Buffer.from(JSON.stringify(order)),
    properties: { region: 'us-east', version: 'v2' },
  });
  console.log('Published message:', messageId.toString());
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| RabbitMQ Documentation | 官方文档 | [rabbitmq.com/documentation.html](https://www.rabbitmq.com/documentation.html) |
| Apache Kafka Docs | 官方文档 | [kafka.apache.org/documentation](https://kafka.apache.org/documentation/) |
| BullMQ | Node.js 队列库 | [bullmq.io](https://bullmq.io/) |
| Redis Streams | 流处理指南 | [redis.io/docs/data-types/streams](https://redis.io/docs/data-types/streams/) |
| AWS SQS Developer Guide | 云队列指南 | [docs.aws.amazon.com/sqs](https://docs.aws.amazon.com/sqs/) |
| amqplib | Node.js AMQP 客户端 | [amqp-node.github.io/amqplib](https://amqp-node.github.io/amqplib/) |
| kafkajs | Kafka Node.js 客户端 | [kafka.js.org](https://kafka.js.org/) |
| AWS SDK for JavaScript v3 | 官方 SDK | [docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sqs_code_examples.html) |
| Redis Node.js Client | 官方客户端 | [github.com/redis/node-redis](https://github.com/redis/node-redis) |
| Designing Data-Intensive Applications (Martin Kleppmann) | 书籍 | [dataintensive.net](https://dataintensive.net/) — 第 11 章深入讲解流处理与消息系统 |
| Enterprise Integration Patterns (Hohpe & Woolf) | 书籍 | [enterpriseintegrationpatterns.com](https://www.enterpriseintegrationpatterns.com/) — 消息模式权威参考 |
| NATS Documentation | 官方文档 | [docs.nats.io](https://docs.nats.io/) — 云原生消息系统与 JetStream 流处理 |
| Apache Pulsar Docs | 官方文档 | [pulsar.apache.org/docs](https://pulsar.apache.org/docs/) — 分布式流处理与多区域复制 |
| NSQ — Realtime Distributed Messaging | GitHub | [github.com/nsqio/nsq](https://github.com/nsqio/nsq) — 轻量级分布式消息平台 |
| Celery — Distributed Task Queue | 官方文档 | [docs.celeryq.dev](https://docs.celeryq.dev/) — Python 生态分布式任务队列参考架构 |
| IBM MQ Documentation | 官方文档 | [ibm.com/docs/en/ibm-mq](https://www.ibm.com/docs/en/ibm-mq) — 企业级消息中间件 |
| ZeroMQ Guide | 指南 | [zguide.zeromq.org](https://zguide.zeromq.org/) — 无代理高性能消息模式 |
| Google Cloud Pub/Sub | 官方文档 | [cloud.google.com/pubsub/docs](https://cloud.google.com/pubsub/docs) — 托管发布/订阅服务 |
| Azure Service Bus | 官方文档 | [learn.microsoft.com/azure/service-bus-messaging](https://learn.microsoft.com/en-us/azure/service-bus-messaging/) — 企业消息代理 |

---

*最后更新: 2026-04-30*
