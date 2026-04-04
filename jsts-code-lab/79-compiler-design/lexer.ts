/**
 * @file 词法分析器 (Lexer)
 * @category Compiler Design → Lexer
 * @difficulty hard
 * @tags compiler, lexer, tokenizer, lexical-analysis
 *
 * @description
 * 完整的词法分析器实现，将源代码转换为 Token 流。
 *
 * 支持特性：
 * - 多种 Token 类型：关键字、标识符、字面量、运算符、分隔符
 * - 字符串字面量：支持转义序列
 * - 数字字面量：整数、浮点数、科学计数法
 * - 注释处理：单行、多行注释
 * - 位置追踪：行号、列号
 * - 错误恢复：跳过无效字符，继续分析
 */

export enum TokenType {
  // 字面量
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',

  // 标识符和关键字
  IDENTIFIER = 'IDENTIFIER',
  KEYWORD = 'KEYWORD',

  // 运算符
  ASSIGN = 'ASSIGN',           // =
  PLUS = 'PLUS',               // +
  MINUS = 'MINUS',             // -
  MULTIPLY = 'MULTIPLY',       // *
  DIVIDE = 'DIVIDE',           // /
  MODULO = 'MODULO',           // %
  POWER = 'POWER',             // **

  // 比较运算符
  EQ = 'EQ',                   // ==
  NE = 'NE',                   // !=
  STRICT_EQ = 'STRICT_EQ',     // ===
  STRICT_NE = 'STRICT_NE',     // !==
  LT = 'LT',                   // <
  GT = 'GT',                   // >
  LE = 'LE',                   // <=
  GE = 'GE',                   // >=

  // 逻辑运算符
  AND = 'AND',                 // &&
  OR = 'OR',                   // ||
  NOT = 'NOT',                 // !

  // 位运算符
  BIT_AND = 'BIT_AND',         // &
  BIT_OR = 'BIT_OR',           // |
  BIT_XOR = 'BIT_XOR',         // ^
  BIT_NOT = 'BIT_NOT',         // ~
  SHIFT_LEFT = 'SHIFT_LEFT',   // <<
  SHIFT_RIGHT = 'SHIFT_RIGHT', // >>

  // 分隔符
  SEMICOLON = 'SEMICOLON',     // ;
  COMMA = 'COMMA',             // ,
  DOT = 'DOT',                 // .
  COLON = 'COLON',             // :
  QUESTION = 'QUESTION',       // ?

  // 括号
  LPAREN = 'LPAREN',           // (
  RPAREN = 'RPAREN',           // )
  LBRACE = 'LBRACE',           // {
  RBRACE = 'RBRACE',           // }
  LBRACKET = 'LBRACKET',       // [
  RBRACKET = 'RBRACKET',       // ]

  // 箭头
  ARROW = 'ARROW',             // =>

  // 模板字符串
  TEMPLATE_START = 'TEMPLATE_START', // ${
  TEMPLATE_END = 'TEMPLATE_END',     // }

  // 特殊
  NEWLINE = 'NEWLINE',
  WHITESPACE = 'WHITESPACE',
  EOF = 'EOF',
  INVALID = 'INVALID'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

export interface LexerError {
  message: string;
  line: number;
  column: number;
  character: string;
}

export class Lexer {
  private source: string;
  private position = 0;
  private line = 1;
  private column = 1;
  private errors: LexerError[] = [];

  // 关键字集合
  private keywords = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
    'new', 'of', 'return', 'super', 'switch', 'this', 'throw',
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'async', 'await', 'static', 'get', 'set', 'from', 'as'
  ]);

  constructor(source: string) {
    this.source = source;
  }

  /**
   * 执行词法分析
   */
  tokenize(): { tokens: Token[]; errors: LexerError[] } {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespace();

      if (this.isAtEnd()) break;

      const token = this.nextToken();
      if (token && token.type !== TokenType.WHITESPACE) {
        tokens.push(token);
      }
    }

    // 添加 EOF token
    tokens.push(this.createToken(TokenType.EOF, '', this.position, this.position));

    return { tokens, errors: this.errors };
  }

  /**
   * 获取下一个 Token
   */
  private nextToken(): Token | null {
    const start = this.position;
    const char = this.peek();

    // 标识符或关键字
    if (this.isAlpha(char) || char === '_' || char === '$') {
      return this.readIdentifier();
    }

    // 数字
    if (this.isDigit(char) || (char === '.' && this.isDigit(this.peekNext()))) {
      return this.readNumber();
    }

    // 字符串
    if (char === '"' || char === "'") {
      return this.readString();
    }

    // 模板字符串
    if (char === '`') {
      return this.readTemplateString();
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
    }

    // 双字符运算符
    const twoChar = char + this.peekNext();
    const twoCharToken = this.getTwoCharToken(twoChar, start);
    if (twoCharToken) {
      this.advance();
      this.advance();
      return twoCharToken;
    }

    // 单字符 Token
    const token = this.getSingleCharToken(char, start);
    if (token) {
      this.advance();
      return token;
    }

    // 无效字符
    this.error(`Unexpected character: ${char}`);
    this.advance();
    return this.createToken(TokenType.INVALID, char, start, this.position);
  }

  /**
   * 读取标识符
   */
  private readIdentifier(): Token {
    const start = this.position;
    
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '$') {
      this.advance();
    }

    const value = this.source.substring(start, this.position);
    
    // 检查是否为关键字
    if (this.keywords.has(value)) {
      // 检查是否为布尔值或 null
      if (value === 'true' || value === 'false') {
        return this.createToken(TokenType.BOOLEAN, value, start, this.position);
      }
      if (value === 'null') {
        return this.createToken(TokenType.NULL, value, start, this.position);
      }
      return this.createToken(TokenType.KEYWORD, value, start, this.position);
    }

    return this.createToken(TokenType.IDENTIFIER, value, start, this.position);
  }

  /**
   * 读取数字
   */
  private readNumber(): Token {
    const start = this.position;
    let hasDot = false;
    let hasExp = false;

    // 整数部分
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // 小数部分
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      hasDot = true;
      this.advance(); // 消费 .
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    // 指数部分
    if (this.peek() === 'e' || this.peek() === 'E') {
      hasExp = true;
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = this.source.substring(start, this.position);
    return this.createToken(TokenType.NUMBER, value, start, this.position);
  }

  /**
   * 读取字符串
   */
  private readString(): Token {
    const start = this.position;
    const quote = this.peek(); // " 或 '
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
          case '0': value += '\0'; break;
          case 'b': value += '\b'; break;
          case 'f': value += '\f'; break;
          case 'v': value += '\v'; break;
          case 'u':
            // Unicode 转义
            this.advance();
            const code = this.source.substring(this.position, this.position + 4);
            if (/^[0-9a-fA-F]{4}$/.test(code)) {
              value += String.fromCharCode(parseInt(code, 16));
              this.position += 3;
              this.column += 3;
            } else {
              value += '\\u' + code;
            }
            break;
          default:
            value += escaped;
        }
      } else {
        value += this.peek();
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.error('Unterminated string');
    } else {
      this.advance(); // 消费结束引号
    }

    return this.createToken(TokenType.STRING, value, start, this.position);
  }

  /**
   * 读取模板字符串（简化版）
   */
  private readTemplateString(): Token {
    const start = this.position;
    this.advance(); // 消费 `

    let value = '';

    while (!this.isAtEnd() && this.peek() !== '`') {
      if (this.peek() === '$' && this.peekNext() === '{') {
        // 模板表达式开始
        break;
      }

      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          default: value += escaped;
        }
      } else {
        value += this.peek();
      }
      this.advance();
    }

    return this.createToken(TokenType.STRING, value, start, this.position);
  }

  /**
   * 获取单字符 Token
   */
  private getSingleCharToken(char: string, start: number): Token | null {
    const tokenMap: Record<string, TokenType> = {
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '%': TokenType.MODULO,
      '=': TokenType.ASSIGN,
      '<': TokenType.LT,
      '>': TokenType.GT,
      '!': TokenType.NOT,
      '&': TokenType.BIT_AND,
      '|': TokenType.BIT_OR,
      '^': TokenType.BIT_XOR,
      '~': TokenType.BIT_NOT,
      ';': TokenType.SEMICOLON,
      ',': TokenType.COMMA,
      '.': TokenType.DOT,
      ':': TokenType.COLON,
      '?': TokenType.QUESTION,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      '\n': TokenType.NEWLINE
    };

    const type = tokenMap[char];
    if (type) {
      return this.createToken(type, char, start, start + 1);
    }

    return null;
  }

  /**
   * 获取双字符 Token
   */
  private getTwoCharToken(chars: string, start: number): Token | null {
    const tokenMap: Record<string, TokenType> = {
      '**': TokenType.POWER,
      '++': TokenType.PLUS,
      '--': TokenType.MINUS,
      '==': TokenType.EQ,
      '!=': TokenType.NE,
      '===': TokenType.STRICT_EQ,
      '!==': TokenType.STRICT_NE,
      '<=': TokenType.LE,
      '>=': TokenType.GE,
      '&&': TokenType.AND,
      '||': TokenType.OR,
      '<<': TokenType.SHIFT_LEFT,
      '>>': TokenType.SHIFT_RIGHT,
      '=>': TokenType.ARROW,
      '+=': TokenType.ASSIGN,
      '-=': TokenType.ASSIGN,
      '*=': TokenType.ASSIGN,
      '/=': TokenType.ASSIGN,
      '%=': TokenType.ASSIGN,
      '${': TokenType.TEMPLATE_START
    };

    const type = tokenMap[chars];
    if (type) {
      return this.createToken(type, chars, start, start + 2);
    }

    // 三字符运算符
    const threeChars = chars + this.peek(2);
    if (threeChars === '===' || threeChars === '!==') {
      return this.createToken(
        threeChars === '===' ? TokenType.STRICT_EQ : TokenType.STRICT_NE,
        threeChars,
        start,
        start + 3
      );
    }

    return null;
  }

  /**
   * 跳过空白字符
   */
  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  /**
   * 跳过单行注释
   */
  private skipLineComment(): void {
    this.advance(); // /
    this.advance(); // /

    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  /**
   * 跳过多行注释
   */
  private skipBlockComment(): void {
    this.advance(); // /
    this.advance(); // *

    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance();
        this.advance();
        break;
      }
      this.advance();
    }
  }

  /**
   * 前进一个字符
   */
  private advance(): string {
    const char = this.peek();
    this.position++;
    
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  /**
   * 查看当前字符
   */
  private peek(offset = 0): string {
    const pos = this.position + offset;
    if (pos >= this.source.length) return '\0';
    return this.source[pos];
  }

  /**
   * 查看下一个字符
   */
  private peekNext(): string {
    return this.peek(1);
  }

  /**
   * 检查是否结束
   */
  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  /**
   * 创建 Token
   */
  private createToken(type: TokenType, value: string, start: number, end: number): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - (end - start),
      start,
      end
    };
  }

  /**
   * 记录错误
   */
  private error(message: string): void {
    this.errors.push({
      message,
      line: this.line,
      column: this.column,
      character: this.peek()
    });
  }

  /**
   * 字符类型检查
   */
  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}

// ==================== Token 格式化工具 ====================

export class TokenFormatter {
  /**
   * 格式化 Token 列表为表格
   */
  static format(tokens: Token[]): string {
    const lines = [
      '┌──────────────┬─────────────────────────┬──────┬────────┐',
      '│ Type         │ Value                   │ Line │ Column │',
      '├──────────────┼─────────────────────────┼──────┼────────┤'
    ];

    for (const token of tokens) {
      if (token.type === TokenType.EOF) break;
      
      const type = token.type.padEnd(12);
      const value = this.truncate(token.value, 23).padEnd(23);
      const line = String(token.line).padStart(4);
      const col = String(token.column).padStart(6);
      
      lines.push(`│ ${type} │ ${value} │ ${line} │ ${col} │`);
    }

    lines.push('└──────────────┴─────────────────────────┴──────┴────────┘');
    return lines.join('\n');
  }

  private static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 词法分析器 (Lexer) ===\n');

  const source = `
// Calculate fibonacci
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
const message = "Result: " + result;
const pi = 3.14159;
const scientific = 1.5e-10;

if (result >= 55 && result !== null) {
  console.log(message);
}
`;

  console.log('源代码:');
  console.log(source);
  console.log('\n--- Token 列表 ---\n');

  const lexer = new Lexer(source);
  const { tokens, errors } = lexer.tokenize();

  console.log(TokenFormatter.format(tokens));

  if (errors.length > 0) {
    console.log('\n--- 错误 ---');
    for (const error of errors) {
      console.log(`Line ${error.line}, Column ${error.column}: ${error.message}`);
    }
  }

  // Token 统计
  console.log('\n--- Token 统计 ---');
  const stats = new Map<string, number>();
  for (const token of tokens) {
    if (token.type === TokenType.EOF) continue;
    stats.set(token.type, (stats.get(token.type) || 0) + 1);
  }

  for (const [type, count] of stats.entries()) {
    console.log(`  ${type}: ${count}`);
  }
}
