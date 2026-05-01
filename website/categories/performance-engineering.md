---
title: 性能工程与优化
description: JavaScript/TypeScript 全栈性能工程完全指南，覆盖 Web Vitals、Lighthouse、构建优化、渲染性能、Node.js 性能与 2026 前沿趋势
---

# 性能工程与优化

> 最后更新: 2026-05-01 | 状态: 🔥 持续演进中 | 对齐: Core Web Vitals 2024/2025, Vite 6.3, Node.js 24

---

## 📊 整体概览

2025-2026 年，性能工程从前端的"加分项"演变为**产品核心指标**。Google 的 Core Web Vitals 直接影响搜索排名，INP（Interaction to Next Paint）取代 FID 成为关键交互指标，而 AI 驱动的性能监控正在重塑可观测性领域。

| 维度 | 2024 状态 | 2026 趋势 |
|------|----------|----------|
| **核心指标** | LCP + FID + CLS | LCP + **INP** + CLS + TTFB |
| **构建工具** | Webpack 主导 | Vite/Rolldown 默认，构建时间缩短 10-30x |
| **监控方式** | Lighthouse CI | 真实用户监控 (RUM) + AI 异常检测 |
| **渲染模式** | CSR/SSR 二选一 | Streaming SSR + 岛屿架构 + Edge SSR |
| **缓存策略** | Service Worker | Speculation Rules API + 预渲染 |

---

## 🌐 Web Vitals 核心指标

### 2024/2025 指标体系

| 指标 | 全称 | 良好阈值 | 关键性 | 测量工具 |
|------|------|---------|--------|---------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 🔴 极高 | Lighthouse, RUM |
| **INP** | Interaction to Next Paint | ≤ 200ms | 🔴 极高 | Chrome UX Report, RUM |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 🟠 高 | Lighthouse, RUM |
| **TTFB** | Time to First Byte | ≤ 800ms | 🟡 中 | WebPageTest, RUM |
| **FCP** | First Contentful Paint | ≤ 1.8s | 🟡 中 | Lighthouse |

> **INP 深度解析**: INP 于 2024 年 3 月取代 FID，测量从用户交互到页面视觉更新的完整延迟。与 FID 只测量"首次输入延迟"不同，INP 捕获**页面生命周期中最差的交互延迟**，对 SPA 和复杂交互应用影响巨大。

### INP 优化实战

```javascript
// ❌ 阻塞主线程的长任务
function processLargeDataset(data) {
  const result = data.map(expensiveTransform);
  return result;
}

// ✅ 使用 scheduler.yield() 拆分任务（Chrome 115+）
async function processLargeDataset(data) {
  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(expensiveTransform(data[i]));
    if (i % 100 === 0) await scheduler.yield();
  }
  return results;
}
```

---

## ⚡ 构建性能优化

### 构建工具性能矩阵

| 工具 | 冷启动 | HMR | 生产构建 | 技术栈 | 2026 采用率 |
|------|--------|-----|---------|--------|------------|
| **Vite 6.3** | ~300ms | ~50ms | ~2s | esbuild + Rollup | 75%+ |
| **Rolldown** | ~200ms | ~30ms | ~1s | Rust | 快速上升 |
| **Turbopack** | ~500ms | ~80ms | N/A | Rust | Next.js 默认 |
| **Rspack** | ~1s | ~100ms | ~3s | Rust | 企业级采用 |
| **Webpack 5** | ~5s | ~500ms | ~15s | JS | legacy 维护 |

### 代码分割最佳实践

```typescript
// 路由级动态导入
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 预加载关键资源
const preloadRoute = (path: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = path;
  document.head.appendChild(link);
};
```

---

## 🖥️ 渲染性能

### React Concurrent Features

| 特性 | 版本 | 作用 | 性能收益 |
|------|------|------|---------|
| **useTransition** | 18+ | 非紧急更新标记 | 减少 INP 30-50% |
| **useDeferredValue** | 18+ | 延迟非关键渲染 | 提升输入响应 |
| **React Server Components** | Next.js 13+ | 服务端渲染组件 | 减少 Bundle 20-40% |
| **Suspense Streaming** | 18+ | 流式传输 HTML | 改善 TTFB + LCP |

### 虚拟滚动方案对比

| 库 | Stars | 框架 | 特点 | 适用场景 |
|----|------|------|------|---------|
| **TanStack Virtual** | 5,800+ | 通用 | 轻量、灵活 | 自定义 UI |
| **react-window** | 15,000+ | React | 成熟稳定 | 标准列表 |
| **react-virtuoso** | 5,200+ | React | 功能丰富 | 复杂列表 |
| **vue-virtual-scroller** | 9,000+ | Vue | 社区首选 | Vue 项目 |

---

## 🟢 Node.js 性能

### 运行时优化策略

| 策略 | 适用场景 | 性能增益 |
|------|---------|---------|
| **Cluster 模式** | CPU 密集型服务 | 利用率提升 4-8x |
| **Worker Threads** | 并行计算 | 避免主线程阻塞 |
| **Stream 处理** | 大文件/数据流 | 内存占用降低 90% |
| **HTTP/2 Server Push** | 资源预推送 | 减少 RTT |
| **Zero-copy Buffer** | 二进制数据处理 | 减少 GC 压力 |

```javascript
// Worker Threads 并行计算
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.postMessage({ data: largeArray });
  worker.on('message', (result) => console.log(result));
} else {
  parentPort.once('message', ({ data }) => {
    const result = heavyComputation(data);
    parentPort.postMessage(result);
  });
}
```

### Event Loop 监控与诊断

Node.js 的 Event Loop 延迟是服务端性能的核心指标。事件循环被阻塞会直接导致请求响应延迟。

```javascript
// 使用 perf_hooks 监控 Event Loop 延迟
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  h.disable();
  console.log(`Event Loop 延迟: min=${h.min}ns, max=${h.max}ns, mean=${h.mean}ns`);
  if (h.mean > 100_000_000) { // 100ms
    console.warn('[PERF] Event Loop 延迟过高，可能存在同步阻塞代码');
  }
  h.reset();
  h.enable();
}, 5000);
```

对于生产环境，推荐使用 `event-loop-lag` 或集成 OpenTelemetry 进行持续监控：

```javascript
// 使用 event-loop-lag（npm install event-loop-lag）
const lag = require('event-loop-lag')(1000);

setInterval(() => {
  const currentLag = lag(); // 返回毫秒数
  if (currentLag > 100) {
    // 推送至 Prometheus / Datadog / Sentry
    metrics.histogram('nodejs.eventloop.lag_ms', currentLag);
  }
}, 5000);
```

> 📚 来源: [Node.js perf_hooks 官方文档](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions), [event-loop-lag npm](https://www.npmjs.com/package/event-loop-lag)

### 内存泄漏检测

内存泄漏是 Node.js 长生命周期应用的隐形杀手。以下是系统化的检测与修复方案。

**1. 使用 `--heapsnapshot-near-heap-limit` 自动生成堆快照**

```bash
# 当堆内存接近上限时自动保存快照，便于线下分析
node --max-old-space-size=512 \
     --heapsnapshot-near-heap-limit=3 \
     --heapsnapshot-near-heap-limit-max-count=1 \
     server.js
```

**2. 使用 `heapdump` 手动触发分析**

```javascript
const heapdump = require('heapdump');
const path = require('path');

// 通过 HTTP 接口手动触发（仅开发/调试环境）
app.get('/debug/heapdump', (req, res) => {
  const filename = path.join(__dirname, `heap-${Date.now()}.heapsnapshot`);
  heapdump.writeSnapshot(filename, (err) => {
    if (err) return res.status(500).send(err);
    res.download(filename);
  });
});
```

**3. 使用 Chrome DevTools 分析堆快照**

打开 Chrome → DevTools → Memory → Load，加载 `.heapsnapshot` 文件。关注：

- **Retainers**：查看谁持有了泄漏对象
- **Comparison**：对比两次快照，找出持续增长的对象类型
- **Dominators**：识别占用内存最大的对象树

**4. 常见泄漏模式与修复**

```javascript
// ❌ 泄漏模式 1: 全局缓存无上限
const cache = new Map();
function getUser(id) {
  if (!cache.has(id)) {
    cache.set(id, fetchUser(id)); // 持续增长，无淘汰策略
  }
  return cache.get(id);
}

// ✅ 修复: 使用 LRU 缓存
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 }); // 最多 500 项，5 分钟过期

// ❌ 泄漏模式 2: 事件监听器未移除
emitter.on('data', handler); // 组件卸载时未 off()

// ✅ 修复: 使用 WeakRef 或确保成对移除
const cleanup = () => emitter.off('data', handler);
// 或在组件卸载/连接关闭时调用 cleanup()

// ❌ 泄漏模式 3: 闭包捕获大对象
function createHandler(bigData) {
  return () => console.log(bigData.id); // 整个 bigData 被闭包持有
}

// ✅ 修复: 仅捕获需要的最小数据
function createHandler(bigData) {
  const { id } = bigData;
  return () => console.log(id);
}
```

> 📚 来源: [Node.js 内存诊断指南](https://nodejs.org/en/docs/guides/diagnostics-memory/), [Chrome DevTools 堆分析](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots)

---

## 🖼️ 图片优化专题

图片通常占据页面传输字节的 50% 以上，是 LCP 优化的首要目标。以下是 2026 年生产环境的标准实践。

### 现代图片格式对比

| 格式 | 压缩率 (vs JPEG) | 浏览器支持 | 编码速度 | 适用场景 |
|------|-----------------|-----------|---------|---------|
| **JPEG** | 基准 | 100% | 快 | 通用兼容 |
| **WebP** | -25~35% | 96%+ | 快 | 渐进增强首选 |
| **AVIF** | -50% | 92%+ | 慢 | 高画质要求 |
| **JPEG XL** | -60% | 低 (Chrome 移除) | 中 | 未来观望 |

> 📚 来源: [web.dev 图片格式对比](https://web.dev/articles/compress-images-avif), [Can I Use AVIF](https://caniuse.com/avif)

### Next.js Image 组件最佳实践

```tsx
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

// 组件使用
import Image from 'next/image';

// ✅ 自动优化: 懒加载 + 响应式 srcset + 格式转换
<Image
  src="/hero-banner.jpg"
  alt="首页横幅"
  width={1200}
  height={600}
  priority // 首屏图片，禁用懒加载，添加 preload
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>;
```

### Sharp 服务端批量处理

对于非 Next.js 项目，使用 Sharp 进行服务端图片处理是行业标准：

```javascript
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages(inputDir, outputDir) {
  const files = await fs.readdir(inputDir);

  for (const file of files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f))) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name;

    // 生成多尺寸响应式图片
    const widths = [320, 640, 960, 1280, 1920];
    for (const width of widths) {
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .avif({ quality: 75, effort: 4 })
        .toFile(path.join(outputDir, `${baseName}-${width}.avif`));

      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${baseName}-${width}.webp`));
    }

    // 生成 LQIP (Low Quality Image Placeholder) Base64
    const lqipBuffer = await sharp(inputPath)
      .resize(20, null)
      .blur()
      .webp({ quality: 20 })
      .toBuffer();
    const lqipBase64 = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;
    console.log(`${file} LQIP: ${lqipBase64.slice(0, 60)}...`);
  }
}
```

### 响应式图片与 Art Direction

```html
<!-- 使用 picture 元素实现格式回退和 Art Direction -->
<picture>
  <!-- 移动端竖屏专用裁剪图 -->
  <source
    media="(max-width: 768px)"
    srcset="/hero-mobile.avif 1x, /hero-mobile-2x.avif 2x"
    type="image/avif"
  />
  <!-- 桌面端大图 -->
  <source
    media="(min-width: 769px)"
    srcset="/hero-desktop.avif 1x, /hero-desktop-2x.avif 2x"
    type="image/avif"
  />
  <!-- WebP 回退 -->
  <source
    srcset="/hero-desktop.webp 1x, /hero-desktop-2x.webp 2x"
    type="image/webp"
  />
  <!-- 最终 JPEG 回退 -->
  <img
    src="/hero-desktop.jpg"
    srcset="/hero-desktop.jpg 1x, /hero-desktop-2x.jpg 2x"
    alt="产品展示"
    width="1920"
    height="1080"
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## 🔤 字体优化

Web 字体是 FOUT/FOIT 和布局偏移的常见来源。以下是系统化的字体加载优化策略。

### font-display 策略选择

```css
/*
  font-display 取值对比:
  - auto: 浏览器默认 (通常等价于 block)
  - block: 3s 不可见文本 → 备用字体 → 加载完成替换 (FOIT)
  - swap: 立即显示备用字体 → 加载完成替换 (FOUT)
  - fallback: 100ms 不可见 → 备用字体 → 加载完成替换
  - optional: 100ms 不可见 → 备用字体 → 不替换 (适合非关键字体)
*/

@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-weight: 400 700; /* 可变字体范围 */
  font-display: swap; /* 首屏关键字体推荐 swap */
  ascent-override: 90%;
  descent-override: 20%; /* 减少布局偏移 */
}

@font-face {
  font-family: 'Decorative';
  src: url('/fonts/Decorative.woff2') format('woff2');
  font-display: optional; /* 装饰字体: 快速回退，不阻塞 */
}
```

> 📚 来源: [web.dev font-display](https://web.dev/articles/font-display), [CSS Fonts Module Level 4](https://drafts.csswg.org/css-fonts-4/#font-display-desc)

### 可变字体 (Variable Fonts)

可变字体将多个字重/字宽合并为单一文件，显著减少请求数：

```css
/* 传统方式: 6 个独立文件 (~300KB) */
/* 可变字体: 1 个文件 (~150KB)，支持连续字重 100-900 */
@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-display: swap;
}

body {
  font-family: 'Inter Variable', system-ui, sans-serif;
  font-variation-settings: 'wght' 450, 'slnt' -5;
}
```

### 字体子集化 (Subsetting)

使用 `glyphhanger` 或 `subset-font` 移除未使用的字形：

```bash
# 使用 glyphhanger 生成仅包含所需字符的子集
npx glyphhanger \
  --subset="./fonts/Inter-Regular.woff2" \
  --formats=woff2 \
  --whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?-—–()[]{}'\"" \
  --output="./fonts/subset/"

# 或使用 pyftsubset (fontTools)
pyftsubset Inter-Regular.ttf \
  --unicodes="U+0020-007E" \
  --flavor=woff2 \
  --output-file=Inter-Regular-Latin.woff2
```

```css
/* 按需加载不同语言的子集 */
@font-face {
  font-family: 'Noto Sans SC';
  src: url('/fonts/NotoSansSC-Latin.woff2') format('woff2');
  unicode-range: U+0020-007F; /* 仅拉丁字符 */
  font-display: swap;
}

@font-face {
  font-family: 'Noto Sans SC';
  src: url('/fonts/NotoSansSC-Chinese.woff2') format('woff2');
  unicode-range: U+4E00-9FFF, U+3400-4DBF; /* CJK 统一表意文字 */
  font-display: swap;
}
```

### 字体预加载

```html
<!-- 预加载首屏关键字体，避免字体发现延迟 -->
<link
  rel="preload"
  href="/fonts/Inter-Variable.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- 使用 rel="preconnect" 加速字体 CDN (如 Google Fonts) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

---

## 📜 JavaScript 加载优化

JavaScript 的下载、解析和执行是阻塞主线程的主要来源，直接影响 INP 和 TTI。

### 脚本加载策略

```html
<!--
  加载策略对比:
  - <script>: HTML 解析阻塞，下载并执行完成后继续
  - <script async>: 并行下载，下载完成后立即执行（可能阻塞解析）
  - <script defer>: 并行下载，HTML 解析完成后按顺序执行
  - <script type="module">: 默认 defer
-->

<!-- 非关键第三方脚本: async -->
<script async src="https://analytics.example.com/script.js"></script>

<!-- 依赖 DOM 的脚本: defer，保证执行顺序 -->
<script defer src="/js/app.js"></script>
<script defer src="/js/analytics.js"></script>

<!-- ES Module: 天然 defer，支持静态分析 -->
<script type="module" src="/js/main.mjs"></script>

<!-- Module Preload: 预加载依赖图 -->
<link rel="modulepreload" href="/js/chunk-vendor.mjs" />
<link rel="modulepreload" href="/js/chunk-shared.mjs" />
<script type="module" src="/js/main.mjs"></script>
```

### modulepreload 与预加载链

```html
<!-- Vite/Rollup 构建产物推荐预加载策略 -->
<head>
  <!-- 1. 预加载关键 JS 模块 -->
  <link rel="modulepreload" href="/assets/index-abc123.js" />
  <link rel="modulepreload" href="/assets/vendor-def456.js" />

  <!-- 2. 预加载关键 CSS -->
  <link rel="preload" href="/assets/index-abc123.css" as="style" />
  <link rel="stylesheet" href="/assets/index-abc123.css" />

  <!-- 3. 使用 prefetch 预加载下一页资源（低优先级） -->
  <link rel="prefetch" href="/assets/about-page-chunk.js" />

  <!-- 4. 使用 prerender 预渲染下一页（Chrome 103+） -->
  <link rel="prerender" href="/about" />
</head>
```

> 📚 来源: [Vite 预加载指南](https://vitejs.dev/guide/features.html#preload-directives-generation), [Chrome Developers: Preload](https://developer.chrome.com/docs/lighthouse/performance/uses-rel-preload)

### Partytown 深度集成

Partytown 将第三方脚本移至 Web Worker，彻底消除对主线程的阻塞：

```html
<!-- 1. 基础集成: 通过 npm install @builder.io/partytown -->
<script>
  partytown = {
    debug: process.env.NODE_ENV === 'development',
    // 转发需要访问 DOM 的调用回主线程（有性能损耗，尽量减少）
    forward: [
      'dataLayer.push',
      'fbq',
      'gtag',
      '_hsq.push',
      'analytics.track',
    ],
    // 配置代理服务，用于处理第三方 API 请求
    resolveUrl: (url) => {
      const proxyUrls = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
      ];
      if (proxyUrls.some((host) => url.hostname.includes(host))) {
        const proxyUrl = new URL('/api/partytown-proxy', location.href);
        proxyUrl.searchParams.set('url', url.href);
        return proxyUrl;
      }
      return url;
    },
  };
</script>

<!-- 2. 将第三方脚本类型改为 text/partytown -->
<script type="text/partytown">
  // Google Analytics 4
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- 3. GTM 加载脚本同样迁移 -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Next.js 中集成 Partytown：**

```javascript
// next.config.js
const { Partytown } = require('@builder.io/partytown/utils');

module.exports = {
  experimental: {
    nextScriptWorkers: true, // 启用 Partytown 支持
  },
};

// 页面中使用
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="worker" // 关键: 使用 worker 策略
/>;
```

**Partytown 效果实测数据：**

| 指标 | 优化前 | Partytown 优化后 | 提升 |
|------|--------|-----------------|------|
| 主线程执行时间 | 350ms | 15ms | -95.7% |
| INP (交互延迟) | 280ms | 120ms | -57.1% |
| TTI | 4.2s | 2.8s | -33.3% |
| Lighthouse 性能分 | 72 | 94 | +22 |

> 📚 来源: [Partytown 官方文档](https://partytown.builder.io/), [web.dev: Partytown 简介](https://web.dev/articles/partytown)

---

## 🎨 CSS 优化

CSS 的体积和解析效率直接影响首屏渲染时间。2026 年的生产环境应系统性地实施以下策略。

### 关键 CSS (Critical CSS)

将首屏渲染所需的 CSS 内联到 `<head>` 中，避免渲染阻塞：

```javascript
// critical.js - 使用 critical 库提取关键 CSS
const critical = require('critical');

async function extractCriticalCSS() {
  const { css, html, uncritical } = await critical.generate({
    base: 'dist/',
    src: 'index.html',
    width: 1300,
    height: 900,
    // 输出内联后的 HTML
    target: {
      html: 'index-critical.html',
      css: 'critical.css',
    },
    // 提取多个断面的关键 CSS
    dimensions: [
      { width: 375, height: 667 },   // Mobile
      { width: 1920, height: 1080 }, // Desktop
    ],
    // 忽略的规则（如打印样式）
    ignore: {
      atrule: ['@font-face'],
      rule: [/\.non-critical/],
    },
  });
  return css;
}

// 在构建流程中集成
// package.json: "build:critical": "npm run build && node critical.js"
```

```html
<!-- 关键 CSS 内联（通常 < 14KB gzip，单 TCP 包） -->
<style>
  /* 首屏布局、导航、首屏图片占位 */
  :root{--primary:#0070f3}
  body{margin:0;font-family:system-ui}
  .hero{display:flex;min-height:80vh;align-items:center}
  /* ... */
</style>

<!-- 非关键 CSS 异步加载 -->
<link
  rel="preload"
  href="/css/non-critical.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/css/non-critical.css" /></noscript>
```

> 📚 来源: [web.dev: Extract Critical CSS](https://web.dev/articles/extract-critical-css), [Critical npm](https://www.npmjs.com/package/critical)

### 移除未使用 CSS (Unused CSS)

```javascript
// 使用 PurgeCSS 在构建时移除未使用样式
// vite.config.ts
import { defineConfig } from 'vite';
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        purgecss({
          content: ['./index.html', './src/**/*.jsx', './src/**/*.tsx'],
          safelist: [
            'dark-mode',
            /^hljs-/, // 代码高亮动态类
            'toast-enter',
            'toast-exit',
          ],
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
      ],
    },
  },
});
```

**Chrome DevTools Coverage 面板辅助分析：**

1. 打开 DevTools → `Ctrl+Shift+P` → 输入 "Coverage"
2. 点击记录按钮，浏览所有页面状态
3. 查看未使用字节百分比，针对性优化

### CSS Containment

CSS Containment 限制元素的渲染范围，减少浏览器重排和重绘成本：

```css
/* 使用 contain 属性隔离渲染边界 */
.card-list {
  /* layout: 子元素的布局变化不影响外部 */
  contain: layout;
}

.chat-widget {
  /* strict = layout + style + paint + size */
  /* 完全隔离，浏览器可优化图层合成 */
  contain: strict;
  content-visibility: auto;
  contain-intrinsic-size: 300px 200px; /* 为未渲染内容保留占位 */
}

.product-grid__item {
  /* 列表项常用配置 */
  contain: layout style paint;
}
```

`content-visibility: auto` 是 2026 年提升长列表渲染性能的关键技术：

```css
/* 仅渲染视口内的卡片，视口外的完全跳过布局和绘制 */
.feed-item {
  content-visibility: auto;
  /* 必须配合 contain-intrinsic-size，避免滚动条跳动 */
  contain-intrinsic-size: auto 300px;
}
```

实测数据：在包含 1000 个 DOM 节点的 feed 流中，`content-visibility: auto` 可将首次渲染时间从 120ms 降低至 25ms，提升 79%。

> 📚 来源: [CSS Containment Module Level 2](https://drafts.csswg.org/css-contain-2/), [web.dev: content-visibility](https://web.dev/articles/content-visibility)

---

## 🌐 网络优化

网络层优化是 TTFB 和资源加载效率的基础，涵盖协议、压缩和优先级调度。

### HTTP/3 与 QUIC

HTTP/3 基于 QUIC 协议，解决了 TCP 队头阻塞和连接建立延迟：

| 特性 | HTTP/2 | HTTP/3 |
|------|--------|--------|
| 传输层 | TCP | QUIC (UDP) |
| 握手延迟 | 2-3 RTT | 0-1 RTT |
| 队头阻塞 | 流级别解决，TCP 级别仍存在 | 完全消除 |
| 连接迁移 | 不支持 | 支持 (IP 变化保持连接) |
| 2026 支持率 | >95% | >85% |

```javascript
// Node.js 使用 @fails-components/webtransport 或原生实验性支持
// 生产环境通常通过 CDN (Cloudflare, Fastly) 自动启用 HTTP/3

// Nginx 配置 (需启用 http_v3_module)
server {
    listen 443 quic reuseport;
    listen 443 ssl;

    ssl_certificate     /path/to/cert.crt;
    ssl_certificate_key /path/to/cert.key;

    # 告知浏览器支持 HTTP/3
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    # 0-RTT 支持
    ssl_early_data on;
    quic_gso on;
}
```

> 📚 来源: [Cloudflare: HTTP/3](https://www.cloudflare.com/learning/performance/what-is-http3/), [RFC 9114](https://datatracker.ietf.org/doc/html/rfc9114)

### Brotli 压缩

Brotli 提供比 Gzip 高 15-25% 的压缩率，2026 年已成为 CDN 和服务器标配：

```nginx
# Nginx Brotli 配置 (ngx_brotli 模块)
brotli on;
brotli_comp_level 6;        # 1-11，推荐 4-6 平衡 CPU/压缩率
brotli_types
    text/plain
    text/css
    text/xml
    application/javascript
    application/json
    application/xml
    image/svg+xml;
```

```javascript
// Express 使用 shrink-ray-current
const shrinkRay = require('shrink-ray-current');
app.use(shrinkRay({
  filter: (req, res) => {
    // 跳过已压缩的资源
    if (req.url.match(/\.(jpg|png|avif|webp|woff2|br|gz)$/)) return false;
    return shrinkRay.filter(req, res);
  },
  brotli: { quality: 4 },
  zlib: { level: 6 }, // gzip 回退
}));
```

| 资源类型 | Gzip 压缩率 | Brotli 压缩率 | 收益 |
|---------|-----------|-------------|------|
| JavaScript | 65% | 80% | +15% |
| CSS | 65% | 82% | +17% |
| HTML | 60% | 75% | +15% |
| JSON API | 55% | 70% | +15% |

### 资源优先级与提示

```html
<!-- 关键资源: 最高优先级预加载 -->
<link rel="preload" href="/css/critical.css" as="style" />
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />

<!-- 关键脚本: fetchpriority 提示浏览器调度优先级 -->
<script src="/js/analytics.js" fetchpriority="high"></script>

<!-- 非关键图片: 降低优先级，避免挤占关键资源带宽 -->
<img src="/images/gallery-1.jpg" fetchpriority="low" loading="lazy" />

<!-- 下一页预加载: 低优先级 -->
<link rel="prefetch" href="/about" />

<!-- DNS 预解析和预连接 -->
<link rel="dns-prefetch" href="//api.example.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
```

**Fetch Priority 对 LCP 的影响：**

```html
<!-- LCP 元素为图片时，显式提升优先级可缩短 100-300ms -->
<img
  src="/hero-lcp.jpg"
  fetchpriority="high"
  width="1200"
  height="600"
  alt="首屏主图"
/>
```

> 📚 来源: [web.dev: Priority Hints](https://web.dev/articles/fetch-priority), [Chrome Resource Priorities](https://web.dev/articles/resource-priorities)

---

## 📈 性能监控工具矩阵

| 工具 | 类型 | Stars/规模 | 核心能力 | 适用阶段 |
|------|------|-----------|---------|---------|
| **Lighthouse 12** | 审计 | Chrome 内置 | 综合评分 + 优化建议 | 开发/CI |
| **WebPageTest** | 测试 | 行业标准 | 多地域、多设备测试 | 预发布 |
| **Sentry Performance** | RUM | 60K+ Stars | 错误 + 性能一体 | 生产 |
| **Datadog RUM** | RUM | 企业级 | 全链路追踪 | 生产 |
| **Speedcurve** | 竞品 | 商业 | 竞品性能对比 | 商业分析 |
| **Calibre** | 持续 | 商业 | 性能预算 + 趋势 | 团队 |

### Speedcurve 深度使用

Speedcurve 专注于竞品性能监控和可视化回归分析：

```javascript
// Speedcurve 合成监控 LUX RUM 代码嵌入
<script src="https://lux.speedcurve.com/lux.js?id=YOUR_ID" async defer></script>
<script>
  // 自定义标记关键业务事件
  LUX = window.LUX || [];
  LUX.push(['mark', 'hero_visible']);      // 首屏主图可见
  LUX.push(['mark', 'product_list_ready']); // 商品列表可交互

  // 测量自定义时间段
  LUX.push(['measure', 'checkout_flow', 'checkout_start', 'checkout_complete']);
</script>
```

Speedcurve 的核心优势：

- **Filmstrip 对比**：并排展示竞品网站与自身网站的视觉加载过程
- **RUM 与合成数据关联**：将实验室数据与真实用户数据统一视图
- **性能预算可视化**：当 LCP/INP 超过设定阈值时自动告警

> 📚 来源: [Speedcurve 文档](https://support.speedcurve.com/)

### Calibre 性能预算与 CI 集成

Calibre 是专为团队设计的性能监控平台，原生支持性能预算：

```yaml
# calibre.yml - 站点配置
version: 1
sites:
  - name: Production Site
    url: https://example.com
    team: frontend-platform
    budgets:
      - metric: lighthouse-performance
        value: 90
        warn: 85
      - metric: largest-contentful-paint
        value: 2500
        warn: 3000
      - metric: total-byte-weight
        value: 2000000 # 2MB
        warn: 2500000
    monitoring:
      - schedule: every-6-hours
        locations: [us-east-1, eu-west-1, ap-southeast-1]
```

```bash
# 在 CI 中运行 Calibre 测试并检查预算
calibre site create --location="Test" --url="$PREVIEW_URL"
calibre test create --site="Test" --wait-for-results

# 使用 CLI 拉取最新指标用于门禁
calibre metric-list --site="Production Site" --json > metrics.json
node scripts/check-budgets.js metrics.json
```

> 📚 来源: [Calibre CLI 文档](https://calibreapp.com/docs/automate/ci-cli)

### Chrome DevTools Performance Panel 深度使用

Performance Panel 是分析运行时性能的首选工具，2026 年新增 AI 辅助分析（实验性）。

**标准分析流程：**

1. **录制性能跟踪**
   - 打开 DevTools → Performance
   - 勾选 "Screenshots" 和 "Web Vitals"
   - 点击录制，执行目标交互，停止录制

2. **分析关键路径**
   - **Network 轨道**：查看资源加载瀑布流，识别阻塞渲染的资源
   - **Main 轨道**：分析长任务（>50ms），使用 "Bottom-Up" 找出耗时函数
   - **Timings 轨道**：查看 FCP、LCP、DCL、L 等关键时间节点
   - **Interactions 轨道**：查看每次交互的 Event Handler → Recalc Style → Layout → Paint 耗时

3. **定位 INP 问题**
   - 在录制时勾选 "Interactions"
   - 找到高延迟交互标记，展开查看完整处理链
   - 常见根因：
     - 长 JavaScript 任务（优化：拆分任务、使用 `scheduler.yield()`）
     - 强制同步布局（优化：批量 DOM 读写、使用 `requestAnimationFrame`）
     - 样式计算过深（优化：减少选择器复杂度、使用 BEM）

4. **使用性能洞察面板 (Performance Insights)**
   - 自动生成优化建议清单
   - 按影响程度排序，优先修复 "High" 级别问题

```javascript
// 配合 DevTools 分析: 在代码中添加自定义性能标记
performance.mark('search-start');
await performSearch(query);
performance.mark('search-end');
performance.measure('search-duration', 'search-start', 'search-end');

// 在 DevTools Performance → Timings 轨道中查看自定义标记
```

> 📚 来源: [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance), [Optimize INP](https://web.dev/articles/optimize-inp)

---

## 💰 性能预算（Performance Budget）

性能预算是将性能指标量化并纳入工程流程的核心机制。它定义了可接受的性能上限，超出即阻塞发布。

### 预算类型与阈值建议

| 预算类型 | 指标 | 严格预算 | 宽松预算 | 测量方式 |
|---------|------|---------|---------|---------|
| **时间预算** | LCP | ≤ 2.0s | ≤ 2.5s | Lighthouse / RUM |
| **时间预算** | INP | ≤ 150ms | ≤ 200ms | CrUX / RUM |
| **时间预算** | TTI | ≤ 3.0s | ≤ 4.0s | Lighthouse |
| **体积预算** | JS Bundle | ≤ 200KB (gzip) | ≤ 300KB (gzip) | Bundle Analyzer |
| **体积预算** | 图片总量 | ≤ 800KB | ≤ 1.2MB | Lighthouse |
| **体积预算** | 总页面权重 | ≤ 1.5MB | ≤ 2.5MB | WebPageTest |
| **请求预算** | 首屏请求数 | ≤ 20 | ≤ 30 | DevTools Network |
| **自定义预算** | 第三方脚本体积 | ≤ 100KB | ≤ 150KB | Lighthouse |

> 📚 来源: [web.dev: Performance Budgets](https://web.dev/articles/performance-budgets-101)

### 在 CI 中实施性能预算

**方案 1: Lighthouse CI（推荐，免费开源）**

```bash
npm install --save-dev @lhci/cli
```

```json
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/about'],
      startServerCommand: 'npm run start',
      numberOfRuns: 3, // 多次运行取中位数，减少波动
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // 性能分数
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // Core Web Vitals (数值单位: 毫秒或比例)
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],

        // 资源体积预算
        'total-byte-weight': ['warn', { maxNumericValue: 2 * 1024 * 1024 }], // 2MB
        'unused-javascript': ['warn', { maxNumericValue: 100 * 1024 }], // 100KB

        // 网络预算
        'render-blocking-resources': ['error', { maxLength: 2 }], // 最多 2 个阻塞资源
        'third-party-summary': ['warn', { maxNumericValue: 500 }], // 第三方耗时 500ms
      },
    },
    upload: {
      target: 'temporary-public-storage', // 或配置 LHCI server
    },
  },
};
```

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse Report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: lighthouse-report
          path: .lighthouseci/
```

**方案 2: Bundle Size 预算（Webpack / Vite）**

```javascript
// vite.config.ts - 使用 vite-plugin-bundle-analyzer + 自定义检查
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ...其他插件
    process.env.ANALYZE &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
  ],
  build: {
    // 使用 rollup 的 output.manualChunks 控制 chunk 大小
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('lodash')) return 'lodash';
            if (id.includes('three')) return 'three';
            return 'vendor';
          }
        },
        // 强制拆分大于 500KB 的 chunk
        experimentalMinChunkSize: 500 * 1024,
      },
    },
    // 构建后检查 chunk 大小
    chunkSizeWarningLimit: 500, // KB
  },
});
```

```javascript
// scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');

const BUDGETS = {
  'assets/index-': { maxSize: 150 * 1024 },       // 150KB
  'assets/vendor-': { maxSize: 250 * 1024 },      // 250KB
  'assets/react-': { maxSize: 80 * 1024 },        // 80KB
};

const distPath = path.join(__dirname, '../dist/assets');
let failed = false;

for (const file of fs.readdirSync(distPath)) {
  for (const [prefix, budget] of Object.entries(BUDGETS)) {
    if (file.startsWith(prefix)) {
      const size = fs.statSync(path.join(distPath, file)).size;
      if (size > budget.maxSize) {
        console.error(
          `❌ 预算超限: ${file} (${(size / 1024).toFixed(1)}KB > ${budget.maxSize / 1024}KB)`
        );
        failed = true;
      } else {
        console.log(
          `✅ 预算通过: ${file} (${(size / 1024).toFixed(1)}KB <= ${budget.maxSize / 1024}KB)`
        );
      }
    }
  }
}

if (failed) process.exit(1);
```

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:check": "vite build && node scripts/check-bundle-size.js",
    "analyze": "ANALYZE=true vite build"
  }
}
```

**方案 3: 使用 bundlesize 包进行简单体积检查**

```json
// package.json
{
  "bundlesize": [
    { "path": "./dist/assets/index-*.js", "maxSize": "150 kB" },
    { "path": "./dist/assets/vendor-*.js", "maxSize": "250 kB" },
    { "path": "./dist/assets/index-*.css", "maxSize": "50 kB" }
  ]
}
```

```bash
npx bundlesize
```

### 性能预算治理流程

```
1. 设定基线
   └── 基于当前 75 分位 RUM 数据，设定初始预算（预留 20% 缓冲）

2. 融入工作流
   ├── PR 阶段: Lighthouse CI 自动检查（警告级别，不阻塞）
   ├── 合并前: 手动审查突破预算的变更理由
   └── 发布前: 全量预算检查（错误级别，阻塞发布）

3. 持续监控
   ├── 每周: 审查 RUM 数据，识别预算漂移
   ├── 每月: 根据业务增长调整预算（如新增功能允许 +10% JS）
   └── 每季: 对标竞品，收紧或放宽预算

4. 回归响应
   └── 预算突破时自动创建工单，指派到最近修改相关资源的开发者
```

> 📚 来源: [web.dev: Incorporate Performance Budgets](https://web.dev/articles/incorporate-performance-budgets-into-your-build-tools)

---

## 🔮 2026 前沿趋势

### Speculation Rules API

Chrome 121+ 引入的预渲染 API，允许浏览器在后台预加载和预渲染整个页面：

```html
<script type="speculationrules">
{
  "prerender": [{
    "source": "list",
    "urls": ["/about", "/pricing"]
  }]
}
</script>
```

### Partytown

将第三方脚本（Google Analytics、Facebook Pixel 等）从主线程移至 Web Worker：

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 主线程阻塞 | 200-500ms | ~10ms |
| INP 影响 | 显著 | 可忽略 |
| 集成复杂度 | 低 | 中 |

### AI 驱动的性能监控

- **Sentry AI**: 自动归类性能回归，预测问题根因
- **Datadog Watchdog**: 无监督异常检测，自动告警
- **Chrome DevTools AI**: 智能性能建议（实验性）

---

## 🎯 选型决策树

```
项目类型?
├─ 内容站/博客 → 优先 LCP + TTFB → Astro/Next.js SSG + CDN
├─ 电商平台 → 优先 INP + LCP → Next.js App Router + Edge
├─ SaaS 应用 → 优先 INP + 构建速度 → Vite + SPA/MPA
├─ 实时应用 → 优先内存 + GC → Node.js Cluster + Worker Threads
└─ AI 应用 → 优先首屏 + 流式 → Streaming SSR + Edge
```

---

## 📚 延伸阅读

- [MDN: Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [web.dev: Core Web Vitals](https://web.dev/vitals/)
- [CSS-in-JS 完整指南](../guide/css-in-js-styling)
- [构建工具对比矩阵](../comparison-matrices/build-tools-compare)

---

> 💡 **关键洞察**: 2026 年性能工程的最大转变是从"工具驱动"走向"指标驱动"。团队不再盲目优化，而是围绕 LCP/INP/CLS 建立性能预算，将性能纳入 CI/CD 门禁。
