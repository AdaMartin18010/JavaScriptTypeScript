# CI/CD 工具对比

> GitHub Actions、GitLab CI、Jenkins、CircleCI 的深度对比矩阵。

---

## 对比矩阵

| 维度 | GitHub Actions | GitLab CI | Jenkins | CircleCI |
|------|---------------|-----------|---------|----------|
| **配置语法** | YAML | YAML | Groovy | YAML |
| **Marketplace/生态** | 20K+ Actions | 内置模板 | 1,800+ 插件 | Orb 生态 |
| **自托管 Runner** | ✅ | ✅ | ✅ 原生 | ✅ |
| **并发构建** | 20（免费） | 400 min/月 | 无限制 | 无限制（付费） |
| **缓存策略** | actions/cache | 内置 | 插件 | 内置 |
| **安全扫描** | Dependabot/CodeQL | 内置 SAST/DAST | 插件 | 集成第三方 |
| **可复用工作流** | ✅ | ✅ | Shared Libraries | ✅ |
| **定价（团队）** | $4/用户 + 分钟 | $29/用户/月 | 自托管成本 | 按需计费 |

---

## 深度对比：GitHub Actions vs GitLab CI vs CircleCI vs Jenkins

| 维度 | GitHub Actions | GitLab CI | CircleCI | Jenkins |
|------|---------------|-----------|----------|---------|
| **托管模型** | SaaS (GitHub 绑定) | SaaS + 自托管 | SaaS + 自托管 | 仅自托管 |
| **配置位置** | `.github/workflows/*.yml` | `.gitlab-ci.yml` | `.circleci/config.yml` | `Jenkinsfile` |
| **语法复杂度** | 低 | 低 | 低 | 高 (Groovy DSL) |
| **生态扩展** | 20K+ Marketplace Actions | 内置 CI/CD 模板 | 1,000+ Orbs | 1,800+ 插件 |
| **容器原生** | ✅ Docker / 自托管 | ✅ Kubernetes Executor | ✅ Docker 原生 | ⚠️ 需配置 |
| **矩阵构建** | ✅ `strategy.matrix` | ✅ `parallel:matrix` | ✅ `matrix` | ✅ 插件 |
| **审批/门控** | ✅ 环境保护规则 | ✅ 部署审批 | ✅ 手动门控 | ✅ 插件 |
| **Secrets 管理** | 仓库/组织/环境级 | 项目/组/实例级 | 上下文/项目级 | 凭证插件 |
| **自托管成本** | 低 (Linux runner 免费) | 中 (Runner 注册) | 中 | 高 (服务器 + 维护) |
| **与代码托管集成** | ⭐⭐⭐⭐⭐ (原生) | ⭐⭐⭐⭐⭐ (原生) | ⭐⭐⭐ (Webhook) | ⭐⭐ (通用) |
| **适用场景** | GitHub 项目首选 | 全生命周期 DevOps | 快速云原生启动 | 超大规模/复杂定制 |

---

## 工作流示例

### GitHub Actions：Next.js 全栈部署

```yaml
# .github/workflows/deploy.yml
name: Deploy Next.js App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test:ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/standalone

  deploy-production:
    needs: test-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-output

      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        id: deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitLab CI：多阶段流水线

```yaml
# .gitlab-ci.yml
stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "22"
  NPM_CONFIG_CACHE: "$CI_PROJECT_DIR/.npm"

cache:
  key:
    files:
      - package-lock.json
  paths:
    - .npm/
    - node_modules/

install:
  stage: install
  image: node:$NODE_VERSION
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/

lint:
  stage: lint
  image: node:$NODE_VERSION
  needs: [install]
  script:
    - npm run lint
    - npx tsc --noEmit

test:
  stage: test
  image: node:$NODE_VERSION
  needs: [install]
  script:
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:$NODE_VERSION
  needs: [lint, test]
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy-production:
  stage: deploy
  image: alpine:latest
  needs: [build]
  only:
    - main
  environment:
    name: production
    url: https://example.com
  script:
    - echo "Deploying to production..."
    # 实际部署脚本
```

### CircleCI：并行测试矩阵

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@6.1.0

jobs:
  test:
    parameters:
      node-version:
        type: string
    docker:
      - image: cimg/node:<< parameters.node-version >>
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run tests
          command: npm run test:ci
      - store_test_results:
          path: ./junit.xml
      - store_artifacts:
          path: ./coverage

workflows:
  test-and-deploy:
    jobs:
      - test:
          matrix:
            parameters:
              node-version: ["20.12", "22.4", "23.0"]
      - node/run:
          npm-run: build
          requires:
            - test
          filters:
            branches:
              only: main
```

### Jenkins：Shared Library 可复用流水线

```groovy
// vars/buildNodeJs.groovy — Jenkins Shared Library
// 仓库：jenkins-shared-libraries/vars/buildNodeJs.groovy

def call(Map config = [:]) {
  pipeline {
    agent any
    tools { nodejs config.nodeVersion ?: '22' }
    stages {
      stage('Install') {
        steps { sh 'npm ci' }
      }
      stage('Lint & Type Check') {
        parallel {
          stage('Lint') { steps { sh 'npm run lint' } }
          stage('Type Check') { steps { sh 'npx tsc --noEmit' } }
        }
      }
      stage('Test') {
        steps { sh 'npm run test:ci' }
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
          }
        }
      }
      stage('Build') {
        steps { sh 'npm run build' }
      }
      stage('Deploy') {
        when { branch 'main' }
        steps {
          sh "echo 'Deploying ${config.appName} to ${config.environment}'"
          // 调用实际部署脚本
        }
      }
    }
  }
}

// Jenkinsfile 中使用
// @Library('jenkins-shared-libraries') _
// buildNodeJs(appName: 'my-app', environment: 'production')
```

### Dagger：可移植 CI/CD 管道（容器即代码）

```typescript
// dagger-pipeline.ts — 使用 Dagger SDK 定义可移植构建流水线
import { connect } from '@dagger.io/dagger';

async function main() {
  await connect(async (client) => {
    // 1. 获取 Node.js 基础镜像
    const node = client.container()
      .from('node:22-alpine')
      .withDirectory('/src', client.host().directory('.'))
      .withWorkdir('/src');

    // 2. 安装依赖（利用缓存）
    const deps = node
      .withMountedCache('/src/node_modules', client.cacheVolume('node-modules'))
      .withExec(['npm', 'ci']);

    // 3. 并行执行 Lint 与 Type Check
    const lint = deps.withExec(['npm', 'run', 'lint']);
    const typeCheck = deps.withExec(['npx', 'tsc', '--noEmit']);

    // 4. 测试（导出覆盖率报告）
    const tested = deps
      .withExec(['npm', 'run', 'test:ci'])
      .directory('/src/coverage')
      .export('./coverage');

    // 5. 构建生产产物
    const build = deps.withExec(['npm', 'run', 'build']);

    // 6. 构建 Docker 镜像并推送
    const image = client.container()
      .from('node:22-alpine')
      .withDirectory('/app', build.directory('/src/dist'))
      .withWorkdir('/app')
      .withEntrypoint(['node', 'index.js']);

    await image.publish('ghcr.io/myorg/app:latest');

    // 等待并行任务完成
    await Promise.all([lint.sync(), typeCheck.sync(), tested, build.sync()]);
    console.log('Pipeline completed successfully');
  });
}

main().catch(console.error);
```

### GitHub Actions 可复用工作流（Reusable Workflow）

```yaml
# .github/workflows/reusable-nodejs.yml
name: Reusable Node.js CI

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '22'
      runs-on:
        required: false
        type: string
        default: ubuntu-latest
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  ci:
    runs-on: ${{ inputs.runs-on }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test:ci
      - run: npm run build

# 调用方式：.github/workflows/app.yml
# jobs:
#   call-ci:
#     uses: ./.github/workflows/reusable-nodejs.yml
#     with: { node-version: '22' }
```

---

## 选型建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| GitHub 托管项目 | GitHub Actions | 原生集成，Actions 生态丰富 |
| 企业级 DevSecOps | GitLab CI | 内置 SAST/DAST，完整 DevOps 平台 |
| 超大规模 / 复杂定制 | Jenkins | 无限制并发，Groovy 灵活脚本 |
| 快速云原生启动 | CircleCI | 配置简洁，并行矩阵构建友好 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| GitHub Actions Docs | <https://docs.github.com/en/actions> | 官方文档 |
| GitLab CI/CD Docs | <https://docs.gitlab.com/ee/ci/> | 官方文档 |
| CircleCI Docs | <https://circleci.com/docs/> | 官方文档 |
| Jenkins Docs | <https://www.jenkins.io/doc/> | 官方文档 |
| GitHub Actions Marketplace | <https://github.com/marketplace?type=actions> | Actions 市场 |
| CircleCI Orbs | <https://circleci.com/developer/orbs> | 可复用配置包 |
| act (Local GitHub Actions) | <https://github.com/nektos/act> | 本地运行 GitHub Actions |
| Dagger | <https://dagger.io/> | 可移植 CI/CD 管道 (容器即代码) |
| GitHub Actions — Reusable Workflows | <https://docs.github.com/en/actions/sharing-automations/reusing-workflows> | 可复用工作流官方文档 |
| GitHub Actions — Composite Actions | <https://docs.github.com/en/actions/sharing-automations/creating-a-composite-action> | 复合 Action 官方文档 |
| GitLab CI/CD Templates | <https://docs.gitlab.com/ee/ci/examples/> | 官方 CI 模板库 |
| Jenkins Shared Libraries | <https://www.jenkins.io/doc/book/pipeline/shared-libraries/> | 共享库官方文档 |
| CircleCI Orbs Registry | <https://circleci.com/developer/orbs> | 官方 Orbs 注册表 |
| Dagger SDK for Node.js | <https://docs.dagger.io/sdk/nodejs> | Dagger Node.js SDK 文档 |
| Argo CD Documentation | <https://argo-cd.readthedocs.io/> | Kubernetes GitOps 持续交付 |
| Argo Workflows | <https://argoproj.github.io/workflows/> | Kubernetes 原生工作流引擎 |
| Tekton Documentation | <https://tekton.dev/docs/> | 云原生 CI/CD 框架 |
| Woodpecker CI | <https://woodpecker-ci.org/> | 轻量级容器化 CI |
| GitHub Actions Runner | <https://github.com/actions/runner> | 自托管 Runner 源码 |
| GitLab Runner Documentation | <https://docs.gitlab.com/runner/> | 官方 Runner 文档 |
| SourceHut Builds | <https://man.sr.ht/builds.sr.ht/> | 极简构建服务 |
| Buildkite Documentation | <https://buildkite.com/docs> | 混合云 CI/CD 平台 |
| Semaphore CI Documentation | <https://docs.semaphoreci.com/> | 云原生 CI/CD |
| Travis CI Documentation | <https://docs.travis-ci.com/> | 老牌 CI 服务 |

---

*最后更新: 2026-04-29*
