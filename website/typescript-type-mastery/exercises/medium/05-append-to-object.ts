type AppendToObject<T, U extends string, V> = {
  [K in keyof T | U]: K extends keyof T ? T[K] : V
}

import type { Equal, Expect } from '@type-challenges/utils'
type test = { key: 'cat'; value: 'green'; sun: true }
type cases = [
  Expect<Equal<AppendToObject<test, 'home', boolean>, { key: 'cat'; value: 'green'; sun: true; home: boolean }>>,
]
