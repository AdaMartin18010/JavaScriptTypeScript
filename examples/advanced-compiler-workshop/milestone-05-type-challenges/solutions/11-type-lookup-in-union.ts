/**
 * 11. Type Lookup in Union - 解答
 *
 * 解析：
 *
 * **UnionToIntersection<U>**
 * 利用函数参数位置的**逆变（contravariance）**特性：
 * `U extends (arg: infer R) => void ? R : never`
 * 当 `U` 是联合类型时，TypeScript 会将联合转换为交叉。
 * 这是类型系统的深层特性，涉及参数位置的子类型规则。
 *
 * 直觉解释：
 * - 若函数接受 `(x: A | B) => void`，则它也接受 `(x: A) => void` 和 `(x: B) => void`
 * - 反过来，若一个函数同时是 `(x: A) => void` 和 `(x: B) => void`，
 *   则它必须接受 `x: A & B`
 *
 * **GetOptional<T>**
 * 利用可选属性的特性：`{} extends Pick<T, K>` 当且仅当 `K` 是可选属性。
 * 因为如果 `K` 是必需的，`Pick<T, K>` 至少包含 `{ K: ... }`，不能是 `{}` 的超类型。
 */

export type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer R
) => void
  ? R
  : never;

export type GetOptional<T extends Record<string, unknown>> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
