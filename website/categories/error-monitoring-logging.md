
# 错误监控与日志工具

> 本文档盘点 JavaScript/TypeScript 生态中用于前端错误监控、后端日志记录及全链路可观测性的主流工具与库。数据基于 2026 年 4 月 GitHub Stars 与社区活跃度。

## 🧪 关联代码实验室

> **2** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [17-debugging-monitoring](../../jsts-code-lab/17-debugging-monitoring/) | 🌿 | 1 | 1 |
| [92-observability-lab](../../jsts-code-lab/92-observability-lab/) | 🌳 | 5 | 1 |


---

## 📊 整体概览

| 类别 | 代表工具 | 定位 | Stars |
|------|----------|------|-------|
| 前端错误监控 | Sentry | 全栈可观测性平台 | 40k+ |
| 前端错误监控 | LogRocket | 会话回放 + 性能监控 | — |
| 前端错误监控 | Bugsnag | 稳定性监控 | 2k+ |
| 前端错误监控 | Rollbar | 实时错误追踪 | 1k+ |
| 前端错误监控 | Raygun | 应用性能监控 | — |
| 后端日志 | winston | Node.js 日志标准 | 23k+ |
| 后端日志 | pino | 极速结构化日志 | 15k+ |
| 后端日志 | bunyan | 结构化日志先驱 | 7k+ |
| 后端日志 | roarr | JSON 日志运行时无关 | 1k+ |
| 后端日志 | consola | 优雅终端输出 | 5k+ |

---

## 1. 前端错误监控

### 1.1 Sentry

| 属性 | 详情 |
|------|------|
| **名称** | Sentry |
| **Stars** | ⭐ 40,000+ (getsentry/sentry-javascript) |
| **TS支持** | ✅ 官方类型定义完善 |
| **GitHub** | [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript) |
| **官网** | [sentry.io](https://sentry.io) |

**一句话描述**：业界最广泛使用的全栈错误监控与性能追踪平台，支持从前端到后端、移动端到原生应用的完整可观测性。

**核心特点**：

- 自动捕获未处理异常、Promise rejections、资源加载失败
- Source Map 自动还原压缩代码堆栈
- Breadcrumbs（面包屑）记录用户操作路径
- 性能监控（Web Vitals、API 延迟、数据库查询）
- Session Replay（会话回放）重现用户操作
- 分布式追踪（Distributed Tracing）关联前后端请求
- 支持自托管（Sentry On-Premise）

**适用场景**：

- 中大型 Web 应用生产环境监控
- 需要前后端错误关联的全栈项目
- 对 Source Map 和堆栈还原有高要求的团队

```typescript
// @sentry/browser 或 @sentry/react / @sentry/nextjs
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://xxx@yyy.ingest.sentry.io/zzz',
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// 手动上报
Sentry.captureException(new Error('Something went wrong'));
Sentry.captureMessage('User reached unexpected state', 'warning');

// 设置上下文
Sentry.setUser({ id: '123', email: 'user@example.com' });
Sentry.setTag('page', 'checkout');
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
import LogRocket from 'logrocket';

LogRocket.init('app/id');

// 与 Redux 集成
const store = createStore(
  reducer,
  applyMiddleware(LogRocket.reduxMiddleware())
);
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

## 2. 后端日志

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
import winston from 'winston';

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
});

logger.info('User logged in', { userId: '123' });
logger.error('Database connection failed', { error: new Error('ECONNREFUSED') });
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
- 丰富的生态：pino-pretty（终端美化）、pino-http、@elastic/ecs-pino-format
- 支持 Worker Thread 异步写入减少主线程阻塞

**适用场景**：

- 高并发、低延迟的 API 服务
- 需要 JSON 结构化日志直接对接 ELK/Loki 的场景
- 性能敏感型应用

```typescript
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

// 结构化日志（自动序列化）
logger.info({ userId: '123', action: 'purchase' }, 'Order placed');
logger.error({ err: new Error('Payment failed') }, 'Payment error');

// 子 logger 继承上下文
const child = logger.child({ requestId: 'abc-123' });
child.info('Processing request'); // 自动包含 requestId
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
import { consola } from 'consola';

consola.start('Building project...');
consola.success('Build completed in 2.3s');
consola.warn('Deprecated API usage detected');
consola.error(new Error('Compilation failed'));

// 带 spinner 的异步操作
const spinner = consola.spinner('Installing dependencies');
await installDeps();
spinner.succeed('Dependencies installed');
```

---

## 3. 结构化日志与日志级别最佳实践

### 3.1 结构化日志格式

```typescript
// ✅ 推荐：结构化 JSON 日志
{
  "level": "error",
  "timestamp": "2026-04-19T04:06:24.284Z",
  "msg": "Database connection failed",
  "service": "order-service",
  "environment": "production",
  "traceId": "abc-123-def",
  "error": {
    "type": "ConnectionError",
    "message": "ECONNREFUSED",
    "stack": "..."
  },
  "context": {
    "userId": "456",
    "orderId": "789"
  }
}

// ❌ 避免：无结构的纯文本日志
// [ERROR] 2026-04-19 Database connection failed for user 456
```

### 3.2 日志级别规范

| 级别 | 使用场景 | 生产环境行为 |
|------|----------|-------------|
| `trace` | 最详细的调试信息（函数入参、循环变量） | 通常关闭 |
| `debug` | 开发调试信息（SQL 查询、缓存命中） | 通常关闭 |
| `info` | 正常业务流程（请求处理、任务完成） | 保留 |
| `warn` | 非预期但可恢复（降级服务、重试） | 保留并告警 |
| `error` | 需要人工介入（异常、超时、失败） | 保留并告警 |
| `fatal` | 系统级崩溃（无法恢复） | 保留并立即告警 |

### 3.3 TypeScript 类型安全日志

```typescript
interface LogContext {
  traceId: string;
  userId?: string;
  requestPath?: string;
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  trace(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  fatal(msg: string, meta?: Record<string, unknown>): void;
  child(context: Partial<LogContext>): Logger;
}
```

---

## 4. 统一对比矩阵

### 4.1 前端错误监控

| 工具 | Stars | 定位 | 前端 | 后端 | 自托管 | 定价 | TS 支持 |
|------|-------|------|:----:|:----:|:------:|------|:-------:|
| **Sentry** | 40k+ | 全栈可观测性 | ✅ | ✅ | ✅ | 免费版 generous | ⭐⭐⭐⭐⭐ |
| **LogRocket** | — | 会话回放 + 监控 | ✅ | ⚠️ | ❌ | 按会话数 | ⭐⭐⭐⭐ |
| **Bugsnag** | 2k+ | 稳定性管理 | ✅ | ✅ | ❌ | 按事件数 | ⭐⭐⭐⭐ |
| **Rollbar** | 1.5k+ | 实时错误追踪 | ✅ | ✅ | ❌ | 按事件数 | ⭐⭐⭐⭐ |
| **Raygun** | — | APM + 崩溃报告 | ✅ | ✅ | ❌ | 按用量 | ⭐⭐⭐⭐ |

### 4.2 后端日志库

| 工具 | Stars | 定位 | 性能 | 结构化 | 生态丰富度 | TS 支持 | 维护活跃度 |
|------|-------|------|:----:|:------:|:----------:|:-------:|:----------:|
| **winston** | 23k+ | 通用日志框架 | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **pino** | 15k+ | 高性能结构化 | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **bunyan** | 7k+ | 结构化先驱 | ⭐⭐⭐ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **roarr** | 1k+ | 同构 JSON 日志 | ⭐⭐⭐⭐ | ✅ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **consola** | 5k+ | 终端输出/CLI | ⭐⭐⭐ | ⚠️ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 5. 选型建议

### 按场景

| 场景 | 推荐方案 |
|------|----------|
| 生产级全栈错误监控 | **Sentry**（免费额度充足，生态最全） |
| 需要会话回放定位问题 | **LogRocket** 或 Sentry Replay |
| 高并发 API 服务日志 | **pino** + pino-pretty |
| 企业级灵活日志路由 | **winston** + 多 Transport |
| CLI 工具/构建脚本 | **consola** |
| 同构应用统一日志 | **roarr** |
| 存量 bunyan 系统 | 逐步迁移至 **pino** |

### 最佳实践

1. **前端监控 + 后端日志分离**：Sentry 捕获前端异常，pino/winston 记录后端结构化日志
2. **关联 ID**：前后端统一 `traceId` / `requestId`，便于全链路追踪
3. **敏感信息脱敏**：日志中自动过滤密码、Token、信用卡号
4. **日志采样**：高流量服务对 `info` 级别进行采样，保留 100% `error`
5. **日志轮转**：生产环境必须配置日志切割和归档，防止磁盘打满
6. **集中化收集**：使用 ELK（Elasticsearch + Logstash + Kibana）或 Grafana Loki 聚合日志

### 相关决策树

- 监控与可观测性选型决策树

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据。
