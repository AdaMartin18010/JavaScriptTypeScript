---
title: npm & package.json 速查表
description: "npm 工作流速查：生命周期脚本、语义化版本、工作区、锁文件、依赖管理与发布流程"
editLink: true
head:
  - - meta
    - property: og:title
      content: "npm & package.json 速查表 | Awesome JS/TS Ecosystem"
---

# npm & package.json 速查表

> 覆盖 npm、pnpm、yarn 三大包管理器的常用命令与 package.json 核心字段。重点关注 Monorepo 工作区与依赖安全管理。

## package.json 核心字段

```json
{
  "name": "@scope/package-name",
  "version": "1.2.3",
  "description": "Package description",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
      "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky install",
    "prepublishOnly": "npm run build && npm test"
  },
  "dependencies": {
    "lodash-es": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "~5.4.0",
    "vitest": "^1.5.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "packageManager": "pnpm@9.1.0",
  "workspaces": ["packages/*"]
}
```

## 语义化版本（SemVer）

| 版本格式 | 含义 | 示例 |
|----------|------|------|
| `1.2.3` | 精确版本 | 仅安装此版本 |
| `^1.2.3` | 兼容版本 | `>=1.2.3 <2.0.0`（允许 minor/patch 更新） |
| `~1.2.3` | 近似版本 | `>=1.2.3 <1.3.0`（仅允许 patch 更新） |
| `>=1.2.3` | 最低版本 | 1.2.3 及以上 |
| `1.2.x` / `1.2.X` | 通配 patch | 1.2.0 到 1.2.999 |
| `*` | 任意版本 | 最新版本 |
| `1.2.3-beta.2` | 预发布版本 | 优先级低于 `1.2.3` |

```bash
# 版本号优先级（从高到低）
1.2.3  >  1.2.3-beta.2  >  1.2.2  >  1.2.0  >  1.1.0

# npm version 命令
npm version patch      # 1.2.3 → 1.2.4
npm version minor      # 1.2.3 → 1.3.0
npm version major      # 1.2.3 → 2.0.0
npm version prerelease # 1.2.3 → 1.2.4-0
```

## 依赖类型

| 类型 | 安装命令 | 用途 | 是否打包 |
|------|----------|------|----------|
| `dependencies` | `npm i <pkg>` | 运行时必需 | ✅ 是 |
| `devDependencies` | `npm i -D <pkg>` | 开发/构建工具 | ❌ 否（库）/✅（应用） |
| `peerDependencies` | 手动添加 | 宿主环境提供 | ❌ 否 |
| `optionalDependencies` | `npm i -O <pkg>` | 可选依赖，失败不中断 | 条件性 |
| `bundledDependencies` | 手动添加 | 打包时包含 | ✅ 是 |

```bash
# 安装到指定类型
npm install lodash --save-prod        # dependencies（默认）
npm install vitest --save-dev         # devDependencies
npm install react --save-peer         # peerDependencies（npm 7+）
npm install fsevents --save-optional  # optionalDependencies

# 查看依赖树
npm ls
npm ls --depth=0
npm ls --prod                       # 仅生产依赖

# 查找过时依赖
npm outdated
```

## 常用 npm 命令

```bash
# 安装
npm install              # 安装全部依赖（读取 package-lock.json）
npm ci                   # 严格按 lock 安装（CI/CD 推荐）
npm install <pkg>@latest # 安装最新版本
npm install <pkg>@1.2.3  # 安装指定版本

# 卸载与更新
npm uninstall <pkg>
npm update <pkg>
npm update               # 更新所有可更新的包

# 脚本执行
npm run build
npm test                 # 等价于 npm run test
npm start                # 等价于 npm run start
npx <cmd>                # 执行 node_modules/.bin 中的命令
npx <pkg>                # 临时安装并执行（不写入 package.json）

# 发布
npm login
npm publish              # 发布当前包
npm publish --access public  # 发布公共 scoped 包
npm unpublish <pkg>@<ver> --force  # 撤回（24h 内）

# 其他
npm cache clean --force
npm config list
npm whoami
npm audit                # 安全审计
npm audit fix            # 自动修复可升级漏洞
npm fund                 # 查看依赖的资助信息
```

## 生命周期脚本

| 脚本 | 触发时机 | 说明 |
|------|----------|------|
| `preinstall` | 安装依赖前 | |
| `install` / `postinstall` | 安装依赖时/后 | 常用于编译原生模块 |
| `prepublishOnly` | `npm publish` 前 | 构建、测试等 |
| `prepare` | `npm publish` 前 / `npm install` 无参数时 | 安装 git 依赖时也会触发 |
| `prepack` / `postpack` | `npm pack` 前后 | |
| `preversion` / `postversion` | `npm version` 前后 | |
| `pretest` / `posttest` | `npm test` 前后 | |

```bash
# 自定义脚本同样支持 pre/post 钩子
npm run build    # 会自动执行 prebuild 和 postbuild（如果存在）
```

## pnpm 工作区（Monorepo）

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

```json
// package.json 中的工作区依赖引用
{
  "dependencies": {
    "@myapp/ui": "workspace:*",     // 精确引用本地版本
    "@myapp/utils": "workspace:^"    // 使用本地版本的 ^ 语义
  }
}
```

```bash
# pnpm 工作区命令
pnpm install            # 安装所有工作区依赖
pnpm -r run build       # 在所有包中执行 build
pnpm --filter <pkg> dev # 在指定包中执行 dev
pnpm add -D vitest -w   # 在工作区根安装 dev 依赖
pnpm changeset          # 管理版本变更（配合 changesets 工具）
```

## npm vs yarn vs pnpm

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 锁文件 | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |
| 工作区 | v7+ 内置 | 内置 | 内置 |
| 磁盘节省 | ❌ 复制 | ❌ 复制 | ✅ 硬链接+内容寻址 |
| 安装速度 | 中等 | 快 | 最快 |
| 幽灵依赖 | ❌ 存在 | ❌ 存在 | ✅ 严格隔离 |
| Plug'n'Play | ❌ | ✅ (yarn berry) | ❌ |

## 依赖安全

```bash
# 审计与修复
npm audit                    # 查看漏洞报告
npm audit fix                # 自动修复非破坏性更新
npm audit fix --force        # 强制修复（可能破坏）

# 许可证检查
npx license-checker --summary

# 检查过时和废弃包
npm outdated
npm deprecate <pkg>@<ver> "message"  # 废弃指定版本
```

## 常见陷阱

| 陷阱 | 现象 | 解决 |
|------|------|------|
| `npm install` 修改 lock | 意外升级依赖 | CI 中使用 `npm ci` |
| 幽灵依赖 | 未声明但可用 | 迁移到 pnpm（严格模式） |
| peerDependency 警告 | 版本不兼容 | 明确指定 peerDependencies |
| prepare 钩子循环 | git 依赖安装触发 build | 使用 `prepublishOnly` 替代 |
| 版本号前导零 | `^0.1.2` 不会升级到 `0.2.0` | 理解 SemVer：0.x 视为不稳定 |

## 参考资源

- [npm 官方文档](https://docs.npmjs.com/)
- [pnpm 官方文档](https://pnpm.io/)
- [Yarn 官方文档](https://yarnpkg.com/)
- [SemVer 规范](https://semver.org/)
- [Node.js 包最佳实践](https://github.com/mattdesl/module-best-practices)
