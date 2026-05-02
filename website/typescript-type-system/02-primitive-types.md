---
title: 02 原始类型深度 — 字面量、联合与交叉
description: 深入TypeScript原始类型系统：string/number/boolean/literal/union/intersection/bigint/symbol/enum。全面解析类型拓宽与收窄、const断言、可辨识联合、nullable类型及strictNullChecks的语义变化。
keywords:
  - typescript primitive types
  - literal types
  - union types
  - intersection types
  - enum
  - const assertion
  - strictNullChecks
  - bigint
  - symbol
  - type widening
  - discriminated unions
editLink: false
lastUpdated: true
---

# 02 原始类型深度 — 字面量、联合与交叉

:::tip 本章核心
原始类型不只是 `string` 和 `number`。TypeScript 在原始类型上构建了**字面量类型**（literal types）、**联合类型**（unions）和**交叉类型**（intersections）三座大厦。理解它们，是掌握类型体操的必要前提。
:::

---

## 2.1 原始类型总览

TypeScript 的原始类型与 JavaScript 运行时一一对应：

| TypeScript 类型 | 运行时类型 | 可表示的值 | 特殊说明 |
|-----------------|------------|------------|----------|
| `string` | string | 所有字符串 | 对应 `String` 装箱类型 |
| `number` | number | 所有数字（含 `NaN`, `Infinity`） | 无 `int` / `float` 区分 |
| `boolean` | boolean | `true`, `false` | 无单独 `true` / `false` 类型关键字（需用字面量） |
| `bigint` | bigint | 任意精度整数 | ES2020+ |
| `symbol` | symbol | 唯一标识符 | `unique symbol` 用于类型系统 |
| `null` | null | 唯一值 `null` | `strictNullChecks` 影响巨大 |
| `undefined` | undefined | 唯一值 `undefined` | 可选参数/属性的默认值 |
| `void` | undefined | 函数无返回值 | 仅用于返回值类型 |

### 2.1.1 原始类型 vs 装箱类型

TypeScript 区分**原始类型**和**装箱类型**（boxed types）：

```ts
// 原始类型（推荐）
let s1: string = "hello";
let n1: number = 42;
let b1: boolean = true;

// 装箱类型（不推荐使用）
let s2: String = new String("hello");
let n2: Number = new Number(42);
let b2: Boolean = new Boolean(true);

// 原始类型可以赋值给装箱类型，反之不行
const s3: String = s1; // ✅
const s4: string = s2; // ❌ String 不是 string 的子类型
```

**反模式**：装箱类型在 JavaScript 中几乎没有正当用途，且会导致意外行为：

```ts
const b = new Boolean(false);
if (b) {
  console.log("This runs!"); // 对象永远为 truthy
}
```

### 2.1.2 number 类型的精度问题

TypeScript 的 `number` 类型对应 IEEE 754 双精度浮点数。这意味着：

```ts
// TypeScript 无法区分整数和浮点数
type Integer = number; // 不存在专门的 integer 类型

// 大整数会丢失精度
const big = 9007199254740993; // 实际存储为 9007199254740992

// 解决方案：bigint
const reallyBig = 9007199254740993n;
```

---

## 2.2 字面量类型（Literal Types）

字面量类型是**单例类型**（singleton types），表示唯一的值。

### 2.2.1 三种字面量类型

```ts
type S = "hello";        // 字符串字面量
type N = 42;             // 数字字面量
type B = true;           // 布尔字面量

// 使用
const s: S = "hello";    // ✅
const s2: S = "world";   // ❌
```

**为什么需要字面量类型？**

```ts
// 用字面量类型表示有限状态
 type Status = "pending" | "success" | "error";
 type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
 type LogLevel = 0 | 1 | 2 | 3;

function fetch(url: string, method: HttpMethod) {
  // method 只能是四种之一
}

fetch("/api", "GET");     // ✅
fetch("/api", "get");     // ❌ 大小写敏感
```

### 2.2.2 字面量类型的推断与拓宽

```ts
// const 声明：不拓宽，保持字面量类型
const a = "hello";       // a: "hello"
const b = 42;            // b: 42
const c = true;          // c: true

// let 声明：拓宽到基类型
let d = "hello";         // d: string
let e = 42;              // e: number
let f = true;            // f: boolean

// 显式注解：保持字面量
let g: "hello" = "hello"; // g: "hello"
```

**拓宽规则详解**：

| 声明方式 | 推断类型 | 原因 |
|----------|----------|------|
| `const x = "a"` | `"a"` | const 不可重新赋值，类型可精确到字面量 |
| `let x = "a"` | `string` | let 可能重新赋值为其他字符串，需拓宽 |
| `let x: "a" = "a"` | `"a"` | 显式注解覆盖推断 |
| `var x = "a"` | `string` | 同 let |

### 2.2.3 const 断言（as const）

`as const` 是 TS 3.4 引入的**字面量类型强化**工具：

```ts
// 无 as const
const config = {
  host: "localhost",
  port: 3000,
  debug: true,
};
// config: { host: string; port: number; debug: boolean }

// 有 as const
const config2 = {
  host: "localhost",
  port: 3000,
  debug: true,
} as const;
// config2: { readonly host: "localhost"; readonly port: 3000; readonly debug: true }
```

`as const` 的作用：

1. **将对象属性变为 `readonly`**
2. **将字面量类型收窄到最窄形式**
3. **将数组变为只读元组**

```ts
// 数组变为只读元组
const tuple = [1, "hello", true] as const;
// tuple: readonly [1, "hello", true]

tuple[0] = 2; // ❌ readonly
tuple.push(4); // ❌ readonly

// 深层递归
deeply.nested.value = 1; // 只要路径上的对象都用 as const，就会递归 readonly
```

### 2.2.4 枚举 vs 联合字面量

TypeScript 提供两种表示有限常量集的方式：

```ts
// 方案一：enum
enum StatusEnum {
  Pending = "pending",
  Success = "success",
  Error = "error",
}

// 方案二：联合字面量
type StatusUnion = "pending" | "success" | "error";
```

**深度对比**：

| 特性 | `enum` | 联合字面量 |
|------|--------|------------|
| 编译后代码 | 生成 IIFE 对象 | 完全擦除（类型 only） |
| 反向映射 | 数字 enum 支持 `Status[0]` | ❌ |
| 类型安全 | 名义类型检查 | 结构化类型检查 |
| tree-shaking | 可能有问题（const enum 除外） | ✅ 完美 |
| 常量枚举 | `const enum` 编译时内联 | N/A |
| 声明合并 | ✅ | ❌ |
| 迭代能力 | 可用 `Object.keys()` | 需额外定义数组 |
| 推荐场景 | 与数字标志位/位运算结合 | 纯字符串常量集 |

```ts
// enum 的陷阱 1：数字 enum 的反向映射
enum Flags {
  A = 1,
  B = 2,
}
// 编译后：Flags[1] === "A", Flags["A"] === 1

// enum 的陷阱 2：非 const enum 的 tree-shaking 问题
// 即使只使用一个值，整个 enum 对象也会被保留

// 推荐：const enum（编译时内联）
const enum HttpStatus {
  OK = 200,
  NotFound = 404,
}
const status = HttpStatus.OK; // 编译为 const status = 200;

// 或更好的方式：普通对象 + 联合类型
const HttpStatusMap = {
  OK: 200,
  NotFound: 404,
} as const;

type HttpStatusCode = (typeof HttpStatusMap)[keyof typeof HttpStatusMap];
// HttpStatusCode: 200 | 404
```

---

## 2.3 联合类型（Union Types）

联合类型 `A | B` 表示**属于 A 或属于 B 的值**（集合论中的并集）。

### 2.3.1 基本语法与使用

```ts
type StringOrNumber = string | number;
type Status = "pending" | "success" | "error";

function format(input: StringOrNumber): string {
  if (typeof input === "string") {
    return input.toUpperCase(); // input: string
  }
  return input.toFixed(2);      // input: number
}
```

### 2.3.2 联合类型的操作

```ts
type A = "a" | "b" | "c";
type B = "b" | "c" | "d";

// 并集：A | B = "a" | "b" | "c" | "d"
type Union = A | B;

// 交集：A & B = "b" | "c"
type Intersection = A & B;
```

### 2.3.3 可辨识联合（Discriminated Unions）

可辨识联合是 TypeScript 中最强大的模式之一，广泛用于 Redux actions、AST 节点、API 响应等。

```ts
// 辨识属性：kind
type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  side: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Shape = Circle | Square | Rectangle;

// 使用辨识属性进行穷尽检查
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default:
      // 穷尽性检查
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

**设计可辨识联合的最佳实践**：

| 原则 | 说明 | 反例 |
|------|------|------|
| 辨识属性名一致 | 统一使用 `kind` 或 `type` | 有的用 `kind`，有的用 `type` |
| 辨识值为字面量类型 | 确保可精确收窄 | 辨识值为 `string` 类型 |
| 避免可选辨识属性 | 可选属性会导致无法穷尽检查 | `kind?: "circle"` |
| 每个成员有足够区分度 | 避免两个成员结构过于相似 | 只有辨识属性不同 |

### 2.3.4 联合类型的分配律

联合类型在条件类型和映射类型中遵循**分配律**（详见第 06 章）：

```ts
type ToArray<T> = T[];

// 分配展开
type A = ToArray<string | number>;
// 等价于：ToArray<string> | ToArray<number>
// 结果：string[] | number[]

// 非分配（用元组包裹）
type ToArrayNonDist<T> = [T];
type B = ToArrayNonDist<string | number>;
// 结果：[string | number]
```

---

## 2.4 交叉类型（Intersection Types）

交叉类型 `A & B` 表示**同时满足 A 和 B 的值**（集合论中的交集）。

### 2.4.1 对象类型的交叉

```ts
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;
// 等价于：{ name: string; age: number }

const person: Person = {
  name: "TypeScript",
  age: 11,
};
```

### 2.4.2 冲突属性的交叉

当两个类型有同名但不同类型的属性时，交叉结果可能为 `never`：

```ts
type A = { x: string };
type B = { x: number };

type AB = A & B;
// AB: { x: string & number } = { x: never }

// 这样的对象实际上不可能存在
const ab: AB = { x: ??? }; // 无法构造
```

**但注意**：TypeScript 不会立即将 `AB` 简化为 `never`。只有当尝试赋值具体值时才会报错：

```ts
const ab: AB = { x: "hello" }; // ❌ x 类型不兼容
```

### 2.4.3 原始类型的交叉

```ts
type S = string & number; // never（无值同时是 string 和 number）

// 但有一种特殊情况：branded types
type UserId = string & { __brand: "UserId" };
// 这在运行时就是 string，但在类型系统中有额外标签
```

### 2.4.4 交叉 vs 接口继承/extends

```ts
// 方式一：交叉类型
type A = { x: number } & { y: string };

// 方式二：接口继承
interface B {
  x: number;
}
interface C extends B {
  y: string;
}

// 方式三：接口合并（declaration merging）
interface D {
  x: number;
}
interface D {
  y: string;
}
```

| 特性 | 交叉 `&` | `extends` | 声明合并 |
|------|----------|-----------|----------|
| 适用场景 | 类型别名 | interface | interface（同作用域） |
| 冲突处理 | 交叉属性（可能为 never） | 子类型必须兼容父类 | 属性类型必须相同 |
| 性能 | 可能较慢（创建新类型） | 较快 | 编译时合并 |
| 可读性 | 适合内联 | 适合层次结构 | 适合扩展第三方类型 |

---

## 2.5 symbol 与 unique symbol

### 2.5.1 symbol 类型

```ts
const sym = Symbol("desc");
let s: symbol = sym;

s = Symbol("other"); // ✅ symbol 类型可以赋值为任何 symbol
```

### 2.5.2 unique symbol

`unique symbol` 是 symbol 类型的子类型，表示**特定的** symbol 值：

```ts
const sym1 = Symbol("desc");       // sym1: unique symbol（const + Symbol()）
let sym2 = Symbol("desc");         // sym2: symbol

const sym3: unique symbol = Symbol("desc");
// 只能用 const 声明，且必须通过 Symbol() 或 Symbol.for() 创建
```

**用途：创建无法冲突的对象键**

```ts
declare const brandKey: unique symbol;

interface Branded {
  [brandKey]: true;
  value: string;
}

function createBranded(value: string): Branded {
  return { [brandKey]: true, value };
}

// 外部无法伪造 brandKey（因为它是 unqie symbol）
```

---

## 2.6 bigint 类型

```ts
const big = 100n;
const bigger: bigint = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

// bigint 和 number 不能混用
const sum = 1n + 2; // ❌ Operator '+' cannot be applied to types 'bigint' and 'number'
const sum2 = 1n + BigInt(2); // ✅
```

---

## 2.7 Nullable 类型与 strictNullChecks

### 2.7.1 strictNullChecks 的语义革命

`strictNullChecks` 是 TypeScript 类型系统最重要的配置之一。开启前后，`null` 和 `undefined` 的行为完全不同：

```ts
// strictNullChecks: OFF
let s: string = null;      // ✅ null 属于任何类型
let n: number = undefined; // ✅ undefined 属于任何类型

// strictNullChecks: ON
let s2: string = null;      // ❌ null 不是 string
let n2: number = undefined; // ❌ undefined 不是 number
```

### 2.7.2 可选属性与 undefined

```ts
interface User {
  name: string;
  age?: number;
}

// age?: number 等价于 age: number | undefined
const u1: User = { name: "ts" };           // ✅ age 可省略
const u2: User = { name: "ts", age: 11 };  // ✅
const u3: User = { name: "ts", age: undefined }; // ✅
```

**注意**：在 `exactOptionalPropertyTypes`（TS 4.4+）开启后，`age: undefined` 会被禁止：

```ts
// exactOptionalPropertyTypes: ON
const u4: User = { name: "ts", age: undefined }; // ❌
```

### 2.7.3 非空断言（Non-null Assertion）

```ts
function getLength(s: string | null): number {
  // return s.length; // ❌ s 可能是 null
  return s!.length;    // ✅ 非空断言（告诉 TS：我保证 s 不是 null）
}
```

**警告**：非空断言是类型断言的一种形式，如果滥用会引入运行时错误。

### 2.7.4 空值合并与可选链

```ts
type User = { name: string; email?: string };

function getEmail(user: User): string {
  // 可选链 + 空值合并
  return user.email?.toLowerCase() ?? "no-email";
}
```

---

## 2.8 类型推断的细微差别

### 2.8.1 最佳公共类型（Best Common Type）

```ts
// 数组的字面量推断
const arr1 = [0, 1, null]; // (number | null)[]

// 对象数组
const zoo = [
  { name: "Lion", roar: true },
  { name: "Elephant", trunk: true },
];
// zoo: { name: string; roar?: boolean; trunk?: boolean }[]

// 显式注解覆盖推断
const zoo2: Animal[] = [
  { name: "Lion", roar: true } as Lion,
  { name: "Elephant", trunk: true } as Elephant,
];
```

### 2.8.2 上下文类型（Contextual Typing）

```ts
type Callback = (x: string) => void;

function onClick(cb: Callback) {}

onClick((e) => {
  // e 被上下文类型推断为 string
  e.toUpperCase();
});
```

上下文类型与常规推断的方向相反：从**使用位置**推断参数类型。

---

## 2.9 自测题

### 题目 1

```ts
const config = {
  api: "https://api.example.com",
  retries: 3,
} as const;

// config 的类型是什么？
// config.api 的类型是什么？
// config.retries = 5; 是否合法？
```

<details>
<summary>答案</summary>

- `config` 的类型：`{ readonly api: "https://api.example.com"; readonly retries: 3 }`
- `config.api` 的类型：`"https://api.example.com"`（字面量类型）
- `config.retries = 5` ❌ 不合法，因为 `as const` 添加了 `readonly`

</details>

### 题目 2

```ts
type A = { x: string; y: number };
type B = { y: string; z: boolean };
type C = A & B;

// C 的类型是什么？
// 能构造出 C 的值吗？
```

<details>
<summary>答案</summary>

- `C: { x: string; y: string & number; z: boolean }`
- 无法构造，因为 `y` 的类型是 `string & number = never`，不存在同时满足的值

</details>

### 题目 3

```ts
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

function getColor(c: Color) {}

getColor("RED"); // 是否合法？
```

<details>
<summary>答案</summary>

❌ **不合法**。`enum` 是名义类型的（数字 enum 除外，因为数字有反向映射）。即使字符串值匹配，也必须使用 `Color.Red`。

</details>

### 题目 4

```ts
let x = "hello" as const;
let y = ["a", "b", "c"] as const;

// x 和 y 的类型分别是什么？
// y.push("d") 是否合法？
```

<details>
<summary>答案</summary>

- `x: "hello"`（let 不影响 as const 的结果）
- `y: readonly ["a", "b", "c"]`（元组，且 readonly）
- `y.push("d")` ❌ 不合法，因为 readonly

</details>

---

## 2.10 本章小结

| 概念 | 要点 |
|------|------|
| 原始类型 | `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined` |
| 字面量类型 | 单例类型 `"hello"`, `42`, `true`；const 推断为字面量，let 拓宽 |
| `as const` | 强制最窄推断，递归添加 readonly |
| 联合类型 | `A \| B` 表示并集；可辨识联合是最强模式 |
| 交叉类型 | `A & B` 表示交集；冲突属性可能变为 never |
| enum 陷阱 | 非 const enum 有 tree-shaking 问题；字符串 enum 是名义类型 |
| strictNullChecks | 开启后 `null`/`undefined` 成为独立类型，大幅提升安全性 |
| unique symbol | 创建不可伪造的唯一键 |

---

## 参考与延伸阅读

1. [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
2. [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
3. [TypeScript 2.0: Non-nullable Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html)
4. [The `const` assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
5. [ECMAScript Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

---

:::info 下一章
探索 TypeScript 对象类型的全部维度：interface vs type、索引签名、映射类型基础 → [03 对象类型](./03-object-types.md)
:::
