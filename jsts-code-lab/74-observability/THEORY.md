# 可观测性理论：从日志到洞察

> **目标读者**：SRE、DevOps 工程师、关注系统可靠性的团队
> **关联文档**：[`docs/categories/74-observability.md`](../../docs/categories/74-observability.md)
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. 可观测性三大支柱

```
        可观测性
       /   |   \
    日志  指标  链路
    (Logs)(Metrics)(Traces)
```

| 支柱 | 回答的问题 | 存储特点 |
|------|-----------|---------|
| **日志** | 发生了什么？ | 高容量、低查询频率 |
| **指标** | 系统的整体状态？ | 时间序列、聚合查询 |
| **链路** | 请求经过哪些服务？ | 关联追踪、高基数 |

**2026 年新增**：**分析 (Profiling)** 成为第四支柱。

---

## 2. OpenTelemetry 标准

### 2.1 统一采集

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
});
sdk.start();
```

**优势**：一次埋点，导出到任意后端（Jaeger、Zipkin、Datadog）。

---

## 3. 日志管理

### 3.1 结构化日志

```json
{
  "timestamp": "2026-04-22T08:00:00Z",
  "level": "error",
  "message": "Payment failed",
  "service": "payment-api",
  "traceId": "abc123",
  "context": { "userId": "u456", "amount": 99.99 }
}
```

**工具链**：Pino / Winston → Fluentd / Vector → Loki / Elasticsearch。

---

## 4. 告警策略

### 4.1 告警分层

| 级别 | 响应时间 | 示例 |
|------|---------|------|
| **P0** | 立即 | 服务完全不可用 |
| **P1** | 15 分钟 | 核心功能降级 |
| **P2** | 1 小时 | 性能下降 |
| **P3** | 工作日 | 非紧急异常 |

---

## 5. 总结

可观测性不是监控，是**理解系统内部状态的能力**。

**核心原则**：
1. 统一标准（OpenTelemetry）
2. 结构化一切（日志、指标、链路关联）
3. 告警 actionable，避免"狼来了"

---

## 参考资源

- [OpenTelemetry](https://opentelemetry.io/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Datadog Observability](https://www.datadoghq.com/blog/)
