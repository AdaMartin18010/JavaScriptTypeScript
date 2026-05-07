type FlattenObject<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? { [P in `${K}.${keyof T[K] extends string ? keyof T[K] : never}`]: T[K][P extends `${K}.${infer R}` ? R : never] }
    : { [P in K]: T[K] }
  : never

import type { Equal, Expect } from '@type-challenges/utils'
type Foo = { foo: { a: number; b: string }; bar: { c: boolean } }
type cases = [
  Expect<Equal<FlattenObject<Foo>, { 'foo.a': number; 'foo.b': string; 'bar.c': boolean }>>,
]
