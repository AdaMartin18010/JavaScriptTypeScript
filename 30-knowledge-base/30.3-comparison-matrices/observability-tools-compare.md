# 可观测性工具对比

> 日志、指标、追踪、告警工具选型矩阵。

---

## 对比矩阵

| 维度 | Datadog | New Relic | Grafana Stack | Highlight.io | Sentry |
|------|---------|-----------|---------------|--------------|--------|
| **日志** | ✅ | ✅ | Loki | ✅ | ❌ |
| **指标** | ✅ | ✅ | Prometheus | ❌ | ❌ |
| **APM/追踪** | ✅ | ✅ | Tempo + OpenTelemetry | ✅ | 部分 |
| **Session Replay** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **错误追踪** | ✅ | ✅ | 需集成 | ✅ | ✅ |
| **定价** | 高 | 高 | 开源 + 托管 | 中 | 中 |
| **开源** | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 深度对比：Grafana vs Datadog vs New Relic vs Honeycomb

| 维度 | Grafana Stack | Datadog | New Relic | Honeycomb |
|------|--------------|---------|-----------|-----------|
| **定位** | 开源可观测性平台 | 全托管 SaaS 监控 | 全托管 APM + 可观测性 | 事件驱动调试 / 高基数分析 |
| **核心组件** | Grafana + Prometheus + Loki + Tempo + Mimir | 统一 Agent + 后端 | OneAgent / OpenTelemetry | Honeycomb SDK / OTel |
| **数据模型** | 指标 (TSDB) + 日志 + 追踪 | 指标 + 日志 + 追踪 + 剖析 | 指标 + 事件 + 日志 + 追踪 | 事件 (Wide Events) |
| **高基数支持** | ⚠️ Prometheus 有限制 | ✅ 托管解决 | ✅ 良好 | ⭐⭐⭐⭐⭐ 核心优势 |
| **查询语言** | PromQL / LogQL / TraceQL | 自定义 DSL | NRQL | BubbleUp / Query Builder |
| **告警系统** | Alertmanager / Grafana Alerting | 内置 (强大) | 内置 (强大) | 基础 (SLO 驱动) |
| **开源程度** | ⭐⭐⭐⭐⭐ (全栈开源) | ❌ 闭源 | ❌ 闭源 | SDK 开源，后端闭源 |
| **自托管成本** | 中 (基础设施) | — | — | — |
| **SaaS 定价** | Grafana Cloud 免费 tier | $15/主机/月起 | 免费 tier + 按数据量 | 按事件量，免费 tier |
| **OpenTelemetry** | ⭐⭐⭐⭐⭐ 原生深度集成 | ✅ 支持 | ✅ 支持 | ⭐⭐⭐⭐⭐ 原生深度集成 |
| **适用场景** | 云原生 / 混合云 / 开源优先 | 企业全栈 / 快速启动 | 企业 APM / 遗留系统现代化 | 调试复杂系统 / 微服务追踪 |

---

## 开源组合

| 功能 | 工具 |
|------|------|
| 日志 | Loki / Fluentd |
| 指标 | Prometheus + Grafana |
| 追踪 | Jaeger / Zipkin |
| 告警 | AlertManager / PagerDuty |

---

## 配置示例

### OpenTelemetry + Grafana Stack (Docker Compose)

```yaml
# docker-compose.observability.yml
version: '3.8'

services:
  # 指标收集
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  # 日志收集
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  # 追踪收集
  tempo:
    image: grafana/tempo:latest
    ports:
      - "3200:3200"   # Tempo query
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
    volumes:
      - ./tempo.yml:/etc/tempo.yaml
    command: ["-config.file=/etc/tempo.yaml"]

  # 可视化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards

  # OpenTelemetry Collector
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yml"]
    volumes:
      - ./otel-collector-config.yml:/etc/otel-collector-config.yml
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8889:8889"   # Prometheus exporter metrics
```

### Node.js 应用接入 OpenTelemetry

```typescript
// tracing.ts — 应用启动时加载
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'nextjs-api',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    }),
    exportIntervalMillis: 60000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('Tracing terminated')).catch(console.error);
});

// 在应用入口导入: import './tracing';
```

### Sentry 错误追踪 (Next.js)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(
  { /* next config */ },
  { silent: true, org: 'my-org', project: 'my-project' }
);
```

### 高性能日志：Pino + OpenTelemetry 关联

```typescript
import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

// 创建带 trace context 的 logger
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level(label) { return { level: label }; },
    log(object) {
      const spanContext = trace.getSpanContext(context.active());
      if (spanContext) {
        return {
          ...object,
          trace_id: spanContext.traceId,
          span_id: spanContext.spanId,
          trace_flags: spanContext.traceFlags,
        };
      }
      return object;
    },
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

// 使用示例：日志自动关联当前 trace
async function handleRequest(req: Request) {
  logger.info({ reqId: req.headers.get('x-request-id') }, 'Request started');
  // ... 业务逻辑
  logger.info('Request completed');
}
```

### 自定义业务指标上报（OTel Counter + Histogram）

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('checkout-service');

// 计数器：订单创建次数
const orderCounter = meter.createCounter('orders.created', {
  description: 'Total number of orders created',
});

// 直方图：订单处理延迟
const orderLatency = meter.createHistogram('orders.processing.duration', {
  description: 'Order processing duration in ms',
  unit: 'ms',
});

function createOrder(userId: string, region: string) {
  const start = performance.now();
  orderCounter.add(1, { region, currency: 'USD' });

  try {
    // ... 创建订单逻辑
    const duration = performance.now() - start;
    orderLatency.record(duration, { region, status: 'success' });
  } catch (e) {
    orderLatency.record(performance.now() - start, { region, status: 'error' });
    throw e;
  }
}
```

### Grafana Dashboard 声明式配置（Provisioning）

```yaml
# provisioning/dashboards/dashboard.yml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: 'Node.js Services'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

```json
{
  "dashboard": {
    "title": "Node.js Service Health",
    "panels": [
      {
        "title": "Request Rate",
        "type": "timeseries",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"nextjs-api\"}[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "P95 Latency",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### PromQL 常用查询示例

```promql
# 每秒请求率（按状态码分组）
rate(http_requests_total[5m])

# P95 延迟
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# 错误率 > 1% 时触发
(
  sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
) > 0.01

# 内存使用百分比
(
  process_resident_memory_bytes{job="nodejs-app"}
  /
  container_spec_memory_limit_bytes{job="nodejs-app"}
) * 100

# CPU 使用率（容器）
rate(container_cpu_usage_seconds_total{pod=~"my-app-.*"}[5m])
```

### OpenTelemetry Collector 配置

```yaml
# otel-collector-config.yml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  resource:
    attributes:
      - key: environment
        value: production
        action: upsert

exporters:
  prometheusremotewrite:
    endpoint: http://prometheus:9090/api/v1/write
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true
  loki:
    endpoint: http://loki:3100/loki/api/v1/push

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [prometheusremotewrite]
    logs:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [loki]
```

### Alertmanager 告警规则

```yaml
# alert-rules.yml
groups:
  - name: nodejs-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "High P99 latency on {{ $labels.service }}"
```

---

## 选型建议

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 开源优先 / 成本敏感 | Grafana Stack + OpenTelemetry | 全栈开源，社区活跃 |
| 快速启动 / 全托管 | Datadog / New Relic | 一键集成，功能全面 |
| 高基数调试 / 微服务 | Honeycomb | 事件驱动分析，追踪粒度极细 |
| 前端错误监控 | Sentry + Highlight.io | Session Replay + 错误追踪 |
| 云原生 Kubernetes | Grafana Stack + Prometheus Operator | K8s 原生集成 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| OpenTelemetry Docs | <https://opentelemetry.io/docs/> | 官方文档与规范 |
| OpenTelemetry Specification | <https://opentelemetry.io/docs/specs/otel/> | 技术规范 |
| OpenTelemetry JS API | <https://opentelemetry.io/docs/languages/js/> | Node.js / 浏览器 SDK |
| Grafana Docs | <https://grafana.com/docs/> | 官方文档 |
| Prometheus Docs | <https://prometheus.io/docs/> | 时序数据库文档 |
| PromQL Cheat Sheet | <https://promlabs.com/promql-cheat-sheet/> | PromQL 速查 |
| Loki Docs | <https://grafana.com/docs/loki/latest/> | 日志聚合系统 |
| Tempo Docs | <https://grafana.com/docs/tempo/latest/> | 分布式追踪后端 |
| Datadog Docs | <https://docs.datadoghq.com/> | 官方文档 |
| New Relic Docs | <https://docs.newrelic.com/> | 官方文档 |
| Honeycomb Docs | <https://docs.honeycomb.io/> | 官方文档 |
| Sentry Docs | <https://docs.sentry.io/> | 错误追踪文档 |
| Sentry OpenTelemetry | <https://docs.sentry.io/platforms/javascript/guides/node/otel/> | Sentry + OTel 集成 |
| Google SRE Book | <https://sre.google/sre-book/table-of-contents/> | 站点可靠性工程 |
| Distributed Systems Observability | <https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/> | O'Reilly 可观测性专著 |
| CNCF Observability Landscape | <https://landscape.cncf.io/guide#observability-and-analysis> | 云原生可观测性全景 |
| Pino Docs | <https://getpino.io/#/docs/api> | 高性能 Node.js 日志库 |
| OpenTelemetry Collector | <https://opentelemetry.io/docs/collector/> | 采集器配置指南 |
| Jaeger Documentation | <https://www.jaegertracing.io/docs/> | 开源分布式追踪 |
| Alertmanager Documentation | <https://prometheus.io/docs/alerting/latest/alertmanager/> | 告警管理 |
| RED Method (Request-Error-Duration) | <https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/> | 服务监控方法论 |
| USE Method (Utilization-Saturation-Errors) | <http://www.brendangregg.com/usemethod.html> | 资源监控方法论 |
| OpenTelemetry Semantic Conventions | <https://opentelemetry.io/docs/specs/semconv/> | 标准化属性命名 |

---

*最后更新: 2026-04-29*
