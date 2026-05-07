type TupleToNestedObject<T extends any[], U> = T extends [infer First, ...infer Rest]
  ? First extends string | number
    ? { [K in First]: TupleToNestedObject<Rest, U> }
    : never
  : U

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<TupleToNestedObject<['a'], string>, { a: string }>>,
  Expect<Equal<TupleToNestedObject<['a', 'b'], number>, { a: { b: number } }>>,
  Expect<Equal<TupleToNestedObject<['a', 'b', 'c'], boolean>, { a: { b: { c: boolean } } }>>,
  Expect<Equal<TupleToNestedObject<[], boolean>, boolean>>,
]
