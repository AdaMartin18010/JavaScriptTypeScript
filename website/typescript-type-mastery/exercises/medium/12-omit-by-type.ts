type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

import type { Equal, Expect } from '@type-challenges/utils'
interface Model {
  name: string
  count: number
  isReadonly: boolean
  isEnable: boolean
}
type cases = [
  Expect<Equal<OmitByType<Model, boolean>, { name: string; count: number }>>,
]
