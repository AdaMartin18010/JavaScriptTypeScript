# 74-observability

可观测性三大支柱与相关工具的实现。

## Topics

| Topic | File |
|---|---|
| 可观测性技术栈 | `observability-stack.ts` |
| 指标系统 (Counter/Gauge/Histogram/Summary) | `metrics.ts` |
| 结构化日志系统 | `logging.ts` |
| 分布式追踪 | `tracing.ts` |
| 告警系统 | `alerting.ts` |
| 健康检查框架 | `health-check.ts` |

## Running Tests

```bash
npx vitest run 74-observability
```
