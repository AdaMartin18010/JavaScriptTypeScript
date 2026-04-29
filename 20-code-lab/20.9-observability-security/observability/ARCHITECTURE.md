# 可观测性 — 架构设计

## 1. 架构概述

本模块构建了一个统一的可观测性平台，集成 Metrics、Logs 和 Traces 的采集、处理和展示。展示 OpenTelemetry 标准在 JavaScript 应用中的实践。

## 2. 核心组件

### 2.1 采集层

- **Metrics Collector**: Counter、Gauge、Histogram 的自动/手动采集
- **Log Appender**: 结构化日志输出，支持多个目的地
- **Trace Instrumentor**: 自动和手动 Span 创建

### 2.2 处理层

- **OTLP Exporter**: OpenTelemetry 协议数据导出
- **Batch Processor**: 批量发送，减少网络开销
- **Sampler**: 自适应采样策略（头部/比率/概率）

### 2.3 展示层

- **Dashboard Renderer**: 指标仪表盘和图表
- **Log Explorer**: 结构化日志查询和过滤
- **Trace Viewer**: 分布式追踪的瀑布图展示

## 3. 采集架构模式对比

| 维度 | Agent 模式（Sidecar/DaemonSet） | Agentless 模式（SDK 直连） | eBPF 模式（内核态采集） |
|------|-------------------------------|--------------------------|----------------------|
| **部署位置** | 每个 Pod / 节点部署独立采集器（如 OTel Collector） | 应用进程内嵌 SDK，直连后端 | 宿主机内核，无侵入 |
| **资源开销** | 中（额外进程内存 ~50-200MB） | 低（仅 SDK 运行时开销） | 低（内核态，用户态开销极小） |
| **侵入性** | 低（应用无感知） | 中（需集成 SDK、初始化代码） | **极低**（零代码改动） |
| **采集范围** | 容器 stdout、文件、进程指标 | 应用内部业务指标、自定义维度 | 系统调用、网络流量、文件访问 |
| **多语言支持** | 优（与语言无关） | 依赖各语言 SDK 成熟度 | **优**（内核级，完全无关） |
| **安全性观测** | 需额外配置 | 需应用主动上报 | **原生支持**（syscall 追踪） |
| **适用场景** | K8s 集群、遗留系统观测 | 云原生应用、深度业务追踪 | 安全监控、网络性能分析、无源码系统 |
| **代表工具** | OpenTelemetry Collector, Fluent Bit, Vector | OpenTelemetry SDK, Datadog APM Agent | Pixie, Falco, Cilium Hubble, Beyla |

> **选型建议**：
>
> - **云原生 K8s 环境**：Agent 模式（DaemonSet 部署 OTel Collector）为主，eBPF 为安全/网络补充
> - **Serverless / 边缘函数**：Agentless 模式（轻量 SDK + OTLP 直推）
> - **高安全要求 / 第三方闭源服务**：eBPF 模式（零侵入，采集网络/文件行为）
> - **混合架构**：Agent（基础设施指标）+ Agentless（业务 Traces）+ eBPF（安全审计）

## 4. 数据流与代码示例

### 4.1 可观测性数据流架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐
│   Application │────▶│  SDK / Agent │────▶│   Collector │────▶│    Backend Storage      │
│  (Node.js)   │     │ (Auto/Manual)│     │  (Process)  │     │ (Prometheus/Jaeger/Loki)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────────────────┘
        │                                          │                      │
        │  1. Auto-instrumentation (http, db)      │  3. Batch / Filter   │  4. Query / Alert
        │  2. Manual Spans / Metrics / Logs        │     / Enrich         │  5. Dashboard
        └──────────────────────────────────────────┘                      │
                                    eBPF (Kernel) ────────────────────────┘
```

### 4.2 OpenTelemetry Collector 配置示例（YAML）

```yaml
# otel-collector-config.yaml
# 部署模式：DaemonSet（每个节点一个）或 Deployment（网关聚合）
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  # Prometheus 抓取节点指标
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 10s
          static_configs:
            - targets: ['0.0.0.0:8888']
  # 文件日志采集
  filelog:
    include: [/var/log/pods/*/*/*.log]
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time
          layout: '%Y-%m-%dT%H:%M:%S.%LZ'

processors:
  # 资源属性增强
  resource:
    attributes:
      - key: service.namespace
        value: "production"
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s.cluster.name
        action: upsert
  # 批处理减少网络请求
  batch:
    timeout: 1s
    send_batch_size: 1024
    send_batch_max_size: 2048
  # 尾部采样：保留错误和慢请求
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 1000
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: latency
        type: latency
        latency: {threshold_ms: 500}
  # 内存限制防止 OOM
  memory_limiter:
    limit_mib: 512
    spike_limit_mib: 128

exporters:
  # 导出到 Prometheus Remote Write
  prometheusremotewrite:
    endpoint: http://prometheus:9090/api/v1/write
    # 如需认证：
    # headers:
    #   Authorization: Basic ${PROMETHEUS_AUTH}
  # 导出到 Jaeger
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  # 导出到 Loki
  loki:
    endpoint: http://loki:3100/loki/api/v1/push
  # 调试输出
  debug:
    verbosity: detailed

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777

service:
  extensions: [health_check, pprof]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resource, tail_sampling, batch]
      exporters: [otlp/jaeger, debug]
    metrics:
      receivers: [otlp, prometheus]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheusremotewrite, debug]
    logs:
      receivers: [otlp, filelog]
      processors: [memory_limiter, resource, batch]
      exporters: [loki, debug]
```

### 4.3 Node.js 应用集成 OpenTelemetry SDK

```typescript
// instrumentation.ts — 必须在应用入口最先加载
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'payment-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.2.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
  }),
  traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: 'http://otel-collector:4317' }),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // 按需启用/禁用自动埋点
      '@opentelemetry/instrumentation-fs': { enabled: false }, // 文件 I/O 噪声大
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },  // PostgreSQL
      '@opentelemetry/instrumentation-redis': { enabled: true },
    }),
  ],
});

sdk.start();

// 优雅关闭
process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('OTel SDK shut down')).catch(console.error);
});
```

## 5. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 协议标准 | OpenTelemetry | 厂商中立，生态丰富 |
| 采样策略 | 头部一致性采样 | 保证 Trace 完整性 |
| 数据格式 | OTLP + JSON Fallback | 性能 + 兼容性 |

## 6. 质量属性

- **低开销**: 异步批处理，最小化性能影响
- **标准化**: 跨语言、跨平台的一致数据格式
- **可扩展**: 插件式导出器和处理器

## 7. 权威参考链接

- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otel/) — 官方规范文档
- [OpenTelemetry Collector Configuration](https://opentelemetry.io/docs/collector/configuration/) — Collector 配置指南
- [OpenTelemetry JS API Documentation](https://open-telemetry.github.io/opentelemetry-js/) — JS SDK API 文档
- [eBPF.io](https://ebpf.io/) — eBPF 技术全景与工具生态
- [Pixie by New Relic](https://pixielabs.ai/) — 自动遥测的 eBPF 原生观测平台
- [Grafana Beyla](https://grafana.com/docs/beyla/latest/) — 基于 eBPF 的应用自动观测工具
- [CNCF Observability Whitepaper](https://github.com/cncf/tag-observability/blob/main/whitepaper.md) — CNCF 可观测性白皮书
- [Google Cloud: SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) — Google SRE 监控章节
