// ============================================
// 17 - Last of Array
// 难度: ⭐
// ============================================

// 题目:
// 实现一个泛型 `Last<T>`，它接受一个数组 `T` 并返回其最后一个元素的类型。

// 例如:
// type arr1 = ['a', 'b', 'c']
// type arr2 = [3, 2, 1]
// type tail1 = Last<arr1> // 'c'
// type tail2 = Last<arr2> // 1

type Last<T extends any[]> = T extends [...any[], infer L] ? L : never

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Last<[3, 2, 1]>, 1>>,
  Expect<Equal<Last<[() => 123, { a: string }]>, { a: string }>>,
  Expect<Equal<Last<[]>, never>>,
  Expect<Equal<Last<[undefined]>, undefined>>,
]
