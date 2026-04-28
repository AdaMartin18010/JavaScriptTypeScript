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

## 决策支持

- [基础设施决策矩阵](../30.3-comparison-matrices/infrastructure-stack-decision-matrix.md)
- [Type Stripping 策略决策树](../30.4-decision-trees/legacy-decision-trees.md#17-type-stripping-策略决策树)
- [部署平台选型决策树](../30.4-decision-trees/legacy-decision-trees.md#9-部署平台选型决策树)

---

## 代码实践

| 模块 | 路径 | 说明 |
|------|------|------|
| 包管理 | [../../jsts-code-lab/12-package-management/](../../jsts-code-lab/12-package-management/) | npm/pnpm/Bun workspaces |
| 工具链配置 | [../../jsts-code-lab/23-toolchain-configuration/](../../jsts-code-lab/23-toolchain-configuration/) | ESLint/Prettier/Biome/Vite |
| 测试 | [../../jsts-code-lab/07-testing/](../../jsts-code-lab/07-testing/) | 单元测试/E2E/性能测试 |
| API 安全 | [../../jsts-code-lab/21-api-security/](../../jsts-code-lab/21-api-security/) | 认证/授权/安全最佳实践 |
| 性能优化 | [../../jsts-code-lab/08-performance/](../../jsts-code-lab/08-performance/) | 前端/后端/数据库优化 |
| 可观测性 | [../../jsts-code-lab/74-observability/](../../jsts-code-lab/74-observability/) | 日志/监控/追踪 |
| 现代认证 | [../../jsts-code-lab/95-auth-modern-lab/](../../jsts-code-lab/95-auth-modern-lab/) | Passkeys/WebAuthn/OAuth 2.1 |

---

*最后更新: 2026-04-27*
*review-cycle: 3 months*
*next-review: 2026-07-27*
*status: current*
