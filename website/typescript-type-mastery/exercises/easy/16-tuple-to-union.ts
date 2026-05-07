// ============================================
// 16 - Tuple to Union
// 难度: ⭐
// ============================================

// 题目:
// 实现泛型 `TupleToUnion<T>`，它将元组类型转换为联合类型。

// 例如:
// type Arr = ['1', '2', '3']
// type Test = TupleToUnion<Arr> // '1' | '2' | '3'

type TupleToUnion<T extends any[]> = T[number]

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TupleToUnion<[123, '456', true]>, 123 | '456' | true>>,
  Expect<Equal<TupleToUnion<[123]>, 123>>,
]
