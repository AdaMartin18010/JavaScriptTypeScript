---
title: 03 对象类型 — interface vs type、索引签名与映射基础
description: 全面剖析TypeScript对象类型系统：interface与type alias的深层差异、索引签名（string/number/symbol）、readonly与可选修饰符、excess property checking、递归类型、映射类型基础、类类型与接口类型的交互。
keywords:
  - typescript object types
  - interface vs type
  - index signature
  - mapped types
  - readonly properties
  - optional properties
  - excess property checks
  - recursive types
  - class types
  - this types
editLink: false
lastUpdated: true
---

# 03 对象类型 — interface vs type、索引签名与映射基础

:::tip 本章核心
对象类型是 TypeScript 类型系统的**主干**。本章将彻底解决 `interface` 与 `type` 的选择困难症，深入索引签名的边界情况，并为后续章节（映射类型、条件类型）奠定对象操作的基础。
:::

---

## 3.1 interface vs type alias：终极对比

`interface` 和 `type` 在定义对象类型时表面相似，但底层机制和适用场景截然不同。

### 3.1.1 表面等价性

```ts
interface PointI {
  x: number;
  y: number;
}

type PointT = {
  x: number;
  y: number;
};

// 在大多数场景下，二者完全等价
const p1: PointI = { x: 1, y: 2 };
const p2: PointT = { x: 1, y: 2 };
const p3: PointI = p2; // ✅ 完全兼容
```

### 3.1.2 核心差异表

| 特性 | `interface` | `type` |
|------|-------------|--------|
| **声明合并** | ✅ 支持（同作用域同名 interface 自动合并） | ❌ 不支持（重复定义报错） |
| **扩展方式** | `extends` | `&`（交叉类型） |
| **适用类型** | 仅对象/函数/类/数组形状 | 任意类型（联合、原始、元组等） |
| **错误提示** | 通常更精确（显示接口名） | 可能展开为匿名对象 |
| **性能** | 大项目下通常更快（编译器优化） | 复杂交叉类型可能更慢 |
| **递归定义** | ✅ 直接支持 | ✅ 需借助间接引用 |
| **泛型约束** | 可作约束条件 | 可作约束条件 |
| **实现检查** | `implements` 关键字 | 不能直接 `implements` |

### 3.1.3 声明合并（Declaration Merging）

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并结果：{ name: string; age: number }
const user: User = { name: "ts", age: 11 };
```

**声明合并的三类场景**：

```ts
// 1. 接口合并（最常见）
interface Window {
  myLib: MyLib;
}

// 2. 接口与类合并（类作为接口的实现+值）
class Animal {
  move() {}
}
interface Animal {
  name: string;
}
// Animal 类实例必须有 name 属性
const a = new Animal();
a.name = "Lion"; // ✅

// 3. 接口与枚举合并
enum Color { Red, Green }
interface Color {
  custom(): void;
}
Color.custom = () => {}; // ✅
```

**type 的替代方案**：

```ts
type UserV1 = { name: string };
// type UserV1 = { age: number }; // ❌ 错误：重复标识符

// 必须手动扩展
type UserV2 = UserV1 & { age: number };
```

### 3.1.4 extends vs 交叉类型

```ts
interface A {
  x: number;
}
interface B extends A {
  y: string;
}

// 等价于：
type BT = A & { y: string };
```

**处理冲突的差异**：

```ts
interface IX {
  x: number;
}
interface IY extends IX {
  x: string; // ❌ 接口继承：属性类型不兼容
}

type TX = { x: number };
type TY = TX & { x: string };
// TY: { x: string & number } = { x: never }
// 不会立即报错，只有赋值时才会发现
```

### 3.1.5 何时用 interface，何时用 type？

**优先使用 interface**：

- 定义对象/类的公共契约（API 形状）
- 需要利用声明合并扩展第三方类型
- 类需要 `implements` 的类型
- 大型项目中追求更快的类型检查性能

**使用 type**：

- 定义联合类型 (`status: "active" | "inactive"`)
- 定义元组类型 (`[string, number]`)
- 定义映射/条件/模板类型的结果
- 需要复杂的类型运算时
- 给现有类型起别名（`type UserID = string`）

**团队规范建议**：

```ts
// ✅ 公共 API 用 interface
export interface Config {
  host: string;
  port: number;
}

// ✅ 复杂类型运算用 type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✅ 简单别名用 type
export type UserID = string;

// ✅ 联合类型用 type
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```

---

## 3.2 属性修饰符

### 3.2.1 readonly

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 1, y: 2 };
p.x = 3; // ❌ 无法分配到 "x" ，因为它是只读属性
```

**readonly 的浅层性**：

```ts
interface State {
  readonly user: {
    readonly name: string;
    email: string; // 非 readonly！
  };
}

const state: State = {
  user: { name: "ts", email: "ts@example.com" },
};

state.user = { name: "js", email: "js@example.com" }; // ❌ user 是 readonly
state.user.email = "new@example.com"; // ✅ email 不是 readonly
state.user.name = "js"; // ❌ name 是 readonly
```

**深层 readonly**：

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface State {
  user: {
    name: string;
    prefs: {
      theme: "dark" | "light";
    };
  };
}

type ReadonlyState = DeepReadonly<State>;
// 所有层级都变为 readonly
```

### 3.2.2 可选属性（Optional Properties）

```ts
interface Config {
  host: string;
  port?: number;     // 可选
  debug?: boolean;   // 可选
}

const c1: Config = { host: "localhost" };           // ✅
const c2: Config = { host: "localhost", port: 3000 }; // ✅
```

**可选属性的类型**：`port?: number` 等价于 `port: number | undefined`，但有微妙差异（见 `exactOptionalPropertyTypes`）。

```ts
// exactOptionalPropertyTypes: OFF（默认）
const c3: Config = { host: "localhost", port: undefined }; // ✅

// exactOptionalPropertyTypes: ON
const c4: Config = { host: "localhost", port: undefined }; // ❌
```

### 3.2.3 属性修饰符组合

```ts
interface Example {
  a: string;           // 必需，可变
  readonly b: number;  // 必需，只读
  c?: boolean;         // 可选，可变
  readonly d?: Date;   // 可选，只读
}
```

---

## 3.3 索引签名（Index Signatures）

索引签名允许对象拥有**动态数量的属性**。

### 3.3.1 字符串索引签名

```ts
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  hello: "world",
  foo: "bar",
};

dict.anything; // string（访问不存在的键也返回 string 类型）
```

### 3.3.2 数字索引签名

```ts
interface NumberArray {
  [index: number]: string;
}

const arr: NumberArray = ["a", "b", "c"];
const val = arr[0]; // string
```

### 3.3.3 字符串与数字索引签名的关系

当同时存在时，**数字索引签名的返回值必须是字符串索引签名返回值的子类型**：

```ts
interface OK {
  [key: string]: number | string;
  [index: number]: number; // ✅ number 是 number | string 的子类型
}

interface Bad {
  [key: string]: number;
  [index: number]: string; // ❌ string 不是 number 的子类型
}
```

**原因**：JavaScript 会将数字索引转换为字符串索引（`arr[0]` 实际上是 `arr["0"]`），因此数字索引签名实际上是字符串索引签名的"子域"。

### 3.3.4 索引签名的只读与可选

```ts
interface ReadonlyDict {
  readonly [key: string]: number;
}

const dict: ReadonlyDict = { a: 1 };
dict.a = 2; // ❌ 索引签名是 readonly
```

### 3.3.5 已知属性与索引签名的混合

```ts
interface Mixed {
  name: string;           // 已知属性
  [key: string]: string;  // 字符串索引签名
}

// 所有属性的类型必须是索引签名的子类型
const m: Mixed = {
  name: "ts",
  extra: "value", // ✅
};
```

**反例**：

```ts
interface BadMixed {
  name: string;
  count: number;           // ❌ number 不是 string 的子类型
  [key: string]: string;
}
```

### 3.3.6 symbol 索引签名（TS 4.4+）

```ts
interface SymbolDict {
  [key: symbol]: string;
}

const sym = Symbol("key");
const dict: SymbolDict = {
  [sym]: "value",
};
```

### 3.3.7 `Record<K, V>` 与索引签名

```ts
// Record 是索引签名的泛型封装
type Record<K extends string | number | symbol, V> = {
  [P in K]: V;
};

// 使用
type PageInfo = Record<string, { title: string; url: string }>;
```

---

## 3.4 多余属性检查（Excess Property Checking）

TypeScript 对**对象字面量**有特殊的 excess property checking，这是结构子类型系统的一个例外。

### 3.4.1 基本行为

```ts
interface Point {
  x: number;
  y: number;
}

// 对象字面量直接赋值：检查多余属性
const p1: Point = { x: 1, y: 2, z: 3 }; // ❌ 对象字面量只能指定已知属性

// 通过变量赋值：不检查多余属性（结构子类型）
const temp = { x: 1, y: 2, z: 3 };
const p2: Point = temp; // ✅
```

### 3.4.2 为什么有这个例外？

```ts
function printPoint(p: Point) {
  console.log(p.x, p.y);
}

printPoint({ x: 1, y: 2, z: 3 }); // ❌
// 如果你故意传了 z，但函数完全不用它，
// 这通常是笔误（比如把 Point3D 错传给 Point 函数）
```

### 3.4.3 绕过 excess property checking

```ts
// 方法 1：类型断言
const p3 = { x: 1, y: 2, z: 3 } as Point;

// 方法 2：索引签名
interface FlexiblePoint {
  x: number;
  y: number;
  [prop: string]: any;
}

// 方法 3：变量中转
const temp2 = { x: 1, y: 2, z: 3 };
const p4: Point = temp2;
```

---

## 3.5 递归类型

对象类型可以引用自身，形成递归结构。

### 3.5.1 直接递归（interface）

```ts
interface TreeNode {
  value: string;
  children: TreeNode[]; // 直接递归
}

const tree: TreeNode = {
  value: "root",
  children: [
    { value: "child1", children: [] },
    { value: "child2", children: [{ value: "grandchild", children: [] }] },
  ],
};
```

### 3.5.2 间接递归（type）

```ts
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const json: JSONValue = {
  name: "ts",
  version: {
    major: 5,
    minor: 4,
  },
  features: ["generics", "conditional types"],
};
```

### 3.5.3 递归类型的注意事项

```ts
// 错误的递归定义（循环引用无出口）
type Bad = Bad | string; // ❌ 类型别名循环引用自身

// 正确的方式：通过对象包装打破循环
type Good = {
  self: Good | null;
  value: string;
};
```

---

## 3.6 this 类型

TypeScript 支持 `this` 类型，用于描述**方法链式调用**中返回的实际类型。

### 3.6.1 基础用法

```ts
class Box {
  contents: string = "";

  set(value: string): this {
    this.contents = value;
    return this;
  }
}

class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const cb = new ClearableBox();
const result = cb.set("hello");
// result 的类型是 ClearableBox（而非 Box）
result.clear(); // ✅ 因为 result 是 ClearableBox
```

### 3.6.2 不使用 this 类型的问题

```ts
class BoxBad {
  set(value: string): BoxBad {
    return this;
  }
}

class ClearableBoxBad extends BoxBad {
  clear() {}
}

const cbb = new ClearableBoxBad();
const r = cbb.set("hello"); // r: BoxBad
// r.clear(); // ❌ BoxBad 上没有 clear
```

### 3.6.3 接口中的 this 类型

```ts
interface Builder {
  setName(name: string): this;
  setAge(age: number): this;
  build(): User;
}

class UserBuilder implements Builder {
  private name = "";
  private age = 0;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setAge(age: number): this {
    this.age = age;
    return this;
  }

  build(): User {
    return { name: this.name, age: this.age };
  }
}
```

---

## 3.7 类类型与接口

### 3.7.1 类作为类型

```ts
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// User 既是一个值（构造函数），也是一个类型（实例类型）
const u: User = new User("ts");

// 类结构兼容的对象也可以赋值
const u2: User = { name: "ts" }; // ✅ 结构化类型
```

### 3.7.2 implements

```ts
interface CanWalk {
  walk(): void;
}

interface CanSwim {
  swim(): void;
}

// 类可以实现多个接口
class Amphibian implements CanWalk, CanSwim {
  walk() {
    console.log("walking");
  }
  swim() {
    console.log("swimming");
  }
}
```

### 3.7.3 抽象类与接口

```ts
abstract class Animal {
  abstract name: string;
  abstract move(): void;
  eat() {
    console.log("eating");
  }
}

class Dog extends Animal {
  name = "Dog";
  move() {
    console.log("running");
  }
}
```

| 特性 | `interface` | `abstract class` |
|------|-------------|------------------|
| 编译后代码 | 完全擦除 | 保留类结构（含方法实现） |
| 多重实现 | ✅ | ❌（单继承） |
| 默认实现 | ❌ | ✅ |
| 构造函数签名 | ❌ | ✅ |
| 静态成员 | ❌ | ✅ |

---

## 3.8 映射类型基础

映射类型是构造新对象类型的核心机制，在第 07 章将深入，此处先建立基础。

### 3.8.1 基本语法

```ts
type ReadonlyPoint = {
  readonly [K in "x" | "y"]: number;
};
// 结果：{ readonly x: number; readonly y: number }
```

### 3.8.2 使用 keyof

```ts
interface Point {
  x: number;
  y: number;
  z: number;
}

type ReadonlyPoint = {
  readonly [K in keyof Point]: Point[K];
};
// 结果：{ readonly x: number; readonly y: number; readonly z: number }
```

### 3.8.3 内置映射类型预览

```ts
// TypeScript 内置的映射类型

type RP = Readonly<Point>;      // 所有属性 readonly
type PP = Partial<Point>;       // 所有属性 optional
type RP2 = Required<Point>;     // 所有属性 required
type NP = Pick<Point, "x" | "y">; // 选取部分属性
type OP = Omit<Point, "z">;     // 排除部分属性
```

---

## 3.9 对象类型的边缘情况

### 3.9.1 空对象类型 `{}`

```ts
// {} 不表示"空对象"，而是表示"任何非 null/undefined 的值"
const a: {} = 1;       // ✅
const b: {} = "hello"; // ✅
const c: {} = [];      // ✅
const d: {} = {};      // ✅
const e: {} = null;    // ❌（strictNullChecks 下）
```

**真正表示"空对象"（无任何属性）**：

```ts
type EmptyObject = Record<string, never>;
// 或
type EmptyObject2 = { [K in any]: never };

const ok: EmptyObject = {};
const bad: EmptyObject = { a: 1 }; // ❌
```

### 3.9.2 `object` vs `Object` vs `{}`

| 类型 | 含义 | 可赋值 |
|------|------|--------|
| `object` | 非原始类型的任何值 | `{}`, `[]`, `function(){}` |
| `Object` | 与 `{}` 几乎等价 | 任何非 null/undefined |
| `{}` | 有任意属性的对象 | 任何非 null/undefined |
| `Record<string, any>` | 字符串键的任意对象 | 普通对象 |

### 3.9.3 弱类型检测（Weak Type Detection）

```ts
interface Options {
  strict?: boolean;
  verbose?: boolean;
}

// 弱类型：所有属性都是可选的
const opts: Options = { strick: true }; // ❌ 拼写错误！TS 会提示无重叠属性
```

TypeScript 对"所有属性都可选"的类型有特殊检查：如果对象字面量与目标类型**没有任何共同属性**，则报错。

---

## 3.10 自测题

### 题目 1

```ts
interface A {
  x: number;
}
interface A {
  y: string;
}

type B = { x: number } & { y: string };

// A 和 B 在类型系统中等价吗？
// 如果 interface A 的第二个定义改为 { x: string }，会发生什么？
```

<details>
<summary>答案</summary>

- 正常情况下 `A` 和 `B` 等价，都是 `{ x: number; y: string }`
- 如果第二个 `A` 改为 `{ x: string }`，声明合并会报错：后续声明中 `x` 的类型必须相同

</details>

### 题目 2

```ts
interface Config {
  [key: string]: string;
  port: number; // 是否合法？
}
```

<details>
<summary>答案</summary>

❌ **不合法**。已知属性 `port: number` 的类型必须是索引签名 `string` 的子类型。`number` 不是 `string` 的子类型。

</details>

### 题目 3

```ts
class Parent {
  setName(name: string): Parent {
    return this;
  }
}

class Child extends Parent {
  setAge(age: number): this {
    return this;
  }
}

const c = new Child();
c.setName("ts").setAge(11); // 是否合法？
```

<details>
<summary>答案</summary>

❌ **不合法**。`setName` 返回 `Parent`，而 `Parent` 上没有 `setAge`。

修复方式：将 `Parent.setName` 的返回类型改为 `this`：

```ts
class Parent {
  setName(name: string): this {
    return this;
  }
}
```

</details>

### 题目 4

```ts
const obj = { a: 1, b: 2 };
const target: { a: number } = obj; // 是否检查多余属性？
```

<details>
<summary>答案</summary>

✅ **合法**。Excess property checking **只针对对象字面量**。通过变量赋值时，TypeScript 只检查结构兼容性（`obj` 有 `a: number`，满足 `{ a: number }` 的要求，`b` 是额外属性但不检查）。

</details>

---

## 3.11 本章小结

| 概念 | 要点 |
|------|------|
| interface vs type | interface 支持声明合并和 extends，type 支持任意类型运算 |
| readonly | 浅层只读；深层需要递归映射类型 |
| 可选属性 | `?:` 等价于 `\| undefined`（exactOptionalPropertyTypes 有差异） |
| 索引签名 | `[key: string]: T`；数字索引需是字符串索引的子类型 |
| 多余属性检查 | 仅针对对象字面量；是结构子类型的安全补充 |
| 递归类型 | interface 可直接递归；type 需通过联合/对象打破循环 |
| this 类型 | 返回 `this` 保持子类类型；链式调用的关键 |
| 弱类型检测 | 全可选接口的对象字面量必须有至少一个匹配属性 |

---

## 参考与延伸阅读

1. [TypeScript Handbook: Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
2. [TypeScript Handbook: Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
3. [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
4. [Index Signatures](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures)
5. [Excess Property Checks](https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks)

---

:::info 下一章
深入函数类型的全部细节：重载、this参数、严格函数类型、参数变型与回调类型推断 → [04 函数类型](./04-function-types.md)
:::
