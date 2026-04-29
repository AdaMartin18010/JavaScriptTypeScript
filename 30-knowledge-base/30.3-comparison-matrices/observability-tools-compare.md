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

## 开源组合

| 功能 | 工具 |
|------|------|
| 日志 | Loki / Fluentd |
| 指标 | Prometheus + Grafana |
| 追踪 | Jaeger / Zipkin |
| 告警 | AlertManager / PagerDuty |

---

*最后更新: 2026-04-29*
