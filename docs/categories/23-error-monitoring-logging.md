# 错误监控与日志工具

> 本文档盘点 JavaScript/TypeScript 生态中用于前端错误监控、后端日志记录、全链路可观测性及 AI 应用可观测性的主流工具与库。数据基于 2026 年 4 月 GitHub Stars 与社区活跃度。

---

## 📊 整体概览

| 类别 | 代表工具 | 定位 | Stars |
|------|----------|------|-------|
| 前端错误监控 | Sentry v8+ | 全栈可观测性平台（原生 OpenTelemetry） | 40k+ |
| 前端错误监控 | LogRocket | 会话回放 + 性能监控 | — |
| 后端日志 | winston | Node.js 日志标准 | 23k+ |
| 后端日志 | pino | 极速结构化日志 | 15k+ |
| 可观测性标准 | OpenTelemetry | CNCF 毕业项目，统一 Traces/Metrics/Logs | — |
| AI 可观测性 | Langfuse | 开源 LLM tracing + prompt 管理 | 5k+ |
| AI 可观测性 | Helicone | AI Gateway + 成本管控 | — |
| AI 可观测性 | Traceloop | OpenTelemetry-native AI 追踪 | — |

---

## 1. 前端错误监控

### 1.1 Sentry v8+

| 属性 | 详情 |
|------|------|
| **名称** | Sentry |
| **Stars** | ⭐ 40,000+ (getsentry/sentry-javascript) |
| **TS支持** | ✅ 官方类型定义完善 |
| **GitHub** | [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript) |
| **官网** | [sentry.io](https://sentry.io) |

**一句话描述**：业界最广泛使用的全栈错误监控与性能追踪平台，v8 版本原生集成 OpenTelemetry，实现与标准可观测性生态的完全互通。

**核心特点**：
- 自动捕获未处理异常、Promise rejections、资源加载失败
- Source Map 自动还原压缩代码堆栈
- Breadcrumbs（面包屑）记录用户操作路径
- 性能监控（Web Vitals、API 延迟、数据库查询）
- Session Replay（会话回放）重现用户操作
- **v8 升级**：原生 OpenTelemetry 集成（`@sentry/opentelemetry`），分布式追踪与 OTel 生态互通
- Profiling（CPU 性能剖析）支持 Node.js 与 Browser
- 支持自托管（Sentry On-Premise）

**适用场景**：
- 中大型 Web 应用生产环境监控
- 需要前后端错误关联的全栈项目
- 对 Source Map 和堆栈还原有高要求的团队
- 已采用 OpenTelemetry 作为统一标准的团队（v8+ 无缝融合）

```typescript
// @sentry/browser 或 @sentry/react / @sentry/nextjs
import * as Sentry from '@sentry/browser'
import { openTelemetryIntegration } from '@sentry/opentelemetry'

Sentry.init({
  dsn: 'https://xxx@yyy.ingest.sentry.io/zzz',
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  integrations: [
    Sentry.browserTracingIntegration(),
    openTelemetryIntegration(),          // v8+：启用原生 OTel 集成
    Sentry.replayIntegration({ maskAllText: false }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// 手动上报
Sentry.captureException(new Error('Something went wrong'))
Sentry.captureMessage('User reached unexpected state', 'warning')

// 设置上下文
Sentry.setUser({ id: '123', email: 'user@example.com' })
Sentry.setTag('page', 'checkout')
```

---

### 1.2 LogRocket

| 属性 | 详情 |
|------|------|
| **名称** | LogRocket |
| **TS支持** | ✅ 官方 SDK 支持 |
| **官网** | [logrocket.com](https://logrocket.com) |

**一句话描述**：以会话回放（Session Replay）为核心竞争力的前端监控平台，可像看视频一样回放用户遇到问题时的完整操作。

**核心特点**：
- 像素级 DOM 录制与回放
- 网络请求、Redux/Vuex/Pinia 状态变化同步记录
- 性能指标与错误堆栈集成
- 无需手动埋点，自动采集用户行为
- 隐私控制：自动屏蔽密码输入框

**适用场景**：
- 需要精确定位用户操作路径的客服/调试场景
- 复杂表单或交互流程的问题排查
- 与 Sentry 互补使用（Sentry 捕获错误，LogRocket 回放现场）

```typescript
import LogRocket from 'logrocket'

LogRocket.init('app/id')

// 与 Redux 集成
const store = createStore(
  reducer,
  applyMiddleware(LogRocket.reduxMiddleware())
)
```

---

### 1.3 Bugsnag

| 属性 | 详情 |
|------|------|
| **名称** | Bugsnag |
| **Stars** | ⭐ 2,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [bugsnag/bugsnag-js](https://github.com/bugsnag/bugsnag-js) |
| **官网** | [bugsnag.com](https://bugsnag.com) |

**一句话描述**：专注于稳定性管理的错误监控平台，以强大的错误分组和趋势分析见长。

**核心特点**：
- 智能错误分组（同一根因归为一组）
- 稳定性评分（Stability Score）量化应用健康度
- 发布 dashboard 对比不同版本的错误率
- Breadcrumbs 自动集成 Redux、Vue Router 等
- 支持 React Native、Electron

**适用场景**：
- 关注版本间稳定性对比的团队
- 移动应用（React Native）错误监控
- 需要稳定性 KPI 度量的企业

---

### 1.4 Rollbar

| 属性 | 详情 |
|------|------|
| **名称** | Rollbar |
| **Stars** | ⭐ 1,500+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [rollbar/rollbar.js](https://github.com/rollbar/rollbar.js) |
| **官网** | [rollbar.com](https://rollbar.com) |

**一句话描述**：实时错误追踪服务，以快速部署和低配置门槛著称。

**核心特点**：
- 实时错误告警（支持 PagerDuty、Slack 集成）
- 自动 people tracking（关联受影响用户）
- 自定义指纹规则控制错误分组
- 支持 APM（应用性能监控）

**适用场景**：
- 需要即时告警的小到中型团队
- 快速接入、配置简单的场景

---

### 1.5 Raygun

| 属性 | 详情 |
|------|------|
| **名称** | Raygun |
| **TS支持** | ✅ 官方支持 |
| **官网** | [raygun.com](https://raygun.com) |

**一句话描述**：新西兰出品的应用性能监控（APM）与错误追踪一体化平台，Real User Monitoring（RUM）能力突出。

**核心特点**：
- Real User Monitoring 真实用户性能监控
- 崩溃报告（Crash Reporting）与 APM 一体化
- 用户影响度分析（Impact Analysis）
- 部署追踪（Deployment Tracking）

---

## 2. 后端日志库

### 2.1 winston

| 属性 | 详情 |
|------|------|
| **名称** | winston |
| **Stars** | ⭐ 23,000+ |
| **TS支持** | ✅ 社区类型 @types/winston |
| **GitHub** | [winstonjs/winston](https://github.com/winstonjs/winston) |

**一句话描述**：Node.js 生态最广泛使用的日志库，灵活的 Transport 系统支持多目标输出。

**核心特点**：
- 多 Transport 输出（Console、File、HTTP、Stream）
- 自定义日志级别和颜色
- 格式化管道（Format combines）
- 日志切割（配合 winston-daily-rotate-file）
- 与 Express / Fastify 中间件生态深度集成

**适用场景**：
- 需要灵活配置日志路由的企业级 Node.js 应用
- 多环境（dev/staging/prod）差异化日志策略

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

logger.info('User logged in', { userId: '123' })
logger.error('Database connection failed', { error: new Error('ECONNREFUSED') })
```

---

### 2.2 pino

| 属性 | 详情 |
|------|------|
| **名称** | pino |
| **Stars** | ⭐ 15,000+ |
| **TS支持** | ✅ 官方类型 |
| **GitHub** | [pinojs/pino](https://github.com/pinojs/pino) |

**一句话描述**：以性能为核心设计的结构化日志库，被誉为 Node.js 中最快的日志记录器。

**核心特点**：
- 极致性能（比 winston/bunyan 快 5-10 倍）
- 内置结构化 JSON 输出
- 日志级别动态调整（无需重启）
- 丰富的生态：`pino-pretty`（终端美化）、`pino-http`、@elastic/ecs-pino-format
- 支持 Worker Thread 异步写入减少主线程阻塞

**适用场景**：
- 高并发、低延迟的 API 服务
- 需要 JSON 结构化日志直接对接 ELK/Loki 的场景
- 性能敏感型应用

```typescript
import pino from 'pino'

const logger = pino({
  level: 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})

// 结构化日志（自动序列化）
logger.info({ userId: '123', action: 'purchase' }, 'Order placed')
logger.error({ err: new Error('Payment failed') }, 'Payment error')

// 子 logger 继承上下文
const child = logger.child({ requestId: 'abc-123' })
child.info('Processing request') // 自动包含 requestId
```

---

### 2.3 bunyan

| 属性 | 详情 |
|------|------|
| **名称** | bunyan |
| **Stars** | ⭐ 7,000+ |
| **TS支持** | ✅ 社区类型 @types/bunyan |
| **GitHub** | [trentm/node-bunyan](https://github.com/trentm/node-bunyan) |

**一句话描述**：Node.js 结构化日志的先驱库，以严格的 JSON 输出和子 logger 概念影响了一代日志库设计。

**核心特点**：
- 严格的 JSON 每行一条日志（NDJSON）
- 子 logger 自动继承父级字段
- 内置 DTrace 探针支持
- 日志级别运行时调整
- bunyan CLI 工具支持管道过滤和格式化

**适用场景**：
- 需要严格结构化日志的传统企业项目
- 已有 bunyan 生态集成的存量系统

> ⚠️ **维护状态**：bunyan 核心维护趋于缓慢，新项目推荐优先考虑 pino。

---

### 2.4 roarr

| 属性 | 详情 |
|------|------|
| **名称** | roarr |
| **Stars** | ⭐ 1,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [gajus/roarr](https://github.com/gajus/roarr) |

**一句话描述**：运行时环境无关的 JSON 日志记录器，可在浏览器和 Node.js 中使用同一套日志接口。

**核心特点**：
- 环境无关（Browser + Node.js 同构）
- 上下文隐式传递（AsyncLocalStorage）
- 零依赖，体积极小
- 通过环境变量控制日志级别

**适用场景**：
- 同构/Universal 应用（SSR 框架）
- 需要在浏览器也输出结构化日志的场景

---

### 2.5 consola

| 属性 | 详情 |
|------|------|
| **名称** | consola |
| **Stars** | ⭐ 5,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [unjs/consola](https://github.com/unjs/consola) |

**一句话描述**：UnJS 生态出品的优雅终端输出库，是 Nuxt 3 的默认日志工具。

**核心特点**：
- 美观的终端输出（图标、进度条、prompt）
- 可插拔 Reporter 系统
- 日志级别和类型丰富（info、success、error、warn、debug、trace）
- 支持静默模式和 mock 用于测试
- 浏览器兼容

**适用场景**：
- CLI 工具开发
- 需要美观终端输出的构建脚本
- Nuxt / Nitro 项目

```typescript
import { consola } from 'consola'

consola.start('Building project...')
consola.success('Build completed in 2.3s')
consola.warn('Deprecated API usage detected')
consola.error(new Error('Compilation failed'))

// 带 spinner 的异步操作
const spinner = consola.spinner('Installing dependencies')
await installDeps()
spinner.succeed('Dependencies installed')
```

---

## 3. OpenTelemetry JS SDK 集成指南（新增）

> OpenTelemetry（OTel）是 CNCF 毕业项目，提供跨语言的统一 API 和标准数据格式（OTLP）。本节覆盖 Node.js、浏览器（Browser）和边缘运行时（Edge / Vercel Edge Functions）的集成。

### 3.1 Node.js SDK 初始化

```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-gateway',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
  }),
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT }),
    exportIntervalMillis: 60000,
  }),
  logExporter: new OTLPLogExporter({ url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false }, // 可选：关闭文件系统 noise
  })],
})

sdk.start()

process.on('SIGTERM', async () => {
  await sdk.shutdown()
  process.exit(0)
})
```

### 3.2 Browser SDK 初始化

```typescript
// instrumentation.browser.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { ZoneContextManager } from '@opentelemetry/context-zone'

const provider = new WebTracerProvider({
  resource: {
    attributes: {
      'service.name': 'web-app',
      'deployment.environment': process.env.NODE_ENV,
    },
  },
})

provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter({
  url: 'https://otel-collector.example.com/v1/traces',
})))

// 使用 Zone.js 管理异步上下文
provider.register({
  contextManager: new ZoneContextManager(),
})

// 自动 instrument fetch、XMLHttpRequest、document load 等
getWebAutoInstrumentations().forEach((instrumentation) => {
  instrumentation.setTracerProvider(provider)
})
```

### 3.3 Edge Runtime（Vercel Edge / Cloudflare Workers）

Edge 运行时不支持完整的 Node.js SDK，需使用 **轻量级 API + OTLP exporter**：

```typescript
// instrumentation.edge.ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { trace, SpanStatusCode } from '@opentelemetry/api'

const provider = new BasicTracerProvider({
  resource: new Resource({
    'service.name': 'edge-function',
    'deployment.environment': 'production',
  }),
  sampler: new TraceIdRatioBasedSampler(0.1),
})

provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter({
  url: 'https://otel-collector.example.com/v1/traces',
  headers: { 'x-api-key': process.env.OTEL_API_KEY },
})))

provider.register()

// Edge 中手动创建 span
const tracer = trace.getTracer('edge-router')

export default async function handler(request: Request) {
  return tracer.startActiveSpan('handle-request', async (span) => {
    span.setAttribute('http.method', request.method)
    span.setAttribute('http.url', request.url)

    try {
      const response = await fetchUpstream(request)
      span.setAttribute('http.status_code', response.status)
      span.setStatus({ code: SpanStatusCode.OK })
      return response
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  })
}
```

### 3.4 与 Sentry v8+ 集成

Sentry v8 内部基于 OpenTelemetry 实现，只需启用 `openTelemetryIntegration` 即可实现双向 trace 关联：

```typescript
import * as Sentry from '@sentry/node'
import { openTelemetryIntegration } from '@sentry/opentelemetry'
import { NodeSDK } from '@opentelemetry/sdk-node'

// 先初始化 Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [openTelemetryIntegration(), Sentry.httpIntegration()],
  tracesSampleRate: 0.2,
})

// 再初始化 OTel SDK，Sentry 会自动复用或关联 span processor
const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
})
sdk.start()
```

---

## 4. 结构化日志、OpenTelemetry 与日志级别最佳实践

### 4.1 结构化日志格式（更新）

```typescript
// ✅ 推荐：结构化 JSON 日志，含 OpenTelemetry Trace Context
{
  "level": "error",
  "timestamp": "2026-04-19T04:06:24.284Z",
  "msg": "LLM inference failed",
  "service": "ai-gateway",
  "environment": "production",
  "traceId": "abc-123-def-456",
  "spanId": "span-789-xyz",
  "llm": {
    "model": "gpt-4o",
    "provider": "openai",
    "temperature": 0.7
  },
  "usage": {
    "promptTokens": 120,
    "completionTokens": 45,
    "totalTokens": 165,
    "estimatedCostUsd": 0.001575
  },
  "error": {
    "type": "RateLimitError",
    "message": "429 Too Many Requests",
    "retryAfter": 20
  },
  "context": {
    "userId": "456",
    "sessionId": "sess-xyz"
  }
}

// ❌ 避免：无结构的纯文本日志
// [ERROR] 2026-04-19 LLM inference failed for user 456
```

### 4.2 Pino + OpenTelemetry Log Bridge

```typescript
// logger.ts
import pino from 'pino'
import { trace, context } from '@opentelemetry/api'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
  redact: {
    paths: ['password', 'authorization', '*.token', 'apiKey', 'openAiApiKey'],
    remove: true,
  },
  base: { service: 'ai-gateway', pid: process.pid },
  mixin() {
    // 自动注入当前 span 的 traceId / spanId
    const span = trace.getSpan(context.active())
    if (!span) return {}
    const { traceId, spanId, traceFlags } = span.spanContext()
    return { traceId, spanId, traceFlags }
  },
  formatters: {
    level(label) {
      return { severity: label.toUpperCase() }
    },
  },
})

// 使用
logger.info({ userId: '123', action: 'chat-completion' }, 'LLM request started')
logger.child({ requestId: 'req-abc' }).error({ err: new Error('Timeout') }, 'LLM request failed')
```

### 4.3 Winston + OpenTelemetry Log Bridge

```typescript
// winston-otel-bridge.ts
import winston from 'winston'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { LoggerProvider, BatchLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs'

const logExporter = new OTLPLogExporter({ url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT })
const loggerProvider = new LoggerProvider()
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter))
// 开发环境可同时输出到控制台
if (process.env.NODE_ENV === 'development') {
  loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(new ConsoleLogRecordExporter()))
}

const otelLogger = logs.getLogger('winston-bridge', '1.0.0')

const severityMap: Record<string, SeverityNumber> = {
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  debug: SeverityNumber.DEBUG,
  trace: SeverityNumber.TRACE,
  fatal: SeverityNumber.FATAL,
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
})

// 将 Winston 日志桥接到 OpenTelemetry
logger.on('data', (logEntry: any) => {
  const { level, message, timestamp, ...meta } = logEntry
  otelLogger.emit({
    severityNumber: severityMap[level] || SeverityNumber.UNSPECIFIED,
    severityText: level,
    body: message,
    attributes: {
      ...meta,
      'log.source': 'winston',
      'service.name': 'api-service',
    },
    timestamp: timestamp ? new Date(timestamp).getTime() : Date.now(),
  })
})

export { logger }
```

### 4.4 日志级别规范

| 级别 | 使用场景 | 生产环境行为 |
|------|----------|-------------|
| `trace` | 最详细的调试信息（函数入参、循环变量） | 通常关闭 |
| `debug` | 开发调试信息（SQL 查询、缓存命中、LLM prompt 详情） | 通常关闭 |
| `info` | 正常业务流程（请求处理、任务完成、LLM 调用成功） | 保留 |
| `warn` | 非预期但可恢复（降级服务、重试、LLM rate limit 触发） | 保留并告警 |
| `error` | 需要人工介入（异常、超时、失败） | 保留并告警 |
| `fatal` | 系统级崩溃（无法恢复、OTel Collector 不可达） | 保留并立即告警 |

### 4.5 TypeScript 类型安全日志

```typescript
interface LogContext {
  traceId?: string
  spanId?: string
  userId?: string
  requestPath?: string
  llm?: {
    model: string
    provider: 'openai' | 'anthropic' | 'azure' | 'google'
    temperature?: number
  }
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCostUsd: number
  }
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface TypedLogger {
  log(level: LogLevel, message: string, meta?: LogContext & Record<string, unknown>): void
  trace(msg: string, meta?: LogContext & Record<string, unknown>): void
  debug(msg: string, meta?: LogContext & Record<string, unknown>): void
  info(msg: string, meta?: LogContext & Record<string, unknown>): void
  warn(msg: string, meta?: LogContext & Record<string, unknown>): void
  error(msg: string, meta?: LogContext & Record<string, unknown>): void
  fatal(msg: string, meta?: LogContext & Record<string, unknown>): void
  child(context: Partial<LogContext>): TypedLogger
}
```

---

## 5. AI 应用可观测性（新增）

> AI 应用的可观测性不仅关注系统层面的延迟和错误，更需要追踪 **LLM 调用链、token 消耗、延迟分位数（p50/p95/p99）、prompt 版本与效果归因**。

### 5.1 LLM 调用链追踪

在 OpenTelemetry 中，LLM 调用应建模为独立的 span，并附加语义化属性：

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('ai-gateway', '1.0.0')

export async function trackLLMCall<T>(
  operationName: string,
  params: {
    model: string
    provider: string
    temperature: number
    messages: Array<{ role: string; content: string }>
  },
  execute: () => Promise<T & { usage?: { prompt_tokens: number; completion_tokens: number }; model?: string }>
): Promise<T> {
  return tracer.startActiveSpan(operationName, async (span) => {
    const startTime = Date.now()

    // 设置 LLM 语义属性（遵循 OpenTelemetry gen_ai conventions）
    span.setAttribute('gen_ai.system', params.provider)
    span.setAttribute('gen_ai.request.model', params.model)
    span.setAttribute('gen_ai.request.temperature', params.temperature)
    span.setAttribute('gen_ai.request.max_tokens', params.messages.reduce((acc, m) => acc + m.content.length, 0))

    try {
      const result = await execute()

      // 记录响应与用量
      const latency = Date.now() - startTime
      span.setAttribute('gen_ai.response.model', result.model || params.model)
      span.setAttribute('gen_ai.usage.input_tokens', result.usage?.prompt_tokens ?? 0)
      span.setAttribute('gen_ai.usage.output_tokens', result.usage?.completion_tokens ?? 0)
      span.setAttribute('gen_ai.usage.total_tokens', (result.usage?.prompt_tokens ?? 0) + (result.usage?.completion_tokens ?? 0))
      span.setAttribute('gen_ai.latency_ms', latency)

      // Cost 计算（以 OpenAI GPT-4o 2026-04 定价为参考）
      const cost = calculateCost(params.model, result.usage?.prompt_tokens ?? 0, result.usage?.completion_tokens ?? 0)
      span.setAttribute('gen_ai.cost.usd', cost)

      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })
      throw error
    } finally {
      span.end()
    }
  })
}

// Cost 计算函数
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 5.0, output: 15.0 },           // $ / 1M tokens
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
  }

  const rate = pricing[model] || { input: 0, output: 0 }
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
}
```

### 5.2 Token 消耗与延迟分位数监控

```typescript
import { metrics, ValueType } from '@opentelemetry/api'

const meter = metrics.getMeter('ai-gateway', '1.0.0')

// 创建指标
const tokenCounter = meter.createCounter('gen_ai.tokens.used', {
  description: 'Total tokens used across LLM calls',
  valueType: ValueType.INT,
})

const costHistogram = meter.createHistogram('gen_ai.cost.usd', {
  description: 'Cost per LLM call in USD',
  valueType: ValueType.DOUBLE,
})

const latencyHistogram = meter.createHistogram('gen_ai.latency_ms', {
  description: 'LLM call latency in milliseconds',
  valueType: ValueType.INT,
  unit: 'ms',
  advice: { explicitBucketBoundaries: [100, 250, 500, 1000, 2000, 5000, 10000, 30000] },
})

// 在 LLM 调用后记录指标
function recordLLMMetrics(params: {
  model: string
  provider: string
  inputTokens: number
  outputTokens: number
  cost: number
  latencyMs: number
}) {
  const attributes = {
    'gen_ai.system': params.provider,
    'gen_ai.request.model': params.model,
  }

  tokenCounter.add(params.inputTokens, { ...attributes, 'token.type': 'input' })
  tokenCounter.add(params.outputTokens, { ...attributes, 'token.type': 'output' })
  costHistogram.record(params.cost, attributes)
  latencyHistogram.record(params.latencyMs, attributes)
}
```

### 5.3 Prompt 版本追踪

```typescript
import { trace } from '@opentelemetry/api'

interface PromptVersion {
  id: string
  version: string
  template: string
  variables: Record<string, unknown>
}

const tracer = trace.getTracer('ai-gateway', '1.0.0')

export function createPromptSpan(promptVersion: PromptVersion, renderedPrompt: string) {
  const span = tracer.startSpan('prompt.render')

  span.setAttribute('prompt.id', promptVersion.id)
  span.setAttribute('prompt.version', promptVersion.version)
  span.setAttribute('prompt.template_hash', hashTemplate(promptVersion.template))
  span.setAttribute('prompt.variable_keys', Object.keys(promptVersion.variables).join(','))
  span.setAttribute('prompt.rendered_length', renderedPrompt.length)

  // 注意：不要记录完整 renderedPrompt 以防 PII 泄露；可采样或脱敏
  if (process.env.LOG_PROMPT_CONTENT === 'true') {
    span.setAttribute('prompt.rendered', renderedPrompt.slice(0, 1000))
  }

  span.end()
  return span
}

function hashTemplate(template: string): string {
  // 实际生产环境使用 crypto.createHash('sha256')
  return Buffer.from(template).toString('base64').slice(0, 16)
}
```

### 5.4 与 Langfuse / Helicone 的协同

```typescript
// 将 OpenTelemetry traces 同时导出到 Langfuse 或 Helicone

// Langfuse：通过 OTLP 接收（自托管版支持）
// 在 otel-collector 中配置多个 exporter：
// processors:
//   batch:
// exporters:
//   otlp/jaeger:
//     endpoint: jaeger:4317
//   otlp/langfuse:
//     endpoint: langfuse:4317

// Helicone：通过 OpenAI Proxy + OTel 导出双通道
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.helicone.ai/v1',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    'Helicone-OpenAI-Api-Base': 'https://api.openai.com/v1',
  },
})

// 同时，标准 OTel traces 会记录系统级调用链
// Helicone 提供 LLM 级指标，OTel 提供系统级指标，两者互补
```

---

## 6. 健康检查端点（含 AI 服务健康检查）

### 6.1 标准服务健康检查

```typescript
// health.ts
import { logger } from './logger'

export interface HealthCheck {
  name: string
  check: () => Promise<{ status: 'up' | 'down'; details?: Record<string, unknown> }>
}

export async function runHealthChecks(checks: HealthCheck[]) {
  const results = await Promise.all(
    checks.map(async (c) => {
      try {
        const result = await c.check()
        return { name: c.name, ...result }
      } catch (error) {
        return { name: c.name, status: 'down' as const, error: (error as Error).message }
      }
    })
  )

  const allUp = results.every((r) => r.status === 'up')
  return {
    status: allUp ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: results,
  }
}
```

### 6.2 集成 AI 服务健康检查

```typescript
// ai-health-checks.ts
import { runHealthChecks } from './health'
import { logger } from './logger'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const healthChecks = [
  {
    name: 'database',
    check: async () => {
      // await db.query('SELECT 1')
      return { status: 'up' as const, details: { latencyMs: 12 } }
    },
  },
  {
    name: 'redis',
    check: async () => {
      // await redis.ping()
      return { status: 'up' as const, details: { latencyMs: 3 } }
    },
  },
  {
    name: 'llm-provider-openai',
    check: async () => {
      const start = Date.now()
      try {
        // 使用最小成本模型做探测（gpt-4o-mini 或 embeddings）
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'health-check' }],
          max_tokens: 5,
        })
        const latency = Date.now() - start
        return {
          status: 'up' as const,
          details: {
            latencyMs: latency,
            model: response.model,
            provider: 'openai',
          },
        }
      } catch (error) {
        return {
          status: 'down' as const,
          details: { error: (error as Error).message, provider: 'openai' },
        }
      }
    },
  },
  {
    name: 'otel-collector',
    check: async () => {
      // 探测 OTel Collector 健康端口
      // const res = await fetch('http://otel-collector:13133')
      // return { status: res.ok ? 'up' : 'down', details: { statusCode: res.status } }
      return { status: 'up' as const }
    },
  },
]

// Express / Fastify / Hono 路由
export async function healthHandler() {
  const report = await runHealthChecks(healthChecks)
  const statusCode = report.status === 'healthy' ? 200 : 503

  if (statusCode !== 200) {
    logger.warn({ healthReport: report }, 'Health check failed')
  }

  return new Response(JSON.stringify(report), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### 6.3 健康检查最佳实践

| 实践 | 说明 |
|------|------|
| **分层检查** | `/health/live`（存活，轻量） vs `/health/ready`（就绪，含依赖） |
| **LLM 探测成本控制** | 使用最便宜的模型（`gpt-4o-mini`）或 embedding API，限制 `max_tokens` |
| **超时控制** | 每个 check 设置独立超时（如 5s），防止级联阻塞 |
| **异步非阻塞** | 健康检查不应影响主请求处理流程 |
| **敏感信息脱敏** | 健康检查响应中不暴露 API Key、数据库密码 |
| **OTel 集成** | 健康检查端点本身也应产生 trace，便于排查探测失败根因 |

---

## 7. 统一对比矩阵

### 7.1 前端错误监控

| 工具 | Stars | 定位 | 前端 | 后端 | OTel-native | 自托管 | 定价 | TS 支持 |
|------|-------|------|:----:|:----:|:-----------:|:------:|------|:-------:|
| **Sentry v8+** | 40k+ | 全栈可观测性 | ✅ | ✅ | ✅ v8 | ✅ | 免费版 generous | ⭐⭐⭐⭐⭐ |
| **LogRocket** | — | 会话回放 + 监控 | ✅ | ⚠️ | ❌ | ❌ | 按会话数 | ⭐⭐⭐⭐ |
| **Bugsnag** | 2k+ | 稳定性管理 | ✅ | ✅ | ❌ | ❌ | 按事件数 | ⭐⭐⭐⭐ |
| **Rollbar** | 1.5k+ | 实时错误追踪 | ✅ | ✅ | ❌ | ❌ | 按事件数 | ⭐⭐⭐⭐ |

### 7.2 后端日志库与可观测性标准

| 工具 | Stars | 定位 | 性能 | 结构化 | OTel 集成 | TS 支持 | 维护活跃度 |
|------|-------|------|:----:|:------:|:---------:|:-------:|:----------:|
| **OpenTelemetry** | — | 统一采集标准 | ⭐⭐⭐⭐⭐ | ✅ | ✅ 标准 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **pino** | 15k+ | 高性能结构化 | ⭐⭐⭐⭐⭐ | ✅ | ✅ instrumentation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **winston** | 23k+ | 通用日志框架 | ⭐⭐⭐ | ✅ | ⚠️ Bridge | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **bunyan** | 7k+ | 结构化先驱 | ⭐⭐⭐ | ✅ | ❌ | ⭐⭐⭐ | ⭐⭐ |
| **roarr** | 1k+ | 同构 JSON 日志 | ⭐⭐⭐⭐ | ✅ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **consola** | 5k+ | 终端输出/CLI | ⭐⭐⭐ | ⚠️ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 7.3 AI 可观测性

| 工具 | 定位 | AI-tracing | Cost-tracking | Prompt 版本 | Self-hosted | OTel-native | License |
|------|------|:----------:|:-------------:|:-----------:|:-----------:|:-----------:|:-------:|
| **Langfuse** | LLM 工程平台 | ✅ 最强 | ✅ 内置 | ✅ | ✅ 完全 | ⚠️ SDK | MIT |
| **Helicone** | AI Gateway | ✅ 请求级 | ✅ 内置 | ✅ | ⚠️ 部分 | ⚠️ 导出 | 部分开源 |
| **Weave** | 实验+生产 | ✅ 实验级 | ✅ 内置 | ✅ | ❌ | ⚠️ 导出 | 商业 |
| **Traceloop** | OTel AI | ✅ 自动 | ✅ 内置 | ✅ | ✅ 完全 | ✅ 完全 | Apache-2.0 |
| **Axiom** | 无索引平台 | ❌ | ❌ | ❌ | ✅ Core | ✅ 原生 | 部分开源 |

---

## 8. 选型建议

### 按场景

| 场景 | 推荐方案 |
|------|----------|
| 统一可观测性标准 | **OpenTelemetry** + Grafana/Jaeger |
| 生产级全栈错误监控 | **Sentry v8+**（免费额度充足，OTel 原生互通） |
| 需要会话回放定位问题 | **LogRocket** 或 Sentry Replay |
| 高并发 API 服务日志 | **pino** + `@opentelemetry/instrumentation-pino` |
| 企业级灵活日志路由 | **winston** + OTel Log Bridge |
| CLI 工具/构建脚本 | **consola** |
| 同构应用统一日志 | **roarr** |
| 存量 bunyan 系统 | 逐步迁移至 **pino** |
| **AI 应用 LLM tracing** | **Langfuse**（自托管）或 **Traceloop**（OTel 融合） |
| **AI Gateway + 成本优化** | **Helicone**（零侵入，缓存+限流） |
| **AI 实验与生产一体化** | **Weave**（Weights & Biases） |

### 最佳实践

1. **以 OpenTelemetry 为统一基底**：所有 traces / metrics / logs 通过 OTel 采集，后端可自由切换（Jaeger、Grafana、Datadog、Sentry v8+）
2. **前端监控 + 后端日志分离**：Sentry 捕获前端异常，pino/winston 记录后端结构化日志，通过 traceId 关联
3. **AI 可观测性双轨制**：Langfuse / Helicone 负责 LLM 语义层追踪，OpenTelemetry 负责系统层追踪，两者通过 traceId 串联
4. **关联 ID**：前后端统一 `traceId` / `requestId`，AI 调用纳入同一 trace
5. **敏感信息脱敏**：日志中自动过滤密码、Token、信用卡号、LLM API Key
6. **日志采样**：高流量服务对 `info` 级别进行采样，保留 100% `error` 和 `fatal`
7. **日志轮转**：生产环境必须配置日志切割和归档，防止磁盘打满
8. **集中化收集**：使用 Grafana Stack（Tempo + Loki + Mimir）或 Axiom 聚合日志与 traces
9. **健康检查分层**：`/health/live`（存活）与 `/health/ready`（就绪）分离，AI 依赖使用低成本模型探测

### 相关决策树

- [监控与可观测性选型决策树](../../docs/decision-trees.md#10-监控与可观测性选型决策树)
- [AI 可观测性选型决策树](../../docs/decision-trees.md#11-ai-可观测性选型决策树)

---

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据。AI 可观测性领域演进极快，建议关注 OpenTelemetry LLM Semantic Conventions 的最新进展。
