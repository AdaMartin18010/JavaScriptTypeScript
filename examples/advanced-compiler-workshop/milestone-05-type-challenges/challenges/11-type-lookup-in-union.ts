/**
 * 11. Type Lookup in Union
 *
 * 难度：🔴 困难
 *
 * 实现 `UnionToIntersection<U>`，将联合类型转换为交叉类型。
 * 然后实现 `GetOptional<T>`，提取对象类型中所有可选属性的键名。
 *
 * 提示：
 * - 联合转交叉利用了函数参数逆变的特性
 * - 可选属性检测：`{} extends Pick<T, K> ? true : false`
 *
 * @example
 * ```ts
 * type U = { a: string } | { b: number };
 * type R1 = UnionToIntersection<U>; // { a: string } & { b: number }
 *
 * type T = { a?: string; b: number; c?: boolean };
 * type R2 = GetOptional<T>; // 'a' | 'c'
 * ```
 */

export type UnionToIntersection<U> = any;

export type GetOptional<T extends Record<string, unknown>> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

type U1 = { a: string } | { b: number };
type ExpectedIntersection = { a: string } & { b: number };

type T1 = { a?: string; b: number; c?: boolean };
type T2 = { x: string; y?: number };

export type _Tests = [
  // UnionToIntersection
  Expect<AssertEqual<UnionToIntersection<U1>, ExpectedIntersection>>,
  // GetOptional
  Expect<AssertEqual<GetOptional<T1>, 'a' | 'c'>>,
  Expect<AssertEqual<GetOptional<T2>, 'y'>>,
];
