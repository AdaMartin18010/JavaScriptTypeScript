/**
 * @file 语法分析器 (Parser)
 * @category Compiler Design → Parser
 * @difficulty hard
 * @tags compiler, parser, ast, recursive-descent
 *
 * @description
 * 递归下降语法分析器，将 Token 流转换为抽象语法树 (AST)。
 *
 * 支持特性：
 * - 表达式解析：支持优先级和结合性
 * - 语句解析：变量声明、控制流、函数定义
 * - 错误恢复：同步恢复策略
 * - 左递归消除
 */

import { TokenType } from './lexer.js';
import type { Token } from './lexer.js';

// ==================== AST 节点类型 ====================

export type ASTNode = 
  | ProgramNode
  | StatementNode
  | ExpressionNode;

export type StatementNode =
  | VariableDeclarationNode
  | FunctionDeclarationNode
  | BlockStatementNode
  | ExpressionStatementNode
  | IfStatementNode
  | WhileStatementNode
  | ForStatementNode
  | ReturnStatementNode
  | BreakStatementNode
  | ContinueStatementNode;

export type ExpressionNode =
  | BinaryExpressionNode
  | UnaryExpressionNode
  | AssignmentExpressionNode
  | CallExpressionNode
  | MemberExpressionNode
  | ArrayExpressionNode
  | ObjectExpressionNode
  | ConditionalExpressionNode
  | ArrowFunctionExpressionNode
  | IdentifierNode
  | LiteralNode;

export interface Position {
  line: number;
  column: number;
}

export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
  start?: Position;
  end?: Position;
}

export interface VariableDeclarationNode {
  type: 'VariableDeclaration';
  kind: 'var' | 'let' | 'const';
  declarations: {
    id: IdentifierNode;
    init: ExpressionNode | null;
  }[];
}

export interface FunctionDeclarationNode {
  type: 'FunctionDeclaration';
  id: IdentifierNode;
  params: IdentifierNode[];
  body: BlockStatementNode;
  async: boolean;
}

export interface BlockStatementNode {
  type: 'BlockStatement';
  body: StatementNode[];
}

export interface ExpressionStatementNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
}

export interface IfStatementNode {
  type: 'IfStatement';
  test: ExpressionNode;
  consequent: StatementNode;
  alternate: StatementNode | null;
}

export interface WhileStatementNode {
  type: 'WhileStatement';
  test: ExpressionNode;
  body: StatementNode;
}

export interface ForStatementNode {
  type: 'ForStatement';
  init: VariableDeclarationNode | ExpressionNode | null;
  test: ExpressionNode | null;
  update: ExpressionNode | null;
  body: StatementNode;
}

export interface ReturnStatementNode {
  type: 'ReturnStatement';
  argument: ExpressionNode | null;
}

export interface BreakStatementNode {
  type: 'BreakStatement';
  label: IdentifierNode | null;
}

export interface ContinueStatementNode {
  type: 'ContinueStatement';
  label: IdentifierNode | null;
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
  prefix: boolean;
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
  callee: ExpressionNode;
  arguments: ExpressionNode[];
}

export interface MemberExpressionNode {
  type: 'MemberExpression';
  object: ExpressionNode;
  property: IdentifierNode | ExpressionNode;
  computed: boolean;
}

export interface ArrayExpressionNode {
  type: 'ArrayExpression';
  elements: (ExpressionNode | null)[];
}

export interface ObjectExpressionNode {
  type: 'ObjectExpression';
  properties: {
    key: IdentifierNode | LiteralNode;
    value: ExpressionNode;
    shorthand: boolean;
  }[];
}

export interface ConditionalExpressionNode {
  type: 'ConditionalExpression';
  test: ExpressionNode;
  consequent: ExpressionNode;
  alternate: ExpressionNode;
}

export interface ArrowFunctionExpressionNode {
  type: 'ArrowFunctionExpression';
  params: IdentifierNode[];
  body: ExpressionNode | BlockStatementNode;
  expression: boolean;
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
}

export interface LiteralNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

// ==================== 语法分析器 ====================

export class Parser {
  private tokens: Token[];
  private position = 0;
  private errors: { message: string; token: Token }[] = [];

  // 优先级表（从低到高）
  private precedence: Record<string, number> = {
    '=': 1, '+=': 1, '-=': 1, '*=': 1, '/=': 1, '%=': 1,
    '||': 2,
    '&&': 3,
    '|': 4,
    '^': 5,
    '&': 6,
    '==': 7, '!=': 7, '===': 7, '!==': 7,
    '<': 8, '>': 8, '<=': 8, '>=': 8,
    '<<': 9, '>>': 9,
    '+': 10, '-': 10,
    '*': 11, '/': 11, '%': 11,
    '**': 12
  };

  constructor(tokens: Token[]) {
    // 过滤掉 NEWLINE 和 WHITESPACE
    this.tokens = tokens.filter(t => 
      t.type !== TokenType.NEWLINE && 
      t.type !== TokenType.WHITESPACE
    );
  }

  /**
   * 解析程序
   */
  parse(): ProgramNode {
    const body: StatementNode[] = [];

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          body.push(stmt);
        }
      } catch (error) {
        this.synchronize();
      }
    }

    return {
      type: 'Program',
      body
    };
  }

  /**
   * 解析语句
   */
  private parseStatement(): StatementNode | null {
    const token = this.peek();

    switch (token.type) {
      case TokenType.SEMICOLON:
        this.advance();
        return null;

      case TokenType.KEYWORD:
        switch (token.value) {
          case 'var':
          case 'let':
          case 'const':
            return this.parseVariableDeclaration();
          case 'function':
            return this.parseFunctionDeclaration();
          case 'if':
            return this.parseIfStatement();
          case 'while':
            return this.parseWhileStatement();
          case 'for':
            return this.parseForStatement();
          case 'return':
            return this.parseReturnStatement();
          case 'break':
            return this.parseBreakStatement();
          case 'continue':
            return this.parseContinueStatement();
          default:
            return this.parseExpressionStatement();
        }

      case TokenType.LBRACE:
        return this.parseBlockStatement();

      default:
        return this.parseExpressionStatement();
    }
  }

  /**
   * 解析变量声明
   */
  private parseVariableDeclaration(): VariableDeclarationNode {
    const kind = this.consume(TokenType.KEYWORD).value as 'var' | 'let' | 'const';
    const declarations = [];

    do {
      const id = this.parseIdentifier();
      let init: ExpressionNode | null = null;

      if (this.match(TokenType.ASSIGN)) {
        init = this.parseExpression();
      }

      declarations.push({ id, init });
    } while (this.match(TokenType.COMMA));

    this.consumeOptional(TokenType.SEMICOLON);

    return {
      type: 'VariableDeclaration',
      kind,
      declarations
    };
  }

  /**
   * 解析函数声明
   */
  private parseFunctionDeclaration(): FunctionDeclarationNode {
    this.consume(TokenType.KEYWORD); // function
    const id = this.parseIdentifier();

    this.consume(TokenType.LPAREN);
    const params: IdentifierNode[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        params.push(this.parseIdentifier());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN);
    const body = this.parseBlockStatement();

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body,
      async: false
    };
  }

  /**
   * 解析块语句
   */
  private parseBlockStatement(): BlockStatementNode {
    this.consume(TokenType.LBRACE);
    const body: StatementNode[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }

    this.consume(TokenType.RBRACE);

    return {
      type: 'BlockStatement',
      body
    };
  }

  /**
   * 解析表达式语句
   */
  private parseExpressionStatement(): ExpressionStatementNode {
    const expression = this.parseExpression();
    this.consumeOptional(TokenType.SEMICOLON);

    return {
      type: 'ExpressionStatement',
      expression
    };
  }

  /**
   * 解析 if 语句
   */
  private parseIfStatement(): IfStatementNode {
    this.consume(TokenType.KEYWORD); // if
    this.consume(TokenType.LPAREN);
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN);

    const consequent = this.parseStatement() || this.parseBlockStatement();

    let alternate: StatementNode | null = null;
    if (this.matchKeyword('else')) {
      alternate = this.parseStatement();
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    };
  }

  /**
   * 解析 while 语句
   */
  private parseWhileStatement(): WhileStatementNode {
    this.consume(TokenType.KEYWORD); // while
    this.consume(TokenType.LPAREN);
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN);

    const body = this.parseStatement() || this.parseBlockStatement();

    return {
      type: 'WhileStatement',
      test,
      body
    };
  }

  /**
   * 解析 for 语句
   */
  private parseForStatement(): ForStatementNode {
    this.consume(TokenType.KEYWORD); // for
    this.consume(TokenType.LPAREN);

    let init: VariableDeclarationNode | ExpressionNode | null = null;
    if (this.check(TokenType.KEYWORD) && ['var', 'let', 'const'].includes(this.peek().value)) {
      init = this.parseVariableDeclaration();
    } else if (!this.check(TokenType.SEMICOLON)) {
      init = this.parseExpression();
      this.consumeOptional(TokenType.SEMICOLON);
    } else {
      this.advance();
    }

    let test: ExpressionNode | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      test = this.parseExpression();
    }
    this.consume(TokenType.SEMICOLON);

    let update: ExpressionNode | null = null;
    if (!this.check(TokenType.RPAREN)) {
      update = this.parseExpression();
    }

    this.consume(TokenType.RPAREN);
    const body = this.parseStatement() || this.parseBlockStatement();

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body
    };
  }

  /**
   * 解析 return 语句
   */
  private parseReturnStatement(): ReturnStatementNode {
    this.consume(TokenType.KEYWORD); // return

    let argument: ExpressionNode | null = null;
    if (!this.check(TokenType.SEMICOLON) && !this.check(TokenType.RBRACE)) {
      argument = this.parseExpression();
    }

    this.consumeOptional(TokenType.SEMICOLON);

    return {
      type: 'ReturnStatement',
      argument
    };
  }

  /**
   * 解析 break 语句
   */
  private parseBreakStatement(): BreakStatementNode {
    this.consume(TokenType.KEYWORD); // break

    let label: IdentifierNode | null = null;
    if (this.check(TokenType.IDENTIFIER)) {
      label = this.parseIdentifier();
    }

    this.consumeOptional(TokenType.SEMICOLON);

    return {
      type: 'BreakStatement',
      label
    };
  }

  /**
   * 解析 continue 语句
   */
  private parseContinueStatement(): ContinueStatementNode {
    this.consume(TokenType.KEYWORD); // continue

    let label: IdentifierNode | null = null;
    if (this.check(TokenType.IDENTIFIER)) {
      label = this.parseIdentifier();
    }

    this.consumeOptional(TokenType.SEMICOLON);

    return {
      type: 'ContinueStatement',
      label
    };
  }

  /**
   * 解析表达式（使用 Pratt 解析器处理优先级）
   */
  private parseExpression(minPrecedence = 0): ExpressionNode {
    let left = this.parsePrimary();

    while (true) {
      const token = this.peek();
      
      // 检查是否为二元运算符
      if (!this.isBinaryOperator(token)) {
        break;
      }

      const precedence = this.precedence[token.value] || 0;
      if (precedence < minPrecedence) {
        break;
      }

      this.advance();
      const right = this.parseExpression(precedence + 1);

      left = {
        type: 'BinaryExpression',
        operator: token.value,
        left,
        right
      };
    }

    // 条件表达式 (ternary)
    if (this.match(TokenType.QUESTION)) {
      const consequent = this.parseExpression();
      this.consume(TokenType.COLON);
      const alternate = this.parseExpression();

      left = {
        type: 'ConditionalExpression',
        test: left,
        consequent,
        alternate
      };
    }

    return left;
  }

  /**
   * 解析基本表达式
   */
  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    switch (token.type) {
      case TokenType.NUMBER:
        return this.parseNumericLiteral();

      case TokenType.STRING:
        return this.parseStringLiteral();

      case TokenType.BOOLEAN:
        return this.parseBooleanLiteral();

      case TokenType.NULL:
        this.advance();
        return {
          type: 'Literal',
          value: null,
          raw: 'null'
        };

      case TokenType.IDENTIFIER:
        return this.parseIdentifierOrCall();

      case TokenType.KEYWORD:
        if (token.value === 'function') {
          return this.parseFunctionExpression();
        }
        return this.parseIdentifier();

      case TokenType.LPAREN:
        return this.parseGroupingOrArrow();

      case TokenType.LBRACKET:
        return this.parseArrayExpression();

      case TokenType.LBRACE:
        return this.parseObjectExpression();

      case TokenType.NOT:
      case TokenType.MINUS:
      case TokenType.PLUS:
      case TokenType.BIT_NOT:
        return this.parseUnaryExpression();

      default:
        throw this.error(`Unexpected token: ${token.type}`);
    }
  }

  /**
   * 解析标识符或函数调用
   */
  private parseIdentifierOrCall(): ExpressionNode {
    let expr: ExpressionNode = this.parseIdentifier();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCallExpression(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        const property = this.parseExpression();
        this.consume(TokenType.RBRACKET);
        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
          computed: true
        };
      } else if (this.match(TokenType.DOT)) {
        const property = this.parseIdentifier();
        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
          computed: false
        };
      } else {
        break;
      }
    }

    return expr;
  }

  /**
   * 完成函数调用表达式
   */
  private finishCallExpression(callee: ExpressionNode): CallExpressionNode {
    const args: ExpressionNode[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN);

    return {
      type: 'CallExpression',
      callee,
      arguments: args
    };
  }

  /**
   * 解析分组表达式或箭头函数
   */
  private parseGroupingOrArrow(): ExpressionNode {
    this.consume(TokenType.LPAREN);

    // 检查是否为箭头函数
    if (this.check(TokenType.IDENTIFIER)) {
      const savedPos = this.position;
      const params: IdentifierNode[] = [];

      do {
        params.push(this.parseIdentifier());
      } while (this.match(TokenType.COMMA));

      if (this.check(TokenType.RPAREN) && this.peekNext().type === TokenType.ARROW) {
        this.consume(TokenType.RPAREN);
        this.consume(TokenType.ARROW);
        return this.finishArrowFunction(params);
      }

      // 不是箭头函数，回退
      this.position = savedPos;
    }

    // 普通分组
    const expr = this.parseExpression();
    this.consume(TokenType.RPAREN);
    return expr;
  }

  /**
   * 完成箭头函数
   */
  private finishArrowFunction(params: IdentifierNode[]): ArrowFunctionExpressionNode {
    let body: ExpressionNode | BlockStatementNode;
    let expression = true;

    if (this.match(TokenType.LBRACE)) {
      body = this.parseBlockStatement();
      expression = false;
    } else {
      body = this.parseExpression();
    }

    return {
      type: 'ArrowFunctionExpression',
      params,
      body,
      expression
    };
  }

  /**
   * 解析数组表达式
   */
  private parseArrayExpression(): ArrayExpressionNode {
    this.consume(TokenType.LBRACKET);
    const elements: (ExpressionNode | null)[] = [];

    if (!this.check(TokenType.RBRACKET)) {
      do {
        if (this.check(TokenType.COMMA)) {
          elements.push(null);
        } else {
          elements.push(this.parseExpression());
        }
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RBRACKET);

    return {
      type: 'ArrayExpression',
      elements
    };
  }

  /**
   * 解析对象表达式
   */
  private parseObjectExpression(): ObjectExpressionNode {
    this.consume(TokenType.LBRACE);
    const properties: ObjectExpressionNode['properties'] = [];

    if (!this.check(TokenType.RBRACE)) {
      do {
        let key: IdentifierNode | LiteralNode;
        let shorthand = false;

        if (this.check(TokenType.IDENTIFIER)) {
          key = this.parseIdentifier();
        } else if (this.check(TokenType.STRING)) {
          key = this.parseStringLiteral();
        } else if (this.check(TokenType.NUMBER)) {
          key = this.parseNumericLiteral();
        } else {
          throw this.error('Expected property key');
        }

        let value: ExpressionNode;
        if (this.match(TokenType.COLON)) {
          value = this.parseExpression();
        } else {
          // Shorthand property
          shorthand = true;
          value = key as IdentifierNode;
        }

        properties.push({ key, value, shorthand });
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RBRACE);

    return {
      type: 'ObjectExpression',
      properties
    };
  }

  /**
   * 解析一元表达式
   */
  private parseUnaryExpression(): UnaryExpressionNode {
    const operator = this.advance().value;
    const argument = this.parsePrimary();

    return {
      type: 'UnaryExpression',
      operator,
      prefix: true,
      argument
    };
  }

  /**
   * 解析函数字面量
   */
  private parseFunctionExpression(): ArrowFunctionExpressionNode {
    this.consume(TokenType.KEYWORD); // function

    const params: IdentifierNode[] = [];
    this.consume(TokenType.LPAREN);

    if (!this.check(TokenType.RPAREN)) {
      do {
        params.push(this.parseIdentifier());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN);
    const body = this.parseBlockStatement();

    return {
      type: 'ArrowFunctionExpression',
      params,
      body,
      expression: false
    };
  }

  // ==================== 辅助方法 ====================

  private parseIdentifier(): IdentifierNode {
    const token = this.consume(TokenType.IDENTIFIER);
    return {
      type: 'Identifier',
      name: token.value
    };
  }

  private parseNumericLiteral(): LiteralNode {
    const token = this.consume(TokenType.NUMBER);
    return {
      type: 'Literal',
      value: parseFloat(token.value),
      raw: token.value
    };
  }

  private parseStringLiteral(): LiteralNode {
    const token = this.consume(TokenType.STRING);
    return {
      type: 'Literal',
      value: token.value,
      raw: `"${token.value}"`
    };
  }

  private parseBooleanLiteral(): LiteralNode {
    const token = this.consume(TokenType.BOOLEAN);
    return {
      type: 'Literal',
      value: token.value === 'true',
      raw: token.value
    };
  }

  private isBinaryOperator(token: Token): boolean {
    return token.type === TokenType.PLUS ||
           token.type === TokenType.MINUS ||
           token.type === TokenType.MULTIPLY ||
           token.type === TokenType.DIVIDE ||
           token.type === TokenType.MODULO ||
           token.type === TokenType.POWER ||
           token.type === TokenType.EQ ||
           token.type === TokenType.NE ||
           token.type === TokenType.STRICT_EQ ||
           token.type === TokenType.STRICT_NE ||
           token.type === TokenType.LT ||
           token.type === TokenType.GT ||
           token.type === TokenType.LE ||
           token.type === TokenType.GE ||
           token.type === TokenType.AND ||
           token.type === TokenType.OR ||
           token.type === TokenType.ASSIGN;
  }

  // ==================== Token 操作 ====================

  private peek(): Token {
    return this.tokens[this.position];
  }

  private peekNext(): Token {
    return this.tokens[this.position + 1] || this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.position++;
    }
    return this.tokens[this.position - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchKeyword(keyword: string): boolean {
    if (this.check(TokenType.KEYWORD) && this.peek().value === keyword) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: TokenType): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.error(`Expected ${type}, got ${this.peek().type}`);
  }

  private consumeOptional(type: TokenType): Token | null {
    if (this.check(type)) {
      return this.advance();
    }
    return null;
  }

  private error(message: string): Error {
    const token = this.peek();
    this.errors.push({ message, token });
    return new Error(`${message} at line ${token.line}, column ${token.column}`);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.tokens[this.position - 1].type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.KEYWORD:
          const keyword = this.peek().value;
          if (['class', 'function', 'let', 'const', 'var', 'if', 'while', 'for', 'return'].includes(keyword)) {
            return;
          }
          break;
      }

      this.advance();
    }
  }
}

// ==================== AST 格式化器 ====================

export class ASTFormatter {
  static format(node: ASTNode, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    switch (node.type) {
      case 'Program':
        return (node).body
          .map(stmt => this.format(stmt, indent))
          .join('\n');

      case 'VariableDeclaration':
        const varDecl = node;
        const decls = varDecl.declarations.map(d => {
          const init = d.init ? ` = ${this.format(d.init, 0)}` : '';
          return `${d.id.name}${init}`;
        }).join(', ');
        return `${spaces}${varDecl.kind} ${decls};`;

      case 'FunctionDeclaration':
        const func = node;
        const params = func.params.map(p => p.name).join(', ');
        return `${spaces}function ${func.id.name}(${params}) ${this.format(func.body, indent)}`;

      case 'BlockStatement':
        const block = node;
        const stmts = block.body.map(s => this.format(s, indent + 1)).join('\n');
        return `{\n${stmts}\n${spaces}}`;

      case 'IfStatement':
        const ifStmt = node;
        let result = `${spaces}if (${this.format(ifStmt.test, 0)}) ${this.format(ifStmt.consequent, indent)}`;
        if (ifStmt.alternate) {
          result += ` else ${this.format(ifStmt.alternate, indent)}`;
        }
        return result;

      case 'BinaryExpression':
        const binary = node;
        return `${this.format(binary.left, 0)} ${binary.operator} ${this.format(binary.right, 0)}`;

      case 'CallExpression':
        const call = node;
        const args = call.arguments.map(a => this.format(a, 0)).join(', ');
        return `${this.format(call.callee, 0)}(${args})`;

      case 'Identifier':
        return (node).name;

      case 'Literal':
        const lit = node;
        return lit.raw || String(lit.value);

      case 'ExpressionStatement':
        return `${spaces}${this.format((node).expression, 0)};`;

      default:
        return `${spaces}[${node.type}]`;
    }
  }
}

// ==================== 演示 ====================

import { Lexer } from './lexer.js';

export function demo(): void {
  console.log('=== 语法分析器 (Parser) ===\n');

  const source = `
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);

for (let i = 0; i < 5; i++) {
  console.log(i);
}

const obj = {
  name: "test",
  value: 42
};
`;

  console.log('源代码:');
  console.log(source);
  console.log('\n--- AST ---\n');

  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  console.log(JSON.stringify(ast, null, 2));

  // 格式化输出
  console.log('\n--- 格式化代码 ---\n');
  console.log(ASTFormatter.format(ast));
}
