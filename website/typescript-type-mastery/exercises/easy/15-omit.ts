// ============================================
// 15 - Omit
// 难度: ⭐
// ============================================

// 题目:
// 实现内置的 `Omit<T, K>` 类型，但不能直接使用它本身。
// 从对象类型 `T` 中剔除 `K` 中声明的属性。

// 例如:
// interface Todo {
//   title: string
//   description: string
//   completed: boolean
// }
// type TodoPreview = MyOmit<Todo, 'description' | 'title'>
// 期望: { completed: boolean }

type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

type cases = [
  Expect<Equal<Expected1, MyOmit<Todo, 'description'>>>,
  Expect<Equal<Expected2, MyOmit<Todo, 'description' | 'completed'>>>,
]

// @ts-expect-error
type error = MyOmit<Todo, 'description' | 'invalid'>

interface Todo {
  title: string
  description: string
  completed: boolean
}

interface Expected1 {
  title: string
  completed: boolean
}

interface Expected2 {
  title: string
}
