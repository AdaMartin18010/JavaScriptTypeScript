/**
 * 03. Tuple to Union - 解答
 *
 * 解析：
 * 元组类型是可索引类型，使用 `T[number]` 可以获取元组所有元素的联合类型。
 * 这是 TypeScript 类型系统的一个内置特性：数组/元组的 number 索引访问返回元素联合。
 *
 * 例如：
 * - `[1, 2, 3][number]` → `1 | 2 | 3`
 * - `['a', 'b'][number]` → `'a' | 'b'`
 */

export type TupleToUnion<T extends readonly unknown[]> = T[number];
