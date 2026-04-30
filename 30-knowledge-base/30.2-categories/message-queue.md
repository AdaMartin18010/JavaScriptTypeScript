# 消息队列

> JavaScript/TypeScript 生态消息队列选型。

---

## 主流方案

| 队列 | 协议 | 特点 |
|------|------|------|
| **RabbitMQ** | AMQP | 成熟，路由灵活 |
| **Apache Kafka** | 自有协议 | 高吞吐，持久化 |
| **NATS** | NATS | 云原生，轻量 |
| **BullMQ** | Redis | Node.js 原生，任务队列 |
| **SQS** | HTTP | AWS 托管 |
| **Redis Streams** | Redis | 轻量日志流，消费组 |

---

## 主流框架对比

| 维度 | RabbitMQ | Apache Kafka | NATS | Redis Pub/Sub |
|------|----------|--------------|------|---------------|
| **定位** | 通用消息代理 | 分布式事件流平台 | 云原生消息系统 | 轻量级内存消息 |
| **消息模型** | 队列 / Topic / 路由 | 分区日志（Partitioned Log） | Subject（发布订阅 + 队列） | 频道广播 |
| **持久化** | 支持（磁盘 / 镜像队列） | 强持久化（磁盘顺序写） | 可选（JetStream） | 无（内存） |
| **吞吐量** | 高（~50K msg/s） | 极高（~1M+ msg/s） | 极高（~2M+ msg/s） | 极高（内存级） |
| **消息顺序** | 单队列有序 | 分区内有序 | 流内有序（JetStream） | 无保证 |
| **消息重放** | 有限（死信队列） | 原生支持（Offset 回溯） | JetStream 支持 | 不支持 |
| **客户端生态** | 极丰富（amqplib） | 丰富（kafka-js） | 丰富（nats.js） | 极丰富（ioredis） |
| **运维复杂度** | 中 | 高 | 低 | 低 |
| **云原生集成** | 良好 | 优秀（K8s Operator） | 优秀（轻量 Sidecar） | 良好（Redis Operator） |
| **适用场景** | 任务队列 / 复杂路由 | 事件溯源 / 实时流处理 | 微服务通信 / 控制面 | 实时通知 / 缓存失效 |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |

---

## 代码示例：BullMQ（Redis）+ TypeScript

```typescript
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// 定义任务队列
const emailQueue = new Queue('email', { connection: redisConnection });

// 添加任务（支持延迟、优先级、重复）
async function enqueueEmail(data: { to: string; subject: string; body: string }) {
  await emailQueue.add('send-email', data, {
    delay: 5000,                 // 5 秒后执行
    priority: 10,                // 优先级
    attempts: 3,                 // 失败重试 3 次
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,       // 保留最近 100 条成功记录
    removeOnFail: 50,            // 保留最近 50 条失败记录
  });
}

// 定义工作进程
const worker = new Worker(
  'email',
  async (job: Job<{ to: string; subject: string; body: string }>) => {
    console.log(`[Worker] 处理任务 ${job.id}: 发送邮件到 ${job.data.to}`);

    // 模拟异步邮件发送
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟偶发失败（触发重试）
    if (Math.random() < 0.1) {
      throw new Error('SMTP 连接超时');
    }

    return { sentAt: new Date().toISOString(), messageId: `msg_${job.id}` };
  },
  {
    connection: redisConnection,
    concurrency: 5,              // 并发数
    limiter: {
      max: 10,                   // 每 1 秒最多处理 10 个任务
      duration: 1000,
    },
  }
);

// 事件监听
worker.on('completed', (job, result) => {
  console.log(`[Worker] 任务 ${job.id} 完成:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] 任务 ${job?.id} 失败:`, err.message);
});

// 运行示例
(async () => {
  await enqueueEmail({
    to: 'user@example.com',
    subject: '欢迎注册',
    body: '<h1>欢迎！</h1><p>感谢注册我们的服务。</p>',
  });
})();
```

---

## 扩展代码示例

### RabbitMQ（amqplib）+ TypeScript

```typescript
import amqp, { Channel, Connection } from 'amqplib';

const QUEUE = 'task_queue';

// 生产者
async function publishTask(task: unknown) {
  const conn: Connection = await amqp.connect('amqp://localhost');
  const ch: Channel = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)), { persistent: true });
  console.log('[Producer] 发送任务:', task);
  await ch.close();
  await conn.close();
}

// 消费者
async function consumeTask() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  // 公平分发：每次只取 1 条，处理完再取
  await ch.prefetch(1);
  ch.consume(QUEUE, (msg) => {
    if (!msg) return;
    const content = JSON.parse(msg.content.toString());
    console.log('[Consumer] 处理任务:', content);
    // 模拟处理
    setTimeout(() => {
      ch.ack(msg);
    }, 500);
  });
}

(async () => {
  await publishTask({ type: 'send-email', to: 'a@example.com' });
  await consumeTask();
})();
```

### Apache Kafka（kafka-js）+ TypeScript

```typescript
import { Kafka, Producer, Consumer } from 'kafkajs';

const kafka = new Kafka({ clientId: 'my-app', brokers: ['localhost:9092'] });

// 生产者
async function produceMessages(topic: string, messages: { key: string; value: string }[]) {
  const producer: Producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic,
    messages: messages.map((m) => ({ key: m.key, value: m.value })),
  });
  await producer.disconnect();
}

// 消费者
async function consumeMessages(topic: string, groupId: string) {
  const consumer: Consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`[Kafka] ${topic}[${partition}]: ${message.key} -> ${message.value}`);
    },
  });
}

(async () => {
  await produceMessages('orders', [
    { key: 'order-1', value: JSON.stringify({ item: 'MacBook', qty: 1 }) },
  ]);
  await consumeMessages('orders', 'order-processor');
})();
```

### NATS（nats.js）+ TypeScript

```typescript
import { connect, StringCodec, JSONCodec } from 'nats';

const sc = StringCodec();
const jc = JSONCodec();

async function natsPubSub() {
  const nc = await connect({ servers: 'localhost:4222' });

  // 订阅者
  const sub = nc.subscribe('orders.created');
  (async () => {
    for await (const msg of sub) {
      const data = jc.decode(msg.data);
      console.log('[NATS] 收到订单:', data);
      // 请求-响应模式：回复确认
      if (msg.respond) {
        msg.respond(sc.encode('ack'));
      }
    }
  })();

  // 发布者
  await nc.publish('orders.created', jc.encode({ id: 'ord-42', total: 1999 }));

  // 请求-响应（RPC 风格）
  const resp = await nc.request('orders.created', jc.encode({ id: 'ord-43', total: 299 }));
  console.log('[NATS] 响应:', sc.decode(resp.data));

  await nc.drain();
}

natsPubSub();
```

### Redis Streams + 消费组

```typescript
import Redis from 'ioredis';

const redis = new Redis({ host: 'localhost', port: 6379 });

// 生产者：向 Stream 追加消息
async function addStreamEvent(stream: string, data: Record<string, unknown>) {
  const id = await redis.xadd(stream, '*', 'payload', JSON.stringify(data));
  console.log(`[Redis Streams] 添加消息 ID: ${id}`);
  return id;
}

// 消费者：使用消费组读取
async function consumeStreamGroup(
  stream: string,
  group: string,
  consumer: string
) {
  // 确保消费组存在
  try {
    await redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
  } catch (err: any) {
    if (!err.message.includes('BUSYGROUP')) throw err;
  }

  // 读取未确认消息
  const messages = await redis.xreadgroup(
    'GROUP', group, consumer,
    'COUNT', 10,
    'BLOCK', 5000,
    'STREAMS', stream, '>'
  );

  if (!messages) return [];

  const results = [];
  for (const [, entries] of messages) {
    for (const [id, fields] of entries as [string, string[]][]) {
      const payload = JSON.parse(fields[1]);
      results.push({ id, payload });
      // 确认消息已处理
      await redis.xack(stream, group, id);
    }
  }
  return results;
}

// 示例运行
(async () => {
  await addStreamEvent('events:user-actions', { action: 'login', userId: 'u123' });
  const msgs = await consumeStreamGroup('events:user-actions', 'processors', 'worker-1');
  console.log('消费消息:', msgs);
})();
```

### AWS SQS 消息队列

```typescript
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: 'us-east-1' });
const QUEUE_URL = process.env.SQS_QUEUE_URL!;

// 发送消息
async function sendSQSMessage(body: string, attributes?: Record<string, string>) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: body,
    MessageAttributes: Object.fromEntries(
      Object.entries(attributes || {}).map(([k, v]) => [k, { DataType: 'String', StringValue: v }])
    ),
  });
  const result = await sqs.send(command);
  console.log('[SQS] 消息发送:', result.MessageId);
  return result.MessageId;
}

// 接收消息
async function receiveSQSMessage() {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20, // 长轮询
    MessageAttributeNames: ['All'],
  });
  const result = await sqs.send(command);
  for (const msg of result.Messages || []) {
    console.log('[SQS] 收到:', msg.Body);
    // 删除已处理消息
    await sqs.send(new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: msg.ReceiptHandle!,
    }));
  }
}
```

---

## 选型

| 场景 | 推荐 |
|------|------|
| 任务队列（邮件/通知）| BullMQ |
| 事件流（日志/指标）| Kafka / Redpanda |
| 实时消息 | NATS |
| 云原生微服务 | NATS / RabbitMQ |
| 轻量日志流 + 消费组 | Redis Streams |
| AWS 云原生 | SQS / SNS |

---

## 权威参考链接

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [AMQP 0-9-1 Specification](https://www.amqp.org/specification/0-9-1/amqp-org-download)
- [Apache Kafka 官方文档](https://kafka.apache.org/documentation/)
- [kafka-js npm](https://www.npmjs.com/package/kafka-js)
- [NATS 官方文档](https://docs.nats.io/)
- [nats.js npm](https://www.npmjs.com/package/nats)
- [BullMQ 官方文档](https://docs.bullmq.io/)
- [Redis Pub/Sub 文档](https://redis.io/docs/latest/develop/interact/pubsub/)
- [Redis Streams 文档](https://redis.io/docs/latest/develop/data-types/streams/)
- [AWS SQS Documentation](https://docs.aws.amazon.com/sqs/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [CloudEvents Specification](https://cloudevents.io/)
- [CNCF Cloud Native Landscape — Streaming & Messaging](https://landscape.cncf.io/guide#streaming--messaging) — CNCF 消息中间件全景图
- [Martin Fowler — Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html) — 事件驱动架构权威综述
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) — Hohpe & Woolf 企业集成模式经典
- [Confluent Blog — Kafka Best Practices](https://www.confluent.io/blog/) — Kafka 工程实践深度文章

---

*最后更新: 2026-04-29*
