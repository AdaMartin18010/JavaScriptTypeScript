// ============================================
// 12 - Unshift
// 难度: ⭐
// ============================================

// 题目:
// 在类型系统里实现通用的 `Array.unshift`。
// 给定一个数组类型 `T` 和一个元素类型 `U`，
// 返回将 `U` 插入 `T` 开头后的新数组类型。

// 例如:
// type Result = Unshift<[1, 2], 0> // [0, 1, 2]

type Unshift<T extends any[], U> = [U, ...T]

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

type cases = [
  Expect<Equal<Unshift<[], 1>, [1]>>,
  Expect<Equal<Unshift<[1, 2], 0>, [0, 1, 2]>>,
  Expect<Equal<Unshift<['1', 2, '3'], false>, [false, '1', 2, '3']>>,
]
