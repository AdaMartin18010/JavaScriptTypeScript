// ============================================================
// Mini-TS Parser: 简化 TypeScript 子集的 AST 与递归下降解析器
// ============================================================

export type ASTNode =
  | Program
  | VariableDecl
  | FunctionDecl
  | ReturnStmt
  | BinaryExpr
  | CallExpr
  | Identifier
  | NumberLiteral
  | StringLiteral
  | ObjectLiteral;

export interface Program {
  kind: 'Program';
  body: Statement[];
}

export type Statement =
  | VariableDecl
  | FunctionDecl
  | ReturnStmt
  | Expression;

export interface VariableDecl {
  kind: 'VariableDecl';
  name: string;
  typeAnnotation: TypeAnnotation | null;
  initializer: Expression | null;
}

export interface FunctionDecl {
  kind: 'FunctionDecl';
  name: string;
  genericParams: string[];
  params: { name: string; typeAnnotation: TypeAnnotation | null }[];
  returnType: TypeAnnotation | null;
  body: Statement[];
}

export interface ReturnStmt {
  kind: 'ReturnStmt';
  argument: Expression | null;
}

export interface BinaryExpr {
  kind: 'BinaryExpr';
  operator: '+' | '-' | '*' | '/';
  left: Expression;
  right: Expression;
}

export interface CallExpr {
  kind: 'CallExpr';
  callee: Expression;
  args: Expression[];
}

export interface Identifier {
  kind: 'Identifier';
  name: string;
}

export interface NumberLiteral {
  kind: 'NumberLiteral';
  value: number;
}

export interface StringLiteral {
  kind: 'StringLiteral';
  value: string;
}

export interface ObjectLiteral {
  kind: 'ObjectLiteral';
  properties: { key: string; value: Expression }[];
}

export type Expression =
  | BinaryExpr
  | CallExpr
  | Identifier
  | NumberLiteral
  | StringLiteral
  | ObjectLiteral;

export type TypeAnnotation =
  | { kind: 'primitive'; name: 'number' | 'string' | 'boolean' | 'void' }
  | { kind: 'object'; properties: Record<string, TypeAnnotation> }
  | { kind: 'function'; params: { name: string; type: TypeAnnotation }[]; returnType: TypeAnnotation; genericParams?: string[] }
  | { kind: 'generic'; name: string }
  | { kind: 'conditional'; check: string; extends: string; trueType: TypeAnnotation; falseType: TypeAnnotation };

// ============================================================
// Tokenizer
// ============================================================

type TokenType =
  | 'let'
  | 'const'
  | 'function'
  | 'return'
  | 'identifier'
  | 'number'
  | 'string'
  | 'colon'
  | 'semicolon'
  | 'comma'
  | 'lparen'
  | 'rparen'
  | 'lbrace'
  | 'rbrace'
  | 'lt'
  | 'gt'
  | 'extends'
  | 'question'
  | 'eq'
  | 'operator'
  | 'eof';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    // skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // single-line comment
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }

    // string
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let value = '';
      while (i < source.length && source[i] !== quote) {
        value += source[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value });
      continue;
    }

    // number
    if (/\d/.test(ch)) {
      let value = '';
      while (i < source.length && /\d/.test(source[i])) {
        value += source[i];
        i++;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    // identifier / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let value = '';
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) {
        value += source[i];
        i++;
      }
      if (value === 'let') tokens.push({ type: 'let', value });
      else if (value === 'const') tokens.push({ type: 'const', value });
      else if (value === 'function') tokens.push({ type: 'function', value });
      else if (value === 'return') tokens.push({ type: 'return', value });
      else if (value === 'extends') tokens.push({ type: 'extends', value });
      else tokens.push({ type: 'identifier', value });
      continue;
    }

    // punctuations & operators
    switch (ch) {
      case ':':
        tokens.push({ type: 'colon', value: ':' });
        i++;
        break;
      case ';':
        tokens.push({ type: 'semicolon', value: ';' });
        i++;
        break;
      case ',':
        tokens.push({ type: 'comma', value: ',' });
        i++;
        break;
      case '(':
        tokens.push({ type: 'lparen', value: '(' });
        i++;
        break;
      case ')':
        tokens.push({ type: 'rparen', value: ')' });
        i++;
        break;
      case '{':
        tokens.push({ type: 'lbrace', value: '{' });
        i++;
        break;
      case '}':
        tokens.push({ type: 'rbrace', value: '}' });
        i++;
        break;
      case '<':
        tokens.push({ type: 'lt', value: '<' });
        i++;
        break;
      case '>':
        tokens.push({ type: 'gt', value: '>' });
        i++;
        break;
      case '?':
        tokens.push({ type: 'question', value: '?' });
        i++;
        break;
      case '=':
        tokens.push({ type: 'eq', value: '=' });
        i++;
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        tokens.push({ type: 'operator', value: ch });
        i++;
        break;
      default:
        throw new Error(`Unexpected character: ${ch} at position ${i}`);
    }
  }

  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

// ============================================================
// Recursive Descent Parser
// ============================================================

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const tok = this.peek();
    if (tok.type !== type) {
      throw new Error(`Expected ${type} but got ${tok.type}`);
    }
    return this.advance();
  }

  parse(): Program {
    const body: Statement[] = [];
    while (this.peek().type !== 'eof') {
      body.push(this.parseStatement());
    }
    return { kind: 'Program', body };
  }

  private parseStatement(): Statement {
    const tok = this.peek();

    if (tok.type === 'let' || tok.type === 'const') {
      return this.parseVariableDecl();
    }

    if (tok.type === 'function') {
      return this.parseFunctionDecl();
    }

    if (tok.type === 'return') {
      return this.parseReturnStmt();
    }

    return this.parseExpression();
  }

  private parseVariableDecl(): VariableDecl {
    this.advance(); // let / const
    const name = this.expect('identifier').value;

    let typeAnnotation: TypeAnnotation | null = null;
    if (this.peek().type === 'colon') {
      this.advance();
      typeAnnotation = this.parseType();
    }

    let initializer: Expression | null = null;
    if (this.peek().type === 'eq') {
      this.advance();
      initializer = this.parseExpression();
    }

    if (this.peek().type === 'semicolon') {
      this.advance();
    }

    return { kind: 'VariableDecl', name, typeAnnotation, initializer };
  }

  private parseFunctionDecl(): FunctionDecl {
    this.advance(); // function
    const name = this.expect('identifier').value;

    const genericParams: string[] = [];
    if (this.peek().type === 'lt') {
      this.advance();
      while (this.peek().type !== 'gt') {
        genericParams.push(this.expect('identifier').value);
        if (this.peek().type === 'comma') this.advance();
      }
      this.expect('gt');
    }

    this.expect('lparen');
    const params: { name: string; typeAnnotation: TypeAnnotation | null }[] = [];
    while (this.peek().type !== 'rparen') {
      const paramName = this.expect('identifier').value;
      let paramType: TypeAnnotation | null = null;
      if (this.peek().type === 'colon') {
        this.advance();
        paramType = this.parseType();
      }
      params.push({ name: paramName, typeAnnotation: paramType });
      if (this.peek().type === 'comma') this.advance();
    }
    this.expect('rparen');

    let returnType: TypeAnnotation | null = null;
    if (this.peek().type === 'colon') {
      this.advance();
      returnType = this.parseType();
    }

    this.expect('lbrace');
    const body: Statement[] = [];
    while (this.peek().type !== 'rbrace') {
      body.push(this.parseStatement());
    }
    this.expect('rbrace');

    return { kind: 'FunctionDecl', name, genericParams, params, returnType, body };
  }

  private parseReturnStmt(): ReturnStmt {
    this.advance(); // return
    let argument: Expression | null = null;
    if (this.peek().type !== 'semicolon' && this.peek().type !== 'rbrace' && this.peek().type !== 'eof') {
      argument = this.parseExpression();
    }
    if (this.peek().type === 'semicolon') {
      this.advance();
    }
    return { kind: 'ReturnStmt', argument };
  }

  private parseType(): TypeAnnotation {
    // object literal type: { x: number, y: string }
    if (this.peek().type === 'lbrace') {
      this.advance();
      const properties: Record<string, TypeAnnotation> = {};
      while (this.peek().type !== 'rbrace') {
        const key = this.expect('identifier').value;
        this.expect('colon');
        properties[key] = this.parseType();
        if (this.peek().type === 'comma') this.advance();
      }
      this.expect('rbrace');
      return { kind: 'object', properties };
    }

    // primitive or identifier
    const tok = this.expect('identifier');
    let type: TypeAnnotation;

    if (tok.value === 'number' || tok.value === 'string' || tok.value === 'boolean' || tok.value === 'void') {
      type = { kind: 'primitive', name: tok.value };
    } else {
      type = { kind: 'generic', name: tok.value };
    }

    // conditional type: T extends X ? A : B
    if (this.peek().type === 'extends') {
      this.advance();
      const extendsType = this.expect('identifier').value;
      this.expect('question');
      const trueType = this.parseType();
      this.expect('colon');
      const falseType = this.parseType();
      return {
        kind: 'conditional',
        check: tok.value,
        extends: extendsType,
        trueType,
        falseType,
      };
    }

    return type;
  }

  private parseExpression(): Expression {
    return this.parseBinary();
  }

  private parseBinary(): Expression {
    let left = this.parsePrimary();

    while (this.peek().type === 'operator') {
      const op = this.advance().value as '+' | '-' | '*' | '/';
      const right = this.parsePrimary();
      left = { kind: 'BinaryExpr', operator: op, left, right };
    }

    return left;
  }

  private parsePrimary(): Expression {
    const tok = this.peek();

    if (tok.type === 'number') {
      this.advance();
      return { kind: 'NumberLiteral', value: Number(tok.value) };
    }

    if (tok.type === 'string') {
      this.advance();
      return { kind: 'StringLiteral', value: tok.value };
    }

    if (tok.type === 'identifier') {
      this.advance();
      let expr: Expression = { kind: 'Identifier', name: tok.value };

      // call expression
      if (this.peek().type === 'lparen') {
        this.advance();
        const args: Expression[] = [];
        while (this.peek().type !== 'rparen') {
          args.push(this.parseExpression());
          if (this.peek().type === 'comma') this.advance();
        }
        this.expect('rparen');
        expr = { kind: 'CallExpr', callee: expr, args };
      }

      return expr;
    }

    if (tok.type === 'lbrace') {
      return this.parseObjectLiteral();
    }

    throw new Error(`Unexpected token in expression: ${tok.type}`);
  }

  private parseObjectLiteral(): ObjectLiteral {
    this.expect('lbrace');
    const properties: { key: string; value: Expression }[] = [];
    while (this.peek().type !== 'rbrace') {
      const key = this.expect('identifier').value;
      this.expect('colon');
      const value = this.parseExpression();
      properties.push({ key, value });
      if (this.peek().type === 'comma') this.advance();
    }
    this.expect('rbrace');
    return { kind: 'ObjectLiteral', properties };
  }
}

export function parse(source: string): Program {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  return parser.parse();
}
