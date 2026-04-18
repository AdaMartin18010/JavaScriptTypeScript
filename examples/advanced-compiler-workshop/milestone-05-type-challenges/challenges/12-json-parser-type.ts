/**
 * 12. JSON Parser Type
 *
 * 难度：⚫ 地狱
 *
 * 实现一个类型层面的 JSON 解析器 `JSONParser<T>`，
 * 将 JSON 字符串类型解析为对应的 TypeScript 类型。
 *
 * 支持的 JSON 子集：
 * - 对象: `{ "key": value }`
 * - 数组: `[value1, value2]`
 * - 字符串: `"..."`
 * - 数字: `123`, `-45`, `3.14`
 * - 布尔: `true`, `false`
 * - null: `null`
 *
 * 提示：
 * - 使用递归模板字面量类型逐字符解析
 * - 使用 `infer` 提取子串
 * - 这是 TypeScript 类型系统的极限挑战
 *
 * @example
 * ```ts
 * type Result = JSONParser<'{ "name": "ts", "age": 10 }'>;
 * // { name: 'ts'; age: 10 }
 * ```
 */

export type JSONParser<T extends string> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

export type _Tests = [
  // 基础类型
  Expect<AssertEqual<JSONParser<'null'>, null>>,
  Expect<AssertEqual<JSONParser<'true'>, true>>,
  Expect<AssertEqual<JSONParser<'false'>, false>>,
  Expect<AssertEqual<JSONParser<'123'>, 123>>,
  Expect<AssertEqual<JSONParser<'"hello"'>, 'hello'>>,
  // 数组
  Expect<AssertEqual<JSONParser<'[1, 2, 3]'>, [1, 2, 3]>>,
  Expect<AssertEqual<JSONParser<'["a", "b"]'>, ['a', 'b']>>,
  // 对象
  Expect<AssertEqual<JSONParser<'{"x": 1}'>, { x: 1 }>>,
  Expect<AssertEqual<JSONParser<'{"name": "ts", "age": 10}'>, { name: 'ts'; age: 10 }>>,
  // 嵌套
  Expect<AssertEqual<JSONParser<'{"a": {"b": 1}}'>, { a: { b: 1 } }>>,
  Expect<AssertEqual<JSONParser<'[{"x": 1}, {"y": 2}]'>, [{ x: 1 }, { y: 2 }]>>,
];
