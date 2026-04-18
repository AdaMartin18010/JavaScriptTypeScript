/**
 * 05. Tuple Filter - 解答
 *
 * 解析：
 * 1. 使用 `infer` 解构元组：`[infer First, ...infer Rest]`
 * 2. 检查 `First` 是否可赋值给 `U`：
 *    - 若 `First extends U` 为真 → 过滤掉（返回 `TupleFilter<Rest, U>`）
 *    - 否则 → 保留（返回 `[First, ...TupleFilter<Rest, U>]`）
 * 3. 空元组 `[]` 为终止条件
 *
 * 注意：
 * 为了避免分布式条件类型对 `First` 的影响，
 * 需要将 `First` 用 `[First]` 包裹后再 extends。
 */

export type TupleFilter<T extends readonly unknown[], U> = T extends [infer First, ...infer Rest]
  ? [First] extends [U]
    ? TupleFilter<Rest, U>
    : [First, ...TupleFilter<Rest, U>]
  : [];
