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

## 选型

| 场景 | 推荐 |
|------|------|
| 任务队列（邮件/通知）| BullMQ |
| 事件流（日志/指标）| Kafka / Redpanda |
| 实时消息 | NATS |
| 云原生微服务 | NATS / RabbitMQ |

---

## 权威参考链接

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [Apache Kafka 官方文档](https://kafka.apache.org/documentation/)
- [NATS 官方文档](https://docs.nats.io/)
- [BullMQ 官方文档](https://docs.bullmq.io/)
- [Redis Pub/Sub 文档](https://redis.io/docs/latest/develop/interact/pubsub/)
- [kafka-js npm](https://www.npmjs.com/package/kafka-js)

---

*最后更新: 2026-04-29*
