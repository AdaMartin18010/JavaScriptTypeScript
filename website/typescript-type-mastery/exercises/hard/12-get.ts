type Get<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer F}.${infer R}`
    ? F extends keyof T
      ? Get<T[F], R>
      : never
    : never

import type { Equal, Expect } from '@type-challenges/utils'
type Data = { foo: { bar: { value: 'foobar'; count: 6 }; included: true }; hello: 'world' }
type cases = [
  Expect<Equal<Get<Data, 'hello'>, 'world'>>,
  Expect<Equal<Get<Data, 'foo.bar.count'>, 6>>,
  Expect<Equal<Get<Data, 'foo.bar'>, { value: 'foobar'; count: 6 }>>,
]
