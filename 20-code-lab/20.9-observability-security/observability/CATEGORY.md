---
dimension: 综合
sub-dimension: Observability
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Observability 核心概念与工程实践。

## 包含内容

- **指标（Metrics）**：Counter、Gauge、Histogram、Summary；Prometheus  exposition 格式。
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

---

*最后更新: 2026-04-29*
