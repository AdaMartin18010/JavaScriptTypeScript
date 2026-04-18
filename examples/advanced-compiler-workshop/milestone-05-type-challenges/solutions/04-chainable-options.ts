/**
 * 04. Chainable Options - 解答
 *
 * 解析：
 * 1. `option` 方法接收键 `K` 和值 `V`
 * 2. 返回新的 `Chainable`，其类型参数累积了之前的所有配置项
 * 3. `get()` 方法返回累积的配置对象 `T`
 *
 * 关键技巧：
 * - 使用 `T & Record<K, V>` 扩展对象类型
 * - `Omit<T, K>` 先移除同名的已有属性，避免类型冲突
 */

export type Chainable<T = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<Omit<T, K> & Record<K, V>>;
  get(): T;
};
