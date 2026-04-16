/**
 * @file 编译器阶段演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty hard
 * @tags compiler, lexer, parser, ast, type-inference, emitter
 *
 * @description
 * 一个极度简化的编译器玩具实现，演示编译器前端流水线：
 * Lexer → Parser → Type Checker → Emitter。
 *
 * 规范对齐: COMPILER_LANGUAGE_DESIGN.md §1、§5
 */

// ============================================================================
// 1. Token 定义与词法分析器 (Lexer)
// ============================================================================

export type TokenType =
  | 'number'
  | 'string'
  | 'identifier'
  | 'operator'
  | 'lparen'
  | 'rparen'
  | 'lbrace'
  | 'rbrace'
  | 'semicolon'
  | 'comma'
  | 'assign'
  | 'keyword';

export interface Token {
  type: TokenType;
  value: string;
}

/**
 * 极度简化的词法分析器。
 * 支持：number literal、string literal、identifier、operator、括号、关键字。
 */
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const keywords = new Set(['let', 'const', 'var', 'function', 'return']);

  while (i < code.length) {
    const ch = code[i];

    // 跳过空白
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // 数字字面量
    if (/\d/.test(ch)) {
      let num = '';
      while (i < code.length && /\d/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // 字符串字面量（双引号）
    if (ch === '"') {
      let str = '';
      i++; // skip opening quote
      while (i < code.length && code[i] !== '"') {
        str += code[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // 标识符或关键字
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        id += code[i];
        i++;
      }
      tokens.push({ type: keywords.has(id) ? 'keyword' : 'identifier', value: id });
      continue;
    }

    // 操作符
    if (/[+\-*/<>!]/.test(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // 单字符符号
    switch (ch) {
      case '(':
        tokens.push({ type: 'lparen', value: ch });
        break;
      case ')':
        tokens.push({ type: 'rparen', value: ch });
        break;
      case '{':
        tokens.push({ type: 'lbrace', value: ch });
        break;
      case '}':
        tokens.push({ type: 'rbrace', value: ch });
        break;
      case ';':
        tokens.push({ type: 'semicolon', value: ch });
        break;
      case ',':
        tokens.push({ type: 'comma', value: ch });
        break;
      case '=':
        tokens.push({ type: 'assign', value: ch });
        break;
    }
    i++;
  }

  return tokens;
}

// ============================================================================
// 2. AST 定义与语法分析器 (Parser)
// ============================================================================

export type ASTNode =
  | { kind: 'Program'; body: ASTNode[] }
  | { kind: 'VarDecl'; name: string; init: ASTNode }
  | { kind: 'FnDecl'; name: string; params: string[]; body: ASTNode[] }
  | { kind: 'Return'; expr: ASTNode }
  | { kind: 'BinaryExpr'; op: string; left: ASTNode; right: ASTNode }
  | { kind: 'Identifier'; name: string }
  | { kind: 'NumberLiteral'; value: number }
  | { kind: 'StringLiteral'; value: string };

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const token = this.consume();
    if (token.type !== type) {
      throw new Error(`Expected ${type}, got ${token.type} (${token.value})`);
    }
    return token;
  }

  parse(): ASTNode {
    const body: ASTNode[] = [];
    while (this.pos < this.tokens.length) {
      body.push(this.parseStatement());
    }
    return { kind: 'Program', body };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of input');

    if (token.type === 'keyword') {
      if (token.value === 'let' || token.value === 'const' || token.value === 'var') {
        return this.parseVarDecl();
      }
      if (token.value === 'function') {
        return this.parseFnDecl();
      }
      if (token.value === 'return') {
        return this.parseReturn();
      }
    }

    // 表达式语句（简化：仅支持二元表达式或单个标识符/字面量后跟分号）
    const expr = this.parseExpr();
    if (this.peek()?.type === 'semicolon') {
      this.consume();
    }
    return expr;
  }

  private parseVarDecl(): ASTNode {
    this.consume(); // let/const/var
    const name = this.expect('identifier').value;
    this.expect('assign');
    const init = this.parseExpr();
    if (this.peek()?.type === 'semicolon') {
      this.consume();
    }
    return { kind: 'VarDecl', name, init };
  }

  private parseFnDecl(): ASTNode {
    this.consume(); // function
    const name = this.expect('identifier').value;
    this.expect('lparen');
    const params: string[] = [];
    while (this.peek()?.type !== 'rparen') {
      params.push(this.expect('identifier').value);
      if (this.peek()?.type === 'comma') {
        this.consume();
      }
    }
    this.expect('rparen');
    this.expect('lbrace');
    const body: ASTNode[] = [];
    while (this.peek()?.type !== 'rbrace') {
      body.push(this.parseStatement());
    }
    this.expect('rbrace');
    return { kind: 'FnDecl', name, params, body };
  }

  private parseReturn(): ASTNode {
    this.consume(); // return
    const expr = this.parseExpr();
    if (this.peek()?.type === 'semicolon') {
      this.consume();
    }
    return { kind: 'Return', expr };
  }

  private parseExpr(): ASTNode {
    return this.parseBinary();
  }

  private parseBinary(minPrecedence = 0): ASTNode {
    let left = this.parsePrimary();

    while (true) {
      const opToken = this.peek();
      if (!opToken || opToken.type !== 'operator') break;
      const precedence = this.getPrecedence(opToken.value);
      if (precedence < minPrecedence) break;
      this.consume();
      const right = this.parseBinary(precedence + 1);
      left = { kind: 'BinaryExpr', op: opToken.value, left, right };
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of input');

    if (token.type === 'number') {
      this.consume();
      return { kind: 'NumberLiteral', value: Number(token.value) };
    }

    if (token.type === 'string') {
      this.consume();
      return { kind: 'StringLiteral', value: token.value };
    }

    if (token.type === 'identifier') {
      this.consume();
      return { kind: 'Identifier', name: token.value };
    }

    if (token.type === 'lparen') {
      this.consume();
      const expr = this.parseExpr();
      this.expect('rparen');
      return expr;
    }

    throw new Error(`Unexpected token: ${token.type} (${token.value})`);
  }

  private getPrecedence(op: string): number {
    switch (op) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;
    }
  }
}

export function parse(tokens: Token[]): ASTNode {
  return new Parser(tokens).parse();
}

// ============================================================================
// 3. 最简类型推断器 (Type Checker)
// ============================================================================

/**
 * 对 AST 执行最基础的类型推断。
 * - number literal → "number"
 * - string literal → "string"
 * - 二元表达式中 + 运算符：number + number → "number"；否则 "unknown"
 */
export function inferType(node: ASTNode): string {
  switch (node.kind) {
    case 'Program':
      return 'void';
    case 'VarDecl':
      return inferType(node.init);
    case 'FnDecl':
      return 'function';
    case 'Return':
      return inferType(node.expr);
    case 'NumberLiteral':
      return 'number';
    case 'StringLiteral':
      return 'string';
    case 'Identifier':
      return 'unknown';
    case 'BinaryExpr': {
      const leftType = inferType(node.left);
      const rightType = inferType(node.right);
      if (node.op === '+' && leftType === 'number' && rightType === 'number') {
        return 'number';
      }
      return 'unknown';
    }
    default:
      return 'unknown';
  }
}

// ============================================================================
// 4. 代码生成器 (Emitter)
// ============================================================================

/**
 * 将 AST 转换为擦除类型的 JavaScript 字符串。
 */
export function emit(node: ASTNode): string {
  switch (node.kind) {
    case 'Program':
      return node.body.map(emit).join('\n');
    case 'VarDecl':
      return `let ${node.name} = ${emit(node.init)};`;
    case 'FnDecl': {
      const params = node.params.join(', ');
      const body = node.body.map(emit).join('\n  ');
      return `function ${node.name}(${params}) {\n  ${body}\n}`;
    }
    case 'Return':
      return `return ${emit(node.expr)};`;
    case 'BinaryExpr':
      return `${emit(node.left)} ${node.op} ${emit(node.right)}`;
    case 'Identifier':
      return node.name;
    case 'NumberLiteral':
      return String(node.value);
    case 'StringLiteral':
      return `"${node.value}"`;
    default:
      return '';
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  const code = 'let x = 1 + 2';
  console.log('=== 编译器阶段演示 ===\n');
  console.log('源码:', code);

  const tokens = tokenize(code);
  console.log('Tokens:', tokens);

  const ast = parse(tokens);
  console.log('AST:', JSON.stringify(ast, null, 2));

  const type = inferType(ast);
  console.log('推断类型:', type);

  const js = emit(ast);
  console.log('生成代码:', js);
}
