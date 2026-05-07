type DropChar<S extends string, C extends string> = C extends ''
  ? S
  : S extends `${infer L}${C}${infer R}`
    ? DropChar<`${L}${R}`, C>
    : S

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<DropChar<'butter fly!', ''>, 'butter fly!'>>,
  Expect<Equal<DropChar<'butter fly!', '!'>, 'butter fly'>>,
  Expect<Equal<DropChar<'    butter fly!        ', ' '>, 'butterfly!'>>,
]
