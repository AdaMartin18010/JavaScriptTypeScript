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

---

*最后更新: 2026-04-29*
