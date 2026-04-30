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

### AWS Lambda 处理器（Node.js）

```typescript
// lambda-handler.ts
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  console.log('RequestId:', context.awsRequestId);

  // 环境变量与路由分发
  const stage = process.env.STAGE ?? 'dev';
  const path = event.rawPath;

  if (path === '/health') {
    return { statusCode: 200, body: JSON.stringify({ status: 'ok', stage }) };
  }

  if (path === '/process' && event.requestContext.http.method === 'POST') {
    const body = JSON.parse(event.body ?? '{}');
    // 异步重任务处理
    const result = await heavyComputation(body);
    return { statusCode: 200, body: JSON.stringify(result) };
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
};

async function heavyComputation(input: unknown): Promise<{ processed: boolean }> {
  // 模拟 CPU 密集型任务
  await new Promise((r) => setTimeout(r, 500));
  return { processed: true };
}
```

### Deno Deploy 边缘函数

```typescript
// deno-deploy-handler.ts
// 部署: https://dash.deno.com/
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const kv = await Deno.openKv();

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === '/counter' && req.method === 'POST') {
    const newValue = await kv.atomic()
      .set(['visits'], 0)
      .commit();
    const visits = (await kv.get<number>(['visits'])).value ?? 0;
    await kv.set(['visits'], visits + 1);
    return Response.json({ visits: visits + 1 });
  }

  if (url.pathname === '/counter' && req.method === 'GET') {
    const visits = (await kv.get<number>(['visits'])).value ?? 0;
    return Response.json({ visits });
  }

  return new Response('Not Found', { status: 404 });
}

serve(handler);
```

### Vercel Edge Function（Next.js App Router）

```typescript
// app/api/edge/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = request.geo?.city ?? 'unknown';

  // 边缘 KV 读取（Vercel KV / Upstash）
  const data = await fetch('https://api.example.com/weather', {
    headers: { Authorization: `Bearer ${process.env.API_KEY}` },
  }).then((r) => r.json());

  return Response.json({ city, weather: data, region: request.cf?.colo });
}
```

### EventBridge + Step Functions 编排模式

```typescript
// eventbridge-orchestration.ts
/**
 * AWS CDK / Serverless Framework 风格的事件驱动编排
 * 展示 Serverless 架构中状态机与事件总线的协作
 */
interface OrderEvent {
  detailType: 'OrderPlaced' | 'PaymentProcessed' | 'InventoryReserved';
  detail: { orderId: string; payload: unknown };
}

export async function orderPlacedHandler(event: OrderEvent) {
  // 1. 发布事件到 EventBridge
  await publishEvent('PaymentService', {
    detailType: 'ProcessPayment',
    detail: { orderId: event.detail.orderId },
  });

  // 2. Step Functions 状态机接管后续流程
  //    OrderPlaced → PaymentProcessed → InventoryReserved → Shipped
}

async function publishEvent(target: string, event: Omit<OrderEvent, 'detailType'> & { detailType: string }) {
  // AWS SDK: EventBridge putEvents
  console.log(`Publishing to ${target}:`, event);
}
```

## 6. Serverless 架构模式

- **Lambda 单体**: 单个函数处理所有请求（简单场景）
- **Lambda 分层**: 按职责拆分函数（API、Processor、Worker）
- **Step Functions**: 工作流编排，状态机管理复杂业务流程
- **EventBridge**: 事件总线，解耦发布者和消费者
- **Edge-first**: 将请求处理前推到 CDN 边缘，最小化源站负载

## 7. 代码示例：冷启动优化 — 依赖预加载与连接池

```typescript
// cold-start-optimization.ts — AWS Lambda 冷启动优化技巧
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// ⚡ 在模块顶层初始化，利用 Lambda 执行上下文复用
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ maxAttempts: 3 }));

// 预加载常用模块，避免首次调用时才 require
import('./heavy-module').then((m) => {
  // 懒加载但提前预热
});

export const handler = async (event: unknown) => {
  // 使用已初始化的客户端，跳过冷启动开销
  const result = await ddbClient.get({ TableName: 'Users', Key: { id: '123' } });
  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
```

## 8. 代码示例：边缘函数中间件链

```typescript
// edge-middleware.ts — 可组合的 Edge Function 中间件
export interface EdgeContext {
  request: Request;
  geo?: { city?: string; country?: string };
  cf?: { colo?: string };
}

export type EdgeMiddleware = (
  ctx: EdgeContext,
  next: () => Promise<Response>
) => Promise<Response>;

function compose(...middlewares: EdgeMiddleware[]): EdgeMiddleware {
  return async (ctx, next) => {
    let index = -1;
    async function dispatch(i: number): Promise<Response> {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = middlewares[i] ?? next;
      return fn(ctx, () => dispatch(i + 1));
    }
    return dispatch(0);
  };
}

// 使用示例
const rateLimit: EdgeMiddleware = async (ctx, next) => {
  const clientIP = ctx.request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const key = `ratelimit:${clientIP}`;
  // 实际调用 KV 进行计数
  return next();
};

const cors: EdgeMiddleware = async (ctx, next) => {
  const response = await next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
};

export const handler = compose(rateLimit, cors);
```

## 9. 代码示例：Serverless 定时任务（CRON）

```typescript
// scheduled-cleanup.ts — Cloudflare Workers / Deno Deploy 定时清理
// wrangler.toml: [triggers] crons = ["0 2 * * *"]
// Deno Deploy: 使用 Deno.cron API

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Running scheduled cleanup at', new Date(event.scheduledTime).toISOString());

    // 1. 清理过期 KV 条目
    const expiredKeys = await findExpiredKeys(env.KV_CACHE);
    await Promise.all(expiredKeys.map((k) => env.KV_CACHE.delete(k)));

    // 2. 生成日报统计
    const stats = await generateDailyStats(env.DB);
    await env.KV_CACHE.put('daily-stats', JSON.stringify(stats));

    console.log(`Cleanup complete. Removed ${expiredKeys.length} expired keys.`);
  },
};

async function findExpiredKeys(kv: KVNamespace): Promise<string[]> {
  // KV 本身按 TTL 自动过期，此处演示手动扫描场景
  const list = await kv.list();
  return list.keys.filter((k) => k.expiration && k.expiration * 1000 < Date.now()).map((k) => k.name);
}

async function generateDailyStats(_db: D1Database): Promise<Record<string, number>> {
  return { totalRequests: 10000, errors: 12, avgLatencyMs: 45 };
}
```

## 10. 与相邻模块的关系

- **32-edge-computing**: 边缘函数与 Serverless 的关系
- **22-deployment-devops**: Serverless 的 CI/CD 策略
- **93-deployment-edge-lab**: 边缘部署实践

## 11. 权威外部资源

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Deno Deploy Documentation](https://docs.deno.com/deploy/manual/)
- [Hono Framework](https://hono.dev/)
- [The Burning Monk — AWS Lambda Best Practices](https://theburningmonk.com/)
- [AWS Serverless Application Model (SAM)](https://docs.aws.amazon.com/serverless-application-model/)
- [OpenFaaS — Open Source Serverless Framework](https://www.openfaas.com/)
- [Knative — Kubernetes-based Serverless](https://knative.dev/docs/)
- [Serverless Framework](https://www.serverless.com/framework/docs)
- [OWASP Serverless Security Top 10](https://owasp.org/www-project-serverless-top-10/)
- [Cloudflare Durable Objects — Stateful Edge](https://developers.cloudflare.com/durable-objects/)
- [AWS Step Functions Developer Guide](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
- [Vercel Functions — Runtime & Region Configuration](https://vercel.com/docs/functions)
- [AWS Lambda Cold Start Best Practices](https://docs.aws.amazon.com/lambda/latest/operatorguide/execution-environments.html) — 执行环境与冷启动深度分析
- [Cloudflare Workers — D1 Database](https://developers.cloudflare.com/d1/) — 边缘 SQLite 数据库
- [Cloudflare Workers — Queues](https://developers.cloudflare.com/queues/) — 边缘消息队列
- [Deno — KV Database](https://docs.deno.com/deploy/kv/manual/) — Deno 原生键值存储
- [WinterCG — Web-interoperable Runtimes](https://wintercg.org/) — 边缘运行时标准化组织
- [Node.js — Corepack](https://nodejs.org/api/corepack.html) — 包管理器版本锁定
- [OpenJS Foundation — Edge Computing](https://openjsf.org/projects/) — 边缘计算相关开源项目

---

## 进阶 Serverless 模式

### Saga 模式 — Step Functions 编排

```typescript
// saga-orchestration.ts
interface SagaStep {
  name: string;
  invoke: () => Promise<void>;
  compensate: () => Promise<void>;
}

class Saga {
  private steps: SagaStep[] = [];
  private completed: SagaStep[] = [];

  addStep(step: SagaStep) { this.steps.push(step); }

  async execute() {
    for (const step of this.steps) {
      try {
        await step.invoke();
        this.completed.push(step);
      } catch (err) {
        for (const completed of [...this.completed].reverse()) {
          await completed.compensate();
        }
        throw new Error('Saga failed at step ' + step.name + ': ' + (err as Error).message);
      }
    }
  }
}
```

---

## 更多权威外部资源

| 资源 | 链接 |
|------|------|
| OpenFaaS Documentation | <https://docs.openfaas.com/> |
| Knative Documentation | <https://knative.dev/docs/> |
| Azure Functions Developer Guide | <https://learn.microsoft.com/en-us/azure/azure-functions/> |
| AWS Serverless Land | <https://serverlessland.com/> |
| WinterCG — Web-interoperable Runtimes | <https://wintercg.org/> |

*最后更新: 2026-04-30*
