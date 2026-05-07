type Curried<T> = T extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? (arg: First) => Curried<(...args: Rest) => R>
    : R
  : never

declare function Currying<T extends (...args: any[]) => any>(fn: T): Curried<T>

import type { Equal, Expect } from '../_shared/type-utils'
const add = (a: number, b: number) => a + b
type cases = [
  Expect<Equal<Curried<typeof add>, (arg: number) => (arg: number) => number>>,
]
