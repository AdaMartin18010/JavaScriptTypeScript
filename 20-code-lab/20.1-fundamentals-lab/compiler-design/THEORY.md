# 编译器设计理论：从词法分析到代码生成

> **目标读者**：对编译原理感兴趣的开发者、工具链作者
> **关联文档**：``30-knowledge-base/30.2-categories/compiler-design.md`` (Legacy) [Legacy link]
> **版本**：2026-04

---

## 1. 编译器 Pipeline

```
源代码
  ↓
词法分析 (Lexer) → Token 流
  ↓
语法分析 (Parser) → AST
  ↓
语义分析 → 类型检查、符号表
  ↓
中间表示 (IR) → 优化
  ↓
代码生成 → 目标代码
```

---

## 2. TypeScript 编译器架构

### 2.1 tsc 内部

```
Scanner → Parser → Binder → Checker → Emitter
(扫描)   (解析)   (绑定)   (检查)   (输出)
```

### 2.2 tsgo (TypeScript 7.0)

```
Go 重写 → 10x 构建速度
  ↓
保留类型系统语义
  ↓
兼容现有 tsconfig
```

---

## 3. 工具链编译器

| 编译器 | 输入 | 输出 | 特点 |
|--------|------|------|------|
| **tsc** | TS | JS + .d.ts | 类型检查 + 转译 |
| **Babel** | JS/TS | JS | 插件化、灵活 |
| **SWC** | JS/TS | JS | Rust、极快 |
| **esbuild** | JS/TS | JS | Go、极简 |
| **oxc** | JS/TS | JS | Rust、统一工具链 |

---

## 4. 完整编译器组件实现

### 4.1 词法分析器（Lexer）

```typescript
// lexer.ts

type TokenType =
  | 'NUMBER' | 'STRING' | 'IDENTIFIER'
  | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH'
  | 'LPAREN' | 'RPAREN' | 'LBRACE' | 'RBRACE'
  | 'SEMICOLON' | 'ASSIGN' | 'EQ'
  | 'LET' | 'CONST' | 'FUNCTION' | 'RETURN' | 'IF' | 'ELSE'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;

  private keywords: Record<string, TokenType> = {
    let: 'LET',
    const: 'CONST',
    function: 'FUNCTION',
    return: 'RETURN',
    if: 'IF',
    else: 'ELSE',
  };

  constructor(private source: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const token = this.nextToken();
      if (token) tokens.push(token);
    }
    tokens.push({ type: 'EOF', value: '', line: this.line, column: this.column });
    return tokens;
  }

  private nextToken(): Token | null {
    const startLine = this.line;
    const startCol = this.column;
    const char = this.advance();

    if (this.isDigit(char)) return this.number(startLine, startCol);
    if (this.isAlpha(char)) return this.identifier(startLine, startCol);
    if (char === '"' || char === "'") return this.string(startLine, startCol, char);

    switch (char) {
      case '+': return { type: 'PLUS', value: '+', line: startLine, column: startCol };
      case '-': return { type: 'MINUS', value: '-', line: startLine, column: startCol };
      case '*': return { type: 'STAR', value: '*', line: startLine, column: startCol };
      case '/': return { type: 'SLASH', value: '/', line: startLine, column: startCol };
      case '(': return { type: 'LPAREN', value: '(', line: startLine, column: startCol };
      case ')': return { type: 'RPAREN', value: ')', line: startLine, column: startCol };
      case '{': return { type: 'LBRACE', value: '{', line: startLine, column: startCol };
      case '}': return { type: 'RBRACE', value: '}', line: startLine, column: startCol };
      case ';': return { type: 'SEMICOLON', value: ';', line: startLine, column: startCol };
      case '=':
        if (this.peek() === '=') {
          this.advance();
          return { type: 'EQ', value: '==', line: startLine, column: startCol };
        }
        return { type: 'ASSIGN', value: '=', line: startLine, column: startCol };
      default:
        throw new Error(`Unexpected character '${char}' at ${startLine}:${startCol}`);
    }
  }

  private number(line: number, col: number): Token {
    let value = '';
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance();
      while (this.isDigit(this.peek())) value += this.advance();
    }
    return { type: 'NUMBER', value, line, column: col };
  }

  private identifier(line: number, col: number): Token {
    let value = '';
    while (this.isAlphaNumeric(this.peek())) value += this.advance();
    const type = this.keywords[value] || 'IDENTIFIER';
    return { type, value, line, column: col };
  }

  private string(line: number, col: number, quote: string): Token {
    let value = '';
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') { this.line++; this.column = 1; }
      value += this.advance();
    }
    if (this.isAtEnd()) throw new Error('Unterminated string');
    this.advance(); // closing quote
    return { type: 'STRING', value, line, column: col };
  }

  private advance(): string { return this.source[this.pos++]; }
  private peek(): string { return this.isAtEnd() ? '\0' : this.source[this.pos]; }
  private peekNext(): string { return this.pos + 1 >= this.source.length ? '\0' : this.source[this.pos + 1]; }
  private isAtEnd(): boolean { return this.pos >= this.source.length; }
  private isDigit(c: string): boolean { return c >= '0' && c <= '9'; }
  private isAlpha(c: string): boolean { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }
  private isAlphaNumeric(c: string): boolean { return this.isAlpha(c) || this.isDigit(c); }
  private skipWhitespace() {
    while (this.peek() === ' ' || this.peek() === '\t' || this.peek() === '\n' || this.peek() === '\r') {
      if (this.peek() === '\n') { this.line++; this.column = 1; }
      else { this.column++; }
      this.advance();
    }
  }
}

// 使用示例
const source = `
function add(a, b) {
  return a + b;
}
const result = add(1, 2);
`;
const lexer = new Lexer(source);
console.log(lexer.tokenize());
```

### 4.2 递归下降语法分析器（Parser）

```typescript
// parser.ts

interface Expr {
  kind: 'Binary' | 'Literal' | 'Identifier' | 'Call';
}

interface BinaryExpr extends Expr {
  kind: 'Binary';
  operator: string;
  left: Expr;
  right: Expr;
}

interface LiteralExpr extends Expr {
  kind: 'Literal';
  value: string | number;
}

interface IdentifierExpr extends Expr {
  kind: 'Identifier';
  name: string;
}

interface CallExpr extends Expr {
  kind: 'Call';
  callee: IdentifierExpr;
  args: Expr[];
}

interface Stmt {
  kind: 'VarDecl' | 'FunctionDecl' | 'Return' | 'ExprStmt' | 'If';
}

interface VarDeclStmt extends Stmt {
  kind: 'VarDecl';
  name: string;
  initializer: Expr;
}

interface FunctionDeclStmt extends Stmt {
  kind: 'FunctionDecl';
  name: string;
  params: string[];
  body: Stmt[];
}

interface ReturnStmt extends Stmt {
  kind: 'Return';
  value: Expr;
}

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }
    return statements;
  }

  private declaration(): Stmt {
    if (this.match('FUNCTION')) return this.functionDeclaration();
    if (this.match('LET', 'CONST')) return this.varDeclaration();
    return this.statement();
  }

  private functionDeclaration(): FunctionDeclStmt {
    const name = this.consume('IDENTIFIER', 'Expected function name').value;
    this.consume('LPAREN', "Expected '(' after function name");
    const params: string[] = [];
    while (!this.check('RPAREN') && !this.isAtEnd()) {
      params.push(this.consume('IDENTIFIER', 'Expected parameter name').value);
      if (!this.match('COMMA')) break;
    }
    this.consume('RPAREN', "Expected ')' after parameters");
    this.consume('LBRACE', "Expected '{' before function body");
    const body = this.block();
    return { kind: 'FunctionDecl', name, params, body };
  }

  private varDeclaration(): VarDeclStmt {
    const name = this.consume('IDENTIFIER', 'Expected variable name').value;
    let initializer: Expr = { kind: 'Literal', value: null } as any;
    if (this.match('ASSIGN')) {
      initializer = this.expression();
    }
    this.consume('SEMICOLON', "Expected ';' after variable declaration");
    return { kind: 'VarDecl', name, initializer };
  }

  private statement(): Stmt {
    if (this.match('RETURN')) return this.returnStatement();
    if (this.match('IF')) return this.ifStatement();
    return this.expressionStatement();
  }

  private returnStatement(): ReturnStmt {
    const value = this.expression();
    this.consume('SEMICOLON', "Expected ';' after return value");
    return { kind: 'Return', value };
  }

  private ifStatement(): Stmt {
    this.consume('LPAREN', "Expected '(' after 'if'");
    const condition = this.expression();
    this.consume('RPAREN', "Expected ')' after if condition");
    this.consume('LBRACE', "Expected '{' before if body");
    const thenBranch = this.block();
    // else 省略
    return { kind: 'If', condition, thenBranch, elseBranch: [] } as any;
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      statements.push(this.declaration());
    }
    this.consume('RBRACE', "Expected '}' after block");
    return statements;
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume('SEMICOLON', "Expected ';' after expression");
    return { kind: 'ExprStmt', expression: expr } as any;
  }

  // 表达式：使用优先级攀爬（Pratt Parser）
  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparison();
    while (this.match('EQ')) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = { kind: 'Binary', operator, left: expr, right } as BinaryExpr;
    }
    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();
    while (this.match('GREATER', 'LESS', 'GE', 'LE')) {
      const operator = this.previous().value;
      const right = this.term();
      expr = { kind: 'Binary', operator, left: expr, right } as BinaryExpr;
    }
    return expr;
  }

  private term(): Expr {
    let expr = this.factor();
    while (this.match('MINUS', 'PLUS')) {
      const operator = this.previous().value;
      const right = this.factor();
      expr = { kind: 'Binary', operator, left: expr, right } as BinaryExpr;
    }
    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();
    while (this.match('SLASH', 'STAR')) {
      const operator = this.previous().value;
      const right = this.unary();
      expr = { kind: 'Binary', operator, left: expr, right } as BinaryExpr;
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match('MINUS', 'NOT')) {
      const operator = this.previous().value;
      const right = this.unary();
      return { kind: 'Unary', operator, right } as any;
    }
    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();
    while (this.match('LPAREN')) {
      const args: Expr[] = [];
      while (!this.check('RPAREN') && !this.isAtEnd()) {
        args.push(this.expression());
        if (!this.match('COMMA')) break;
      }
      this.consume('RPAREN', "Expected ')' after arguments");
      expr = { kind: 'Call', callee: expr as IdentifierExpr, args } as CallExpr;
    }
    return expr;
  }

  private primary(): Expr {
    if (this.match('NUMBER')) {
      return { kind: 'Literal', value: parseFloat(this.previous().value) } as LiteralExpr;
    }
    if (this.match('STRING')) {
      return { kind: 'Literal', value: this.previous().value } as LiteralExpr;
    }
    if (this.match('IDENTIFIER')) {
      return { kind: 'Identifier', name: this.previous().value } as IdentifierExpr;
    }
    if (this.match('LPAREN')) {
      const expr = this.expression();
      this.consume('RPAREN', "Expected ')' after expression");
      return expr;
    }
    throw new Error(`Unexpected token: ${this.peek().type}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) { this.advance(); return true; }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }

  private isAtEnd(): boolean { return this.peek().type === 'EOF'; }
  private peek(): Token { return this.tokens[this.pos]; }
  private previous(): Token { return this.tokens[this.pos - 1]; }
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(message + ` at line ${this.peek().line}`);
  }
}
```

### 4.3 AST 遍历（Visitor 模式）

```typescript
// ast-visitor.ts

interface Visitor<R> {
  visitBinary(expr: BinaryExpr): R;
  visitLiteral(expr: LiteralExpr): R;
  visitIdentifier(expr: IdentifierExpr): R;
  visitCall(expr: CallExpr): R;
}

class ExpressionEvaluator implements Visitor<number> {
  private environment = new Map<string, number>();

  evaluate(expr: Expr): number {
    switch (expr.kind) {
      case 'Binary': return this.visitBinary(expr as BinaryExpr);
      case 'Literal': return this.visitLiteral(expr as LiteralExpr);
      case 'Identifier': return this.visitIdentifier(expr as IdentifierExpr);
      case 'Call': return this.visitCall(expr as CallExpr);
      default: throw new Error(`Unknown expression kind: ${(expr as any).kind}`);
    }
  }

  visitBinary(expr: BinaryExpr): number {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right === 0 ? Infinity : left / right;
      default: throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }

  visitLiteral(expr: LiteralExpr): number {
    return typeof expr.value === 'number' ? expr.value : 0;
  }

  visitIdentifier(expr: IdentifierExpr): number {
    if (!this.environment.has(expr.name)) {
      throw new Error(`Undefined variable: ${expr.name}`);
    }
    return this.environment.get(expr.name)!;
  }

  visitCall(expr: CallExpr): number {
    // 简化：仅支持内置函数
    const args = expr.args.map(arg => this.evaluate(arg));
    switch (expr.callee.name) {
      case 'abs': return Math.abs(args[0]);
      case 'max': return Math.max(...args);
      case 'min': return Math.min(...args);
      default: throw new Error(`Unknown function: ${expr.callee.name}`);
    }
  }

  define(name: string, value: number) {
    this.environment.set(name, value);
  }
}

// 使用示例：编译并求值表达式
// const tokens = new Lexer("1 + 2 * 3").tokenize();
// const ast = new Parser(tokens).parse();
// const evaluator = new ExpressionEvaluator();
// console.log(evaluator.evaluate(ast[0] as any));
```

### 4.4 代码生成（JavaScript 目标）

```typescript
// code-generator.ts

class JSCodeGenerator {
  private output = '';
  private indentLevel = 0;

  generate(statements: Stmt[]): string {
    for (const stmt of statements) {
      this.generateStmt(stmt);
    }
    return this.output;
  }

  private generateStmt(stmt: Stmt) {
    switch (stmt.kind) {
      case 'FunctionDecl': {
        const fn = stmt as FunctionDeclStmt;
        this.emit(`function ${fn.name}(${fn.params.join(', ')}) {`);
        this.indent();
        for (const s of fn.body) this.generateStmt(s);
        this.dedent();
        this.emit('}');
        break;
      }
      case 'VarDecl': {
        const decl = stmt as VarDeclStmt;
        const value = this.generateExpr(decl.initializer);
        this.emit(`const ${decl.name} = ${value};`);
        break;
      }
      case 'Return': {
        const ret = stmt as ReturnStmt;
        this.emit(`return ${this.generateExpr(ret.value)};`);
        break;
      }
      default:
        this.emit(`// unhandled: ${stmt.kind}`);
    }
  }

  private generateExpr(expr: Expr): string {
    switch (expr.kind) {
      case 'Literal': return String((expr as LiteralExpr).value);
      case 'Identifier': return (expr as IdentifierExpr).name;
      case 'Binary': {
        const bin = expr as BinaryExpr;
        return `${this.generateExpr(bin.left)} ${bin.operator} ${this.generateExpr(bin.right)}`;
      }
      case 'Call': {
        const call = expr as CallExpr;
        const args = call.args.map(arg => this.generateExpr(arg)).join(', ');
        return `${call.callee.name}(${args})`;
      }
      default: return '';
    }
  }

  private emit(line: string) {
    this.output += '  '.repeat(this.indentLevel) + line + '\n';
  }
  private indent() { this.indentLevel++; }
  private dedent() { this.indentLevel--; }
}
```

---

## 5. 总结

编译器是**编程语言的灵魂**。理解编译器原理，是理解语言特性的最佳途径。

---

## 参考资源

### 权威书籍
- [Crafting Interpreters — Robert Nystrom](https://craftinginterpreters.com/) — 从零手写编译器的免费在线书籍
- [Engineering a Compiler (3rd Edition) — Cooper & Torczon](https://www.elsevier.com/books/engineering-a-compiler/cooper/978-0-12-815412-0) — 编译器工程标准教材
- [Types and Programming Languages — Benjamin Pierce](https://www.cis.upenn.edu/~bcpierce/tapl/) — 类型系统理论经典

### TypeScript 编译器
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — 官方编译器 API 文档
- [ts-ast-viewer](https://ts-ast-viewer.com/) — 交互式 TypeScript AST 查看器
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) — Babel 插件开发指南
- [SWC 文档](https://swc.rs/) — Rust 编写的 JS/TS 编译器
- [oxc 项目](https://oxc-project.github.io/) — Rust 统一 JavaScript 工具链

### 编译器构建工具
- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) — 增量解析器生成器框架
- [ANTLR](https://www.antlr.org/) — 强大的解析器生成器
- [Peggy](https://peggyjs.org/) (原 PEG.js) — JavaScript 解析器生成器
- [Lezer](https://lezer.codemirror.net/) — CodeMirror 6 的增量解析系统

### 语言规范
- [ECMAScript Language Specification](https://tc39.es/ecma262/) — JavaScript 语言规范
- [TypeScript Specification](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md) — TypeScript 类型系统规范（归档）

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `ast.ts`
- `code-gen.ts`
- `compiler-pipeline.ts`
- `index.ts`
- `lexer.ts`
- `parser.ts`

> **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

1. **Visitor 模式**：分离 AST 遍历逻辑与节点结构，使代码生成、类型检查、优化可独立扩展
2. **Pratt Parser（优先级攀爬）**：表达式解析的优雅算法，避免左递归问题
3. **Symbol Table 与作用域链**：管理标识符绑定，支持嵌套作用域与闭包语义

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握数据结构（栈、树、哈希表）与递归 |
| 后续进阶 | 可继续深化的相关模块：静态分析、类型推断、代码优化 |

---

> 理论深化更新：2026-04-29
