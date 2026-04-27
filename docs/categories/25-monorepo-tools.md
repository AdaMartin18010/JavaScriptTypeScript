---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦 Monorepo 工具链与包管理基础设施。
>
> - ✅ **属于本文档范围**：Monorepo 任务编排工具、构建缓存、Workspace 管理、版本发布工具。
> - ❌ **不属于本文档范围**：具体 Monorepo 的目录结构设计、业务包划分策略、应用架构决策。
> - 🔗 **相关索引**：[`docs/infrastructure-index.md`](../infrastructure-index.md)

# Monorepo 工具

> 本文档盘点 JavaScript/TypeScript 生态中主流的 Monorepo 管理工具，覆盖任务编排、构建缓存、依赖管理、发布工作流等核心维度。数据基于 2026 年 4 月工具现状与社区趋势。

---

## 📊 整体概览

| 工具 | Stars | 定位 | 核心优势 |
|------|-------|------|----------|
| Turborepo | 26k+ | 任务编排与构建缓存 | 极速远程缓存、Vercel 生态 |
| Nx | 25k+ | 全功能 Monorepo 平台 | 图计算、affected 分析、插件生态 |
| Rush | 5k+ | 企业级 Monorepo | 严格版本策略、pnpm 集成 |
| Bit | 17k+ | 组件驱动开发 | 组件独立发布、跨项目复用 |
| Bazel | 23k+ | 通用构建系统 | 增量构建、跨语言、超大规模 |
| Lerna | 7k+ | 包发布管理 | 维护模式，推荐迁移至 Nx |
| pnpm workspaces | — | 包管理 + workspace | 磁盘高效、原生支持 |
| npm workspaces | — | 包管理 + workspace | npm 内置、零配置 |

---

## 1. Turborepo

| 属性 | 详情 |
|------|------|
| **名称** | Turborepo |
| **Stars** | ⭐ 26,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [vercel/turborepo](https://github.com/vercel/turborepo) |
| **官网** | [turbo.build](https://turbo.build) |

**一句话描述**：以任务编排和远程构建缓存为核心竞争力的 Monorepo 工具，被 Vercel 收购后与其部署平台深度整合。

**核心特点**：

- **Pipeline 任务图**：通过 `turbo.json` 定义任务依赖关系，自动并行化无依赖任务
- **本地与远程缓存**：构建输出哈希化缓存，CI 中利用远程缓存将构建时间从分钟降至秒级
- **Affected 分析**：基于 Git 变更只运行受影响的包的任务
- **Vercel 集成**：Remote Cache 免费额度与 Vercel 账号共享
- **Language Agnostic**：支持任何前端/后端构建工具

**适用场景**：

- 以构建缓存为首要诉求的团队
- 已使用 Vercel 生态的项目
- 多包共享编译配置的前端项目

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
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```bash
# 执行 affected 构建
turbo run build --filter=[HEAD^1]

# 利用远程缓存
turbo run build --remote-only
```

---

## 2. Nx

| 属性 | 详情 |
|------|------|
| **名称** | Nx |
| **Stars** | ⭐ 25,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [nrwl/nx](https://github.com/nrwl/nx) |
| **官网** | [nx.dev](https://nx.dev) |

**一句话描述**：功能最全面的 Monorepo 工具，不仅提供任务编排和缓存，还内置代码生成器、模块边界规则和丰富的插件生态。

**核心特点**：

- **项目图（Project Graph）**：可视化包间依赖关系，自动检测循环依赖
- **Affected 命令**：`nx affected:test` 只测试受影响的包
- **Computation Caching**：本地 + Nx Cloud 远程缓存
- **Generators**：代码脚手架（React 组件、Nest 模块、Lib 库）
- **Module Boundary Rules**：ESLint 规则强制架构分层
- **Plugins**：官方支持 React、Angular、NestJS、Next.js、Vite 等
- **Lerna 继承**：Nx 团队接管 Lerna 维护，提供平滑迁移路径

**适用场景**：

- 需要代码生成和架构规范强制的大型团队
- 跨框架 Monorepo（如 React + NestJS + 共享库）
- 需要可视化项目依赖图和模块边界检查

```json
// nx.json
{
  "extends": "nx/presets/npm.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
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
  ]
}
```

```bash
# affected 分析
nx affected -t lint test build

# 查看项目图
nx graph

# 代码生成
nx g @nx/react:lib ui-components
```

---

## 3. Rush

| 属性 | 详情 |
|------|------|
| **名称** | Rush |
| **Stars** | ⭐ 5,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [microsoft/rushstack](https://github.com/microsoft/rushstack) |
| **官网** | [rushjs.io](https://rushjs.io) |

**一句话描述**：微软出品的企业级 Monorepo 管理工具，以严格的版本策略和一致的依赖管理著称，被 Office 365 等大型项目使用。

**核心特点**：

- **严格一致性**：所有包使用同一版本的外部依赖（通过 pnpm/npm/yarn workspace 封装）
- **Bulk 发布**：自动化版本升级、Change Log 生成、Git Tag 打标
- **Linked 依赖管理**：自动将 workspace 包链接为本地引用
- **Build Cache**：基于输入哈希的增量构建
- **pnpm 优先**：深度集成 pnpm，解决 phantom dependency 问题

**适用场景**：

- 大型企业级 Monorepo（数十至数百个包）
- 需要严格依赖版本一致性的团队
- 自动化发布流程要求高的项目

```json
// rush.json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/rush.schema.json",
  "rushVersion": "5.112.0",
  "pnpmVersion": "8.15.0",
  "nodeSupportedVersionRange": ">=18.0.0 <21.0.0",
  "projects": [
    {
      "packageName": "@corp/shared-utils",
      "projectFolder": "packages/shared-utils"
    },
    {
      "packageName": "@corp/web-app",
      "projectFolder": "apps/web-app",
      "decoupledLocalDependencies": ["@corp/shared-utils"]
    }
  ]
}
```

---

## 4. Bit

| 属性 | 详情 |
|------|------|
| **名称** | Bit |
| **Stars** | ⭐ 17,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [teambit/bit](https://github.com/teambit/bit) |
| **官网** | [bit.dev](https://bit.dev) |

**一句话描述**：以组件为中心的开发平台，将组件作为一等公民独立开发、测试、发布和版本管理，支持跨项目/组织复用。

**核心特点**：

- **Component-Driven Development**：每个组件独立版本、独立 CI
- **Ripple CI**：组件变更自动触发下游依赖组件的构建和测试
- **Bit Cloud**：组件托管和发现平台
- **Env（环境）**：为不同组件类型（React、Node、Vue）定义编译/测试/发布环境
- **Composition & Docs**：内置组件预览和文档生成

**适用场景**：

- 设计系统（Design System）开发和维护
- 组件需要在多个独立仓库间共享
- 以组件为交付单元的团队

```bash
# 初始化 Bit workspace
bit init --harmony

# 创建组件
bit create react ui/button

# 独立版本和发布
bit tag --message "button v1.0.0"
bit export
```

---

## 5. Bazel

| 属性 | 详情 |
|------|------|
| **名称** | Bazel |
| **Stars** | ⭐ 23,000+ |
| **TS支持** | ⚠️ 需 rules_nodejs / aspect_rules_ts |
| **GitHub** | [bazelbuild/bazel](https://github.com/bazelbuild/bazel) |
| **官网** | [bazel.build](https://bazel.build) |

**一句话描述**：Google 开源的通用构建系统，以确定性和增量构建著称，可处理超大规模代码库（Google 内部全部使用）。

**核心特点**：

- **确定性构建**：相同输入必定产生相同输出
- **增量构建**：只重新构建变更的依赖图
- **远程执行和缓存**：分布式构建集群
- **跨语言支持**：Java、C++、Go、Python、TypeScript 统一构建
- **Sandboxing**：隔离构建环境，消除隐式依赖

**适用场景**：

- 超大规模 Monorepo（数百至数千个包）
- 多语言混合代码库
- 对构建确定性有极致要求的系统（金融、航天）

> ⚠️ **注意**：Bazel 学习曲线陡峭，JS/TS 生态支持不如 Turborepo/Nx 原生。中小型团队不建议引入。

---

## 6. Lerna

| 属性 | 详情 |
|------|------|
| **名称** | Lerna |
| **Stars** | ⭐ 7,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [lerna/lerna](https://github.com/lerna/lerna) |
| **官网** | [lerna.js.org](https://lerna.js.org) |

**一句话描述**：曾经的 Monorepo 包管理标准工具，专注于版本管理和发布。现由 Nx 团队维护，核心功能已逐步被 Nx 吸收。

**核心特点**：

- Fixed / Independent 版本模式
- 自动 CHANGELOG 生成
- Git 标签和 npm 发布自动化
- `lerna bootstrap` 安装并链接依赖（已被 pnpm workspaces 取代）
- `lerna run` 批量执行脚本（已被 Turborepo/Nx 取代）

**维护状态**：

> ⚠️ **Lerna 处于维护模式**。Nx 团队于 2022 年接管维护，推荐新项目直接使用 Nx 或 Nx-powered Lerna。`lerna bootstrap` 已废弃，改用 pnpm workspaces。

---

## 7. pnpm Workspaces

| 属性 | 详情 |
|------|------|
| **名称** | pnpm Workspaces |
| **TS支持** | ✅ 原生支持 |
| **官网** | [pnpm.io/workspaces](https://pnpm.io/workspaces) |

**一句话描述**：pnpm 内置的 workspace 功能，通过内容寻址存储和符号链接高效管理多包依赖，是多数 Monorepo 工具链的底层基础。

**核心特点**：

- **内容寻址存储**：同一依赖只存一份磁盘空间
- **严格依赖隔离**：无 phantom dependency 问题
- **Workspace 协议**：`workspace:*` 自动解析本地包版本
- **Filter 命令**：`pnpm --filter pkg-name build` 精确执行
- **与 Turborepo/Nx 配合**：作为包管理器 + workspace 基础层

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'
```

```json
// packages/shared/package.json
{
  "name": "@myapp/shared",
  "version": "1.0.0"
}

// apps/web/package.json
{
  "dependencies": {
    "@myapp/shared": "workspace:*"
  }
}
```

```bash
# 安装所有 workspace 依赖
pnpm install

# 只构建 web app 及其依赖
pnpm --filter web-app... build

# 运行所有包的 test
pnpm -r test
```

---

## 8. npm Workspaces

| 属性 | 详情 |
|------|------|
| **名称** | npm Workspaces |
| **TS支持** | ✅ 原生支持 |
| **官网** | [docs.npmjs.com/cli/using-npm/workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) |

**一句话描述**：npm v7+ 内置的 workspace 功能，零额外依赖即可管理多包仓库，适合轻量级 Monorepo。

**核心特点**：

- 零配置，npm 原生支持
- `workspaces` 字段定义包目录
- `npm exec --workspace=pkg-name` 执行命令
- 自动 hoist 公共依赖至根目录

**局限**：

- 无内置任务编排和缓存（需配合 Turborepo/Nx）
- 磁盘空间效率不如 pnpm
- phantom dependency 风险（hoist 机制）

```json
// package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

---

## 9. 核心特性对比

| 维度 | Turborepo | Nx | Rush | Bit | Bazel | Lerna | pnpm ws | npm ws |
|------|:---------:|:--:|:----:|:---:|:-----:|:-----:|:-------:|:------:|
| **任务编排** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ❌ |
| **构建缓存** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ❌ |
| **Affected 分析** | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ | ✅ | ❌ | ❌ | ❌ |
| **代码生成** | ❌ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | ❌ | ❌ | ❌ | ❌ |
| **远程缓存** | ✅ (Vercel) | ✅ (Nx Cloud) | ✅ | ✅ (Bit Cloud) | ✅ | ❌ | ❌ | ❌ |
| **发布管理** | ❌ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | ❌ | ❌ |
| **IDE 支持** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **学习曲线** | 低 | 中 | 高 | 中 | 很高 | 低 | 低 | 很低 |
| **与 JS 生态集成** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **适合规模** | 中-大 | 中-超大 | 大-超大 | 中-大 | 超大 | 小-中 | 任意 | 小 |

---

## 10. 选型建议

### 按团队规模

| 规模 | 推荐方案 | 理由 |
|------|----------|------|
| 小团队 / 个人（2-5人） | **pnpm workspaces** + **Turborepo** | 轻量、快速上手、缓存效果显著 |
| 中型团队（5-20人） | **pnpm workspaces** + **Nx** | 代码生成、架构规范、affected 分析 |
| 大型团队（20-100人） | **Rush** / **Nx** | 严格依赖管理、发布流程、远程缓存 |
| 超大规模 / 多语言 | **Bazel** / **Nx** | 确定性构建、跨语言、分布式 |
| 设计系统团队 | **Bit** | 组件独立发布、跨项目复用 |

### 按技术栈

| 技术栈 | 推荐方案 |
|--------|----------|
| Next.js + Vercel | **Turborepo**（原生集成） |
| React + NestJS 全栈 | **Nx**（官方插件覆盖） |
| Angular 企业应用 | **Nx**（Angular 官方推荐） |
| Vue / Vite | **Nx** 或 **Turborepo** |
| 纯 Node.js 工具库 | **Rush** 或 **pnpm + Turborepo** |

### 按诉求

| 核心诉求 | 推荐方案 |
|----------|----------|
| 极致构建缓存 | **Turborepo** |
| 代码生成 + 架构约束 | **Nx** |
| 严格依赖一致性 | **Rush** |
| 组件独立发布 | **Bit** |
| 超大规模 / 多语言 | **Bazel** |
| 最小化工具引入 | **pnpm workspaces** |

### 相关决策树与对比矩阵

- [Monorepo 工具选型决策树](../../docs/decision-trees.md#8-monorepo-工具选型决策树)
- [Monorepo 工具对比矩阵](../comparison-matrices/monorepo-tools-compare.md)

---

## 11. 最佳实践

### 11.1 目录结构约定

```
my-monorepo/
├── apps/                 # 可部署的应用
│   ├── web/              # Next.js 前端
│   └── api/              # NestJS 后端
├── packages/             # 共享库
│   ├── ui/               # React 组件库
│   ├── config/           # 共享配置（eslint, tsconfig）
│   └── utils/            # 工具函数
├── turbo.json / nx.json  # 任务编排配置
├── pnpm-workspace.yaml   # workspace 定义
└── package.json
```

### 11.2 依赖管理原则

1. **根目录只放全局工具**：lint、test runner、TypeScript、turborepo/nx
2. **业务依赖放在各自 package**：避免 root hoisting 导致的隐式依赖
3. **使用 `workspace:` 协议**：确保本地链接优先
4. **定期 `pnpm dedupe`**：减少依赖版本碎片

### 11.3 CI/CD 优化

```yaml
# GitHub Actions + Turborepo 示例
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # 受影响分析需要完整 Git 历史

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- run: pnpm install
- run: pnpm turbo run build test -- affected --remote-only
```

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Monorepo 工具选型应基于团队规模、构建缓存需求和现有技术栈，避免过度工程化。
