---
dimension: 综合
sub-dimension: Performance
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Performance 核心概念与工程实践。

## 包含内容

- 本模块聚焦 performance 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 benchmark-suite.ts
- 📄 bundle-optimization.test.ts
- 📄 bundle-optimization.ts
- 📄 database-optimization.md
- 📄 database-optimization.ts
- 📄 index.ts
- 📄 memory-management.test.ts
- 📄 memory-management.ts
- 📄 network-optimization.test.ts
- 📄 network-optimization.ts
- 📄 optimization-patterns.test.ts
- ... 等 3 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Benchmark Suite | 使用 Benchmark.js / tinybench 进行可重复性能测试 | `benchmark-suite.ts` |
| Bundle Optimization | Tree-shaking、Code-splitting、压缩策略验证 | `bundle-optimization.ts` |
| Memory Management | 内存泄漏检测、WeakRef、FinalizationRegistry | `memory-management.ts` |
| Network Optimization | 请求合并、预加载、缓存策略 | `network-optimization.ts` |
| Database Optimization | 查询计划分析、索引策略、连接池 | `database-optimization.ts` |

## 代码示例：Benchmark Suite

```typescript
import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

const arr = Array.from({ length: 10_000 }, (_, i) => i);

bench
  .add('for loop', () => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
  })
  .add('for-of', () => {
    let sum = 0;
    for (const v of arr) sum += v;
    return sum;
  })
  .add('reduce', () => arr.reduce((a, b) => a + b, 0));

await bench.run();
console.table(bench.table());
```

### 内存泄漏检测与弱引用

```typescript
// memory-management.ts — WeakRef 与 FinalizationRegistry 实践
const registry = new FinalizationRegistry<string>((heldValue) => {
  console.log(`Object ${heldValue} has been garbage collected`);
});

function createTrackedObject(label: string) {
  const obj = { data: new ArrayBuffer(1024 * 1024), label };
  const ref = new WeakRef(obj);
  registry.register(obj, label);
  return ref;
}

// 检测内存泄漏模式
class LeakDetector {
  private refs = new Set<WeakRef<unknown>>();

  track(obj: object) {
    this.refs.add(new WeakRef(obj));
  }

  check() {
    globalThis.gc && (globalThis.gc as () => void)(); // Node.js --expose-gc
    const alive = [...this.refs].filter((r) => r.deref() !== undefined).length;
    console.log(`Tracked objects still alive: ${alive} / ${this.refs.size}`);
    return alive;
  }
}
```

### 网络请求合并与缓存

```typescript
// network-optimization.ts — 请求去重与记忆化
function createDeduplicatedFetcher<T>() {
  const pending = new Map<string, Promise<T>>();

  return (key: string, fetcher: () => Promise<T>): Promise<T> => {
    if (pending.has(key)) return pending.get(key)!;
    const promise = fetcher().finally(() => pending.delete(key));
    pending.set(key, promise);
    return promise;
  };
}

// 使用示例：相同 URL 的并发请求只发出一次
const fetchOnce = createDeduplicatedFetcher<Response>();
const url = '/api/config';
const r1 = fetchOnce(url, () => fetch(url));
const r2 = fetchOnce(url, () => fetch(url)); // 复用 r1 的 Promise
```

### PerformanceObserver — 运行时性能监控

```typescript
// runtime-performance.ts — 测量长任务与资源加载

function observePerformanceMetrics() {
  // 长任务检测（> 50ms 阻塞主线程）
  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.warn(`Long task detected: ${entry.duration.toFixed(1)}ms`, entry);
    }
  });
  longTaskObserver.observe({ type: 'longtask', buffered: true });

  // 资源加载性能
  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
      if (entry.responseEnd - entry.startTime > 1000) {
        console.warn(`Slow resource: ${entry.name} took ${(entry.responseEnd - entry.startTime).toFixed(0)}ms`);
      }
    }
  });
  resourceObserver.observe({ type: 'resource', buffered: true });

  return () => {
    longTaskObserver.disconnect();
    resourceObserver.disconnect();
  };
}
```

### 自定义性能计时标记

```typescript
// perf-markers.ts — User Timing API 实践

function measureOperation<T>(label: string, fn: () => T): T {
  performance.mark(`${label}-start`);
  const result = fn();
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  return result;
}

// 获取测量结果
function getMeasures(label: string): PerformanceMeasure[] {
  return performance.getEntriesByName(label, 'measure') as PerformanceMeasure[];
}

// 使用
measureOperation('heavy-sort', () => {
  return Array.from({ length: 100_000 }, () => Math.random()).sort((a, b) => a - b);
});

console.log(getMeasures('heavy-sort').map((m) => `${m.name}: ${m.duration.toFixed(2)}ms`));
```

### scheduler.yield — 协作式调度（Chrome 115+）

```typescript
// scheduler-yield.ts
// 将控制权交还给浏览器，避免阻塞主线程

async function processLargeDataset(items: any[]) {
  const results: any[] = [];
  for (let i = 0; i < items.length; i++) {
    results.push(heavyComputation(items[i]));
    // 每处理 50 项让出主线程
    if (i % 50 === 0 && 'scheduler' in globalThis) {
      await (globalThis as any).scheduler.yield();
    }
  }
  return results;
}

// Polyfill 降级
if (!('scheduler' in globalThis)) {
  (globalThis as any).scheduler = {
    yield: () => new Promise((resolve) => setTimeout(resolve, 0)),
  };
}
```

### 图片懒加载与资源预加载

```typescript
// lazy-preload.ts
// 原生懒加载 + 关键资源预加载

function setupLazyImages() {
  // 使用 loading="lazy" 是最简单有效的图片懒加载
  // 以下展示 IntersectionObserver 降级方案
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
}

// 预加载关键资源
function preloadCriticalResources() {
  const resources = [
    { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
    { href: '/styles/critical.css', as: 'style' },
  ];

  resources.forEach((res) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = res.href;
    link.as = res.as;
    if (res.type) link.type = res.type;
    if (res.crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// 预获取下一页
function prefetchNextPage(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}
```

### 文本压缩与流式传输

```typescript
// compression-stream.ts
// 使用 CompressionStream API 进行 gzip 压缩（现代浏览器）

async function compressText(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(input));
      controller.close();
    },
  });

  const compressed = stream.pipeThrough(new CompressionStream('gzip'));
  const reader = compressed.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // 合并 chunks
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// Node.js 中使用 zlib 等效实现
import { promisify } from 'util';
import { gzip } from 'zlib';
const gzipAsync = promisify(gzip);

async function compressNode(input: string): Promise<Buffer> {
  return gzipAsync(Buffer.from(input));
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| V8 Blog | 引擎优化深入 | [v8.dev/blog](https://v8.dev/blog) |
| web.dev — Performance | 性能指南 | [web.dev/performance](https://web.dev/performance) |
| Chrome DevTools — Performance | 性能分析工具 | [developer.chrome.com/docs/devtools/performance](https://developer.chrome.com/docs/devtools/performance) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Node.js perf_hooks | API 文档 | [nodejs.org/api/perf_hooks.html](https://nodejs.org/api/perf_hooks.html) |
| Node.js Diagnostics | 内存分析指南 | [nodejs.org/en/learn/diagnostics](https://nodejs.org/en/learn/diagnostics) |
| Web Vitals | 核心指标 | [web.dev/vitals](https://web.dev/vitals) |
| Bundlephobia | 包体积分析 | [bundlephobia.com](https://bundlephobia.com/) |
| Speedscope | 火焰图可视化 | [speedscope.app](https://www.speedscope.app/) |
| Google Lighthouse | 性能审计 | [developer.chrome.com/docs/lighthouse](https://developer.chrome.com/docs/lighthouse) |
| WebPageTest | 多地点性能测试 | [webpagetest.org](https://www.webpagetest.org/) |
| W3C — User Timing API | 规范 | [w3c.github.io/user-timing/](https://w3c.github.io/user-timing/) |
| web.dev — Optimize Long Tasks | 指南 | [web.dev/articles/optimize-long-tasks](https://web.dev/articles/optimize-long-tasks) |
| web.dev — Lazy Loading Images | 最佳实践 | [web.dev/articles/lazy-loading-images](https://web.dev/articles/lazy-loading-images) |
| MDN — Compression Streams API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API) |
| web.dev — Prefetching Strategies | 预加载策略 | [web.dev/articles/route-prefetching-in-nextjs](https://web.dev/articles/route-prefetching-in-nextjs) |
| WICG — scheduler.yield | 提案 | [github.com/WICG/scheduling-apis/blob/main/explainers/yield-and-continuation.md](https://github.com/WICG/scheduling-apis/blob/main/explainers/yield-and-continuation.md) |
| High Performance Browser Networking | 书籍 | [hpbn.co](https://hpbn.co/) |
| JavaScript Performance Pitfalls — Matthias Bynens | 演讲 | [v8.dev/docs/turbofan](https://v8.dev/docs/turbofan) |

---

*最后更新: 2026-04-30*
