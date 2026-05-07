type EndsWith<T extends string, U extends string> = T extends `${string}${U}` ? true : false

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<EndsWith<'abc', 'bc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'abc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'd'>, false>>,
]
