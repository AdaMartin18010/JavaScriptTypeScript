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

## 6. 代码示例：避免 Layout Thrashing

```typescript
// layout-thrashing.ts — 读写分离，批量操作

// ❌ 错误：交替读写触发强制同步布局（Forced Synchronous Layout）
function badUpdate(items: HTMLElement[]) {
  items.forEach(el => {
    const height = el.offsetHeight;        // 读（触发重排）
    el.style.height = `${height * 2}px`;   // 写
  });
}

// ✅ 正确：先读后写，批量操作
function goodUpdate(items: HTMLElement[]) {
  const heights = items.map(el => el.offsetHeight); // 批量读
  items.forEach((el, i) => {
    el.style.height = `${heights[i] * 2}px`;        // 批量写
  });
}

// ✅ 更优：使用 requestAnimationFrame 合并到下一帧
function rafUpdate(items: HTMLElement[]) {
  requestAnimationFrame(() => {
    const heights = items.map(el => el.getBoundingClientRect().height);
    requestAnimationFrame(() => {
      items.forEach((el, i) => {
        el.style.height = `${heights[i] * 2}px`;
      });
    });
  });
}
```

## 7. 代码示例：IntersectionObserver 虚拟滚动

```typescript
// virtual-scroll.ts — 长列表渲染优化

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function createVirtualScroller<T>(
  container: HTMLElement,
  items: T[],
  renderItem: (item: T, index: number) => HTMLElement,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  const spacer = document.createElement('div');
  spacer.style.height = `${totalHeight}px`;
  spacer.style.position = 'relative';

  const viewport = document.createElement('div');
  viewport.style.position = 'absolute';
  viewport.style.top = '0';
  viewport.style.left = '0';
  viewport.style.right = '0';

  spacer.appendChild(viewport);
  container.appendChild(spacer);

  let renderedRange = { start: -1, end: -1 };

  function updateViewport(scrollTop: number) {
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIdx = Math.min(items.length, startIdx + visibleCount + overscan * 2);

    if (startIdx === renderedRange.start && endIdx === renderedRange.end) return;
    renderedRange = { start: startIdx, end: endIdx };

    viewport.innerHTML = '';
    viewport.style.transform = `translateY(${startIdx * itemHeight}px)`;

    for (let i = startIdx; i < endIdx; i++) {
      viewport.appendChild(renderItem(items[i], i));
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateViewport(container.scrollTop);
      }
    });
  });
  observer.observe(spacer);

  container.addEventListener('scroll', () => updateViewport(container.scrollTop));
  updateViewport(0);

  return { destroy: () => observer.disconnect() };
}
```

## 8. 代码示例：CSS Contain 与 content-visibility

```typescript
// css-contain.ts — 隔离布局影响，提升大规模列表性能

export function injectContainStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .contain-layout {
      contain: layout; /* 元素布局不影响外部 */
    }
    .contain-strict {
      contain: strict; /* layout + style + paint + size */
    }
    .content-visibility-auto {
      content-visibility: auto;
      contain-intrinsic-size: auto 300px; /* 占位高度，防止滚动条抖动 */
    }
  `;
  document.head.appendChild(style);
}

// React 中使用 CSS Contain 的列表项组件示例
/*
function ListItem({ data }: { data: ItemData }) {
  return (
    <article style={{ contain: 'content' }}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </article>
  );
}
*/
```

## 9. 代码示例：React useDeferredValue 高优先级任务插队

```tsx
// deferred-search.tsx — 利用 useDeferredValue 保持输入响应
import { useState, useDeferredValue, memo } from 'react';

// 模拟大数据量列表渲染
const HeavyList = memo(({ query }: { query: string }) => {
  const items = Array.from({ length: 5000 }, (_, i) => `Item ${i}`);
  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ul>
      {filtered.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
});

export function SearchPage() {
  const [rawQuery, setRawQuery] = useState('');
  const deferredQuery = useDeferredValue(rawQuery);

  const isStale = rawQuery !== deferredQuery;

  return (
    <div>
      <input
        type="text"
        value={rawQuery}
        onChange={e => setRawQuery(e.target.value)}
        placeholder="搜索 5000 条数据..."
      />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <HeavyList query={deferredQuery} />
      </div>
    </div>
  );
}
```

## 10. 代码示例：requestIdleCallback 非关键渲染调度

```typescript
// idle-rendering.ts — 将非关键 DOM 更新推迟到浏览器空闲期

export function scheduleIdleRender(
  buildFragment: () => DocumentFragment,
  container: HTMLElement,
  timeout = 2000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cb = (deadline: IdleDeadline) => {
      try {
        // 如果有足够时间，直接插入；否则继续 defer
        if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
          container.appendChild(buildFragment());
          resolve();
        } else {
          // 时间不足，重新调度
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(cb, { timeout });
          } else {
            setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 50 } as IdleDeadline), 50);
          }
        }
      } catch (err) {
        reject(err);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout });
    } else {
      // Safari 降级：使用 MessageChannel 实现微任务级别的空闲调度
      const channel = new MessageChannel();
      channel.port2.onmessage = () => cb({ didTimeout: true, timeRemaining: () => 16 } as IdleDeadline);
      channel.port1.postMessage(null);
    }
  });
}

// 使用场景：延迟加载评论区、非首屏推荐模块
scheduleIdleRender(() => {
  const frag = document.createDocumentFragment();
  const commentSection = document.createElement('div');
  commentSection.id = 'comments';
  commentSection.innerHTML = '<!-- 异步加载评论 -->';
  frag.appendChild(commentSection);
  return frag;
}, document.getElementById('footer')!);
```

## 11. 代码示例：Web Worker 离屏 Canvas 渲染

```typescript
// offscreen-canvas.worker.ts — 将 heavy canvas 渲染卸载到 Worker
// 主线程
const canvas = document.querySelector('canvas')!;
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker(new URL('./chart.worker.ts', import.meta.url), {
  type: 'module',
});

worker.postMessage({ canvas: offscreen, data: largeDataset }, [offscreen]);

// chart.worker.ts
self.onmessage = (event: MessageEvent<{ canvas: OffscreenCanvas; data: number[] }>) => {
  const { canvas, data } = event.data;
  const ctx = canvas.getContext('2d')!;

  // 在 Worker 中执行耗时渲染，不阻塞主线程
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / data.length;

  ctx.clearRect(0, 0, width, height);
  data.forEach((value, i) => {
    const barHeight = (value / Math.max(...data)) * height;
    ctx.fillStyle = `hsl(${(i / data.length) * 360}, 70%, 50%)`;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
  });
};
```

## 12. 与相邻模块的关系

- **18-frontend-frameworks**: 框架的渲染策略
- **50-browser-runtime**: 浏览器运行时架构
- **37-pwa**: PWA 的渲染优化

## 参考链接

- [Rendering on the Web — web.dev](https://web.dev/rendering-on-the-web/)
- [Next.js Rendering Documentation](https://nextjs.org/docs/app/building-your-application/rendering)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [The App Router Playbook — Vercel](https://vercel.com/blog/understanding-react-server-components)
- [web.dev — Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- [MDN — CSS contain](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
- [MDN — content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
- [CSS Triggers — Layout/Paint/Composite 参考](https://csstriggers.com/)
- [Chrome DevTools — Performance Analysis](https://developer.chrome.com/docs/devtools/performance/)
- [web.dev — The Science of Web Fonts](https://web.dev/articles/font-best-practices)
- [Google — Critical Rendering Path](https://developer.chrome.com/docs/lighthouse/performance/critical-request-chains/)
- [React — useDeferredValue API Reference](https://react.dev/reference/react/useDeferredValue)
- [React — Suspense for Data Fetching](https://react.dev/reference/react/Suspense)
- [web.dev — Optimize Cumulative Layout Shift](https://web.dev/articles/cls)
- [web.dev — Optimize Largest Contentful Paint](https://web.dev/articles/lcp)
- [MDN — IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [MDN — OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [web.dev — content-visibility: the new CSS property that boosts your rendering performance](https://web.dev/articles/content-visibility)
- [HTML Spec — Event Loop Processing Model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
- [W3C — requestIdleCallback](https://w3c.github.io/requestidlecallback/)
- [Chrome — Inside look at modern web browser (Part 3)](https://developer.chrome.com/blog/inside-browser-part3/)
- [web.dev — Rendering performance](https://web.dev/articles/rendering-performance)
- [web.dev — Reduce the scope and complexity of style calculations](https://web.dev/articles/reduce-scope-and-complexity-of-style-calculations)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
