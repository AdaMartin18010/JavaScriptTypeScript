/**
 * @file 词法分析器 (Lexer)
 * @category Advanced Compiler Workshop → Milestone 1
 *
 * 将 Mini-TS 源代码转换为 Token 流。
 * 采用手写 DFA 风格，保持教学可读性。
 */

export enum TokenKind {
  // 字面量
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',

  // 标识符与关键字
  IDENTIFIER = 'IDENTIFIER',

  // 关键字（单独枚举便于 parser 匹配）
  LET = 'LET',
  CONST = 'CONST',
  FUNCTION = 'FUNCTION',
  INTERFACE = 'INTERFACE',
  RETURN = 'RETURN',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  FOR = 'FOR',

  // 类型关键字
  NUMBER_KW = 'NUMBER_KW',
  STRING_KW = 'STRING_KW',
  BOOLEAN_KW = 'BOOLEAN_KW',
  VOID_KW = 'VOID_KW',
  NEVER_KW = 'NEVER_KW',
  UNDEFINED_KW = 'UNDEFINED_KW',
  NULL_KW = 'NULL_KW',

  // 运算符
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  EQ = 'EQ',
  NE = 'NE',
  STRICT_EQ = 'STRICT_EQ',
  STRICT_NE = 'STRICT_NE',
  LE = 'LE',
  GE = 'GE',

  // 分隔符
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  COMMA = 'COMMA',
  DOT = 'DOT',
  ARROW = 'ARROW',
  QUESTION = 'QUESTION',

  // 括号
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  LT_ANGLE = 'LT_ANGLE',   // <
  GT_ANGLE = 'GT_ANGLE',   // >

  // 特殊
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  column: number;
}

export interface LexerError {
  message: string;
  line: number;
  column: number;
}

export class Lexer {
  private source: string;
  private pos = 0;
  private line = 1;
  private column = 1;
  private errors: LexerError[] = [];

  constructor(source: string) {
    this.source = source;
  }

  /**
   * 执行词法分析，返回 Token 列表与错误列表
   */
  tokenize(): { tokens: Token[]; errors: LexerError[] } {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const token = this.nextToken();
      if (token) tokens.push(token);
    }

    tokens.push(this.makeToken(TokenKind.EOF, ''));
    return { tokens, errors: this.errors };
  }

  private nextToken(): Token | null {
    const char = this.peek();

    // 标识符 / 关键字
    if (this.isAlpha(char) || char === '_') {
      return this.readIdentifierOrKeyword();
    }

    // 数字
    if (this.isDigit(char)) {
      return this.readNumber();
    }

    // 字符串
    if (char === '"' || char === "'") {
      return this.readString();
    }

    // 注释或除法
    if (char === '/') {
      if (this.peekNext() === '/') {
        this.skipLineComment();
        return null;
      }
      if (this.peekNext() === '*') {
        this.skipBlockComment();
        return null;
      }
      return this.advanceAndMake(TokenKind.SLASH, char);
    }

    // 三字符运算符
    const threeChar = char + this.peekNext() + this.peek(2);
    if (threeChar === '===') return this.advanceBy(3, TokenKind.STRICT_EQ, threeChar);
    if (threeChar === '!==') return this.advanceBy(3, TokenKind.STRICT_NE, threeChar);

    // 双字符运算符
    const twoChar = char + this.peekNext();
    switch (twoChar) {
      case '==':
        return this.advanceBy(2, TokenKind.EQ, twoChar);
      case '!=':
        return this.advanceBy(2, TokenKind.NE, twoChar);
      case '<=':
        return this.advanceBy(2, TokenKind.LE, twoChar);
      case '>=':
        return this.advanceBy(2, TokenKind.GE, twoChar);
      case '=>':
        return this.advanceBy(2, TokenKind.ARROW, twoChar);
    }

    // 单字符 Token
    switch (char) {
      case '=': return this.advanceAndMake(TokenKind.ASSIGN, char);
      case '+': return this.advanceAndMake(TokenKind.PLUS, char);
      case '-': return this.advanceAndMake(TokenKind.MINUS, char);
      case '*': return this.advanceAndMake(TokenKind.STAR, char);
      case '<': return this.advanceAndMake(TokenKind.LT_ANGLE, char);
      case '>': return this.advanceAndMake(TokenKind.GT_ANGLE, char);
      case ';': return this.advanceAndMake(TokenKind.SEMICOLON, char);
      case ':': return this.advanceAndMake(TokenKind.COLON, char);
      case ',': return this.advanceAndMake(TokenKind.COMMA, char);
      case '.': return this.advanceAndMake(TokenKind.DOT, char);
      case '?': return this.advanceAndMake(TokenKind.QUESTION, char);
      case '(': return this.advanceAndMake(TokenKind.LPAREN, char);
      case ')': return this.advanceAndMake(TokenKind.RPAREN, char);
      case '{': return this.advanceAndMake(TokenKind.LBRACE, char);
      case '}': return this.advanceAndMake(TokenKind.RBRACE, char);
      case '[': return this.advanceAndMake(TokenKind.LBRACKET, char);
      case ']': return this.advanceAndMake(TokenKind.RBRACKET, char);
      case '\n':
        this.advance();
        this.line++;
        this.column = 1;
        return null; // 忽略换行（或返回 NEWLINE 如需）
    }

    this.reportError(`Unexpected character: ${char}`);
    this.advance();
    return null;
  }

  // ==================== 读取方法 ====================

  private readIdentifierOrKeyword(): Token {
    const start = this.pos;
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      this.advance();
    }
    const value = this.source.slice(start, this.pos);
    const kind = this.keywordMap.get(value);
    if (kind) {
      return this.makeToken(kind, value);
    }
    return this.makeToken(TokenKind.IDENTIFIER, value);
  }

  private readNumber(): Token {
    const start = this.pos;
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // 消费 .
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    return this.makeToken(TokenKind.NUMBER, this.source.slice(start, this.pos));
  }

  private readString(): Token {
    const quote = this.peek();
    this.advance(); // 消费开始引号
    let value = '';

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          default: value += escaped;
        }
      } else {
        value += this.peek();
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.reportError('Unterminated string literal');
    } else {
      this.advance(); // 消费结束引号
    }

    return this.makeToken(TokenKind.STRING, value);
  }

  // ==================== 注释跳过 ====================

  private skipLineComment(): void {
    this.advance(); // /
    this.advance(); // /
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  private skipBlockComment(): void {
    this.advance(); // /
    this.advance(); // *
    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance();
        this.advance();
        break;
      }
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }
  }

  // ==================== 辅助方法 ====================

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === ' ' || c === '\t' || c === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private advance(): string {
    const char = this.source[this.pos];
    this.pos++;
    this.column++;
    return char;
  }

  private advanceBy(n: number, kind: TokenKind, value: string): Token {
    for (let i = 0; i < n; i++) this.advance();
    return this.makeToken(kind, value);
  }

  private advanceAndMake(kind: TokenKind, value: string): Token {
    this.advance();
    return this.makeToken(kind, value);
  }

  private makeToken(kind: TokenKind, value: string): Token {
    return { kind, value, line: this.line, column: this.column - value.length };
  }

  private peek(offset = 0): string {
    const pos = this.pos + offset;
    return pos < this.source.length ? this.source[pos] : '\0';
  }

  private peekNext(): string {
    return this.peek(1);
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z]/.test(c);
  }

  private isDigit(c: string): boolean {
    return /[0-9]/.test(c);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private reportError(message: string): void {
    this.errors.push({ message, line: this.line, column: this.column });
  }

  // ==================== 关键字映射 ====================

  private keywordMap = new Map<string, TokenKind>([
    ['let', TokenKind.LET],
    ['const', TokenKind.CONST],
    ['function', TokenKind.FUNCTION],
    ['interface', TokenKind.INTERFACE],
    ['return', TokenKind.RETURN],
    ['if', TokenKind.IF],
    ['else', TokenKind.ELSE],
    ['while', TokenKind.WHILE],
    ['for', TokenKind.FOR],

    ['true', TokenKind.BOOLEAN],
    ['false', TokenKind.BOOLEAN],
    ['null', TokenKind.NULL],
    // 类型关键字
    ['number', TokenKind.NUMBER_KW],
    ['string', TokenKind.STRING_KW],
    ['boolean', TokenKind.BOOLEAN_KW],
    ['void', TokenKind.VOID_KW],
    ['never', TokenKind.NEVER_KW],
    ['undefined', TokenKind.UNDEFINED_KW],
  ]);
}
