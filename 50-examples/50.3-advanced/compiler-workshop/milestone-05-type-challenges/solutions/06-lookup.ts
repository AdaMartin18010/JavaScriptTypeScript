/**
 * 06. Lookup - 解答
 *
 * 解析：
 * 利用分布式条件类型在联合类型上的自动分发行为。
 * 当 `U` 是联合类型（如 `Cat | Dog`）时：
 * `U extends { type: T } ? U : never`
 * 等价于：
 * `(Cat extends { type: T } ? Cat : never) | (Dog extends { type: T } ? Dog : never)`
 *
 * 当 `T = 'dog'` 时：
 * - `Cat extends { type: 'dog' }` → false → never
 * - `Dog extends { type: 'dog' }` → true → Dog
 * 结果：`never | Dog` → `Dog`
 */

export type LookUp<U, T> = U extends { type: T } ? U : never;
