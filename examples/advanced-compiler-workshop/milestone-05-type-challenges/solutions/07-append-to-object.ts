/**
 * 07. Append to Object - 解答
 *
 * 解析：
 * 使用映射类型遍历 `T` 的所有键 **加上新键 `K`**：
 * `{ [P in keyof T | K]: ... }`
 *
 * 对每个键 `P`：
 * - 如果 `P extends K`（即 `P` 就是新键），使用新类型 `V`
 * - 否则，从原对象 `T` 中取类型：`T[P]`
 *
 * 关键技巧：
 * - `keyof T | K` 将新键加入键集合
 * - `P extends K` 在映射类型内部做条件判断
 */

export type AppendToObject<T extends Record<string, unknown>, K extends string, V> = {
  [P in keyof T | K]: P extends K ? V : P extends keyof T ? T[P] : never;
};
