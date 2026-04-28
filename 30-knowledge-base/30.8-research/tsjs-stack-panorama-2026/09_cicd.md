---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# CI/CD 持续集成与持续部署完全指南

> 本文档全面梳理JavaScript/TypeScript项目的CI/CD工作流，涵盖核心概念、工具链、设计模式、部署策略及高级主题。

---

## 目录

- [CI/CD 持续集成与持续部署完全指南](#cicd-持续集成与持续部署完全指南)
  - [目录](#目录)
  - [1. CI/CD基础](#1-cicd基础)
    - [1.1 持续集成原则](#11-持续集成原则)
      - [1.1.1 快速反馈原则](#111-快速反馈原则)
      - [1.1.2 自动化测试原则](#112-自动化测试原则)
    - [1.2 持续交付 vs 持续部署](#12-持续交付-vs-持续部署)
    - [1.3 CI/CD成熟度模型](#13-cicd成熟度模型)
    - [1.4 DevOps文化](#14-devops文化)
  - [2. 工具链深度](#2-工具链深度)
    - [2.1 GitHub Actions](#21-github-actions)
      - [2.1.1 Workflow语法](#211-workflow语法)
      - [2.1.2 复用工作流](#212-复用工作流)
    - [2.2 GitLab CI](#22-gitlab-ci)
      - [2.2.1 Pipeline配置](#221-pipeline配置)
      - [2.2.2 Runner与缓存策略](#222-runner与缓存策略)
    - [2.3 Jenkins](#23-jenkins)
      - [2.3.1 Pipeline DSL](#231-pipeline-dsl)
      - [2.3.2 Blue Ocean可视化](#232-blue-ocean可视化)
    - [2.4 其他CI/CD工具](#24-其他cicd工具)
      - [2.4.1 CircleCI](#241-circleci)
      - [2.4.2 Azure DevOps](#242-azure-devops)
  - [3. 工作流设计模式](#3-工作流设计模式)
    - [3.1 构建流程](#31-构建流程)
      - [3.1.1 依赖安装优化](#311-依赖安装优化)
      - [3.1.2 编译与打包](#312-编译与打包)
    - [3.2 测试策略](#32-测试策略)
      - [3.2.1 测试分层架构](#321-测试分层架构)
      - [3.2.2 测试并行化策略](#322-测试并行化策略)
    - [3.3 代码质量门禁](#33-代码质量门禁)
      - [3.3.1 Lint与类型检查](#331-lint与类型检查)
      - [3.3.2 安全扫描](#332-安全扫描)
    - [3.4 制品管理](#34-制品管理)
      - [3.4.1 版本控制策略](#341-版本控制策略)
      - [3.4.2 Artifact存储策略](#342-artifact存储策略)
  - [4. 部署策略](#4-部署策略)
    - [4.1 蓝绿部署（Blue-Green Deployment）](#41-蓝绿部署blue-green-deployment)
      - [4.1.1 定义与原理](#411-定义与原理)
    - [4.2 金丝雀发布（Canary Release）](#42-金丝雀发布canary-release)
      - [4.2.1 定义与原理](#421-定义与原理)
    - [4.3 滚动更新（Rolling Update）](#43-滚动更新rolling-update)
      - [4.3.1 定义与原理](#431-定义与原理)
    - [4.4 功能开关（Feature Flags）](#44-功能开关feature-flags)
      - [4.4.1 定义与原理](#441-定义与原理)
  - [5. 高级主题](#5-高级主题)
    - [5.1 环境管理](#51-环境管理)
      - [5.1.1 多环境配置策略](#511-多环境配置策略)
      - [5.1.2 环境配置管理](#512-环境配置管理)
    - [5.2 密钥管理](#52-密钥管理)
      - [5.2.1 密钥管理最佳实践](#521-密钥管理最佳实践)
      - [5.2.2 密钥扫描与防护](#522-密钥扫描与防护)
    - [5.3 审批流程](#53-审批流程)
      - [5.3.1 人工审批配置](#531-人工审批配置)
      - [5.3.2 自动化门控](#532-自动化门控)
    - [5.4 监控和回滚](#54-监控和回滚)
      - [5.4.1 部署监控](#541-部署监控)
      - [5.4.2 自动回滚策略](#542-自动回滚策略)
  - [6. 最佳实践总结](#6-最佳实践总结)
    - [6.1 CI/CD黄金法则](#61-cicd黄金法则)
    - [6.2 反模式清单](#62-反模式清单)
    - [6.3 工具选型建议](#63-工具选型建议)
  - [附录](#附录)
    - [A. 常用CI/CD配置速查](#a-常用cicd配置速查)

---

## 1. CI/CD基础

### 1.1 持续集成原则

#### 1.1.1 快速反馈原则

**定义**：开发人员提交代码后，应在最短时间内获得构建和测试结果的反馈，理想时间不超过10分钟。

**核心要素**：

- **即时触发**：代码提交后立即启动构建流程
- **并行执行**：测试任务并行化以缩短总耗时
- **分层测试**：快速单元测试优先，慢速集成测试延后
- **失败即停**：早期发现问题，避免资源浪费

**正确配置示例**（GitHub Actions）：

```yaml
name: Fast Feedback CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quick-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run lint
        run: npm run lint
      - name: Run type check
        run: npm run type-check
      - name: Run unit tests
        run: npm run test:unit -- --coverage

  integration-tests:
    runs-on: ubuntu-latest
    needs: quick-check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run integration tests
        run: npm run test:integration
```

**反例（错误配置）**：

```yaml
# 错误：所有测试串行执行
jobs:
  test:
    steps:
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run build
```

**形式化论证**：

设总构建时间为 T，并行作业数为 n，串行作业数为 m

```
T_并行 = max(t1, t2, ..., tn) + sum(ti) for i=1 to m
T_串行 = sum(ti) for i=1 to n+m
```

当 t_unit = 2min, t_integration = 10min, t_e2e = 15min 时：

- 串行总时间：2 + 10 + 15 = 27 分钟
- 并行优化后：max(2) + 10 + 15 = 27 分钟（但快速反馈仅需2分钟）

**结论**：分层并行策略可将关键反馈时间从27分钟降至2分钟，提升13.5倍。

---

#### 1.1.2 自动化测试原则

**定义**：所有测试必须自动化执行，无需人工干预，覆盖单元测试、集成测试和端到端测试三个层次。

**测试金字塔**：

```
        /\
       /  \
      / E2E \      <- 少量（10%）
     /--------\
    / Integration \  <- 中等（30%）
   /----------------\
  /   Unit Tests     \ <- 大量（60%）
 /----------------------\
```

**正确配置示例**：

```yaml
name: Automated Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - name: Unit Tests with Coverage
        run: npm run test:unit -- --coverage --coverageThreshold=80

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

**反例（错误配置）**：

```yaml
# 错误：缺少测试分层
jobs:
  test:
    steps:
      - run: npm ci
      - run: npm test  # 未指定测试类型
```

**形式化论证**：

设缺陷发现成本为 C，发现阶段为 s：Cs = C0 * k^s，其中 k ≈ 10

| 阶段 | 成本倍数 |
|------|----------|
| 单元测试 | 1x |
| 集成测试 | 10x |
| 生产环境 | 100x+ |

---

### 1.2 持续交付 vs 持续部署

| 维度 | 持续集成 (CI) | 持续交付 (CD) | 持续部署 (CD) |
|------|--------------|--------------|--------------|
| **定义** | 频繁合并代码到主干 | 代码随时可部署到生产 | 代码自动部署到生产 |
| **人工干预** | 无 | 发布决策需人工 | 完全自动化 |
| **发布频率** | 每次提交 | 按需（通常每日） | 每次提交 |
| **风险等级** | 低 | 中 | 高（需完善防护） |

---

### 1.3 CI/CD成熟度模型

| 级别 | 名称 | 特征 |
|------|------|------|
| Level 1 | 初始级 | 手动构建，无自动化测试 |
| Level 2 | 可重复级 | 自动化构建，基础单元测试 |
| Level 3 | 定义级 | 完整CI流程，代码质量门禁 |
| Level 4 | 量化管理级 | 持续交付，环境一致性 |
| Level 5 | 优化级 | 持续部署，A/B测试，自动回滚 |

---

### 1.4 DevOps文化

**CALMS框架**：

- **C**ulture（文化）：协作、共享责任
- **A**utomation（自动化）：消除重复性工作
- **L**ean（精益）：减少浪费，持续改进
- **M**easurement（度量）：数据驱动决策
- **S**haring（共享）：知识共享，透明沟通

---

## 2. 工具链深度

### 2.1 GitHub Actions

#### 2.1.1 Workflow语法

**核心概念**：

- **Workflow**：完整的CI/CD流程定义
- **Job**：并行或串行执行的任务单元
- **Step**：Job内的执行步骤
- **Action**：可复用的任务单元

**完整配置示例**：

```yaml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io

jobs:
  # 代码质量检查
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

      - name: Check code formatting
        run: npx prettier --check "src/**/*.{ts,tsx}"

  # 测试
  test:
    runs-on: ubuntu-latest
    needs: quality
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - name: Run tests with coverage
        run: npm run test:unit -- --coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # 构建
  build:
    runs-on: ubuntu-latest
    needs: [quality, test]
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Generate version
        id: version
        run: |
          VERSION=$(date +%Y%m%d)-$(git rev-parse --short HEAD)
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 部署
  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: ${{ github.event.inputs.environment || 'staging' }}
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - name: Deploy to environment
        id: deploy
        run: |
          echo "Deploying version ${{ needs.build.outputs.version }}"
          echo "url=https://app.example.com" >> $GITHUB_OUTPUT
```

---

#### 2.1.2 复用工作流

**可复用工作流定义**（`.github/workflows/reusable-test.yml`）：

```yaml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      test-command:
        required: false
        type: string
        default: 'npm test'
    outputs:
      coverage:
        description: "Test coverage percentage"
        value: ${{ jobs.test.outputs.coverage }}

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.coverage.outputs.percent }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - name: Run tests
        run: ${{ inputs.test-command }}
      - name: Extract coverage
        id: coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct')
          echo "percent=$COVERAGE" >> $GITHUB_OUTPUT
```

**调用复用工作流**：

```yaml
name: Main Workflow

on: [push]

jobs:
  test-node-18:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      test-command: 'npm run test:unit'

  test-node-20:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
      test-command: 'npm run test:unit'

  deploy:
    needs: [test-node-18, test-node-20]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Coverage 18.x ${{ needs.test-node-18.outputs.coverage }}%"
      - run: echo "Coverage 20.x ${{ needs.test-node-20.outputs.coverage }}%"
```

---

### 2.2 GitLab CI

#### 2.2.1 Pipeline配置

```yaml
# .gitlab-ci.yml
stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  NPM_CONFIG_CACHE: "$CI_PROJECT_DIR/.npm"
  CYPRESS_CACHE_FOLDER: "$CI_PROJECT_DIR/cache/Cypress"

# 缓存配置
cache:
  key:
    files:
      - package-lock.json
  paths:
    - .npm/
    - node_modules/
    - cache/Cypress/

# 安装依赖
install:
  stage: install
  image: node:${NODE_VERSION}
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# 代码检查
lint:
  stage: lint
  image: node:${NODE_VERSION}
  needs: [install]
  script:
    - npm run lint
    - npm run type-check
    - npm run format:check

# 单元测试
unit-test:
  stage: test
  image: node:${NODE_VERSION}
  needs: [install]
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  script:
    - npm run test:unit -- --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: junit.xml
    paths:
      - coverage/

# 集成测试
integration-test:
  stage: test
  image: node:${NODE_VERSION}
  needs: [install]
  services:
    - name: postgres:15
      alias: postgres
    - name: redis:7
      alias: redis
  variables:
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://postgres:test@postgres/test
    REDIS_URL: redis://redis:6379
  script:
    - npm run db:migrate
    - npm run test:integration

# E2E测试
e2e-test:
  stage: test
  image: cypress/browsers:node-20.9.0-chrome-118
  needs: [install]
  parallel:
    matrix:
      - BROWSER: [chrome, firefox]
  script:
    - npm run test:e2e -- --browser ${BROWSER}
  artifacts:
    when: always
    paths:
      - cypress/screenshots/
      - cypress/videos/
    expire_in: 3 days

# 构建
build:
  stage: build
  image: node:${NODE_VERSION}
  needs: [lint, unit-test]
  script:
    - npm run build
    - echo "VERSION=$CI_COMMIT_SHA" > .env
  artifacts:
    paths:
      - dist/
      - .env
    expire_in: 1 week

# 构建Docker镜像
docker-build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  needs: [build]
  variables:
    DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

# 部署到Staging
deploy-staging:
  stage: deploy
  image: alpine/k8s:1.28.2
  environment:
    name: staging
    url: https://staging.example.com
  needs: [docker-build]
  script:
    - kubectl config use-context staging
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/app
  only:
    - develop

# 部署到生产
deploy-production:
  stage: deploy
  image: alpine/k8s:1.28.2
  environment:
    name: production
    url: https://app.example.com
  needs: [docker-build]
  when: manual
  allow_failure: false
  script:
    - kubectl config use-context production
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/app
  only:
    - main
```

---

#### 2.2.2 Runner与缓存策略

**Runner类型**：

- **Shared Runner**：GitLab提供的共享执行器
- **Group Runner**：组织级别的专用执行器
- **Specific Runner**：项目专用的私有执行器

**缓存策略对比**：

| 策略 | 适用场景 | 配置示例 |
|------|----------|----------|
| 全局缓存 | 所有Job共享依赖 | `cache: { paths: [node_modules/] }` |
| Job级缓存 | 特定Job的缓存 | 在Job内定义cache |
| 依赖传递 | 跨Job传递产物 | `artifacts` + `needs` |
| 增量缓存 | 大型依赖加速 | `cache:key:files` |

---

### 2.3 Jenkins

#### 2.3.1 Pipeline DSL

**Declarative Pipeline**：

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        REGISTRY = 'docker.io'
        IMAGE_NAME = 'myapp'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.VERSION = "${BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'Node-20') {
                    sh 'npm ci'
                }
            }
        }

        stage('Parallel Quality Checks') {
            parallel {
                stage('Lint') {
                    steps {
                        nodejs(nodeJSInstallationName: 'Node-20') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Type Check') {
                    steps {
                        nodejs(nodeJSInstallationName: 'Node-20') {
                            sh 'npm run type-check'
                        }
                    }
                }
                stage('Security Audit') {
                    steps {
                        nodejs(nodeJSInstallationName: 'Node-20') {
                            sh 'npm audit --audit-level=moderate'
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName: 'Node-20') {
                    sh 'npm run test:unit -- --coverage'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                    junit 'junit.xml'
                }
            }
        }

        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: 'Node-20') {
                    sh 'npm run build'
                }
                script {
                    docker.build("${env.REGISTRY}/${env.IMAGE_NAME}:${env.VERSION}")
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    docker.withRegistry("https://${env.REGISTRY}", 'registry-credentials') {
                        docker.image("${env.REGISTRY}/${env.IMAGE_NAME}:${env.VERSION}").push()
                    }
                }
                sh '''
                    kubectl config use-context staging
                    kubectl set image deployment/app app=${REGISTRY}/${IMAGE_NAME}:${VERSION}
                '''
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to Production?'
                ok 'Deploy'
                parameters {
                    choice(
                        name: 'DEPLOY_STRATEGY',
                        choices: ['canary', 'blue-green', 'rolling'],
                        description: 'Deployment strategy'
                    )
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${env.REGISTRY}", 'registry-credentials') {
                        docker.image("${env.REGISTRY}/${env.IMAGE_NAME}:${env.VERSION}").push('latest')
                    }
                }
                sh """
                    kubectl config use-context production
                    ./scripts/deploy-${params.DEPLOY_STRATEGY}.sh ${VERSION}
                """
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                color: 'good',
                message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

---

#### 2.3.2 Blue Ocean可视化

Blue Ocean是Jenkins的现代UI，提供：

- **Pipeline可视化**：直观的流程图展示
- **分支管理**：多分支Pipeline的清晰展示
- **实时日志**：执行中的实时日志流
- **并行展示**：并行阶段的清晰可视化

---

### 2.4 其他CI/CD工具

#### 2.4.1 CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5
  docker: circleci/docker@2

executors:
  node-executor:
    docker:
      - image: cimg/node:20.0

workflows:
  build-test-deploy:
    jobs:
      - install
      - lint:
          requires: [install]
      - test:
          requires: [install]
          matrix:
            parameters:
              node-version: ["18.0", "20.0"]
      - build:
          requires: [lint, test]
      - deploy:
          requires: [build]
          filters:
            branches:
              only: main

jobs:
  install:
    executor: node-executor
    steps:
      - checkout
      - node/install-packages
      - persist_to_workspace:
          root: .
          paths: [node_modules]

  lint:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run lint
      - run: npm run type-check

  test:
    parameters:
      node-version:
        type: string
    docker:
      - image: cimg/node:<< parameters.node-version >>
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run test:unit -- --coverage
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage

  build:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run build
      - docker/build:
          image: myapp
          tag: $CIRCLE_SHA1

  deploy:
    executor: node-executor
    steps:
      - run: echo "Deploying to production..."
```

---

#### 2.4.2 Azure DevOps

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '20.x'
  npm_config_cache: $(Pipeline.Workspace)/.npm

stages:
- stage: Build
  jobs:
  - job: BuildAndTest
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
      displayName: 'Install Node.js'

    - task: Cache@2
      inputs:
        key: 'npm | "$(Agent.OS)" | package-lock.json'
        restoreKeys: |
          npm | "$(Agent.OS)"
        path: $(npm_config_cache)
      displayName: 'Cache npm'

    - script: npm ci
      displayName: 'Install dependencies'

    - script: |
        npm run lint
        npm run type-check
      displayName: 'Code quality checks'

    - script: npm run test:unit -- --coverage
      displayName: 'Run unit tests'

    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: '**/junit.xml'
        mergeTestResults: true

    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: '**/coverage/cobertura-coverage.xml'

    - script: npm run build
      displayName: 'Build application'

    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: 'dist'
        ArtifactName: 'drop'

- stage: DeployStaging
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
  jobs:
  - deployment: DeployToStaging
    environment: 'staging'
    strategy:
      runOnce:
        deploy:
          steps:
          - download: current
            artifact: drop
          - script: echo "Deploying to staging..."

- stage: DeployProduction
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployToProduction
    environment: 'production'
    strategy:
      canary:
        increments: [10, 50, 100]
        preDeploy:
          steps:
          - script: echo "Pre-deployment checks..."
        deploy:
          steps:
          - script: echo "Deploying canary..."
        on:
          failure:
            steps:
            - script: echo "Rolling back..."
```

---

## 3. 工作流设计模式

### 3.1 构建流程

#### 3.1.1 依赖安装优化

**定义**：高效的依赖安装是CI/CD流程的基础，需要平衡安装速度和可靠性。

**核心策略**：

- **锁定文件**：使用package-lock.json确保版本一致性
- **缓存机制**：缓存node_modules减少重复安装
- **离线安装**：优先使用缓存的依赖包

**正确配置示例**：

```yaml
name: Optimized Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 缓存策略：基于package-lock.json的哈希
      - name: Cache dependencies
        uses: actions/cache@v3
        id: npm-cache
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-npm-

      # 条件安装：仅当缓存未命中时执行
      - name: Install dependencies
        if: steps.npm-cache.outputs.cache-hit != 'true'
        run: npm ci --prefer-offline --no-audit

      - name: Build application
        run: npm run build
```

**反例（错误配置）**：

```yaml
# 错误：无缓存，每次都重新安装
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - run: npm install  # 使用install而非ci
      - run: npm run build
```

**形式化论证**：

设依赖安装时间为 T_install，缓存命中率为 H

```
T_平均 = H * T_cache + (1 - H) * T_install
```

| 缓存命中率 | 平均安装时间 | 加速比 |
|-----------|-------------|--------|
| 0% | 120s | 1x |
| 50% | 65s | 1.8x |
| 90% | 18s | 6.7x |
| 99% | 4s | 30x |

---

#### 3.1.2 编译与打包

**TypeScript项目构建流程**：

```yaml
name: TypeScript Build Pipeline

on:
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # TypeScript编译
      - name: Compile TypeScript
        run: npx tsc --noEmit --project tsconfig.json

      # 构建应用
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      # 验证构建产物
      - name: Verify build output
        run: |
          if [ ! -d "dist" ]; then
            echo "Build output directory 'dist' not found!"
            exit 1
          fi
          if [ ! -f "dist/index.js" ]; then
            echo "Main entry point not found!"
            exit 1
          fi
          echo "Build verification passed!"

      # 分析包大小
      - name: Analyze bundle size
        run: |
          du -sh dist/
          find dist -type f -exec ls -lh {} \; | awk '{ print $NF ": " $5 }'

      # 上传构建产物
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output-${{ github.sha }}
          path: |
            dist/
            package.json
            package-lock.json
          retention-days: 7

  # Docker镜像构建
  docker-build:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output-${{ github.sha }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### 3.2 测试策略

#### 3.2.1 测试分层架构

```
+---------------------+
|   E2E Tests         |  <- 用户旅程验证
|   (5-10% 覆盖率)    |
+---------------------+
|   Integration Tests |  <- 组件交互验证
|   (20-30% 覆盖率)   |
+---------------------+
|   Unit Tests        |  <- 函数/类级别验证
|   (60-70% 覆盖率)   |
+---------------------+
```

**完整测试Pipeline**：

```yaml
name: Comprehensive Test Strategy

on: [push, pull_request]

jobs:
  # ========== 单元测试 ==========
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage --coverageThreshold=80

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: unit-tests-node-${{ matrix.node-version }}

  # ========== 集成测试 ==========
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Setup test database
        run: |
          npm run db:migrate
          npm run db:seed
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
          MONGODB_URI: mongodb://localhost:27017/test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
          MONGODB_URI: mongodb://localhost:27017/test

  # ========== E2E测试 ==========
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      # Playwright安装
      - name: Install Playwright
        run: npx playwright install --with-deps

      # 构建应用
      - name: Build application
        run: npm run build

      # 启动应用并运行E2E测试
      - name: Run E2E tests
        run: |
          npm run start &
          npx wait-on http://localhost:3000
          npm run test:e2e

      # 上传测试报告
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  # ========== 契约测试 ==========
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Run Pact contract tests
        run: npm run test:contract

      - name: Publish Pact contracts
        run: npm run pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  # ========== 性能测试 ==========
  performance-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/load-test.js
```

---

#### 3.2.2 测试并行化策略

```yaml
name: Parallel Test Execution

on: [push]

jobs:
  # 分片并行测试
  test-shard:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Run tests for shard ${{ matrix.shard }}/4
        run: npm run test:unit -- --shard=${{ matrix.shard }}/4

  # 合并测试结果
  test-results:
    needs: test-shard
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          pattern: test-results-*
          merge-multiple: true

      - name: Merge coverage reports
        run: npx nyc merge coverage/ coverage/merged-coverage.json

      - name: Upload merged coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/merged-coverage.json
```

---

### 3.3 代码质量门禁

#### 3.3.1 Lint与类型检查

```yaml
name: Code Quality Gates

on:
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # ESLint检查
      - name: ESLint
        run: npm run lint

      # Prettier格式检查
      - name: Prettier check
        run: npx prettier --check "src/**/*.{ts,tsx,js,jsx}"

      # TypeScript类型检查
      - name: TypeScript check
        run: npx tsc --noEmit --pretty

      # 仅检查修改的文件
      - name: Lint changed files
        run: |
          CHANGED_FILES=$(git diff --name-only --diff-filter=ACM origin/main...HEAD | grep -E '\.(ts|tsx|js|jsx)$' || true)
          if [ -n "$CHANGED_FILES" ]; then
            echo "$CHANGED_FILES" | xargs npx eslint
          fi

      # 代码复杂度检查
      - name: Complexity check
        run: |
          npx complexity-report src/ --max-complexity 10 --max-lines 300

      # 重复代码检测
      - name: Duplicate code detection
        run: npx jscpd --threshold 5 src/

      # 提交信息规范检查
      - name: Commit message lint
        uses: wagoid/commitlint-github-action@v5
        with:
          configFile: .commitlintrc.json
```

---

#### 3.3.2 安全扫描

```yaml
name: Security Scanning

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # 每周一运行

jobs:
  # 依赖漏洞扫描
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # 代码安全扫描
  code-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  # 密钥泄露检测
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Secret detection
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified

  # 容器镜像扫描
  container-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

### 3.4 制品管理

#### 3.4.1 版本控制策略

**语义化版本（SemVer）**：

```
MAJOR.MINOR.PATCH
1.2.3
|   |   |
|   |   +-- 补丁版本：bug修复
|   +------ 次要版本：新功能，向后兼容
+---------- 主要版本：破坏性变更
```

**自动版本管理**：

```yaml
name: Semantic Versioning

on:
  push:
    branches: [main]

jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Determine version bump
        id: version
        run: |
          # 分析提交信息确定版本类型
          COMMIT_MSG=$(git log -1 --pretty=%B)

          if echo "$COMMIT_MSG" | grep -q "BREAKING CHANGE"; then
            VERSION_TYPE="major"
          elif echo "$COMMIT_MSG" | grep -q "^feat"; then
            VERSION_TYPE="minor"
          else
            VERSION_TYPE="patch"
          fi

          # 获取当前版本并递增
          CURRENT_VERSION=$(node -p "require('./package.json').version")

          # 使用semver计算新版本
          NEW_VERSION=$(npx semver $CURRENT_VERSION -i $VERSION_TYPE)

          echo "version=$NEW_VERSION" >> $GITHUB_OUTPUT
          echo "type=$VERSION_TYPE" >> $GITHUB_OUTPUT

      - name: Update package.json
        run: |
          npm version ${{ steps.version.outputs.version }} --no-git-tag-version
          git add package.json package-lock.json
          git commit -m "chore(release): ${{ steps.version.outputs.version }}"
          git tag v${{ steps.version.outputs.version }}
          git push && git push --tags

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          generate_release_notes: true
```

---

#### 3.4.2 Artifact存储策略

```yaml
name: Artifact Management

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      # 创建版本化的制品
      - name: Create artifact bundle
        run: |
          mkdir -p artifacts
          tar -czf artifacts/app-${{ github.sha }}.tar.gz dist/
          echo "${{ github.sha }}" > artifacts/version.txt
          date -u +"%Y-%m-%dT%H:%M:%SZ" > artifacts/build-time.txt

      # 上传到GitHub Artifacts
      - name: Upload to GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: app-${{ github.sha }}
          path: artifacts/
          retention-days: 30

  # 上传到外部存储
  publish-artifacts:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: app-${{ github.sha }}

      # 上传到S3
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - run: |
          aws s3 cp app-${{ github.sha }}.tar.gz \
            s3://my-artifacts-bucket/builds/${{ github.sha }}/

          # 创建latest符号链接
          aws s3 cp app-${{ github.sha }}.tar.gz \
            s3://my-artifacts-bucket/builds/latest/ --copy-props none

      # 上传到Nexus/Artifactory
      - name: Upload to Nexus
        run: |
          curl -u ${{ secrets.NEXUS_USER }}:${{ secrets.NEXUS_PASS }} \
            --upload-file app-${{ github.sha }}.tar.gz \
            "https://nexus.example.com/repository/builds/"
```

---

## 4. 部署策略

### 4.1 蓝绿部署（Blue-Green Deployment）

#### 4.1.1 定义与原理

**定义**：蓝绿部署是一种零停机部署策略，通过维护两个完全相同的生产环境（蓝色和绿色），实现瞬时切换和快速回滚。

**工作流程**：

```
阶段1: 蓝色环境运行，绿色环境空闲
[Users] --> [Load Balancer] --> [Blue Environment (v1.0)]
                                  [Green Environment (idle)]

阶段2: 部署新版本到绿色环境
[Users] --> [Load Balancer] --> [Blue Environment (v1.0)]
                                  [Green Environment (v2.0)]

阶段3: 切换流量到绿色环境
[Users] --> [Load Balancer] --> [Green Environment (v2.0)]
                                  [Blue Environment (v1.0)]

阶段4: 保留蓝色环境用于回滚
```

**正确配置示例**（Kubernetes）：

```yaml
# blue-green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
  labels:
    app: myapp
    version: blue
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
        - containerPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
  labels:
    app: myapp
    version: green
spec:
  replicas: 0  # 初始为0
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: app
        image: myapp:v2.0
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
    version: blue  # 初始指向blue
  ports:
  - port: 80
    targetPort: 8080
```

**GitHub Actions实现**：

```yaml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

env:
  KUBE_NAMESPACE: production
  APP_NAME: myapp

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name my-cluster

      # 确定当前活跃环境
      - name: Determine active environment
        id: active-env
        run: |
          CURRENT_VERSION=$(kubectl get service ${{ env.APP_NAME }}-service -n ${{ env.KUBE_NAMESPACE }} -o jsonpath='{.spec.selector.version}')
          if [ "$CURRENT_VERSION" = "blue" ]; then
            echo "active=blue" >> $GITHUB_OUTPUT
            echo "inactive=green" >> $GITHUB_OUTPUT
          else
            echo "active=green" >> $GITHUB_OUTPUT
            echo "inactive=blue" >> $GITHUB_OUTPUT
          fi

      # 部署到非活跃环境
      - name: Deploy to inactive environment
        run: |
          INACTIVE=${{ steps.active-env.outputs.inactive }}

          # 更新镜像
          kubectl set image deployment/${{ env.APP_NAME }}-$INACTIVE \
            app=${{ env.APP_NAME }}:${{ github.sha }} \
            -n ${{ env.KUBE_NAMESPACE }}

          # 扩容非活跃环境
          kubectl scale deployment/${{ env.APP_NAME }}-$INACTIVE \
            --replicas=3 -n ${{ env.KUBE_NAMESPACE }}

          # 等待部署完成
          kubectl rollout status deployment/${{ env.APP_NAME }}-$INACTIVE \
            -n ${{ env.KUBE_NAMESPACE }} --timeout=300s

      # 健康检查
      - name: Health check
        run: |
          INACTIVE=${{ steps.active-env.outputs.inactive }}

          # 获取Pod IP进行健康检查
          POD_IP=$(kubectl get pods -n ${{ env.KUBE_NAMESPACE }} \
            -l app=${{ env.APP_NAME }},version=$INACTIVE \
            -o jsonpath='{.items[0].status.podIP}')

          # 执行健康检查
          kubectl run health-check --rm -i --restart=Never \
            --image=curlimages/curl:latest \
            -- curl -f http://$POD_IP:8080/health || exit 1

      # 切换流量
      - name: Switch traffic
        run: |
          INACTIVE=${{ steps.active-env.outputs.inactive }}

          # 更新Service选择器
          kubectl patch service ${{ env.APP_NAME }}-service \
            -n ${{ env.KUBE_NAMESPACE }} \
            -p '{"spec":{"selector":{"version":"'$INACTIVE'"}}}'

      # 缩容旧环境（保留用于回滚）
      - name: Scale down old environment
        run: |
          ACTIVE=${{ steps.active-env.outputs.active }}
          kubectl scale deployment/${{ env.APP_NAME }}-$ACTIVE \
            --replicas=0 -n ${{ env.KUBE_NAMESPACE }}

      # 通知
      - name: Notify deployment
        run: |
          echo "Blue-green deployment completed successfully!"
          echo "New version: ${{ github.sha }}"
          echo "Active environment: ${{ steps.active-env.outputs.inactive }}"
```

**反例（错误配置）**：

```yaml
# 错误：直接修改现有Deployment，无回滚能力
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:v2.0  # 直接覆盖，无法快速回滚
```

**形式化论证**：

设部署风险为 R，回滚时间为 T_rollback

```
R_蓝绿 = P_failure * T_detection * Impact
T_rollback_蓝绿 ≈ 0 (瞬时切换)

R_传统 = P_failure * T_detection * Impact
T_rollback_传统 = T_redeploy + T_warmup (数分钟到数小时)
```

| 指标 | 传统部署 | 蓝绿部署 |
|------|---------|---------|
| 停机时间 | 数分钟 | 0 |
| 回滚时间 | 数分钟 | 数秒 |
| 资源需求 | 1x | 2x |
| 风险暴露窗口 | 长 | 极短 |

---

### 4.2 金丝雀发布（Canary Release）

#### 4.2.1 定义与原理

**定义**：金丝雀发布是一种渐进式部署策略，先将新版本部署给一小部分用户，验证无误后逐步扩大范围。

**工作流程**：

```
阶段1: 5% 流量到新版本
[Users] --> [Load Balancer] --> [v1.0: 95%]
                              --> [v2.0: 5%]

阶段2: 25% 流量到新版本
[Users] --> [Load Balancer] --> [v1.0: 75%]
                              --> [v2.0: 25%]

阶段3: 100% 流量到新版本
[Users] --> [Load Balancer] --> [v2.0: 100%]
```

**Kubernetes实现**（使用Istio）：

```yaml
# canary-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-v1
spec:
  replicas: 9
  selector:
    matchLabels:
      app: myapp
      version: v1
  template:
    metadata:
      labels:
        app: myapp
        version: v1
    spec:
      containers:
      - name: app
        image: myapp:v1.0
        ports:
        - containerPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-v2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      version: v2
  template:
    metadata:
      labels:
        app: myapp
        version: v2
    spec:
      containers:
      - name: app
        image: myapp:v2.0
        ports:
        - containerPort: 8080
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
  - myapp.example.com
  http:
  - route:
    - destination:
        host: myapp
        subset: v1
      weight: 95
    - destination:
        host: myapp
        subset: v2
      weight: 5
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: myapp
spec:
  host: myapp
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

**GitHub Actions实现**：

```yaml
name: Canary Deployment

on:
  push:
    branches: [main]

env:
  KUBE_NAMESPACE: production
  APP_NAME: myapp

jobs:
  canary-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name my-cluster

      # 部署金丝雀版本（5%流量）
      - name: Deploy canary (5%)
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: ${{ env.APP_NAME }}-canary
            namespace: ${{ env.KUBE_NAMESPACE }}
          spec:
            replicas: 1
            selector:
              matchLabels:
                app: ${{ env.APP_NAME }}
                track: canary
            template:
              metadata:
                labels:
                  app: ${{ env.APP_NAME }}
                  track: canary
              spec:
                containers:
                - name: app
                  image: ${{ env.APP_NAME }}:${{ github.sha }}
                  ports:
                  - containerPort: 8080
          EOF

      # 配置流量分割（5%金丝雀）
      - name: Configure traffic split (5%)
        run: |
          kubectl patch service ${{ env.APP_NAME }} \
            -n ${{ env.KUBE_NAMESPACE }} \
            --type='json' \
            -p='[{"op": "add", "path": "/spec/trafficPolicy", "value": {"canary": {"weight": 5}}}]'

      # 监控金丝雀指标
      - name: Monitor canary metrics
        run: |
          sleep 300  # 等待5分钟收集指标

          # 检查错误率
          ERROR_RATE=$(kubectl exec -n monitoring deploy/prometheus \
            -- curl -s 'http://prometheus:9090/api/v1/query?query=rate(http_requests_total{track="canary",status=~"5.."}[5m])' \
            | jq -r '.data.result[0].value[1] // "0"')

          echo "Canary error rate: $ERROR_RATE"

          # 如果错误率超过阈值，回滚
          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate too high! Rolling back..."
            kubectl delete deployment ${{ env.APP_NAME }}-canary -n ${{ env.KUBE_NAMESPACE }}
            exit 1
          fi

      # 逐步增加流量：25%
      - name: Increase traffic to 25%
        run: |
          kubectl scale deployment/${{ env.APP_NAME }}-canary \
            --replicas=3 -n ${{ env.KUBE_NAMESPACE }}

          kubectl patch service ${{ env.APP_NAME }} \
            -n ${{ env.KUBE_NAMESPACE }} \
            --type='json' \
            -p='[{"op": "replace", "path": "/spec/trafficPolicy/canary/weight", "value": 25}]'

      - name: Monitor canary metrics (25%)
        run: sleep 300 && echo "Monitoring..."

      # 逐步增加流量：50%
      - name: Increase traffic to 50%
        run: |
          kubectl scale deployment/${{ env.APP_NAME }}-canary \
            --replicas=5 -n ${{ env.KUBE_NAMESPACE }}

          kubectl patch service ${{ env.APP_NAME }} \
            -n ${{ env.KUBE_NAMESPACE }} \
            --type='json' \
            -p='[{"op": "replace", "path": "/spec/trafficPolicy/canary/weight", "value": 50}]'

      - name: Monitor canary metrics (50%)
        run: sleep 300 && echo "Monitoring..."

      # 全量发布
      - name: Full rollout
        run: |
          # 更新主Deployment
          kubectl set image deployment/${{ env.APP_NAME }}-stable \
            app=${{ env.APP_NAME }}:${{ github.sha }} \
            -n ${{ env.KUBE_NAMESPACE }}

          kubectl rollout status deployment/${{ env.APP_NAME }}-stable \
            -n ${{ env.KUBE_NAMESPACE }}

          # 移除金丝雀
          kubectl delete deployment ${{ env.APP_NAME }}-canary \
            -n ${{ env.KUBE_NAMESPACE }}

          # 重置流量分割
          kubectl patch service ${{ env.APP_NAME }} \
            -n ${{ env.KUBE_NAMESPACE }} \
            --type='json' \
            -p='[{"op": "remove", "path": "/spec/trafficPolicy"}]'

      - name: Notify success
        run: |
          echo "Canary deployment completed successfully!"
```

**形式化论证**：

设新版本缺陷率为 p，用户数为 N，金丝雀比例为 w

```
受影响用户数 = N * w * p

当 p = 0.1 (10%有缺陷), N = 1,000,000 时：
- 直接全量发布：受影响用户 = 1,000,000 * 0.1 = 100,000
- 5%金丝雀：受影响用户 = 1,000,000 * 0.05 * 0.1 = 5,000
- 风险降低：100,000 / 5,000 = 20倍
```

---

### 4.3 滚动更新（Rolling Update）

#### 4.3.1 定义与原理

**定义**：滚动更新是一种渐进式替换Pod的部署策略，逐个更新实例，保持应用始终可用。

**Kubernetes配置**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # 最多超出25%的Pod
      maxUnavailable: 25%  # 最多25%的Pod不可用
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:v2.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

**GitHub Actions实现**：

```yaml
name: Rolling Update Deployment

on:
  push:
    branches: [main]

jobs:
  rolling-update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name my-cluster

      # 执行滚动更新
      - name: Perform rolling update
        run: |
          kubectl set image deployment/myapp \
            app=myapp:${{ github.sha }} \
            --record

      # 监控滚动更新进度
      - name: Monitor rollout
        run: |
          kubectl rollout status deployment/myapp --timeout=600s

      # 验证更新成功
      - name: Verify rollout
        run: |
          # 检查所有Pod是否运行新版本
          PODS=$(kubectl get pods -l app=myapp -o jsonpath='{.items[*].spec.containers[0].image}')

          for pod in $PODS; do
            if [[ "$pod" != "myapp:${{ github.sha }}" ]]; then
              echo "Pod not updated: $pod"
              exit 1
            fi
          done

          echo "All pods updated successfully!"

      # 回滚能力检查
      - name: Check rollback capability
        run: |
          # 查看修订历史
          kubectl rollout history deployment/myapp

          # 保存当前修订号
          CURRENT_REVISION=$(kubectl rollout history deployment/myapp | tail -1 | awk '{print $1}')
          echo "Current revision: $CURRENT_REVISION"

      # 失败时自动回滚
      - name: Rollback on failure
        if: failure()
        run: |
          echo "Deployment failed! Rolling back..."
          kubectl rollout undo deployment/myapp
          kubectl rollout status deployment/myapp
```

**形式化论证**：

设副本数为 R，maxUnavailable 为 U，maxSurge 为 S

```
更新过程中的可用Pod数范围：[R - U, R + S]

当 R = 10, U = 25%, S = 25% 时：
- 最小可用Pod = 10 - 2.5 = 7.5 -> 8
- 最大Pod数 = 10 + 2.5 = 12.5 -> 13
- 容量变化：从100%到80%再到100%
```

---

### 4.4 功能开关（Feature Flags）

#### 4.4.1 定义与原理

**定义**：功能开关是一种在运行时控制功能启用/禁用的机制，允许代码部署与功能发布解耦。

**架构图**：

```
[Application] --> [Feature Flag SDK] --> [Feature Flag Service]
                                              |
                    [Config] [User Segments] [Metrics]
```

**LaunchDarkly集成示例**：

```yaml
name: Feature Flag Deployment

on:
  push:
    branches: [main]

jobs:
  deploy-with-feature-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # 构建（包含所有功能，但默认关闭）
      - name: Build with feature flags
        run: npm run build
        env:
          LD_SDK_KEY: ${{ secrets.LD_SDK_KEY }}

      # 部署（功能默认关闭）
      - name: Deploy
        run: |
          kubectl set image deployment/myapp app=myapp:${{ github.sha }}
          kubectl rollout status deployment/myapp

      # 逐步启用功能
      - name: Enable feature for internal users
        run: |
          curl -X PATCH \
            https://app.launchdarkly.com/api/v2/flags/default/new-feature \
            -H "Authorization: ${{ secrets.LD_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "environments": {
                "production": {
                  "rules": [
                    {
                      "clauses": [
                        {
                          "attribute": "email",
                          "op": "endsWith",
                          "values": ["@company.com"]
                        }
                      ],
                      "variation": 0
                    }
                  ]
                }
              }
            }'

      - name: Monitor internal rollout
        run: |
          sleep 1800  # 监控30分钟

          # 检查错误率
          ERROR_RATE=$(curl -s "https://api.datadog.com/metrics?query=error_rate" | jq -r '.data[0]')

          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate too high! Disabling feature..."

            # 关闭功能开关
            curl -X PATCH \
              https://app.launchdarkly.com/api/v2/flags/default/new-feature \
              -H "Authorization: ${{ secrets.LD_API_KEY }}" \
              -d '{"environments":{"production":{"on":false}}}'

            exit 1
          fi

      - name: Enable feature for 10% of users
        run: |
          curl -X PATCH \
            https://app.launchdarkly.com/api/v2/flags/default/new-feature \
            -H "Authorization: ${{ secrets.LD_API_KEY }}" \
            -d '{
              "environments": {
                "production": {
                  "fallthrough": {
                    "rollout": {
                      "variations": [
                        {"variation": 0, "weight": 10000},
                        {"variation": 1, "weight": 90000}
                      ]
                    }
                  }
                }
              }
            }'

      - name: Monitor 10% rollout
        run: sleep 3600  # 监控1小时

      - name: Full feature enable
        run: |
          curl -X PATCH \
            https://app.launchdarkly.com/api/v2/flags/default/new-feature \
            -H "Authorization: ${{ secrets.LD_API_KEY }}" \
            -d '{"environments":{"production":{"on":true,"fallthrough":{"variation":0}}}}'
```

**代码中的功能开关使用**：

```typescript
// features.ts
import { LDClient } from 'launchdarkly-node-server-sdk';

const ldClient = LDClient.init(process.env.LD_SDK_KEY!);

export async function isFeatureEnabled(
  featureKey: string,
  user: { key: string; email: string }
): Promise<boolean> {
  return await ldClient.variation(featureKey, user, false);
}

// 使用示例
app.get('/api/new-feature', async (req, res) => {
  const user = { key: req.user.id, email: req.user.email };

  if (await isFeatureEnabled('new-feature', user)) {
    // 新功能逻辑
    return res.json({ feature: 'new', data: await getNewData() });
  }

  // 旧功能逻辑
  return res.json({ feature: 'legacy', data: await getLegacyData() });
});
```

**形式化论证**：

设部署频率为 F_deploy，发布频率为 F_release

```
传统方式：F_deploy = F_release（耦合）
功能开关：F_deploy >> F_release（解耦）

收益：
- 部署风险降低：代码已验证，功能可控
- 回滚时间：从数分钟降至数秒（切换开关）
- A/B测试能力：可精确控制用户分组
```

---

## 5. 高级主题

### 5.1 环境管理

#### 5.1.1 多环境配置策略

**环境层级**：

```
开发环境 (Development)
    |
    v
测试环境 (Testing/QA)
    |
    v
预发布环境 (Staging)
    |
    v
生产环境 (Production)
```

**GitHub Actions多环境部署**：

```yaml
name: Multi-Environment Deployment

on:
  push:
    branches:
      - develop
      - main
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  # 确定目标环境
  determine-environment:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.set-env.outputs.environment }}
    steps:
      - name: Set environment
        id: set-env
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "environment=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
          else
            echo "environment=development" >> $GITHUB_OUTPUT
          fi

  # 构建阶段
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

  # 部署到开发环境
  deploy-development:
    needs: [determine-environment, build]
    if: needs.determine-environment.outputs.environment == 'development'
    runs-on: ubuntu-latest
    environment:
      name: development
      url: https://dev.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to Development
        run: |
          echo "Deploying to Development..."
          # 开发环境部署脚本

  # 部署到测试环境
  deploy-testing:
    needs: [determine-environment, build]
    if: needs.determine-environment.outputs.environment == 'testing'
    runs-on: ubuntu-latest
    environment:
      name: testing
      url: https://qa.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to Testing
        run: |
          echo "Deploying to Testing..."
          # 测试环境部署脚本

  # 部署到预发布环境
  deploy-staging:
    needs: [determine-environment, build]
    if: needs.determine-environment.outputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to Staging
        run: |
          echo "Deploying to Staging..."
          # 预发布环境部署脚本

  # 部署到生产环境
  deploy-production:
    needs: [determine-environment, build]
    if: needs.determine-environment.outputs.environment == 'production'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to Production
        run: |
          echo "Deploying to Production..."
          # 生产环境部署脚本
```

---

#### 5.1.2 环境配置管理

**配置分离策略**：

```yaml
# config/development.yaml
app:
  name: myapp-dev
  port: 3000
database:
  host: localhost
  port: 5432
  name: myapp_dev
redis:
  host: localhost
  port: 6379
logging:
  level: debug

---
# config/production.yaml
app:
  name: myapp
  port: 8080
database:
  host: ${DB_HOST}
  port: 5432
  name: myapp_prod
  ssl: true
redis:
  host: ${REDIS_HOST}
  port: 6379
  password: ${REDIS_PASSWORD}
logging:
  level: warn
  format: json
```

**环境变量注入**：

```yaml
name: Environment Configuration

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      # 从GitHub Secrets加载配置
      - name: Load environment configuration
        run: |
          cat > .env.production <<EOF
          NODE_ENV=production
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          REDIS_URL=${{ secrets.REDIS_URL }}
          API_KEY=${{ secrets.API_KEY }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          EOF

      # 使用AWS Parameter Store
      - name: Load from AWS Parameter Store
        run: |
          aws ssm get-parameter \
            --name "/myapp/production/database_url" \
            --with-decryption \
            --query 'Parameter.Value' \
            --output text > .env.aws

      # 使用HashiCorp Vault
      - name: Load from Vault
        uses: hashicorp/vault-action@v2
        with:
          url: https://vault.example.com
          method: approle
          roleId: ${{ secrets.VAULT_ROLE_ID }}
          secretId: ${{ secrets.VAULT_SECRET_ID }}
          secrets: |
            secret/data/myapp/production database_url | DATABASE_URL
            secret/data/myapp/production api_key | API_KEY

      # 创建Kubernetes ConfigMap
      - name: Create ConfigMap
        run: |
          kubectl create configmap app-config \
            --from-env-file=.env.production \
            --dry-run=client -o yaml | kubectl apply -f -

      # 创建Kubernetes Secret
      - name: Create Secret
        run: |
          kubectl create secret generic app-secrets \
            --from-env-file=.env.production \
            --dry-run=client -o yaml | kubectl apply -f -
```

---

### 5.2 密钥管理

#### 5.2.1 密钥管理最佳实践

**密钥层级**：

| 层级 | 存储位置 | 使用场景 |
|------|----------|----------|
| 静态密钥 | GitHub Secrets / GitLab Variables | CI/CD流程 |
| 运行时密钥 | Kubernetes Secrets / Vault | 应用运行 |
| 动态密钥 | Vault / AWS IAM | 临时访问 |
| 客户端密钥 | 环境变量 / 配置文件 | 本地开发 |

**密钥轮换策略**：

```yaml
name: Secret Rotation

on:
  schedule:
    - cron: '0 0 1 * *'  # 每月1号

jobs:
  rotate-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Rotate database credentials
        run: |
          # 生成新密码
          NEW_PASSWORD=$(openssl rand -base64 32)

          # 更新数据库密码
          psql -c "ALTER USER app_user WITH PASSWORD '$NEW_PASSWORD';"

          # 更新Kubernetes Secret
          kubectl patch secret db-credentials \
            --type='json' \
            -p='[{"op": "replace", "path": "/data/password", "value":"'$(echo -n $NEW_PASSWORD | base64)'"}]'

          # 更新GitHub Secret
          gh secret set DATABASE_PASSWORD --body "$NEW_PASSWORD"

      - name: Rotate API keys
        run: |
          # 生成新API Key
          NEW_API_KEY=$(uuidgen)

          # 更新API Gateway
          aws apigateway update-api-key \
            --api-key ${{ secrets.API_KEY_ID }} \
            --patch-operations op=replace,path=/value,value=$NEW_API_KEY

          # 更新GitHub Secret
          gh secret set API_KEY --body "$NEW_API_KEY"
```

---

#### 5.2.2 密钥扫描与防护

```yaml
name: Secret Scanning

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 预提交密钥扫描
  pre-commit-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Secret detection with TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified

      - name: Secret detection with GitLeaks
        uses: zricethezav/gitleaks-action@master
        with:
          config-path: .gitleaks.toml

      - name: Custom secret patterns
        run: |
          # 检查常见密钥模式
          patterns=(
            'AKIA[0-9A-Z]{16}'  # AWS Access Key
            'ghp_[a-zA-Z0-9]{36}'  # GitHub Token
            'sk-[a-zA-Z0-9]{48}'   # OpenAI Key
            'private_key.*BEGIN'
          )

          for pattern in "${patterns[@]}"; do
            if git log --all --source --remotes --pretty=format:%H | \
               xargs -I {} git grep -E "$pattern" {} 2>/dev/null; then
              echo "Potential secret found: $pattern"
              exit 1
            fi
          done

  # 依赖中的密钥扫描
  dependency-secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan dependencies for secrets
        run: |
          npm audit --audit-level=moderate

          # 检查node_modules中的敏感文件
          find node_modules -name "*.key" -o -name "*.pem" -o -name ".env" 2>/dev/null | \
          while read file; do
            echo "Warning: Sensitive file found in dependency: $file"
          done
```

---

### 5.3 审批流程

#### 5.3.1 人工审批配置

**GitHub Actions环境审批**：

```yaml
name: Deployment with Approval

on:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  # 预发布环境（自动部署）
  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - run: echo "Deploying to staging..."

  # 生产环境（需要审批）
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying version ${{ github.sha }} to production"
          # 生产部署脚本

  # 带审批输入的生产部署
  deploy-production-with-input:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Request deployment approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ secrets.GITHUB_TOKEN }}
          approvers: user1,user2,team-devops
          minimum-approvals: 2
          issue-title: "Deploy ${{ github.sha }} to Production"
          issue-body: |
            Please review and approve the deployment.

            **Changes:**
            ${{ github.event.head_commit.message }}

            **Test Results:**
            - Unit Tests: Passed
            - Integration Tests: Passed
            - Security Scan: Passed

      - name: Deploy to production
        run: echo "Deploying to production..."
```

**GitLab CI审批**：

```yaml
stages:
  - build
  - test
  - deploy

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  environment:
    name: production
    url: https://app.example.com
    on_stop: stop_production
  when: manual
  only:
    - main
  allow_failure: false

stop_production:
  stage: deploy
  script:
    - echo "Stopping production deployment..."
  environment:
    name: production
    action: stop
  when: manual
```

---

#### 5.3.2 自动化门控

```yaml
name: Automated Quality Gates

on: [push]

jobs:
  # 代码质量门控
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Code coverage gate
        run: |
          npm run test:unit -- --coverage
          COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct')

          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Code coverage $COVERAGE% is below threshold 80%"
            exit 1
          fi
          echo "Code coverage gate passed: $COVERAGE%"

      - name: Complexity gate
        run: |
          npx complexity-report src/ --format json > complexity.json
          MAX_COMPLEXITY=$(cat complexity.json | jq -r '.maxComplexity')

          if (( $(echo "$MAX_COMPLEXITY > 10" | bc -l) )); then
            echo "Max complexity $MAX_COMPLEXITY exceeds threshold 10"
            exit 1
          fi

      - name: Security gate
        run: |
          npm audit --audit-level=moderate
          if [ $? -ne 0 ]; then
            echo "Security vulnerabilities found!"
            exit 1
          fi

  # 性能门控
  performance-gate:
    runs-on: ubuntu-latest
    needs: quality-gate
    steps:
      - uses: actions/checkout@v4

      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun

          # 检查性能分数
          PERFORMANCE=$(cat lhci/manifest.json | jq -r '.[0].summary.performance')
          if (( $(echo "$PERFORMANCE < 0.9" | bc -l) )); then
            echo "Performance score $PERFORMANCE is below threshold 0.9"
            exit 1
          fi

      - name: Bundle size gate
        run: |
          npm run build
          BUNDLE_SIZE=$(du -sb dist/ | cut -f1)
          MAX_SIZE=5242880  # 5MB

          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "Bundle size $BUNDLE_SIZE bytes exceeds limit $MAX_SIZE bytes"
            exit 1
          fi

  # 部署门控
  deployment-gate:
    runs-on: ubuntu-latest
    needs: [quality-gate, performance-gate]
    steps:
      - name: Check deployment windows
        run: |
          HOUR=$(date +%H)
          DAY=$(date +%u)

          # 禁止周五下午3点后部署
          if [ $DAY -eq 5 ] && [ $HOUR -ge 15 ]; then
            echo "Deployments not allowed after 3 PM on Fridays"
            exit 1
          fi

          # 禁止周末部署
          if [ $DAY -ge 6 ]; then
            echo "Deployments not allowed on weekends"
            exit 1
          fi

      - name: Check required reviews
        run: |
          REVIEWS=$(gh pr view ${{ github.event.pull_request.number }} \
            --json reviews --jq '.reviews | map(select(.state == "APPROVED")) | length')

          if [ $REVIEWS -lt 2 ]; then
            echo "At least 2 approvals required"
            exit 1
          fi
```

---

### 5.4 监控和回滚

#### 5.4.1 部署监控

```yaml
name: Deployment with Monitoring

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy application
        run: |
          kubectl set image deployment/myapp app=myapp:${{ github.sha }}
          kubectl rollout status deployment/myapp

      - name: Monitor deployment metrics
        timeout-minutes: 10
        run: |
          START_TIME=$(date +%s)

          while true; do
            CURRENT_TIME=$(date +%s)
            ELAPSED=$((CURRENT_TIME - START_TIME))

            # 获取错误率
            ERROR_RATE=$(curl -s "https://prometheus/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[1m])" | \
              jq -r '.data.result[0].value[1] // "0"')

            # 获取延迟
            LATENCY=$(curl -s "https://prometheus/api/v1/query?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket[1m]))" | \
              jq -r '.data.result[0].value[1] // "0"')

            # 获取CPU使用率
            CPU_USAGE=$(kubectl top pods -l app=myapp --no-headers | awk '{sum+=$2} END {print sum/NR}')

            echo "Time: ${ELAPSED}s | Error Rate: $ERROR_RATE | P95 Latency: ${LATENCY}s | CPU: ${CPU_USAGE}%"

            # 检查是否超过阈值
            if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
              echo "Error rate exceeded threshold!"
              echo "ROLLBACK_NEEDED=true" >> $GITHUB_ENV
              exit 1
            fi

            if (( $(echo "$LATENCY > 1.0" | bc -l) )); then
              echo "Latency exceeded threshold!"
              echo "ROLLBACK_NEEDED=true" >> $GITHUB_ENV
              exit 1
            fi

            # 监控5分钟后退出
            if [ $ELAPSED -ge 300 ]; then
              echo "Monitoring completed successfully"
              break
            fi

            sleep 10
          done

      - name: Rollback on failure
        if: failure() && env.ROLLBACK_NEEDED == 'true'
        run: |
          echo "Rolling back deployment..."
          kubectl rollout undo deployment/myapp
          kubectl rollout status deployment/myapp

          # 发送告警
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{
              "text": "Deployment rolled back due to metric threshold breach",
              "commit": "${{ github.sha }}",
              "author": "${{ github.actor }}"
            }'
```

---

#### 5.4.2 自动回滚策略

```yaml
name: Smart Rollback

on:
  deployment_status:

jobs:
  auto-rollback:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'failure'
    steps:
      - name: Get deployment info
        run: |
          DEPLOYMENT_ID=${{ github.event.deployment.id }}
          ENVIRONMENT=${{ github.event.deployment.environment }}

          echo "Deployment $DEPLOYMENT_ID to $ENVIRONMENT failed"

      - name: Analyze failure
        run: |
          # 获取错误日志
          kubectl logs -l app=myapp --tail=100 > error.log

          # 分析错误类型
          if grep -q "OutOfMemory" error.log; then
            echo "FAILURE_TYPE=oom" >> $GITHUB_ENV
          elif grep -q "Connection refused" error.log; then
            echo "FAILURE_TYPE=connection" >> $GITHUB_ENV
          else
            echo "FAILURE_TYPE=unknown" >> $GITHUB_ENV
          fi

      - name: Execute rollback
        run: |
          case $FAILURE_TYPE in
            oom)
              echo "Increasing memory limits and redeploying..."
              kubectl patch deployment myapp -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
              ;;
            connection)
              echo "Checking service dependencies..."
              kubectl get svc
              kubectl rollout undo deployment/myapp
              ;;
            *)
              echo "Performing standard rollback..."
              kubectl rollout undo deployment/myapp
              ;;
          esac

          kubectl rollout status deployment/myapp

      - name: Verify rollback
        run: |
          sleep 30

          # 验证应用健康
          HEALTH_STATUS=$(kubectl get pods -l app=myapp -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}')

          if [ "$HEALTH_STATUS" != "True" ]; then
            echo "Rollback verification failed!"
            exit 1
          fi

          echo "Rollback successful!"

      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{
              "text": "Automatic rollback executed",
              "attachments": [{
                "color": "danger",
                "fields": [
                  {"title": "Environment", "value": "${{ github.event.deployment.environment }}", "short": true},
                  {"title": "Failure Type", "value": "'$FAILURE_TYPE'", "short": true},
                  {"title": "Commit", "value": "${{ github.sha }}", "short": false}
                ]
              }]
            }'
```

---

## 6. 最佳实践总结

### 6.1 CI/CD黄金法则

| 法则 | 描述 | 实施方式 |
|------|------|----------|
| **快速反馈** | 10分钟内获得构建结果 | 并行化、缓存、分层测试 |
| **自动化一切** | 消除手动步骤 | 脚本化、工具链集成 |
| **版本控制** | 所有配置纳入版本管理 | Git管理Pipeline配置 |
| **环境一致性** | 开发/测试/生产环境一致 | 容器化、Infrastructure as Code |
| **安全左移** | 早期发现安全问题 | SAST/DAST集成到Pipeline |
| **可观测性** | 全程监控和日志 | Metrics、Logging、Tracing |

### 6.2 反模式清单

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| 巨型Pipeline | 单文件过大，难以维护 | 拆分为可复用工作流 |
| 硬编码密钥 | 安全风险 | 使用密钥管理服务 |
| 无版本控制 | 无法追溯变更 | 所有配置纳入Git |
| 缺少回滚 | 故障恢复困难 | 实现自动回滚机制 |
| 环境漂移 | 环境不一致导致问题 | 容器化、IaC |
| 测试不足 | 缺陷流入生产 | 提高测试覆盖率 |

### 6.3 工具选型建议

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| GitHub项目 | GitHub Actions | 原生集成、Actions市场丰富 |
| GitLab项目 | GitLab CI | 一体化DevOps平台 |
| 企业级 | Jenkins | 插件生态、高度可定制 |
| 云原生 | ArgoCD + Tekton | Kubernetes原生、GitOps |
| 简单项目 | CircleCI/Travis CI | 配置简单、快速上手 |

---

## 附录

### A. 常用CI/CD配置速查

**Node.js项目基础配置**：

```yaml
name: Node.js CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run build
```

**Docker构建配置**：

```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
- uses: docker/build-push-action@v5
  with:
    push: true
    tags: user/app:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Kubernetes部署配置**：

```yaml
- uses: azure/setup-kubectl@v3
- run: |
    kubectl set image deployment/app app=app:${{ github.sha }}
    kubectl rollout status deployment/app
```

---

> 文档版本: 1.0
> 最后更新: 2024
> 作者: CI/CD Expert
