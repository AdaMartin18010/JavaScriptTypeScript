// ============================================
// 05 - Length of Tuple
// 难度: ⭐
// ============================================

// 题目:
// 创建一个通用的 `Length<T>`，接受一个只读的元组，返回这个元组的长度。

// 例如:
// type tesla = ['tesla', 'model 3', 'model X', 'model Y']
// type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']
// type teslaLength = Length<tesla>  // 期望: 4
// type spaceXLength = Length<spaceX> // 期望: 5

type Length<T extends readonly any[]> = T['length']

// ============ 测试用例 ============
import type { Equal, Expect } from '../_shared/type-utils'

const tesla = ['tesla', 'model 3', 'model X', 'model Y'] as const
const spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT'] as const

type cases = [
  Expect<Equal<Length<typeof tesla>, 4>>,
  Expect<Equal<Length<typeof spaceX>, 5>>,
  // @ts-expect-error
  Length<5>,
  // @ts-expect-error
  Length<'hello world'>,
]
