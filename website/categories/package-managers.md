---
title: 📦 包管理器全景 2026
description: 2025-2026 年 JavaScript/TypeScript 包管理器完全指南，覆盖 npm、pnpm、yarn、Bun、deno 及 workspace 策略
---

# 📦 包管理器全景 2026

> 最后更新: 2026-05-01

## 概览

| 包管理器 | 市场份额 | 安装速度 | 磁盘占用 | Monorepo | 特点 |
|---------|---------|---------|---------|----------|------|
| **npm** | ~55% | 基准 | 大 | ⚠️ workspaces | 默认，生态基准 |
| **pnpm** | ~30% | 2x npm | **最小** | ✅ 原生 | content-addressable |
| **Yarn** | ~10% | 1.5x npm | 大 | ✅ workspaces | PnP, 零安装 |
| **Bun** | ~3% | **10-100x** | 小 | ✅ 内置 | 一体化运行时 |
| **Deno** | <1% | 快 | 小 | ✅ 内置 | 安全默认，JSR |

---

## 核心工具数据总览

| 工具 | 最新版本 | GitHub Stars | 周下载量 | 许可证 | 状态 |
|------|---------|--------------|---------|--------|------|
| **npm** | 11.13.0 (随 Node 24) | 9,706 | 13.76M | Artistic 2.0 | 稳定 |
| **pnpm** | 10.x | 36,000+ | 72.7M | MIT | 活跃增长 |
| **Yarn (Berry)** | 4.x | 8,065 | 8.66M* | BSD-2-Clause | 维护 |
| **Yarn (Classic)** | 1.22.22 (冻结) | 41,515 | 含于 8.66M* | BSD-2-Clause | 仅安全修复 |
| **Bun** | 1.3.x | 89,000+ | — | MIT | 生产可用 |
| **Deno** | 2.7 | 100,000+ | — | MIT | 活跃增长 |

> *Yarn 的 8.66M 周下载量为 Classic 与 Berry 的合并统计，实际 Berry 占比低于 Classic。

---

## npm v11（随 Node 24 发布）

**版本状态**：稳定版 11.13.0，与 Node.js 24 LTS 捆绑分发。

**关键改进**：

- 性能优化：安装速度较 v10 提升 20-30%
- 安全增强：`npm audit` 自动审计增强，支持 Sigstore 来源证明（provenance）
- 脚本钩子：更灵活的 lifecycle scripts，支持 `pre`、`post` 前缀扩展
- 对等依赖：`peerDependencies` 自动安装策略自 npm 7 延续，冲突提示更友好

**核心机制**：

npm 采用**扁平化 hoisting**策略。自 npm 3 起，npm 尽可能将依赖提升至顶层 `node_modules`，以减少目录嵌套深度。这带来了臭名昭著的**幽灵依赖（Phantom Dependencies）**问题：包 A 可以访问包 B 的依赖，即使 A 并未在 `package.json` 中声明 B。

```bash
# npm 的扁平化结构示例
node_modules/
├── package-a/
├── package-b/      # 被提升，A 可直接 require('package-b')
└── package-c/
```

**Lockfile**：`package-lock.json`（v3 格式）。JSON 结构，可读性较好，但在大型 monorepo 中体积膨胀明显。

**局限**：

- 磁盘占用大（每个项目独立 `node_modules`，无全局去重）
- 幽灵依赖问题未根本解决，导致依赖图不稳定
- Monorepo 支持（npm workspaces，v7+）仅为基础级别，缺乏过滤命令和拓扑执行

---

## pnpm v10

**版本状态**：10.x 活跃开发，2026 年 1 月发布。被 Vite、Vue、Nuxt 官方文档推荐。

| 指标 | 数据 |
|------|------|
| GitHub Stars | ~36,000 |
| 周下载量 | ~72.7M |
| 最新稳定版 | 10.x |

**核心优势**：

```bash
# content-addressable store
~/.pnpm-store/
└── v3/
    └── files/  # 全局去重存储，按内容哈希寻址
```

- **磁盘占用最小**：全局 store + 硬链接（hard links）+ 符号链接（symlinks）。同一依赖在磁盘中仅存一份，跨项目共享
- **严格依赖管理**：依赖隔离结构确保包只能访问自身声明的依赖，**根本解决幽灵依赖**
- **Monorepo 原生**：`pnpm-workspace.yaml` + `pnpm --filter` 过滤命令 + 版本目录（catalogs）
- **性能**：安装速度约为 npm 的 2-3 倍，warm install 优势更明显

**依赖隔离机制**：

pnpm 使用**符号链接 + 硬链接**的混合策略：

```
node_modules/
├── .pnpm/              # 实际依赖存储（硬链接到全局 store）
│   ├── lodash@4.17.21/
│   └── react@18.3.1/
├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash  # 软链接
└── react -> .pnpm/react@18.3.1/node_modules/react      # 软链接
```

每个包的 `node_modules` 目录内仅包含其直接依赖的软链接，配合 `.npmrc` 的 `shamefully-hoist=true` 可在必要时模拟 npm 行为。

**Lockfile**：`pnpm-lock.yaml`。YAML 格式，人类可读，diff 友好，解析速度快。

**2026 新增特性**：

- **Catalogs（版本目录）**：在 monorepo 中统一管理共享依赖版本，减少版本漂移
- 更快的 lockfile 解析与写入
- 改进的 `pnpm patch` 内置补丁工作流

---

## Yarn v4 (Berry)

**版本状态**：Yarn 4.x 活跃维护。Yarn Classic (1.x) 已于 2020 年冻结，仅接收安全补丁。

| 指标 | 数据 |
|------|------|
| GitHub Stars (Berry) | ~8,065 |
| GitHub Stars (Classic) | ~41,515 |
| 周下载量 (合并) | ~8.66M |
| 最新稳定版 | 4.x |

**两个模式**：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **PnP (Plug'n'Play)** | 无 `node_modules`，通过 `.pnp.cjs` 运行时映射依赖位置 | 追求零安装、严格一致性的大型项目 |
| **node_modules** | 传统模式，生成标准 `node_modules` 目录 | 兼容性优先，工具链不支持 PnP 时 |

**核心特性**：

- **零安装（Zero-Installs）**：依赖缓存提交到 Git（`.yarn/cache`），CI 无需网络安装即可构建
- **约束（Constraints）**：用 Prolog 风格 DSL 定义自定义依赖规则（如"所有 workspace 包必须使用同一 React 版本"）
- **交互式升级**：`yarn upgrade-interactive` 体验领先
- **压缩缓存**：依赖以 zip 格式存储，节省磁盘与 I/O

**2026 状态**：

- 新项目采用率持续下降，pnpm 成为大多数 Yarn Classic 用户迁移的首选目标
- 存量大型 monorepo（如 Facebook 内部项目）仍在维护使用
- Berry 的 PnP 模式生态兼容性仍是阻碍，部分工具链需要插件适配

---

## Bun 包管理器

**版本状态**：v1.3.x 稳定版。2025 年初核心团队加入 Anthropic，获充足资源持续迭代。

| 指标 | 数据 |
|------|------|
| GitHub Stars | ~89,000 |
| 最新稳定版 | 1.3.x |
| npm 兼容度 | ~99% |
| 生产采用 | Anthropic、Cursor、Midjourney 等 |

**一体化设计**：

```bash
bun install    # 包管理（兼容 npm 生态）
bun run        # 脚本执行
bun test       # 测试运行器（Jest 兼容）
bun build      # 打包器
bunx           # npx 替代，更快
```

**包管理性能**：

Bun 的安装速度是其最突出的优势。官方及第三方基准测试显示：

| 场景 | npm | pnpm | Bun |
|------|-----|------|-----|
| Cold install（大型项目） | ~14s | ~5s | **~0.8s** |
| Warm install | ~8s | ~2s | **~0.3s** |
| 大型 monorepo (1,847 deps) | 28 min | 4 min | **47s** |

> 数据来源：Bun 官方基准、第三方独立测试（DeployHQ、ByteIota），2026 年 4 月。

**与 npm 兼容性**：

- `package.json` 完全兼容，无需修改即可迁移
- `bun install` 自动读取并迁移 `package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`
- 生命周期脚本默认**不执行**（安全设计），通过 `trustedDependencies` 白名单控制：

```json
{
  "trustedDependencies": ["esbuild", "sharp"]
}
```

**Lockfile 演进**：

| 版本 | Lockfile | 说明 |
|------|---------|------|
| < v1.2 | `bun.lockb` | 二进制格式，解析极快，但不可 diff |
| ≥ v1.2 | `bun.lock` | 文本格式（可选），人类可读，支持 Git diff |

**Workspaces**：Bun 原生支持 workspaces，配置与 npm 类似：

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

Bun 提供两种链接策略：

- **Hoisted Linker（默认）**：模拟 npm/Yarn Classic 的扁平化行为，兼容性最高
- **Isolated Linker（推荐）**：模拟 pnpm 的隔离结构，避免幽灵依赖

```toml
# bunfig.toml
[install]
linker = "isolated"  # 或 "hoisted"
```

**局限**：

- 企业级采用仍偏谨慎，尤其金融、医疗等强合规行业
- 部分 Node.js API 边缘 case 未完全覆盖（如 `vm` 模块、`crypto` 部分方法）
- Windows 支持相对较新，某些原生 addon 编译场景存在问题

---

## Deno 包管理与 JSR

**版本状态**：Deno 2.7 稳定版。Deno 2.0（2024 年 10 月）标志着其从"反 npm"转向"拥抱 npm"。

| 指标 | 数据 |
|------|------|
| GitHub Stars | ~100,000 |
| 最新稳定版 | 2.7 |
| 安全模型 | Deny-by-default 权限 |

**JSR（JavaScript Registry）**：

JSR 由 Deno 团队创建，是一个**TypeScript 优先、ESM 原生**的现代包注册表。其核心设计目标不是取代 npm，而是补齐 npm 在 TypeScript 生态中的短板。

```json
// deno.json
{
  "imports": {
    "@std/path": "jsr:@std/path@^1.0.9"
  }
}
```

**JSR 核心特性**：

- **原生 TypeScript 支持**：作者直接发布 `.ts` 源码，JSR 自动处理 transpile、`.d.ts` 生成和文档
- **ESM Only**：强制使用 ECMAScript 模块，简化 tree-shaking 和静态分析
- **来源证明（Provenance）**：基于 Sigstore 的供应链安全验证
- **npm 兼容层**：JSR 包可通过 `@jsr` scope 被 npm、yarn、pnpm 直接安装

```bash
# 在 Node.js 项目中使用 JSR 包
npx jsr add @std/datetime

# 实际在 package.json 中映射为
# "@std/datetime": "npm:@jsr/std__datetime@^0.224.0"
```

**Deno 的 npm 兼容性层**：

Deno 2.0+ 通过 `npm:` specifier 完全支持 npm 生态：

```ts
import express from "npm:express@^4.18";
```

- Node.js 内置模块兼容：`node:fs`、`node:http` 等通过 polyfill 层支持
- `deno.json` 支持 workspaces，可混合管理 Deno 包与 npm 依赖
- `deno add` / `deno publish` 内置包管理命令，无需额外工具

---

## 深度对比：npm vs pnpm vs Yarn

### Lockfile 机制差异

| 维度 | npm | pnpm | Yarn (Berry) |
|------|-----|------|--------------|
| **文件名** | `package-lock.json` | `pnpm-lock.yaml` | `yarn.lock` |
| **格式** | JSON (v3) | YAML | YAML (自定义) |
| **可读性** | 中等 | **高** | 中等 |
| **Diff 友好度** | 差（大文件） | **优秀** | 良好 |
| **合并冲突率** | 高 | **低** | 中 |
| **解析速度** | 中 | 快 | 快 |
| **确定性** | 是 | 是 | 是 |

**npm lockfile v3** 通过 `packages` 字段扁平化记录所有依赖的解析位置，文件体积随项目规模线性膨胀，合并冲突频发。

**pnpm-lock.yaml** 的 YAML 结构天然适合版本控制，依赖按层级清晰组织，冲突定位更直观。

**Yarn lockfile** 采用自定义 YAML 格式，每行记录一个包的精确解析版本，配合 PnP 的 `.pnp.cjs` 实现零安装。

### Hoisting 策略对比

| 策略 | npm | pnpm | Yarn Classic | Yarn PnP | Bun |
|------|-----|------|--------------|----------|-----|
| **默认结构** | 扁平 hoisting | 隔离 + 硬链接 | 扁平 hoisting | 无 node_modules | 可选 hoisted/isolated |
| **幽灵依赖** | ❌ 存在 | ✅ 杜绝 | ❌ 存在 | ✅ 杜绝 | 取决于 linker |
| **磁盘效率** | 低 | **极高** | 低 | 中（zip 缓存） | 中 |
| **兼容性** | 最高 | 高 | 高 | 需适配 | 高 |

### Monorepo 支持对比

| 特性 | npm workspaces | pnpm workspaces | Yarn workspaces | Turborepo |
|------|----------------|-----------------|-----------------|-----------|
| **配置方式** | `package.json` | `pnpm-workspace.yaml` | `package.json` | `turbo.json` |
| **过滤命令** | ⚠️ 需第三方 | ✅ `pnpm --filter` | ✅ `yarn workspace` | ✅ `turbo run` |
| **拓扑排序** | ❌ | ✅ `pnpm -r --workspace-concurrency` | ✅ | ✅ |
| **版本目录** | ❌ | ✅ Catalogs | ❌ | ❌ |
| **远程缓存** | ❌ | ❌ | ❌ | ✅ |
| **任务管道** | ❌ | ❌ | ❌ | ✅ |
| **最佳场景** | 小型 monorepo | 中型/大型 monorepo | 存量 Yarn 项目 | 超大型 monorepo |

**Turborepo** 本身不是包管理器，而是构建编排层，通常与 pnpm 或 npm workspaces 搭配使用：

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## Workspace 策略详解

### npm Workspaces

自 npm 7 引入，适合 5-10 个包的轻量级 monorepo：

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

```bash
npm install          # 安装所有 workspace 依赖
npm run build -w @myorg/ui   # 在特定 workspace 执行脚本
```

**局限**：缺乏拓扑排序、过滤命令弱、无版本目录管理。

### pnpm Workspaces

目前（2026）Monorepo 领域的事实标准：

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'

# 版本目录（pnpm v10+）
catalog:
  react: ^18.3.1
  typescript: ^5.7.0
```

```bash
pnpm install --filter @myorg/ui...    # 安装 ui 及其所有依赖项
pnpm -r run build                     # 按拓扑顺序递归构建
pnpm --filter ./apps/web add lodash   # 在特定 workspace 添加依赖
```

### Yarn Workspaces

Yarn Berry 提供最复杂的 workspace 约束系统：

```yaml
# .yarnrc.yml
nodeLinker: pnp

# constraints.pro
gen_enforced_dependency(WorkspaceCwd, 'react', '18.3.1', PeerDependency).
```

```bash
yarn workspaces foreach --all run build    # 递归执行
yarn workspace @myorg/ui add react         # 在特定 workspace 添加
```

### Turborepo

Vercel 出品的构建系统，与包管理器解耦：

```bash
# 配合 pnpm 使用（推荐组合）
npx create-turbo@latest

# 远程缓存加速 CI
turbo run build --remote-only
```

---

## 依赖安全与供应链防护

### 内置审计工具

| 工具 | 命令 | 覆盖范围 | 特点 |
|------|------|---------|------|
| **npm audit** | `npm audit` | npm registry 已知漏洞 | 内置，误报率高 |
| **pnpm audit** | `pnpm audit` | npm registry 已知漏洞 | 与 npm 同源，输出更简洁 |
| **Yarn audit** | `yarn npm audit` | npm registry 已知漏洞 | 需 Berry 插件 |

### 第三方安全平台

**Snyk**：

- 商业级供应链安全平台，支持漏洞扫描、许可证合规、容器安全
- 与 GitHub/GitLab/Bitbucket 深度集成，可自动提交修复 PR
- 定价：开源项目免费，企业版按开发者数量计费

**Socket.dev**：

- 2023 年崛起的新型供应链安全工具，专注**恶意包检测**
- 不仅检查已知 CVE，还分析包的行为（如是否引入网络请求、文件系统访问、加密挖矿等）
- 在 CI 中拦截恶意依赖的效果显著，2025-2026 年多次提前发现 typosquatting 攻击
- 开源版免费，Pro 版提供实时告警

```bash
# Socket CLI 使用示例
npm install -g @socketsecurity/cli
socket scan
```

### 依赖冻结策略

**概念**：通过严格的 lockfile 和版本锁定，确保构建可复现，防止"供应链投毒"。

| 策略 | 实现方式 | 适用场景 |
|------|---------|---------|
| **Lockfile 冻结** | CI 中使用 `--frozen-lockfile` / `--immutable` | 所有生产项目 |
| **私有 registry 镜像** | Verdaccio / Artifactory 缓存所有依赖 | 离线环境、合规要求 |
| **依赖白名单** | Socket.dev / Snyk 策略仅允许特定 scope | 金融、医疗等高合规行业 |
| **Sigstore 来源证明** | `npm audit signatures` 验证包签名 | npm provenance 支持的包 |
| **内部审核流程** | 所有新依赖需人工审核后方可引入 | 超大型企业 |

**CI 冻结安装最佳实践**：

```bash
# pnpm
pnpm install --frozen-lockfile

# npm
npm ci

# Yarn Berry
yarn install --immutable

# Bun
bun install --frozen-lockfile
```

---

## 私有 Registry 与镜像

### Verdaccio

- **定位**：轻量级开源私有 npm registry，支持代理缓存和本地发布
- **Stars**：~16,000
- **适用**：中小企业、个人开发者、CI 离线缓存
- **特点**：配置简单（单 YAML 文件）、支持 uplink 缓存 npm 官方包、可对接 LDAP

```yaml
# config.yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '@myorg/*':
    access: $authenticated
    publish: $authenticated
```

### npm Enterprise

- **定位**：GitHub/npm 官方出品的企业级私有 registry
- **适用**：大型组织，需要与 GitHub Enterprise 深度集成
- **特点**：SSO 集成、细粒度权限、审计日志、漏洞扫描内置
- **定价**：按席位收费，通常 $10-20/用户/月

### GitHub Packages

- **定位**：与 GitHub 仓库绑定的包托管服务
- **支持格式**：npm、Docker、Maven、NuGet、RubyGems
- **特点**：与 GitHub Actions 无缝集成、支持 private repo 的 package 权限继承
- **定价**：公开包免费，私有包按存储和传输量计费

```bash
# 发布到 GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

### 其他选项

| 工具 | 类型 | 特点 |
|------|------|------|
| **JFrog Artifactory** | 商业通用制品库 | 多语言支持，企业级 |
| **AWS CodeArtifact** | 托管云服务 | 与 IAM 集成，按请求计费 |
| **Azure Artifacts** | 托管云服务 | 与 Azure DevOps 集成 |
| **Nexus Repository** | 商业/开源 | Sonatype 出品，成熟稳定 |

---

## Lockfile 冲突解决策略

Lockfile 冲突是 monorepo 协作中的高频痛点。各工具推荐的解决方式：

### 策略对比

| 包管理器 | 冲突特征 | 推荐解决方式 |
|---------|---------|-------------|
| **npm** | `package-lock.json` 结构复杂，冲突块大 | 接受"他们的"版本，重新运行 `npm install` |
| **pnpm** | `pnpm-lock.yaml` YAML 结构，冲突定位较清晰 | `pnpm install --no-frozen-lockfile` 自动重新生成 |
| **Yarn** | `yarn.lock` 每行一条记录，冲突分散 | `yarn install` 自动合并并修复 |
| **Bun** | `bun.lock` 文本格式，较简洁 | `bun install` 自动重新生成 |

### 最佳实践

1. **避免多人同时修改依赖**：通过团队规范，统一由专人或自动化流程更新依赖
2. **自动化依赖更新**：使用 Dependabot、Renovate 等工具生成独立的依赖更新 PR，避免与功能代码冲突
3. **CI 强制冻结**：确保所有 lockfile 变更都经过 `npm ci` / `pnpm install --frozen-lockfile` 验证
4. **预提交钩子**：使用 Husky + lint-staged 在提交前检查 lockfile 一致性

```bash
# 示例：lockfile 冲突后的标准恢复流程（pnpm）
git checkout --ours pnpm-lock.yaml
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
```

---

## 选型决策树（2026 版）

```
开始选型
│
├─ 个人项目 / 原型开发
│   ├─ 追求极致安装速度 → Bun
│   ├─ 需要原生 TypeScript → Bun / Deno
│   └─ 最大教程兼容性 → npm
│
├─ 企业级项目（50+ 开发者）
│   ├─ 从零构建 monorepo → pnpm + Turborepo
│   ├─ 强供应链合规要求 → pnpm + Socket.dev / Snyk
│   ├─ 存量 Yarn Classic 迁移 → pnpm（迁移成本与 Yarn 4 相当，生态更好）
│   └─ 存量 Yarn PnP → Yarn 4（维持现状成本最低）
│
├─ Monorepo（多包仓库）
│   ├─ 小型（<10 包）→ npm workspaces（零额外依赖）
│   ├─ 中型（10-50 包）→ pnpm workspaces
│   ├─ 大型（50-200 包）→ pnpm workspaces + Turborepo
│   └─ 超大型（200+ 包 / 多语言）→ Yarn 4 PnP + 自定义约束
│
├─ 边缘 / Serverless 场景
│   ├─ 极致冷启动 → Bun（单二进制，内置打包）
│   ├─ 安全优先 → Deno（权限模型 + JSR）
│   └─ 最大兼容性 → Node.js + pnpm
│
└─ 遗留项目维护
    ├─ npm → 可零风险迁移至 pnpm
    ├─ Yarn Classic → 建议迁移至 pnpm 或 Yarn 4
    └─ Yarn PnP → 保持 Yarn 4，评估迁移 ROI
```

---

## 2026 趋势与展望

1. **pnpm 继续增长**：周下载量已达 npm 本身的 5 倍以上（CI 场景高频重装），新项目采用率预计突破 35%。State of JS 2024 显示 pnpm 的 retention 高达 92%，为所有包管理器中最高。

2. **Bun 的崛起与稳定化**：Bun 从"实验性"标签快速转向"生产可用"。Anthropic 收购后资源投入加大，v1.2 引入文本 lockfile 解决了 Git diff 痛点，v1.3 持续提升 Node.js API 兼容性。预计 2026 年底企业采用率将从 3% 提升至 8-10%。

3. **Yarn 市场份额萎缩**：Yarn Classic 的 41K stars 是历史遗产，Berry 的 8K stars 反映新项目吸引力不足。State of JS 2024 中 Yarn retention 仅 65%，意味着 1/3 的现有用户考虑迁移。Yarn 4 将更多扮演"存量维护"角色。

4. **npm 的防守姿态**：作为 Node.js 默认绑定，npm 仍拥有最高的绝对使用率（~78% 开发者使用过）。但创新节奏慢于竞品，主要策略是吸收成熟特性（如 pnpm 的 overrides、Yarn 的 provenance）。

5. **Corepack 标准化**：Node.js 16+ 内置的 Corepack 工具允许无需全局安装即可使用 pnpm/Yarn：`corepack enable && corepack prepare pnpm@latest --activate`。2026 年更多团队采用 Corepack 统一团队内包管理器版本，减少"本地与 CI 版本不一致"问题。

6. **Deno + JSR 的渐进渗透**：JSR 注册表定位精准（TypeScript 优先、ESM 原生、npm 兼容），OpenAI、Supabase 等已开始发布官方包到 JSR。Deno 的 npm 兼容性层使其不再是"孤岛"，而成为渐进现代化的安全选择。

7. **供应链安全成为必选项**：2025 年的几起高影响 npm 供应链攻击（如 xz-utils 事件的 JS 版、typosquatting 大规模爆发）推动企业强制引入 Socket.dev / Snyk。`npm audit` 已不足以满足生产要求，行为分析 + 白名单成为新基准。

---

## 数据来源

- **下载量与 Stars**：npm registry 公开 API（2026-04-25 查询）、GitHub 官方统计
- **市场份额与 retention**：State of JavaScript 2024 调查报告（22,000+ 开发者样本）
- **安装速度基准**：Bun 官方 benchmark、DeployHQ 独立测试、ByteIota 大型 monorepo 测试
- **生态趋势**：Stack Overflow Developer Survey 2024、各包管理器官方 release notes
- **企业采用案例**：TechCrunch、官方博客、公开技术分享

---

> 数据来源: npm registry, State of JS 2024/2025, Stack Overflow Developer Survey 2024, 各包管理器官方文档与发布说明, Tech Insider, DeployHQ, ByteIota 等第三方基准测试（2026-04 查询）。
