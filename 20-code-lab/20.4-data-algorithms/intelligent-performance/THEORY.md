# 智能性能优化：AI 驱动的性能工程

> **目标读者**：性能工程师、关注 AI 辅助优化的开发者
> **关联文档**：``30-knowledge-base/30.2-categories/intelligent-performance.md`` (Legacy) [Legacy link]
> **版本**：2026-04

---

## 1. AI 辅助性能优化

### 1.1 代码级优化

- **Copilot / Claude**：识别低效算法，建议优化方案
- **静态分析 + ML**：预测性能瓶颈
- **自动重构**：将 O(n²) 改为 O(n log n)

### 1.2 运行时优化

- **自适应加载**：根据设备性能调整资源
- **预测性预加载**：AI 预测用户下一步，提前加载
- **智能缓存**：基于访问模式的缓存策略

---

## 2. 性能预算自动化

```yaml
# performance-budget.yml
budgets:
  - path: "/"
    resources:
      - type: javascript
        budget: 200KB
        warn: 150KB
      - type: image
        budget: 500KB
```

---

## 3. 使用 PerformanceObserver 测量 Core Web Vitals

```typescript
// web-vitals-observer.ts — 精确测量 LCP / INP / CLS
function observeWebVitals() {
  // LCP: Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry;
    console.log('LCP:', lastEntry.startTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] as any });

  // CLS: Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    console.log('CLS:', clsValue);
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] as any });

  // INP: Interaction to Next Paint (取代 FID)
  const inpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries() as any[];
    const slowest = entries.reduce((max, e) =>
      e.duration > max.duration ? e : max, entries[0]);
    console.log('INP:', slowest.duration);
  });
  inpObserver.observe({ entryTypes: ['event'] as any, buffered: true });
}

observeWebVitals();
```

---

## 4. 自适应资源加载（Network Information API + Device Memory）

```typescript
// adaptive-loading.ts
interface ConnectionInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData: boolean;
}

function getImageUrl(base: string, width: number): string {
  const connection = (navigator as any).connection as ConnectionInfo | undefined;
  const effectiveType = connection?.effectiveType || '4g';
  const deviceMemory = (navigator as any).deviceMemory || 8;

  let scale = 1;
  if (effectiveType === '2g' || deviceMemory < 4) scale = 0.5;
  if (effectiveType === '4g' && deviceMemory >= 8) scale = 2;

  return `${base}?w=${Math.round(width * scale)}`;
}

// 结合 Save-Data 客户端提示
function shouldLoadHeavyContent(): boolean {
  const conn = (navigator as any).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return false;
  return true;
}

// Usage
const imgSrc = getImageUrl('/assets/hero.jpg', 1200);
```

---

## 5. Lighthouse CI 配置

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: { url: ['http://localhost:3000/'] },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
```

---

## 6. AI 辅助性能预测（示例）

```typescript
// predictive-prefetch.ts
class PredictivePrefetcher {
  private history = new Map<string, number>();

  record(path: string) {
    this.history.set(path, (this.history.get(path) || 0) + 1);
  }

  predictNext(current: string): string | null {
    let max = 0;
    let next: string | null = null;
    for (const [path, count] of this.history) {
      if (count > max && path !== current) {
        max = count;
        next = path;
      }
    }
    return next;
  }

  prefetch() {
    const next = this.predictNext(location.pathname);
    if (next) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = next;
      document.head.appendChild(link);
    }
  }
}

const prefetcher = new PredictivePrefetcher();
window.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('a');
  if (target) prefetcher.record(target.pathname);
});
setInterval(() => prefetcher.prefetch(), 5000);
```

---

## 7. Long Tasks API 与主线程优化

```typescript
// long-tasks-monitor.ts — 检测阻塞主线程的长任务
function observeLongTasks() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const task = entry as any;
      console.warn(`Long task detected: ${task.duration}ms`, {
        startTime: task.startTime,
        duration: task.duration,
        attribution: task.attribution?.map((a: any) => ({
          containerType: a.containerType,
          containerName: a.containerName,
        })),
      });

      // 上报到监控服务
      reportToAnalytics('long_task', {
        duration: task.duration,
        url: location.href,
      });
    }
  });
  observer.observe({ entryTypes: ['longtask'] });
}

// 任务分片：将大任务拆分为多个宏任务
async function processInChunks<T>(
  items: T[],
  processor: (chunk: T[]) => void,
  chunkSize = 100
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    processor(chunk);
    // 让出主线程
    await new Promise(resolve => requestIdleCallback(resolve));
  }
}
```

---

## 8. 资源提示（Resource Hints）策略

```typescript
// resource-hints.ts — 程序化注入预加载提示
function injectResourceHints() {
  // DNS 预解析
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = '//cdn.example.com';
  document.head.appendChild(dnsPrefetch);

  // 预连接（DNS + TCP + TLS）
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://api.example.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);

  // 预加载关键资源
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.href = '/fonts/main.woff2';
  preload.as = 'font';
  preload.type = 'font/woff2';
  preload.crossOrigin = 'anonymous';
  document.head.appendChild(preload);
}
```

---

## 9. 总结

AI 不会取代性能工程师，但会**放大性能工程师的能力**。

---

## 10. 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `ai-performance-optimizer.ts`
- `code-optimization-models.ts`
- `index.ts`
- `memory-optimization-models.ts`
- `network-optimization-models.ts`
- `rendering-performance-model.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

---

## 11. 权威参考链接

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance Panel](https://developer.chrome.com/docs/devtools/performance) — 性能面板指南
- [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) — 页面速度评分 API
- [W3C Device Memory](https://www.w3.org/TR/device-memory/) — 设备内存标准
- [Can I Use — Network Information API](https://caniuse.com/netinfo) — 网络信息兼容性
- [Rendering Performance (web.dev)](https://web.dev/rendering-performance/) — 渲染性能优化
- [V8 Blog — Cost of JavaScript](https://v8.dev/blog/cost-of-javascript-2019) — JS 启动开销分析
- [ML for Web Performance (Google AI)](https://ai.googleblog.com/2020/04/predicting-web-performance-with-machine.html) — AI 预测性能
- [web-vitals 库](https://github.com/GoogleChrome/web-vitals) — Google 官方 Web Vitals 测量库
- [Performance API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Resource Hints — W3C](https://www.w3.org/TR/resource-hints/)
- [Interaction to Next Paint (INP)](https://web.dev/inp/) — 交互响应性指标
- [HTTP Archive — State of the Web](https://httparchive.org/reports/state-of-the-web) — 真实性能数据
- [JavaScript Start-up Optimization](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization)

> 📅 理论深化更新：2026-04-30
