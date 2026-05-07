type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

import type { Equal, Expect } from '@type-challenges/utils'
type Foo = {
  [key: string]: any
  foo(): void
}
type Bar = {
  [key: number]: any
  bar(): void
  0: string
}
type cases = [
  Expect<Equal<RemoveIndexSignature<Foo>, { foo(): void }>>,
  Expect<Equal<RemoveIndexSignature<Bar>, { bar(): void; 0: string }>>,
]
