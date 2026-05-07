---
title: 07 类型体操题解
description: 60 道渐进式 TypeScript 类型体操题，从 Easy 到 Extreme，覆盖泛型、条件类型、递归、infer 提取等全部核心机制。
---

# 07 类型体操题解

> **前置知识**：泛型、条件类型、映射类型、模板字面量类型
>
> **目标**：通过 60 道渐进式练习，将类型系统知识转化为肌肉记忆

---

## Easy（1-20）

### 1. Hello World

```typescript
type HelloWorld = string;
// 测试
type test = Expect<Equal<HelloWorld, string>>;
```

### 2. Pick

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 测试
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>;
// { title: string; completed: boolean }
```

### 3. Readonly

```typescript
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### 4. Tuple To Object

```typescript
type TupleToObject<T extends readonly (string | number)[]> = {
  [P in T[number]]: P;
};

// 测试
const tuple = ['tesla', 'model 3', 'model X'] as const;
type result = TupleToObject<typeof tuple>;
// { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X' }
```

### 5. First of Array

```typescript
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

// 测试
type arr1 = ['a', 'b', 'c'];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // 'a'
type head2 = First<arr2>; // 3
```

### 6. Length of Tuple

```typescript
type Length<T extends readonly any[]> = T['length'];

type tesla = ['tesla', 'model 3', 'model X'];
type spaceX = ['FALCON 9', 'FALCON HEAVY'];

type teslaLength = Length<tesla>; // 3
type spaceXLength = Length<spaceX>; // 2
```

### 7. Exclude

```typescript
type MyExclude<T, U> = T extends U ? never : T;

type T0 = MyExclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

### 8. Awaited

```typescript
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type ExampleType = Promise<string>;
type Result = MyAwaited<ExampleType>; // string
```

### 9. If

```typescript
type If<C extends boolean, T, F> = C extends true ? T : F;

type A = If<true, 'a', 'b'>;  // 'a'
type B = If<false, 'a', 'b'>; // 'b'
```

### 10. Concat

```typescript
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type Result = Concat<[1], [2]>; // [1, 2]
```

### 11-20. 更多 Easy 题目

| 题号 | 题目 | 考点 |
|------|------|------|
| 11 | Includes | 数组包含检查 |
| 12 | Push | 数组追加 |
| 13 | Unshift | 数组前置 |
| 14 | Parameters | 提取函数参数 |
| 15 | ReturnType | 提取函数返回 |
| 16 | Omit | 排除属性 |
| 17 | Readonly 2 | 部分 Readonly |
| 18 | Deep Readonly | 递归 Readonly |
| 19 | Tuple to Union | 元组转联合 |
| 20 | Last of Array | 提取最后一个元素 |

---

## Medium（21-40）

### 21. Get Return Type

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

const fn = (v: boolean) => v ? 1 : 2;
type a = MyReturnType<typeof fn>; // 1 | 2
```

### 22. Omit

```typescript
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyOmit<Todo, 'description' | 'title'>;
// { completed: boolean }
```

### 23. Readonly 2

```typescript
type MyReadonly2<T, K extends keyof T = keyof T> = {
  readonly [P in K]: T[P];
} & {
  [P in Exclude<keyof T, K>]: T[P];
};

interface Todo {
  title: string;
  description?: string;
  completed: boolean;
}

const todo: MyReadonly2<Todo, 'title' | 'description'> = {
  title: 'Hey',
  description: 'foobar',
  completed: false,
};

todo.title = 'Hello'; // Error: cannot reassign a readonly property
todo.completed = true; // OK
```

### 24. Deep Readonly

```typescript
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

### 25. Tuple to Nested Object

```typescript
type TupleToNestedObject<T extends any[], U> = T extends [
  infer F extends string,
  ...infer Rest
]
  ? { [K in F]: TupleToNestedObject<Rest, U> }
  : U;

type a = TupleToNestedObject<['a'], string>; // { a: string }
type b = TupleToNestedObject<['a', 'b'], number>; // { a: { b: number } }
```

### 26. Flatten

```typescript
type Flatten<T extends any[]> = T extends [infer F, ...infer Rest]
  ? F extends any[]
    ? [...Flatten<F>, ...Flatten<Rest>]
    : [F, ...Flatten<Rest>]
  : [];

type flatten = Flatten<[1, [2, 3], [4, [5, 6]]]>;
// [1, 2, 3, 4, 5, 6]
```

### 27. Append to Object

```typescript
type AppendToObject<T, K extends keyof any, V> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};
```

### 28. Absolute

```typescript
type Absolute<T extends number | string | bigint> =
  `${T}` extends `-${infer U}` ? U : `${T}`;

type Test = Absolute<-100>; // '100'
```

### 29. String to Union

```typescript
type StringToUnion<T extends string> = T extends `${infer F}${infer Rest}`
  ? F | StringToUnion<Rest>
  : never;

type Test = StringToUnion<'abc'>; // 'a' | 'b' | 'c'
```

### 30. Merge

```typescript
type Merge<F, S> = {
  [K in keyof F | keyof S]: K extends keyof S
    ? S[K]
    : K extends keyof F
    ? F[K]
    : never;
};
```

### 31-40. 更多 Medium 题目

| 题号 | 题目 | 考点 |
|------|------|------|
| 31 | KebabCase | 模板字面量类型 |
| 32 | Diff | 对象差异 |
| 33 | AnyOf | 联合类型判断 |
| 34 | IsNever | never 判断 |
| 35 | IsUnion | 联合类型判断 |
| 36 | ReplaceKeys | 替换对象键 |
| 37 | Remove Index Signature | 移除索引签名 |
| 38 | Percentage Parser | 字符串解析 |
| 39 | Drop Char | 字符串删除字符 |
| 40 | MinusOne | 数字减一 |

---

## Hard（41-55）

### 41. Capitalize Words

```typescript
type CapitalizeWords<S extends string> =
  S extends `${infer F} ${infer Rest}`
    ? `${Capitalize<F>} ${CapitalizeWords<Rest>}`
    : Capitalize<S>;

type Test = CapitalizeWords<'hello world'>; // 'Hello World'
```

### 42. CamelCase

```typescript
type CamelCase<S extends string> =
  S extends `${infer F}_${infer Rest}`
    ? `${Lowercase<F>}${Capitalize<CamelCase<Rest>>}`
    : Lowercase<S>;

type Test = CamelCase<'hello_world_test'>; // 'helloWorldTest'
```

### 43. Parse URL Params

```typescript
type ParseUrlParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParseUrlParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? Param
  : never;

type Test = ParseUrlParams<'/users/:id/posts/:postId'>;
// 'id' | 'postId'
```

### 44. Union to Intersection

```typescript
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Test = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }
```

### 45. Get Optional

```typescript
type GetOptional<T> = {
  [K in keyof T as {} extends Pick<T, K> ? K : never]: T[K];
};
```

### 46. IsAny

```typescript
type IsAny<T> = 0 extends 1 & T ? true : false;
```

### 47. ReplaceAll

```typescript
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer F}${From}${infer Rest}`
  ? `${F}${To}${ReplaceAll<Rest, From, To>}`
  : S;
```

### 48. String to Number

```typescript
type StringToNumber<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;
```

### 49. Tuple Filter

```typescript
type FilterOut<T extends any[], F> = T extends [infer First, ...infer Rest]
  ? [First] extends [F]
    ? FilterOut<Rest, F>
    : [First, ...FilterOut<Rest, F>]
  : [];
```

### 50. Object Entries

```typescript
type ObjectEntries<T> = {
  [K in keyof T]-?: [K, T[K]];
}[keyof T];
```

### 51-55. 更多 Hard 题目

| 题号 | 题目 | 考点 |
|------|------|------|
| 51 | MapTypes | 条件映射 |
| 52 | Construct Tuple | 数字转元组 |
| 53 | Number Range | 数字范围生成 |
| 54 | Combination | 组合生成 |
| 55 | IsTuple | 元组判断 |

---

## Extreme（56-60）

### 56. JSON Parser Type

```typescript
// 类型级 JSON 解析器（简化版）
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
```

### 57. Type Arithmetic

```typescript
// 类型级加法
type Add<A extends number, B extends number> =
  [...Tuple<A>, ...Tuple<B>]['length'] & number;

type Tuple<N extends number, R extends any[] = []> =
  R['length'] extends N ? R : Tuple<N, [...R, any]>;
```

### 58. Curry

```typescript
type Curry<F> = F extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? (arg: First) => Curry<(...args: Rest) => R>
    : R
  : never;
```

### 59. Deep Mutable

```typescript
type DeepMutable<T> = T extends ReadonlyArray<infer E>
  ? Array<DeepMutable<E>>
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;
```

### 60. AllCombinations

```typescript
type AllCombinations<S extends string, U = StringToUnion<S>> =
  [U] extends [never]
    ? ''
    : U extends string
    ? `${U}${AllCombinations<never, Exclude<StringToUnion<S>, U>>}` | AllCombinations<never, Exclude<StringToUnion<S>, U>>
    : never;
```

---

## 练习策略

### 学习路径

```
Week 1-2: Easy 题目（1-20）
  ├── 目标：熟悉泛型和条件类型基础
  └── 每天 3-5 题

Week 3-4: Medium 题目（21-40）
  ├── 目标：掌握 infer、递归、模板字面量
  └── 每天 2-3 题

Week 5-6: Hard 题目（41-55）
  ├── 目标：类型级字符串操作和复杂推断
  └── 每天 1-2 题

Week 7-8: Extreme 题目（56-60）
  ├── 目标：图灵完备类型体操
  └── 每题可能需要 1-2 天
```

---

## 延伸阅读

- [Type Challenges GitHub](https://github.com/type-challenges/type-challenges)
- [Total TypeScript](https://www.totaltypescript.com/)
- [TypeScript Tips — Matt Pocock](https://www.totaltypescript.com/tips)
