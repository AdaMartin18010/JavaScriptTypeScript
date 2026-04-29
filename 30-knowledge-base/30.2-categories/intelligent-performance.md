# 智能性能优化

> AI 驱动的性能优化工具与策略。

---

## AI 性能工具

| 工具 | 功能 |
|------|------|
| **Lighthouse CI** | 自动化性能评分 |
| **Vercel Speed Insights** | 真实用户性能数据 |
| **Chrome DevTools AI** | 智能性能建议 |
| **Bundle Analyzer + AI** | 智能包体积优化建议 |

---

## 性能优化对比矩阵

| 维度 | 传统优化 | AI 驱动优化 |
|------|----------|-------------|
| **预加载策略** | 手动 `<link rel="preload">` | 基于用户行为的预测性预加载 |
| **图片优化** | 固定响应式尺寸 | 自适应质量（网络/设备/内容感知） |
| **缓存策略** | 静态 TTL | AI 预测热点数据，动态 TTL |
| **代码分割** | 路由级手动分割 | 基于使用模式的自动粒度分割 |
| **LCP 优化** | 手动识别关键路径 | AI 自动标记 LCP 元素并建议加载优先级 |
| **CLS 优化** | 手动预留空间 | AI 检测布局偏移根因并生成修复方案 |
| **INP 优化** | 手动长任务拆分 | AI 识别阻塞交互的 JS 长任务 |

---

## 代码示例：Core Web Vitals 优化（Next.js + React）

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      {/* 优化 LCP：priority + 尺寸预留防止 CLS */}
      <Image
        src="/hero-banner.webp"
        alt="Hero Banner"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
        style={{ objectFit: 'cover' }}
        placeholder="blur"
        blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"
      />
    </div>
  );
}

// lib/vitals.ts - 上报 Core Web Vitals
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // 使用 sendBeacon 或 fetch 上报
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// pages/_app.tsx 或 app/layout.tsx
import { reportWebVitals } from '@/lib/vitals';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <html lang="zh-CN">
      <head>
        {/* 预连接关键域名，优化 TTFB / LCP */}
        <link rel="preconnect" href="https://cdn.example.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.example.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Core Web Vitals 阈值（2026）

| 指标 | 优秀 | 需改进 | 差 |
|------|------|--------|-----|
| **LCP**（最大内容绘制） | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP**（交互到下一次绘制） | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS**（累积布局偏移） | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **TTFB**（首字节时间） | ≤ 0.8s | ≤ 1.8s | > 1.8s |
| **FCP**（首次内容绘制） | ≤ 1.8s | ≤ 3.0s | > 3.0s |

---

## 策略

- **预测性预加载**：基于用户行为预测下一步导航
- **自适应质量**：网络状况动态调整图片/视频质量
- **智能缓存**：AI 预测热点数据，提前缓存

---

## 权威参考链接

- [web.dev Core Web Vitals](https://web.dev/vitals/)
- [web-vitals npm](https://www.npmjs.com/package/web-vitals)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

---

*最后更新: 2026-04-29*
