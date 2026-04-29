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

## 选型

| 场景 | 推荐 |
|------|------|
| 任务队列（邮件/通知）| BullMQ |
| 事件流（日志/指标）| Kafka / Redpanda |
| 实时消息 | NATS |
| 云原生微服务 | NATS / RabbitMQ |

---

*最后更新: 2026-04-29*
