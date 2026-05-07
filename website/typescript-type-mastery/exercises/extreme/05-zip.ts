type Zip<T extends any[], U extends any[]> = T extends [infer TF, ...infer TR]
  ? U extends [infer UF, ...infer UR]
    ? [[TF, UF], ...Zip<TR, UR>]
    : []
  : []

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<Zip<[1, 2], ['a', 'b']>, [[1, 'a'], [2, 'b']]>>,
]
