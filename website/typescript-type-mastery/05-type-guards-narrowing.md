---
title: 05 类型守卫与收窄
description: 掌握 TypeScript 类型收窄的全部技术：类型谓词、标签联合、穷尽检查、控制流分析，以及复杂场景下的自定义守卫设计。
---

# 05 类型守卫与收窄

> **前置知识**：联合类型、基础条件判断、typeof/instanceof
>
> **目标**：能够设计类型安全的标签联合系统，实现穷尽检查，并处理复杂场景下的类型收窄

---

## 1. 内置类型守卫

### 1.1 typeof 守卫

```typescript
function process(value: string | number | boolean) {
  if (typeof value === 'string') {
    value; // ^? string
    value.toUpperCase(); // ✅
  } else if (typeof value === 'number') {
    value; // ^? number
    value.toFixed(2); // ✅
  } else {
    value; // ^? boolean（穷尽剩余类型）
    value.valueOf(); // ✅
  }
}
```

**typeof 的局限性**：只能识别 `string`、`number`、`boolean`、`bigint`、`symbol`、`undefined`、`function`、`object`。

### 1.2 instanceof 守卫

```typescript
class Cat {
  meow() { return 'meow'; }
}

class Dog {
  bark() { return 'woof'; }
}

function speak(animal: Cat | Dog) {
  if (animal instanceof Cat) {
    return animal.meow(); // ✅ 收窄为 Cat
  }
  return animal.bark();   // ✅ 收窄为 Dog
}
```

**注意**：`instanceof` 在跨 Realm（如 iframe）或 polyfill 场景中可能不可靠。

### 1.3 in 守卫

```typescript
type Car = { engine: string; drive(): void };
type Bicycle = { pedals: number; ride(): void };

function move(vehicle: Car | Bicycle) {
  if ('engine' in vehicle) {
    vehicle.drive(); // ✅ 收窄为 Car
  } else {
    vehicle.ride();  // ✅ 收窄为 Bicycle
  }
}
```

---

## 2. 自定义类型谓词（Type Predicate）

### 2.1 基础谓词

```typescript
// 类型谓词：value is Type
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    value; // ^? string（已收窄）
    value.toUpperCase(); // ✅
  }
}
```

### 2.2 对象类型谓词

```typescript
interface User {
  type: 'user';
  name: string;
  email: string;
}

interface Admin {
  type: 'admin';
  name: string;
  permissions: string[];
}

// 基于标签字段的谓词
function isAdmin(account: User | Admin): account is Admin {
  return account.type === 'admin';
}

function getPermissions(account: User | Admin): string[] {
  if (isAdmin(account)) {
    return account.permissions; // ✅ 收窄为 Admin
  }
  return ['read']; // account 收窄为 User
}
```

### 2.3 数组过滤谓词

```typescript
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

const maybeNumbers = [1, null, 2, undefined, 3];
const numbers = maybeNumbers.filter(isDefined);
//    ^? number[]（而非 (number | null | undefined)[]）

// 更复杂的过滤
interface ActiveUser {
  status: 'active';
  lastLogin: Date;
}

interface InactiveUser {
  status: 'inactive';
}

type User = ActiveUser | InactiveUser;

function isActive(user: User): user is ActiveUser {
  return user.status === 'active';
}

const users: User[] = [
  { status: 'active', lastLogin: new Date() },
  { status: 'inactive' },
];

const activeUsers = users.filter(isActive);
//    ^? ActiveUser[]
```

---

## 3. 标签联合（Discriminated Union）

### 3.1 设计模式

```typescript
// 核心原则：所有成员共享一个"标签"字段（discriminant）
type UIEvent =
  | { type: 'click'; x: number; y: number; button: number }
  | { type: 'keydown'; key: string; ctrlKey: boolean }
  | { type: 'scroll'; deltaX: number; deltaY: number };

function handleEvent(event: UIEvent) {
  switch (event.type) {
    case 'click':
      console.log(`Clicked at (${event.x}, ${event.y})`);
      break;
    case 'keydown':
      console.log(`Key pressed: ${event.key}`);
      break;
    case 'scroll':
      console.log(`Scrolled by (${event.deltaX}, ${event.deltaY})`);
      break;
    default:
      // 穷尽检查：如果新增事件类型未处理，此处会报错
      const _exhaustive: never = event;
      throw new Error(`Unhandled event: ${_exhaustive}`);
  }
}
```

### 3.2 嵌套标签联合

```typescript
type APIResponse =
  | { status: 'success'; data: User }
  | { status: 'error'; code: number; message: string }
  | { status: 'loading' };

function renderResponse(response: APIResponse) {
  switch (response.status) {
    case 'loading':
      return <Spinner />;
    case 'error':
      return <ErrorMessage code={response.code} message={response.message} />;
    case 'success':
      return <UserProfile user={response.data} />;
  }
}
```

---

## 4. 穷尽检查（Exhaustiveness Checking）

### 4.1 基础模式

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // 穷尽检查
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 4.2 辅助函数模式

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function processAction(action: Action) {
  switch (action.type) {
    case 'CREATE': /* ... */ break;
    case 'UPDATE': /* ... */ break;
    case 'DELETE': /* ... */ break;
    default:
      assertNever(action); // 编译时安全检查
  }
}
```

---

## 5. 控制流分析的高级模式

### 5.1 自定义断言函数（Assertion Function）

```typescript
// TS 3.7+ 断言函数：失败时抛出错误
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`Expected value to be defined, but got ${value}`);
  }
}

function processUser(user: User | undefined) {
  assertIsDefined(user);
  // 此后 user 被收窄为 User（非 undefined）
  console.log(user.name); // ✅
}

// 断言属性存在
function assertHasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): asserts obj is T & Record<K, unknown> {
  if (!(key in obj)) {
    throw new Error(`Missing required property: ${key}`);
  }
}
```

### 5.2 基于范围的收窄

```typescript
function categorizeAge(age: number) {
  if (age < 13) {
    return 'child';
  } else if (age < 20) {
    return 'teenager';
  } else if (age < 65) {
    return 'adult';
  } else {
    return 'senior';
  }
}

// 配合类型谓词实现范围守卫
function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
```

---

## 6. 复杂场景下的守卫组合

### 6.1 多层级守卫

```typescript
type APIResult<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function processResult<T>(result: APIResult<T>): T | null {
  if (result.status === 'success') {
    return result.data; // ✅ 收窄为 success
  }

  if (result.status === 'error') {
    console.error(result.error);
    return null;
  }

  // 此时 result 被收窄为 { status: 'idle' } | { status: 'loading' }
  return null;
}
```

### 6.2 守卫与泛型结合

```typescript
// 类型安全的解析器组合
interface Parser<T> {
  parse(value: unknown): T | undefined;
}

const StringParser: Parser<string> = {
  parse: (value) => (typeof value === 'string' ? value : undefined),
};

const NumberParser: Parser<number> = {
  parse: (value) => (typeof value === 'number' ? value : undefined),
};

function parseOrDefault<T>(
  value: unknown,
  parser: Parser<T>,
  defaultValue: T
): T {
  const parsed = parser.parse(value);
  return parsed !== undefined ? parsed : defaultValue;
}
```

---

## 常见陷阱

| 陷阱 | 示例 | 修正 |
|------|------|------|
| **类型谓词的 false 分支不窄化** | `if (!isString(x))` 后 x 未收窄 | 使用 `else` 分支或 `asserts` |
| **解构后丢失收窄** | `const { type } = obj; switch(type)` | 直接 `switch(obj.type)` |
| **联合类型重叠导致收窄失败** | `{ a: string } \| { a: number }` | 使用标签字段区分 |
| **忘记穷尽检查** | switch 缺少 default | 添加 `const _: never = x` |

---

## 练习

### Easy

1. 实现 `isNonEmptyArray<T>` 类型谓词，过滤后数组类型排除空数组。
2. 设计一个 `Result<T, E>` 标签联合，包含 `success` 和 `failure` 两种状态。

### Medium

1. 实现一个多级菜单的类型系统，使用标签联合表示 `Folder` 和 `File`，并写一个递归函数计算文件夹大小。
2. 为 HTTP 响应设计标签联合：`200`、`404`、`500`，每种状态有各自的字段，并写穷尽检查的处理函数。

### Hard

1. 实现 `deepEqualsGuard<T, U>`，在运行时深度比较两个对象，并在成功时断言它们类型相同。

---

## 延伸阅读

- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Total TypeScript — Type Predicates](https://www.totaltypescript.com/concepts/type-predicates)
- [Exhaustive Type Checking with TypeScript](https://dev.to/babak/exhaustive-type-checking-with-typescript-4l3f)
