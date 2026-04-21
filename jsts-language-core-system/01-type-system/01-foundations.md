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
| 语义 | 变量未初始化 | 对象引用有意为空 |
| 默认参数 | 触发默认值 | 不触发（显式传入 null） |
| JSON.stringify | 被忽略 | 保留为 `null` |
| 可选链短路 | 是 | 是 |

```typescript
function greet(name?: string) {
  return name ?? "Guest"; // undefined 触发默认值，null 也触发
}

greet();        // "Guest"
greet(undefined); // "Guest"
greet(null);    // "Guest"（如果意图是传入空值，可能不是预期行为）
```

**TypeScript 严格空检查（`strictNullChecks`）**：开启后，`null` 和 `undefined` 不能赋值给其他类型，必须显式处理。

---

## 2. 特殊类型

### 2.1 `any`：类型系统的逃生舱

```typescript
let anything: any = 4;
anything = "string";     // ✅
anything.toFixed();      // ✅ 编译通过，运行时可能报错
anything.nonExistent();  // ✅ 编译通过，运行时报错
```

**使用 `any` 的后果**：
- 失去类型检查保护
- 编辑器失去自动补全和重构支持
- 错误在运行时才发现

**何时使用 `any`**（应尽量减少）：
- 从 JavaScript 迁移的过渡期
- 第三方库缺少类型定义
- 确实无法确定类型的动态数据（如 JSON.parse 的结果）

### 2.2 `unknown`：类型安全的 `any`

```typescript
let unknownValue: unknown = 4;
unknownValue = "string";

// ❌ 不能直接使用
unknownValue.toFixed();
// ^^^^^^^^^^^ Error: Object is of type 'unknown'

// ✅ 必须先进行类型收窄
if (typeof unknownValue === "number") {
  unknownValue.toFixed(); // ✅ unknownValue 被收窄为 number
}
```

**`unknown` vs `any` 的核心区别**：

| 特性 | `any` | `unknown` |
|------|-------|-----------|
| 可以赋值给任何类型 | ✅ | ❌ |
| 可以进行任何操作 | ✅ | ❌ |
| 使用时需要类型检查 | 否 | 是 |
| 类型安全 | 否 | 是 |

**最佳实践**：默认使用 `unknown` 代替 `any`。

### 2.3 `never`：空类型与穷尽性检查

`never` 表示**不可能存在的值**，在类型系统中有多重用途：

#### 作为函数的返回类型

```typescript
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

#### 在联合类型中自动消除

```typescript
type T = string | never; // 等价于 string
```

#### 穷尽性检查（Exhaustiveness Checking）

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    default:
      // 如果 Shape 新增成员未处理，此处会报错
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 2.4 `void`：无返回值的语义

```typescript
function logMessage(message: string): void {
  console.log(message);
  // 没有 return 语句，或 return undefined
}

// void 与 undefined 的区别
function returnsVoid(): void {
  return undefined; // ✅
}

function returnsUndefined(): undefined {
  return undefined; // ✅
  // 如果没有 return 语句，在 strictNullChecks 下会报错
}
```

**回调函数中的 `void` 返回类型**：

```typescript
// 声明回调不返回值，但允许调用者返回任何值
type Callback = () => void;

const cb: Callback = () => "hello"; // ✅ 允许，返回值被忽略
```

---

## 3. 复合类型

### 3.1 数组类型

```typescript
// 两种声明方式等价
const nums: number[] = [1, 2, 3];
const nums2: Array<number> = [1, 2, 3];

// 只读数组
const readonlyNums: ReadonlyArray<number> = [1, 2, 3];
readonlyNums.push(4); // ❌ Error

// 元组（固定长度、固定类型）
const point: [number, number] = [10, 20];
const person: [string, number] = ["Alice", 30];

// 带可选元素的元组
const optionalTuple: [string, number?] = ["hello"];

// 带剩余元素的元组
const restTuple: [string, ...number[]] = ["hello", 1, 2, 3];
```

### 3.2 对象类型

```typescript
// 内联类型
const person: { name: string; age: number } = {
  name: "Alice",
  age: 30
};

// 可选属性
const config: { host: string; port?: number } = {
  host: "localhost"
};

// 只读属性
const readonlyPoint: { readonly x: number; readonly y: number } = {
  x: 1, y: 2
};

// 索引签名
const scores: { [key: string]: number } = {
  math: 90,
  english: 85
};
```

### 3.3 枚举（Enum）

```typescript
// 数字枚举（默认从 0 开始）
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// 显式赋值
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Error = "ERROR"
}

// 常量枚举（编译时内联）
const enum HttpStatus {
  OK = 200,
  NotFound = 404
}
```

**枚举的注意事项**：
- 数字枚举会生成双向映射的 JavaScript 对象
- 字符串枚举只生成单向映射
- `const enum` 在编译时完全内联，不生成运行时代码
- TypeScript 社区对枚举有争议，部分开发者倾向使用联合类型替代

---

## 4. 类型层级

TypeScript 的类型系统形成一个层级结构：

```
        unknown (top type)
           │
    ┌─────┼─────┐
    │     │     │
  object string number boolean symbol bigint null undefined
    │
  ┌─┴─┐
  │   │
 {}  []
  │
  ...
  never (bottom type)
```

### 4.1 Top Type：`unknown`

`unknown` 是所有类型的父类型（超集）。

### 4.2 Bottom Type：`never`

`never` 是所有类型的子类型。空联合 `never | never` 仍为 `never`。

### 4.3 类型兼容性

TypeScript 使用**结构子类型（Structural Subtyping）**：兼容性由结构决定，而非名义。

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

const p3d: Point3D = { x: 1, y: 2, z: 3 };
const p2d: Point2D = p3d; // ✅ Point3D 结构包含 Point2D 的所有属性
```

---

## 5. TS 5.4+：`NoInfer<T>`

TypeScript 5.4 引入 `NoInfer<T>`，防止类型参数在某些位置被用于推断：

```typescript
// 问题：createStore 的 T 从 validate 参数推断
declare function createStore<T>(
  initial: T,
  validate: (v: T) => boolean
): T;

// validate 的参数类型影响 T 的推断
createStore("hello", (v) => v.length > 0); // T = string ✅

// 但如果 validate 的类型更宽泛：
createStore("hello", (v: unknown) => typeof v === "string");
// T = unknown ❌ 不是我们想要的

// 使用 NoInfer 解决
declare function createStore<T>(
  initial: T,
  validate: (v: NoInfer<T>) => boolean
): T;

createStore("hello", (v: unknown) => typeof v === "string");
// T = string ✅ initial 单独决定 T
```

---

## 6. 类型断言与守卫

### 6.1 类型断言

```typescript
const input = document.getElementById("root") as HTMLDivElement;
const input2 = <HTMLInputElement>document.getElementById("input");
// 注意：第二种语法在 JSX 中不可用
```

### 6.2 非空断言

```typescript
const element = document.getElementById("root")!;
// ! 断言元素不为 null
```

### 6.3 `satisfies` 运算符（TS 4.9+）

```typescript
const config = {
  host: "localhost",
  port: 3000
} satisfies { host: string; port?: number };

// config 保持原始类型推断（{ host: "localhost"; port: 3000 }）
// 但检查是否满足给定类型的约束
```

---

**参考规范**：ECMA-262 §6.1 ECMAScript Language Types | TypeScript Handbook: Everyday Types
