---
dimension: 综合
sub-dimension: Message queue
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Message queue 核心概念与工程实践。

## 包含内容

- 本模块聚焦 message queue 核心概念与工程实践。

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

---

*最后更新: 2026-04-29*
