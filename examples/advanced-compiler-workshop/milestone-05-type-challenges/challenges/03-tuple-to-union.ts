/**
 * 03. Tuple to Union
 *
 * 难度：🟢 简单
 *
 * 实现一个泛型 `TupleToUnion<T>`，它将元组类型转换为该元组所有元素的联合类型。
 *
 * 提示：
 * - 元组类型是可索引的，使用 `T[number]` 可以获取所有元素的联合类型
 *
 * @example
 * ```ts
 * type Result = TupleToUnion<[123, '456', true]>; // 123 | '456' | true
 * ```
 */

export type TupleToUnion<T extends readonly unknown[]> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  Expect<AssertEqual<TupleToUnion<[123, '456', true]>, 123 | '456' | true>>,
  Expect<AssertEqual<TupleToUnion<[1]>, 1>>,
  Expect<AssertEqual<TupleToUnion<[]>, never>>,
];
