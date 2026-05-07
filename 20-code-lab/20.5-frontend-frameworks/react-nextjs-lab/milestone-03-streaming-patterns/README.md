# M3: Streaming + Suspense 实验

## 目标

掌握 Streaming SSR 的实现模式，理解 Suspense Boundaries 的分块渲染机制。

## 实验环境

基于 M1 的 `rsc-lab` 项目。

## 实验任务

### 任务 1: Suspense 基础

```tsx
// app/page.tsx
import { Suspense } from 'react';
import ProductList from './ProductList';
import ReviewList from './ReviewList';
import ProductSkeleton from './ProductSkeleton';

export default function ProductPage() {
  return (
    <div>
      <h1>Product Detail</h1>

      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>

      <Suspense fallback={<div>Loading reviews...</div>}>
        <ReviewList />
      </Suspense>
    </div>
  );
}
```

### 任务 2: 流式加载指示器

```tsx
// components/StreamingIndicator.tsx
'use client';

import { useEffect, useState } from 'react';

export function StreamingIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse">
      <div className="h-full bg-blue-700 animate-[loading_2s_ease-in-out_infinite]" />
    </div>
  );
}
```

### 任务 3: 选择性水合 (Selective Hydration)

测试不同优先级组件的水合顺序：

```tsx
// app/layout.tsx
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <header>Immediate</header>
        <Suspense fallback={<aside>Loading sidebar...</aside>}>
          <Sidebar /> {/* 低优先级，延迟水合 */}
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

## 验证清单

- [ ] Chrome DevTools Network 显示 chunked transfer encoding
- [ ] HTML 源码分阶段到达（先骨架 → 后数据）
- [ ] 慢组件不阻塞快组件的渲染
- [ ] 骨架屏与最终内容平滑过渡

## 延伸阅读

- [React Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
