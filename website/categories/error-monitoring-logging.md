---
title: 可观测性 — 错误监控、日志与分布式追踪
description: JavaScript/TypeScript 全栈可观测性完整指南，覆盖 OpenTelemetry、Sentry、APM、结构化日志、Web Vitals 与分布式追踪
---

# 可观测性：错误监控、日志与分布式追踪

> 本文档系统梳理 2025-2026 年 JavaScript/TypeScript 生态中可观测性（Observability）领域的核心工具与最佳实践。覆盖前端错误监控、后端结构化日志、APM、分布式追踪及前端性能监控（Web Vitals）。数据截至 2026 年 4 月，参考 npm 下载趋势、GitHub Stars 及官方发布记录。

---

## 🧪 关联代码实验室

> **2** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [17-debugging-monitoring](../../20-code-lab/20.9-observability-security/) | 🌿 | 1 | 1 |
| [92-observability-lab](../../20-code-lab/20.9-observability-security/) | 🌳 | 5 | 1 |

---

## 📊 整体概览

| 类别 | 代表工具 | 定位 | Stars / 下载量 |
|------|----------|------|----------------|
| 全栈错误监控 | Sentry v9 | 错误追踪 + Session Replay + 性能监控 | 41k+ Stars / 600万+ 周下载 |
| 分布式追踪标准 | OpenTelemetry JS | CNCF 可观测性标准，自动插桩 | 3.8k+ Stars / 1200万+ 周下载 |
| APM 平台 | Datadog RUM / New Relic | 企业级应用性能监控 | 商业服务 |
| 后端日志 | Pino | 极速结构化 JSON 日志 | 15.5k+ Stars / 500万+ 周下载 |
| 后端日志 | Winston | Node.js 日志标准 | 23.5k+ Stars / 800万+ 周下载 |
| 前端性能 | Web Vitals / CWV 2025 | Google Core Web Vitals 2025 标准 | 浏览器原生 |
| 分布式追踪 | Jaeger / Zipkin | 开源追踪系统可视化 | 20k+ / 16k+ Stars |

---

## 1. OpenTelemetry：JS/TS 生态的可观测性标准

### 1.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | OpenTelemetry JavaScript |
| **Stars** | ⭐ 3,800+ (open-telemetry/opentelemetry-js) |
| **TS 支持** | ✅ 原生 TypeScript |
| **GitHub** | [open-telemetry/opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) |
| **官网** | [opentelemetry.io](https://opentelemetry.io) |

**一句话描述**：CNCF 毕业项目，为 JS/TS 提供统一的 Metrics、Logs、Traces 采集标准，已成为云原生可观测性的事实标准。

**2025-2026 关键进展**：

- **自动插桩（Auto-Instrumentation）** 覆盖 Express、Fastify、Koa、Hapi、NestJS、Pg、MySQL、Redis、ioredis、MongoDB 等 30+ 库
- **Node.js 性能钩子集成**：通过 `@opentelemetry/sdk-node` 实现零代码侵入的启动时自动加载
- **浏览器端支持**：`@opentelemetry/web` 和 `@opentelemetry/instrumentation-fetch`/`xml-http-request` 支持前端链路追踪
- **ESM 支持完善**：2025 年彻底解决了 ESM/CJS 双模式下的加载器兼容问题

```typescript
// Node.js 零侵入启动（via --require 或 --import）
// NODE_OPTIONS='--require @opentelemetry/auto-instrumentations-node/register'

// 编程式接入
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-gateway',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// 手动创建 Span
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('payment-service');

await tracer.startActiveSpan('process-payment', async (span) => {
  span.setAttribute('payment.amount', 199.99);
  span.setAttribute('payment.currency', 'CNY');
  
  try {
    await chargeCustomer();
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    throw err;
  } finally {
    span.end();
  }
});
```

**关键数据（2026-04）**：

| 包名 | 周下载量 | 说明 |
|------|----------|------|
| `@opentelemetry/api` | 1,200万+ | 核心 API，几乎所有现代监控库间接依赖 |
| `@opentelemetry/sdk-node` | 180万+ | Node.js SDK |
| `@opentelemetry/auto-instrumentations-node` | 120万+ | 自动插桩合集 |
| `@opentelemetry/exporter-trace-otlp-http` | 220万+ | OTLP HTTP 导出器 |

---

## 2. Sentry：v9 时代的全栈可观测性

### 2.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | Sentry JavaScript SDK |
| **版本** | v9.x（2025 年 2 月发布 v9.0.0） |
| **Stars** | ⭐ 41,000+ (getsentry/sentry-javascript) |
| **TS 支持** | ✅ 原生 TypeScript |
| **GitHub** | [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript) |
| **官网** | [sentry.io](https://sentry.io) |

**一句话描述**：Sentry v9 在错误监控基础上全面整合性能监控（Performance）、Session Replay 与分布式追踪，成为 JS/TS 全栈可观测性的首选平台。

**v9 核心升级**：

- **OpenTelemetry 原生集成**：SDK 内部基于 OTel 构建，Trace 数据可直接导出到任意 OTel Collector
- **Session Replay 性能提升 40%**：录制包体积降低，移动端帧率显著改善
- **AI 错误归因**：实验性功能，自动分析错误堆栈并推荐修复方案
- **Next.js App Router 深度适配**：自动捕获 Server Component 错误、Streaming 异常

```typescript
// Next.js 15 + Sentry v9 配置（instrumentation.ts）
import * as Sentry from '@sentry/nextjs';

export function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // v9 新增：OTel 兼容模式
    openTelemetryInstrumentations: [
      new PrismaInstrumentation(),
    ],
  });
}

// 手动上报带上下文的错误
Sentry.withScope((scope) => {
  scope.setTag('checkout_step', 'payment');
  scope.setContext('cart', { items: 3, total: 299.5 });
  Sentry.captureException(new Error('Payment gateway timeout'));
});
```

**关键数据（2026-04）**：

| 指标 | 数值 |
|------|------|
| sentry-javascript Stars | 41,000+ |
| @sentry/browser 周下载 | 620万+ |
| @sentry/nextjs 周下载 | 85万+ |
| @sentry/node 周下载 | 180万+ |

---

## 3. APM 平台：Datadog 与 New Relic

### 3.1 Datadog RUM & APM

| 属性 | 详情 |
|------|------|
| **名称** | Datadog Real User Monitoring (RUM) |
| **TS 支持** | ✅ 官方类型定义 |
| **官网** | [datadoghq.com](https://www.datadoghq.com) |

**一句话描述**：企业级可观测性平台，RUM（真实用户监控）与 APM 深度整合，支持从浏览器点击到数据库查询的全链路追踪。

**2025-2026 亮点**：

- **Datadog LLM Observability**：追踪 AI 应用中的 Token 消耗、Prompt 延迟与模型错误率
- **Session Replay 全面上线**：与 RUM 数据自动关联，无需额外 SDK
- **Error Tracking 增强**：自动聚合相似错误，结合 Git blame 定位责任人

```typescript
// Datadog RUM Browser SDK
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'xxx',
  clientToken: 'yyy',
  site: 'datadoghq.com',
  service: 'web-app',
  env: 'production',
  version: '1.2.3',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});
```

### 3.2 New Relic Browser & Node.js APM

| 属性 | 详情 |
|------|------|
| **名称** | New Relic Node.js Agent |
| **Stars** | ⭐ 1,300+ (newrelic/node-newrelic) |
| **官网** | [newrelic.com](https://newrelic.com) |

**2025-2026 亮点**：

- **OpenTelemetry 桥接**：New Relic 原生支持 OTLP 接收，无需专有 Agent 即可上报
- **AI Monitoring**：自动检测 OpenAI、AWS Bedrock、Azure OpenAI 调用并生成专门 Dashboard
- **CodeStream 集成**：IDE 内直接查看生产错误，缩短 MTTR

---

## 4. 结构化日志：Pino vs Winston

### 4.1 Pino：高性能结构化日志首选

| 属性 | 详情 |
|------|------|
| **名称** | pino |
| **Stars** | ⭐ 15,500+ |
| **周下载** | 500万+ |
| **TS 支持** | ✅ 原生类型 |
| **GitHub** | [pinojs/pino](https://github.com/pinojs/pino) |

**2025-2026 关键更新**：

- **pino v9**（2024 年底发布）：默认启用 `thread-stream` Worker 写入，主线程阻塞降低 90%
- **OpenTelemetry Logs 桥接**：`pino-opentelemetry-transport` 实验包支持直接导出到 OTel Collector
- **浏览器端支持**：`pino` 通过 `pino/browser` 提供同构日志能力

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // 2025 推荐：内置 OTel  trace 关联
  mixin() {
    const span = trace.getActiveSpan();
    return span ? { trace_id: span.spanContext().traceId, span_id: span.spanContext().spanId } : {};
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});

// 结构化日志 + 错误对象自动序列化
logger.info({ userId: 'u-123', action: 'checkout' }, 'Order initiated');
logger.error({ err: new Error('DB timeout'), query: 'SELECT...' }, 'Database query failed');

// 子 logger 自动继承 trace 上下文
const reqLogger = logger.child({ requestId: 'req-abc-789', path: '/api/orders' });
reqLogger.warn({ latencyMs: 2500 }, 'Slow query detected');
```

### 4.2 Winston：灵活多 Transport 日志框架

| 属性 | 详情 |
|------|------|
| **名称** | winston |
| **Stars** | ⭐ 23,500+ |
| **周下载** | 800万+ |
| **GitHub** | [winstonjs/winston](https://github.com/winstonjs/winston) |

**2025-2026 状态**：winston 仍保持极高下载量，但新增项目更倾向 Pino。winston 3.17+ 修复了内存泄漏问题，并增加了对 `Symbol.for('nodejs.stream.writable')` 的兼容。

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'order-service', version: '2.1.0' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app-error.log', level: 'error' }),
  ],
});
```

**日志库对比（2026-04）**：

| 维度 | Pino | Winston | Bunyan | consola |
|------|------|---------|--------|---------|
| **Stars** | 15.5k+ | 23.5k+ | 7k+ | 5.5k+ |
| **周下载** | 500万+ | 800万+ | 30万+ | 300万+ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **结构化输出** | 原生 JSON | 需配置 | 原生 JSON | 可选 |
| **OTel 集成** | 社区 transport | 需自定义 | 无 | 无 |
| **适用场景** | 高并发服务 | 灵活路由 | 存量系统 | CLI / Nuxt |

---

## 5. 前端监控：Web Vitals & Core Web Vitals 2025

### 5.1 Core Web Vitals 2025 更新

Google 于 2025 年对 Core Web Vitals（CWV）进行了重要调整，**INP（Interaction to Next Paint）正式取代 FID（First Input Delay）** 成为三大核心指标之一：

| 指标 | 名称 | 2025 标准 | 测量目标 |
|------|------|-----------|----------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 最大内容渲染速度 |
| **INP** | Interaction to Next Paint | ≤ 200ms | 交互响应延迟 |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 视觉布局稳定性 |
| **TTFB** | Time to First Byte | ≤ 0.8s | 服务器响应速度（辅助指标） |

> 📌 **INP 详解**：INP 测量用户交互（点击、按键、触摸）到下一帧绘制完成的完整时间，比 FID 更能反映真实交互体验。React 18+ 的 Concurrent Features 和 `startTransition` 是优化 INP 的关键手段。

```typescript
// web-vitals 库测量并上报
import { onLCP, onINP, onCLS, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    navigationType: metric.navigationType,
  });

  // 使用 Beacon API 可靠上报
  navigator.sendBeacon('/analytics/vitals', body);
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics); // 2025 核心指标
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**web-vitals 库数据**：

| 属性 | 详情 |
|------|------|
| **Stars** | ⭐ 5,000+ (GoogleChrome/web-vitals) |
| **周下载** | 150万+ |
| **维护方** | Google Chrome 团队 |

---

## 6. 分布式追踪：Jaeger 与 Zipkin

### 6.1 Jaeger

| 属性 | 详情 |
|------|------|
| **名称** | Jaeger |
| **Stars** | ⭐ 20,000+ (jaegertracing/jaeger) |
| **CNCF 状态** | 毕业项目（Graduated） |
| **官网** | [jaegertracing.io](https://www.jaegertracing.io) |

**2025-2026 状态**：Jaeger v2 基于 OpenTelemetry Collector 构建，原生支持 OTLP 接收，成为 OTel 生态的标准可视化后端。JS/TS 应用只需将 Trace 导出到 Jaeger Collector（`4317`/`4318` 端口），即可获得完整的链路分析 UI。

```typescript
// 导出 Trace 到 Jaeger（通过 OTLP）
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const exporter = new OTLPTraceExporter({
  url: 'http://jaeger-collector:4318/v1/traces',
});
```

### 6.2 Zipkin

| 属性 | 详情 |
|------|------|
| **名称** | Zipkin |
| **Stars** | ⭐ 16,000+ (openzipkin/zipkin) |
| **官网** | [zipkin.io](https://zipkin.io) |

**2025-2026 状态**：Zipkin 保持稳定维护，但新增功能较少。社区趋势明显向 Jaeger + Grafana Tempo 迁移。对于已有 Zipkin 基础设施的团队，可通过 `opentelemetry-collector` 的 Zipkin receiver 无缝兼容旧有 SDK。

---

## 7. 选型决策矩阵

### 7.1 全栈可观测性方案组合

| 场景 | 推荐组合 | 说明 |
|------|----------|------|
| **创业公司 / 中小团队** | Sentry v9 + Pino | Sentry 免费额度覆盖错误+性能+Replay，Pino 高性能日志 |
| **已有云原生基础设施** | OpenTelemetry + Jaeger + Grafana |  Vendor-neutral，避免锁定 |
| **企业级统一监控** | Datadog / New Relic | 一站式 RUM + APM + 日志 + 安全 |
| **高并发 API 服务** | OTel + Pino + Prometheus | 低开销采集，Metrics 进 Prometheus |
| **Next.js 全栈项目** | Sentry v9 + web-vitals | 最佳框架集成体验 |

### 7.2 关键指标速查

| 工具 | Stars | 周下载量 | TS 支持 | 边缘支持 | 自托管 |
|------|-------|----------|:-------:|:--------:|:------:|
| **Sentry JS** | 41k+ | 620万+ | ✅ | ✅ | ✅ |
| **OpenTelemetry JS** | 3.8k+ | 1200万+ | ✅ | ✅ | ✅ |
| **Pino** | 15.5k+ | 500万+ | ✅ | ✅ | N/A |
| **Winston** | 23.5k+ | 800万+ | ✅ | ✅ | N/A |
| **web-vitals** | 5k+ | 150万+ | ✅ | N/A | N/A |
| **Jaeger** | 20k+ | — | N/A | N/A | ✅ |

---

## 8. 最佳实践

1. **统一 Trace ID**：前端 `web-vitals`、后端 Pino 日志、Sentry Error 均携带相同 `trace_id`，实现一键关联
2. **采样策略**：开发环境 100% 采样，生产环境对 Traces 按 1%-10% 采样，Errors 始终 100%
3. **敏感数据脱敏**：日志和 Replay 中自动过滤 `password`、`token`、`creditCard` 等字段
4. **结构化日志优先**：拒绝纯文本日志，所有日志以 JSON 输出，便于 ELK/Loki/Grafana 聚合
5. **INP 优化**：React 应用中使用 `startTransition` 和 `useDeferredValue` 降低主线程阻塞

---

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 **提示**：OpenTelemetry 已成为 JS/TS 可观测性的统一标准，Sentry v9 凭借 OTel 原生集成进一步巩固了全栈监控的领先地位。新项目建议优先采用 OTel + Pino + Jaeger 的云原生组合，Next.js 项目可直接使用 Sentry 获得最佳体验。
