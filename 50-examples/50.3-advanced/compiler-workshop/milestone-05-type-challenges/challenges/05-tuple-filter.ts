/**
 * 05. Tuple Filter
 *
 * 难度：🟡 中等
 *
 * 实现 `TupleFilter<T, U>`，从元组类型 `T` 中过滤掉所有可赋值给 `U` 的元素。
 *
 * 提示：
 * - 使用递归条件类型遍历元组
 * - 使用 `infer` 提取元组的首尾元素
 * - 注意分布式条件类型的行为
 *
 * @example
 * ```ts
 * type Result = TupleFilter<[1, 2, 'a', 3, 'b'], string>; // [1, 2, 3]
 * ```
 */

export type TupleFilter<T extends readonly unknown[], U> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  Expect<AssertEqual<TupleFilter<[1, 2, 'a', 3, 'b'], string>, [1, 2, 3]>>,
  Expect<AssertEqual<TupleFilter<[1, 2, 3], string>, [1, 2, 3]>>,
  Expect<AssertEqual<TupleFilter<['a', 'b', 'c'], string>, []>>,
  Expect<AssertEqual<TupleFilter<['a', 1, 'b', 2, 'c', 3], number>, ['a', 'b', 'c']>>,
  Expect<AssertEqual<TupleFilter<[], string>, []>>,
];
