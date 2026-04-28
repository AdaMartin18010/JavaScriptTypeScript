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

## 4. 与相邻模块的关系

- **92-observability-lab**: 可观测性的代码实现与工具链
- **17-debugging-monitoring**: 调试与监控基础
- **22-deployment-devops**: DevOps 中的监控集成
