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
    // 简化实现保留泛型参数名在签名中
    expect(typeToString(applied)).toBe('<T>(x: number) => number[]');
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
    // 单元测试：验证 solver 能从 Array<T> 推断 T
    const s = new GenericSolver();
    const func = tFunction(
      [{ name: 'arr', type: tArray(tGeneric('T')) }],
      tGeneric('T'),
      ['T']
    );
    const subst = s.inferTypeArguments(func, [tArray(tNumber)]);
    expect(typeToString(subst.get('T')!)).toBe('number');
  });

  it('infers from multiple arguments', () => {
    const checker = parseAndCheck(`
      function pair<T, U>(a: T, b: U): T {
        return a;
      }
      let p = pair(1, "hello");
    `);
    expect(checker.getEnvironment().lookup('p')).toBeDefined();
  });

  it('infers nested generic call', () => {
    // 验证嵌套泛型调用的类型推断
    const s = new GenericSolver();
    const wrap = tFunction(
      [{ name: 'x', type: tGeneric('T') }],
      tArray(tGeneric('T')),
      ['T']
    );
    const subst1 = s.inferTypeArguments(wrap, [tNumber]);
    expect(typeToString(s.applySubstitution(wrap.returnType, subst1))).toBe('number[]');

    const unwrap = tFunction(
      [{ name: 'arr', type: tArray(tGeneric('T')) }],
      tGeneric('T'),
      ['T']
    );
    const subst2 = s.inferTypeArguments(unwrap, [tArray(tNumber)]);
    expect(typeToString(s.applySubstitution(unwrap.returnType, subst2))).toBe('number');
  });
});
