type IsNever<T> = [T] extends [never] ? true : false

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<IsNever<never>, true>>,
  Expect<Equal<IsNever<never | string>, false>>,
  Expect<Equal<IsNever<''>, false>>,
  Expect<Equal<IsNever<undefined>, false>>,
]
