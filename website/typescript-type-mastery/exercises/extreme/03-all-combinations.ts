type AllCombinations<S extends string, Acc extends string = ''> = S extends `${infer C}${infer Rest}`
  ? AllCombinations<Rest, Acc | `${Acc}${C}` | C>
  : Acc

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<AllCombinations<'AB'>, '' | 'A' | 'B' | 'AB' | 'BA'>>,
]
