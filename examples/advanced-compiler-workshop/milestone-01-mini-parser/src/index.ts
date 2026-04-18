/**
 * @file Milestone 1 入口
 * @category Advanced Compiler Workshop → Milestone 1
 */

export { Lexer, TokenKind, type Token } from './lexer.js';
export { Parser, type ParserError } from './parser.js';
export * from './ast.js';

/**
 * 便捷函数：从源代码直接解析为 AST
 */
export function parse(source: string) {
  const { Lexer } = await import('./lexer.js');
  const { Parser } = await import('./parser.js');
  const lexer = new Lexer(source);
  const { tokens, errors: lexerErrors } = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return { ast, lexerErrors, parserErrors: parser.getErrors() };
}
