# 开发工具链知识中枢

> **路径**: `30-knowledge-base/30.7-tooling/`  
> **定位**: JavaScript/TypeScript 开发工具链的系统性知识索引。本目录覆盖代码构建、静态检查、格式化、测试、版本控制及持续集成/持续部署（CI/CD）等关键环节，帮助开发者建立高效、可维护的工程化体系。

---

## 目录

- [目录](#目录)
- [核心主题](#核心主题)
  - [1. 构建工具与打包器](#1-构建工具与打包器)
  - [2. 编译器与转译器](#2-编译器与转译器)
  - [3. 代码检查与静态分析](#3-代码检查与静态分析)
  - [4. 代码格式化](#4-代码格式化)
  - [5. 测试框架与策略](#5-测试框架与策略)
  - [6. CI/CD 与 DevOps](#6-cicd-与-devops)
  - [7. 包管理器与 Monorepo](#7-包管理器与-monorepo)
- [工具选型速查](#工具选型速查)
- [关联文档](#关联文档)

---

## 核心主题

### 1. 构建工具与打包器

2026 年，Rust 重写的高性能工具已深度渗透 JS/TS 构建生态：

| 工具 | 技术栈 | 特点 | 2026 状态 |
|------|--------|------|-----------|
| **Vite** | esbuild + Rollup | 极速冷启动、HMR、生态丰富 | ✅ 主流首选 |
| **Rspack** | Rust | Webpack 兼容、高性能 | ✅ 企业级迁移 |
| **Rolldown** | Rust | Rollup API 兼容、Vite 未来默认底层 | ✅ 1.0 Stable |
| **Webpack** | JavaScript | 生态最成熟、配置最灵活 | ⚠️ 维护放缓 |
| **Turbopack** | Rust | Next.js 专用增量打包 | ✅ 持续迭代 |
| **Farm** | Rust | 基于 Rust 的极速构建引擎 | 🚀 新兴 |

选型建议：新项目优先 Vite；需要 Webpack 兼容生态时选 Rspack；Next.js 生态跟随 Turbopack。

### 2. 编译器与转译器

- **TypeScript Compiler (`tsc`)**：类型检查权威，但编译速度较慢；生产构建中常与 SWC/esbuild 配合使用（类型检查与转译分离）。
- **SWC**：基于 Rust 的超高速编译器，Next.js、Vite、Rspack 默认集成。
- **esbuild**：Go 编写，启动极快，Vite 开发模式底层依赖。
- **Babel**：插件生态庞大，2026 年逐渐被 SWC/esbuild 替代，但在特定 AST 转换场景中仍有价值。
- **tsgo (Go)**：TypeScript 团队正在开发的 Go 版类型检查器，预览版已发布，目标编译速度提升 10 倍。

### 3. 代码检查与静态分析

代码质量保障的核心环节：

- **ESLint**：最广泛的 JavaScript 检查工具，配合 `typescript-eslint` 提供 TS 类型感知规则。
- **Biome**：Rust 编写的 linter + formatter 一体化工具，ESLint/Prettier 的替代方案。
- **Oxlint**：Oxc 项目的 linter，速度约为 ESLint 的 50~100 倍，2026 年已支持 TypeScript 类型感知检查（Alpha）。
- **Knip**：检测未使用文件、依赖和导出，精简代码库。

### 4. 代码格式化

- **Prettier**： Opinionated 格式化标准，IDE 集成最完善。
- **Biome**：Prettier 兼容模式，速度提升显著。
- **dprint**：基于 Rust 的可配置格式化器，支持多种语言。
- **oxfmt**：Oxc 项目格式化器，速度约 Prettier 的 30 倍（Alpha）。

> 建议：团队统一 `.prettierrc` 或 `biome.json` 配置，并在 CI 中校验格式化一致性。

### 5. 测试框架与策略

| 测试类型 | 推荐工具 | 说明 |
|---------|---------|------|
| 单元测试 | **Vitest**、Jest | Vitest 为 Vite 生态首选，API 兼容 Jest |
| 集成测试 | **Vitest**、Node.js Test Runner | 测试模块间交互 |
| E2E 测试 | **Playwright**、Cypress | Playwright 跨浏览器、自动等待、Trace Viewer |
| 组件测试 | **Testing Library**、Storybook | 用户行为驱动的组件验证 |
| 视觉回归 | **Chromatic**、Percy | UI 变更可视化比对 |
| API Mock | **MSW** | Service Worker 层拦截请求，前后端解耦测试 |

### 6. CI/CD 与 DevOps

现代前端/全栈项目的交付管道：

- **GitHub Actions**：生态最丰富，与 GitHub 深度集成，公开市场 Actions 数以万计。
- **GitLab CI**：内置 DevOps 平台，适合私有化部署。
- **Vercel / Netlify / Cloudflare Pages**：前端托管平台内置 Git 驱动的持续部署。
- **Docker + Kubernetes**：容器化与编排标准，配合 GitHub Actions/GitLab CI 实现完整流水线。
- **Turborepo / Nx**：Monorepo 任务编排与远程缓存，显著加速 CI 构建。

### 7. 包管理器与 Monorepo

- **pnpm**：磁盘空间高效、安装速度快、依赖严格（无幽灵依赖），2026 年已成为社区默认推荐。
- **Yarn (Berry)**：PnP（Plug'n'Play）模式零拷贝，适合超大型项目。
- **Bun**：内置包管理器，速度极快，与 npm 兼容性达 99.7%。
- **Monorepo 工具**：Turborepo（Vercel）、Nx（企业级）、Rush（微软）、Lerna（已进入维护模式）。

---

## 工具选型速查

```
新项目启动 ──┬── 构建 → Vite
            ├── 检查 → ESLint + typescript-eslint (或 Biome)
            ├── 格式化 → Prettier (或 Biome)
            ├── 测试 → Vitest + Playwright
            ├── 包管理 → pnpm
            └── CI → GitHub Actions + Turborepo
```

---

## 关联文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库总览 | [../README.md](../README.md) | `30-knowledge-base` 根目录索引 |
| 生态全景 | [../../40-ecosystem/README.md](../../40-ecosystem/README.md) | Awesome JS/TS 生态库导航（含构建、测试工具） |
| 生态趋势 | [../../40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md](../../40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md) | Rust 工具链替代趋势报告 |
| 对比矩阵 | [../30.3-comparison-matrices/](../30.3-comparison-matrices/) | 工具横向对比 |

---

*最后更新: 2026-04-29*
