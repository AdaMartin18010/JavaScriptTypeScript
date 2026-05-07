---
title: 01 App Router 核心机制
description: 深入理解 Next.js App Router 的文件系统路由、嵌套布局、loading/error 状态、Parallel Routes 和 Intercepting Routes 的完整机制。
---

# 01 App Router 核心机制

> **前置知识**：React 基础（Hooks、Context）、Next.js 基础概念
>
> **目标**：掌握 App Router 的文件约定、路由匹配算法、嵌套布局和数据流

---

## 1. 文件系统路由约定

### 1.1 基础路由

```
app/
├── page.tsx              # /             (根页面)
├── layout.tsx            # 根布局
├── loading.tsx           # 根加载状态
├── error.tsx             # 根错误边界
├── about/
│   └── page.tsx          # /about        (静态路由)
├── blog/
│   ├── page.tsx          # /blog         (博客列表)
│   ├── [slug]/
│   │   └── page.tsx      # /blog/:slug   (动态路由)
│   └── layout.tsx        # 博客专属布局
└── (marketing)/          # 路由组（不参与 URL）
    ├── pricing/
    │   └── page.tsx      # /pricing
    └── features/
        └── page.tsx      # /features
```

### 1.2 特殊文件约定

| 文件 | 用途 | 渲染时机 |
|------|------|----------|
| `page.tsx` | 路由的 UI | 匹配路径时 |
| `layout.tsx` | 共享 UI 壳 | 所有子路由共享 |
| `loading.tsx` | 加载状态 | 子路由加载时（自动包裹 Suspense） |
| `error.tsx` | 错误边界 | 子路由抛错时 |
| `not-found.tsx` | 404 页面 | 调用 `notFound()` 时 |
| `template.tsx` | 重新挂载的布局 | 导航时重新创建状态 |
| `route.ts` | API 路由 | 接收到 HTTP 请求时 |
| `default.tsx` | Parallel Route 的默认回退 | 不匹配时 |

---

## 2. 嵌套布局（Nested Layouts）

### 2.1 布局继承机制

```tsx
// app/layout.tsx — 根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header>全局导航</header>
        <main>{children}</main>
        <footer>全局页脚</footer>
      </body>
    </html>
  );
}

// app/blog/layout.tsx — 博客布局（继承根布局）
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-container">
      <aside>博客侧边栏</aside>
      <article>{children}</article>
    </div>
  );
}

// app/blog/[slug]/page.tsx — 博客文章页面
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>文章: {params.slug}</h1>;
}
```

**渲染层次**：`RootLayout → BlogLayout → BlogPost`

### 2.2 布局状态保持

```tsx
// Layout 在导航时保持状态（不重新挂载）
// Template 在导航时重新挂载（重置状态）

// app/dashboard/template.tsx
'use client';
import { useState } from 'react';

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
  // 每次进入 /dashboard 下的子路由时，count 都会重置为 0
  return (
    <div>
      <p>模板计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      {children}
    </div>
  );
}
```

**选择原则**：

- 使用 **Layout**：需要保持状态（如滚动位置、表单输入）
- 使用 **Template**：需要每次导航重置状态（如动画入场、数据刷新）

---

## 3. loading.tsx 与 Streaming

### 3.1 自动 Suspense 边界

```tsx
// app/blog/loading.tsx — 自动包裹为 Suspense fallback
export default function BlogLoading() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-body" />
      <div className="skeleton-body" />
    </div>
  );
}

// 等效于：
// <Suspense fallback={<BlogLoading />}>
//   <BlogPage />
// </Suspense>
```

### 3.2 细粒度 Loading 控制

```tsx
// app/page.tsx
import { Suspense } from 'react';
import { ProductListSkeleton } from '@/components/skeletons';
import ProductList from '@/components/ProductList';
import HeroBanner from '@/components/HeroBanner';

export default function HomePage() {
  return (
    <div>
      {/* Hero 不阻塞，立即渲染 */}
      <HeroBanner />

      {/* ProductList 有独立的 Loading 状态 */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  );
}
```

---

## 4. error.tsx 与错误处理

### 4.1 错误边界机制

```tsx
'use client'; // error.tsx 必须是 Client Component

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报错误到监控系统
    console.error('路由错误:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 4.2 错误边界层级

```
app/
├── error.tsx          # 捕获全局错误
├── blog/
│   ├── error.tsx      # 捕获博客路由错误
│   └── [slug]/
│       └── error.tsx  # 捕获单篇文章错误
```

**错误冒泡**：子路由的错误边界捕获失败时，冒泡到父级错误边界。

---

## 5. Parallel Routes（并行路由）

### 5.1 定义与使用

```tsx
// app/layout.tsx — 定义并行路由槽位
export default function DashboardLayout({
  children,
  team,      // @team 目录内容
  analytics, // @analytics 目录内容
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <div className="main">{children}</div>
      <div className="sidebar">
        <section>{team}</section>
        <section>{analytics}</section>
      </div>
    </div>
  );
}
```

```
app/
├── layout.tsx
├── page.tsx
├── @team/
│   ├── page.tsx        # 默认显示
│   └── settings/
│       └── page.tsx    # /settings 时显示
├── @analytics/
│   ├── page.tsx
│   └── default.tsx     # 不匹配时的回退
└── settings/
    └── page.tsx        # 触发 @team/settings 和 @analytics/default
```

### 5.2 独立加载与错误处理

每个并行路由槽位有独立的 `loading.tsx` 和 `error.tsx`：

```
app/
├── @analytics/
│   ├── page.tsx
│   ├── loading.tsx     # 只影响 analytics 区域
│   └── error.tsx       # 只影响 analytics 区域
```

---

## 6. Intercepting Routes（拦截路由）

### 6.1 使用场景

在保持当前页面上下文的同时，显示路由内容（如模态框）：

```
app/
├── feed/
│   └── page.tsx           # 正常 Feed 页面
└── (.)photo/
    └── [id]/
        └── page.tsx       # 拦截 /photo/:id，在 Feed 页面显示为模态框
```

### 6.2 拦截规则

| 约定 | 匹配范围 |
|------|----------|
| `(.)` | 同一层级 |
| `(..)` | 上一层级 |
| `(..)(..)` | 上两层级 |
| `(...)` | 根目录 |

```tsx
// app/feed/(.)photo/[id]/page.tsx
// 当在 /feed 页面点击链接到 /photo/123 时，
// 显示为模态框而非完整页面导航

export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <img src={`/photos/${params.id}.jpg`} />
    </Modal>
  );
}
```

---

## 7. 路由匹配算法

### 7.1 优先级规则

1. **静态路由** > **动态路由** > **捕获所有路由**
2. 更**具体**的匹配优先

```
app/
├── blog/
│   ├── page.tsx          # /blog          (静态)
│   ├── [slug]/
│   │   └── page.tsx      # /blog/:slug    (动态)
│   └── [...slug]/
│       └── page.tsx      # /blog/a/b/c    (捕获所有)
```

### 7.2 路由组不参与匹配

```
app/
├── (shop)/
│   └── [category]/
│       └── page.tsx      # URL: /electronics (不是 /shop/electronics)
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **layout 不能导出 metadata** | `layout.tsx` 只能导出 `metadata`（非页面级） | 页面级 SEO 在 `page.tsx` 中导出 |
| **loading.tsx 只在服务端生效** | 客户端导航不会触发 loading | 使用 `useTransition` + 手动 Suspense |
| **parallel route 需要 default.tsx** | 不匹配时会 404 | 添加 `default.tsx` 作为回退 |
| **动态路由参数不自动解码** | `params.slug` 是编码后的 | 使用 `decodeURIComponent(params.slug)` |

---

## 练习

1. 创建一个三栏布局：左侧导航（固定）、中间内容（动态路由）、右侧信息面板（Parallel Route）。
2. 实现一个路由组 `(auth)`，包含 `/login` 和 `/register`，共享无导航栏的布局。
3. 为博客系统添加 `loading.tsx` 骨架屏，要求标题区域和正文区域分别加载。

---

## 延伸阅读

- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Next.js Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
