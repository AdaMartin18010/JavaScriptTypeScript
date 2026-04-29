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

---

*最后更新: 2026-04-29*
