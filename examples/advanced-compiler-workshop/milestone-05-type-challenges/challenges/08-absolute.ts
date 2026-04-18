/**
 * 08. Absolute
 *
 * 难度：🔴 困难
 *
 * 实现 `Absolute<T>`，接收一个 `string`、`number` 或 `bigint`，
 * 返回其正数字符串形式（去除负号）。
 *
 * 提示：
 * - 使用模板字面量类型处理字符串
 * - 使用 `extends` 和 `infer` 提取数字的字符串表示
 * - 需要考虑负号 `-` 的处理
 *
 * @example
 * ```ts
 * type Test = -100;
 * type Result = Absolute<Test>; // '100'
 * ```
 */

export type Absolute<T extends number | string | bigint> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  Expect<AssertEqual<Absolute<0>, '0'>>,
  Expect<AssertEqual<Absolute<-0>, '0'>>,
  Expect<AssertEqual<Absolute<10>, '10'>>,
  Expect<AssertEqual<Absolute<-5>, '5'>>,
  Expect<AssertEqual<Absolute<'0'>, '0'>>,
  Expect<AssertEqual<Absolute<'-0'>, '0'>>,
  Expect<AssertEqual<Absolute<'10'>, '10'>>,
  Expect<AssertEqual<Absolute<'-5'>, '5'>>,
  Expect<AssertEqual<Absolute<-1_000_000n>, '1000000'>>,
];
