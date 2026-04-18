# Node.js API Security Boilerplate

生产级 Node.js API 安全加固模板，基于 Fastify + TypeScript，集成了完整的安全防护、认证、可观测性和测试体系。

## 技术栈

- **框架**: Fastify + TypeScript
- **安全**:
  - Helmet（安全响应头）
  - CORS（跨域控制）
  - Rate Limiting（请求限流）
  - CSRF 防护
  - 输入校验（Zod）
- **认证**:
  - JWT Token 认证
  - Refresh Token 轮换
  - Passkeys (WebAuthn) 示例
- **可观测性**:
  - pino 结构化日志
  - Prometheus metrics 端点 (`/metrics`)
- **测试**: Vitest + supertest

## 目录结构

```
nodejs-api-security-boilerplate/
├── src/
│   ├── app.ts                # Fastify 实例组装
│   ├── plugins/
│   │   ├── security.ts       # 安全插件集合
│   │   └── auth.ts           # JWT + Passkeys 认证
│   ├── routes/
│   │   └── users.ts          # 示例 REST API
│   └── utils/
│       ├── logger.ts         # pino 配置
│       └── validator.ts      # Zod 校验工具
├── tests/
│   └── app.test.ts           # Vitest 集成测试
├── tsconfig.json
├── package.json
└── README.md
```

## 前置要求

- Node.js >= 20
- pnpm >= 9

## 安装步骤

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置 JWT_SECRET 等
```

## 运行命令

```bash
# 开发模式（带热重载）
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start

# 测试
pnpm test

# 测试（watch 模式）
pnpm test:watch

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## 环境变量

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me-in-production-min-32-chars
JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars
WEBAUTHN_RP_NAME=Secure API
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

## API 端点

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| GET | `/health` | 健康检查 | 否 |
| GET | `/metrics` | Prometheus 指标 | 否 |
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| POST | `/auth/refresh` | 刷新 Token | 否 |
| POST | `/auth/logout` | 退出登录 | 否 |
| POST | `/auth/passkeys/register` | 注册 Passkey | JWT |
| POST | `/auth/passkeys/authenticate` | Passkey 认证 | 否 |
| GET | `/users` | 用户列表 | JWT |
| GET | `/users/:id` | 用户详情 | JWT |

## 安全特性说明

### 请求限流

默认每个 IP 每分钟最多 100 次请求，登录端点更严格（每分钟 10 次）。

### CSRF 防护

对状态改变请求（POST/PUT/DELETE）验证 CSRF Token。

### 输入校验

所有路由参数和请求体均通过 Zod schemas 校验，拒绝无效输入。

### Passkeys (WebAuthn)

提供完整的 WebAuthn 注册和认证流程示例，支持无密码登录。

## 监控

访问 `/metrics` 获取 Prometheus 格式的指标：

```
http_request_duration_seconds_bucket{le="0.1",method="GET",route="/health",status_code="200"} 5
http_request_duration_seconds_sum{method="GET",route="/health",status_code="200"} 0.023
http_request_duration_seconds_count{method="GET",route="/health",status_code="200"} 5
```
