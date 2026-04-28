/**
 * 02. Deep Readonly
 *
 * 难度：🟢 简单
 *
 * 实现一个 `DeepReadonly<T>` 类型，将对象类型的所有属性（包括嵌套对象）递归地设为 readonly。
 *
 * 提示：
 * - 使用映射类型 `{ [K in keyof T]: ... }`
 * - 使用递归处理嵌套对象
 * - 需要排除函数类型（函数不应被递归处理）
 *
 * @example
 * ```ts
 * type X = {
 *   x: { a: 1; b: 'hi' };
 *   y: 'hey';
 * };
 * type Expected = {
 *   readonly x: { readonly a: 1; readonly b: 'hi' };
 *   readonly y: 'hey';
 * };
 * type Result = DeepReadonly<X>; // Expected
 * ```
 */

export type DeepReadonly<T> = any;

// ==================== 测试用例 ====================
import type { AssertEqual, Expect } from '../type-utils.js';

interface TestCase1 {
  x: { a: 1; b: 'hi' };
  y: 'hey';
}

interface Expected1 {
  readonly x: { readonly a: 1; readonly b: 'hi' };
  readonly y: 'hey';
}

interface TestCase2 {
  a: () => 22;
  b: string;
  c: { d: boolean; e: { g: 27; h: 28 } };
}

interface Expected2 {
  readonly a: () => 22;
  readonly b: string;
  readonly c: { readonly d: boolean; readonly e: { readonly g: 27; readonly h: 28 } };
}

export type _Tests = [
  Expect<AssertEqual<DeepReadonly<TestCase1>, Expected1>>,
  Expect<AssertEqual<DeepReadonly<TestCase2>, Expected2>>,
];
