/**
 * 10. Currying
 *
 * 难度：🔴 困难
 *
 * 实现 `Currying<T>`，将多参数函数类型转换为柯里化（Curried）形式。
 *
 * 提示：
 * - 使用递归提取参数列表的首个参数
 * - 利用 `infer` 解构函数类型
 * - 每次返回一个接受剩余参数的函数
 *
 * @example
 * ```ts
 * type Fn = (a: number, b: string, c: boolean) => void;
 * type Result = Currying<Fn>;
 * // (a: number) => (b: string) => (c: boolean) => void
 * ```
 */

export type Currying<T> = T extends (...args: infer Args) => infer R
  ? Args extends [infer First, ...infer Rest]
    ? // 你的代码 here
      never
    : () => R
  : never;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

type Fn1 = (a: number, b: string, c: boolean) => void;
type Expected1 = (a: number) => (b: string) => (c: boolean) => void;

type Fn2 = (a: string) => number;
type Expected2 = (a: string) => number;

type Fn3 = () => boolean;
type Expected3 = () => boolean;

export type _Tests = [
  Expect<AssertEqual<Currying<Fn1>, Expected1>>,
  Expect<AssertEqual<Currying<Fn2>, Expected2>>,
  Expect<AssertEqual<Currying<Fn3>, Expected3>>,
];
