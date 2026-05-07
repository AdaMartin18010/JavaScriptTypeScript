type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

import type { Equal, Expect } from '../_shared/type-utils'
interface Model { name: string; count: number; isReadonly: boolean; isEnable: boolean }
type cases = [
  Expect<Equal<PickByType<Model, boolean>, { isReadonly: boolean; isEnable: boolean }>>,
]
