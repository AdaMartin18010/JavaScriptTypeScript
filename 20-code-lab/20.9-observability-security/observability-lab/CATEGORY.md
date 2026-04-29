---
dimension: 综合
sub-dimension: Observability lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Observability lab 核心概念与工程实践。

## 包含内容

- **OpenTelemetry 自动埋点**：TracerProvider、Resource、Instrumentation 注册与上下文传播。
- **结构化日志实战**：Pino / Winston 集成、日志关联（trace_id / span_id 注入）、日志采样。
- **浏览器性能观测**：PerformanceObserver（Long Task、Layout Shift、Largest Contentful Paint）。
- **错误上报**：全局错误捕获（`window.onerror`、`unhandledrejection`）、Source Map 反解、聚合上报。
- **AI 可观测性**：LLM 调用链路追踪、Token 消耗指标、Prompt/Response 采样审计。

## 代码示例

### OpenTelemetry 基础 Tracer 设置

```typescript
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { context, propagation, trace } from '@opentelemetry/api';

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({ propagator: new W3CTraceContextPropagator() });

const tracer = trace.getTracer('observability-lab', '1.0.0');

async function tracedOperation() {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', 'ORD-12345');
    await fetchInventory();
    span.end();
  });
}
```

### 浏览器全局错误上报器

```typescript
class ErrorReporter {
  private endpoint: string;
  constructor(endpoint: string) { this.endpoint = endpoint; }

  init(): void {
    window.addEventListener('error', (e) => this.send({ type: 'error', message: e.message, stack: e.error?.stack }));
    window.addEventListener('unhandledrejection', (e) => this.send({ type: 'unhandledrejection', reason: String(e.reason) }));
  }

  private send(payload: object): void {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
    } else {
      fetch(this.endpoint, { method: 'POST', body: JSON.stringify(payload), keepalive: true });
    }
  }
}
```

### PerformanceObserver 采集 CLS & LCP

```typescript
const clsEntries: PerformanceEntry[] = [];
let lcpValue = 0;

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) clsEntries.push(entry);
  }
}).observe({ type: 'layout-shift', buffered: true });

new PerformanceObserver((list) => {
  const entries = list.getEntries();
  lcpValue = (entries[entries.length - 1] as PerformanceEntry & { startTime: number }).startTime;
}).observe({ type: 'largest-contentful-paint', buffered: true });

function getCLS(): number {
  return clsEntries.reduce((sum, e) => sum + (e as any).value, 0);
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 ai-observability.ts
- 📄 error-reporter.ts
- 📄 index.ts
- 📄 observability-lab.test.ts
- 📄 opentelemetry-setup.ts
- 📄 performance-observer.ts
- 📄 structured-logger.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OpenTelemetry JS API | 官方文档 | [opentelemetry.io/docs/languages/js/instrumentation/](https://opentelemetry.io/docs/languages/js/instrumentation/) |
| web.dev — Core Web Vitals | 指南 | [web.dev/vitals/](https://web.dev/vitals/) |
| MDN — PerformanceObserver | 文档 | [developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) |
| W3C Trace Context | 规范 | [w3.org/TR/trace-context/](https://www.w3.org/TR/trace-context/) |
| Chrome Developers — Reporting API | 文档 | [developer.chrome.com/docs/capabilities/web-apis/reporting](https://developer.chrome.com/docs/capabilities/web-apis/reporting) |
| OpenTelemetry Semantic Conventions | 规范 | [opentelemetry.io/docs/specs/semconv/](https://opentelemetry.io/docs/specs/semconv/) |

---

*最后更新: 2026-04-29*
