# Monorepo 工具

> Monorepo 工具链选型矩阵：从包管理器工作区到任务编排与缓存的完整决策框架。

---

## 核心概念

Monorepo 工具链通常分为**三个层次**，而非单一工具：

| 层次 | 职责 | 代表工具 |
|------|------|---------|
| **包管理器** | 安装、链接、解析依赖 | pnpm / npm / yarn / Bun |
| **任务编排器** | 依赖感知执行、本地/远程缓存 | Turborepo / Nx / Moon |
| **发布管理器** | 版本策略、变更日志、发布流程 | Changesets / Lerna / Rush |

> **常见误区**：将 pnpm 与 Turborepo 对立比较。pnpm 解决"包如何安装"，Turborepo 解决"任务如何运行"。两者互补而非替代。

---

## 工具对比矩阵

| 维度 | pnpm Workspaces | Turborepo | Nx | Moon | Rush |
|------|----------------|-----------|----|------|------|
| **定位** | 包管理器（内置工作区） | 任务编排 + 缓存 | 全平台（任务+生成+边界） | 仓库管理 + 多语言 | 发布治理 + 策略 |
| **核心语言** | JavaScript | Rust / Go | Node.js + Rust（热路径） | Rust | TypeScript |
| **任务图** | ❌（仅递归执行） | ✅ | ✅ | ✅ | ✅ |
| **本地缓存** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **远程缓存** | ❌ | ✅（Vercel/自托管） | ✅（Nx Cloud） | ✅（Moonbase） | ✅（自托管） |
| **Affected 构建** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **代码生成器** | ❌ | ❌（极简） | ✅（丰富） | ✅（基础） | ✅（基础） |
| **模块边界约束** | ❌ | ❌ | ✅（项目标签） | ✅（标签） | ✅（审查分类） |
| **多语言支持** | 有限 | 有限 | 插件扩展 | 原生（Rust/Go/Python） | 有限 |
| **配置复杂度** | 无 | 低（JSON） | 中–高 | 中（YAML） | 中–高 |
| **主要赞助商** | 社区 | Vercel | Nx（原 Nrwl） | moonrepo.dev | Microsoft |

---

## 选型决策树

```
代码库规模与需求？
├── 1 个应用 + 1–2 共享包 → pnpm workspaces 足够
├── 多应用 + 共享 UI/类型/工具 → pnpm + Turborepo
│   └── 需要代码生成（快速创建新包）→ Nx
│   └── 需要多语言（Rust + TS + Python）→ Moon
└── 大型包工厂（50+ 包，严格发布策略）→ Rush
```

---

## 2026 生态动态

### Turborepo 2.0+

- **Turbo Watch**：文件变更时自动重新运行受影响任务
- **优化依赖图**：更智能的拓扑排序，减少并行空闲时间
- **Vercel 远程缓存**：免费额度增加，小型团队零成本使用

### Nx 的演进

- **Nx Crystal**：AI 辅助代码生成与重构建议
- **Project Crystal**：零配置检测（自动识别 Vite/Next/Remix 项目）
- **Nx Cloud 增强**：分布式任务执行（DTE）支持更大规模并行

### Moon 的差异化

- **工具链管理**：自动下载并锁定 Node.js / Bun / Rust 版本（`.prototools`）
- **MCP Server**：原生支持 AI Agent 通过 MCP 协议执行仓库任务
- **多语言原生**：Rust / Go / Python 任务无需插件即可编排

---

## 目录结构最佳实践

```
my-monorepo/
├── apps/                    # 可部署应用（永不互相导入）
│   ├── web/                 # Next.js 前端
│   ├── api/                 # Fastify/Hono 后端
│   └── admin/               # 内部管理后台
├── packages/                # 共享库（应用可导入，库之间可导入）
│   ├── ui/                  # React 组件库
│   ├── types/               # 共享 TypeScript 类型
│   ├── utils/               # 通用工具函数
│   └── config/              # 共享配置（eslint, tsconfig）
├── package.json             # 根 package.json + workspaces
├── pnpm-workspace.yaml      # pnpm 工作区声明
├── turbo.json               # 任务编排配置
└── tsconfig.base.json       # TypeScript 基础配置
```

**铁律**：

- `apps/*` 永不导入另一个 `apps/*`
- `packages/*` 永不导入 `apps/*`
- 循环依赖必须通过 CI 检查禁止

---

## 配置示例

### pnpm + Turborepo 最小配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

### pnpm Workspaces 声明

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Nx 项目配置示例

```json
// packages/ui/project.json
{
  "name": "ui",
  "targets": {
    "build": {
      "executor": "@nx/rollup:rollup",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/packages/ui",
        "tsConfig": "packages/ui/tsconfig.lib.json",
        "project": "packages/ui/package.json",
        "entryFile": "packages/ui/src/index.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectName}"]
    }
  }
}
```

### Changesets 发布工作流

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

```bash
# 日常发布流程
pnpm changeset          # 选择受影响的包，撰写变更说明
pnpm changeset version  # 根据 changeset 文件自动 bump 版本号
pnpm changeset publish  # 发布到 npm registry
```

### Moon 工具链与任务配置

```yaml
# .moon/workspace.yml
projects:
  - apps/web
  - apps/api
  - packages/ui
  - packages/utils

# .moon/toolchain.yml
toolchain:
  node:
    version: '20.11.0'
    packageManager: 'pnpm'

# .moon/tasks.yml
tasks:
  build:
    command: 'pnpm run build'
    inputs:
      - 'src/**/*'
      - 'tsconfig.json'
    outputs:
      - 'dist'
  test:
    command: 'pnpm run test'
    deps:
      - '~:build'
```

### CI 优化：Affected-Only

```bash
# 仅运行受当前 PR 影响的包的任务
pnpm turbo run test lint --affected --base=origin/main

# Nx affected 构建
npx nx affected -t build test lint --base=origin/main --head=HEAD

# Moon affected 任务
moon run :build --affected
```

### 根 package.json 脚本约定

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "tsc --noEmit",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=docs^... && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

### pnpm Workspace Catalogs（依赖版本统一管理）

pnpm 9.5+ 支持 Catalogs，将跨包依赖版本集中到根目录统一管理，避免版本漂移：

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  react: ^19.0.0
  react-dom: ^19.0.0
  typescript: ^5.8.0
  zod: ^3.24.0

catalogs:
  staging:
    react: ^19.0.0-rc.1
```

```json
// packages/ui/package.json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

```bash
# 将 catalog 版本写入各包（用于发布前锁定）
pnpm catalog:update
```

---

## 参考资源

- [Turborepo Documentation](https://turbo.build/) — Vercel 官方文档
- [Nx Documentation](https://nx.dev/) — Nx 官方文档
- [Moon Documentation](https://moonrepo.dev/) — Moon 官方文档
- [monorepo.tools](https://monorepo.tools/) — 全工具横向对比
- [pnpm Workspaces](https://pnpm.io/workspaces) — pnpm 工作区文档
- [Changesets Documentation](https://github.com/changesets/changesets) — 版本管理工具文档
- [Rush Stack](https://rushstack.io/) — Microsoft 企业级 monorepo 方案
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) — 远程缓存配置指南
- [Nx Project Crystal](https://nx.dev/concepts/nx-project-crystal) — 零配置项目检测
- [Steve Kinney: Turborepo vs Nx](https://github.com/stevekinney/stevekinney.net/blob/main/courses/enterprise-ui/turborepo-versus-nx.md)
- [pnpm Catalogs](https://pnpm.io/catalogs) — 集中化依赖版本管理
- [Nx Crystal — Zero Config Detection](https://nx.dev/concepts/nx-project-crystal) — 无配置项目检测
- [Moon MCP Server](https://moonrepo.dev/docs/guides/mcp-server) — AI Agent 仓库任务编排
- [Changesets GitHub](https://github.com/changesets/changesets) — 版本管理开源仓库
- [Turborepo 2.0 Release Notes](https://turbo.build/blog) — 最新版本动态

---

## 关联文档

- `30-knowledge-base/30.2-categories/07-package-managers.md`
- `20-code-lab/20.6-architecture-patterns/monorepo/`
- `40-ecosystem/comparison-matrices/build-tools-compare.md`

## 进阶配置示例

### Turborepo 远程缓存与签名

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "signature": true
  },
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "env": ["NODE_ENV"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

```bash
# 登录远程缓存（Vercel）
npx turbo login
npx turbo link
```

### Changesets GitHub Actions 发布工作流

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npx changeset version
      - run: npm run build
      - run: npx changeset publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: git push --follow-tags
```

### Moon 多语言任务与依赖图

```yaml
# .moon/tasks.yml
tasks:
  build:
    command: 'pnpm run build'
    inputs: ['src/**/*', 'tsconfig.json']
    outputs: ['dist']
  test:
    command: 'pnpm run test'
    deps: ['~:build']
  lint:
    command: 'eslint src/'
    deps: ['~:build']

# 支持 Rust 任务
tasks:
  rust-build:
    command: 'cargo build --release'
    platform: 'rust'
    inputs: ['src/**/*.rs', 'Cargo.toml']
```

---

## 扩展参考链接

- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) — 官方远程缓存指南
- [Nx Crystal — Zero Config Detection](https://nx.dev/concepts/nx-project-crystal) — 无配置项目检测
- [Moon MCP Server](https://moonrepo.dev/docs/guides/mcp-server) — AI Agent 仓库任务编排
- [Changesets GitHub](https://github.com/changesets/changesets) — 版本管理开源仓库
- [Turborepo 2.0 Release Notes](https://turbo.build/blog) — 最新版本动态
- [pnpm Catalogs](https://pnpm.io/catalogs) — 集中化依赖版本管理
- [Rush Stack](https://rushstack.io/) — Microsoft 企业级 monorepo 方案
- [monorepo.tools](https://monorepo.tools/) — 全工具横向对比
- [GitHub Actions — Publishing with Changesets](https://github.com/changesets/action) — 官方 Action 文档

---

*最后更新: 2026-04-29*
