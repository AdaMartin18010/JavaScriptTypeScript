---
title: TypeScript 高级模式指南
description: '泛型高级、条件类型、映射类型、模板字面量类型、类型体操、设计模式类型化、编译器 API 与最新特性的深度指南'
---

# TypeScript 高级模式指南

> 最后更新: 2026-05-01

---

## 概述

TypeScript 的类型系统是一种图灵完备的语言。本指南深入解析高级类型模式，帮助开发者从"能用 TS"进阶到"精通 TS"。内容覆盖泛型变型、类型体操、设计模式类型化、运行时类型校验、编译器 API 以及 TS 5.5+ 新特性。

---

## 泛型高级

### 泛型约束

泛型约束通过 `extends` 限定类型参数必须满足的形状，避免在泛型体内访问不存在属性时产生编译错误。

```ts
// 基础约束：T 必须具有 length 属性
function logLength<T extends { length: number }>(arg: T): T {
  console.log(arg.length)
  return arg
}

logLength('hello')        // ✅ string 有 length
logLength([1, 2, 3])      // ✅ 数组有 length
logLength({ length: 10 }) // ✅ 对象有 length
// logLength(123)          // ❌ number 无 length

// 多字段约束 + 键约束：确保 K 是 T 的键
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 30 }
getProperty(user, 'name') // string
// getProperty(user, 'email') // ❌ 编译错误
```

### 泛型默认参数

TS 2.3 起支持为泛型参数提供默认值，简化常见场景下的类型标注。

```ts
// 默认参数简化常见用法
type Pagination<T = unknown> = {
  data: T[]
  page: number
  pageSize: number
  total: number
}

// 使用时无需显式传入类型参数
type UserPagination = Pagination // Pagination<unknown>

type ProductPagination = Pagination<{ id: string; price: number }>

// 多个泛型参数时，有默认值的必须位于末尾
type FetchResult<Data = unknown, Error = never> =
  | { ok: true; data: Data }
  | { ok: false; error: Error }

type Result = FetchResult<string> // { ok: true; data: string } | { ok: false; error: never }
```

### 变型：协变、逆变与双变

变型（Variance）描述复合类型与其组件类型之间的子类型关系方向。理解变型是掌握类型安全的关键。

```ts
// ===== 协变 (Covariant) =====
// 数组、对象属性、返回类型是协变的：A ≼ B 则 Array<A> ≼ Array<B>

type Animal = { name: string }
type Dog = Animal & { breed: string }

declare let animals: Animal[]
declare let dogs: Dog[]

animals = dogs // ✅ Dog[] ≼ Animal[]

// ===== 逆变 (Contravariant) =====
// 函数参数是逆变的：A ≼ B 则 (x: B) => void ≼ (x: A) => void

type ConsumeAnimal = (animal: Animal) => void
type ConsumeDog = (dog: Dog) => void

declare let consumeAnimal: ConsumeAnimal
declare let consumeDog: ConsumeDog

consumeDog = consumeAnimal // ✅ 因为 Animal 需要的属性更少，接受 Animal 的函数可以安全赋给接受 Dog 的函数

// ===== TS 中的函数参数双变问题 =====
// strictFunctionTypes 开启后，函数参数变为严格逆变
// 关闭时（默认兼容模式），参数是双变的（Bivariant），可能引入类型漏洞

// 开启 strictFunctionTypes 后以下代码会报错：
// type Handler = (dog: Dog) => void
// const animalHandler: Handler = (animal: Animal) => {} // ❌ strict 模式下错误
```

> 📚 来源：[TypeScript Handbook - Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)，官方文档对变型有详细阐述。`strictFunctionTypes` 选项自 TS 2.6 引入，用于修正函数参数的双变行为。

### 高阶类型

高阶类型（Higher-Kinded Types）指接收类型作为参数并返回新类型的类型构造器。TS 类型系统通过巧妙的泛型组合模拟 HKT。

```ts
// 模拟高阶类型：类型构造器接口
interface HKT<F, A> {
  readonly _F: F
  readonly _A: A
}

// Functor 抽象：可 map 的结构
type Functor<F, A, B> = {
  map: (fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

// 数组的 Functor 实例
const arrayFunctor: Functor<'Array', any, any> = {
  map: (fa, f) => ({
    _F: 'Array',
    _A: (fa._A as any[]).map(f),
  }),
}

// 更实用的方式：通过泛型函数实现高阶操作
function mapRecord<T, U>(
  record: Record<string, T>,
  fn: (value: T) => U
): Record<string, U> {
  const result: Record<string, U> = {}
  for (const [k, v] of Object.entries(record)) {
    result[k] = fn(v)
  }
  return result
}

const nums = { a: 1, b: 2 }
const strs = mapRecord(nums, (n) => n.toString())
// strs: { a: string; b: string }
```

---

## 条件类型

### 基础条件类型

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>     // true
type B = IsString<123>         // false
```

### 分布式条件类型

```ts
type ToArray<T> = T extends any ? T[] : never

type StrOrNumArray = ToArray<string | number>
// string[] | number[] (分布式)
```

### infer 提取类型

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Fn = () => string
type R = ReturnType<Fn>  // string

// 提取 Promise 返回值
type Awaited<T> = T extends Promise<infer R> ? R : T
type X = Awaited<Promise<number>>  // number
```

---

## 映射类型

### 基础映射

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}

type Partial<T> = {
  [K in keyof T]?: T[K]
}

type Required<T> = {
  [K in keyof T]-?: T[K]  // -? 移除可选
}
```

### Key Remapping (TS 4.1+)

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface User {
  name: string
  age: number
}

type UserGetters = Getters<User>
// { getName: () => string; getAge: () => number }
```

### 过滤键

```ts
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Props {
  name: string
  age: number
  visible: boolean
}

type StringProps = PickByType<Props, string>
// { name: string }
```

---

## 模板字面量类型

### 基础用法

```ts
type EventName<T extends string> = `on${Capitalize<T>}`

type ClickEvent = EventName<'click'>  // 'onClick'
```

### 路径类型

```ts
type Path<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${Path<T[K], keyof T[K]>}` | K
    : K
  : never

interface User {
  name: string
  address: {
    city: string
    zip: number
  }
}

type UserPath = Path<User, keyof User>
// 'name' | 'address' | 'address.city' | 'address.zip'
```

---

## 实用工具类型实现

### 实现内置工具类型

以下代码在 TypeScript Playground 可直接运行，帮助理解内置类型的实现原理。

```ts
// ===== Pick：从 T 中选取一组键 K =====
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>
// { title: string; completed: boolean }

// ===== Omit：从 T 中排除一组键 K =====
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
// 或：type MyOmit<T, K extends keyof any> = { [P in Exclude<keyof T, K>]: T[P] }

type TodoInfo = MyOmit<Todo, 'completed'>
// { title: string; description: string }

// ===== Record：构建键类型为 K、值类型为 T 的对象 =====
type MyRecord<K extends keyof any, T> = {
  [P in K]: T
}

type PageInfo = MyRecord<'home' | 'about' | 'contact', { title: string }>
// { home: { title: string }; about: { title: string }; contact: { title: string } }

// ===== Partial：所有属性变为可选 =====
type MyPartial<T> = {
  [P in keyof T]?: T[P]
}

// ===== Required：所有属性变为必选 =====
type MyRequired<T> = {
  [P in keyof T]-?: T[P]
}

// ===== Readonly：所有属性变为只读 =====
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P]
}

// ===== Exclude / Extract：联合类型运算 =====
type MyExclude<T, U> = T extends U ? never : T
type MyExtract<T, U> = T extends U ? T : never

type T0 = MyExclude<'a' | 'b' | 'c', 'a'>     // 'b' | 'c'
type T1 = MyExtract<'a' | 'b' | 'c', 'a' | 'b'> // 'a' | 'b'
```

### 递归工具类型

```ts
// 深度 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深度 Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K]
}

// 深度路径提取
type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? { [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T]
    : ''

type Join<K, P> = K extends string | number
  ? P extends string | number ? `${K}.${P}` | `${K}` : never
  : never

// 辅助类型：递减深度
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface User {
  name: string
  address: { city: string; zip: number }
}

type UserPaths = Paths<User>
// 'name' | 'address' | 'address.city' | 'address.zip'
```

### 字符串操作类型

```ts
type KebabCase<S> = S extends `${infer C}${infer T}`
  ? `${C extends Capitalize<C> ? `-${Lowercase<C>}` : C}${KebabCase<T>}`
  : S

type T = KebabCase<'FooBarBaz'> // 'foo-bar-baz'

// 模板字面量提取 URL 参数
type ParseUrlParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParseUrlParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {}

type Params = ParseUrlParams<'/users/:id/posts/:postId'>
// { id: string; postId: string }
```

---

## 类型体操挑战：type-challenges Hot 100 精选解析

> 📚 来源：[type-challenges](https://github.com/type-challenges/type-challenges) GitHub 52k+ Stars（截至 2026-05），是社区最权威的类型体操题库。

### Hello World（难度 ⭐）

理解泛型参数的基本传递。

```ts
type HelloWorld = string
// 期望：type HelloWorld = string
```

### Tuple to Object（难度 ⭐⭐）

将元组转为键值相同的对象类型。

```ts
type TupleToObject<T extends readonly (string | number)[]> = {
  [P in T[number]]: P
}

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
type result = TupleToObject<typeof tuple>
// { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }
```

### Tuple to Union（难度 ⭐⭐⭐）

将元组类型转为联合类型。

```ts
type TupleToUnion<T extends readonly any[]> = T[number]

type R = TupleToUnion<[1, 2, 3]>  // 1 | 2 | 3
```

### Union to Intersection（难度 ⭐⭐⭐⭐⭐）

利用函数参数的逆变位置实现联合类型到交叉类型的转换。

```ts
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never

type R = UnionToIntersection<{ a: 1 } | { b: 2 }>
// { a: 1 } & { b: 2 }
```

> 🔑 核心原理：函数参数位置是逆变的，TS 在推断逆变位置的类型时会生成交叉类型。

### DeepReadonly（难度 ⭐⭐⭐）

递归地将对象所有属性设为只读，注意需要排除函数类型以避免副作用。

```ts
type DeepReadonly<T> = keyof T extends never
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> }

// 更精确的实现：避免将函数参数也递归处理
type DeepReadonlyX<T> = T extends (infer R)[]
  ? readonly DeepReadonlyX<R>[]
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonlyX<T[K]> }
      : T
```

### Parse URL Params（难度 ⭐⭐⭐⭐⭐⭐）

递归模板字面量解析提取动态路由参数。

```ts
type ParseUrlParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ParseUrlParams<Rest>
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {}

// 扁平化为对象类型（合并交叉类型）
type MergeParams<T> = { [K in keyof T]: T[K] } & {}

type P1 = ParseUrlParams<'/users/:id/posts/:postId'>
// { id: string } & { postId: string }

type P2 = MergeParams<P1>
// { id: string; postId: string }
```

### Get Optional Keys（难度 ⭐⭐⭐⭐）

提取对象中所有可选键。

```ts
type GetOptional<T> = {
  [K in keyof T as T extends { [P in K]-?: T[K] } ? never : K]: T[K]
}

interface User {
  name: string
  age?: number
  email?: string
}

type OptionalKeys = GetOptional<User>
// { age?: number; email?: string } 的键：'age' | 'email'
```

### IsAny / IsNever / IsTuple（难度 ⭐⭐⭐⭐⭐）

类型判断的终极挑战，利用 TS 的特殊类型行为。

```ts
// IsAny：利用 any 的特殊传染性（0 extends 1 为 false，但 any extends 1 为 boolean）
type IsAny<T> = 0 extends (1 & T) ? true : false

// IsNever：利用分布式条件类型对 never 的特殊处理
type IsNever<T> = [T] extends [never] ? true : false

// IsTuple：元组与数组的 length 属性差异
type IsTuple<T> = T extends readonly unknown[]
  ? number extends T['length']
    ? false
    : true
  : false

type T1 = IsAny<any>       // true
type T2 = IsNever<never>   // true
type T3 = IsTuple<[1, 2]>  // true
type T4 = IsTuple<number[]> // false
```

---

## 设计模式类型化

将经典设计模式与 TypeScript 类型系统结合，可在编译期捕获更多错误。

### 工厂模式

```ts
// 产品接口
type Product = {
  name: string
  operation(): string
}

// 具体产品
type ConcreteProductA = Product & { kind: 'A' }
type ConcreteProductB = Product & { kind: 'B' }

// 类型映射表：工厂 ID -> 产品类型
interface ProductMap {
  a: ConcreteProductA
  b: ConcreteProductB
}

// 类型安全工厂：返回值根据 ID 自动推导
function createProduct<K extends keyof ProductMap>(
  kind: K
): ProductMap[K] {
  switch (kind) {
    case 'a':
      return { kind: 'A', name: 'Product A', operation: () => 'A' } as ProductMap[K]
    case 'b':
      return { kind: 'B', name: 'Product B', operation: () => 'B' } as ProductMap[K]
    default:
      throw new Error(`Unknown kind: ${kind}`)
  }
}

const prodA = createProduct('a')
// prodA.kind: 'A'，精确类型推导

// 工厂注册表（开放扩展）
class TypedFactory<TMap extends Record<string, Product>> {
  private registry = new Map<string, () => Product>()

  register<K extends string>(
    key: K extends keyof TMap ? never : K,
    creator: () => Product
  ): asserts this is TypedFactory<TMap & Record<K, Product>> {
    this.registry.set(key, creator)
  }

  create<K extends keyof TMap>(key: K): TMap[K] {
    const creator = this.registry.get(key as string)
    if (!creator) throw new Error(`No creator for ${String(key)}`)
    return creator() as TMap[K]
  }
}
```

### 策略模式

```ts
// 策略上下文类型
type StrategyContext<TInput, TOutput> = {
  execute: (input: TInput) => TOutput
}

// 策略映射表
type Strategies<TMap extends Record<string, [unknown, unknown]>> = {
  [K in keyof TMap]: StrategyContext<TMap[K][0], TMap[K][1]>
}

// 具体策略实现
interface PaymentStrategies {
  alipay: [{ orderId: string; amount: number }, { success: boolean; tradeNo: string }]
  wechat: [{ orderId: string; amount: number; openId: string }, { success: boolean }]
  card:   [{ orderId: string; cardNo: string; cvv: string }, { success: boolean; authCode: string }]
}

const paymentStrategies: Strategies<PaymentStrategies> = {
  alipay: {
    execute: (input) => ({ success: true, tradeNo: `ALI-${input.orderId}` }),
  },
  wechat: {
    execute: (input) => ({ success: true }),
  },
  card: {
    execute: (input) => ({ success: true, authCode: 'AUTH123' }),
  },
}

// 类型安全策略执行器
function executeStrategy<K extends keyof PaymentStrategies>(
  strategy: K,
  input: PaymentStrategies[K][0]
): PaymentStrategies[K][1] {
  return paymentStrategies[strategy].execute(input) as PaymentStrategies[K][1]
}

const result = executeStrategy('alipay', { orderId: 'O1', amount: 100 })
// result: { success: boolean; tradeNo: string }，输入参数也被精确约束
```

### 观察者模式

```ts
// 类型安全事件总线
type EventMap = Record<string, unknown>

class TypedEventBus<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>
  } = {}

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
    return () => this.off(event, listener)
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    this.listeners[event] = this.listeners[event]?.filter((l) => l !== listener)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach((listener) => listener(payload))
  }
}

// 使用
interface AppEvents {
  'user:login': { userId: string; timestamp: number }
  'user:logout': { userId: string }
  'error': { message: string; code: number }
}

const bus = new TypedEventBus<AppEvents>()

bus.on('user:login', (payload) => {
  console.log(payload.userId) // payload 自动推导为 { userId: string; timestamp: number }
})

// bus.emit('user:login', { userId: '123' }) // ❌ 缺少 timestamp
bus.emit('user:login', { userId: '123', timestamp: Date.now() }) // ✅
```

---

## 类型安全 JSON 解析

运行时 JSON 与 TypeScript 类型系统的鸿沟可通过校验库弥合，实现从 "编译时类型" 到 "运行时验证" 的闭环。

### Zod

> 📚 来源：[Zod](https://zod.dev/) GitHub 35k+ Stars（截至 2026-05），最流行的 TypeScript 运行时校验库。

```ts
import { z } from 'zod'

// 定义 Schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  metadata: z.record(z.string()).optional(),
})

// 推导 TS 类型
type User = z.infer<typeof UserSchema>
// {
//   id: number; name: string; email: string;
//   role: 'admin' | 'user' | 'guest';
//   metadata?: Record<string, string> | undefined
// }

// 运行时安全解析
function parseUser(json: unknown): User {
  return UserSchema.parse(json) // 失败时抛出 ZodError
}

// 安全解析（不抛出）
function safeParseUser(json: unknown): User | null {
  const result = UserSchema.safeParse(json)
  return result.success ? result.data : null
}

// 组合 Schema
const PaginatedUsersSchema = z.object({
  data: z.array(UserSchema),
  page: z.number(),
  total: z.number(),
})

type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>
```

### Valibot

> 📚 来源：[Valibot](https://valibot.dev/)，由 Zod 作者之一 Fabian Hiller 创建，主打 tree-shaking 与更小的包体积。

```ts
import * as v from 'valibot'

// 与 Zod API 类似，但采用函数组合风格
const UserSchema = v.object({
  id: v.number(),
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  role: v.picklist(['admin', 'user', 'guest']),
})

type User = v.InferOutput<typeof UserSchema>

// 解析
const result = v.safeParse(UserSchema, {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
})

if (result.success) {
  console.log(result.output.id) // 类型安全
}
```

### Runtypes

> 📚 来源：[Runtypes](https://github.com/pelotom/runtypes) GitHub 4k+ Stars，最早出现的 TypeScript 运行时校验库之一。

```ts
import { Record, Number, String, Static, Union, Literal } from 'runtypes'

const User = Record({
  id: Number,
  name: String,
  role: Union(Literal('admin'), Literal('user')),
})

type User = Static<typeof User>

// 运行时检查
function assertUser(x: unknown): User {
  return User.check(x) // 失败时抛出 ValidationError
}

// 守卫函数
if (User.guard(someValue)) {
  someValue.name // 类型收窄为 User
}
```

---

## 类型安全路由

在前后端共享类型定义，实现路径参数与查询参数的编译时校验。

### 类型化路径参数

```ts
// 核心：将路由模板字符串解析为参数对象
type ParseRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParseRouteParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {}

// 合并交叉类型为扁平对象
type Flatten<T> = { [K in keyof T]: T[K] } & {}

// 路由定义表
interface RouteConfig {
  '/users/:id': { params: Flatten<ParseRouteParams<'/users/:id'>> }
  '/users/:id/posts/:postId': { params: Flatten<ParseRouteParams<'/users/:id/posts/:postId'>> }
  '/products': { params: {}; query: { category?: string; page?: string } }
}

// 类型安全路由构建器
type RouteBuilder = {
  [K in keyof RouteConfig]: (
    ...args: RouteConfig[K]['params'] extends Record<string, never>
      ? [query?: RouteConfig[K] extends { query: infer Q } ? Q : never]
      : [params: RouteConfig[K]['params']]
  ) => string
}

// 实际实现（简化版）
function buildRoutes(): RouteBuilder {
  return {
    '/users/:id': (params: { id: string }) =>
      `/users/${params.id}`,
    '/users/:id/posts/:postId': (params: { id: string; postId: string }) =>
      `/users/${params.id}/posts/${params.postId}`,
    '/products': (query?: { category?: string; page?: string }) => {
      const q = query ? '?' + new URLSearchParams(query as Record<string, string>).toString() : ''
      return `/products${q}`
    },
  } as RouteBuilder
}

const routes = buildRoutes()

const url1 = routes['/users/:id']({ id: '123' })
// url1: string

const url2 = routes['/users/:id/posts/:postId']({ id: '123', postId: '456' })
// url2: string

// 类型错误示例：
// routes['/users/:id']({ id: 123 })      // ❌ id 必须是 string
// routes['/users/:id']({ id: '123', x: 1 }) // ❌ 多余属性
```

> 📚 灵感来源：[TanStack Router](https://tanstack.com/router) 与 [typesafe-path](https://github.com/) 等库广泛采用模板字面量类型实现路由类型安全。

---

## 类型安全状态机

### XState 类型推导

> 📚 来源：[XState](https://stately.ai/docs/xstate) GitHub 30k+ Stars（截至 2026-05），最成熟的 JS/TS 状态机库。XState v5 采用 Actor 模型并提供了完整的类型推导支持。

```ts
import { createMachine, createActor, assign } from 'xstate'

// 定义上下文（状态数据）与事件类型
interface TrafficLightContext {
  elapsed: number
}

type TrafficLightEvent =
  | { type: 'NEXT' }
  | { type: 'TIMER'; value: number }
  | { type: 'POWER_OUTAGE' }

// 状态机配置：上下文与事件类型贯穿整个状态图
const trafficLightMachine = createMachine({
  types: {
    context: {} as TrafficLightContext,
    events: {} as TrafficLightEvent,
  },
  id: 'trafficLight',
  initial: 'green',
  context: { elapsed: 0 },
  states: {
    green: {
      on: {
        TIMER: {
          actions: assign({
            elapsed: ({ event }) => event.value,
          }),
        },
        NEXT: { target: 'yellow' },
      },
    },
    yellow: {
      on: {
        NEXT: { target: 'red' },
      },
    },
    red: {
      on: {
        NEXT: { target: 'green' },
        POWER_OUTAGE: { target: 'flashingRed' },
      },
    },
    flashingRed: {
      on: {
        POWER_OUTAGE: { target: 'green' }, // 恢复电力
      },
    },
  },
})

// Actor 实例
type TrafficLightActor = ReturnType<typeof createActor<typeof trafficLightMachine>>

const actor = createActor(trafficLightMachine)
actor.start()

// 类型安全的事件发送
actor.send({ type: 'NEXT' })      // ✅
actor.send({ type: 'TIMER', value: 30 }) // ✅
// actor.send({ type: 'TIMER', value: '30' }) // ❌ value 必须是 number
// actor.send({ type: 'UNKNOWN' })            // ❌ 不存在的事件类型

// 订阅状态变化，snapshot 类型自动推导
actor.subscribe((snapshot) => {
  const stateValue: 'green' | 'yellow' | 'red' | 'flashingRed' = snapshot.value
  const elapsed: number = snapshot.context.elapsed
})
```

XState v5 的类型系统支持：

- 上下文（Context）类型在 `assign`、`guard`、`action` 中自动推导
- 事件类型在 `send` 时进行精确匹配，多余字段或缺失字段都会报错
- 状态值（State Value）推导为联合类型，确保 `snapshot.value` 穷举可控

---

## 类型安全配置

环境变量是运行时输入，未经校验直接使用会导致类型不安全。`t3-env` 与 `envalid` 通过 Schema 校验实现编译时与运行时的双重安全。

### t3-env

> 📚 来源：[t3-env](https://env.t3.gg/)，T3 Stack 官方出品的类型安全环境变量管理库，基于 Zod 构建。

```ts
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  clientPrefix: 'NEXT_PUBLIC_',
  runtimeEnv: process.env,
})

// 使用
import { env } from './env'

// env.DATABASE_URL: string（已校验为 URL）
// env.OPENAI_API_KEY: string
// env.NEXT_PUBLIC_API_URL: string

// env.MISSING_VAR      // ❌ 编译错误：属性不存在
// env.DATABASE_URL = '' // ❌ 只读属性
```

`t3-env` 的核心设计：

- 区分 `server` 与 `client` 变量，防止在服务端意外暴露敏感配置
- `clientPrefix` 强制要求客户端变量以指定前缀命名
- 启动时一次性校验，校验失败立即抛出并阻止应用启动

### envalid

> 📚 来源：[envalid](https://github.com/af/envalid) GitHub 2k+ Stars，轻量级环境变量校验器，适合非 Zod 生态的项目。

```ts
import { cleanEnv, str, url, num, bool, host, port } from 'envalid'

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: url(),
  REDIS_HOST: host({ default: 'localhost' }),
  REDIS_PORT: port({ default: 6379 }),
  ENABLE_CACHE: bool({ default: false }),
  API_TIMEOUT_MS: num({ default: 5000 }),
})

// 推导出的类型：
// env.NODE_ENV: 'development' | 'test' | 'production'
// env.PORT: number
// env.DATABASE_URL: string（已校验为 URL）
// env.ENABLE_CACHE: boolean

export { env }
```

---

## 编译器 API 进阶

TypeScript 编译器 API 允许在代码层面操作 AST、进行类型检查与自定义转换。

### 创建 TypeScript 程序

```ts
import * as ts from 'typescript'

const program = ts.createProgram(['src/index.ts'], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
})

const checker = program.getTypeChecker()

// 遍历源文件
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    ts.forEachChild(sourceFile, visit)
  }
}

function visit(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const symbol = checker.getSymbolAtLocation(node.name)
    const type = checker.getTypeOfSymbolAtLocation(symbol!, node.name)
    console.log(`${node.name.text}: ${checker.typeToString(type)}`)
  }
  ts.forEachChild(node, visit)
}
```

### AST 遍历与节点分析

```ts
import * as ts from 'typescript'

function analyzeFile(fileName: string) {
  const program = ts.createProgram([fileName], {})
  const sourceFile = program.getSourceFile(fileName)!
  const checker = program.getTypeChecker()

  function visit(node: ts.Node) {
    // 检查未使用的变量（简化版）
    if (ts.isVariableDeclaration(node) && node.name.kind === ts.SyntaxKind.Identifier) {
      const symbol = checker.getSymbolAtLocation(node.name)
      if (symbol) {
        const references = symbol.getDeclarations()
        console.log(`Variable ${symbol.name} has ${references?.length ?? 0} declarations`)
      }
    }

    // 检测 any 类型使用
    if (ts.isVariableDeclaration(node) && node.type) {
      const type = checker.getTypeAtLocation(node.type)
      if (type.flags & ts.TypeFlags.Any) {
        console.warn(`Warning: explicit 'any' used at ${node.getStart()}`)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

// 获取节点文本
function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getText(sourceFile)
}
```

### 代码生成

```ts
import * as ts from 'typescript'

// 程序化生成代码：创建接口声明
function createInterface(name: string, fields: Record<string, string>): ts.InterfaceDeclaration {
  const members = Object.entries(fields).map(([fieldName, fieldType]) =>
    ts.factory.createPropertySignature(
      undefined,
      fieldName,
      undefined,
      ts.factory.createTypeReferenceNode(fieldType)
    )
  )

  return ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    name,
    undefined,
    undefined,
    members
  )
}

// 打印生成的 AST
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
const sourceFile = ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest)

const userInterface = createInterface('User', {
  id: 'number',
  name: 'string',
  email: 'string',
})

const result = printer.printNode(ts.EmitHint.Unspecified, userInterface, sourceFile)
console.log(result)
// 输出：
// export interface User {
//     id: number;
//     name: string;
//     email: string;
// }
```

### 自定义 Transformer

```ts
import * as ts from 'typescript'

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isCallExpression(node) &&
          node.expression.getText(sourceFile) === 'console.log') {
        // 删除 console.log
        return ts.factory.createEmptyStatement()
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile
  }
}

// 应用 transformer 编译
const program = ts.createProgram(['src/index.ts'], {})
const result = program.emit(undefined, undefined, undefined, false, {
  before: [transformer],
})
```

### 自定义诊断

```ts
import * as ts from 'typescript'

// 自定义语言服务插件中常见的诊断收集模式
function getCustomDiagnostics(sourceFile: ts.SourceFile, checker: ts.TypeChecker): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = []

  function visit(node: ts.Node) {
    // 规则：禁止在代码中直接调用 eval
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'eval'
    ) {
      diagnostics.push({
        file: sourceFile,
        start: node.getStart(),
        length: node.getWidth(),
        messageText: '禁止使用 eval()，存在安全风险',
        category: ts.DiagnosticCategory.Error,
        code: 90001,
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return diagnostics
}
```

---

## TS 5.5 / 5.6 / 5.7 新特性详解

> 📚 来源：[TypeScript 5.5 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)、[TypeScript 5.6](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/)、[TypeScript 5.7](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/)，Microsoft DevBlogs。

### TypeScript 5.5（2024-06）

#### 推断类型谓词（Inferred Type Predicates）

TS 5.5 前，数组的 `filter` 在返回布尔表达式时无法自动收窄类型。5.5 起编译器可推断隐式类型谓词。

```ts
// TS 5.5 前：需要显式 is 断言
const nums = [1, 2, 3, null, 4].filter((x): x is number => x !== null)

// TS 5.5：自动推断类型谓词
const numsAuto = [1, 2, 3, null, 4].filter((x) => x !== null)
// numsAuto 自动推导为 number[]，无需显式标注

// 对复杂表达式同样有效
interface User { name: string }
interface Admin extends User { role: 'admin' }

const users: (User | Admin)[] = []
const admins = users.filter((u) => u.role === 'admin')
// TS 5.5：admins 推导为 Admin[]
```

#### JSDoc `@import` 支持

在纯 JavaScript 文件中使用类型导入的新语法，替代此前的 `import()` 类型引用。

```js
// @ts-check
/** @import { SomeType } from 'some-module' */

/** @type {SomeType} */
const obj = {}
```

#### 正则表达式语法检查

TS 5.5 增加了对正则表达式字面量的语法校验，无效的正则会在编译期报错。

```ts
// ❌ TS 5.5 报错：Invalid regular expression
const invalidRegex = /(?<name>a)(?<name>b)/
```

### TypeScript 5.6（2024-09）

#### 禁止可疑的布尔表达式

TS 5.6 引入了 `strictBuiltinIteratorReturn`（实验性），并在控制流分析中增强了对可疑表达式分支的检测。

```ts
// 更严格的可迭代对象返回类型检查
function* gen(): Generator<number> {
  yield 1
  yield 2
  return 'done' // 在 strictBuiltinIteratorReturn 下可能产生警告
}
```

#### 迭代器辅助方法类型声明

ES2024 引入的 `Iterator.prototype.map/filter/reduce` 等方法在 TS 5.6 中获得原生类型支持。

```ts
// TS 5.6 + ES2024
const mapped = [1, 2, 3]
  .values()
  .map((x) => x * 2)
  .toArray() // number[]

const filtered = new Set([1, 2, 3])
  .values()
  .filter((x) => x > 1)
  .toArray() // number[]
```

### TypeScript 5.7（2025-01）

#### `--checkJs` 与 `// @ts-nocheck` 改进

TS 5.7 优化了 JavaScript 文件中的检查策略，允许更细粒度地控制 JSDoc 校验范围。

#### 支持 ES2024 `ArrayBuffer.prototype.transfer`

```ts
const buffer = new ArrayBuffer(1024)
const transferred = buffer.transfer() // ArrayBuffer，原 buffer 被置为 detached
```

#### 编译器性能优化

TS 5.7 在大型单体仓库中的类型检查速度相比 5.0 提升约 15-20%，主要通过优化类型关系缓存与模块解析路径实现。

---

## tsgo 对类型系统的影响

> 📚 来源：[TypeScript 团队官方公告](https://devblogs.microsoft.com/typescript/)（2025-03），TypeScript 核心团队宣布使用 Go 语言重写 TS 编译器，代号 `tsgo`。预计首个版本随 TypeScript 7.0 发布。

### 背景与目标

- **现状问题**：Node.js 单线程运行时限制了 TS 编译器的并行能力，大型项目（>100 万行代码）的 `tsc --noEmit` 耗时可达数十秒。
- **性能目标**：Go 重写版目标是现有编译器的 **10-30 倍** 性能提升，同时在内存占用上降低 50% 以上。
- **兼容性承诺**：`tsgo` 完全复用现有类型系统语义，不引入新的类型级语法；所有 `.d.ts` 文件与现有生态 100% 兼容。

### 对类型系统的实际影响

```ts
// tsgo 不改变类型语法，但会改变以下开发体验：

// 1. 类型错误即时反馈：IDE 中的类型检查延迟从秒级降至毫秒级
const user: { name: string } = { name: 'Alice' }

// 2. 超大型联合类型的性能不再成为瓶颈
// 以下代码在现有 tsc 中可能导致指数级慢查，在 tsgo 中显著改善
type HugeUnion = 'a1' | 'a2' | /* ... 5000 个 ... */ | 'a5000'
type Check = HugeUnion extends string ? true : false

// 3. 编译器 API 的 Node.js 绑定层将保留，但底层改为 Go 共享库
// 现有基于 TS Compiler API 的工具（eslint、prettier、ts-morph）需适配新架构
```

### 迁移准备建议

| 层面 | 建议 |
|------|------|
| 项目配置 | 保持 `strict` 模式开启，避免依赖编译器实现细节（如类型推断顺序） |
| 构建工具 | Vite、esbuild、swc、Babel 等转译工具不受 tsgo 影响，因为它们不执行类型检查 |
| 类型工具 | 依赖 `typescript` 包的库（如 ts-node、tsx）需关注 tsgo 的 Node.js API 适配进展 |
| CI/CD | tsgo 的命令行参数与 `tsc` 保持一致，可直接替换 |

---

## 实用模式

### Brand Type（名义类型）

```ts
type Brand<K, T> = T & { __brand: K }

type UserId = Brand<'UserId', string>
type OrderId = Brand<'OrderId', string>

function createUserId(id: string): UserId {
  return id as UserId
}

const userId = createUserId('123')
// const orderId: OrderId = userId  // ❌ 编译错误
```

### 函数重载 vs 条件类型

```ts
// 函数重载
function process(value: string): string
function process(value: number): number
function process(value: string | number): string | number {
  return typeof value === 'string' ? value.toUpperCase() : value * 2
}

// 条件类型（更灵活）
type Process<T> = T extends string ? string : T extends number ? number : never
```

---

## 参考资源

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) 📚 官方类型操作手册
- [type-challenges](https://github.com/type-challenges/type-challenges) 📚 GitHub 52k+ Stars，类型体操权威题库
- [TS 编译器 API 文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) 📚 官方 Wiki
- [TypeScript AST Viewer](https://ts-ast-viewer.com/) 📚 在线 AST 可视化
- [Total TypeScript](https://www.totaltypescript.com/) 📚 Matt Pocock 的 TS 进阶课程
- [Zod 官方文档](https://zod.dev/) 📚 运行时类型校验
- [XState 文档](https://stately.ai/docs/xstate) 📚 类型安全状态机
- [t3-env 文档](https://env.t3.gg/) 📚 类型安全环境变量
- [TypeScript 5.5 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/) 📚 Microsoft DevBlogs
- [TypeScript 5.6 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/) 📚 Microsoft DevBlogs
- [TypeScript 5.7 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/) 📚 Microsoft DevBlogs
