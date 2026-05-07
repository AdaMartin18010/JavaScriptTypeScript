type OmitIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K]
}

import type { Equal, Expect } from '@type-challenges/utils'
type Foo = { [key: string]: any; foo(): void }
type Bar = { [key: number]: any; bar(): void; 0: string }
type cases = [
  Expect<Equal<OmitIndexSignature<Foo>, { foo(): void }>>,
  Expect<Equal<OmitIndexSignature<Bar>, { bar(): void; 0: string }>>,
]
