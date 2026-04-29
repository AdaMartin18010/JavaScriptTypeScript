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

---

## 4. 部署与边缘适配

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

## 5. 与相邻模块的关系

- **18-frontend-frameworks**: 前端框架
- **19-backend-development**: 后端开发
- **20-database-orm**: 数据库与 ORM

---

## 6. 参考资源

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

---

*最后更新: 2026-04-29*
