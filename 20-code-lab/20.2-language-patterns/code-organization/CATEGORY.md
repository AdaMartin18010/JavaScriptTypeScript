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

---

*最后更新: 2026-04-29*
