---
dimension: 综合
sub-dimension: Realtime analytics
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Realtime analytics 核心概念与工程实践。

## 包含内容

- 本模块聚焦 realtime analytics 核心概念与工程实践。
- 涵盖流式数据窗口计算、时间序列聚合与低延迟指标流水线。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 实时分析理论形式化定义 |
| streaming-analytics.ts | 源码 | 滑动窗口流式聚合引擎 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// streaming-analytics.ts — 滑动窗口流式聚合
interface Event {
  timestamp: number;
  metric: string;
  value: number;
}

class SlidingWindowAggregator {
  private buffer: Event[] = [];

  constructor(
    private windowMs: number,
    private stepMs: number
  ) {}

  ingest(event: Event): void {
    this.buffer.push(event);
    this.evict(event.timestamp);
  }

  aggregate(metric: string): { count: number; sum: number; avg: number } {
    const slice = this.buffer.filter(e => e.metric === metric);
    const sum = slice.reduce((s, e) => s + e.value, 0);
    return { count: slice.length, sum, avg: sum / (slice.length || 1) };
  }

  private evict(now: number): void {
    const cutoff = now - this.windowMs;
    this.buffer = this.buffer.filter(e => e.timestamp >= cutoff);
  }
}
```

### 时间序列降采样（Downsampling）

```typescript
// downsampling.ts — LTTB（Largest Triangle Three Buckets）算法实现
interface DataPoint {
  timestamp: number;
  value: number;
}

function lttbDownsample(data: DataPoint[], threshold: number): DataPoint[] {
  if (data.length <= threshold || threshold === 0) return data;

  const sampled: DataPoint[] = [];
  sampled.push(data[0]);

  let a = 0; // 桶 a 的索引
  for (let i = 1; i < threshold - 1; i++) {
    const avgRangeStart = Math.floor(((i - 1) * (data.length - 2)) / (threshold - 2)) + 1;
    const avgRangeEnd = Math.floor((i * (data.length - 2)) / (threshold - 2)) + 1;

    // 计算桶 b 的平均点
    let avgX = 0, avgY = 0;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].timestamp;
      avgY += data[j].value;
    }
    avgX /= avgRangeEnd - avgRangeStart;
    avgY /= avgRangeEnd - avgRangeStart;

    // 选择桶 c 中使三角形面积最大的点
    const rangeStart = Math.floor(((i - 1) * (data.length - 2)) / (threshold - 2)) + 1;
    const rangeEnd = Math.floor((i * (data.length - 2)) / (threshold - 2)) + 1;

    let maxArea = -1;
    let maxIdx = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (data[a].timestamp - avgX) * (data[j].value - data[a].value) -
        (data[a].timestamp - data[j].timestamp) * (avgY - data[a].value)
      );
      if (area > maxArea) {
        maxArea = area;
        maxIdx = j;
      }
    }

    sampled.push(data[maxIdx]);
    a = maxIdx;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}
```

### 实时指标流水线（Web Streams API）

```typescript
// metrics-pipeline.ts — 基于 TransformStream 的实时指标处理
interface MetricRecord {
  service: string;
  metric: string;
  value: number;
  tags: Record<string, string>;
}

class MetricEnricher extends TransformStream<string, MetricRecord> {
  constructor(defaultTags: Record<string, string>) {
    super({
      transform(chunk, controller) {
        try {
          const raw = JSON.parse(chunk);
          controller.enqueue({
            service: raw.service ?? 'unknown',
            metric: raw.metric ?? 'unknown',
            value: Number(raw.value) || 0,
            tags: { ...defaultTags, ...(raw.tags || {}) },
          });
        } catch {
          // 丢弃无效记录
        }
      },
    });
  }
}

class MetricAggregator extends TransformStream<MetricRecord, string> {
  constructor(windowMs: number = 5000) {
    const buckets = new Map<string, { count: number; sum: number }>();
    let lastFlush = Date.now();

    super({
      transform(record, controller) {
        const key = `${record.service}::${record.metric}`;
        const prev = buckets.get(key) ?? { count: 0, sum: 0 };
        buckets.set(key, { count: prev.count + 1, sum: prev.sum + record.value });

        const now = Date.now();
        if (now - lastFlush >= windowMs) {
          for (const [k, v] of buckets) {
            controller.enqueue(JSON.stringify({
              key: k,
              count: v.count,
              sum: v.sum,
              avg: v.sum / v.count,
              window: windowMs,
              timestamp: now,
            }));
          }
          buckets.clear();
          lastFlush = now;
        }
      },
    });
  }
}

// 组合流水线
function createMetricsPipeline(
  defaultTags: Record<string, string>,
  output: WritableStream<string>
): WritableStream<string> {
  return new WritableStream({
    write(chunk) {
      const source = new ReadableStream({
        start(controller) {
          controller.enqueue(chunk);
          controller.close();
        },
      });

      source
        .pipeThrough(new TextEncoderStream())
        .pipeThrough(new MetricEnricher(defaultTags))
        .pipeThrough(new MetricAggregator())
        .pipeTo(output);
    },
  });
}
```

### 实时异常检测（基于指数加权移动平均）

```typescript
// anomaly-detection.ts — EWMA 实时异常检测
class EwmaAnomalyDetector {
  private ewma = 0;
  private ewmaVar = 0;
  private initialized = false;

  constructor(
    private alpha: number = 0.3,     // 平滑因子
    private thresholdSigma: number = 3 // 标准差阈值
  ) {}

  update(value: number): { isAnomaly: boolean; zScore: number } {
    if (!this.initialized) {
      this.ewma = value;
      this.ewmaVar = 0;
      this.initialized = true;
      return { isAnomaly: false, zScore: 0 };
    }

    const diff = value - this.ewma;
    this.ewma += this.alpha * diff;
    this.ewmaVar = (1 - this.alpha) * (this.ewmaVar + this.alpha * diff * diff);

    const stdDev = Math.sqrt(this.ewmaVar) || 1;
    const zScore = Math.abs(value - this.ewma) / stdDev;

    return {
      isAnomaly: zScore > this.thresholdSigma,
      zScore,
    };
  }
}

// 使用示例：监控 API 延迟
const latencyDetector = new EwmaAnomalyDetector(0.2, 3);

function onApiLatencyRecorded(ms: number) {
  const result = latencyDetector.update(ms);
  if (result.isAnomaly) {
    console.warn(`Latency anomaly detected: ${ms}ms (z-score: ${result.zScore.toFixed(2)})`);
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 streaming-analytics.test.ts
- 📄 streaming-analytics.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Apache Flink Documentation | 官方文档 | [nightlies.apache.org/flink/flink-docs-stable](https://nightlies.apache.org/flink/flink-docs-stable/) |
| Kafka Streams DSL | 官方文档 | [kafka.apache.org/documentation/streams](https://kafka.apache.org/documentation/streams/) |
| Materialize (SQL Streaming) | 官方文档 | [materialize.com/docs](https://materialize.com/docs/) |
| RisingWave Stream Processing | 官方文档 | [docs.risingwave.com](https://docs.risingwave.com/) |
| The Dataflow Model (Google) | 论文 | [storage.googleapis.com/pub-tools-public-publication-data/pdf/43864.pdf](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/43864.pdf) |
| Web Streams API (MDN) | 参考 | [developer.mozilla.org/en-US/docs/Web/API/Streams_API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) |
| InfluxDB Time-Series | 官方文档 | [docs.influxdata.com](https://docs.influxdata.com/) |
| Prometheus Querying | 官方文档 | [prometheus.io/docs/prometheus/latest/querying/basics](https://prometheus.io/docs/prometheus/latest/querying/basics/) |
| Grafana Real-Time Dashboards | 指南 | [grafana.com/docs/grafana/latest/dashboards](https://grafana.com/docs/grafana/latest/dashboards/) |
| ClickHouse Streaming Analytics | 官方文档 | [clickhouse.com/docs](https://clickhouse.com/docs) |
| RedisTimeSeries | 官方文档 | [redis.io/docs/latest/develop/data-types/timeseries](https://redis.io/docs/latest/develop/data-types/timeseries/) |
| Apache Kafka: The Definitive Guide (O'Reilly) | 书籍 | [www.oreilly.com/library/view/kafka-the-definitive](https://www.oreilly.com/library/view/kafka-the-definitive) |

---

*最后更新: 2026-04-29*
