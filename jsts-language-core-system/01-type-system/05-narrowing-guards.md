# 类型收窄与类型守卫

> 从运行时检查到编译时 Narrowing 的完整技术栈
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 内置类型守卫

类型守卫（Type Guards）是运行时检查 + 编译时类型收窄的机制。TypeScript 会根据条件语句自动收窄类型。

### 1.1 `typeof` 守卫

```typescript
function process(input: string | number | boolean) {
  if (typeof input === "string") {
    // input 被收窄为 string
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    // input 被收窄为 number
    return input.toFixed(2);
  }
  // input 被收窄为 boolean
  return input ? "yes" : "no";
}
```

**`typeof` 支持的类型**：`"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`

**`typeof` 的局限性**：

- 对 `null` 返回 `"object"`（历史 bug）
- 无法区分对象的具体类型
- 对数组返回 `"object"`

```typescript
function check(x: string | string[]) {
  if (typeof x === "object") {
    // x 被收窄为 string[]（因为 null 已被排除）
    // 但 typeof null === "object"，strictNullChecks 下才安全
  }
}
```

### 1.2 `instanceof` 守卫

```typescript
function process(error: Error | TypeError | RangeError) {
  if (error instanceof TypeError) {
    // error 被收窄为 TypeError
    console.log("Type issue:", error.message);
  } else if (error instanceof RangeError) {
    // error 被收窄为 RangeError
    console.log("Range issue:", error.message);
  } else {
    // error 被收窄为 Error
    console.log("Generic error:", error.message);
  }
}
```

**`instanceof` 的局限性**：

- 不适用于跨 Realm（iframe/Worker）的对象
- 对原始类型无效
- 原型链被修改后可能不可靠

### 1.3 `in` 运算符守卫

```typescript
type Car = { wheels: number; drive(): void };
type Boat = { sails: number; sail(): void };

function move(vehicle: Car | Boat) {
  if ("wheels" in vehicle) {
    // vehicle 被收窄为 Car
    vehicle.drive();
  } else {
    // vehicle 被收窄为 Boat
    vehicle.sail();
  }
}
```

### 1.4 等值比较守卫

```typescript
function process(x: string | null | undefined) {
  if (x === null) {
    // x 被收窄为 null
  } else if (x === undefined) {
    // x 被收窄为 undefined
  } else {
    // x 被收窄为 string
    x.toUpperCase();
  }
}

// 使用 == null 同时排除 null 和 undefined
function process2(x: string | null | undefined) {
  if (x == null) {
    // x 被收窄为 null | undefined
    return;
  }
  // x 被收窄为 string
  x.toUpperCase();
}
```

---

## 2. 自定义类型守卫

### 2.1 类型谓词（Type Predicates）

使用 `parameter is Type` 语法定义自定义守卫：

```typescript
interface Cat {
  name: string;
  meow(): void;
}

interface Dog {
  name: string;
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function greet(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // ✅ animal 被收窄为 Cat
  } else {
    animal.bark(); // ✅ animal 被收窄为 Dog
  }
}
```

**类型谓词的约束**：

- 返回值必须是 `boolean`
- 参数类型不能是可选参数（`animal?: Cat`）
- 谓词类型必须是参数类型的子类型

### 2.2 断言函数（Assertion Functions）

TS 3.7+ 引入的 `asserts` 谓词，用于在函数内部断言类型：

```typescript
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("Expected string, got " + typeof val);
  }
}

function process(input: unknown) {
  assertIsString(input);
  // input 被收窄为 string
  console.log(input.toUpperCase());
}
```

**断言函数 vs 类型谓词**：

| 特性 | 类型谓词 (`is`) | 断言函数 (`asserts`) |
|------|----------------|---------------------|
| 失败时行为 | 返回 false | 抛出异常 |
| 对控制流的影响 | 条件分支 | 后续代码直接收窄 |
| 使用场景 | 条件检查 | 前置条件验证 |

---

## 3. 控制流分析（Control Flow Analysis）

TypeScript 的编译器会跟踪代码的控制流，自动进行类型收窄：

### 3.1 赋值分析

```typescript
let x: string | number = "hello";
x = 42;
// x 被推断为 number（基于最近的赋值）
```

### 3.2 类型守卫的联合效果

```typescript
function process(x: string | number | boolean) {
  if (typeof x === "string" || typeof x === "number") {
    // x 被收窄为 string | number
    x.toString(); // ✅ 两者都有 toString()
  }
}
```

### 3.3 可辨识联合的自动收窄

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape) {
  if (shape.kind === "circle") {
    // shape 自动收窄为 { kind: "circle"; radius: number }
    return Math.PI * shape.radius ** 2;
  }
  // shape 自动收窄为 { kind: "square"; side: number }
  return shape.side ** 2;
}
```

### 3.4 可辨识联合的穷尽性检查

```typescript
type Action =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: number }
  | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment": return state + action.payload;
    case "decrement": return state - action.payload;
    case "reset": return 0;
    default:
      // 如果新增 Action 类型未处理，这里会编译错误
      const _exhaustive: never = action;
      return _exhaustive;
  }
}
```

---

## 4. 高级收窄技术

### 4.1 `switch(true)` 模式

```typescript
function process(value: unknown) {
  switch (true) {
    case typeof value === "string":
      // value 被收窄为 string
      return value.toUpperCase();
    case Array.isArray(value):
      // value 被收窄为 unknown[]
      return value.length;
    case value instanceof Date:
      // value 被收窄为 Date
      return value.toISOString();
    default:
      return String(value);
  }
}
```

### 4.2 品牌类型（Branded Types）与守卫

```typescript
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };

function isUserId(id: string): id is UserId {
  // 实际项目中可能有更复杂的验证
  return id.startsWith("user_");
}

function getUser(id: UserId) { /* ... */ }

const rawId = "user_123";
if (isUserId(rawId)) {
  getUser(rawId); // ✅ rawId 被收窄为 UserId
}
```

### 4.3 自定义类型守卫的组合

```typescript
function isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

function processItems(items: string[]) {
  if (isNonEmptyArray(items)) {
    // items 被收窄为 [string, ...string[]]
    console.log(items[0]); // 安全访问第一个元素
  }
}
```

---

## 5. 常见陷阱

### 5.1 类型守卫的 false positive

```typescript
// 看似正确的守卫，实际有漏洞
function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(item => typeof item === "string");
}

// 问题：空数组也满足条件
const empty: unknown = [];
if (isStringArray(empty)) {
  // empty 被推断为 string[]，但实际上它可能是 number[]
  // （因为空数组的 every 返回 true）
}
```

### 5.2 断言函数的副作用

```typescript
function assertDefined<T>(val: T | null | undefined): asserts val is T {
  if (val == null) throw new Error("Value is null or undefined");
}

// 断言函数不返回值，不能用于表达式中
const x = someValue;
assertDefined(x);
// 不能这样用：const y = assertDefined(x) && x.foo;
```

### 5.3 数组/对象属性的收窄限制

```typescript
function process(obj: { name: string } | null) {
  if (obj !== null) {
    // obj 被收窄为 { name: string }
    console.log(obj.name);
  }
}

// 但数组元素的收窄在循环中可能失效
function processArray(arr: (string | number)[]) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item === "string") {
      // item 被收窄为 string
      console.log(item.toUpperCase());
    }
    // 如果再次访问 arr[i]，需要重新检查
    // arr[i].toUpperCase(); // ❌ 错误
  }
}
```

### 5.4 解构后的类型收窄

```typescript
function process(obj: { value: string | number }) {
  const { value } = obj;
  if (typeof value === "string") {
    // value 被收窄为 string
    console.log(value.toUpperCase());
  }
  // 但 obj.value 没有被收窄！
  // obj.value.toUpperCase(); // ❌ 仍然是 string | number
}
```

---

## 6. 最新进展

### TS 5.5+ 的对象成员类型守卫收窄

TypeScript 5.5 改进了对象成员的类型守卫收窄：

```typescript
function process(obj: { value: string | number }) {
  if (typeof obj.value === "string") {
    // TS 5.5+：在某些简单场景下，obj 的类型也会相应收窄
    console.log(obj.value.toUpperCase());
  }
}
```

### TS 6.0 严格模式下的守卫增强

默认 `strict: true` 下，类型守卫的 narrowing 更加精确，`null` 和 `undefined` 的处理更加一致。

---

**参考规范**：TypeScript Handbook: Narrowing | ECMA-262 §7.2.11 Abstract Relational Comparison
