type Shift<T extends any[]> = T extends [unknown, ...infer Rest] ? Rest : []

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<Shift<[3, 2, 1]>, [2, 1]>>,
  Expect<Equal<Shift<['a', 'b', 'c', 'd']>, ['b', 'c', 'd']>>,
]
