# 基础设施栈决策矩阵

> 运行时、数据库、缓存、消息队列的组合选型框架。

---

## 运行时选型

| 场景 | 推荐 | 说明 |
|------|------|------|
| 通用后端 | Node.js 22 LTS | 最大生态，稳定性优先 |
| 极致性能 | Bun 1.2 | 4x 吞吐量，兼容 98% |
| 安全沙箱 | Deno 2 | 默认权限，内置 TypeScript |
| 边缘计算 | Cloudflare Workers | V8 Isolates，全球低延迟 |

## 数据库选型

| 场景 | 推荐 |
|------|------|
| 关系型 | PostgreSQL（Neon/Railway/Supabase） |
| 文档型 | MongoDB Atlas |
| 边缘 SQLite | Cloudflare D1 / Turso |
| 缓存/会话 | Redis（Upstash） |
| 向量搜索 | pgvector / Pinecone |

## 消息队列

| 场景 | 推荐 |
|------|------|
| 简单事件 | Redis Pub/Sub |
| 可靠队列 | BullMQ（Redis） |
| 大规模流 | Kafka / Redpanda |
| 云原生 | AWS SQS / GCP Pub/Sub |

---

*最后更新: 2026-04-29*
