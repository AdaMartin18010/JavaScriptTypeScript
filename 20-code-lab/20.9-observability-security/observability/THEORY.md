# 可观测性 — 理论基础

## 1. 可观测性的定义

可观测性（Observability）是指通过系统的外部输出（指标、日志、追踪）推断其内部状态的能力。由控制理论引入软件工程，是分布式系统的核心运维手段。

## 2. 三大支柱详解

### Metrics（指标）

- **计数器（Counter）**: 单调递增的累积值（请求总数、错误总数）
- **仪表盘（Gauge）**: 可上下波动的瞬时值（CPU 使用率、队列长度）
- **直方图（Histogram）**: 采样值的分布（请求延迟分布、文件大小分布）
- **摘要（Summary）**: 计算滑动时间窗口内的分位数（P50、P95、P99）

### Logs（日志）

- **结构化日志**: JSON 格式，携带时间戳、级别、trace_id、服务名等字段
- **日志聚合**: ELK（Elasticsearch + Logstash + Kibana）、Loki、Splunk
- **日志采样**: 高流量场景下的自适应采样（保留错误日志，采样成功日志）

### Traces（追踪）

- **Span**: 表示一个操作单元，包含操作名、开始时间、持续时间、标签、日志
- **Context Propagation**: 通过 HTTP 头（traceparent、tracestate）传递追踪上下文
- **Baggage**: 跨 Span 传递的业务上下文（用户ID、租户ID）

## 3. RED 方法

面向微服务的监控方法论：

- **Rate**: 每秒请求数
- **Errors**: 每秒错误请求数
- **Duration**: 请求处理时间分布

## 4. 三大支柱对比

| 维度 | Metrics | Logs | Traces |
|------|---------|------|--------|
| 数据量 | 小（聚合后） | 大（每条记录） | 中（按请求采样） |
| 存储成本 | 低 | 高 | 中 |
| 查询延迟 | 毫秒级 | 秒级 | 秒级 |
| 适用场景 | 告警、仪表盘 | 根因分析 | 分布式链路追踪 |
| 典型工具 | Prometheus、Datadog | ELK、Loki | Jaeger、Zipkin |

## 5. 代码示例：OpenTelemetry 基础用法

```javascript
// 初始化 Tracer
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('my-service');

// 创建 Span
async function processOrder(orderId) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', orderId);
    try {
      const result = await validateAndCharge(orderId);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## 6. 代码示例：Prometheus Client 指标埋点

```typescript
import { Counter, Histogram, Registry } from 'prom-client';

const register = new Registry();

// 定义计数器：记录 HTTP 请求总数
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// 定义直方图：记录请求延迟分布
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Express 中间件集成
function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = { method: req.method, route: req.route?.path || 'unknown' };
    httpRequestsTotal.inc({ ...labels, status_code: res.statusCode });
    end(labels);
  });
  next();
}
```

## 7. 代码示例：结构化日志与 Trace 上下文关联

```typescript
import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) { return { level: label }; },
  },
  base: { service: 'payment-service', pid: process.pid },
});

// 自动注入 trace_id 和 span_id 到每条日志
function getLoggerWithTrace() {
  const span = trace.getSpan(context.active());
  if (!span) return logger;
  const { traceId, spanId } = span.spanContext();
  return logger.child({ trace_id: traceId, span_id: spanId });
}

// 使用示例
async function chargeUser(userId: string, amount: number) {
  const log = getLoggerWithTrace();
  log.info({ userId, amount }, 'Charging user');
  try {
    await gateway.charge(userId, amount);
    log.info({ userId }, 'Charge succeeded');
  } catch (err) {
    log.error({ err, userId }, 'Charge failed');
    throw err;
  }
}
```

## 8. 代码示例：Baggage 跨服务传播

```typescript
import { propagation, context, baggage } from '@opentelemetry/api';

// 在入口服务设置 Baggage（业务上下文）
function setTenantContext(tenantId: string, userTier: string) {
  const currentBaggage = baggage.getActiveBaggage() || baggage.createBaggage();
  const newBaggage = currentBaggage
    .setEntry('tenant.id', { value: tenantId })
    .setEntry('user.tier', { value: userTier });
  return propagation.setBaggage(context.active(), newBaggage);
}

// 在下游服务读取 Baggage
function getTenantContext() {
  const bg = baggage.getBaggage(context.active());
  return {
    tenantId: bg?.getEntry('tenant.id')?.value,
    userTier: bg?.getEntry('user.tier')?.value,
  };
}
```

## 9. RED 方法仪表盘查询示例（PromQL）

```promql
# Rate：每秒请求数
sum(rate(http_requests_total[5m])) by (route)

# Errors：每秒错误率
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route)
  /
sum(rate(http_requests_total[5m])) by (route)

# Duration：P99 延迟
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
)
```

## 10. 权威参考

- [OpenTelemetry Official Docs](https://opentelemetry.io/docs/) — 云原生可观测性标准
- [Google SRE Book — Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) — Google 分布式监控最佳实践
- [Prometheus Best Practices](https://prometheus.io/docs/practices/) — 指标命名与告警设计
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分布式追踪上下文规范
- [OpenTelemetry Baggage Spec](https://opentelemetry.io/docs/concepts/signals/baggage/) — Baggage 传播规范
- [CNCF Observability Whitepaper](https://github.com/cncf/tag-observability/blob/main/whitepaper.md) — CNCF 可观测性白皮书
- [Honeycomb — Observability Guide](https://docs.honeycomb.io/concepts/observability/) — 事件驱动可观测性实践
- [Jaeger Documentation](https://www.jaegertracing.io/docs/) — 分布式追踪系统文档
- [Pino — Node.js Logger](https://getpino.io/) — 高性能结构化日志库
- [Grafana Loki](https://grafana.com/docs/loki/latest/) — 水平可扩展日志聚合系统

## 11. 与相邻模块的关系

- **92-observability-lab**: 可观测性的代码实现与工具链
- **17-debugging-monitoring**: 调试与监控基础
- **22-deployment-devops**: DevOps 中的监控集成


---

## 11. 进阶代码示例

### OpenTelemetry Node.js 自动 Instrumentation

```typescript
// otel-auto-instrument.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => sdk.shutdown().then(() => process.exit(0)));
```

### 自定义 Prometheus Pushgateway 上报

```typescript
// pushgateway-client.ts
import { Pushgateway, Registry, Counter } from 'prom-client';

const register = new Registry();
const jobErrors = new Counter({
  name: 'job_errors_total',
  help: 'Total batch job errors',
  registers: [register],
});

const gateway = new Pushgateway('http://localhost:9091', undefined, register);

async function pushMetrics(jobName: string) {
  jobErrors.inc();
  await gateway.pushAdd({ jobName });
  console.log(`Metrics pushed for ${jobName}`);
}

pushMetrics('nightly-report');
```

### 聚合健康检查端点

```typescript
// aggregated-health.ts
interface HealthCheck {
  name: string;
  check: () => Promise<{ status: 'pass' | 'fail'; responseTimeMs: number }>;
}

async function aggregatedHealth(checks: HealthCheck[]) {
  const results = await Promise.all(
    checks.map(async ({ name, check }) => {
      const start = performance.now();
      try {
        const result = await check();
        return { name, ...result };
      } catch {
        return { name, status: 'fail' as const, responseTimeMs: Math.round(performance.now() - start) };
      }
    })
  );
  const overall = results.every(r => r.status === 'pass') ? 'healthy' : 'unhealthy';
  return { status: overall, checks: results };
}
```

### Sentry 错误监控集成

```typescript
// sentry-integration.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.httpIntegration({ breadcrumbs: true }),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.1,
});

// Express 错误处理中间件
app.use(Sentry.Handlers.errorHandler());

// 手动捕获异常
async function riskyOperation() {
  try {
    await externalAPICall();
  } catch (err) {
    Sentry.captureException(err, {
      tags: { component: 'payment-gateway' },
      extra: { userId, transactionId },
    });
    throw err;
  }
}
```

### Grafana Loki 日志推送客户端

```typescript
// loki-client.ts
interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][]; // [timestamp_ns, log_line]
}

export class LokiClient {
  constructor(private url: string, private labels: Record<string, string>) {}

  async push(level: string, message: string, extra: Record<string, unknown> = {}) {
    const timestamp = `${Date.now()}000000`;
    const logLine = JSON.stringify({
      level,
      message,
      ...extra,
      ...this.labels,
      time: new Date().toISOString(),
    });

    const payload = { streams: [{ stream: { level, ...this.labels }, values: [[timestamp, logLine]] }] };

    await fetch(`${this.url}/loki/api/v1/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
}
```

### 分布式追踪上下文传播（Fetch 拦截器）

```typescript
// tracing-fetch.ts
import { context, propagation, trace } from '@opentelemetry/api';

export function tracedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const tracer = trace.getTracer('http-client');
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  return tracer.startActiveSpan(`HTTP ${init?.method ?? 'GET'}`, async (span) => {
    span.setAttribute('http.url', url);
    span.setAttribute('http.method', init?.method ?? 'GET');

    // 将 trace 上下文注入请求头
    const headers = new Headers(init?.headers);
    propagation.inject(context.active(), headers, {
      set: (h, key, value) => h.set(key, value as string),
    });

    try {
      const response = await fetch(input, { ...init, headers });
      span.setAttribute('http.status_code', response.status);
      span.setStatus({ code: response.ok ? 1 : 2 });
      return response;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2, message: (err as Error).message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## 12. 新增权威参考链接

- [Grafana Tempo](https://grafana.com/docs/tempo/latest/) — 分布式追踪后端
- [OpenMetrics Specification](https://openmetrics.io/) — 指标暴露标准
- [Google SRE Workbook — SLI/SLO](https://sre.google/workbook/implementing-slos/) — SLI/SLO 实践
- [Honeycomb Observability](https://www.honeycomb.io/) — 事件驱动可观测性
- [Fluentd / Fluent Bit](https://www.fluentd.org/) — 日志收集与转发
- [Vector by Datadog](https://vector.dev/) — 可观测性数据管道
- [eBPF.io](https://ebpf.io/) — 内核级可观测性技术
- [Sentry Documentation](https://docs.sentry.io/platforms/node/) — 应用错误监控平台
- [Datadog APM](https://docs.datadoghq.com/tracing/) — 应用性能监控
- [New Relic — OpenTelemetry](https://docs.newrelic.com/docs/more-integrations/open-source-telemetry-integrations/opentelemetry/opentelemetry-introduction/) — OTel 集成指南
- [Signoz — Open Source APM](https://signoz.io/docs/) — 开源可观测性平台
- [UptimeRobot](https://uptimerobot.com/) — 外部可用性监控
- [Grafana OnCall](https://grafana.com/docs/oncall/latest/) — 开源告警响应编排
- [OpenCost — Kubernetes Cost Monitoring](https://www.opencost.io/docs/) — K8s 成本可观测性
