---
title: 03 Streaming + Suspense 模式
description: 掌握 Next.js App Router 中的 Streaming SSR、Suspense 边界策略、渐进式加载模式，以及骨架屏设计最佳实践。
---

# 03 Streaming + Suspense 模式

> **前置知识**：React Suspense 基础、App Router 核心机制
>
> **目标**：能够设计细粒度的 Streaming 架构，避免瀑布加载，优化首屏时间

---

## 1. Streaming SSR 核心概念

### 1.1 传统 SSR vs Streaming SSR

```
传统 SSR：                    Streaming SSR：
┌─────────┐                  ┌─────────┐
│ 请求页面 │                  │ 请求页面 │
└────┬────┘                  └────┬────┘
     │                            │
     ▼                            ▼
┌─────────┐                  ┌─────────┐
│ 获取全部数据│                  │ 获取关键数据│
│ (串行)   │                  │ (优先)   │
└────┬────┘                  └────┬────┘
     │                            │
     ▼                            ▼
┌─────────┐                  ┌─────────┐  ◄── 首字节时间 (TTFB)
│ 渲染全部 HTML│                │ 流式发送    │
│          │                  │ 关键 HTML  │
└────┬────┘                  └────┬────┘
     │                            │  ┌─────────┐
     ▼                            │  │ 获取次要数据│
┌─────────┐                  │  │ (并行)   │
│ 发送完整 HTML│                │  └────┬────┘
│ (大块响应) │                  │       │
└─────────┘                  │       ▼
                               │  ┌─────────┐  ◄── 增量内容
                               │  │ 流式发送    │
                               │  │ 次要 HTML  │
                               │  └─────────┘
                               │       │
                               │       ▼
                               │  ┌─────────┐
                               └──│ 响应完成   │
                                  └─────────┘
```

### 1.2 Next.js 中的 Streaming 实现

Next.js App Router 默认支持 Streaming：

- `loading.tsx` 自动创建 Suspense 边界
- 组件级 `<Suspense>` 实现更细粒度控制
- RSC Payload 通过 HTTP 流分块传输

---

## 2. Suspense 边界策略

### 2.1 三种分层策略

```tsx
// 策略 1：页面级 Suspense（最粗粒度）
// app/blog/loading.tsx — 自动包裹整个页面

// 策略 2：区块级 Suspense（推荐）
// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      {/* Hero 立即渲染，不阻塞 */}
      <HeroSection />

      {/* 产品列表独立加载 */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>

      {/* 评论独立加载 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection />
      </Suspense>
    </div>
  );
}

// 策略 3：组件级 Suspense（最细粒度）
function ProductCard({ id }: { id: string }) {
  return (
    <div className="product-card">
      <ProductImage id={id} />
      <Suspense fallback={<PriceSkeleton />}>
        <ProductPrice id={id} />
      </Suspense>
      <Suspense fallback={<StockSkeleton />}>
        <ProductStock id={id} />
      </Suspense>
    </div>
  );
}
```

### 2.2 Suspense 边界设计原则

| 策略 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| 页面级 | 简单页面、内容同质化 | 实现简单 | 全页白屏风险 |
| 区块级 | 电商、内容平台 | 渐进式显示、用户体验好 | 需要识别独立数据区块 |
| 组件级 | 复杂交互界面 | 最细粒度控制 | 实现复杂、骨架屏管理困难 |

**推荐**：从区块级开始，根据性能数据优化到组件级。

---

## 3. 骨架屏设计最佳实践

### 3.1 骨架屏 vs Spinner

```tsx
// ❌ 不好的做法：全局 Spinning
function Loading() {
  return <div className="spinner-center"><Spinner /></div>;
}

// ✅ 好的做法：内容感知骨架屏
function ProductGridSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="product-card-skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-title" style={{ width: '70%' }} />
          <div className="skeleton-price" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  );
}
```

### 3.2 避免布局偏移（CLS）

```tsx
// 骨架屏尺寸必须与真实内容一致
function ArticleSkeleton() {
  return (
    <article className="article">
      {/* 标题骨架：高度与真实标题一致 */}
      <div className="skeleton skeleton-title" style={{ height: '2.5rem', marginBottom: '1rem' }} />

      {/* 元信息骨架 */}
      <div className="skeleton skeleton-meta" style={{ height: '1rem', width: '200px', marginBottom: '2rem' }} />

      {/* 正文骨架：多行，高度与真实段落一致 */}
      <div className="skeleton-paragraphs">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-line" style={{ height: '1.5rem', marginBottom: '0.75rem' }} />
        ))}
      </div>
    </article>
  );
}
```

---

## 4. 避免请求瀑布

### 4.1 瀑布的成因

```tsx
// ❌ 瀑布请求：串行数据获取
async function Page() {
  const user = await getUser();           // 请求 1
  const posts = await getPosts(user.id);  // 请求 2（依赖请求 1）
  const comments = await getComments(posts[0].id); // 请求 3（依赖请求 2）
  return <div>...</div>;
}
```

### 4.2 解决方案

```tsx
// ✅ 方案 1：并行获取（无依赖关系时）
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
  return <div>...</div>;
}

// ✅ 方案 2：Suspense + 独立组件（有依赖关系时）
export default function Page() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserHeader />  {/* 内部获取用户数据 */}
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <PostList />    {/* 内部获取文章列表 */}
      </Suspense>
    </div>
  );
}

// UserHeader.tsx — Server Component
async function UserHeader() {
  const user = await getUser();  // 独立获取
  return <header>{user.name}</header>;
}

// PostList.tsx — Server Component
async function PostList() {
  const posts = await getPosts();  // 独立获取（与 UserHeader 并行）
  return <ul>{posts.map(...)}</ul>;
}
```

### 4.3 数据预加载模式

```tsx
// 使用 React Cache 避免重复请求
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  return db.users.findById(id);
});

// 在 Layout 和 Page 中都可以调用 getUser，
// 但只会在服务端执行一次
async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser('123');  // 第一次：实际查询
  return <div data-user={user.name}>{children}</div>;
}

async function Page() {
  const user = await getUser('123');  // 第二次：返回缓存结果
  return <h1>Welcome, {user.name}</h1>;
}
```

---

## 5. Streaming 与错误处理

### 5.1 错误边界层级

```tsx
// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      {/* Hero 无 Suspense，阻塞渲染 */}
      <HeroSection />

      {/* ProductGrid 有独立错误边界 */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ErrorBoundary fallback={<ProductGridError />}>
          <ProductGrid />
        </ErrorBoundary>
      </Suspense>

      {/* Reviews 也有独立错误边界 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ErrorBoundary fallback={<ReviewsError />}>
          <ReviewsSection />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
```

### 5.2 部分失败策略

```tsx
// 某个区块加载失败时，不影响其他区块
function ProductGridError() {
  return (
    <div className="error-fallback">
      <p>无法加载产品列表</p>
      <button onClick={() => window.location.reload()}>刷新</button>
    </div>
  );
}
```

---

## 6. 性能指标与监控

### 6.1 关键指标

| 指标 | 目标 | 说明 |
|------|------|------|
| TTFB | < 600ms | Time to First Byte |
| FCP | < 1.8s | First Contentful Paint |
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| INP | < 200ms | Interaction to Next Paint |

### 6.2 Next.js 性能分析

```bash
# 启用性能分析
next build --profile

# 使用 Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **过度拆分 Suspense** | 每个小组件都包 Suspense | 合并相关组件的 Suspense 边界 |
| **骨架屏尺寸不匹配** | 骨架屏与真实内容高度不一致 | 精确匹配尺寸，使用 CSS 变量 |
| **忽略错误边界** | Suspense 内组件抛错导致整页崩溃 | 添加 ErrorBoundary |
| **瀑布请求** | 串行数据获取阻塞 Streaming | 使用 Promise.all 或独立 Suspense |

---

## 练习

1. 设计一个电商页面骨架屏：包含导航栏、轮播图、产品网格、侧边栏四个区块，每个区块独立加载。
2. 实现一个数据依赖关系图：用户 → 订单 → 订单详情，使用 React Cache 避免重复请求。
3. 为一个博客系统添加 Streaming：文章列表优先加载，评论通过 Suspense 延迟加载。

---

## 延伸阅读

- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [Next.js Streaming Documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Vercel — How to Build a Streaming SSR App](https://vercel.com/blog/how-to-build-a-streaming-ssr-app)
