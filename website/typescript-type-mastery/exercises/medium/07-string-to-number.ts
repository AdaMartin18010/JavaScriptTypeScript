type StringToNumber<S extends string, Acc extends any[] = []> = S extends `${Acc['length']}`
  ? Acc['length']
  : StringToNumber<S, [...Acc, 0]>

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<StringToNumber<'0'>, 0>>,
  Expect<Equal<StringToNumber<'5'>, 5>>,
  Expect<Equal<StringToNumber<'12'>, 12>>,
]
