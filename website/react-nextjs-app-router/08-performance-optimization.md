---
title: 08 性能优化
description: 掌握 Next.js App Router 的性能优化技术：React Compiler、代码分割、INP 优化、Core Web Vitals 监控和图片优化。
---

# 08 性能优化

> **前置知识**：React 渲染机制、浏览器性能指标
>
> **目标**：能够诊断和优化 Next.js 应用的性能瓶颈

---

## 1. React Compiler

### 1.1 自动记忆化

React Compiler（原 React Forget）自动优化重渲染：

```tsx
// 之前：手动 useMemo/useCallback
function ExpensiveComponent({ data, onUpdate }) {
  const processed = useMemo(() =>
    data.map(item => heavyCalculation(item)),
    [data]
  );

  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return <div>{/* ... */}</div>;
}

// React Compiler 后：自动优化
function ExpensiveComponent({ data, onUpdate }) {
  // 编译器自动添加记忆化
  const processed = data.map(item => heavyCalculation(item));

  const handleClick = (id) => {
    onUpdate(id);
  };

  return <div>{/* ... */}</div>;
}
```

### 1.2 启用配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

```bash
# 安装 Babel 插件
npm install babel-plugin-react-compiler
```

---

## 2. 代码分割

### 2.1 动态导入

```tsx
// 组件级代码分割
import { Suspense, lazy } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

export default function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>

      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>

      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
```

### 2.2 Next.js 自动分割

```tsx
// Next.js 自动按路由分割代码
// app/dashboard/page.tsx — 独立的 chunk
// app/settings/page.tsx — 独立的 chunk

// 第三方库分割
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,        // 禁用服务端渲染
  loading: () => <EditorSkeleton />,
});
```

---

## 3. 图片优化

### 3.1 Next.js Image 组件

```tsx
import Image from 'next/image';

export default function Gallery() {
  return (
    <div>
      {/* 自动优化：WebP/AVIF 转换、懒加载、响应式 */}
      <Image
        src="/photo.jpg"
        alt="照片"
        width={800}
        height={600}
        priority          // 首屏图片预加载
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />

      {/* 填充模式 */}
      <div className="relative w-full h-64">
        <Image
          src="/banner.jpg"
          alt="横幅"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
```

### 3.2 远程图片配置

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};
```

---

## 4. 字体优化

### 4.1 next/font

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

```css
/* 使用 CSS 变量 */
.code-block {
  font-family: var(--font-roboto-mono);
}
```

---

## 5. Core Web Vitals 优化

### 5.1 关键指标

| 指标 | 目标 | 优化策略 |
|------|------|---------|
| **LCP** < 2.5s | 首屏最大元素 | 图片优化、预加载关键资源 |
| **INP** < 200ms | 交互响应 | 减少主线程阻塞、使用 Web Worker |
| **CLS** < 0.1 | 布局偏移 | 图片尺寸预留、字体显示策略 |
| **TTFB** < 600ms | 首字节时间 | Edge 部署、数据库优化 |
| **FCP** < 1.8s | 首内容绘制 | 关键 CSS 内联、减少阻塞资源 |

### 5.2 INP 优化

```tsx
// 使用 useTransition 避免阻塞输入
'use client';
import { useTransition, useState } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value); // 高优先级：立即更新输入

    startTransition(() => {
      // 低优先级：更新搜索结果
      searchAPI(value).then(setResults);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>搜索中...</span>}
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}
```

---

## 6. 监控与分析

### 6.1 Vercel Analytics

```bash
# 安装
npm install @vercel/analytics

# 在根布局中添加
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 6.2 Web Vitals 报告

```tsx
// app/_components/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 发送到分析平台
    console.log(metric);

    // 示例：发送到 Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_category: 'Web Vitals',
    // });
  });

  return null;
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **图片无尺寸** | 导致 CLS 布局偏移 | 始终提供 width/height 或使用 fill |
| **过度代码分割** | 太多小 chunk | 合并相关组件的 chunk |
| **忽略字体加载** | FOIT/FOUT 导致 CLS | 使用 font-display: swap |
| **阻塞主线程** | 大量计算导致 INP 差 | 使用 useTransition 或 Web Worker |

---

## 练习

1. 使用 Lighthouse 分析一个 Next.js 应用，列出所有性能问题并修复。
2. 实现一个虚拟滚动列表：处理 10,000 条数据，保持 60fps。
3. 优化一个电商产品页：LCP < 2s，CLS < 0.1，INP < 200ms。

---

## 延伸阅读

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Compiler](https://react.dev/learn/react-compiler)
- [Web Vitals](https://web.dev/vitals/)
