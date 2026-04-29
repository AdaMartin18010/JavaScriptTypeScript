# 可观测性实验室 — 架构设计

## 1. 架构概述

本模块实现了生产级可观测性系统的核心组件，包括结构化日志、分布式追踪、指标收集和异常检测。展示从应用到仪表盘的全链路实现。

## 2. 核心组件

### 2.1 日志系统

- **Structured Logger**: JSON 格式日志，统一字段规范
- **Log Pipeline**: 采集、过滤、聚合、存储
- **Alert Engine**: 基于日志模式的实时告警

### 2.2 追踪系统

- **Span Collector**: OpenTelemetry Span 采集和上下文传播
- **Trace Assembler**: 将分散的 Span 组装为完整 Trace
- **Latency Analyzer**: 瓶颈识别和慢路径分析

### 2.3 指标系统

- **Metric Registry**: Counter、Gauge、Histogram 注册管理
- **Aggregation Engine**: 实时聚合和降采样
- **Dashboard Generator**: 自动仪表盘配置

### 2.4 异常检测

- **Baseline Learner**: 历史基线学习和偏差检测
- **Anomaly Classifier**: 异常类型分类（突发/渐变/周期）
- **Alert Correlator**: 告警关联和根因分析

## 3. 实验室工具栈

| 层级 | 组件 | 选型 | 版本 | 用途 |
|------|------|------|------|------|
| **采集层** | Metrics Collector | Prometheus | v2.55+ | 时序指标抓取与存储 |
| | Log Shipper | Promtail / Fluent Bit | v3.0+ | 日志采集与标签附加 |
| | Trace Agent | OpenTelemetry Collector | v0.115+ | OTLP 接收与转发 |
| **存储层** | Metrics TSDB | Prometheus TSDB / Mimir | — | 高性能时序存储 |
| | Log Store | Loki / Grafana Alloy | v3.2+ | 水平可扩展日志聚合 |
| | Trace Store | Tempo / Jaeger | v2.7+ | 分布式追踪后端 |
| **展示层** | Visualization | Grafana | v11.2+ | 统一仪表盘与告警 |
| | Alerting | Grafana Alerting / Alertmanager | — | 多渠道告警路由 |
| **应用层** | Demo App | Node.js + Express + OTel SDK | 20 LTS | 被观测目标应用 |
| | Load Generator | k6 / Artillery | — | 压力测试与流量模拟 |

> **部署拓扑**：本实验室采用 **Docker Compose** 单机部署，模拟生产环境中的多节点协作关系。生产环境建议迁移至 K8s + Helm Chart。

## 4. 数据流

```
Application → Telemetry SDK → Collector → Storage → Analysis Engine → Dashboard/Alert
```

## 5. 代码示例：完整 Docker Compose 实验室环境

```yaml
# docker-compose.observability-lab.yml
# 启动命令：docker compose -f docker-compose.observability-lab.yml up -d
version: "3.8"

services:
  # ==================== 应用层 ====================
  demo-app:
    build: ./demo-app
    container_name: demo-app
    ports:
      - "3000:3000"
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - OTEL_SERVICE_NAME=demo-payment-service
      - OTEL_RESOURCE_ATTRIBUTES=deployment.environment=lab,service.version=1.0.0
      - LOG_LEVEL=info
      - REDIS_URL=redis://redis:6379
      - DB_URL=postgresql://postgres:postgres@postgres:5432/demo
    depends_on:
      - otel-collector
      - redis
      - postgres
    labels:
      # Prometheus 自动发现标签
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=3000"
      - "prometheus.io/path=/metrics"

  # ==================== 基础设施 ====================
  redis:
    image: redis:7-alpine
    container_name: lab-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  postgres:
    image: postgres:16-alpine
    container_name: lab-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: demo
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # ==================== 可观测性：采集层 ====================
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.115.0
    container_name: lab-otel-collector
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml:ro
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8888:8888"   # Prometheus 自身指标
      - "8889:8889"   # Prometheus 导出端口
      - "13133:13133" # 健康检查
    depends_on:
      - jaeger
      - loki

  promtail:
    image: grafana/promtail:3.2.0
    container_name: lab-promtail
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yaml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki

  # ==================== 可观测性：存储层 ====================
  prometheus:
    image: prom/prometheus:v2.55.0
    container_name: lab-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'
      - '--web.enable-remote-write-receiver'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  loki:
    image: grafana/loki:3.2.0
    container_name: lab-loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml:ro
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  jaeger:
    image: jaegertracing/all-in-one:1.62.0
    container_name: lab-jaeger
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    ports:
      - "16686:16686" # Jaeger UI
      - "4317"        # OTLP gRPC (内部)
      - "4318"        # OTLP HTTP (内部)
    volumes:
      - jaeger-data:/badger

  # ==================== 可观测性：展示层 ====================
  grafana:
    image: grafana/grafana:11.2.0
    container_name: lab-grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    ports:
      - "3001:3000"   # 3000 被 demo-app 占用，映射到 3001
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
      - loki
      - jaeger

  # ==================== 压力测试 ====================
  k6:
    image: grafana/k6:0.54.0
    container_name: lab-k6
    volumes:
      - ./k6-scripts:/scripts:ro
    command: run /scripts/load-test.js
    environment:
      - API_BASE_URL=http://demo-app:3000
    depends_on:
      - demo-app
    profiles: ["load-test"]  # 按需启动: docker compose --profile load-test up k6

volumes:
  prometheus-data:
  loki-data:
  jaeger-data:
  grafana-data:
  redis-data:
  postgres-data:
```

### 配套 Prometheus 配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8888', 'otel-collector:8889']

  - job_name: 'demo-app'
    static_configs:
      - targets: ['demo-app:3000']
    metrics_path: '/metrics'
```

### 配套 k6 负载测试脚本

```javascript
// k6-scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // 渐进加压
    { duration: '3m', target: 50 },   // 稳定负载
    { duration: '1m', target: 100 },  // 峰值测试
    { duration: '1m', target: 0 },    // 优雅降级
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 请求 < 500ms
    http_req_failed: ['rate<0.01'],   // 错误率 < 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

## 6. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据格式 | OpenTelemetry | 标准化 |
| 存储引擎 | 时序数据库 + 列存储 | 高效查询 |
| 采样策略 | 头部一致性 + 异常保留 | 完整性和成本平衡 |

## 7. 质量属性

- **实时性**: 秒级延迟的指标和告警
- **准确性**: 减少误报和漏报
- **可扩展性**: 水平扩展处理海量遥测数据

## 8. 权威参考链接

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/) — Prometheus 官方文档
- [Grafana Documentation](https://grafana.com/docs/) — Grafana 全栈文档
- [Grafana LGTM Stack](https://grafana.com/go/stack/lgtm/) — Loki + Grafana + Tempo + Mimir 统一方案
- [Jaeger Documentation](https://www.jaegertracing.io/docs/1.62/) — 分布式追踪后端指南
- [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) — 社区版 Collector 组件
- [k6 Documentation](https://grafana.com/docs/k6/latest/) — 现代负载测试工具文档
- [Awesome Prometheus](https://github.com/roaldnefs/awesome-prometheus) — Prometheus 生态精选资源
