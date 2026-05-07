// ============================================
// 18 - Promise All
// 难度: ⭐⭐
// ============================================

// 题目:
// 键入函数 `PromiseAll`，它接受 PromiseLike 对象数组，
// 返回值应为 `Promise<T>`，其中 `T` 是解析结果组成的数组。

// 例如:
// const promise1 = Promise.resolve(3)
// const promise2 = 42
// const promise3 = new Promise<string>((resolve, reject) => {
//   setTimeout(resolve, 100, 'foo')
// })
// const p = PromiseAll([promise1, promise2, promise3] as const)
// 期望: Promise<[3, 42, 'foo']>

declare function PromiseAll<T extends any[]>(
  values: readonly [...T]
): Promise<{
  [K in keyof T]: T[K] extends Promise<infer R> ? R : T[K]
}>

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

const promiseAllTest1 = PromiseAll([1, 2, 3] as const)
const promiseAllTest2 = PromiseAll([1, 2, Promise.resolve(3)] as const)
const promiseAllTest3 = PromiseAll([1, 2, Promise.resolve(3)])

type cases = [
  Expect<Equal<typeof promiseAllTest1, Promise<[1, 2, 3]>>>,
  Expect<Equal<typeof promiseAllTest2, Promise<[1, 2, number]>>>,
  Expect<Equal<typeof promiseAllTest3, Promise<[number, number, number]>>>,
]
