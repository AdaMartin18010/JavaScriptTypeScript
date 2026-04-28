/**
 * 09. String Join
 *
 * 难度：🔴 困难
 *
 * 实现 `StringJoin<T, U>`，将字符串数组 `T` 用分隔符 `U` 连接成一个字符串类型。
 *
 * 提示：
 * - 使用递归条件类型遍历数组
 * - 使用模板字面量类型拼接字符串
 * - 需要处理数组为空的情况
 *
 * @example
 * ```ts
 * type Result = StringJoin<['a', 'b', 'c'], '-'>; // 'a-b-c'
 * ```
 */

export type StringJoin<T extends string[], U extends string> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  Expect<AssertEqual<StringJoin<['a', 'b', 'c'], '-'>, 'a-b-c'>>,
  Expect<AssertEqual<StringJoin<['Hello', 'World'], ' '>, 'Hello World'>>,
  Expect<AssertEqual<StringJoin<[], '.'>, ''>>,
  Expect<AssertEqual<StringJoin<['a'], '-'>, 'a'>>,
];
