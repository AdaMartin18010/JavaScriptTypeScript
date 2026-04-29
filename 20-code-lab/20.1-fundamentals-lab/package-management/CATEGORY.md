---
dimension: 综合
sub-dimension: Package management
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Package management 核心概念与工程实践。

## 包含内容

- 本模块聚焦 package management 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 子模块一览

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| npm-basics | npm 基础命令与配置 | `npm-basics.ts` |
| monorepo-workspaces | Monorepo 工作区管理 | `monorepo-workspaces.ts` |
| THEORY.md | 包管理器对比理论 | `THEORY.md` |

## 代码示例：工作区依赖解析

```typescript
// monorepo-workspaces.ts：通过 workspaces 批量安装与执行脚本
import { execSync } from 'child_process';

interface WorkspaceInfo {
  name: string;
  version: string;
  location: string;
  workspaceDependencies: string[];
}

function getWorkspaces(): WorkspaceInfo[] {
  const output = execSync('npm query .workspace', { encoding: 'utf-8' });
  return JSON.parse(output);
}

function runInAllWorkspaces(script: string): void {
  const workspaces = getWorkspaces();
  for (const ws of workspaces) {
    console.log(`[${ws.name}] Running "${script}"...`);
    execSync(`npm run ${script} -w ${ws.name}`, { stdio: 'inherit' });
  }
}

// 使用：runInAllWorkspaces('build');
```

### package.json Exports 条件导出

```json
{
  "name": "@scope/lib",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

### 语义化版本范围解析

```typescript
// npm-basics.ts — 使用 semver 库解析版本范围
import { satisfies, validRange } from 'semver';

function checkCompatibility(version: string, range: string): boolean {
  if (!validRange(range)) {
    throw new Error(`Invalid range: ${range}`);
  }
  return satisfies(version, range);
}

// 示例
console.log(checkCompatibility('2.1.0', '^2.0.0')); // true
console.log(checkCompatibility('2.1.0', '~2.0.0')); // false
console.log(checkCompatibility('3.0.0', '^2.0.0')); // false
```

### Lockfile 与完整性校验

```typescript
// lockfile-integrity.ts — 验证依赖锁定文件
import { createHash } from "crypto";
import { readFileSync } from "fs";

interface LockEntry {
  version: string;
  resolved: string;
  integrity: string; // sha512-base64
}

function verifyIntegrity(
  packagePath: string,
  expectedIntegrity: string
): boolean {
  const content = readFileSync(packagePath);
  const hash = createHash("sha512").update(content).digest("base64");
  const computed = `sha512-${hash}`;
  return computed === expectedIntegrity;
}

// 示例 lockfile 条目验证
const entry: LockEntry = {
  version: "1.2.3",
  resolved: "https://registry.npmjs.org/pkg/-/pkg-1.2.3.tgz",
  integrity:
    "sha512-abc123...", // 截断
};

// npm 的 integrity 格式：sha512-<base64>
// pnpm 的 lockfile 使用类似的校验机制
```

### 发布配置与 npm 脚本最佳实践

```json
{
  "name": "@myorg/awesome-lib",
  "version": "1.0.0",
  "files": ["dist", "README.md", "LICENSE"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
      "require": { "types": "./dist/index.d.ts", "default": "./dist/index.cjs" }
    }
  },
  "sideEffects": false,
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build && npm test"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### pnpm Workspace 配置示例

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"

# 依赖提升策略（避免幽灵依赖）
hoist-pattern:
  - "!@types/*"
```

```typescript
// pnpm-workspace.ts — workspace 协议使用
// packages/app/package.json
{
  "dependencies": {
    "@myorg/shared": "workspace:*",  // 始终使用工作区最新版本
    "@myorg/utils": "workspace:^1.0.0" // 遵循 semver 范围
  }
}
```

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 monorepo-workspaces.test.ts
- 📄 monorepo-workspaces.ts
- 📄 npm-basics.test.ts
- 📄 npm-basics.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| npm Docs | 官方文档 | [docs.npmjs.com](https://docs.npmjs.com/) |
| pnpm Workspaces | 指南 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| Yarn Berry | 官方文档 | [yarnpkg.com](https://yarnpkg.com/) |
| Node.js Packages | API 文档 | [nodejs.org/api/packages.html](https://nodejs.org/api/packages.html) |
| SemVer 规范 | 规范 | [semver.org](https://semver.org/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Node.js Corepack | 官方文档 | [nodejs.org/api/corepack.html](https://nodejs.org/api/corepack.html) |
| npm package.json | 配置参考 | [docs.npmjs.com/cli/v10/configuring-npm/package-json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) |
| pnpm Workspace Protocol | 协议说明 | [pnpm.io/workspaces#workspace-protocol-workspace](https://pnpm.io/workspaces#workspace-protocol-workspace) |
| Yarn Plug'n'Play | 架构白皮书 | [yarnpkg.com/features/pnp](https://yarnpkg.com/features/pnp) |
| semantic-release | 自动化版本发布 | [semantic-release.gitbook.io](https://semantic-release.gitbook.io/) |
| npm audit | 安全审计 | [docs.npmjs.com/cli/commands/npm-audit](https://docs.npmjs.com/cli/commands/npm-audit) |
| npmmirror 中国镜像 | 镜像站 | [npmmirror.com](https://npmmirror.com/) |
| Bundlephobia | 包体积分析 | [bundlephobia.com](https://bundlephobia.com/) |

---

*最后更新: 2026-04-29*
