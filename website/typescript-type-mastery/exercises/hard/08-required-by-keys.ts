type RequiredByKeys<T, K extends keyof T = keyof T> = {
  [P in K]-?: T[P]
} & Omit<T, K> extends infer O
  ? { [P in keyof O]: O[P] }
  : never

import type { Equal, Expect } from '../_shared/type-utils'
interface User { name?: string; age?: number; address?: string }
type cases = [
  Expect<Equal<RequiredByKeys<User, 'name'>, { name: string; age?: number; address?: string }>>,
]
