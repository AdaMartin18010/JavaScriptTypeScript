/**
 * @file 编译器流水线
 * @category Compiler → Pipeline
 * @difficulty hard
 * @tags compiler, lexer, parser, ast, code-generation
 *
 * 本文件实现了一个类型安全、无 any 的 Mini-Compiler，核心阶段：
 * 词法分析 (Lexing) → 语法分析 (Parsing) → AST → 优化 (Optimization) → 代码生成 (Code Generation)
 */

// ==================== Token 定义 ====================

export enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  KEYWORD = 'KEYWORD',
  OPERATOR = 'OPERATOR',
  PUNCTUATION = 'PUNCTUATION',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// ==================== 强类型 AST 定义 ====================

export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
}

export interface VariableDeclarationNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  id: string;
  init: ExpressionNode | null;
}

export interface FunctionDeclarationNode {
  type: 'FunctionDeclaration';
  name: string;
  params: string[];
  body: BlockStatementNode;
}

export interface BlockStatementNode {
  type: 'BlockStatement';
  body: StatementNode[];
}

export interface IfStatementNode {
  type: 'IfStatement';
  test: ExpressionNode;
  consequent: StatementNode;
  alternate: StatementNode | null;
}

export interface ReturnStatementNode {
  type: 'ReturnStatement';
  argument: ExpressionNode | null;
}

export interface ExpressionStatementNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
}

export interface BinaryExpressionNode {
  type: 'BinaryExpression';
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface UnaryExpressionNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ExpressionNode;
}

export interface AssignmentExpressionNode {
  type: 'AssignmentExpression';
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface CallExpressionNode {
  type: 'CallExpression';
  callee: string;
  arguments: ExpressionNode[];
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
}

export type LiteralValue = string | number | boolean | null;

export interface LiteralNode {
  type: 'Literal';
  value: LiteralValue;
}

export type StatementNode =
  | VariableDeclarationNode
  | FunctionDeclarationNode
  | BlockStatementNode
  | IfStatementNode
  | ReturnStatementNode
  | ExpressionStatementNode;

export type ExpressionNode =
  | BinaryExpressionNode
  | UnaryExpressionNode
  | AssignmentExpressionNode
  | CallExpressionNode
  | IdentifierNode
  | LiteralNode;

export type ASTNode = ProgramNode | StatementNode | ExpressionNode;

// ==================== 词法分析器 (Lexer) ====================

export class Lexer {
  private position = 0;
  private line = 1;
  private column = 1;

  private keywords = new Set<string>([
    'let', 'const', 'function', 'if', 'else', 'return', 'while', 'for',
    'true', 'false', 'null'
  ]);

  constructor(private source: string) {}

  /**
   * 将源代码拆分为 Token 数组。
   * 支持：行注释、块注释、字符串转义、负数字面量。
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let expectOperand = true; // 用于判断 '-' 是负号还是减号运算符

    while (this.position < this.source.length) {
      this.skipWhitespaceAndComments();

      if (this.position >= this.source.length) break;

      const char = this.source[this.position];

      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
        expectOperand = false;
      } else if (char === '-' && expectOperand && this.isDigit(this.source[this.position + 1] || '')) {
        this.advance(); // 消费 '-'
        tokens.push(this.readNumber(true));
        expectOperand = false;
      } else if (this.isAlpha(char)) {
        const token = this.readIdentifier();
        tokens.push(token);
        expectOperand = token.type === TokenType.KEYWORD;
      } else if (char === '"' || char === "'") {
        tokens.push(this.readString());
        expectOperand = false;
      } else if (this.isOperator(char)) {
        tokens.push(this.readOperator());
        expectOperand = true;
      } else if (this.isPunctuation(char)) {
        const token = this.readPunctuation();
        tokens.push(token);
        expectOperand =
          token.value === '(' ||
          token.value === '[' ||
          token.value === '{' ||
          token.value === ',' ||
          token.value === ';';
      } else {
        this.advance();
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }

  private readNumber(negative = false): Token {
    const startColumn = negative ? this.column - 1 : this.column;
    const start = this.position;
    let hasDot = false;

    while (this.position < this.source.length) {
      const char = this.peek();
      if (this.isDigit(char)) {
        this.advance();
      } else if (char === '.') {
        if (hasDot) break;
        hasDot = true;
        this.advance();
      } else {
        break;
      }
    }

    const raw = this.source.slice(start, this.position);
    const value = negative ? '-' + raw : raw;

    return {
      type: TokenType.NUMBER,
      value,
      line: this.line,
      column: startColumn
    };
  }

  private readIdentifier(): Token {
    const start = this.position;
    const startColumn = this.column;

    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const value = this.source.slice(start, this.position);
    const isKeyword = this.keywords.has(value);

    return {
      type: isKeyword ? TokenType.KEYWORD : TokenType.IDENTIFIER,
      value,
      line: this.line,
      column: startColumn
    };
  }

  private readString(): Token {
    const quote = this.source[this.position];
    const startColumn = this.column;
    this.advance(); // 跳过开始引号

    let value = '';

    while (this.position < this.source.length && this.peek() !== quote) {
      const ch = this.peek();
      if (ch === '\\') {
        this.advance();
        const next = this.peek();
        switch (next) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case 'r':
            value += '\r';
            break;
          case '"':
            value += '"';
            break;
          case "'":
            value += "'";
            break;
          case '\\':
            value += '\\';
            break;
          default:
            value += next;
            break;
        }
        this.advance();
      } else {
        value += ch;
        this.advance();
      }
    }

    if (this.peek() === quote) {
      this.advance(); // 跳过结束引号
    }

    return {
      type: TokenType.STRING,
      value,
      line: this.line,
      column: startColumn
    };
  }

  private readOperator(): Token {
    const startColumn = this.column;
    const operators = [
      '===', '!==', '==', '!=', '<=', '>=',
      '&&', '||',
      '++', '--',
      '+', '-', '*', '/', '=', '<', '>', '!'
    ];

    for (const op of operators) {
      if (this.source.slice(this.position, this.position + op.length) === op) {
        for (let i = 0; i < op.length; i++) {
          this.advance();
        }
        return {
          type: TokenType.OPERATOR,
          value: op,
          line: this.line,
          column: startColumn
        };
      }
    }

    // 兜底：消费一个未知字符作为单字符运算符
    const value = this.source[this.position];
    this.advance();
    return {
      type: TokenType.OPERATOR,
      value,
      line: this.line,
      column: startColumn
    };
  }

  private readPunctuation(): Token {
    const startColumn = this.column;
    const value = this.source[this.position];
    this.advance();

    return {
      type: TokenType.PUNCTUATION,
      value,
      line: this.line,
      column: startColumn
    };
  }

  private skipWhitespaceAndComments(): void {
    while (this.position < this.source.length) {
      const char = this.source[this.position];

      if (/\s/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.column = 1;
          this.position++;
        } else {
          this.advance();
        }
      } else if (char === '/' && this.source[this.position + 1] === '/') {
        // 跳过行注释
        this.position += 2;
        this.column += 2;
        while (this.position < this.source.length && this.source[this.position] !== '\n') {
          this.advance();
        }
      } else if (char === '/' && this.source[this.position + 1] === '*') {
        // 跳过块注释
        this.position += 2;
        this.column += 2;
        while (
          this.position < this.source.length &&
          !(this.source[this.position] === '*' && this.source[this.position + 1] === '/')
        ) {
          if (this.source[this.position] === '\n') {
            this.line++;
            this.column = 1;
            this.position++;
          } else {
            this.advance();
          }
        }
        if (this.position < this.source.length) {
          this.advance(); // *
          this.advance(); // /
        }
      } else {
        break;
      }
    }
  }

  private advance(): void {
    this.position++;
    this.column++;
  }

  private peek(): string {
    return this.position < this.source.length ? this.source[this.position] : '\0';
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperator(char: string): boolean {
    return /[+\-*/=<>!&|]/.test(char);
  }

  private isPunctuation(char: string): boolean {
    return /[(){}\[\],;.]/.test(char);
  }
}

// ==================== 语法分析器 (Parser) ====================

export class Parser {
  private position = 0;
  private tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ProgramNode {
    const statements: StatementNode[] = [];

    while (this.current().type !== TokenType.EOF) {
      statements.push(this.parseStatement());
    }

    return { type: 'Program', body: statements };
  }

  private parseStatement(): StatementNode {
    if (this.match(TokenType.KEYWORD, 'let') || this.match(TokenType.KEYWORD, 'const')) {
      return this.parseVariableDeclaration();
    }

    if (this.match(TokenType.KEYWORD, 'function')) {
      return this.parseFunctionDeclaration();
    }

    if (this.match(TokenType.KEYWORD, 'if')) {
      return this.parseIfStatement();
    }

    if (this.match(TokenType.KEYWORD, 'return')) {
      return this.parseReturnStatement();
    }

    return this.parseExpressionStatement();
  }

  private parseVariableDeclaration(): VariableDeclarationNode {
    const kindToken = this.consume(TokenType.KEYWORD);
    const kind: 'let' | 'const' = kindToken.value === 'const' ? 'const' : 'let';
    const id = this.consume(TokenType.IDENTIFIER).value;

    let init: ExpressionNode | null = null;
    if (this.match(TokenType.OPERATOR, '=')) {
      this.consume(TokenType.OPERATOR);
      init = this.parseExpression();
    }

    this.skipSemicolon();

    return { type: 'VariableDeclaration', kind, id, init };
  }

  private parseFunctionDeclaration(): FunctionDeclarationNode {
    this.consume(TokenType.KEYWORD); // function
    const name = this.consume(TokenType.IDENTIFIER).value;

    this.consume(TokenType.PUNCTUATION, '(');
    const params: string[] = [];

    while (!this.match(TokenType.PUNCTUATION, ')')) {
      params.push(this.consume(TokenType.IDENTIFIER).value);
      if (this.match(TokenType.PUNCTUATION, ',')) {
        this.consume(TokenType.PUNCTUATION);
      }
    }

    this.consume(TokenType.PUNCTUATION, ')');
    const body = this.parseBlock();

    return { type: 'FunctionDeclaration', name, params, body };
  }

  private parseIfStatement(): IfStatementNode {
    this.consume(TokenType.KEYWORD); // if
    this.consume(TokenType.PUNCTUATION, '(');
    const test = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, ')');

    const consequent = this.match(TokenType.PUNCTUATION, '{')
      ? this.parseBlock()
      : this.parseExpressionStatement();

    let alternate: StatementNode | null = null;

    if (this.match(TokenType.KEYWORD, 'else')) {
      this.consume(TokenType.KEYWORD);
      if (this.match(TokenType.KEYWORD, 'if')) {
        alternate = this.parseIfStatement();
      } else if (this.match(TokenType.PUNCTUATION, '{')) {
        alternate = this.parseBlock();
      } else {
        alternate = this.parseExpressionStatement();
      }
    }

    return { type: 'IfStatement', test, consequent, alternate };
  }

  private parseReturnStatement(): ReturnStatementNode {
    this.consume(TokenType.KEYWORD);
    const argument = this.match(TokenType.PUNCTUATION, ';') ? null : this.parseExpression();
    this.skipSemicolon();
    return { type: 'ReturnStatement', argument };
  }

  private parseExpressionStatement(): ExpressionStatementNode {
    const expression = this.parseExpression();
    this.skipSemicolon();
    return { type: 'ExpressionStatement', expression };
  }

  private parseBlock(): BlockStatementNode {
    this.consume(TokenType.PUNCTUATION, '{');
    const body: StatementNode[] = [];

    while (!this.match(TokenType.PUNCTUATION, '}')) {
      body.push(this.parseStatement());
    }

    this.consume(TokenType.PUNCTUATION, '}');
    return { type: 'BlockStatement', body };
  }

  // ==================== 表达式优先级（从低到高）====================

  private parseExpression(): ExpressionNode {
    return this.parseAssignment();
  }

  // 1. 赋值 =
  private parseAssignment(): ExpressionNode {
    const left = this.parseLogicalOr();

    if (this.match(TokenType.OPERATOR, '=')) {
      this.consume(TokenType.OPERATOR);
      const right = this.parseAssignment(); // 右结合
      return { type: 'AssignmentExpression', operator: '=', left, right };
    }

    return left;
  }

  // 2. 逻辑或 ||
  private parseLogicalOr(): ExpressionNode {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.OPERATOR, '||')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseLogicalAnd();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  // 3. 逻辑与 &&
  private parseLogicalAnd(): ExpressionNode {
    let left = this.parseEquality();

    while (this.match(TokenType.OPERATOR, '&&')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseEquality();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  // 4. 相等/比较
  private parseEquality(): ExpressionNode {
    let left = this.parseAdditive();

    while (
      this.match(TokenType.OPERATOR, '==') ||
      this.match(TokenType.OPERATOR, '!=') ||
      this.match(TokenType.OPERATOR, '===') ||
      this.match(TokenType.OPERATOR, '!==') ||
      this.match(TokenType.OPERATOR, '<') ||
      this.match(TokenType.OPERATOR, '>') ||
      this.match(TokenType.OPERATOR, '<=') ||
      this.match(TokenType.OPERATOR, '>=')
    ) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseAdditive();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  // 5. 加减 + -
  private parseAdditive(): ExpressionNode {
    let left = this.parseMultiplicative();

    while (this.match(TokenType.OPERATOR, '+') || this.match(TokenType.OPERATOR, '-')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  // 6. 乘除 * /
  private parseMultiplicative(): ExpressionNode {
    let left = this.parseUnary();

    while (this.match(TokenType.OPERATOR, '*') || this.match(TokenType.OPERATOR, '/')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseUnary();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  // 7. 一元 - !
  private parseUnary(): ExpressionNode {
    if (this.match(TokenType.OPERATOR, '-') || this.match(TokenType.OPERATOR, '!')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const argument = this.parseUnary();
      return { type: 'UnaryExpression', operator, argument };
    }

    return this.parsePrimary();
  }

  // 8. 基本表达式
  private parsePrimary(): ExpressionNode {
    if (this.match(TokenType.NUMBER)) {
      const token = this.consume(TokenType.NUMBER);
      return { type: 'Literal', value: Number(token.value) };
    }

    if (this.match(TokenType.STRING)) {
      const token = this.consume(TokenType.STRING);
      return { type: 'Literal', value: token.value };
    }

    if (this.match(TokenType.KEYWORD, 'true')) {
      this.consume(TokenType.KEYWORD);
      return { type: 'Literal', value: true };
    }

    if (this.match(TokenType.KEYWORD, 'false')) {
      this.consume(TokenType.KEYWORD);
      return { type: 'Literal', value: false };
    }

    if (this.match(TokenType.KEYWORD, 'null')) {
      this.consume(TokenType.KEYWORD);
      return { type: 'Literal', value: null };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.consume(TokenType.IDENTIFIER).value;

      if (this.match(TokenType.PUNCTUATION, '(')) {
        return this.parseCallExpression(name);
      }

      return { type: 'Identifier', name };
    }

    if (this.match(TokenType.PUNCTUATION, '(')) {
      this.consume(TokenType.PUNCTUATION);
      const expression = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ')');
      return expression;
    }

    throw new Error(
      `Unexpected token: ${this.current().value} at line ${this.current().line}, column ${this.current().column}`
    );
  }

  private parseCallExpression(callee: string): CallExpressionNode {
    this.consume(TokenType.PUNCTUATION, '(');
    const args: ExpressionNode[] = [];

    while (!this.match(TokenType.PUNCTUATION, ')')) {
      args.push(this.parseExpression());
      if (this.match(TokenType.PUNCTUATION, ',')) {
        this.consume(TokenType.PUNCTUATION);
      }
    }

    this.consume(TokenType.PUNCTUATION, ')');
    return { type: 'CallExpression', callee, arguments: args };
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.current();
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  private consume(type: TokenType, value?: string): Token {
    if (!this.match(type, value)) {
      throw new Error(
        `Expected ${type}${value ? ` (${value})` : ''}, got ${this.current().type} (${this.current().value}) ` +
        `at line ${this.current().line}, column ${this.current().column}`
      );
    }
    return this.tokens[this.position++];
  }

  private skipSemicolon(): void {
    if (this.match(TokenType.PUNCTUATION, ';')) {
      this.consume(TokenType.PUNCTUATION);
    }
  }
}

// ==================== 优化器 (Optimizer) ====================

export class Optimizer {
  optimize(node: ProgramNode): ProgramNode;
  optimize(node: StatementNode): StatementNode;
  optimize(node: ExpressionNode): ExpressionNode;
  optimize(node: ASTNode): ASTNode {
    switch (node.type) {
      case 'Program': {
        return {
          ...node,
          body: node.body.map((s) => this.optimize(s))
        };
      }

      case 'BinaryExpression': {
        const left = this.optimize(node.left);
        const right = this.optimize(node.right);
        const folded = this.tryFoldBinary(node.operator, left, right);
        return folded ? folded : { ...node, left, right };
      }

      case 'UnaryExpression': {
        const argument = this.optimize(node.argument);
        const folded = this.tryFoldUnary(node.operator, argument);
        return folded ? folded : { ...node, argument };
      }

      case 'ExpressionStatement': {
        return {
          ...node,
          expression: this.optimize(node.expression)
        };
      }

      case 'VariableDeclaration': {
        return {
          ...node,
          init: node.init ? this.optimize(node.init) : null
        };
      }

      case 'FunctionDeclaration': {
        return {
          ...node,
          body: this.optimizeBlock(node.body)
        };
      }

      case 'BlockStatement': {
        return this.optimizeBlock(node);
      }

      case 'IfStatement': {
        return {
          ...node,
          test: this.optimize(node.test),
          consequent: this.optimize(node.consequent),
          alternate: node.alternate ? this.optimize(node.alternate) : null
        };
      }

      case 'ReturnStatement': {
        return {
          ...node,
          argument: node.argument ? this.optimize(node.argument) : null
        };
      }

      case 'AssignmentExpression': {
        return {
          ...node,
          left: this.optimize(node.left),
          right: this.optimize(node.right)
        };
      }

      case 'CallExpression': {
        return {
          ...node,
          arguments: node.arguments.map((a) => this.optimize(a))
        };
      }

      case 'Identifier':
      case 'Literal':
        return node;

      default: {
        // 穷尽检查：如果 ASTNode 扩展了新类型但此处未处理，会在编译期报错
        const _exhaustive: never = node;
        return _exhaustive;
      }
    }
  }

  private optimizeBlock(node: BlockStatementNode): BlockStatementNode {
    return {
      ...node,
      body: node.body.map((s) => this.optimize(s))
    };
  }

  private tryFoldBinary(
    operator: string,
    left: ExpressionNode,
    right: ExpressionNode
  ): LiteralNode | null {
    if (left.type !== 'Literal' || right.type !== 'Literal') {
      return null;
    }

    const l = left.value;
    const r = right.value;

    if (typeof l === 'number' && typeof r === 'number') {
      let result: number;
      switch (operator) {
        case '+':
          result = l + r;
          break;
        case '-':
          result = l - r;
          break;
        case '*':
          result = l * r;
          break;
        case '/':
          result = l / r;
          break;
        case '==':
          return { type: 'Literal', value: l == r };
        case '!=':
          return { type: 'Literal', value: l != r };
        case '===':
          return { type: 'Literal', value: l === r };
        case '!==':
          return { type: 'Literal', value: l !== r };
        case '<':
          return { type: 'Literal', value: l < r };
        case '>':
          return { type: 'Literal', value: l > r };
        case '<=':
          return { type: 'Literal', value: l <= r };
        case '>=':
          return { type: 'Literal', value: l >= r };
        default:
          return null;
      }
      return { type: 'Literal', value: result };
    }

    if (typeof l === 'string' && typeof r === 'string') {
      if (operator === '+') {
        return { type: 'Literal', value: l + r };
      }
      if (operator === '===' || operator === '==') {
        return { type: 'Literal', value: l === r };
      }
      if (operator === '!==' || operator === '!=') {
        return { type: 'Literal', value: l !== r };
      }
    }

    if (typeof l === 'boolean' && typeof r === 'boolean') {
      if (operator === '&&') return { type: 'Literal', value: l && r };
      if (operator === '||') return { type: 'Literal', value: l || r };
      if (operator === '===' || operator === '==') return { type: 'Literal', value: l === r };
      if (operator === '!==' || operator === '!=') return { type: 'Literal', value: l !== r };
    }

    return null;
  }

  private tryFoldUnary(operator: string, argument: ExpressionNode): LiteralNode | null {
    if (argument.type !== 'Literal') {
      return null;
    }

    const value = argument.value;

    if (operator === '-' && typeof value === 'number') {
      return { type: 'Literal', value: -value };
    }

    if (operator === '!' && typeof value === 'boolean') {
      return { type: 'Literal', value: !value };
    }

    return null;
  }
}

// ==================== 代码生成器 (CodeGenerator) ====================

export class CodeGenerator {
  generate(node: ProgramNode, indent?: number): string;
  generate(node: StatementNode, indent?: number): string;
  generate(node: ExpressionNode, indent?: number): string;
  generate(node: ASTNode, indent = 0): string {
    const prefix = '  '.repeat(indent);

    switch (node.type) {
      case 'Program': {
        return node.body.map((s) => this.generate(s, indent)).join('\n');
      }

      case 'VariableDeclaration': {
        const initStr = node.init ? ' = ' + this.generate(node.init, indent) : '';
        return `${prefix}${node.kind} ${node.id}${initStr};`;
      }

      case 'FunctionDeclaration': {
        return `${prefix}function ${node.name}(${node.params.join(', ')}) ${this.generate(
          node.body,
          indent
        )}`;
      }

      case 'BlockStatement': {
        if (node.body.length === 0) {
          return '{}';
        }
        const inner = node.body.map((s) => this.generate(s, indent + 1)).join('\n');
        return `{\n${inner}\n${prefix}}`;
      }

      case 'IfStatement': {
        let code = `${prefix}if (${this.generate(node.test, indent)}) ${this.generate(
          node.consequent,
          indent
        )}`;
        if (node.alternate) {
          code += ` else ${this.generate(node.alternate, indent)}`;
        }
        return code;
      }

      case 'ReturnStatement': {
        const argStr = node.argument ? ' ' + this.generate(node.argument, indent) : '';
        return `${prefix}return${argStr};`;
      }

      case 'ExpressionStatement': {
        return `${prefix}${this.generate(node.expression, indent)};`;
      }

      case 'BinaryExpression': {
        return `${this.generate(node.left, indent)} ${node.operator} ${this.generate(
          node.right,
          indent
        )}`;
      }

      case 'UnaryExpression': {
        return `${node.operator}${this.generate(node.argument, indent)}`;
      }

      case 'AssignmentExpression': {
        return `${this.generate(node.left, indent)} ${node.operator} ${this.generate(
          node.right,
          indent
        )}`;
      }

      case 'CallExpression': {
        const argsStr = node.arguments.map((a) => this.generate(a, indent)).join(', ');
        return `${node.callee}(${argsStr})`;
      }

      case 'Identifier': {
        return node.name;
      }

      case 'Literal': {
        if (typeof node.value === 'string') {
          const escaped = node.value
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          return `"${escaped}"`;
        }
        if (typeof node.value === 'boolean') {
          return String(node.value);
        }
        if (node.value === null) {
          return 'null';
        }
        return String(node.value);
      }

      default: {
        const _exhaustive: never = node;
        return String(_exhaustive);
      }
    }
  }
}

// ==================== Demo ====================

export function demo(): void {
  console.log('=== 编译器设计 ===\n');

  const source = `
    // 这是一个行注释
    /* 这是一个
       块注释 */
    let x = 10;
    let y = -5;
    let msg = "He said \\"hi\\"";
    let z = -y;

    function add(a, b) {
      return a + b;
    }

    if (x > y) {
      let result = add(x, y);
      result = result * 2;
    } else if (x === y) {
      result = 0;
    } else {
      result = -1;
    }

    let flag = !true;
    let cond = (x > 0) && (y < 0);
  `;

  console.log('源代码:');
  console.log(source);

  // 词法分析
  console.log('\n--- 词法分析 ---');
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  console.log(
    'Tokens (前 15 个):',
    tokens.slice(0, 15).map((t) => `${t.type}(${JSON.stringify(t.value)})`).join(', '),
    '...'
  );

  // 语法分析
  console.log('\n--- 语法分析 ---');
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log('AST 根节点:', ast.type);
  console.log('顶层语句数:', ast.body.length);

  // 优化
  console.log('\n--- 优化 ---');
  const optimizer = new Optimizer();
  const optimizedAST = optimizer.optimize(ast);
  console.log('优化完成');

  // 代码生成
  console.log('\n--- 代码生成 ---');
  const generator = new CodeGenerator();
  const output = generator.generate(optimizedAST);
  console.log('生成的代码:');
  console.log(output);

  // 简单表达式测试（含常量折叠与一元运算符）
  console.log('\n--- 表达式编译 ---');
  const exprSource = '-5 + 3 * 4';
  const exprLexer = new Lexer(exprSource);
  const exprParser = new Parser(exprLexer.tokenize());
  const exprAST = exprParser.parse();
  const exprOptimized = optimizer.optimize(exprAST);

  console.log(`表达式: ${exprSource}`);
  console.log('生成的代码:', generator.generate(exprOptimized));
}
