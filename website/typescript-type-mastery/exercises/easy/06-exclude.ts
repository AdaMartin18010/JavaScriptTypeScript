// ============================================
// 06 - Exclude
// 难度: ⭐
// ============================================

// 题目:
// 实现内置的 `Exclude<T, U>` 类型，但不能直接使用它本身。
// 从联合类型 `T` 中排除 `U` 中的类型。

// 例如:
// type T0 = MyExclude<"a" | "b" | "c", "a">       // 期望: "b" | "c"
// type T1 = MyExclude<"a" | "b" | "c", "a" | "b"> // 期望: "c"
// type T2 = MyExclude<string | number | (() => void), Function> // 期望: string | number

type MyExclude<T, U> = T extends U ? never : T

// ============ 测试用例 ============
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a' | 'b'>, 'c'>>,
  Expect<Equal<MyExclude<string | number | (() => void), Function>, string | number>>,
]
