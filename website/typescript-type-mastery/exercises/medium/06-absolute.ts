type Absolute<T extends number | string | bigint> = `${T}` extends `-${infer N}` ? N : `${T}`

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<Absolute<0>, '0'>>,
  Expect<Equal<Absolute<-0>, '0'>>,
  Expect<Equal<Absolute<10>, '10'>>,
  Expect<Equal<Absolute<-5>, '5'>>,
  Expect<Equal<Absolute<'a'>, 'a'>>,
  Expect<Equal<Absolute<-500_000n>, '500000'>>,
]
