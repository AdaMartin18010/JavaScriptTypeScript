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

### Moon (`moon.yml` + `.moon/workspace.yml`)

```yaml
# .moon/workspace.yml
$schema: 'https://moonrepo.dev/schemas/workspace.json'
projects:
  - 'apps/*'
  - 'packages/*'
vcs:
  manager: 'git'
  defaultBranch: 'main'

# packages/core/moon.yml
language: 'typescript'
type: 'library'

tasks:
  build:
    command: 'tsc --project tsconfig.build.json'
    inputs:
      - 'src/**/*'
      - 'tsconfig*.json'
    outputs:
      - 'dist'
  test:
    command: 'vitest run'
    deps:
      - 'build'
    inputs:
      - 'src/**/*'
      - 'tests/**/*'
```

### Rush (`rush.json`)

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": "5.112.0",
  "pnpmVersion": "8.15.0",
  "nodeSupportedVersionRange": ">=18.0.0 <21.0.0",
  "projects": [
    {
      "packageName": "@myorg/core",
      "projectFolder": "packages/core",
      "reviewCategory": "production",
      "shouldPublish": true
    },
    {
      "packageName": "@myorg/web",
      "projectFolder": "apps/web",
      "reviewCategory": "production",
      "shouldPublish": false
    }
  ]
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

### Changesets 版本管理

```bash
# 初始化
npx changeset init

# 添加变更集（交互式选择包、填写描述）
npx changeset

# 版本 bump + 生成 changelog
npx changeset version

# 发布
npx changeset publish
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@myorg/core", "@myorg/utils"]],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Nx Generator 示例

```bash
# 生成新的 React 库
npx nx generate @nx/react:lib ui-components --directory=packages/ui-components

# 生成 Next.js 应用
npx nx generate @nx/next:app marketing-site --directory=apps/marketing
```

---

## 代码示例：Turborepo 远程缓存自托管（S3 + Docker）

```typescript
// turbo.config.ts — 远程缓存配置
import type { TurboJsonSchema } from 'turbo-types';

const config: TurboJsonSchema = {
  $schema: 'https://turbo.build/schema.json',
  globalDependencies: ['.env'],
  remoteCache: {
    // Turborepo 原生支持 S3 / Azure Blob / GCS
    // 环境变量配置：
    // TURBO_REMOTE_CACHE_SIGNATURE_KEY=your-secret
    // TURBO_TOKEN=your-token
    // TURBO_TEAM=your-team
    // AWS_ACCESS_KEY_ID=...
    // AWS_SECRET_ACCESS_KEY=...
    // AWS_REGION=us-east-1
    // TURBO_S3_BUCKET=my-turbo-cache
  },
  pipeline: {
    build: {
      dependsOn: ['^build'],
      outputs: ['dist/**', '.next/**'],
      env: ['NODE_ENV', 'API_URL'],
    },
    'build:docker': {
      dependsOn: ['build'],
      outputs: ['docker.tar'],
    },
    test: {
      dependsOn: ['build'],
      outputs: ['coverage/**'],
      inputs: ['src/**/*.ts', 'tests/**/*.ts'],
    },
    lint: {
      dependsOn: [],
      outputs: [],
    },
    typecheck: {
      dependsOn: [],
      outputs: [],
    },
  },
};

export default config;
```

---

## 代码示例：Nx 任务管道与模块边界（enterprise.json）

```json
// nx.json — 企业级配置
{
  "extends": "nx/presets/npm.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true,
      "parallelism": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true,
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/**/*.stories.ts"
    ],
    "sharedGlobals": ["{workspaceRoot}/babel.config.json", "{workspaceRoot}/tsconfig.base.json"]
  },
  "generators": {
    "@nx/react": {
      "application": {
        "style": "css",
        "linter": "eslint",
        "bundler": "vite",
        "e2eTestRunner": "playwright"
      },
      "library": {
        "unitTestRunner": "vitest"
      }
    }
  },
  "plugins": ["@nx/eslint", "@nx/vite"],
  "nxCloudAccessToken": "..."
}
```

```json
// apps/web/project.json — Nx 项目级配置
{
  "name": "web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/web/src",
  "projectType": "application",
  "tags": ["scope:frontend", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/web"
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": { "buildTarget": "web:build" }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"]
    }
  }
}
```

```json
// .eslintrc.json — Nx 模块边界规则
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "scope:frontend",
                "onlyDependOnLibsWithTags": ["scope:frontend", "scope:shared"]
              },
              {
                "sourceTag": "scope:backend",
                "onlyDependOnLibsWithTags": ["scope:backend", "scope:shared"]
              },
              {
                "sourceTag": "type:app",
                "onlyDependOnLibsWithTags": ["type:feature", "type:util", "type:ui"]
              }
            ]
          }
        ]
      }
    }
  ]
}
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
| Nx Remote Caching | <https://nx.dev/ci/features/remote-cache> | 远程缓存配置 |
| Turborepo Remote Cache | <https://turbo.build/repo/docs/core-concepts/remote-caching> | 自托管 S3 指南 |
| Rush Version Policies | <https://rushjs.io/pages/maintainer/publishing/> | 发布与版本策略 |
| npm Workspaces | <https://docs.npmjs.com/cli/v10/using-npm/workspaces> | npm 内置工作区 |
| Yarn Workspaces | <https://yarnpkg.com/features/workspaces> | Yarn Berry 工作区 |
| Nx Console (VS Code) | <https://nx.dev/getting-started/editor-setup> | IDE 集成插件 |
| Turborepo 生成器示例 | <https://github.com/vercel/turborepo/tree/main/examples> | 官方示例仓库 |
| Nx 企业最佳实践 | <https://nx.dev/enterprise> | 企业级部署指南 |
| pnpm 依赖去重机制 | <https://pnpm.io/motivation> | 硬链接与内容寻址存储 |
| SemVer 规范 | <https://semver.org/> | 语义化版本控制 |

---

*最后更新: 2026-04-29*
