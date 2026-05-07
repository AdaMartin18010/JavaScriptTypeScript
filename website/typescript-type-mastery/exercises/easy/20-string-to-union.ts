// ============================================
// 20 - String to Union
// 难度: ⭐⭐
// ============================================

// 题目:
// 实现一个 `StringToUnion<T>` 类型，它将字符串字面量类型转换为其字符的联合类型。

// 例如:
// type Test = '123'
// type Result = StringToUnion<Test> // '1' | '2' | '3'

type StringToUnion<T extends string> = T extends `${infer First}${infer Rest}`
  ? First | StringToUnion<Rest>
  : never

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

type cases = [
  Expect<Equal<StringToUnion<''>, never>>,
  Expect<Equal<StringToUnion<'t'>, 't'>>,
  Expect<Equal<StringToUnion<'hello'>, 'h' | 'e' | 'l' | 'l' | 'o'>>,
  Expect<Equal<StringToUnion<'coronavirus'>, 'c' | 'o' | 'r' | 'n' | 'a' | 'v' | 'i' | 'u' | 's'>>,
]
