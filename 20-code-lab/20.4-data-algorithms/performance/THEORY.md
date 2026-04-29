# 性能优化 — 理论基础

## 1. 性能指标

| 指标 | 定义 | 优化目标 |
|------|------|---------|
| **FP** | First Paint | < 1.8s |
| **FCP** | First Contentful Paint | < 1.8s |
| **LCP** | Largest Contentful Paint | < 2.5s |
| **FID** | First Input Delay | < 100ms |
| **CLS** | Cumulative Layout Shift | < 0.1 |
| **TTFB** | Time to First Byte | < 600ms |
| **INP** | Interaction to Next Paint | < 200ms |

## 2. 渲染优化

### 2.1 关键渲染路径

```
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint → Composite
```

优化策略：减少 DOM 深度、避免布局抖动（Layout Thrashing）、使用 CSS transform（GPU 加速）。

### 2.2 代码分割

- **路由级分割**: 按页面懒加载
- **组件级分割**: 按使用场景懒加载（如弹窗、图表）
- **Tree Shaking**: 消除未使用代码（依赖 ES Module 静态分析）

## 3. 网络优化

- **HTTP/2 多路复用**: 单一连接并行传输多个请求
- **HTTP/3 QUIC**: 基于 UDP，减少握手延迟，改善弱网环境
- **资源优先级**: `preload`、`prefetch`、`preconnect` 提示浏览器资源加载优先级
- **压缩**: Brotli > Gzip，文本资源压缩率提升 15-25%

## 4. 内存优化

- **对象池**: 复用对象减少 GC 压力
- **WeakMap/WeakSet**: 允许垃圾回收的引用
- **内存泄漏检测**: Chrome DevTools Heap Snapshot、Performance Monitor
- **常见泄漏**: 未移除的事件监听器、闭包引用全局变量、定时器未清理

## 5. 性能监测工具深度对比

| 特性 | Lighthouse | WebPageTest | SpeedCurve |
|------|-----------|-------------|------------|
| **提供商** | Google（开源） | Catchpoint（开源核心）| SpeedCurve（商业）|
| **测试类型** | 实验室 + 字段（CrUX） | 实验室（多地点/多设备）| 实验室 + RUM |
| **Core Web Vitals** | ✅ 原生评分 | ✅ 原生支持 | ✅ 原生支持 |
| **测试地点** | 固定（模拟）| 全球 70+ 节点 | 全球节点 |
| **真实设备** | 模拟（Moto G4）| 真实设备可选 | 真实设备 |
| **自定义脚本** | 有限 | 高级脚本（NS/JS）| 中等 |
| **竞品对比** | ❌ | ✅ | ✅ |
| **趋势分析** | 有限 | 基础 | 极强（长期趋势）|
| **CI/CD 集成** | Lighthouse CI | WPT API | 原生集成 |
| **成本** | 免费 | 免费版 / 商业版 | 商业（$99+/月）|
| **适用场景** | 开发调试、快速审计 | 深度网络分析、全球性能 | 企业级持续监控 |
| **代表用户** | Google、独立开发者 | Akamai、Microsoft | Shopify、The Economist |

### 工具选型决策

```
预算限制？
  ├─ 严格 → Lighthouse（免费）+ CrUX（免费）
  └─ 有预算 → 需要竞品对比 + 长期趋势？
                ├─ 是 → SpeedCurve
                └─ 否 → WebPageTest 商业版
```

## 6. 代码示例：Core Web Vitals 测量与上报

```typescript
// src/performance/web-vitals.ts — 生产级 Core Web Vitals 监控

// 使用 web-vitals 库（Google 官方）
// npm install web-vitals
import {
  onCLS,
  onINP,
  onLCP,
  onTTFB,
  onFCP,
  type CLSMetric,
  type INPMetric,
  type LCPMetric,
  type TTFBMetric,
  type FCPMetric
} from 'web-vitals'

interface WebVitalsReport {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id: string
  navigationType?: string
}

// 阈值定义（基于 Google 2024 标准）
const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  CLS:  { good: 0.1,   poor: 0.25 },
  INP:  { good: 200,   poor: 500 },
  LCP:  { good: 2500,  poor: 4000 },
  TTFB: { good: 800,   poor: 1800 },
  FCP:  { good: 1800,  poor: 3000 }
}

function getRating(name: string, value: number): WebVitalsReport['rating'] {
  const t = THRESHOLDS[name]
  if (!t) return 'needs-improvement'
  if (value <= t.good) return 'good'
  if (value >= t.poor) return 'poor'
  return 'needs-improvement'
}

/**
 * 初始化 Core Web Vitals 监控
 * @param reportCallback 上报回调（可接入 Analytics / Sentry / 自建服务）
 */
export function initWebVitalsMonitoring(
  reportCallback: (report: WebVitalsReport) => void
): () => void {
  const listeners: (() => void)[] = []

  // CLS（Cumulative Layout Shift）
  listeners.push(
    onCLS((metric: CLSMetric) => {
      reportCallback({
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
      })
    }, { reportAllChanges: true })
  )

  // INP（Interaction to Next Paint）
  listeners.push(
    onINP((metric: INPMetric) => {
      reportCallback({
        name: 'INP',
        value: metric.value,
        rating: getRating('INP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
      })
    }, { reportAllChanges: true })
  )

  // LCP（Largest Contentful Paint）
  listeners.push(
    onLCP((metric: LCPMetric) => {
      reportCallback({
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
      })
    })
  )

  // TTFB（Time to First Byte）
  listeners.push(
    onTTFB((metric: TTFBMetric) => {
      reportCallback({
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        id: metric.id,
        navigationType: metric.navigationType
      })
    })
  )

  // FCP（First Contentful Paint）
  listeners.push(
    onFCP((metric: FCPMetric) => {
      reportCallback({
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        id: metric.id,
        navigationType: metric.navigationType
      })
    })
  )

  // 返回清理函数
  return () => listeners.forEach((unsub) => unsub())
}
```

```typescript
// src/performance/reporter.ts — 实际上报实现

/**
 * 上报到自建分析服务（支持 Beacon API 确保页面卸载时也能发送）
 */
export function analyticsReporter(report: WebVitalsReport): void {
  const payload = {
    ...report,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  }

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })

  // 优先使用 Beacon API（页面卸载时也能可靠发送）
  if (navigator.sendBeacon) {
    const success = navigator.sendBeacon('/api/vitals', blob)
    if (success) return
  }

  // 降级到 fetch
  fetch('/api/vitals', {
    method: 'POST',
    body: blob,
    keepalive: true // 确保页面卸载时请求完成
  }).catch((err) => {
    console.error('[Web Vitals] Failed to report:', err)
  })
}

/**
 * 上报到 Google Analytics 4
 */
export function ga4Reporter(report: WebVitalsReport): void {
  if (typeof gtag === 'function') {
    gtag('event', report.name, {
      event_category: 'Web Vitals',
      value: Math.round(report.name === 'CLS' ? report.value * 1000 : report.value),
      event_label: report.id,
      non_interaction: true,
      vitals_rating: report.rating
    })
  }
}

/**
 * 组合上报器
 */
export function combinedReporter(report: WebVitalsReport): void {
  analyticsReporter(report)
  ga4Reporter(report)
}
```

```typescript
// src/performance/resource-observer.ts — 资源加载性能监控

/**
 * 使用 PerformanceObserver 监控关键资源加载
 */
export function observeResourcePerformance(): void {
  if (!('PerformanceObserver' in window)) return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming

      // 只监控关键资源
      if (!isCriticalResource(resource.name)) continue

      const metrics = {
        name: resource.name,
        initiatorType: resource.initiatorType,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        tls: resource.secureConnectionStart > 0
          ? resource.connectEnd - resource.secureConnectionStart
          : 0,
        ttfb: resource.responseStart - resource.startTime,
        download: resource.responseEnd - resource.responseStart,
        duration: resource.duration,
        transferSize: resource.transferSize,
        decodedBodySize: resource.decodedBodySize
      }

      // 慢资源告警
      if (metrics.duration > 1000) {
        console.warn('[Performance] Slow resource detected:', metrics)
      }
    }
  })

  observer.observe({ entryTypes: ['resource'] })
}

function isCriticalResource(url: string): boolean {
  const criticalPatterns = [/\.css$/, /\.js$/, /\.(woff2?|ttf)$/, /hero\./i]
  return criticalPatterns.some((p) => p.test(url))
}

/**
 * Long Tasks 监控（检测主线程阻塞）
 */
export function observeLongTasks(): void {
  if (!('PerformanceObserver' in window)) return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.warn('[Performance] Long task detected:', {
        duration: entry.duration,
        startTime: entry.startTime,
        attribution: (entry as any).attribution?.map((a: any) => ({
          name: a.name,
          containerType: a.containerType
        }))
      })
    }
  })

  observer.observe({ entryTypes: ['longtask'] })
}
```

```html
<!-- index.html — 性能优化资源提示 -->
<!DOCTYPE html>
<html>
<head>
  <!-- 预连接到关键第三方域名 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">

  <!-- 预加载关键字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

  <!-- 预加载 LCP 图片 -->
  <link rel="preload" href="/images/hero.avif" as="image" type="image/avif" fetchpriority="high">

  <!-- 预获取下一页 -->
  <link rel="prefetch" href="/about">

  <!-- 关键 CSS 内联 -->
  <style>
    /* Critical CSS: above-the-fold styles */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .hero { min-height: 100vh; display: grid; place-items: center; }
  </style>

  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
<body>
  <!-- 图片使用现代格式 + 响应式 -->
  <picture>
    <source srcset="/images/hero.avif" type="image/avif">
    <source srcset="/images/hero.webp" type="image/webp">
    <img src="/images/hero.jpg" alt="Hero" width="1200" height="600" fetchpriority="high" decoding="async">
  </picture>
</body>
</html>
```

## 7. 权威外部资源

- [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
- [web-vitals 库 GitHub](https://github.com/GoogleChrome/web-vitals)
- [Lighthouse 官方文档](https://developer.chrome.com/docs/lighthouse/)
- [WebPageTest 官方文档](https://docs.webpagetest.org/)
- [SpeedCurve 官方文档](https://support.speedcurve.com/)
- [Chrome UX Report (CrUX)](https://developer.chrome.com/docs/crux/)
- [HTTP Archive — Web Almanac](https://almanac.httparchive.org/)
- [MDN — Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Google Chrome Labs — Performance Budgets](https://web.dev/articles/performance-budgets-101)
- [Smashing Magazine — Front-End Performance](https://www.smashingmagazine.com/category/performance/)

## 8. 与相邻模块的关系

- **11-benchmarks**: 性能测试方法论
- **39-performance-monitoring**: 生产环境性能监控
- **54-intelligent-performance**: AI 辅助性能优化
