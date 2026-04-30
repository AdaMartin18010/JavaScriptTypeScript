---
dimension: 综合
sub-dimension: Serverless
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Serverless 核心概念与工程实践。

## 包含内容

- 本模块聚焦 serverless 核心概念与工程实践。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `functions-as-a-service/` | FaaS 函数编写与部署模式 | `serverless-patterns.ts` |
| `edge-functions/` | 边缘函数（Cloudflare Workers / Vercel Edge） | `edge-functions.ts` |
| `event-driven-architecture/` | 事件驱动与触发器设计 | `event-driven.ts` |
| `cold-start-optimization/` | 冷启动优化与预热策略 | `cold-start.ts` |
| `serverless-databases/` | 无服务器数据库集成 | `serverless-db.ts` |

## 代码示例

### Cloudflare Workers 处理请求

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/users' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, name FROM users LIMIT 10').all();
      return Response.json({ users: results });
    }
    return new Response('Not Found', { status: 404 });
  },
};
```

### AWS Lambda Handler (Node.js)

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');
  const userId = event.pathParameters?.id;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, data: body }),
  };
};
```

### Hono 轻量边缘框架

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

app.post('/api/echo', async (c) => {
  const body = await c.req.json();
  return c.json({ echo: body });
});

export default app;
```

### 冷启动优化：连接池与初始化分离

```typescript
// cold-start.ts — Lambda 最佳实践
import { Pool } from 'pg';

// 全局作用域：复用连接池，避免每次调用重建
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export const handler = async (event: unknown) => {
  const client = await getPool().connect();
  try {
    const result = await client.query('SELECT NOW() as now');
    return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
  } finally {
    client.release();
  }
};
```

### 事件驱动：SQS → Lambda 批处理

```typescript
// event-driven.ts — 批量处理 SQS 消息
import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  await Promise.all(
    event.Records.map(async (record: SQSRecord) => {
      try {
        const body = JSON.parse(record.body);
        await processMessage(body);
      } catch {
        // 仅标记失败项，其余成功消息自动确认
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    })
  );

  return { batchItemFailures };
};

async function processMessage(body: unknown): Promise<void> {
  console.log('Processing:', body);
}
```

### D1 / Turso 无服务器数据库事务

```typescript
// serverless-db.ts — Cloudflare D1 事务
export interface Env {
  DB: D1Database;
}

export async function transferCredits(
  env: Env,
  fromUser: string,
  toUser: string,
  amount: number
): Promise<Response> {
  const result = await env.DB.batch([
    env.DB.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').bind(amount, fromUser),
    env.DB.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').bind(amount, toUser),
    env.DB.prepare(
      'INSERT INTO transactions (from_user, to_user, amount, created_at) VALUES (?, ?, ?, ?)'
    ).bind(fromUser, toUser, amount, new Date().toISOString()),
  ]);

  const success = result.every((r) => r.success);
  return Response.json({ success, meta: result.map((r) => r.meta) });
}
```

### Azure Functions HTTP Trigger

```typescript
// azure-functions.ts — Azure Functions v4 Model
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`HTTP function processed request for url "${request.url}"`);

  const name = request.query.get('name') || (await request.text()) || 'world';

  return {
    status: 200,
    jsonBody: { message: `Hello, ${name}!`, timestamp: new Date().toISOString() },
  };
}

app.http('httpTrigger', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: httpTrigger,
});
```

### Serverless Framework 部署配置

```yaml
# serverless.yml — AWS Lambda + API Gateway 部署定义
service: my-api

provider:
  name: aws
  runtime: nodejs20.x
  region: ap-northeast-1
  environment:
    NODE_ENV: production
    DB_HOST: ${env:DB_HOST}

functions:
  health:
    handler: dist/health.handler
    events:
      - http:
          path: /health
          method: get
          cors: true

  createOrder:
    handler: dist/orders.create
    events:
      - http:
          path: /orders
          method: post
          cors: true
    environment:
      STRIPE_KEY: ${ssm:/prod/stripe/key}

plugins:
  - serverless-esbuild
  - serverless-offline

custom:
  esbuild:
    bundle: true
    minify: true
    target: node20
```

### OpenTelemetry 在 Lambda 中的追踪

```typescript
// lambda-telemetry.ts — Lambda 层注入分布式追踪
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AWSLambdaInstrumentation } from '@opentelemetry/instrumentation-aws-lambda';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [
    new AWSLambdaInstrumentation(),
    new HttpInstrumentation(),
    new AwsInstrumentation(),
  ],
});

sdk.start();

// Lambda handler wrapper
export const tracedHandler = (handler: Function) => {
  return async (event: unknown, context: unknown) => {
    // OpenTelemetry 自动注入 traceparent
    return handler(event, context);
  };
};
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 serverless-patterns.test.ts
- 📄 serverless-patterns.ts

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Cloudflare Workers | 官方文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| AWS Lambda | 官方文档 | [docs.aws.amazon.com/lambda](https://docs.aws.amazon.com/lambda/) |
| Vercel Edge Functions | 官方文档 | [vercel.com/docs/functions/edge-functions](https://vercel.com/docs/functions/edge-functions) |
| Hono | 轻量框架 | [hono.dev](https://hono.dev/) |
| Serverless Framework | 部署工具 | [serverless.com](https://www.serverless.com/) |
| OpenFaaS | 开源 Serverless | [docs.openfaas.com](https://docs.openfaas.com/) |
| Knative | Kubernetes Serverless | [knative.dev/docs](https://knative.dev/docs/) |
| AWS Lambda Power Tuning | 性能优化工具 | [github.com/alexcasalboni/aws-lambda-power-tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning) |
| Cloudflare D1 | 无服务器 SQL 数据库 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| Turso / libSQL | 边缘 SQLite | [docs.turso.tech](https://docs.turso.tech/) |
| Neon Serverless Postgres | 无服务器 PostgreSQL | [neon.tech/docs](https://neon.tech/docs/introduction) |
| SST (Serverless Stack) | 部署框架 | [sst.dev/docs](https://sst.dev/docs/) |
| Azure Functions Documentation | 微软 | [learn.microsoft.com/azure/azure-functions](https://learn.microsoft.com/en-us/azure/azure-functions/) |
| AWS SAM Documentation | 亚马逊 | [docs.aws.amazon.com/serverless-application-model](https://docs.aws.amazon.com/serverless-application-model/) |
| OpenTelemetry Lambda | 可观测性 | [opentelemetry.io/docs/faas/lambda-auto-instrument](https://opentelemetry.io/docs/faas/lambda-auto-instrument/) |
| Lambda Warmer / Provisioned Concurrency | 冷启动 | [aws.amazon.com/blogs/aws/aws-lambda-provisioned-concurrency](https://aws.amazon.com/blogs/aws/aws-lambda-provisioned-concurrency/) |
| Cloudflare Workers Runtime APIs | 运行时 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| Deno Deploy | 边缘运行时 | [deno.com/deploy](https://deno.com/deploy) |
| Supabase Edge Functions | 边缘函数 | [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions) |
| AWS Lambda Handler Types | 类型定义 | [github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda) |
| Terraform AWS Provider — Lambda | IaC | [registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
