---
dimension: 综合
sub-dimension: Performance monitoring
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Performance monitoring 核心概念与工程实践。

## 包含内容

- **Web 核心指标（Core Web Vitals）**：LCP、INP、CLS、TTFB 的测量与优化阈值。
- **资源加载监控**：Resource Timing API、Navigation Timing API、瀑布流分析。
- **Node.js 性能**：Event Loop 延迟、`perf_hooks`、V8 引擎 GC 跟踪。
- **内存与 CPU**：堆内存趋势、长任务切片（Yielding）、Web Workers 负载均衡。
- **真实用户监控（RUM）**：采样率控制、性能数据上报、分位统计（p50/p95/p99）。

## 代码示例

### web-vitals 库采集核心指标

```typescript
import { onLCP, onINP, onCLS, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
    navigationType: metric.navigationType,
  });
  navigator.sendBeacon('/analytics/vitals', body);
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### Node.js perf_hooks 测量异步操作

```typescript
import { performance, PerformanceObserver } from 'node:perf_hooks';

const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
  }
});
obs.observe({ entryTypes: ['measure'] });

async function timedFetch(url: string): Promise<Response> {
  performance.mark('fetch-start');
  const res = await fetch(url);
  performance.mark('fetch-end');
  performance.measure('fetch-duration', 'fetch-start', 'fetch-end');
  return res;
}
```

### 长任务切片（Yielding）模式

```typescript
async function processLargeArray<T>(items: T[], batchSize: number, processor: (batch: T[]) => void): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    processor(items.slice(i, i + batchSize));
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 0)); // yield to event loop
    }
  }
}
```

### PerformanceObserver 监控长任务

```typescript
// 监控主线程阻塞（> 50ms 视为长任务）
const longTaskObs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn('Long Task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name,
    });
    // 上报到监控平台
    reportLongTask(entry);
  }
});
longTaskObs.observe({ entryTypes: ['longtask'] });

// 资源加载瀑布流分析
const resourceObs = new PerformanceObserver((list) => {
  const entries = list.getEntries() as PerformanceResourceTiming[];
  for (const r of entries) {
    const dns = r.domainLookupEnd - r.domainLookupStart;
    const tcp = r.connectEnd - r.connectStart;
    const ttfb = r.responseStart - r.requestStart;
    const download = r.responseEnd - r.responseStart;
    console.log(`${r.name}: DNS=${dns}ms TCP=${tcp}ms TTFB=${ttfb}ms DL=${download}ms`);
  }
});
resourceObs.observe({ entryTypes: ['resource'] });
```

### Node.js Event Loop 延迟监控

```typescript
import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

setInterval(() => {
  console.log('Event Loop Delay (p50/p99/max):', {
    p50: histogram.percentile(50),
    p99: histogram.percentile(99),
    max: histogram.max,
  });
  histogram.reset();
}, 5000);
```

### RUM 采样与分位统计

```typescript
// rum-collector.ts — 真实用户监控数据采样
interface RUMEvent {
  page: string;
  lcp: number;
  inp: number;
  cls: number;
  ttfb: number;
  timestamp: number;
  userAgent: string;
}

class RUMCollector {
  private buffer: RUMEvent[] = [];
  private sampleRate: number;

  constructor(sampleRate = 0.1) {
    this.sampleRate = sampleRate;
  }

  shouldSample(): boolean {
    return Math.random() < this.sampleRate;
  }

  record(event: RUMEvent): void {
    if (!this.shouldSample()) return;
    this.buffer.push(event);
    if (this.buffer.length >= 20) this.flush();
  }

  private flush(): void {
    const payload = JSON.stringify(this.buffer);
    navigator.sendBeacon('/analytics/rum', payload);
    this.buffer = [];
  }

  // 分位统计（离线计算）
  static percentile(sorted: number[], p: number): number {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 core-web-vitals.test.ts
- 📄 core-web-vitals.ts
- 📄 index.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| web.dev — Core Web Vitals | 指南 | [web.dev/vitals/](https://web.dev/vitals/) |
| web-vitals (npm) | 库文档 | [github.com/GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) |
| MDN — Performance API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance) |
| Node.js — perf_hooks | 官方文档 | [nodejs.org/api/perf_hooks.html](https://nodejs.org/api/perf_hooks.html) |
| Chrome UX Report | 数据集 | [developer.chrome.com/docs/crux](https://developer.chrome.com/docs/crux/) |
| W3C — User Timing Level 3 | 规范 | [w3.org/TR/user-timing-3/](https://www.w3.org/TR/user-timing-3/) |
| web.dev — Optimize Long Tasks | 指南 | [web.dev/optimize-long-tasks/](https://web.dev/optimize-long-tasks/) |
| MDN — PerformanceObserver | 文档 | [developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) |
| Node.js — Event Loop | 官方文档 | [nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) |
| Resource Timing Level 2 | 规范 | [w3.org/TR/resource-timing-2](https://www.w3.org/TR/resource-timing-2/) |
| Navigation Timing Level 2 | 规范 | [w3.org/TR/navigation-timing-2](https://www.w3.org/TR/navigation-timing-2/) |
| Lighthouse Scoring Calculator | 工具 | [googlechrome.github.io/lighthouse/scorecalc](https://googlechrome.github.io/lighthouse/scorecalc/) |

---

*最后更新: 2026-04-29*
