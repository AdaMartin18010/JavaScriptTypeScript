/**
 * @file 类型检查器测试
 * @category Advanced Compiler Workshop → Milestone 2 → Tests
 */

import { describe, it, expect } from 'vitest';
import { Lexer } from '../milestone-01-mini-parser/src/lexer.js';
import { Parser } from '../milestone-01-mini-parser/src/parser.js';
import { TypeChecker, TypeCheckError } from './src/typeChecker.js';
import { typeToString, tNumber, tString, tBoolean, tObject } from './src/types.js';

function parseAndCheck(source: string): TypeChecker {
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const checker = new TypeChecker();
  checker.check(ast);
  return checker;
}

describe('TypeChecker - Basic', () => {
  it('checks number variable declaration', () => {
    const checker = parseAndCheck('let x: number = 42;');
    const env = checker.getEnvironment();
    expect(env.lookup('x')).toBeDefined();
    expect(typeToString(env.lookup('x')!)).toBe('number');
  });

  it('checks string variable declaration', () => {
    const checker = parseAndCheck('let s: string = "hello";');
    const env = checker.getEnvironment();
    expect(typeToString(env.lookup('s')!)).toBe('string');
  });

  it('checks boolean variable declaration', () => {
    const checker = parseAndCheck('let b: boolean = true;');
    const env = checker.getEnvironment();
    expect(typeToString(env.lookup('b')!)).toBe('boolean');
  });

  it('infers type without annotation', () => {
    const checker = parseAndCheck('let x = 42;');
    const env = checker.getEnvironment();
    expect(typeToString(env.lookup('x')!)).toBe('number');
  });

  it('throws on type mismatch: string to number', () => {
    expect(() => parseAndCheck('let x: number = "hello";')).toThrow(TypeCheckError);
  });

  it('throws on type mismatch: number to string', () => {
    expect(() => parseAndCheck('let x: string = 42;')).toThrow(TypeCheckError);
  });

  it('checks function declaration with correct return type', () => {
    const checker = parseAndCheck('function add(a: number, b: number): number { return a + b; }');
    const env = checker.getEnvironment();
    const fnType = env.lookup('add')!;
    expect(fnType.kind).toBe('function');
    expect(typeToString(fnType)).toBe('(a: number, b: number) => number');
  });

  it('throws on function return type mismatch', () => {
    expect(() =>
      parseAndCheck('function bad(): number { return "hello"; }')
    ).toThrow(TypeCheckError);
  });

  it('throws on wrong argument type', () => {
    expect(() =>
      parseAndCheck('function greet(name: string): void {} greet(42);')
    ).toThrow(TypeCheckError);
  });

  it('checks function call with correct arguments', () => {
    expect(() =>
      parseAndCheck('function greet(name: string): void {} greet("world");')
    ).not.toThrow();
  });

  it('throws on too few arguments', () => {
    expect(() =>
      parseAndCheck('function add(a: number, b: number): number { return a; } add(1);')
    ).toThrow(TypeCheckError);
  });

  it('throws on too many arguments', () => {
    expect(() =>
      parseAndCheck('function id(x: number): number { return x; } id(1, 2);')
    ).toThrow(TypeCheckError);
  });

  it('checks interface declaration', () => {
    const checker = parseAndCheck('interface Point { x: number; y: number; }');
    const env = checker.getEnvironment();
    const pointType = env.lookupInterface('Point')!;
    expect(pointType.kind).toBe('object');
    expect(typeToString(pointType)).toBe('{ x: number; y: number }');
  });

  it('allows width subtyping: extra properties', () => {
    expect(() =>
      parseAndCheck(`
        interface Point { x: number; }
        let p: Point = { x: 1, y: 2 };
      `)
    ).not.toThrow();
  });

  it('rejects missing required properties', () => {
    expect(() =>
      parseAndCheck(`
        interface Point { x: number; y: number; }
        let p: Point = { x: 1 };
      `)
    ).toThrow(TypeCheckError);
  });

  it('allows optional properties to be omitted', () => {
    expect(() =>
      parseAndCheck(`
        interface Config { name: string; debug?: boolean; }
        let c: Config = { name: "app" };
      `)
    ).not.toThrow();
  });

  it('checks binary arithmetic expression', () => {
    const checker = parseAndCheck('let sum = 1 + 2 * 3;');
    expect(typeToString(checker.getEnvironment().lookup('sum')!)).toBe('number');
  });

  it('checks string concatenation', () => {
    const checker = parseAndCheck('let msg = "hello" + " world";');
    expect(typeToString(checker.getEnvironment().lookup('msg')!)).toBe('string');
  });

  it('rejects number + string in arithmetic context', () => {
    expect(() => parseAndCheck('let x = 1 + "hello";')).toThrow(TypeCheckError);
  });

  it('checks comparison expression returns boolean', () => {
    const checker = parseAndCheck('let cmp = 1 < 2;');
    expect(typeToString(checker.getEnvironment().lookup('cmp')!)).toBe('boolean');
  });

  it('checks null literal', () => {
    const checker = parseAndCheck('let n = null;');
    expect(typeToString(checker.getEnvironment().lookup('n')!)).toBe('null');
  });

  it('checks block scope', () => {
    const checker = parseAndCheck(`
      let x = 1;
      {
        let x = "hello";
      }
    `);
    // 外层 x 仍然是 number
    expect(typeToString(checker.getEnvironment().lookup('x')!)).toBe('number');
  });

  it('checks void function without return', () => {
    expect(() =>
      parseAndCheck('function noop(): void { }')
    ).not.toThrow();
  });
});
