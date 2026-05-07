type DropChar<S, C extends string> = S extends `${infer L}${C}${infer R}`
  ? DropChar<`${L}${R}`, C>
  : S

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<DropChar<'butter fly!', ''>, 'butter fly!'>>,
  Expect<Equal<DropChar<'butter fly!', '!'>, 'butter fly'>>,
  Expect<Equal<DropChar<'    butter fly!        ', ' '>, 'butterfly!'>>,
]
