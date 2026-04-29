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

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
