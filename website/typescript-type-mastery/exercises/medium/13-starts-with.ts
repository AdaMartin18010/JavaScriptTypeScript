type StartsWith<T extends string, U extends string> = T extends `${U}${string}` ? true : false

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<StartsWith<'abc', 'ac'>, false>>,
  Expect<Equal<StartsWith<'abc', 'ab'>, true>>,
  Expect<Equal<StartsWith<'abc', 'abcd'>, false>>,
]
