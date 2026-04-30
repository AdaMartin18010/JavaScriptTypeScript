# Compiler Design

> **定位**：`30-knowledge-base/30.2-categories/compiler-design.md`
> **关联**：`10-fundamentals/10.1-language-semantics/` | `20-code-lab/20.1-fundamentals-lab/compiler-design/`

---

## 概述

编译器设计是 JavaScript/TypeScript 生态系统的核心基础设施。从 TypeScript 编译器（tsc）到下一代原生编译器（tsgo），编译技术决定了开发体验与运行时性能的边界。

---

## 编译器流水线 (Lexing → Parsing → Transforming → Emitting)

| 阶段 | 输入 | 输出 | 关键算法/数据结构 | 代表工具 |
|------|------|------|-------------------|---------|
| **Lexing (词法分析)** | 源代码字符串 | Token 流 | 正则表达式 / DFA | `tsc` Scanner, `swc`, `oxc` |
| **Parsing (语法分析)** | Token 流 | AST (抽象语法树) | Recursive Descent / LR | `acorn`, `babel-parser`, `swc` |
| **Semantic Analysis** | AST | 带类型的 AST / Symbol Table | 类型推断、作用域解析 | `tsc` Binder + Checker |
| **Transforming (转换)** | AST | 转换后的 AST | Visitor Pattern | `babel-traverse`, `ts-morph`, `swc` |
| **Emitting (代码生成)** | 转换后的 AST | 目标代码字符串 | 模板生成、Source Map | `tsc` Emitter, `esbuild` |
| **Bundling (可选)** | 多文件模块图 | 单一/分块输出 | 图遍历、Tree Shaking | `rollup`, `esbuild`, `webpack` |

### 流水线示意图

```
Source Code
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Lexer     │────→│   Parser    │────→│  Semantic Check │
│  (Scanner)  │     │  (AST Gen)  │     │  (Type Check)   │
└─────────────┘     └─────────────┘     └─────────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ Transformer │
                                        │ (Visitor)   │
                                        └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │   Emitter   │
                                        │ (Code Gen)  │
                                        └─────────────┘
                                              │
                                              ▼
                                        Target Code + Source Map
```

---

## 核心工具对比

| 工具 | 语言 | Lexer/Parser | 类型检查 | 转换/生成 | 典型用途 |
|------|------|-------------|---------|-----------|---------|
| **tsc** | TypeScript | 自研 Scanner + Parser | ✅ 完整 | TS → JS | 类型检查、声明文件 |
| **tsgo** | Go | 自研 (Go 重写) | ✅ 完整 (WIP) | TS → JS / Go | 下一代原生性能编译器 |
| **SWC** | Rust | 自研 | ❌ (Strip only) | TS/JS → JS | 超高速 transpile/bundle |
| **Babel** | JavaScript | `@babel/parser` | ❌ (Flow only) | AST → AST → JS | 插件生态、语法降级 |
| **esbuild** | Go | 自研 | ❌ | TS/JS → JS | 极速 bundle |
| **OXC** | Rust | 自研 | ❌ (Planned) | Lint + Minify | 下一代 JS 工具链平台 |

---

## 代码示例：Babel 插件 (Transform Stage)

```js
// babel-plugin-console-strip.js
// 作用：在生产构建中自动移除 console.* 调用

module.exports = function consoleStripPlugin({ types: t }) {
  return {
    name: 'console-strip',
    visitor: {
      // 匹配 CallExpression 节点
      CallExpression(path) {
        const callee = path.node.callee;

        // 检查是否为 console.xxx()
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' })
        ) {
          // 替换为 void 0 或完全移除语句
          if (t.isExpressionStatement(path.parent)) {
            path.remove();
          } else {
            path.replaceWith(t.unaryExpression('void', t.numericLiteral(0)));
          }
        }
      },
    },
  };
};
```

```js
// Usage in babel.config.js
module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' && './babel-plugin-console-strip.js',
  ].filter(Boolean),
};
```

### TypeScript Compiler API 示例 (Semantic + Emit)

```ts
// compile-project.ts
import * as ts from 'typescript';

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  diagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  process.exit(exitCode);
}

compile(process.argv.slice(2), {
  noEmitOnError: true,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  outDir: './dist',
});
```

### 代码示例：手写递归下降解析器

```typescript
// mini-parser.ts — 递归下降表达式解析器 (支持 + - * / 和括号)

type Token =
  | { type: 'NUMBER'; value: number }
  | { type: 'OP'; value: '+' | '-' | '*' | '/' }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' }
  | { type: 'EOF' };

class Lexer {
  private pos = 0;
  constructor(private input: string) {}

  nextToken(): Token {
    this.skipWhitespace();
    if (this.pos >= this.input.length) return { type: 'EOF' };

    const char = this.input[this.pos];

    if (/\d/.test(char)) {
      let num = '';
      while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
        num += this.input[this.pos++];
      }
      return { type: 'NUMBER', value: parseInt(num, 10) };
    }

    if (char === '+') { this.pos++; return { type: 'OP', value: '+' }; }
    if (char === '-') { this.pos++; return { type: 'OP', value: '-' }; }
    if (char === '*') { this.pos++; return { type: 'OP', value: '*' }; }
    if (char === '/') { this.pos++; return { type: 'OP', value: '/' }; }
    if (char === '(') { this.pos++; return { type: 'LPAREN' }; }
    if (char === ')') { this.pos++; return { type: 'RPAREN' }; }

    throw new Error(`Unexpected character: ${char}`);
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

// 递归下降解析器
// Grammar:
//   expr   = term (('+' | '-') term)*
//   term   = factor (('*' | '/') factor)*
//   factor = NUMBER | '(' expr ')'

class Parser {
  private current: Token;
  constructor(private lexer: Lexer) {
    this.current = lexer.nextToken();
  }

  parse(): number {
    const result = this.expr();
    if (this.current.type !== 'EOF') {
      throw new Error('Unexpected token after expression');
    }
    return result;
  }

  private expr(): number {
    let value = this.term();
    while (this.current.type === 'OP' && (this.current.value === '+' || this.current.value === '-')) {
      const op = this.current.value;
      this.advance();
      const right = this.term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }

  private term(): number {
    let value = this.factor();
    while (this.current.type === 'OP' && (this.current.value === '*' || this.current.value === '/')) {
      const op = this.current.value;
      this.advance();
      const right = this.factor();
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }

  private factor(): number {
    if (this.current.type === 'NUMBER') {
      const value = this.current.value;
      this.advance();
      return value;
    }
    if (this.current.type === 'LPAREN') {
      this.advance();
      const value = this.expr();
      if (this.current.type !== 'RPAREN') {
        throw new Error('Expected )');
      }
      this.advance();
      return value;
    }
    throw new Error(`Unexpected token: ${this.current.type}`);
  }

  private advance(): void {
    this.current = this.lexer.nextToken();
  }
}

// 使用
const parser = new Parser(new Lexer('3 + 4 * (2 - 1)'));
console.log(parser.parse()); // 7
```

### 代码示例：SWC 插件（Rust + napi-rs）

```rust
// swc-plugin-strip-debug/src/lib.rs — SWC 编译器插件骨架
use swc_core::ecma::{
    ast::{CallExpr, Callee, Expr, Ident},
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct StripDebugVisitor;

impl VisitMut for StripDebugVisitor {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        if let Callee::Expr(box Expr::Member(member)) = &call.callee {
            if let Expr::Ident(Ident { sym, .. }) = &*member.obj {
                if sym == "console" {
                    // 将 console.*() 替换为 void 0
                    call.callee = Callee::Expr(Box::new(Expr::Ident(Ident::new(
                        "undefined".into(),
                        call.span,
                    ))));
                    call.args.clear();
                }
            }
        }
        call.visit_mut_children_with(self);
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(StripDebugVisitor))
}
```

### 代码示例：使用 ts-morph 进行代码分析与重构

```typescript
// code-refactor.ts — 使用 ts-morph 批量重构代码
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });

// 示例：将所有 var 声明替换为 const
for (const sourceFile of project.getSourceFiles()) {
  sourceFile.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.VariableDeclarationList) {
      const declarationList = node.asKindOrThrow(SyntaxKind.VariableDeclarationList);
      if (declarationList.getDeclarationKind() === 'var') {
        declarationList.setDeclarationKind('const');
      }
    }
  });
}

// 示例：查找所有未使用的导出
for (const sourceFile of project.getSourceFiles()) {
  const exports = sourceFile.getExportedDeclarations();
  for (const [name, declarations] of exports) {
    for (const decl of declarations) {
      const refs = decl.findReferences();
      const nonSelfRefs = refs.flatMap((r) =>
        r.getReferences().filter((ref) => ref.getSourceFile() !== sourceFile)
      );
      if (nonSelfRefs.length === 0) {
        console.log(`Potentially unused export: ${name} in ${sourceFile.getFilePath()}`);
      }
    }
  }
}

project.saveSync();
```

---

## 延伸阅读

- TS 编译器架构
- [Build Tools 对比矩阵](../30.3-comparison-matrices/build-tools-compare.md)

---

## 权威链接

- [TC39 — ECMAScript® Language Specification](https://tc39.es/ecma262/)
- [TypeScript Compiler Internals](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [SWC Architecture](https://swc.rs/docs/usage/core)
- [OXC Project — High-Performance JavaScript Toolchain](https://oxc.rs/)
- [tsgo (Go-based TypeScript Compiler) — GitHub](https://github.com/microsoft/typescript-go)
- [Crafting Interpreters by Robert Nystrom](https://craftinginterpreters.com/)
- [Compilers: Principles, Techniques, and Tools (Dragon Book)](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools)
- [Types and Programming Languages (TAPL)](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [ts-morph — TypeScript AST Manipulation](https://ts-morph.com/)
- [Acorn — Tiny JavaScript Parser](https://github.com/acornjs/acorn)
- [Esprima — ECMAScript Parsing Infrastructure](https://esprima.org/)
- [SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API)
- [AST Explorer](https://astexplorer.net/) — 在线 AST 可视化工具
- [SWC Plugin Development Guide](https://swc.rs/docs/plugin/developing)
- [Rome Tools / Biome](https://biomejs.dev/) — 统一 JS 工具链
- [TypeScript AST Viewer](https://ts-ast-viewer.com/) — TypeScript AST 在线查看器
- [ECMAScript Proposals](https://github.com/tc39/proposals) — TC39 提案追踪
- [JavaScript Parser Benchmarks](https://github.com/marijnz/parser-bench) — 解析器性能基准
- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) — 增量解析器生成器

---

*本文件由重构工具自动生成于 2026-04-28，内容已深化。*
*最后更新: 2026-04-29*
