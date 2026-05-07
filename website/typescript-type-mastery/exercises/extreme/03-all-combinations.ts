type StringToUnion<S extends string> = S extends `${infer C}${infer Rest}` ? C | StringToUnion<Rest> : never

type AllCombinations<S extends string, U extends string = StringToUnion<S>> = [U] extends [never]
  ? ''
  : '' | { [K in U]: `${K}${AllCombinations<S, Exclude<U, K>>}` }[U]

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<AllCombinations<'AB'>, '' | 'A' | 'B' | 'AB' | 'BA'>>,
]
