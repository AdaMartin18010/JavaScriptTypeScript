/**
 * @file 词法分析器测试
 * @category Advanced Compiler Workshop → Milestone 1 → Tests
 */

import { describe, it, expect } from 'vitest';
import { Lexer, TokenKind } from './src/lexer.js';

describe('Lexer', () => {
  it('tokenizes empty source', () => {
    const lexer = new Lexer('');
    const { tokens, errors } = lexer.tokenize();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].kind).toBe(TokenKind.EOF);
    expect(errors).toHaveLength(0);
  });

  it('tokenizes variable declaration with type annotation', () => {
    const lexer = new Lexer('let x: number = 42;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toEqual([
      TokenKind.LET,
      TokenKind.IDENTIFIER,
      TokenKind.COLON,
      TokenKind.NUMBER_KW,
      TokenKind.ASSIGN,
      TokenKind.NUMBER,
      TokenKind.SEMICOLON,
      TokenKind.EOF,
    ]);
  });

  it('tokenizes string literal', () => {
    const lexer = new Lexer('let msg: string = "hello";');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const stringToken = tokens.find((t) => t.kind === TokenKind.STRING);
    expect(stringToken).toBeDefined();
    expect(stringToken!.value).toBe('hello');
  });

  it('tokenizes boolean literals', () => {
    const lexer = new Lexer('let a = true; let b = false;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const boolTokens = tokens.filter((t) => t.kind === TokenKind.BOOLEAN);
    expect(boolTokens).toHaveLength(2);
    expect(boolTokens[0].value).toBe('true');
    expect(boolTokens[1].value).toBe('false');
  });

  it('tokenizes null literal', () => {
    const lexer = new Lexer('let n = null;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);
    expect(tokens.some((t) => t.kind === TokenKind.NULL)).toBe(true);
  });

  it('tokenizes function declaration', () => {
    const lexer = new Lexer('function add(a: number, b: number): number { return a + b; }');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toContain(TokenKind.FUNCTION);
    expect(kinds).toContain(TokenKind.RETURN);
    expect(kinds.filter((k) => k === TokenKind.NUMBER_KW)).toHaveLength(3);
  });

  it('tokenizes interface declaration', () => {
    const lexer = new Lexer('interface Point { x: number; y: number; }');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    expect(tokens.some((t) => t.kind === TokenKind.INTERFACE)).toBe(true);
    expect(tokens.some((t) => t.value === 'Point')).toBe(true);
  });

  it('tokenizes comparison operators', () => {
    const lexer = new Lexer('a === b; c !== d; e <= f; g >= h;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const ops = tokens.filter((t) =>
      [TokenKind.STRICT_EQ, TokenKind.STRICT_NE, TokenKind.LE, TokenKind.GE].includes(t.kind)
    );
    expect(ops).toHaveLength(4);
  });

  it('skips single-line comments', () => {
    const lexer = new Lexer('let x = 1; // this is a comment\nlet y = 2;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const identifiers = tokens.filter((t) => t.kind === TokenKind.IDENTIFIER);
    expect(identifiers.map((t) => t.value)).toEqual(['x', 'y']);
  });

  it('skips block comments', () => {
    const lexer = new Lexer('let x = 1; /* block \n comment */ let y = 2;');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);

    const identifiers = tokens.filter((t) => t.kind === TokenKind.IDENTIFIER);
    expect(identifiers.map((t) => t.value)).toEqual(['x', 'y']);
  });

  it('reports error on unexpected character', () => {
    const lexer = new Lexer('let x = @;');
    const { errors } = lexer.tokenize();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Unexpected character');
  });
});
