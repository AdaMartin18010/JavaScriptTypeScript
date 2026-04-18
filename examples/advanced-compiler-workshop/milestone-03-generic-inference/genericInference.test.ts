/**
 * @file 泛型推断测试
 * @category Advanced Compiler Workshop → Milestone 3 → Tests
 */

import { describe, it, expect } from 'vitest';
import { GenericSolver, type Substitution } from './src/genericSolver.js';
import {
  tNumber,
  tString,
  tBoolean,
  tArray,
  tFunction,
  tGeneric,
  tObject,
  typeToString,
} from '../milestone-02-type-checker-basics/src/types.js';
import type { FunctionType, Type } from '../milestone-02-type-checker-basics/src/types.js';
import { ExtendedTypeChecker } from './src/extendedTypeChecker.js';
import { Lexer } from '../milestone-01-mini-parser/src/lexer.js';
import { Parser } from '../milestone-01-mini-parser/src/parser.js';

function parse(source: string) {
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

function parseAndCheck(source: string): ExtendedTypeChecker {
  const ast = parse(source);
  const checker = new ExtendedTypeChecker();
  checker.check(ast);
  return checker;
}

describe('GenericSolver - Unit', () => {
  const solver = new GenericSolver();

  it('infers simple generic parameter', () => {
    const func = tFunction([{ name: 'x', type: tGeneric('T') }], tGeneric('T'), ['T']);
    const subst = solver.inferTypeArguments(func, [tNumber]);
    expect(subst.get('T')).toBeDefined();
    expect(typeToString(subst.get('T')!)).toBe('number');
  });

  it('infers generic parameter from string argument', () => {
    const func = tFunction([{ name: 'x', type: tGeneric('T') }], tGeneric('T'), ['T']);
    const subst = solver.inferTypeArguments(func, [tString]);
    expect(typeToString(subst.get('T')!)).toBe('string');
  });

  it('infers from array type', () => {
    const func = tFunction([{ name: 'arr', type: tArray(tGeneric('T')) }], tGeneric('T'), ['T']);
    const subst = solver.inferTypeArguments(func, [tArray(tNumber)]);
    expect(typeToString(subst.get('T')!)).toBe('number');
  });

  it('infers from object property', () => {
    const func = tFunction(
      [{ name: 'obj', type: tObject({ value: tGeneric('T') }) }],
      tGeneric('T'),
      ['T']
    );
    const subst = solver.inferTypeArguments(func, [tObject({ value: tString })]);
    expect(typeToString(subst.get('T')!)).toBe('string');
  });

  it('infers multiple type parameters', () => {
    const func = tFunction(
      [
        { name: 'a', type: tGeneric('T') },
        { name: 'b', type: tGeneric('U') },
      ],
      tGeneric('U'),
      ['T', 'U']
    );
    const subst = solver.inferTypeArguments(func, [tNumber, tString]);
    expect(typeToString(subst.get('T')!)).toBe('number');
    expect(typeToString(subst.get('U')!)).toBe('string');
  });

  it('infers nested generic type', () => {
    // function wrap<T>(x: T): Array<T>
    const func = tFunction(
      [{ name: 'x', type: tGeneric('T') }],
      tArray(tGeneric('T')),
      ['T']
    );
    const subst = solver.inferTypeArguments(func, [tBoolean]);
    const returnType = solver.applySubstitution(func.returnType, subst);
    expect(typeToString(returnType)).toBe('boolean[]');
  });

  it('throws on unification failure', () => {
    // function foo<T>(x: T, y: T): T
    const func = tFunction(
      [
        { name: 'x', type: tGeneric('T') },
        { name: 'y', type: tGeneric('T') },
      ],
      tGeneric('T'),
      ['T']
    );
    // number 和 string 不能统一为同一个 T
    expect(() => solver.inferTypeArguments(func, [tNumber, tString])).toThrow();
  });

  it('applies substitution to function type', () => {
    const func = tFunction(
      [{ name: 'x', type: tGeneric('T') }],
      tArray(tGeneric('T')),
      ['T']
    );
    const subst: Substitution = new Map([['T', tNumber]]);
    const applied = solver.applySubstitution(func, subst);
    expect(typeToString(applied)).toBe('(x: number) => number[]');
  });

  it('applies substitution to object type', () => {
    const type = tObject({ data: tGeneric('T'), count: tNumber });
    const subst: Substitution = new Map([['T', tString]]);
    const applied = solver.applySubstitution(type, subst);
    expect(typeToString(applied)).toBe('{ data: string; count: number }');
  });

  it('performs occurs check', () => {
    // T = Array<T> 应该失败
    const subst: Substitution = new Map();
    expect(() =>
      solver.unify(tGeneric('T'), tArray(tGeneric('T')), subst)
    ).toThrow('Occurs check failed');
  });
});

describe('ExtendedTypeChecker - Integration', () => {
  it('checks generic identity function with number', () => {
    const checker = parseAndCheck('function identity<T>(x: T): T { return x; }');
    const env = checker.getEnvironment();
    const fnType = env.lookup('identity')!;
    expect(fnType.kind).toBe('function');
    expect(typeToString(fnType)).toBe('<T>(x: T) => T');
  });

  it('infers generic call with literal argument', () => {
    expect(() =>
      parseAndCheck(`
        function identity<T>(x: T): T { return x; }
        let n = identity(42);
      `)
    ).not.toThrow();
  });

  it('infers generic call with string argument', () => {
    const checker = parseAndCheck(`
      function identity<T>(x: T): T { return x; }
      let s = identity("hello");
    `);
    // identity("hello") 推断 T = string，返回 string
    // s 的类型由返回值推断为 string
    expect(typeToString(checker.getEnvironment().lookup('s')!)).toBe('string');
  });

  it('infers array generic function', () => {
    const checker = parseAndCheck(`
      function first<T>(arr: T[]): T { return arr; }
      let n = first([1, 2, 3]);
    `);
    // 简化版中 arr 的类型通过泛型推断
    expect(checker.getEnvironment().lookup('n')).toBeDefined();
  });

  it('uses explicit type argument', () => {
    expect(() =>
      parseAndCheck(`
        function identity<T>(x: T): T { return x; }
        let n = identity<number>(42);
      `)
    ).not.toThrow();
  });

  it('detects constraint violation (simplified)', () => {
    // 在简化模型中，约束检查通过泛型参数的 extends 实现
    // 这里测试当显式类型参数与实参不匹配时的情况
    expect(() =>
      parseAndCheck(`
        function identity<T>(x: T): T { return x; }
        let n = identity<string>(42);
      `)
    ).toThrow(); // 42 (number) 不可赋值给 string 参数
  });

  it('infers from multiple arguments', () => {
    const checker = parseAndCheck(`
      function pair<T, U>(a: T, b: U): { first: T; second: U } {
        return { first: a, second: b };
      }
      let p = pair(1, "hello");
    `);
    expect(checker.getEnvironment().lookup('p')).toBeDefined();
  });

  it('infers nested generic call', () => {
    expect(() =>
      parseAndCheck(`
        function wrap<T>(x: T): T[] { return [x]; }
        function unwrap<T>(arr: T[]): T { return arr; }
        let w = wrap(42);
        let u = unwrap(w);
      `)
    ).not.toThrow();
  });
});
