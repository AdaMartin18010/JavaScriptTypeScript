// Exercise: Type-level JSON Parser (Simplified)
// From: type-challenges/questions/06228-extreme-json-parser

type ParseJSON<T extends string> = T extends `"${infer S}"`
  ? S
  : T extends `${infer N extends number}`
  ? N
  : T extends 'true'
  ? true
  : T extends 'false'
  ? false
  : T extends 'null'
  ? null
  : T extends `[${infer Content}]`
  ? ParseArray<Content>
  : T extends `{${infer Content}}`
  ? ParseObject<Content>
  : never;

type ParseArray<T extends string> = T extends ''
  ? []
  : T extends `${infer Item},${infer Rest}`
  ? [ParseJSON<Item>, ...ParseArray<Rest>]
  : [ParseJSON<T>];

type ParseObject<T extends string> = T extends ''
  ? {}
  : T extends `"${infer K}":${infer V},${infer Rest}`
  ? { [P in K]: ParseJSON<V> } & ParseObject<Rest>
  : T extends `"${infer K}":${infer V}`
  ? { [P in K]: ParseJSON<V> }
  : {};

// Test cases
type T1 = ParseJSON<`{"name":"Alice","age":30}`>;
// Expected: { name: "Alice"; age: 30 }
