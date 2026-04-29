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

## 6. 权威参考

- [OpenTelemetry Official Docs](https://opentelemetry.io/docs/) — 云原生可观测性标准
- [Google SRE Book — Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) — Google 分布式监控最佳实践
- [Prometheus Best Practices](https://prometheus.io/docs/practices/) — 指标命名与告警设计
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分布式追踪上下文规范

## 7. 与相邻模块的关系

- **92-observability-lab**: 可观测性的代码实现与工具链
- **17-debugging-monitoring**: 调试与监控基础
- **22-deployment-devops**: DevOps 中的监控集成
