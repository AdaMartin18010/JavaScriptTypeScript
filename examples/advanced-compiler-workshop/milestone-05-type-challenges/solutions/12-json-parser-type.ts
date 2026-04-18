/**
 * 12. JSON Parser Type - 解答
 *
 * 解析：
 * 类型层面的 JSON 解析器是 TS 类型系统的极限应用。
 * 本解答实现一个能处理常见 JSON 子集的解析器。
 *
 * 核心架构：
 * 1. **Tokenizer（分词）**：将字符串拆分为 Token 序列（类型层面）
 * 2. **Parser（解析）**：将 Token 序列转换为类型结构
 * 3. **Value 解析**：处理 null, boolean, number, string, array, object
 *
 * 由于 TS 模板字面量类型的递归深度限制（约 50 层），
 * 本实现适用于中小型 JSON 字符串。
 *
 * 关键技巧：
 * - 使用 `Trim<>` 去除空白字符
 * - 使用 `ParseValue<>` 分发到具体解析器
 * - 使用 `ParseString<>`, `ParseNumber<>`, `ParseArray<>`, `ParseObject<>` 分别处理
 * - 对象解析使用 `ParseObjectEntries<>` 递归提取键值对
 */

// ==================== 工具类型 ====================

type Whitespace = ' ' | '\n' | '\t' | '\r';

type TrimLeft<S extends string> = S extends `${Whitespace}${infer Rest}` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends `${infer Rest}${Whitespace}` ? TrimRight<Rest> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

// ==================== 值解析分发 ====================

export type JSONParser<T extends string> = ParseValue<Trim<T>>;

type ParseValue<S extends string> =
  | ParseNull<S>
  | ParseBoolean<S>
  | ParseNumber<S>
  | ParseString<S>
  | ParseArray<S>
  | ParseObject<S>;

// ==================== 基础类型解析 ====================

type ParseNull<S extends string> = S extends 'null' ? null : never;

type ParseBoolean<S extends string> = S extends 'true' ? true : S extends 'false' ? false : never;

// 数字解析：将数字字符串转为数字字面量类型
type ParseNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

// 字符串解析：去除首尾引号
type ParseString<S extends string> = S extends `"${infer Content}"` ? Content : never;

// ==================== 数组解析 ====================

type ParseArray<S extends string> = S extends `[${infer Content}]`
  ? ParseArrayItems<Trim<Content>>
  : never;

type ParseArrayItems<S extends string> = S extends ''
  ? []
  : S extends `${infer Item},${infer Rest}`
  ? [ParseValue<Trim<Item>>, ...ParseArrayItems<Trim<Rest>>]
  : [ParseValue<Trim<S>>];

// ==================== 对象解析 ====================

type ParseObject<S extends string> = S extends `{${infer Content}}`
  ? ParseObjectEntries<Trim<Content>>
  : never;

// 解析对象中的键值对列表
type ParseObjectEntries<S extends string> = S extends ''
  ? {}
  : S extends `${infer Entry},${infer Rest}`
  ? MergeEntry<ParseEntry<Trim<Entry>>, ParseObjectEntries<Trim<Rest>>>
  : ParseEntry<Trim<S>>;

// 解析单个键值对 "key": value
type ParseEntry<S extends string> = S extends `"${infer Key}":${infer Value}`
  ? { [K in Key]: ParseValue<Trim<Value>> }
  : {};

// 合并两个对象类型
type MergeEntry<A, B> = A & B extends infer O ? { [K in keyof O]: O[K] } : never;
