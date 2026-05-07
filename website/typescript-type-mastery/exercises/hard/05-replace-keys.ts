type ReplaceKeys<U, T, Y> = {
  [K in keyof U]: K extends T
    ? K extends keyof Y
      ? Y[K]
      : never
    : U[K]
}

import type { Equal, Expect } from '@type-challenges/utils'
type NodeA = { type: 'A'; name: string; flag: number }
type NodeB = { type: 'B'; id: number; flag: number }
type NodeC = { type: 'C'; name: string; flag: number }
type Nodes = NodeA | NodeB | NodeC
type ReplacedNodes = ReplaceKeys<Nodes, 'name' | 'flag', { name: number; flag: string }>
type cases = [
  Expect<Equal<ReplacedNodes, { type: 'A'; name: number; flag: string } | { type: 'B'; id: number; flag: string } | { type: 'C'; name: number; flag: string }>>,
]
