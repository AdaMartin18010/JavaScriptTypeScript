type PercentageParser<A extends string> =
  A extends `${infer Sign extends '+' | '-'}${infer Rest}`
    ? Rest extends `${infer Num}%`
      ? [Sign, Num, '%']
      : [Sign, Rest, '']
    : A extends `${infer Num}%`
      ? ['', Num, '%']
      : ['', A, '']

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<PercentageParser<''>, ['', '', '']>>,
  Expect<Equal<PercentageParser<'+'>, ['+', '', '']>>,
  Expect<Equal<PercentageParser<'+1'>, ['+', '1', '']>>,
  Expect<Equal<PercentageParser<'+100%'>, ['+', '100', '%']>>,
  Expect<Equal<PercentageParser<'100%'>, ['', '100', '%']>>,
]
