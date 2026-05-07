// ============================================
// 19 - Type Lookup
// 难度: ⭐
// ============================================

// 题目:
// 有时，你想根据联合类型中的 `type` 字段查找类型。
// 在此挑战中，我们想通过给定的 `type` 从联合类型 `Cat | Dog` 中获取对应的类型。
// 换言之，在以下示例中，`LookUp<Dog | Cat, 'dog'>` 的结果应该是 `Dog`，
// `LookUp<Dog | Cat, 'cat'>` 的结果应该是 `Cat`。

// 例如:
// interface Cat { type: 'cat'; breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal' }
// interface Dog { type: 'dog'; breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer' }
// type MyDogType = LookUp<Cat | Dog, 'dog'> // Dog

type LookUp<U, T> = U extends { type: T } ? U : never

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
}

type Animal = Cat | Dog

type cases = [
  Expect<Equal<LookUp<Animal, 'dog'>, Dog>>,
  Expect<Equal<LookUp<Animal, 'cat'>, Cat>>,
]
