# 07. 框架集成模式

## 主流框架的 Edge 支持

| 框架 | Edge Runtime | 集成方式 | 成熟度 |
|------|-------------|----------|--------|
| Next.js | Vercel Edge | `runtime = 'edge'` | ⭐⭐⭐⭐⭐ |
| SvelteKit | Vercel/Cloudflare | Adapter | ⭐⭐⭐⭐ |
| Remix | Cloudflare Workers | Adapter | ⭐⭐⭐⭐ |
| Nuxt | Nitro Preset | Preset | ⭐⭐⭐ |
| Astro | Vercel/Netlify | Adapter | ⭐⭐⭐⭐ |
| Hono | 全平台 | 原生 | ⭐⭐⭐⭐⭐ |

## Next.js App Router (最成熟)

```typescript
// 混合部署: 页面级选择运行时
// app/page.tsx
export const runtime = 'edge'; // 或 'nodejs'

export default async function Page() {
  const data = await fetch('https://api.example.com');
  return <div>{/* ... */}</div>;
}
```

## Hono: 边缘优先的 Web 框架

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/api/posts', cache({ cacheName: 'posts', cacheControl: 'max-age=3600' }), async (c) => {
  const posts = await c.env.DB.prepare('SELECT * FROM posts').all();
  return c.json(posts);
});

app.post('/api/posts', async (c) => {
  const body = await c.req.json();
  // JWT 验证
  const auth = c.req.header('Authorization');
  // ...
  return c.json({ id: 1 }, 201);
});

export default app;
```

## Remix + Cloudflare Workers

```typescript
// entry.server.tsx
import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  return new Response('<!DOCTYPE html>' + markup, {
    headers: { 'Content-Type': 'text/html' },
    status: responseStatusCode,
  });
}
```

## SvelteKit Adapter

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare-workers';

export default {
  kit: {
    adapter: adapter({
      config: 'wrangler.toml',
      platformProxy: {
        configPath: 'wrangler.toml',
      },
    }),
  },
};
```

## 框架选型决策

```
需要 SSR + 前端交互?
├── 是 → 需要 React 生态?
│   ├── 是 → Next.js (Vercel Edge)
│   └── 否 → SvelteKit / Remix
└── 否 → 纯 API 网关?
    ├── 是 → Hono (轻量、跨平台)
    └── 否 → 静态站点 → Astro
```

## 延伸阅读

- [Hono 文档](https://hono.dev/)
- [Remix Cloudflare Adapter](https://remix.run/docs/en/main/guides/cloudflare)
- [SvelteKit Adapters](https://kit.svelte.dev/docs/adapters)
