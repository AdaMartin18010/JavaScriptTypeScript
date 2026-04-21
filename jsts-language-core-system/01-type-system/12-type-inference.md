# 类型推断

> TypeScript 编译器如何推导类型：上下文推断、泛型推断与最佳通用类型
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础推断

### 1.1 变量初始化推断

```typescript
let x = 3;        // number
let y = "hello";  // string
let z = [1, 2];   // number[]
```

### 1.2 最佳通用类型

```typescript
let arr = [0, 1, null];
// 推断为 (number | null)[]
```

### 1.3 上下文类型（Contextual Typing）

```typescript
type EventHandler = (event: MouseEvent) => void;

// event 的类型由上下文推断
const handler: EventHandler = (event) => {
  // event 自动推断为 MouseEvent
};
```

---

## 2. 泛型推断

### 2.1 从参数推断

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const n = identity(42);    // T 推断为 number
const s = identity("hi");  // T 推断为 string
```

### 2.2 多类型参数推断

```typescript
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const lengths = map(["a", "bb"], s => s.length);
// T = string, U = number，结果类型为 number[]
```

### 2.3 显式指定类型参数

```typescript
const result = map<string, number>(["a", "b"], s => s.length);
```

---

## 3. 推断的局限性

### 3.1 无法推断时退化为 any

```typescript
// noImplicitAny 开启时会报错
function noTypes(a, b) {
  return a + b;
}
```

### 3.2 复杂推断

```typescript
// 需要显式注解的场景
const fetchData = async <T>(): Promise<T> => {
  const response = await fetch("/api/data");
  return response.json() as Promise<T>;
};

const data = await fetchData<{ id: string }>();
```

---

**参考规范**：TypeScript Handbook: Type Inference | TypeScript Spec §4.19 Inference
