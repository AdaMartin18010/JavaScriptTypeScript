# 调试与监控 - 理论基础

## 1. 调试方法论

### 科学调试法

1. **复现**: 找到稳定复现问题的步骤
2. **假设**: 提出可能导致问题的假设
3. **验证**: 设计实验验证或否定假设
4. **修复**: 验证通过后实施修复
5. **回归**: 确保修复未引入新问题

### 二分法调试

- 在代码历史中使用二分查找定位引入 bug 的提交
- Git 内置支持：`git bisect`

---

## 2. 调试工具深度对比

| 维度 | Chrome DevTools | Node.js Inspector | Replay.io |
|------|-----------------|-------------------|-----------|
| **运行环境** | 浏览器（Chromium） | Node.js / Deno / Bun | 浏览器 / Node.js（需录制） |
| **核心能力** | 实时断点、性能分析、内存快照 | V8 Inspector Protocol、CLI 调试 | 时间旅行调试（记录到回放） |
| **异步追踪** | Async Stack Tags、Performance 面板 | `async_hooks`、`--trace-events` | 原生支持，任意时刻回溯 |
| **性能分析** | Flame Chart、Long Tasks、Web Vitals | `--prof`、`0x`、`clinic.js` | 录制期间自动捕获 |
| **协作分享** | 导出 HAR / Performance JSON | 无原生分享 | 分享 Replay URL（含完整上下文） |
| **成本** | 免费 | 免费 | 免费额度 + 团队付费 |
| **适用场景** | 前端渲染问题、DOM/CSS 调试 | 服务端逻辑、启动性能 | 复杂异步 Bug、生产环境回溯 |

---

## 3. 性能分析代码示例（Node.js Inspector + Performance Hooks）

```typescript
// profile.ts - 使用 Node.js Performance Hooks 进行自定义性能分析
import { performance, PerformanceObserver } from 'node:perf_hooks';
import fs from 'node:fs';

// 观察长任务和自定义标记
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  }
});

obs.observe({ entryTypes: ['measure', 'function', 'gc'] });

async function heavyComputation() {
  performance.mark('compute-start');

  // 模拟 CPU 密集型任务
  const data = Array.from({ length: 1e6 }, (_, i) => i);
  const result = data
    .filter(n => n % 2 === 0)
    .map(n => n * n)
    .reduce((a, b) => a + b, 0);

  performance.mark('compute-end');
  performance.measure('heavy-computation', 'compute-start', 'compute-end');

  return result;
}

async function apiSimulation() {
  performance.mark('api-start');

  // 模拟并发 API 调用
  await Promise.all([
    fetch('https://api.example.com/users').then(r => r.json()),
    fetch('https://api.example.com/orders').then(r => r.json()),
  ]);

  performance.mark('api-end');
  performance.measure('api-batch', 'api-start', 'api-end');
}

async function main() {
  await heavyComputation();
  await apiSimulation();

  // 生成 Chrome DevTools 可读的 JSON 性能跟踪文件
  const traceEvents = performance.getEntriesByType('measure').map(m => ({
    name: m.name,
    ph: 'X', // Complete event
    ts: (m.startTime * 1000), // microseconds
    dur: (m.duration * 1000),
    pid: 1,
    tid: 1,
    cat: 'custom',
  }));

  fs.writeFileSync(
    './profile.json',
    JSON.stringify({ traceEvents }, null, 2)
  );

  console.log('性能跟踪文件已生成: profile.json');
  console.log('在 Chrome DevTools Performance Load Profile 中查看');
}

main();
```

Chrome DevTools Performance 面板录制脚本：

```javascript
// 在 DevTools Console 中运行，自动录制并下载性能跟踪
const trace = await performance.measureUserAgentSpecificMemory?.();
console.log('当前内存使用:', trace);

// 程序化触发 Performance 录制（用于自动化测试）
await chrome.devtools?.performance?.enable();
```

---

## 4. 结构化日志与分布式追踪

### Pino 结构化日志（Node.js 高性能日志库）

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: { service: 'api-gateway', version: '1.0.0' },
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', 'ssn'],
    remove: true,
  },
});

// 使用示例
logger.info({ userId: 'u-123', reqId: 'req-456' }, '用户登录成功');
logger.error({ err: new Error('DB timeout'), reqId: 'req-456' }, '数据库查询失败');
```

### OpenTelemetry 手动埋点追踪

```typescript
// lib/tracer.ts
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
})));
provider.register();

const tracer = trace.getTracer('debugging-monitoring', '1.0.0');

export async function tracedFetch(url: string, options?: RequestInit) {
  return tracer.startActiveSpan('http.fetch', async (span) => {
    try {
      span.setAttribute('http.url', url);
      span.setAttribute('http.method', options?.method || 'GET');
      const res = await fetch(url, options);
      span.setAttribute('http.status_code', res.status);
      if (!res.ok) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${res.status}` });
      }
      return res;
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}
```

---

## 5. 内存泄漏检测

```typescript
// scripts/detect-memory-leak.ts - 基于堆快照对比
import v8 from 'node:v8';
import fs from 'node:fs';

function writeHeapSnapshot(label: string) {
  const snapshot = v8.writeHeapSnapshot(`heap-${label}-${Date.now()}.heapsnapshot`);
  console.log(`Heap snapshot written: ${snapshot}`);
  return snapshot;
}

// 模拟潜在泄漏
const leakyCache: any[] = [];

async function simulateWork() {
  for (let i = 0; i < 10000; i++) {
    leakyCache.push({ id: i, data: Buffer.alloc(1024), ts: Date.now() });
  }
}

async function main() {
  writeHeapSnapshot('baseline');
  await simulateWork();
  global.gc && global.gc(); // 需 Node.js 启动时加 --expose-gc
  writeHeapSnapshot('after-work');
}

main();
```

---

## 6. Async Hooks 异步资源追踪

```typescript
// async-trace.ts - 使用 async_hooks 追踪异步调用链
import { createHook, executionAsyncId, triggerAsyncId } from 'async_hooks';
import fs from 'fs';

const asyncResources = new Map<number, { type: string; trigger: number; start: number }>();

const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    asyncResources.set(asyncId, { type, trigger: triggerAsyncId, start: Date.now() });
  },
  destroy(asyncId) {
    asyncResources.delete(asyncId);
  },
});

hook.enable();

function printAsyncStack() {
  const current = executionAsyncId();
  const stack: string[] = [];
  let id = current;
  while (id !== 0) {
    const res = asyncResources.get(id);
    if (!res) break;
    stack.push(`${res.type}(${id})`);
    id = res.trigger;
  }
  console.log('Async stack:', stack.join(' -> '));
}

// 使用
setTimeout(() => {
  Promise.resolve().then(() => {
    printAsyncStack();
  });
}, 0);
```

---

## 7. 分布式追踪上下文传播

```typescript
// distributed-tracing.ts - 跨服务追踪上下文传递
import { trace, propagation, context } from '@opentelemetry/api';

interface TraceContext {
  traceparent?: string;
  tracestate?: string;
}

function injectTraceContext(headers: Record<string, string> = {}): Record<string, string> {
  const carrier: Record<string, string> = { ...headers };
  propagation.inject(context.active(), carrier, {
    set(carrier, key, value) {
      carrier[key] = value;
    },
  });
  return carrier;
}

function extractTraceContext(headers: Record<string, string>): context.Context {
  return propagation.extract(context.active(), headers, {
    get(carrier, key) {
      return carrier[key] ?? undefined;
    },
    keys(carrier) {
      return Object.keys(carrier);
    },
  });
}

// 在 HTTP 客户端中使用
async function tracedHttpCall(url: string, body: unknown) {
  const headers = injectTraceContext({ 'Content-Type': 'application/json' });
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

// 在 HTTP 服务端中使用
function handleRequest(req: { headers: Record<string, string> }) {
  const ctx = extractTraceContext(req.headers);
  const tracer = trace.getTracer('my-service');
  const span = tracer.startSpan('handleRequest', undefined, ctx);
  // ... 处理请求
  span.end();
}
```

---

## 8. 健康检查与就绪探针

```typescript
// health-check.ts
interface HealthCheck {
  name: string;
  check: () => Promise<{ healthy: boolean; message?: string }>;
  critical: boolean;
}

class HealthMonitor {
  private checks: HealthCheck[] = [];

  register(check: HealthCheck) {
    this.checks.push(check);
  }

  async run(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { healthy: boolean; message?: string }>;
  }> {
    const results: Record<string, { healthy: boolean; message?: string }> = {};
    let healthy = true;
    let degraded = false;

    for (const check of this.checks) {
      try {
        const result = await check.check();
        results[check.name] = result;
        if (!result.healthy) {
          if (check.critical) healthy = false;
          else degraded = true;
        }
      } catch (err) {
        results[check.name] = { healthy: false, message: String(err) };
        if (check.critical) healthy = false;
        else degraded = true;
      }
    }

    return {
      status: healthy ? (degraded ? 'degraded' : 'healthy') : 'unhealthy',
      checks: results,
    };
  }
}

// 使用
const health = new HealthMonitor();
health.register({
  name: 'database',
  critical: true,
  check: async () => {
    // await db.query('SELECT 1');
    return { healthy: true };
  },
});
health.register({
  name: 'cache',
  critical: false,
  check: async () => {
    // await cache.ping();
    return { healthy: true };
  },
});
```

---

## 9. 浏览器调试工具

- **Elements**: DOM 结构、CSS 样式实时编辑
- **Console**: 日志输出、JavaScript 执行
- **Sources**: 断点调试、调用栈、作用域查看
- **Network**: 请求/响应分析、性能瀑布图
- **Performance**: CPU 火焰图、渲染流水线分析
- **Memory**: 堆快照、内存泄漏检测

## 10. Node.js 调试

- **--inspect**: 启动 V8 Inspector 协议
- **ndb**: Chrome DevTools 风格的 Node 调试器
- **console.trace()**: 打印当前调用栈
- **Async Hooks**: 追踪异步资源生命周期

## 11. 日志级别规范

| 级别 | 用途 | 生产环境 |
|------|------|---------|
| DEBUG | 开发调试信息 | 关闭 |
| INFO | 正常流程记录 | 开启 |
| WARN | 潜在问题 | 开启 |
| ERROR | 功能异常 | 开启（告警） |
| FATAL | 系统崩溃 | 开启（紧急告警） |

结构化日志格式（JSON）便于机器解析和聚合。

## 12. 与相邻模块的关系

- **74-observability**: 可观测性体系
- **92-observability-lab**: 可观测性工具实践
- **39-performance-monitoring**: 性能监控专项

## 参考链接

- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Node.js Inspector Guide](https://nodejs.org/en/learn/getting-started/debugging)
- [Replay.io Documentation](https://docs.replay.io/)
- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Clinic.js - Node.js Performance Profiling](https://clinicjs.org/)
- [Pino - High Performance Node.js Logger](https://getpino.io/)
- [OpenTelemetry JS Documentation](https://opentelemetry.io/docs/languages/js/)
- [Sentry - Application Monitoring Platform](https://docs.sentry.io/)
- [Node.js Diagnostic Reporting](https://nodejs.org/api/report.html)
- [Web Vitals - Chrome Developers](https://developer.chrome.com/docs/web-platform/web-vitals)
- [Grafana - Observability Platform](https://grafana.com/docs/)
- [Prometheus - Monitoring System](https://prometheus.io/docs/)
- [Jaeger - Distributed Tracing](https://www.jaegertracing.io/docs/)
- [Zipkin - Distributed Tracing System](https://zipkin.io/pages/documentation.html)
- [Tempo - Grafana Distributed Tracing](https://grafana.com/docs/tempo/)
- [Loki - Log Aggregation](https://grafana.com/docs/loki/)
- [Fluentd - Data Collector](https://docs.fluentd.org/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Datadog APM Documentation](https://docs.datadoghq.com/tracing/)
- [New Relic APM](https://docs.newrelic.com/docs/apm/)
- [Honeycomb - Observability Platform](https://docs.honeycomb.io/)
- [Lightstep - Distributed Tracing](https://docs.lightstep.com/)
