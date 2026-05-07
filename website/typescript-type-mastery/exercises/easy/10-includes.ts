type MyEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type Includes<T extends readonly any[], U> = T extends [infer First, ...infer Rest]
  ? MyEqual<First, U> extends true
    ? true
    : Includes<Rest, U>
  : false

import type { Expect } from '../_shared/type-utils'
type cases = [
  Expect<MyEqual<Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Kars'>, true>>,
  Expect<MyEqual<Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'>, false>>,
  Expect<MyEqual<Includes<[1, 2, 3, 5, 6, 7], 7>, true>>,
  Expect<MyEqual<Includes<[1, 2, 3, 5, 6, 7], 4>, false>>,
  Expect<MyEqual<Includes<[1, 2, 3], 2>, true>>,
  Expect<MyEqual<Includes<[1, 2, 3], 1>, true>>,
  Expect<MyEqual<Includes<[{}], { a: 'A' }>, false>>,
  Expect<MyEqual<Includes<[1, 2, 3], 1 | 2>, false>>,
]
