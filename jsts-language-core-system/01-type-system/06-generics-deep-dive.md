# 泛型深度

> 从基础泛型到高级约束、变型与映射泛型的完整掌握
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 泛型基础

泛型（Generics）允许定义**类型参数**，使类型和函数可以工作于多种类型之上：

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);     // 显式指定
const str = identity("hello");         // 类型推断：T = string

// 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
}

// 泛型类
class Box<T> {
  constructor(private content: T) {}
  getContent(): T {
    return this.content;
  }
}
```

### 1.1 泛型约束（Constraints）

使用 `extends` 限制类型参数的范围：

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello");     // ✅ string 有 length
logLength([1, 2, 3]);   // ✅ 数组有 length
logLength(42);          // ❌ number 没有 length
```

### 1.2 泛型默认值

```typescript
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

// 使用默认值
const res: ApiResponse = { data: "anything", status: 200 }; // T = unknown

// 覆盖默认值
const res2: ApiResponse<string> = { data: "hello", status: 200 };
```

### 1.3 多类型参数

```typescript
function mapPair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const pair = mapPair("id", 42); // [string, number]
```

---

## 2. 高级泛型模式

### 2.1 条件约束

```typescript
type NonEmptyArray<T> = T[] & { 0: T };

function first<T>(arr: NonEmptyArray<T>): T {
  return arr[0];
}

first([1, 2, 3]); // ✅
first([]);        // ❌ Argument of type 'never[]' is not assignable
```

### 2.2 泛型与映射类型的结合

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null; }
```

### 2.3 键约束（Key Constraint）

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
const name = getProperty(user, "name");     // string
const age = getProperty(user, "age");       // number
// getProperty(user, "email");              // ❌ "email" 不是 keyof User
```

---

## 3. 泛型推断

### 3.1 调用签名推断

```typescript
declare function createArray<T>(length: number, value: T): T[];

const arr = createArray(3, "x"); // T 推断为 string，结果：string[]
```

### 3.2 上下文推断

```typescript
interface ComponentProps<T> {
  data: T[];
  renderItem: (item: T) => string;
}

function List<T>(props: ComponentProps<T>) { /* ... */ }

// T 从 data 推断为 { name: string }
List({
  data: [{ name: "Alice" }, { name: "Bob" }],
  renderItem: (item) => item.name // item 被推断为 { name: string }
});
```

### 3.3 泛型参数的传播

```typescript
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

// T 从调用处传播
const user = await fetchJson<User>("/api/user");
```

---

## 4. 变型（Variance）在泛型中的体现

### 4.1 协变位置与逆变位置

```typescript
interface Producer<T> {
  produce(): T; // T 在返回值位置 → 协变
}

interface Consumer<T> {
  consume(item: T): void; // T 在参数位置 → 逆变
}

// 协变：Producer<Cat> 可赋值给 Producer<Animal>
// 逆变：Consumer<Animal> 可赋值给 Consumer<Cat>
```

### 4.2 `out` / `in` 显式注解（TS 4.7+）

```typescript
// out 标记协变位置
type Producer<out T> = () => T;

// in 标记逆变位置
type Consumer<in T> = (item: T) => void;

// 编译器可据此做更严格的变型检查
```

### 4.3 严格变型检查

```typescript
// --strictFunctionTypes 下，方法参数是双变的（bivariant）
// 但函数属性参数是逆变的

interface Comparator<T> {
  compare(a: T, b: T): number; // 方法：参数双变
}

type ComparatorFn<T> = (a: T, b: T) => number; // 函数类型：参数逆变
```

---

## 5. 实战模式

### 5.1 泛型工厂函数

```typescript
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}

class User {
  name = "Anonymous";
}

const user = createInstance(User); // user: User
```

### 5.2 泛型 React 组件

```typescript
interface ListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, keyExtractor, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### 5.3 泛型状态管理

```typescript
type Action<TState, TPayload> = {
  type: string;
  reducer: (state: TState, payload: TPayload) => TState;
};

function createSlice<TState>() {
  return <TPayload>(action: Action<TState, TPayload>) => action;
}
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 泛型参数过多 | `function f<A, B, C, D, E>()` 难以使用 | 使用接口组合参数；拆分为多个函数 |
| 推断失败时的默认行为 | 复杂场景推断为 `{}` | 显式提供泛型参数 |
| 泛型与 `any` 的混用 | `function f<T>(x: T)` 传入 `any` 后 T = any | 添加约束限制；使用 `unknown` |
| 泛型在 JSX 中的解析歧义 | `<T>value` 在 TSX 中被解析为 JSX 标签 | 使用 `value as T` 或 `<T,> extends` 后缀逗号 |
| 协变/逆变导致的类型不安全 | 双变参数允许不安全的赋值 | 启用 `--strictFunctionTypes` |

---

## 7. 最新进展

### TS 5.4+ `NoInfer<T>`

阻止特定泛型位置参与推断：

```typescript
function createStore<T>(
  initialState: T,
  validate: (state: NoInfer<T>) => boolean
): T {
  if (!validate(initialState)) throw new Error("Invalid");
  return initialState;
}

// validate 参数类型与 initialState 一致，不会从 validate 反向推断
```

### TS 6.0 默认 `strict: true`

泛型约束和推断默认更加严格，隐式 `any` 在泛型中的使用被禁止，提高了泛型代码的类型安全性。

---

**参考规范**：TypeScript Handbook: Generics | ECMA-262 §6.2.5 The Reference Specification Type
