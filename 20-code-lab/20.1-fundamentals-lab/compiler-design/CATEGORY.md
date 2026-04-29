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

### Pratt 解析器：带优先级的中缀表达式

```typescript
type Token = { type: string; value: string };
type Expr = { kind: 'num'; val: number } | { kind: 'bin'; op: string; left: Expr; right: Expr };

function prattParse(tokens: Token[]): Expr {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const nud = (tok: Token): Expr => {
    if (tok.type === 'NUMBER') return { kind: 'num', val: Number(tok.value) };
    if (tok.type === 'LPAREN') {
      const expr = parseExpression(0);
      if (consume().type !== 'RPAREN') throw new Error('Expected )');
      return expr;
    }
    throw new Error(`Unexpected token ${tok.type}`);
  };

  const led = (left: Expr, tok: Token): Expr => {
    if (tok.type === 'PLUS' || tok.type === 'MINUS') {
      const right = parseExpression(bindingPower(tok));
      return { kind: 'bin', op: tok.value, left, right };
    }
    throw new Error(`Unexpected infix ${tok.type}`);
  };

  const bindingPower = (tok: Token): number => {
    switch (tok.type) {
      case 'PLUS': case 'MINUS': return 10;
      case 'STAR': case 'SLASH': return 20;
      default: return 0;
    }
  };

  const parseExpression = (rbp: number): Expr => {
    let left = nud(consume());
    while (rbp < bindingPower(peek())) {
      left = led(left, consume());
    }
    return left;
  };

  return parseExpression(0);
}
```

### 简单 Hindley-Milner 类型推导（合一算法）

```typescript
type Type =
  | { kind: 'Var'; name: string }
  | { kind: 'Const'; name: string }
  | { kind: 'Fun'; arg: Type; ret: Type };

type Subst = Map<string, Type>;

function apply(subst: Subst, t: Type): Type {
  if (t.kind === 'Var') return subst.get(t.name) ?? t;
  if (t.kind === 'Fun') return { kind: 'Fun', arg: apply(subst, t.arg), ret: apply(subst, t.ret) };
  return t;
}

function occurs(name: string, t: Type): boolean {
  if (t.kind === 'Var') return t.name === name;
  if (t.kind === 'Fun') return occurs(name, t.arg) || occurs(name, t.ret);
  return false;
}

function unify(a: Type, b: Type, subst: Subst = new Map()): Subst {
  const ua = apply(subst, a);
  const ub = apply(subst, b);
  if (ua.kind === 'Var') {
    if (ub.kind === 'Var' && ua.name === ub.name) return subst;
    if (occurs(ua.name, ub)) throw new Error('Occurs check failed');
    return new Map([...subst, [ua.name, ub]]);
  }
  if (ub.kind === 'Var') return unify(ub, ua, subst);
  if (ua.kind === 'Const' && ub.kind === 'Const' && ua.name === ub.name) return subst;
  if (ua.kind === 'Fun' && ub.kind === 'Fun') {
    const s1 = unify(ua.arg, ub.arg, subst);
    return unify(ua.ret, ub.ret, s1);
  }
  throw new Error(`Cannot unify ${typeToString(ua)} with ${typeToString(ub)}`);
}

function typeToString(t: Type): string {
  if (t.kind === 'Var') return `t${t.name}`;
  if (t.kind === 'Const') return t.name;
  return `(${typeToString(t.arg)} -> ${typeToString(t.ret)})`;
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
| Compilers: Principles, Techniques, and Tools (Dragon Book) | 书籍 | <https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools> |
| TypeScript Compiler Notes | 社区 | <https://github.com/orta/typescript-notes> |
| SWC Architecture | 文档 | <https://swc.rs/docs/usage/core> |
| Rust Analyzer Docs | 文档 | <https://rust-analyzer.github.io/> |
| LLVM Language Reference | 规范 | <https://llvm.org/docs/LangRef.html> |
| Pratt Parsing (Top Down Operator Precedence) | 论文 | <https://tdop.github.io/> |
| Hindley-Milner Type Inference | 教程 | <https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system> |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
