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
| 包管理 | `docs/categories/07-package-managers.md` | `jsts-code-lab/12-package-management/` | 4h |
| Monorepo | `docs/categories/08-monorepo-tools.md` | `jsts-code-lab/13-code-organization/` | 4h |
| 构建工具 | `docs/categories/03-build-tools.md` | `jsts-code-lab/23-toolchain-configuration/` | 6h |
| 代码规范 | `docs/categories/14-linting-formatting.md` | `jsts-code-lab/23-toolchain-configuration/` | 3h |
| 测试基础 | `docs/categories/12-testing.md` | `jsts-code-lab/07-testing/` | 6h |
| TS 配置 | `docs/guides/typescript-configuration-guide.md` | `jsts-code-lab/10-js-ts-comparison/` | 3h |

### Checkpoint 1: 工具链搭建验证

1. 从零搭建一个 Monorepo 项目，包含：
   - pnpm workspaces + Turborepo
   - Vite + TypeScript 严格模式
   - ESLint (Biome) + Prettier
   - Vitest 单元测试 + Playwright E2E
2. 配置 CI/CD：GitHub Actions 自动运行 lint/test/build

---

## 阶段 3-4: 部署与运维

### 学习目标

- 理解不同部署平台的特性与适用场景
- 掌握容器化部署与 CI/CD 最佳实践
- 能够设计高可用的部署架构

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| CI/CD | `docs/categories/13-ci-cd.md` | `jsts-code-lab/22-deployment-devops/` | 4h |
| 容器化 | `docs/guides/docker-guide.md` | `jsts-code-lab/72-container-orchestration/` | 4h |
| 部署平台 | `docs/categories/09-deployment-platforms.md` | `examples/` 中部署配置 | 4h |
| 边缘部署 | `docs/categories/31-serverless-edge-computing.md` | `jsts-code-lab/32-edge-computing/` | 4h |
| Serverless | `docs/guides/serverless-guide.md` | `jsts-code-lab/31-serverless/` | 3h |

### Checkpoint 2: 部署架构设计

1. 为一个全栈应用设计部署方案：
   - 前端：Vercel / Cloudflare Pages
   - 后端 API：Cloudflare Workers / Railway
   - 数据库：Neon / Turso
   - CI/CD：GitHub Actions
2. 绘制部署架构图，标注数据流和故障恢复策略

---

## 阶段 5-6: 可观测性与可靠性

### 学习目标

- 建立完整的可观测性体系
- 掌握性能分析与优化方法
- 理解安全威胁模型与防御策略

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 可观测性 | `docs/categories/23-error-monitoring-logging.md` | `jsts-code-lab/74-observability/` | 5h |
| 性能工程 | `docs/categories/18-performance.md` | `jsts-code-lab/08-performance/` | 5h |
| 安全基础 | `docs/categories/25-security.md` | `jsts-code-lab/21-api-security/` | 5h |
| AI 安全 | `docs/guides/llm-security-guide.md` | `jsts-code-lab/33-ai-integration/` | 3h |
| 认证授权 | `docs/categories/29-authentication.md` | `jsts-code-lab/95-auth-modern-lab/` | 4h |

### Checkpoint 3: 生产环境保障

1. 为一个应用添加完整的可观测性：
   - OpenTelemetry  traces + metrics
   - Sentry 错误监控
   - 自定义性能 dashboard
2. 进行安全审计，修复至少 3 个潜在漏洞
3. 设计并实现数据库备份与灾难恢复方案

---

## 完成此路径后，你应该能够

- 独立搭建现代 JS/TS 项目的完整工程化体系
- 设计并实施 CI/CD 流水线
- 选择合适的部署平台并实施高可用架构
- 建立生产级的可观测性、性能监控和安全防护
- 优化系统性能并进行容量规划

**认证项目**：设计并实施一个包含完整工具链、CI/CD、监控告警、安全合规的生产级系统。

---

*最后更新: 2026-04-27*
*review-cycle: 6 months*
*next-review: 2026-10-27*
*status: current*
