/**
 * @file 条件类型测试
 * @category Advanced Compiler Workshop → Milestone 4 → Tests
 */

import { describe, it, expect } from 'vitest';
import { TypeEvaluator } from './src/conditionalTypes.js';
import {
  tNumber,
  tString,
  tBoolean,
  tNever,
  tVoid,
  tArray,
  tFunction,
  tObject,
  tUnion,
  tGeneric,
  typeToString,
} from '../milestone-02-type-checker-basics/src/types.js';

describe('TypeEvaluator - Conditional Types', () => {
  const ev = new TypeEvaluator();

  it('evaluates simple conditional: number extends string ? never : number', () => {
    const result = ev.evaluateConditional(tNumber, tString, tNever, tNumber);
    expect(typeToString(result)).toBe('number');
  });

  it('evaluates simple conditional: number extends number ? string : never', () => {
    const result = ev.evaluateConditional(tNumber, tNumber, tString, tNever);
    expect(typeToString(result)).toBe('string');
  });

  it('evaluates conditional with union (distributive)', () => {
    // (number | string) extends number ? never : string
    // 分发后：number extends number ? never : string → never
    //         string extends number ? never : string → string
    // 结果：string
    const union = tUnion(tNumber, tString);
    const result = ev.evaluateConditional(union, tNumber, tNever, tString);
    expect(typeToString(result)).toBe('string');
  });

  it('evaluates conditional with object subtype', () => {
    const sub = tObject({ x: tNumber, y: tNumber });
    const sup = tObject({ x: tNumber });
    const result = ev.evaluateConditional(sub, sup, tString, tNever);
    expect(typeToString(result)).toBe('string');
  });

  it('evaluates conditional with non-matching object', () => {
    const obj = tObject({ x: tNumber });
    const required = tObject({ x: tNumber, y: tNumber });
    const result = ev.evaluateConditional(obj, required, tString, tBoolean);
    expect(typeToString(result)).toBe('boolean');
  });
});

describe('TypeEvaluator - infer Pattern Matching', () => {
  const ev = new TypeEvaluator();

  it('infers element type from Array<number>', () => {
    const type = tArray(tNumber);
    const pattern = tArray(tGeneric('U'));
    const match = ev.matchPattern(type, pattern);
    expect(match.matched).toBe(true);
    expect(match.bindings.has('U')).toBe(true);
    expect(typeToString(match.bindings.get('U')!)).toBe('number');
  });

  it('infers nested type from Array<Array<string>>', () => {
    const type = tArray(tArray(tString));
    const pattern = tArray(tGeneric('U'));
    const match = ev.matchPattern(type, pattern);
    expect(match.matched).toBe(true);
    expect(typeToString(match.bindings.get('U')!)).toBe('string[]');
  });

  it('infers from object pattern', () => {
    const type = tObject({ data: tNumber, meta: tString });
    const pattern = tObject({ data: tGeneric('T') });
    const match = ev.matchPattern(type, pattern);
    expect(match.matched).toBe(true);
    expect(typeToString(match.bindings.get('T')!)).toBe('number');
  });

  it('fails to match incompatible types', () => {
    const type = tNumber;
    const pattern = tArray(tGeneric('U'));
    const match = ev.matchPattern(type, pattern);
    expect(match.matched).toBe(false);
  });

  it('evaluates conditional with infer: Array<number> extends Array<infer U> ? U : never', () => {
    const result = ev.evaluateConditional(
      tArray(tNumber),
      tArray(tGeneric('U')),
      tGeneric('U'),
      tNever,
      ['U']
    );
    expect(typeToString(result)).toBe('number');
  });

  it('evaluates conditional with infer fallback', () => {
    // string extends Array<infer U> ? U : never
    const result = ev.evaluateConditional(
      tString,
      tArray(tGeneric('U')),
      tGeneric('U'),
      tNever,
      ['U']
    );
    expect(typeToString(result)).toBe('never');
  });
});

describe('TypeEvaluator - Mapped Types', () => {
  const ev = new TypeEvaluator();

  it('evaluates mapped type: all properties to string', () => {
    const source = tObject({ x: tNumber, y: tBoolean });
    const result = ev.evaluateMappedType(source, (_key, _value) => tString);
    expect(typeToString(result)).toBe('{ x: string; y: string }');
  });

  it('evaluates mapped type: wrap in array', () => {
    const source = tObject({ a: tNumber });
    const result = ev.evaluateMappedType(source, (_key, value) => tArray(value));
    expect(typeToString(result)).toBe('{ a: number[] }');
  });
});

describe('TypeEvaluator - Utility Types', () => {
  const ev = new TypeEvaluator();

  it('Exclude removes matching type', () => {
    const union = tUnion(tNumber, tString, tBoolean);
    const result = ev.exclude(union, tString);
    expect(typeToString(result)).toBe('number | boolean');
  });

  it('Exclude all members results in never', () => {
    const union = tUnion(tNumber, tString);
    const result = ev.exclude(union, tUnion(tNumber, tString));
    expect(typeToString(result)).toBe('never');
  });

  it('Extract keeps matching types', () => {
    const union = tUnion(tNumber, tString, tBoolean);
    const result = ev.extract(union, tUnion(tNumber, tBoolean));
    expect(typeToString(result)).toBe('number | boolean');
  });

  it('Extract no match results in never', () => {
    const union = tUnion(tNumber, tString);
    const result = ev.extract(union, tBoolean);
    expect(typeToString(result)).toBe('never');
  });

  it('ReturnType extracts function return type', () => {
    const fn = tFunction([{ name: 'x', type: tNumber }], tString);
    const result = ev.returnType(fn);
    expect(typeToString(result)).toBe('string');
  });

  it('ReturnType on non-function returns never', () => {
    const result = ev.returnType(tNumber);
    expect(typeToString(result)).toBe('never');
  });

  it('Parameters extracts function parameters', () => {
    const fn = tFunction([
      { name: 'a', type: tNumber },
      { name: 'b', type: tString },
    ], tVoid);
    const result = ev.parameters(fn);
    expect(typeToString(result)).toBe('{ 0: number; 1: string }');
  });

  it('Awaited unwraps array wrapper (Promise simulation)', () => {
    const wrapped = tArray(tArray(tNumber));
    const result = ev.awaited(wrapped);
    expect(typeToString(result)).toBe('number');
  });

  it('Awaited on non-promise returns itself', () => {
    const result = ev.awaited(tString);
    expect(typeToString(result)).toBe('string');
  });

  it('Partial makes all properties optional', () => {
    const obj = tObject({ x: tNumber, y: tString });
    const result = ev.partial(obj);
    expect(typeToString(result)).toBe('{ x?: number; y?: string }');
  });

  it('Required makes all properties required', () => {
    const obj = tObject({ x: tNumber }, ['x']);
    const result = ev.required(obj);
    expect(typeToString(result)).toBe('{ x: number }');
  });

  it('Record creates object from keys', () => {
    const keys = tUnion(tString, tNumber); // 简化：用 primitive 表示键
    const result = ev.record(keys, tBoolean);
    // 简化实现中返回 { string: boolean; number: boolean }
    expect(result.kind).toBe('object');
  });
});

describe('TypeEvaluator - Complex Scenarios', () => {
  const ev = new TypeEvaluator();

  it('simulates ReturnType with infer', () => {
    // ReturnType<F> = F extends (...args: any[]) => infer R ? R : never
    const fn = tFunction([{ name: 'x', type: tNumber }], tString);
    const pattern = tFunction([{ name: 'args', type: tGeneric('Args') }], tGeneric('R'));
    // 模式匹配函数类型
    const match = ev.matchPattern(fn, pattern);
    expect(match.matched).toBe(true);
    expect(typeToString(match.bindings.get('R')!)).toBe('string');
  });

  it('simulates Parameters with infer', () => {
    const fn = tFunction([
      { name: 'a', type: tNumber },
      { name: 'b', type: tString },
    ], tVoid);
    // 在当前简化模型中，Parameters 直接返回参数对象
    const result = ev.parameters(fn);
    expect(result.kind).toBe('object');
  });

  it('handles deeply nested conditional types', () => {
    // T extends Array<infer U> ? (U extends string ? number : boolean) : never
    const type = tArray(tString);
    const innerResult = ev.evaluateConditional(
      tString,
      tString,
      tNumber,
      tBoolean
    );
    const outerResult = ev.evaluateConditional(
      type,
      tArray(tGeneric('U')),
      innerResult,
      tNever,
      ['U']
    );
    expect(typeToString(outerResult)).toBe('number');
  });
});
