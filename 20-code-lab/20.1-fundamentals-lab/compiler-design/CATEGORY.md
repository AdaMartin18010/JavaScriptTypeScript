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

### 完整编译流水线：从源码到字节码

```typescript
// compiler-pipeline.ts — 端到端迷你编译器演示

interface SourceLocation { line: number; col: number; }

// === AST 定义 ===
interface Program { kind: 'Program'; body: Stmt[]; }
interface LetStmt { kind: 'Let'; name: string; init: Expr; loc: SourceLocation; }
interface ExprStmt { kind: 'Expr'; expr: Expr; loc: SourceLocation; }
interface BinaryExpr { kind: 'Binary'; op: string; left: Expr; right: Expr; loc: SourceLocation; }
interface NumberExpr { kind: 'Number'; value: number; loc: SourceLocation; }
interface IdentExpr { kind: 'Ident'; name: string; loc: SourceLocation; }

type Stmt = LetStmt | ExprStmt;
type Expr = BinaryExpr | NumberExpr | IdentExpr;

// === 解析器 ===
function parse(source: string): Program {
  const tokens = lex(source);
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseStmt(): Stmt {
    const tok = peek();
    if (tok.value === 'let') {
      consume();
      const name = consume().value;
      if (consume().value !== '=') throw new Error('Expected =');
      const init = parseExpr();
      return { kind: 'Let', name, init, loc: { line: 1, col: tok.pos } };
    }
    return { kind: 'Expr', expr: parseExpr(), loc: { line: 1, col: tok.pos } };
  }

  function parseExpr(): Expr {
    let left = parsePrimary();
    while (peek() && ['+', '-'].includes(peek().value)) {
      const op = consume().value;
      const right = parsePrimary();
      left = { kind: 'Binary', op, left, right, loc: left.loc };
    }
    return left;
  }

  function parsePrimary(): Expr {
    const tok = consume();
    if (tok.type === 'NUMBER') return { kind: 'Number', value: Number(tok.value), loc: { line: 1, col: tok.pos } };
    if (tok.type === 'IDENT') return { kind: 'Ident', name: tok.value, loc: { line: 1, col: tok.pos } };
    throw new Error(`Unexpected ${tok.type}`);
  }

  const body: Stmt[] = [];
  while (peek().type !== 'EOF') body.push(parseStmt());
  return { kind: 'Program', body };
}

// === 代码生成：目标为栈式字节码 ===
type OpCode =
  | { op: 'PUSH'; value: number }
  | { op: 'LOAD'; name: string }
  | { op: 'STORE'; name: string }
  | { op: 'ADD' } | { op: 'SUB' } | { op: 'PRINT' };

function codegen(program: Program): OpCode[] {
  const codes: OpCode[] = [];
  function emit(c: OpCode) { codes.push(c); }

  function genExpr(e: Expr) {
    switch (e.kind) {
      case 'Number': emit({ op: 'PUSH', value: e.value }); break;
      case 'Ident': emit({ op: 'LOAD', name: e.name }); break;
      case 'Binary':
        genExpr(e.left);
        genExpr(e.right);
        emit({ op: e.op === '+' ? 'ADD' : 'SUB' });
        break;
    }
  }

  for (const stmt of program.body) {
    switch (stmt.kind) {
      case 'Let':
        genExpr(stmt.init);
        emit({ op: 'STORE', name: stmt.name });
        break;
      case 'Expr':
        genExpr(stmt.expr);
        emit({ op: 'PRINT' });
        break;
    }
  }
  return codes;
}

// === 字节码解释器 ===
function run(codes: OpCode[]) {
  const stack: number[] = [];
  const env = new Map<string, number>();
  let ip = 0;
  while (ip < codes.length) {
    const c = codes[ip++];
    switch (c.op) {
      case 'PUSH': stack.push(c.value); break;
      case 'LOAD': stack.push(env.get(c.name) ?? 0); break;
      case 'STORE': env.set(c.name, stack.pop()!); break;
      case 'ADD': stack.push(stack.pop()! + stack.pop()!); break;
      case 'SUB': { const b = stack.pop()!, a = stack.pop()!; stack.push(a - b); } break;
      case 'PRINT': console.log('OUT:', stack.pop()); break;
    }
  }
}

// === 演示 ===
const source = `
let x = 10 + 5
let y = x - 3
y
`;
const ast = parse(source);
const bytecode = codegen(ast);
console.log('Bytecode:', bytecode);
run(bytecode); // OUT: 12
```

### 解析器组合子（Parser Combinators）

```typescript
// parser-combinators.ts — 函数式解析器组合子，可组合构建复杂解析器

type Parser<T> = (input: string, pos: number) => { success: true; value: T; pos: number } | { success: false; error: string; pos: number };

function map<A, B>(p: Parser<A>, fn: (a: A) => B): Parser<B> {
  return (input, pos) => {
    const r = p(input, pos);
    return r.success ? { success: true, value: fn(r.value), pos: r.pos } : r;
  };
}

function seq<A, B>(p1: Parser<A>, p2: Parser<B>): Parser<[A, B]> {
  return (input, pos) => {
    const r1 = p1(input, pos);
    if (!r1.success) return r1;
    const r2 = p2(input, r1.pos);
    return r2.success ? { success: true, value: [r1.value, r2.value], pos: r2.pos } : r2;
  };
}

function alt<T>(...ps: Parser<T>[]): Parser<T> {
  return (input, pos) => {
    for (const p of ps) {
      const r = p(input, pos);
      if (r.success) return r;
    }
    return { success: false, error: 'No alternative matched', pos };
  };
}

function many<T>(p: Parser<T>): Parser<T[]> {
  return (input, pos) => {
    const values: T[] = [];
    let curr = pos;
    while (true) {
      const r = p(input, curr);
      if (!r.success) break;
      values.push(r.value);
      curr = r.pos;
    }
    return { success: true, value: values, pos: curr };
  };
}

// 基础解析器
const digit: Parser<number> = (input, pos) => {
  if (pos < input.length && /\d/.test(input[pos])) {
    return { success: true, value: Number(input[pos]), pos: pos + 1 };
  }
  return { success: false, error: `Expected digit at ${pos}`, pos };
};

const number = map(many(digit), digits => digits.reduce((a, b) => a * 10 + b, 0));

// 演示：解析整数
console.log(number('123abc', 0)); // { success: true, value: 123, pos: 3 }
```

### 常量折叠与死代码消除优化

```typescript
// optimizer.ts — 基于 AST 的局部优化

function foldConstants(expr: Expr): Expr {
  switch (expr.kind) {
    case 'Binary': {
      const left = foldConstants(expr.left);
      const right = foldConstants(expr.right);
      if (left.kind === 'Number' && right.kind === 'Number') {
        const value = expr.op === '+' ? left.value + right.value : left.value - right.value;
        return { kind: 'Number', value, loc: expr.loc };
      }
      return { ...expr, left, right };
    }
    default: return expr;
  }
}

// 死代码消除：移除未使用的 let 绑定
function eliminateDeadCode(program: Program): Program {
  const used = new Set<string>();
  function collect(expr: Expr) {
    if (expr.kind === 'Ident') used.add(expr.name);
    if (expr.kind === 'Binary') { collect(expr.left); collect(expr.right); }
  }
  for (const stmt of program.body) {
    if (stmt.kind === 'Expr') collect(stmt.expr);
    if (stmt.kind === 'Let') collect(stmt.init);
  }
  const live = program.body.filter(s => s.kind === 'Expr' || used.has(s.name));
  return { ...program, body: live };
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
| LLVM Kaleidoscope Tutorial | 官方教程 | <https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html> |
| ANTLR Parser Generator | 工具 | <https://www.antlr.org/> |
| esbuild Architecture | 文档 | <https://esbuild.github.io/> |
| tsc Compiler Internals | 源码 | <https://github.com/microsoft/TypeScript/tree/main/src/compiler> |
| WebAssembly Binary Toolkit (wabt) | 工具 | <https://github.com/WebAssembly/wabt> |
| Binaryen Optimizer | 工具链 | <https://github.com/WebAssembly/binaryen> |
| Go Generics Type Checker | 源码 | <https://go.googlesource.com/go/+/refs/heads/master/src/cmd/compile/internal/types2/> |
| OCaml Compiler Internals | 手册 | <https://ocaml.org/manual/compilerlibref.html> |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| AST Explorer | 在线工具 | <https://astexplorer.net/> |
| TypeScript AST Viewer | 在线工具 | <https://ts-ast-viewer.com/> |

---

*最后更新: 2026-04-29*
