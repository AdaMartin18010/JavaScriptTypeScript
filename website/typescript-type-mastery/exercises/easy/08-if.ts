type If<C extends boolean, T, F> = C extends true ? T : F

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<If<true, 'a', 'b'>, 'a'>>,
  Expect<Equal<If<false, 'a', 2>, 2>>,
]
