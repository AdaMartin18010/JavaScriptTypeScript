/**
 * 01. Hello World
 *
 * 难度：🟢 简单
 *
 * 实现一个通用的类型 `HelloWorld<T>`，它接受任意类型 T 并返回 T 本身。
 * 这是类型体操的 "Hello World"，用于熟悉泛型参数的基本用法。
 *
 * @example
 * ```ts
 * type A = HelloWorld<string>; // string
 * type B = HelloWorld<42>;     // 42
 * type C = HelloWorld<true>;   // true
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type HelloWorld<T> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  Expect<AssertEqual<HelloWorld<string>, string>>,
  Expect<AssertEqual<HelloWorld<42>, 42>>,
  Expect<AssertEqual<HelloWorld<true>, true>>,
  Expect<AssertEqual<HelloWorld<null>, null>>,
];
