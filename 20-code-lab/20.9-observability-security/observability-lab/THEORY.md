# 可观测性实验室 — 理论基础

## 1. 可观测性三大支柱

### 1.1 Metrics（指标）

聚合的数值数据，用于趋势分析和告警：

- **系统指标**: CPU、内存、网络、磁盘
- **应用指标**: 请求数、错误率、延迟（P50/P95/P99）
- **业务指标**: 转化率、活跃用户、收入

### 1.2 Logs（日志）

离散的事件记录，用于故障排查：

- **结构化日志**: JSON 格式，便于机器解析和聚合
- **日志级别**: DEBUG → INFO → WARN → ERROR → FATAL
- **上下文传播**: 每个日志携带 trace_id、span_id、用户ID

### 1.3 Traces（追踪）

分布式请求链路，用于定位性能瓶颈：

- **Span**: 单个操作单元（如一次数据库查询）
- **Trace**: 一次完整请求的所有 Span 集合
- **OpenTelemetry**: 行业标准，统一数据格式和采集协议

## 2. 可观测性平台对比

| 平台 | 开源性 | 数据存储 | 核心优势 | 适用规模 | 语言支持 | 定价模式 |
|------|--------|---------|---------|---------|---------|---------|
| **OpenTelemetry** | 完全开源 | 自有后端 | vendor-neutral、标准化 | 任意 | 全语言 | 免费（自托管） |
| **Datadog** | 闭源 | SaaS | 一体化 APM、强大仪表盘 | 中大型 | 全语言 | 按主机+数据量 |
| **New Relic** | 闭源 | SaaS | AI 辅助分析、全栈观测 | 中大型 | 全语言 | 按数据摄入 |
| **Grafana Stack** | 开源 | 自托管 | 灵活可视化、低成本 | 中小 | 全语言 | 免费/企业版 |
| **Honeycomb** | 闭源 | SaaS | 高基数分析、事件驱动 | 中大型 | 全语言 | 按事件数 |
| **Jaeger** | 开源 | 自托管 | 分布式追踪专用 | 任意 | 多语言 | 免费 |
| **Prometheus** | 开源 | 本地TSDB | 指标采集标准 | 中小 | 多语言 | 免费 |
| **SigNoz** | 开源 | 自托管 | OpenTelemetry 原生 UI | 中小 | 全语言 | 免费/云版 |

## 3. OpenTelemetry 架构

```
应用代码 → Instrumentation Library → OTLP → Collector → Backend (Prometheus/Jaeger/Grafana)
```

- **Instrumentation**: 自动或手动埋点，生成 Metrics/Logs/Traces
- **OTLP**: OpenTelemetry Protocol，基于 gRPC/HTTP 的数据传输
- **Collector**: 接收、处理、导出遥测数据的代理

## 4. 代码示例：OpenTelemetry Node.js 完整链路追踪

```typescript
// tracing.ts — OpenTelemetry 初始化配置
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'user-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://otel-collector:4318/v1/metrics',
    }),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => sdk.shutdown());
```

```typescript
// userService.ts — 手动埋点业务逻辑
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('user-service', '1.0.0');

async function getUserWithOrders(userId: string) {
  return tracer.startActiveSpan('getUserWithOrders', async (span) => {
    try {
      span.setAttribute('user.id', userId);

      // 子 Span：数据库查询
      const user = await tracer.startActiveSpan('db.queryUser', async (dbSpan) => {
        dbSpan.setAttribute('db.system', 'postgresql');
        dbSpan.setAttribute('db.statement', 'SELECT * FROM users WHERE id = $1');
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        dbSpan.setAttribute('db.rows_returned', result.rows.length);
        dbSpan.end();
        return result.rows[0];
      });

      // 子 Span：外部 API 调用
      const orders = await tracer.startActiveSpan('http.getOrders', async (httpSpan) => {
        httpSpan.setAttribute('http.method', 'GET');
        httpSpan.setAttribute('http.url', `https://orders.api/users/${userId}/orders`);
        const res = await fetch(`https://orders.api/users/${userId}/orders`);
        httpSpan.setAttribute('http.status_code', res.status);
        httpSpan.end();
        return res.json();
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return { user, orders };
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 5. SRE 黄金指标

| 指标 | 定义 | 告警阈值示例 |
|------|------|-------------|
| **Latency** | 请求处理时间 | P95 > 200ms |
| **Traffic** | 请求量 | 同比变化 > 50% |
| **Errors** | 错误率 | 比例 > 0.1% |
| **Saturation** | 资源利用率 | CPU > 80% |

## 6. AI 可观测性

AI 系统特有的观测需求：

- **Token 成本追踪**: 每次 LLM 调用的输入/输出 Token 数与费用
- **Prompt 版本管理**: 追踪不同 Prompt 版本的性能差异
- **模型性能漂移**: 监控模型输出质量随时间的变化
- **幻觉检测**: 通过 RAG 检索命中率评估回答可信度

## 7. 与相邻模块的关系

- **74-observability**: 可观测性的基础概念与工具
- **94-ai-agent-lab**: Agent 执行过程的追踪与调试
- **17-debugging-monitoring**: 调试技术与监控策略

## 8. 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **OpenTelemetry** | 云原生可观测性标准 | [opentelemetry.io](https://opentelemetry.io/) |
| **OpenTelemetry JS** | Node.js/Browser 官方 SDK | [github.com/open-telemetry/opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) |
| **Google SRE Book** | 站点可靠性工程 — 监控章节 | [sre.google/sre-book/monitoring-distributed-systems](https://sre.google/sre-book/monitoring-distributed-systems/) |
| **Prometheus Docs** | 指标采集与告警系统 | [prometheus.io/docs](https://prometheus.io/docs/) |
| **Jaeger Tracing** | 分布式追踪系统 | [jaegertracing.io](https://www.jaegertracing.io/) |
| **Grafana Labs** | 可观测性平台 | [grafana.com](https://grafana.com/) |
| **Honeycomb Docs** | 高基数可观测性 | [docs.honeycomb.io](https://docs.honeycomb.io/) |
| **eBPF 可观测性** | Linux 内核可观测性技术 | [ebpf.io](https://ebpf.io/) |
