type FilterOut<T extends any[], F> = T extends [infer First, ...infer Rest]
  ? [First] extends [F]
    ? FilterOut<Rest, F>
    : [First, ...FilterOut<Rest, F>]
  : []

import type { Equal, Expect } from '@type-challenges/utils'
type cases = [
  Expect<Equal<FilterOut<[1, 2, 3, 4], 2>, [1, 3, 4]>>,
  Expect<Equal<FilterOut<[1, 'a', 2, 'b'], string>, [1, 2]>>,
]
