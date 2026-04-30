# 代码生成 — 理论基础

## 1. AST（抽象语法树）

源代码的结构化表示，编译器和代码生成工具的核心数据结构：

```
const x = 1 + 2
→
VariableDeclaration
├── declarations
│   └── VariableDeclarator
│       ├── id: Identifier (x)
│       └── init: BinaryExpression (+)
│           ├── left: Literal (1)
│           └── right: Literal (2)
```

## 2. 代码生成工具链对比

| 特性 | Babel | SWC | ESBuild | Oxc | TypeScript Compiler API |
|------|-------|-----|---------|-----|------------------------|
| **语言** | JavaScript | Rust | Go | Rust | TypeScript |
| **主要用途** | 转译、插件生态 | 极速转译 | 极速打包 | 统一工具链 | 类型检查、声明生成 |
| **构建速度** | 中等 | ⚡ 极快（10-20x Babel）| ⚡ 极快（10-20x Babel）| ⚡ 极快 | 慢（侧重类型） |
| **插件系统** | ✅ 极其丰富 | ⚠️ 实验性插件 | ❌ 无插件 | 🚧 开发中 | ✅ 完整 Transformer API |
| **TypeScript 支持** | 通过 preset | 原生支持 | 原生支持 | 原生支持 | 原生（参考实现） |
| **Tree-shaking** | 依赖配置 | 内置 | 内置 | 内置 | 不支持 |
| **Source Map** | 精确 | 精确 | 精确 | 精确 | 精确 |
| **适用场景** | 复杂转换需求 | 大规模项目构建 | 极速开发模式 | 下一代统一工具 | 类型诊断、语言服务 |

### 选型建议

- **需要自定义 AST 转换** → Babel（生态成熟）或 TypeScript Compiler API（类型感知）
- **追求极致构建速度** → SWC（Next.js/Vite 已采用）或 ESBuild
- **需要类型检查 + 打包一体** → TypeScript（tsc）+ ESBuild/SWC 组合
- **未来统一工具链** → 关注 Oxc 演进

## 3. AST 转换代码示例

```typescript
// ast-transform.ts — 使用 Babel 将 console.log 替换为结构化日志

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const code = `
function greet(name) {
  console.log('Hello, ' + name);
  return name.toUpperCase();
}
`;

const ast = parse(code, { sourceType: 'module' });

traverse(ast, {
  CallExpression(path) {
    const { callee } = path.node;
    // 匹配 console.log(...)
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'console' }) &&
      t.isIdentifier(callee.property, { name: 'log' })
    ) {
      // 替换为: logger.info(...)
      path.node.callee = t.memberExpression(
        t.identifier('logger'),
        t.identifier('info')
      );
    }
  }
});

const output = generate(ast, {}, code);
console.log(output.code);
// 输出:
// function greet(name) {
//   logger.info('Hello, ' + name);
//   return name.toUpperCase();
// }
```

### 等价的 SWC 插件（Rust 伪代码概念）

```rust
// swc-plugin/src/lib.rs — SWC 插件核心结构
use swc_core::ecma::visit::VisitMut;

pub struct ConsoleToLogger;

impl VisitMut for ConsoleToLogger {
    fn visit_mut_call_expr(&mut self, expr: &mut CallExpr) {
        // 匹配 console.log 并替换为 logger.info
        if is_console_log(expr) {
            expr.callee = MemberExpr {
                obj: Ident::new("logger".into()),
                prop: Ident::new("info".into()).into(),
            }.into();
        }
    }
}
```

## 4. TypeScript Compiler API：类型感知代码生成

```typescript
// ts-compiler-api.ts
import * as ts from 'typescript';

const sourceCode = `
interface User {
  id: number;
  name: string;
}
`;

const sourceFile = ts.createSourceFile(
  'temp.ts',
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

// 遍历接口并生成 Zod Schema 代码
function generateZodSchema(sourceFile: ts.SourceFile): string {
  let output = '';
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      output += `const ${node.name.text}Schema = z.object({\n`;
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.type) {
          const name = (member.name as ts.Identifier).text;
          const typeText = member.type.getText(sourceFile);
          const zodType =
            typeText === 'number' ? 'z.number()' :
            typeText === 'string' ? 'z.string()' : 'z.any()';
          output += `  ${name}: ${zodType},\n`;
        }
      }
      output += `});\n`;
    }
  });
  return output;
}

console.log(generateZodSchema(sourceFile));
// 输出:
// const UserSchema = z.object({
//   id: z.number(),
//   name: z.string(),
// });
```

## 5. OpenAPI 驱动代码生成

```typescript
// openapi-codegen.ts
import openapiTS from 'openapi-typescript';

const schema = await fetch('https://petstore3.swagger.io/api/v3/openapi.json').then(r => r.json());

const types = await openapiTS(schema);
console.log(types);
// 生成 TypeScript 类型：
// export interface paths {
//   "/pet": {
//     post: { requestBody: { content: { "application/json": components["schemas"]["Pet"] } } };
//   };
// }
```

## 6. 模板驱动代码生成（Handlebars）

```typescript
// template-codegen.ts
import Handlebars from 'handlebars';

const componentTemplate = Handlebars.compile(`
import React from 'react';

export interface {{name}}Props {
  {{#each props}}
  {{name}}: {{type}};
  {{/each}}
}

export const {{name}}: React.FC<{{name}}Props> = (props) => {
  return <div>{props.title}</div>;
};
`);

const code = componentTemplate({
  name: 'HeroBanner',
  props: [
    { name: 'title', type: 'string' },
    { name: 'imageUrl', type: 'string' },
  ],
});

console.log(code);
```

## 7. Zod Schema 转 TypeScript 接口（反向生成）

```typescript
// zod-to-ts.ts
import { z } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

const { node } = zodToTs(UserSchema, 'User');
console.log(printNode(node));
// 输出:
// interface User {
//   id: number;
//   email: string;
//   role: "admin" | "user";
// }
```

## 8. 代码变换：jscodeshift 批量迁移

```typescript
// codemod/transforms/replace-imports.ts — 批量替换废弃的导入路径
import { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // 替换旧包名导入为新包名
  root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === '@deprecated/ui-lib')
    .forEach(path => {
      path.node.source.value = '@newco/design-system';
    });

  // 替换具名导入的组件名
  root
    .find(j.ImportSpecifier)
    .filter(path => path.node.imported.name === 'OldButton')
    .forEach(path => {
      path.node.imported.name = 'Button';
      if (path.node.local) path.node.local.name = 'Button';
    });

  return root.toSource({ quote: 'single' });
}

// 运行方式：
// npx jscodeshift -t codemod/transforms/replace-imports.ts src/**/*.tsx --parser=tsx
```

## 9. 元编程模式

- **装饰器（Decorator）**: 注解式元数据附加
- **Reflect API**: 运行时类型和元数据操作
- **Proxy**: 拦截对象操作
- **代码模板**: 基于 AST 的代码片段生成
- **宏（Macro）**: 编译期代码生成（如 `babel-plugin-macros`）

## 10. 代码示例：LLM 驱动的代码生成（OpenAI API）

```typescript
// llm-codegen.ts — 利用大语言模型生成类型安全代码
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GeneratedCode {
  filename: string;
  code: string;
  language: 'typescript' | 'javascript';
}

async function generateZodSchemaFromDescription(
  description: string
): Promise<GeneratedCode> {
  const prompt = `
根据以下描述生成 TypeScript Zod Schema，只输出代码块：
"""${description}"""
要求：
1. 使用 z.object() 定义
2. 包含 .email()、.min()、.max() 等约束
3. 导出类型推导：export type X = z.infer<typeof XSchema>;
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '你是一个 TypeScript 代码生成专家。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0].message.content ?? '';
  const code = raw.replace(/```typescript\n?/g, '').replace(/```\n?/g, '').trim();

  return { filename: 'generated-schema.ts', code, language: 'typescript' };
}

// 使用示例
const result = await generateZodSchemaFromDescription(
  '用户注册表单：邮箱（必填）、密码（8-32位）、年龄（可选，18-120）、角色（admin/user/guest）'
);
console.log(result.code);
```

## 11. 代码示例：GraphQL Code Generator 端到端类型生成

```typescript
// codegen.ts — 基于 GraphQL Schema 生成 TypeScript 类型与 React Hooks
import { codegen } from '@graphql-codegen/core';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptReactApolloPlugin from '@graphql-codegen/typescript-react-apollo';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    user(id: ID!): User
  }
  type User {
    id: ID!
    email: String!
    profile: Profile
  }
  type Profile {
    displayName: String
    avatar: String
  }
`);

const documents = [
  {
    document: parse(`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          email
          profile { displayName avatar }
        }
      }
    `),
  },
];

const output = await codegen({
  schema,
  documents,
  config: { skipTypename: true },
  filename: 'generated.ts',
  pluginMap: {
    typescript: typescriptPlugin,
    typescriptOperations: typescriptOperationsPlugin,
    typescriptReactApollo: typescriptReactApolloPlugin,
  },
  plugins: [
    { typescript: {} },
    { typescriptOperations: {} },
    { typescriptReactApollo: { withHooks: true } },
  ],
});

// 输出包含：TypeScript 类型 + React Apollo useGetUserQuery Hook
console.log(output);
```

## 12. 代码示例：自定义 ESLint 规则（自动代码规范生成）

```typescript
// eslint-plugin-custom/rules/no-raw-sql.ts
import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止直接拼接 SQL 字符串，强制使用参数化查询',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noRawSql:
        '检测到可能的 SQL 注入风险。请使用参数化查询或查询构建器（如 Knex / Prisma）。',
    },
  },
  create(context) {
    return {
      // 检测字符串拼接中的 SQL 关键字
      BinaryExpression(node) {
        if (node.operator !== '+') return;
        const source = context.getSourceCode().getText(node);
        const sqlKeywords = /SELECT|INSERT|UPDATE|DELETE|DROP/i;
        if (sqlKeywords.test(source) && source.includes('+')) {
          context.report({ node, messageId: 'noRawSql' });
        }
      },
      // 检测模板字符串中的变量插值 + SQL 关键字
      TemplateLiteral(node) {
        const source = context.getSourceCode().getText(node);
        const sqlKeywords = /SELECT|INSERT|UPDATE|DELETE/i;
        if (sqlKeywords.test(source) && node.expressions.length > 0) {
          context.report({ node, messageId: 'noRawSql' });
        }
      },
    };
  },
};

export default rule;

// 注册方式：在 eslint.config.js 中
// import customPlugin from './eslint-plugin-custom';
// plugins: { custom: customPlugin },
// rules: { 'custom/no-raw-sql': 'error' }
```

## 10. 与相邻模块的关系

- **79-compiler-design**: 编译器的完整设计
- **78-metaprogramming**: 元编程技术
- **23-toolchain-configuration**: 工具链配置

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Babel Plugin Handbook | 手册 | [github.com/jamiebuilds/babel-handbook](https://github.com/jamiebuilds/babel-handbook) |
| Babel Parser AST Spec | 规范 | [babeljs.io/docs/babel-parser](https://babeljs.io/docs/babel-parser) |
| SWC Documentation | 文档 | [swc.rs](https://swc.rs) |
| ESBuild Docs | 文档 | [esbuild.github.io](https://esbuild.github.io) |
| Oxc Project | 代码库 | [github.com/oxc-project/oxc](https://github.com/oxc-project/oxc) |
| TypeScript Compiler API | 文档 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| AST Explorer | 工具 | [astexplorer.net](https://astexplorer.net) — 交互式 AST 可视化 |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |
| openapi-typescript | 仓库 | [github.com/drwpow/openapi-typescript](https://github.com/drwpow/openapi-typescript) |
| Handlebars.js | 文档 | [handlebarsjs.com](https://handlebarsjs.com/) |
| zod-to-ts | 仓库 | [github.com/sachinraja/zod-to-ts](https://github.com/sachinraja/zod-to-ts) |
| babel-plugin-macros | 仓库 | [github.com/kentcdodds/babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros) |
| jscodeshift | 仓库 | [github.com/facebook/jscodeshift](https://github.com/facebook/jscodeshift) — Facebook 开源的代码迁移工具 |
| ts-morph | 仓库 | [github.com/dsherret/ts-morph](https://github.com/dsherret/ts-morph) — TypeScript AST 操作简化库 |
| unplugin | 仓库 | [github.com/unjs/unplugin](https://github.com/unjs/unplugin) — 通用构建工具插件框架 |
| ECMAScript Spec | 规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) — ECMA-262 语言规范 |
| Webpack Loader API | 文档 | [webpack.js.org/api/loaders](https://webpack.js.org/api/loaders/) |
| Vite Plugin API | 文档 | [vitejs.dev/guide/api-plugin](https://vitejs.dev/guide/api-plugin) |
| Rollup Plugin Development | 文档 | [rollupjs.org/plugin-development](https://rollupjs.org/plugin-development/) |
| Rome / Biome | 代码库 | [github.com/biomejs/biome](https://github.com/biomejs/biome) — 下一代 JS 工具链 |
| GraphQL Code Generator | 文档 | [the-guild.dev/graphql/codegen](https://the-guild.dev/graphql/codegen) — GraphQL 端到端类型生成 |
| OpenAI API | 文档 | [platform.openai.com/docs](https://platform.openai.com/docs) — LLM 驱动代码生成 |
| Anthropic Claude API | 文档 | [docs.anthropic.com](https://docs.anthropic.com/) — Claude 代码辅助 |
| LangChain.js | 仓库 | [github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) — LLM 应用框架 |
| Prettier Plugin API | 文档 | [prettier.io/docs/en/plugins](https://prettier.io/docs/en/plugins.html) — 代码格式化插件开发 |
| ESLint Custom Rules | 文档 | [eslint.org/docs/latest/extend/custom-rules](https://eslint.org/docs/latest/extend/custom-rules) — 自定义规则开发 |
| tsoa — TypeScript OpenAPI | 仓库 | [github.com/lukeautry/tsoa](https://github.com/lukeautry/tsoa) — 从 TypeScript 控制器生成 OpenAPI Spec |
| Prisma Client Extensions | 文档 | [prisma.io/docs/orm/prisma-client/client-extensions](https://www.prisma.io/docs/orm/prisma-client/client-extensions) — 运行时代码生成扩展 |
| NestJS CLI & Schematics | 文档 | [docs.nestjs.com/recipes/crud-generator](https://docs.nestjs.com/recipes/crud-generator) — 基于模板的 CRUD 生成 |
| Plop.js | 仓库 | [github.com/plopjs/plop](https://github.com/plopjs/plop) — 轻量级微生成器框架 |
| Hygen | 仓库 | [github.com/jondot/hygen](https://github.com/jondot/hygen) — 可扩展代码生成器 |
| Swc Plugin Development | 文档 | [swc.rs/docs/plugin/selecting-swc-core](https://swc.rs/docs/plugin/selecting-swc-core) — SWC 插件开发指南 |
| Rust Bindings for Node.js (napi-rs) | 仓库 | [github.com/napi-rs/napi-rs](https://github.com/napi-rs/napi-rs) — Rust 原生 Node 模块 |

---

*最后更新: 2026-04-29*
