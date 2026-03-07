# 可观测性基础设施全面指南：OTLP、OpenTelemetry与eBPF

## 目录

- [可观测性基础设施全面指南：OTLP、OpenTelemetry与eBPF](#可观测性基础设施全面指南otlpopentelemetry与ebpf)
  - [目录](#目录)
  - [1. OpenTelemetry核心架构](#1-opentelemetry核心架构)
    - [1.1 架构概述](#11-架构概述)
      - [1.1.1 核心组件定义](#111-核心组件定义)
      - [1.1.2 形式化架构定义](#112-形式化架构定义)
    - [1.2 数据模型](#12-数据模型)
      - [1.2.1 Resource（资源）](#121-resource资源)
      - [1.2.2 Span（追踪片段）](#122-span追踪片段)
      - [1.2.3 Metric（指标）](#123-metric指标)
      - [1.2.4 LogRecord（日志记录）](#124-logrecord日志记录)
    - [1.3 上下文传播](#13-上下文传播)
      - [1.3.1 W3C Trace Context](#131-w3c-trace-context)
      - [1.3.2 W3C Baggage](#132-w3c-baggage)
      - [1.3.3 传播器类型对比](#133-传播器类型对比)
    - [1.4 采样策略](#14-采样策略)
      - [1.4.1 采样策略概述](#141-采样策略概述)
      - [1.4.2 头部采样策略](#142-头部采样策略)
      - [1.4.3 尾部采样（Collector级别）](#143-尾部采样collector级别)
      - [1.4.4 采样策略对比](#144-采样策略对比)
    - [1.5 OTLP协议](#15-otlp协议)
      - [1.5.1 OTLP概述](#151-otlp概述)
      - [1.5.2 Protobuf定义](#152-protobuf定义)
      - [1.5.3 gRPC传输](#153-grpc传输)
      - [1.5.4 HTTP传输](#154-http传输)
      - [1.5.5 OTLP端点与Content-Type](#155-otlp端点与content-type)
  - [2. 可观测性三大支柱](#2-可观测性三大支柱)
    - [2.1 Tracing（分布式追踪）](#21-tracing分布式追踪)
      - [2.1.1 分布式追踪原理](#211-分布式追踪原理)
      - [2.1.2 Span生命周期管理](#212-span生命周期管理)
      - [2.1.3 Span链接（Links）](#213-span链接links)
      - [2.1.4 语义约定（Semantic Conventions）](#214-语义约定semantic-conventions)
    - [2.2 Metrics（指标）](#22-metrics指标)
      - [2.2.1 指标类型详解](#221-指标类型详解)
      - [2.2.2 指标聚合与视图](#222-指标聚合与视图)
      - [2.2.3 指标基数控制](#223-指标基数控制)
    - [2.3 Logging（日志）](#23-logging日志)
      - [2.3.1 结构化日志](#231-结构化日志)
      - [2.3.2 日志与追踪关联](#232-日志与追踪关联)
      - [2.3.3 日志处理器与桥接](#233-日志处理器与桥接)
  - [3. eBPF基础与可观测性应用](#3-ebpf基础与可观测性应用)
    - [3.1 eBPF原理](#31-ebpf原理)
      - [3.1.1 eBPF架构概述](#311-ebpf架构概述)
      - [3.1.2 eBPF程序类型](#312-ebpf程序类型)
      - [3.1.3 eBPF验证器约束](#313-ebpf验证器约束)
    - [3.2 eBPF在可观测性中的应用](#32-ebpf在可观测性中的应用)
      - [3.2.1 无侵入监控架构](#321-无侵入监控架构)
      - [3.2.2 系统调用监控示例](#322-系统调用监控示例)
      - [3.2.3 网络监控示例](#323-网络监控示例)
    - [3.3 eBPF与JS生态结合](#33-ebpf与js生态结合)
      - [3.3.1 架构模式](#331-架构模式)
      - [3.3.2 Node.js与eBPF Agent集成](#332-nodejs与ebpf-agent集成)
      - [3.3.3 eBPF Agent配置示例](#333-ebpf-agent配置示例)
  - [4. Node.js实现集成](#4-nodejs实现集成)
    - [4.1 OpenTelemetry SDK完整配置](#41-opentelemetry-sdk完整配置)
    - [4.2 自动Instrumentation详解](#42-自动instrumentation详解)
    - [4.3 自定义Span和Metric](#43-自定义span和metric)
    - [4.4 与后端集成](#44-与后端集成)
  - [5. 形式化论证与架构推导](#5-形式化论证与架构推导)
    - [5.1 OpenTelemetry形式化模型](#51-opentelemetry形式化模型)
      - [5.1.1 追踪系统形式化定义](#511-追踪系统形式化定义)
      - [5.1.2 采样理论](#512-采样理论)
      - [5.1.3 上下文传播形式化](#513-上下文传播形式化)
    - [5.2 eBPF形式化安全模型](#52-ebpf形式化安全模型)
    - [5.3 性能模型](#53-性能模型)
    - [5.4 架构推导](#54-架构推导)
    - [5.5 反例与错误配置](#55-反例与错误配置)
    - [5.6 性能优化最佳实践](#56-性能优化最佳实践)
  - [6. 总结](#6-总结)
    - [6.1 关键概念速查](#61-关键概念速查)
    - [6.2 决策树](#62-决策树)
    - [6.3 参考资源](#63-参考资源)

---

## 1. OpenTelemetry核心架构

### 1.1 架构概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OpenTelemetry Architecture                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   API Layer  │───▶│   SDK Layer  │───▶│  Exporters   │                  │
│  │  (Interface) │    │ (Processing) │    │  (Output)    │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                   │                   │                          │
│         ▼                   ▼                   ▼                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Traces API  │    │  Processors  │    │ OTLP/gRPC    │                  │
│  │  Metrics API │    │  Samplers    │    │ OTLP/HTTP    │                  │
│  │  Logs API    │    │  View Config │    │ Prometheus   │                  │
│  │  Context API │    │  Resources   │    │ Jaeger/Zipkin│                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
│                              ┌─────────────────┐                            │
│                              │   Collector     │                            │
│                              │  (Aggregation)  │                            │
│                              └─────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1.1.1 核心组件定义

| 组件 | 职责 | 稳定性级别 |
|------|------|-----------|
| **API** | 定义可观测性操作的接口契约 | Stable |
| **SDK** | 实现API，提供处理、导出功能 | Stable |
| **Collector** | 接收、处理、导出可观测数据 | Stable |
| **OTLP** | OpenTelemetry传输协议 | Stable |
| **Semantic Conventions** | 标准化属性命名 | Experimental |

#### 1.1.2 形式化架构定义

```
设系统 S = (A, D, P, E, C)

其中:
- A: API层 = {Traces_API, Metrics_API, Logs_API, Context_API, Baggage_API}
- D: 数据层 = {Resource, Span, Metric, LogRecord}
- P: 处理层 = {BatchSpanProcessor, SimpleSpanProcessor, View}
- E: 导出层 = {OTLPExporter, PrometheusExporter, ConsoleExporter}
- C: 配置层 = {Sampler, ResourceDetector, Propagator}

约束条件:
∀ a ∈ A: API(a) → SDK(a)  [API必须被SDK实现]
∀ d ∈ D: d.resource ≠ ∅    [所有数据必须关联Resource]
∀ p ∈ P: p.exporter ∈ E    [处理器必须关联导出器]
```

### 1.2 数据模型

#### 1.2.1 Resource（资源）

**定义**: Resource表示产生可观测数据的实体，包含一组属性键值对。

```typescript
// Resource 形式化定义
interface Resource {
  // 必需属性
  attributes: Map<string, AttributeValue>;  // 资源属性

  // 标准属性（Semantic Conventions）
  'service.name': string;           // 服务名称
  'service.version': string;        // 服务版本
  'service.namespace': string;      // 服务命名空间
  'deployment.environment': string; // 部署环境
  'host.name': string;              // 主机名
  'telemetry.sdk.name': string;     // SDK名称
  'telemetry.sdk.version': string;  // SDK版本
  'telemetry.sdk.language': string; // 编程语言
}

// TypeScript 实现示例
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'payment-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.2.3',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'ecommerce',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
  [SemanticResourceAttributes.HOST_NAME]: 'payment-pod-01',
  [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: 'opentelemetry',
  [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: 'nodejs',
  [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: '1.15.0',
});
```

**形式化属性约束**:

```
Resource属性约束:
1. 唯一性: ∀ k1, k2 ∈ keys(attributes): k1 ≠ k2
2. 类型限制: ∀ v ∈ values(attributes): v ∈ {string, number, boolean, string[]}
3. 长度限制: ∀ (k,v) ∈ attributes: |k| ≤ 128 ∧ |v| ≤ 256 (字符串值)
4. 基数限制: |attributes| ≤ 128
```

#### 1.2.2 Span（追踪片段）

**定义**: Span是分布式追踪的基本工作单元，表示一个操作或工作单元。

```typescript
// Span 完整数据模型
interface Span {
  // 标识信息
  traceId: string;        // 16字节 (32 hex chars) - 追踪ID
  spanId: string;         // 8字节 (16 hex chars) - Span ID
  parentSpanId?: string;  // 父Span ID（可选）

  // 基本信息
  name: string;           // Span名称
  kind: SpanKind;         // Span类型
  startTime: number;      // 开始时间戳 (Unix纳秒)
  endTime: number;        // 结束时间戳 (Unix纳秒)

  // 状态信息
  status: SpanStatus;     // Span状态

  // 属性与事件
  attributes: Map<string, AttributeValue>;  // 属性
  events: SpanEvent[];    // 事件列表
  links: SpanLink[];      // 链接列表
}

enum SpanKind {
  INTERNAL = 0,   // 内部操作
  SERVER = 1,     // 服务端操作
  CLIENT = 2,     // 客户端操作
  PRODUCER = 3,   // 生产者
  CONSUMER = 4,   // 消费者
}

interface SpanStatus {
  code: SpanStatusCode;   // UNSET, OK, ERROR
  message?: string;       // 错误消息（ERROR时）
}

interface SpanEvent {
  name: string;           // 事件名称
  timestamp: number;      // 事件时间戳
  attributes?: Map<string, AttributeValue>;  // 事件属性
}

interface SpanLink {
  traceId: string;        // 链接的追踪ID
  spanId: string;         // 链接的Span ID
  attributes?: Map<string, AttributeValue>;  // 链接属性
}
```

**Span生命周期状态机**:

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  NONE   │───▶│  START  │───▶│ RECORD  │───▶│  END    │─┘
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │              │              │
                    │              ▼              │
                    │         ┌─────────┐         │
                    │         │  EVENT  │         │
                    │         └─────────┘         │
                    │              │              │
                    │              ▼              │
                    │         ┌─────────┐         │
                    │         │  LINK   │         │
                    │         └─────────┘         │
                    │              │              │
                    └──────────────┴──────────────┘
```

#### 1.2.3 Metric（指标）

**定义**: Metric表示可聚合的测量值，用于监控和告警。

```typescript
// Metric 数据模型
interface Metric {
  name: string;           // 指标名称
  description: string;    // 描述
  unit?: string;          // 单位
  type: MetricType;       // 指标类型
  data: MetricData;       // 指标数据
}

type MetricType =
  | 'gauge'           // 瞬时值
  | 'sum'             // 累积值
  | 'histogram'       // 直方图
  | 'exponential_histogram'  // 指数直方图
  | 'summary';        // 摘要

// 各类Metric数据结构
interface GaugeData {
  dataPoints: DataPoint<number>[];
}

interface SumData {
  dataPoints: DataPoint<number>[];
  aggregationTemporality: Temporality;
  isMonotonic: boolean;   // 是否单调递增
}

interface HistogramData {
  dataPoints: HistogramDataPoint[];
  aggregationTemporality: Temporality;
}

interface DataPoint<T> {
  attributes: Map<string, AttributeValue>;
  startTime?: number;
  time: number;
  value: T;
}

interface HistogramDataPoint extends DataPoint<void> {
  count: number;
  sum: number;
  min?: number;
  max?: number;
  bucketCounts: number[];    // 每个桶的计数
  explicitBounds: number[];  // 桶边界
}

type Temporality = 'DELTA' | 'CUMULATIVE';
```

**Metric类型对比**:

| 类型 | 用途 | 聚合方式 | 典型场景 |
|------|------|----------|----------|
| Counter | 单调递增计数 | SUM | 请求数、错误数 |
| UpDownCounter | 可增可减计数 | SUM | 队列长度、连接数 |
| Gauge | 瞬时值 | LAST_VALUE | 温度、内存使用 |
| Histogram | 分布统计 | COUNT/SUM/BUCKET | 延迟分布 |
| ObservableGauge | 异步观测 | LAST_VALUE | CPU使用率 |
| ObservableCounter | 异步计数 | SUM | 累计字节数 |

#### 1.2.4 LogRecord（日志记录）

**定义**: LogRecord表示一条日志记录，与追踪和指标关联。

```typescript
// LogRecord 数据模型
interface LogRecord {
  // 时间信息
  timestamp?: number;           // 观测时间戳
  observedTimestamp: number;    // 观测时间戳

  // 严重程度
  severityNumber?: SeverityNumber;  // 严重程度数值
  severityText?: string;        // 严重程度文本

  // 追踪关联
  traceId?: string;             // 关联的追踪ID
  spanId?: string;              // 关联的Span ID
  traceFlags?: number;          // 追踪标志

  // 内容
  body: LogRecordBody;          // 日志内容
  attributes: Map<string, AttributeValue>;  // 属性
}

type SeverityNumber =
  | 1 | 2 | 3 | 4 | 5   // TRACE
  | 6 | 7 | 8 | 9 | 10  // DEBUG
  | 11 | 12 | 13 | 14   // INFO
  | 15 | 16 | 17 | 18   // WARN
  | 19 | 20 | 21 | 22   // ERROR
  | 23 | 24;            // FATAL

interface SeverityLevel {
  TRACE: 1-5;
  DEBUG: 6-10;
  INFO: 11-14;
  WARN: 15-18;
  ERROR: 19-22;
  FATAL: 23-24;
}

type LogRecordBody =
  | string
  | { [key: string]: any }  // 结构化日志
  | any[];                  // 数组
```

### 1.3 上下文传播

#### 1.3.1 W3C Trace Context

**定义**: W3C Trace Context是分布式追踪的标准传播格式，定义了如何在HTTP请求中传递追踪上下文。

```
┌─────────────────────────────────────────────────────────────────┐
│                    W3C Trace Context Format                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  traceparent Header:                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ version (2) | trace-id (32) | parent-id (16) | flags (2)   │ │
│  │    00       | 4bf92f3577b34da6a3ce929d0e0e4736 | 00f067aa0ba902b7 | 01 │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  tracestate Header (可选):                                       │
│  vendor1=value1,vendor2=value2                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**字段详解**:

| 字段 | 长度 | 说明 |
|------|------|------|
| version | 2 hex | 版本号，当前为00 |
| trace-id | 32 hex | 全局唯一追踪ID |
| parent-id | 16 hex | 当前请求的Span ID |
| flags | 2 hex | 标志位（sampled=01） |

```typescript
// Trace Context 解析与生成
class TraceContext {
  static readonly TRACEPARENT_HEADER = 'traceparent';
  static readonly TRACESTATE_HEADER = 'tracestate';

  // 解析 traceparent header
  static parseTraceParent(header: string): TraceParent | null {
    const parts = header.split('-');
    if (parts.length !== 4) return null;

    const [version, traceId, parentId, flags] = parts;

    // 验证格式
    if (!/^[0-9a-f]{2}$/.test(version)) return null;
    if (!/^[0-9a-f]{32}$/.test(traceId)) return null;
    if (!/^[0-9a-f]{16}$/.test(parentId)) return null;
    if (!/^[0-9a-f]{2}$/.test(flags)) return null;

    return {
      version,
      traceId,
      parentId,
      flags: parseInt(flags, 16),
      sampled: (parseInt(flags, 16) & 0x01) === 0x01,
    };
  }

  // 生成 traceparent header
  static createTraceParent(
    traceId: string,
    spanId: string,
    sampled: boolean
  ): string {
    const flags = sampled ? '01' : '00';
    return `00-${traceId}-${spanId}-${flags}`;
  }
}

// HTTP 传播器实现
import { W3CTraceContextPropagator } from '@opentelemetry/core';

const propagator = new W3CTraceContextPropagator();

// 注入上下文到HTTP headers
const headers: Record<string, string> = {};
propagator.inject(
  context,           // 当前上下文
  headers,           // 载体
  defaultTextMapSetter  // setter函数
);

// 从HTTP headers提取上下文
const extractedContext = propagator.extract(
  context,           // 父上下文
  request.headers,   // 载体
  defaultTextMapGetter  // getter函数
);
```

#### 1.3.2 W3C Baggage

**定义**: Baggage用于在分布式追踪中传递用户定义的属性。

```
┌─────────────────────────────────────────────────────────────────┐
│                      W3C Baggage Format                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  baggage Header:                                                 │
│  key1=value1,key2=value2;property1;property2,key3=value3         │
│                                                                  │
│  限制:                                                           │
│  - 总长度 ≤ 8192 bytes                                           │
│  - 每个key ≤ 256 characters                                      │
│  - 每个value ≤ 1024 characters                                   │
│  - 最多 180 个键值对                                             │
│                                                                  │
│  URL编码:                                                        │
│  - key: 不需要编码                                               │
│  - value: 需要百分号编码                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
// Baggage 操作
import { propagation, createBaggage, baggageEntryMetadataFromString } from '@opentelemetry/api';

// 创建 Baggage
const baggage = createBaggage({
  'user.id': { value: '12345' },
  'user.tier': { value: 'premium' },
  'request.priority': {
    value: 'high',
    metadata: baggageEntryMetadataFromString('property1;property2')
  },
});

// 设置到上下文
const ctxWithBaggage = propagation.setBaggage(context, baggage);

// 从上下文获取
const currentBaggage = propagation.getBaggage(ctxWithBaggage);
const userId = currentBaggage?.getEntry('user.id')?.value;

// 传播到下游服务
const headers: Record<string, string> = {};
propagation.inject(ctxWithBaggage, headers, defaultTextMapSetter);
// headers['baggage'] = 'user.id=12345,user.tier=premium,request.priority=high;property1;property2'
```

#### 1.3.3 传播器类型对比

| 传播器 | 格式 | 适用场景 |
|--------|------|----------|
| W3CTraceContextPropagator | W3C标准 | 现代系统，推荐 |
| JaegerPropagator | Uber格式 | 与Jaeger集成 |
| B3Propagator | Zipkin B3 | 与Zipkin集成 |
| AWSXRayPropagator | AWS格式 | AWS环境 |
| OTTracePropagator | OpenTracing | 遗留系统 |

### 1.4 采样策略

#### 1.4.1 采样策略概述

```
┌─────────────────────────────────────────────────────────────────┐
│                      采样决策时机                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐              ┌─────────────┐                   │
│  │ HEAD-based  │              │ TAIL-based  │                   │
│  │  (头部采样)  │              │  (尾部采样)  │                   │
│  └─────────────┘              └─────────────┘                   │
│         │                            │                          │
│         ▼                            ▼                          │
│  在Span开始时决定              在Span结束时决定                   │
│  优点: 低开销                  优点: 基于完整信息                 │
│  缺点: 无法看到错误追踪         缺点: 需要缓冲，高内存            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.4.2 头部采样策略

```typescript
import {
  TraceIdRatioBasedSampler,
  ParentBasedSampler,
  AlwaysOnSampler,
  AlwaysOffSampler
} from '@opentelemetry/sdk-trace-base';

// 1. AlwaysOnSampler - 始终采样
const alwaysOn = new AlwaysOnSampler();
// 采样率: 100%
// 适用: 开发环境、低流量系统

// 2. AlwaysOffSampler - 从不采样
const alwaysOff = new AlwaysOffSampler();
// 采样率: 0%
// 适用: 完全禁用追踪

// 3. TraceIdRatioBasedSampler - 基于Trace ID的概率采样
const ratioSampler = new TraceIdRatioBasedSampler(0.1);  // 10%采样率

// 采样决策算法（形式化）
// decision = (traceId_as_uint64 % 100) < (ratio * 100)
// 例如: traceId = 0x...f3, ratio = 0.1
// (0xf3 % 100) = 243 % 100 = 43
// 43 < 10 ? false → DROP

// 4. ParentBasedSampler - 基于父Span的采样决策
const parentBasedSampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),      // 根Span采样率
  remoteParentSampled: new AlwaysOnSampler(),   // 远程父Span已采样
  remoteParentNotSampled: new AlwaysOffSampler(), // 远程父Span未采样
  localParentSampled: new AlwaysOnSampler(),    // 本地父Span已采样
  localParentNotSampled: new AlwaysOffSampler(), // 本地父Span未采样
});
```

**采样决策流程**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ParentBasedSampler 决策流程                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │ 有父Span?   │────No───▶ 使用 root sampler                   │
│  └─────────────┘                                                │
│         │ Yes                                                   │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │ 父Span远程? │────No───▶ 使用 localParent* sampler           │
│  └─────────────┘                                                │
│         │ Yes                                                   │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │ 父Span已采样?│───Yes───▶ 使用 remoteParentSampled            │
│  └─────────────┘                                                │
│         │ No                                                    │
│         ▼                                                       │
│    使用 remoteParentNotSampled                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.4.3 尾部采样（Collector级别）

```yaml
# OpenTelemetry Collector 尾部采样配置
processors:
  tail_sampling:
    # 决策等待时间（必须大于最长Span持续时间）
    decision_wait: 10s

    # 同时评估的追踪数量
    num_traces: 100000

    # 预期新追踪速率（用于预分配）
    expected_new_traces_per_sec: 1000

    # 采样策略（按顺序评估，OR逻辑）
    policies:
      # 策略1: 错误追踪始终采样
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}

      # 策略2: 慢请求采样（延迟>1s）
      - name: slow_requests
        type: latency
        latency: {threshold_ms: 1000}

      # 策略3: 特定服务采样
      - name: important_services
        type: string_attribute
        string_attribute:
          key: service.name
          values: [payment-service, auth-service]

      # 策略4: 概率采样（剩余10%）
      - name: probabilistic
        type: probabilistic
        probabilistic: {sampling_percentage: 10}

      # 策略5: 组合策略（AND逻辑）
      - name: slow_and_important
        type: and
        and:
          and_sub_policy:
            - name: slow
              type: latency
              latency: {threshold_ms: 500}
            - name: important
              type: string_attribute
              string_attribute:
                key: http.route
                values: [/api/payment, /api/checkout]
```

#### 1.4.4 采样策略对比

| 策略 | 时机 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| AlwaysOn | 头部 | 完整数据 | 高成本 | 开发/测试 |
| AlwaysOff | 头部 | 零开销 | 无数据 | 禁用追踪 |
| TraceIdRatio | 头部 | 简单、可预测 | 可能错过错误 | 均匀负载 |
| ParentBased | 头部 | 保持追踪完整性 | 依赖父决策 | 分布式系统 |
| TailSampling | 尾部 | 基于结果决策 | 内存开销大 | 生产环境 |

### 1.5 OTLP协议

#### 1.5.1 OTLP概述

**定义**: OpenTelemetry Protocol (OTLP) 是OpenTelemetry原生的数据传输协议，用于将可观测数据从SDK传输到Collector或后端。

```
┌─────────────────────────────────────────────────────────────────┐
│                        OTLP 协议栈                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Application Layer                      │  │
│  │              (Traces, Metrics, Logs Data)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Serialization Layer                     │  │
│  │              (Protobuf Binary / JSON / JSON-NL)            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Transport Layer                         │  │
│  │              (gRPC / HTTP/1.1 / HTTP/2)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Security Layer                          │  │
│  │              (TLS / mTLS / OAuth2 / API Key)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.5.2 Protobuf定义

```protobuf
// trace.proto - Span定义
syntax = "proto3";

package opentelemetry.proto.trace.v1;

message TracesData {
  repeated ResourceSpans resource_spans = 1;
}

message ResourceSpans {
  opentelemetry.proto.resource.v1.Resource resource = 1;
  repeated ScopeSpans scope_spans = 2;
  string schema_url = 3;
}

message ScopeSpans {
  opentelemetry.proto.common.v1.InstrumentationScope scope = 1;
  repeated Span spans = 2;
  string schema_url = 3;
}

message Span {
  bytes trace_id = 1;
  bytes span_id = 2;
  string trace_state = 3;
  bytes parent_span_id = 4;
  string name = 5;
  SpanKind kind = 6;
  fixed64 start_time_unix_nano = 7;
  fixed64 end_time_unix_nano = 8;
  repeated opentelemetry.proto.common.v1.KeyValue attributes = 9;
  uint32 dropped_attributes_count = 10;
  repeated Event events = 11;
  uint32 dropped_events_count = 12;
  repeated Link links = 13;
  uint32 dropped_links_count = 14;
  Status status = 15;

  enum SpanKind {
    SPAN_KIND_UNSPECIFIED = 0;
    SPAN_KIND_INTERNAL = 1;
    SPAN_KIND_SERVER = 2;
    SPAN_KIND_CLIENT = 3;
    SPAN_KIND_PRODUCER = 4;
    SPAN_KIND_CONSUMER = 5;
  }

  message Event {
    fixed64 time_unix_nano = 1;
    string name = 2;
    repeated opentelemetry.proto.common.v1.KeyValue attributes = 3;
    uint32 dropped_attributes_count = 4;
  }

  message Link {
    bytes trace_id = 1;
    bytes span_id = 2;
    string trace_state = 3;
    repeated opentelemetry.proto.common.v1.KeyValue attributes = 4;
    uint32 dropped_attributes_count = 5;
  }

  message Status {
    StatusCode code = 1;
    string message = 2;

    enum StatusCode {
      STATUS_CODE_UNSET = 0;
      STATUS_CODE_OK = 1;
      STATUS_CODE_ERROR = 2;
    }
  }
}
```

#### 1.5.3 gRPC传输

```typescript
// OTLP gRPC Exporter 配置
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { credentials } from '@grpc/grpc-js';

// 基本配置
const traceExporter = new OTLPTraceExporter({
  url: 'grpc://localhost:4317',  // OTLP gRPC默认端口

  // 元数据（用于认证等）
  metadata: new Metadata(),

  // gRPC通道凭证
  credentials: credentials.createInsecure(),  // 开发环境
  // credentials: credentials.createSsl(),    // 生产环境

  // 超时设置
  timeoutMillis: 30000,

  // 压缩
  compression: 'gzip',  // 'gzip' | 'none'
});

// 带认证的gRPC配置
const secureTraceExporter = new OTLPTraceExporter({
  url: 'grpcs://otel-collector.example.com:4317',
  credentials: credentials.createSsl(
    fs.readFileSync('ca.crt'),      // CA证书
    fs.readFileSync('client.key'),  // 客户端密钥
    fs.readFileSync('client.crt'),  // 客户端证书
  ),
  metadata: () => {
    const meta = new Metadata();
    meta.add('authorization', `Bearer ${getToken()}`);
    return meta;
  },
});
```

#### 1.5.4 HTTP传输

```typescript
// OTLP HTTP Exporter 配置
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

// 基本HTTP配置
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',  // OTLP HTTP默认端口

  // 自定义headers
  headers: {
    'x-api-key': 'your-api-key',
    'x-custom-header': 'custom-value',
  },

  // 并发请求数
  concurrencyLimit: 10,

  // 超时设置
  timeoutMillis: 30000,

  // 压缩
  compression: 'gzip',
});

// 带重试和退避的配置
import { ExportResultCode } from '@opentelemetry/core';

class RetryableOTLPTraceExporter extends OTLPTraceExporter {
  private maxRetries = 3;
  private baseDelayMs = 1000;

  async export(items: ReadableSpan[], resultCallback: (result: ExportResult) => void): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await super.export(items, (result) => {
          if (result.code === ExportResultCode.SUCCESS) {
            resultCallback(result);
            return;
          }
          lastError = result.error || new Error('Export failed');
        });
        return;  // 成功
      } catch (error) {
        lastError = error as Error;

        // 指数退避
        const delay = this.baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 所有重试失败
    resultCallback({
      code: ExportResultCode.FAILED,
      error: lastError || new Error(`Failed after ${this.maxRetries} attempts`),
    });
  }
}
```

#### 1.5.5 OTLP端点与Content-Type

| 数据类型 | HTTP端点 | gRPC方法 | Content-Type |
|----------|----------|----------|--------------|
| Traces | `/v1/traces` | `Export` | `application/x-protobuf` |
| Metrics | `/v1/metrics` | `Export` | `application/x-protobuf` |
| Logs | `/v1/logs` | `Export` | `application/x-protobuf` |
| JSON格式 | - | - | `application/json` |
| NDJSON | - | - | `application/x-ndjson` |

---

## 2. 可观测性三大支柱

### 2.1 Tracing（分布式追踪）

#### 2.1.1 分布式追踪原理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        分布式追踪示例                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Trace: abc123 (全局唯一)                                                    │
│  │                                                                           │
│  ├─[Span: api-gateway]────┬─[Span: auth-service]                            │
│  │  spanId: span001       │  spanId: span002                                 │
│  │  duration: 150ms       │  duration: 30ms                                  │
│  │  kind: SERVER          │  kind: CLIENT → SERVER                           │
│  │                        │                                                  │
│  ├─[Span: user-service]──┼─[Span: database]                                  │
│  │  spanId: span003       │  spanId: span004                                 │
│  │  duration: 80ms        │  duration: 20ms                                  │
│  │  kind: CLIENT          │  kind: CLIENT                                    │
│  │                        │                                                  │
│  └─[Span: notification]──┴─[Span: email-provider]                           │
│     spanId: span005         spanId: span006                                  │
│     duration: 100ms         duration: 80ms                                   │
│     kind: PRODUCER          kind: CONSUMER                                   │
│                                                                              │
│  总持续时间: 150ms (由gateway Span决定)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.1.2 Span生命周期管理

```typescript
import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('payment-service', '1.0.0');

// 方式1: 使用startActiveSpan（推荐）
async function processPayment(orderId: string, amount: number): Promise<void> {
  return tracer.startActiveSpan(
    'process-payment',           // Span名称
    {
      kind: SpanKind.INTERNAL,   // Span类型
      attributes: {              // 初始属性
        'payment.order_id': orderId,
        'payment.amount': amount,
      },
    },
    async (span) => {            // 回调函数
      try {
        // 添加事件
        span.addEvent('payment.validation.started');
        await validatePayment(orderId, amount);
        span.addEvent('payment.validation.completed');

        // 记录处理
        span.addEvent('payment.processing', {
          'payment.processor': 'stripe',
          'payment.currency': 'USD',
        });
        await chargePayment(orderId, amount);

        // 设置成功状态
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        // 记录错误
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        });
        throw error;
      } finally {
        // 必须结束Span
        span.end();
      }
    }
  );
}

// 方式2: 手动管理Span（需要显式传递上下文）
async function processPaymentManual(orderId: string): Promise<void> {
  const span = tracer.startSpan('process-payment', {
    kind: SpanKind.INTERNAL,
  });

  // 创建新上下文并设置为活跃
  const ctx = trace.setSpan(context.active(), span);

  try {
    // 使用新上下文执行操作
    await context.with(ctx, async () => {
      await validatePayment(orderId, 100);
    });

    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    span.end();
  }
}

// 方式3: 嵌套Span（创建子Span）
async function complexOperation(): Promise<void> {
  return tracer.startActiveSpan('complex-operation', async (parentSpan) => {
    // 子Span1: 数据库查询
    await tracer.startActiveSpan(
      'db-query',
      { kind: SpanKind.CLIENT },
      async (dbSpan) => {
        dbSpan.setAttribute('db.system', 'postgresql');
        dbSpan.setAttribute('db.statement', 'SELECT * FROM orders');
        await executeQuery();
        dbSpan.end();
      }
    );

    // 子Span2: HTTP调用
    await tracer.startActiveSpan(
      'http-request',
      { kind: SpanKind.CLIENT },
      async (httpSpan) => {
        httpSpan.setAttribute('http.method', 'POST');
        httpSpan.setAttribute('http.url', 'https://api.example.com/data');
        await makeHttpRequest();
        httpSpan.end();
      }
    );

    parentSpan.end();
  });
}
```

#### 2.1.3 Span链接（Links）

```typescript
// Span链接用于关联相关但不属于同一父子的Span
// 典型场景: 批处理、消息重放、缓存命中

async function processBatch(messages: Message[]): Promise<void> {
  // 获取所有消息的SpanContext
  const links = messages.map(msg => ({
    context: msg.spanContext,  // 消息生产时的SpanContext
    attributes: {
      'messaging.message_id': msg.id,
      'messaging.operation': 'receive',
    },
  }));

  // 创建批处理Span，链接到所有原始消息
  return tracer.startActiveSpan(
    'process-batch',
    { links },  // 链接到所有消息
    async (span) => {
      span.setAttribute('batch.size', messages.length);

      for (const message of messages) {
        await processMessage(message);
      }

      span.end();
    }
  );
}

// 缓存命中场景
async function getDataWithCache(key: string): Promise<Data> {
  const cachedSpan = tracer.startSpan('cache-lookup');

  const cached = await cache.get(key);
  if (cached) {
    // 缓存命中，链接到原始写入Span
    const writeSpanContext = cached.spanContext;

    const readSpan = tracer.startSpan('cache-read', {
      links: [{ context: writeSpanContext }],
      attributes: {
        'cache.hit': true,
        'cache.key': key,
      },
    });
    readSpan.end();

    cachedSpan.setAttribute('cache.result', 'hit');
    cachedSpan.end();

    return cached.data;
  }

  // 缓存未命中
  cachedSpan.setAttribute('cache.result', 'miss');
  cachedSpan.end();

  // 从数据源获取
  const data = await fetchFromSource(key);

  // 写入缓存
  const writeSpan = tracer.startSpan('cache-write', {
    attributes: {
      'cache.key': key,
      'cache.ttl': 3600,
    },
  });
  await cache.set(key, { data, spanContext: writeSpan.spanContext() });
  writeSpan.end();

  return data;
}
```

#### 2.1.4 语义约定（Semantic Conventions）

```typescript
import { SemanticAttributes, SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// HTTP Span 属性
function createHttpSpan(request: IncomingMessage): void {
  tracer.startActiveSpan('http-request', {
    kind: SpanKind.SERVER,
    attributes: {
      // HTTP属性
      [SemanticAttributes.HTTP_METHOD]: request.method,
      [SemanticAttributes.HTTP_URL]: request.url,
      [SemanticAttributes.HTTP_SCHEME]: 'https',
      [SemanticAttributes.HTTP_HOST]: request.headers.host,
      [SemanticAttributes.HTTP_TARGET]: request.path,
      [SemanticAttributes.HTTP_USER_AGENT]: request.headers['user-agent'],
      [SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH]: request.headers['content-length'],

      // 服务端属性
      [SemanticAttributes.NET_HOST_NAME]: 'api.example.com',
      [SemanticAttributes.NET_HOST_PORT]: 443,

      // 客户端属性（如果是客户端Span）
      // [SemanticAttributes.NET_PEER_NAME]: 'backend.example.com',
      // [SemanticAttributes.NET_PEER_PORT]: 8080,
    },
  }, async (span) => {
    try {
      const response = await handleRequest(request);

      // 响应属性
      span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, response.statusCode);
      span.setAttribute(SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH, response.contentLength);

      if (response.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${response.statusCode}`,
        });
      }
    } finally {
      span.end();
    }
  });
}

// 数据库 Span 属性
function createDbSpan(query: string, table: string): void {
  tracer.startActiveSpan('db-query', {
    kind: SpanKind.CLIENT,
    attributes: {
      [SemanticAttributes.DB_SYSTEM]: 'postgresql',
      [SemanticAttributes.DB_CONNECTION_STRING]: 'postgresql://localhost:5432/mydb',
      [SemanticAttributes.DB_USER]: 'app_user',
      [SemanticAttributes.DB_STATEMENT]: query,
      [SemanticAttributes.DB_OPERATION]: 'SELECT',
      [SemanticAttributes.DB_SQL_TABLE]: table,
      [SemanticAttributes.NET_PEER_NAME]: 'db.example.com',
      [SemanticAttributes.NET_PEER_PORT]: 5432,
    },
  }, async (span) => {
    // 执行查询...
    span.end();
  });
}

// 消息队列 Span 属性
function createMessagingSpan(queue: string, messageId: string): void {
  tracer.startActiveSpan('messaging-process', {
    kind: SpanKind.CONSUMER,
    attributes: {
      [SemanticAttributes.MESSAGING_SYSTEM]: 'kafka',
      [SemanticAttributes.MESSAGING_DESTINATION]: queue,
      [SemanticAttributes.MESSAGING_DESTINATION_KIND]: 'topic',
      [SemanticAttributes.MESSAGING_OPERATION]: 'process',
      [SemanticAttributes.MESSAGING_MESSAGE_ID]: messageId,
      [SemanticAttributes.MESSAGING_KAFKA_CONSUMER_GROUP]: 'payment-processor',
      [SemanticAttributes.MESSAGING_KAFKA_PARTITION]: 3,
      [SemanticAttributes.MESSAGING_KAFKA_MESSAGE_OFFSET]: 12345,
    },
  }, async (span) => {
    // 处理消息...
    span.end();
  });
}
```

### 2.2 Metrics（指标）

#### 2.2.1 指标类型详解

```typescript
import { metrics, ValueType } from '@opentelemetry/api';

const meter = metrics.getMeter('payment-service', '1.0.0');

// 1. Counter（计数器）- 单调递增
// 用途: 请求数、错误数、处理的消息数
const requestCounter = meter.createCounter('http.requests.total', {
  description: 'Total HTTP requests',
  unit: '1',  // 无量纲
});

// 使用
requestCounter.add(1, {
  'http.method': 'GET',
  'http.route': '/api/users',
  'http.status_code': '200',
});

// 2. UpDownCounter（可增可减计数器）
// 用途: 连接数、队列长度、内存使用
const activeConnections = meter.createUpDownCounter('connections.active', {
  description: 'Number of active connections',
});

// 使用
activeConnections.add(1, { 'connection.type': 'websocket' });  // 连接建立
activeConnections.add(-1, { 'connection.type': 'websocket' }); // 连接关闭

// 3. Gauge（仪表盘）- 瞬时值
// 用途: 温度、CPU使用率、内存使用量
const memoryUsage = meter.createObservableGauge('memory.usage', {
  description: 'Memory usage in bytes',
  unit: 'By',
});

// 使用（回调方式）
memoryUsage.addCallback((observableResult) => {
  const usage = process.memoryUsage();
  observableResult.observe(usage.heapUsed, { type: 'heap' });
  observableResult.observe(usage.rss, { type: 'rss' });
});

// 4. Histogram（直方图）- 分布统计
// 用途: 请求延迟、响应大小
const requestDuration = meter.createHistogram('http.request.duration', {
  description: 'HTTP request duration',
  unit: 'ms',
  // 自定义桶边界（可选）
  advice: {
    explicitBucketBoundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  },
});

// 使用
const startTime = Date.now();
await handleRequest();
const duration = Date.now() - startTime;
requestDuration.record(duration, {
  'http.method': 'POST',
  'http.route': '/api/payment',
});

// 5. ObservableCounter（异步计数器）
// 用途: 系统级统计（CPU时间、磁盘IO）
const cpuTime = meter.createObservableCounter('cpu.time', {
  description: 'CPU time used',
  unit: 's',
});

cpuTime.addCallback((observableResult) => {
  const cpuUsage = process.cpuUsage();
  observableResult.observe(cpuUsage.user / 1e6, { mode: 'user' });
  observableResult.observe(cpuUsage.system / 1e6, { mode: 'system' });
});

// 6. ObservableUpDownCounter（异步可增可减计数器）
// 用途: 文件描述符数、线程数
const openFileDescriptors = meter.createObservableUpDownCounter('file.descriptors.open', {
  description: 'Number of open file descriptors',
});

openFileDescriptors.addCallback(async (observableResult) => {
  const fdCount = await getOpenFileDescriptorCount();
  observableResult.observe(fdCount);
});
```

#### 2.2.2 指标聚合与视图

```typescript
import { View, Aggregation, InstrumentType } from '@opentelemetry/sdk-metrics';

// 视图配置 - 控制指标的聚合方式
const views: View[] = [
  // 视图1: 自定义直方图桶边界
  new View({
    // 匹配条件
    instrumentName: 'http.request.duration',
    instrumentType: InstrumentType.HISTOGRAM,
    meterName: 'payment-service',

    // 聚合配置
    aggregation: Aggregation.Histogram({
      bucketBoundaries: [10, 50, 100, 200, 500, 1000],
    }),

    // 属性过滤（减少基数）
    attributeKeys: ['http.method', 'http.route'],  // 只保留这些属性
  }),

  // 视图2: 将某些指标聚合为Sum
  new View({
    instrumentName: 'http.request.body.size',
    aggregation: Aggregation.Sum(),
  }),

  // 视图3: 将高基数指标聚合为Count
  new View({
    instrumentName: 'user.requests',
    aggregation: Aggregation.Count(),  // 只计数，不保留用户ID
  }),

  // 视图4: 完全丢弃某些指标
  new View({
    instrumentName: 'debug.*',
    aggregation: Aggregation.Drop(),
  }),

  // 视图5: 自定义名称和描述
  new View({
    instrumentName: 'db.query.duration',
    name: 'database.query.latency',  // 重命名
    description: 'Database query latency in milliseconds',
    aggregation: Aggregation.Histogram({
      bucketBoundaries: [1, 5, 10, 25, 50, 100],
    }),
  }),
];

// 配置MeterProvider
const meterProvider = new MeterProvider({
  views,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 60000,
    }),
  ],
});
```

#### 2.2.3 指标基数控制

```typescript
// 基数控制最佳实践

// ❌ 错误：高基数属性
requestCounter.add(1, {
  'user.id': userId,           // 可能无限增长
  'request.timestamp': Date.now().toString(),  // 每个请求都不同
  'trace.id': traceId,         // 每个请求都不同
});

// ✅ 正确：低基数属性
requestCounter.add(1, {
  'http.method': method,       // GET/POST/PUT/DELETE (4种)
  'http.route': route,         // /api/users, /api/orders (有限)
  'http.status_code': status,  // 200, 400, 500 (有限)
  'deployment.environment': env, // dev/staging/prod (3种)
});

// 基数估计公式
// 总时间序列数 = ∏(每个属性的基数)
//
// 示例:
// http.method (4) × http.route (20) × http.status_code (5) × environment (3)
// = 4 × 20 × 5 × 3 = 1,200 时间序列

// 基数限制配置
const meterProvider = new MeterProvider({
  // 每个指标的最大属性组合数
  views: [
    new View({
      instrumentName: '*',
      // 使用属性键过滤限制基数
      attributeKeys: ['http.method', 'http.route', 'http.status_code'],
    }),
  ],
});

// 基数警告阈值
// 当某个指标的基数超过阈值时，SDK会记录警告
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 60000,
  // 某些实现支持基数限制
});
```

### 2.3 Logging（日志）

#### 2.3.1 结构化日志

```typescript
import { logs } from '@opentelemetry/api-logs';

const logger = logs.getLogger('payment-service', '1.0.0');

// 结构化日志记录
function logPaymentProcessed(orderId: string, amount: number, status: string): void {
  logger.emit({
    severityNumber: 13,  // INFO
    severityText: 'INFO',
    body: 'Payment processed successfully',
    attributes: {
      'payment.order_id': orderId,
      'payment.amount': amount,
      'payment.currency': 'USD',
      'payment.status': status,
      'payment.processor': 'stripe',
      'payment.method': 'credit_card',
    },
  });
}

// 带追踪关联的日志
function logWithTrace(
  message: string,
  severity: number,
  span: Span
): void {
  const spanContext = span.spanContext();

  logger.emit({
    severityNumber: severity,
    severityText: getSeverityText(severity),
    body: message,
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: spanContext.traceFlags,
    attributes: {
      // 额外上下文
      'service.name': 'payment-service',
      'service.version': '1.0.0',
    },
  });
}

// 错误日志
function logError(error: Error, context: Record<string, any>): void {
  logger.emit({
    severityNumber: 19,  // ERROR
    severityText: 'ERROR',
    body: {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    },
    attributes: {
      'error.type': error.constructor.name,
      'error.message': error.message,
      ...context,
    },
  });
}
```

#### 2.3.2 日志与追踪关联

```typescript
import { trace, context } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

// 配置LoggerProvider
const loggerProvider = new LoggerProvider({
  resource: new Resource({
    'service.name': 'payment-service',
  }),
});

// 添加处理器
loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(
    new OTLPLogExporter({
      url: 'http://localhost:4318/v1/logs',
    })
  )
);

// 设置全局LoggerProvider
logs.setGlobalLoggerProvider(loggerProvider);

// 自动关联追踪的日志包装器
class TracingLogger {
  private logger = logs.getLogger('payment-service');

  private emit(
    level: number,
    message: string,
    attributes?: Record<string, any>
  ): void {
    // 获取当前Span
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();

    this.logger.emit({
      severityNumber: level,
      severityText: this.getLevelName(level),
      body: message,
      // 自动关联追踪
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      traceFlags: spanContext?.traceFlags,
      attributes: {
        ...attributes,
        'logger.name': 'TracingLogger',
      },
    });

    // 同时添加到Span事件
    span?.addEvent('log', {
      'log.level': this.getLevelName(level),
      'log.message': message,
      ...attributes,
    });
  }

  debug(message: string, attrs?: Record<string, any>): void {
    this.emit(7, message, attrs);  // DEBUG
  }

  info(message: string, attrs?: Record<string, any>): void {
    this.emit(13, message, attrs);  // INFO
  }

  warn(message: string, attrs?: Record<string, any>): void {
    this.emit(17, message, attrs);  // WARN
  }

  error(message: string, error?: Error, attrs?: Record<string, any>): void {
    this.emit(19, message, {
      ...attrs,
      'error.message': error?.message,
      'error.stack': error?.stack,
    });
  }

  private getLevelName(level: number): string {
    if (level <= 5) return 'TRACE';
    if (level <= 10) return 'DEBUG';
    if (level <= 14) return 'INFO';
    if (level <= 18) return 'WARN';
    if (level <= 22) return 'ERROR';
    return 'FATAL';
  }
}

// 使用示例
const logger = new TracingLogger();

async function processOrder(orderId: string): Promise<void> {
  return tracer.startActiveSpan('process-order', async (span) => {
    logger.info('Starting order processing', { orderId });

    try {
      await validateOrder(orderId);
      logger.info('Order validated', { orderId });

      await chargePayment(orderId);
      logger.info('Payment charged', { orderId });

      await sendConfirmation(orderId);
      logger.info('Confirmation sent', { orderId });
    } catch (error) {
      logger.error('Order processing failed', error as Error, { orderId });
      throw error;
    }
  });
}
```

#### 2.3.3 日志处理器与桥接

```typescript
// Winston 桥接器 - 将Winston日志发送到OpenTelemetry
import winston from 'winston';
import { logs } from '@opentelemetry/api-logs';

class WinstonOpenTelemetryTransport extends winston.Transport {
  private logger = logs.getLogger('winston-bridge');

  log(info: any, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    const severityMap: Record<string, number> = {
      silly: 5,      // TRACE2
      debug: 7,      // DEBUG
      verbose: 9,    // DEBUG3
      info: 13,      // INFO
      warn: 17,      // WARN
      error: 19,     // ERROR
    };

    const { level, message, ...meta } = info;

    this.logger.emit({
      severityNumber: severityMap[level] || 13,
      severityText: level.toUpperCase(),
      body: message,
      attributes: meta,
    });

    callback();
  }
}

// 配置Winston
const winstonLogger = winston.createLogger({
  transports: [
    new WinstonOpenTelemetryTransport(),
    new winston.transports.Console(),
  ],
});

// Pino 桥接器
import pino from 'pino';

const pinoLogger = pino({
  mixin() {
    // 添加追踪上下文到每个日志
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();

    if (spanContext) {
      return {
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        trace_flags: spanContext.traceFlags,
      };
    }
    return {};
  },
});

// Bunyan 桥接器
import bunyan from 'bunyan';

const bunyanLogger = bunyan.createLogger({
  name: 'payment-service',
  serializers: {
    // 自定义序列化器添加追踪信息
    trace() {
      const span = trace.getSpan(context.active());
      const spanContext = span?.spanContext();
      return spanContext || {};
    },
  },
});
```

---

## 3. eBPF基础与可观测性应用

### 3.1 eBPF原理

#### 3.1.1 eBPF架构概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            eBPF Architecture                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Space                    Kernel Space                                  │
│  ┌─────────────┐              ┌─────────────────────────────────────┐       │
│  │  User App   │              │           eBPF Subsystem            │       │
│  │  (Go/C/Rust)│              │  ┌───────────────────────────────┐  │       │
│  └──────┬──────┘              │  │      eBPF Verifier            │  │       │
│         │                     │  │  - Static analysis            │  │       │
│         │  BPF Syscall        │  │  - Loop bound checking        │  │       │
│         ▼                     │  │  - Memory safety              │  │       │
│  ┌─────────────┐              │  └───────────────────────────────┘  │       │
│  │  BPF Loader │─────────────▶│              │                      │       │
│  │  (libbpf/   │  Load/Attach │              ▼                      │       │
│  │   bpftool)  │              │  ┌───────────────────────────────┐  │       │
│  └─────────────┘              │  │      JIT Compiler             │  │       │
│         │                     │  │  - x86_64/ARM64/...           │  │       │
│         │  BPF ELF            │  │  - Native code generation     │  │       │
│         ▼                     │  └───────────────────────────────┘  │       │
│  ┌─────────────┐              │              │                      │       │
│  │  BPF Object │              │              ▼                      │       │
│  │  (.o file)  │              │  ┌───────────────────────────────┐  │       │
│  └─────────────┘              │  │     BPF Program (native)      │  │       │
│                               │  │  - kprobe/kretprobe           │  │       │
│                               │  │  - tracepoint                 │  │       │
│                               │  │  - uprobe/uretprobe           │  │       │
│                               │  │  - socket filter              │  │       │
│                               │  │  - XDP/TC                     │  │       │
│                               │  └───────────────────────────────┘  │       │
│                               │              │                      │       │
│                               │              ▼                      │       │
│                               │  ┌───────────────────────────────┐  │       │
│                               │  │       BPF Maps                │  │       │
│                               │  │  - Hash map                   │  │       │
│                               │  │  - Array                      │  │       │
│                               │  │  - Ring buffer                │  │       │
│                               │  │  - LRU map                    │  │       │
│                               │  └───────────────────────────────┘  │       │
│                               │                                     │       │
│                               └─────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 eBPF程序类型

| 程序类型 | 挂载点 | 用途 | 可观测性应用 |
|----------|--------|------|-------------|
| `kprobe` | 内核函数入口 | 动态内核追踪 | 系统调用监控 |
| `kretprobe` | 内核函数返回 | 动态内核追踪 | 函数返回值分析 |
| `tracepoint` | 内核静态追踪点 | 静态内核追踪 | 调度、文件系统事件 |
| `uprobe` | 用户空间函数入口 | 动态用户态追踪 | 应用函数调用 |
| `uretprobe` | 用户空间函数返回 | 动态用户态追踪 | 应用函数返回值 |
| `perf_event` | 性能计数器 | 硬件性能监控 | CPU周期、缓存未命中 |
| `socket_filter` | 网络套接字 | 网络包过滤 | 网络监控 |
| `tc` | 流量控制 | 网络流量控制 | 网络延迟分析 |
| `xdp` | 网络驱动层 | 高速包处理 | DDoS检测 |

#### 3.1.3 eBPF验证器约束

```c
// eBPF程序必须满足以下约束才能通过验证器

// 1. 无无限循环 - 循环必须有界
for (int i = 0; i < MAX_ITERATIONS; i++) {  // ✅ 有界循环
    // ...
}

// while (1) { }  // ❌ 无限循环，验证失败

// 2. 内存访问边界检查
char data[100];
int index = bpf_get_prandom_u32() % 100;  // ✅ 确保边界
char c = data[index];

// char c = data[bpf_get_prandom_u32()];  // ❌ 可能越界

// 3. 无空指针解引用
struct task_struct *task = bpf_get_current_task();
if (task) {  // ✅ 检查非空
    // 访问task
}

// 4. 栈大小限制（512字节）
char small_buffer[256];  // ✅
// char large_buffer[1024];  // ❌ 超过栈限制

// 5. 指令数量限制（100万条）
// 复杂程序可能被拒绝

// 6. 无未初始化变量使用
int x;
// int y = x + 1;  // ❌ x未初始化
```

### 3.2 eBPF在可观测性中的应用

#### 3.2.1 无侵入监控架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    eBPF-based Observability Architecture                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Application Layer                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  App 1   │  │  App 2   │  │  App 3   │  │  App N   │            │   │
│  │  │ (Node.js)│  │  (Go)    │  │  (Java)  │  │  (Rust)  │            │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │   │
│  │       │             │             │             │                   │   │
│  │       └─────────────┴─────────────┴─────────────┘                   │   │
│  │                     │                                               │   │
│  │                     ▼                                               │   │
│  │       ┌─────────────────────────────────────────┐                   │   │
│  │       │     eBPF Probes (Kernel Space)          │                   │   │
│  │       │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │                   │   │
│  │       │  │kprobes  │ │tracepnts│ │uprobes  │   │                   │   │
│  │       │  │(syscalls│ │(sched/  │ │(runtime│   │                   │   │
│  │       │  │ network)│ │ fs/mm)  │ │  funcs) │   │                   │   │
│  │       │  └────┬────┘ └────┬────┘ └────┬────┘   │                   │   │
│  │       │       └───────────┴───────────┘        │                   │   │
│  │       │                   │                     │                   │   │
│  │       │                   ▼                     │                   │   │
│  │       │  ┌─────────────────────────────────┐   │                   │   │
│  │       │  │        BPF Maps                 │   │                   │   │
│  │       │  │  - Ring Buffer (events)         │   │                   │   │
│  │       │  │  - Hash Maps (aggregations)     │   │                   │   │
│  │       │  │  - Arrays (metrics)             │   │                   │   │
│  │       │  └─────────────────────────────────┘   │                   │   │
│  │       └─────────────────────────────────────────┘                   │   │
│  │                          │                                          │   │
│  └──────────────────────────┼──────────────────────────────────────────┘   │
│                             │                                              │
│                             ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     eBPF Agent (User Space)                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │Event Reader │  │  Aggregator │  │  Enricher   │  │  Exporter  │ │   │
│  │  │(ring buffer)│──▶│  (metrics)  │──▶│(add k8s/   │──▶│(OTLP/      │ │   │
│  │  │             │  │             │  │  host info) │  │ Prometheus)│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 系统调用监控示例

```c
// syscalls_monitor.bpf.c - 监控系统调用
#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>
#include <bpf/bpf_core_read.h>

// 定义事件结构
struct syscall_event {
    u32 pid;
    u32 uid;
    u64 timestamp;
    u64 duration_ns;
    char comm[16];
    char syscall_name[32];
    s64 retval;
};

// Ring buffer map用于向用户空间传递事件
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);  // 256KB
} events SEC(".maps");

// 临时存储进入时间
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, u64);    // pid_tgid
    __type(value, u64);  // entry timestamp
} entry_times SEC(".maps");

// 跟踪系统调用入口
SEC("tp/raw_syscalls/sys_enter")
int trace_sys_enter(struct trace_event_raw_sys_enter *ctx)
{
    u64 pid_tgid = bpf_get_current_pid_tgid();
    u64 timestamp = bpf_ktime_get_ns();

    // 记录进入时间
    bpf_map_update_elem(&entry_times, &pid_tgid, &timestamp, BPF_ANY);

    return 0;
}

// 跟踪系统调用出口
SEC("tp/raw_syscalls/sys_exit")
int trace_sys_exit(struct trace_event_raw_sys_exit *ctx)
{
    u64 pid_tgid = bpf_get_current_pid_tgid();
    u32 pid = pid_tgid >> 32;

    // 获取进入时间
    u64 *entry_time = bpf_map_lookup_elem(&entry_times, &pid_tgid);
    if (!entry_time)
        return 0;

    // 计算持续时间
    u64 duration = bpf_ktime_get_ns() - *entry_time;

    // 分配ring buffer条目
    struct syscall_event *event = bpf_ringbuf_reserve(&events, sizeof(*event), 0);
    if (!event)
        goto cleanup;

    // 填充事件数据
    event->pid = pid;
    event->uid = bpf_get_current_uid_gid() & 0xFFFFFFFF;
    event->timestamp = *entry_time;
    event->duration_ns = duration;
    event->retval = ctx->ret;

    bpf_get_current_comm(&event->comm, sizeof(event->comm));
    bpf_probe_read_str(&event->syscall_name, sizeof(event->syscall_name),
                       (void *)ctx->args[0]);

    // 提交到ring buffer
    bpf_ringbuf_submit(event, 0);

cleanup:
    bpf_map_delete_elem(&entry_times, &pid_tgid);
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

#### 3.2.3 网络监控示例

```c
// network_monitor.bpf.c - 监控网络连接
#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct connection_event {
    u32 pid;
    u32 saddr;
    u32 daddr;
    u16 sport;
    u16 dport;
    u64 bytes_sent;
    u64 bytes_recv;
    u64 duration_ns;
    char comm[16];
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} conn_events SEC(".maps");

// 跟踪TCP连接建立
SEC("kprobe/tcp_v4_connect")
int trace_tcp_connect(struct pt_regs *ctx)
{
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);

    u32 pid = bpf_get_current_pid_tgid() >> 32;

    // 读取socket信息
    struct connection_event event = {};
    event.pid = pid;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));

    // 读取源地址和端口
    BPF_CORE_READ_INTO(&event.saddr, sk, __sk_common.skc_rcv_saddr);
    BPF_CORE_READ_INTO(&event.sport, sk, __sk_common.skc_num);

    // 读取目标地址和端口
    BPF_CORE_READ_INTO(&event.daddr, sk, __sk_common.skc_daddr);
    BPF_CORE_READ_INTO(&event.dport, sk, __sk_common.skc_dport);
    event.dport = bpf_ntohs(event.dport);

    // 提交事件
    bpf_ringbuf_output(&conn_events, &event, sizeof(event), 0);

    return 0;
}

// 使用TC进行流量统计
SEC("tc")
int traffic_stats(struct __sk_buff *skb)
{
    void *data_end = (void *)(long)skb->data_end;
    void *data = (void *)(long)skb->data;
    struct ethhdr *eth = data;

    // 验证以太网头
    if ((void *)(eth + 1) > data_end)
        return TC_ACT_OK;

    // 只处理IP包
    if (eth->h_proto != bpf_htons(ETH_P_IP))
        return TC_ACT_OK;

    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return TC_ACT_OK;

    // 更新流量统计
    u32 pkt_len = skb->len;
    u32 saddr = ip->saddr;

    // 这里可以更新per-IP的统计map

    return TC_ACT_OK;
}

char LICENSE[] SEC("license") = "GPL";
```

### 3.3 eBPF与JS生态结合

#### 3.3.1 架构模式

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  eBPF + Node.js Integration Patterns                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Pattern 1: Sidecar Agent                                                    │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      │
│  │  Node.js App    │◄────►│  eBPF Agent     │◄────►│  OTLP Collector │      │
│  │  (OpenTelemetry │ gRPC  │  (Go/C/Rust)    │ OTLP │  / Prometheus   │      │
│  │   SDK)          │      │                 │      │                 │      │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘      │
│                                                                              │
│  Pattern 2: DaemonSet Agent                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         ┌─────────────────┐            │
│  │ Node.js │ │ Node.js │ │ Node.js │────────►│  eBPF DaemonSet │            │
│  │ Pod 1   │ │ Pod 2   │ │ Pod N   │  OTLP   │  (per Node)     │            │
│  └─────────┘ └─────────┘ └─────────┘         └────────┬────────┘            │
│                                                       │                      │
│                                                       ▼                      │
│                                              ┌─────────────────┐            │
│                                              │  Backend        │            │
│                                              │  (Jaeger/       │            │
│                                              │   Prometheus)   │            │
│                                              └─────────────────┘            │
│                                                                              │
│  Pattern 3: Node.js Native Addon                                             │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                    Node.js Process                          │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │            │
│  │  │  JS App     │  │  Native     │  │  eBPF Programs      │ │            │
│  │  │  Code       │──►│  Addon      │──►│  (loaded via      │ │            │
│  │  │             │  │  (N-API)    │  │   libbpf)           │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Node.js与eBPF Agent集成

```typescript
// Node.js应用与eBPF Agent通信示例

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// 配置SDK，将数据发送到eBPF Agent
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nodejs-app',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    // 添加k8s元数据，供eBPF Agent关联
    'k8s.pod.name': process.env.K8S_POD_NAME,
    'k8s.namespace.name': process.env.K8S_NAMESPACE,
    'k8s.node.name': process.env.K8S_NODE_NAME,
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://ebpf-agent:4317',  // eBPF Agent地址
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://ebpf-agent:4317',
    }),
    exportIntervalMillis: 15000,
  }),
});

sdk.start();

// 接收eBPF Agent的系统级指标
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('ebpf-system-metrics');

// 创建Observable Gauges来展示eBPF采集的系统指标
const cpuUsageGauge = meter.createObservableGauge('system.cpu.usage', {
  description: 'CPU usage from eBPF',
  unit: 'percent',
});

const memoryUsageGauge = meter.createObservableGauge('system.memory.usage', {
  description: 'Memory usage from eBPF',
  unit: 'By',
});

// 从eBPF Agent获取系统指标（通过HTTP API或gRPC）
async function fetchEBPFMetrics(): Promise<void> {
  const response = await fetch('http://ebpf-agent:8080/metrics');
  const ebpfMetrics = await response.json();

  cpuUsageGauge.addCallback((observableResult) => {
    observableResult.observe(ebpfMetrics.cpu.usage);
  });

  memoryUsageGauge.addCallback((observableResult) => {
    observableResult.observe(ebpfMetrics.memory.usage);
  });
}

// 定期获取eBPF指标
setInterval(fetchEBPFMetrics, 5000);
```

#### 3.3.3 eBPF Agent配置示例

```yaml
# eBPF Agent配置（以Pixie为例）
apiVersion: v1
kind: ConfigMap
metadata:
  name: ebpf-agent-config
data:
  config.yaml: |
    # 数据收集配置
    data_collector:
      # 系统调用追踪
      syscalls:
        enabled: true
        include:
          - read
          - write
          - open
          - close
          - socket
          - connect
          - accept

      # 网络追踪
      network:
        enabled: true
        protocols:
          - http
          - https
          - mysql
          - redis
        include_inbound: true
        include_outbound: true

      # JVM追踪（针对Java应用）
      jvm:
        enabled: true
        include_gc: true
        include_allocations: true

      # Node.js追踪
      nodejs:
        enabled: true
        uprobes:
          - name: node::Start
            symbol: "_ZN4node5StartEiPPc"
          - name: v8::Function::Call
            symbol: "_ZN2v88Function4Call"

    # 数据处理
    processor:
      # 聚合间隔
      aggregation_interval: 10s

      # 属性丰富
      enrichment:
        k8s_metadata: true
        container_info: true
        service_mesh: true

      # 采样
      sampling:
        rate: 1.0  # 100%采样

    # 数据导出
    exporters:
      otlp:
        endpoint: "otel-collector:4317"
        tls:
          insecure: true

      prometheus:
        endpoint: ":9090"
        namespace: "ebpf"

      jaeger:
        endpoint: "jaeger:14250"
        tls:
          insecure: true
```

---

## 4. Node.js实现集成

### 4.1 OpenTelemetry SDK完整配置

```typescript
// opentelemetry.ts - 完整SDK配置
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { MeterProvider, PeriodicExportingMetricReader, View, Aggregation } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { W3CTraceContextPropagator, CompositePropagator, W3CBaggagePropagator } from '@opentelemetry/core';
import { JaegerPropagator, B3Propagator } from '@opentelemetry/propagator-jaeger';
import { ParentBasedSampler, TraceIdRatioBasedSampler, AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// 配置诊断日志
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 创建Resource
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'nodejs-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: process.env.OTEL_SERVICE_NAMESPACE || 'default',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.HOST_NAME]: require('os').hostname(),
  [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: 'opentelemetry',
  [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: 'nodejs',
  [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: '1.15.0',
  // K8s元数据
  'k8s.pod.name': process.env.K8S_POD_NAME,
  'k8s.namespace.name': process.env.K8S_NAMESPACE,
  'k8s.node.name': process.env.K8S_NODE_NAME,
  'k8s.deployment.name': process.env.K8S_DEPLOYMENT_NAME,
});

// ============ Tracing配置 ============
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4317',
  credentials: require('@grpc/grpc-js').credentials.createInsecure(),
  metadata: new (require('@grpc/grpc-js').Metadata)(),
});

const tracerProvider = new NodeTracerProvider({
  resource,
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(
      parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '1.0')
    ),
  }),
  spanProcessors: [
    new BatchSpanProcessor(traceExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
    }),
  ],
});

tracerProvider.register({
  propagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new JaegerPropagator(),
      new B3Propagator(),
    ],
  }),
});

// ============ Metrics配置 ============
const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4317',
});

const meterProvider = new MeterProvider({
  resource,
  views: [
    // 自定义直方图桶边界
    new View({
      instrumentName: 'http.request.duration',
      aggregation: Aggregation.Histogram({
        bucketBoundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      }),
    }),
    // 丢弃调试指标
    new View({
      instrumentName: 'debug.*',
      aggregation: Aggregation.Drop(),
    }),
  ],
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000,
      exportTimeoutMillis: 30000,
    }),
  ],
});

// ============ Logs配置 ============
const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs',
});

const loggerProvider = new LoggerProvider({
  resource,
});

loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(logExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 1000,
    exportTimeoutMillis: 30000,
  })
);

// ============ 自动Instrumentation ============
const sdk = new NodeSDK({
  autoDetectResources: true,
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP模块配置
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span, request) => {
          span.setAttribute('http.request.body.size',
            request.headers['content-length'] || 0);
        },
        responseHook: (span, response) => {
          span.setAttribute('http.response.body.size',
            response.headers['content-length'] || 0);
        },
        applyCustomAttributesOnSpan: (span, request, response) => {
          // 添加自定义属性
          span.setAttribute('http.custom.attribute', 'value');
        },
        ignoreIncomingPaths: [
          /\/health/,
          /\/metrics/,
          /\/ready/,
        ],
      },
      // Express配置
      '@opentelemetry/instrumentation-express': {
        enabled: true,
        ignoreLayers: ['middleware', 'router'],
        ignoreLayersType: ['request_handler'],
      },
      // gRPC配置
      '@opentelemetry/instrumentation-grpc': {
        enabled: true,
      },
      // GraphQL配置
      '@opentelemetry/instrumentation-graphql': {
        enabled: true,
        mergeItems: true,
        depth: 10,
      },
      // 数据库instrumentation
      '@opentelemetry/instrumentation-mongodb': { enabled: true },
      '@opentelemetry/instrumentation-mysql': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
      '@opentelemetry/instrumentation-ioredis': { enabled: true },
      // 消息队列instrumentation
      '@opentelemetry/instrumentation-amqplib': { enabled: true },
      '@opentelemetry/instrumentation-kafkajs': { enabled: true },
      // AWS SDK
      '@opentelemetry/instrumentation-aws-sdk': { enabled: true },
    }),
  ],
});

// 启动SDK
sdk.start();

// 优雅关闭
process.on('SIGTERM', async () => {
  await sdk.shutdown();
  process.exit(0);
});

export { tracerProvider, meterProvider, loggerProvider };
```

### 4.2 自动Instrumentation详解

```typescript
// 自动Instrumentation配置详解
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';

// 手动注册instrumentations
registerInstrumentations({
  instrumentations: [
    // HTTP Instrumentation
    new HttpInstrumentation({
      // 请求开始时的钩子
      startIncomingSpanHook: (request) => {
        return {
          'http.request.id': request.headers['x-request-id'],
        };
      },

      // 请求完成时的钩子
      responseHook: (span, response) => {
        // 记录响应头
        span.setAttribute('http.response.content_type',
          response.headers['content-type']);
      },

      // 忽略某些路径
      ignoreIncomingPaths: [
        '/health',
        '/ready',
        '/metrics',
      ],

      // 忽略出站请求
      ignoreOutgoingUrls: [
        /localhost:9090/,  // Prometheus
      ],

      // 请求超时
      requestTimeout: 5000,
    }),

    // Express Instrumentation
    new ExpressInstrumentation({
      // 忽略某些层
      ignoreLayers: ['expressInit', 'query', 'jsonParser'],

      // 自定义层名称
      layerTypeAttribute: 'express.layer_type',
    }),

    // GraphQL Instrumentation
    new GraphQLInstrumentation({
      // 合并字段
      mergeItems: true,

      // 最大深度
      depth: 15,

      // 允许改变值
      allowValues: false,  // 生产环境禁用，防止敏感信息泄露
    }),

    // MongoDB Instrumentation
    new MongoDBInstrumentation({
      // 增强数据库操作
      enhancedDatabaseReporting: true,

      // 响应钩子
      responseHook: (span, result) => {
        span.setAttribute('db.response.length',
          Array.isArray(result) ? result.length : 1);
      },
    }),

    // PostgreSQL Instrumentation
    new PgInstrumentation({
      // 增强数据库操作
      enhancedDatabaseReporting: true,

      // 添加查询参数（注意：可能包含敏感信息）
      addSqlCommenterComment: true,
    }),

    // Redis Instrumentation
    new RedisInstrumentation({
      // 配置选项
      dbStatementSerializer: (cmd, args) => {
        // 序列化命令，隐藏敏感参数
        if (cmd === 'AUTH' || cmd === 'SET') {
          return `${cmd} [REDACTED]`;
        }
        return `${cmd} ${args.join(' ')}`;
      },
    }),
  ],
});
```

### 4.3 自定义Span和Metric

```typescript
// custom-telemetry.ts - 自定义追踪和指标
import { trace, metrics, SpanStatusCode, SpanKind, context } from '@opentelemetry/api';

const tracer = trace.getTracer('custom-tracer', '1.0.0');
const meter = metrics.getMeter('custom-meter', '1.0.0');

// ============ 自定义指标 ============

// 业务指标
const ordersProcessed = meter.createCounter('orders.processed', {
  description: 'Total number of orders processed',
  unit: '1',
});

const orderValue = meter.createHistogram('order.value', {
  description: 'Order value distribution',
  unit: 'USD',
});

const activeCheckouts = meter.createUpDownCounter('checkouts.active', {
  description: 'Number of active checkout sessions',
});

const paymentLatency = meter.createHistogram('payment.latency', {
  description: 'Payment processing latency',
  unit: 'ms',
});

// ============ 自定义Span工具 ============

// 装饰器模式
function TraceSpan(name: string, options?: {
  kind?: SpanKind;
  attributes?: Record<string, any>;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return tracer.startActiveSpan(
        name || `${target.constructor.name}.${propertyKey}`,
        {
          kind: options?.kind || SpanKind.INTERNAL,
          attributes: {
            ...options?.attributes,
            'function.name': propertyKey,
            'function.args.count': args.length,
          },
        },
        async (span) => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (error) {
            span.recordException(error as Error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            });
            throw error;
          } finally {
            span.end();
          }
        }
      );
    };

    return descriptor;
  };
}

// 使用装饰器
class PaymentService {
  @TraceSpan('payment.process', {
    kind: SpanKind.INTERNAL,
    attributes: { 'service.type': 'payment' },
  })
  async processPayment(orderId: string, amount: number): Promise<void> {
    // 记录业务指标
    ordersProcessed.add(1, {
      'payment.method': 'credit_card',
      'payment.currency': 'USD',
    });

    orderValue.record(amount, {
      'order.id': orderId,
    });

    // 追踪支付延迟
    const startTime = Date.now();
    await this.charge(orderId, amount);
    paymentLatency.record(Date.now() - startTime, {
      'payment.processor': 'stripe',
    });
  }

  private async charge(orderId: string, amount: number): Promise<void> {
    // 实际支付逻辑
  }
}

// ============ 高级Span模式 ============

// 带重试的Span
async function withRetrySpan<T>(
  name: string,
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelayMs?: number;
    attributes?: Record<string, any>;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelayMs = 1000, attributes = {} } = options;

  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      span.setAttribute('retry.attempt', attempt);

      try {
        const result = await operation();
        span.setAttribute('retry.success', true);
        span.setAttribute('retry.attempts', attempt);
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error) {
        lastError = error as Error;
        span.addEvent('retry.failed', {
          'retry.attempt': attempt,
          'error.message': lastError.message,
        });

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt));
        }
      }
    }

    span.setAttribute('retry.success', false);
    span.setAttribute('retry.attempts', maxRetries);
    span.recordException(lastError!);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `Failed after ${maxRetries} attempts`,
    });
    span.end();

    throw lastError;
  });
}

// 批处理Span
async function batchProcessSpan<T, R>(
  name: string,
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    concurrency?: number;
    attributes?: Record<string, any>;
  } = {}
): Promise<R[]> {
  const { batchSize = 100, concurrency = 5, attributes = {} } = options;

  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    span.setAttribute('batch.total_items', items.length);
    span.setAttribute('batch.batch_size', batchSize);
    span.setAttribute('batch.concurrency', concurrency);

    const results: R[] = [];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // 分批处理
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      await tracer.startActiveSpan(`${name}.batch`, async (batchSpan) => {
        batchSpan.setAttribute('batch.index', i / batchSize);
        batchSpan.setAttribute('batch.size', batch.length);

        // 并发处理
        const batchResults = await Promise.allSettled(
          batch.map(item => processor(item))
        );

        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
            successCount++;
          } else {
            batchSpan.addEvent('batch.item_failed', {
              'batch.item_index': idx,
              'error.message': result.reason?.message,
            });
            errorCount++;
          }
        });

        processedCount += batch.length;
        batchSpan.end();
      });
    }

    span.setAttribute('batch.processed', processedCount);
    span.setAttribute('batch.success', successCount);
    span.setAttribute('batch.errors', errorCount);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return results;
  });
}

export { PaymentService, withRetrySpan, batchProcessSpan };
```

### 4.4 与后端集成

```typescript
// backend-integration.ts - 与各种后端集成

// ============ Jaeger集成 ============
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
  // 或者使用agent
  // host: 'jaeger-agent',
  // port: 6832,
});

// ============ Zipkin集成 ============
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const zipkinExporter = new ZipkinExporter({
  url: 'http://zipkin:9411/api/v2/spans',
  serviceName: 'nodejs-service',
  // 可选: 使用JSON格式
  // headers: { 'Content-Type': 'application/json' },
});

// ============ Prometheus集成 ============
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const prometheusExporter = new PrometheusExporter({
  port: 9090,
  endpoint: '/metrics',
  prefix: 'nodejs_',
  // 自定义标签
  appendTimestamp: true,
}, () => {
  console.log('Prometheus scrape endpoint: http://localhost:9090/metrics');
});

// 将Prometheus添加到MeterProvider
const meterProvider = new MeterProvider({
  resource,
  readers: [prometheusExporter],
});

// ============ OpenTelemetry Collector集成 ============
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';

// 通过Collector路由到多个后端
const collectorTraceExporter = new OTLPTraceExporter({
  url: 'http://otel-collector:4317',
});

const collectorMetricExporter = new OTLPMetricExporter({
  url: 'http://otel-collector:4317',
});

// ============ 多后端导出配置 ============
import { MultiSpanExporter } from '@opentelemetry/sdk-trace-base';

// 同时导出到多个后端
const multiExporter = new MultiSpanExporter([
  jaegerExporter,
  zipkinExporter,
  collectorTraceExporter,
]);

// ============ 自定义导出器（示例：日志文件）============
import { SpanExporter, ReadableSpan, ExportResult, ExportResultCode } from '@opentelemetry/sdk-trace-base';
import { createWriteStream } from 'fs';

class FileSpanExporter implements SpanExporter {
  private stream = createWriteStream('/var/log/spans.jsonl', { flags: 'a' });

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    try {
      for (const span of spans) {
        this.stream.write(JSON.stringify({
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
          parentSpanId: span.parentSpanId,
          name: span.name,
          kind: span.kind,
          startTime: span.startTime,
          endTime: span.endTime,
          status: span.status,
          attributes: span.attributes,
          events: span.events,
          links: span.links,
        }) + '\n');
      }
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      resultCallback({ code: ExportResultCode.FAILED, error: error as Error });
    }
  }

  shutdown(): Promise<void> {
    return new Promise((resolve) => {
      this.stream.end(resolve);
    });
  }
}

// ============ 完整多后端配置 ============
import { NodeSDK } from '@opentelemetry/sdk-node';

const multiBackendSdk = new NodeSDK({
  resource,
  traceExporter: new MultiSpanExporter([
    // 主要后端
    new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
    // 备份后端
    new JaegerExporter({ endpoint: 'http://jaeger:14268/api/traces' }),
    // 本地调试
    new FileSpanExporter(),
  ]),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: 'http://otel-collector:4317' }),
    exportIntervalMillis: 60000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// ============ 环境变量配置 ============
/*
# .env文件示例

# OpenTelemetry通用配置
OTEL_SERVICE_NAME=nodejs-service
OTEL_SERVICE_VERSION=1.0.0
OTEL_SERVICE_NAMESPACE=ecommerce
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,team=platform

# OTLP导出配置
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://otel-collector:4318/v1/logs

# 认证
OTEL_EXPORTER_OTLP_HEADERS=authorization=Bearer token123,x-api-key=secret

# 采样配置
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1

# 批处理配置
OTEL_BSP_SCHEDULE_DELAY=5000
OTEL_BSP_MAX_QUEUE_SIZE=2048
OTEL_BSP_MAX_EXPORT_BATCH_SIZE=512

# 指标配置
OTEL_METRIC_EXPORT_INTERVAL=60000
OTEL_METRIC_EXPORT_TIMEOUT=30000

# 日志级别
OTEL_LOG_LEVEL=info
*/
```

---

## 5. 形式化论证与架构推导

### 5.1 OpenTelemetry形式化模型

#### 5.1.1 追踪系统形式化定义

```
定义 1: 追踪系统 T = (S, R, P, E, C)

其中:
- S: Span集合, S = {s₁, s₂, ..., sₙ}
- R: Resource集合, R = {r₁, r₂, ..., rₘ}
- P: Processor集合, P = {p₁, p₂, ..., pₖ}
- E: Exporter集合, E = {e₁, e₂, ..., eₗ}
- C: Context传播机制

定义 2: Span s = (id, traceId, parentId, name, kind, start, end, attrs, events, links, status)

约束:
1. 唯一性: ∀s₁, s₂ ∈ S: s₁.id ≠ s₂.id
2. 时间顺序: s.start < s.end
3. 父子关系: s.parentId ∈ {t.id | t ∈ S} ∪ {null}
4. 完整性: s.traceId ≠ null ∧ s.id ≠ null

定义 3: 追踪完整性
一个追踪是完整的，当且仅当:
∀s ∈ S: s.parentId = null ∨ ∃p ∈ S: p.id = s.parentId

即: 每个Span要么没有父Span，要么其父Span存在于系统中。
```

#### 5.1.2 采样理论

```
定义 4: 采样函数 sample: S × C → {0, 1}
其中 C 是采样配置

采样类型:
1. 头部采样: sample(s, c) = f(s.traceId, c.ratio)
   决策在Span创建时做出

2. 尾部采样: sample(s, c) = f({s' ∈ S | s'.traceId = s.traceId}, c)
   决策在追踪完成时做出

定义 5: 采样一致性
采样是一致的，当且仅当:
∀s₁, s₂ ∈ S: s₁.traceId = s₂.traceId → sample(s₁, c) = sample(s₂, c)

即: 同一追踪中的所有Span采样决策相同。

定义 6: 采样率误差
设期望采样率为 r，实际采样率为 r' = |S_sampled| / |S|
误差: ε = |r' - r|

对于TraceIdRatioBasedSampler:
当 |S| → ∞ 时, ε → 0 (大数定律)
```

#### 5.1.3 上下文传播形式化

```
定义 7: 上下文 Ctx = (traceCtx, baggage, values)
其中:
- traceCtx = (traceId, spanId, flags) | null
- baggage: Key → Value 的部分函数
- values: 任意键值对

定义 8: 传播器 Propagator = (inject, extract)
- inject: Ctx × Carrier → Carrier'
- extract: Carrier × Ctx → Ctx'

传播器性质:
1. 正确性: extract(inject(ctx, c), ctx₀) = ctx
2. 幂等性: inject(inject(ctx, c), c) = inject(ctx, c)
3. 无干扰: inject(ctx₁, c) = c' ∧ inject(ctx₂, c') = c''
            → extract(c'', ctx₀) = ctx₂

定义 9: W3C Trace Context格式
inject(ctx, carrier) = carrier ∪ {
  'traceparent': `00-${ctx.traceCtx.traceId}-${ctx.traceCtx.spanId}-${flags}`
}
其中 flags = ctx.traceCtx.traceFlags & 0x01
```

### 5.2 eBPF形式化安全模型

```
定义 10: eBPF程序安全属性

设 P 为eBPF程序，V 为验证器，则:
Safe(P) ↔ V(P) = true

安全约束:
1. 终止性: ∀P: Safe(P) → P 必然终止
   证明: 验证器拒绝无界循环

2. 内存安全: ∀P: Safe(P) → P 不会访问无效内存
   证明: 验证器要求所有内存访问前有边界检查

3. 无特权提升: ∀P: Safe(P) → P 不能修改内核关键数据结构
   证明: 验证器限制辅助函数调用和map访问

定义 11: eBPF程序复杂度
C(P) = 指令数 × 循环嵌套深度 × 分支数量

验证器约束: C(P) < C_max (通常100万条指令)

定义 12: eBPF到内核的映射正确性
设 BPF_PROG 为eBPF程序，NATIVE 为编译后的本地代码
∀x: BPF_PROG(x) = NATIVE(x)

即: JIT编译保持语义等价
```

### 5.3 性能模型

```
定义 13: OpenTelemetry开销模型

设应用原始执行时间为 T₀，启用OpenTelemetry后时间为 T₁

开销: Overhead = (T₁ - T₀) / T₀ × 100%

开销来源:
1. Span创建: O(1) 每Span
2. 属性设置: O(n) n=属性数量
3. 事件记录: O(1) 每事件
4. 上下文传播: O(1) 每传播点
5. 导出: O(m) m=批量大小

优化策略:
1. 采样: 减少Span数量
   期望开销: Overhead_sampled = Overhead_full × sampling_rate

2. 批处理: 减少导出调用
   批处理收益: B = export_calls_without_batch / export_calls_with_batch

3. 异步导出: 避免阻塞主线程
   延迟影响: Latency_async ≈ 0 (相对于同步)

定义 14: eBPF开销模型

eBPF程序执行开销:
T_ebpf = T_bpf_call + T_verified_code + T_map_access

与用户空间对比:
T_userspace = T_syscall + T_context_switch + T_copy_data

典型场景下: T_ebpf << T_userspace

原因:
- 无上下文切换
- 无数据拷贝（通过maps共享）
- JIT编译为本地代码
```

### 5.4 架构推导

```
定理 1: 可观测性系统的完备性

给定系统 S，可观测性系统 O 是完备的，当且仅当:
∀故障 f ∈ F: Detectable(f, O) → Diagnosable(f, O)

其中:
- Detectable(f, O): O 能检测到 f 的发生
- Diagnosable(f, O): O 能提供足够信息定位 f 的根因

证明:
1. Metrics 提供系统状态聚合视图 → 检测异常
2. Logs 提供详细事件序列 → 定位问题时间
3. Traces 提供请求路径 → 定位问题服务

因此: Metrics ∧ Logs ∧ Traces → 完备可观测性

定理 2: 采样下的追踪完整性

设采样率为 r，追踪长度为 n
追踪被完整采样的概率: P(complete) = rⁿ

当 r < 1 且 n > 1 时，P(complete) 指数下降

解决方案:
1. ParentBasedSampler: 保持子Span与父Span一致
   P(complete | parent sampled) = 1

2. 尾部采样: 基于结果决策
   P(complete | error) = 1

定理 3: eBPF无侵入监控的正确性

设应用 A，eBPF监控程序 M
A 的正确性: Correct(A) ↔ A 满足其规约
M 的无侵入性: NonIntrusive(M) ↔ Correct(A) = Correct(A || M)

证明:
1. eBPF程序在内核空间运行，不修改应用代码
2. eBPF验证器确保程序安全性和终止性
3. eBPF程序通过事件机制异步获取数据

因此: eBPF监控不改变应用行为 → 无侵入性
```

### 5.5 反例与错误配置

```typescript
// ============ 错误配置示例 ============

// ❌ 错误1: 高基数属性
const badCounter = meter.createCounter('requests');

// 错误：使用高基数属性
badCounter.add(1, {
  'user.id': userId,        // 可能无限增长
  'timestamp': Date.now(),  // 每个请求都不同
});

// 后果: 时间序列爆炸，存储成本激增，查询性能下降
// 解决方案: 使用低基数属性
badCounter.add(1, {
  'http.method': method,      // 有限值
  'http.route': route,        // 有限值
  'http.status_code': status, // 有限值
});

// ❌ 错误2: 未结束的Span
function badSpanExample(): void {
  const span = tracer.startSpan('operation');
  // 忘记调用 span.end()
}

// 后果: Span永远不会被导出，内存泄漏
// 解决方案: 使用 startActiveSpan 或确保 span.end()
function goodSpanExample(): void {
  return tracer.startActiveSpan('operation', (span) => {
    try {
      // 执行操作
    } finally {
      span.end();  // 确保结束
    }
  });
}

// ❌ 错误3: 阻塞导出器
const badExporter = new OTLPTraceExporter({
  url: 'http://slow-backend:4317',
  timeoutMillis: 60000,  // 超时过长
});

// 使用 SimpleSpanProcessor（同步导出）
const badProcessor = new SimpleSpanProcessor(badExporter);

// 后果: 每次Span结束都阻塞，严重影响性能
// 解决方案: 使用 BatchSpanProcessor
const goodProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({ timeoutMillis: 5000 }),
  { scheduledDelayMillis: 5000 }
);

// ❌ 错误4: 忽略错误处理
async function badErrorHandling(): Promise<void> {
  return tracer.startActiveSpan('operation', async (span) => {
    await riskyOperation();  // 可能抛出错误
    span.end();  // 如果出错，这行不会执行
  });
}

// 后果: Span未结束，错误未记录
// 解决方案: 正确处理错误
async function goodErrorHandling(): Promise<void> {
  return tracer.startActiveSpan('operation', async (span) => {
    try {
      await riskyOperation();
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ❌ 错误5: 传播器配置不一致
// 服务A使用 W3C
const propagatorA = new W3CTraceContextPropagator();

// 服务B使用 B3
const propagatorB = new B3Propagator();

// 后果: 追踪链路断裂
// 解决方案: 统一传播器或使用CompositePropagator
const goodPropagator = new CompositePropagator({
  propagators: [
    new W3CTraceContextPropagator(),
    new B3Propagator(),  // 兼容旧系统
  ],
});

// ❌ 错误6: 敏感信息泄露
function badSensitiveData(): void {
  tracer.startActiveSpan('process-payment', (span) => {
    span.setAttribute('credit_card.number', cardNumber);  // ❌ 泄露敏感信息
    span.setAttribute('password', password);               // ❌ 泄露敏感信息
  });
}

// 解决方案: 属性过滤和脱敏
function goodSensitiveData(): void {
  tracer.startActiveSpan('process-payment', (span) => {
    span.setAttribute('credit_card.last4', cardNumber.slice(-4));  // ✅ 只保留后4位
    span.setAttribute('payment.method', 'credit_card');
    // 不记录密码
  });
}

// ❌ 错误7: 资源未正确配置
const badResource = new Resource({
  'service.name': 'service',  // 太通用
  // 缺少其他重要属性
});

// 后果: 无法区分不同服务实例
// 解决方案: 完整的Resource配置
const goodResource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'payment-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.2.3',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'ecommerce',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
  [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
  'k8s.pod.name': process.env.K8S_POD_NAME,
  'k8s.namespace.name': process.env.K8S_NAMESPACE,
});
```

### 5.6 性能优化最佳实践

```typescript
// ============ 性能优化配置 ============

// 1. 采样策略优化
const optimizedSampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),  // 10%采样
  remoteParentSampled: new AlwaysOnSampler(),
  remoteParentNotSampled: new AlwaysOffSampler(),
  localParentSampled: new AlwaysOnSampler(),
  localParentNotSampled: new AlwaysOffSampler(),
});

// 2. 批处理优化
const optimizedBatchProcessor = new BatchSpanProcessor(
  traceExporter,
  {
    maxQueueSize: 4096,        // 增大队列
    maxExportBatchSize: 1024,  // 增大批量
    scheduledDelayMillis: 5000, // 5秒间隔
    exportTimeoutMillis: 30000, // 30秒超时
  }
);

// 3. 指标视图优化（减少基数）
const optimizedViews = [
  // 只保留必要的属性
  new View({
    instrumentName: 'http.request.duration',
    attributeKeys: ['http.method', 'http.route', 'http.status_code'],
  }),
  // 丢弃高基数指标
  new View({
    instrumentName: 'user.*',
    aggregation: Aggregation.Drop(),
  }),
];

// 4. 异步初始化
async function initializeTelemetry(): Promise<void> {
  // 延迟加载instrumentations
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
}

// 5. 内存优化 - 使用对象池
class SpanAttributePool {
  private pool: Map<string, any>[] = [];
  private maxSize = 100;

  acquire(): Map<string, any> {
    return this.pool.pop() || new Map();
  }

  release(attrs: Map<string, any>): void {
    if (this.pool.length < this.maxSize) {
      attrs.clear();
      this.pool.push(attrs);
    }
  }
}

// 6. 延迟导出配置
const lazyExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  // 使用keep-alive连接
  metadata: new Metadata(),
});

// 7. 条件instrumentation
const instrumentations = [];

if (process.env.ENABLE_HTTP_INSTRUMENTATION !== 'false') {
  instrumentations.push(new HttpInstrumentation({
    ignoreIncomingPaths: [
      '/health',
      '/metrics',
      '/ready',
    ],
  }));
}

if (process.env.ENABLE_DB_INSTRUMENTATION === 'true') {
  instrumentations.push(new PgInstrumentation());
}
```

---

## 6. 总结

### 6.1 关键概念速查

| 概念 | 定义 | 用途 |
|------|------|------|
| **Span** | 追踪的基本单元 | 表示一个操作或工作单元 |
| **Trace** | Span的有向无环图 | 表示一个完整的请求链路 |
| **Resource** | 产生数据的实体 | 标识服务、主机等信息 |
| **Context** | 传播的状态 | 在分布式系统中传递追踪信息 |
| **Sampler** | 采样决策器 | 控制数据量和成本 |
| **Processor** | Span处理器 | 批处理、过滤、丰富Span |
| **Exporter** | 数据导出器 | 将数据发送到后端 |
| **eBPF** | 内核虚拟机 | 无侵入监控系统调用和网络 |

### 6.2 决策树

```
选择采样策略:
├── 开发/测试环境 ──► AlwaysOnSampler (100%)
├── 低流量生产环境 ──► ParentBasedSampler + TraceIdRatioBasedSampler (50-100%)
├── 高流量生产环境 ──► ParentBasedSampler + TraceIdRatioBasedSampler (1-10%)
└── 需要错误追踪 ──► Tail Sampling (Collector级别)

选择导出器:
├── 需要多后端支持 ──► OTLP → Collector
├── 只需要追踪 ──► JaegerExporter / ZipkinExporter
├── 只需要指标 ──► PrometheusExporter
└── 需要统一协议 ──► OTLP (推荐)

选择Instrumentation:
├── HTTP服务 ──► HttpInstrumentation + ExpressInstrumentation
├── 数据库访问 ──► 对应DB instrumentation (pg/mongo/redis)
├── 消息队列 ──► Kafka/AMQP instrumentation
└── 全栈监控 ──► getNodeAutoInstrumentations()
```

### 6.3 参考资源

- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otel/)
- [OpenTelemetry Proto](https://github.com/open-telemetry/opentelemetry-proto)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [eBPF Documentation](https://ebpf.io/what-is-ebpf/)
- [OpenTelemetry JS SDK](https://github.com/open-telemetry/opentelemetry-js)

---

*文档版本: 1.0*
*最后更新: 2024*
