# 技术基础设施模块总览（Technical Infrastructure Modules）

> **定位**：本文档汇总 `jsts-code-lab/` 中所有属于「技术基础设施」维度的学习与实践模块。
>
> **边界说明**：技术基础设施模块聚焦于支撑应用开发、构建、测试、部署、运行和治理的通用工具链与平台，不包含具体业务框架（React/Vue/Angular）、UI 组件实现或业务领域逻辑。

---

## 📑 模块分类索引

### 构建工具链

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 23-toolchain-configuration | [`./23-toolchain-configuration`](./23-toolchain-configuration) | Vite/Rolldown 配置、ESLint/Prettier/Biome/Oxc 工具链、迁移实践 |

### 包管理与 Monorepo

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 12-package-management | [`./12-package-management`](./12-package-management) | npm/pnpm 基础、workspace 配置、依赖管理 |
| 13-code-organization | [`./13-code-organization`](./13-code-organization) | Monorepo 目录结构、模块边界、代码分层 |

### 测试体系

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 07-testing | [`./07-testing`](./07-testing) | 单元测试、集成测试、Mock/Stub、TDD/BDD 实践 |
| 28-testing-advanced | [`./28-testing-advanced`](./28-testing-advanced) | 高级测试策略、性能测试、契约测试、模糊测试 |
| 55-ai-testing | [`./55-ai-testing`](./55-ai-testing) | AI 辅助测试生成、视觉回归、智能断言与覆盖率分析 |

### 代码质量与工具链

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 23-toolchain-configuration | [`./23-toolchain-configuration`](./23-toolchain-configuration) | 代码质量工具配置、Git 钩子、类型检查流水线 |

### 部署与 DevOps

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 22-deployment-devops | [`./22-deployment-devops`](./22-deployment-devops) | Docker 容器化、CI/CD Pipeline、GitHub Actions 实践 |
| 31-serverless | [`./31-serverless`](./31-serverless) | Serverless 架构、函数计算、事件驱动设计 |
| 32-edge-computing | [`./32-edge-computing`](./32-edge-computing) | Edge Runtime、Workers、边缘函数部署 |
| 72-container-orchestration | [`./72-container-orchestration`](./72-container-orchestration) | Kubernetes 基础、容器编排、服务网格 |
| 93-deployment-edge-lab | [`./93-deployment-edge-lab`](./93-deployment-edge-lab) | 边缘部署实战、冷启动优化、全球分发 |

### 可观测性

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 39-performance-monitoring | [`./39-performance-monitoring`](./39-performance-monitoring) | 性能指标采集、Web Vitals、APM 监控 |
| 74-observability | [`./74-observability`](./74-observability) | 日志、指标、链路追踪（OpenTelemetry）、健康检查 |
| 92-observability-lab | [`./92-observability-lab`](./92-observability-lab) | OpenTelemetry 集成、分布式追踪、告警配置 |

### 安全

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 21-api-security | [`./21-api-security`](./21-api-security) | CORS、CSRF、JWT、Rate Limiting、API 网关安全 |
| 38-web-security | [`./38-web-security`](./38-web-security) | XSS、CSP、安全头、内容安全策略 |
| 81-cybersecurity | [`./81-cybersecurity`](./81-cybersecurity) | 安全审计、威胁建模、漏洞扫描 |

### 性能优化

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 08-performance | [`./08-performance`](./08-performance) | 运行时性能、内存优化、渲染性能调优 |
| 11-benchmarks | [`./11-benchmarks`](./11-benchmarks) | 基准测试方法论、性能对比、Profiling |
| 54-intelligent-performance | [`./54-intelligent-performance`](./54-intelligent-performance) | AI 驱动的性能分析与优化 |
| 63-caching-strategies | [`./63-caching-strategies`](./63-caching-strategies) | 缓存模式、CDN、边缘缓存、Redis 策略 |

### 数据库与 ORM

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 20-database-orm | [`./20-database-orm`](./20-database-orm) | ORM 基础、查询构建、事务管理、连接池 |
| 96-orm-modern-lab | [`./96-orm-modern-lab`](./96-orm-modern-lab) | Drizzle Kit、Prisma 7 WASM、边缘数据库集成 |

### API 设计

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 21-api-security | [`./21-api-security`](./21-api-security) | REST API 安全设计、认证中间件 |
| 24-graphql | [`./24-graphql`](./24-graphql) | GraphQL Schema 设计、Resolver、性能优化 |
| 61-api-gateway | [`./61-api-gateway`](./61-api-gateway) | API 网关模式、路由、限流、协议转换 |

### 认证授权

| 模块 | 路径 | 内容概要 |
|------|------|----------|
| 95-auth-modern-lab | [`./95-auth-modern-lab`](./95-auth-modern-lab) | better-auth 配置、OAuth2 PKCE、Passkeys、RBAC 中间件 |

---

## 🔗 关联文档

- [技术基础设施总索引](../docs/infrastructure-index.md)
- [基础设施栈决策矩阵](../docs/comparison-matrices/infrastructure-stack-decision-matrix.md)
- [构建工具对比矩阵](../docs/comparison-matrices/build-tools-compare.md)
- [测试框架对比矩阵](../docs/comparison-matrices/testing-compare.md)
- [部署平台对比矩阵](../docs/comparison-matrices/deployment-platforms-compare.md)
- [ORM 对比矩阵](../docs/comparison-matrices/orm-compare.md)

---

> 📅 本文档最后更新：2026年4月
>
> 📝 **维护说明**：新增基础设施模块时，必须在本文件中注册，并在模块根目录创建 `CATEGORY.md` 标注「技术基础设施」维度。
