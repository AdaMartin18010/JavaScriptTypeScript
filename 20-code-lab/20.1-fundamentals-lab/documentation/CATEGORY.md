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

### Markdown 自动检查与修复

```typescript
// markdown-lint.ts — 使用 remark 生态检查 Markdown 规范
import { remark } from 'remark';
import remarkLint from 'remark-lint';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkGfm from 'remark-gfm';
import { reporter } from 'vfile-reporter';

interface LintResult {
  path: string;
  valid: boolean;
  messages: { line: number; column: number; message: string; ruleId: string }[];
}

async function lintMarkdown(filePath: string, content: string): Promise<LintResult> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkLint)
    .use(remarkPresetLintRecommended)
    .process(content);

  const messages = result.messages.map(m => ({
    line: m.line ?? 0,
    column: m.column ?? 0,
    message: m.message,
    ruleId: m.source ?? 'unknown',
  }));

  return { path: filePath, valid: messages.length === 0, messages };
}

// 批量检查项目内所有 Markdown
import { glob } from 'glob';
import { readFile } from 'fs/promises';

async function lintAllMarkdown(pattern = '**/*.md'): Promise<LintResult[]> {
  const files = await glob(pattern, { ignore: ['node_modules/**', '.vitepress/**'] });
  const results = await Promise.all(
    files.map(async f => lintMarkdown(f, await readFile(f, 'utf-8')))
  );
  return results;
}
```

### Mermaid 架构图即代码生成

```typescript
// diagrams.ts — 从类型定义自动生成 Mermaid 类图
interface ClassDef {
  name: string;
  properties: { name: string; type: string }[];
  methods: { name: string; params: string[]; returnType: string }[];
  extends?: string;
}

function generateMermaidClassDiagram(classes: ClassDef[]): string {
  const lines = ['classDiagram'];

  for (const cls of classes) {
    lines.push(`  class ${cls.name} {`);
    for (const p of cls.properties) {
      lines.push(`    +${p.type} ${p.name}`);
    }
    for (const m of cls.methods) {
      lines.push(`    +${m.returnType} ${m.name}(${m.params.join(', ')})`);
    }
    lines.push('  }');
    if (cls.extends) {
      lines.push(`  ${cls.extends} <|-- ${cls.name}`);
    }
  }

  return lines.join('\n');
}

// 使用示例
const diagram = generateMermaidClassDiagram([
  {
    name: 'BaseController',
    properties: [{ name: 'service', type: 'Service' }],
    methods: [{ name: 'handle', params: ['req', 'res'], returnType: 'Response' }],
  },
  {
    name: 'UserController',
    properties: [],
    methods: [{ name: 'getUser', params: ['id'], returnType: 'User' }],
    extends: 'BaseController',
  },
]);

console.log(diagram);
// → classDiagram
//   class BaseController { ... }
//   class UserController { ... }
//   BaseController <|-- UserController
```

### ADR（架构决策记录）模板渲染

```typescript
// adr-template.ts — 生成标准化 ADR Markdown
interface ADRContext {
  number: number;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  context: string;
  decision: string;
  consequences: string[];
}

function renderADR(ctx: ADRContext): string {
  return `# ADR-${String(ctx.number).padStart(4, '0')}: ${ctx.title}

- **Status**: ${ctx.status}
- **Date**: ${ctx.date}

## Context

${ctx.context}

## Decision

${ctx.decision}

## Consequences

${ctx.consequences.map(c => `- ${c}`).join('\n')}
`;
}

// 使用示例
const adr = renderADR({
  number: 42,
  title: '采用 VitePress 作为文档站点生成器',
  status: 'accepted',
  date: new Date().toISOString().split('T')[0],
  context: '项目需要一套可维护的技术文档站点，支持 Markdown、搜索与多语言。',
  decision: '选用 VitePress，因其基于 Vite 构建速度快，且原生支持 Vue 组件嵌入。',
  consequences: [
    '团队需熟悉 VitePress 配置与主题定制',
    '可获得开箱即用的全文搜索与导航',
    '部署至 GitHub Pages 流程简单',
  ],
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
| TypeDoc — TypeScript 文档生成器 | 工具 | [typedoc.org](https://typedoc.org/) |
| remark — Markdown 处理生态 | 工具 | [remark.js.org](https://remark.js.org/) |
| Markdownlint — Markdown 规范检查 | 工具 | [github.com/DavidAnson/markdownlint](https://github.com/DavidAnson/markdownlint) |
| JSR — JavaScript Registry 文档标准 | 平台 | [jsr.io](https://jsr.io/) |
| Read the Docs — 文档托管平台 | 平台 | [readthedocs.org](https://readthedocs.org/) |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Google Technical Writing Courses | 课程 | [developers.google.com/tech-writing](https://developers.google.com/tech-writing) |
| Write the Docs — 文档工程师社区 | 社区 | [writethedocs.org](https://www.writethedocs.org/) |

---

*最后更新: 2026-04-29*
