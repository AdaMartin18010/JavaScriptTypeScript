type IsUnion<T, U = T> = T extends T
  ? [U] extends [T]
    ? false
    : true
  : never

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<IsUnion<string>, false>>,
  Expect<Equal<IsUnion<string | number>, true>>,
  Expect<Equal<IsUnion<'a' | 'b' | 'c' | 'd'>, true>>,
  Expect<Equal<IsUnion<undefined | null | void | ''>, true>>,
  Expect<Equal<IsUnion<{ a: string } | { a: number }>, true>>,
  Expect<Equal<IsUnion<any>, false>>,
]
