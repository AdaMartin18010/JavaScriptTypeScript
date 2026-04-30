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

### Corepack 管理包管理器版本

```bash
# 启用 Corepack（Node.js 16.13+ 内置）
corepack enable

# 在 package.json 中声明包管理器约束
cat package.json | jq '.packageManager'
# "pnpm@8.15.0"

# 自动使用项目指定的包管理器
corepack use pnpm@latest
```

```typescript
// corepack-check.ts — 运行时检测包管理器一致性
import { readFileSync } from 'fs';

function checkPackageManager(): void {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const expected = pkg.packageManager; // e.g. "pnpm@8.15.0"
  const [name, version] = expected.split('@');

  const userAgent = process.env.npm_config_user_agent ?? '';
  if (!userAgent.startsWith(name)) {
    console.warn(
      `⚠️  请使用 ${expected} 运行此项目。当前: ${userAgent}`
    );
    process.exit(1);
  }
}
```

### npm Provenance 与供应链安全

```bash
# npm provenance 在 CI 中自动生成 SLSA 来源证明
# GitHub Actions 示例
- run: npm publish --provenance
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

```typescript
// provenance-verify.ts — 验证包来源
import { execSync } from 'child_process';

function verifyProvenance(packageName: string, version: string) {
  const out = execSync(
    `npm view ${packageName}@${version} --json`,
    { encoding: 'utf-8' }
  );
  const meta = JSON.parse(out);
  if (meta.provenance) {
    console.log('✅ 该包具有 SLSA Provenance 证明');
    console.log(meta.provenance.source); // { url, revision }
  } else {
    console.warn('⚠️  该包缺少来源证明');
  }
}
```

### 包管理器特性对比矩阵

```typescript
// package-manager-matrix.ts
interface PackageManager {
  name: string;
  lockfile: string;
  workspaceSupport: boolean;
  contentAddressableStore: boolean;
  installStrategy: 'nested' | 'flattened' | 'content-addressed';
}

const managers: PackageManager[] = [
  { name: 'npm', lockfile: 'package-lock.json', workspaceSupport: true, contentAddressableStore: false, installStrategy: 'flattened' },
  { name: 'yarn-classic', lockfile: 'yarn.lock', workspaceSupport: true, contentAddressableStore: false, installStrategy: 'flattened' },
  { name: 'yarn-berry', lockfile: 'yarn.lock', workspaceSupport: true, contentAddressableStore: true, installStrategy: 'content-addressed' },
  { name: 'pnpm', lockfile: 'pnpm-lock.yaml', workspaceSupport: true, contentAddressableStore: true, installStrategy: 'content-addressed' },
  { name: 'bun', lockfile: 'bun.lockb', workspaceSupport: true, contentAddressableStore: false, installStrategy: 'flattened' },
];
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
| npm Provenance | 供应链安全 | [docs.npmjs.com/generating-provenance-statements](https://docs.npmjs.com/generating-provenance-statements) |
| SLSA Framework | 供应链安全规范 | [slsa.dev](https://slsa.dev/) |
| OpenJS Foundation — Package Manager Collaboration | 生态协作 | [openjsf.org](https://openjsf.org/) |
| Bun Package Manager | 高性能替代方案 | [bun.sh/docs/cli/install](https://bun.sh/docs/cli/install) |
| Node.js Modules Team | 模块系统演进 | [github.com/nodejs/modules](https://github.com/nodejs/modules) |

---

*最后更新: 2026-04-30*
