---
last-updated: 2026-04-27
review-cycle: 3 months
next-review: 2026-07-27
status: current
---

# 技术基础设施总索引（Technical Infrastructure Index）

> **定位**：本文档是 JavaScriptTypeScript 项目中所有「技术基础设施」内容的**单一入口**。技术基础设施指支撑应用开发、构建、测试、部署、运行和治理的通用工具链与平台，与业务框架、UI 组件、应用逻辑保持清晰边界。
>
> **边界说明**：
>
> - ✅ **属于基础设施**：构建工具、包管理器、测试框架、代码质量工具、CI/CD、部署平台、监控系统、安全工具、数据库驱动/ORM、API 协议层、认证授权库。
> - ❌ **不属于基础设施**：前端框架（React/Vue/Angular）、UI 组件库、状态管理方案、业务领域模型、具体应用实现。

---

## 📑 目录

- [技术基础设施总索引（Technical Infrastructure Index）](#技术基础设施总索引technical-infrastructure-index)
  - [📑 目录](#-目录)
  - [1. 构建工具链](#1-构建工具链)
  - [2. 包管理与 Monorepo](#2-包管理与-monorepo)
  - [3. 测试体系](#3-测试体系)
  - [4. 代码质量与工具链](#4-代码质量与工具链)
  - [5. 部署与 DevOps](#5-部署与-devops)
  - [6. 可观测性](#6-可观测性)
  - [7. 安全](#7-安全)
  - [8. 性能优化](#8-性能优化)
  - [9. 数据库与 ORM](#9-数据库与-orm)
  - [10. API 设计](#10-api-设计)
  - [11. 认证授权](#11-认证授权)
  - [12. 基础设施决策矩阵](#12-基础设施决策矩阵)
  - [13. 实践实验室（jsts-code-lab）](#13-实践实验室jsts-code-lab)
  - [🔗 快速导航](#-快速导航)

---

## 1. 构建工具链

| 资源 | 路径 | 说明 |
|------|------|------|
| **构建工具全景** | [`docs/categories/03-build-tools.md`](./categories/03-build-tools.md) | Vite, Webpack, Rollup, esbuild, swc, Oxc, Rolldown, Turbopack, Rspack, Farm, Bun 等 |
| **构建工具对比矩阵** | [`docs/comparison-matrices/build-tools-compare.md`](./comparison-matrices/build-tools-compare.md) | 核心维度对比与选型建议 |
| **JS/TS 编译器对比** | [`docs/comparison-matrices/js-ts-compilers-compare.md`](./comparison-matrices/js-ts-compilers-compare.md) | SWC, Babel, Sucrase, tsc 对比 |
| **代码实验室** | [`jsts-code-lab/23-toolchain-configuration`](../jsts-code-lab/23-toolchain-configuration) | ESLint/Prettier/Biome/Oxc 配置、Rolldown/Vite 配置实践 |

**核心工具**：Vite · Webpack · Rollup · esbuild · swc · Oxc · Rolldown · Turbopack · Rspack · Bun · tsup · unbuild

---

## 2. 包管理与 Monorepo

| 资源 | 路径 | 说明 |
|------|------|------|
| **Monorepo 工具全景** | [`docs/categories/25-monorepo-tools.md`](./categories/25-monorepo-tools.md) | Turborepo, Nx, Rush, Bit, Bazel, Lerna, pnpm/npm workspaces |
| **包管理器对比矩阵** | [`docs/comparison-matrices/package-managers-compare.md`](./comparison-matrices/package-managers-compare.md) | npm, pnpm, yarn, Bun 对比 |
| **Monorepo 工具对比矩阵** | [`docs/comparison-matrices/monorepo-tools-compare.md`](./comparison-matrices/monorepo-tools-compare.md) | 多维度选型对比 |
| **代码实验室 - 包管理** | [`jsts-code-lab/12-package-management`](../jsts-code-lab/12-package-management) | npm/pnpm 基础、workspace 实践 |
| **代码实验室 - 代码组织** | [`jsts-code-lab/13-code-organization`](../jsts-code-lab/13-code-organization) | Monorepo 目录结构与依赖管理 |

**核心工具**：npm · pnpm · yarn · Bun · Turborepo · Nx · Rush · Lerna

---

## 3. 测试体系

| 资源 | 路径 | 说明 |
|------|------|------|
| **测试框架全景** | [`docs/categories/12-testing.md`](./categories/12-testing.md) | 单元测试框架总览（归档入口，见 13-testing-ecosystem） |
| **测试框架生态** | [`docs/categories/13-testing-ecosystem.md`](./categories/13-testing-ecosystem.md) | Vitest, Jest, Playwright, Cypress, Testing Library, MSW 等完整生态 |
| **测试框架对比矩阵** | [`docs/comparison-matrices/testing-compare.md`](./comparison-matrices/testing-compare.md) | Vitest vs Jest vs Playwright 核心对比 |
| **代码实验室 - 基础测试** | [`jsts-code-lab/07-testing`](../jsts-code-lab/07-testing) | 单元测试、集成测试、Mock/Stub、TDD/BDD |
| **代码实验室 - 高级测试** | [`jsts-code-lab/28-testing-advanced`](../jsts-code-lab/28-testing-advanced) | 高级测试策略、性能测试、模糊测试 |
| **代码实验室 - AI 测试** | [`jsts-code-lab/55-ai-testing`](../jsts-code-lab/55-ai-testing) | AI 辅助测试生成、视觉回归、智能断言 |

**核心工具**：Vitest · Jest · Playwright · Cypress · Testing Library · MSW · node:test · AVA · Mocha

---

## 4. 代码质量与工具链

| 资源 | 路径 | 说明 |
|------|------|------|
| **Linting 与格式化生态** | [`docs/categories/15-linting-formatting.md`](./categories/15-linting-formatting.md) | ESLint, Prettier, Biome, oxlint, dprint, TypeScript, Git 钩子 |
| **代码实验室 - 工具链配置** | [`jsts-code-lab/23-toolchain-configuration`](../jsts-code-lab/23-toolchain-configuration) | 完整工具链配置示例与迁移指南 |

**核心工具**：ESLint · Prettier · Biome · Oxc · TypeScript · husky · lint-staged · SonarQube

---

## 5. 部署与 DevOps

| 资源 | 路径 | 说明 |
|------|------|------|
| **CI/CD 与 DevOps 工具** | [`docs/categories/24-ci-cd-devops.md`](./categories/24-ci-cd-devops.md) | GitHub Actions, GitLab CI, CircleCI, Jenkins, Argo CD 等 |
| **部署与托管平台** | [`docs/categories/26-deployment-hosting.md`](./categories/26-deployment-hosting.md) | Vercel, Netlify, Cloudflare, AWS, Render, Fly.io, Railway |
| **CI/CD 工具对比矩阵** | [`docs/comparison-matrices/ci-cd-tools-compare.md`](./comparison-matrices/ci-cd-tools-compare.md) | 持续集成工具选型 |
| **部署平台对比矩阵** | [`docs/comparison-matrices/deployment-platforms-compare.md`](./comparison-matrices/deployment-platforms-compare.md) | 部署平台选型 |
| **代码实验室 - 部署与 DevOps** | [`jsts-code-lab/22-deployment-devops`](../jsts-code-lab/22-deployment-devops) | Docker 配置、CI/CD Pipeline、容器化实践 |
| **代码实验室 - Serverless** | [`jsts-code-lab/31-serverless`](../jsts-code-lab/31-serverless) | Serverless 架构与函数计算 |
| **代码实验室 - 边缘计算** | [`jsts-code-lab/32-edge-computing`](../jsts-code-lab/32-edge-computing) | Edge Runtime、Workers、边缘部署 |
| **代码实验室 - 边缘部署实验** | [`jsts-code-lab/93-deployment-edge-lab`](../jsts-code-lab/93-deployment-edge-lab) | 边缘部署实战 |

**核心工具/平台**：GitHub Actions · GitLab CI · Docker · Kubernetes · Vercel · Cloudflare Workers · AWS Lambda · Render · Fly.io

---

## 6. 可观测性

| 资源 | 路径 | 说明 |
|------|------|------|
| **错误监控与日志工具** | [`docs/categories/23-error-monitoring-logging.md`](./categories/23-error-monitoring-logging.md) | Sentry, OpenTelemetry, pino, winston, 结构化日志, AI 可观测性 |
| **可观测性工具对比矩阵** | [`docs/comparison-matrices/observability-tools-compare.md`](./comparison-matrices/observability-tools-compare.md) | 监控与可观测性平台选型 |
| **代码实验室 - 性能监控** | [`jsts-code-lab/39-performance-monitoring`](../jsts-code-lab/39-performance-monitoring) | 性能指标采集、Web Vitals、监控告警 |
| **代码实验室 - 可观测性** | [`jsts-code-lab/74-observability`](../jsts-code-lab/74-observability) | 日志、指标、链路追踪、健康检查 |
| **代码实验室 - 可观测性实验** | [`jsts-code-lab/92-observability-lab`](../jsts-code-lab/92-observability-lab) | OpenTelemetry 集成、分布式追踪实战 |

**核心工具**：Sentry · OpenTelemetry · pino · winston · Grafana · Prometheus · Jaeger · Langfuse

---

## 7. 安全

| 资源 | 路径 | 说明 |
|------|------|------|
| **安全与合规工具** | [`docs/categories/27-security-compliance.md`](./categories/27-security-compliance.md) | Snyk, Dependabot, CodeQL, Semgrep, Helmet, 运行时安全 |
| **代码实验室 - API 安全** | [`jsts-code-lab/21-api-security`](../jsts-code-lab/21-api-security) | CORS, CSRF, JWT, Rate Limiting |
| **代码实验室 - Web 安全** | [`jsts-code-lab/38-web-security`](../jsts-code-lab/38-web-security) | XSS, CSP, 安全头、内容安全策略 |
| **代码实验室 - 网络安全** | [`jsts-code-lab/81-cybersecurity`](../jsts-code-lab/81-cybersecurity) | 安全审计、渗透测试、威胁建模 |

**核心工具**：Snyk · Dependabot · CodeQL · Semgrep · ESLint Security Plugin · Helmet · express-rate-limit

---

## 8. 性能优化

| 资源 | 路径 | 说明 |
|------|------|------|
| **代码实验室 - 性能优化** | [`jsts-code-lab/08-performance`](../jsts-code-lab/08-performance) | 运行时性能、内存优化、渲染性能 |
| **代码实验室 - 基准测试** | [`jsts-code-lab/11-benchmarks`](../jsts-code-lab/11-benchmarks) | 基准测试方法论、Benchmark.js、性能对比 |
| **代码实验室 - 智能性能** | [`jsts-code-lab/54-intelligent-performance`](../jsts-code-lab/54-intelligent-performance) | AI 驱动的性能分析与优化建议 |

**核心工具**：Benchmark.js · Clinic.js · 0x · Web Vitals · Lighthouse

---

## 9. 数据库与 ORM

| 资源 | 路径 | 说明 |
|------|------|------|
| **ORM 与数据库库** | [`docs/categories/11-orm-database.md`](./categories/11-orm-database.md) | Prisma 7, Drizzle ORM, TypeORM, MikroORM, Mongoose, Kysely |
| **边缘数据库** | [`docs/categories/30-edge-databases.md`](./categories/30-edge-databases.md) | Turso, Cloudflare D1, Neon, PlanetScale, Supabase |
| **ORM 对比矩阵** | [`docs/comparison-matrices/orm-compare.md`](./comparison-matrices/orm-compare.md) | ORM 选型对比 |
| **代码实验室 - 数据库与 ORM** | [`jsts-code-lab/20-database-orm`](../jsts-code-lab/20-database-orm) | ORM 基础、查询构建、事务管理 |
| **代码实验室 - 现代 ORM 实验** | [`jsts-code-lab/96-orm-modern-lab`](../jsts-code-lab/96-orm-modern-lab) | Drizzle Kit、Prisma 7 WASM、边缘数据库集成 |

**核心工具**：Prisma 7 · Drizzle ORM · Kysely · MikroORM · Mongoose · pg · mysql2 · ioredis

---

## 10. API 设计

| 资源 | 路径 | 说明 |
|------|------|------|
| **代码实验室 - API 安全** | [`jsts-code-lab/21-api-security`](../jsts-code-lab/21-api-security) | REST API 安全最佳实践 |
| **代码实验室 - GraphQL** | [`jsts-code-lab/24-graphql`](../jsts-code-lab/24-graphql) | GraphQL Schema、Resolver、性能优化 |
| **代码实验室 - API 网关** | [`jsts-code-lab/61-api-gateway`](../jsts-code-lab/61-api-gateway) | 网关模式、限流、路由、协议转换 |
| **GraphQL 完整指南** | [`docs/guides/GRAPHQL_COMPLETE_GUIDE.md`](./guides/GRAPHQL_COMPLETE_GUIDE.md) | GraphQL 生产实践 |

**核心技术**：REST · GraphQL · tRPC · OpenAPI · gRPC-Web · WebSocket

---

## 11. 认证授权

| 资源 | 路径 | 说明 |
|------|------|------|
| **认证与授权全景** | [`docs/categories/29-authentication.md`](./categories/29-authentication.md) | better-auth, Auth.js, Clerk, Supabase Auth, WorkOS, Passkeys, FedCM |
| **代码实验室 - 现代认证实验** | [`jsts-code-lab/95-auth-modern-lab`](../jsts-code-lab/95-auth-modern-lab) | better-auth 配置、OAuth2 PKCE、Passkeys、RBAC 中间件 |

**核心工具**：better-auth · Auth.js · Clerk · Supabase Auth · WorkOS · simplewebauthn

---

## 12. 基础设施决策矩阵

| 资源 | 路径 | 覆盖范围 |
|------|------|----------|
| **基础设施栈决策矩阵** | [`docs/comparison-matrices/infrastructure-stack-decision-matrix.md`](./comparison-matrices/infrastructure-stack-decision-matrix.md) | 构建工具 · 测试策略 · 部署平台 · 数据库 · 认证方案 |

> 该矩阵提供跨维度的综合选型框架，帮助团队根据项目规模、性能需求、团队熟悉度和预算约束做出一致的技术决策。

---

## 13. 实践实验室（jsts-code-lab）

以下模块属于「技术基础设施」维度，每个模块均包含 `CATEGORY.md` 标注：

| 模块 | 路径 | 所属领域 |
|------|------|----------|
| 07-testing | [`jsts-code-lab/07-testing`](../jsts-code-lab/07-testing) | 测试体系 |
| 08-performance | [`jsts-code-lab/08-performance`](../jsts-code-lab/08-performance) | 性能优化 |
| 11-benchmarks | [`jsts-code-lab/11-benchmarks`](../jsts-code-lab/11-benchmarks) | 性能优化 |
| 12-package-management | [`jsts-code-lab/12-package-management`](../jsts-code-lab/12-package-management) | 包管理 |
| 13-code-organization | [`jsts-code-lab/13-code-organization`](../jsts-code-lab/13-code-organization) | 包管理 / Monorepo |
| 20-database-orm | [`jsts-code-lab/20-database-orm`](../jsts-code-lab/20-database-orm) | 数据库与 ORM |
| 21-api-security | [`jsts-code-lab/21-api-security`](../jsts-code-lab/21-api-security) | 安全 / API 设计 |
| 22-deployment-devops | [`jsts-code-lab/22-deployment-devops`](../jsts-code-lab/22-deployment-devops) | 部署与 DevOps |
| 23-toolchain-configuration | [`jsts-code-lab/23-toolchain-configuration`](../jsts-code-lab/23-toolchain-configuration) | 构建工具链 / 代码质量 |
| 24-graphql | [`jsts-code-lab/24-graphql`](../jsts-code-lab/24-graphql) | API 设计 |
| 28-testing-advanced | [`jsts-code-lab/28-testing-advanced`](../jsts-code-lab/28-testing-advanced) | 测试体系 |
| 31-serverless | [`jsts-code-lab/31-serverless`](../jsts-code-lab/31-serverless) | 部署与 DevOps |
| 32-edge-computing | [`jsts-code-lab/32-edge-computing`](../jsts-code-lab/32-edge-computing) | 部署与 DevOps |
| 38-web-security | [`jsts-code-lab/38-web-security`](../jsts-code-lab/38-web-security) | 安全 |
| 39-performance-monitoring | [`jsts-code-lab/39-performance-monitoring`](../jsts-code-lab/39-performance-monitoring) | 可观测性 |
| 55-ai-testing | [`jsts-code-lab/55-ai-testing`](../jsts-code-lab/55-ai-testing) | 测试体系 |
| 61-api-gateway | [`jsts-code-lab/61-api-gateway`](../jsts-code-lab/61-api-gateway) | API 设计 |
| 63-caching-strategies | [`jsts-code-lab/63-caching-strategies`](../jsts-code-lab/63-caching-strategies) | 性能优化 |
| 72-container-orchestration | [`jsts-code-lab/72-container-orchestration`](../jsts-code-lab/72-container-orchestration) | 部署与 DevOps |
| 74-observability | [`jsts-code-lab/74-observability`](../jsts-code-lab/74-observability) | 可观测性 |
| 81-cybersecurity | [`jsts-code-lab/81-cybersecurity`](../jsts-code-lab/81-cybersecurity) | 安全 |
| 92-observability-lab | [`jsts-code-lab/92-observability-lab`](../jsts-code-lab/92-observability-lab) | 可观测性 |
| 93-deployment-edge-lab | [`jsts-code-lab/93-deployment-edge-lab`](../jsts-code-lab/93-deployment-edge-lab) | 部署与 DevOps |
| 95-auth-modern-lab | [`jsts-code-lab/95-auth-modern-lab`](../jsts-code-lab/95-auth-modern-lab) | 认证授权 |
| 96-orm-modern-lab | [`jsts-code-lab/96-orm-modern-lab`](../jsts-code-lab/96-orm-modern-lab) | 数据库与 ORM |

> 完整总览请见 [`jsts-code-lab/infrastructure-README.md`](../jsts-code-lab/infrastructure-README.md)

---

## 🔗 快速导航

| 如果你需要... | 请访问 |
|--------------|--------|
| 为新项目选择构建工具 | [构建工具对比矩阵](./comparison-matrices/build-tools-compare.md) |
| 搭建测试体系 | [测试框架生态](./categories/13-testing-ecosystem.md) → [07-testing](../jsts-code-lab/07-testing) |
| 配置代码质量门禁 | [Linting 与格式化](./categories/15-linting-formatting.md) → [23-toolchain-configuration](../jsts-code-lab/23-toolchain-configuration) |
| 选择部署平台 | [部署平台对比矩阵](./comparison-matrices/deployment-platforms-compare.md) |
| 设计可观测性方案 | [错误监控与日志](./categories/23-error-monitoring-logging.md) → [74-observability](../jsts-code-lab/74-observability) |
| 加固安全体系 | [安全与合规](./categories/27-security-compliance.md) → [38-web-security](../jsts-code-lab/38-web-security) |
| 选择数据库/ORM | [ORM 对比矩阵](./comparison-matrices/orm-compare.md) → [96-orm-modern-lab](../jsts-code-lab/96-orm-modern-lab) |
| 选择认证方案 | [认证授权全景](./categories/29-authentication.md) → [95-auth-modern-lab](../jsts-code-lab/95-auth-modern-lab) |
| 综合基础设施选型 | [基础设施栈决策矩阵](./comparison-matrices/infrastructure-stack-decision-matrix.md) |

---

> 📅 本文档最后更新：2026年4月
>
> 🔄 **维护说明**：当新增基础设施相关分类、对比矩阵或代码实验室模块时，必须同步更新本索引。新增基础设施模块需在 `jsts-code-lab/` 中创建 `CATEGORY.md` 并标注「技术基础设施」维度。
