---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: AI 辅助代码生成 — AST 操作、模板引擎与元编程
- **模块编号**: 56-code-generation

## 边界说明

本模块聚焦代码生成技术的应用，包括：

- AST 遍历与转换
- AI 辅助工作流（Copilot、Cursor、Claude Code）
- OpenAPI 客户端生成与模板引擎

通用编译器设计和语言解析器实现不属于本模块范围（请参见 `jsts-code-lab/79-compiler-design`）。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `ast-transformer.ts` | Babel / TypeScript Compiler API 遍历与转换 | `ast-transformer.test.ts` |
| `ai-code-generator.ts` | LLM 代码生成与后处理流水线 | `ai-code-generator.test.ts` |
| `openapi-client-gen.ts` | OpenAPI Spec → TypeScript 客户端生成 | `openapi-client-gen.test.ts` |
| `template-engine.ts` | 轻量级模板引擎与插值编译 | `template-engine.test.ts` |
| `ai-assisted-workflow/` | AI 编程助手工作流模式 | `github-copilot-patterns.ts`, `cursor-workflow.ts`, `claude-code-patterns.ts`, `prompt-engineering-guide.md` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### AST 节点遍历与转换

```typescript
// ast-transformer.ts
import ts from 'typescript';

export function transformArrowToFunction(source: string): string {
  const sourceFile = ts.createSourceFile('tmp.ts', source, ts.ScriptTarget.Latest, true);

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (root) => {
      function visit(node: ts.Node): ts.Node {
        if (
          ts.isVariableDeclaration(node) &&
          node.initializer &&
          ts.isArrowFunction(node.initializer)
        ) {
          const arrow = node.initializer;
          return ts.factory.createFunctionDeclaration(
            undefined,
            undefined,
            node.name as ts.Identifier,
            undefined,
            arrow.parameters,
            undefined,
            arrow.body
          );
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(root, visit) as ts.SourceFile;
    };
  };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter();
  return printer.printNode(ts.EmitHint.Unspecified, result.transformed[0], sourceFile);
}

// Babel 风格：访问者模式
type NodePath = { node: any; replaceWith: (n: any) => void };

function babelStyleTransformer(source: string) {
  // 伪代码：Babel 的 visitor 模式
  const visitors = {
    ArrowFunctionExpression(path: NodePath) {
      // 转换为 FunctionDeclaration 逻辑
      console.log('Transforming arrow function');
    }
  };
  return visitors;
}
```

### OpenAPI Schema → TypeScript 类型

```typescript
// openapi-client-gen.ts
export function schemaToTypeScript(schema: { type: string; properties?: Record<string, unknown> }): string {
  if (schema.type === 'object' && schema.properties) {
    const fields = Object.entries(schema.properties)
      .map(([key, val]: [string, any]) => {
        const optional = schema.required?.includes(key) ? '' : '?';
        return `  ${key}${optional}: ${jsonTypeToTs(val.type)};`;
      })
      .join('\n');
    return `{\n${fields}\n}`;
  }
  return jsonTypeToTs(schema.type);
}

function jsonTypeToTs(type: string): string {
  const map: Record<string, string> = { string: 'string', integer: 'number', boolean: 'boolean', array: 'unknown[]' };
  return map[type] ?? 'unknown';
}

// 完整 OpenAPI 客户端生成骨架
export function generateClient(spec: { paths: Record<string, any> }): string {
  const lines = ['class APIClient {'];
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, def] of Object.entries(methods)) {
      const fnName = `${method}${path.replace(/\//g, '_')}`;
      lines.push(`  async ${fnName}(params: any) {`);
      lines.push(`    return this.request('${method.toUpperCase()}', '${path}', params);`);
      lines.push(`  }`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}
```

### AI 提示词模板编译器

```typescript
// template-engine.ts
export function compileTemplate(template: string) {
  const regex = /\{\{(\s*[\w.]+\s*)\}\}/g;

  return (context: Record<string, unknown>): string => {
    return template.replace(regex, (_match, key) => {
      const path = key.trim().split('.');
      let value: unknown = context;
      for (const segment of path) {
        value = (value as Record<string, unknown>)?.[segment];
      }
      return value !== undefined ? String(value) : '';
    });
  };
}

// 用法
const prompt = compileTemplate('Generate a {{language}} function that {{task}}.');
prompt({ language: 'TypeScript', task: 'sorts an array' });
// → "Generate a TypeScript function that sorts an array."

// 高级：条件分支与循环（Handlebars 风格）
export function compileAdvancedTemplate(template: string) {
  return (context: Record<string, unknown>) => {
    return template
      .replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (_m, cond, body) => {
        return context[cond] ? body : '';
      })
      .replace(/\{\{(\w+)\}\}/g, (_m, key) => String(context[key] ?? ''));
  };
}
```

### 代码生成流水线（AI 后处理）

```typescript
// ai-code-generator.ts
export class AICodePipeline {
  async generate(prompt: string, model: string): Promise<string> {
    // 1. 调用 LLM API
    const raw = await this.callLLM(prompt, model);

    // 2. 提取代码块
    const code = this.extractCodeBlocks(raw);

    // 3. 语法校验
    const valid = await this.lintTypeScript(code);
    if (!valid) {
      // 4. 自修复循环
      return this.selfHeal(code, prompt);
    }

    return code;
  }

  private extractCodeBlocks(raw: string): string {
    const match = raw.match(/```typescript\n([\s\S]*?)```/);
    return match ? match[1].trim() : raw.trim();
  }

  private async lintTypeScript(code: string): Promise<boolean> {
    const sourceFile = ts.createSourceFile('tmp.ts', code, ts.ScriptTarget.Latest, true);
    // 简单检查：无语法错误节点
    let hasError = false;
    function visit(node: ts.Node) {
      if (node.kind === ts.SyntaxKind.Unknown) hasError = true;
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return !hasError;
  }

  private async selfHeal(code: string, originalPrompt: string): Promise<string> {
    const fixPrompt = `The following TypeScript has errors. Fix them:\n${code}`;
    return this.generate(fixPrompt, 'gpt-4');
  }

  private async callLLM(prompt: string, model: string): Promise<string> {
    // 占位：实际调用 OpenAI / Anthropic / Azure 等
    return `\`\`\`typescript\nconst answer = 42;\n\`\`\``;
  }
}
```

### 模板代码生成器（Hygen / Plop 风格）

```typescript
// codegen-scaffold.ts
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ScaffoldConfig {
  name: string;
  type: 'component' | 'hook' | 'service';
  outDir: string;
}

export function scaffold(config: ScaffoldConfig) {
  const { name, type, outDir } = config;
  const dir = join(outDir, name);
  mkdirSync(dir, { recursive: true });

  const templates: Record<string, () => string> = {
    component: () => `export function ${name}() {\n  return <div>${name}</div>;\n}`,
    hook: () => `export function use${name}() {\n  // TODO: implement\n  return {};\n}`,
    service: () => `export class ${name}Service {\n  async fetch() {\n    // TODO: implement\n  }\n}`,
  };

  writeFileSync(join(dir, 'index.ts'), templates[type]());
  writeFileSync(join(dir, `${name}.test.ts`), `test('${name} works', () => {});`);
}

// 用法
scaffold({ name: 'UserCard', type: 'component', outDir: './src' });
```

### JSON Schema → Zod 运行时校验生成器

```typescript
// json-schema-to-zod.ts
import { z } from 'zod';

export function jsonSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (typeof schema !== 'object' || schema === null) return z.any();
  const s = schema as Record<string, unknown>;

  switch (s.type) {
    case 'string': {
      let zod = z.string();
      if (s.minLength !== undefined) zod = zod.min(s.minLength as number);
      if (s.maxLength !== undefined) zod = zod.max(s.maxLength as number);
      if (s.pattern !== undefined) zod = zod.regex(new RegExp(s.pattern as string));
      return zod;
    }
    case 'number':
    case 'integer': {
      let zod = s.type === 'integer' ? z.number().int() : z.number();
      if (s.minimum !== undefined) zod = zod.min(s.minimum as number);
      if (s.maximum !== undefined) zod = zod.max(s.maximum as number);
      return zod;
    }
    case 'boolean':
      return z.boolean();
    case 'array': {
      const items = s.items ? jsonSchemaToZod(s.items) : z.any();
      let zod = z.array(items);
      if (s.minItems !== undefined) zod = zod.min(s.minItems as number);
      if (s.maxItems !== undefined) zod = zod.max(s.maxItems as number);
      return zod;
    }
    case 'object': {
      const shape: Record<string, z.ZodTypeAny> = {};
      const props = (s.properties ?? {}) as Record<string, unknown>;
      const required = new Set<string>((s.required as string[]) ?? []);
      for (const [key, val] of Object.entries(props)) {
        shape[key] = required.has(key) ? jsonSchemaToZod(val) : jsonSchemaToZod(val).optional();
      }
      return z.object(shape);
    }
    default:
      return z.any();
  }
}

// 使用示例
const schema = {
  type: 'object',
  required: ['email', 'age'],
  properties: {
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0, maximum: 150 },
    tags: { type: 'array', items: { type: 'string' } },
  },
};
const UserSchema = jsonSchemaToZod(schema);
type User = z.infer<typeof UserSchema>;
```

### React 组件生成器（AI 辅助）

```typescript
// react-component-gen.ts
interface PropField {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export function generateReactComponent(
  name: string,
  props: PropField[],
  options: { withStyles?: boolean; withTest?: boolean } = {}
): Record<string, string> {
  const propsInterface = props.length
    ? `interface ${name}Props {\n${props
        .map((p) => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`)
        .join('\n')}\n}`
    : '';

  const propDestructuring = props.length ? `{ ${props.map((p) => p.name).join(', ')} }` : '';
  const propType = props.length ? `${name}Props` : 'Record<string, never>';

  const component = `${propsInterface ? propsInterface + '\n\n' : ''}export function ${name}(${propDestructuring}: ${propType}) {
  return (
    <div data-testid="${name.toLowerCase()}">
      {/* TODO: implement ${name} */}
    </div>
  );
}`;

  const files: Record<string, string> = {
    [`${name}.tsx`]: component,
  };

  if (options.withStyles) {
    files[`${name}.module.css`] = `.root {\n  /* styles for ${name} */\n}`;
  }

  if (options.withTest) {
    files[`${name}.test.tsx`] = `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

test('renders ${name}', () => {
  render(<${name} ${props.map((p) => `${p.name}={${p.defaultValue ?? "''"}}`).join(' ')} />);
  expect(screen.getByTestId('${name.toLowerCase()}')).toBeInTheDocument();
});`;
  }

  return files;
}
```

### Prompt Chain 代码生成工作流

```typescript
// prompt-chain.ts
interface PromptStep {
  id: string;
  template: string;
  transform?: (output: string) => string;
}

export class PromptChain {
  private steps: PromptStep[] = [];

  add(step: PromptStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(context: Record<string, unknown>, llmCall: (prompt: string) => Promise<string>): Promise<string> {
    let accumulated = '';
    for (const step of this.steps) {
      const prompt = this.interpolate(step.template, { ...context, previous: accumulated });
      const raw = await llmCall(prompt);
      accumulated = step.transform ? step.transform(raw) : raw;
    }
    return accumulated;
  }

  private interpolate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(context[key] ?? ''));
  }
}

// 使用示例：三步生成完整 CRUD 服务
const crudChain = new PromptChain()
  .add({
    id: 'schema',
    template: 'Generate a TypeScript interface for a {{entity}} with fields: {{fields}}. Return only the interface.',
  })
  .add({
    id: 'validator',
    template: 'Given the interface:\n{{previous}}\nGenerate a Zod schema for validation. Return only the schema.',
  })
  .add({
    id: 'service',
    template: 'Given the Zod schema:\n{{previous}}\nGenerate a Prisma service with CRUD methods. Return only the code.',
  });
```

### SWC 插件快速转换（Rust 原生 AST 处理）

```typescript
// swc-transformer.ts — 基于 SWC 的高性能代码转换
import { transformSync } from '@swc/core';

export function stripConsoleLogs(source: string): string {
  return transformSync(source, {
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      target: 'es2022',
      experimental: {
        plugins: [
          [
            '@swc/plugin-transform-imports',
            {
              // 配置转换规则
            },
          ],
        ],
      },
    },
  }).code;
}

// 自定义 Visitor 模式（通过 @swc/wasm-web 在浏览器中运行）
import { parse, print } from '@swc/wasm-web';

export async function renameIdentifier(source: string, oldName: string, newName: string): Promise<string> {
  const ast = await parse(source, { syntax: 'typescript', tsx: true });

  function visit(node: any): any {
    if (node?.type === 'Identifier' && node.value === oldName) {
      return { ...node, value: newName };
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        node[key] = visit(node[key]);
      }
    }
    return node;
  }

  const transformed = visit(ast);
  return print(transformed).code;
}
```

### Plop.js 微生成器配置

```typescript
// plopfile.ts — 交互式脚手架定义
import { NodePlopAPI } from 'plop';

export default function (plop: NodePlopAPI) {
  plop.setGenerator('component', {
    description: 'Create a React component',
    prompts: [
      { type: 'input', name: 'name', message: 'Component name' },
      { type: 'confirm', name: 'withStyles', message: 'Include CSS module?' },
      { type: 'confirm', name: 'withTest', message: 'Include test file?' },
    ],
    actions: (data) => {
      const actions: any[] = [
        {
          type: 'add',
          path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
          templateFile: 'plop-templates/component.tsx.hbs',
        },
      ];
      if (data?.withStyles) {
        actions.push({
          type: 'add',
          path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.module.css',
          templateFile: 'plop-templates/component.css.hbs',
        });
      }
      if (data?.withTest) {
        actions.push({
          type: 'add',
          path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
          templateFile: 'plop-templates/component.test.tsx.hbs',
        });
      }
      return actions;
    },
  });
}
```

## 关联模块

- `33-ai-integration` — AI 集成
- `55-ai-testing` — AI 辅助测试
- `97-lowcode-platform` — 低代码平台（代码生成目标场景）
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Babel Plugin Handbook | 指南 | [github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) |
| TypeScript Compiler API | 文档 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| OpenAPI Generator | 文档 | [openapi-generator.tech](https://openapi-generator.tech) |
| Handlebars.js | 文档 | [handlebarsjs.com](https://handlebarsjs.com) |
| Claude Code — Best Practices | 指南 | [docs.anthropic.com/en/docs/claude-code/best-practices](https://docs.anthropic.com/en/docs/claude-code/best-practices) |
| GitHub Copilot — Prompt Engineering | 指南 | [docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot](https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot) |
| swc (Rust-based compiler) | 文档 | [swc.rs](https://swc.rs) |
| AST Explorer | 工具 | [astexplorer.net](https://astexplorer.net) |
| Plop.js — Micro-generator | 文档 | [plopjs.com](https://plopjs.com) |
| Hygen — Scaffolding tool | 文档 | [hygen.io](https://www.hygen.io) |
| ts-morph — TypeScript AST Manipulation | 文档 | [ts-morph.com](https://ts-morph.com) |
| Zod — TypeScript-first schema validation | 文档 | [zod.dev](https://zod.dev) |
| ESBuild — Extremely fast bundler | 文档 | [esbuild.github.io](https://esbuild.github.io) |
| Recast — JavaScript AST transformation | 文档 | [github.com/benjamn/recast](https://github.com/benjamn/recast) |
| Superstruct — Composable data validation | 文档 | [docs.superstructjs.org](https://docs.superstructjs.org) |
| LangChain JS — LLM orchestration | 文档 | [js.langchain.com](https://js.langchain.com) |
| Vercel AI SDK — Streaming UI toolkit | 文档 | [sdk.vercel.ai/docs](https://sdk.vercel.ai/docs) |
| Quicktype — Generate types from JSON | 工具 | [quicktype.io](https://app.quicktype.io) |
| unplugin — Unified plugin system | GitHub | [github.com/unjs/unplugin](https://github.com/unjs/unplugin) — Vite/Rollup/Webpack 通用插件 |
| jscodeshift — Codemod toolkit | GitHub | [github.com/facebook/jscodeshift](https://github.com/facebook/jscodeshift) — 大规模代码迁移工具 |
| ts-node — TypeScript execution | 文档 | [typestrong.org/ts-node](https://typestrong.org/ts-node/) — TS 直接运行 |
| oclif — CLI framework | 文档 | [oclif.io](https://oclif.io/) — Node.js CLI 脚手架框架 |
| Rome/ Biome — Unified toolchain | 文档 | [biomejs.dev](https://biomejs.dev/) — 替代 ESLint + Prettier 的统一工具链 |
| CodeMods with jscodeshift | 博客 | [www.toptal.com/javascript/write-code-to-rewrite-your-code](https://www.toptal.com/javascript/write-code-to-rewrite-your-code) |
| Codex by OpenAI | 文档 | [platform.openai.com/docs/guides/codex](https://platform.openai.com/docs/guides/codex) — 代码生成模型 |

---

*最后更新: 2026-04-30*
