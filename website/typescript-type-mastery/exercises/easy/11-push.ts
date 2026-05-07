// ============================================
// 11 - Push
// 难度: ⭐
// ============================================

// 题目:
// 在类型系统里实现通用的 `Array.push`。
// 给定一个数组类型 `T` 和一个元素类型 `U`，
// 返回将 `U` 推入 `T` 后的新数组类型。

// 例如:
// type Result = Push<[1, 2], '3'> // [1, 2, '3']

type Push<T extends any[], U> = [...T, U]

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

type cases = [
  Expect<Equal<Push<[], 1>, [1]>>,
  Expect<Equal<Push<[1, 2], '3'>, [1, 2, '3']>>,
  Expect<Equal<Push<['1', 2, '3'], boolean>, ['1', 2, '3', boolean]>>,
]
