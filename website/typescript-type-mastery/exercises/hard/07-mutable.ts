type Mutable<T extends readonly any[] | Record<string, any>> = T extends readonly any[]
  ? { -readonly [K in keyof T]: T[K] }
  : { -readonly [K in keyof T]: T[K] }

import type { Equal, Expect } from '../_shared/type-utils'
interface Todo1 { readonly title: string; readonly description: string; readonly completed: boolean }
type cases = [
  Expect<Equal<Mutable<Readonly<Todo1>>, { title: string; description: string; completed: boolean }>>,
  Expect<Equal<Mutable<readonly [1, 2, 3]>, [1, 2, 3]>>,
]
