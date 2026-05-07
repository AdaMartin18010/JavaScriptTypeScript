---
title: 06 缓存策略全解
description: 深入掌握 Next.js App Router 的四层缓存体系：Request Memoization、Data Cache、Full Route Cache 和 Router Cache。
---

# 06 缓存策略全解

> **前置知识**：HTTP 缓存基础、Next.js App Router 数据获取
>
> **目标**：能够设计精确的缓存策略，平衡性能和数据新鲜度

---

## 1. Next.js 缓存架构

### 1.1 四层缓存

```
请求流程：
Browser → Router Cache → Full Route Cache → Data Cache → Request Memoization → Origin

1. Router Cache     （客户端）   — 导航历史、预加载路由
2. Full Route Cache （服务端）   — 静态渲染的页面 HTML/RSC Payload
3. Data Cache       （服务端）   — fetch 请求的响应
4. Request Memoization（服务端）— 相同请求的重复调用去重
```

---

## 2. Request Memoization

### 2.1 机制

React 在渲染过程中自动对相同的 `fetch` 请求进行去重：

```tsx
// 组件 A
async function ComponentA() {
  const user = await fetch('https://api.example.com/user/1'); // 首次请求
  return <div>{user.name}</div>;
}

// 组件 B
async function ComponentB() {
  const user = await fetch('https://api.example.com/user/1'); // 复用结果
  return <div>{user.email}</div>;
}

// 同一个渲染周期中，两个 fetch 只执行一次
```

### 2.2 范围

- **仅在渲染期间有效**：每次页面请求都会重新创建
- **不影响 Data Cache**：memoization 结束后，Data Cache 仍然保留

---

## 3. Data Cache

### 3.1 默认行为

```tsx
// Next.js 15 默认：fetch 不缓存
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// 等效于：
// fetch('...', { cache: 'no-store' })
```

### 3.2 缓存控制

```tsx
// 1. 强制缓存（静态生成时缓存）
async function getStaticData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',
  });
  return res.json();
}

// 2. 定时重新验证（ISR）
async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // 每 60 秒重新验证
  });
  return res.json();
}

// 3. 标签缓存（按需失效）
async function getTaggedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { tags: ['products'] },
  });
  return res.json();
}

// 在 Server Action 中失效
import { revalidateTag } from 'next/cache';

export async function updateProduct(formData: FormData) {
  await db.products.update(/* ... */);
  revalidateTag('products'); // 使所有带 'products' 标签的缓存失效
}
```

### 3.3 缓存策略对比

| 策略 | 配置 | 适用场景 |
|------|------|---------|
| 不缓存 | 默认 / `cache: 'no-store'` | 实时数据、用户特定数据 |
| 强制缓存 | `cache: 'force-cache'` | 构建时确定的静态数据 |
| ISR | `next: { revalidate: N }` | 频繁更新但可容忍延迟 |
| 标签缓存 | `next: { tags: ['tag'] }` | 需要按需失效的数据 |

---

## 4. Full Route Cache

### 4.1 机制

Next.js 在构建时自动缓存静态路由的渲染结果：

```tsx
// 静态路由（自动缓存）
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache',
  });
  return <div>{data.title}</div>;
}

// 构建时：
// 1. 获取数据
// 2. 渲染 RSC
// 3. 生成 HTML + RSC Payload
// 4. 缓存结果
```

### 4.2 动态路由

```tsx
// 动态路由默认不缓存
type PageProps = { params: { id: string } };

export default async function Page({ params }: PageProps) {
  const data = await fetch(`https://api.example.com/item/${params.id}`);
  return <div>{data.title}</div>;
}

// 生成静态参数（构建时生成这些路由）
export async function generateStaticParams() {
  const items = await fetch('https://api.example.com/items');
  return items.map((item: any) => ({ id: String(item.id) }));
}

// 配合 ISR：未在构建时生成的路由，首次访问时生成并缓存
export const dynamicParams = true;
```

### 4.3 路由段配置

```tsx
// app/page.tsx
export const dynamic = 'auto';     // 默认：按需静态/动态
export const dynamic = 'force-dynamic';  // 强制动态渲染（不缓存）
export const dynamic = 'force-static';   // 强制静态渲染

export const revalidate = 60;      // ISR：60 秒重新验证
export const fetchCache = 'auto';  // fetch 缓存策略
```

---

## 5. Router Cache

### 5.1 客户端缓存

Router Cache 存储在浏览器内存中：

```tsx
// 客户端导航时，复用缓存的路由
// 点击链接 → 检查 Router Cache → 命中则立即显示

// 页面组件
'use client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  
  return (
    <button onClick={() => router.push('/dashboard')}>
      前往仪表盘（可能从缓存加载）
    </button>
  );
}
```

### 5.2 缓存失效

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const router = useRouter();
  
  return (
    <button onClick={() => router.refresh()}>
      刷新当前页面（使 Router Cache 失效）
    </button>
  );
}
```

---

## 6. 缓存设计模式

### 6.1 多级缓存策略

```tsx
// 应用：电商产品页

// 1. 产品基础信息：ISR 1 小时
async function getProductBase(id: string) {
  return fetch(`/api/products/${id}/base`, {
    next: { revalidate: 3600, tags: [`product-${id}`] },
  });
}

// 2. 产品价格：ISR 5 分钟（价格变化频繁）
async function getProductPrice(id: string) {
  return fetch(`/api/products/${id}/price`, {
    next: { revalidate: 300, tags: [`product-${id}-price`] },
  });
}

// 3. 库存信息：不缓存（实时数据）
async function getProductStock(id: string) {
  return fetch(`/api/products/${id}/stock`, {
    cache: 'no-store',
  });
}

// 4. 用户评价：ISR 1 天
async function getProductReviews(id: string) {
  return fetch(`/api/products/${id}/reviews`, {
    next: { revalidate: 86400 },
  });
}
```

### 6.2 缓存失效策略

```tsx
// app/api/products/route.ts
import { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // 更新数据库
  await db.products.create(data);
  
  // 策略 1：按路径失效
  revalidatePath('/products');
  revalidatePath(`/products/${data.id}`);
  
  // 策略 2：按标签失效
  revalidateTag('products');
  revalidateTag(`category-${data.categoryId}`);
  
  return Response.json({ success: true });
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **缓存不更新** | 数据变化但页面未刷新 | 检查 revalidate 配置，确认缓存标签 |
| **动态路由静态化失败** | generateStaticParams 遗漏 | 确保所有可能的路由都在列表中 |
| **客户端看到旧数据** | Router Cache 未失效 | 使用 `router.refresh()` 或 `revalidatePath` |
| **过度缓存** | 缓存了不应缓存的用户数据 | 对敏感数据使用 `cache: 'no-store'` |

---

## 练习

1. 为一个博客系统设计缓存策略：文章列表 ISR、单篇文章静态生成、评论实时加载。
2. 实现一个带有手动刷新按钮的数据看板：支持按标签失效缓存。
3. 分析一个现有应用的缓存问题：识别过度缓存和缓存缺失。

---

## 延伸阅读

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [React Cache](https://react.dev/reference/react/cache)
- [HTTP Cache MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
