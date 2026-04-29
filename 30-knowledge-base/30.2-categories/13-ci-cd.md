# CI/CD

> JavaScript/TypeScript 项目的持续集成与持续部署工具链选型，覆盖主流平台、安全实践与 FinOps 优化。

---

## 核心概念

CI/CD 不仅是 YAML 配置，而是包含**四个能力层**：

| 层级 | 能力 | 说明 |
|------|------|------|
| **工具层** | YAML/Groovy 配置、API 调用 | 编写流水线的基础能力 |
| **架构层** | 缓存策略、并行化、测试分层 | 决定流水线速度与可靠性 |
| **安全层** | 密钥管理、供应链安全、审计 | 防止凭证泄露与依赖投毒 |
| **FinOps 层** | 成本归因、资源优化、预算告警 | 控制 CI/CD 支出 |

> **2026 共识**：团队往往具备工具层能力，但缺乏架构层（流水线慢）和安全层（供应链风险）的系统化实践。

---

## 主流平台对比矩阵

| 维度 | GitHub Actions | GitLab CI | Jenkins | CircleCI |
|------|---------------|-----------|---------|----------|
| **配置语法** | YAML | YAML | Groovy (Jenkinsfile) | YAML |
| **生态集成** | GitHub 原生，Marketplace 20K+ Actions | GitLab 原生，DevSecOps 内置 | 插件生态 1,800+ | 云原生，Orb 生态 |
| **Marketplace 风险** | 第三方 Action 供应链风险需审计 | 较低（官方模板为主） | 插件安全风险历史较多 | 较低 |
| **自托管 Runner** | ✅ 支持（K8s/Docker） | ✅ 支持（GitLab Runner） | ✅ 原生设计 | ✅ 支持 |
| **并发执行** | 20 工作流（免费）/ 无限制（企业） | 400 min/月（免费） | 受基础设施限制 | 无限制（付费） |
| **缓存策略** | actions/cache | 内置缓存 | 插件配置 | 内置缓存 |
| **安全扫描** | 依赖 Dependabot / CodeQL | 内置 SAST/DAST | 插件扩展 | 集成第三方 |
| **定价（团队）** | $4/用户 + 分钟数 | $29/用户/月 | 自托管基础设施成本 | 按需计费 |
| **最佳场景** | GitHub 托管项目，中小团队 | 企业级 DevSecOps | 超大规模/复杂定制 | 云原生快速启动 |

---

## 2026 生态动态

### GitHub Actions 关键更新

- **Apple Silicon Runner**：macOS 启动时间从 2–3 分钟降至 30–45 秒
- **自定义 Runner 自动扩缩容**：企业可维护 Warm Pool，消除冷启动
- **可复用工作流（Reusable Workflows）**：50+ 微服务共享统一 CI 定义，避免复制粘贴

### GitLab CI 的 DAG 优势

GitLab CI 的 **DAG（有向无环图）执行模型**在复杂流水线中显著优于阶段式执行：

> 典型企业流水线（20–50 个 Job），DAG 执行相比阶段式执行可将总耗时缩短 **20–40%**。

### Jenkins 的现代化路径

- **JCasC（Jenkins Configuration as Code）**：声明式配置替代 UI 点击
- **Kubernetes Operator**：动态 Agent 供应，Pod 模板化
- **Shared Libraries**：可复用的 Groovy 代码库，避免重复

---

## JavaScript 项目 CI/CD 最佳实践

### 1. 流水线设计原则

```yaml
# .github/workflows/ci.yml — 典型 JS 项目分层流水线
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    needs: lint          # lint 通过后才开始测试
    strategy:
      matrix:            # 矩阵构建
        node: [20, 22, 24]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node }}, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### 2. 关键优化策略

| 策略 | 实施方式 | 效果 |
|------|---------|------|
| **Fail Fast** | lint → test → build 顺序执行 | 快速发现问题，节省资源 |
| **并行化** | 矩阵构建（多 Node 版本）、独立 Job | 缩短总耗时 |
| **激进缓存** | `actions/setup-node` cache + `actions/cache` 依赖 | 减少 60–80% 安装时间 |
| **Affected-Only** | Monorepo 中仅构建变更包 | 避免全量构建 |
| **冻结锁文件** | `--frozen-lockfile`（pnpm）/ `--ci`（npm） | 保证 CI 与本地一致性 |

### 3. 安全实践

- **最小权限原则**：CI 凭证仅授予必要权限，使用 OIDC 替代长期 Access Key
- **Action 审计**：仅使用验证创建者（GitHub、AWS、Azure）的 Action，固定到 Commit SHA
- **供应链安全**：启用 Dependabot、SBOM 生成（`npm sbom`）、容器镜像签名（Sigstore/Cosign）
- **密钥管理**：使用 GitHub Secrets / GitLab CI Variables，禁止硬编码

### 4. FinOps 优化

- **成本归因**：标记工作流与团队，识别高消耗流水线
- **Rightsizing Runner**：轻量任务用 `ubuntu-latest`，重构建用自托管大规格
- **定时清理**：删除过期 Artifact 和缓存，避免存储费用累积

---

## 参考资源

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Jenkins Pipeline as Code](https://www.jenkins.io/doc/book/pipeline/)
- [GitHub Actions Tutorial: 12 Steps to Production CI/CD (2026)](https://tech-insider.org/github-actions-tutorial-cicd-12-steps-2026/)
- [Jenkins vs GitHub Actions vs GitLab CI (2026)](https://eitt.academy/knowledge-base/jenkins-vs-github-actions-vs-gitlab-ci-cicd-2026/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/09-deployment-platforms.md`
- `30-knowledge-base/30.2-categories/07-package-managers.md`
- `20-code-lab/20.6-architecture-patterns/monorepo/ci-integration/`
- `40-ecosystem/comparison-matrices/ci-cd-tools-compare.md`

---

*最后更新: 2026-04-29*
