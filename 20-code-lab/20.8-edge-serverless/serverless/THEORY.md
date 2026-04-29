# Serverless — 理论基础

## 1. Serverless 定义

Serverless 是一种云计算执行模型，开发者无需管理服务器：

- **FaaS（Function as a Service）**: 事件触发函数执行
- **BaaS（Backend as a Service）**: 托管的后端服务（Auth、DB、Storage）

## 2. 函数生命周期

```
代码部署 → 冷启动（加载运行时 + 初始化）→ 热启动（复用实例）→ 空闲 → 销毁
```

- **冷启动**: 100ms-3s，是 Serverless 的核心痛点
- **优化策略**: 保持最小实例数、使用轻量运行时（如 Go/Rust）、减少依赖体积

## 3. 事件源触发器

| 事件源 | 触发场景 |
|--------|---------|
| HTTP 请求 | API Gateway 路由 |
| 定时任务 | CRON 表达式（CloudWatch/EventBridge）|
| 文件上传 | S3 / Blob Storage 对象创建 |
| 数据库变更 | DynamoDB Streams / CDC |
| 消息队列 | SQS / SNS / EventHub 消息到达 |

## 4. Serverless 平台对比

| 维度 | AWS Lambda | Cloudflare Workers | Vercel Edge Functions | Deno Deploy |
|------|-----------|-------------------|----------------------|-------------|
| **运行时模型** | 容器化 FaaS | V8 Isolation (Worker) | V8 Isolation (Edge) | V8 Isolation |
| **冷启动** | 100ms ~ 3s | **0ms**（始终热启动） | **0ms** | **0ms** |
| **最大执行时长** | 15 min | 50 ms (free) / 30 min (paid) | 30s (Hobby) / 5 min (Pro) | 无限制（持续运行） |
| **运行时语言** | Node.js, Python, Go, Java, Ruby, Rust, .NET | JS/TS, Python, Rust (WASM) | JS/TS, WASM | JS/TS, WASM |
| **本地存储** | 512 MB /tmp | 无（无状态） | 无（无状态） | 无（无状态） |
| **边缘节点** | 28+ Regions | 330+ PoP | 100+ Edge Locations | 35+ Regions |
| **Pricing** | 按调用 + 执行时长 (GB·s) | 按请求数 + CPU 时长 | 按执行时长 (GB·h) | 按请求 + 数据传输 |
| **原生 DB/Bindings** | DynamoDB, S3, RDS Proxy | D1, KV, R2, Durable Objects | KV, Postgres (Edge) | Deno KV, Postgres |
| **HTTP 框架** | 任意（Express, Fastify） | Hono, itty-router, Workers-native | Next.js, SvelteKit, Astro | Fresh, Oak, Hono |
| **厂商锁定** | 高（深度集成 AWS） | 中（Worker API 标准） | 高（Vercel 生态） | 中（Deno 运行时） |
| **最佳场景** | 重计算、长任务、企业集成 | 超低延迟 API、边缘逻辑 | 前端框架 SSR/ISR | 全栈 TypeScript、边缘流式 |

> **选型建议**：需要与 AWS 生态深度集成或执行长任务选 Lambda；追求全球最低延迟和边缘亲和选 Cloudflare Workers；Next.js 全栈优先选 Vercel；TypeScript 原生全栈且希望最小运行时差异选 Deno Deploy。

## 5. 代码示例

### Hono on Cloudflare Workers

```typescript
// src/index.ts
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

export interface Env {
  API_TOKEN: string;
  KV_CACHE: KVNamespace;
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// 全局中间件：认证
app.use('/api/*', async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_TOKEN });
  return auth(c, next);
});

// 健康检查
app.get('/', (c) => c.json({ ok: true, region: c.req.raw.cf?.colo }));

// 带 KV 缓存的边缘查询
app.get('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  const cacheKey = `user:${id}`;

  // 1. 读边缘缓存
  const cached = await c.env.KV_CACHE.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  // 2. 回源 D1
  const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first();

  if (!row) return c.notFound();

  // 3. 写入缓存（TTL 60s）
  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(row), { expirationTtl: 60 });
  return c.json(row);
});

// 批量异步处理（Durable Object 或 Queue 模式）
app.post('/api/events', async (c) => {
  const body = await c.req.json<{ events: unknown[] }>();
  // 直接响应客户端，后台通过 Queue 异步落盘
  c.executionCtx.waitUntil(
    Promise.all(body.events.map((e) => persistToAnalytics(c.env, e)))
  );
  return c.json({ queued: body.events.length });
});

async function persistToAnalytics(env: Env, event: unknown): Promise<void> {
  // 实际实现：写入 R2 / Durable Object / 外部 Kafka
  console.log('Persisting event:', event);
}

export default app;
```

```typescript
// wrangler.toml
name = "my-edge-api"
main = "src/index.ts"
compatibility_date = "2026-04-28"

[vars]
API_TOKEN = "sk_live_xxx"

[[kv_namespaces]]
binding = "KV_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "DB"
database_name = "prod-db"
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
```

## 6. Serverless 架构模式

- **Lambda 单体**: 单个函数处理所有请求（简单场景）
- **Lambda 分层**: 按职责拆分函数（API、Processor、Worker）
- **Step Functions**: 工作流编排，状态机管理复杂业务流程
- **EventBridge**: 事件总线，解耦发布者和消费者
- **Edge-first**: 将请求处理前推到 CDN 边缘，最小化源站负载

## 7. 与相邻模块的关系

- **32-edge-computing**: 边缘函数与 Serverless 的关系
- **22-deployment-devops**: Serverless 的 CI/CD 策略
- **93-deployment-edge-lab**: 边缘部署实践

## 参考

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Deno Deploy Documentation](https://docs.deno.com/deploy/manual/)
- [Hono Framework](https://hono.dev/)
- [The Burning Monk — AWS Lambda Best Practices](https://theburningmonk.com/)
