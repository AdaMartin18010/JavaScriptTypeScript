---
dimension: 综合
sub-dimension: Code organization
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Code organization 核心概念与工程实践。

## 包含内容

- 项目目录结构、模块边界、命名规范与代码分层策略。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 project-structure.test.ts
- 📄 project-structure.ts

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| project-structure | 项目目录结构生成与验证工具 | `project-structure.ts` |
| code-organization-theory | 代码组织的理论原则与最佳实践 | `THEORY.md` |

## Monorepo 方案对比

| 维度 | pnpm Workspaces | Turborepo | Nx | Rush | Bazel |
|------|-----------------|-----------|-----|------|-------|
| 工作区管理 | 符号链接 + 共享依赖 | 基于 pnpm/npm/yarn | 独立图构建 | 独立包管理 | 通用构建系统 |
| 任务编排 | 无（需外部工具） | Pipeline + Remote Cache | 强依赖图 + Affected | 强依赖图 | 沙箱构建 |
| 缓存策略 | 无内置 | Local / Remote Turbo Cache | Local / Remote Cache | Build Cache | 精细增量 |
| 适用规模 | 小型库集合 | 中大型前端 Monorepo | 大型全栈 Monorepo | 企业级多团队 | 超大型跨语言 |
| 配置复杂度 | 低 | 低 | 中 | 高 | 极高 |
| 典型用户 | 开源库 | Vercel, Next.js | Google, Enterprise | Microsoft | Google |

## 代码示例

以下展示一个使用 TypeScript 生成的标准化项目结构定义，支持运行时验证：

```typescript
// project-structure.ts
export interface ProjectNode {
  name: string;
  type: 'file' | 'directory';
  children?: ProjectNode[];
  optional?: boolean;
}

export const recommendedStructure: ProjectNode = {
  name: 'src',
  type: 'directory',
  children: [
    { name: 'domain', type: 'directory', children: [
      { name: 'entities', type: 'directory' },
      { name: 'value-objects', type: 'directory' },
    ]},
    { name: 'application', type: 'directory', children: [
      { name: 'ports', type: 'directory' },
      { name: 'services', type: 'directory' },
    ]},
    { name: 'infrastructure', type: 'directory', children: [
      { name: 'repositories', type: 'directory' },
      { name: 'config', type: 'directory' },
    ]},
    { name: 'presentation', type: 'directory', children: [
      { name: 'controllers', type: 'directory' },
      { name: 'views', type: 'directory' },
    ]},
    { name: 'main.ts', type: 'file' },
  ],
};

export function validateStructure(actual: string[], expected: ProjectNode, prefix = ''): string[] {
  const errors: string[] = [];
  const fullPath = prefix ? `${prefix}/${expected.name}` : expected.name;
  const exists = actual.some((p) => p === fullPath || p.startsWith(`${fullPath}/`));
  if (!exists && !expected.optional) errors.push(`Missing: ${fullPath}`);
  if (expected.children) {
    for (const child of expected.children) errors.push(...validateStructure(actual, child, fullPath));
  }
  return errors;
}
```

#### Turborepo Pipeline 配置示例

```jsonc
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
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 依赖倒置与 Barrel 文件模式

```typescript
// src/domain/ports/index.ts — Barrel 文件统一导出端口
export { UserRepository } from './user-repository';
export { EmailService } from './email-service';
export { Logger } from './logger';

// src/application/services/user-service.ts
// 上层模块依赖抽象（端口），而非具体实现
import { UserRepository, EmailService, Logger } from '@/domain/ports';

export class UserService {
  constructor(
    private repo: UserRepository,
    private email: EmailService,
    private logger: Logger,
  ) {}

  async register(email: string) {
    this.logger.info(`Registering ${email}`);
    const user = await this.repo.create({ email });
    await this.email.sendWelcome(user.email);
    return user;
  }
}
```

### 基于 Feature-Sliced Design 的目录结构

```typescript
// src/features/auth/index.ts
export { LoginForm } from './ui/login-form';
export { useAuth } from './model/use-auth';
export { authApi } from './api/auth-api';

// 分层规则：
// app/      → 初始化、 providers、路由、全局样式
// pages/    → 应用页面（路由入口）
// widgets/  → 独立功能区块（如 Header、Sidebar）
// features/ → 用户交互与业务逻辑（如 登录、购物车）
// entities/ → 业务实体（如 User、Order）
// shared/   → 可复用基础设施（UI kit、utils、api client）
```

#### package.json exports 字段与条件导出

```jsonc
// packages/utils/package.json — 现代 Node.js 模块边界定义
{
  "name": "@acme/utils",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./string": {
      "types": "./dist/string.d.ts",
      "import": "./dist/string.mjs"
    },
    "./package.json": "./package.json"
  },
  "sideEffects": false
}
```

#### ESLint 模块边界规则

```typescript
// eslint-boundary.ts — 使用 eslint-plugin-boundaries 强制执行架构分层
// .eslintrc.cjs 配置片段
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/*' },
      { type: 'pages', pattern: 'src/pages/*' },
      { type: 'widgets', pattern: 'src/widgets/*' },
      { type: 'features', pattern: 'src/features/*' },
      { type: 'entities', pattern: 'src/entities/*' },
      { type: 'shared', pattern: 'src/shared/*' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
          { from: 'pages', allow: ['widgets', 'features', 'entities', 'shared'] },
          { from: 'widgets', allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared', allow: ['shared'] },
        ],
      },
    ],
  },
};
```

#### pnpm Workspace 与 Catalog 共享版本

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

# pnpm 9+ catalogs 实现跨包统一依赖版本
catalog:
  react: ^18.3.1
  react-dom: ^18.3.1
  typescript: ^5.4.5

catalogs:
  tooling:
    vite: ^5.2.0
    vitest: ^1.6.0
```

```jsonc
// packages/ui/package.json — 使用 catalog: 协议
{
  "dependencies": {
    "react": "catalog:"
  },
  "devDependencies": {
    "vite": "catalog:tooling"
  }
}
```

#### tsup 零配置库构建

```typescript
// tsup.config.ts — 基于 esbuild 的库打包配置
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Project Structure | 指南 | [nodejs.org/en/docs/guides/nodejs-project-structure](https://nodejs.org/en/docs/guides/nodejs-project-structure/) |
| Google TypeScript Style Guide | 规范 | [google.github.io/styleguide/tsguide.html](https://google.github.io/styleguide/tsguide.html) |
| Clean Code — Robert C. Martin | 书籍 | [bookshop.org/p/books/clean-code-robert-c-martin](https://bookshop.org/p/books/clean-code-robert-c-martin/...) |
| Feature-Sliced Design | 架构 | [feature-sliced.design](https://feature-sliced.design/) |
| Monorepo.tools | 参考 | [monorepo.tools](https://monorepo.tools/) |
| Turborepo 文档 | 文档 | [turbo.build](https://turbo.build/) |
| Nx 文档 | 文档 | [nx.dev](https://nx.dev/) |
| pnpm Workspaces | 文档 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| Node.js TypeScript Best Practices | 指南 | [nodejs.org/en/docs/guides/typescript](https://nodejs.org/en/docs/guides/typescript/) |
| Barrel Files Best Practices | 指南 | [basarat.gitbook.io/typescript/main-1/barrel](https://basarat.gitbook.io/typescript/main-1/barrel) |
| Clean Architecture — Robert C. Martin | 书籍 | [blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |
| Domain-Driven Design Reference | 参考 | [www.domainlanguage.com/ddd/reference/](https://www.domainlanguage.com/ddd/reference/) |
| ESLint Plugin Boundaries | 仓库 | [github.com/javierbrea/eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) |
| Node.js Exports Field | 文档 | [nodejs.org/api/packages.html#package-entry-points](https://nodejs.org/api/packages.html#package-entry-points) |
| tsup 文档 | 文档 | [tsup.egoist.dev](https://tsup.egoist.dev/) |
| Changesets | 文档 | [github.com/changesets/changesets](https://github.com/changesets/changesets) |
| pnpm Catalogs | 文档 | [pnpm.io/catalogs](https://pnpm.io/catalogs) |

---

*最后更新: 2026-04-30*
