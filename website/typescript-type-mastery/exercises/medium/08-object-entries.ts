type ObjectEntries<T, K extends keyof T = keyof T> = K extends keyof T
  ? [K, T[K] extends undefined ? undefined : T[K]]
  : never

import type { Equal, Expect } from '../_shared/type-utils'
interface Model {
  name: string
  age: number
  locations: string[] | null
}
type cases = [
  Expect<Equal<ObjectEntries<Model>, ['name', string] | ['age', number] | ['locations', string[] | null]>>,
]
