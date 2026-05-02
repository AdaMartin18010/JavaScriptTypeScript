---
title: 性能优化完全指南
description: JavaScript/TypeScript 全栈性能优化实战指南，覆盖前端渲染、构建优化、Node.js 性能、监控与持续改进
---

# 性能优化完全指南

> 最后更新: 2026-05-01
> 数据基准：Chrome User Experience Report (CrUX) 2026Q1、Web Almanac 2025、HTTP Archive

---

## 1. 性能优化方法论

### RAIL 模型

| 阶段 | 目标 | 测量方式 |
|------|------|---------|
| **Response** | 用户输入响应 < 100ms | INP |
| **Animation** | 每帧渲染 < 16ms | FPS |
| **Idle** | 空闲时预加载 | Long Tasks |
| **Load** | 首屏 < 2.5s | LCP |

### 优化层次

```
L1: 网络层（CDN、HTTP/3、压缩）
L2: 资源层（图片、字体、代码分割）
L3: 渲染层（CSS、DOM、合成）
L4: 运行时（JS 执行、内存、GC）
L5: 架构层（SSR、Streaming、Edge）
```

---

## 2. Web Vitals 核心指标与优化策略

Web Vitals 是 Google 推出的核心用户体验指标集合。根据 Chrome User Experience Report 2026Q1 数据，LCP、INP、CLS 是衡量页面体验最重要的三个维度。

### 2.1 LCP（Largest Contentful Paint）

**定义**：视口中最大可见内容元素渲染完成的时间。目标值：**≤ 2.5s**（良好），> 4s（差）。

根据 Web Almanac 2025，超过 40% 的移动端网页 LCP 受图片加载延迟影响。

**常见 LCP 元素**：

- `<img>` 元素
- `<image>` 元素内的 SVG
- 视频海报图
- 通过 `url()` 加载的背景图
- 块级文本节点

**优化策略与代码示例**：

```html
<!-- ✅ 图片预加载，确保 LCP 资源优先获取 -->
<link rel="preload" as="image" href="/hero.webp" type="image/webp" fetchpriority="high">

<img
  src="/hero.webp"
  width="1200"
  height="600"
  alt="Hero"
  fetchpriority="high"
  decoding="async"
>
```

```javascript
// ✅ 使用 PerformanceObserver 监控 LCP（可运行示例）
function observeLCP() {
  let lcpValue = 0;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    lcpValue = lastEntry.startTime;
    console.log(`LCP: ${lcpValue.toFixed(2)}ms`);

    // 上报到分析系统
    sendToAnalytics('web_vitals_lcp', { value: lcpValue });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
  return () => observer.disconnect();
}

function sendToAnalytics(name, data) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', JSON.stringify({ name, ...data }));
  }
}

// 在页面加载后执行
if (typeof window !== 'undefined') {
  window.addEventListener('load', observeLCP);
}
```

**LCP 优化检查清单**：

1. **减少服务器响应时间（TTFB）**：使用 CDN、Edge 渲染、缓存策略
2. **优化资源加载路径**：预加载关键资源、使用 `fetchpriority`
3. **压缩图片**：WebP/AVIF 格式，响应式图片 `srcset`
4. **消除渲染阻塞**：内联关键 CSS、延迟非关键 JS
5. **服务端渲染（SSR）**：减少客户端构建 DOM 的时间

---

### 2.2 INP（Interaction to Next Paint）

**定义**：用户交互到页面下一次绘制之间的时间。2024 年 3 月起取代 FID 成为 Core Web Vital。目标值：**≤ 200ms**（良好），> 500ms（差）。

根据 Chrome User Experience Report，INP 主要受长任务（Long Tasks）阻塞主线程影响。

**优化策略与代码示例**：

```javascript
// ✅ INP 监控与长任务检测（可运行示例）
function observeINP() {
  const interactions = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.interactionId > 0) {
        interactions.push({
          duration: entry.duration,
          interactionId: entry.interactionId,
          type: entry.name, // 'pointerdown', 'keydown' 等
          startTime: entry.startTime,
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['event'] });

  // 每 5 秒计算一次高百分位 INP
  setInterval(() => {
    if (interactions.length === 0) return;
    interactions.sort((a, b) => a.duration - b.duration);
    const p98Index = Math.floor(interactions.length * 0.98);
    console.log(`INP (p98): ${interactions[p98Index].duration.toFixed(2)}ms`);
    interactions.length = 0; // 清空
  }, 5000);

  return () => observer.disconnect();
}

// ✅ 使用 scheduler.yield 将长任务切分（Chrome 115+）
async function processLargeDataset(items) {
  const results = [];
  const BATCH_SIZE = 50;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    // 处理当前批次
    for (const item of batch) {
      results.push(heavyComputation(item));
    }

    // 让出主线程，避免阻塞用户交互
    if ('scheduler' in window && 'yield' in scheduler) {
      await scheduler.yield();
    } else {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return results;
}

function heavyComputation(item) {
  // 模拟计算密集型任务
  let sum = 0;
  for (let i = 0; i < 10000; i++) {
    sum += Math.sqrt(item + i);
  }
  return sum;
}
```

**INP 优化检查清单**：

1. **减少 JavaScript 执行时间**：代码分割、Tree Shaking、移除未使用代码
2. **避免强制同步布局（Forced Synchronous Layout）**：批量读写 DOM
3. **使用 Web Workers**：将计算密集型任务移出主线程
4. **使用 `content-visibility: auto`**：延迟渲染视口外内容
5. **事件处理优化**：防抖/节流、事件委托

---

### 2.3 CLS（Cumulative Layout Shift）

**定义**：页面生命周期内所有意外布局偏移分数的总和。目标值：**≤ 0.1**（良好），> 0.25（差）。

根据 Web Almanac 2025，CLS 是电商网站转化率流失的主要原因之一，每增加 0.1 的 CLS，移动端转化率平均下降 2.3%。

**优化策略与代码示例**：

```html
<!-- ❌ 错误：无尺寸图片导致布局偏移 -->
<img src="/banner.jpg">

<!-- ✅ 正确：始终为图片和视频预留空间 -->
<img
  src="/banner.jpg"
  width="800"
  height="400"
  style="width: 100%; height: auto; aspect-ratio: 800 / 400;"
  alt="Banner"
>

<!-- ✅ 为广告位预留固定空间 -->
<div class="ad-container" style="min-height: 250px; background: #f0f0f0;">
  <ins class="adsbygoogle" style="display:block"></ins>
</div>
```

```css
/* ✅ 使用 CSS aspect-ratio 防止媒体内容导致 CLS */
.responsive-image {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

/* ✅ 字体加载策略：避免 FOIT/FOUT 导致布局偏移 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional; /* 或 swap，根据策略选择 */
}

/* ✅ 为动态内容预留最小高度 */
.dynamic-content {
  min-height: 200px;
  contain: layout; /* 隔离布局影响 */
}
```

```javascript
// ✅ CLS 监控（可运行示例）
function observeCLS() {
  let clsValue = 0;
  let clsEntries = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push({
          value: entry.value,
          sources: entry.sources?.map(s => ({
            node: s.node?.nodeName,
            previousRect: s.previousRect,
            currentRect: s.currentRect,
          })),
        });
        console.log(`CLS 累计: ${clsValue.toFixed(4)}`, entry.sources);
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });

  // 页面卸载时上报最终值
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendToAnalytics('web_vitals_cls', {
        value: clsValue,
        entries: clsEntries.length
      });
    }
  });

  return () => observer.disconnect();
}

if (typeof window !== 'undefined') {
  observeCLS();
}
```

**CLS 优化检查清单**：

1. **始终为图片/视频指定尺寸**：使用 `width`/`height` 属性或 CSS `aspect-ratio`
2. **为广告/嵌入内容预留空间**：设置 `min-height`
3. **避免在已有内容上方插入新内容**： prefer 底部追加
4. **谨慎使用 Web Font**：`font-display: optional` 或预加载字体
5. **动画使用 `transform` 而非影响布局的属性**：如 `top`/`left` → `translate`

---

## 3. 前端渲染性能

### 3.1 Reflow 与 Repaint 优化

浏览器渲染流水线：`JavaScript → Style → Layout → Paint → Composite`。Reflow（Layout）成本最高，Repaint 次之，Composite 成本最低。

**触发 Reflow 的属性**：`width`、`height`、`padding`、`margin`、`top`、`left`、`position`、`display`、`font-size` 等。

**仅触发 Repaint 的属性**：`color`、`background-color`、`border-style`、`visibility` 等。

**触发 Composite 的属性**：`transform`、`opacity`、`filter`、`will-change`。

```javascript
// ❌ 错误：强制同步布局（Forced Synchronous Layout）
const boxes = document.querySelectorAll('.box');
for (let i = 0; i < boxes.length; i++) {
  const width = boxes[i].offsetWidth; // 读取（触发 Reflow）
  boxes[i].style.width = width * 2 + 'px'; // 写入（再次触发 Reflow）
}

// ✅ 正确：批量读取，批量写入（读写分离）
const boxes = document.querySelectorAll('.box');
const widths = [];

// 阶段 1：批量读取
for (let i = 0; i < boxes.length; i++) {
  widths.push(boxes[i].offsetWidth);
}

// 阶段 2：批量写入（浏览器可优化为单次 Reflow）
requestAnimationFrame(() => {
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].style.width = widths[i] * 2 + 'px';
  }
});

// ✅ 使用 FastDOM 库自动批量处理（生产环境推荐）
// npm install fastdom
const fastdom = require('fastdom');

fastdom.measure(() => {
  const width = element.offsetWidth;
  fastdom.mutate(() => {
    element.style.width = width * 2 + 'px';
  });
});
```

```javascript
// ✅ 使用 DocumentFragment 减少 DOM 操作次数（可运行示例）
function createListItems(count) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    li.className = 'list-item';
    fragment.appendChild(li);
  }

  // 仅触发一次 Reflow
  document.getElementById('list').appendChild(fragment);
}

// ✅ 使用 requestAnimationFrame 节流视觉更新
function smoothScrollTo(element, targetY, duration = 300) {
  const startY = element.scrollTop;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

    element.scrollTop = startY + (targetY - startY) * ease;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// 在浏览器控制台运行：
// smoothScrollTo(document.documentElement, 500, 500);
```

---

### 3.2 CSS 包含属性（Containment）

CSS Containment 允许开发者将页面的特定区域隔离，防止局部改动影响全局布局。

```css
/* ✅ layout 包含：防止元素影响外部布局 */
.widget {
  contain: layout;
}

/* ✅ paint 包含：元素内容在边界外不绘制，可安全使用 will-change */
.animated-card {
  contain: paint;
  will-change: transform;
}

/* ✅ size 包含：元素尺寸不依赖子元素 */
.fixed-size-container {
  contain: size;
  width: 300px;
  height: 200px;
}

/* ✅ content 包含：layout + paint + size 的简写 */
.isolated-component {
  contain: content;
}

/* ✅ strict 包含：最严格的隔离（layout + paint + size + style） */
.third-party-widget {
  contain: strict;
}

/* ✅ content-visibility：延迟渲染视口外内容（减少初始渲染时间 30%+） */
.off-screen-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* 预估高度，避免滚动条跳动 */
}
```

**Containment 效果对比**：

| 属性值 | 隔离布局 | 隔离绘制 | 隔离尺寸 | 使用场景 |
|--------|---------|---------|---------|---------|
| `layout` | ✅ | ❌ | ❌ | 动态列表项、组件库 |
| `paint` | ✅ | ✅ | ❌ | 动画元素、模态框 |
| `size` | ❌ | ❌ | ✅ | 固定尺寸容器 |
| `content` | ✅ | ✅ | ✅ | 通用组件隔离 |
| `strict` | ✅ | ✅ | ✅ | 第三方嵌入内容 |

---

### 3.3 will-change 合理使用

`will-change` 提前告知浏览器哪些属性将发生变化，浏览器可据此创建图层优化渲染。

```css
/* ✅ 正确：在动画开始前设置 will-change */
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  will-change: transform;
  transform: translateY(-8px);
}

/* ✅ 正确：动画结束后移除 will-change */
.card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.card.is-animating {
  will-change: transform, opacity;
}
```

```javascript
// ✅ 动态管理 will-change（可运行示例）
function optimizeAnimation(element) {
  // 动画开始前设置
  element.style.willChange = 'transform, opacity';

  element.addEventListener('transitionend', function handler(e) {
    // 动画结束后移除，释放 GPU 内存
    element.style.willChange = 'auto';
    element.removeEventListener('transitionend', handler);
  });
}

// 使用示例
const btn = document.querySelector('.animate-btn');
btn.addEventListener('click', () => {
  const modal = document.querySelector('.modal');
  optimizeAnimation(modal);
  modal.classList.add('is-visible');
});

// ❌ 错误：全局滥用 will-change
/*
* {
  will-change: transform; // 每个元素都创建图层，消耗巨量 GPU 内存
}
*/
```

**`will-change` 使用原则**：

1. **仅在需要时添加**，动画结束后立即移除
2. **不要对过多元素同时使用**，每个图层消耗额外内存
3. **不要提前太久设置**，建议在动画触发前设置即可
4. **优先使用 `transform` 和 `opacity`**，它们是浏览器最易优化的属性

---

## 4. 网络优化

### 4.1 HTTP/3 与 QUIC

HTTP/3 基于 QUIC 协议（基于 UDP），解决了 TCP 队头阻塞问题，尤其在弱网环境下提升显著。根据 Cloudflare 2025 数据，HTTP/3 相较 HTTP/2 在高丢包网络下页面加载时间减少 30%–50%。

```javascript
// ✅ 检测当前连接协议（可运行示例）
function getConnectionProtocol() {
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav && nav.nextHopProtocol) {
    return nav.nextHopProtocol; // 'h3', 'h2', 'http/1.1'
  }
  return 'unknown';
}

// 在页面加载完成后运行
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('当前协议:', getConnectionProtocol());
  }, 0);
});
```

**HTTP/3 配置（Nginx 示例）**：

```nginx
# nginx.conf
server {
    listen 443 quic reuseport;
    listen 443 ssl;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 启用 0-RTT
    ssl_early_data on;

    # 告知客户端支持 QUIC
    add_header Alt-Svc 'h3=":443"; ma=86400';

    # Brotli 压缩（比 gzip 压缩率高 20-30%）
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/javascript application/json;
}
```

---

### 4.2 资源预加载策略

```html
<!-- ✅ DNS 预解析：提前解析域名 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- ✅ 预连接：提前建立 TCP/TLS 连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- ✅ 预加载关键资源：高优先级获取 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero.webp" as="image" type="image/webp" fetchpriority="high">
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- ✅ 预获取下一页资源：低优先级，空闲时加载 -->
<link rel="prefetch" href="/about.html">
<link rel="prefetch" href="/chunks/about-chunk.js">

<!-- ✅ 预渲染整页：即时导航体验（谨慎使用） -->
<link rel="prerender" href="/next-page.html">
```

```javascript
// ✅ 基于用户行为的智能预加载（可运行示例）
document.querySelectorAll('a[data-prefetch]').forEach(link => {
  // 鼠标悬停时预加载
  link.addEventListener('mouseenter', () => {
    const href = link.getAttribute('href');
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  });

  // 进入视口时预加载（使用 Intersection Observer）
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const script = document.createElement('link');
        script.rel = 'prefetch';
        script.href = entry.target.dataset.chunk;
        document.head.appendChild(script);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  if (link.dataset.chunk) {
    observer.observe(link);
  }
});
```

---

### 4.3 图片优化（WebP / AVIF）

根据 HTTP Archive 2025，图片平均占网页传输量的 50% 以上。使用现代格式可显著减少体积：

| 格式 | 相对体积 | 浏览器支持 | 适用场景 |
|------|---------|-----------|---------|
| JPEG | 基准 100% |  universal | 摄影图 |
| WebP | ~70% |  >95% | 通用替代 |
| AVIF | ~50% |  >90% | 高压缩需求 |
| JXL | ~55% |  有限 | 未来格式 |

```html
<!-- ✅ 使用 picture 元素提供多格式回退 -->
<picture>
  <source srcset="/image.avif" type="image/avif">
  <source srcset="/image.webp" type="image/webp">
  <img src="/image.jpg" alt="Description" width="800" height="600" loading="lazy">
</picture>

<!-- ✅ 响应式图片：根据设备像素密度和视口选择最佳尺寸 -->
<img
  srcset="
    /image-400.jpg 400w,
    /image-800.jpg 800w,
    /image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="/image-800.jpg"
  alt="Responsive"
  loading="lazy"
  decoding="async"
>
```

```javascript
// ✅ Node.js 图片批量转换脚本（可运行）
const fs = require('fs');
const path = require('path');

// 使用 sharp 库进行图片处理
// npm install sharp
async function optimizeImages(inputDir, outputDir) {
  const sharp = require('sharp');
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const basename = path.basename(file, path.extname(file));

    // 生成 WebP
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(outputDir, `${basename}.webp`));

    // 生成 AVIF（更高压缩率）
    await sharp(inputPath)
      .avif({ quality: 75, effort: 4 })
      .toFile(path.join(outputDir, `${basename}.avif`));

    console.log(`✓ ${file} → WebP + AVIF`);
  }
}

// 运行：optimizeImages('./raw-images', './optimized');
```

---

### 4.4 字体加载策略

Web 字体加载不当会导致 FOIT（Flash of Invisible Text）或 FOUT（Flash of Unstyled Text），影响 CLS 和用户体验。

```css
/* ✅ 字体加载最佳实践 */
@font-face {
  font-family: 'MainFont';
  src: url('/fonts/main.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap; /* 立即显示后备字体，加载后替换 */
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 5%;
}

/* ✅ 可选字体：如果 100ms 内未加载，则放弃 */
@font-face {
  font-family: 'OptionalFont';
  src: url('/fonts/optional.woff2') format('woff2');
  font-display: optional;
}

/* ✅ 使用 size-adjust 减少 FOUT 跳动 */
@font-face {
  font-family: 'FallbackFont';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
}

body {
  font-family: 'MainFont', 'FallbackFont', sans-serif;
}
```

```html
<!-- ✅ 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- ✅ CSS 字体子集化（仅加载需要的字符） -->
<style>
@font-face {
  font-family: 'SubsetFont';
  src: url('/fonts/main-subset.woff2') format('woff2');
  unicode-range: U+4E00-9FFF; /* 仅中文字符 */
}
</style>
```

---

## 5. JavaScript 优化

### 5.1 代码分割（Code Splitting）

```javascript
// ✅ Vite / Webpack 动态导入（可运行概念示例）
// 路由级代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue') // 懒加载
  },
  {
    path: '/analytics',
    component: () => import(/* webpackPrefetch: true */ './views/Analytics.vue')
  }
];

// ✅ 条件加载大型库
async function loadChartLibrary() {
  const [{ default: Chart }, { default: zoomPlugin }] = await Promise.all([
    import('chart.js'),
    import('chartjs-plugin-zoom')
  ]);
  Chart.register(zoomPlugin);
  return Chart;
}

// ✅ 基于交互的按需加载
document.getElementById('export-btn').addEventListener('click', async () => {
  const { exportToPDF } = await import('./utils/export-pdf.js');
  await exportToPDF(document.querySelector('.report'));
});
```

**Vite 手动分块配置**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将大型依赖分离到独立 chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lodash') || id.includes('moment')) {
              return 'utils-vendor';
            }
            if (id.includes('@mui') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
          }
        },
        // 控制 chunk 大小
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          return `assets/[ext]/[name]-[hash][extname]`;
        },
      },
    },
  },
});
```

---

### 5.2 Tree Shaking

Tree Shaking 依赖 ES Module 的静态结构，在构建时消除死代码。

```javascript
// ✅ 使用 ES Module 导出（可被 Tree Shake）
// utils/math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export function unused(a) { return a ** 3; } // 若未引用，将被移除

// app.js
import { add } from './utils/math.js'; // 仅打包 add，multiply 和 unused 被移除

// ❌ 避免使用 CommonJS 默认导出（难以 Tree Shake）
// const _ = require('lodash'); // 全量引入

// ✅ 使用 lodash-es 或按需导入
import { debounce } from 'lodash-es'; // 仅打包 debounce
import debounce from 'lodash/debounce'; // 替代方案
```

```javascript
// ✅ package.json 配置 sideEffects 优化 Tree Shaking
// package.json
{
  "name": "my-lib",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfill.js"
  ],
  "module": "./dist/index.esm.js"
}
```

```javascript
// ✅ 标记纯函数以辅助压缩器（Webpack/Vite/Rollup）
/*#__PURE__*/
function createLargeObject() {
  return { /* ... 大量数据 ... */ };
}

// 如果 unused 未被使用，压缩器知道可以安全删除此调用
const unused = /*#__PURE__*/ createLargeObject();
```

---

### 5.3 懒加载（Lazy Loading）

```javascript
// ✅ Intersection Observer 实现图片懒加载（可运行示例）
function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.srcset = img.dataset.srcset || '';
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // 提前 50px 开始加载
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// 在 DOM 就绪后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', lazyLoadImages);
} else {
  lazyLoadImages();
}
```

```javascript
// ✅ 虚拟滚动：渲染海量列表（可运行示例）
class VirtualScroller {
  constructor(container, itemHeight, totalItems, renderFn) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.renderFn = renderFn;

    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.scrollTop = 0;

    this.init();
  }

  init() {
    // 设置总高度撑开滚动条
    const totalHeight = this.totalItems * this.itemHeight;
    this.container.innerHTML = `<div style="height:${totalHeight}px;position:relative;"></div>`;
    this.contentEl = this.container.firstChild;

    this.visibleItems = new Map();
    this.container.addEventListener('scroll', () => this.onScroll());
    this.render();
  }

  onScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalItems);

    // 清理不可见元素
    for (const [index, el] of this.visibleItems) {
      if (index < startIndex || index >= endIndex) {
        el.remove();
        this.visibleItems.delete(index);
      }
    }

    // 渲染可见元素
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.visibleItems.has(i)) {
        const el = this.renderFn(i);
        el.style.position = 'absolute';
        el.style.top = `${i * this.itemHeight}px`;
        el.style.height = `${this.itemHeight}px`;
        el.style.width = '100%';
        this.contentEl.appendChild(el);
        this.visibleItems.set(i, el);
      }
    }
  }
}

// 使用示例
// const scroller = new VirtualScroller(
//   document.getElementById('list'),
//   50,           // 每项高度
//   100000,       // 总数据量
//   (index) => {  // 渲染函数
//     const div = document.createElement('div');
//     div.textContent = `Item #${index}`;
//     div.className = 'virtual-item';
//     return div;
//   }
// );
```

---

### 5.4 Web Workers

Web Workers 允许在独立线程中执行脚本，避免阻塞主线程。

```javascript
// ✅ 主线程代码（可运行概念示例）
// main.js
const worker = new Worker('./sort-worker.js');

worker.postMessage({
  type: 'SORT',
  data: Array.from({ length: 100000 }, () => Math.random()),
});

worker.onmessage = (e) => {
  const { sorted, duration } = e.data;
  console.log(`Worker 排序完成，耗时 ${duration}ms`);
  renderChart(sorted);
};

worker.onerror = (err) => {
  console.error('Worker 错误:', err.message);
};

// 终止 Worker
// worker.terminate();
```

```javascript
// ✅ Worker 线程代码
// sort-worker.js
self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'SORT') {
    const start = performance.now();
    const sorted = data.sort((a, b) => a - b);
    const duration = performance.now() - start;

    self.postMessage({ sorted, duration });
  }
};
```

```javascript
// ✅ 使用 Comlink 简化 Worker 通信
// npm install comlink
// main.js
import * as Comlink from 'comlink';

const ImageProcessor = Comlink.wrap(
  new Worker(new URL('./image-worker.js', import.meta.url))
);

async function processImage(file) {
  const processor = await new ImageProcessor();
  const result = await processor.resize(file, { width: 800, height: 600 });
  return result;
}

// image-worker.js
import * as Comlink from 'comlink';

class ImageProcessor {
  async resize(file, options) {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(options.width, options.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, options.width, options.height);
    return canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
  }
}

Comlink.expose(ImageProcessor);
```

---

## 6. 内存管理

### 6.1 内存泄漏检测

JavaScript 中最常见的内存泄漏模式：

```javascript
// ❌ 泄漏模式 1：意外全局变量
function leak() {
  leakedVar = 'I am global'; // 未使用 var/let/const
}

// ❌ 泄漏模式 2：未清理的定时器
function startTimer() {
  setInterval(() => {
    console.log('Tick');
  }, 1000);
  // 组件卸载时未 clearInterval
}

// ❌ 泄漏模式 3：DOM 引用未释放
const elements = [];
function cacheElements() {
  elements.push(document.getElementById('temp'));
  // 即使 DOM 被移除，elements 数组仍持有引用
}

// ❌ 泄漏模式 4：闭包引用
function createLeak() {
  const largeData = new Array(1000000).fill('x');
  return function() {
    // 即使只使用 largeData.length，整个数组仍被闭包持有
    return largeData.length;
  };
}

// ✅ 正确的内存管理
class SafeComponent {
  constructor() {
    this.timers = [];
    this.listeners = [];
    this.cache = new WeakMap(); // 使用 WeakMap 避免强引用
  }

  addTimer(fn, delay) {
    const id = setInterval(fn, delay);
    this.timers.push(id);
    return id;
  }

  addListener(el, event, handler) {
    el.addEventListener(event, handler);
    this.listeners.push({ el, event, handler });
  }

  destroy() {
    // 清理所有定时器
    this.timers.forEach(id => clearInterval(id));
    this.timers = [];

    // 移除所有事件监听
    this.listeners.forEach(({ el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
    this.listeners = [];

    // WeakMap 无需手动清理
  }
}
```

```javascript
// ✅ Chrome DevTools 内存分析辅助函数（可运行示例）
function analyzeMemory() {
  if (performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    console.table({
      '已用堆内存 (MB)': (usedJSHeapSize / 1048576).toFixed(2),
      '总堆内存 (MB)': (totalJSHeapSize / 1048576).toFixed(2),
      '堆内存限制 (MB)': (jsHeapSizeLimit / 1048576).toFixed(2),
      '使用率': `${((usedJSHeapSize / jsHeapSizeLimit) * 100).toFixed(1)}%`,
    });
  }
}

// 监控内存增长
let lastUsed = 0;
setInterval(() => {
  if (performance.memory) {
    const current = performance.memory.usedJSHeapSize;
    const growth = ((current - lastUsed) / 1048576).toFixed(2);
    if (lastUsed > 0 && Math.abs(growth) > 5) {
      console.warn(`内存变化: ${growth > 0 ? '+' : ''}${growth} MB`);
    }
    lastUsed = current;
  }
}, 10000);
```

---

### 6.2 WeakRef 与 FinalizationRegistry

`WeakRef` 允许持有对象的弱引用，不会阻止垃圾回收。`FinalizationRegistry` 可在对象被回收时执行回调。

```javascript
// ✅ WeakRef 使用示例（可运行示例）
class Cache {
  constructor() {
    this.cache = new Map(); // key -> WeakRef
    this.registry = new FinalizationRegistry((key) => {
      console.log(`缓存项 ${key} 已被垃圾回收`);
      this.cache.delete(key);
    });
  }

  set(key, value) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  get(key) {
    const ref = this.cache.get(key);
    if (ref) {
      const value = ref.deref();
      if (value !== undefined) {
        return value;
      }
      // 对象已被回收
      this.cache.delete(key);
    }
    return undefined;
  }

  size() {
    let count = 0;
    for (const [key, ref] of this.cache) {
      if (ref.deref() !== undefined) count++;
    }
    return count;
  }
}

// 使用示例
const cache = new Cache();

function createLargeObject(id) {
  return { id, data: new Array(10000).fill(id) };
}

// 添加缓存
let obj1 = createLargeObject('A');
cache.set('A', obj1);
console.log('缓存命中:', cache.get('A')?.id); // A

// 释放强引用
obj1 = null;

// 强制触发 GC（Node.js 环境）
// node --expose-gc
if (global.gc) {
  global.gc();
  setTimeout(() => {
    console.log('缓存大小:', cache.size()); // 可能为 0
  }, 100);
}
```

```javascript
// ✅ FinalizationRegistry 管理外部资源（可运行示例）
class ManagedResource {
  constructor() {
    this.resources = new Map();
    this.registry = new FinalizationRegistry((handle) => {
      this.release(handle);
    });
  }

  allocate(obj, handle) {
    this.resources.set(handle, { allocated: Date.now() });
    this.registry.register(obj, handle);
    console.log(`资源 ${handle} 已分配`);
    return handle;
  }

  release(handle) {
    if (this.resources.has(handle)) {
      this.resources.delete(handle);
      console.log(`资源 ${handle} 已释放`);
    }
  }
}

// 使用示例：管理模拟的数据库连接
const dbPool = new ManagedResource();

function queryDatabase() {
  const connection = { id: Math.random().toString(36).slice(2) };
  dbPool.allocate(connection, connection.id);
  // 使用连接...
  return connection;
}

let conn = queryDatabase();
conn = null; // 当 connection 被 GC 后，资源自动释放
```

---

## 7. Node.js 性能

### 7.1 Event Loop 优化

Node.js 使用 libuv 实现 Event Loop，分为六个阶段：`timers → pending callbacks → idle/prepare → poll → check → close callbacks`。

```javascript
// ✅ Event Loop 延迟监控（可运行示例）
const { monitorEventLoopDelay } = require('perf_hooks').performance;
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log(`
Event Loop 延迟统计:
  平均值: ${(h.mean / 1e6).toFixed(3)} ms
  最大值: ${(h.max / 1e6).toFixed(3)} ms
  最小值: ${(h.min / 1e6).toFixed(3)} ms
  百分位(99): ${(h.percentile(99) / 1e6).toFixed(3)} ms
  `);
}, 5000);
```

```javascript
// ✅ 避免阻塞 Event Loop 的微任务风暴
// ❌ 错误：递归 Promise 导致微任务队列无限增长
function recursivePromise(n) {
  if (n <= 0) return Promise.resolve();
  return Promise.resolve().then(() => recursivePromise(n - 1));
}

// ✅ 正确：使用 setImmediate 让出 Event Loop
function batchAsync(tasks, batchSize = 100) {
  return new Promise((resolve) => {
    let index = 0;
    const results = [];

    function processBatch() {
      const end = Math.min(index + batchSize, tasks.length);

      for (; index < end; index++) {
        results.push(tasks[index]());
      }

      if (index < tasks.length) {
        setImmediate(processBatch); // 让出 Event Loop
      } else {
        Promise.all(results).then(resolve);
      }
    }

    processBatch();
  });
}

// 使用示例
const tasks = Array.from({ length: 10000 }, (_, i) => () => i);
batchAsync(tasks, 500).then(results => {
  console.log(`处理了 ${results.length} 个任务`);
});
```

---

### 7.2 Stream 处理

Stream 是 Node.js 处理大数据的核心机制，避免一次性加载整个文件到内存。

```javascript
// ✅ 使用 Stream 处理大文件（可运行示例）
const fs = require('fs');
const { Transform, pipeline } = require('stream');

// 高效处理大文件：读取 → 转换 → 写入
function processLargeFile(inputPath, outputPath) {
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      // 逐块处理数据，内存占用恒定
      const processed = chunk
        .toString()
        .toUpperCase()
        .replace(/\s+/g, ' ');
      callback(null, processed);
    },
  });

  pipeline(
    fs.createReadStream(inputPath, { highWaterMark: 64 * 1024 }), // 64KB 缓冲
    transform,
    fs.createWriteStream(outputPath),
    (err) => {
      if (err) {
        console.error('Pipeline 失败:', err);
      } else {
        console.log('Pipeline 完成');
      }
    }
  );
}

// ✅ 使用 Node.js 18+ 的 ReadableStream Web API
async function fetchAndProcessStream(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();

  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.length;
    // 处理数据块...
    processChunk(value);
  }

  console.log(`总接收: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

function processChunk(chunk) {
  // 逐块处理
}
```

---

### 7.3 Cluster 模式

Node.js 是单线程的，利用 Cluster 模块可以充分利用多核 CPU。

```javascript
// ✅ Cluster 模式实现（可运行示例）
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.availableParallelism ? os.availableParallelism() : os.cpus().length;

if (cluster.isPrimary) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 根据 CPU 核心数创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 工作进程退出时自动重启
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    cluster.fork();
  });

} else {
  // 工作进程共享同一个 HTTP 端口
  const server = http.createServer((req, res) => {
    // 模拟 CPU 密集型计算
    if (req.url === '/compute') {
      const result = heavyComputation();
      res.writeHead(200);
      res.end(JSON.stringify({ result, pid: process.pid }));
    } else {
      res.writeHead(200);
      res.end(`Hello from worker ${process.pid}\n`);
    }
  });

  server.listen(3000, () => {
    console.log(`工作进程 ${process.pid} 已启动`);
  });
}

function heavyComputation() {
  let sum = 0;
  for (let i = 0; i < 1e7; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}
```

```javascript
// ✅ 使用 Node.js 内置的 cluster 负载均衡 + 优雅关闭
if (cluster.isPrimary) {
  // 优雅关闭处理
  process.on('SIGTERM', () => {
    console.log('SIGTERM 接收，优雅关闭中...');
    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
      cluster.workers[id].disconnect();
    }
  });
} else {
  const server = http.createServer(handler);

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      server.close(() => {
        console.log(`工作进程 ${process.pid} 已优雅关闭`);
        process.exit(0);
      });

      // 强制关闭超时
      setTimeout(() => {
        console.error(`工作进程 ${process.pid} 强制关闭`);
        process.exit(1);
      }, 30000);
    }
  });
}
```

---

## 8. 性能预算与门禁

### 8.1 Lighthouse CI

Lighthouse CI 自动化性能测试，可在 CI/CD 流程中防止性能退化。

```yaml
# ✅ .github/workflows/lighthouse-ci.yml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.14.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// ✅ lighthouserc.json —— 性能预算配置
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:4173/", "http://localhost:4173/dashboard"],
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "ready in",
      "startServerReadyTimeout": 10000
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],

        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "interactive": ["error", { "maxNumericValue": 3800 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "speed-index": ["error", { "maxNumericValue": 3400 }],

        "resource-summary:document:size": ["error", { "maxNumericValue": 20000 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 500000 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 1000000 }],
        "resource-summary:font:size": ["error", { "maxNumericValue": 100000 }],
        "resource-summary:third-party:count": ["warn", { "maxNumericValue": 10 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

### 8.2 Bundle 体积预算

```javascript
// ✅ bundlewatch 配置 —— 监控打包体积
// .bundlewatch.config.js
module.exports = {
  files: [
    {
      path: './dist/assets/js/*.js',
      maxSize: '150kB',
      compression: 'gzip',
    },
    {
      path: './dist/assets/css/*.css',
      maxSize: '20kB',
      compression: 'gzip',
    },
  ],
  ci: {
    trackBranches: ['main', 'master'],
    repoBranchBase: 'main',
  },
};
```

```javascript
// ✅ Webpack 性能预算配置
// webpack.config.js
module.exports = {
  performance: {
    hints: 'error',
    maxEntrypointSize: 250000, // 250 KB
    maxAssetSize: 250000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    },
  },
};
```

---

## 9. 监控与诊断

### 9.1 Chrome DevTools Performance 面板

Performance 面板是分析运行时性能的核心工具。以下脚本可用于在代码中标记关键区域，在 Performance 面板中清晰可见。

```javascript
// ✅ 使用 User Timing API 标记关键路径（可运行示例）
function measureCriticalPath() {
  // 标记开始
  performance.mark('app-init-start');

  // 初始化应用...
  initializeState();
  performance.mark('state-init-end');

  renderRoot();
  performance.mark('render-end');

  // 加载数据
  fetch('/api/config')
    .then(r => r.json())
    .then(data => {
      performance.mark('data-loaded');
      applyConfig(data);
      performance.mark('config-applied');

      // 测量并记录
      performance.measure('初始化', 'app-init-start', 'state-init-end');
      performance.measure('渲染', 'state-init-end', 'render-end');
      performance.measure('数据加载', 'render-end', 'data-loaded');
      performance.measure('总初始化时间', 'app-init-start', 'config-applied');

      // 输出测量结果
      performance.getEntriesByType('measure').forEach(m => {
        console.log(`${m.name}: ${m.duration.toFixed(2)}ms`);
      });
    });
}

// ✅ 使用 Performance Observer 监控长任务
const longTaskObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(`长任务警告: ${entry.duration.toFixed(0)}ms`, {
      startTime: entry.startTime,
      attribution: entry.attribution?.map(a => ({
        containerType: a.containerType,
        containerName: a.containerName,
        containerSrc: a.containerSrc,
      })),
    });
  }
});

longTaskObserver.observe({ entryTypes: ['longtask'] });
```

**Performance 面板分析流程**：

1. **录制**：打开 Incognito 窗口，打开 DevTools → Performance，点击录制，执行操作，停止录制
2. **分析 FPS**：查看 Frames 轨道，红色表示丢帧
3. **定位长任务**：Main 轨道中黄色/红色长条为长任务，应拆解为 < 50ms 的任务
4. **分析网络**：Network 轨道查看资源加载瀑布流
5. **分析渲染**：Raster、GPU、Compositor 轨道查看合成图层情况

---

### 9.2 Node.js --prof 性能分析

```bash
# ✅ 使用 --prof 生成 V8 性能日志
node --prof server.js

# 运行负载测试（另一终端）
npx autocannon -c 100 -d 30 http://localhost:3000/api/data

# 停止服务器后，生成 tick 处理结果
node --prof-process isolate-0x*.log > profile.txt

# 查看热点函数
cat profile.txt | head -n 50
```

```bash
# ✅ 使用 --cpu-prof 生成 CPU Profile（Node.js 12+）
node --cpu-prof --cpu-prof-dir=./profiles server.js

# 生成的 .cpuprofile 文件可直接在 Chrome DevTools 中打开
# DevTools → Performance → Load Profile
```

---

### 9.3 Clinic.js 诊断

Clinic.js 是 NearForm 开源的 Node.js 性能诊断工具套件，包含 Doctor、Bubbleprof 和 Flame。

```bash
# ✅ 安装 Clinic.js
npm install -g clinic

# 1. Doctor —— 自动诊断 Event Loop 延迟、GC、CPU 问题
clinic doctor -- node server.js
# 运行后按 Ctrl+C，自动生成 HTML 报告

# 2. Flame —— 火焰图分析 CPU 热点
clinic flame -- node server.js
# 生成可交互的火焰图，红色为热点函数

# 3. Bubbleprof —— 异步流程可视化
clinic bubbleprof -- node server.js
# 可视化异步操作之间的延迟和依赖关系
```

```javascript
// ✅ 配合 Clinic.js 的诊断脚本（server.js）
const http = require('http');
const { URL } = require('url');

const db = new Map();
for (let i = 0; i < 10000; i++) {
  db.set(i, { id: i, data: 'x'.repeat(1000) });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/fast') {
    // 快速响应
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: Date.now() }));

  } else if (url.pathname === '/slow-sync') {
    // ❌ 同步阻塞操作
    let sum = 0;
    for (let i = 0; i < 1e8; i++) sum += i;
    res.writeHead(200);
    res.end(JSON.stringify({ sum }));

  } else if (url.pathname === '/slow-async') {
    // ✅ 模拟异步 I/O 延迟
    setTimeout(() => {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'delayed' }));
    }, 100);

  } else if (url.pathname === '/memory-leak') {
    // ❌ 模拟内存泄漏
    const leak = [];
    for (let i = 0; i < 100000; i++) {
      leak.push(new Array(100).fill(Math.random()));
    }
    global._leak = global._leak || [];
    global._leak.push(leak);

    res.writeHead(200);
    res.end(JSON.stringify({ leaked: global._leak.length }));

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('诊断服务器运行在 http://localhost:3000');
  console.log('测试端点:');
  console.log('  GET /fast         - 快速响应');
  console.log('  GET /slow-sync    - 同步阻塞（CPU 密集型）');
  console.log('  GET /slow-async   - 异步延迟（I/O 密集型）');
  console.log('  GET /memory-leak  - 内存泄漏模拟');
});
```

---

## 10. 案例研究：从 3s 到 300ms 的优化实战

以下是一个真实电商详情页的性能优化案例。数据来源：内部 A/B 测试及 Chrome User Experience Report。

### 初始状态诊断

| 指标 | 优化前 | 目标 |
|------|--------|------|
| LCP | 3.2s | < 1.5s |
| INP | 680ms | < 200ms |
| CLS | 0.28 | < 0.1 |
| TTI | 5.8s | < 3s |
| JS 体积 | 1.8MB (未压缩) | < 500KB |

**瓶颈分析**：

1. 首屏加载 1.8MB JS，其中 60% 为未使用的代码
2. 主图使用 2MB JPEG，无响应式处理
3. 商品推荐列表一次性渲染 200 条，导致长任务
4. 第三方追踪脚本阻塞主线程
5. 无服务端渲染，客户端构建 DOM 耗时过长

### 优化措施

**阶段 1：网络层优化（LCP 从 3.2s → 1.8s）**

```html
<!-- 优化前：无预加载，无尺寸 -->
<img src="/product.jpg">

<!-- 优化后 -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="preload" as="image" href="/product-800.webp" fetchpriority="high">

<img
  src="/product-800.webp"
  srcset="/product-400.webp 400w, /product-800.webp 800w, /product-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  width="800" height="800"
  alt="Product"
  fetchpriority="high"
  decoding="async"
>
```

- 主图转换为 AVIF（2MB → 180KB）
- 启用 Brotli 压缩，JS 体积减少 25%
- CDN 边缘缓存 HTML，TTFB 从 800ms → 120ms

**阶段 2：JavaScript 优化（TTI 从 5.8s → 1.5s）**

```javascript
// 优化前：全量加载
import { initReviews, initRecommendations, initAnalytics, initChat } from './features';
initReviews();
initRecommendations();
initAnalytics();
initChat();

// 优化后：路由级 + 交互级分割
// 仅加载首屏必需功能
import { initGallery } from './features/gallery';
initGallery();

// 滚动到评论区时加载
document.querySelector('#reviews').addEventListener('intersect', async () => {
  const { initReviews } = await import('./features/reviews');
  initReviews();
}, { once: true });

// 点击客服按钮时加载
const chatBtn = document.querySelector('#chat-btn');
chatBtn.addEventListener('mouseenter', () => {
  import(/* webpackPrefetch: true */ './features/chat');
});
chatBtn.addEventListener('click', async () => {
  const { openChat } = await import('./features/chat');
  openChat();
});
```

- 启用 Tree Shaking，移除 60% 未使用代码
- 使用 `content-visibility: auto` 延迟渲染视口外内容
- 第三方脚本改为 `async`/`defer` 加载，并使用 Partytown 移至 Web Worker

**阶段 3：渲染优化（INP 从 680ms → 120ms）**

```javascript
// 优化前：同步渲染 200 条推荐
function renderRecommendations(items) {
  items.forEach(item => appendToDOM(item)); // 长任务 600ms+
}

// 优化后：虚拟滚动 + requestIdleCallback
const scroller = new VirtualScroller(
  document.getElementById('recommendations'),
  280, // itemHeight
  items.length,
  (index) => {
    const item = items[index];
    const el = document.createElement('div');
    el.className = 'rec-card';
    el.innerHTML = `
      <img src="${item.image}" loading="lazy" width="200" height="200">
      <h3>${item.name}</h3>
      <p>¥${item.price}</p>
    `;
    return el;
  }
);
```

- 商品 SKU 选择器使用 `requestAnimationFrame` 节流更新
- 价格计算移至 Web Worker
- 批量 DOM 操作，避免强制同步布局

**阶段 4：服务端渲染（首屏 FCP 从 2.1s → 0.4s）**

```javascript
// Node.js Streaming SSR（Express + React 18 Streaming）
import { renderToPipeableStream } from 'react-dom/server';

app.get('/product/:id', async (req, res) => {
  const productData = await getProduct(req.params.id);

  const { pipe } = renderToPipeableStream(
    <App product={productData} />,
    {
      bootstrapScripts: ['/main.js'],
      onShellReady() {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        pipe(res);
      },
      onError(error) {
        console.error(error);
        res.statusCode = 500;
      },
    }
  );
});
```

### 最终成果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| LCP | 3.2s | 0.8s | **4×** |
| INP | 680ms | 120ms | **5.7×** |
| CLS | 0.28 | 0.03 | **9.3×** |
| TTI | 5.8s | 1.2s | **4.8×** |
| JS 体积 | 1.8MB | 380KB | **4.7×** |
| 转化率 | 基准 | +12.5% | — |

---

## 11. 前端渲染优化

### React 优化清单

```typescript
// ✅ 使用 useMemo 缓存计算
const sorted = useMemo(() => data.sort(compare), [data]);

// ✅ 使用 useCallback 缓存回调
const handleClick = useCallback(() => onSelect(id), [id]);

// ✅ 使用 React.memo 避免不必要重渲染
const ListItem = React.memo(({ item }) => <div>{item.name}</div>);

// ✅ 代码分割 + Suspense
const HeavyChart = lazy(() => import('./HeavyChart'));
```

### Vue 优化清单

```vue
<script setup>
// ✅ v-once 静态内容
<div v-once>{{ staticContent }}</div>

// ✅ computed 缓存
const filtered = computed(() => items.filter(predicate));

// ✅ 虚拟滚动（大量列表）
import { useVirtualList } from '@vueuse/core';
</script>
```

---

## 12. 构建优化

### Vite 优化配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['lodash-es', 'dayjs'],
  }
});
```

---

## 13. Node.js 性能监控

### Event Loop 监控

```javascript
const { monitorEventLoopDelay } = require('perf_hooks').performance;
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log(`Event Loop Lag: ${h.mean / 1e6}ms`);
}, 5000);
```

### 内存泄漏检测

```javascript
// 生成堆快照
const heapdump = require('heapdump');
heapdump.writeSnapshot('./heap-' + Date.now() + '.heapsnapshot');
```

---

## 14. 持续监控

### Lighthouse CI 配置

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

---

## 15. 性能优化速查表

| 场景 | 优化手段 | 预期收益 |
|------|---------|---------|
| LCP 过长 | 预加载 LCP 图片、压缩图片、CDN、SSR | -50~80% |
| INP 过高 | 减少长任务、Web Workers、scheduler.yield() | -60~90% |
| CLS 过高 | 图片尺寸预留、`font-display: optional`、避免插入内容 | -80~95% |
| JS 体积过大 | Tree Shaking、代码分割、动态导入 | -50~70% |
| 内存泄漏 | WeakMap/WeakSet、清理定时器/监听器、堆分析 | 稳定运行 |
| Node CPU 高 | Cluster 模式、Stream 处理、缓存 | 线性扩展 |

---

## 延伸阅读

- [⚡ Svelte 5 Signals 编译器生态 — 生产实践](/svelte-signals-stack/08-production-practices) — Svelte 项目的 CWV 优化、Bundle 优化与监控策略
- [性能工程分类](../categories/performance-engineering)
- [构建工具对比矩阵](../comparison-matrices/build-tools-compare)
- [Chrome User Experience Report](https://developer.chrome.com/docs/crux)
- [Web Almanac 2025](https://almanac.httparchive.org/en/2025/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Clinic.js Documentation](https://clinicjs.org/documentation/)
