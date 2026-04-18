/**
 * @file 类型体操测试
 * @category Advanced Compiler Workshop → Milestone 5 → Tests
 *
 * 使用 Vitest 的 expectTypeOf 进行编译时类型断言。
 */

import { describe, it, expectTypeOf } from 'vitest';

// 01. Hello World
import type { HelloWorld } from './challenges/01-hello-world.js';

// 02. Deep Readonly
import type { DeepReadonly } from './challenges/02-deep-readonly.js';

// 03. Tuple to Union
import type { TupleToUnion } from './challenges/03-tuple-to-union.js';

// 04. Chainable Options
import type { Chainable } from './challenges/04-chainable-options.js';

// 05. Tuple Filter
import type { TupleFilter } from './challenges/05-tuple-filter.js';

// 06. Lookup
import type { LookUp } from './challenges/06-lookup.js';

// 07. Append to Object
import type { AppendToObject } from './challenges/07-append-to-object.js';

// 08. Absolute
import type { Absolute } from './challenges/08-absolute.js';

// 09. String Join
import type { StringJoin } from './challenges/09-string-join.js';

// 10. Currying
import type { Currying } from './challenges/10-currying.js';

// 11. Type Lookup in Union
import type { UnionToIntersection, GetOptional } from './challenges/11-type-lookup-in-union.js';

// 12. JSON Parser Type
import type { JSONParser } from './challenges/12-json-parser-type.js';

describe('Type Challenges', () => {
  it('01 - HelloWorld', () => {
    expectTypeOf<HelloWorld<string>>().toEqualTypeOf<string>();
    expectTypeOf<HelloWorld<42>>().toEqualTypeOf<42>();
    expectTypeOf<HelloWorld<true>>().toEqualTypeOf<true>();
  });

  it('02 - DeepReadonly', () => {
    type X = { x: { a: 1; b: 'hi' }; y: 'hey' };
    type Expected = { readonly x: { readonly a: 1; readonly b: 'hi' }; readonly y: 'hey' };
    expectTypeOf<DeepReadonly<X>>().toEqualTypeOf<Expected>();
  });

  it('03 - TupleToUnion', () => {
    expectTypeOf<TupleToUnion<[123, '456', true]>>().toEqualTypeOf<123 | '456' | true>();
    expectTypeOf<TupleToUnion<[1]>>().toEqualTypeOf<1>();
    expectTypeOf<TupleToUnion<[]>>().toEqualTypeOf<never>();
  });

  it('04 - Chainable Options', () => {
    declare const a: Chainable;
    const r = a.option('foo', 123).option('bar', { value: 'Hello' }).get();
    expectTypeOf(r).toEqualTypeOf<{ foo: number; bar: { value: string } }>();
  });

  it('05 - TupleFilter', () => {
    expectTypeOf<TupleFilter<[1, 2, 'a', 3, 'b'], string>>().toEqualTypeOf<[1, 2, 3]>();
    expectTypeOf<TupleFilter<[1, 2, 3], string>>().toEqualTypeOf<[1, 2, 3]>();
    expectTypeOf<TupleFilter<['a', 'b', 'c'], string>>().toEqualTypeOf<[]>();
    expectTypeOf<TupleFilter<[], string>>().toEqualTypeOf<[]>();
  });

  it('06 - LookUp', () => {
    interface Cat { type: 'cat'; breeds: 'Abyssinian' | 'Birman'; }
    interface Dog { type: 'dog'; breeds: 'Hound' | 'Brittany'; }
    type Animals = Cat | Dog;
    expectTypeOf<LookUp<Animals, 'dog'>>().toEqualTypeOf<Dog>();
    expectTypeOf<LookUp<Animals, 'cat'>>().toEqualTypeOf<Cat>();
  });

  it('07 - AppendToObject', () => {
    type Test = { key: 'cat'; value: 'green' };
    expectTypeOf<AppendToObject<Test, 'home', boolean>>().toEqualTypeOf<{
      key: 'cat'; value: 'green'; home: boolean;
    }>();
    expectTypeOf<AppendToObject<Test, 'key', number>>().toEqualTypeOf<{
      key: number; value: 'green';
    }>();
  });

  it('08 - Absolute', () => {
    expectTypeOf<Absolute<0>>().toEqualTypeOf<'0'>();
    expectTypeOf<Absolute<-0>>().toEqualTypeOf<'0'>();
    expectTypeOf<Absolute<10>>().toEqualTypeOf<'10'>();
    expectTypeOf<Absolute<-5>>().toEqualTypeOf<'5'>();
    expectTypeOf<Absolute<'0'>>().toEqualTypeOf<'0'>();
    expectTypeOf<Absolute<'-5'>>().toEqualTypeOf<'5'>();
    expectTypeOf<Absolute<-1_000_000n>>().toEqualTypeOf<'1000000'>();
  });

  it('09 - StringJoin', () => {
    expectTypeOf<StringJoin<['a', 'b', 'c'], '-'>>().toEqualTypeOf<'a-b-c'>();
    expectTypeOf<StringJoin<['Hello', 'World'], ' '>>().toEqualTypeOf<'Hello World'>();
    expectTypeOf<StringJoin<[], '.'>>().toEqualTypeOf<''>();
    expectTypeOf<StringJoin<['a'], '-'>>().toEqualTypeOf<'a'>();
  });

  it('10 - Currying', () => {
    type Fn1 = (a: number, b: string, c: boolean) => void;
    expectTypeOf<Currying<Fn1>>().toEqualTypeOf<(a: number) => (b: string) => (c: boolean) => void>();

    type Fn2 = (a: string) => number;
    expectTypeOf<Currying<Fn2>>().toEqualTypeOf<(a: string) => number>();

    type Fn3 = () => boolean;
    expectTypeOf<Currying<Fn3>>().toEqualTypeOf<() => boolean>();
  });

  it('11 - UnionToIntersection & GetOptional', () => {
    type U = { a: string } | { b: number };
    expectTypeOf<UnionToIntersection<U>>().toEqualTypeOf<{ a: string } & { b: number }>();

    type T = { a?: string; b: number; c?: boolean };
    expectTypeOf<GetOptional<T>>().toEqualTypeOf<'a' | 'c'>();
  });

  it('12 - JSONParser', () => {
    expectTypeOf<JSONParser<'null'>>().toEqualTypeOf<null>();
    expectTypeOf<JSONParser<'true'>>().toEqualTypeOf<true>();
    expectTypeOf<JSONParser<'123'>>().toEqualTypeOf<123>();
    expectTypeOf<JSONParser<'"hello"'>>().toEqualTypeOf<'hello'>();
    expectTypeOf<JSONParser<'[1, 2, 3]'>>().toEqualTypeOf<[1, 2, 3]>();
    expectTypeOf<JSONParser<'{"x": 1}'>>().toEqualTypeOf<{ x: 1 }>();
    expectTypeOf<JSONParser<'{"a": {"b": 1}}'>>().toEqualTypeOf<{ a: { b: 1 } }>();
  });
});
