type DeepPick<T, K extends string> = K extends `${infer F}.${infer R}`
  ? F extends keyof T
    ? { [P in F]: DeepPick<T[F], R> }
    : never
  : K extends keyof T
    ? { [P in K]: T[K] }
    : never

import type { Equal, Expect } from '../_shared/type-utils'
type Obj = { a: number; b: string; obj: { a: number; b: string } }
type cases = [
  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,
  Expect<Equal<DeepPick<Obj, 'obj.a'>, { obj: { a: number } }>>,
]
