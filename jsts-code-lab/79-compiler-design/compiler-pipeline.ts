/**
 * @file 编译器流水线
 * @category Compiler → Pipeline
 * @difficulty hard
 * @tags compiler, lexer, parser, ast, code-generation
 */

// Token类型
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

// 词法分析器
export class Lexer {
  private position = 0;
  private line = 1;
  private column = 1;
  
  private keywords = new Set(['let', 'const', 'function', 'if', 'else', 'return', 'while', 'for']);
  
  constructor(private source: string) {}
  
  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.source.length) {
      this.skipWhitespace();
      
      if (this.position >= this.source.length) break;
      
      const char = this.source[this.position];
      
      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
      } else if (this.isAlpha(char)) {
        tokens.push(this.readIdentifier());
      } else if (char === '"' || char === "'") {
        tokens.push(this.readString());
      } else if (this.isOperator(char)) {
        tokens.push(this.readOperator());
      } else if (this.isPunctuation(char)) {
        tokens.push(this.readPunctuation());
      } else {
        this.advance();
      }
    }
    
    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
  
  private readNumber(): Token {
    const start = this.position;
    const startColumn = this.column;
    
    while (this.isDigit(this.peek()) || this.peek() === '.') {
      this.advance();
    }
    
    return {
      type: TokenType.NUMBER,
      value: this.source.slice(start, this.position),
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
    
    const start = this.position;
    
    while (this.peek() !== quote && this.position < this.source.length) {
      this.advance();
    }
    
    const value = this.source.slice(start, this.position);
    this.advance(); // 跳过结束引号
    
    return {
      type: TokenType.STRING,
      value,
      line: this.line,
      column: startColumn
    };
  }
  
  private readOperator(): Token {
    const startColumn = this.column;
    const operators = ['===', '!==', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '=>', '+', '-', '*', '/', '=', '<', '>', '!'];
    
    for (const op of operators) {
      if (this.source.slice(this.position, this.position + op.length) === op) {
        for (let i = 0; i < op.length; i++) this.advance();
        return {
          type: TokenType.OPERATOR,
          value: op,
          line: this.line,
          column: startColumn
        };
      }
    }
    
    this.advance();
    return { type: TokenType.OPERATOR, value: this.source[this.position - 1], line: this.line, column: startColumn };
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
  
  private skipWhitespace(): void {
    while (this.position < this.source.length && /\s/.test(this.source[this.position])) {
      if (this.source[this.position] === '\n') {
        this.line++;
        this.column = 1;
      }
      this.position++;
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

// AST节点类型
export interface ASTNode {
  type: string;
  [key: string]: any;
}

// 语法分析器（递归下降）
export class Parser {
  private position = 0;
  private tokens: Token[];
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  
  parse(): ASTNode {
    const statements: ASTNode[] = [];
    
    while (this.current().type !== TokenType.EOF) {
      statements.push(this.parseStatement());
    }
    
    return { type: 'Program', body: statements };
  }
  
  private parseStatement(): ASTNode {
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
  
  private parseVariableDeclaration(): ASTNode {
    const kind = this.consume(TokenType.KEYWORD).value;
    const id = this.consume(TokenType.IDENTIFIER).value;
    
    let init: ASTNode | null = null;
    if (this.match(TokenType.OPERATOR, '=')) {
      this.consume(TokenType.OPERATOR);
      init = this.parseExpression();
    }
    
    this.skipSemicolon();
    
    return { type: 'VariableDeclaration', kind, id, init };
  }
  
  private parseFunctionDeclaration(): ASTNode {
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
  
  private parseIfStatement(): ASTNode {
    this.consume(TokenType.KEYWORD); // if
    this.consume(TokenType.PUNCTUATION, '(');
    const test = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, ')');
    
    // 支持块语句或单行语句
    const consequent = this.match(TokenType.PUNCTUATION, '{') 
      ? this.parseBlock() 
      : this.parseExpressionStatement();
    
    let alternate: ASTNode | null = null;
    
    if (this.match(TokenType.KEYWORD, 'else')) {
      this.consume(TokenType.KEYWORD);
      if (this.match(TokenType.KEYWORD, 'if')) {
        alternate = this.parseIfStatement();
      } else {
        alternate = this.match(TokenType.PUNCTUATION, '{')
          ? this.parseBlock()
          : this.parseExpressionStatement();
      }
    }
    
    return { type: 'IfStatement', test, consequent, alternate };
  }
  
  private parseReturnStatement(): ASTNode {
    this.consume(TokenType.KEYWORD);
    const argument = this.match(TokenType.PUNCTUATION, ';') ? null : this.parseExpression();
    this.skipSemicolon();
    return { type: 'ReturnStatement', argument };
  }
  
  private parseExpressionStatement(): ASTNode {
    const expression = this.parseExpression();
    this.skipSemicolon();
    return { type: 'ExpressionStatement', expression };
  }
  
  private parseBlock(): ASTNode {
    this.consume(TokenType.PUNCTUATION, '{');
    const body: ASTNode[] = [];
    
    while (!this.match(TokenType.PUNCTUATION, '}')) {
      body.push(this.parseStatement());
    }
    
    this.consume(TokenType.PUNCTUATION, '}');
    return { type: 'BlockStatement', body };
  }
  
  private parseExpression(): ASTNode {
    return this.parseAssignment();
  }
  
  private parseAssignment(): ASTNode {
    const left = this.parseAdditive();
    
    if (this.match(TokenType.OPERATOR, '=')) {
      this.consume(TokenType.OPERATOR);
      const right = this.parseExpression();
      return { type: 'AssignmentExpression', operator: '=', left, right };
    }
    
    return left;
  }
  
  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();
    
    while (this.match(TokenType.OPERATOR, '+') || this.match(TokenType.OPERATOR, '-')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }
  
  private parseMultiplicative(): ASTNode {
    let left = this.parsePrimary();
    
    while (this.match(TokenType.OPERATOR, '*') || this.match(TokenType.OPERATOR, '/')) {
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = this.parsePrimary();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }
  
  private parsePrimary(): ASTNode {
    if (this.match(TokenType.NUMBER)) {
      return { type: 'Literal', value: Number(this.consume(TokenType.NUMBER).value) };
    }
    
    if (this.match(TokenType.STRING)) {
      return { type: 'Literal', value: this.consume(TokenType.STRING).value };
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
    
    throw new Error(`Unexpected token: ${this.current().value}`);
  }
  
  private parseCallExpression(callee: string): ASTNode {
    this.consume(TokenType.PUNCTUATION, '(');
    const args: ASTNode[] = [];
    
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
      throw new Error(`Expected ${type}${value ? ` (${value})` : ''}, got ${this.current().type}`);
    }
    return this.tokens[this.position++];
  }
  
  private skipSemicolon(): void {
    if (this.match(TokenType.PUNCTUATION, ';')) {
      this.consume(TokenType.PUNCTUATION);
    }
  }
}

// 代码生成器
export class CodeGenerator {
  generate(node: ASTNode): string {
    switch (node.type) {
      case 'Program':
        return node.body.map((s: ASTNode) => this.generate(s)).join('\n');
        
      case 'VariableDeclaration':
        return `${node.kind} ${node.id}${node.init ? ' = ' + this.generate(node.init) : ''};`;
        
      case 'FunctionDeclaration':
        return `function ${node.name}(${node.params.join(', ')}) ${this.generate(node.body)}`;
        
      case 'BlockStatement':
        return `{\n${node.body.map((s: ASTNode) => '  ' + this.generate(s)).join('\n')}\n}`;
        
      case 'IfStatement':
        let code = `if (${this.generate(node.test)}) ${this.generate(node.consequent)}`;
        if (node.alternate) {
          code += ` else ${this.generate(node.alternate)}`;
        }
        return code;
        
      case 'ReturnStatement':
        return `return${node.argument ? ' ' + this.generate(node.argument) : ''};`;
        
      case 'ExpressionStatement':
        return this.generate(node.expression) + ';';
        
      case 'BinaryExpression':
        return `${this.generate(node.left)} ${node.operator} ${this.generate(node.right)}`;
        
      case 'AssignmentExpression':
        return `${this.generate(node.left)} ${node.operator} ${this.generate(node.right)}`;
        
      case 'CallExpression':
        return `${node.callee}(${node.arguments.map((a: ASTNode) => this.generate(a)).join(', ')})`;
        
      case 'Identifier':
        return node.name;
        
      case 'Literal':
        return typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
        
      default:
        return '';
    }
  }
}

// 优化器
export class Optimizer {
  optimize(node: ASTNode): ASTNode {
    switch (node.type) {
      case 'Program':
        return {
          ...node,
          body: node.body.map((s: ASTNode) => this.optimize(s))
        };
        
      case 'BinaryExpression':
        const left = this.optimize(node.left);
        const right = this.optimize(node.right);
        
        // 常量折叠
        if (left.type === 'Literal' && right.type === 'Literal') {
          const result = this.evaluateBinary(node.operator, left.value, right.value);
          return { type: 'Literal', value: result };
        }
        
        return { ...node, left, right };
        
      default:
        return node;
    }
  }
  
  private evaluateBinary(operator: string, left: number, right: number): number {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: return 0;
    }
  }
}

export function demo(): void {
  console.log('=== 编译器设计 ===\n');
  
  // 示例代码
  const source = `
    let x = 10;
    let y = 20;
    let sum = x + y;
    
    function add(a, b) {
      return a + b;
    }
    
    let shouldAdd = true;
    if (shouldAdd) {
      add(sum, 5);
    }
  `;
  
  console.log('源代码:');
  console.log(source);
  
  // 词法分析
  console.log('\n--- 词法分析 ---');
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  console.log('Tokens:', tokens.slice(0, 10).map(t => `${t.type}(${t.value})`).join(', '), '...');
  
  // 语法分析
  console.log('\n--- 语法分析 ---');
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log('AST类型:', ast.type);
  console.log('语句数:', ast.body.length);
  
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
  
  // 简单表达式测试
  console.log('\n--- 表达式编译 ---');
  const exprSource = '2 + 3 * 4';
  const exprLexer = new Lexer(exprSource);
  const exprParser = new Parser(exprLexer.tokenize());
  const exprAST = exprParser.parse();
  
  console.log(`表达式: ${exprSource}`);
  console.log('生成的代码:', generator.generate(exprAST));
}
