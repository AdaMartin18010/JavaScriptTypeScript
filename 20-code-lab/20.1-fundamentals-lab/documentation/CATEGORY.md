---
dimension: 工程实践
sub-dimension: 文档工程
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「工程实践」** 维度，聚焦 文档工程 核心概念与工程实践。

## 包含内容

- 技术文档写作规范、API 文档自动生成、文档站点构建与维护。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `api-docs-generator/` | JSDoc / TSDoc 解析与生成 | `api-docs-generator.ts`, `api-docs-generator.test.ts` |
| `markdown-linting/` | Markdown 规范与自动检查 | `markdown-lint.ts` |
| `documentation-site/` | VitePress / Docusaurus 站点构建 | `site-config.ts` |
| `diagram-as-code/` | Mermaid / D2 架构图生成 | `diagrams.ts` |
| `adr-templates/` | 架构决策记录模板 | `adr-template.md` |

## 代码示例

### TSDoc 解析与 Markdown 生成

```typescript
import { Parser } from 'tsdoc';

interface ApiDocEntry {
  name: string;
  kind: 'function' | 'class' | 'interface';
  summary: string;
  params: { name: string; type: string; description: string }[];
  returns?: { type: string; description: string };
  example?: string;
}

function parseTSDoc(source: string): ApiDocEntry[] {
  const parser = new Parser();
  // 解析并提取注释节点
  const entries: ApiDocEntry[] = [];
  // ... 实际实现使用 TypeScript Compiler API 遍历 AST
  return entries;
}

function renderMarkdown(entries: ApiDocEntry[]): string {
  return entries.map(e => `## ${e.name}\n\n${e.summary}\n\n**参数**:\n${e.params.map(p => `- \`${p.name}\`: ${p.type} — ${p.description}`).join('\n')}\n`).join('\n---\n');
}
```

### VitePress 配置片段

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'JS/TS 全景知识库',
  description: 'JavaScript & TypeScript 全景综述',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '代码实验室', link: '/code-lab/' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', items: [{ text: '安装', link: '/guide/installation' }] },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/js-ts-knowledge-base' },
    ],
  },
});
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 api-docs-generator.test.ts
- 📄 api-docs-generator.ts
- 📄 index.ts

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TSDoc 规范 | 官方 | [tsdoc.org](https://tsdoc.org/) |
| VitePress | 静态站点 | [vitepress.dev](https://vitepress.dev/) |
| Docusaurus | 文档站点 | [docusaurus.io](https://docusaurus.io/) |
| Mermaid | 图表即代码 | [mermaid.js.org](https://mermaid.js.org/) |
| Diátaxis 文档框架 | 方法论 | [diataxis.fr](https://diataxis.fr/) |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
