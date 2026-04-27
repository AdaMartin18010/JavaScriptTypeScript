---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# CI/CD 工具对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | GitHub Actions | GitLab CI | CircleCI | Travis CI | Jenkins | Drone CI | Buildkite |
|------|----------------|-----------|----------|-----------|---------|----------|-----------|
| **GitHub Stars** | 官方产品 | 官方产品 | - | 9k | 23k | 26k | 1.5k |
| **流行度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **托管方式** | 🔵 SaaS + 自托管 Runner | 🔵 SaaS + 自托管 Runner | 🔵 SaaS + 自托管 | 🔵 SaaS | 🟢 自托管 (SaaS 有限) | 🟢 自托管 + SaaS | 🟢 自托管 Agent + SaaS 编排 |
| **配置方式** | 🔵 YAML (`.github/workflows`) | 🔵 YAML (`.gitlab-ci.yml`) | 🔵 YAML | 🔵 YAML (legacy `.travis.yml`) | 🔴 Groovy (Jenkinsfile) | 🔵 YAML (`.drone.yml`) | 🔵 YAML + UI |
| **并行作业** | 🟢 高 (矩阵 + 并发) | 🟢 高 | 🟢 极高 | 🟡 有限 | 🟢 高 (依赖节点) | 🟢 高 | 🟢 极高 |
| **缓存策略** | 🟢 `actions/cache` | 🟢 `cache` 关键字 | 🟢 多层缓存 | 🟡 基础 | 🟢 插件丰富 | 🟢 原生 | 🟢 原生 |
| **容器集成** | 🟢 原生 (`runs-on` + 容器) | 🟢 原生 (`image`) | 🟢 原生 (Docker 层) | 🟡 有限 | 🟢 Docker Plugin/Agent | 🟢 原生 (每步容器) | 🟢 原生 |
| **Matrix 构建** | 🟢 `strategy.matrix` | 🟢 `parallel:matrix` | 🟢 Workflows + Matrix | 🟡 有限 | 🟢 插件 | 🟡 有限 | 🟢 原生 |
| **审批流程** | 🟢 环境保护规则 | 🟢 环境审批 | 🟢 手动 Gate | 🟡 有限 | 🟢 插件 | 🔵 需配置 | 🟢 原生 Block Step |
| **成本** | 🟢 免费额度高 | 🟢 免费额度高 | 🟡 中等 | 🟢 开源免费 (SaaS 有限) | 🟢 自托管免费 | 🟢 开源免费 | 🟡 按 Agent 计费 |
| **TS/JS 生态集成度** | 🟢 最深 (Actions Marketplace) | 🟢 深 | 🟢 深 | 🟡 一般 | 🟡 插件 | 🟡 基础 | 🟡 基础 |

## 详细分析

### GitHub Actions

```bash
# 无需安装，直接在仓库中创建工作流文件
mkdir -p .github/workflows
```

- **定位**: 与 GitHub 深度集成的 CI/CD 和自动化平台
- **核心原理**: 事件驱动 (Event-driven) 的 YAML 工作流 + 可复用 Actions
- **优势**:
  - **与 GitHub 生态无缝集成** (PR、Issues、Releases、Packages)
  - **Actions Marketplace** 极其丰富（2万+ 公开 Actions）
  - 矩阵构建、并发、缓存成熟
  - 自托管 Runner 支持企业私有部署
  - `workflow_call` 实现工作流复用
  - `reusable workflows` + `composite actions` 组合灵活
- **劣势**:
  - 复杂工作流 YAML 可读性下降
  - 自托管 Runner 的自动扩缩容需额外配置
  - 某些高级安全功能需企业版
- **适用场景**: 托管在 GitHub 的项目、需要丰富生态集成的自动化

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
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

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Production
        run: echo "Deploying..."
```

```yaml
# .github/workflows/release.yml — Reusable workflow 调用示例
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    uses: ./.github/workflows/_reusable-build.yml
    with:
      environment: production
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml (已存在于 GitLab 仓库中)
```

- **定位**: GitLab 内置的完整 DevOps 平台
- **核心原理**: 基于 YAML 的流水线 (Pipeline) + Runner 执行
- **优势**:
  - **一体化 DevOps**：代码、CI/CD、Issue、Registry、监控统一
  - `needs` 关键字实现 DAG (有向无环图) 并行
  - 内置 Container Registry、Package Registry
  - 环境 (Environment) 和部署面板强大
  - 安全扫描 (SAST/DAST/依赖扫描) 内置
  - `rules` 条件语法灵活
- **劣势**:
  - 自托管 GitLab 运维成本高
  - 生态插件不如 GitHub Actions 丰富
  - 复杂流水线的调试体验一般
- **适用场景**: 使用 GitLab 的团队、需要一体化 DevOps 平台的企业

```yaml
# .gitlab-ci.yml
stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NPM_CONFIG_CACHE: '${CI_PROJECT_DIR}/.npm'
  CYPRESS_CACHE_FOLDER: '${CI_PROJECT_DIR}/cache/Cypress'

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .npm/
    - node_modules/
    - cache/Cypress/

install:
  stage: install
  image: node:22-alpine
  script:
    - npm ci --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

lint:
  stage: lint
  image: node:22-alpine
  needs: [install]
  script:
    - npm run lint

test:
  stage: test
  image: node:22-alpine
  needs: [install]
  parallel:
    matrix:
      - TEST_SUITE: [unit, integration, e2e]
  script:
    - npm run test:${TEST_SUITE}
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:22-alpine
  needs: [lint, test]
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy_production:
  stage: deploy
  image: alpine
  needs: [build]
  environment:
    name: production
    url: https://example.com
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - echo "Deploy to production"
```

### CircleCI

```yaml
# .circleci/config.yml
```

- **定位**: 专注于速度和可靠性的 CI/CD 平台
- **核心原理**: 配置文件驱动 + Docker 层缓存 + 资源类 (Resource Class)
- **优势**:
  - **Docker 层缓存 (DLC)** 极大加速容器构建
  - **并行化能力极强**（Workflows + Matrix）
  - 资源类选择灵活（CPU/内存）
  - `circleci tests split` 智能测试分片
  - 配置验证 CLI 体验好
  - 与云服务商集成成熟
- **劣势**:
  - 免费额度较少（开源项目除外）
  - 自托管 Runner (CircleCI Runner) 相对新
  - 生态不如 GitHub Actions 开放
- **适用场景**: 需要快速并行构建、Docker 密集的团队

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@6.1
  codecov: codecov/codecov@4.0

jobs:
  test:
    docker:
      - image: cimg/node:22.0
    parallelism: 4
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
          cache-key: 'package-lock.json'
      - run:
          name: Run tests with split
          command: |
            circleci tests glob "src/**/*.test.ts" | \
            circleci tests split --split-by=timings | \
            xargs npx vitest --reporter=junit
      - codecov/upload
      - store_test_results:
          path: ./junit.xml

  build:
    docker:
      - image: cimg/node:22.0
    steps:
      - checkout
      - node/install-packages
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist

  deploy:
    docker:
      - image: cimg/node:22.0
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Deploy
          command: npm run deploy

workflows:
  ci-cd:
    jobs:
      - test
      - build:
          requires: [test]
      - deploy:
          requires: [build]
          filters:
            branches:
              only: main
```

### Travis CI

```yaml
# .travis.yml
```

- **定位**: 早期的云端 CI 先驱，现被 Idera 收购
- **核心原理**: 基于 `.travis.yml` 的配置，与 GitHub 集成
- **优势**:
  - 配置简单，历史文档丰富
  - 对开源项目免费支持历史长
  - 多语言支持成熟
- **劣势**:
  - **市场份额持续下降**
  - 免费额度大幅缩减
  - 产品更新速度慢
  - 企业级功能较弱
- **适用场景**: 维护遗留项目、对 Travis 有历史依赖的项目

```yaml
# .travis.yml
language: node_js
node_js:
  - '18'
  - '20'
  - '22'

cache:
  directories:
    - node_modules

install:
  - npm ci

script:
  - npm run lint
  - npm run test
  - npm run build

deploy:
  provider: npm
  email: $NPM_EMAIL
  api_key: $NPM_TOKEN
  on:
    tags: true
```

### Jenkins

```bash
# 通过 Docker 启动 Jenkins
docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts
```

- **定位**: 最成熟的开源自动化服务器，插件生态极其丰富
- **核心原理**: 主从 (Master-Agent) 架构 + Groovy 流水线 + 插件扩展
- **优势**:
  - **完全自托管**，数据完全可控
  - **插件生态最丰富**（1800+ 插件）
  - Blue Ocean 界面现代化
  - 与任何 Git 托管平台集成
  - 声明式流水线 (Declarative Pipeline) 简化配置
  - 适合复杂的企业级发布流程
- **劣势**:
  - **运维成本高**（升级、备份、安全补丁）
  - Groovy 学习曲线陡峭
  - UI 传统（Blue Ocean 弥补部分）
  - 插件兼容性维护负担
- **适用场景**: 严格安全合规要求、完全自托管、复杂发布流程的企业

```groovy
// Jenkinsfile (声明式流水线)
pipeline {
    agent any

    tools {
        nodejs '22.0.0'
    }

    environment {
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            parallel {
                stage('Unit') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                stage('Integration') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh 'npm run deploy'
            }
        }
    }

    post {
        always {
            junit 'reports/**/*.xml'
            cleanWs()
        }
    }
}
```

### Drone CI

```bash
# Docker Compose 部署 Drone
docker-compose up -d
```

- **定位**: 云原生、容器优先的持续交付平台
- **核心原理**: 每一步在独立 Docker 容器中执行 + 声明式 YAML
- **优势**:
  - **纯容器化**，隔离性极佳
  - 配置极简，与 Docker 生态无缝
  - 自托管免费开源
  - 支持多流水线 (Multi-pipeline)
  - 插件即容器，扩展简单
- **劣势**:
  - 社区规模较小
  - 企业支持不如商业产品
  - 某些高级功能需企业版
- **适用场景**: 容器化团队、追求极简自托管 CI/CD

```yaml
# .drone.yml
kind: pipeline
type: docker
name: test-and-build

steps:
  - name: install
    image: node:22-alpine
    commands:
      - npm ci

  - name: lint
    image: node:22-alpine
    commands:
      - npm run lint
    depends_on: [install]

  - name: test
    image: node:22-alpine
    commands:
      - npm run test
    depends_on: [install]

  - name: build
    image: node:22-alpine
    commands:
      - npm run build
    depends_on: [lint, test]

  - name: docker-publish
    image: plugins/docker
    settings:
      repo: myapp
      tags: latest
      username:
        from_secret: docker_username
      password:
        from_secret: docker_password
    depends_on: [build]
    when:
      branch: main
      event: push
```

### Buildkite

```bash
# 安装 Agent
brew install buildkite/buildkite/buildkite-agent
```

- **定位**: 混合模型 CI/CD：SaaS 编排 + 自托管 Agent
- **核心原理**: Buildkite 云端管理流水线，实际构建在用户的 Agent 上执行
- **优势**:
  - **混合安全模型**：敏感代码不出私有网络
  - Agent 可部署在任何地方（本地、云、K8s）
  - **Block Step** 人工审批体验优秀
  - 并行能力极强，可动态扩展 Agent
  - 动态流水线生成 (Dynamic Pipelines)
- **劣势**:
  - 需要维护自托管 Agent
  - 按 Agent/用户计费，成本需规划
  - 开源生态较小
- **适用场景**: 安全敏感企业、需要混合云/本地构建的团队

```yaml
# .buildkite/pipeline.yml
steps:
  - label: ':npm: Install'
    command: npm ci
    plugins:
      - docker#v5.9.0:
          image: 'node:22-alpine'

  - wait

  - label: ':eslint: Lint'
    command: npm run lint
    plugins:
      - docker#v5.9.0:
          image: 'node:22-alpine'

  - label: ':jest: Test'
    command: npm run test
    parallelism: 5
    plugins:
      - docker#v5.9.0:
          image: 'node:22-alpine'

  - block: ':rocket: Deploy to Production?'
    prompt: '确认部署到生产环境吗？'
    fields:
      - text: '部署备注'
        key: 'deploy-note'

  - label: ':shipit: Deploy'
    command: scripts/deploy.sh
    branches: 'main'
    concurrency: 1
    concurrency_group: 'deploy'
```

```bash
# 动态流水线示例
cat .buildkite/pipeline.yml | buildkite-agent pipeline upload
```

## 性能对比

| 指标 | GitHub Actions | GitLab CI | CircleCI | Travis CI | Jenkins | Drone CI | Buildkite |
|------|----------------|-----------|----------|-----------|---------|----------|-----------|
| **流水线启动延迟** | ⚡ <10s | ⚡ <10s | ⚡ <5s | 🐢 30s+ | 🚀 中 | 🚀 中 | ⚡ <10s |
| **并发作业能力** | 🟢 高 (企业) | 🟢 高 | 🟢 极高 | 🟡 有限 | 🟢 高 (节点) | 🟢 高 | 🟢 极高 |
| **缓存速度** | 🟢 快 | 🟢 快 | 🟢 极快 (DLC) | 🟡 一般 | 🟢 依赖存储 | 🟢 快 | 🟢 快 |
| **YAML 可读性** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ (Groovy) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **自托管维护成本** | ⭐ 低 (Runner) | ⭐ 低 (Runner) | ⭐ 低 | ⭐ 低 | ⭐⭐⭐⭐ 高 | ⭐⭐ 中 | ⭐⭐ 中 (Agent) |

## 功能对比

| 功能 | GitHub Actions | GitLab CI | CircleCI | Travis CI | Jenkins | Drone CI | Buildkite |
|------|----------------|-----------|----------|-----------|---------|----------|-----------|
| **Reusable Config** | ✅ 复用工作流/Composite | ✅ Include/Extends | ✅ Orbs | ❌ | ✅ Shared Libraries | ❌ | ❌ |
| **容器执行** | ✅ 原生 | ✅ 原生 | ✅ 原生 | 🟡 有限 | ✅ Docker Agent | ✅ 每步容器 | ✅ 插件 |
| **Matrix 构建** | ✅ 强大 | ✅ 强大 | ✅ 强大 | 🟡 有限 | ✅ 插件 | 🟡 有限 | ✅ 原生 |
| **Artifacts** | ✅ 90天 | ✅ 可配置 | ✅ 30天 | 🟡 有限 | ✅ 插件 | ✅ 原生 | ✅ 原生 |
| **Secrets 管理** | ✅ 环境/仓库/组织级 | ✅ CI/CD Variables | ✅ Contexts | ✅ 仓库级 | ✅ Credentials Plugin | ✅ Secrets | ✅ 原生 |
| **审批/Gate** | ✅ Environment Protection | ✅ Environment | ✅ Manual Gate | ❌ | ✅ Input Step | 🔵 有限 | ✅ Block Step |
| **自托管** | ✅ Runner | ✅ Runner | ✅ Runner | ❌ | ✅ 原生 | ✅ 原生 | ✅ Agent |
| **测试分片** | 🔵 需手动 | 🔵 需手动 | ✅ 原生 Split | ❌ | 🔵 需插件 | ❌ | 🔵 需手动 |
| **安全扫描** | 🔵 需集成 | ✅ 原生 SAST/DAST | 🔵 需集成 | ❌ | 🔵 插件 | ❌ | 🔵 需集成 |
| **Pipeline as Code** | ✅ YAML | ✅ YAML | ✅ YAML | ✅ YAML | ✅ Groovy | ✅ YAML | ✅ YAML |

## 选型建议

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| GitHub 托管项目 | GitHub Actions | 原生集成，生态最丰富 |
| GitLab 托管项目 | GitLab CI | 一体化 DevOps 体验 |
| 需要最快并行构建 | CircleCI | 并行化和 Docker 缓存最强 |
| 严格安全/自托管 | Jenkins / Buildkite | 完全可控或混合模型 |
| 容器优先团队 | Drone CI / GitLab CI | 纯容器执行 |
| 复杂审批流程 | Buildkite / Jenkins | Block Step / Input Step |
| 开源项目低预算 | GitHub Actions / Travis CI | 免费额度高 |
| 企业级一体化 | GitLab Ultimate / GitHub Enterprise | 安全扫描 + 合规 |
| 遗留项目维护 | Travis CI / Jenkins | 最小迁移成本 |
| 混合云/本地构建 | Buildkite | Agent 灵活部署 |

## 组合方案

```yaml
# 推荐的 Node.js/TS 项目 CI/CD 配置 (GitHub Actions)

# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    if: github.event_name == 'push'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: npm run deploy:staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: npm run deploy:production
```

| 层级 | 工具 | 用途 |
|------|------|------|
| 代码托管 | GitHub / GitLab | 源码与 Issue 管理 |
| CI/CD | GitHub Actions / GitLab CI | 构建、测试、部署 |
| 包管理 | npm / GitHub Packages | 依赖与制品 |
| 部署目标 | Vercel / Render / K8s | 运行时环境 |
