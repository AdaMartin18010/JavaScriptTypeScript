---
title: 包管理器对比矩阵
description: "2025-2026 年 包管理器对比矩阵 对比矩阵，覆盖主流方案选型数据与工程实践建议"
---

# 包管理器对比矩阵

> 最后更新：2026年5月

## 核心对比表

| 特性 | npm (v10) | Yarn v1 | Yarn Berry (v4) | pnpm (v10) | Bun (v1.2) | Deno (v2) |
|------|-----------|---------|-----------------|------------|------------|-----------|
| **GitHub Stars** | 25.6k (cli) | 6k (classic) | 6.3k (modern) | 32.8k | 78.2k | 103k (denoland) |
| **活跃维护状态** | 🟢 活跃 (随 Node.js 发布) | 🔴 仅维护 | 🟢 活跃 | 🟢 活跃 | 🟢 活跃 | 🟢 活跃 |
| **安装速度** | 🐢 慢 | 🐢 慢 | 🚀 快 | ⚡ 极快 | ⚡ 极快 | ⚡ 极快 |
| **磁盘空间占用** | 🟡 高 (重复) | 🟡 高 | 🟢 低 (PnP/压缩) | 🟢 最低 (硬链接) | 🟢 低 | 🟢 低 (全局缓存) |
| **Monorepo 支持** | 🟡 基础 workspaces | 🟡 基础 workspaces | 🟢 原生 | 🟢 原生 | 🟡 基础 | 🟡 基础 |
| **Workspace 支持** | 🔵 `workspaces` | 🔵 `workspaces` | 🟢 `workspace:`协议 + Constraints | 🟢 过滤/并行/Catalog | 🔵 基础 | 🔵 基础 |
| **Lock 文件格式** | `package-lock.json` (v3) | `yarn.lock` | `yarn.lock` + `.pnp.cjs` | `pnpm-lock.yaml` | `bun.lockb` | `deno.lock` |
| **Content-addressable 存储** | 🔴 不支持 | 🔴 不支持 | 🟢 PnP 压缩包 | 🟢 内容寻址存储 | 🟢 内容寻址 | 🟢 全局缓存 |
| **幽灵依赖 (Phantom)** | 🔴 存在 | 🔴 存在 | 🟢 严格 (PnP) | 🟢 严格 (非扁平) | 🟢 严格 | 🟢 严格 |
| **执行脚本安全性** | 🟡 `npm audit` + Provenance | 🔴 无校验 | 🟢 `checksum` + Constraints | 🟢 默认安全 | 🟢 内置校验 | 🟢 权限模型 |
| **内置命令丰富度** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TypeScript 支持度** | 🔵 需 `ts-node`/`tsx` | 🔵 需配置 | 🔵 需配置 | 🔵 需配置 | 🟢 原生执行 `.ts` | 🟢 原生支持 |
| **供应链安全 (SBOM/SLSA)** | 🟡 部分支持 | 🔴 不支持 | 🟡 部分支持 | 🟡 部分支持 | 🔴 不支持 | 🟢 内置权限 |

*数据来源：GitHub Stars (2026年5月)，各工具官方文档*

## 详细分析

### npm (Node Package Manager)

> **Stars**: 25.6k (npm/cli) | **版本状态**: v10.x (随 Node.js 20/22 LTS 发布) | **适用场景**: 所有 Node.js 项目，追求最大兼容性、企业合规、官方支持

```bash
# 初始化项目
npm init -y

# 安装依赖
npm install react react-dom

# 运行脚本
npm run dev
```

- **定位**: Node.js 官方包管理器，生态最广
- **核心原理**: 扁平化依赖树 + `node_modules` 目录
- **优势**:
  - 与 Node.js 捆绑，无需额外安装
  - 生态兼容性最好
  - `package-lock.json` v3 锁定版本精确
  - v10 引入性能改进 (`node_modules` 更快)
  - 原生支持 provenance attestations (`npm publish --provenance`)
- **劣势**:
  - 安装速度相对慢
  - 磁盘占用大（重复依赖）
  - 幽灵依赖问题
  - 无内置 monorepo 高级功能
  - 生命周期脚本默认无校验
- **适用场景**: 所有 Node.js 项目，尤其是追求最大兼容性的场景

```json
// package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

### Yarn Classic (v1)

> **Stars**: 6k | **版本状态**: 仅维护，不再新增功能 | **适用场景**: 遗留项目维护，**不建议新项目使用**

```bash
npm install -g yarn
yarn init -y
yarn add react react-dom
```

- **定位**: Facebook 推出的快速、可靠、安全的依赖管理工具（v1 已停止新功能开发）
- **核心原理**: 扁平化 + `yarn.lock` 确定性安装
- **优势**:
  - 并行下载比早期 npm 快
  - `yarn.lock` 格式可读性好
  - 本地缓存机制成熟
- **劣势**:
  - **v1 已进入维护模式**，不再新增功能
  - 同样存在幽灵依赖问题
  - 磁盘占用未优化
- **适用场景**: 遗留项目维护，不建议新项目使用

```yaml
# .yarnrc
registry "https://registry.npmmirror.com"
cache-folder ".yarn-cache"
```

### Yarn Berry / Yarn Modern (v4)

> **Stars**: 6.3k (modern) | **版本状态**: v4.x 活跃开发，PnP 为默认模式 | **适用场景**: 大型 monorepo、对安全性和确定性要求高的企业项目

```bash
corepack enable
corepack prepare yarn@stable --activate
yarn init -2

# 启用 node-modules 或 PnP 模式
yarn config set nodeLinker pnp  # 或 node-modules
```

- **定位**: 下一代包管理器，Plug'n'Play (PnP) 开创者
- **核心原理**: 默认不生成 `node_modules`，通过 `.pnp.cjs` 映射依赖路径
- **优势**:
  - **PnP 模式**彻底消除幽灵依赖
  - 依赖以压缩包形式存储，磁盘占用极小
  - `zero-install` 可将缓存提交到 Git
  - `workspace:` 协议强大
  - 严格的依赖校验机制 (checksums)
  - `constraints` 用 JavaScript/Prolog 写依赖规则
- **劣势**:
  - PnP 兼容性仍需适配（如 ESLint/Vite 需插件）
  - 学习曲线陡峭
  - 某些工具链未完全适配
  - 社区份额被 pnpm 侵蚀
- **适用场景**: 大型 monorepo、对安全性要求高的企业项目

```yaml
# .yarnrc.yml
cacheFolder: ./.yarn/cache
enableGlobalCache: false
nodeLinker: pnp

# 工作区配置
workspaces:
  - packages/*
```

```json
// package.json (workspace 协议)
{
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/utils": "workspace:^1.0.0"
  }
}
```

### pnpm

> **Stars**: 32.8k | **版本状态**: v10.x 活跃，v9 引入 Catalogs | **适用场景**: Monorepo、磁盘空间敏感、CI/CD、追求性能的现代项目

```bash
npm install -g pnpm
pnpm init
pnpm add react react-dom

# Monorepo 工作区
pnpm -r build
pnpm --filter @myapp/ui test
```

- **定位**: 基于内容寻址存储的高性能包管理器
- **核心原理**: 全局存储 + 硬链接/`node_modules` 严格结构 (非扁平)
- **优势**:
  - **磁盘占用最低**（全局去重，硬链接共享）
  - **安装速度最快** 之一
  - 原生解决幽灵依赖（`node_modules` 严格扁平）
  - Workspace 过滤和并行执行极其强大
  - 支持 `workspace:` 协议
  - v9+ 引入 **Catalogs** 跨 workspace 统一版本
  - `pnpm patch` 原生支持依赖补丁
- **劣势**:
  - 某些工具假设传统 `node_modules` 结构可能不兼容
  - 全局存储需定期清理 (`pnpm store prune`)
- **适用场景**: Monorepo、磁盘空间敏感、CI/CD 场景

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

# .npmrc (配合 pnpm)
shamefully-hoist=false
strict-peer-dependencies=false
```

```json
// package.json
{
  "scripts": {
    "build:all": "pnpm -r build",
    "test:changed": "pnpm --filter '...[HEAD~1]' test"
  }
}
```

### Bun

> **Stars**: 78.2k | **版本状态**: v1.2.x 活跃，Windows 支持持续改善 | **适用场景**: 追求极致性能、全栈工具链统一、边缘计算、全 TypeScript 项目

```bash
npm install -g bun
bun init
bun add react react-dom

# 原生运行 TypeScript
bun run index.ts
```

- **定位**: 全功能 JavaScript 运行时 + 包管理器 + 构建工具 + 测试运行器
- **核心原理**: Zig 编写，追求极致性能，使用系统调用优化 I/O
- **优势**:
  - **包管理速度极快**（并行 + 优化算法 + Syscall 批量操作）
  - **原生执行 TypeScript**（无需 `ts-node`）
  - 内置测试运行器 (`bun test`)
  - 内置打包器 (`Bun.build`)
  - 兼容 npm 生态 (`bun install` 读取 package.json)
  - 内置 SQLite 支持 (`bun:sqlite`)
- **劣势**:
  - 相对年轻，边缘 case 仍在修复
  - Linux/macOS 优先，Windows 支持持续完善 (v1.2 大幅改进)
  - 某些原生 Node.js API 行为有差异
  - 供应链安全工具链尚不成熟 (audit, SBOM)
  - `bun.lockb` 为二进制格式，不利于代码审查
- **适用场景**: 追求极致性能、全栈工具链统一、边缘计算

```typescript
// index.ts — Bun 原生执行
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('Hello from Bun!')
  },
})

console.log(`Running at http://localhost:${server.port}`)
```

```toml
# bun.toml (可选配置)
[install]
registry = "https://registry.npmjs.org"
cache = true

[test]
coverage = true
```

### Deno

> **Stars**: 103k (denoland/deno) | **版本状态**: v2.x 活跃，npm 兼容成熟 | **适用场景**: 安全敏感应用、边缘计算 (Deno Deploy)、现代 TS 项目、JSR 生态

```bash
# 使用 install script 或包管理器安装
deno init my-project
cd my-project

# 添加依赖
deno add npm:react npm:react-dom
deno add jsr:@std/http

# 原生运行 TS
deno run main.ts

# 权限控制运行
deno run --allow-net --allow-read server.ts
```

- **定位**: 安全的现代 JavaScript/TypeScript 运行时
- **核心原理**: 默认沙箱 + URL/JSR 导入 + 原生 TS + npm 兼容层
- **优势**:
  - **原生 TypeScript** 支持最完善
  - 默认安全（显式权限模型 `--allow-*`）
  - 标准库丰富（无需 `lodash/fs-extra`）
  - 支持 `npm:` 前缀兼容 npm 生态
  - 内置格式化、测试、打包工具
  - JSR (JavaScript Registry) 现代包发布平台
  - `deno.json` 替代 package.json 管理依赖
- **劣势**:
  - 与 Node.js/npm 生态仍有摩擦
  - `node_modules` 模式需显式启用 (`--node-modules-dir`)
  - 某些 Node.js 特有 API 需适配层
  - 工具链生态仍在追赶 npm
- **适用场景**: 安全敏感应用、边缘计算 (Deno Deploy)、现代 TS 项目

```typescript
// main.ts — Deno 原生执行
import { serve } from 'jsr:@std/http@0.224.0/server'

serve((_req) => new Response('Hello Deno!'), { port: 8000 })
```

```json
// deno.json
{
  "imports": {
    "react": "npm:react@^19.0.0",
    "react-dom": "npm:react-dom@^19.0.0",
    "@std/http": "jsr:@std/http@^1.0.0"
  },
  "tasks": {
    "start": "deno run --allow-net server.ts",
    "test": "deno test"
  },
  "compilerOptions": {
    "strict": true
  }
}
```

---

## npm v10+ 深度解析

npm v10 随 Node.js 20 LTS 于 2023 年 10 月发布，v10.x 系列持续演进，在性能、安全性和 workspace 策略方面均有显著提升。

### 性能改进

| 改进项 | v9 及之前 | v10+ | 来源 |
|--------|-----------|------|------|
| 依赖解析算法 | 串行为主 | 并行解析 + 缓存优化 | npm 官方博客 |
| `node_modules` 写入 | 逐个写入 | 批量 fs 操作 | Node.js 性能工作组 |
| 安装大型 monorepo | ~45s (无缓存) | ~35s (无缓存) | 社区基准测试 |
| 内存占用 | 较高 | 降低约 15% | npm v10 Release Notes |

- **并行下载优化**：v10 重构了依赖解析引擎，利用 Node.js 的 Worker Threads 并行处理依赖树解析
- **`node_modules` 写入加速**：采用批量文件系统操作，减少 Syscall 次数
- **缓存策略改进**：全局缓存目录结构优化，命中缓存时安装速度提升约 20%

### Workspace 策略

npm v10 增强了内置 workspaces 支持，但仍为基础级别：

```json
// package.json
{
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "build": "npm run build --workspaces",
    "test:pkg-a": "npm run test --workspace=packages/a"
  }
}
```

- **优点**：零配置，与 Node.js 捆绑，开箱即用
- **局限**：
  - 无 workspace 过滤语法（如 `pnpm --filter`）
  - 无并行执行能力
  - 无跨 workspace 依赖版本统一机制
  - 生命周期脚本在 workspace 间串行执行

### Audit 安全

npm v10 在供应链安全方面持续投入：

```bash
# 运行安全审计
npm audit

# 自动修复（仅限不破坏兼容性的更新）
npm audit fix

# 发布时附加 provenance 证明
npm publish --provenance --access public
```

- **`npm audit` 改进**：v10 引入了更精确的漏洞数据库匹配，减少误报
- **Provenance Attestations**：通过 Sigstore 基础设施，npm 包可附加不可伪造的发布来源证明，消费者可在 npm 网站查看 "Provenance" 徽章
- **SBOM 生成** (实验性)：`npm sbom` 命令可生成 SPDX 或 CycloneDX 格式的软件物料清单
- **局限**：生命周期脚本 (`postinstall`) 默认无校验和检查，恶意脚本仍可直接执行

---

## pnpm v9+ 深度解析

pnpm v9 于 2024 年 4 月发布，v9.5+ 引入了 **Catalogs** 协议，进一步巩固了其在 monorepo 领域的统治地位。

### Content-addressable Store

pnpm 的核心创新在于全局内容寻址存储：

```
~/.pnpm-store/v3/
  files/
    xx/xxxxxxx...xxx  # 以文件内容哈希命名
  metadata/
    ...
```

- **全局去重**：同一文件在不同项目中仅存储一份，通过硬链接（hard link）或符号链接（symbolic link）引用
- **磁盘占用最低**：100 个依赖的项目在 pnpm 下约占用 180MB，npm/Yarn v1 约 500MB
- **跨项目共享**：同一机器上的所有项目共享同一存储，新项目的 "冷安装" 实际多为链接操作
- **存储清理**：`pnpm store prune` 移除未被引用的文件

### Hoist 策略

pnpm 默认采用 **非扁平化** 的 `node_modules` 结构，彻底解决幽灵依赖：

```
node_modules/
  .pnpm/                    # 虚拟存储，实际依赖位置
    react@18.3.1/
      node_modules/react/   # 真实包内容
    lodash@4.17.21/
      node_modules/lodash/
  react -> .pnpm/react@18.3.1/node_modules/react  # 顶层软链接（仅直接依赖）
```

- **`shamefully-hoist`**: 设为 `true` 时模拟 npm 的扁平化结构，仅在兼容性问题严重时使用
- **`strict-peer-dependencies`**: 设为 `true` 时严格检查 peer dependencies，帮助发现隐式依赖问题
- **`.npmrc` 配置**：

```ini
# .npmrc
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
node-linker=isolated
```

### Catalog 协议 (v9.5+)

Catalogs 允许在 monorepo 顶层统一声明依赖版本，各子包引用 catalog 而非硬编码版本：

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

catalog:
  react: ^18.3.1
  typescript: ^5.8.2
  vite: ^6.0.0

catalogs:
  react19:
    react: ^19.0.0
    react-dom: ^19.0.0
```

```json
// packages/ui/package.json
{
  "dependencies": {
    "react": "catalog:",
    "typescript": "catalog:"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "react": "catalog:react19"
  }
}
```

- **优势**：跨 workspace 统一版本，升级只需改一处；避免 "依赖版本漂移"
- **与 Yarn `workspace:` 对比**：Catalog 管理 "外部依赖版本"，`workspace:` 管理 "内部 workspace 引用"

---

## Yarn v4 深度解析

Yarn v4 (Berry) 于 2023 年 10 月发布，默认启用 PnP 模式，同时通过 Corepack 深度集成 Node.js。

### Plug'n'Play (PnP)

PnP 是 Yarn Berry 的核心创新，彻底抛弃 `node_modules` 目录：

```
项目根目录/
  .pnp.cjs          # 依赖映射表 (CommonJS)
  .pnp.loader.mjs   # ESM Loader
  .yarn/
    cache/          # 依赖压缩包 (.zip)
      react-npm-18.3.1-xxx.zip
```

- **原理**：Node.js 的 `require` / `import` 被拦截，Yarn 通过 `.pnp.cjs` 映射模块标识符到缓存中的压缩包
- **零幽灵依赖**：只有显式声明的依赖才能被 `require`，彻底消除隐式依赖风险
- **启动优化**：无需遍历巨大的 `node_modules` 目录，模块解析时间降低 50%+
- **兼容性适配**：
  - Vite: 需 `@yarnpkg/plugin-vite` 或 `nodeLinker: node-modules`
  - ESLint: 需 `@yarnpkg/eslint-config` 或设置 `resolvePluginsRelativeTo`
  - TypeScript: 需 `typescript` 本身支持或 `nodeLinker: node-modules`

### Zero-install

Zero-install 允许将依赖缓存提交到 Git，实现 "clone 即运行"：

```bash
# 启用 zero-install
yarn config set enableGlobalCache false
yarn config set compressionLevel mixed

# 将缓存提交到 Git
git add .yarn/cache
git commit -m "chore: check in yarn cache"
```

- **优势**：CI/CD 无需网络安装，构建速度极快；离线开发完全可行
- **代价**：仓库体积增大（但压缩包经 dedupe 后通常 <100MB）
- **适用场景**：对构建确定性要求极高的企业 CI、离线环境

### Constraints

Constraints 允许用 JavaScript 或 Prolog 编写依赖规则：

```javascript
// constraints.pro (Prolog 语法)
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:*', DependencyType) :-
  workspace_ident(DependencyCwd, DependencyIdent),
  DependencyType \= 'peerDependencies'.
```

```javascript
// constraints.js (JavaScript 语法，Yarn v4+)
exports.constraints = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    workspace.set('license', 'MIT');
  }
};
```

- **用途**：强制所有 workspace 使用相同的许可证、强制内部依赖使用 `workspace:` 协议、禁止特定依赖版本
- **执行**：`yarn constraints`（或 `yarn install` 时自动检查）

---

## Bun 包管理器深度解析

Bun 的包管理器是其全栈工具链的核心组件之一，由 Zig 语言编写，追求 I/O 层面的极致优化。

### 内置安装机制

```bash
# 安装单个包
bun add react

# 安装并添加到 devDependencies
bun add -d typescript

# 根据 package.json 安装（兼容 npm 格式）
bun install

# 使用特定 registry
bun add react --registry https://registry.npmmirror.com
```

- **Zig 实现**：绕过 Node.js 的抽象层，直接使用系统调用进行文件和网络 I/O
- **Syscall 批量优化**：Linux/macOS 上使用 `io_uring` 或 `kqueue` 批量处理文件系统操作
- **并行解析**：依赖树解析、下载、解压、链接全流水线并行
- **兼容性**：读取 `package.json`、`bun.lockb`，支持 npm registry 和 scoped packages

### Lockfile 格式 (`bun.lockb`)

- **格式**：二进制（使用 MessagePack-like 编码）
- **优点**：解析速度极快（比 YAML/JSON 快 10x+），体积小
- **缺点**：
  - **不可人工阅读**：无法通过 Git diff 审查依赖变更
  - **不可人工编辑**：无法手动修复 lockfile 冲突
  - **工具生态限制**：Dependabot、Snyk 等安全工具支持不完善
- **最佳实践**：`bun.lockb` 应提交到 Git，但团队需接受其不可读性

### 性能基准 (2026)

| 场景 | npm v10 | pnpm v10 | Yarn v4 (PnP) | Bun v1.2 |
|------|---------|----------|---------------|----------|
| 冷安装 1000 deps | ~45s | ~20s | ~25s | **~10s** |
| 热安装 1000 deps | ~15s | ~5s | ~8s | **~3s** |
| 添加单个包 | ~8s | ~3s | ~5s | **~1s** |
| 磁盘占用 | ~500MB | ~180MB | ~150MB | ~200MB |

*数据来源：社区基准测试 (benchmark.js, 2026年4月)，实际结果因网络环境和硬件而异*

---

## Deno 包管理深度解析

Deno v2 (2024年10月) 彻底重构了 npm 兼容层，使其成为 Deno 生态与 npm 生态之间的桥梁。

### npm 兼容机制

```typescript
// 1. npm: 前缀
import express from 'npm:express@^4.18.0';

// 2. deno.json 映射
// {
//   "imports": { "express": "npm:express@^4.18.0" }
// }
import express from 'express';

// 3. node_modules 模式（与 Node.js 完全兼容）
// deno install --node-modules-dir
```

- **`npm:` 前缀**：显式标记 npm 依赖，Deno 会自动下载并缓存到 `~/.cache/deno/npm/`
- **`deno install`**：解析 `deno.json` 中的 `npm:` 依赖，可选择生成 `node_modules` 目录
- **`--node-modules-dir`**：完全兼容 Node.js 的解析算法，支持 `require()` 和 `node_modules` 查找
- **全局缓存**：npm 包缓存于 Deno 全局缓存，跨项目共享

### JSR 注册表集成

```bash
# 添加 JSR 包
deno add jsr:@std/http
deno add jsr:@luca/flag

# 在代码中使用
import { serve } from '@std/http/server';
```

- **JSR (JavaScript Registry)**：Deno 官方推出的现代包注册表
- **原生 TS 发布**：包作者直接发布 TypeScript 源码，无需预编译为 JS + `.d.ts`
- **自动文档生成**：JSR 自动从 JSDoc/TSDoc 生成文档和类型定义
- **npm 兼容层**：JSR 包自动转译为 npm 兼容格式，可在 Node.js 中通过 `jsr:` 或 npm 安装使用

---

## JSR (JavaScript Registry)

> **Stars**: N/A (Deno 子项目) | **版本状态**: 2024年正式发布，2025-2026 快速增长 | **适用场景**: 原生 TypeScript 库发布、跨运行时（Deno/Node/Bun）兼容包

JSR 是 Deno 团队于 2024 年推出的现代 JavaScript/TypeScript 包注册表，旨在解决 npm 在 TypeScript 时代的结构性问题。

### 核心特性

| 特性 | npm | JSR |
|------|-----|-----|
| 发布格式 | 预编译 JS + .d.ts | **原生 TypeScript 源码** |
| 类型定义 | 手动维护 `.d.ts` | 自动生成 |
| 文档 | 需第三方工具 | 自动生成 |
| 运行时支持 | Node.js 为主 | Deno/Node/Bun 全支持 |
| 权限控制 | 组织/团队权限 | 基于 Deno Deploy 账户 |
| 评分系统 | 无 | 内置包质量评分 |

### 原生 TS 发布

```typescript
// 直接发布 TS 源码到 JSR
// jsr.json (或 deno.json)
{
  "name": "@myorg/utils",
  "version": "1.0.0",
  "exports": {
    ".": "./mod.ts",
    "./async": "./async/mod.ts"
  }
}
```

- **无需构建步骤**：`jsr publish` 直接上传 TS 文件
- **自动类型提取**：JSR 服务器分析 TS AST 生成类型定义
- **自动文档**：从 JSDoc 生成交互式文档页面
- **ESM 优先**：仅支持 ESM，推动生态向现代模块标准迁移

### 选型建议

- **适合 JSR**：TypeScript 优先的库、工具函数、跨运行时 SDK
- **仍用 npm**：需要 CJS 兼容、已有大量 npm 用户、原生模块 (`.node`)

*数据来源：jsr.io 官方文档, Deno 博客 (2024-2025)*

---

## Workspace 策略对比

Monorepo 是现代前端工程的主流组织形式，各工具对 workspace 的支持差异显著。

### 功能对比矩阵

| 功能 | npm Workspace | pnpm Workspace | Yarn v4 Workspace | Turborepo |
|------|---------------|----------------|-------------------|-----------|
| **包管理器** | npm | pnpm | Yarn | 任意 (任务编排) |
| **Workspace 协议** | ❌ | ✅ `workspace:` | ✅ `workspace:` | N/A |
| **跨包过滤** | ❌ | ✅ `--filter` | ✅ `--since` | ✅ `--filter` |
| **并行执行** | ❌ | ✅ 内置 | ✅ 内置 | ✅ 核心功能 |
| **任务拓扑排序** | ❌ | ❌ | ❌ | ✅ 依赖图分析 |
| **远程缓存** | ❌ | ❌ | ❌ | ✅ Vercel 托管 |
| **Catalog 版本统一** | ❌ | ✅ | ❌ | N/A |
| **Constraints 约束** | ❌ | ❌ | ✅ | ❌ |
| **生命周期脚本隔离** | 🟡 基础 | 🟢 严格 | 🟢 严格 | 🟢 严格 |

### npm Workspace

```json
{
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "npm run build --workspaces",
    "test:a": "npm run test --workspace=pkg-a"
  }
}
```

- **优点**：零配置，随 Node.js 内置
- **缺点**：无过滤、无并行、无拓扑排序、版本统一管理困难

### pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

catalog:
  react: ^18.3.1
```

```bash
# 过滤执行
pnpm --filter "@myorg/**" build
pnpm --filter "...[HEAD~1]" test   # 仅变更的包

# 并行执行
pnpm -r --parallel exec echo "hello"
```

- **优点**：过滤语法最强大、Catalog 统一版本、存储去重
- **最佳组合**：`pnpm` + `Turborepo` 是当前社区最活跃的 monorepo 技术栈

### Yarn v4 Workspace

```yaml
# .yarnrc.yml
nodeLinker: pnp
workspaces:
  - packages/*
```

```bash
# 仅自上次提交以来变更的 workspace
yarn workspaces foreach --since run build

# 拓扑排序执行
yarn workspaces foreach --topological run build
```

- **优点**：PnP 严格依赖、Constraints 约束、zero-install
- **缺点**：PnP 兼容性适配成本高，社区活跃度下降

### Turborepo

> **Stars**: 26.5k | **版本状态**: v2.x 活跃，Vercel 旗下 | **适用场景**: 大型 monorepo 任务编排、远程缓存加速 CI

Turborepo **不是包管理器**，而是任务运行器（task runner），与上述工具互补：

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.ts", "tests/**/*.ts"]
    }
  }
}
```

```bash
# 执行拓扑排序的构建
turbo run build

# 仅变更的包
turbo run test --filter=[HEAD~1]

# 远程缓存
turbo login
turbo run build --remote-only
```

- **核心能力**：依赖图分析、拓扑排序执行、本地/远程缓存、 impacted package 计算
- **最佳实践**：pnpm + Turborepo 已成为 2025-2026 年 monorepo 的 "黄金组合"

*数据来源：Turborepo 官方文档, State of JS 2025*

---

## Lockfile 格式深度对比

Lockfile 是确定性安装的核心保障，各工具的 lockfile 设计哲学差异显著。

### 格式对比矩阵

| 特性 | `package-lock.json` v3 | `pnpm-lock.yaml` | `yarn.lock` v4 | `bun.lockb` | `deno.lock` |
|------|------------------------|------------------|----------------|-------------|-------------|
| **格式** | JSON | YAML | 自定义文本 | **二进制** | JSON |
| **可读性** | ⭐⭐ (冗长) | ⭐⭐⭐⭐ (结构化) | ⭐⭐⭐ (清晰) | ⭐ (不可读) | ⭐⭐⭐ |
| **解析速度** | 中 | 快 | 快 | **极快** | 快 |
| **文件大小** | 大 (~1MB/100deps) | 中 (~300KB) | 中 (~400KB) | **极小** (~50KB) | 小 |
| **Git Diff 友好** | ❌ (单行) | ✅ | ✅ | ❌ (二进制) | ✅ |
| **合并冲突处理** | 差 (需 `npm install`) | 优 (结构化) | 优 | 差 (需 `bun install`) | 优 |
| **人类可编辑** | ❌ 不推荐 | ⚠️ 谨慎 | ⚠️ 谨慎 | ❌ 不可能 | ⚠️ 谨慎 |
| **校验和信息** | ✅ 有 | ✅ 有 | ✅ 有 | ✅ 有 | ✅ 有 |

### `package-lock.json` (v3)

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": { "dependencies": { "react": "^18.0.0" } },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAg...",
      "license": "MIT"
    }
  }
}
```

- **v3 改进**：扁平化的 `packages` 结构，比 v2 的依赖树结构更小
- **缺点**：JSON 文件大，Git diff 不友好（尤其当依赖变动时产生大量行变更）
- **合并冲突**：通常需要删除 lockfile 重新生成，导致版本漂移风险

### `pnpm-lock.yaml`

```yaml
lockfileVersion: '9.0'
settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false
importers:
  .:
    dependencies:
      react:
        specifier: ^18.3.1
        version: 18.3.1
packages:
  react@18.3.1:
    resolution: {integrity: sha512-wS+hAg...}
    engines: {node: '>=0.10.0'}
```

- **优点**：YAML 结构清晰，`importers` 与 `packages` 分离，适合 monorepo；合并冲突相对容易手动修复
- **Catalog 支持**：v9+ 将 catalog 依赖单独标记，便于追踪来源

### `yarn.lock` (v4)

```
"react@npm:^18.3.1":
  version: 18.3.1
  resolution: "react@npm:18.3.1"
  checksum: abcdef1234567890abcdef1234567890abcdef12
  languageName: node
  linkType: hard
```

- **优点**：字段分隔清晰，包含 `checksum` 和 `languageName`
- **与 PnP 配合**：`yarn.lock` 记录元数据，实际依赖存储在 `.yarn/cache/*.zip`

### `bun.lockb`

- **二进制格式**：使用类 MessagePack 编码，解析速度是 YAML/JSON 的 10 倍以上
- **不可读性代价**：代码审查时无法直观看到依赖版本变化，安全审计困难
- **工具兼容性**：GitHub Dependabot、Snyk Code 等安全扫描工具对 `bun.lockb` 支持不完善 (2026年)

### `deno.lock`

```json
{
  "version": "4",
  "specifiers": {
    "npm:react@^18": "18.3.1"
  },
  "npm": {
    "react@18.3.1": {
      "integrity": "sha512-wS+hAg...",
      "dependencies": { "loose-envify": "^1.1.0" }
    }
  },
  "workspace": ["./packages/ui"]
}
```

- **设计哲学**：不仅锁定 npm 包，还锁定 `jsr:`、`https://` 等所有远程依赖
- **完整性**：`integrity` 字段使用 Subresource Integrity 格式

---

## 供应链安全对比

2024-2026 年，软件供应链攻击（如 xz utils 后门事件）使包管理器安全成为焦点。

### 安全功能矩阵

| 安全功能 | npm | pnpm | Yarn v4 | Bun | Deno |
|----------|-----|------|---------|-----|------|
| **Audit 漏洞扫描** | ✅ `npm audit` | ✅ `pnpm audit` | ✅ `yarn npm audit` | ❌ 无原生支持 | ✅ `deno audit` (第三方) |
| **Lockfile 校验和** | ✅ | ✅ | ✅ (checksum) | ✅ | ✅ |
| **Provenance (Sigstore)** | ✅ `npm publish --provenance` | ❌ 需手动 | ❌ 需手动 | ❌ 不支持 | ❌ 不支持 |
| **SBOM 生成** | ✅ `npm sbom` (实验性) | 🟡 第三方工具 | 🟡 第三方工具 | ❌ | 🟡 第三方工具 |
| **生命周期脚本校验** | 🔴 无 | 🟢 默认安全 | 🟢 checksum | 🟢 内置 | 🟢 权限模型 |
| **依赖范围约束** | ❌ | ❌ | ✅ Constraints | ❌ | ❌ |
| **Sigstore 验证** | 🟡 消费端验证 | 🟡 消费端验证 | 🟡 消费端验证 | ❌ | ❌ |
| **SLSA 合规** | 🟡 Level 1 | ❌ | ❌ | ❌ | ❌ |

### Audit 机制

```bash
# npm audit
npm audit --audit-level moderate
npm audit fix

# pnpm audit
pnpm audit --prod

# Yarn audit
yarn npm audit --all --recursive
```

- **原理**：对比已安装包的版本与 NPM Advisory Database 中的已知漏洞
- **局限**：Audit 只能检测 "已知" 漏洞，无法防御 0-day 或恶意包（如 typo-squatting）

### SBOM (Software Bill of Materials)

```bash
# npm SBOM (实验性，v10+)
npm sbom --format cyclonedx --type library > sbom.json

# 第三方工具
npx @cyclonedx/cyclonedx-npm --output-file sbom.xml
```

- **SPDX**：Linux Foundation 标准，广泛用于许可证合规
- **CycloneDX**：OWASP 标准，侧重安全漏洞追踪
- **现状**：npm 原生支持实验性 SBOM 生成，pnpm/Yarn 需第三方工具

### Sigstore / Provenance

- **Sigstore**：由 Linux Foundation 维护的免费软件签名基础设施
- **npm Provenance**：`npm publish --provenance` 将包的发布来源（GitHub Actions 工作流、提交 SHA）绑定到包上
- **消费者验证**：npm 网站显示 "Provenance" 徽章，CLI 可验证签名
- **局限**：仅 npm 官方 registry 深度集成，私有 registry 需自建 Sigstore 实例

### SLSA (Supply-chain Levels for Software Artifacts)

- **SLSA Level 1**：构建过程需有记录（npm provenance 满足）
- **SLSA Level 2**：使用版本控制和托管构建服务（GitHub Actions + npm 满足）
- **SLSA Level 3**：构建环境需隔离且不可变（目前前端包管理器生态尚未普及）
- **现状**：npm 是前端生态中 SLSA 支持最完善的，但距离 Level 3 仍有差距

---

## 性能对比

| 指标 | npm v10 | Yarn v1 | Yarn Berry v4 | pnpm v10 | Bun v1.2 | Deno v2 |
|------|---------|---------|---------------|----------|----------|---------|
| **冷安装 (无缓存, 1000 deps)** | ~45s | ~40s | ~25s | ~20s | **~10s** | ~15s |
| **热安装 (有缓存, 1000 deps)** | ~15s | ~12s | ~8s | ~5s | **~3s** | ~5s |
| **增量添加单个包** | ~8s | ~7s | ~5s | ~3s | **~1s** | ~2s |
| **磁盘占用 (100 deps)** | ~500MB | ~500MB | ~150MB (PnP) | **~180MB** | ~200MB | ~200MB |
| **Lock 文件解析** | 中 | 中 | 快 | 快 | **极快** | 快 |
| **内存占用** | 高 | 高 | 中 | 低 | **低** | 低 |
| **网络请求优化** | 串行为主 | 并行 | 并行 | 并行 | **批量+复用** | 并行 |

*数据来源：社区基准测试 (benchmark.js, 2026年4月)，基于 React + Next.js 项目模板，macOS M3, 1Gbps 网络。实际结果因环境而异。*

### 关键洞察

1. **Bun 在速度上领先**：冷安装和热安装均大幅领先，得益于 Zig 实现的底层 I/O 优化
2. **pnpm 在磁盘占用上最优**：全局内容寻址存储 + 硬链接，1000 个依赖项目间几乎零额外存储
3. **Yarn PnP 解析最快**：运行时模块解析速度比 `node_modules` 遍历快 50%+，但安装速度不及 pnpm/Bun
4. **npm 仍是最慢**：v10 虽有改进，但架构层面的扁平化 `node_modules` 限制了性能上限

---

## 功能对比

| 功能 | npm v10 | Yarn v1 | Yarn Berry v4 | pnpm v10 | Bun v1.2 | Deno v2 |
|------|---------|---------|---------------|----------|----------|---------|
| **Workspaces** | ✅ 基础 | ✅ 基础 | ✅ 高级 (PnP + Constraints) | ✅ 最强 (过滤/Catalog) | ✅ 基础 | ✅ 基础 |
| **Overrides/Resolutions** | ✅ `overrides` | ✅ `resolutions` | ✅ 强大 | ✅ `pnpm.overrides` | ✅ `overrides` | 🔵 `npm:` 指定版本 |
| **Plug'n'Play** | ❌ | ❌ | ✅ 默认 | ❌ | ❌ | ❌ |
| **Zero Install** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Global Store** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Peer Dependencies 自动安装** | 🟡 v7+ 变化 | ✅ | ✅ | ✅ 智能处理 | ✅ | ✅ |
| **Lifecycle Scripts 安全** | 🟡 `npm audit` | 🔴 无校验 | 🟢 checksum 校验 | 🟢 默认忽略可选 | 🟢 内置校验 | 🟢 权限控制 |
| **Patch 依赖** | ❌ | ❌ | ✅ `patch:` | ✅ `pnpm patch` | ❌ | 🔵 有限 |
| **Workspace 依赖范围** | ❌ | ❌ | ✅ `workspace:` | ✅ `workspace:` | ❌ | ❌ |
| **原生命令别名** | `npm i` | `yarn` | `yarn` | `pnpm i` | `bun i` | `deno add` |
| **内置 TS 执行** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Lock 文件可读性** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ (二进制) | ⭐⭐⭐ |
| **Catalog 版本统一** | ❌ | ❌ | ❌ | ✅ v9.5+ | ❌ | ❌ |
| **内置测试运行器** | ❌ | ❌ | ❌ | ❌ | ✅ `bun test` | ✅ `deno test` |
| **内置打包器** | ❌ | ❌ | ❌ | ❌ | ✅ `Bun.build` | ✅ `deno compile` |
| **SQLite 内置** | ❌ | ❌ | ❌ | ❌ | ✅ `bun:sqlite` | ❌ |

---

## 选型决策树

```
开始选型
│
├─ 是否使用 Node.js 运行时？
│  ├─ 否 (Deno/Bun 运行时)
│  │  ├─ 需要最大生态兼容性？ → Bun (npm 兼容 + 极致性能)
│  │  └─ 重视安全/沙箱？ → Deno (权限模型 + JSR)
│  │
│  └─ 是 (Node.js)
│     ├─ 项目规模？
│     │  ├─ 大型 Monorepo (10+ 包)
│     │  │  ├─ 需要 PnP 严格模式？ → Yarn v4 (Constraints + zero-install)
│     │  │  └─ 追求性能 + 易用性？ → pnpm + Turborepo (社区主流)
│     │  │
│     │  ├─ 中型项目 (3-10 包)
│     │  │  └─ 需要 workspace 版本统一？ → pnpm (Catalog 协议)
│     │  │
│     │  └─ 小型项目/单包
│     │     ├─ 追求零配置？ → npm (随 Node.js 内置)
│     │     └─ 追求安装速度？ → pnpm (磁盘 + 速度双赢)
│     │
│     ├─ 供应链安全要求？
│     │  ├─ 极高 (金融/医疗) → npm (Provenance + SBOM) 或 Yarn v4 (Constraints)
│     │  └─ 一般 → pnpm / Bun
│     │
│     └─ 团队技术栈偏好？
│        ├─ 全 TypeScript → Bun (原生执行)
│        ├─ 统一工具链 → Bun (包+构建+测试)
│        └─ 渐进式迁移 → pnpm (兼容 npm，渐进增强)
```

### 快速选型表

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| 通用 Node.js 项目 | **npm** / **pnpm** | npm 零配置，pnpm 性能优 |
| 大型 Monorepo | **pnpm + Turborepo** / **Yarn v4** | Workspace 过滤 + 远程缓存 / PnP 严格模式 |
| 追求极致安装速度 | **Bun** / **pnpm** | 并行安装 + 内容寻址 |
| 磁盘空间敏感 | **pnpm** / **Yarn Berry** | 全局存储或压缩缓存 |
| 需要 PnP 严格模式 | **Yarn Berry** | 彻底消除幽灵依赖 |
| 全 TypeScript 项目 | **Bun** / **Deno** | 原生执行，无需构建步骤 |
| 安全/沙箱需求 | **Deno** | 显式权限模型 |
| 边缘计算/Serverless | **Bun** / **Deno** | 启动快，体积小 |
| 遗留项目维护 | **npm** / **Yarn v1** | 最小迁移成本 |
| 统一工具链 (包+构建+测试) | **Bun** | 单一工具覆盖全链路 |
| 原生 TS 库发布 | **JSR** | 无需预编译，自动文档 |
| 企业合规/审计 | **npm** (Provenance) / **Yarn v4** | Sigstore / Constraints |

---

## 2026 趋势展望

### 趋势一：pnpm 持续统治

- **市场份额**：pnpm 在新建项目中的采用率从 2023 年的 15% 上升到 2026 年的 **35%+** (State of JS 2025 数据)
- **驱动因素**：
  - monorepo 成为主流，pnpm 的 workspace 体验最佳
  - Catalog 协议解决版本漂移痛点
  - 与 Turborepo 的 "黄金组合" 深入人心
- **预测**：2026-2027 年，pnpm 将在中大型项目中超越 npm 成为首选

### 趋势二：Bun 挑战者地位确立

- **稳定性**：Bun v1.2 (2025年) 大幅改善了 Windows 支持和 Node.js API 兼容性
- **全栈吸引力**："一个工具替代 npm + vite + jest + ts-node" 的愿景吸引初创团队
- **局限**：
  - 企业级供应链安全工具链（audit、SBOM、Sigstore）尚不成熟
  - `bun.lockb` 二进制格式在代码审查场景仍有阻力
- **预测**：Bun 将在性能敏感型项目（边缘计算、CLI 工具）中占据重要份额，但在传统企业渗透有限

### 趋势三：JSR 崛起与原生 TS 发布

- **JSR 增长**：2025 年 JSR 包数量突破 10,000，主要覆盖 Deno 标准库和现代工具链
- **npm 的回应**：npm 未推出原生 TS 发布方案，但 TypeScript 团队在推动 "TypeScript 类型即注释" (types as comments) 进入 ECMAScript
- **跨运行时兼容**：JSR 自动转译为 npm 格式的能力，使其成为 "编写一次，发布到 Deno/Node/Bun" 的桥梁
- **预测**：JSR 将在 TypeScript 优先的库生态中占据 20%+ 份额，但不会取代 npm 在应用开发中的地位

### 趋势四：供应链安全成为标配

- **Sigstore 普及**：npm 的 Provenance 功能推动 Sigstore 成为事实标准，预计 2026 年底 30%+ 的流行包将启用 Provenance
- **SBOM 合规**：欧盟 Cyber Resilience Act (CRA) 和美国 EO 14028 推动 SBOM 成为合规要求，npm 原生 `npm sbom` 将成企业刚需
- **SLSA 推进**：前端生态将从 SLSA Level 1 向 Level 2 迈进，GitHub Actions + npm provenance 是主要路径

### 趋势五：Corepack 与包管理器版本管理

- **Corepack 现状**：Node.js 20+ 内置 Corepack，允许项目声明所需的包管理器版本 (`packageManager` 字段)
- **影响**：减少 "全局安装 pnpm/Yarn" 的摩擦，团队统一工具版本更简单
- **局限**：Corepack 本身仍在实验阶段，部分 CI 环境未默认启用

```json
// package.json
{
  "packageManager": "pnpm@10.5.2"
}
```

---

## 迁移建议

### npm → pnpm

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 移除旧 lock 文件
rm package-lock.json

# 3. 重新安装
pnpm install

# 4. 更新 CI 脚本
# - 使用 pnpm/action-setup (GitHub Actions)
```

### npm/yarn → Bun

```bash
# Bun 读取 package.json 直接安装
bun install

# 运行脚本
bun run <script>

# 注意：检查原生依赖兼容性
```

### 任意 → Deno

```bash
# 1. 创建 deno.json
deno init

# 2. 迁移 npm 依赖为 npm: 前缀
# package.json deps → deno.json imports

# 3. 启用 node_modules 模式（过渡阶段）
deno install --node-modules-dir
```

### 注意事项

- **Yarn v1 → Yarn Berry**: 非简单升级，需评估 PnP 兼容性，建议新项目直接选 pnpm 或 Yarn v4
- **任意 → Deno**: 需迁移到 Deno 的模块系统或使用 `npm:` 前缀，大型项目迁移成本高
- **Monorepo 工具链**: `pnpm` + `Turborepo` 是当前社区最活跃的组合，新 monorepo 项目首选
- **Bun 生产环境**: 建议在非关键项目中先行验证，确认原生模块和 CI/CD 工具链兼容性后再全面迁移

---

> **参考来源**
>
> - npm 官方文档: <https://docs.npmjs.com/>
> - pnpm 官方文档: <https://pnpm.io/>
> - Yarn 官方文档: <https://yarnpkg.com/>
> - Bun 官方文档: <https://bun.sh/>
> - Deno 官方文档: <https://docs.deno.com/>
> - JSR 官方文档: <https://jsr.io/docs/>
> - Turborepo 官方文档: <https://turbo.build/>
> - State of JS 2025: <https://stateofjs.com/>
> - Sigstore 文档: <https://docs.sigstore.dev/>
> - SLSA 规范: <https://slsa.dev/>
