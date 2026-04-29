# Web 渲染 — 理论基础

## 1. 浏览器渲染流水线

```
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint → Composite
```

### 关键阶段

- **Layout（重排）**: 计算元素几何位置，开销最大
- **Paint（重绘）**: 绘制像素，较 Layout 轻量
- **Composite（合成）**: GPU 合成图层，开销最小

## 2. 渲染策略深度对比

| 维度 | CSR | SSR | SSG | ISR | RSC |
|------|-----|-----|-----|-----|-----|
| **渲染位置** | 浏览器 | 服务端（每次请求） | 构建时 | 构建时 + 边缘增量 | 服务端组件流 |
| **首次加载** | 慢（需下载 JS） | 快 | 最快 | 快 | 快 |
| **SEO** | 差 | 好 | 好 | 好 | 好 |
| **交互性** | 好（完全水合） | 好（选择性水合） | 好 | 好 | 好（Server/Client 组件分离） |
| **TTI** | 慢 | 中等 | 快 | 快 | 快 |
| **服务器成本** | 低 | 高 | 低（CDN） | 低 | 中等 |
| **数据实时性** | 高 | 高 | 低 | 中等 | 高 |
| **典型框架** | Create React App | Next.js `getServerSideProps` | Next.js `getStaticProps` | Next.js `revalidate` | Next.js App Router |

### 策略选型决策树

- **营销页/博客** → SSG（内容不变，追求极致首屏）
- **电商商品页** → ISR（海量页面，允许短暂旧数据）
- **后台管理系统** → CSR（强交互，SEO 不敏感）
- **社交信息流** → SSR + RSC（动态内容 + 组件级粒度控制）

## 3. React Server Components (RSC)

RSC 允许组件仅在服务端执行，零 JS Bundle 体积：

```tsx
// app/page.tsx — Server Component by default in App Router
import { db } from './db';

// 零客户端 JS：直接访问数据库，不暴露连接字符串
async function ProductList() {
  const products = await db.query('SELECT * FROM products');
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} — ¥{p.price}</li>
      ))}
    </ul>
  );
}

// Client Component 需显式声明，用于交互
'use client';
import { useState } from 'react';

function AddToCart({ productId }: { productId: string }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      加入购物车 ({count})
    </button>
  );
}

export default function Page() {
  return (
    <main>
      <h1>商品列表</h1>
      <ProductList />
    </main>
  );
}
```

## 4. 流式渲染

服务端逐步发送 HTML：

- **Suspense**: 占位符 + 异步数据填充
- **Selective Hydration**: 优先交互关键部分注水
- **Progressive Enhancement**: 核心内容立即可见，增强功能逐步加载

```tsx
import { Suspense } from 'react';

function Page() {
  return (
    <>
      <header>立即渲染的头部</header>
      <Suspense fallback={<Skeleton />}>
        {/* 异步数据流式填充 */}
        <ProductRecommendations />
      </Suspense>
    </>
  );
}
```

## 5. 渲染优化

- **避免 Layout Thrashing**: 批量读写 DOM 属性
- **使用 transform/opacity**: 触发 Composite 而非 Layout
- **CSS contain**: 隔离布局影响范围
- **content-visibility**: 延迟视口外元素渲染

## 6. 与相邻模块的关系

- **18-frontend-frameworks**: 框架的渲染策略
- **50-browser-runtime**: 浏览器运行时架构
- **37-pwa**: PWA 的渲染优化

## 参考链接

- [Rendering on the Web — web.dev](https://web.dev/rendering-on-the-web/)
- [Next.js Rendering Documentation](https://nextjs.org/docs/app/building-your-application/rendering)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [The App Router Playbook — Vercel](https://vercel.com/blog/understanding-react-server-components)
