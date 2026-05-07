type DeepMutable<T> = T extends ReadonlyMap<infer K, infer V>
  ? Map<K, V>
  : T extends ReadonlySet<infer V>
    ? Set<V>
    : T extends object
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      : T

import type { Equal, Expect } from '@type-challenges/utils'
interface Test1 {
  readonly a: () => 22
  readonly b: string
  readonly c: { readonly d: boolean }
}
type cases = [
  Expect<Equal<DeepMutable<Test1>, { a: () => 22; b: string; c: { d: boolean } }>>,
]
