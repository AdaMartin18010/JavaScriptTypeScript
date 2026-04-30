# 类型系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/01-types`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 JavaScript 的类型系统与 TypeScript 的静态类型扩展，解决动态类型带来的运行时错误与可维护性挑战。通过类型注解和推断提升代码可靠性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 原始类型 | string/number/boolean/null/undefined/symbol/bigint | primitives.ts |
| 对象类型 | 引用类型的结构与接口定义 | object-types.ts |
| 联合类型 | 多个可能类型的析取组合 | union-types.ts |

---

## 二、设计原理

### 2.1 为什么存在

类型系统是防止运行时错误的防线。JavaScript 的动态类型提供了灵活性，但也导致大量隐蔽 bug。TypeScript 在保持 JS 语义的同时引入静态类型，实现了灵活性与安全性的平衡。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式注解 | 意图清晰、文档化 | 编写繁琐 | 公共接口 |
| 类型推断 | 代码简洁 | 复杂逻辑难追踪 | 内部实现 |

### 2.3 特性对比表：原始类型 vs 对象类型

| 特性 | 原始类型 (Primitive) | 对象类型 (Object) |
|------|---------------------|-------------------|
| 存储方式 | 栈内存，按值存储 | 堆内存，按引用存储 |
| 可变性 | 不可变 (immutable) | 可变 (mutable) |
| 比较行为 | 值比较 | 引用比较 |
| 种类 | string, number, boolean, null, undefined, symbol, bigint | Object, Array, Function, Date, RegExp 等 |
| 装箱机制 | 自动装箱为临时对象 | 无需装箱 |
| typeof 结果 | 对应类型字符串 | `"object"` / `"function"` |

### 2.4 与相关技术的对比

与 Flow 对比：TS 生态更成熟，类型系统表达力更强。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 类型系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：`typeof` 与 `instanceof` 的类型判别

```typescript
// typeof：判别原始类型
function checkPrimitive(value: unknown): string {
  if (typeof value === 'string') return `字符串，长度 ${value.length}`;
  if (typeof value === 'number' && !isNaN(value)) return `数字 ${value}`;
  if (typeof value === 'boolean') return `布尔 ${value}`;
  if (typeof value === 'bigint') return `BigInt ${value}`;
  if (typeof value === 'symbol') return `Symbol ${value.toString()}`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return '非原始类型';
}

// instanceof：判别对象原型链
class Dog {
  bark() { return 'Woof!'; }
}
class Cat {
  meow() { return 'Meow!'; }
}

function checkAnimal(animal: unknown): string {
  if (animal instanceof Dog) return animal.bark();
  if (animal instanceof Cat) return animal.meow();
  return 'Unknown animal';
}

// 注意：typeof null === 'object' 是历史遗留 bug
console.log(typeof null);        // "object"
console.log(null instanceof Object); // false
```

### 3.3 类型收窄（Type Narrowing）

```typescript
// discriminated union（可辨识联合类型）
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size ** 2;      // TS 自动收窄为 Square
    case 'rectangle':
      return shape.width * shape.height; // TS 自动收窄为 Rectangle
    case 'circle':
      return Math.PI * shape.radius ** 2; // TS 自动收窄为 Circle
    default:
      // exhaustiveness check
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 3.4 结构类型 vs 名义类型

```typescript
// TypeScript 使用结构类型（Duck Typing）
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function printPoint(p: Point2D) {
  console.log(`(${p.x}, ${p.y})`);
}

const p3d: Point3D = { x: 1, y: 2, z: 3 };
printPoint(p3d); // ✅ 合法：Point3D 结构兼容 Point2D

// 名义类型模拟（使用 brands）
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

const uid = createUserId('u-123');
const oid = createOrderId('o-456');

// uid = oid; // ❌ 编译错误：结构相同但 brand 不同
```

### 3.5 类型谓词（Type Predicates）自定义守卫

```typescript
// 自定义类型守卫函数
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TS 知道此处 pet 是 Fish
  } else {
    pet.fly();  // TS 知道此处 pet 是 Bird
  }
}
```

### 3.6 `unknown` 的安全使用模式

```typescript
// unknown 要求显式类型收窄后才能使用
function parseJsonSafe(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function processApiResponse(response: unknown) {
  // ❌ 直接访问属性：编译错误
  // console.log(response.data);

  // ✅ 先进行类型校验
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray(response.data)
  ) {
    return response.data; // response 被收窄为 { data: unknown[] }
  }

  throw new Error('Invalid response format');
}
```

### 3.7 更多代码示例

#### 模板字面量类型与类型安全的路由

```typescript
// 类型安全的 API 路由参数提取
type RouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

// 使用
type UserRoute = RouteParams<'/users/:userId/posts/:postId'>;
// => { userId: string; postId: string }

function buildUrl<T extends string>(
  route: T,
  params: RouteParams<T>
): string {
  let url: string = route;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, encodeURIComponent(value as string));
  }
  return url;
}

const url = buildUrl('/users/:userId/posts/:postId', {
  userId: '42',
  postId: '99',
});
```

#### 条件类型与映射类型

```typescript
// 条件类型：根据类型选择不同分支
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<123>;     // false

// 映射类型：批量转换属性
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : ReadonlyDeep<T[K]>
    : T[K];
};

interface Config {
  server: { host: string; port: number };
  debug: boolean;
}

type FrozenConfig = ReadonlyDeep<Config>;
// 所有层级属性均为 readonly

// 工具类型：提取 Promise 返回值
type Awaited<T> = T extends Promise<infer R> ? R : T;
type Data = Awaited<Promise<string[]>>; // string[]
```

#### 函数重载与泛型约束

```typescript
// 函数重载：根据参数数量/类型返回不同结果
function createElement(tag: 'img'): HTMLImageElement;
function createElement(tag: 'a'): HTMLAnchorElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const img = createElement('img');     // HTMLImageElement
const link = createElement('a');      // HTMLAnchorElement

// 泛型约束：限制类型参数必须满足特定结构
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');      // ✅ string 有 length
logLength([1, 2, 3]);    // ✅ 数组有 length
// logLength(123);       // ❌ number 无 length
```

####  branded types 实现更安全的 ID 系统

```typescript
// 使用 symbol 实现更严格的名义类型
declare const UserIdBrand: unique symbol;
declare const OrderIdBrand: unique symbol;

type UserId = string & { readonly [UserIdBrand]: true };
type OrderId = string & { readonly [OrderIdBrand]: true };

function UserId(id: string): UserId {
  return id as UserId;
}
function OrderId(id: string): OrderId {
  return id as OrderId;
}

function fetchUser(id: UserId) {
  return db.users.findById(id);
}

const uid = UserId('u-123');
const oid = OrderId('o-456');

fetchUser(uid);   // ✅
// fetchUser(oid); // ❌ 编译错误：类型不兼容
```

#### infer 与递归类型实现深度 Partial

```typescript
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface Company {
  name: string;
  ceo: { name: string; age: number };
  employees: Array<{ id: number; name: string }>;
}

const patch: DeepPartial<Company> = {
  ceo: { name: 'New CEO' }, // 深层属性也可部分更新
};
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| any 可以临时替代所有类型 | any 会传播并破坏整个类型链 |
| unknown 与 any 等价 | unknown 要求使用前先进行类型收窄 |
| `typeof [] === 'array'` | `typeof []` 返回 `'object'`，应使用 `Array.isArray()` |
| `instanceof` 跨 iframe 可靠 | 不同全局环境下的构造函数引用不同，instanceof 可能失效 |
| 接口与类型别名完全等价 | 接口支持声明合并（declaration merging），type 不支持 |

### 3.10 扩展阅读

- [TypeScript 类型手册](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [MDN：JavaScript 数据类型与数据结构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [MDN：typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN：instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
- [ECMAScript® 2025 Language Specification — ECMAScript Data Types and Values](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)
- [TypeScript: Structural vs Nominal Typing](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [2ality: JavaScript Values — Primitives vs Objects](https://2ality.com/2021/01/object-vs-object.html)
- [Deep JavaScript: Types, Values, and Variables](https://exploringjs.com/deep-js/ch_types-values-variables.html)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [type-challenges GitHub](https://github.com/type-challenges/type-challenges) — 类型体操练习集
- [Total TypeScript by Matt Pocock](https://www.totaltypescript.com/) — 高级 TS 教程
- [Zod 库文档](https://zod.dev/) — 运行时类型校验
- [Valibot 文档](https://valibot.dev/) — 轻量级 schema 校验
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — 开源 TS 深度指南
- `10-fundamentals/10.1-language-semantics/01-types/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
