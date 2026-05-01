---
title: Monorepo 工具生态
description: JavaScript/TypeScript Monorepo 管理工具全景指南，覆盖 Turborepo、Nx、Moon、Lerna、pnpm/Bun workspaces，基于 2025-2026 最新趋势与数据。
---

# Monorepo 工具生态

> 本文档盘点 JavaScript/TypeScript 生态中主流的 Monorepo 管理工具，覆盖任务编排、构建缓存、依赖管理、发布工作流等核心维度。数据基于 2025-2026 年工具现状与社区趋势。Nx 团队已于 2025 年宣布全面 Rust 化，Turborepo 与 Vercel 生态深度绑定，Moon 以多语言支持见长。
>

## 📊 整体概览

| 工具 | Stars | 最新版本 | 编写语言 | 核心定位 | 企业采用 |
|------|-------|----------|----------|----------|----------|
| Turborepo | 29k+ | v2.x | Rust/Go | 任务编排与远程缓存 | Vercel、AWS、PayPal |
| Nx | 26k+ | v20+ | Rust + TS | 全功能 Monorepo 平台 | Google、Microsoft、Amazon |
| Moon | 3.2k+ | v1.x | Rust | 多语言工作区管理 | 中小型团队 |
| Lerna | 7k+ | v8.x | Node.js | 包发布管理（维护模式） | 遗留项目 |
| pnpm workspaces | — | v10.x | Rust | 原生 workspace + 包管理 | 广泛采用 |
| Bun workspaces | — | v1.2+ | Zig | 内置 workspace 支持 | Bun 生态 |

> 📌 数据来源：GitHub Stars（2026 年 4 月）、官方博客及社区调研。

---

## 1. Turborepo（Vercel）

| 属性 | 详情 |
|------|------|
| **名称** | Turborepo |
| **Stars** | ⭐ 29,000+ |
| **GitHub** | [vercel/turborepo](https://github.com/vercel/turborepo) |
| **官网** | [turbo.build](https://turbo.build) |

**一句话描述**：以任务编排和远程构建缓存为核心竞争力的 Monorepo 工具，核心已全面 Rust 化，与 Vercel 部署平台深度整合。

**核心特点**：

- **Pipeline 任务图**：通过 `turbo.json` 定义任务依赖，自动并行化无依赖任务
- **本地与远程缓存**：构建输出哈希化缓存，配合 Vercel Remote Cache 可将 CI 构建时间从分钟降至秒级
- **Affected 分析**：基于 Git 变更只运行受影响的包
- **Rust 核心**：v2 起任务调度引擎全面 Rust 化，性能提升显著

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": { "outputs": [] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

---

## 2. Nx — v20+ 与 Crystal

| 属性 | 详情 |
|------|------|
| **名称** | Nx |
| **Stars** | ⭐ 26,000+ |
| **最新版本** | v20+（2024 年 10 月发布） |
| **GitHub** | [nrwl/nx](https://github.com/nrwl/nx) |
| **官网** | [nx.dev](https://nx.dev) |

**一句话描述**：功能最全面的 Monorepo 平台，2025 年核心全面 Rust 化（Project "Crystal"），并引入 AI 驱动的 CI 自修复能力。

**核心特点**：

- **Nx Crystal**：2025 年核心 CLI 和任务引擎迁移至 Rust，无插件场景下不再依赖 Node.js
- **TypeScript Project References**：v20 起默认启用，编译速度提升 3-5 倍
- **Nx Cloud + Self-Healing CI**：AI 检测 flaky test 并自动重试，CI 失败率降低 40%+
- **Nx MCP Server**：为 AI 助手提供 workspace 结构、依赖图和任务配置的深度上下文
- **插件生态**：官方支持 React、Angular、NestJS、Next.js、Vite、Gradle 等
- **pnpm Catalog 支持**：v20 扩展支持 `catalog:` 协议，统一 workspace 版本管理

```bash
# Nx 20+ 常用命令
nx affected -t lint test build    # 只运行受影响的项目
nx graph                          # 可视化项目依赖图
nx release                        # 多包自动化发布
```

> 🚀 **2025 亮点**：Nx 发布 MCP Server，让 Cursor/Copilot 等 AI 工具直接理解 monorepo 结构，生成更精准的代码建议。

---

## 3. Moon — Rust 编写的多语言方案

| 属性 | 详情 |
|------|------|
| **名称** | Moon |
| **Stars** | ⭐ 3,200+ |
| **GitHub** | [moonrepo/moon](https://github.com/moonrepo/moon) |
| **官网** | [moonrepo.dev](https://moonrepo.dev) |

**一句话描述**：用 Rust 编写的多语言 Monorepo 工具，内置工具链管理（proto），支持 Node.js、Rust、Go、Python 混合工作区。

**核心特点**：

- **任务继承**：全局任务定义一次，所有项目自动继承，避免 `package.json` 脚本重复
- **智能哈希**：综合文件内容、环境变量、依赖版本计算缓存键
- **proto 工具链**：自动下载和管理 Node.js、Bun、Rust 等语言版本
- **多语言支持**：不局限于 JS，原生支持 Rust/Go/Python 项目编排
- **代码所有权**：内置 `CODEOWNERS` 生成和模块边界管理

```yaml
# .moon/workspace.yml
projects:
  web: 'apps/web'
  api: 'apps/api'
  shared: 'packages/shared'

toolchain:
  node:
    version: '22.0.0'
    packageManager: 'pnpm'
```

---

## 4. Lerna — 维护状态

| 属性 | 详情 |
|------|------|
| **名称** | Lerna |
| **Stars** | ⭐ 7,000+ |
| **GitHub** | [lerna/lerna](https://github.com/lerna/lerna) |

**一句话描述**：曾经的 Monorepo 发布管理标准工具，现由 Nx 团队维护，处于功能维护模式。

**维护状态**：

> ⚠️ Lerna 处于维护模式。Nx 团队于 2022 年接管维护，`lerna bootstrap` 已废弃，推荐新项目直接使用 Nx 或 `nx release`。Lerna 仍可用于简单的版本管理和 CHANGELOG 生成。

---

## 5. pnpm / Bun Workspaces

### pnpm Workspaces（v10）

pnpm v10 的 workspace 功能与 Turborepo/Nx 配合使用最为广泛：

- **Catalog 协议**：`catalog:react` 跨包统一版本，解决 monorepo 版本碎片化
- **Workspace 协议**：`workspace:*` 自动解析本地包
- **Filter 命令**：`pnpm --filter pkg-name... build` 精确执行依赖图

### Bun Workspaces（v1.2+）

Bun 内置 workspace 支持，配置极简：

```json
{
  "name": "my-monorepo",
  "workspaces": ["packages/*", "apps/*"]
}
```

- 安装速度极快，适合 Bun 运行时项目
- 与 Turborepo 配合使用可进一步提升缓存命中率

---

## 6. 选型矩阵

### 按规模

| 规模 | 推荐方案 | 理由 |
|------|----------|------|
| 小团队（2-5人） | **pnpm workspaces** + **Turborepo** | 轻量、快速上手、缓存效果显著 |
| 中型团队（5-20人） | **pnpm workspaces** + **Nx** | 代码生成、架构规范、affected 分析 |
| 大型团队（20-100人） | **Nx** / **Turborepo + Nx Cloud** | 远程缓存、发布流程、CI 自修复 |
| 超大规模 / 多语言 | **Moon** / **Nx + Bazel** | 多语言统一、工具链自动管理 |

### 按技术栈

| 技术栈 | 推荐方案 |
|--------|----------|
| Next.js + Vercel | **Turborepo**（原生集成 Remote Cache） |
| React + NestJS 全栈 | **Nx**（官方插件全覆盖） |
| Angular 企业应用 | **Nx**（Angular 官方推荐） |
| Node.js + Rust/Go 混合 | **Moon**（多语言工具链管理） |
| Bun 运行时 | **Bun workspaces** + **Turborepo** |

### 按 CI 集成

| CI 平台 | 推荐方案 | 集成方式 |
|---------|----------|----------|
| GitHub Actions | Turborepo / Nx | `turbo run` / `nx affected` |
| Vercel | Turborepo | 原生 Remote Cache |
| 自托管 CI | Nx / Moon | Nx Cloud 私有部署 / `moon ci` |

---

## 7. Changesets 发布管理

Changesets 是 Monorepo 版本管理和发布的现代标准工具。

```bash
# 安装
npm install -D @changesets/cli

# 创建变更集
npx changeset
# 选择受影响的包，填写变更描述

# 版本提升
npx changeset version
# 自动更新版本号、生成 CHANGELOG

# 发布
npx changeset publish
```

**与 Monorepo 工具配合**：

| 组合 | 适用场景 |
|------|---------|
| **Turborepo + Changesets** | Vercel 生态，轻量发布 |
| **Nx + Nx Release** | Nx 原生，无需额外工具 |
| **Moon + Changesets** | 多语言项目统一发布 |

## 8. 包版本策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| **固定版本** | 所有包统一版本号 | 紧耦合项目 |
| **独立版本** | 各包独立版本管理 | 松耦合库集合 |
| **语义化版本** | 遵循 SemVer 规范 | 开源库发布 |
| **快照版本** | `0.0.0-snapshot-xxx` | 持续集成 |

## 9. Monorepo 代码共享模式

```
monorepo/
├── apps/               # 应用层（不可被依赖）
│   ├── web/
│   └── api/
├── packages/           # 共享包（可被依赖）
│   ├── ui/            # UI 组件库
│   ├── config/        # 共享配置（eslint, tsconfig）
│   ├── types/         # 共享类型定义
│   └── utils/         # 工具函数
└── tooling/           # 构建工具配置
    ├── typescript/
    └── eslint/
```

**边界规则**：
- `apps` 不能相互依赖
- `packages` 可以相互依赖，但不能依赖 `apps`
- `tooling` 只能被顶层依赖

## 10. 核心特性对比

| 维度 | Turborepo | Nx v20+ | Moon | Lerna | pnpm ws | Bun ws |
|------|:---------:|:-------:|:----:|:-----:|:-------:|:------:|
| **任务编排** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ❌ |
| **构建缓存** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ❌ | ❌ |
| **Affected 分析** | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ❌ | ❌ | ❌ |
| **代码生成** | ❌ | ⭐⭐⭐⭐⭐ | ✅ | ❌ | ❌ | ❌ |
| **远程缓存** | ✅ (Vercel) | ✅ (Nx Cloud) | ✅ | ❌ | ❌ | ❌ |
| **多语言支持** | ❌ | ⚠️ (插件) | ✅ | ❌ | ❌ | ❌ |
| **工具链管理** | ❌ | ❌ | ✅ (proto) | ❌ | ❌ | ❌ |
| **发布管理** | ⚠️ Changesets | ✅ Nx Release | ⚠️ Changesets | ✅ | ❌ | ❌ |
| **学习曲线** | 低 | 中 | 中 | 低 | 低 | 很低 |

---

> 📅 本文档最后更新：2026 年 5 月
>
> 💡 提示：2025 年 Monorepo 工具的核心趋势是 **Rust 化**（Nx Crystal、Turborepo v2）和 **AI 集成**（Nx MCP Server）。选型时建议优先评估远程缓存和 CI 集成能力。
