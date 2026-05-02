---
title: 05 泛型深度 — 约束、默认参数与 infer 关键字
description: 深入TypeScript泛型系统的核心机制：泛型约束（extends）、多约束组合、默认类型参数、条件类型前置表达式、infer关键字类型提取、泛型递归与实战模式。包含完整代码示例、对比表格与Mermaid图解。
keywords:
  - typescript generics
  - generic constraints
  - extends
  - infer keyword
  - default type parameters
  - conditional types
  - generic recursion
  - type extraction
  - promise unwrap
  - generic defaults
editLink: false
lastUpdated: true
---

# 05 泛型深度 — 约束、默认参数与 infer 关键字

:::tip 本章核心
泛型（Generics）是 TypeScript 类型系统的**抽象能力基础**。本章从约束、默认参数延伸到条件类型与 `infer`，揭示泛型如何从"类型占位符"进化为"类型计算引擎"。掌握泛型，意味着掌握了 TypeScript 类型系统的可复用性核心。
:::

---

## 5.1 泛型基础回顾

泛型的本质是**参数化类型**：将类型作为参数传递，实现代码的复用与抽象。没有泛型，每个类型变体都需要单独定义；有了泛型，一个定义可以覆盖无限多种类型场景。

```ts
// 最简泛型：identity 函数
function identity<T>(arg: T): T {
  return arg;
}

const s = identity("hello");        // ✅ T 推断为 "hello"
const n = identity<number>(42);     // ✅ 显式指定 T = number
const x = identity(42);             // ✅ T 推断为 42（字面量类型）
const arr = identity([1, 2, 3]);    // ✅ T 推断为 number[]
```

### 5.1.1 泛型的位置

泛型可以出现在函数、接口、类型别名和类中：

```ts
// 函数泛型
function fn<T>(x: T): T { return x; }

// 接口泛型
interface Container<T> {
  value: T;
  getValue(): T;
}

// 类型别名泛型
type Box<T> = { data: T; timestamp: number };

// 类泛型
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}

const numStack = new Stack<number>();
numStack.push(1);           // ✅
numStack.push(2);           // ✅
const top = numStack.pop(); // top: number | undefined
numStack.push("two");       // ❌ string 不能赋值给 number
```

### 5.1.2 泛型推断 vs 显式指定

```ts
function pair<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}

// 推断模式
const p1 = pair("hello", 42);        // ✅ [string, number]

// 显式指定（部分或全部）
const p2 = pair<string, number>("hello", 42); // ✅ 与推断一致
const p3 = pair<string>("hello", 42);         // ✅ 从后推断 U = number（TS 4.7+）

// ❌ 显式指定错误类型
const p4 = pair<number, string>("hello", 42); // ❌ 参数类型不匹配
```

---

## 5.2 泛型约束（Generic Constraints）

当需要限制泛型参数必须满足某种结构时，使用 `extends` 关键字进行**约束**。约束是泛型从"任意类型"走向"有意义的类型运算"的关键一步。

### 5.2.1 基本约束语法

```ts
interface HasLength {
  length: number;
}

// T 必须具有 length 属性
function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length); // ✅ 由于约束，可安全访问 length
  return arg;
}

logLength("hello");         // ✅ string 有 length: 5
logLength([1, 2, 3]);       // ✅ 数组有 length: 3
logLength(new Set([1, 2])); // ❌ Set 没有 length 属性
logLength(42);              // ❌ number 没有 length 属性
logLength({ length: 10, name: "custom" }); // ✅ 对象字面量满足结构
```

### 5.2.2 keyof 约束：键名约束

```ts
// K 必须是 T 的键名之一
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30, isAdmin: false };

getProperty(user, "name");    // ✅ 返回 string
getProperty(user, "age");     // ✅ 返回 number
getProperty(user, "isAdmin"); // ✅ 返回 boolean
// getProperty(user, "email");  // ❌ "email" 不是 user 的键
// getProperty(user, "Name");   // ❌ 大小写敏感，"Name" 不存在
```

### 5.2.3 键值对约束与 pluck 模式

```ts
// K 受约束的同时，返回值类型由 K 决定
function pluck<T, K extends keyof T>(records: T[], key: K): T[K][] {
  return records.map((r) => r[key]);
}

const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];

const names: string[] = pluck(users, "name"); // ✅ string[]
const ages: number[] = pluck(users, "age");   // ✅ number[]
// const emails = pluck(users, "email");        // ❌ 编译错误
```

### 5.2.4 方法约束与索引访问约束

```ts
interface Serializable {
  toJSON(): string;
}

function serialize<T extends Serializable>(obj: T): string {
  return obj.toJSON(); // ✅ 由于约束，可以安全调用 toJSON
}

serialize({ toJSON: () => "{}" }); // ✅
// serialize({});                    // ❌ 缺少 toJSON 方法

// 约束对象必须可以索引（用于字典类型）
function values<T extends Record<string, any>>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

values({ a: 1, b: 2 }); // ✅ number[]
```

---

## 5.3 多约束与交叉类型约束

### 5.3.1 单一 extends 的多成员约束

```ts
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

// 通过交叉类型实现多约束
type NamedAndAged = Named & Aged;

function greetPerson<T extends NamedAndAged>(person: T): string {
  return `Hello ${person.name}, you are ${person.age} years old`;
}

greetPerson({ name: "Alice", age: 30 });           // ✅
greetPerson({ name: "Bob", age: 25, hobby: "TS" }); // ✅ 额外属性允许
// greetPerson({ name: "Charlie" });                // ❌ 缺少 age
// greetPerson({ age: 20 });                        // ❌ 缺少 name
```

### 5.3.2 约束中的类型成员访问

```ts
// 约束要求 T 必须有一个类型为 string 的 name 属性
// 以及一个返回 number 的 getScore 方法
interface Scorable {
  name: string;
  getScore(): number;
}

function formatScore<T extends Scorable>(entity: T): string {
  return `${entity.name}: ${entity.getScore()}`;
}

formatScore({
  name: "Player1",
  getScore: () => 100,
}); // ✅

formatScore({
  name: "Player2",
  getScore() { return 95; },
  level: 5,
}); // ✅ 额外属性允许
```

### 5.3.3 类约束与构造器约束

```ts
// 约束 T 必须有一个无参构造函数，返回特定形状
function createInstance<T extends { new(): { name: string } }>(ctor: T): InstanceType<T> {
  return new ctor();
}

class Person {
  name = "Anonymous";
}

class Robot {
  name = "R2-D2";
  beep() {}
}

const p = createInstance(Person); // ✅ Person
const r = createInstance(Robot);  // ✅ Robot
```

---

## 5.4 泛型默认参数

与函数默认参数类似，泛型类型参数也可以指定**默认值**。这在构建具有良好默认行为的库类型时尤为重要。

### 5.4.1 基本默认参数

```ts
// T 默认为 string
interface ApiResponse<T = string> {
  data: T;
  status: number;
  ok: boolean;
}

// 使用默认类型
const resp1: ApiResponse = {
  data: "hello", // ✅ data 类型为 string
  status: 200,
  ok: true,
};

// 覆盖默认类型
const resp2: ApiResponse<{ id: number }> = {
  data: { id: 1 }, // ✅ data 类型为 { id: number }
  status: 200,
  ok: true,
};

// 使用默认参数的函数
function wrap<T = unknown>(value: T): ApiResponse<T> {
  return { data: value, status: 200, ok: true };
}

const w1 = wrap("hello"); // ApiResponse<string>
const w2 = wrap(42);      // ApiResponse<number>
```

### 5.4.2 默认参数的依赖关系

```ts
// 后面的泛型参数可以依赖前面的参数作为默认值
interface Pagination<T, Meta = { total: number; page: number }> {
  items: T[];
  meta: Meta;
}

const p1: Pagination<string> = {
  items: ["a", "b"],
  meta: { total: 100, page: 1 }, // ✅ 使用默认 Meta
};

const p2: Pagination<string, { cursor: string; hasMore: boolean }> = {
  items: ["a"],
  meta: { cursor: "abc123", hasMore: true }, // ✅ 自定义 Meta
};

// 泛型默认值引用前面的泛型参数
type Container<T, Wrapper = { value: T }> = Wrapper;

type C1 = Container<string>;              // ✅ { value: string }
type C2 = Container<number, { data: number }>; // ✅ { data: number }
```

### 5.4.3 默认参数与约束结合

```ts
// 带约束的默认参数：T 必须可序列化为 JSON
type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };

interface Config<T extends JSONValue = Record<string, JSONValue>> {
  value: T;
  version: number;
}

const c1: Config = { value: { key: "val" }, version: 1 }; // ✅ 默认 Record<string, JSONValue>
const c2: Config<string> = { value: "direct", version: 2 }; // ✅ 覆盖为 string
const c3: Config<number[]> = { value: [1, 2, 3], version: 3 }; // ✅ 覆盖为 number[]
// const c4: Config<Function> = { value: () => {}, version: 4 }; // ❌ Function 不满足 JSONValue
```

### 5.4.4 默认参数的规则速查

| 规则 | 说明 | 合法示例 | 非法示例 |
|------|------|----------|----------|
| 有默认值的参数可省略 | 调用时不传该泛型参数 | `ApiResponse` → `ApiResponse<string>` | — |
| 默认参数必须在可选链末尾 | 不能有必选的泛型参数跟在有默认值的参数后面 | `<T, U = string>` ✅ | `<T = string, U>` ❌ |
| 可依赖前面的参数 | 默认值可引用前面的泛型参数 | `<T, U = T[]>` ✅ | — |
| 推断优先于默认 | 如果 TS 能推断出类型，使用推断值 | `identity("x")` 推断 `"x"` | — |
| 默认参数可与约束共存 | `T extends Foo = Bar` | `<T extends string = "default">` ✅ | — |

```ts
// ❌ 错误：带默认值的参数后面还有必选参数
type Bad<A = string, B> = [A, B];
// Type parameter 'B' has a default value but 'A' does not.

// ✅ 正确：所有带默认值的参数在最后
type Good<A, B = string, C = number> = [A, B, C];
const g1: Good<boolean> = [true, "default", 0]; // ✅
const g2: Good<boolean, "custom"> = [true, "custom", 0]; // ✅
```

---

## 5.5 条件类型前置（Conditional Types）

条件类型是泛型系统的**分支逻辑**，语法为 `T extends U ? X : Y`。它使得类型系统能够根据输入类型动态选择输出类型。

### 5.5.1 基础条件类型

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;   // ✅ true
type B = IsString<42>;        // ✅ false
type C = IsString<string>;    // ✅ true
type D = IsString<"a" | 1>;   // ✅ boolean（分布式条件类型，见第6章）
type E = IsString<any>;       // ✅ boolean（any 特殊行为）
type F = IsString<never>;     // ✅ never（never 是空联合）
```

### 5.5.2 嵌套条件类型

```ts
// 类型级 if-else-if 链
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type N1 = TypeName<"hello">;     // ✅ "string"
type N2 = TypeName<42>;          // ✅ "number"
type N3 = TypeName<true>;        // ✅ "boolean"
type N4 = TypeName<() => void>;  // ✅ "function"
type N5 = TypeName<{}>;          // ✅ "object"
```

### 5.5.3 在泛型中使用条件类型

```ts
// 如果 T 是数组，返回元素类型；否则返回 T 本身
type Flatten<T> = T extends (infer U)[] ? U : T;

type F1 = Flatten<string[]>;     // ✅ string
type F2 = Flatten<number[]>;     // ✅ number
type F3 = Flatten<string>;       // ✅ string（不是数组，直接返回）
type F4 = Flatten<[1, 2, 3]>;    // ✅ 1 | 2 | 3（元组展开为联合）
```

### 5.5.4 条件类型与泛型约束的区别

```mermaid
flowchart TB
    subgraph Constraint["T extends U（约束）"]
        C1["限制泛型参数范围"] --> C2["T 必须满足 U 的结构"]
        C2 --> C3["不改变 T 本身"]
    end
    subgraph Conditional["T extends U ? X : Y（条件类型）"]
        D1["判断类型关系"] --> D2["根据关系选择分支"]
        D2 --> D3["产生新类型"]
    end
```

| 特性 | `T extends U`（约束） | `T extends U ? X : Y`（条件类型） |
|------|----------------------|-----------------------------------|
| 用途 | 限制泛型参数的范围 | 根据类型关系选择不同的类型分支 |
| 位置 | 泛型声明参数列表 | 类型别名/接口的右侧 |
| 结果 | 不改变 T 本身 | 产生一个新的类型 |
| 运行时 | 无（仅编译期） | 无（仅编译期） |
| 错误位置 | 泛型参数传递时 | 类型计算结果 |

```ts
// 约束：T 必须是 string 的子类型
function acceptString<T extends string>(x: T): T { return x; }
acceptString("hello"); // ✅
// acceptString(42);   // ❌ 参数层面报错

// 条件类型：根据 T 是否为 string 返回不同结果
type StringOrNumber<T> = T extends string ? T : number;
type R1 = StringOrNumber<"hello">; // ✅ "hello"
type R2 = StringOrNumber<42>;      // ✅ number
```

---

## 5.6 infer 关键字

`infer` 是 TypeScript 类型系统中的**类型提取**关键字，只能在条件类型的 `extends` 子句中使用。它使得类型系统能够从复杂类型中"解构"出子类型。

### 5.6.1 提取函数返回类型

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;              // ✅ string
type R2 = MyReturnType<(x: number) => boolean>;    // ✅ boolean
type R3 = MyReturnType<() => void>;                // ✅ void
type R4 = MyReturnType<string>;                    // ✅ never（不是函数）

// 实际使用
function fetchUser(): { id: number; name: string } {
  return { id: 1, name: "Alice" };
}

type FetchUserReturn = MyReturnType<typeof fetchUser>;
// ✅ { id: number; name: string }
```

### 5.6.2 提取函数参数类型

```ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type P1 = MyParameters<(a: string, b: number) => void>; // ✅ [string, number]
type P2 = MyParameters<() => void>;                     // ✅ []
type P3 = MyParameters<(a?: boolean) => void>;          // ✅ [boolean?]
```

### 5.6.3 提取 Promise 解析类型

```ts
// 递归展开嵌套 Promise
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type A1 = MyAwaited<Promise<string>>;           // ✅ string
type A2 = MyAwaited<Promise<Promise<number>>>;  // ✅ number（递归展开）
type A3 = MyAwaited<string>;                    // ✅ string（非 Promise）

// 与 async/await 结合
async function fetchData(): Promise<{ items: string[] }> {
  return { items: ["a", "b"] };
}

type DataShape = MyAwaited<ReturnType<typeof fetchData>>;
// ✅ { items: string[] }
```

### 5.6.4 提取数组/元组元素类型

```ts
// 提取数组元素类型
type ElementType<T> = T extends readonly (infer U)[] ? U : never;

type E1 = ElementType<string[]>;           // ✅ string
type E2 = ElementType<number[]>;           // ✅ number
type E3 = ElementType<[boolean, Date]>;    // ✅ boolean | Date（元组联合）
type E4 = ElementType<"abc">;              // ✅ "a" | "b" | "c"（字符串字符联合）

// 提取元组的第一个元素
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;

type H1 = Head<[string, number, boolean]>; // ✅ string
type H2 = Head<[]>;                        // ✅ never

// 提取元组除首元素外的剩余部分
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : never;

type T1 = Tail<[string, number, boolean]>; // ✅ [number, boolean]
type T2 = Tail<[string]>;                  // ✅ []
```

### 5.6.5 提取构造函数实例类型

```ts
type MyInstanceType<T> = T extends new (...args: any[]) => infer R ? R : never;

class User {
  constructor(public name: string, public age: number) {}
}

class Admin extends User {
  role = "admin" as const;
}

type IUser = MyInstanceType<typeof User>;   // ✅ User
type IAdmin = MyInstanceType<typeof Admin>; // ✅ Admin
```

---

## 5.7 泛型约束中的 infer 模式

### 5.7.1 提取对象属性类型

```ts
// 从任意对象中提取特定键的类型，如果键不存在则返回 never
type Get<T, K extends string> = T extends Record<K, infer V> ? V : never;

type G1 = Get<{ name: string }, "name">;     // ✅ string
type G2 = Get<{ age: number }, "name">;      // ✅ never（键不存在）
type G3 = Get<{ data: { nested: true } }, "data">; // ✅ { nested: true }
```

### 5.7.2 提取字符串字面量前缀/后缀

```ts
// 提取事件处理器名对应的事件名
type EventName<T extends string> = T extends `on${infer E}` ? E : never;

type E1 = EventName<"onClick">;      // ✅ "Click"
type E2 = EventName<"onMouseMove">;  // ✅ "MouseMove"
type E3 = EventName<"onkeydown">;    // ✅ "keydown"
type E4 = EventName<"handleClick">;  // ✅ never

// 提取特定后缀之前的部分
type RemoveSuffix<T, S extends string> = T extends `${infer P}${S}` ? P : T;

type RS1 = RemoveSuffix<"user-list.tsx", ".tsx">; // ✅ "user-list"
type RS2 = RemoveSuffix<"app.js", ".tsx">;         // ✅ "app.js"（不匹配）
```

### 5.7.3 提取函数 this 参数类型

```ts
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;

function clickHandler(this: HTMLElement, event: MouseEvent): void {
  console.log(this.tagName);
}

function regularHandler(event: MouseEvent): void {
  console.log("no this context");
}

type ThisType1 = ThisParameterType<typeof clickHandler>;   // ✅ HTMLElement
type ThisType2 = ThisParameterType<typeof regularHandler>; // ✅ unknown
```

---

## 5.8 泛型与映射类型结合

泛型与映射类型结合是 TypeScript 内置工具类型（Utility Types）的核心实现模式。

```ts
// 手写 Partial<T>
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 手写 Required<T>
type MyRequired<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选性
};

// 手写 Readonly<T>
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 手写 Pick<T, K>
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 手写 Omit<T, K>
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>;
```

### 5.8.1 带条件的映射类型

```ts
// 只将 string 类型的属性变为可选
type OptionalStrings<T> = {
  [P in keyof T as T[P] extends string ? P : never]?: T[P];
} & {
  [P in keyof T as T[P] extends string ? never : P]: T[P];
};

interface User {
  name: string;
  age: number;
  email: string;
}

type Result = OptionalStrings<User>;
// { name?: string; email?: string } & { age: number }
```

### 5.8.2 映射类型修饰符

```ts
// 移除 readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 添加 readonly（与内置 Readonly 相同）
type Immutable<T> = {
  +readonly [P in keyof T]: T[P];
};

// 移除可选（与内置 Required 相同）
type Definitely<T> = {
  [P in keyof T]-?: T[P];
};

// 添加可选（与内置 Partial 相同）
type Maybe<T> = {
  [P in keyof T]+?: T[P];
};
```

---

## 5.9 泛型递归与深度操作

### 5.9.1 递归类型别名

TypeScript 4.1+ 支持递归类型别名，使得深度操作成为可能。

```ts
// 深度 Partial：递归地将所有属性变为可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Company {
  name: string;
  founded: number;
  address: {
    city: string;
    street: string;
    zip: string;
  };
  ceo: {
    name: string;
    age: number;
  };
}

type PartialCompany = DeepPartial<Company>;
// 所有层级都变为可选：
// {
//   name?: string;
//   founded?: number;
//   address?: { city?: string; street?: string; zip?: string };
//   ceo?: { name?: string; age?: number };
// }
```

### 5.9.2 递归展开与深度扁平化

```ts
// 深度 Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度 Required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 深度扁平化嵌套数组
type DeepFlatten<T> = T extends (infer U)[] ? DeepFlatten<U> : T;

type D1 = DeepFlatten<string[][][]>;  // ✅ string
type D2 = DeepFlatten<number[]>;      // ✅ number
type D3 = DeepFlatten<"abc">;         // ✅ "abc"（不是数组）
```

### 5.9.3 递归类型限制

```ts
// TypeScript 对递归深度有限制（通常约 50 层）
type DeepObject = {
  a: DeepObject; // 自引用
};

// 实际使用时要注意终止条件
type SafeRecursive<T> = T extends string ? T : T extends object ? { [K in keyof T]: SafeRecursive<T[K]> } : T;
```

---

## 5.10 实战：Promise 类型解析器

```ts
// 解析嵌套 Promise 的最终类型
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

// 更完整的实现（类似内置 Awaited，但只处理 Promise）
type UnwrapPromise<T> =
  T extends Promise<infer U>
    ? UnwrapPromise<U>
    : T;

async function fetchUser(): Promise<{ name: string }> {
  return { name: "Alice" };
}

async function fetchUsers(): Promise<Promise<{ name: string }>[]> {
  return [Promise.resolve({ name: "Bob" })];
}

type FetchResult = UnwrapPromise<ReturnType<typeof fetchUser>>;
// ✅ { name: string }

type FetchUsersResult = UnwrapPromise<ReturnType<typeof fetchUsers>>;
// ✅ Promise<{ name: string }>[] — 注意：只展开最外层 Promise
```

### 5.10.1 提取异步函数返回值

```ts
type AsyncReturnType<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never;

async function getData(): Promise<number[]> {
  return [1, 2, 3];
}

async function getUser(id: number): Promise<{ id: number; name: string }> {
  return { id, name: "User" };
}

type DataType = AsyncReturnType<typeof getData>;     // ✅ number[]
type UserType = AsyncReturnType<typeof getUser>;     // ✅ { id: number; name: string }
```

---

## 5.11 常见陷阱与最佳实践

### 5.11.1 any 的传染性

```ts
function bad<T>(x: T): T {
  return x;
}

const v = bad<any>("hello");
v.toFixed(); // ❌ 运行时错误，但 TS 不报错（any 关闭了检查）

// ✅ 使用 unknown 替代 any 作为最后的手段
function better<T = unknown>(x: T): T {
  return x;
}
```

### 5.11.2 泛型推断过于宽泛

```ts
function createPair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

const p = createPair("hello", 42);
// ❌ T 推断为 string | number，可能不是预期

// ✅ 修复方式 1：使用多个泛型参数
function createPair2<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}
const p2 = createPair2("hello", 42); // ✅ [string, number]

// ✅ 修复方式 2：显式指定
const p3 = createPair<string | number>("hello", 42); // ✅ 明确意图
```

### 5.11.3 约束不够严格导致不安全访问

```ts
// ❌ bad：通过类型断言绕过约束
function unsafe<T>(x: T): string {
  return (x as any).toString(); // 假设 T 一定有 toString，但不安全
}

// ✅ good：添加约束
function safe<T extends { toString(): string }>(x: T): string {
  return x.toString();
}

// ✅ 更好的方式：使用 unknown 并要求转换
function safest(x: unknown): string {
  if (x !== null && x !== undefined) {
    return String(x);
  }
  return "";
}
```

### 5.11.4 infer 位置错误

```ts
// ❌ 错误：infer 只能在条件类型的 extends 子句中使用
type Bad<T> = infer U;
// 'infer' declarations are only permitted in the 'extends' clause of a conditional type.

// ❌ 错误：infer 不能用于普通泛型参数声明
type Bad2<infer U> = U;

// ✅ 正确：infer 在条件类型的 extends 右侧
type Good<T> = T extends (infer U)[] ? U : never;

// ✅ 正确：infer 提取函数返回类型
type Return<T> = T extends (...args: any[]) => infer R ? R : never;
```

### 5.11.5 泛型默认值与推断冲突

```ts
// 当显式默认值与上下文推断冲突时
function createArray<T = string>(item: T): T[] {
  return [item];
}

const arr1 = createArray(42);      // ✅ T 推断为 number（推断优先）
const arr2 = createArray("hello"); // ✅ T 推断为 "hello"
const arr3: string[] = createArray("x"); // ✅ T 推断为 string（由上下文约束）
```

---

## 5.12 自我检测

### 题目 1

```ts
type Foo<T extends string = "default"> = { value: T };
type A = Foo;           // ?
type B = Foo<"custom">; // ?
```

<details>
<summary>答案</summary>

- `A` 的类型是 `{ value: "default" }` — 使用默认类型参数
- `B` 的类型是 `{ value: "custom" }` — 覆盖默认值

</details>

### 题目 2

```ts
type ExtractArrayItem<T> = T extends (infer U)[] ? U : T;
type R = ExtractArrayItem<string[][]>;
```

<details>
<summary>答案</summary>

`R` 的类型是 `string[]` — 只展开一层数组。因为条件类型只匹配一次 `extends (infer U)[]`，`string[][]` 匹配后 `U` 为 `string[]`。

如需完全展开，需要递归：

```ts
type DeepExtract<T> = T extends (infer U)[] ? DeepExtract<U> : T;
type R2 = DeepExtract<string[][]>; // string
```

</details>

### 题目 3

```ts
function process<T extends { name: string }>(obj: T): T {
  return obj;
}

process({ name: "Alice", age: 30 });
```

`process` 的返回类型是什么？

<details>
<summary>答案</summary>

返回类型是 `{ name: "Alice"; age: 30 }`，即推断出的具体字面量类型，而非 `{ name: string }`。泛型约束不影响推断的精确性，T 被推断为传入对象的具体类型。

</details>

---

## 5.13 本章小结

| 概念 | 要点 |
|------|------|
| 泛型约束 `extends` | 限制泛型参数必须满足的结构，确保类型安全 |
| `keyof` 约束 | `K extends keyof T` 限制键名必须在 T 中存在 |
| 默认类型参数 | `T = Default` 为泛型提供默认值，增强 ergonomics |
| 默认参数规则 | 带默认值的参数必须在参数列表末尾；推断优先于默认 |
| 条件类型 | `T extends U ? X : Y` 实现类型级条件分支 |
| `infer` 关键字 | 在条件类型中提取/推断部分类型信息，类似解构 |
| 提取模式 | ReturnType、Parameters、Awaited、ElementType 都基于 infer |
| 递归泛型 | TypeScript 4.1+ 支持递归类型别名，实现深度操作 |
| 泛型 + 映射类型 | 组合使用是内置工具类型的核心实现方式 |
| 多约束 | 通过交叉类型 `A & B` 实现复合约束 |

---

## 参考与延伸阅读

1. [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
2. [TypeScript Handbook: Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
3. [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
4. [infer 关键字深入](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) — TypeScript 官方文档
5. [Type Challenges: medium/hard generics](https://github.com/type-challenges/type-challenges) — 实战练习
6. [TypeScript 内置工具类型源码](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts)
7. [Generics in TypeScript: A Complete Guide](https://2ality.com/2020/02/types-generics-typescript.html) — Dr. Axel Rauschmayer

---

:::info 下一章
掌握泛型后，进入类型系统的"逻辑门"——条件类型与分布式条件类型的精妙世界 → [06 条件类型](./06-conditional-types.md)
:::
