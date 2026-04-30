# 技术基础设施学习路径

> 从工具链配置到 SRE 运维，构建完整的工程能力体系。
> 本路径属于 **🔴 技术基础设施维度**。

---

## 路径概览

```
阶段 1-2: 开发工具链（4 周）
    ├── 包管理器与 Monorepo
    ├── 构建工具与代码规范
    ├── 测试策略与自动化
    └── TypeScript 配置与类型检查

阶段 3-4: 部署与运维（4 周）
    ├── CI/CD 流水线
    ├── 容器化与编排
    ├── 部署平台选型与实践
    └── 边缘部署与 Serverless

阶段 5-6: 可观测性与可靠性（4 周）
    ├── 日志、监控、追踪
    ├── 性能工程与基准测试
    ├── 安全最佳实践
    └── 灾难恢复与容错设计
```

---

## 阶段 1-2: 开发工具链

### 学习目标

- 掌握现代 JS/TS 开发工具链的完整配置
- 能够独立搭建项目的工程化体系
- 建立自动化测试与代码质量保障

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 包管理 | `docs/categories/07-package-managers.md` | `20-code-lab/` | 4h |
| Monorepo | `docs/categories/08-monorepo-tools.md` | `20-code-lab/` | 4h |
| 构建工具 | `docs/categories/03-build-tools.md` | `20-code-lab/` | 6h |
| 代码规范 | `docs/categories/14-linting-formatting.md` | `20-code-lab/` | 3h |
| 测试基础 | `docs/categories/12-testing.md` | `20-code-lab/` | 6h |
| TS 配置 | `docs/guides/typescript-configuration-guide.md` | `20-code-lab/` | 3h |

### Checkpoint 1: 工具链搭建验证

1. 从零搭建一个 Monorepo 项目，包含：
   - pnpm workspaces + Turborepo
   - Vite + TypeScript 严格模式
   - ESLint (Biome) + Prettier
   - Vitest 单元测试 + Playwright E2E
2. 配置 CI/CD：GitHub Actions 自动运行 lint/test/build

### 代码示例：pnpm workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## 阶段 3-4: 部署与运维

### 学习目标

- 理解不同部署平台的特性与适用场景
- 掌握容器化部署与 CI/CD 最佳实践
- 能够设计高可用的部署架构

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| CI/CD | `docs/categories/13-ci-cd.md` | `20-code-lab/` | 4h |
| 容器化 | `docs/guides/docker-guide.md` | `20-code-lab/20.8-edge-serverless/container-orchestration/` | 4h |
| 部署平台 | `docs/categories/09-deployment-platforms.md` | `examples/` 中部署配置 | 4h |
| 边缘部署 | `docs/categories/31-serverless-edge-computing.md` | `20-code-lab/` | 4h |
| Serverless | `docs/guides/serverless-guide.md` | `20-code-lab/` | 3h |

### Checkpoint 2: 部署架构设计

1. 为一个全栈应用设计部署方案：
   - 前端：Vercel / Cloudflare Pages
   - 后端 API：Cloudflare Workers / Railway
   - 数据库：Neon / Turso
   - CI/CD：GitHub Actions
2. 绘制部署架构图，标注数据流和故障恢复策略

### 代码示例：GitHub Actions 工作流

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint test build
      - run: pnpm dlx playwright install --with-deps
      - run: pnpm test:e2e
```

---

## 阶段 5-6: 可观测性与可靠性

### 学习目标

- 建立完整的可观测性体系
- 掌握性能分析与优化方法
- 理解安全威胁模型与防御策略

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 可观测性 | `docs/categories/23-error-monitoring-logging.md` | `20-code-lab/` | 5h |
| 性能工程 | `docs/categories/18-performance.md` | `20-code-lab/` | 5h |
| 安全基础 | `docs/categories/25-security.md` | `20-code-lab/` | 5h |
| AI 安全 | `docs/guides/llm-security-guide.md` | `20-code-lab/20.7-ai-agent-infra/ai-integration/` | 3h |
| 认证授权 | `docs/categories/29-authentication.md` | `20-code-lab/` | 4h |

### Checkpoint 3: 生产环境保障

1. 为一个应用添加完整的可观测性：
   - OpenTelemetry traces + metrics
   - Sentry 错误监控
   - 自定义性能 dashboard
2. 进行安全审计，修复至少 3 个潜在漏洞
3. 设计并实现数据库备份与灾难恢复方案

### 代码示例：OpenTelemetry 基础配置

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// 优雅关闭
process.on('SIGTERM', () => sdk.shutdown().then(() => process.exit(0)));
```

---

## 完成此路径后，你应该能够

- 独立搭建现代 JS/TS 项目的完整工程化体系
- 设计并实施 CI/CD 流水线
- 选择合适的部署平台并实施高可用架构
- 建立生产级的可观测性、性能监控和安全防护
- 优化系统性能并进行容量规划

**认证项目**：设计并实施一个包含完整工具链、CI/CD、监控告警、安全合规的生产级系统。

---

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| pnpm Workspaces | 官方文档 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| Turborepo | 官方文档 | [turbo.build](https://turbo.build/) |
| GitHub Actions | 官方文档 | [docs.github.com/actions](https://docs.github.com/en/actions) |
| Dockerfile Best Practices | 官方 | [docs.docker.com/develop/dev-best-practices](https://docs.docker.com/develop/dev-best-practices/) |
| OpenTelemetry | 官方 | [opentelemetry.io](https://opentelemetry.io/) |
| Google SRE Book | 书籍 | [sre.google/sre-book/table-of-contents](https://sre.google/sre-book/table-of-contents/) |

---

*最后更新: 2026-04-29*
*review-cycle: 6 months*
*next-review: 2026-10-27*
*status: current*


---

## 深化补充：容器化与基础设施即代码

### Docker Compose 本地开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@db:5432/dev
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: dev
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Kubernetes Deployment 与 Service

```yaml
# k8s/app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs-api
  template:
    metadata:
      labels:
        app: nodejs-api
    spec:
      containers:
        - name: api
          image: registry.example.com/nodejs-api:v1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: nodejs-api-service
spec:
  selector:
    app: nodejs-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### Terraform AWS 基础设施片段

```hcl
# main.tf
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_lambda_function" "api" {
  function_name = "nodejs-api"
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  filename      = "lambda.zip"
  role          = aws_iam_role.lambda_exec.arn
  memory_size   = 512
  timeout       = 30
}
```

---

### 更多权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Docker Docs | <https://docs.docker.com/> | 容器化官方文档 |
| Kubernetes Docs | <https://kubernetes.io/docs/home/> | K8s 官方文档 |
| Terraform Docs | <https://developer.hashicorp.com/terraform/docs> | 基础设施即代码 |
| Helm Docs | <https://helm.sh/docs/> | K8s 包管理器 |
| GitHub Actions | <https://docs.github.com/en/actions> | CI/CD 官方文档 |
| AWS Lambda | <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html> | 无服务器计算 |
| Cloudflare Workers | <https://developers.cloudflare.com/workers/> | 边缘计算平台 |
| Vercel Edge Config | <https://vercel.com/docs/storage/edge-config> | 边缘配置存储 |
