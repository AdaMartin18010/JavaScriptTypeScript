# 基础设施栈决策矩阵（2026 版）

> 运行时、数据库、缓存、消息队列、前端框架、托管平台的组合选型框架。
> **权威参考**: [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) | [AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) | [Vercel Architecture](https://vercel.com/docs/concepts/edge-network/overview) | [Neon Serverless Postgres](https://neon.tech/docs/introduction)

---

## 运行时选型

| 场景 | 推荐 | 说明 | 替代方案 |
|------|------|------|----------|
| 通用后端 | Node.js 22 LTS | 最大生态，稳定性优先 | Node.js 24 ( bleeding edge ) |
| 极致性能 | Bun 1.2 | 4x 吞吐量，兼容 98% npm | Deno 2 |
| 安全沙箱 | Deno 2 | 默认权限，内置 TypeScript | Deno Deploy (Edge) |
| 边缘计算 | Cloudflare Workers | V8 Isolates，全球低延迟 | Vercel Edge Functions |
| 容器化微服务 | Node.js 22 + Docker | 成熟 DevOps 工具链 | Bun + Distroless |
| Serverless (AWS) | Node.js 22 + Lambda | 冷启动 100ms+ | Lambda with Provisioned Concurrency |

---

## 数据库选型

| 场景 | 推荐 | 托管服务 | 说明 |
|------|------|----------|------|
| 关系型 (OLTP) | PostgreSQL 16 | Neon, Railway, Supabase, AWS RDS | ACID、JSONB、全文搜索 |
| 文档型 | MongoDB 8 | MongoDB Atlas | 灵活 Schema、聚合管道 |
| 边缘 SQLite | libSQL (Turso) | Turso, Cloudflare D1 | 全球复制、零延迟读取 |
| 缓存/会话 | Redis 7 | Upstash, AWS ElastiCache | KV、Pub/Sub、流 |
| 向量搜索 | pgvector + PostgreSQL | Pinecone, Weaviate, Qdrant | RAG、Embedding 检索 |
| 时序数据 | TimescaleDB / InfluxDB | Timescale Cloud | 监控、IoT 数据 |
| 图数据库 | Neo4j | Neo4j Aura | 关系分析、知识图谱 |

---

## 前端 + 后端 + 数据库 + 托管 组合决策矩阵

| 项目类型 | 前端 | 后端 | 数据库 | 托管 | 预估月成本 |
|----------|------|------|--------|------|-----------|
| **个人博客/作品集** | Astro / Next.js SSG | 无 (静态) | 无 | Vercel / Cloudflare Pages | $0 |
| **SaaS MVP** | Next.js 15 + React 19 | Next.js API Routes | PostgreSQL (Neon) | Vercel + Neon | $0-20 |
| **高并发 API** | React SPA | Bun + Hono | PostgreSQL + Redis | Fly.io / Railway | $50-200 |
| **企业级中后台** | Angular 19 | Node.js + NestJS | PostgreSQL + Redis | AWS ECS / K8s | $500+ |
| **边缘优先应用** | Next.js (Edge) | Cloudflare Workers | D1 + KV + R2 | Cloudflare | $0-5 |
| **实时协作工具** | SolidJS / Vue | Node.js + Socket.io | Redis Pub/Sub + PostgreSQL | Railway + Upstash | $50-150 |
| **AI Native 应用** | Next.js + Vercel AI SDK | Node.js + OpenAI API | PostgreSQL + pgvector | Vercel + Neon | $20-100 |
| **电商/支付** | Next.js Commerce | Node.js + Stripe SDK | PostgreSQL | Vercel + Neon | $100-500 |

---

## 消息队列选型

| 场景 | 推荐 | 托管服务 | 特性 |
|------|------|----------|------|
| 简单事件 | Redis Pub/Sub | Upstash Redis | 轻量、低延迟 |
| 可靠队列 | BullMQ (Redis) | Upstash / AWS ElastiCache | 延迟任务、重试、优先级 |
| 大规模流 | Kafka / Redpanda | Confluent Cloud / Upstash Kafka | 高吞吐、持久化、回溯 |
| 云原生 | AWS SQS / GCP Pub/Sub | 原生 | 托管、自动扩展 |
| 边缘事件 | Cloudflare Queues | 原生 | 与 Workers 深度集成 |

---

## 代码示例：全栈基础设施配置

### Hono + Cloudflare Workers + D1 (边缘全栈)

```typescript
// src/index.ts — Edge-native fullstack API
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Cloudflare Workers bindings type
interface Bindings {
  DB: D1Database;
  CACHE: KVNamespace;
  AI: Ai;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', region: c.req.raw.cf?.colo }));

// D1 Database query
app.get('/api/users', async (c) => {
  const cacheKey = 'users:list';
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) return c.json({ source: 'kv', data: JSON.parse(cached) });

  const { results } = await c.env.DB.prepare(
    'SELECT id, name, email FROM users LIMIT 50'
  ).all();

  await c.env.CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 60 });
  return c.json({ source: 'db', data: results });
});

// AI inference (Cloudflare AI)
app.post('/api/ai/summarize', async (c) => {
  const { text } = await c.req.json();
  const response = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
    input_text: text,
  });
  return c.json({ summary: response.summary });
});

export default app;
```

### Wrangler 配置 (wrangler.toml)

```toml
name = "my-edge-app"
main = "src/index.ts"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "production-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[ai]
binding = "AI"
```

### 部署命令

```bash
# 安装依赖
npm install hono wrangler

# 本地开发
npx wrangler dev

# 部署到全球边缘
npx wrangler deploy
```

> 📖 参考：[Hono Documentation](https://hono.dev/) | [Cloudflare Workers](https://developers.cloudflare.com/workers/) | [D1 Database](https://developers.cloudflare.com/d1/) | [Cloudflare AI](https://developers.cloudflare.com/workers-ai/)

---

## 决策树

```
开始选型
   │
   ├── 项目类型?
   │   ├── 内容站/博客 → Astro + Vercel / Cloudflare Pages
   │   ├── SaaS / Web App → Next.js + Vercel + PostgreSQL
   │   ├── API / 微服务 → Hono/Fastify + Fly.io/Railway
   │   ├── 实时应用 → Node.js + Redis + Socket.io
   │   └── AI 应用 → Vercel AI SDK + OpenAI + pgvector
   │
   ├── 性能要求?
   │   ├── 极致延迟 → Cloudflare Workers (边缘)
   │   ├── 高吞吐 → Bun + PostgreSQL + Redis
   │   └── 一般 → Node.js 22 LTS
   │
   ├── 预算?
   │   ├── 零成本 → Cloudflare Pages + D1 + Workers
   │   ├── 低预算 (<$50) → Vercel Hobby + Neon Free
   │   └── 企业级 → AWS / GCP / Azure
   │
   └── 团队技术栈?
       ├── React 生态 → Next.js / Remix
       ├── Vue 生态 → Nuxt
       └── Angular → Analog / Angular SSR
```

---

*最后更新: 2026-04-29*
