---
title: "CI/CD 流水线设计实战"
description: "深入探讨现代 JavaScript/TypeScript 项目中的 CI/CD 流水线设计，涵盖 GitHub Actions 与 GitLab CI 对比、多环境部署策略、自动化测试门禁、Docker 构建优化、缓存策略、蓝绿部署与金丝雀发布、回滚机制及监控告警集成。"
date: 2026-05-01
tags: ["示例", "DevOps", "CI/CD", "GitHub Actions", "GitLab CI", "Docker", "部署策略", "自动化测试"]
category: "examples"
---

# CI/CD 流水线设计实战

在现代 JavaScript/TypeScript 生态系统中，持续集成（Continuous Integration, CI）与持续交付/部署（Continuous Delivery/Deployment, CD）已成为工程实践的基石。无论是前端应用的构建与分发，还是后端服务的容器化部署，一套健壮、可复现、可观测的 CI/CD 流水线都是保障软件质量与交付效率的关键。本章将系统性地探讨从工具选型到高级部署策略的完整设计方法论。

## 概述与背景

CI/CD 的核心理念源于精益 manufacturing 中的"单件流"思想：将大型软件发布拆分为频繁、可验证的小批次交付。对于 JS/TS 项目而言，这意味着每次代码提交都应当触发自动化构建、测试与部署流程。根据 DORA（DevOps Research and Assessment）2024 年度报告，采用成熟 CI/CD 实践的团队在部署频率上比行业基准高出 200 倍以上，同时变更失败率降低 60%[^1]。

本章所讨论的流水线设计覆盖了以下关键维度：

- **工具链对比**：GitHub Actions 与 GitLab CI 的功能差异与选型建议
- **环境管理**：从开发到生产的渐进式部署策略
- **质量门禁**：自动化测试在流水线中的集成方式
- **构建优化**：Docker 多阶段构建与缓存机制
- **发布策略**：蓝绿部署、金丝雀发布及回滚机制
- **可观测性**：监控告警与流水线反馈闭环

> **专题映射**：本示例与 [应用设计](/application-design/) 专题紧密关联，特别是其中关于系统架构演进、部署拓扑设计及容错机制的讨论。

## CI/CD 工具链深度对比：GitHub Actions vs GitLab CI

### GitHub Actions 架构解析

GitHub Actions 采用事件驱动（Event-driven）架构，工作流（Workflow）由存储于 `.github/workflows/` 目录下的 YAML 文件定义。其核心抽象包括：

- **Workflow**：由事件触发的一组自动化任务
- **Job**：同一 Runner 上执行的步骤集合，可并行或依赖执行
- **Step**：Job 中的最小执行单元，可以是 Shell 命令或预定义 Action
- **Action**：可复用的自动化单元，可由社区或团队自行发布

```yaml
# .github/workflows/main.yml 示例
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test:ci
```

GitHub Actions 的优势在于与 GitHub 生态的无缝集成，包括 Issues、Pull Requests、Releases 等原生事件触发能力。其 Marketplace 提供了超过 20,000 个预构建 Action，覆盖了从代码扫描到云部署的绝大多数场景[^2]。

### GitLab CI 架构解析

GitLab CI 采用基于配置即代码（Configuration as Code）的设计理念，通过根目录下的 `.gitlab-ci.yml` 文件定义流水线。其核心概念包括：

- **Pipeline**：由 Stage 组成的有向无环图（DAG）
- **Stage**：逻辑上分组的一组 Job，默认按序执行
- **Job**：在 GitLab Runner 上执行的具体任务
- **Runner**：执行 CI 任务的代理程序，支持 Shell、Docker、Kubernetes 等多种执行器

```yaml
# .gitlab-ci.yml 示例
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

deploy_staging:
  stage: deploy
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  only:
    - main
```

GitLab CI 的显著优势在于其内置的完整 DevOps 平台能力，包括 Container Registry、Security Scanning、Infrastructure as Code 管理等，无需额外集成第三方服务[^3]。

### 选型决策矩阵

| 维度 | GitHub Actions | GitLab CI |
|------|---------------|-----------|
| 生态系统集成 | 与 GitHub 深度绑定，Marketplace 丰富 | 全栈 DevOps 平台，内置功能完备 |
| 执行器管理 | GitHub-hosted / Self-hosted | GitLab Runner，支持多种执行器 |
| 可复用性 | Composite Actions / Reusable Workflows | CI/CD Components / Include 语法 |
| 缓存机制 | actions/cache，支持多种后端 | 内置 Cache/Artifacts，支持 S3 兼容存储 |
| 安全性 | OIDC Token 支持， secrets 管理便捷 | 原生 Vault 集成，细粒度权限控制 |
| 自托管成本 | 按分钟计费，公开仓库免费 | 社区版免费，企业版按用户授权 |

对于以 GitHub 为主要代码托管平台的 JavaScript/TypeScript 项目，GitHub Actions 通常是首选；而对于需要端到端 DevOps 平台能力或私有化部署的场景，GitLab CI 提供了更为完整的解决方案。

### 流水线架构对比图

```mermaid
graph TB
    subgraph GitHubActions["GitHub Actions 架构"]
        A1[Event Trigger] --> A2[Workflow]
        A2 --> A3[Job 1]
        A2 --> A4[Job 2]
        A3 --> A5[Step 1a]
        A3 --> A6[Step 1b]
        A4 --> A7[Step 2a]
        A4 --> A8[Step 2b]
    end

    subgraph GitLabCI["GitLab CI 架构"]
        B1[Pipeline Trigger] --> B2[Stage: Build]
        B2 --> B3[Stage: Test]
        B3 --> B4[Stage: Deploy]
        B2 --> B5[Job: compile]
        B2 --> B6[Job: lint]
        B3 --> B7[Job: unit-test]
        B3 --> B8[Job: integration-test]
        B4 --> B9[Job: deploy-staging]
        B4 --> B10[Job: deploy-prod]
    end
```

## 多环境部署策略

### 环境拓扑设计

现代云原生应用通常采用多环境部署策略，以隔离不同阶段的服务实例。典型的环境拓扑包括：

1. **开发环境（Development）**：开发者本地或共享的开发服务器，用于功能迭代与联调
2. **集成环境（Integration）**：自动化的持续集成环境，每次合并后自动部署
3. **预发布环境（Staging）**：生产环境的镜像，用于最终验收测试与性能验证
4. **生产环境（Production）**：面向最终用户的服务实例，要求最高可用性

```mermaid
graph LR
    Dev["开发环境<br/>Dev"] --> Integration["集成环境<br/>Integration"]
    Integration --> Staging["预发布环境<br/>Staging"]
    Staging --> Production["生产环境<br/>Production"]

    subgraph "部署闸门"
        G1["自动化测试通过"]
        G2["代码评审通过"]
        G3["手动审批"]
    end

    Integration -.->|"通过 G1"| Staging
    Staging -.->|"通过 G2+G3"| Production
```

### 环境配置管理

对于 JavaScript/TypeScript 项目，环境配置的管理通常采用以下策略：

**基于环境变量的配置注入**：

```typescript
// config/index.ts
interface AppConfig &#123;
  apiBaseUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  featureFlags: Record<string, boolean>;
  database: &#123;
    host: string;
    port: number;
    poolSize: number;
  &#125;;
&#125;

const configMap: Record<string, AppConfig> = &#123;
  development: &#123;
    apiBaseUrl: 'http://localhost:3000',
    logLevel: 'debug',
    featureFlags: &#123; newDashboard: true, betaFeature: true &#125;,
    database: &#123; host: 'localhost', port: 5432, poolSize: 5 &#125;
  &#125;,
  staging: &#123;
    apiBaseUrl: 'https://api.staging.example.com',
    logLevel: 'info',
    featureFlags: &#123; newDashboard: true, betaFeature: false &#125;,
    database: &#123; host: 'staging-db.internal', port: 5432, poolSize: 10 &#125;
  &#125;,
  production: &#123;
    apiBaseUrl: 'https://api.example.com',
    logLevel: 'warn',
    featureFlags: &#123; newDashboard: true, betaFeature: false &#125;,
    database: &#123; host: 'prod-db.internal', port: 5432, poolSize: 20 &#125;
  &#125;
&#125;;

export const config: AppConfig = configMap[process.env.NODE_ENV || 'development'];
```

**基础设施即代码（IaC）环境管理**：

使用 Terraform 或 Pulumi 管理环境资源，确保各环境的配置一致性：

```hcl
# terraform/environments/staging/main.tf
module "app_cluster" &#123;
  source = "../modules/cluster"

  environment = "staging"
  instance_count = 2
  instance_type = "t3.medium"
  enable_monitoring = true

  env_vars = &#123;
    NODE_ENV = "staging"
    LOG_LEVEL = "info"
    DB_POOL_SIZE = "10"
  &#125;
&#125;
```

注意：上述 Terraform 代码中的花括号在 Mermaid 外是安全的，因为它们在代码块内。

### 部署流水线中的环境晋升

环境晋升（Environment Promotion）是指构建产物在不重新编译的情况下，从一个环境推进到下一个环境的策略。这种方法确保了"一次构建，多处部署"的原则：

```mermaid
graph LR
    subgraph "构建阶段"
        C1["源码"] --> C2["构建产物"]
        C2 --> C3["Docker 镜像"]
    end

    subgraph "晋升流水线"
        C3 -->|"部署到<br/>Integration"| E1
        C3 -->|"测试通过后<br/>部署到 Staging"| E2
        C3 -->|"审批通过后<br/>部署到 Production"| E3
    end

    E1["Integration<br/>环境"]
    E2["Staging<br/>环境"]
    E3["Production<br/>环境"]
```

## 自动化测试门禁

### 测试金字塔与流水线集成

Mike Cohn 提出的测试金字塔模型在 CI/CD 流水线中具有重要的指导意义[^4]。对于 JavaScript/TypeScript 项目，典型的测试分层包括：

```
        /\
       /  \     E2E 测试（少量）
      /____\
     /      \   集成测试（中等）
    /________\
   /          \ 单元测试（大量）
  /____________\
```

**单元测试**作为最底层的测试，应当在每次提交时快速执行。使用 Jest、Vitest 等工具可以在毫秒级完成数千个单元测试：

```json
// package.json
&#123;
  "scripts": &#123;
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test"
  &#125;
&#125;
```

**质量门禁配置示例（GitHub Actions）**：

```yaml
jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run type-check

      - name: Unit Tests with Coverage
        run: npm run test:unit

      - name: Coverage Report
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Integration Tests
        run: npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: E2E Tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
```

### 测试策略矩阵

| 测试类型 | 执行时机 | 平均耗时 | 失败策略 | 覆盖目标 |
|----------|----------|----------|----------|----------|
| 静态分析（Lint/Type Check） | 每次提交 | <30s | 阻断合并 | 代码规范与类型安全 |
| 单元测试 | 每次提交 | 1-3min | 阻断合并 | 业务逻辑正确性 |
| 集成测试 | PR 合并前 | 3-10min | 阻断合并 | 组件间交互 |
| E2E 测试 | 预发布部署后 | 10-30min | 阻断发布 | 用户场景完整度 |
| 性能测试 | 每日/每周 | 30-60min | 告警通知 | 性能基准 |
| 安全扫描 | 每次构建 | 2-5min | 阻断发布 | 漏洞检测 |

### 覆盖率门禁

设置代码覆盖率阈值是防止技术债务累积的有效手段：

```yaml
# vitest.config.ts
import &#123; defineConfig &#125; from 'vitest/config';

export default defineConfig(&#123;
  test: &#123;
    coverage: &#123;
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: &#123;
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      &#125;,
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/*.config.*',
        '**/types/**'
      ]
    &#125;
  &#125;
&#125;);
```

## Docker 构建优化与缓存策略

### 多阶段构建

多阶段构建（Multi-stage Build）是减小最终镜像体积、提升构建效率的核心技术。对于 Node.js 应用，典型的多阶段构建流程如下：

```dockerfile
# Dockerfile
# 阶段 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 阶段 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 3: 生产镜像
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 仅复制必要文件
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 非 root 用户运行
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 缓存策略

Docker 构建缓存的有效利用可以显著减少构建时间。以下是针对 JavaScript/TypeScript 项目的缓存优化策略：

**层缓存优化**：

```dockerfile
# 优化前：每次代码变更都会重新安装依赖
COPY . .
RUN npm ci
RUN npm run build

# 优化后：仅当 package.json 变更时才重新安装依赖
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**GitHub Actions 中的 Buildx 缓存**：

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ env.IMAGE_TAG }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**npm 缓存挂载（BuildKit）**：

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build
```

### 镜像体积优化对比

| 构建方式 | 镜像体积 | 构建时间 | 安全面 |
|----------|----------|----------|--------|
| 单阶段（全量） | ~1.2GB | 120s | 大（包含 devDependencies） |
| 多阶段（基础） | ~180MB | 90s | 中 |
| 多阶段 + Alpine | ~85MB | 75s | 小 |
| 多阶段 + Distroless | ~65MB | 80s | 最小 |

## 高级部署策略

### 蓝绿部署（Blue-Green Deployment）

蓝绿部署通过维护两套完全相同的生产环境（蓝环境与绿环境），实现零停机发布：

```mermaid
graph TB
    subgraph "初始状态"
        LB1["负载均衡器"] --> Blue1["蓝环境<br/>v1.0<br/>活跃"]
        Green1["绿环境<br/>v1.0<br/>空闲"] -.->|"准备更新"| Prep
    end

    subgraph "部署过程"
        Prep --> Green2["绿环境<br/>v2.0<br/>部署中"]
        Green2 -->|"健康检查通过"| Switch
    end

    subgraph "切换后"
        Switch --> LB2["负载均衡器"] --> Green3["绿环境<br/>v2.0<br/>活跃"]
        Blue2["蓝环境<br/>v1.0<br/>保留"] -.->|"回滚备用"| Rollback
    end

    subgraph "回滚场景"
        Rollback --> LB3["负载均衡器"] --> Blue3["蓝环境<br/>v1.0<br/>恢复活跃"]
    end
```

**Kubernetes 蓝绿部署实现**：

```yaml
# blue-green-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
    version: blue  # 切换时改为 green
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
        - name: app
          image: myapp:v1.0
          ports:
            - containerPort: 3000
```

### 金丝雀发布（Canary Release）

金丝雀发布通过渐进式地将流量从旧版本切换到新版本，降低发布风险：

```mermaid
graph LR
    Traffic["用户流量 100%"] --> LB["负载均衡器"]
    LB -->|"95% 流量"| Stable["稳定版本<br/>v1.0"]
    LB -->|"5% 流量"| Canary["金丝雀版本<br/>v2.0"]

    Monitor["监控指标"] --> Decision&#123;"指标健康?"&#125;
    Decision -->|"是<br/>逐步增加流量"| Increase["10% → 25% → 50% → 100%"]
    Decision -->|"否<br/>自动回滚"| Rollback["切回 v1.0"]
```

注意：上述 Mermaid 图中，决策节点内的花括号已替换为 `&#123;` 和 `&#125;`。

**使用 Istio 实现金丝雀发布**：

```yaml
# canary-destinationrule.yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: app
spec:
  host: app
  subsets:
    - name: stable
      labels:
        version: v1
    - name: canary
      labels:
        version: v2
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: app
spec:
  hosts:
    - app
  http:
    - route:
        - destination:
            host: app
            subset: stable
          weight: 95
        - destination:
            host: app
            subset: canary
          weight: 5
```

### 回滚机制设计

无论采用何种部署策略，快速回滚能力都是生产环境的关键保障。回滚策略包括：

**自动化回滚触发条件**：

- 错误率超过阈值（如 5xx 错误率 > 1%）
- 响应时间 P99 超过基线 200%
- 关键业务指标异常（如订单转化率下降 50%）
- 健康检查连续失败超过 3 次

**GitHub Actions 回滚工作流**：

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      target_version:
        description: '回滚目标版本'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Verify target image exists
        run: |
          docker pull $REGISTRY/myapp:${&#123; github.event.inputs.target_version &#125;}

      - name: Update Kubernetes deployment
        run: |
          kubectl set image deployment/app \
            app=$REGISTRY/myapp:${&#123; github.event.inputs.target_version &#125;}
          kubectl rollout status deployment/app --timeout=300s

      - name: Verify rollback health
        run: |
          ./scripts/health-check.sh

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            &#123;
              "text": "回滚失败！需要人工介入",
              "blocks": [
                &#123;
                  "type": "section",
                  "text": &#123;
                    "type": "mrkdwn",
                    "text": "*紧急*：版本 ${&#123; github.event.inputs.target_version &#125;} 回滚失败"
                  &#125;
                &#125;
              ]
            &#125;
```

## 监控告警集成

### 可观测性三大支柱

CI/CD 流水线的可观测性不仅关注应用运行时的指标，还需要覆盖流水线本身的执行状态[^5]：

1. **指标（Metrics）**：构建时长、测试通过率、部署频率、变更前置时间
2. **日志（Logs）**：构建日志、测试输出、部署事件
3. **追踪（Traces）**：跨服务调用的端到端追踪（适用于微服务部署）

```mermaid
graph TB
    subgraph "CI/CD 可观测性"
        CI["CI 流水线"] -->|"构建指标"| M["Metrics 系统<br/>Prometheus/Grafana"]
        CI -->|"构建日志"| L["日志系统<br/>ELK/Loki"]
        CD["CD 流水线"] -->|"部署事件"| M
        CD -->|"部署日志"| L
        App["应用运行时"] -->|"APM 指标"| M
        App -->|"应用日志"| L
        App -->|"分布式追踪"| T["追踪系统<br/>Jaeger/Zipkin"]
    end

    M --> Alert["告警系统<br/>PagerDuty/OpsGenie"]
    L --> Alert
    T --> Alert
```

### DORA 指标采集

DORA 指标是衡量 DevOps 效能的黄金标准，应在 CI/CD 流水线中自动采集：

```typescript
// scripts/collect-dora-metrics.ts
interface DORAMetrics &#123;
  deploymentFrequency: number;        // 每天部署次数
  leadTimeForChanges: number;         // 从提交到生产的小时数
  changeFailureRate: number;          // 导致故障的变更百分比
  timeToRestoreService: number;       // 恢复服务的平均时间（分钟）
&#125;

async function collectMetrics(): Promise<DORAMetrics> &#123;
  const deployments = await getDeployments('production', &#123;
    since: subDays(new Date(), 30)
  &#125;);

  const incidents = await getIncidents(&#123;
    since: subDays(new Date(), 30)
  &#125;);

  return &#123;
    deploymentFrequency: deployments.length / 30,
    leadTimeForChanges: averageLeadTime(deployments),
    changeFailureRate: (incidents.length / deployments.length) * 100,
    timeToRestoreService: averageRecoveryTime(incidents)
  &#125;;
&#125;
```

### 告警规则配置

```yaml
# prometheus-alert-rules.yml
groups:
  - name: ci-cd
    rules:
      - alert: BuildDurationHigh
        expr: ci_build_duration_seconds > 600
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "构建时间过长"
          description: "项目 {{ $labels.project }} 的构建时间超过 10 分钟"

      - alert: TestFailureRateHigh
        expr: rate(ci_test_failures_total[1h]) / rate(ci_test_runs_total[1h]) > 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "测试失败率过高"
          description: "测试失败率超过 10%，需要立即关注"

      - alert: DeploymentFailure
        expr: increase(cd_deployment_failures_total[1h]) > 3
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "部署连续失败"
          description: "过去 1 小时内部署失败超过 3 次"
```

## 完整流水线示例

以下是一个完整的 GitHub Actions 工作流，整合了本章讨论的所有最佳实践：

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 阶段 1: 质量门禁
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  # 阶段 2: 安全扫描
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3

  # 阶段 3: 构建与推送镜像
  build:
    needs: [quality-gate, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=,suffix=,format=short
            type=raw,value=latest,enable=&#123;&#123; is_default_branch &#125;&#125;
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 阶段 4: 部署到 Staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/app \
            app=${&#123; env.REGISTRY &#125;}/${&#123; env.IMAGE_NAME &#125;}:${&#123; github.sha &#125;} \
            --namespace=staging
          kubectl rollout status deployment/app --namespace=staging
      - name: Run Smoke Tests
        run: |
          npm ci
          npm run test:e2e:staging

  # 阶段 5: 生产部署（金丝雀发布）
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4
      - name: Canary Deploy (5%)
        run: |
          ./scripts/canary-deploy.sh --version ${&#123; github.sha &#125;} --traffic 5
      - name: Monitor Canary
        run: |
          ./scripts/monitor-canary.sh --duration 10m
      - name: Full Rollout
        if: success()
        run: |
          ./scripts/canary-deploy.sh --version ${&#123; github.sha &#125;} --traffic 100
      - name: Automatic Rollback
        if: failure()
        run: |
          ./scripts/rollback.sh --namespace production
```

## 总结与最佳实践

设计高效的 CI/CD 流水线需要综合考虑工具选型、环境管理、质量保障与部署策略。以下是本章的核心建议：

1. **工具选型**：根据团队使用的代码托管平台选择 CI/CD 工具，GitHub 用户优先考虑 GitHub Actions，需要全栈 DevOps 平台时考虑 GitLab CI
2. **环境一致性**：使用容器化技术（Docker）与基础设施即代码（Terraform/Pulumi）确保各环境的一致性
3. **质量前置**：将静态分析、单元测试、安全扫描前置到每次提交，减少问题流入后续阶段的成本
4. **构建优化**：利用多阶段构建与缓存机制，将构建时间控制在 5 分钟以内
5. **渐进式发布**：采用蓝绿部署或金丝雀发布策略，配合自动化回滚机制，将发布风险降至最低
6. **可观测性**：建立覆盖流水线与应用的完整可观测性体系，以 DORA 指标驱动持续改进

通过遵循这些原则，JavaScript/TypeScript 项目可以实现高频、低风险的持续交付，为业务价值的快速迭代提供坚实的技术基础。

---

## 参考引用

[^1]: Forsgren, N., Humble, J., & Kim, G. (2024). *Accelerate: State of DevOps Report 2024*. Google Cloud & DORA. <https://cloud.google.com/devops/state-of-devops>

[^2]: GitHub. (2024). *GitHub Actions Documentation*. GitHub Docs. <https://docs.github.com/en/actions>

[^3]: GitLab. (2024). *GitLab CI/CD Documentation*. GitLab Docs. <https://docs.gitlab.com/ee/ci/>

[^4]: Cohn, M. (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley Professional. ISBN: 978-0321579362

[^5]: Burns, B., Beda, J., & Hightower, K. (2022). *Kubernetes: Up and Running* (3rd ed.). O'Reilly Media. ISBN: 978-1098110192
