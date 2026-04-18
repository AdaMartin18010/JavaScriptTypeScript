/**
 * 04. Chainable Options
 *
 * 难度：🟡 中等
 *
 * 实现 `Chainable<T>` 类型，用于支持链式调用 API 的类型定义。
 * 该类型有两个方法：
 * - `option(key, value)`: 添加一个配置项
 * - `get()`: 获取最终的配置对象
 *
 * 每次调用 `option` 后，返回的链式对象应包含新添加的配置项类型。
 *
 * 提示：
 * - 使用泛型参数累积类型状态
 * - `option` 方法的返回类型应为更新后的 `Chainable<...>`
 *
 * @example
 * ```ts
 * declare const config: Chainable<{}>;
 * const result = config
 *   .option('foo', 123)
 *   .option('bar', { value: 'Hello' })
 *   .option('name', 'type-challenges')
 *   .get();
 * // result 的类型应为 { foo: 123; bar: { value: 'Hello' }; name: 'type-challenges' }
 * ```
 */

export type Chainable<T = {}> = {
  // 你的代码 here
};

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

declare const a: Chainable;

const result1 = a.option('foo', 123).option('bar', { value: 'Hello' }).get();
type Test1 = typeof result1;

const result2 = a
  .option('name', 'another name')
  .option('age', 123)
  .option('addr', { city: 'Beijing' })
  .get();
type Test2 = typeof result2;

export type _Tests = [
  Expect<AssertEqual<Test1, { foo: number; bar: { value: string } }>>,
  Expect<
    AssertEqual<
      Test2,
      { name: string; age: number; addr: { city: string } }
    >
  >,
];
