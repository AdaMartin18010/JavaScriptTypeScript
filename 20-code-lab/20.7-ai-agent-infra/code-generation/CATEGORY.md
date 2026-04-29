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

---

*最后更新: 2026-04-29*
