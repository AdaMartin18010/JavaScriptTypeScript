# 包管理器对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | npm (v10) | Yarn v1 | Yarn Berry (v4) | pnpm (v10) | Bun (v1.2) | Deno (v2) |
|------|-----------|---------|-----------------|------------|------------|-----------|
| **GitHub Stars** | 25k (cli) | 6k (classic) | 6k (modern) | 32k | 76k | 100k (denoland) |
| **活跃维护状态** | 🟢 活跃 | 🔴 仅维护 | 🟢 活跃 | 🟢 活跃 | 🟢 活跃 | 🟢 活跃 |
| **安装速度** | 🐢 慢 | 🐢 慢 | 🚀 快 | ⚡ 极快 | ⚡ 极快 | ⚡ 极快 |
| **磁盘空间占用** | 🟡 高 (重复) | 🟡 高 | 🟢 低 (PnP/压缩) | 🟢 最低 (硬链接) | 🟢 低 | 🟢 低 (全局缓存) |
| **Monorepo 支持** | 🟡 基础 workspaces | 🟡 基础 workspaces | 🟢 原生 | 🟢 原生 | 🟡 基础 | 🟡 基础 |
| **Workspace 支持** | 🔵 `workspaces` | 🔵 `workspaces` | 🟢 `workspace:`协议 | 🟢 过滤/并行 | 🔵 基础 | 🔵 基础 |
| **Lock 文件格式** | `package-lock.json` | `yarn.lock` | `yarn.lock` + `.pnp.cjs` | `pnpm-lock.yaml` | `bun.lockb` | `deno.lock` |
| **Content-addressable 存储** | 🔴 不支持 | 🔴 不支持 | 🟢 PnP 压缩包 | 🟢 内容寻址 | 🟢 内容寻址 | 🟢 全局缓存 |
| **幽灵依赖 (Phantom)** | 🔴 存在 | 🔴 存在 | 🟢 严格 (PnP) | 🟢 严格 | 🟢 严格 | 🟢 严格 |
| **执行脚本安全性** | 🔴 无校验 | 🔴 无校验 | 🟢 `checksum` | 🟢 默认安全 | 🟢 内置校验 | 🟢 权限模型 |
| **内置命令丰富度** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TypeScript 支持度** | 🔵 需 `ts-node`/`tsx` | 🔵 需配置 | 🔵 需配置 | 🔵 需配置 | 🟢 原生执行 `.ts` | 🟢 原生支持 |

## 详细分析

### npm (Node Package Manager)

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
  - `package-lock.json` 锁定版本精确
  - v10 引入性能改进 (`node_modules` 更快)
- **劣势**:
  - 安装速度相对慢
  - 磁盘占用大（重复依赖）
  - 幽灵依赖问题
  - 无内置 monorepo 高级功能
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
  - 严格的依赖校验机制
- **劣势**:
  - PnP 兼容性仍需适配（如 ESLint/Vite 需插件）
  - 学习曲线陡峭
  - 某些工具链未完全适配
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

```bash
npm install -g pnpm
pnpm init
pnpm add react react-dom

# Monorepo 工作区
pnpm -r build
pnpm --filter @myapp/ui test
```

- **定位**: 基于内容寻址存储的高性能包管理器
- **核心原理**: 全局存储 + 硬链接/`node_modules` 严格结构
- **优势**:
  - **磁盘占用最低**（全局去重）
  - **安装速度最快** 之一
  - 原生解决幽灵依赖（`node_modules` 严格扁平）
  - Workspace 过滤和并行执行极其强大
  - 支持 `workspace:` 协议
- **劣势**:
  - 某些工具假设传统 `node_modules` 结构可能不兼容
  - 全局存储需定期清理
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

```bash
npm install -g bun
bun init
bun add react react-dom

# 原生运行 TypeScript
bun run index.ts
```

- **定位**: 全功能 JavaScript 运行时 + 包管理器 + 构建工具 + 测试运行器
- **核心原理**: Zig 编写，追求极致性能
- **优势**:
  - **包管理速度极快**（并行 + 优化算法）
  - **原生执行 TypeScript**（无需 `ts-node`）
  - 内置测试运行器 (`bun test`)
  - 内置打包器 (`Bun.build`)
  - 兼容 npm 生态
- **劣势**:
  - 相对年轻，边缘 case 仍在修复
  - Linux/macOS 优先，Windows 支持持续完善
  - 某些原生 Node.js API 行为有差异
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

[test]
coverage = true
```

### Deno

```bash
# 使用 install script 或包管理器安装
deno init my-project
cd my-project

# 添加依赖
deno add npm:react npm:react-dom

# 原生运行 TS
deno run main.ts

# 权限控制运行
deno run --allow-net --allow-read server.ts
```

- **定位**: 安全的现代 JavaScript/TypeScript 运行时
- **核心原理**: 默认沙箱 + URL/JSR 导入 + 原生 TS
- **优势**:
  - **原生 TypeScript** 支持最完善
  - 默认安全（显式权限模型）
  - 标准库丰富（无需 `lodash/fs-extra`）
  - 支持 `npm:` 前缀兼容 npm 生态
  - 内置格式化、测试、打包工具
  - JSR (JavaScript Registry) 现代包发布平台
- **劣势**:
  - 与 Node.js/npm 生态仍有摩擦
  - `node_modules` 模式需显式启用 (`--node-modules-dir`)
  - 某些 Node.js 特有 API 需适配层
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
    "react-dom": "npm:react-dom@^19.0.0"
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

## 性能对比

| 指标 | npm | Yarn v1 | Yarn Berry | pnpm | Bun | Deno |
|------|-----|---------|------------|------|-----|------|
| **冷安装 (无缓存)** | ~45s | ~40s | ~25s | ~20s | ~10s | ~15s |
| **热安装 (有缓存)** | ~15s | ~12s | ~8s | ~5s | ~3s | ~5s |
| **磁盘占用 (100 deps)** | ~500MB | ~500MB | ~150MB (PnP) | ~180MB | ~200MB | ~200MB |
| **Lock 文件解析** | 中 | 中 | 快 | 快 | 极快 | 快 |
| **内存占用** | 高 | 高 | 中 | 低 | 低 | 低 |

## 功能对比

| 功能 | npm | Yarn v1 | Yarn Berry | pnpm | Bun | Deno |
|------|-----|---------|------------|------|-----|------|
| **Workspaces** | ✅ | ✅ | ✅ 高级 | ✅ 最强 | ✅ 基础 | ✅ 基础 |
| **Overrides/Resolutions** | ✅ `overrides` | ✅ `resolutions` | ✅ 强大 | ✅ `pnpm.overrides` | ✅ `overrides` | 🔵 `npm:` 指定版本 |
| **Plug'n'Play** | ❌ | ❌ | ✅ 默认 | ❌ | ❌ | ❌ |
| **Zero Install** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Global Store** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Peer Dependencies 自动安装** | 🟡 v7+ 变化 | ✅ | ✅ | ✅ 智能 | ✅ | ✅ |
| **Lifecycle Scripts 安全** | 🔴 无校验 | 🔴 无校验 | 🟢 校验和 | 🟢 默认忽略 | 🟢 内置 | 🟢 权限控制 |
| **Patch 依赖** | ❌ | ❌ | ✅ `patch:` | ✅ `pnpm patch` | ❌ | 🔵 有限 |
| **Workspace 依赖范围** | ❌ | ❌ | ✅ `workspace:` | ✅ `workspace:` | ❌ | ❌ |
| **原生命令别名** | `npm i` | `yarn` | `yarn` | `pnpm i` | `bun i` | `deno add` |
| **内置 TS 执行** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Lock 文件可读性** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ (二进制) | ⭐⭐⭐ |

## 选型建议

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| 通用 Node.js 项目 | npm / pnpm | npm 零配置，pnpm 性能优 |
| 大型 Monorepo | pnpm / Yarn Berry | Workspace 过滤 + 严格依赖管理 |
| 追求极致安装速度 | Bun / pnpm | 并行安装 + 内容寻址 |
| 磁盘空间敏感 | pnpm / Yarn Berry | 全局存储或压缩缓存 |
| 需要 PnP 严格模式 | Yarn Berry | 彻底消除幽灵依赖 |
| 全 TypeScript 项目 | Bun / Deno | 原生执行，无需构建步骤 |
| 安全/沙箱需求 | Deno | 显式权限模型 |
| 边缘计算/Serverless | Bun / Deno | 启动快，体积小 |
| 遗留项目维护 | npm / Yarn v1 | 最小迁移成本 |
| 统一工具链 (包+构建+测试) | Bun | 单一工具覆盖全链路 |

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

### 注意事项

- **Yarn v1 → Yarn Berry**: 非简单升级，需评估 PnP 兼容性
- **任意 → Deno**: 需迁移到 Deno 的模块系统或使用 `npm:` 前缀
- **Monorepo 工具链**: pnpm + Turborepo 是当前社区最活跃的组合
