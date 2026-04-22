# Edge Observability Starter

基于 Hono 的边缘计算 + 可观测性埋点 Starter，兼容 Cloudflare Workers 和 Vercel Edge Runtime。

## 技术栈

- **框架**: Hono（轻量级、高性能 Web 框架）
- **运行时**: Cloudflare Workers / Vercel Edge Runtime
- **可观测性**:
  - Sentry 错误上报（边缘兼容）
  - 结构化日志（pino）
  - OpenTelemetry trace 注入
- **特性**:
  - 边缘缓存策略
  - JWT 认证中间件
  - 请求链路追踪

## 目录结构

```
edge-observability-starter/
├── src/
│   ├── index.ts              # Hono 应用主入口
│   └── middleware/
│       ├── auth.ts           # JWT 边缘验证
│       ├── logger.ts         # 结构化日志中间件
│       ├── sentry.ts         # Sentry 边缘上报
│       └── trace.ts          # OpenTelemetry trace 注入
├── wrangler.toml             # Cloudflare Workers 部署配置
├── vercel.json               # Vercel Edge 部署配置
├── tsconfig.json
├── package.json
└── README.md
```

## 前置要求

- Node.js >= 20
- pnpm >= 9
- Wrangler CLI（Cloudflare 部署）或 Vercel CLI

## 安装步骤

```bash
# 安装依赖
pnpm install

# 本地开发（使用 Wrangler）
pnpm dev

# 部署到 Cloudflare Workers
pnpm deploy
```

## 运行命令

```bash
# 开发模式（Wrangler 本地模拟）
pnpm dev

# 类型检查
pnpm typecheck

# 部署
pnpm deploy

# 运行测试
pnpm test
```

## 环境变量

在 Cloudflare Workers 中通过 `wrangler secret` 设置：

```bash
wrangler secret put JWT_SECRET
wrangler secret put SENTRY_DSN
```

在 Vercel 中通过 Dashboard 或 `vercel env add` 设置。

## API 路由

| 路由 | 说明 |
|------|------|
| `GET /` | 健康检查 |
| `GET /api/protected` | JWT 认证保护路由 |
| `GET /api/cache-demo` | 边缘缓存示例 |

## 可观测性配置

### Sentry

自动捕获未处理异常，支持边缘环境。配置 `SENTRY_DSN` 即可启用。

### OpenTelemetry

通过 `trace` 中间件为每个请求注入 trace ID，支持与外部 OTel Collector 对接。

### 结构化日志

所有请求自动记录结构化 JSON 日志，包含：

- request_id
- trace_id
- method / path / status
- duration_ms
- user_agent / cf-ray（Cloudflare）


---

## 🔗 关联知识库模块

完成本示例后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本示例的关联 |
|------|------|---------------|
| 边缘计算 | `jsts-code-lab/32-edge-computing/` | Edge Runtime、Durable Objects、边缘缓存策略 |
| 性能监控 | `jsts-code-lab/39-performance-monitoring/` | RUM、APM、性能指标采集与分析 |
| API 安全 | `jsts-code-lab/21-api-security/` | JWT 验证、CORS、CSRF、Rate Limiting |
| 可观测性生态 | `docs/categories/23-error-monitoring-logging.md` | Sentry、Datadog、OpenTelemetry 工具对比 |

> 📚 [返回知识库首页](../README.md)
