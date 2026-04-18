/**
 * 10. Currying - 解答
 *
 * 解析：
 * 1. 使用 `infer` 解构函数类型：`(...args: infer Args) => infer R`
 * 2. 将 `Args` 分解为 `[infer First, ...infer Rest]`
 * 3. 返回一个新函数：`(First) => Currying<(...Rest) => R>`
 * 4. 当 `Args` 为空（无参数函数）时，终止递归，返回 `() => R`
 *
 * 关键技巧：
 * - 递归解构参数列表
 * - 每次消费一个参数，返回接受剩余参数的函数
 */

export type Currying<T> = T extends (...args: infer Args) => infer R
  ? Args extends [infer First, ...infer Rest]
    ? (arg: First) => Currying<(...args: Rest) => R>
    : () => R
  : never;
