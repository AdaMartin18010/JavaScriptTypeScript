---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# Serverless 与边缘计算（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦 Serverless 应用架构与边缘部署模式，通用 CI/CD、容器编排和云平台基础设施请参见 `13-ci-cd.md` 和 `26-deployment-hosting.md`。

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| Serverless 框架 | Vercel Functions, Netlify Functions, AWS Lambda | 无服务器 API、事件处理 |
| 边缘运行时 | Cloudflare Workers, Vercel Edge, Deno Deploy | 全球低延迟、A/B 测试 |
| 边缘存储 | Cloudflare KV, Durable Objects, Vercel Edge Config | 边缘状态、配置分发 |
| 边缘 AI | Cloudflare Workers AI, Vercel AI SDK Edge | 边缘推理、实时预测 |
| Serverless 数据库 | Turso, PlanetScale, Neon, Supabase | 边缘数据库、无服务器 SQL |

---

## 核心框架

### Cloudflare Workers

- **Stars**: 不适用（平台）
- **官网**: [workers.cloudflare.com](https://workers.cloudflare.com/)
- **TS支持**: ✅ 原生

在 Cloudflare 全球边缘节点运行 JavaScript/TypeScript，V8 Isolate 架构，冷启动 < 1ms。

**特点**:

- 🌍 全球 300+ 节点就近执行
- ⚡ 毫秒级冷启动
- 🔒 默认安全沙箱
- 📦 KV、R2、D1、Durable Objects 生态

**可运行代码示例**：

```typescript
// worker.ts —— Cloudflare Workers 边缘函数
export interface Env {
  MY_KV: KVNamespace;
  MY_D1: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 边缘缓存：优先读取 KV
    const cacheKey = url.pathname;
    const cached = await env.MY_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    // D1 边缘 SQL 查询
    if (url.pathname === '/api/users') {
      const { results } = await env.MY_D1.prepare('SELECT id, name FROM users LIMIT 10').all();
      const json = JSON.stringify(results);

      // 写入 KV 缓存 60 秒
      ctx.waitUntil(env.MY_KV.put(cacheKey, json, { expirationTtl: 60 }));

      return new Response(json, {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

**Wrangler 部署配置**：

```toml
# wrangler.toml
name = "edge-api"
main = "src/worker.ts"
compatibility_date = "2026-04-29"

[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "MY_D1"
database_name = "production-db"
database_id = "your-d1-database-id"
```

### Vercel Edge Functions

- **官网**: [vercel.com/docs/functions](https://vercel.com/docs/functions/edge-functions)
- **TS支持**: ✅ 原生

Vercel 边缘运行时，兼容 WinterCG 标准，支持 Edge Config 和 AI SDK 边缘推理。

**Vercel Edge Function 示例**：

```typescript
// app/api/geoip/route.ts
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // 关键：声明为 Edge Runtime

export async function GET(request: NextRequest) {
  const { city, country, latitude, longitude } = geolocation(request);

  return NextResponse.json({
    city,
    country,
    coordinates: { lat: latitude, lng: longitude },
    region: request.geo?.region,
    edgeNode: request.headers.get('x-vercel-id')?.split(':')[1],
  });
}
```

### Deno Deploy

- **官网**: [deno.com/deploy](https://deno.com/deploy)
- **TS支持**: ✅ 原生

Deno 的边缘部署平台，原生 TypeScript，内置权限模型。

**Deno Deploy 示例**：

```typescript
// main.ts
import { serve } from 'https://deno.land/std@0.220.0/http/server.ts';

serve(async (req) => {
  const url = new URL(req.url);

  // Deno 原生 KV（全球复制）
  const kv = await Deno.openKv();
  const visitCount = await kv.atomic()
    .sum(['visits', url.pathname], 1n)
    .commit();

  return new Response(JSON.stringify({ path: url.pathname, visits: visitCount }), {
    headers: { 'content-type': 'application/json' },
  });
});
```

---

## 边缘运行时选型对比

| 维度 | Cloudflare Workers | Vercel Edge | Deno Deploy |
|------|-------------------|-------------|-------------|
| 冷启动 | < 1ms | < 50ms | < 10ms |
| 全球节点 | 300+ | 100+ | 35+ |
| 标准兼容 | WinterCG | WinterCG | Deno / WinterCG |
| 原生存储 | KV, D1, R2, DO | Edge Config, Blob | Deno KV, Postgres |
| 最大执行时间 | 30s (Free) / 5min (Paid) | 30s | 60s |
| 本地模拟 | wrangler + Miniflare | next dev | deno deploy --prod |
| 边缘 AI | Workers AI (内置) | AI SDK + OpenAI | 第三方 API |

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ 边缘应用架构模式                    ├─ CI/CD 流水线
├─ Serverless 函数设计                 ├─ 容器编排 (K8s)
├─ 边缘状态管理                        ├─ 云虚拟机 / VPC
└─ 冷启动优化策略                      └─ 负载均衡 / CDN 原理
```

---

## 冷启动优化策略

```typescript
// 1. 懒加载重模块
let heavyLib: typeof import('heavy-lib') | null = null;

async function getHeavyLib() {
  if (!heavyLib) heavyLib = await import('heavy-lib');
  return heavyLib;
}

// 2. 连接预热（D1 / PlanetScale）
const db = drizzle(env.DATABASE_URL, { schema });
// 在模块顶层建立连接，利用 isolate 复用

// 3. 边缘缓存优先
async function cachedFetch(key: string, fetcher: () => Promise<Response>, ttl = 60) {
  const cache = caches.default;
  const cached = await cache.match(key);
  if (cached) return cached;

  const response = await fetcher();
  ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}
```

---

## 关联资源

- `jsts-code-lab/31-serverless/` — Serverless 代码模式
- `jsts-code-lab/32-edge-computing/` — 边缘运行时与架构
- `jsts-code-lab/93-deployment-edge-lab/` — 部署与边缘实战
- `docs/categories/30-edge-databases.md` — 边缘数据库分类
- `examples/edge-observability-starter/` — 边缘可观测性示例

## 权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Cloudflare Workers 文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) | 官方开发指南与运行时 API |
| WinterCG 标准 | [wintercg.org](https://wintercg.org/) | 边缘运行时标准化组织 |
| Vercel Edge Runtime | [vercel.com/docs/functions/runtimes/edge-runtime](https://vercel.com/docs/functions/runtimes/edge-runtime) | Edge Runtime 完整 API |
| Deno Deploy 文档 | [docs.deno.com/deploy/manual](https://docs.deno.com/deploy/manual/) | Deno 原生边缘平台 |
| Cloudflare D1 文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) | 边缘 SQLite 数据库 |
| Turso 文档 | [docs.turso.tech](https://docs.turso.tech/) | 边缘 SQLite (libSQL) |
| Fly.io 边缘部署 | [fly.io/docs](https://fly.io/docs/) | 全球应用部署平台 |
| AWS Lambda 性能优化 | [docs.aws.amazon.com/lambda/latest/operatorguide/perf-optimize.html](https://docs.aws.amazon.com/lambda/latest/operatorguide/perf-optimize.html) | 官方冷启动优化指南 |
| Fastly Compute@Edge | [developer.fastly.com/learning/compute](https://developer.fastly.com/learning/compute/) | WASM 边缘运行时 |
| Edge-first 架构模式 | [martinfowler.com/articles/serverless.html](https://martinfowler.com/articles/serverless.html) | Martin Fowler Serverless 综述 |

---

> 📅 最后更新: 2026-04-27


---

## 深化补充：更多 Serverless 代码示例

### AWS Lambda TypeScript 处理函数

```typescript
// lambda-handler.ts — AWS Lambda with TypeScript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.id;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing userId' }),
    };
  }

  // 模拟数据库查询
  const user = await getUserById(userId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, name: user?.name ?? 'Unknown' }),
  };
};
```

### Vercel Edge Middleware

```typescript
// middleware.ts — 边缘重定向与 A/B 测试
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('experiment');
  const variant = cookie?.value ?? Math.random() > 0.5 ? 'A' : 'B';

  const url = request.nextUrl.clone();
  url.pathname = `/variant-${variant}${url.pathname}`;
  const response = NextResponse.rewrite(url);
  response.cookies.set('experiment', variant, { maxAge: 60 * 60 * 24 });
  return response;
}

export const config = {
  matcher: ['/campaign/:path*'],
};
```

### Cloudflare Durable Objects

```typescript
// counter-do.ts — 有状态边缘对象
import { DurableObject } from 'cloudflare:workers';

export class Counter extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    let value = (await this.ctx.storage.get<number>('value')) ?? 0;

    if (url.pathname === '/increment') {
      value++;
      await this.ctx.storage.put('value', value);
    }

    return new Response(JSON.stringify({ value }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

### 更多权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| AWS Lambda Docs | <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html> | 官方无服务器计算文档 |
| Vercel Middleware | <https://vercel.com/docs/functions/edge-middleware> | Edge Middleware API |
| Cloudflare Durable Objects | <https://developers.cloudflare.com/durable-objects/> | 有状态边缘对象 |
| Neon Serverless Postgres | <https://neon.tech/docs/introduction> | 无服务器 PostgreSQL |
| Supabase Docs | <https://supabase.com/docs> | 开源 Firebase 替代 |
| Vercel AI SDK | <https://sdk.vercel.ai/docs> | AI 边缘推理 SDK |
| Serverless Framework | <https://www.serverless.com/framework/docs> | 跨云 Serverless 部署 |
| AWS SAM | <https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html> | AWS 无服务器应用模型 |
