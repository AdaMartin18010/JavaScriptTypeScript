// ============================================
// 13 - Parameters
// 难度: ⭐
// ============================================

// 题目:
// 实现内置的 `Parameters<T>` 类型，但不能直接使用它本身。
// 从函数类型 `T` 中提取参数类型为元组。

// 例如:
// const foo = (arg1: string, arg2: number): void => {}
// type FunctionParamsType = MyParameters<typeof foo>
// 期望: [arg1: string, arg2: number]

type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

const foo = (arg1: string, arg2: number): void => {}
const bar = (arg1: boolean, arg2: { a: 'A' }): void => {}
const baz = (): void => {}

type cases = [
  Expect<Equal<MyParameters<typeof foo>, [string, number]>>,
  Expect<Equal<MyParameters<typeof bar>, [boolean, { a: 'A' }]>>,
  Expect<Equal<MyParameters<typeof baz>, []>>,
]
