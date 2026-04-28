/**
 * 09. String Join - 解答
 *
 * 解析：
 * 1. 递归分解数组：`[infer First, ...infer Rest]`
 * 2. 对 `Rest` 是否为空做分支：
 *    - `Rest` 为空 → 返回 `First`（最后一个元素，无需分隔符）
 *    - `Rest` 非空 → 返回 `${First}${U}${StringJoin<Rest, U>}`
 * 3. 空数组为终止条件，返回 `''`
 *
 * 关键技巧：
 * - 模板字面量类型拼接字符串
 * - 递归处理数组尾部
 */

export type StringJoin<T extends string[], U extends string> = T extends [infer First extends string, ...infer Rest extends string[]]
  ? Rest extends []
    ? First
    : `${First}${U}${StringJoin<Rest, U>}`
  : '';
