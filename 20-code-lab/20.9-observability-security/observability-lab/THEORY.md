# 可观测性实验室 — 理论基础

## 1. 可观测性三大支柱

### 1.1 Metrics（指标）

聚合的数值数据，用于趋势分析和告警：

- **系统指标**: CPU、内存、网络、磁盘
- **应用指标**: 请求数、错误率、延迟（P50/P95/P99）
- **业务指标**: 转化率、活跃用户、收入

### 1.2 Logs（日志）

离散的事件记录，用于故障排查：

- **结构化日志**: JSON 格式，便于机器解析和聚合
- **日志级别**: DEBUG → INFO → WARN → ERROR → FATAL
- **上下文传播**: 每个日志携带 trace_id、span_id、用户ID

### 1.3 Traces（追踪）

分布式请求链路，用于定位性能瓶颈：

- **Span**: 单个操作单元（如一次数据库查询）
- **Trace**: 一次完整请求的所有 Span 集合
- **OpenTelemetry**: 行业标准，统一数据格式和采集协议

## 2. OpenTelemetry 架构

```
应用代码 → Instrumentation Library → OTLP → Collector → Backend (Prometheus/Jaeger/Grafana)
```

- **Instrumentation**: 自动或手动埋点，生成 Metrics/Logs/Traces
- **OTLP**: OpenTelemetry Protocol，基于 gRPC/HTTP 的数据传输
- **Collector**: 接收、处理、导出遥测数据的代理

## 3. SRE 黄金指标

| 指标 | 定义 | 告警阈值示例 |
|------|------|-------------|
| **Latency** | 请求处理时间 | P95 > 200ms |
| **Traffic** | 请求量 | 同比变化 > 50% |
| **Errors** | 错误率 | 比例 > 0.1% |
| **Saturation** | 资源利用率 | CPU > 80% |

## 4. AI 可观测性

AI 系统特有的观测需求：

- **Token 成本追踪**: 每次 LLM 调用的输入/输出 Token 数与费用
- **Prompt 版本管理**: 追踪不同 Prompt 版本的性能差异
- **模型性能漂移**: 监控模型输出质量随时间的变化
- **幻觉检测**: 通过 RAG 检索命中率评估回答可信度

## 5. 与相邻模块的关系

- **74-observability**: 可观测性的基础概念与工具
- **94-ai-agent-lab**: Agent 执行过程的追踪与调试
- **17-debugging-monitoring**: 调试技术与监控策略
