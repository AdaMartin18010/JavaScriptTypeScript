type FlattenKeys<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${FlattenKeys<T[K]> extends string ? FlattenKeys<T[K]> : never}`
    : K
  : never

type FlattenObject<T extends Record<string, any>> = {
  [K in FlattenKeys<T> as K]: K extends `${infer P}.${infer R}`
    ? P extends keyof T
      ? R extends keyof T[P]
        ? T[P][R]
        : never
      : never
    : K extends keyof T
      ? T[K]
      : never
}

import type { Equal, Expect } from '../_shared/type-utils'
type Foo = { foo: { a: number; b: string }; bar: { c: boolean } }
type cases = [
  Expect<Equal<FlattenObject<Foo>, { 'foo.a': number; 'foo.b': string; 'bar.c': boolean }>>,
]
