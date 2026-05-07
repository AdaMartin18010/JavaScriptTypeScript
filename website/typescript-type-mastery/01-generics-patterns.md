---
title: 01 泛型实战模式
description: 从基础约束到高阶泛型，掌握 TypeScript 泛型在实际工程中的可复用模式。覆盖约束、默认参数、分布条件、型变规则和高阶类型设计。
---

# 01 泛型实战模式

> **前置知识**：基础泛型语法（`function f<T>(x: T): T`）、interface/type 基础
>
> **目标**：掌握 8 个可复用的泛型模式，能够独立设计复杂的泛型工具类型

---

## 1. 泛型约束模式（Generic Constraints）

### 核心问题

如何让泛型参数只接受具有特定属性的类型？

### 模式：extends 约束 + 映射推导

```typescript
// 基础约束：T 必须有 length 属性
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

getLength('hello');     // ✅ string 有 length
getLength([1, 2, 3]);   // ✅ array 有 length
getLength(123);         // ❌ number 没有 length

// 多字段约束：使用接口组合
type HasId = { id: string };
type HasTimestamp = { createdAt: Date; updatedAt: Date };

function sortById<T extends HasId>(items: T[]): T[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

// 嵌套约束：约束嵌套对象的形状
type ApiResponse<T extends Record<string, unknown>> = {
  data: T;
  meta: { page: number; total: number };
};

// 使用
type User = { name: string; age: number };
const res: ApiResponse<User> = {
  data: { name: 'Alice', age: 30 },
  meta: { page: 1, total: 100 },
};
```

### 实战要点

- **约束粒度**：约束越精确，类型推断越准确，但复用性越低。在库代码中偏好宽泛约束，在业务代码中偏好精确约束。
- **组合约束**：使用 `&` 组合多个约束接口，而非创建庞大的单一接口。

---

## 2. 默认类型参数（Default Type Parameters）

### 核心问题

如何为泛型提供默认值，使常见场景下的使用更简洁？

### 模式：从右到左的默认参数

```typescript
// 从右到左设置默认值
type FetchOptions<
  TResponse = unknown,
  TError = Error,
  TMeta = Record<string, never>
> = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  transform?: (data: unknown) => TResponse;
  onError?: (error: TError) => void;
  meta?: TMeta;
};

// 常见用法：只指定响应类型
const userOptions: FetchOptions<{ name: string }> = {
  url: '/api/user',
};

// 完整用法：指定所有类型参数
const advancedOptions: FetchOptions<User, ApiError, RequestMeta> = {
  url: '/api/user',
  meta: { retryCount: 3 },
};
```

### 实战要点

- **默认参数顺序**：必须从最右端开始设置默认值，左侧参数不能跳过。
- **unknown 优于 any**：默认响应类型使用 `unknown` 强制用户明确转换，比 `any` 更安全。

---

## 3. 分布式条件类型（Distributive Conditional Types）

### 核心问题

如何对联合类型的每个成员单独应用条件类型？

### 模式：裸类型参数的自动分发

```typescript
// 经典模式：将联合类型转为数组元素的联合
type ToArray<T> = T extends any ? T[] : never;

// 分布式行为：对联合类型的每个成员单独应用
type A = ToArray<string | number>;
//   ^? string[] | number[]

// 非分布式行为：用 [] 包裹阻止分发
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type B = ToArrayNonDist<string | number>;
//   ^? (string | number)[]

// 实战：提取对象中所有函数类型的属性名
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface User {
  name: string;
  age: number;
  updateName: (name: string) => void;
  validate: () => boolean;
}

type UserMethods = FunctionPropertyNames<User>;
//   ^? "updateName" | "validate"
```

### 实战要点

- **裸类型参数触发分发**：`T extends X` 中如果 `T` 是裸类型参数（未被 [] 包裹），且传入联合类型，则自动分发。
- **阻止分发**：用 `[T] extends [X]` 或 `T & {}` 阻止不需要的分布行为。

---

## 4. 型变规则实战（Variance in Practice）

### 核心问题

为什么 `Cat[]` 是 `Animal[]` 的子类型，但 `Box<Cat>` 不一定是 `Box<Animal>` 的子类型？

### 模式：理解位置决定型变

```typescript
// 协变（Covariant）：返回值位置
type Producer<T> = () => T;
declare const animalProducer: Producer<Animal>;
declare const catProducer: Producer<Cat>;
const a: Producer<Animal> = catProducer; // ✅ Cat ⊆ Animal，返回值可替换

// 逆变（Contravariant）：参数位置
type Consumer<T> = (x: T) => void;
declare const animalConsumer: Consumer<Animal>;
declare const catConsumer: Consumer<Cat>;
const c: Consumer<Cat> = animalConsumer; // ✅ Animal ⊇ Cat，能接受更宽的输入

// 双向变（Bivariant）：TS 函数参数默认（strictFunctionTypes 关闭时）
// 不变（Invariant）：读写都发生的位置
type State<T> = { get: () => T; set: (x: T) => void };
// State<Cat> 既不是 State<Animal> 的子类型，也不是父类型

// 实战：设计类型安全的 EventEmitter
interface EventMap {
  click: { x: number; y: number };
  load: { timestamp: number };
}

type EventEmitter<Events extends Record<string, any>> = {
  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void  // 逆变位置
  ): void;
  emit<K extends keyof Events>(
    event: K,
    payload: Events[K]                    // 协变位置
  ): void;
};
```

### 实战要点

- **strictFunctionTypes**：始终开启，避免函数参数双向变带来的类型不安全。
- **型变标记**：在复杂泛型库中，可用 `// @ts-expect-error` 测试型变行为是否符合预期。

---

## 5. 高阶泛型（Higher-Kinded Types 模拟）

### 核心问题

TypeScript 不支持真正的 HKT（如 `interface Functor<F<_>>`），如何模拟？

### 模式：类型标识 + 映射表

```typescript
// HKT 模拟：用接口和映射表实现"类型构造函数"
interface HKT {
  readonly _tag: string;
  readonly _A?: unknown;
}

interface ArrayHKT extends HKT {
  readonly _tag: 'Array';
  readonly _A: unknown;
  readonly type: Array<this['_A']>;
}

interface PromiseHKT extends HKT {
  readonly _tag: 'Promise';
  readonly _A: unknown;
  readonly type: Promise<this['_A']>;
}

// 映射表
type Apply<F extends HKT, A> = (F & { _A: A })['type'];

// 使用
type R1 = Apply<ArrayHKT, number>;     // number[]
type R2 = Apply<PromiseHKT, string>;   // Promise<string>

// 实战：通用的 map 函数
type MapFn<F extends HKT> = <A, B>(
  fa: Apply<F, A>,
  f: (a: A) => B
) => Apply<F, B>;

// 虽然不如真正的 HKT 优雅，但在 TS 类型体操中足够使用
```

### 实战要点

- **适用场景**：库级抽象（如 fp-ts、Effect-TS），业务代码中极少需要。
- **替代方案**：如果不需要完全的泛型容器抽象，直接用函数重载更实用。

---

## 6. 泛型推断的上下文感知（Contextual Typing）

### 核心问题

如何让泛型根据使用上下文自动推断出最精确的类型？

### 模式：从回调参数反向推断

```typescript
// 经典模式：根据回调推断数组元素类型
declare function map<T, U>(arr: T[], fn: (item: T) => U): U[];

const result = map([1, 2, 3], (n) => n.toString());
//    ^? string[] — T 推断为 number，U 推断为 string

// 更复杂的模式：根据配置对象推断
type Config<T> = {
  initial: T;
  reducer: (prev: T, action: unknown) => T;
};

function createStore<T>(config: Config<T>) {
  return config;
}

// T 从 initial 推断为 { count: number }
const store = createStore({
  initial: { count: 0 },
  reducer: (prev, action) => prev, // prev 自动推断为 { count: number }
});

// as const 增强推断精度
const config = {
  modes: ['light', 'dark', 'auto'] as const,
};

type Mode = (typeof config.modes)[number]; // "light" | "dark" | "auto"
```

### 实战要点

- **as const 是推断的放大器**：在配置对象上使用 `as const` 可以将推断从 `string` 提升到字面量联合类型。
- **NoInfer<T>（TS 5.4+）**：当某些位置不应该参与泛型推断时使用。

---

## 7. 递归泛型与树形结构

### 核心问题

如何用泛型表达递归数据结构（如树、嵌套菜单）？

### 模式：自引用接口 + 条件终止

```typescript
// 递归树节点
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

const tree: TreeNode<string> = {
  value: 'root',
  children: [
    { value: 'child1', children: [{ value: 'grandchild' }] },
    { value: 'child2' },
  ],
};

// 递归类型工具：深度 Partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 递归类型工具：深度 Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 限制递归深度（防止类型系统无限展开）
type DeepPartialLimited<T, Depth extends number = 3> = [Depth] extends [never]
  ? T
  : T extends object
  ? { [K in keyof T]?: DeepPartialLimited<T[K], Prev<Depth>> }
  : T;

type Prev<N extends number> = [-1, 0, 1, 2, 3, 4, 5][N];
```

### 实战要点

- **递归深度限制**：在工具库中，递归类型应限制深度（通常 3-5 层），避免编译器无限展开导致的性能问题。
- **终止条件**：递归类型必须有明确的终止条件（`T extends object` 或联合类型判断）。

---

## 8. 泛型与 branded/opaque 类型

### 核心问题

如何在结构类型系统中实现名义类型安全（Nominal Typing）？

### 模式：交叉类型 + 品牌字段

```typescript
// Branded Type：编译时品牌，运行时不存在
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

const userId = createUserId('u-123');
const orderId = createOrderId('o-456');

// 类型安全：不能混用
function getUser(id: UserId) { /* ... */ }
getUser(userId);    // ✅
getUser(orderId);   // ❌ Type 'OrderId' is not assignable to type 'UserId'

// Opaque Type：更严格，无法从底层类型推导
type Opaque<K, T> = T & { readonly __opaque__: K };
type USD = Opaque<'USD', number>;
type EUR = Opaque<'EUR', number>;

function usd(amount: number): USD {
  return amount as USD;
}

const price = usd(100);
// price + 50      // ❌ 不能直接运算
Number(price) + 50 // ✅ 显式转换后可用
```

### 实战要点

- **品牌字段命名**：使用 `__brand` 或 `__opaque__` 这种不太可能与真实属性冲突的名称。
- **运行时成本为零**：品牌类型在编译后完全擦除，不影响运行时性能。

---

## 常见陷阱

| 陷阱 | 示例 | 修正 |
|------|------|------|
| **过度约束** | `<T extends Record<string, string>>` | 使用 `<T extends Record<string, unknown>>` 或更宽泛的约束 |
| **忽略默认参数** | 每次使用都要传所有类型参数 | 为最常用参数设置合理的默认值 |
| **裸类型参数的意外分发** | `type X<T> = T extends string ? T : never` | 需要阻止分发时用 `[T] extends [string]` |
| **递归无终止** | `type Deep<T> = { [K in keyof T]: Deep<T[K]> }` | 添加 `T extends object ? ... : T` 终止条件 |

---

## 练习

### Easy

1. 实现 `PickByValue<T, V>` — 从 T 中选出值类型为 V 的属性。
2. 实现 `OptionalKeys<T>` — 返回 T 中所有可选属性名的联合类型。

### Medium

1. 实现 `DeepReadonly<T>` — 递归地将 T 的所有属性设为 readonly。
2. 实现 `Flatten<T>` — 将嵌套数组类型 `T[][]` 展平为 `T[]`。

### Hard

1. 实现 `TupleToUnion<T>` — 将元组类型转为联合类型（不用 `[number]`）。
2. 实现 `UnionToIntersection<U>` — 将联合类型转为交叉类型。

---

## 延伸阅读

- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Total TypeScript — Generics](https://www.totaltypescript.com/concepts)
- [Variance in TypeScript](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance)
