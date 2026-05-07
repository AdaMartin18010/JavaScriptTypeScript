type TupleToUnionObject<T extends readonly any[]> = T extends readonly [infer F, ...infer R]
  ? F extends PropertyKey
    ? { [K in F]: true } & TupleToUnionObject<R>
    : never
  : {}

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<TupleToUnionObject<['a', 'b']>, { a: true } & { b: true }>>,
]
