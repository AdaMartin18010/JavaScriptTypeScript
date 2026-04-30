---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# SSR / 元框架 (Meta Frameworks)

> 基于主流前端框架构建的全栈开发框架，提供服务端渲染(SSR)、静态站点生成(SSG)、API路由等能力。

---

## React 元框架

| 库名 | Stars | 特点 | TS支持度 | 官网 | GitHub |
|------|-------|------|----------|------|--------|
| **Next.js** | 127k⭐ | React全栈框架，支持SSR/SSG/ISR，App Router，内置图片优化、API路由 | ⭐⭐⭐⭐⭐ | [nextjs.org](https://nextjs.org) | [vercel/next.js](https://github.com/vercel/next.js) |
| **Gatsby** | 55k⭐ | 静态站点生成，丰富的插件生态，GraphQL数据层，适合内容型网站 | ⭐⭐⭐⭐ | [gatsbyjs.com](https://www.gatsbyjs.com) | [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) |
| **Remix** | 28k⭐ | Web标准全栈框架，嵌套路由，渐进增强，专注性能和用户体验 | ⭐⭐⭐⭐⭐ | [remix.run](https://remix.run) | [remix-run/remix](https://github.com/remix-run/remix) |
| **RedwoodJS** | 17k⭐ | 全栈React框架，GraphQL集成，脚手架工具，企业级架构 | ⭐⭐⭐⭐⭐ | [redwoodjs.com](https://redwoodjs.com) | [redwoodjs/redwood](https://github.com/redwoodjs/redwood) |
| **Blitz** | 13k⭐ | 全栈React框架，Zero-API数据层，基于Next.js构建 | ⭐⭐⭐⭐⭐ | [blitzjs.com](https://blitzjs.com) | [blitz-js/blitz](https://github.com/blitz-js/blitz) |

**Next.js App Router 服务端组件示例：**

```typescript
// app/page.tsx — Server Component（默认服务端渲染）
import { db } from '@/lib/db';
import { PostCard } from '@/components/PostCard';

export default async function HomePage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <ul className="grid gap-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
    </main>
  );
}
```

**Next.js API Route 与 Server Actions：**

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createPostSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 直接操作数据库，无需 REST API 层
  const post = await db.post.create({ data: parsed.data });
  revalidatePath('/');
  return { success: true, post };
}
```

**Next.js Middleware 边缘拦截示例：**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 基于 Geo 或 Cookie 的 A/B 测试分流
  const experiment = request.cookies.get('experiment')?.value ?? 'control';
  const url = request.nextUrl.clone();

  if (url.pathname === '/landing') {
    url.pathname = experiment === 'treatment' ? '/landing/v2' : '/landing/v1';
    return NextResponse.rewrite(url);
  }

  // 国际化前缀自动补全
  const locale = request.headers.get('accept-language')?.split(',')[0].split('-')[0] ?? 'en';
  if (!/^\/(en|zh|ja)\//.test(url.pathname)) {
    url.pathname = `/${locale}${url.pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Next.js Streaming 与 Suspense 边界：**

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { RevenueChart } from '@/components/RevenueChart';
import { RecentOrders } from '@/components/RecentOrders';

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      {/* 立即渲染，不阻塞 */}
      <h1>Dashboard</h1>

      {/* RevenueChart 可独立流式传输 */}
      <Suspense fallback={<RevenueChart.Skeleton />}>
        <RevenueChart />
      </Suspense>

      {/* RecentOrders 亦可独立流式传输 */}
      <Suspense fallback={<RecentOrders.Skeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}
```

**Remix Loader 与 Action：**

```typescript
// app/routes/posts.$slug.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getPost(params.slug!);
  if (!post) throw new Response('Not Found', { status: 404 });
  return json({ post });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete') {
    await deletePost(params.slug!);
    return redirect('/posts');
  }
  return json({ error: 'Unknown intent' }, { status: 400 });
}

export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button type="submit">Delete</button>
      </Form>
    </article>
  );
}
```

---

## Vue 元框架

| 库名 | Stars | 特点 | TS支持度 | 官网 | GitHub |
|------|-------|------|----------|------|--------|
| **Nuxt** | 55k⭐ | Vue全栈框架，文件路由，SSR/SSG/SPA模式，模块生态丰富 | ⭐⭐⭐⭐⭐ | [nuxt.com](https://nuxt.com) | [nuxt/nuxt](https://github.com/nuxt/nuxt) |

**Nuxt 3 组合式 API 与服务器路由：**

```typescript
// pages/index.vue — 自动文件路由
<script setup lang="ts">
const { data: posts } = await useFetch('/api/posts');
</script>

<template>
  <div>
    <h1>Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

// server/api/posts.get.ts — Nitro 服务器路由
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const posts = await $fetch('https://api.example.com/posts', { query });
  return posts;
});
```

**Nuxt 插件与模块系统：**

```typescript
// modules/my-module.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';

export default defineNuxtModule({
  meta: { name: 'myModule', configKey: 'myModule' },
  defaults: { apiBase: '/api' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.apiBase = options.apiBase;
    addPlugin(resolver.resolve('./runtime/plugin'));
  },
});
```

**Nuxt 服务端插件（Server Plugins）示例：**

```typescript
// server/plugins/auth.ts
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '');
    if (token) {
      // 校验 JWT 并将用户信息挂载到上下文
      event.context.auth = verifyToken(token);
    }
  });
});

// server/api/protected.post.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const body = await readBody(event);
  return { success: true, userId: event.context.auth.userId };
});
```

---

## 多框架支持

| 库名 | Stars | 特点 | TS支持度 | 官网 | GitHub |
|------|-------|------|----------|------|--------|
| **Astro** | 45k⭐ | 内容驱动，群岛架构，零JS默认，支持多框架组件(React/Vue/Svelte等) | ⭐⭐⭐⭐⭐ | [astro.build](https://astro.build) | [withastro/astro](https://github.com/withastro/astro) |
| **SvelteKit** | 18k⭐ | Svelte全栈框架，简洁高效，适配多种部署平台 | ⭐⭐⭐⭐⭐ | [kit.svelte.dev](https://kit.svelte.dev) | [sveltejs/kit](https://github.com/sveltejs/kit) |
| **SolidStart** | 5k⭐ | SolidJS全栈框架，细粒度响应式，高性能 | ⭐⭐⭐⭐⭐ | [start.solidjs.com](https://start.solidjs.com) | [solidjs/solid-start](https://github.com/solidjs/solid-start) |
| **Analog** | 3k⭐ | Angular全栈框架，文件路由，服务端渲染，面向现代Angular | ⭐⭐⭐⭐⭐ | [analogjs.org](https://analogjs.org) | [analogjs/analog](https://github.com/analogjs/analog) |

**Astro 群岛架构示例：**

```astro
---
// src/pages/index.astro
import Counter from '../components/Counter.tsx';
const posts = await fetch('https://api.example.com/posts').then(r => r.json());
---

<html lang="zh-CN">
  <head><title>My Blog</title></head>
  <body>
    <h1>Static Content (Zero JS)</h1>
    <ul>
      {posts.map(post => <li>{post.title}</li>)}
    </ul>

    <!-- 交互式岛屿：仅此处发送客户端 JS -->
    <Counter client:load initial={0} />
    <Counter client:visible initial={100} />
  </body>
</html>
```

```typescript
// src/components/Counter.tsx
import { useState } from 'react';

export default function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**Astro 内容集合（Content Collections）与类型安全：**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

// src/pages/blog/[...slug].astro
---
import { getCollection } from 'astro:content';
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
const { post } = Astro.props;
const { Content } = await post.render();
---
<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

**SvelteKit 表单与渐进增强：**

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let form;
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Login</button>
  {#if form?.error}<p class="error">{form.error}</p>{/if}
</form>
```

```typescript
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const user = await authenticate(data.get('email'), data.get('password'));
    if (!user) return fail(400, { error: 'Invalid credentials' });
    cookies.set('session', user.sessionToken, { path: '/' });
    throw redirect(303, '/dashboard');
  },
};
```

**SolidStart 文件路由与 API：**

```typescript
// src/routes/api/users.ts
import { json } from '@solidjs/start';
import { getUsers } from '~/lib/db';

export async function GET() {
  const users = await getUsers();
  return json(users);
}

// src/routes/users.tsx
import { createResource } from 'solid-js';
import { useRouteData } from '@solidjs/start';

export function routeData() {
  return createResource(() => fetch('/api/users').then(r => r.json()));
}

export default function UsersPage() {
  const [users] = useRouteData<typeof routeData>();
  return (
    <ul>
      {users()?.map((u: any) => (
        <li>{u.name}</li>
      ))}
    </ul>
  );
}
```

**Analog 服务端数据获取：**

```typescript
// src/app/pages/index.page.ts
import { Component } from '@angular/core';
import { injectContent, injectContentFiles } from '@analogjs/content';
import { AsyncPipe, NgFor } from '@angular/common';

@Component({
  standalone: true,
  imports: [AsyncPipe, NgFor],
  template: `
    <h1>Blog Posts</h1>
    <article *ngFor="let post of posts">
      <h2>{{ post.attributes.title }}</h2>
    </article>
  `,
})
export default class HomePage {
  readonly posts = injectContentFiles();
}
```

---

## 选型建议

| 场景 | 推荐框架 |
|------|----------|
| 大型React应用 | **Next.js** - 生态最成熟，Vercel支持 |
| 内容/博客网站 | **Gatsby** 或 **Astro** - 静态生成优化 |
| Web标准优先 | **Remix** - 渐进增强，SEO友好 |
| Vue项目 | **Nuxt** - 官方推荐，生态完善 |
| 多技术栈团队 | **Astro** - 框架无关，性能优先 |
| Angular项目 | **Analog** - 现代化全栈方案 |
| 全栈创业MVP | **RedwoodJS** 或 **Blitz** - 快速开发 |
| 极致交互性能 | **SolidStart** - 细粒度响应式，无 VDOM 开销 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Next.js Documentation | <https://nextjs.org/docs> | 官方文档，App Router 与 Pages Router 完整指南 |
| React Server Components | <https://react.dev/reference/react/use-server> | React 官方服务端组件规范 |
| Remix Documentation | <https://remix.run/docs> | 基于 Web 标准的全栈框架文档 |
| Nuxt Documentation | <https://nuxt.com/docs> | Vue 生态全栈框架官方文档 |
| Astro Documentation | <https://docs.astro.build> | 内容驱动多框架元框架文档 |
| Astro Content Collections | <https://docs.astro.build/en/guides/content-collections/> | 类型安全的内容管理 |
| SvelteKit Documentation | <https://kit.svelte.dev/docs> | Svelte 全栈框架官方文档 |
| SolidStart Documentation | <https://docs.solidjs.com/solid-start> | SolidJS 元框架官方文档 |
| Analog Documentation | <https://analogjs.org/docs> | Angular 全栈框架官方文档 |
| web.dev — Rendering | <https://web.dev/rendering-on-the-web/> | Google 官方渲染模式对比指南 |
| Core Web Vitals | <https://web.dev/vitals/> | 性能指标与优化最佳实践 |
| HTTP Streaming | <https://web.dev/streams/> | Web Streams API 标准文档 |
| Vercel Edge Runtime | <https://edge-runtime.vercel.app/> | 边缘计算运行时兼容性参考 |
| TC39 Import Attributes | <https://github.com/tc39/proposal-import-attributes> | 导入属性 Stage 3 提案 |
| WinterCG — Web Interoperability | <https://wintercg.org/> | 跨运行时 JavaScript 标准协作 |
| React Dev — Thinking in React | <https://react.dev/learn/thinking-in-react> | React 官方思维模型 |
| Web Vitals INP Guide | <https://web.dev/articles/inp> | Interaction to Next Paint 优化指南 |
| MDN — HTTP | <https://developer.mozilla.org/en-US/docs/Web/HTTP> | HTTP 协议权威参考 |

---

> 📅 数据更新于 2026年4月 | Stars 数据来自 GitHub，可能略有延迟
