declare function Currying<T>(fn: T): T extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? (arg: First) => Currying<(...args: Rest) => R>
    : R
  : never

import type { Equal, Expect } from '@type-challenges/utils'
const add = (a: number, b: number) => a + b
type cases = [
  Expect<Equal<typeof Currying<typeof add>, (arg: number) => (arg: number) => number>>,
]
