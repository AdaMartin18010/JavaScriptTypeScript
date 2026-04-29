# 实时分析 理论解读

## 概述

本模块聚焦流式数据处理与实时分析系统的核心原理，涵盖窗口计算、异常检测与复杂事件处理（CEP）。在边缘计算与实时决策场景下，低延迟的数据处理能力已成为现代应用的关键竞争力。

## 核心概念

### 时间窗口语义

流数据天然无界，窗口操作为其引入有界的计算边界。滚动窗口按固定大小切分且不重叠，适合周期性统计；滑动窗口允许重叠，适合平滑趋势分析；会话窗口按活动间隙动态划分，适合用户行为分析。

### 事件时间处理

在分布式环境中，数据到达顺序可能与产生顺序不一致。通过为每个事件附加时间戳与水印（Watermark），系统可以容忍一定延迟并触发窗口计算，平衡实时性与结果完整性。

### 复杂事件处理（CEP）

CEP 通过在无序事件流中识别预定义模式（如"3 次登录失败后在 1 分钟内发生转账"），实现实时风险检测与业务洞察。模式匹配采用 NFA（非确定有限自动机）思想，维护部分匹配状态机。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| 滚动窗口聚合 | 固定周期的指标统计（如每 5 分钟 QPS） | 窗口边界处的数据可能因延迟到达而被遗漏，需配合水印策略 |
| Z-Score 异常检测 | 基于历史统计规律识别离群点 | 对非正态分布数据效果不佳，可结合阈值规则兜底 |
| CEP 模式匹配 | 欺诈检测、安全告警等场景 | 状态缓冲区可能持续增长，需设置事件过期清理策略 |

## OLAP 引擎对比

| 维度 | ClickHouse | Apache Druid | Apache Pinot |
|------|-----------|--------------|--------------|
| **架构风格** | MPP 列式数据库 | 微服务 + 深度存储 | 分布式列式 + Lambda/Kappa 可选 |
| **写入延迟** | 亚秒级（MergeTree 异步合并） | 秒级（实时 + 批量摄取） | 毫秒~秒级（实时摄取优先） |
| **查询延迟** | 毫秒~亚秒（单表极速） | 亚秒~秒（预聚合优势） | 毫秒级（专为低延迟优化） |
| **SQL 支持** | ✅ ANSI-SQL 近乎完整 | ⚠️ Druid SQL（部分方言差异） | ✅ Pinot SQL + Trino 联邦查询 |
| **实时摄入** | ✅ Kafka 引擎 / 物化视图 | ✅ Kafka Indexing Service | ✅ Kafka / Kinesis 原生连接器 |
| **更新/删除** | ⚠️ 轻量级删除（异步） | ❌ 仅追加（需重新索引） | ⚠️ Upsert 有限支持 |
| **运维复杂度** | 中（ZooKeeper/Keeper 依赖） | 高（多节点类型、Coordinator/Overlord） | 中（Helm/Kubernetes 友好） |
| **云托管** | ClickHouse Cloud / AWS MSK | Imply / AWS EMR | StarTree Cloud / AWS MSK |
| **最佳场景** | 日志/事件分析、时序数据 | 高基数维度、预聚合 BI | 用户面向分析（LinkedIn 起源） |

> **选型建议**：极致单表扫描性能选 ClickHouse；需要复杂维度下钻与预聚合选 Druid；面向最终用户的低延迟分析选 Pinot。

## 代码示例

### 边缘实时事件流（Kafka + WebSocket）

```typescript
// producer.ts — 埋点事件生产
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();
await producer.connect();

async function trackEvent(userId: string, event: string, meta: object) {
  await producer.send({
    topic: 'user-events',
    messages: [{
      key: userId,
      value: JSON.stringify({
        event,
        timestamp: Date.now(),
        ...meta,
      }),
    }],
  });
}

// 模拟高并发事件
for (let i = 0; i < 10000; i++) {
  trackEvent(`user-${i % 1000}`, 'page_view', { path: '/checkout' });
}
```

```typescript
// consumer-edge.ts — 边缘实时消费 + WebSocket 推送
import { Kafka } from 'kafkajs';
import { WebSocketServer } from 'ws';

const kafka = new Kafka({ brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'realtime-dashboard' });
await consumer.connect();
await consumer.subscribe({ topic: 'user-events', fromBeginning: false });

// WebSocket 广播层
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();
wss.on('connection', (ws) => clients.add(ws));

// 滚动窗口聚合（5 秒）
const window = new Map<string, number>();
let windowStart = Date.now();

await consumer.run({
  eachMessage: async ({ message }) => {
    const data = JSON.parse(message.value!.toString());
    const eventType = data.event;

    // 本地窗口计数
    window.set(eventType, (window.get(eventType) || 0) + 1);

    // 每 5 秒刷新并推送
    const now = Date.now();
    if (now - windowStart >= 5000) {
      const snapshot = Object.fromEntries(window);
      const payload = JSON.stringify({ window: `${windowStart}-${now}`, counts: snapshot });
      clients.forEach((c) => c.readyState === 1 && c.send(payload));
      window.clear();
      windowStart = now;
    }
  },
});
```

```typescript
// client-dashboard.ts — 前端实时看板
const ws = new WebSocket('wss://edge.example.com/realtime');
ws.onmessage = (msg) => {
  const { window, counts } = JSON.parse(msg.data);
  console.log(`Window ${window}:`, counts);
  updateChart(counts); // 驱动 ECharts / D3 实时渲染
};
```

## 关联模块

- `65-analytics` — 离线数据分析与数仓建模基础
- `30-real-time-communication` — WebSocket 与实时数据传输通道
- `74-observability` — 实时系统监控与可观测性体系建设

## 参考

- [ClickHouse Official Docs](https://clickhouse.com/docs)
- [Apache Druid Documentation](https://druid.apache.org/docs/latest/design/)
- [Apache Pinot Documentation](https://docs.pinot.apache.org/)
- [Kafka Streams Documentation](https://kafka.apache.org/documentation/streams/)
- [Watermarking in Stream Processing — Flink Docs](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/)
- 本模块 `README.md` — 模块主题与学习路径
- 本模块 `streaming-analytics.ts` — 窗口操作、异常检测、CEP 引擎与实时看板实现
