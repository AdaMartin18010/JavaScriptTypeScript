---
title: 06 高级工具类型模式
description: 掌握 TypeScript 高级类型模式：HKT 高阶类型模拟、Phantom 类型、Branded 类型、Opaque 类型、递归约束和类型级编程技巧。
---

# 06 高级工具类型模式

> **前置知识**：泛型、条件类型、映射类型
>
> **目标**：能够设计类型安全的库级抽象

---

## 1. HKT（高阶类型）模拟

### 1.1 问题背景

TypeScript 不支持真正的 HKT（如 `Functor<F<_>>`），但可以通过接口模拟：

```typescript
// HKT 模拟接口
interface HKT {
  readonly _tag: string;
  readonly _A?: unknown;
  readonly type?: unknown;
}

// 具体 HKT 实现
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

interface OptionHKT extends HKT {
  readonly _tag: 'Option';
  readonly _A: unknown;
  readonly type: Some<this['_A']> | None;
}

// 应用类型
interface Some<T> { readonly _tag: 'Some'; readonly value: T }
interface None { readonly _tag: 'None' }

type Apply<F extends HKT, A> = (F & { _A: A })['type'];

// 使用
type R1 = Apply<ArrayHKT, number>;    // number[]
type R2 = Apply<PromiseHKT, string>;  // Promise<string>
type R3 = Apply<OptionHKT, boolean>;  // Some<boolean> | None
```

### 1.2 Functor 模式

```typescript
interface Functor<F extends HKT> {
  map<A, B>(fa: Apply<F, A>, f: (a: A) => B): Apply<F, B>;
}

const arrayFunctor: Functor<ArrayHKT> = {
  map: (fa, f) => fa.map(f),
};

const promiseFunctor: Functor<PromiseHKT> = {
  map: (fa, f) => fa.then(f),
};

// 使用
const doubled = arrayFunctor.map([1, 2, 3], (x) => x * 2);
//    ^? number[]
```

---

## 2. Branded Types（品牌类型）

### 2.1 名义类型安全

```typescript
type Brand<K, T> = T & { readonly __brand: K };

// 定义具体品牌类型
type UserId = Brand<'UserId', string>;
type OrderId = Brand<'OrderId', string>;
type Email = Brand<'Email', string>;

// 工厂函数
function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

// 使用
const userId = createUserId('u-123');
const orderId = createOrderId('o-456');

function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

getUser(userId);     // ✅
getUser(orderId);    // ❌ Type 'OrderId' is not assignable to type 'UserId'
getOrder(orderId);   // ✅
```

### 2.2 验证型 Branded Type

```typescript
type ValidatedEmail = Brand<'ValidatedEmail', string>;

function validateEmail(email: string): ValidatedEmail | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? (email as ValidatedEmail) : null;
}

function sendEmail(to: ValidatedEmail, message: string) {
  // 只有验证过的邮箱才能发送
}

const email = validateEmail('test@example.com');
if (email) {
  sendEmail(email, 'Hello');  // ✅
}

sendEmail('invalid', 'Hello');  // ❌ 类型错误
```

---

## 3. Opaque Types（不透明类型）

### 3.1 完全封装

```typescript
type Opaque<K, T> = T & { readonly __opaque__: K };

// 定义
type USD = Opaque<'USD', number>;
type EUR = Opaque<'EUR', number>;
type CNY = Opaque<'CNY', number>;

// 工厂函数
const usd = (amount: number): USD => amount as USD;
const eur = (amount: number): EUR => amount as EUR;
const cny = (amount: number): CNY => amount as CNY;

// 运算需要在类型内定义
function addUSD(a: USD, b: USD): USD {
  return usd((a as number) + (b as number));
}

function formatUSD(amount: USD): string {
  return `$${(amount as number).toFixed(2)}`;
}

// 使用
const price = usd(100);
const tax = usd(10);
const total = addUSD(price, tax);
console.log(formatUSD(total));  // "$110.00"

// 错误：不能混用货币
// addUSD(price, eur(50));  // ❌
```

---

## 4. Phantom Types（幻影类型）

### 4.1 状态机类型

```typescript
// 状态标签（运行时不存在）
declare const Unvalidated: unique symbol;
declare const Validated: unique symbol;
declare const Saved: unique symbol;

// 带幻影类型的表单
type Form<TState> = {
  data: Record<string, unknown>;
  readonly _state: TState;
};

type UnvalidatedForm = Form<typeof Unvalidated>;
type ValidatedForm = Form<typeof Validated>;
type SavedForm = Form<typeof Saved>;

// 状态转换函数
function createForm(data: Record<string, unknown>): UnvalidatedForm {
  return { data, _state: Unvalidated };
}

function validate(form: UnvalidatedForm): ValidatedForm | null {
  // 验证逻辑
  const isValid = Object.values(form.data).every(v => v !== '');
  return isValid ? { data: form.data, _state: Validated } : null;
}

function save(form: ValidatedForm): SavedForm {
  // 保存逻辑
  return { data: form.data, _state: Saved };
}

// 使用
const form = createForm({ name: 'Alice', email: 'alice@example.com' });
const validated = validate(form);
if (validated) {
  const saved = save(validated);  // ✅
  // save(form);                  // ❌ 未验证的表单不能保存
}
```

---

## 5. 递归类型约束

### 5.1 树形结构类型

```typescript
// 类型安全的树节点
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

// 深度限制（防止无限递归）
type TreeNodeDepth<T, Depth extends number = 3> = [Depth] extends [never]
  ? never
  : {
      value: T;
      children?: TreeNodeDepth<T, Prev<Depth>>[];
    };

type Prev<N extends number> = [-1, 0, 1, 2, 3, 4, 5][N];

// 使用
type ShallowTree = TreeNodeDepth<string, 2>;
// 最多 2 层嵌套
```

### 5.2 JSON 类型

```typescript
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONObject 
  | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

// 类型安全的 JSON 解析
function safeJSONParse(text: string): JSONValue {
  return JSON.parse(text);
}

const data = safeJSONParse('{"name": "Alice", "age": 30}');
// data 的类型是 JSONValue
```

---

## 6. 类型级字符串操作

### 6.1 路径类型

```typescript
// 从对象类型提取所有路径
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${Path<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

// 从路径获取值类型
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

// 使用
interface User {
  name: string;
  address: {
    city: string;
    zip: number;
  };
}

type UserPaths = Path<User>;
//   ^? 'name' | 'address' | 'address.city' | 'address.zip'

type CityType = PathValue<User, 'address.city'>;
//   ^? string
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **Branded Type 运算** | 不能直接对品牌类型进行数学运算 | 提供类型安全的运算函数 |
| **HKT 性能** | 复杂 HKT 导致类型检查缓慢 | 在库代码中使用，业务代码避免 |
| **递归深度超限** | 无限递归类型导致编译器崩溃 | 限制递归深度 |
| **Phantom Type 泄漏** | 运行时访问 _state 字段 | 使用 unique symbol 或 omit |

---

## 练习

1. 实现一个类型安全的 `Money` 类型：支持多种货币，禁止不同货币的加减。
2. 使用 Phantom Type 实现一个类型安全的 HTTP 请求构建器：确保先设置 URL 才能设置方法，先设置方法才能发送。
3. 实现一个类型安全的 `get` 函数：能够根据路径字符串从嵌套对象中安全取值。

---

## 延伸阅读

- [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges)
- [Effect-TS](https://effect.website/)（HKT 实际应用）
- [Branded Types in TypeScript](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d)
