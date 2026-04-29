---
dimension: 综合
sub-dimension: Debugging monitoring
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Debugging monitoring 核心概念与工程实践。

## 包含内容

- **CPU 性能分析**：火焰图采集、`console.profile`、Chrome DevTools Performance 面板。
- **内存诊断**：堆快照（Heap Snapshot）、内存泄漏定位、`WeakRef` / `FinalizationRegistry` 追踪。
- **异步调试**：长任务拆分、Async Stack Traces、`Promise` 链路追踪。
- **运行时剖析**：Node.js `--inspect`、V8 Profiler、Worker 线程负载分析。
- **瓶颈定位**：事件循环延迟测量、垃圾回收（GC）日志分析。

## 代码示例

### PerformanceObserver 采集长任务

```typescript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('[Long Task]', entry.duration.toFixed(1), 'ms', entry.name);
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

### Node.js 事件循环延迟监控

```typescript
import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  histogram.disable();
  console.log(`Event loop delay: p50=${histogram.percentile(50)}μs, p99=${histogram.percentile(99)}μs`);
  histogram.reset();
  histogram.enable();
}, 5000);
```

### 简易内存泄漏探测器

```typescript
function detectMemoryLeak(fn: () => void, iterations = 100_000): void {
  const before = process.memoryUsage().heapUsed;
  for (let i = 0; i < iterations; i++) fn();
  if (global.gc) global.gc();
  const after = process.memoryUsage().heapUsed;
  const growth = ((after - before) / 1024 / 1024).toFixed(2);
  console.log(`Heap growth: ${growth} MB over ${iterations} iterations`);
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
- 📄 index.ts
- 📄 performance-profiling.test.ts
- 📄 performance-profiling.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Chrome DevTools — Performance | 官方文档 | [developer.chrome.com/docs/devtools/performance](https://developer.chrome.com/docs/devtools/performance/) |
| Node.js — perf_hooks | 官方文档 | [nodejs.org/api/perf_hooks.html](https://nodejs.org/api/perf_hooks.html) |
| V8 — CPU Profiling | 文档 | [v8.dev/docs/profile](https://v8.dev/docs/profile) |
| MDN — PerformanceObserver | 文档 | [developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) |
| web.dev — Optimize JavaScript Execution | 指南 | [web.dev/optimize-javascript-execution/](https://web.dev/optimize-javascript-execution/) |
| Node.js — Memory Diagnostics | 指南 | [nodejs.org/en/learn/diagnostics/memory](https://nodejs.org/en/learn/diagnostics/memory) |

---

*最后更新: 2026-04-29*
