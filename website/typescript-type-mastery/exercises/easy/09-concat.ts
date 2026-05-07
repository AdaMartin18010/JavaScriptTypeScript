// ============================================
// 09 - Concat
// 难度: ⭐
// ============================================

// 题目:
// 在类型系统里实现 JavaScript 的 `Array.concat` 功能。
// 类型接受两个参数，输出的类型应该是两个参数按顺序合并后的结果。

// 例如:
// type Result = Concat<[1], [2]> // 期望: [1, 2]

type Concat<T extends any[], U extends any[]> = [...T, ...U]

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Concat<[], []>, []>>,
  Expect<Equal<Concat<[], [1]>, [1]>>,
  Expect<Equal<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<Concat<['1', 2, '3'], [false, boolean, '4']>, ['1', 2, '3', false, boolean, '4']>>,
]
