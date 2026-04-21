# 基础类型体系

> TypeScript 类型系统的地基：原始类型、复合类型、特殊类型与类型层级
>
> 对齐版本：TypeScript 5.8–6.0 | ECMAScript 2025 (ES16)

---

## 1. 原始类型（Primitive Types）

ECMAScript 2025 定义了 7 种原始类型，TypeScript 为其提供了对应的类型注解：

| TS 类型 | JS 原始类型 | 字面量示例 | 说明 |
|---------|-----------|-----------|------|
| `string` | String | `"hello"` | UTF-16 编码的字符序列 |
| `number` | Number | `42`, `3.14` | IEEE 754 双精度浮点数 |
| `boolean` | Boolean | `true`, `false` | 逻辑真值 |
| `bigint` | BigInt (ES2020) | `9007199254740993n` | 任意精度整数 |
| `symbol` | Symbol (ES2015) | `Symbol('desc')` | 唯一且不可变的值 |
| `null` | Null | `null` | 有意缺失的对象引用 |
| `undefined` | Undefined | `undefined` | 未初始化的值 |

```typescript
// 原始类型的声明
const name: string = "TypeScript";
const count: number = 42;
const isDone: boolean = false;
const huge: bigint = 9007199254740993n;
const key: symbol = Symbol("uniqueKey");
```

### 1.1 字面量类型（Literal Types）

TS 允许将具体值作为类型，形成**字面量类型**：

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 404 | 500;
type Flag = true | false;

const method: HttpMethod = "GET"; // ✅
const method2: HttpMethod = "PATCH"; // ❌ 类型错误
```

字面量类型是**联合类型**的基石，也是 TS 类型收窄的核心机制之一。

### 1.2 `null` 与 `undefined` 的语义差异

| 特性 | `undefined` | `null` |
|------|------------|--------|
| 默认含义 | 变量未初始化 / 属性不存在 | 对象引用有意为空 |
| 可选参数默认值 | 未传参时为 `undefined` | 不会自动为 `null` |
| JSON 序列化 | `JSON.stringify({a: undefined})` → `{}` | `JSON.stringify({a: null})` → `{"a":null}` |
| `typeof` | `"undefined"` | `"object"`（历史遗留 bug） |

**TS 配置建议**：启用 `strictNullChecks`（已包含在 `strict: true` 中），使 `null` 和 `undefined` 成为独立的类型，必须显式处理：

```typescript
// strictNullChecks: true
function greet(name: string) {
  console.log(name.toUpperCase());
}

greet(null); // ❌ Argument of type 'null' is not assignable to parameter of type 'string'
```

---

## 2. 复合类型（Object Types）

### 2.1 `object`, `Object`, `{}` 的区别

这是 TypeScript 中最容易混淆的三兄弟：

| 类型 | 含义 | 可接受值 | 陷阱 |
|------|------|---------|------|
| `object` | 非原始类型 | `{}`, `[]`, `function(){}` | 不接受 `null` |
| `Object` | Object 构造函数的实例 | 几乎所有值（含包装对象） | 过于宽泛，极少使用 |
| `{}` | 空对象字面量类型 | 除 `null` / `undefined` 外的任何值 | 允许访问任意属性（返回 `any`） |

```typescript
// object：非原始类型
const obj1: object = { a: 1 };     // ✅
const obj2: object = [1, 2, 3];    // ✅
const obj3: object = null;         // ❌

// {}：空对象字面量（不是"空对象"！）
const empty: {} = 42;              // ✅ 惊人的事实
const empty2: {} = { a: 1 };       // ✅
empty.toString();                  // ✅ 可以访问 Object.prototype 方法
// empty.a;                        // ❌ 但无法访问自定义属性（无索引签名时）
```

**最佳实践**：使用 `object` 表示"非原始值"，使用具体接口/类型别名描述对象形状，**避免使用 `{}` 和 `Object`** 作为类型注解。

### 2.2 数组类型与元组类型

```typescript
// 数组类型（同构）
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b"]; // 泛型语法等价

// 元组类型（固定长度、异构，TS 特有）
const point: [number, number] = [10, 20];
const user: [string, number, boolean] = ["Alice", 30, true];

// 可变元组与标签（TS 4.0+）
const named: [x: number, y: number] = [10, 20]; // 标签仅用于 IDE 提示

// 元组的边界检查
const p: [number, number] = [1, 2, 3]; // ❌ 源具有 3 个元素，目标允许 2 个
```

### 2.3 对象类型与索引签名

```typescript
// 显式属性定义
interface Person {
  name: string;
  age: number;
  readonly id: string;      // 只读属性
  email?: string;            // 可选属性
}

// 索引签名（动态属性）
interface Dictionary {
  [key: string]: string;     // 所有字符串键的值必须是 string
}

// 混合使用
interface Hybrid {
  name: string;              // 显式属性
  [key: string]: string | number; // 索引签名必须兼容显式属性
}
```

---

## 3. 特殊类型

### 3.1 `any`：逃逸舱口

`any` 是 TypeScript 的"逃生舱"——完全关闭类型检查：

```typescript
let anything: any = 4;
anything = "string";
anything.toFixed();   // ✅ 编译通过，但运行时可能报错
anything.nonExistent; // ✅ 编译通过，运行时 undefined
```

**`any` 的传染性**：一旦变量被标记为 `any`，所有与之交互的变量也会隐式变成 `any`：

```typescript
function fn(x: any) {
  return x + 1; // 返回类型推断为 any
}
const result = fn(1); // result 也是 any
```

**最佳实践**：
- 禁用 `noImplicitAny`（已包含在 `strict: true`）
- 使用 `unknown` 替代 `any`
- 迁移时可用 `@typescript-eslint/no-explicit-any` 逐步消除

### 3.2 `unknown`：类型安全的 `any`

`unknown` 是 TS 3.0 引入的**顶层类型**（Top Type），表示"任何值，但我不知道具体是什么"：

```typescript
let input: unknown = fetchData();

// 直接使用 unknown 值被禁止
input.toUpperCase(); // ❌ 'input' is of type 'unknown'

// 必须通过类型守卫或类型断言才能使用
if (typeof input === "string") {
  input.toUpperCase(); // ✅ 在此块内 input 被收窄为 string
}
```

`unknown` 与 `any` 的核心区别：

| 操作 | `any` | `unknown` |
|------|-------|-----------|
| 赋值给任何类型 | ✅ | ❌ |
| 访问任意属性 | ✅ | ❌ |
| 作为函数参数传递 | ✅ | ❌ |
| 类型安全 | ❌ 关闭检查 | ✅ 强制类型收窄 |

### 3.3 `never`：空类型

`never` 是**底类型**（Bottom Type），表示"永远不可能发生的值"：

```typescript
// never 的产生场景
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// never 在类型运算中的应用
type Exclude<T, U> = T extends U ? never : T;
type A = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
```

**穷尽性检查（Exhaustiveness Checking）**：

```typescript
type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
    default:
      // s 在这里被推断为 never
      const _exhaustive: never = s; // 如果新增 Shape 变体未处理，这里会报错
      return _exhaustive;
  }
}
```

### 3.4 `void`：无返回值

`void` 表示函数**没有显式返回值**（或返回 `undefined`）：

```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // 隐式返回 undefined
}

// void 与 undefined 的区别
function returnsUndefined(): undefined {
  return undefined; // 必须显式返回 undefined
}
```

**注意**：在 JavaScript 中，`void` 也是运算符（`void 0` 得到 `undefined`），但在 TypeScript 类型系统中，`void` 是类型。

---

## 4. 枚举（Enum）

### 4.1 枚举类型详解

```typescript
// 数字枚举（默认从 0 开始自增）
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// 字符串枚举
enum Status {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED"
}

// 异构枚举（不推荐）
enum Mixed {
  No = 0,
  Yes = "YES"
}
```

### 4.2 `const enum` 的编译行为

```typescript
const enum Color {
  Red = 1,
  Green = 2,
  Blue = 3
}

const c = Color.Red;
// 编译后：const c = 1 /* Color.Red */;（完全内联，不生成对象）
```

**陷阱**：`const enum` 在 `isolatedModules: true` 或 Babel 转译时可能出现问题，因为编译器无法跨文件内联。

### 4.3 枚举的替代方案：字面量联合类型

现代 TypeScript 开发更推荐使用**字面量联合类型**替代枚举：

```typescript
// ✅ 推荐：更类型安全、无编译产物、IDE 支持更好
type Status = "pending" | "approved" | "rejected";

// ❌ 枚举的陷阱：反向映射允许数字访问
enum StatusEnum { Pending, Approved, Rejected }
const s = StatusEnum[999]; // 编译通过，运行时 undefined
```

---

## 5. 类型层级（Type Hierarchy）

```
        unknown (Top Type)
         /    |    \
      object  ...  (所有其他类型)
         |
    null / undefined
         |
        never (Bottom Type)
```

```typescript
// 类型层级的演示
let top: unknown = 42;
top = "hello";
top = {};

let bottom: never;
// bottom = 42; // ❌ never 不能赋值为任何具体值

// 任何类型都可赋值给 unknown
const a: unknown = "a";

// never 可赋值给任何类型
const b: string = bottom; // ✅
```

---

## 6. 类型断言（Type Assertions）

当开发者比编译器更了解值的类型时，可使用类型断言：

```typescript
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// 或使用尖括号语法（JSX 中不推荐）：
// const canvas = <HTMLCanvasElement>document.getElementById("canvas");

// 双重断言（极度谨慎使用）
const str = (42 as unknown) as string; // 绕过类型检查
```

**最佳实践**：
- 优先使用类型守卫替代类型断言
- 避免 `as any` 和双重断言
- 使用 `satisfies` 运算符（TS 4.9+）保留类型推断的同时进行约束检查

```typescript
// satisfies 优于 as 的场景
const config = {
  host: "localhost",
  port: 3000
} satisfies Record<string, string | number>;

// config.host 仍为 "localhost"（字面量类型），而不是 string | number
```

---

## 7. 最新进展

### TS 5.5+ 的类型推断改进

- **正则表达式字面量类型推断**：正则字面量在某些上下文中可被推断为更精确的类型
- **数组方法类型推断改进**：`filter`、`find` 等方法在泛型上下文中的推断更精确

### TS 6.0 默认配置变革

TypeScript 6.0 将以下配置设为默认：
- `"strict": true` —— 包含 `strictNullChecks`，null/undefined 必须显式处理
- `"module": "esnext"` —— 原生 ESM 支持
- `"target": "es2025"` —— 对齐最新 ECMAScript

这意味着新项目的**基础类型安全性默认提升**，`any` 和隐式 `undefined` 的使用将大幅减少。

---

## 常见陷阱总结

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| `{}` 不是空对象 | `{}` 类型接受除 null/undefined 外的任何值 | 使用 `Record<string, never>` 表示空对象 |
| `Object` 过于宽泛 | `Object` 接受几乎所有值 | 使用具体接口或 `object` |
| `any` 的传染性 | 与 any 交互的变量都变成 any | 使用 `unknown` + 类型守卫 |
| 枚举反向映射 | 数字枚举允许反向索引访问 | 使用字面量联合类型替代 |
| `null` 不是 `undefined` | strictNullChecks 下必须分别处理 | 使用 `value ?? default` 统一处理 |
| `void` 不等于 `undefined` | void 函数可返回 undefined，但 undefined 类型函数必须显式返回 | 根据语义选用 |

---

**参考规范**：ECMA-262 §6.1 ECMAScript Language Types | TypeScript Handbook: Everyday Types
