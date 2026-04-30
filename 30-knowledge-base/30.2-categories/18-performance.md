# 性能优化 (Performance)

> Web 性能优化的系统化框架：从 Core Web Vitals 到 JavaScript 运行时性能的深度实践指南。

---

## 核心概念

性能优化围绕**三个指标**和**两个维度**展开：

| 指标 | 目标 | 测量工具 |
|------|------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals Extension |
| **INP** (Interaction to Next Paint) | < 200ms | Chrome DevTools, CrUX |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |

| 维度 | 关注点 |
|------|--------|
| **加载性能** | 资源大小、网络策略、渲染阻塞 |
| **运行时性能** | 主线程占用、内存泄漏、重渲染 |

> **关键更新**：FID (First Input Delay) 已于 2024-03 被 INP 取代，INP 测量整个页面生命周期中的所有交互延迟。

---

## 优化策略矩阵

| 策略 | 加载性能 | 运行时性能 | 实施复杂度 |
|------|---------|-----------|-----------|
| **资源压缩 + Brotli/Gzip** | ✅ 显著 | — | 低 |
| **图片优化（WebP/AVIF）** | ✅ 显著 | — | 低 |
| **代码分割（Code Splitting）** | ✅ 显著 | — | 中 |
| **Tree Shaking** | ✅ 中等 | — | 低（构建工具自动） |
| **懒加载（Lazy Load）** | ✅ 显著 | — | 低 |
| **预加载关键资源** | ✅ 中等 | — | 低 |
| **Service Worker 缓存** | ✅ 显著 | — | 中 |
| **减少主线程工作** | — | ✅ 显著 | 高 |
| **虚拟列表（Virtual List）** | — | ✅ 显著 | 中 |
| **React Compiler（自动记忆化）** | — | ✅ 显著 | 低（React 19） |
| **Web Workers / WASM** | — | ✅ 中等 | 高 |

---

## JavaScript 特定优化

### bundle 体积控制

```javascript
// 分析 bundle 体积
npx vite-bundle-visualizer
npx @next/bundle-analyzer
```

| 技术 | 效果 | 说明 |
|------|------|------|
| **动态导入** | 减少初始包 | `import('./heavy-module')` |
| **barrels 优化** | 避免全量导入 | 不用 `index.ts` 聚合导出 |
| **日期库替换** | -80% 体积 | date-fns / dayjs 替代 moment |
| **lodash 按需** | -90% 体积 | `lodash-es` 或单函数包 |

### React 性能模式

| 模式 | 适用场景 | API |
|------|---------|-----|
| **组件记忆化** | 纯展示组件，props 不变 | React.memo |
| **值记忆化** |  expensive 计算 | useMemo |
| **回调记忆化** | 子组件依赖回调 | useCallback |
| **自动记忆化** | React 19+ 所有组件 | React Compiler |
| **状态 Colocation** | 减少 Context 订阅 | 将状态移至最近叶子 |

> **React 19 变化**：Compiler 自动处理记忆化，手动 `useMemo`/`useCallback` 逐步淘汰。

---

## 2026 生态动态

### INP 优化实战

INP 测量从用户交互到下一帧绘制的时间：

- **目标 < 200ms**：良好的交互响应
- **瓶颈来源**：长任务（>50ms）阻塞主线程

```javascript
// 将长任务拆分为小块
await scheduler.yield();  // Chrome 129+，主动让出主线程
```

### 边缘缓存策略

| 平台 | 缓存层级 | 配置方式 |
|------|---------|---------|
| Vercel | Edge / CDN / 浏览器 | `vercel.json` + Headers |
| Cloudflare | CDN / 浏览器 | Cache Rules + Workers |
| Netlify | CDN / 浏览器 | `_headers` + `_redirects` |

### 核心优化清单

- [ ] 启用 Brotli 压缩（比 Gzip 小 15–25%）
- [ ] 使用 `<img loading="lazy">` 和 `fetchpriority`
- [ ] 预连接关键域名：`<link rel="preconnect">`
- [ ] 字体 `font-display: swap` 避免 FOIT
- [ ] 第三方脚本延迟加载（Google Analytics, 广告）
- [ ] INP 监控：部署 CrUX 数据收集

---

## 扩展代码示例

### scheduler.yield() 长任务拆分

```typescript
// utils/processLargeDataset.ts
export async function processLargeDataset<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => void
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    processor(batch);

    // 每处理一批后主动让出主线程，避免阻塞 INP
    if ('scheduler' in window && 'yield' in window.scheduler) {
      await (window.scheduler as any).yield();
    } else {
      // 降级方案：setTimeout(0)
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

// 使用示例
const hugeList = Array.from({ length: 100_000 }, (_, i) => i);
await processLargeDataset(hugeList, 1000, (batch) => {
  renderBatchToDOM(batch); // 假设的渲染函数
});
```

### Service Worker Cache-First 策略

```typescript
// public/sw.ts
/// <reference lib="webworker" />

const CACHE_NAME = 'app-v1';
const PRECACHE_ASSETS = ['/index.html', '/static/main.js', '/static/styles.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache-First：优先返回缓存，同时后台更新
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cached || fetchPromise;
    })
  );
});
```

### React Compiler + useMemo 对比示例

```tsx
// 传统方式：手动记忆化
function ExpensiveChart({ data, filter }: { data: number[]; filter: string }) {
  const filtered = React.useMemo(
    () => data.filter((d) => d.toString().includes(filter)),
    [data, filter]
  );
  return <Chart data={filtered} />;
}

// React 19 + Compiler：自动记忆化，无需手动 hooks
// 只需在构建时启用 compiler，源码保持简洁
function ExpensiveChartAuto({ data, filter }: { data: number[]; filter: string }) {
  // Compiler 自动为以下计算添加记忆化
  const filtered = data.filter((d) => d.toString().includes(filter));
  return <Chart data={filtered} />;
}
```

### 图片优化与响应式加载

```typescript
// 现代图片加载策略（可运行 HTML/JS）
function createResponsiveImage(srcSet: Record<string, string>, sizes: string): HTMLImageElement {
  const img = document.createElement('img');
  img.srcset = Object.entries(srcSet)
    .map(([w, url]) => `${url} ${w}w`)
    .join(', ');
  img.sizes = sizes;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.fetchPriority = 'high';
  return img;
}

// 使用：<img srcset="small.jpg 300w, medium.jpg 600w, large.jpg 900w" sizes="(max-width: 600px) 100vw, 50vw">
```

```html
<!-- 现代格式回退：AVIF → WebP → JPEG -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="描述" width="800" height="600" loading="lazy">
</picture>
```

### 预加载与资源优先级

```html
<!-- 预连接关键域名（DNS + TLS 握手提前完成） -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预加载关键 CSS（非阻塞渲染但提前获取） -->
<link rel="preload" href="/critical.css" as="style" onload="this.rel='stylesheet'">

<!-- 预加载下一页路由（低优先级，空闲时获取） -->
<link rel="prefetch" href="/about" as="document">

<!-- ES 模块预加载 -->
<link rel="modulepreload" href="/src/app.js">
```

```typescript
// JS 动态预加载（基于用户行为预测）
function prefetchOnHover(linkEl: HTMLAnchorElement, modulePath: string) {
  let link: HTMLLinkElement | null = null;

  linkEl.addEventListener('mouseenter', () => {
    if (!link) {
      link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = modulePath;
      document.head.appendChild(link);
    }
  });
}
```

### 内存泄漏检测与修复

```typescript
// 使用 Performance Memory API 监控内存（Chrome 专用）
function logMemoryUsage() {
  const mem = (performance as any).memory;
  if (!mem) return;

  console.table({
    'Used JS Heap': `${(mem.usedJSHeapSize / 1e6).toFixed(2)} MB`,
    'Total JS Heap': `${(mem.totalJSHeapSize / 1e6).toFixed(2)} MB`,
    'JS Heap Limit': `${(mem.jsHeapSizeLimit / 1e6).toFixed(2)} MB`,
  });
}

// WeakRef + FinalizationRegistry 模式（防止缓存泄漏）
class WeakCache<K, V> {
  #cache = new Map<K, WeakRef<V>>();
  #registry = new FinalizationRegistry<K>((key) => this.#cache.delete(key));

  set(key: K, value: V) {
    this.#cache.set(key, new WeakRef(value));
    this.#registry.register(value, key);
  }

  get(key: K): V | undefined {
    const ref = this.#cache.get(key);
    return ref?.deref();
  }
}
```

---

## 参考资源

- [web.dev/performance](https://web.dev/performance) — Google 性能指南
- [web.dev/vitals](https://web.dev/vitals/) — Core Web Vitals 官方文档
- [web.dev/articles/optimize-inp](https://web.dev/articles/optimize-inp) — INP Optimization Guide
- [web.dev/articles/optimize-lcp](https://web.dev/articles/optimize-lcp) — LCP Optimization Guide
- [web.dev/articles/optimize-cls](https://web.dev/articles/optimize-cls) — CLS Optimization Guide
- [web.dev/articles/optimize-javascript-execution](https://web.dev/articles/optimize-javascript-execution) — JS 执行优化
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Chrome DevTools: Record heap snapshots](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots)
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: scheduler.yield()](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield)
- [MDN: Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [MDN: Resource Hints](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)
- [React Performance](https://react.dev/learn/render-and-commit)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Google Chrome UX Report (CrUX)](https://developer.chrome.com/docs/crux/)
- [HTTP Archive: Web Almanac](https://almanac.httparchive.org/) — 年度 Web 性能统计报告
- [Performance API Level 2 — W3C](https://w3c.github.io/perf-timing/)
- [Speculation Rules API — WICG](https://wicg.github.io/nav-speculation/speculation-rules.html)
- [Netlify Edge Functions: Caching](https://docs.netlify.com/edge-functions/api/#edge-function-cache)
- [Cloudflare Speed Optimization](https://developers.cloudflare.com/speed/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/10-css-frameworks.md`
- `20-code-lab/20.9-observability-security/performance/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*
