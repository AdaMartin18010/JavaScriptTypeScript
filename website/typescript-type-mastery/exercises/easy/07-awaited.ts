// ============================================
// 07 - Awaited
// 难度: ⭐
// ============================================

// 题目:
// 假如我们有一个 Promise 对象，这个 Promise 对象会返回一个类型。
// 在 TS 中，我们用 `Promise<T>` 中的 `T` 来描述这个返回类型。
// 请你实现 `MyAwaited<T>` 来获取这个返回类型。

// 例如:
// type ExampleType = Promise<string>
// type result = MyAwaited<ExampleType> // 期望: string

// 进阶: 支持嵌套 Promise，如 Promise<Promise<string>>

type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U>
  ? U extends PromiseLike<any>
    ? MyAwaited<U>
    : U
  : never

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>

type cases = [
  Expect<Equal<MyAwaited<X>, string>>,
  Expect<Equal<MyAwaited<Y>, { field: number }>>,
  Expect<Equal<MyAwaited<Z>, string | number>>,
  Expect<Equal<MyAwaited<Z1>, string | boolean>>,
]

// @ts-expect-error
type error = MyAwaited<number>
