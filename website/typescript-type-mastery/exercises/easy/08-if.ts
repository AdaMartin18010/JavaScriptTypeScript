// ============================================
// 08 - If
// 难度: ⭐
// ============================================

// 题目:
// 实现一个 `If` 类型，它接受一个条件类型 `C`、
// 一个判断为真时的返回类型 `T`、以及一个判断为假时的返回类型 `F`。
// `C` 只能是 `true` 或 `false`。`T` 和 `F` 可以是任何类型。

// 例如:
// type A = If<true, 'a', 'b'>  // 期望: 'a'
// type B = If<false, 'a', 'b'> // 期望: 'b'

type If<C extends boolean, T, F> = C extends true ? T : F

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<If<true, 'a', 'b'>, 'a'>>,
  Expect<Equal<If<false, 'a', 2>, 2>>,
]

// @ts-expect-error
type error = If<null, 'a', 'b'>
