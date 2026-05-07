type CamelCase<S extends string> = S extends `${infer L}-${infer R}`
  ? R extends `${infer First}${infer Rest}`
    ? `${Lowercase<L>}${Uppercase<First>}${CamelCase<Rest>}`
    : `${Lowercase<L>}-${R}`
  : Lowercase<S>

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<CamelCase<'foo-bar-baz'>, 'fooBarBaz'>>,
  Expect<Equal<CamelCase<'foo-Bar-Baz'>, 'fooBarBaz'>>,
]
