/**
 * @file 类型测试工具
 * @category Advanced Compiler Workshop → Milestone 5
 *
 * 提供类型层面的断言工具，用于验证类型体操题目的正确性。
 */

/**
 * 严格类型相等判断（避免分布式条件类型的干扰）
 */
export type AssertEqual<T, U> =
  [T] extends [U] ? ([U] extends [T] ? true : false) : false;

/**
 * 期望类型为 true 的断言
 */
export type Expect<T extends true> = T;

/**
 * 期望类型为 false 的断言
 */
export type ExpectFalse<T extends false> = T;

/**
 * 辅助类型：判断是否为任意类型
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * 辅助类型：判断是否为 never
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * 辅助类型：判断是否为 unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * 运行时类型断言函数（用于结合 Vitest 使用）
 * 由于 TypeScript 类型在运行时擦除，此函数仅作为标记使用
 */
export function assertType<_T>(): void {
  // 无运行时逻辑，仅用于类型检查
}
