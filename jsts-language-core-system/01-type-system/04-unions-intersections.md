# 联合类型与交叉类型

> Union (`|`) 与 Intersection (`&`) 的完整语义、可辨识联合与实战模式
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 联合类型（Union Types）

联合类型表示一个值可以是多种类型之一：

```typescript
type StringOrNumber = string | number;
type Status = "pending" | "success" | "error";

function format(input: StringOrNumber): string {
  return input.toString();
}
```

### 1.1 可辨识联合（Discriminated Unions）

可辨识联合是 TypeScript 中最强大的模式之一，通过**共同的字面量属性**（判别式）来区分联合成员：

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

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

**可辨识联合的三要素**：
1. **联合类型**：多个对象类型的联合
2. **判别式属性**：所有成员共有的字面量类型属性
3. **类型守卫**：使用判别式进行类型收窄

### 1.2 穷尽性检查（Exhaustiveness Checking）

利用 `never` 类型确保 switch/case 覆盖所有联合成员：

```typescript
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

function handleEvent(event: MouseEvent | KeyboardEvent | TouchEvent) {
  switch (event.type) {
    case "click": /* ... */ break;
    case "keydown": /* ... */ break;
    case "touchstart": /* ... */ break;
    default:
      assertNever(event); // 如果新增事件类型未处理，编译报错
  }
}
```

---

## 2. 交叉类型（Intersection Types）

交叉类型将多个类型合并为一个类型，包含所有类型的成员：

```typescript
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;
// 等价于 { name: string; age: number; }

const person: Person = { name: "Alice", age: 30 };
```

### 2.1 同名属性的合并行为

当交叉类型的成员有同名属性时，TypeScript 会尝试合并它们的类型：

```typescript
type A = { x: string };
type B = { x: number };

type C = A & B;
// C['x'] = string & number = never（不可能的值）

const c: C = { x: "hello" }; // ❌ Type 'string' is not assignable to type 'never'
```

对于对象方法，交叉类型会产生重载：

```typescript
type Callable = { (x: string): string };
type Constructable = { new (x: number): Date };

type Hybrid = Callable & Constructable;
// Hybrid 既可以作为函数调用，也可以作为构造函数使用
```

### 2.2 交叉类型与 `extends` 的对比

```typescript
// interface extends 要求属性兼容
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// type & 允许属性冲突（变为 never）
type Weird = { name: string } & { name: number };
```

---

## 3. 联合与交叉的分配律

### 3.1 分配律规则

交叉类型对联合类型满足分配律：

```typescript
// A & (B | C) ≡ (A & B) | (A & C)
type Distr = { a: string } & ({ b: number } | { c: boolean });
// 等价于：({ a: string; b: number }) | ({ a: string; c: boolean })
```

这在类型运算中非常实用：

```typescript
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string };

type WithTimestamp<T> = T & { timestamp: number };

type TimedEvent = WithTimestamp<Event>;
// 等价于：
// | { type: "click"; x: number; y: number; timestamp: number }
// | { type: "keypress"; key: string; timestamp: number }
```

### 3.2 非分配场景

条件类型中的裸类型参数才具有分配性：

```typescript
// 分配性：裸类型参数
type ToArray<T> = T extends any ? T[] : never;
type A = ToArray<string | number>; // string[] | number[]

// 非分配性：包裹在元组中
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type B = ToArrayNonDist<string | number>; // (string | number)[]
```

---

## 4. 实战模式

### 4.1 Redux Action 类型设计

```typescript
type Action =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: number }
  | { type: "reset" }
  | { type: "setUser"; payload: { id: string; name: string } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + action.payload };
    case "setUser":
      return { ...state, user: action.payload };
    // ...
  }
}
```

### 4.2 API 响应类型设计

```typescript
type ApiResponse<T> =
  | { success: true; data: T; status: 200 }
  | { success: false; error: string; status: 400 | 401 | 404 | 500 };

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    return { success: false, error: await res.text(), status: res.status as 400 | 401 | 404 | 500 };
  }
  return { success: true, data: await res.json(), status: 200 };
}
```

### 4.3 状态机类型建模

```typescript
type State =
  | { status: "idle" }
  | { status: "loading"; requestId: string }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };

function canTransition(from: State, to: State): boolean {
  if (from.status === "idle" && to.status === "loading") return true;
  if (from.status === "loading" && (to.status === "success" || to.status === "error")) return true;
  return false;
}
```

---

## 5. 常见陷阱

### 5.1 `never` 的意外产生

```typescript
// 空联合 = never
type Empty = never | never; // never

// 交叉冲突 = never
type Bad = string & number; // never
```

### 5.2 联合类型的方法调用限制

```typescript
function process(value: string | number) {
  value.toString(); // ✅ 两者都有 toString()
  value.toFixed();  // ❌ 'string | number' 上没有 toFixed()
}
```

**解决方案**：使用类型守卫收窄后再调用：

```typescript
function process(value: string | number) {
  if (typeof value === "number") {
    value.toFixed(2); // ✅ value 被收窄为 number
  } else {
    value.toUpperCase(); // ✅ value 被收窄为 string
  }
}
```

### 5.3 交叉类型的属性冲突

```typescript
// 交叉同名属性可能导致 never
type Config = { mode: "dev"; debug: true } & { mode: "prod"; debug: false };
// Config['mode'] = "dev" & "prod" = never
// 这种类型实际上无法构造任何值
```

---

## 6. 最新进展

### TS 5.5+ 的联合类型推断改进

TypeScript 5.5 改进了某些场景下的联合类型推断精度，特别是在数组过滤和方法链中：

```typescript
// TS 5.5 之前可能推断为 (string | null)[]
// TS 5.5+ 推断为 string[]
const filtered = ["a", null, "b"].filter((x): x is string => x !== null);
```

### TS 6.0 默认严格模式

`strict: true` 默认启用后，联合类型的穷尽性检查更加严格，未覆盖的联合成员会在编译时报错。

---

**参考规范**：TypeScript Handbook: Unions and Intersections | ECMA-262 §6.1.7 The Object Type
