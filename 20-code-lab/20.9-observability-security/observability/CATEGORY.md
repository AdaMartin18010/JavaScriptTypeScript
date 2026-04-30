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

### SLI/SLO 计算器

```typescript
// sli-calculator.ts — 服务水平指标与目标计算
interface SLODefinition {
  name: string;
  target: number; // 0.0 - 1.0, e.g., 0.999
  window: '28d' | '30d' | '90d';
}

interface SLIMeasurement {
  goodEvents: number;
  totalEvents: number;
}

class SLOCalculator {
  calculateErrorBudget(slo: SLODefinition, measurement: SLIMeasurement): {
    currentSLI: number;
    errorBudgetRemaining: number;
    errorBudgetTotal: number;
    burnRate: number;
    status: 'healthy' | 'at-risk' | 'exhausted';
  } {
    const currentSLI = measurement.goodEvents / measurement.totalEvents;
    const errorBudgetTotal = (1 - slo.target) * measurement.totalEvents;
    const errorBudgetUsed = measurement.totalEvents - measurement.goodEvents;
    const errorBudgetRemaining = errorBudgetTotal - errorBudgetUsed;
    const burnRate = errorBudgetUsed / errorBudgetTotal;

    let status: 'healthy' | 'at-risk' | 'exhausted';
    if (burnRate >= 1) status = 'exhausted';
    else if (burnRate > 0.7) status = 'at-risk';
    else status = 'healthy';

    return { currentSLI, errorBudgetRemaining, errorBudgetTotal, burnRate, status };
  }

  // 基于消耗速率预测 SLO 违约时间
  predictExhaustion(slo: SLODefinition, measurement: SLIMeasurement): number | null {
    const { errorBudgetRemaining, burnRate } = this.calculateErrorBudget(slo, measurement);
    if (burnRate <= 0) return null;

    const windowDays = parseInt(slo.window);
    const daysElapsed = windowDays * burnRate;
    const daysRemaining = windowDays - daysElapsed;
    return daysRemaining > 0 ? daysRemaining : 0;
  }
}

// 示例：99.9% 可用性 SLO
const slo: SLODefinition = { name: 'api-availability', target: 0.999, window: '30d' };
const measurement: SLIMeasurement = { goodEvents: 999200, totalEvents: 1000000 };
const calc = new SLOCalculator();
console.log(calc.calculateErrorBudget(slo, measurement));
```

### 日志采样策略

```typescript
// log-sampling.ts — 结构化日志采样减少成本
interface SamplingStrategy {
  shouldLog(level: string, traceId: string): boolean;
}

class RateLimitSampling implements SamplingStrategy {
  private counters = new Map<string, number>();
  private lastReset = Date.now();

  constructor(
    private maxPerSecond: number = 100,
    private resetIntervalMs: number = 1000
  ) {}

  shouldLog(_level: string, traceId: string): boolean {
    const now = Date.now();
    if (now - this.lastReset > this.resetIntervalMs) {
      this.counters.clear();
      this.lastReset = now;
    }

    const key = traceId.slice(0, 8); // 按 trace 前缀采样
    const current = this.counters.get(key) ?? 0;
    if (current >= this.maxPerSecond) return false;

    this.counters.set(key, current + 1);
    return true;
  }
}

class LevelBasedSampling implements SamplingStrategy {
  constructor(private rates: Record<string, number> = {
    error: 1.0,
    warn: 0.5,
    info: 0.1,
    debug: 0.01,
  }) {}

  shouldLog(level: string, _traceId: string): boolean {
    const rate = this.rates[level] ?? 1.0;
    return Math.random() < rate;
  }
}
```

### OpenTelemetry 自动埋点与 Hono 集成

```typescript
// otel-hono-auto.ts — Hono 框架的 OpenTelemetry 自动埋点
import { Hono } from 'hono';
import { trace, context, SpanKind, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('hono-app', '1.0.0');

export function createTelemetryMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    const method = c.req.method;
    const path = c.req.path;

    const span = tracer.startSpan(`HTTP ${method}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': method,
        'http.route': path,
        'http.target': c.req.url,
        'http.scheme': c.req.url.startsWith('https') ? 'https' : 'http',
      },
    });

    try {
      await context.with(trace.setSpan(context.active(), span), async () => {
        await next();
      });

      span.setAttribute('http.status_code', c.res.status);
      if (c.res.status >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      throw err;
    } finally {
      span.end();
    }
  };
}

// 使用
const app = new Hono();
app.use('*', createTelemetryMiddleware());

app.get('/api/users', async (c) => {
  const currentSpan = trace.getSpan(context.active());
  currentSpan?.setAttribute('db.table', 'users');
  // ... 查询数据库
  return c.json([]);
});
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
| Google — Four Golden Signals | SRE 博客 | [sre.google/sre-book/monitoring-distributed-systems/](https://sre.google/sre-book/monitoring-distributed-systems/) |
| Datadog — Distributed Tracing | 指南 | [docs.datadoghq.com/tracing/](https://docs.datadoghq.com/tracing/) |
| SLI/SLO Workshop — Google | 官方指南 | [sre.google/workbook/implementing-slos/](https://sre.google/workbook/implementing-slos/) |
| OpenTelemetry Metrics API | 官方文档 | [opentelemetry.io/docs/concepts/signals/metrics/](https://opentelemetry.io/docs/concepts/signals/metrics/) |
| Prometheus Alertmanager | 官方文档 | [prometheus.io/docs/alerting/latest/alertmanager/](https://prometheus.io/docs/alerting/latest/alertmanager/) |
| Grafana Loki — Log Aggregation | 官方文档 | [grafana.com/docs/loki/latest/](https://grafana.com/docs/loki/latest/) |
| Tempo — Distributed Tracing | 官方文档 | [grafana.com/docs/tempo/latest/](https://grafana.com/docs/tempo/latest/) |
| RFC 5424 — Syslog Protocol | 标准 | [datatracker.ietf.org/doc/html/rfc5424](https://datatracker.ietf.org/doc/html/rfc5424) |
| OpenTelemetry Semantic Conventions | 官方文档 | [opentelemetry.io/docs/concepts/semantic-conventions/](https://opentelemetry.io/docs/concepts/semantic-conventions/) |
| Site Reliability Workbook — Google | 书籍 | [sre.google/workbook/table-of-contents/](https://sre.google/workbook/table-of-contents/) |
| OpenTelemetry JS Auto-Instrumentations | GitHub | [github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node) |
| Hono OpenTelemetry Middleware | GitHub | [github.com/honojs/middleware/tree/main/packages/opentelemetry](https://github.com/honojs/middleware/tree/main/packages/opentelemetry) |
| OpenTelemetry Logs API | 官方文档 | [opentelemetry.io/docs/concepts/signals/logs/](https://opentelemetry.io/docs/concepts/signals/logs/) |
| Prometheus Recording Rules | 官方文档 | [prometheus.io/docs/prometheus/latest/configuration/recording_rules/](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/) |

---

*最后更新: 2026-04-30*
