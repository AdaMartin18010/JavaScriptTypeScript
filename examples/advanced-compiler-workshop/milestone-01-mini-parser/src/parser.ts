/**
 * @file 语法分析器 (Parser)
 * @category Advanced Compiler Workshop → Milestone 1
 *
 * 递归下降解析器，将 Token 流转换为 AST。
 * 支持：变量声明、函数声明、接口声明、表达式、代码块。
 */

import { TokenKind, type Token } from './lexer.js';
import type {
  ProgramNode,
  StatementNode,
  ExpressionNode,
  TypeNode,
  VariableDeclarationNode,
  FunctionDeclarationNode,
  InterfaceDeclarationNode,
  BlockStatementNode,
  ReturnStatementNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  CallExpressionNode,
  IdentifierNode,
  ParameterNode,
  PropertySignatureNode,
} from './ast.js';

export interface ParserError {
  message: string;
  line: number;
  column: number;
}

export class Parser {
  private tokens: Token[];
  private pos = 0;
  private errors: ParserError[] = [];

  constructor(tokens: Token[]) {
    // 过滤掉 NEWLINE（如果有的话）
    this.tokens = tokens.filter((t) => t.kind !== TokenKind.NEWLINE);
  }

  /**
   * 解析入口：返回 Program 节点
   */
  parse(): ProgramNode {
    const statements: StatementNode[] = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    return { kind: 'Program', body: statements };
  }

  getErrors(): ParserError[] {
    return this.errors;
  }

  // ==================== 语句解析 ====================

  private parseStatement(): StatementNode | null {
    const token = this.peek();
    switch (token.kind) {
      case TokenKind.LET:
      case TokenKind.CONST:
        return this.parseVariableDeclaration();
      case TokenKind.FUNCTION:
        return this.parseFunctionDeclaration();
      case TokenKind.INTERFACE:
        return this.parseInterfaceDeclaration();
      case TokenKind.RETURN:
        return this.parseReturnStatement();
      case TokenKind.LBRACE:
        return this.parseBlockStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseVariableDeclaration(): VariableDeclarationNode {
    const startToken = this.consume(); // let / const
    const isConst = startToken.kind === TokenKind.CONST;
    const name = this.expectIdentifier('Expected variable name after let/const');

    let typeAnnotation: TypeNode | undefined;
    if (this.match(TokenKind.COLON)) {
      typeAnnotation = this.parseType();
    }

    let initializer: ExpressionNode | undefined;
    if (this.match(TokenKind.ASSIGN)) {
      initializer = this.parseExpression();
    }

    this.consumeOptional(TokenKind.SEMICOLON);

    return {
      kind: 'VariableDeclaration',
      name,
      typeAnnotation,
      initializer,
      isConst,
    };
  }

  private parseFunctionDeclaration(): FunctionDeclarationNode {
    this.consume(); // function
    const name = this.expectIdentifier('Expected function name');

    // 泛型参数 <T, U>
    const typeParameters: string[] = [];
    if (this.match(TokenKind.LT_ANGLE)) {
      do {
        typeParameters.push(this.expectIdentifier('Expected type parameter name'));
      } while (this.match(TokenKind.COMMA));
      this.expect(TokenKind.GT_ANGLE, 'Expected > after type parameters');
    }

    this.expect(TokenKind.LPAREN, 'Expected ( after function name');
    const parameters: ParameterNode[] = [];
    if (!this.check(TokenKind.RPAREN)) {
      do {
        const paramName = this.expectIdentifier('Expected parameter name');
        this.expect(TokenKind.COLON, 'Expected : after parameter name');
        const paramType = this.parseType();
        parameters.push({ name: paramName, typeAnnotation: paramType });
      } while (this.match(TokenKind.COMMA));
    }
    this.expect(TokenKind.RPAREN, 'Expected ) after parameters');

    let returnType: TypeNode | undefined;
    if (this.match(TokenKind.COLON)) {
      returnType = this.parseType();
    }

    const body = this.parseBlockStatement();

    return {
      kind: 'FunctionDeclaration',
      name,
      typeParameters,
      parameters,
      returnType,
      body,
    };
  }

  private parseInterfaceDeclaration(): InterfaceDeclarationNode {
    this.consume(); // interface
    const name = this.expectIdentifier('Expected interface name');
    this.expect(TokenKind.LBRACE, 'Expected { after interface name');

    const properties: PropertySignatureNode[] = [];
    while (!this.check(TokenKind.RBRACE) && !this.isAtEnd()) {
      const propName = this.expectIdentifier('Expected property name');
      const optional = this.match(TokenKind.QUESTION);
      this.expect(TokenKind.COLON, 'Expected : after property name');
      const propType = this.parseType();
      this.consumeOptional(TokenKind.SEMICOLON);
      properties.push({ kind: 'PropertySignature', name: propName, type: propType, optional });
    }

    this.expect(TokenKind.RBRACE, 'Expected } after interface body');

    return { kind: 'InterfaceDeclaration', name, properties };
  }

  private parseBlockStatement(): BlockStatementNode {
    this.consume(); // {
    const statements: StatementNode[] = [];
    while (!this.check(TokenKind.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    this.expect(TokenKind.RBRACE, 'Expected } at end of block');
    return { kind: 'BlockStatement', statements };
  }

  private parseReturnStatement(): ReturnStatementNode {
    this.consume(); // return
    let argument: ExpressionNode | undefined;
    if (!this.check(TokenKind.SEMICOLON) && !this.check(TokenKind.RBRACE) && !this.isAtEnd()) {
      argument = this.parseExpression();
    }
    this.consumeOptional(TokenKind.SEMICOLON);
    return { kind: 'ReturnStatement', argument };
  }

  private parseExpressionStatement(): ExpressionStatementNode {
    const expr = this.parseExpression();
    this.consumeOptional(TokenKind.SEMICOLON);
    return { kind: 'ExpressionStatement', expression: expr };
  }

  // ==================== 类型解析 ====================

  private parseType(): TypeNode {
    let type: TypeNode = this.parsePrimaryType();

    // Array<T> 或 T[]
    if (this.match(TokenKind.LBRACKET)) {
      this.expect(TokenKind.RBRACKET, 'Expected ] after [');
      type = { kind: 'ArrayType', elementType: type };
    }

    // 函数类型：() => T
    if (this.match(TokenKind.ARROW)) {
      const returnType = this.parseType();
      type = { kind: 'FunctionType', params: [], returnType };
    }

    return type;
  }

  private parsePrimaryType(): TypeNode {
    const token = this.peek();

    switch (token.kind) {
      case TokenKind.NUMBER_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'number' };
      case TokenKind.STRING_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'string' };
      case TokenKind.BOOLEAN_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'boolean' };
      case TokenKind.VOID_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'void' };
      case TokenKind.NEVER_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'never' };
      case TokenKind.UNDEFINED_KW:
        this.consume();
        return { kind: 'PrimitiveType', name: 'undefined' };
      case TokenKind.NULL_KW:
      case TokenKind.NULL:
        this.consume();
        return { kind: 'PrimitiveType', name: 'null' };
      case TokenKind.IDENTIFIER: {
        this.consume();
        const name = token.value;
        // 泛型参数，如 Array<number>
        if (this.match(TokenKind.LT_ANGLE)) {
          const params: TypeNode[] = [];
          do {
            params.push(this.parseType());
          } while (this.match(TokenKind.COMMA));
          this.expect(TokenKind.GT_ANGLE, 'Expected > after type arguments');
          return { kind: 'GenericType', name, params };
        }
        return { kind: 'IdentifierType', name };
      }
      case TokenKind.LPAREN: {
        this.consume();
        const params: { name: string; type: TypeNode }[] = [];
        if (!this.check(TokenKind.RPAREN)) {
          do {
            const paramName = this.expectIdentifier('Expected parameter name');
            this.expect(TokenKind.COLON, 'Expected : after parameter name');
            const paramType = this.parseType();
            params.push({ name: paramName, type: paramType });
          } while (this.match(TokenKind.COMMA));
        }
        this.expect(TokenKind.RPAREN, 'Expected )');
        this.expect(TokenKind.ARROW, 'Expected => in function type');
        const returnType = this.parseType();
        return { kind: 'FunctionType', params, returnType };
      }
      default:
        this.error(`Unexpected token in type position: ${token.kind}`);
        // 错误恢复：返回 any 占位
        return { kind: 'PrimitiveType', name: 'void' };
    }
  }

  // ==================== 表达式解析 ====================

  private parseExpression(): ExpressionNode {
    return this.parseEquality();
  }

  private parseEquality(): ExpressionNode {
    let left = this.parseRelational();
    while (this.match(TokenKind.EQ, TokenKind.NE, TokenKind.STRICT_EQ, TokenKind.STRICT_NE)) {
      const op = this.previous().value as BinaryExpressionNode['operator'];
      const right = this.parseRelational();
      left = { kind: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  private parseRelational(): ExpressionNode {
    let left = this.parseAdditive();
    while (this.match(TokenKind.LT, TokenKind.GT, TokenKind.LE, TokenKind.GE)) {
      const op = this.previous().value as BinaryExpressionNode['operator'];
      const right = this.parseAdditive();
      left = { kind: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  private parseAdditive(): ExpressionNode {
    let left = this.parseMultiplicative();
    while (this.match(TokenKind.PLUS, TokenKind.MINUS)) {
      const op = this.previous().value as BinaryExpressionNode['operator'];
      const right = this.parseMultiplicative();
      left = { kind: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  private parseMultiplicative(): ExpressionNode {
    let left = this.parsePrimary();
    while (this.match(TokenKind.STAR, TokenKind.SLASH)) {
      const op = this.previous().value as BinaryExpressionNode['operator'];
      const right = this.parsePrimary();
      left = { kind: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    switch (token.kind) {
      case TokenKind.NUMBER: {
        this.consume();
        return { kind: 'NumberLiteral', value: parseFloat(token.value), raw: token.value };
      }
      case TokenKind.STRING: {
        this.consume();
        return { kind: 'StringLiteral', value: token.value };
      }
      case TokenKind.TRUE: {
        this.consume();
        return { kind: 'BooleanLiteral', value: true };
      }
      case TokenKind.FALSE: {
        this.consume();
        return { kind: 'BooleanLiteral', value: false };
      }
      case TokenKind.NULL: {
        this.consume();
        return { kind: 'NullLiteral' };
      }
      case TokenKind.IDENTIFIER: {
        this.consume();
        const id: IdentifierNode = { kind: 'Identifier', name: token.value };
        // 函数调用
        if (this.match(TokenKind.LPAREN)) {
          const args: ExpressionNode[] = [];
          // 可选的显式类型参数 <T>
          let typeArguments: TypeNode[] | undefined;
          if (this.check(TokenKind.LT_ANGLE)) {
            typeArguments = [];
            this.consume(); // <
            do {
              typeArguments.push(this.parseType());
            } while (this.match(TokenKind.COMMA));
            this.expect(TokenKind.GT_ANGLE, 'Expected > after type arguments');
            this.expect(TokenKind.LPAREN, 'Expected ( after type arguments');
          }
          if (!this.check(TokenKind.RPAREN)) {
            do {
              args.push(this.parseExpression());
            } while (this.match(TokenKind.COMMA));
          }
          this.expect(TokenKind.RPAREN, 'Expected ) after arguments');
          return { kind: 'CallExpression', callee: id, arguments: args, typeArguments };
        }
        return id;
      }
      case TokenKind.LPAREN: {
        this.consume();
        const expr = this.parseExpression();
        this.expect(TokenKind.RPAREN, 'Expected ) after expression');
        return expr;
      }
      default:
        this.error(`Unexpected token in expression: ${token.kind}`);
        return { kind: 'NumberLiteral', value: 0, raw: '0' };
    }
  }

  // ==================== Token 操作 ====================

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private previous(): Token {
    return this.tokens[this.pos - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().kind === TokenKind.EOF;
  }

  private check(kind: TokenKind): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().kind === kind;
  }

  private match(...kinds: TokenKind[]): boolean {
    for (const kind of kinds) {
      if (this.check(kind)) {
        this.consume();
        return true;
      }
    }
    return false;
  }

  private consume(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }

  private expect(kind: TokenKind, message: string): void {
    if (this.check(kind)) {
      this.consume();
      return;
    }
    this.error(message);
  }

  private expectIdentifier(message: string): string {
    const token = this.peek();
    if (token.kind === TokenKind.IDENTIFIER) {
      this.consume();
      return token.value;
    }
    this.error(message);
    return '<unknown>';
  }

  private consumeOptional(kind: TokenKind): boolean {
    if (this.check(kind)) {
      this.consume();
      return true;
    }
    return false;
  }

  private error(message: string): void {
    const token = this.peek();
    this.errors.push({ message, line: token.line, column: token.column });
  }
}
