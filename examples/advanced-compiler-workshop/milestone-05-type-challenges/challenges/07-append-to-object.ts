/**
 * 07. Append to Object
 *
 * 难度：🟡 中等
 *
 * 实现 `AppendToObject<T, K, V>`，向对象类型 `T` 添加新属性 `K`，其类型为 `V`。
 * 如果 `K` 已存在于 `T` 中，则覆盖其类型。
 *
 * 提示：
 * - 使用映射类型和交叉类型
 * - 或利用 `{ [P in keyof T | K]: ... }`
 *
 * @example
 * ```ts
 * type Test = { key: 'cat'; value: 'green' };
 * type Result = AppendToObject<Test, 'home', boolean>;
 * // { key: 'cat'; value: 'green'; home: boolean }
 * ```
 */

export type AppendToObject<T extends Record<string, unknown>, K extends string, V> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

type TestCase = { key: 'cat'; value: 'green' };

type Expected1 = { key: 'cat'; value: 'green'; home: boolean };
type Expected2 = { key: number; value: 'green' };

export type _Tests = [
  Expect<AssertEqual<AppendToObject<TestCase, 'home', boolean>, Expected1>>,
  Expect<AssertEqual<AppendToObject<TestCase, 'key', number>, Expected2>>,
];
