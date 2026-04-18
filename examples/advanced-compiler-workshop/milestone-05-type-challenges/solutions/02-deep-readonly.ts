/**
 * 02. Deep Readonly - 解答
 *
 * 解析：
 * 1. 使用 `keyof T` 遍历对象的所有键
 * 2. 对每个属性的值类型 `T[K]` 判断：
 *    - 如果是函数 (`(...args: any[]) => any`)，保持原样（函数不需要递归 readonly）
 *    - 如果是对象类型（有 `keyof`），递归应用 `DeepReadonly`
 *    - 否则直接设为 `readonly`
 * 3. 使用 `Readonly<T>` 可以简化第一层，但需要自定义递归逻辑
 *
 * 关键技巧：
 * - `T extends Record<string, any>` 判断是否为对象
 * - 排除函数类型避免无限递归
 */

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (...args: unknown[]) => unknown
    ? T[K]
    : T[K] extends Record<string, unknown>
    ? DeepReadonly<T[K]>
    : T[K];
};
