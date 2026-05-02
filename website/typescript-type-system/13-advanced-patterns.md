---
title: "第13章 高级类型模式"
description: "掌握 branded types、opaque types、phantom types、HKT 模拟与类型级递归等高级 TypeScript 类型模式"
keywords:
  - TypeScript
  - branded types
  - opaque types
  - phantom types
  - HKT
  - higher-kinded types
  - type-level recursion
  - design patterns
  - type safety
  - nominal typing
---

# 第13章 高级类型模式

TypeScript 的类型系统远比简单的接口和类型别名强大。本章将探讨一系列在生产级代码库中广泛应用的高级类型模式，这些模式能够在保持类型安全的同时，表达更丰富的领域语义。

---

## 13.1 Branded Types 的进阶应用

### 13.1.1 基础回顾

Branded Type 通过在底层类型上添加一个编译时-only 的标记，在结构化类型系统中模拟名义类型：

```typescript
type Brand<K, T> = T & { readonly __brand: K };

type UserId = Brand<'UserId', number>;
type ProductId = Brand<'ProductId', number>;

function UserId(n: number): UserId { return n as UserId; }
function ProductId(n: number): ProductId { return n as ProductId; }
```

### 13.1.2 通用 Branded 工厂

```typescript
// 使用闭包和类型守卫构建安全的 Branded Type
interface Branded<K, T> {
  readonly value: T;
  readonly _brand: K;
}

function createBranded<K extends string, T>(
  brand: K,
  validator: (value: T) => boolean
) {
  function create(value: T): Branded<K, T> | null {
    return validator(value) ? { value, _brand: brand } : null;
  }

  function unwrap(b: Branded<K, T>): T {
    return b.value;
  }

  return { create, unwrap, brand };
}

// 使用
const Email = createBranded('Email', (v: string) => /^[^\s@]+@[^\s@]+$/.test(v));
const email = Email.create('user@example.com'); // Branded<'Email', string> | null
// Email.create('invalid'); // null
```

### 13.1.3 Branded Type 的代数运算

```typescript
// 为 branded numeric 类型定义安全的运算
type BrandedNumber<K extends string> = number & { readonly __brand: K };

function createBrandedNumber<K extends string>(brand: K) {
  return {
    of: (n: number): BrandedNumber<K> => n as BrandedNumber<K>,
    add: (a: BrandedNumber<K>, b: BrandedNumber<K>): BrandedNumber<K> =>
      (a + b) as BrandedNumber<K>,
    subtract: (a: BrandedNumber<K>, b: BrandedNumber<K>): BrandedNumber<K> =>
      (a - b) as BrandedNumber<K>,
    multiply: (a: BrandedNumber<K>, b: number): BrandedNumber<K> =>
      (a * b) as BrandedNumber<K>,
  };
}

// 定义具体单位
type Meters = BrandedNumber<'Meters'>;
type Seconds = BrandedNumber<'Seconds'>;

const Meters = createBrandedNumber('Meters');
const Seconds = createBrandedNumber('Seconds');

const distance = Meters.of(100);
const time = Seconds.of(10);
const speed = Meters.of(distance / time); // ✅ 需要显式转换
// const wrong = Meters.add(distance, time); // ❌ 编译错误
```

### 13.1.4 Branded Type 与数据库层

```typescript
// 在 ORM/数据层中防止 ID 混用
interface Entity<TId extends string> {
  readonly id: Brand<TId, string>;
  readonly createdAt: Date;
}

interface User extends Entity<'UserId'> {
  readonly name: string;
  readonly email: string;
}

interface Order extends Entity<'OrderId'> {
  readonly userId: Brand<'UserId', string>;
  readonly total: number;
}

// 类型级关联检查
function getUserOrders(user: User, orders: Order[]): Order[] {
  return orders.filter(o => o.userId === user.id); // ✅ 类型安全
}

// ❌ 防止常见错误
declare function findUserById(id: Brand<'UserId', string>): User | null;
declare function findOrderById(id: Brand<'OrderId', string>): Order | null;

// const user = findOrderById(user.id); // ❌ 编译错误：UserId 不能赋值给 OrderId
```

---

## 13.2 Opaque Types（不透明类型）

### 13.2.1 完全封装的不透明类型

与 Branded Type 不同，Opaque Type 不允许直接访问底层值：

```typescript
// 模块内部实现
declare const OpaqueTag: unique symbol;

interface Opaque<K extends string, T> {
  readonly [OpaqueTag]: K;
  readonly _value: T;
}

// 模块导出 API
export type PasswordHash = Opaque<'PasswordHash', string>;

export function hashPassword(plain: string): PasswordHash {
  // 实际哈希实现...
  return { [OpaqueTag]: 'PasswordHash', _value: `hashed_${plain}` } as unknown as PasswordHash;
}

export function verifyPassword(plain: string, hash: PasswordHash): boolean {
  const raw = (hash as unknown as { _value: string })._value;
  return raw === `hashed_${plain}`;
}

// 外部使用
const hash = hashPassword('secret');
// hash._value; // ❌ 类型错误：_value 不可访问
verifyPassword('secret', hash); // ✅ 只能通过 API 操作
```

### 13.2.2 Branded vs Opaque 对比

| 特性 | Branded Type | Opaque Type |
|------|-------------|-------------|
| 运行时开销 | 无 | 可能有（包装对象） |
| 底层值访问 | 类型断言可访问 | 模块内可控，模块外不可访问 |
| 序列化 | 可直接序列化（底层类型） | 需要显式转换逻辑 |
| 类型安全级别 | 防止意外混用 | 完全封装，防止非法构造 |
| 适用场景 | ID、单位、验证状态 | 密码哈希、令牌、内部状态 |
| 实现复杂度 | 低 | 中高 |

---

## 13.3 Phantom Types（幻影类型）

### 13.3.1 概念

Phantom Type 是一种携带额外类型参数但不使用该参数值的类型。它允许在编译时区分具有相同运行时表示但不同语义的状态。

```typescript
// 基础容器，S 是幻影类型参数
interface Status<S extends string> {
  readonly value: number;
}

// 创建不同状态的类型
type Pending = Status<'pending'>;
type Approved = Status<'approved'>;
type Rejected = Status<'rejected'>;

// 状态转换函数（编译时保证合法转换）
function createRequest(value: number): Pending {
  return { value } as Pending;
}

function approve(p: Pending): Approved {
  return { value: p.value } as Approved;
}

function reject(p: Pending): Rejected {
  return { value: p.value } as Rejected;
}

// ❌ 非法转换被阻止
// function reApprove(a: Approved): Pending { return a; } // 逻辑允许但类型不阻止
// 更好的方式：状态机约束
```

### 13.3.2 状态机 Phantom Type

```typescript
// 使用状态转移图约束
type StateMachine<States extends Record<string, string>> = {
  [K in keyof States]: Status<K>;
};

// 定义允许的状态转移
interface Transitions {
  pending: 'approved' | 'rejected';
  approved: 'archived';
  rejected: 'archived';
  archived: never;
}

// 类型级状态转移检查
type NextState<S extends keyof Transitions> = Transitions[S];

// 运行时实现（需要类型断言配合）
function transition<S extends keyof Transitions>(
  current: Status<S>,
  to: NextState<S>
): Status<NextState<S>> {
  return { value: current.value } as Status<NextState<S>>;
}

const req = createRequest(100);
const approved = approve(req);
// const bad = transition(approved, 'pending'); // ❌ 编译错误：'pending' 不是 approved 的下一状态
```

### 13.3.3 Phantom Type 与泛型约束

```typescript
// 幻影类型用于标记集合元素的来源
type Tagged<T, Tag> = T & { readonly _tag: Tag };

function tag<T, Tag>(value: T, tag: Tag): Tagged<T, Tag> {
  return { ...value, _tag: tag } as Tagged<T, Tag>;
}

// 区分来自不同 API 的数据
type UserFromApi = Tagged<User, 'api'>;
type UserFromCache = Tagged<User, 'cache'>;

function refreshUser(cached: UserFromCache): Promise<UserFromApi> {
  return fetch(`/users/${cached.id}`).then(r => r.json()).then(u => tag(u, 'api'));
}

// 强制要求最新数据的操作
function deleteUser(u: UserFromApi): Promise<void> {
  return fetch(`/users/${u.id}`, { method: 'DELETE' }).then();
}

// deleteUser(cachedUser); // ❌ 编译错误：必须是 API 来源
```

---

## 13.4 高阶类型（HKT）模拟

### 13.4.1 什么是高阶类型

高阶类型（Higher-Kinded Types, HKT）是指接受类型构造器作为参数的泛型。例如，`Functor<F<_>>` 中的 `F` 就是一个类型构造器。

```typescript
// Haskell 示例：
// class Functor f where
//   fmap :: (a -> b) -> f a -> f b
// 这里的 f 就是高阶类型参数

// TypeScript 原生不支持 HKT，因为类型层面没有"类型构造器的一等公民"
```

### 13.4.2 TypeScript 中的 HKT 模拟

```typescript
// 模拟 HKT：使用接口和类型标识
interface HKT<F, A> {
  readonly _F: F;
  readonly _A: A;
}

// 定义类型构造器的标识
interface ArrayURI {
  readonly tag: 'Array';
}
interface PromiseURI {
  readonly tag: 'Promise';
}
interface OptionURI {
  readonly tag: 'Option';
}

// 将具体类型映射到 HKT
type URItoKind<A> = {
  Array: A[];
  Promise: Promise<A>;
  Option: A | null;
};

type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];

// 验证
type ArrString = Kind<'Array', string>;     // string[]
type PromNumber = Kind<'Promise', number>;  // Promise<number>
```

### 13.4.3 Functor 模拟

```typescript
// 使用接口模拟 typeclass
interface Functor<F extends keyof URItoKind<any>> {
  map<A, B>(fa: Kind<F, A>, f: (a: A) => B): Kind<F, B>;
}

// Array 的 Functor 实例
const arrayFunctor: Functor<'Array'> = {
  map<A, B>(fa: A[], f: (a: A) => B): B[] {
    return fa.map(f);
  }
};

// Promise 的 Functor 实例
const promiseFunctor: Functor<'Promise'> = {
  map<A, B>(fa: Promise<A>, f: (a: A) => B): Promise<B> {
    return fa.then(f);
  }
};

// 使用
const nums = [1, 2, 3];
const doubled = arrayFunctor.map(nums, n => n * 2); // number[]

const pNum = Promise.resolve(42);
const pStr = promiseFunctor.map(pNum, n => String(n)); // Promise<string>
```

### 13.4.4 Monad 模拟

```typescript
interface Monad<F extends keyof URItoKind<any>> extends Functor<F> {
  of<A>(a: A): Kind<F, A>;
  chain<A, B>(fa: Kind<F, A>, f: (a: A) => Kind<F, B>): Kind<F, B>;
}

// Array Monad
const arrayMonad: Monad<'Array'> = {
  ...arrayFunctor,
  of<A>(a: A): A[] { return [a]; },
  chain<A, B>(fa: A[], f: (a: A) => B[]): B[] {
    return fa.flatMap(f);
  }
};

// 使用 monadic chain
const nested = [[1, 2], [3, 4]];
const flat = arrayMonad.chain(nested, arr => arr.map(x => x * 2));
// [2, 4, 6, 8]
```

### 13.4.5 更轻量的 HKT 模拟（fp-ts 风格）

```typescript
// fp-ts 采用的轻量级 HKT 方案
interface URItoKind2<E, A> {
  Either: Either<E, A>;
  Reader: Reader<E, A>;
}

interface HKT2<URI extends keyof URItoKind2<any, any>, E, A> {
  readonly _URI: URI;
  readonly _E: E;
  readonly _A: A;
}

type Kind2<URI extends keyof URItoKind2<any, any>, E, A> = URItoKind2<E, A>[URI];

// Either 实现
type Either<E, A> = { readonly _tag: 'Left'; readonly left: E } | 
                    { readonly _tag: 'Right'; readonly right: A };

const left = <E, A = never>(e: E): Either<E, A> => ({ _tag: 'Left', left: e });
const right = <A, E = never>(a: A): Either<E, A> => ({ _tag: 'Right', right: a });

// Either Functor
const eitherFunctor = <E>(): Functor<"Either"> => ({
  map<A, B>(fa: Either<E, A>, f: (a: A) => B): Either<E, B> {
    return fa._tag === 'Right' ? right(f(fa.right)) : fa;
  }
} as any);
```

---

## 13.5 类型级递归模式

### 13.5.1 递归类型基础

```typescript
// 递归类型别名：需要显式泛型参数或接口
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

// 验证
const data: JSONValue = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob', tags: ['admin', 'vip'] }
  ],
  meta: { total: 2, page: 1 }
};
```

### 13.5.2 递归条件类型

```typescript
// 深度 Partial
type DeepPartial<T> = T extends object 
  ? T extends Function 
    ? T 
    : { [P in keyof T]?: DeepPartial<T[P]> } 
  : T;

// 深度 Readonly
type DeepReadonly<T> = T extends object 
  ? T extends Function 
    ? T 
    : { readonly [P in keyof T]: DeepReadonly<T[P]> } 
  : T;

// 递归类型需要终止条件，否则会导致无限递归错误
// ❌ 错误的递归（无终止条件）
// type BadRecurse<T> = { value: BadRecurse<T> }; // 在某些场景下会报错
```

### 13.5.3 类型级递归深度限制

```typescript
// TypeScript 对类型实例化深度有限制（默认约 50 层）
// 对于深层结构，需要手动处理或增加限制

type DeepGet<T, K extends string> = 
  T extends Record<string, any>
    ? K extends `${infer F}.${infer R}`
      ? F extends keyof T
        ? DeepGet<T[F], R>
        : never
      : K extends keyof T
        ? T[K]
        : never
    : never;

interface Nested {
  a: { b: { c: { d: { value: string } } } };
}

type V = DeepGet<Nested, 'a.b.c.d.value'>; // string
```

### 13.5.4 尾递归优化（TypeScript 4.5+）

```typescript
// TypeScript 4.5 引入了尾递归消除，优化了某些递归模式
type TrimLeft<S extends string> = 
  S extends ` ${infer R}` ? TrimLeft<R> : S;

// 在 4.5 之前，长字符串可能导致深度限制错误
// 4.5+ 尾递归优化后，可以处理更长的字符串
```

---

## 13.6 高级映射类型模式

### 13.6.1 键重映射（Key Remapping）

TypeScript 4.1+ 支持 `as` 关键字重映射键：

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// 结果：{ getName: () => string; getAge: () => number; }

// 过滤键
type RemovePrefix<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${infer S}` ? S : never]: T[K];
};

interface ApiResponse {
  api_data: string;
  api_status: number;
  other: boolean;
}

type Unprefixed = RemovePrefix<ApiResponse, 'api_'>;
// 结果：{ data: string; status: number; }
```

### 13.6.2 条件属性

```typescript
// 根据值类型添加/移除属性
type WithId<T> = T extends { _id: infer I } ? T : T & { _id: string };

// 条件可选属性
type OptionalIf<T, K extends keyof T, Condition> = 
  Condition extends true ? Partial<Pick<T, K>> & Omit<T, K> : T;
```

### 13.6.3 扁平化嵌套对象

```typescript
// 将嵌套对象扁平化为点分隔键
type FlattenKeys<T extends Record<string, any>, Prefix extends string = ''> = {
  [K in keyof T as K extends string
    ? Prefix extends ''
      ? K
      : `${Prefix}.${K}`
    : never]: T[K] extends Record<string, any>
      ? T[K] extends Array<any>
        ? T[K]
        : FlattenKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
      : T[K];
};

interface NestedConfig {
  server: { host: string; port: number };
  db: { url: string; pool: { min: number; max: number } };
}

type FlatConfig = FlattenKeys<NestedConfig>;
// 近似结果：{ server: { host: string; port: number }; 'db.url': string; 'db.pool': { min: number; max: number }; }
// 完整扁平化需要更复杂的递归
```

### 13.6.4 属性路径类型

```typescript
// 提取对象的所有属性路径
type Path<T, K extends keyof T = keyof T> = 
  K extends string
    ? T[K] extends Record<string, any>
      ? K | `${K}.${Path<T[K]>}`
      : K
    : never;

interface Nested {
  a: { b: { c: string }; d: number };
  e: boolean;
}

type AllPaths = Path<Nested>;
// 结果：'a' | 'a.b' | 'a.b.c' | 'a.d' | 'e'
```

---

## 13.7 类型级设计模式

### 13.7.1 Builder 模式（类型级）

```typescript
// 使用泛型约束实现类型安全的 Builder
class QueryBuilder<T extends Record<string, any>, Selected extends keyof T = never> {
  private _select: Selected[] = [];
  private _where: Partial<T> = {};

  select<K extends keyof T>(...fields: K[]): QueryBuilder<T, Selected | K> {
    this._select.push(...fields as Selected[]);
    return this as unknown as QueryBuilder<T, Selected | K>;
  }

  where(conditions: Partial<T>): this {
    this._where = conditions;
    return this;
  }

  build(): Pick<T, Selected> {
    return {} as Pick<T, Selected>;
  }
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<User>()
  .select('id', 'name')
  .select('email')
  .where({ age: 18 })
  .build(); // Pick<User, 'id' | 'name' | 'email'>
```

### 13.7.2 状态机类型

```typescript
// 类型级状态机：确保操作顺序合法
type State = 'idle' | 'loading' | 'success' | 'error';

type Transitions = {
  idle: 'loading';
  loading: 'success' | 'error';
  success: 'idle';
  error: 'idle';
};

type ValidTransition<F extends State, T extends State> = 
  T extends Transitions[F] ? true : false;

class TypedStateMachine<S extends State> {
  constructor(private state: S) {}

  transition<T extends State>(
    to: ValidTransition<S, T> extends true ? T : never
  ): TypedStateMachine<T> {
    return new TypedStateMachine(to as T);
  }
}

const sm = new TypedStateMachine('idle')
  .transition('loading')
  .transition('success');
  // .transition('error'); // ❌ 从 success 不能直接到 error
```

### 13.7.3 策略模式（类型级）

```typescript
// 类型安全的策略注册表
interface StrategyRegistry {
  json: { parse: (s: string) => unknown; stringify: (v: unknown) => string };
  csv: { parse: (s: string) => string[][]; stringify: (v: string[][]) => string };
}

type Strategy<K extends keyof StrategyRegistry> = StrategyRegistry[K];

function useStrategy<K extends keyof StrategyRegistry>(
  key: K,
  impl: Strategy<K>
): void {
  // 注册策略实现
}

useStrategy('json', {
  parse: JSON.parse,
  stringify: JSON.stringify
});

// useStrategy('json', { parse: JSON.parse }); // ❌ 缺少 stringify
```

---

## 13.8 性能与限制

```mermaid
flowchart LR
    A[类型复杂度] --> B{编译时间}
    B --> C[递归深度 > 50]
    B --> D[联合类型成员 > 100k]
    B --> E[条件类型嵌套 > 10]
    C --> F[ts(2589) 实例化过深]
    D --> G[ts(2590) 表达式过于复杂]
    E --> H[IDE 响应变慢]
```

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| 实例化深度超限 | `ts(2589)` | 减少递归层数，使用尾递归优化 |
| 表达式过于复杂 | `ts(2590)` | 拆分为中间类型，避免超长联合 |
| 编译时间激增 | 编译卡住 | 简化条件类型，减少泛型嵌套 |
| 智能提示延迟 | IDE 卡顿 | 减少映射类型的复杂度 |

### 13.8.1 性能优化技巧

```typescript
// ❌ 避免深层嵌套的条件类型
type BadDeep<T> = T extends A ? B : T extends C ? D : T extends E ? F : G;

// ✅ 使用辅助类型拆分
type Step1<T> = T extends A ? B : never;
type Step2<T> = T extends C ? D : never;
type GoodDeep<T> = Step1<T> | Step2<T> | (T extends E ? F : G);

// ❌ 避免超长的联合类型
type BadUnion = 'a1' | 'a2' | ... | 'a10000';

// ✅ 使用字符串模板或索引访问
type GoodUnion = `prefix${number}`;
```

---

## 13.9 本章小结

- **Branded Types** 在结构化类型系统中模拟名义类型，通过交叉类型和类型断言实现，适用于区分同构异义的类型（ID、单位等）。
- **Opaque Types** 提供更严格的封装，底层值不可直接访问，适合密码哈希、安全令牌等需要完全控制的场景。
- **Phantom Types** 利用不使用的泛型参数携带编译时信息，可实现状态机约束、数据来源标记等高级类型安全模式。
- **HKT 模拟** 通过接口映射和类型标识，在 TypeScript 中实现 Functor、Monad 等函数式编程抽象，虽然不如原生 HKT 优雅，但足以支撑实际应用。
- **类型级递归** 需要明确的终止条件，利用条件类型的分支判断实现；TypeScript 4.5+ 的尾递归消除优化了长链递归的性能。
- **键重映射**（`as` 关键字）极大增强了映射类型的表达能力，支持键名变换、条件过滤等高级操作。
- **Builder 模式**和**状态机类型**展示了如何利用泛型约束在类型层面捕获领域逻辑，实现编译时验证。
- 高级类型模式应在类型安全和编译性能之间取得平衡，避免过度复杂的类型导致编译时间激增和 IDE 体验下降。

---

## 参考资源

1. [Branded Types in TypeScript](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d)
2. [Phantom Types in TypeScript](https://dev.to/ecyrbe/phantom-types-in-typescript-4o0f)
3. [Higher Kinded Types in TypeScript](https://www.claude-article-creator.com/higher-kinded-types-in-typescript)
4. [fp-ts: Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)
5. [TypeScript Type System as a Functor](https://andreasimonecosta.dev/posts/the-typescript-type-system-as-a-functor/)
6. [Type-Level State Machines](https://www.youtube.com/watch?v=5tT8FXeE1Y8)
7. [Effective TypeScript: Advanced Patterns](https://effectivetypescript.com/)
8. [TypeScript 4.1: Key Remapping](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#key-remapping-mapped-types)
