---
dimension: 语言核心
sub-dimension: 编译器设计与语言实现
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「语言核心」** 维度，聚焦 编译器设计与语言实现 核心概念与工程实践。

## 包含内容

- 编译器前端/后端、AST、类型检查、代码生成、语言转换工具链。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `lexer/` | 词法分析与 Token 流生成 | `lexer.ts`, `lexer.test.ts` |
| `parser/` | 递归下降 / Pratt 解析器 | `parser.ts`, `parser.test.ts` |
| `ast/` | 抽象语法树定义与遍历 | `ast.ts`, `ast.test.ts` |
| `type-checker/` | 静态类型检查基础 | `type-checker.ts` |
| `code-gen/` | 目标代码生成与优化 | `code-gen.ts`, `code-gen.test.ts` |
| `compiler-pipeline/` | 完整编译流水线集成 | `compiler-pipeline.ts`, `compiler-pipeline.test.ts` |

## 代码示例

### 轻量词法分析器

```typescript
type TokenType = 'NUMBER' | 'IDENT' | 'PLUS' | 'MINUS' | 'LPAREN' | 'RPAREN' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < source.length) {
    const ch = source[pos];
    if (/\s/.test(ch)) { pos++; continue; }
    if (/\d/.test(ch)) {
      let start = pos;
      while (/\d/.test(source[pos])) pos++;
      tokens.push({ type: 'NUMBER', value: source.slice(start, pos), pos: start });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let start = pos;
      while (/[a-zA-Z0-9_]/.test(source[pos])) pos++;
      tokens.push({ type: 'IDENT', value: source.slice(start, pos), pos: start });
      continue;
    }
    const single: Record<string, TokenType> = { '+': 'PLUS', '-': 'MINUS', '(': 'LPAREN', ')': 'RPAREN' };
    if (single[ch]) {
      tokens.push({ type: single[ch], value: ch, pos });
      pos++;
      continue;
    }
    throw new Error(`Unknown char ${ch} at ${pos}`);
  }
  tokens.push({ type: 'EOF', value: '', pos });
  return tokens;
}
```

### AST 节点定义与访问者

```typescript
type Expr =
  | { kind: 'Literal'; value: number }
  | { kind: 'Ident'; name: string }
  | { kind: 'Binary'; op: '+' | '-'; left: Expr; right: Expr };

function evaluate(expr: Expr, env: Map<string, number>): number {
  switch (expr.kind) {
    case 'Literal': return expr.value;
    case 'Ident': return env.get(expr.name) ?? 0;
    case 'Binary':
      const l = evaluate(expr.left, env);
      const r = evaluate(expr.right, env);
      return expr.op === '+' ? l + r : l - r;
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 ast.test.ts
- 📄 ast.ts
- 📄 code-gen.test.ts
- 📄 code-gen.ts
- 📄 compiler-pipeline.test.ts
- 📄 compiler-pipeline.ts
- 📄 index.ts
- 📄 lexer.test.ts
- 📄 lexer.ts
- 📄 parser.test.ts
- 📄 parser.ts

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Crafting Interpreters | 书籍 | [craftinginterpreters.com](https://craftinginterpreters.com/) |
| TypeScript Compiler API | 官方 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| Babel Plugin Handbook | 指南 | [github.com/jamiebuilds/babel-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) |
| Esprima AST | 规范 | [esprima.org](https://esprima.org/) |
| SWC 文档 | 编译器 | [swc.rs](https://swc.rs/) |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
