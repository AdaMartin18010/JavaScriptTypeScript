type DecodeChar<S extends string> = S extends '&quot;' ? '"'
  : S extends '&apos;' ? "'"
  : S extends '&gt;' ? '>'
  : S extends '&lt;' ? '<'
  : S extends '&frasl;' ? '/'
  : S extends '&amp;' ? '&'
  : S

type DecodeHtml<S extends string> = S extends `${infer L}${infer R}`
  ? L extends '&'
    ? R extends `${infer E}${infer Rest}`
      ? E extends ';'
        ? `${'&'}${DecodeHtml<Rest>}`
        : DecodeEntity<`${L}${R}`>
      : L
    : `${L}${DecodeHtml<R>}`
  : S

type DecodeEntity<S extends string, Acc extends string = ''> = S extends `${infer C}${infer Rest}`
  ? C extends ';'
    ? `${DecodeChar<`${Acc};`>}${DecodeHtml<Rest>}`
    : DecodeEntity<Rest, `${Acc}${C}`>
  : Acc

import type { Equal, Expect } from '../_shared/type-utils'
type cases = [
  Expect<Equal<DecodeHtml<'&lt;&gt;'>, '<>'>>,
  Expect<Equal<DecodeHtml<'&amp;'>, '&'>>,
]
