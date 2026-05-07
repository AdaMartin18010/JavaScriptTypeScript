type DeepPick<T, Paths extends string> = Paths extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? { [P in K]: DeepPick<T[K], Rest> }
    : never
  : Paths extends keyof T
    ? { [P in Paths]: T[Paths] }
    : never

import type { Equal, Expect } from '@type-challenges/utils'
type Obj = { a: { b: { c: number }; d: string }; e: boolean }
type cases = [
  Expect<Equal<DeepPick<Obj, 'a.b.c'>, { a: { b: { c: number } } }>>,
  Expect<Equal<DeepPick<Obj, 'e'>, { e: boolean }>>,
]
