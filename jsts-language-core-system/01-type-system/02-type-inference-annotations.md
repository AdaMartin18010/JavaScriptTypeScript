# 类型推断与类型注解

> TypeScript 如何在不显式注解的情况下推断类型，以及何时需要显式注解
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 类型推断基础

TypeScript 的类型推断（Type Inference）是其核心特性之一。编译器在没有显式注解的情况下，通过分析代码结构自动推导类型。

### 1.1 变量声明推断

```typescript
// 基础推断
let x = 3;           // x: number
let y = "hello";     // y: string
let z = [1, 2, 3];   // z: number[]

// 对象推断
const person = {
  name: "Alice",
  age: 30
}; // person: { name: string; age: number; }

// 函数返回推断
function add(a: number, b: number) {
  return a + b; // 返回类型推断为 number
}
```

### 1.2 函数返回类型推断

```typescript
// 无 return 语句 → void
function log(msg: string) {
  console.log(msg);
}

// 多个 return 路径 → 联合类型
function parse(input: string) {
  if (input.startsWith("{")) return JSON.parse(input);
  return input; // 返回类型推断为 string | any（JSON.parse 返回 any）
}

// 递归函数推断
function factorial(n: number) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // 推断为 number
}
```

### 1.3 上下文类型推断（Contextual Typing）

当表达式的类型可以从其所在位置推断时，发生**上下文类型推断**：

```typescript
// 事件处理器的参数类型从 addEventListener 签名推断
window.addEventListener("click", (e) => {
  // e 被推断为 MouseEvent，无需显式注解
  console.log(e.clientX);
});

// 数组方法回调的类型推断
[1, 2, 3].map((item, index) => {
  // item: number, index: number（从数组类型推断）
  return item.toString();
});

// 对象字面量的上下文推断
type Point = { x: number; y: number };
const p: Point = { x: 1, y: 2 };
// 若写成 const p = { x: 1, y: 2 }，则推断为 { x: number; y: number }（更宽）
```

---

## 2. 高级推断机制

### 2.1 最佳公共类型（Best Common Type）

当从多个表达式推断类型时，TS 选择**最佳公共类型**：

```typescript
// 数组元素类型推断为 (number | string | boolean)[]
const arr = [0, 1, null, "hello", true];

// 如果没有公共类型，推断为联合类型
const mixed = [1, "two", { three: 3 }]; // (string | number | { three: number })[]
```

### 2.2 类型加宽（Widening）与 `const` 断言

TypeScript 在推断时会**加宽**字面量类型到其基类型：

```typescript
// 加宽：字面量类型 → 基类型
let x = "hello";        // x: string（而非 "hello"）
let y = 42;             // y: number（而非 42）

// const 断言阻止加宽
const x2 = "hello" as const;  // x2: "hello"
const y2 = 42 as const;       // y2: 42

// 对象/数组的 const 断言
const config = {
  host: "localhost",
  port: 3000,
  flags: ["a", "b"] as const
} as const;
// config 类型：
// { readonly host: "localhost"; readonly port: 3000; readonly flags: readonly ["a", "b"]; }
```

### 2.3 上下文类型与加宽的交互

```typescript
// 危险：字面量类型在 let 中被加宽
let method: "GET" | "POST" = "GET"; // ✅
let method2 = "GET";                 // method2: string（被加宽了！）

// 上下文类型可阻止不必要的加宽
type Action = { type: "increment" } | { type: "decrement" };
const action: Action = { type: "increment" }; // ✅ type 保持为字面量 "increment"
```

---

## 3. 显式类型注解

### 3.1 何时需要注解

| 场景 | 原因 | 示例 |
|------|------|------|
| 函数参数 | TS 无法从调用处推断 | `function greet(name: string)` |
| 无返回的函数 | 区分 `void` 与 `undefined` | `function log(): void` |
| 递归类型 | 推断需要起点 | `type Tree = { value: string; children: Tree[] }` |
| 复杂联合类型 | 提高可读性 | `type Result = Success \| Failure` |
| 公共 API | 作为文档契约 | 库导出的函数/接口 |

### 3.2 何时不需要注解

```typescript
// ✅ 简单推断场景不需要注解
const PI = 3.14159;                    // 明显是 number
const greeting = "Hello";               // 明显是 string
const double = (x: number) => x * 2;   // 返回类型 obvious

// ✅ 上下文类型已提供足够信息
const items = [1, 2, 3].map(n => n * 2); // items: number[]，无需注解
```

### 3.3 注解的代价与收益

**收益**：
- 显式文档化意图
- 更早捕获类型错误
-  IDE 支持更精确

**代价**：
- 增加代码冗余
- 维护负担（类型变更需同步更新注解）
- 可能过度约束（限制了推断的灵活性）

---

## 4. 推断边界情况

### 4.1 循环引用与推断

```typescript
// 需要显式注解打破循环依赖
interface Node {
  value: string;
  children: Node[]; // 自引用需要接口/类型别名作为推断起点
}
```

### 4.2 复杂表达式的推断限制

```typescript
// TS 可能推断过宽的类型
const obj = {
  a: 1,
  b: "hello"
};
// 推断为 { a: number; b: string; }
// 如需字面量类型，需 as const 或显式注解

// 条件表达式的推断
const value = Math.random() > 0.5 ? "yes" : "no";
// value: "yes" | "no"（保留字面量联合，因为两边都是字面量）
```

---

## 5. 最新进展

### TS 5.4+ 闭包类型推断改进

TypeScript 5.4 显著改进了闭包中的类型推断：

```typescript
// TS 5.4 之前：arr 推断为 (string | number)[]
// TS 5.4+：arr 推断为 string[]
function makeArray() {
  let arr = [];        // 初始推断为 any[]（隐式 any 需开启 noImplicitAny）
  arr.push("hello");
  arr.push("world");
  return arr;          // 返回 string[]
}
```

### `NoInfer<T>`（TS 5.4）

阻止特定位置的类型被用于推断：

```typescript
function createStore<T>(initial: T, validate: (state: NoInfer<T>) => boolean): T {
  if (!validate(initial)) throw new Error("Invalid");
  return initial;
}

// 没有 NoInfer 时，validate 参数可能推断为更宽的类型
// 使用 NoInfer 后，validate 的参数类型与 initial 一致
```

### TS 6.0 推断增强

- **上下文感知推断**：方法语法（method syntax）的类型推断更加可靠
- **默认 `strict: true`**：新项目的推断默认更严格、更安全

---

## 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| `let` 导致类型加宽 | `let x = "a"` 推断为 `string` 而非 `"a"` | 使用 `const` 或 `as const` |
| 空数组推断为 `any[]` | `let arr = []` 在 `noImplicitAny: false` 下为 `any[]` | 显式注解：`let arr: string[] = []` |
| 函数返回推断过宽 | 多 return 路径推断联合类型可能过宽 | 显式标注返回类型 |
| 解构丢失字面量类型 | `const { a } = { a: 1 }` 中 `a` 为 `number` | 使用 `as const` 或显式类型 |
| 泛型推断失败回退到 `{}` | 某些复杂场景推断为 `{}` | 添加显式泛型参数 |

---

**参考规范**：TypeScript Handbook: Type Inference | ECMA-262 §13.3.3 Destructuring Binding Patterns
