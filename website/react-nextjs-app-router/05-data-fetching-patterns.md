---
title: 05 数据获取模式
description: 掌握 Next.js App Router 中的数据获取模式：React Cache、fetch 策略、避免瀑布请求、以及 Server Components 中的数据架构设计。
---

# 05 数据获取模式

> **前置知识**：React Suspense、Server Components、Next.js App Router
>
> **目标**：能够设计高效的数据获取架构，避免瀑布请求，掌握缓存策略

---

## 1. React Cache 模式

### 1.1 缓存函数

```tsx
import { cache } from 'react';

// 包装数据获取函数
const getUser = cache(async (id: string) => {
  return db.users.findById(id);
});

// 在多个组件中调用，只执行一次
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);  // 实际查询
  return <div>{user.name}</div>;
}

async function UserPosts({ userId }: { userId: string }) {
  const user = await getUser(userId);  // 返回缓存结果
  const posts = await db.posts.findByUserId(user.id);
  return <PostList posts={posts} />;
}
```

### 1.2 缓存失效

```tsx
// 通过 revalidatePath 或 revalidateTag 失效缓存
import { revalidateTag } from 'next/cache';

const getUser = cache(async (id: string) => {
  'use cache';  // Next.js 15+ 实验性功能
  return db.users.findById(id);
});

// Server Action 中失效
export async function updateUser(formData: FormData) {
  await db.users.update(/* ... */);
  revalidateTag('user-profile');
}
```

---

## 2. Fetch 策略

### 2.1 默认行为（Next.js 15）

```tsx
// Next.js 15 中 fetch 默认不缓存
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// 显式启用缓存
async function getDataCached() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // 缓存到 build 时
  });
  return res.json();
}

// ISR：定期重新验证
async function getDataISR() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 },  // 每 60 秒重新验证
  });
  return res.json();
}

// 按需重新验证（tag-based）
async function getDataTagged() {
  const res = await fetch('https://api.example.com/data', {
    next: { tags: ['products'] },
  });
  return res.json();
}
```

### 2.2 缓存策略对比

| 策略 | 配置 | 适用场景 |
|------|------|---------|
| 不缓存 | 默认（Next.js 15） | 实时数据、用户特定数据 |
| 静态缓存 | `cache: 'force-cache'` | 构建时确定的静态数据 |
| ISR | `next: { revalidate: N }` | 频繁更新但可容忍延迟的数据 |
| Tag-based | `next: { tags: ['tag'] }` | 需要按需失效的数据 |

---

## 3. 避免瀑布请求

### 3.1 数据依赖图谱

```tsx
// ❌ 瀑布：串行获取
async function Page() {
  const user = await getUser();        // 1s
  const posts = await getPosts(user.id); // 1s（等待用户）
  const comments = await getComments(posts[0].id); // 1s
  // 总时间：3s
}

// ✅ 并行：无依赖时同时获取
async function Page() {
  const [user, categories] = await Promise.all([
    getUser(),
    getCategories(),
  ]);
  // 总时间：1s
}

// ✅ Suspense：有依赖时的最优解
export default function Page() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}
```

### 3.2 数据预取（Prefetching）

```tsx
// 在 Layout 或父组件中预取数据
async function Layout({ children }: { children: React.ReactNode }) {
  // 开始预取（不 await）
  const userPromise = getUser();

  return (
    <UserProvider promise={userPromise}>
      {children}
    </UserProvider>
  );
}

// 子组件中消费
function UserProfile() {
  const user = use(getUserPromise);  // React use() API（Next.js 15+）
  return <div>{user.name}</div>;
}
```

---

## 4. Server Components 数据架构

### 4.1 数据下沉模式

```tsx
// ✅ 推荐：将数据获取下沉到使用数据的组件
export default function Page() {
  return (
    <div>
      <Header />           {/* 无数据需求 */}
      <ProductSection />   {/* 内部获取产品数据 */}
      <ReviewSection />    {/* 内部获取评论数据 */}
    </div>
  );
}

async function ProductSection() {
  const products = await getProducts();  // 独立获取
  return <ProductGrid products={products} />;
}

async function ReviewSection() {
  const reviews = await getReviews();    // 独立获取（并行）
  return <ReviewList reviews={reviews} />;
}
```

### 4.2 Repository 模式

```tsx
// lib/repositories/user.repository.ts
export class UserRepository {
  async findById(id: string): Promise<User> {
    return db.users.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.users.findUnique({ where: { email } });
  }
}

// lib/repositories/post.repository.ts
export class PostRepository {
  async findByUserId(userId: string): Promise<Post[]> {
    return db.posts.findMany({ where: { userId } });
  }
}

// 使用
import { UserRepository } from '@/lib/repositories/user.repository';

const userRepo = new UserRepository();

async function UserProfile({ userId }: { userId: string }) {
  const user = await userRepo.findById(userId);
  return <div>{user.name}</div>;
}
```

---

## 5. 客户端数据获取

### 5.1 SWR / React Query

```tsx
'use client';

import useSWR from 'swr';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    {
      refreshInterval: 30000,  // 每 30 秒刷新
      revalidateOnFocus: true,  // 窗口聚焦时刷新
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <div>{data.name}</div>;
}
```

### 5.2 何时用客户端获取？

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 首屏关键数据 | Server Component | SEO、首屏性能 |
| 用户交互后的数据 | Client Component + SWR | 即时响应 |
| 实时数据 | Client Component + WebSocket | 推送更新 |
| 频繁更新的数据 | Client Component + 轮询 | 减少服务端负载 |

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **在 Page 中统一获取所有数据** | 导致瀑布和阻塞 | 下沉到子组件，利用 Suspense |
| **忘记处理缓存失效** | 数据更新后页面不刷新 | 使用 `revalidatePath` 或 `revalidateTag` |
| **过度使用 Client Component** | 失去 RSC 优势 | 默认 Server Component，仅在需要交互时使用 Client |
| **忽略错误边界** | 数据获取失败导致整页崩溃 | 添加 ErrorBoundary |

---

## 练习

1. 设计一个电商产品页：产品信息（Server Component）、库存状态（Client Component + SWR）、相关推荐（Server Component）。
2. 实现一个带有乐观更新的评论系统：使用 Server Action 提交，SWR 管理本地状态。
3. 为一个博客系统设计数据架构：文章列表 ISR、单篇文章静态生成、评论客户端获取。

---

## 延伸阅读

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Cache](https://react.dev/reference/react/cache)
- [SWR Documentation](https://swr.vercel.app/)
