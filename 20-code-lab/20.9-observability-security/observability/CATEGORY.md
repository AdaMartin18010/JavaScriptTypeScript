---
dimension: 综合
sub-dimension: Observability
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Observability 核心概念与工程实践。

## 包含内容

- **指标（Metrics）**：Counter、Gauge、Histogram、Summary；Prometheus exposition 格式。
- **日志（Logging）**：结构化日志（JSON Lines）、日志级别、关联 ID（Correlation ID）、采样策略。
- **链路追踪（Tracing）**：OpenTelemetry Span、上下文传播（W3C Trace Context）、Baggage。
- **健康检查（Health Checks）**：存活探针（liveness）、就绪探针（readiness）、依赖项检查。
- **告警（Alerting）**：基于阈值的规则、SLO/SLI 定义、告警降噪与分级。

## 代码示例

### 结构化日志记录器（Pino 风格）

```typescript
interface LogEntry {
  level: string;
  msg: string;
  timestamp: string;
  traceId?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private traceId: string | undefined;

  child(bindings: Record<string, unknown>): StructuredLogger {
    const child = new StructuredLogger();
    child.traceId = (bindings.traceId as string) ?? this.traceId;
    return child;
  }

  info(msg: string, extra?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level: 'info',
      msg,
      timestamp: new Date().toISOString(),
      traceId: this.traceId,
      ...extra,
    };
    console.log(JSON.stringify(entry));
  }
}
```

### 简易 Prometheus Counter / Histogram

```typescript
class PrometheusMetrics {
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  inc(name: string, labels: Record<string, string> = {}, value = 1): void {
    const key = `${name}{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`;
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = `${name}_bucket{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`;
    const arr = this.histograms.get(key) ?? [];
    arr.push(value);
    this.histograms.set(key, arr);
  }

  serialize(): string {
    const lines: string[] = [];
    this.counters.forEach((v, k) => lines.push(`${k} ${v}`));
    return lines.join('\n');
  }
}
```

### HTTP 健康检查端点

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, { status: 'pass' | 'fail'; responseTimeMs: number }>;
}

async function healthCheck(deps: Array<{ name: string; check: () => Promise<void> }>): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};
  let overall: HealthStatus['status'] = 'healthy';

  await Promise.all(deps.map(async ({ name, check }) => {
    const start = performance.now();
    try {
      await check();
      checks[name] = { status: 'pass', responseTimeMs: Math.round(performance.now() - start) };
    } catch {
      checks[name] = { status: 'fail', responseTimeMs: Math.round(performance.now() - start) };
      overall = 'unhealthy';
    }
  }));

  return { status: overall, checks };
}
```

### OpenTelemetry 手动 Instrumentation（Node.js）

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

// 初始化 SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'payment-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  }),
});
sdk.start();

// 创建 Tracer 并手动埋点
const tracer = trace.getTracer('payment-module');

async function processPayment(orderId: string, amount: number): Promise<void> {
  const span = tracer.startSpan('processPayment', {
    attributes: { 'payment.order_id': orderId, 'payment.amount': amount },
  });

  try {
    // 将 span 注入当前上下文
    await context.with(trace.setSpan(context.active(), span), async () => {
      await validateBalance(amount);
      await chargeCustomer(orderId);
    });
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    span.recordException(err as Error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
    throw err;
  } finally {
    span.end();
  }
}
```

### W3C Trace Context 传播（HTTP 客户端）

```typescript
import { context, propagation, trace } from '@opentelemetry/api';

async function fetchWithTrace(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {};
  // 将当前 trace context 注入请求头
  propagation.inject(context.active(), headers, {
    set(carrier, key, value) { carrier[key] = value; },
  });

  return fetch(url, {
    ...options,
    headers: { ...options.headers, ...headers },
  });
}

// 服务端接收并恢复上下文
import { extract } from '@opentelemetry/api';

function handleRequest(req: Request): void {
  const parentContext = propagation.extract(context.active(), req.headers, {
    get(carrier, key) { return carrier.get(key) ?? undefined; },
  });

  const tracer = trace.getTracer('http-server');
  const span = tracer.startSpan('handleRequest', undefined, parentContext);
  // ... 处理请求
}
```

### Baggage 传递业务上下文

```typescript
import { context, propagation, baggage, createBaggage } from '@opentelemetry/api';

// 上游服务写入 baggage
const enrichedContext = propagation.setBaggage(
  context.active(),
  createBaggage({
    'user.tier': { value: 'premium' },
    'tenant.id': { value: 'acme-corp' },
  })
);

// 下游服务读取 baggage
const bag = propagation.getBaggage(context.active());
const userTier = bag?.getEntry('user.tier')?.value ?? 'free';
```

### 告警规则 DSL（Prometheus Alertmanager 风格）

```yaml
# alerting.rules.yml
groups:
  - name: payment_alerts
    rules:
      - alert: HighPaymentFailureRate
        expr: |
          (
            sum(rate(payment_errors_total[5m]))
            /
            sum(rate(payment_total[5m]))
          ) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Payment failure rate > 5%"
          runbook_url: "https://wiki.internal/runbooks/payment-failures"
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 alerting.test.ts
- 📄 alerting.ts
- 📄 health-check.test.ts
- 📄 health-check.ts
- 📄 index.ts
- 📄 logging.test.ts
- 📄 logging.ts
- 📄 metrics.test.ts
- 📄 metrics.ts
- 📄 observability-stack.test.ts
- 📄 observability-stack.ts
- ... 等 2 个条目

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OpenTelemetry JS | 官方文档 | [opentelemetry.io/docs/languages/js/](https://opentelemetry.io/docs/languages/js/) |
| Prometheus — Best Practices | 文档 | [prometheus.io/docs/practices](https://prometheus.io/docs/practices/) |
| W3C Trace Context | 规范 | [w3.org/TR/trace-context/](https://www.w3.org/TR/trace-context/) |
| Google SRE Book — Monitoring | 书籍 | [sre.google/sre-book/monitoring-distributed-systems/](https://sre.google/sre-book/monitoring-distributed-systems/) |
| MDN — Performance API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance) |
| Grafana — Observability Guide | 指南 | [grafana.com/docs/grafana/latest/introduction/](https://grafana.com/docs/grafana/latest/introduction/) |
| CNCF — Observability Whitepaper | 白皮书 | [github.com/cncf/tag-observability/blob/main/whitepaper.md](https://github.com/cncf/tag-observability/blob/main/whitepaper.md) |
| OpenTelemetry Baggage | 规范 | [opentelemetry.io/docs/concepts/signals/baggage/](https://opentelemetry.io/docs/concepts/signals/baggage/) |
| Jaeger — Distributed Tracing | 官方文档 | [www.jaegertracing.io/docs/](https://www.jaegertracing.io/docs/) |
| Honeycomb — Observability Engineering | 书籍/博客 | [www.honeycomb.io/blog/what-is-observability](https://www.honeycomb.io/blog/what-is-observability) |
| OpenTelemetry Collector | 官方文档 | [opentelemetry.io/docs/collector/](https://opentelemetry.io/docs/collector/) |
| Pino — Node.js Logger | GitHub / 文档 | [github.com/pinojs/pino](https://github.com/pinojs/pino) |
| PromQL Cheatsheet | 指南 | [promlabs.com/promql-cheat-sheet/](https://promlabs.com/promql-cheat-sheet/) |
| Google — Four Golden Signals | SRE 博客 | [sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals](https://sre.google/sre-book/monitoring-distributed-systems/) |
| Datadog — Distributed Tracing | 指南 | [docs.datadoghq.com/tracing/](https://docs.datadoghq.com/tracing/) |

---

*最后更新: 2026-04-29*
