// ============================================
// 03 - Tuple to Object
// 难度: ⭐
// ============================================

// 题目:
// 给定一个元组类型，将其转换为对象类型。
// 对象的键和值都来自元组中的元素。

// 例如:
// const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
// type result = TupleToObject<typeof tuple>
// 期望: { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }

type TupleToObject<T extends readonly (string | number)[]> = {
  [P in T[number]]: P
}

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
const tupleNumber = [1, 2, 3, 4] as const
const tupleMix = [1, '2', 3, '4'] as const

type cases = [
  Expect<Equal<TupleToObject<typeof tuple>, { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }>>,
  Expect<Equal<TupleToObject<typeof tupleNumber>, { 1: 1; 2: 2; 3: 3; 4: 4 }>>,
  Expect<Equal<TupleToObject<typeof tupleMix>, { 1: 1; '2': '2'; 3: 3; '4': '4' }>>,
]

// @ts-expect-error
type error = TupleToObject<[[1, 2], {}]>
