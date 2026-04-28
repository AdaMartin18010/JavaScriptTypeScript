/**
 * 08. Absolute - 解答
 *
 * 解析：
 * 1. 将输入统一转为字符串形式：
 *    - `number` → `${T}` 利用模板字面量类型将数字转为字符串
 *    - `bigint` → 同样使用 `${T}`
 *    - `string` → 已经是字符串
 * 2. 使用 `S extends "-"${infer Rest}` 匹配并去除负号
 * 3. 对 `-0` 的特殊处理：去除负号后得到 `"0"`
 *
 * 关键技巧：
 * - 模板字面量类型 `${T}` 对数字/大整数的转换
 * - 字符串模式匹配去除前缀
 */

export type Absolute<T extends number | string | bigint> =
  `${T}` extends `-${infer Rest}` ? Rest : `${T}`;
