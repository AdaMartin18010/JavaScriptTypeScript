---
category: frameworks
dimension: 框架生态
sub-dimension: 浏览器运行时
module: 50-browser-runtime
---

# 模块归属声明

本模块归属 **「框架（Frameworks）」** 维度，聚焦浏览器运行时机制与底层原理。理解这些原理是掌握前端框架设计与性能优化的基础。

## 包含内容

- 事件循环（Event Loop）与任务调度
- V8 引擎执行模型
- 内存管理与垃圾回收策略
- 浏览器渲染管线（Rendering Pipeline）
- DOM 与虚拟 DOM 对比模型

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `event-loop-architecture.ts` | 宏任务 / 微任务调度与 Event Loop 可视化 | `event-loop-architecture.test.ts` |
| `v8-execution-model.ts` | Ignition + TurboFan 执行管线与隐藏类 | `v8-execution-model.test.ts` |
| `memory-management-model.ts` | 标记清除、分代回收与内存泄漏检测 | `memory-management-model.test.ts` |
| `rendering-pipeline.ts` | 关键渲染路径、合成层与重排重绘 | `rendering-pipeline.test.ts` |
| `dom-virtualization-models.ts` | DOM diff、协调算法与批量更新 | `dom-virtualization-models.test.ts` |
| `smoke.test.ts` | 模块冒烟测试入口 | — |

## 代码示例

### 事件循环任务优先级演示

```typescript
export function demonstrateEventLoop() {
  const log: string[] = [];

  // 宏任务
  setTimeout(() => log.push('timeout'), 0);

  // 微任务
  Promise.resolve().then(() => {
    log.push('promise');
    // 嵌套微任务
    queueMicrotask(() => log.push('microtask'));
  });

  // 同步
  log.push('sync');

  // 预期输出顺序: sync → promise → microtask → timeout
  return log;
}
```

### 渲染管线帧预算监控

```typescript
export function measureFrameBudget(
  callback: (budget: number) => void
) {
  let rafId: number;

  function tick() {
    const start = performance.now();
    callback(16.67 - (start % 16.67)); // 60fps 预算
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}
```

### 隐藏类优化示例

```typescript
// 好的实践：固定属性初始化顺序
function Point(x: number, y: number) {
  this.x = x;
  this.y = y;
}

// 差的实践：动态添加属性导致隐藏类降级（字典模式）
function BadPoint(x: number, y: number) {
  this.x = x;
  this.y = y;
  // @ts-expect-error 故意演示反模式
  this.z = 0; // 破坏隐藏类结构
}
```

### 内存泄漏检测：弱引用与 FinalizationRegistry

```typescript
export function createWeakRefTracker<T extends object>(
  onCleanup: (heldValue: string) => void
) {
  const registry = new FinalizationRegistry<string>((heldValue) => {
    onCleanup(heldValue);
  });

  return {
    track(obj: T, label: string) {
      registry.register(obj, label);
    },
    // 手动触发垃圾回收不可行，但可在测试环境使用 --expose-gc
  };
}

// 使用示例：检测 DOM 节点是否被正确释放
const tracker = createWeakRefTracker<HTMLElement>((label) => {
  console.log(`[GC] ${label} was collected`);
});

const node = document.createElement('div');
tracker.track(node, 'temporary-div');
```

### 长任务分割：使用 Scheduler API

```typescript
export async function chunkedProcessing<T>(
  items: T[],
  processor: (item: T) => void,
  chunkSize = 100
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    await new Promise<void>((resolve) => {
      if ('scheduler' in window) {
        // @ts-expect-error Scheduler API 实验性
        scheduler.yield().then(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });

    chunk.forEach(processor);
  }
}
```

### Intersection Observer 懒加载实现

```typescript
// lazy-image-loader.ts — 基于 IntersectionObserver 的图片懒加载
export function createLazyImageLoader(
  selector = 'img[data-src]',
  rootMargin = '50px 0px'
): { observe: () => void; disconnect: () => void } {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    { rootMargin }
  );

  return {
    observe() {
      document.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
        observer.observe(img);
      });
    },
    disconnect() {
      observer.disconnect();
    },
  };
}

// 使用
const loader = createLazyImageLoader();
loader.observe();
```

### Performance Observer 监控核心指标

```typescript
// web-vitals-monitor.ts — Core Web Vitals 采集
export function observeWebVitals(onReport: (metric: { name: string; value: number }) => void): () => void {
  const observers: PerformanceObserver[] = [];

  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ name: 'LCP', value: lastEntry.startTime });
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] as any });
  observers.push(lcpObserver);

  // First Input Delay (FID) / Interaction to Next Paint (INP)
  const inpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as any;
      if (e.interactionId > 0) {
        onReport({ name: 'INP', value: e.processingStart - e.startTime });
      }
    }
  });
  inpObserver.observe({ type: 'event', buffered: true } as any);
  observers.push(inpObserver);

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as any;
      if (!e.hadRecentInput) {
        clsValue += e.value;
      }
    }
    onReport({ name: 'CLS', value: clsValue });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] as any });
  observers.push(clsObserver);

  return () => observers.forEach((o) => o.disconnect());
}
```

### Web Workers 并行计算示例

```typescript
// prime-worker.ts — Web Worker 中计算素数
// 主线程调用端
export function countPrimesInRange(start: number, end: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./prime-worker.ts', import.meta.url));
    worker.postMessage({ start, end });
    worker.onmessage = (e) => resolve(e.data.count);
    worker.onerror = reject;
  });
}

// prime-worker.ts 内部
/*
self.onmessage = (e: MessageEvent<{ start: number; end: number }>) => {
  const { start, end } = e.data;
  let count = 0;
  for (let n = start; n <= end; n++) {
    if (isPrime(n)) count++;
  }
  self.postMessage({ count });
};

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
*/
```

### 浏览器内存剖析辅助工具

```typescript
// memory-profiler.ts — 内存使用快照对比工具
export class MemoryProfiler {
  private snapshots: { label: string; usedJSHeapSize: number; timestamp: number }[] = [];

  snapshot(label: string): void {
    const perf = performance as any;
    if (perf.memory) {
      this.snapshots.push({
        label,
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        timestamp: Date.now(),
      });
    } else {
      console.warn('performance.memory API is only available in Chrome');
    }
  }

  report(): void {
    console.table(
      this.snapshots.map((s, i) => ({
        label: s.label,
        heapMB: (s.usedJSHeapSize / 1024 / 1024).toFixed(2),
        deltaMB:
          i > 0
            ? ((s.usedJSHeapSize - this.snapshots[i - 1].usedJSHeapSize) / 1024 / 1024).toFixed(2)
            : '0.00',
        elapsedMs: i > 0 ? s.timestamp - this.snapshots[i - 1].timestamp : 0,
      }))
    );
  }
}

// 使用示例
const profiler = new MemoryProfiler();
profiler.snapshot('before');
// ... 执行大量操作 ...
profiler.snapshot('after');
profiler.report();
```

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/01-frontend-frameworks.md](../../../30-knowledge-base/30.2-categories/01-frontend-frameworks.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — Event Loop | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) |
| web.dev — Rendering Performance | 指南 | [web.dev/articles/rendering-performance](https://web.dev/articles/rendering-performance) |
| V8 Blog — Hidden Classes | 博客 | [v8.dev/blog/fast-properties](https://v8.dev/blog/fast-properties) |
| Chrome Developers — Inside Look at Modern Web Browser | 系列 | [developer.chrome.com/blog/inside-browser-part1](https://developer.chrome.com/blog/inside-browser-part1) |
| HTML Standard — Event Loops | 规范 | [html.spec.whatwg.org/multipage/webappapis.html#event-loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) |
| JavaScript Engine Fundamentals | 指南 | [mathiasbynens.be/notes/shapes-ics](https://mathiasbynens.be/notes/shapes-ics) |
| MDN — Window.requestAnimationFrame | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) |
| web.dev — Optimize JavaScript Execution | 指南 | [web.dev/articles/optimize-javascript-execution](https://web.dev/articles/optimize-javascript-execution) |
| V8 Blog — Trash talk | 博客 | [v8.dev/blog/trash-talk](https://v8.dev/blog/trash-talk) |
| WICG — Scheduler API | 提案 | [github.com/WICG/scheduling-apis](https://github.com/WICG/scheduling-apis) |
| MDN — FinalizationRegistry | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) |
| web.dev — Core Web Vitals | 指南 | [web.dev/articles/vitals](https://web.dev/articles/vitals) |
| web.dev — Intersection Observer | 指南 | [web.dev/articles/intersectionobserver](https://web.dev/articles/intersectionobserver) |
| MDN — Web Workers API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) |
| MDN — Performance Observer | 文档 | [developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) |
| V8 Blog — Sparkplug | 博客 | [v8.dev/blog/sparkplug](https://v8.dev/blog/sparkplug) |
| Chromium Blog — RenderingNG | 博客 | [developer.chrome.com/articles/renderingng](https://developer.chrome.com/articles/renderingng) |
| Jake Archibald — Tasks, microtasks, queues and schedules | 文章 | [jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) |
| Philip Roberts — What the heck is the event loop anyway? | 演讲 | [www.youtube.com/watch?v=8aGhZQkoFbQ](https://www.youtube.com/watch?v=8aGhZQkoFbQ) |
| JSConf — V8 internals for JS developers | 演讲 | [www.youtube.com/watch?v=m9cTaYVuYVU](https://www.youtube.com/watch?v=m9cTaYVuYVU) |

---

*最后更新: 2026-04-29*
