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

### 结构化日志关联 Trace ID

```typescript
// lib/logger.ts — 注入 trace_id / span_id 到每条日志
import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

export const logger = pino({
  level: 'info',
  mixin() {
    const span = trace.getSpan(context.active());
    if (!span) return {};
    const ctx = span.spanContext();
    return { trace_id: ctx.traceId, span_id: ctx.spanId };
  },
});

// 使用：日志自动携带分布式追踪 ID
logger.info('订单创建成功');
// => {"level":30,"time":...,"msg":"订单创建成功","trace_id":"abc...","span_id":"def..."}
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

### AI 可观测性：LLM 调用链路追踪

```typescript
// lib/ai-observability.ts — 追踪 LLM 调用与 Token 消耗
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('ai-observability', '1.0.0');

interface LLMRequest {
  model: string;
  prompt: string;
  maxTokens: number;
}

interface LLMResponse {
  text: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function tracedLLMCall(request: LLMRequest, callLLM: (r: LLMRequest) => Promise<LLMResponse>): Promise<LLMResponse> {
  return tracer.startActiveSpan('llm.completion', async (span) => {
    span.setAttribute('llm.model', request.model);
    span.setAttribute('llm.prompt.length', request.prompt.length);
    span.setAttribute('llm.max_tokens', request.maxTokens);

    const start = performance.now();
    try {
      const response = await callLLM(request);
      const latency = performance.now() - start;

      span.setAttribute('llm.response.length', response.text.length);
      span.setAttribute('llm.tokens.prompt', response.usage.promptTokens);
      span.setAttribute('llm.tokens.completion', response.usage.completionTokens);
      span.setAttribute('llm.tokens.total', response.usage.totalTokens);
      span.setAttribute('llm.latency_ms', latency);

      // 采样审计：低概率记录完整 Prompt/Response
      if (Math.random() < 0.01) {
        span.setAttribute('llm.prompt.sample', request.prompt.slice(0, 500));
        span.setAttribute('llm.response.sample', response.text.slice(0, 500));
      }

      return response;
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
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
| Jaeger — Distributed Tracing Platform | 工具 | [jaegertracing.io](https://www.jaegertracing.io/) |
| Prometheus — Monitoring & Alerting | 工具 | [prometheus.io](https://prometheus.io/) |
| Sentry — Error Tracking & Performance | 工具 | [sentry.io](https://sentry.io/) |
| Datadog — Observability Platform | 工具 | [docs.datadoghq.com](https://docs.datadoghq.com/) |
| OpenTelemetry LLM Semantic Conventions | 草案 | [opentelemetry.io/docs/specs/semconv/gen-ai/](https://opentelemetry.io/docs/specs/semconv/gen-ai/) |

---

*最后更新: 2026-04-29*
