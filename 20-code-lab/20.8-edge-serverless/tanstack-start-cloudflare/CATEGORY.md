---
dimension: 综合
sub-dimension: Tanstack start cloudflare
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Tanstack start cloudflare 核心概念与工程实践。

## 包含内容

- 本模块聚焦 tanstack start cloudflare 核心概念与工程实践。
- 涵盖 TanStack Start 框架基础设置、类型安全服务端函数、认证集成与边缘性能优化。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| 01-basic-setup/ | 目录 | 框架初始化、SSR 与边缘适配 |
| 02-server-functions/ | 目录 | createServerFn 与 RPC 调用 |
| 03-auth/ | 目录 | OAuth2 PKCE 与边缘 Session |
| 04-performance/ | 目录 | 流式 SSR、缓存与 Islands |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | TanStack Start 理论形式化定义 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// index.ts — TanStack Start Cloudflare 统一入口
export { default as appConfig } from './app.config';
export * from './01-basic-setup/root';
export * from './02-server-functions/todo';
export * from './03-auth/oauth-pkce';
export * from './04-performance/edge-cache';

// app.config.ts — 核心配置
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
    rollupConfig: { output: { format: 'esm' } },
  },
});
```

### 类型安全的服务端函数

```typescript
// app/routes/_layout/todo.tsx
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

// 输入验证 + 类型安全 RPC
const createTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ title: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    // 此代码仅在服务端运行，可安全访问 D1 / KV / R2
    const db = getDb();
    const todo = await db.insert(todos).values({ title: data.title, done: false }).returning();
    return todo[0];
  });

// 客户端调用 —— 完全类型推断
function TodoPage() {
  const mutation = useServerFn(createTodo);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const result = await mutation.mutateAsync({ title: form.get('title') as string });
        console.log('Created:', result.id); // result 类型自动推断
      }}
    >
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  );
}
```

### Cloudflare D1 数据库接入

```typescript
// app/db.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// app/routes/api/health.ts
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async ({ request }) => {
    // 边缘运行时的 request.cf 包含地理信息
    const country = request.cf?.country ?? 'unknown';
    return json({ status: 'ok', edge: true, country });
  },
});
```

### 边缘缓存与流式 SSR

```typescript
// app/routes/_layout/stream.tsx
import { Suspense } from 'react';
import { Await } from '@tanstack/react-router';

// 服务端数据获取 —— 支持 defer/stream
export const Route = createFileRoute('/_layout/stream')({
  loader: async () => {
    const slowData = defer(
      fetch('https://api.example.com/heavy')
        .then((r) => r.json())
        .then((data) => ({ data, cachedAt: Date.now() })),
    );
    return { slowData };
  },
  component: StreamPage,
});

function StreamPage() {
  const { slowData } = Route.useLoaderData();
  return (
    <Suspense fallback={<Skeleton />}>
      <Await promise={slowData}>
        {(data) => <HeavyChart data={data} />}
      </Await>
    </Suspense>
  );
}
```

### OAuth2 PKCE 边缘认证

```typescript
// app/routes/_layout/login.tsx
import { createServerFn } from '@tanstack/react-start';

const startOAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const state = crypto.randomUUID();
  const codeChallenge = await generatePKCE();

  // 将 state + codeChallenge 写入 Cloudflare KV（边缘会话）
  await getKV().put(`oauth:state:${state}`, codeChallenge, { expirationTtl: 600 });

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  throw redirect(url.toString());
});
```

### 边缘中间件与请求上下文

```typescript
// app/middleware.ts —— Cloudflare 边缘上下文注入
import { createMiddleware } from '@tanstack/react-start';

export const withCloudflareContext = createMiddleware({
  id: 'cf-context',
}).server(async ({ next }) => {
  // 在 Cloudflare Pages 环境中，env 绑定通过全局可访问
  const env = (globalThis as unknown as { env: Env }).env;
  return next({
    context: {
      db: getDb(env),
      kv: env.KV,
      r2: env.R2,
    },
  });
});

// 在路由中使用中间件
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    const user = await context.db.select().from(users).where(eq(users.id, context.userId));
    return { user: user[0] };
  },
  component: DashboardPage,
});
```

### 文件上传与 R2 对象存储

```typescript
// app/routes/_layout/upload.ts
import { createServerFn } from '@tanstack/react-start';
import { putObject } from '../lib/r2';

export const uploadFile = createServerFn({ method: 'POST' })
  .validator((formData: FormData) => {
    const file = formData.get('file');
    if (!(file instanceof File)) throw new Error('Invalid file');
    return file;
  })
  .handler(async ({ data: file }) => {
    const key = `uploads/${crypto.randomUUID()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    await putObject(key, new Uint8Array(arrayBuffer), {
      contentType: file.type,
    });
    return { key, url: `https://cdn.example.com/${key}` };
  });
```

### Wrangler 部署配置

```toml
# wrangler.toml
name = "tanstack-start-app"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "prod-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# KV 命名空间绑定
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# R2 存储桶绑定
[[r2_buckets]]
binding = "R2"
bucket_name = "assets"

# 环境变量
[vars]
APP_NAME = "TanStack Start on Cloudflare"
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📁 01-basic-setup
- 📁 02-server-functions
- 📁 03-auth
- 📁 04-performance
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TanStack Start Docs | 官方文档 | [tanstack.com/start/latest](https://tanstack.com/start/latest) |
| TanStack Router | 官方文档 | [tanstack.com/router/latest](https://tanstack.com/router/latest) |
| TanStack Query | 官方文档 | [tanstack.com/query/latest](https://tanstack.com/query/latest) |
| Cloudflare Pages | 官方文档 | [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/) |
| Cloudflare Workers | 官方文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| Cloudflare D1 | 官方文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| Cloudflare KV | 官方文档 | [developers.cloudflare.com/kv](https://developers.cloudflare.com/kv/) |
| Cloudflare R2 | 官方文档 | [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2/) |
| Vinxi Universal Dev Server | 源码 | [github.com/nksaraf/vinxi](https://github.com/nksaraf/vinxi) |
| Nitro — 服务端引擎 | 官方文档 | [nitro.unjs.io](https://nitro.unjs.io/) |
| React Server Components | 官方文档 | [react.dev/reference/react-server](https://react.dev/reference/react-server) |
| WinterCG Runtime Keys | 规范 | [wintercg.org](https://wintercg.org/) |
| Drizzle ORM 文档 | 官方文档 | [orm.drizzle.team](https://orm.drizzle.team/) |
| Zod 文档 | 官方文档 | [zod.dev](https://zod.dev/) |
| Wrangler CLI 文档 | 官方文档 | [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler/) |
| OAuth 2.0 PKCE (RFC 7636) | 规范 | [datatracker.ietf.org/doc/html/rfc7636](https://datatracker.ietf.org/doc/html/rfc7636) |
| Cloudflare Workers Runtime APIs | 参考 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |

---

*最后更新: 2026-04-29*
