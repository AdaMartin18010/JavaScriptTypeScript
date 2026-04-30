# 全栈模式 — 理论基础

## 1. T3 栈

现代 TypeScript 全栈的标准组合：

- **Next.js**: React 框架，支持 SSR/SSG/API Routes
- **tRPC**: 端到端类型安全的 API
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Prisma**: 类型安全的 ORM
- **NextAuth.js**: 认证方案

核心优势：**全栈类型安全**，从前端到数据库的类型自动推断。

---

## 2. 全栈类型安全

### 2.1 tRPC 端到端类型安全

```typescript
// server/routers/post.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = router({
  list: publicProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input, ctx }) => {
      const posts = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      let nextCursor: typeof input.cursor = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }
      return { posts, nextCursor };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.post.create({
        data: { ...input, authorId: ctx.session.user.id },
      });
    }),
});
```

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { db } from './db';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  return { session, db };
};

const t = initTRPC.context<typeof createTRPCContext>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx: { ...ctx, session: ctx.session } });
  })
);
```

```typescript
// utils/trpc.ts — 客户端自动推断类型
import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

// pages/index.tsx
function PostList() {
  // posts.data 类型自动推断为 { posts: Post[], nextCursor?: string }
  const posts = trpc.post.list.useQuery({ limit: 10 });
  const create = trpc.post.create.useMutation();

  if (posts.isLoading) return <div>Loading...</div>;

  return (
    <div>
      {posts.data?.posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
      <button
        onClick={() => create.mutate({ title: 'New Post', content: 'Hello' })}
        disabled={create.isPending}
      >
        Create Post
      </button>
    </div>
  );
}
```

### 2.2 Prisma 类型安全 ORM

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

```typescript
// server/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// 生成的类型自动与 tRPC / Zod 集成
// Prisma.UserCreateInput、Prisma.PostWhereInput 等类型可直接复用
```

### 2.3 Elysia + Eden Treaty（Bun 生态端到端类型安全）

```typescript
// server/index.ts — Elysia 后端
import { Elysia, t } from 'elysia';

const app = new Elysia()
  .get('/post/:id', ({ params: { id } }) => {
    return { id, title: 'Hello Elysia', content: 'Bun-powered end-to-end typesafe API' };
  }, {
    params: t.Object({ id: t.Number() }),
    response: t.Object({
      id: t.Number(),
      title: t.String(),
      content: t.String(),
    }),
  })
  .post('/post', ({ body }) => {
    return { ...body, id: Date.now() };
  }, {
    body: t.Object({ title: t.String(), content: t.String() }),
  })
  .listen(3000);

export type App = typeof app;
```

```typescript
// client/eden.ts — Eden Treaty 客户端自动推断类型
import { edenTreaty } from '@elysiajs/eden';
import type { App } from '../server';

const api = edenTreaty<App>('http://localhost:3000');

// 类型自动推断：res.data 为 { id: number; title: string; content: string }
const res = await api.post.id({ $params: { id: '1' } }).get();
console.log(res.data?.title);

// POST 同样类型安全
const created = await api.post.post({ title: 'New', content: 'Body' });
console.log(created.data?.id);
```

### 2.4 Fastify + @fastify/type-provider-typebox（高性能类型安全）

```typescript
// server/fastify.ts
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const fastify = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

fastify.get('/user/:id', {
  schema: {
    params: Type.Object({ id: Type.String() }),
    response: {
      200: Type.Object({
        id: Type.String(),
        name: Type.String(),
        email: Type.String(),
      }),
    },
  },
}, async (request, reply) => {
  // request.params.id 被推断为 string
  const user = await db.user.findUnique({ where: { id: request.params.id } });
  if (!user) return reply.status(404).send();
  return user;
});
```

---

## 3. 数据流模式

### 3.1 Server Components

服务端直接查询数据库，零客户端 JS：

```typescript
// app/dashboard/page.tsx — Server Component
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await requireAuth();

  // 直接查询数据库，无需 API 层
  const stats = await db.post.groupBy({
    by: ['status'],
    where: { authorId: session.user.id },
    _count: { id: true },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {stats.map(s => (
          <div key={s.status} className="border p-4 rounded">
            <div className="text-gray-500">{s.status}</div>
            <div className="text-2xl font-bold">{s._count.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.2 Server Actions

表单直接提交到服务端函数：

```typescript
// app/posts/new/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
});

export async function createPost(prevState: unknown, formData: FormData) {
  const session = await requireAuth();
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const post = await db.post.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}
```

```typescript
// app/posts/new/page.tsx
'use client';

import { useActionState } from 'react';
import { createPost } from './actions';

export default function NewPostPage() {
  const [state, action, isPending] = useActionState(createPost, { errors: {} });

  return (
    <form action={action} className="max-w-lg mx-auto p-6">
      <div>
        <label>Title</label>
        <input name="title" className="border w-full p-2" />
        {state.errors?.title && <p className="text-red-500">{state.errors.title[0]}</p>}
      </div>
      <div className="mt-4">
        <label>Content</label>
        <textarea name="content" className="border w-full p-2" rows={6} />
        {state.errors?.content && <p className="text-red-500">{state.errors.content[0]}</p>}
      </div>
      <button type="submit" disabled={isPending} className="mt-4 bg-blue-500 text-white px-4 py-2">
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### 3.3 认证中间件模式

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return session;
}

// 用于 API Routes 和 Server Actions 的统一认证守卫
export async function requireRole(role: 'admin' | 'editor') {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new Error(`Forbidden: requires ${role} role`);
  }
  return session;
}
```

### 3.4 Supabase 实时订阅模式

```typescript
// lib/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // 由 supabase gen types 生成

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 类型安全的实时订阅
export function subscribeToPosts(callback: (payload: Database['public']['Tables']['posts']['Row']) => void) {
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (payload) => callback(payload.new as Database['public']['Tables']['posts']['Row'])
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

---

## 4. 新增代码示例

### 4.1 Remix Loader + Action 模式

```typescript
// app/routes/posts.$postId.tsx — Remix 全栈路由
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { db } from '~/lib/db';
import { z } from 'zod';

// 服务端数据获取（自动类型推断）
export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { id: params.postId },
    include: { author: { select: { name: true } } },
  });
  if (!post) throw new Response('Not Found', { status: 404 });
  return json({ post });
}

// 服务端表单处理
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete') {
    await db.post.delete({ where: { id: params.postId } });
    return json({ success: true });
  }

  const schema = z.object({ title: z.string().min(1), content: z.string().min(1) });
  const data = schema.parse(Object.fromEntries(formData));
  await db.post.update({ where: { id: params.postId }, data });
  return json({ success: true });
}

// 组件自动获得 loader 返回类型
export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>By {post.author.name}</p>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button type="submit" disabled={fetcher.state !== 'idle'}>
          Delete
        </button>
      </fetcher.Form>
    </div>
  );
}
```

### 4.2 HTMX + 服务端渲染模式（超媒体驱动）

```typescript
// server.tsx — HTMX 超媒体后端（Hono + JSX）
import { Hono } from 'hono';
import { jsx } from 'hono/jsx';

const app = new Hono();

app.get('/contacts', async (c) => {
  const contacts = await db.contact.findMany({ take: 20 });
  return c.html(
    <div>
      <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>
                <button
                  hx-delete={`/contacts/${contact.id}`}
                  hx-confirm="Are you sure?"
                  hx-target="closest tr"
                  hx-swap="outerHTML swap:1s"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

app.delete('/contacts/:id', async (c) => {
  await db.contact.delete({ where: { id: c.req.param('id') } });
  return c.text(''); // HTMX 替换为空即删除行
});
```

### 4.3 GraphQL 类型安全模式（Pothos + Codegen）

```typescript
// server/schema.ts — Pothos Schema Builder
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import { prisma } from './db';

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
}>({
  plugins: [PrismaPlugin],
  prisma: { client: prisma },
});

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    posts: t.relation('posts'),
  }),
});

builder.queryType({
  fields: (t) => ({
    user: t.prismaField({
      type: 'User',
      args: { id: t.arg.id({ required: true }) },
      resolve: (query, _root, args) =>
        prisma.user.findUnique({ ...query, where: { id: args.id } }),
    }),
  }),
});

export const schema = builder.toSchema();
```

```typescript
// codegen.ts — GraphQL Code Generator 配置
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './server/schema.ts',
  documents: ['./app/**/*.tsx'],
  generates: {
    './generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
      config: { withHooks: true },
    },
  },
};

export default config;
```

### 4.4 边缘函数部署模式（Vercel Edge + Drizzle）

```typescript
// api/edge/route.ts — Vercel Edge Runtime
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-edge';
import { posts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    const allPosts = await db.select().from(posts).limit(10);
    return NextResponse.json(allPosts);
  }

  const result = await db.select().from(posts).where(eq(posts.id, id));
  return NextResponse.json(result[0] ?? null);
}
```

---

## 5. 部署与边缘适配

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    remotePatterns: [{ hostname: 'cdn.example.com' }],
  },
};

export default nextConfig;
```

---

## 6. 与相邻模块的关系

- **18-frontend-frameworks**: 前端框架
- **19-backend-development**: 后端开发
- **20-database-orm**: 数据库与 ORM

---

## 7. 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| T3 Stack Docs | 文档 | <https://create.t3.gg/> |
| tRPC Documentation | 文档 | <https://trpc.io/docs> |
| Prisma Documentation | 文档 | <https://www.prisma.io/docs> |
| Next.js Documentation | 文档 | <https://nextjs.org/docs> |
| NextAuth.js | 文档 | <https://next-auth.js.org/> |
| Tailwind CSS | 文档 | <https://tailwindcss.com/docs> |
| React Server Components | RFC | <https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md> |
| Zod Schema Validation | 文档 | <https://zod.dev/> |
| Drizzle ORM (Prisma 替代) | 文档 | <https://orm.drizzle.team/> |
| web.dev — Rendering Patterns | 指南 | <https://web.dev/rendering-patterns/> |
| Elysia.js Documentation | 文档 | <https://elysiajs.com/> |
| Eden Treaty — End-to-End Type Safety | 文档 | <https://elysiajs.com/eden/overview.html> |
| Fastify Type Provider TypeBox | 文档 | <https://github.com/fastify/fastify-type-provider-typebox> |
| Hono — Lightweight Web Framework | 文档 | <https://hono.dev/> |
| Supabase TypeScript Support | 文档 | <https://supabase.com/docs/reference/javascript/typescript-support> |
| Next.js Server Actions | 文档 | <https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations> |
| Bun Runtime Documentation | 文档 | <https://bun.sh/docs> |
| Vercel Edge Runtime | 文档 | <https://edge-runtime.vercel.app/> |
| OpenAPI Generator for TypeScript | 文档 | <https://openapi-generator.tech/docs/generators/typescript/> |
| Remix Documentation | 文档 | <https://remix.run/docs> |
| HTMX Documentation | 文档 | <https://htmx.org/docs/> |
| Pothos — GraphQL Schema Builder | 文档 | <https://pothos-graphql.dev/> |
| GraphQL Code Generator | 文档 | <https://the-guild.dev/graphql/codegen> |
| Hono JSX — Server-Side Rendering | 文档 | <https://hono.dev/docs/guides/jsx> |
| The Twelve-Factor App | 方法论 | <https://12factor.net/> |
| Cloudflare Workers — TypeScript | 文档 | <https://developers.cloudflare.com/workers/languages/typescript/> |

---

*最后更新: 2026-04-30*
