# Monorepo 工具对比

> Turborepo、Nx、Moon、Rush、Lerna 的深度对比矩阵。

---

## 对比矩阵

| 维度 | Turborepo | Nx | Moon | Rush | Lerna |
|------|-----------|----|------|------|-------|
| **定位** | 任务编排 | 全平台 | 仓库管理 | 发布治理 | 已归档（Nx 驱动） |
| **核心语言** | Rust/Go | Node.js + Rust | Rust | TypeScript | JavaScript |
| **任务图** | ✅ | ✅ | ✅ | ✅ | ✅（Nx 引擎） |
| **远程缓存** | Vercel/自托管 | Nx Cloud | Moonbase | 自托管 | ❌ |
| **代码生成** | ❌ | ✅ 丰富 | ✅ 基础 | ✅ 基础 | ❌ |
| **模块边界** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **多语言** | 有限 | 插件 | 原生 | 有限 | ❌ |
| **学习曲线** | 低 | 中–高 | 中 | 中–高 | 低 |

---

## 深度对比：Turborepo vs Nx vs Rush vs pnpm Workspaces

| 维度 | Turborepo | Nx | Rush | pnpm Workspaces |
|------|-----------|----|------|-----------------|
| **核心定位** | 任务编排 + 远程缓存 | 全栈 monorepo 平台 | 企业级包发布治理 | 包管理 + 工作区链接 |
| **创建者** | Vercel (原 Jared Palmer) | Nrwl | Microsoft | pnpm 社区 |
| **任务调度** | Rust 引擎，DAG 执行 | Rust/Node 混合，DAG | Node.js，按依赖拓扑 | ❌ 无内置任务调度 |
| **远程缓存** | ✅ Vercel / 自托管 S3 | ✅ Nx Cloud / 自托管 | ✅ 自托管 Azure Blob | ❌ |
| **affected 检测** | ✅ Git 差异分析 | ✅ 丰富 (文件 + 输入哈希) | ✅ Git + 依赖图 | ❌ |
| **代码生成 (Schematics)** | ❌ | ✅ 强大生成器 | ✅ 基础生成器 | ❌ |
| **依赖图可视化** | ✅ `turbo run` + 网页 | ✅ Nx Graph 交互式 | ⚠️ 命令行 | ⚠️ `pnpm why` |
| **包发布管理** | ⚠️ 需配合 Changesets | ⚠️ 需配合 Nx Release | ✅ 内置版本策略 | ❌ |
| **多包管理器支持** | npm, pnpm, yarn | npm, pnpm, yarn | npm, pnpm, yarn | 仅 pnpm |
| **CI 集成** | Vercel, GitHub Actions | 广泛支持 | Azure DevOps 原生 | 通用 |
| **IDE 支持** | VS Code 基础 | ✅ Nx Console 插件 | 基础 | 基础 |

---

## 配置示例

### Turborepo (`turbo.json`)

```json
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
      "inputs": ["$TURBO_DEFAULT$", ".env.test.local"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Nx (`nx.json`)

```json
{
  "extends": "nx/presets/npm.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.config.ts"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"],
    "sharedGlobals": ["{workspaceRoot}/babel.config.json"]
  },
  "nxCloudAccessToken": "...",
  "plugins": ["@nx/next", "@nx/node"]
}
```

### pnpm Workspaces (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'

# .npmrc — 提升依赖管理
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true

# package.json scripts 配合 turbo
# {
#   "scripts": {
#     "build": "turbo run build",
#     "test": "turbo run test",
#     "changeset": "changeset",
#     "version-packages": "changeset version",
#     "release": "pnpm build && changeset publish"
#   }
# }
```

---

## 选型建议

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| 小型团队 / 快速启动 | **Turborepo + pnpm** | 配置极简，远程缓存开箱即用 |
| 大型团队 / 企业级 | **Nx** | 代码生成、模块边界、插件生态 |
| 发布治理严格 / Microsoft 生态 | **Rush** | 版本策略、锁文件管理、变更日志 |
| 多语言 monorepo | **Moon** | Rust 原生性能，多语言内置支持 |
| 仅包管理 / 不需要任务调度 | **pnpm workspaces** | 轻量，磁盘效率高 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Turborepo Docs | <https://turbo.build/repo/docs> | 官方文档 |
| Nx Docs | <https://nx.dev/getting-started/intro> | 官方文档 |
| Rush Stack | <https://rushstack.io/> | Microsoft 官方文档 |
| Moonrepo | <https://moonrepo.dev/docs> | 官方文档 |
| pnpm Workspaces | <https://pnpm.io/workspaces> | pnpm 工作区文档 |
| Changesets | <https://github.com/changesets/changesets> | 版本管理与发布工具 |
| Monorepo.tools | <https://monorepo.tools/> | monorepo 工具对比网站 |
| Lerna (Archived) | <https://lerna.js.org/docs/intro> | 已归档，Nx 接管 |

---

*最后更新: 2026-04-29*
