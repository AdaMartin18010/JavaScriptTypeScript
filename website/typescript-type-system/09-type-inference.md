---
title: 09 类型推断算法 — 上下文推断、最佳公共类型与 ReturnType
description: 深入TypeScript类型推断算法：上下文类型推断（contextual typing）、泛型推断机制、最佳公共类型（best common type）、ReturnType推断、协变/逆变位置推断、infer与推断优先级、常见推断陷阱与调试技巧。
keywords:
  - typescript type inference
  - contextual typing
  - best common type
  - generic inference
  - return type inference
  - type widening
  - type narrowing
  - inference priorities
  - covariant inference
  - infer algorithm
editLink: false
lastUpdated: true
---

# 09 类型推断算法 — 上下文推断、最佳公共类型与 ReturnType

:::tip 本章核心
类型推断是 TypeScript 编译器"猜测"类型的能力。理解上下文推断、最佳公共类型和泛型推断的机制，能让你预判编译器的行为，写出更少类型注解、更强类型安全的代码。
:::

---

## 9.1 类型推断概述

TypeScript 类型推断（Type Inference）是指编译器在没有显式类型注解的情况下，自动推导出变量、表达式和函数返回类型的过程。

```mermaid
flowchart LR
    Code["源代码"] --> Parser["解析器 AST"]
    Parser --> Binder["绑定器"]
    Binder --> Checker["类型检查器<br/>推断引擎"]
    Checker --> Types["推断出的类型"]
```

### 9.1.1 何时发生推断

```ts
// 1. 变量初始化推断
let x = 10;           // ✅ x: number
const y = "hello";    // ✅ y: "hello"（字面量类型）

// 2. 函数返回值推断
function add(a: number, b: number) {
  return a + b;       // ✅ 返回类型推断为 number
}

// 3. 泛型参数推断
function identity<T>(x: T) { return x; }
const id = identity(42); // ✅ T 推断为 42

// 4. 数组元素推断
const arr = [1, "two", true]; // ✅ (string | number | boolean)[]
```

---

## 9.2 上下文类型推断（Contextual Typing）

上下文类型推断是指 TypeScript 根据**表达式所在的位置**推断其类型的机制。这是 TypeScript 最智能的推断能力之一。

### 9.2.1 回调函数参数推断

```ts
// 没有上下文类型时，参数类型为 any（noImplicitAny 关闭）或报错
const nums = [1, 2, 3];

// ✅ 上下文推断：item 被推断为 number
const doubled = nums.map((item) => item * 2);
// item: number，因为 nums 是 number[]，map 的回调第一个参数是元素类型

// ✅ 上下文推断：index 被推断为 number
nums.forEach((item, index) => {
  console.log(index); // index: number
});
```

### 9.2.2 赋值位置的上下文推断

```ts
// 左侧类型为右侧提供上下文
type Point = { x: number; y: number };

const p: Point = {
  x: 1,
  y: 2,
  // z: 3 // ❌ 上下文推断为 Point，多余属性报错
};

// 回调参数由函数签名上下文推断
function onClick(handler: (e: MouseEvent) => void) {
  // ...
}

onClick((e) => {
  // ✅ e 被上下文推断为 MouseEvent
  console.log(e.clientX);
});
```

### 9.2.3 对象字面量方法的上下文推断

```ts
interface EventEmitter {
  on(event: "click", handler: (x: number, y: number) => void): void;
  on(event: "keydown", handler: (key: string) => void): void;
}

declare const emitter: EventEmitter;

// ✅ 根据传入的事件名，推断回调参数类型
emitter.on("click", (x, y) => {
  // x: number, y: number
});

emitter.on("keydown", (key) => {
  // key: string
});
```

### 9.2.4 上下文推断 vs 常规推断

| 场景 | 推断方式 | 结果 |
|------|----------|------|
| `const x = "hello"` | 常规推断 | `"hello"`（字面量） |
| `let x = "hello"` | 常规推断 + 拓宽 | `string` |
| `fn((x) => x)` | 上下文推断 | 由 fn 的参数类型决定 x |
| `const arr = [1, 2]` | 最佳公共类型 | `number[]` |
| `const p: Point = { x: 1 }` | 上下文 + 多余属性检查 | 报错：缺少 y |

---

## 9.3 泛型推断机制

泛型推断是 TypeScript 编译器根据传入的**实际参数**推断泛型类型参数的过程。

### 9.3.1 从值推断泛型参数

```ts
function identity<T>(arg: T): T {
  return arg;
}

const a = identity("hello");  // ✅ T 推断为 "hello"
const b = identity(42);       // ✅ T 推断为 42
const c = identity([1, 2]);   // ✅ T 推断为 number[]
```

### 9.3.2 多泛型参数的推断

```ts
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// T 从 arr 推断为 string
// U 从 fn 的返回类型推断为 number
const lengths = map(["a", "bb", "ccc"], (s) => s.length);
// ✅ lengths: number[]
```

### 9.3.3 泛型推断的优先级

```ts
// 1. 显式指定优先级最高
identity<string>("hello"); // T = string（即使传入字面量）

// 2. 从参数位置推断
function fn<T>(a: T, b: T): [T, T] { return [a, b]; }
const r = fn("hello", "world"); // T 推断为 "hello" | "world"？
// 实际上：T 推断为 string（两个参数的公共类型）

// 3. 从返回类型位置推断（上下文）
const x: string = identity("hello"); // T 可能被上下文约束
```

### 9.3.4 泛型推断的约束参与

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

const l1 = longest("hello", "world"); // ✅ T 推断为 string
const l2 = longest([1, 2], [3, 4, 5]); // ✅ T 推断为 number[]
// longest(1, 2); // ❌ number 没有 length 属性
```

---

## 9.4 最佳公共类型（Best Common Type）

当 TypeScript 需要从多个表达式中推断出一个共同类型时，它会计算**最佳公共类型**。

### 9.4.1 数组的最佳公共类型

```ts
// 数组元素类型的推断：寻找所有元素的最佳公共类型
const arr1 = [1, 2, 3];              // ✅ number[]
const arr2 = [1, "two"];             // ✅ (string | number)[]
const arr3 = [1, "two", true];       // ✅ (string | number | boolean)[]

// 对象数组的最佳公共类型
const shapes = [
  { kind: "circle" as const, radius: 10 },
  { kind: "square" as const, side: 5 },
];
// shapes: { kind: "circle"; radius: number } | { kind: "square"; side: number }[]
// 注意：这不是理想的公共类型！
```

### 9.4.2 条件表达式的最佳公共类型

```ts
// 三元运算符的两个分支需要公共类型
const value = Math.random() > 0.5 ? "hello" : 42;
// ✅ value: string | number

// 使用 as const 影响推断
const v1 = Math.random() > 0.5 ? "hello" as const : "world" as const;
// ✅ v1: "hello" | "world"
```

### 9.4.3 显式指定改善推断

```ts
// ❌ 推断不精确
const badShapes = [
  { kind: "circle", radius: 10 },
  { kind: "square", side: 5 },
];
// badShapes: { kind: string; radius: number; side?: undefined } | ...

// ✅ 显式类型注解
interface Circle { kind: "circle"; radius: number; }
interface Square { kind: "square"; side: number; }
type Shape = Circle | Square;

const goodShapes: Shape[] = [
  { kind: "circle", radius: 10 },
  { kind: "square", side: 5 },
]; // ✅ 精确的联合类型
```

---

## 9.5 ReturnType 推断

函数返回类型的推断遵循特定规则，理解这些规则有助于编写更清晰的函数签名。

### 9.5.1 基本返回类型推断

```ts
// 无返回语句 → void
function noop() {} // ✅ 返回类型: void

// 有 return 但没有值 → undefined
function maybeReturn(flag: boolean) {
  if (flag) return;
} // ✅ 返回类型: undefined

// return 多个不同类型 → 最佳公共类型
function getValue(flag: boolean) {
  if (flag) return "hello";
  return 42;
} // ✅ 返回类型: string | number
```

### 9.5.2 异步函数返回类型推断

```ts
// async 函数总是返回 Promise
async function fetchData() {
  return { id: 1, name: "Alice" };
}
// ✅ 返回类型: Promise<{ id: number; name: string }>

async function maybeFetch(flag: boolean) {
  if (!flag) return null;
  return { id: 1 };
}
// ✅ 返回类型: Promise<null | { id: number }>
```

### 9.5.3 使用泛型控制返回类型

```ts
// 泛型返回类型
type ApiResponse<T> = { data: T; status: number };

async function apiCall<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();
  return { data, status: response.status };
}

// 使用时指定 T
const user = apiCall<{ name: string }>("/api/user");
// ✅ Promise<ApiResponse<{ name: string }>>
```

### 9.5.4 返回类型与类型断言

```ts
// ❌ 隐式 any 的返回
function unsafeParse(json: string) {
  return JSON.parse(json); // ✅ 返回类型: any
}

// ✅ 使用泛型推断返回值
type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };
function safeParse<T = JSONValue>(json: string): T {
  return JSON.parse(json);
}

const obj = safeParse<{ name: string }>('{"name":"Alice"}');
// ✅ obj: { name: string }
```

---

## 9.6 从参数推断泛型

泛型推断不仅限于返回值，还可以从函数参数的结构中推断。

### 9.6.1 从对象属性推断

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };

// T 从 obj 推断为 typeof user
// K 从 key 推断为 "name"
getProp(user, "name"); // ✅ 返回 string
getProp(user, "age");  // ✅ 返回 number
```

### 9.6.2 从回调推断

```ts
function mapArray<T, U>(arr: T[], mapper: (item: T, index: number) => U): U[] {
  return arr.map(mapper);
}

// T 从 arr 推断为 string
// U 从 mapper 的返回类型推断为 number
const result = mapArray(["a", "bb"], (item, index) => item.length + index);
// ✅ result: number[]
```

### 9.6.3 从元组推断

```ts
function makePair<T extends readonly unknown[]>(...args: T): T {
  return args;
}

const p1 = makePair("hello", 42); // ✅ T 推断为 [string, number]
const p2 = makePair(1, 2, 3);     // ✅ T 推断为 [number, number, number]
```

---

## 9.7 协变/逆变位置推断

类型推断会考虑类型在表达式中的**位置**（协变、逆变、双变或不变）。

### 9.7.1 协变位置的推断

```ts
// 返回值位置是协变的
type Getter<T> = () => T;

let getString: Getter<string> = () => "hello";
let getHello: Getter<"hello"> = () => "hello";

getString = getHello; // ✅ 协变："hello" <: string，所以 Getter<"hello"> <: Getter<string>
```

### 9.7.2 逆变位置的推断

```ts
// 参数位置是逆变的（strictFunctionTypes 开启）
type Setter<T> = (value: T) => void;

let setString: Setter<string> = (v) => {};
let setHello: Setter<"hello"> = (v) => {};

// setString = setHello; // ❌ 逆变：不能将 Setter<"hello"> 赋给 Setter<string>
setHello = setString; // ✅ 反向成立
```

### 9.7.3 推断与变型的交互

```ts
// 泛型在多个位置出现时，推断会综合所有位置
function combined<T>(get: () => T, set: (v: T) => void): T {
  const v = get();
  set(v);
  return v;
}

// T 出现在协变（get 返回值）和逆变（set 参数）位置
// 推断会寻找一个满足双方约束的类型
const x = combined(
  () => "hello",
  (v) => console.log(v)
); // ✅ T 推断为 string
```

---

## 9.8 infer 与类型推断算法

`infer` 关键字是类型推断算法在**条件类型**中的显式应用。理解 infer 就是理解编译器如何"猜测"类型。

### 9.8.1 infer 的推断优先级

```ts
// infer 会从候选类型中选择最精确（最具体）的类型
type ExtractArray<T> = T extends (infer U)[] ? U : never;

type E1 = ExtractArray<string[]>;     // ✅ U 推断为 string
type E2 = ExtractArray<("a" | "b")[]>; // ✅ U 推断为 "a" | "b"
```

### 9.8.2 多 infer 的协同推断

```ts
// 同时推断多个位置
type FunctionInfo<T> = T extends (...args: infer P) => infer R
  ? { params: P; returnType: R }
  : never;

type F = FunctionInfo<(a: string, b: number) => boolean>;
// ✅ { params: [string, number]; returnType: boolean }
```

### 9.8.3 infer 的失败回退

```ts
// 当模式不匹配时，返回 never（或指定的回退类型）
type SafeExtract<T, Pattern> = T extends Pattern ? T : never;

type S1 = SafeExtract<string, number>; // ✅ never
type S2 = SafeExtract<42, number>;     // ✅ 42
```

---

## 9.9 推断的优先级与约束

TypeScript 类型推断遵循一系列优先级规则。当多个推断来源冲突时，编译器按特定策略解决。

### 9.9.1 推断优先级规则

| 优先级 | 推断来源 | 说明 |
|--------|----------|------|
| 1 | 显式类型参数 | `fn<string>("x")` 中 T = string |
| 2 | 参数类型 | 从函数参数的值推断 |
| 3 | 上下文类型 | 从赋值目标或参数位置推断 |
| 4 | 返回类型推断 | 从函数体中的 return 推断 |
| 5 | 默认类型参数 | 其他来源都失败时使用默认值 |

### 9.9.2 推断的冲突解决

```ts
function combine<T>(a: T, b: T): T {
  return Math.random() > 0.5 ? a : b;
}

// 两个参数推断出不同的字面量类型
const c = combine("hello" as const, "world" as const);
// ✅ T 推断为 "hello" | "world"

// 一个是字面量，一个是宽类型
const c2 = combine("hello", "world");
// ✅ T 推断为 string（拓宽后的公共类型）
```

### 9.9.3 上下文类型 vs 参数推断

```ts
function process<T>(items: T[]): T[] {
  return items;
}

// 上下文类型优先于参数推断
type StringArray = string[];
const result: StringArray = process(["a", "b"]);
// ✅ T 被上下文推断为 string（而非 "a" | "b"）
```

---

## 9.10 常见推断陷阱

### 9.10.1 let vs const 的推断差异

```ts
// let 推断为宽类型
let x = "hello"; // ✅ x: string
x = "world";     // ✅ 合法

// const 推断为字面量类型
const y = "hello"; // ✅ y: "hello"
// y = "world";    // ❌ 不能重新赋值

// const 对象属性的推断陷阱
const obj = { name: "Alice", age: 30 };
// ✅ obj.name: string（属性可修改，所以推断为宽类型）

// 使用 as const 获得最窄推断
const tuple = ["hello", 42] as const;
// ✅ tuple: readonly ["hello", 42]

const frozen = { name: "Alice", age: 30 } as const;
// ✅ frozen.name: "Alice"
```

### 9.10.2 空数组的推断

```ts
// ❌ 空数组推断为 never[]（旧版）或 any[]
const arr = [];        // ✅ arr: any[]（需 noImplicitAny 开启才报错）
arr.push(1);           // ✅ 后续可能被污染

// ✅ 显式注解或上下文推断
const nums: number[] = []; // ✅
const strs = [] as string[]; // ✅
```

### 9.10.3 回调推断的上下文丢失

```ts
// ❌ 先赋值给变量，再传递 → 丢失上下文推断
const handler = (e) => { /* e: any */ };
button.addEventListener("click", handler); // e: any

// ✅ 直接传递回调 → 保留上下文推断
button.addEventListener("click", (e) => {
  // ✅ e: MouseEvent
});
```

### 9.10.4 泛型推断过于宽泛

```ts
// ❌ 推断为联合类型，丢失精确性
function pair<T>(a: T, b: T): [T, T] {
  return [a, b];
}
const p = pair("hello", 42); // ❌ T 推断为 string | number

// ✅ 使用多泛型参数
function pair2<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}
const p2 = pair2("hello", 42); // ✅ [string, number]

// ✅ 或使用约束收窄
function pair3<T extends string | number>(a: T, b: T): [T, T] {
  return [a, b];
}
const p3 = pair3("hello", "world"); // ✅ [string, string]
```

### 9.10.5 返回值推断与条件类型的冲突

```ts
// ❌ 返回条件类型时实现签名困难
function process<T>(x: T): T extends string ? number : boolean {
  // 编译器要求实现兼容所有可能的分支
  return (typeof x === "string" ? 1 : true) as any;
}

// ✅ 使用函数重载替代
function process2(x: string): number;
function process2(x: any): boolean;
function process2(x: any): any {
  return typeof x === "string" ? 1 : true;
}
```

---

## 9.11 自我检测

### 题目 1

```ts
const items = ["a", "b", "c"];
const mapped = items.map((item) => item.toUpperCase());
```

`mapped` 的类型是什么？`item` 的类型又是如何推断的？

<details>
<summary>答案</summary>

- `mapped` 的类型是 `string[]`
- `item` 的类型是 `string`，由上下文推断得出：`items` 是 `string[]`，`Array.prototype.map` 的回调参数类型与数组元素类型相同

</details>

### 题目 2

```ts
function create<T>(ctor: new () => T): T {
  return new ctor();
}

class User {
  name = "Alice";
}

const user = create(User);
```

`user` 的类型是什么？推断是如何发生的？

<details>
<summary>答案</summary>

`user` 的类型是 `User`。

推断过程：

1. `create` 的泛型参数 `T` 出现在构造签名的返回位置
2. 传入 `User` 作为 `ctor`，`User` 的构造签名是 `new () => User`
3. 编译器将 `T` 推断为 `User`
4. 因此返回类型也是 `User`

</details>

### 题目 3

```ts
const arr = [];
arr.push(1);
arr.push("hello");
```

`arr` 的最终类型是什么？如何修复以获得更精确的类型？

<details>
<summary>答案</summary>

如果 `noImplicitAny` 开启，`arr` 的初始化会报错；否则 `arr` 推断为 `any[]`，后续 push 任何值都合法。

修复方式：

```ts
// ✅ 显式注解
const arr: (string | number)[] = [];

// ✅ 或初始时提供元素
const arr2 = [1]; // number[]
// arr2.push("hello"); // ❌

// ✅ 或使用 as const 配合显式类型
const arr3: (string | number)[] = [];
```

</details>

---

## 9.12 本章小结

| 概念 | 要点 |
|------|------|
| 上下文类型推断 | 表达式所在位置（参数、赋值）决定其推断类型 |
| 回调参数推断 | 回调函数参数类型由调用方签名上下文推断 |
| 泛型推断 | 从实际参数值推断泛型类型参数 |
| 多泛型参数 | 多个参数可分别从不同来源推断 |
| 最佳公共类型 | 多个候选类型的最小编上界类型 |
| 返回类型推断 | 从 return 语句推断；async 自动包装为 Promise |
| let vs const | let 拓宽为宽类型；const 推断为字面量类型 |
| `as const` | 阻止类型拓宽，获得最窄字面量推断 |
| 协变/逆变推断 | 类型位置影响子类型关系的方向 |
| infer 推断 | 条件类型中从模式匹配提取最精确的类型 |
| 显式类型注解 | 当推断不精确时，显式注解是最直接的修复 |

---

## 参考与延伸阅读

1. [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
2. [Contextual Typing](https://www.typescriptlang.org/docs/handbook/type-inference.html#contextual-typing)
3. [Best Common Type](https://www.typescriptlang.org/docs/handbook/type-inference.html#best-common-type)
4. [Type Widening](https://www.typescriptlang.org/docs/handbook/type-inference.html#widening) — 类型拓宽机制
5. [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) — as const
6. [Generics: Inference](https://www.typescriptlang.org/docs/handbook/2/generics.html#inferring-the-type-of-a-generic)
7. [TypeScript Type Inference Deep Dive](https://www.zhenghao.io/posts/type-inference) — Zhenghao

---

:::info 下一章
理解了类型推断后，进入类型关系的最后一环——类型兼容性规则与 branded types 的实战模式 → *10 类型兼容性*（待更新）
:::
