---
title: 02 条件类型精通
description: 掌握 TypeScript 条件类型的全部机制：infer 提取、递归条件、分布式条件、never 过滤，以及真实库中的条件类型设计模式。
---

# 02 条件类型精通

> **前置知识**：泛型基础、基础条件类型语法（`T extends U ? X : Y`）
>
> **目标**：能够独立实现类型级别的 `ReturnType`、`Parameters`、`Awaited` 等工具类型，理解真实库中的条件类型设计

---

## 1. 条件类型的三态本质

TypeScript 的条件类型不是简单的布尔判断，而是**类型集合的成员关系判断**：

```typescript
// T extends U 的含义：T 是否是 U 的子类型？
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;   // true  — 'hello' ⊆ string
type B = IsString<string>;    // true  — string ⊆ string
type C = IsString<number>;    // false — number ⊄ string
type D = IsString<any>;       // true  — any 是任何类型的父/子类型（特殊规则）
type E = IsString<never>;     // never — never 是空集，对联合类型分发时消失
```

### never 的特殊行为

```typescript
// never 在分布式条件类型中的"过滤"效果
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type T1 = Exclude<'a' | 'b' | 'c', 'a'>;  // 'b' | 'c'
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'd'>;  // 'a'

// 原理：never 在联合类型中被吸收（A | never = A）
```

---

## 2. infer 提取模式大全

### 2.1 提取函数签名

```typescript
// 提取返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;        // string
type R2 = MyReturnType<() => Promise<number>>; // Promise<number>

// 提取参数类型元组
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type P1 = MyParameters<(a: string, b: number) => void>;  // [string, number]

// 提取 this 类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : never;
```

### 2.2 提取 Promise 解析类型

```typescript
// 递归提取 Promise 嵌套
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type A1 = MyAwaited<Promise<string>>;              // string
type A2 = MyAwaited<Promise<Promise<number>>>;     // number
type A3 = MyAwaited<string>;                        // string（非 Promise 直接返回）

// 对比：TS 内置的 Awaited 更完善（处理 thenable、错误边界）
type A4 = Awaited<Promise<Promise<number>>>;       // number
```

### 2.3 提取数组/元组元素

```typescript
// 提取数组元素
type ElementType<T> = T extends (infer E)[] ? E : never;
type E1 = ElementType<string[]>;   // string

// 提取元组长度
type TupleLength<T extends readonly any[]> = T extends readonly any[] ? T['length'] : never;
type L1 = TupleLength<['a', 'b', 'c']>;  // 3

// 提取元组最后一个元素
type Last<T extends readonly any[]> = T extends [...any[], infer L] ? L : never;
type L2 = Last<[1, 2, 3]>;  // 3

// 提取元组第一个元素
type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never;
type F1 = First<[1, 2, 3]>;  // 1
```

### 2.4 提取对象属性类型

```typescript
// 提取特定键的值类型（处理可选属性）
type GetOptional<T, K extends keyof T> = T extends { [P in K]-?: infer V } ? V : never;

// 提取函数重载的返回值（取最后一个重载）
type LastReturnType<T> = T extends { (...args: any[]): infer R } ? R : never;
```

---

## 3. 递归条件类型

### 3.1 递归对象转换

```typescript
// 递归地将所有属性设为可选
type DeepPartial<T> = T extends object
  ? T extends Function
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 递归地去除 readonly
type DeepMutable<T> = T extends readonly any[]
  ? T extends readonly (infer E)[]
    ? DeepMutable<E>[]
    : never
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

// 递归扁平化
type DeepFlatten<T> = T extends readonly (infer E)[]
  ? DeepFlatten<E>
  : T extends object
  ? { [K in keyof T]: DeepFlatten<T[K]> }
  : T;
```

### 3.2 类型级 JSON 解析器（极限挑战）

```typescript
// 解析 JSON 字符串的类型（简化版）
type ParseJSON<T extends string> = T extends `"${infer S}"` ? S
  : T extends `${infer N extends number}` ? N
  : T extends 'true' ? true
  : T extends 'false' ? false
  : T extends 'null' ? null
  : T extends `[${infer Content}]` ? ParseArray<Content>
  : T extends `{${infer Content}}` ? ParseObject<Content>
  : never;

// 辅助类型（简化示意，完整实现需数百行）
type ParseArray<T extends string> = T extends '' ? []
  : T extends `${infer Item},${infer Rest}`
  ? [ParseJSON<Item>, ...ParseArray<Rest>]
  : [ParseJSON<T>];

type ParseObject<T extends string> = T extends '' ? {}
  : T extends `"${infer K}":${infer V},${infer Rest}`
  ? { [P in K]: ParseJSON<V> } & ParseObject<Rest>
  : T extends `"${infer K}":${infer V}`
  ? { [P in K]: ParseJSON<V> }
  : {};

// 使用
type Parsed = ParseJSON<`{"name":"Alice","age":30}`>;
//   ^? { name: "Alice"; age: 30 }
```

---

## 4. 分布式条件类型的高级用法

### 4.1 联合类型的映射转换

```typescript
// 将联合类型中的每个成员转为 Promise
type ToPromise<T> = T extends any ? Promise<T> : never;
type P = ToPromise<string | number>;  // Promise<string> | Promise<number>

// 将联合类型中的每个成员包装为对象
type Wrap<T, K extends string> = T extends any ? { [P in K]: T } : never;
type W = Wrap<string | number, 'value'>;  // { value: string } | { value: number }
```

### 4.2 联合类型的过滤与分组

```typescript
// 从联合类型中排除 undefined 和 null
type NonNullable<T> = T extends null | undefined ? never : T;

// 提取联合类型中的对象成员
type ObjectMembers<T> = T extends object ? (T extends any[] ? never : T) : never;
type O = ObjectMembers<string | { a: 1 } | [1, 2]>;  // { a: 1 }

// 按类型分组
type GroupByType<T> = T extends string ? { strings: T }
  : T extends number ? { numbers: T }
  : T extends boolean ? { booleans: T }
  : { others: T };
```

---

## 5. 真实库中的条件类型模式

### 5.1 Zod 中的类型推导

```typescript
// Zod 的核心模式：从 schema 对象推导 TypeScript 类型
type infer<T> = T extends { _output: infer O } ? O : never;

// 简化示意
const UserSchema = z.object({ name: z.string(), age: z.number() });
type User = z.infer<typeof UserSchema>;  // { name: string; age: number }
```

### 5.2 tRPC 中的路由类型

```typescript
// tRPC 使用条件类型从 router 对象推导 API 类型
type RouterOutputs<TRouter extends AnyRouter> = TRouter extends { _def: { _ctx: infer C; router: infer R } }
  ? R extends Record<string, AnyProcedure>
    ? { [K in keyof R]: R[K] extends AnyProcedure ? inferProcedureOutput<R[K]> : never }
    : never
  : never;
```

### 5.3 Prisma 中的查询结果类型

```typescript
// Prisma 使用条件类型根据 include/select 参数动态调整返回类型
type GetPayload<S extends Select, I extends Include> = BaseModel &
  (S extends { id: true } ? { id: string } : {}) &
  (I extends { posts: true } ? { posts: Post[] } : {});
```

---

## 常见陷阱

| 陷阱 | 示例 | 修正 |
|------|------|------|
| **infer 位置不当** | `T extends infer U ? U : never` | 确保 infer 在 `extends` 右侧的目标类型中 |
| **联合类型的整体判断** | `string | number extends string ? true : false` | 这是 false（整体判断）；如需分发需用裸类型参数 |
| **递归深度超限** | 无终止条件的递归类型 | 添加终止条件，限制递归深度 |
| **any 的传染性** | 条件类型中 any 可能导致意外结果 | 在工具类型入口处过滤 any |

---

## 练习

### Easy

1. 用条件类型实现 `IsArray<T>` — 判断 T 是否为数组类型。
2. 实现 `GetPromiseType<T>` — 提取 Promise 的泛型参数。

### Medium

1. 实现 `DeepRequired<T>` — 递归地将所有属性设为 required。
2. 实现 `TupleToUnion<T>` — 将元组转为联合类型（仅使用条件类型，不用索引访问）。

### Hard

1. 实现 `UnionToIntersection<U>` — 将 `A | B` 转为 `A & B`。
2. 实现 `StringToUnion<S>` — 将字符串 `"abc"` 转为 `"a" | "b" | "c"`。

---

## 延伸阅读

- [TypeScript Handbook — Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook — infer](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Total TypeScript — Advanced Patterns](https://www.totaltypescript.com/tips)
