type DeepPick<T, K extends string> = K extends keyof T
  ? { [P in K]: T[K] }
  : K extends `${infer F}.${infer R}`
    ? F extends keyof T
      ? { [P in F]: DeepPick<T[F], R> }
      : never
    : never

import type { Equal, Expect } from '@type-challenges/utils'
type Obj = { a: number; b: string; c: boolean; obj: { a: number; b: string } }
type cases = [
  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,
  Expect<Equal<DeepPick<Obj, 'a' | 'obj.a'>, { a: number; obj: { a: number } }>>,
]
