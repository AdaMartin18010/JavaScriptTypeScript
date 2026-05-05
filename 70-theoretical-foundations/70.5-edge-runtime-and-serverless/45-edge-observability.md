---
title: '边缘可观测性与分布式追踪'
description: 'Edge Observability and Distributed Tracing: Logging, Metrics, Tracing in Edge/Serverless Environments'
last-updated: 2026-05-06
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive analysis of observability challenges in edge computing and serverless environments, covering logging architectures, metrics aggregation, distributed tracing across edge and origin, tail-based sampling, and cost-aware observability strategies.'
references:
  - 'OpenTelemetry, Documentation'
  - 'Honeycomb, Observability Engineering'
  - 'Cloudflare, Workers Analytics'
  - 'Vercel, Analytics and Monitoring'
  - 'Jaeger, Distributed Tracing'
---

# 边缘可观测性与分布式追踪

> **理论深度**: 高级
> **前置阅读**: [40-serverless-coldstart.md](40-serverless-coldstart.md), [34-edge-runtime-architecture.md](34-edge-runtime-architecture.md)
> **目标读者**: SRE、平台工程师、可观测性架构师
> **核心问题**: 在无法 SSH 登录的边缘环境中，如何有效监控、排障和优化性能？

---

## 目录

- [边缘可观测性与分布式追踪](#边缘可观测性与分布式追踪)
  - [目录](#目录)
  - [1. 可观测性三大支柱](#1-可观测性三大支柱)
    - [1.1 Metrics（指标）](#11-metrics指标)
    - [1.2 Logs（日志）](#12-logs日志)
    - [1.3 Traces（追踪）](#13-traces追踪)
  - [2. 边缘环境的可观测性挑战](#2-边缘环境的可观测性挑战)
    - [2.1 无状态执行环境](#21-无状态执行环境)
    - [2.2 网络限制](#22-网络限制)
    - [2.3 多区域数据聚合](#23-多区域数据聚合)
  - [3. 日志架构设计](#3-日志架构设计)
    - [3.1 边缘日志架构模式](#31-边缘日志架构模式)
    - [3.2 日志级别动态控制](#32-日志级别动态控制)
  - [4. 指标聚合与降采样](#4-指标聚合与降采样)
    - [4.1 边缘指标聚合策略](#41-边缘指标聚合策略)
    - [4.2 Cardinality 控制](#42-cardinality-控制)
  - [5. 分布式追踪的边界问题](#5-分布式追踪的边界问题)
    - [5.1 跨运行时追踪](#51-跨运行时追踪)
    - [5.2 尾部采样（Tail-Based Sampling）](#52-尾部采样tail-based-sampling)
  - [6. 采样策略与成本控制](#6-采样策略与成本控制)
    - [6.1 可观测性成本模型](#61-可观测性成本模型)
    - [6.2 分层采样策略](#62-分层采样策略)
  - [7. 范畴论语义：追踪作为偏序集](#7-范畴论语义追踪作为偏序集)
  - [8. 对称差分析：传统监控 vs 边缘可观测性](#8-对称差分析传统监控-vs-边缘可观测性)
  - [9. 工程决策矩阵](#9-工程决策矩阵)
  - [10. 反例与局限性](#10-反例与局限性)
    - [10.1 采样导致的事故遗漏](#101-采样导致的事故遗漏)
    - [10.2 指标基数爆炸的成本噩梦](#102-指标基数爆炸的成本噩梦)
    - [10.3 边缘日志丢失](#103-边缘日志丢失)
    - [10.4 可观测性工具的供应商锁定](#104-可观测性工具的供应商锁定)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：OpenTelemetry 边缘追踪初始化](#示例-1opentelemetry-边缘追踪初始化)
    - [示例 2：分层采样决策器](#示例-2分层采样决策器)
    - [示例 3：指标预聚合器](#示例-3指标预聚合器)
    - [示例 4：追踪上下文传播器](#示例-4追踪上下文传播器)
    - [示例 5：日志批量发送器](#示例-5日志批量发送器)
    - [示例 6：基数限制器](#示例-6基数限制器)
  - [参考文献](#参考文献)

---

## 1. 可观测性三大支柱

### 1.1 Metrics（指标）

指标是**聚合的数值数据**，用于描述系统的整体健康状态：

- **计数器（Counter）**：单调递增的值（如请求总数、错误总数）
- **计量器（Gauge）**：可上下波动的值（如内存使用量、CPU 利用率）
- **直方图（Histogram）**：值的分布（如请求延迟的 P50/P95/P99）

**边缘环境的特殊考量**：

- 指标需要在边缘节点本地聚合，减少网络传输
- 使用**Delta Temporality**：只发送自上次上报以来的增量
- 指标标签（Labels）的基数（Cardinality）爆炸：避免将用户 ID 作为标签

### 1.2 Logs（日志）

日志是**离散的事件记录**，提供详细的上下文信息：

**日志级别**：

- ERROR：系统错误，需要立即处理
- WARN：潜在问题，需要关注
- INFO：关键业务事件
- DEBUG：调试信息，生产环境通常关闭

**结构化日志**：

```json
{
  "timestamp": "2026-05-05T10:00:00Z",
  "level": "ERROR",
  "trace_id": "abc123",
  "service": "api-gateway",
  "message": "Database connection timeout",
  "duration_ms": 5000,
  "retry_count": 3
}
```

### 1.3 Traces（追踪）

追踪是**请求的完整生命周期**，跨越多个服务：

- **Trace**：一个端到端请求的完整路径
- **Span**：追踪中的一个操作单元（如 HTTP 请求、数据库查询）
- **Context Propagation**：通过 HTTP 头（`traceparent`、`tracestate`）传播追踪上下文

---

## 2. 边缘环境的可观测性挑战

### 2.1 无状态执行环境

边缘函数的执行环境是**无状态且短暂的**：

- 无法写入本地文件系统（`fs` 不可用）
- 无法运行后台进程（`setInterval` 在请求结束后停止）
- 内存限制（128MB），无法缓冲大量日志

**影响**：

- 日志必须同步或近同步地发送到外部系统
- 日志丢失风险：若发送失败且无法重试，日志永久丢失
- 高并发场景下，日志发送可能成为瓶颈

### 2.2 网络限制

边缘节点的网络特性：

- 出站连接可能受限（防火墙、连接数限制）
- 到可观测性后端（如 Honeycomb、Datadog）的延迟可能很高
- 某些平台限制出站连接的目标（仅允许特定端口和协议）

**解决方案**：

- 使用平台原生集成（Cloudflare Workers → Workers Analytics）
- 通过边缘的日志聚合器（如 Vector、Fluent Bit）中转
- 批量发送 + 压缩（gzip / zstd）减少网络开销

### 2.3 多区域数据聚合

边缘请求分布在全球数百个 PoP：

- 同一用户的请求可能命中不同区域
- 追踪数据需要在中心聚合才能看到完整路径
- 跨区域网络延迟影响实时性

---

## 3. 日志架构设计

### 3.1 边缘日志架构模式

**模式一：直接发送（Direct Shipping）**

```
[Edge Function] → [Observability Backend]
```

- 简单，但每个请求都产生网络开销
- 适合低流量场景

**模式二：边缘聚合（Edge Aggregation）**

```
[Edge Function] → [Edge Log Aggregator] → [Central Backend]
```

- 边缘节点本地缓冲和批量发送
- 需要边缘节点支持后台进程或持久存储
- Cloudflare Workers 不支持，但 Cloudflare Pages Functions 可以通过 Durable Objects 实现

**模式三：平台原生（Platform Native）**

```
[Edge Function] → [Platform Logging] → [External Backend]
```

- 使用平台提供的日志管道（Vercel Logs, Cloudflare Tail）
- 平台负责收集和转发
- 可能产生额外费用或延迟

### 3.2 日志级别动态控制

在边缘环境中，无法通过 SSH 修改配置文件，需要**远程配置**：

```typescript
// 通过 KV 存储或环境变量控制日志级别
const LOG_LEVEL = await env.CONFIG_KV.get('log-level') || 'INFO';

const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function log(level: string, message: string, context?: object) {
  if (levels[level as keyof typeof levels] >= levels[LOG_LEVEL as keyof typeof levels]) {
    console.log(JSON.stringify({ timestamp: Date.now(), level, message, ...context }));
  }
}
```

---

## 4. 指标聚合与降采样

### 4.1 边缘指标聚合策略

**本地预聚合**：

- 在边缘函数内维护简单的计数器和直方图
- 每 N 秒或每 M 个请求批量发送一次
- 减少网络请求数，降低可观测性成本

**Exponential Histogram（指数直方图）**：

- OpenTelemetry 推荐在边缘使用指数直方图
- 桶边界按指数增长（1, 2, 4, 8, 16...），适合长尾分布
- 压缩率高，适合带宽受限环境

### 4.2 Cardinality 控制

**标签基数爆炸**是可观测性的头号成本杀手：

- 错误示例：`http_requests_total{user_id="12345", path="/api/users/12345"}`
- 每个用户产生一个时间序列，百万用户 = 百万时间序列
- Prometheus 的内存和查询性能随时间序列线性增长

**最佳实践**：

- 高基数属性放入**日志**或**追踪**，而非**指标**
- 指标标签限制在低基数维度：`service`, `region`, `status_code`, `method`
- 使用**Adaptive Cardinality Limiting**：自动检测并丢弃高基数标签组合

---

## 5. 分布式追踪的边界问题

### 5.1 跨运行时追踪

当请求从边缘（V8 Isolate）流向中心（Node.js 容器）时，追踪上下文需要正确传播：

```
[浏览器] --traceparent--> [Cloudflare Worker] --traceparent--> [AWS Lambda] --traceparent--> [RDS]
```

**挑战**：

- 不同平台对 W3C Trace Context 的支持程度不同
- 某些遗留系统不支持分布式追踪，导致追踪链断裂
- 异步消息队列（SQS、RabbitMQ）的追踪传播需要消息属性注入

### 5.2 尾部采样（Tail-Based Sampling）

头部采样（Head-Based Sampling）在请求开始时决定是否采样，无法知道请求是否会出错或变慢。

尾部采样（Tail-Based Sampling）等待请求完成后，根据属性决定是否保留：

- 保留所有错误（status >= 500）
- 保留所有慢请求（duration > P99）
- 保留特定用户或路径的追踪

**边缘环境的尾部采样挑战**：

- 需要缓冲所有 Span 直到请求完成
- 内存限制使得大追踪的缓冲困难
- 跨服务的尾部采样需要协调（OpenTelemetry Collector 的 Tail Sampling Processor）

---

## 6. 采样策略与成本控制

### 6.1 可观测性成本模型

可观测性的主要成本驱动因素：

- **数据量**：日志条数、指标时间序列数、追踪 Span 数
- **存储时长**：30 天 vs 90 天 vs 1 年的存储成本差异巨大
- **查询复杂度**：高基数查询消耗更多计算资源

**典型成本（每月）**：

| 平台 | 1GB 日志/天 | 1M 追踪/天 | 1K 指标/秒 |
|------|------------|-----------|-----------|
| Datadog | ~$500 | ~$1500 | ~$200 |
| Honeycomb | ~$200 | ~$500 | 按事件计费 |
| CloudWatch | ~$300 | 不支持原生追踪 | ~$100 |
| Grafana Cloud | ~$100 | ~$300 | ~$50 |

### 6.2 分层采样策略

```
100% 日志采样（错误级别）
  ↓
10% 日志采样（INFO 级别）
  ↓
1% 追踪采样（正常请求）
  ↓
100% 追踪采样（错误/慢请求）
```

**动态采样**：

- 高峰时段降低采样率（如促销期间降至 0.1%）
- 低峰时段提高采样率（如夜间升至 10%）
- 基于错误率自动调整：错误率高时全量采样

### 6.3 eBPF：零插桩可观测性革命（2026）

eBPF（extended Berkeley Packet Filter）已成为 2026 年可观测性领域最重要的技术突破之一，企业采用率达到 **35%** 且持续上升。

**核心优势**：

- **零插桩**：无需修改应用代码，通过内核探针（kprobe/uprobe）自动捕获系统调用、网络流量、文件访问
- **极低开销**：eBPF 程序在内核沙箱中 JIT 编译执行，典型开销 < 1% CPU
- **全栈可见性**：从内核网络栈到用户空间应用，覆盖传统 Agent 无法触及的盲区

**边缘场景中的 eBPF 工具链**：

- **Cilium Hubble**：基于 eBPF 的网络可观测性，自动为 Kubernetes Pod 生成 L3-L7 流量图，无需 sidecar
- **Tetragon**：eBPF 安全可观测性，实时检测进程执行、文件访问、网络连接的异常模式
- **Pixie**：自动采集 HTTP/gRPC/Redis/Kafka 协议数据，无需手动 instrumentation

**与 OpenTelemetry 的协同**：

- eBPF 采集基础设施层指标（网络延迟、TCP 重传、DNS 解析时间）
- OTel SDK 采集应用层指标（业务逻辑、自定义属性）
- 两者在 Collector 层汇合，形成从内核到业务的全栈追踪

**限制**：

- 需要 Linux 内核 5.10+（边缘容器环境通常满足）
- 沙箱安全性限制：eBPF 程序无法执行无限循环或访问任意内存
- 学习曲线：需要理解内核网络栈和 BPF 字节码

### 6.4 AI 驱动的根因分析（AI-Powered RCA）

2026 年，**40% 的企业**已采用 AI 驱动的根因分析系统，这一比例预计年底将达到 60%。

**AI RCA 的核心能力**：

1. **异常自动检测**：基于时序预测模型（如 Prophet、LSTM）自动识别指标异常，无需人工设置阈值
2. **拓扑关联分析**：将告警与基础设施拓扑图（服务依赖、K8s 资源关系）关联，快速定位故障传播路径
3. **日志模式挖掘**：从海量日志中自动提取异常模式（如 "connection refused" 突增与特定 Pod 重启的关联）
4. **自动采样率调整**：AI 根据流量模式和错误率预测，动态调整追踪采样率（如预测到故障前自动升至 100%）

**生产实践**：

- **Grafana Adaptive Metrics**：AI 自动识别并聚合低价值指标时间序列，减少 50% 存储成本
- **Datadog Watchdog**：无监督机器学习自动检测异常并关联到根因服务
- **OpenTelemetry + LLM**：将 Trace 结构化为自然语言，输入给 LLM 进行根因推理（实验性，但增长迅速）

**反例：AI RCA 的误报陷阱**

某团队完全依赖 AI RCA 系统，关闭了人工告警：

- AI 将数据库慢查询归因于 "网络延迟"，实际是缺少索引
- 因为训练数据中缺少 "缺少索引" 与 "慢查询" 的关联样本，AI 给出了错误的根因
- **教训**：AI RCA 是辅助工具，不能替代领域专家的直觉和深度排查

---

## 7. 范畴论语义：追踪作为偏序集

分布式追踪可以形式化为**偏序集（Poset, Partially Ordered Set）**：

**定义**：

- 集合 S = 一个 Trace 中的所有 Span
- 偏序关系 ≤：Span A ≤ Span B 当且仅当 A 的结束时间 ≤ B 的开始时间（A 在 B 之前完成）或 A 是 B 的父 Span

**性质**：

- **自反性**：A ≤ A（每个 Span 与自身可比）
- **反对称性**：若 A ≤ B 且 B ≤ A，则 A = B
- **传递性**：若 A ≤ B 且 B ≤ C，则 A ≤ C

**Hasse 图**：
Trace 的可视化就是其偏序集的 Hasse 图，边的方向表示父子关系或时间先后。

**与 DAG 的关系**：

- 若忽略时间顺序，仅考虑父子关系，则 Trace 是一个**有向无环图（DAG）**
- 并发执行的 Span 之间没有偏序关系（不可比），形成 DAG 中的并行分支

---

## 8. 对称差分析：传统监控 vs 边缘可观测性

| 维度 | 传统服务器监控 | 边缘可观测性 | 交集 |
|------|-------------|------------|------|
| 数据收集 | Agent 守护进程 | 嵌入代码 / 平台原生 | 指标/日志/追踪 |
| 存储位置 | 本地磁盘 + 中心 | 仅中心（无本地存储） | 时间序列数据库 |
| 采样策略 | 通常全量 | 必须采样（成本/带宽） | 错误全量保留 |
| 查询延迟 | 秒级 | 分钟级（跨区域聚合） | 预聚合仪表盘 |
| 调试能力 | 强（SSH + 核心转储） | 弱（仅日志/追踪） | 错误堆栈追踪 |
| 成本可控性 | 高（自托管） | 低（按量计费易失控） | 保留策略 |
| 实时告警 | 实时 | 延迟（数据聚合窗口） | 阈值告警 |
| 上下文丰富度 | 高（系统级指标） | 低（运行时限制） | 请求级属性 |

---

## 9. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 低流量边缘应用 | 平台原生日志 + 基础指标 | 零配置，成本最低 | 功能受限，无法自定义 |
| 高流量边缘应用 | OpenTelemetry + Collector | 标准化，可移植；Collector 是生产环境强制模式（非直连） | 配置复杂，需要专业知识 |
| 混合架构（Edge + Origin） | OTel + Jaeger/Tempo | 统一追踪上下文 | 跨网络传播开销 |
| 成本极度敏感 | 分层采样 + 短保留期 | 控制数据量 | 可能丢失关键调试信息 |
| 实时排障需求 | Tail-Based Sampling + Live Tail | 快速定位问题 | 内存消耗大，配置复杂 |
| 合规审计要求 | 全量日志 + 长期归档 | 满足审计需求 | 存储成本高昂 |
| 多平台部署 | OTel SDK（统一 API） | 代码一次编写，多平台运行 | 各平台实现差异 |
| 高频微服务 | eBPF + OTel Collector + OSS 后端 | 零侵入，性能开销低；相比 Datadog/New Relic 节省 ~66% 成本 | 需要 Linux 内核支持；Cilium/Hubble 学习曲线 |

---

## 10. 反例与局限性

### 10.1 采样导致的事故遗漏

某团队将追踪采样率设置为 1% 以节省成本：

- 一个罕见的竞态条件导致数据不一致
- 由于采样率太低，该错误在两周内未被追踪捕获
- 直到用户大规模投诉才发现问题
- 解决方案：对错误响应自动 100% 采样（Tail-Based Sampling）

### 10.2 指标基数爆炸的成本噩梦

某电商在黑色星期五将 `user_id` 加入指标标签：

- 100 万用户产生 100 万时间序列
- Prometheus 内存占用从 2GB 飙升至 64GB
- OOM 导致监控中断，"盲飞" 4 小时
- 解决方案：高基数属性移入日志/追踪，指标仅保留低维度标签

### 10.3 边缘日志丢失

某团队将日志直接发送到外部 Elasticsearch：

- 边缘节点到 ES 的网络偶尔超时
- 由于边缘函数无法重试（请求已结束），日志永久丢失
- 在审计时发现 5% 的关键日志缺失
- 解决方案：使用平台原生日志管道（可靠性由平台保证）或边缘缓冲（Durable Objects / KV）

### 10.4 可观测性工具的供应商锁定

从 Datadog 迁移到 Honeycomb：

- 仪表盘和告警规则需要全部重写（DSL 不同）
- 历史数据无法迁移（格式不兼容）
- 团队需要重新学习查询语言
- 解决方案：优先使用 OpenTelemetry 标准化数据格式，仪表盘使用 Grafana（数据源可切换）

---

## TypeScript 代码示例

### 示例 1：OpenTelemetry 边缘追踪初始化

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

function initTracing(serviceName: string, endpoint: string) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERSION || '1.0.0',
    }),
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
  });
  sdk.start();
  return sdk;
}
```

### 示例 2：分层采样决策器

```typescript
interface SamplingDecision {
  shouldSample: boolean;
  rate: number;
  reason: string;
}

class TieredSampler {
  constructor(
    private baseRate: number = 0.01,
    private errorRate: number = 1.0,
    private slowThresholdMs: number = 1000,
    private slowRate: number = 0.5
  ) {}

  decide(statusCode: number, durationMs: number): SamplingDecision {
    if (statusCode >= 500) {
      return { shouldSample: true, rate: this.errorRate, reason: 'error_response' };
    }
    if (durationMs > this.slowThresholdMs) {
      return { shouldSample: Math.random() < this.slowRate, rate: this.slowRate, reason: 'slow_request' };
    }
    return { shouldSample: Math.random() < this.baseRate, rate: this.baseRate, reason: 'base_rate' };
  }
}
```

### 示例 3：指标预聚合器

```typescript
interface MetricRecord {
  name: string;
  labels: Record<string, string>;
  value: number;
  timestamp: number;
}

class EdgeMetricAggregator {
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private lastFlush = Date.now();

  increment(name: string, labels: Record<string, string>, value: number = 1) {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.counters.set(key, (this.counters.get(key) || 0) + value);
  }

  recordHistogram(name: string, labels: Record<string, string>, value: number) {
    const key = `${name}:${JSON.stringify(labels)}`;
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
  }

  flush(): { counters: MetricRecord[]; histograms: { name: string; labels: Record<string, string>; count: number; sum: number; buckets: Record<string, number> }[] } {
    const counterRecords: MetricRecord[] = [];
    for (const [key, value] of this.counters) {
      const [name, labelStr] = key.split(':', 2);
      counterRecords.push({ name, labels: JSON.parse(labelStr), value, timestamp: Date.now() });
    }
    this.counters.clear();

    const histogramRecords: any[] = [];
    for (const [key, values] of this.histograms) {
      const [name, labelStr] = key.split(':', 2);
      const sum = values.reduce((a, b) => a + b, 0);
      const buckets: Record<string, number> = {};
      for (const v of values) {
        const bucket = this.getBucket(v);
        buckets[bucket] = (buckets[bucket] || 0) + 1;
      }
      histogramRecords.push({ name, labels: JSON.parse(labelStr), count: values.length, sum, buckets });
    }
    this.histograms.clear();

    this.lastFlush = Date.now();
    return { counters: counterRecords, histograms: histogramRecords };
  }

  private getBucket(value: number): string {
    const boundaries = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    for (const b of boundaries) {
      if (value <= b) return `le_${b}`;
    }
    return 'le_inf';
  }
}
```

### 示例 4：追踪上下文传播器

```typescript
interface TraceContext {
  traceId: string;
  parentId: string;
  sampled: boolean;
}

class TracePropagator {
  private static TRACE_PARENT_REGEX = /^00-([a-f0-9]{32})-([a-f0-9]{16})-([01])$/;

  inject(context: TraceContext, headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      traceparent: `00-${context.traceId}-${context.parentId}-${context.sampled ? '01' : '00'}`,
    };
  }

  extract(headers: Record<string, string>): TraceContext | null {
    const traceparent = headers.traceparent || headers['traceparent'];
    if (!traceparent) return null;

    const match = traceparent.match(TracePropagator.TRACE_PARENT_REGEX);
    if (!match) return null;

    return {
      traceId: match[1],
      parentId: match[2],
      sampled: match[3] === '01',
    };
  }
}
```

### 示例 5：日志批量发送器

```typescript
class BatchedLogShipper {
  private buffer: any[] = [];
  private flushTimer: any;

  constructor(
    private endpoint: string,
    private batchSize: number = 100,
    private flushIntervalMs: number = 5000
  ) {
    this.startFlushTimer();
  }

  log(entry: any) {
    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch (err) {
      console.error('Failed to ship logs:', err);
      // In edge environments, logs may be lost if send fails
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }
}
```

### 示例 6：基数限制器

```typescript
class CardinalityLimiter {
  private counts = new Map<string, Set<string>>();
  private limits = new Map<string, number>();

  setLimit(metricName: string, maxCardinality: number) {
    this.limits.set(metricName, maxCardinality);
    if (!this.counts.has(metricName)) this.counts.set(metricName, new Set());
  }

  allow(metricName: string, labelSet: string): boolean {
    const limit = this.limits.get(metricName);
    if (!limit) return true;

    const set = this.counts.get(metricName)!;
    if (set.has(labelSet)) return true; // Already seen
    if (set.size >= limit) return false; // Cardinality exceeded

    set.add(labelSet);
    return true;
  }

  getStats(): Record<string, { current: number; limit: number; utilization: number }> {
    const stats: Record<string, any> = {};
    for (const [name, set] of this.counts) {
      const limit = this.limits.get(name) || 0;
      stats[name] = {
        current: set.size,
        limit,
        utilization: limit > 0 ? set.size / limit : 0,
      };
    }
    return stats;
  }
}
```

---

## 参考文献

1. OpenTelemetry. *Documentation.* <https://opentelemetry.io/docs/>
2. Honeycomb. *Observability Engineering.* O'Reilly Media, 2022.
3. Cloudflare. *Workers Analytics.* <https://developers.cloudflare.com/workers/observability/>
4. Vercel. *Analytics and Monitoring.* <https://vercel.com/docs/concepts/analytics>
5. Jaeger. *Distributed Tracing.* <https://www.jaegertracing.io/>
6. Sigelman, B., et al. *Dapper, a Large-Scale Distributed Systems Tracing Infrastructure.* Google Technical Report, 2010.
7. Grafana. *Tempo Documentation.* <https://grafana.com/docs/tempo/>
8. Datadog. *Distributed Tracing.* <https://docs.datadoghq.com/tracing/>
9. Lightstep. *Observability Maturity Model.* <https://docs.lightstep.com/>
10. Charity Majors. *Monitoring and Observability.* <https://charity.wtf/>
