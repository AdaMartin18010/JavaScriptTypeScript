---
title: Monorepo 工具对比矩阵
description: "2025-2026 年 Monorepo 工具对比矩阵 对比矩阵，覆盖主流方案选型数据与工程实践建议"
---

# Monorepo 工具对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Turborepo | Nx | Rush | Bit | pnpm Workspaces | Bazel | Lerna |
|------|-----------|-----|------|-----|-----------------|-------|-------|
| **GitHub Stars** | 26k | 26k | 5k | 18k | 32k (pnpm) | 22k | 7k |
| **构建缓存 (本地)** | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🔵 需配合 | 🟢 原生 | 🔴 无 |
| **构建缓存 (远程)** | 🟢 Turborepo Remote Cache | 🟢 Nx Cloud | 🟢 Rush 构建缓存 | 🟢 Bit Cloud | 🔴 无 | 🟢 远程执行 | 🔴 无 |
| **任务编排/管道** | 🟢 `pipeline` 配置 | 🟢 `targetDefaults` | 🟢 命令队列 | 🟢 组件管道 | 🟡 基础脚本 | 🟢 声明式 | 🟡 基础 |
| **增量构建** | 🟢 自动 | 🟢 自动 | 🟢 自动 | 🟢 自动 | 🔴 无 | 🟢 文件级 | 🔴 无 |
| **Affected 分析** | 🟢 `--filter` | 🟢 `nx affected` | 🟢 `rush rebuild` | 🟢 依赖图 | 🔴 无 | 🟢 查询语言 | 🔴 无 |
| **IDE 支持** | 🔵 插件 | 🟢 最强 (Nx Console) | 🟡 基础 | 🟢 Bit IDE | 🟡 基础 | 🟡 基础 | 🟡 基础 |
| **技术栈限制** | 🟢 无 | 🟢 无 (但提供预设) | 🟢 无 | 🟡 深度绑定 | 🟢 无 | 🟢 无 | 🟢 无 |
| **学习曲线** | ⭐ 低 | ⭐⭐⭐ 高 | ⭐⭐⭐ 高 | ⭐⭐⭐ 高 | ⭐ 低 | ⭐⭐⭐⭐ 极高 | ⭐ 低 |
| **生态插件** | 🟡 有限 | 🟢 最丰富 | 🟡 有限 | 🟢 组件生态 | 🔴 无 | 🟡 有限 | 🔴 无 |
| **适用团队规模** | 中小型 → 大型 | 大型企业 | 大型企业 | 中型 → 大型 | 小型 → 中型 | 超大型 | 小型 |

## 详细分析

### Turborepo

```bash
npx create-turbo@latest
# 或添加到现有 monorepo
npm install turbo --save-dev
```

- **定位**: Vercel 推出的高性能 monorepo 任务调度器
- **核心原理**: 基于 `turbo.json` 的任务管道 + 本地/远程缓存
- **优势**:
  - **配置极简**，`turbo.json` 几行即可启动
  - 与 pnpm/npm/yarn 无缝配合，不替换包管理器
  - 远程缓存服务成熟 (Vercel 托管或自托管)
  - 优秀的任务并行和依赖调度
  - 与 Next.js/Vercel 生态深度整合
- **劣势**:
  - 不提供代码生成/脚手架
  - 高级功能（如分布式任务执行）不如 Nx
  - 生态插件较少
- **适用场景**: 以任务调度和缓存为核心的 monorepo，Next.js 全栈项目

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```json
// package.json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.4.0"
  }
}
```

### Nx

```bash
npx create-nx-workspace@latest
# 或集成到现有项目
npx nx@latest init
```

- **定位**: 企业级 monorepo 工具集，覆盖从生成到部署的全链路
- **核心原理**: 项目图 (Project Graph) + 任务图 + 计算缓存 + 代码生成
- **优势**:
  - **最全面的功能集**：缓存、代码生成、迁移、CI 优化
  - **项目图可视化** 强大，依赖关系一目了然
  - `nx affected` 精准识别变更影响范围
  - Nx Cloud 提供分布式任务执行 (DTE)
  - 丰富的插件生态 (React, Angular, Node, Rust 等)
  - `nx release` 原生支持版本管理和发布
- **劣势**:
  - 学习曲线最陡峭
  - 引入专有配置和概念较多
  - 对小型项目可能过重
- **适用场景**: 大型企业 monorepo、需要代码生成和标准化工作流的项目

```json
// nx.json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "cache": true
    }
  },
  "affected": {
    "defaultBase": "main"
  },
  "plugins": [
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "testTargetName": "test"
      }
    }
  ],
  "nxCloudAccessToken": "..."
}
```

```bash
# 常用命令
nx build my-app
nx test my-lib
nx affected:build --base=main   # 仅构建受影响项目
nx graph                        # 查看项目依赖图
nx release --first-release      # 发布管理
```

```typescript
// 使用 Nx Generator 创建库
// npx nx g @nx/js:lib utils --unitTestRunner=vitest

// libs/utils/src/lib/utils.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
```

### Rush

```bash
npm install -g @microsoft/rush
rush init
```

- **定位**: Microsoft 设计的企业级 monorepo 管理工具
- **核心原理**: 严格的版本策略 + 独立包发布 + 构建缓存
- **优势**:
  - **版本策略严格** (`rush update` 统一版本)
  - 支持 `rush publish` 自动化发布
  - 子集安装 (`rush install -t my-app`)
  - 适合大量独立发布的包
- **劣势**:
  - 配置复杂，概念多（Version Policy, Change Files）
  - 社区相对小众
  - 学习曲线陡峭
- **适用场景**: 需要严格版本管理的大型企业工具库 (如 Microsoft 内部)

```json
// rush.json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": "5.112.0",
  "pnpmVersion": "8.14.0",
  "nodeSupportedVersionRange": ">=18.0.0 <21.0.0",
  "projects": [
    {
      "packageName": "@myapp/app",
      "projectFolder": "apps/myapp"
    },
    {
      "packageName": "@myapp/ui",
      "projectFolder": "libs/ui"
    }
  ]
}
```

```bash
# Rush 工作流
rush update          # 安装并统一版本
rush rebuild         # 全量构建
rush build           # 增量构建
rush change          # 提交变更日志
rush publish         # 发布包
```

### Bit

```bash
npx @teambit/bvm install
bit init --harmony
```

- **定位**: 组件驱动开发 (Component-Driven Development, CDD) 平台
- **核心原理**: 将组件作为独立发布单元，每个组件可独立开发、测试、发布
- **优势**:
  - **组件级版本控制**，非项目级
  - 组件可在不同项目间共享和组合
  - Bit Cloud 提供组件托管和文档
  - 独立的组件开发环境 (Component Dev Envs)
- **劣势**:
  - 理念与传统 monorepo 差异大
  - 需深度采用 Bit 生态
  - 自托管成本较高
- **适用场景**: 设计系统、组件库、跨项目组件共享

```bash
# Bit 工作流
bit create react ui/button     # 创建组件
bit test ui/button             # 测试组件
bit tag --all --message "update button"  # 版本标记
bit export                     # 发布到远程 Scope
```

```typescript
// components/ui/button/button.tsx
import React from 'react'

export type ButtonProps = {
  text: string
  onClick?: () => void
}

export function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>
}
```

### pnpm Workspaces

```bash
pnpm init
# 创建 pnpm-workspace.yaml
```

- **定位**: 包管理器原生的 workspace 功能，轻量级 monorepo 基础
- **核心原理**: 单仓库多包，共享 `pnpm-lock.yaml`，通过 `--filter` 操作子包
- **优势**:
  - **零额外工具**，pnpm 内置
  - `--filter` 语法强大，支持依赖图过滤
  - 与 Turborepo/Nx 可叠加使用
  - 原生内容寻址存储节省空间
- **劣势**:
  - 无任务缓存功能
  - 无增量构建能力
  - 无 affected 分析
- **适用场景**: 小型 monorepo，或作为 Turborepo/Nx 的底层包管理器

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'
```

```json
// package.json (root)
{
  "scripts": {
    "build:all": "pnpm -r build",
    "test:all": "pnpm -r test",
    "build:affected": "pnpm --filter '...[HEAD~1]' build",
    "dev:web": "pnpm --filter @myapp/web dev"
  }
}
```

```bash
# pnpm workspace 过滤语法
pnpm --filter @myapp/ui build
pnpm --filter './apps/*' test
pnpm --filter '...[origin/main]' build    # 对比分支的变更
pnpm -r exec pwd                          # 所有 workspace 执行命令
```

### Bazel

```bash
# 安装 Bazelisk (Bazel 版本管理器)
npm install -g @bazel/bazelisk
```

- **定位**: Google 开源的通用构建系统，支持多语言超大型仓库
- **核心原理**: 声明式构建规则 + 沙盒执行 + 远程缓存/执行
- **优势**:
  - **构建正确性最强**（严格依赖声明）
  - 支持远程执行，可利用集群构建
  - 多语言统一构建（JS/TS/Java/Go/C++）
  - 适合超大规模仓库 (Google 内部使用)
- **劣势**:
  - 学习曲线极高
  - JavaScript 生态支持需规则集 (`rules_js`)
  - 配置极其繁琐（BUILD 文件）
  - 对前端开发者不友好
- **适用场景**: 超大型跨语言 monorepo（数千+包）

```starlark
# BUILD.bazel
load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "app_ts",
    srcs = glob(["src/**/*.ts"]),
    tsconfig = "tsconfig.json",
    deps = [
        "//libs/shared",
    ],
)

js_binary(
    name = "app",
    data = [":app_ts"],
    entry_point = "src/main.js",
)
```

### Lerna

```bash
npx lerna init
```

- **定位**: 早期 JavaScript monorepo 工具，现由 Nx 团队维护
- **核心原理**: 基于 git 和 npm 的包版本管理与发布工具
- **优势**:
  - 历史最久，概念简单
  - `lerna version` 和 `lerna publish` 流程成熟
- **劣势**:
  - **核心功能被取代**：Turborepo/Nx 提供更好任务调度
  - 无构建缓存
  - 无任务编排
  - 维护状态转为"使用 Nx 替代"
- **适用场景**: 仅需要版本发布管理的小型 legacy 项目

```json
// lerna.json
{
  "version": "independent",
  "npmClient": "pnpm",
  "command": {
    "publish": {
      "conventionalCommits": true
    }
  }
}
```

## 性能对比

| 指标 | Turborepo | Nx | Rush | Bit | pnpm Workspaces | Bazel | Lerna |
|------|-----------|-----|------|-----|-----------------|-------|-------|
| **任务调度速度** | ⚡ 极快 | ⚡ 极快 | 🚀 快 | 🚀 快 | 🐢 无调度 | ⚡ 极快 | 🐢 串行 |
| **缓存命中率** | 🟢 高 | 🟢 极高 | 🟢 高 | 🟢 高 | 🔴 无 | 🟢 极高 | 🔴 无 |
| **增量构建** | ✅ 文件级 | ✅ 文件级 | ✅ 包级 | ✅ 组件级 | ❌ | ✅ 文件级 | ❌ |
| **远程分布式执行** | ❌ | ✅ Nx Cloud | ❌ | ✅ Bit Cloud | ❌ | ✅ 原生 | ❌ |
| **启动配置复杂度** | ⭐ 低 | ⭐⭐⭐ 高 | ⭐⭐⭐ 高 | ⭐⭐⭐ 高 | ⭐ 最低 | ⭐⭐⭐⭐ 极高 | ⭐ 低 |

## 功能对比

| 功能 | Turborepo | Nx | Rush | Bit | pnpm Workspaces | Bazel | Lerna |
|------|-----------|-----|------|-----|-----------------|-------|-------|
| **任务管道定义** | ✅ `turbo.json` | ✅ `project.json` | ✅ `command-line.json` | ✅ 组件管道 | ❌ | ✅ BUILD规则 | ❌ |
| **本地构建缓存** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **远程构建缓存** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Affected 分析** | ✅ `--filter` | ✅ `nx affected` | ✅ `rush build` | ✅ | ❌ | ✅ 查询 | ❌ |
| **代码生成/脚手架** | ❌ | ✅ 丰富 | ❌ | ✅ | ❌ | ❌ | ❌ |
| **包发布管理** | 🔵 外部工具 | ✅ `nx release` | ✅ `rush publish` | ✅ `bit export` | 🔵 外部工具 | ❌ | ✅ |
| **依赖图可视化** | ✅ `turbo run` | ✅ `nx graph` | ❌ | ✅ Bit UI | ❌ | ✅ | ❌ |
| **IDE 集成** | 🔵 有限 | ✅ Nx Console | ❌ | ✅ Bit IDE | ❌ | ❌ | ❌ |
| **DTE (分布式任务执行)** | ❌ | ✅ Nx Cloud | ❌ | ❌ | ❌ | ✅ | ❌ |
| **包管理器耦合** | 🟢 无 (任意) | 🟢 无 (任意) | 🟡 推荐 pnpm | 🔴 深度绑定 | 🔴 自身 | 🟢 无 | 🟡 推荐 npm |

## 选型建议

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| 中小型项目快速启动 | pnpm Workspaces + Turborepo | 配置简单，性能优秀 |
| 大型 Next.js/Vercel 项目 | Turborepo | 生态深度整合 |
| 企业级全功能 monorepo | Nx | 最全面的工具链 |
| 需要代码生成和标准模板 | Nx | Generator 生态最丰富 |
| 严格版本控制 + 独立发布 | Rush | Microsoft 企业级实践 |
| 设计系统/组件驱动开发 | Bit | 组件级开发理念 |
| 超大型跨语言仓库 | Bazel | 远程执行 + 多语言支持 |
| 遗留 Lerna 项目 | 迁移至 Nx 或 Turborepo | Lerna 已停止积极开发 |
| 追求最轻量方案 | pnpm Workspaces | 零额外依赖 |

## 组合方案推荐

```bash
# 最流行组合: pnpm + Turborepo
pnpm init
pnpm add -D turbo
# 配置 turbo.json + pnpm-workspace.yaml

# 企业级组合: pnpm + Nx
npx create-nx-workspace --pm=pnpm

# 极致性能: pnpm + Turborepo + Remote Cache
# 配置 TURBO_TOKEN / TURBO_TEAM 环境变量
```

| 层级 | 工具 | 职责 |
|------|------|------|
| 包管理 | pnpm | 依赖安装、workspace 隔离 |
| 任务调度 | Turborepo / Nx | 缓存、并行、管道 |
| 代码规范 | ESLint + Prettier + Changesets | 统一代码风格和发布日志 |
| CI/CD | GitHub Actions | 自动化构建和发布 |

## 2026 趋势与展望

| 趋势 | 描述 | 影响 |
|------|------|------|
| **Rust 化完成** | Nx Crystal、Turborepo v2 全面 Rust 化，性能提升 5-10x | 🔥 极高 |
| **AI 集成** | Nx MCP Server、AI 辅助代码生成和 CI 自修复 | 🔥 高 |
| **远程缓存普及** | 成为 Monorepo 标配，CI 构建时间降至秒级 | 🔥 高 |
| **统一版本管理** | pnpm Catalog、Changesets 成为开源发布标准 | 🔥 高 |
| **多语言 Monorepo** | Moon、Bazel 支持 JS/Rust/Go 混合工作区 | 中 |
| **分布式任务执行** | Nx Cloud DTE 支持超大型仓库并行构建 | 中 |
| **零配置趋势** | 工具趋向开箱即用，减少 boilerplate | 中 |

### 选型决策矩阵（2026）

| 场景 | 首选 | 次选 | 避免 |
|------|------|------|------|
| 小团队 (2-5人) | pnpm + Turborepo | Bun workspaces | Bazel |
| 中型团队 (5-20人) | pnpm + Nx | pnpm + Turborepo | Lerna |
| 大型团队 (20-100人) | Nx + Nx Cloud | Turborepo + Remote Cache | 纯 pnpm |
| 超大规模 / 多语言 | Bazel / Moon | Nx | Turborepo |
| Next.js / Vercel | Turborepo | Nx | - |
| Angular 企业 | Nx | - | - |
| 设计系统 / 组件库 | Bit | Nx | Turborepo |
| 遗留项目维护 | 迁移至 Nx | 迁移至 Turborepo | Lerna |

### 迁移路径

**Lerna → Turborepo/Nx**

```bash
# 1. 移除 lerna
npm uninstall lerna

# 2. 安装 Turborepo
npm install -D turbo

# 3. 创建 turbo.json，映射原有脚本
# 4. 使用 Changesets 替代 lerna version/publish
```

**npm Workspaces → pnpm Workspaces**

```bash
# 1. 生成 pnpm-workspace.yaml
echo "packages:\n  - 'packages/*'\n  - 'apps/*'" > pnpm-workspace.yaml

# 2. 迁移 lockfile
rm package-lock.json
pnpm install

# 3. 更新 CI 脚本
```

---

## 参考资源
