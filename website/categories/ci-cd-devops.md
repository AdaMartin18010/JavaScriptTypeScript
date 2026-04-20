
# CI/CD 与 DevOps 工具

> 本文档盘点 JavaScript/TypeScript 生态中主流的持续集成（CI）、持续部署（CD）与 DevOps 工具。覆盖 SaaS 托管服务与自托管方案，分析各工具与 JS/TS 项目的集成度、配置范式与适用场景。

## 🧪 关联代码实验室

> **1** 个关联模块 · 平均成熟度：**🌿**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [22-deployment-devops](../../jsts-code-lab/22-deployment-devops/) | 🌿 | 2 | 2 |


---

## 📊 整体概览

| 工具 | 类型 | 托管方式 | Stars | 与 JS/TS 集成度 |
|------|------|----------|-------|----------------|
| GitHub Actions | CI/CD | SaaS + 自托管 Runner | — | ⭐⭐⭐⭐⭐ |
| GitLab CI | CI/CD + DevOps 平台 | SaaS + 自托管 | — | ⭐⭐⭐⭐ |
| CircleCI | CI/CD | SaaS + 自托管 | — | ⭐⭐⭐⭐⭐ |
| Travis CI | CI | SaaS | 9k+ | ⭐⭐⭐ |
| Jenkins | CI/CD | 自托管 | 23k+ | ⭐⭐⭐⭐ |
| Drone CI | CI/CD | 自托管 | 28k+ | ⭐⭐⭐⭐ |
| Buildkite | CI/CD | 混合（SaaS 编排 + 自托管 Agent） | — | ⭐⭐⭐⭐ |
| Argo CD | CD（GitOps） | 自托管（Kubernetes） | 18k+ | ⭐⭐⭐ |

---

## 1. GitHub Actions

| 属性 | 详情 |
|------|------|
| **名称** | GitHub Actions |
| **托管方式** | SaaS（GitHub-hosted runners）+ 自托管 runners |
| **配置格式** | YAML（`.github/workflows/`） |
| **官网** | [github.com/features/actions](https://github.com/features/actions) |

**一句话描述**：GitHub 原生 CI/CD 平台，与代码仓库深度集成，拥有最丰富的开源 Action 生态市场。

**核心特点**：

- 与 GitHub 仓库无缝集成，PR 状态直接显示
- GitHub Marketplace 拥有 20,000+ 可复用 Actions
- 矩阵构建（Matrix builds）跨多 OS/Node 版本
- 支持自托管 runner 满足特殊硬件/安全需求
- 内置缓存（`actions/cache`）和 artifact 存储
- 机密管理（Secrets）和变量（Variables）原生支持

**适用场景**：

- 代码托管在 GitHub 的项目
- 需要丰富社区 Action 快速搭建流水线的团队
- 开源项目（免费额度极为慷慨）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

---

## 2. GitLab CI

| 属性 | 详情 |
|------|------|
| **名称** | GitLab CI/CD |
| **托管方式** | SaaS（GitLab.com）+ 自托管 GitLab + Runner |
| **配置格式** | YAML（`.gitlab-ci.yml`） |
| **官网** | [docs.gitlab.com/ee/ci](https://docs.gitlab.com/ee/ci) |

**一句话描述**：GitLab 内置的完整 DevOps 平台，CI/CD 只是其一体化工具链的一部分，覆盖从代码到监控的全生命周期。

**核心特点**：

- 与 GitLab Issue、Merge Request、Container Registry 深度集成
- 流水线即代码（Pipeline as Code），支持父子流水线、动态生成
- 内置 SAST/DAST/依赖扫描等安全能力
- Runner 支持 Shell、Docker、Kubernetes、VM 多种执行器
- 缓存与 Artifact 管理成熟

**适用场景**：

- 使用 GitLab 作为代码托管的团队
- 需要一体化 DevOps 平台（代码 + CI + 安全 + 监控）的企业
- 需要复杂流水线编排（多阶段、条件执行、并行矩阵）的项目

```yaml
# .gitlab-ci.yml
stages: [install, lint, test, build, deploy]

variables:
  NODE_VERSION: "20"

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/

install:
  stage: install
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci --cache .npm --prefer-offline

test:
  stage: test
  image: node:${NODE_VERSION}-alpine
  script:
    - npm run test:coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

---

## 3. CircleCI

| 属性 | 详情 |
|------|------|
| **名称** | CircleCI |
| **托管方式** | SaaS（Cloud）+ 自托管（Server） |
| **配置格式** | YAML（`.circleci/config.yml`） |
| **官网** | [circleci.com](https://circleci.com) |

**一句话描述**：以速度和可靠性著称的 CI/CD 平台，Docker Layer Caching 和并行测试能力突出。

**核心特点**：

- Docker Layer Caching（DLC）显著加速容器构建
- 并行测试自动拆分（Test Splitting）
- Orbs（可复用配置包）生态丰富
- 强大的 SSH 调试能力（Rerun with SSH）
- Insights Dashboard 分析流水线性能和稳定性

**适用场景**：

- Docker 构建密集的项目
- 需要快速并行测试的大型测试套件
- 混合技术栈（前端 + 后端 + 移动端）的复杂项目

```yaml
# .circleci/config.yml
version: 2.1
orbs:
  node: circleci/node@6.1

jobs:
  test:
    docker:
      - image: cimg/node:20.12
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Run tests
          command: npm run test:ci
      - store_test_results:
          path: junit.xml
      - store_artifacts:
          path: coverage

workflows:
  ci:
    jobs:
      - test
```

---

## 4. Travis CI

| 属性 | 详情 |
|------|------|
| **名称** | Travis CI |
| **Stars** | ⭐ 9,000+ (travis-ci/travis-yml) |
| **托管方式** | SaaS（travis-ci.com） |
| **配置格式** | YAML（`.travis.yml`） |
| **官网** | [travis-ci.com](https://travis-ci.com) |

**一句话描述**：开源社区早期的 CI 先驱，曾是 GitHub 项目的默认选择，近年市场份额被 GitHub Actions 大量蚕食。

**核心特点**：

- 多语言原生支持，配置简洁
- 矩阵构建跨环境测试
- 与 GitHub 集成良好
- 开源项目免费（Credits 制）

**适用场景**：

- 历史项目已使用 Travis CI
- 简单到中等复杂度的开源项目

> ⚠️ **注意**：Travis CI 在 2020 年后改变了定价策略，免费额度大幅缩减，许多开源项目已迁移至 GitHub Actions。

```yaml
# .travis.yml
language: node_js
node_js:
  - 18
  - 20
  - 22
cache: npm
script:
  - npm run lint
  - npm run test
after_success:
  - npm run codecov
```

---

## 5. Jenkins

| 属性 | 详情 |
|------|------|
| **名称** | Jenkins |
| **Stars** | ⭐ 23,000+ |
| **托管方式** | 完全自托管 |
| **配置格式** | Groovy（Jenkinsfile）、Web UI |
| **GitHub** | [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins) |
| **官网** | [jenkins.io](https://jenkins.io) |

**一句话描述**：开源 CI/CD 服务器的老牌王者，以极致的可扩展性和插件生态著称，是企业自托管 CI 的首选之一。

**核心特点**：

- 1,800+ 插件覆盖几乎所有工具和场景
- Pipeline as Code（Jenkinsfile Groovy DSL）
- 分布式构建（Master + Agent 架构）
- 与 LDAP/Active Directory 等企业认证集成
- 完全掌控基础设施和数据

**适用场景**：

- 需要完全自托管、数据不出内网的企业
- 复杂的企业级流水线（审批、参数化、多环境推广）
- 已有 Jenkins 运维团队的大型组织

```groovy
// Jenkinsfile
pipeline {
    agent { docker { image 'node:20-alpine' } }
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }
    }
    post {
        always {
            junit 'junit.xml'
        }
    }
}
```

---

## 6. Drone CI

| 属性 | 详情 |
|------|------|
| **名称** | Drone CI |
| **Stars** | ⭐ 28,000+ |
| **托管方式** | 自托管（Docker/Kubernetes） |
| **配置格式** | YAML（`.drone.yml`） |
| **GitHub** | [harness/drone](https://github.com/harness/drone) |
| **官网** | [drone.io](https://drone.io) |

**一句话描述**：基于 Docker 的现代 CI 引擎，每个构建步骤都在独立容器中执行，配置极简，适合容器化工作流。

**核心特点**：

- 一切皆容器：每个步骤是独立的 Docker 容器
- 配置简洁，学习曲线平缓
- 支持多管道（Multi-pipeline）和条件执行
- 与 GitHub/GitLab/Gitea 等代码托管集成
- 2020 年被 Harness 收购，持续维护中

**适用场景**：

- 已全面容器化的团队
- 追求简洁配置和快速启动的自托管 CI
- 需要与多种 Git 提供商集成的环境

```yaml
# .drone.yml
kind: pipeline
type: docker
name: test

steps:
  - name: install
    image: node:20-alpine
    commands:
      - npm ci

  - name: lint
    image: node:20-alpine
    commands:
      - npm run lint

  - name: test
    image: node:20-alpine
    commands:
      - npm run test
```

---

## 7. Buildkite

| 属性 | 详情 |
|------|------|
| **名称** | Buildkite |
| **托管方式** | 混合：SaaS 编排（Web UI + API）+ 自托管 Agent |
| **配置格式** | YAML（`pipeline.yml`）+ 动态生成 |
| **官网** | [buildkite.com](https://buildkite.com) |

**一句话描述**：混合式 CI/CD 平台，将 SaaS 的便捷管理与自托管 Agent 的安全/性能优势结合，适合对构建环境有特殊要求的团队。

**核心特点**：

- SaaS 管理流水线定义，Agent 在任意位置运行（本地、AWS、K8s）
- 动态流水线生成（用代码在运行时生成步骤）
- 并行构建和弹性伸缩
- 高级测试拆分和重试策略
- 大量企业级客户（Shopify、Canva 等）

**适用场景**：

- 需要自定义构建硬件（GPU、大型内存）的团队
- 安全要求严格，代码不可离开内网
- 超大规模测试套件需要弹性并行执行

```yaml
# .buildkite/pipeline.yml
steps:
  - label: ':npm: Install'
    command: 'npm ci'
    plugins:
      - docker#v5.9.0:
          image: 'node:20-alpine'

  - label: ':jest: Test'
    command: 'npm run test'
    parallelism: 4
    plugins:
      - docker#v5.9.0:
          image: 'node:20-alpine'
```

---

## 8. Argo CD

| 属性 | 详情 |
|------|------|
| **名称** | Argo CD |
| **Stars** | ⭐ 18,000+ |
| **托管方式** | 自托管（Kubernetes 原生） |
| **配置格式** | Kubernetes CRD + YAML |
| **GitHub** | [argoproj/argo-cd](https://github.com/argoproj/argo-cd) |
| **官网** | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io) |

**一句话描述**：Kubernetes 原生的声明式持续交付工具，遵循 GitOps 理念，将应用状态与 Git 仓库中的配置保持同步。

**核心特点**：

- GitOps 工作流：Git 是唯一的真实来源（Single Source of Truth）
- 自动或手动同步 K8s 资源
- 多集群管理
- 丰富的 UI 展示应用拓扑和同步状态
- 支持 Helm、Kustomize、Jsonnet 等配置管理工具

**适用场景**：

- 运行在 Kubernetes 上的 JS/TS 服务（Node.js API、Next.js SSR）
- 需要声明式、可审计的部署流程
- 多环境（dev/staging/prod）多集群管理

```yaml
# Application CRD
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nodejs-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    targetRevision: HEAD
    path: apps/nodejs-api/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## 9. 统一对比矩阵

| 维度 | GitHub Actions | GitLab CI | CircleCI | Travis CI | Jenkins | Drone | Buildkite | Argo CD |
|------|:------------:|:---------:|:--------:|:---------:|:-------:|:-----:|:---------:|:-------:|
| **托管方式** | SaaS / 自托管 | SaaS / 自托管 | SaaS / 自托管 | SaaS | 自托管 | 自托管 | 混合 | 自托管 |
| **配置复杂度** | 低 | 中 | 低 | 低 | 高 | 低 | 低 | 高 |
| **开源免费额度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Docker 支持** | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ✅ | N/A (K8s) |
| **并行构建** | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ✅ |
| **缓存能力** | ✅ | ✅ | ⭐⭐⭐⭐⭐ (DLC) | ✅ | ✅ | ✅ | ✅ | N/A |
| **Secrets 管理** | 原生 | 原生 | 原生 | 原生 | 插件 | 原生 | 原生 | 原生 (K8s) |
| **SSH 调试** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **自托管 Agent** | ✅ | ✅ | ✅ | ❌ | N/A | N/A | ✅ | N/A |
| **与 GitHub 集成** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **社区生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 10. JS/TS 项目 CI/CD 最佳实践

### 10.1 通用流水线模板

```yaml
# 推荐的分阶段流水线结构
stages:
  - install       # 依赖安装 + 缓存
  - lint          # 代码风格与类型检查
  - test          # 单元测试 + 覆盖率
  - build         # 应用构建
  - security      # 依赖安全扫描
  - deploy        # 部署（条件触发）
```

### 10.2 缓存策略

| 缓存目标 | 路径 | 关键（Cache Key） |
|----------|------|-----------------|
| npm 依赖 | `node_modules/` / `.npm/` | `package-lock.json` hash |
| Turbo/Nx 构建缓存 | `.turbo/` / `.nx/cache/` | `turbo.json` + 源码 hash |
| Vite/Webpack 缓存 | `node_modules/.vite/` / `.cache/` | 配置 + 源码 hash |
| Cypress/Playwright 二进制 | `~/.cache/Cypress/` | 固定版本号 |

### 10.3 安全扫描集成

```yaml
# GitHub Actions 示例
- name: Audit dependencies
  run: npm audit --audit-level=moderate

- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 10.4 选型决策树

```
代码托管在哪里？
├── GitHub
│   ├── 开源项目 / 免费额度优先 → GitHub Actions
│   ├── 需要 Docker Layer Caching → CircleCI
│   └── 需要复杂审批流程 → Jenkins / Buildkite
├── GitLab
│   └── GitLab CI（一体化优势）
└── 自托管 Git（Gitea/Gogs）
    └── Drone CI

是否需要部署到 Kubernetes？
├── 是 → 引入 Argo CD 做 GitOps 部署
└── 否 → 纯 CI 工具 + 平台部署（Vercel/AWS 等）

构建环境是否特殊（GPU/内网/定制 OS）？
├── 是 → Buildkite / Jenkins 自托管 Agent
└── 否 → SaaS 方案（GitHub Actions / CircleCI）
```

### 相关决策树与对比矩阵

- CI/CD 流水线选型决策树
- [CI/CD 工具对比矩阵](../comparison-matrices/ci-cd-tools-compare.md)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：CI/CD 领域变化迅速，建议关注各平台官方博客获取最新功能与定价变化。
