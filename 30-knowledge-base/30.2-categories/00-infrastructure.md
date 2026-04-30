# 技术基础设施 (Technical Infrastructure)

> 构建工具、测试、部署、可观测性、安全、性能、数据库、API 设计、认证等支撑工程体系的基础设施。
>
> 本分类属于 **🔴 技术基础设施维度**。如需查看完整导航，请访问 infrastructure-index.md。

---

## 维度边界说明

**属于本分类的内容**：

- 构建工具本身（Vite/Webpack/esbuild/Rolldown）
- 测试框架与策略（Vitest/Jest/Playwright）
- 部署平台与 DevOps（Vercel/Cloudflare/Docker/K8s）
- 可观测性工具（Sentry/Datadog/OpenTelemetry）
- 数据库与 ORM（Prisma/Drizzle/Neon/Turso）
- 认证与授权方案（better-auth/Auth.js/Passkeys）
- API 设计模式（REST/GraphQL/tRPC）
- 代码质量工具（ESLint/Prettier/Biome）
- 包管理与 Monorepo（npm/pnpm/Turborepo）

**不属于本分类的内容**（请访问对应维度）：

- 前端框架的使用方法 → 框架生态维度
- 语言语法特性 → 语言核心维度
- 具体业务场景实现 → 应用领域维度

---

## 核心分类

| 分类 | 文档 | 说明 |
|------|------|------|
| 构建工具 | [03-build-tools.md](./03-build-tools.md) | Vite/Webpack/esbuild/Rolldown/Oxc |
| 测试 | [12-testing.md](./12-testing.md) | Vitest/Jest/Playwright/Cypress |
| 部署平台 | [09-deployment-platforms.md](./09-deployment-platforms.md) | Vercel/Cloudflare/AWS/Fly.io |
| 可观测性 | [23-error-monitoring-logging.md](./23-error-monitoring-logging.md) | Sentry/Datadog/OpenTelemetry |
| 数据库与 ORM | [11-orm-database.md](./11-orm-database.md) | Prisma/Drizzle/Turso/Neon |
| 认证方案 | [29-authentication.md](./29-authentication.md) | better-auth/Auth.js/Passkeys |
| API 设计 | [21-api-design.md](./21-api-design.md) | REST/GraphQL/tRPC/gRPC |
| 代码规范 | [14-linting-formatting.md](./14-linting-formatting.md) | ESLint/Prettier/Biome |
| 包管理 | [07-package-managers.md](./07-package-managers.md) | npm/pnpm/Bun/Yarn |
| Monorepo | [08-monorepo-tools.md](./08-monorepo-tools.md) | Turborepo/Nx/Rush |
| CI/CD | [13-ci-cd.md](./13-ci-cd.md) | GitHub Actions/GitLab CI |
| 性能优化 | [18-performance.md](./18-performance.md) | 前端/后端/数据库优化 |
| 安全 | [25-security.md](./25-security.md) | Web 安全/AI 安全/供应链 |

---

## 基础设施全栈对比表

| 层级 | 主流方案 | 2026 推荐 | 适用场景 |
|------|---------|----------|---------|
| **构建工具** | Webpack / Vite / esbuild / Rolldown | **Rolldown + Vite** | 大型项目迁移至 Rust 工具链 |
| **测试框架** | Jest / Vitest / Mocha | **Vitest + Playwright** | 统一 Vite 生态 + E2E 测试 |
| **部署平台** | Vercel / Netlify / AWS / Fly.io | **Vercel (Web) + Fly.io (API)** | Edge + 容器混合部署 |
| **可观测性** | Sentry / Datadog / Grafana | **OpenTelemetry + Sentry** | 云原生 + 错误追踪 |
| **数据库** | PostgreSQL / MySQL / MongoDB | **PostgreSQL + Drizzle ORM** | 类型安全 SQL |
| **认证方案** | Auth0 / Firebase Auth / Cognito | **better-auth + Passkeys** | 现代无密码体验 |
| **API 风格** | REST / GraphQL / tRPC / gRPC | **tRPC (内部) + OpenAPI (外部)** | 端到端类型安全 |
| **Monorepo** | Nx / Turborepo / Rush | **Turborepo + pnpm** | 快速增量构建 |
| **容器化** | Docker / Podman | **Docker + Docker Compose** | 本地开发一致性 |
| **CI/CD** | GitHub Actions / GitLab CI / CircleCI | **GitHub Actions** | 社区生态最丰富 |

---

## 部署平台选型对比

| 平台 | 部署模型 | 冷启动 | 定价模式 | 最佳场景 |
|------|---------|--------|---------|---------|
| **Vercel** | Serverless Edge / Node.js | < 50ms | 按请求 + 带宽 | Next.js 全栈应用 |
| **Cloudflare Pages** | V8 Isolates (Worker) | < 1ms | 按请求 + 存储 | 静态站点 + Edge API |
| **Fly.io** | Firecracker Micro-VM | ~300ms | 按 vCPU + 内存 | 有状态服务 / Docker |
| **AWS Lambda** | Serverless Function | ~100–300ms | 按调用 + 时长 | 事件驱动 / 低频 API |
| **Railway** | Container | ~10s | 按资源使用 | 快速原型 / 团队项目 |
| **Render** | Container / Static | ~30s | 按实例规格 | 全栈应用 / 数据库托管 |

---

## 代码示例：类型安全的全栈基础设施配置

```typescript
// turbo.json — Turborepo 管道定义
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "typecheck": { "dependsOn": ["^build"] }
  }
}

// Dockerfile — 多阶段构建优化
# ---- Base ----
FROM node:22-alpine AS base
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=web

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./
EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]

// GitHub Actions — CI 流水线
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck test build
```

---

## 代码示例：Docker Compose 本地开发栈

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres@db:5432/dev
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

## 代码示例：GitHub Actions 矩阵策略

```yaml
# .github/workflows/ci-matrix.yml
name: CI Matrix
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22, 24]
        package-manager: [npm, pnpm, bun]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - if: matrix.package-manager == 'pnpm'
        uses: pnpm/action-setup@v3
        with: { version: 9 }
      - if: matrix.package-manager == 'bun'
        uses: oven-sh/setup-bun@v2
      - run: ${{ matrix.package-manager }} install
      - run: ${{ matrix.package-manager }} run test
```

## 代码示例：Terraform AWS ECS 部署

```hcl
# infra/main.tf
terraform {
  required_providers { aws = { source = "hashicorp/aws" } }
}

provider "aws" { region = "us-east-1" }

resource "aws_ecs_cluster" "app" {
  name = "jsts-app-cluster"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "jsts-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  container_definitions = jsonencode([{
    name  = "app"
    image = "${aws_ecr_repository.app.repository_url}:latest"
    portMappings = [{ containerPort = 3000 }]
    environment = [
      { name = "NODE_ENV", value = "production" }
    ]
  }])
}
```

## 决策支持

- [基础设施决策矩阵](../30.3-comparison-matrices/infrastructure-stack-decision-matrix.md)
- [Type Stripping 策略决策树](../30.4-decision-trees/legacy-decision-trees.md#17-type-stripping-策略决策树)
- [部署平台选型决策树](../30.4-decision-trees/legacy-decision-trees.md#9-部署平台选型决策树)

---

## 代码实践

| 模块 | 路径 | 说明 |
|------|------|------|
| 包管理 | [../../20-code-lab/20.1-fundamentals-lab/package-management/](../../20-code-lab/20.1-fundamentals-lab/package-management/) | npm/pnpm/Bun workspaces |
| 工具链配置 | [../../20-code-lab/20.11-rust-toolchain/toolchain-configuration/](../../20-code-lab/20.11-rust-toolchain/toolchain-configuration/) | ESLint/Prettier/Biome/Vite |
| 测试 | [../../20-code-lab/20.2-language-patterns/testing/](../../20-code-lab/20.2-language-patterns/testing/) | 单元测试/E2E/性能测试 |
| API 安全 | [../../20-code-lab/20.9-observability-security/api-security/](../../20-code-lab/20.9-observability-security/api-security/) | 认证/授权/安全最佳实践 |
| 性能优化 | [../../20-code-lab/20.4-data-algorithms/performance/](../../20-code-lab/20.4-data-algorithms/performance/) | 前端/后端/数据库优化 |
| 可观测性 | [../../20-code-lab/20.9-observability-security/observability/](../../20-code-lab/20.9-observability-security/observability/) | 日志/监控/追踪 |
| 现代认证 | [../../20-code-lab/20.9-observability-security/auth-modern-lab/](../../20-code-lab/20.9-observability-security/auth-modern-lab/) | Passkeys/WebAuthn/OAuth 2.1 |

---

## 参考链接

- [Turborepo — Monorepo Handbook](https://turbo.build/repo/docs)
- [Vite — Next Generation Frontend Tooling](https://vitejs.dev/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [OpenTelemetry — Getting Started](https://opentelemetry.io/docs/)
- [Drizzle ORM — TypeScript SQL-like ORM](https://orm.drizzle.team/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [GitHub Actions — Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Neon Serverless Postgres](https://neon.tech/docs/introduction)
- [Cloudflare Workers — Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [better-auth — Framework-agnostic authentication](https://www.better-auth.com/)

---

*最后更新: 2026-04-29*
*review-cycle: 3 months*
*next-review: 2026-07-27*
*status: current*
