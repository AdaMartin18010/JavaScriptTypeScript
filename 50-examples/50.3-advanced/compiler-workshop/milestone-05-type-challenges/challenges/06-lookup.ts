/**
 * 06. Lookup
 *
 * 难度：🟡 中等
 *
 * 实现 `LookUp<U, T>`，在联合类型 `U` 中查找具有 `type` 属性且值为 `T` 的成员。
 *
 * 提示：
 * - 使用 `keyof` 和索引访问类型
 * - 利用分布式条件类型在联合类型上的分发行为
 *
 * @example
 * ```ts
 * type Cat = { type: 'cat'; breeds: 'Abyssinian' | 'Birman' };
 * type Dog = { type: 'dog'; breeds: 'Hound' | 'Brittany' };
 * type Animals = Cat | Dog;
 *
 * type Result = LookUp<Animals, 'dog'>; // Dog
 * ```
 */

export type LookUp<U, T> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

interface Cat {
  type: 'cat';
  breeds: 'Abyssinian' | 'Birman';
}

interface Dog {
  type: 'dog';
  breeds: 'Hound' | 'Brittany';
}

type Animals = Cat | Dog;

export type _Tests = [
  Expect<AssertEqual<LookUp<Animals, 'dog'>, Dog>>,
  Expect<AssertEqual<LookUp<Animals, 'cat'>, Cat>>,
];
