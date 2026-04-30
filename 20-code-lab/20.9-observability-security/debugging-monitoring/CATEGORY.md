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

### 异步堆栈追踪增强（Node.js async_hooks）

```typescript
import { createHook } from 'node:async_hooks';
import { stackTraceLimit } from 'node:errors';

const asyncContexts = new Map<number, string[]>();

const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    const parent = asyncContexts.get(triggerAsyncId) ?? [];
    asyncContexts.set(asyncId, [...parent, `${type}#${asyncId}`]);
  },
  destroy(asyncId) {
    asyncContexts.delete(asyncId);
  },
});

hook.enable();

// 在异常处理中打印异步上下文
process.on('unhandledRejection', (reason, promise) => {
  const asyncId = (promise as any)[Symbol.for('asyncId')] ?? 0;
  console.error('Unhandled rejection context:', asyncContexts.get(asyncId)?.join(' → '));
});
```

### Chrome DevTools 程序化堆快照（Node.js）

```typescript
import { writeHeapSnapshot } from 'node:v8';
import { writeFileSync } from 'node:fs';

function captureHeapSnapshot(label = 'default') {
  const snapshotPath = writeHeapSnapshot(`./heap-${label}-${Date.now()}.heapsnapshot`);
  console.log(`Heap snapshot written to: ${snapshotPath}`);
  return snapshotPath;
}

// 对比两次快照定位泄漏对象
function diffSnapshots(before: string, after: string) {
  // 使用 Chrome DevTools 打开两个 .heapsnapshot 文件进行 Diff 视图对比
  console.log(`Compare ${before} and ${after} in Chrome DevTools → Memory tab`);
}

// 使用示例
const before = captureHeapSnapshot('before');
// ... 执行业务逻辑 ...
const after = captureHeapSnapshot('after');
diffSnapshots(before, after);
```

### Worker 线程负载监控

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { jobId: 'J1' } });

  worker.on('message', (msg) => {
    if (msg.type === 'metrics') {
      console.log(`Worker CPU time: ${msg.cpuTime}ms | Memory: ${msg.memoryUsage.rss / 1024 / 1024}MB`);
    }
  });

  worker.postMessage({ type: 'start', payload: Array.from({ length: 1e6 }, (_, i) => i) });
} else {
  parentPort?.on('message', async ({ type, payload }) => {
    if (type !== 'start') return;
    const startCpu = performance.eventLoopUtilization();
    const startMem = process.memoryUsage();

    // 模拟计算密集型任务
    const result = payload.reduce((a: number, b: number) => a + b, 0);

    const endCpu = performance.eventLoopUtilization(startCpu);
    parentPort?.postMessage({
      type: 'metrics',
      cpuTime: endCpu.active / 1e6,
      memoryUsage: {
        rss: process.memoryUsage().rss - startMem.rss,
      },
      result,
    });
  });
}
```

### OpenTelemetry 手动 Trace 埋点

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service', '1.0.0');

async function processOrder(orderId: string) {
  return tracer.startActiveSpan('process-order', async (span) => {
    try {
      span.setAttribute('order.id', orderId);

      // 子 Span：验证库存
      const stock = await tracer.startActiveSpan('check-stock', async (child) => {
        child.setAttribute('item.sku', 'SKU-123');
        const result = await db.checkStock(orderId);
        child.end();
        return result;
      });

      if (!stock.available) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Out of stock' });
        throw new Error('Out of stock');
      }

      span.setStatus({ code: SpanStatusCode.OK });
      return { orderId, status: 'confirmed' };
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}
```

### Error Cause 链式追踪（现代调试模式）

```typescript
class DatabaseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DatabaseError';
  }
}

class ServiceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ServiceError';
  }
}

async function fetchUser(id: string) {
  try {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  } catch (cause) {
    throw new DatabaseError(`Failed to fetch user ${id}`, { cause });
  }
}

async function getProfile(id: string) {
  try {
    const user = await fetchUser(id);
    return transformProfile(user);
  } catch (cause) {
    throw new ServiceError(`Profile service unavailable for ${id}`, { cause });
  }
}

// 打印完整的错误因果链
getProfile('42').catch((err) => {
  console.error(err.message);
  // ServiceError: Profile service unavailable for 42
  //   Caused by DatabaseError: Failed to fetch user 42
  //     Caused by Error: Connection timeout
  let depth = 0;
  let current: unknown = err;
  while (current instanceof Error && current.cause) {
    console.log('  '.repeat(++depth) + 'Caused by →', (current.cause as Error).message);
    current = current.cause;
  }
});
```

### 结构化日志与上下文关联（Pino + AsyncLocalStorage）

```typescript
import { AsyncLocalStorage } from 'node:async_hooks';
import pino from 'pino';

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const requestStore = new AsyncLocalStorage<Map<string, string>>();

function getContextualLogger() {
  const store = requestStore.getStore();
  if (!store) return logger;
  return logger.child(Object.fromEntries(store));
}

function runWithRequestContext(requestId: string, fn: () => Promise<void>) {
  const store = new Map<string, string>([
    ['requestId', requestId],
    ['timestamp', new Date().toISOString()],
  ]);
  return requestStore.run(store, fn);
}

// 使用示例
await runWithRequestContext('req-001', async () => {
  getContextualLogger().info('Processing payment');
  // { "requestId": "req-001", "timestamp": "...", "msg": "Processing payment" }
});
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
| Node.js — Async Hooks | 官方文档 | [nodejs.org/api/async_hooks.html](https://nodejs.org/api/async_hooks.html) |
| Node.js — Worker Threads | 官方文档 | [nodejs.org/api/worker_threads.html](https://nodejs.org/api/worker_threads.html) |
| Node.js — Report (Diagnostic Report) | 官方文档 | [nodejs.org/api/report.html](https://nodejs.org/api/report.html) |
| V8 — Heap Snapshots | 文档 | [v8.dev/docs/heap-snapshots](https://v8.dev/docs/heap-snapshots) |
| Lighthouse Scoring Guide | 指南 | [developer.chrome.com/docs/lighthouse/performance/performance-scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) |
| JavaScript Memory Management (MDN) | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management) |
| Clinic.js — Node.js 性能诊断工具套件 | 工具 | [clinicjs.org](https://clinicjs.org/) |
| 0x — Node.js 火焰图生成器 | 工具 | [github.com/davidmarkclements/0x](https://github.com/davidmarkclements/0x) |
| OpenTelemetry JavaScript | 官方文档 | [opentelemetry.io/docs/languages/js](https://opentelemetry.io/docs/languages/js/) |
| Pino — 高性能 Node.js 日志库 | 官方文档 | [getpino.io](https://getpino.io/) |
| Sentry — 应用监控与错误追踪 | 文档 | [docs.sentry.io/platforms/javascript](https://docs.sentry.io/platforms/javascript/) |
| Datadog — Node.js APM | 文档 | [docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs](https://docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs/) |
| New Relic — Node.js 监控 | 文档 | [docs.newrelic.com/docs/apm/agents/nodejs-agent](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/) |
| web-vitals.js — 核心 Web 指标采集库 | GitHub | [github.com/GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) |
| Chrome UX Report (CrUX) | 数据集 | [developer.chrome.com/docs/crux](https://developer.chrome.com/docs/crux) |
| Node.js — Diagnostics Channel | 官方文档 | [nodejs.org/api/diagnostics_channel.html](https://nodejs.org/api/diagnostics_channel.html) |
| JavaScript Error Cause Proposal (ES2022) | 规范 | [tc39.es/ecma262/#sec-error-message](https://tc39.es/ecma262/#sec-error-message) |

---

*最后更新: 2026-04-30*
