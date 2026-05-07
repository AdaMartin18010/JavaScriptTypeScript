type ReverseString<S extends string> = S extends `${infer F}${infer R}` ? `${ReverseString<R>}${F}` : ''
type IsPalindrome<S extends string> = S extends ReverseString<S> ? true : false

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<IsPalindrome<'abcba'>, true>>,
  Expect<Equal<IsPalindrome<'abc'>, false>>,
  Expect<Equal<IsPalindrome<''>, true>>,
]
