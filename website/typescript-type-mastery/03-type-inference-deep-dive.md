---
title: 03 类型推断深度
description: 深入理解 TypeScript 类型推断的机制：上下文推断、泛型推断、最佳公共类型、控制流分析、as const、satisfies 和 NoInfer 的实战用法。
---

# 03 类型推断深度

> **前置知识**：泛型、条件类型、基础类型注解
>
> **目标**：掌握 TypeScript 类型推断的全部机制，能够预测编译器的推断行为并主动引导推断方向

---

## 1. 推断的两大来源

TypeScript 的类型推断来自两个来源：

1. **从右向左推断**（Contextual Typing）：根据赋值目标的类型推断表达式类型
2. **从左向右推断**（Best Common Type）：根据表达式本身推断类型

```typescript
// 从右向左：根据参数类型推断回调参数类型
declare function map<T, U>(arr: T[], fn: (item: T) => U): U[];
map([1, 2, 3], (n) => n.toFixed(2));
//              ^? n 被推断为 number（从 arr: number[] 推断）

// 从左向右：数组字面量的最佳公共类型
const arr = [0, 1, null];
//    ^? (number | null)[]

// 混合场景：对象字面量
declare function createUser<T extends { name: string }>(user: T): T;
const user = createUser({ name: 'Alice', age: 30 });
//    ^? { name: string; age: number }
```

---

## 2. as const —— 推断的精确化武器

### 核心机制

`as const` 将推断从可变类型提升为**精确的字面量类型**：

```typescript
// 无 as const：推断为宽泛类型
const config1 = {
  mode: 'production',   // string
  port: 3000,           // number
  features: ['auth', 'billing'],  // string[]
};

// 有 as const：推断为精确字面量
type Config2 = {
  readonly mode: 'production';      // 字面量类型
  readonly port: 3000;              // 字面量类型
  readonly features: readonly ['auth', 'billing'];  // 只读元组
};
```

### 实战模式：配置对象的类型安全

```typescript
// 模式 1：路由配置
type RouteConfig = Record<string, { path: string; title: string }>;

const routes = {
  home: { path: '/', title: '首页' },
  about: { path: '/about', title: '关于' },
} as const;

type RouteKey = keyof typeof routes;  // 'home' | 'about'
type RoutePath = (typeof routes)[RouteKey]['path'];  // '/' | '/about'

// 模式 2：联合类型生成
type EventName = 'click' | 'hover' | 'scroll';
const EVENT_NAMES = ['click', 'hover', 'scroll'] as const;
type EventNameFromArray = (typeof EVENT_NAMES)[number];  // 'click' | 'hover' | 'scroll'

// 模式 3：Redux Action 类型
type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'DECREMENT'; payload: number };

// 用 as const 自动生成 Action Creator 类型
function createAction<T extends string>(type: T) {
  return <P>(payload: P) => ({ type, payload } as const);
}

const increment = createAction('INCREMENT')<number>;
const action = increment(5);
//    ^? { readonly type: "INCREMENT"; readonly payload: number }
```

---

## 3. satisfies —— 结构检查 + 保留推断

### 核心机制

`satisfies` 检查表达式是否兼容某个类型，但**保留原始推断类型**：

```typescript
// 问题：类型注解会丢失精确推断
type RGB = [number, number, number];
const color1: RGB = [255, 0, 0];
// color1[0] 的类型是 number，不是 255

// 解决：satisfies 保留推断
type RGB = [number, number, number];
const color2 = [255, 0, 0] satisfies RGB;
// color2[0] 的类型是 255（保留字面量推断）
// 同时确保 [255, 0, 0] 满足 RGB 的结构

// 实战：配置对象
interface Theme {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
} satisfies Theme;

// 保留精确推断：
type PrimaryColor = (typeof theme)['colors']['primary'];  // '#007bff'
// 同时确保结构满足 Theme 接口
```

### satisfies vs as const vs 类型注解

| 特性 | `: Type` | `as const` | `satisfies Type` |
|------|----------|------------|------------------|
| 结构检查 | ✅ | ❌ | ✅ |
| 保留精确推断 | ❌ | ✅ | ✅ |
| 设为 readonly | ❌ | ✅ | ❌ |
| 适用场景 | 需要精确类型 | 需要字面量类型 | 需要两者兼顾 |

---

## 4. `NoInfer<T>` —— 阻止不期望的推断（TS 5.4+）

### 核心问题

某些泛型参数不应该从特定位置推断，但 TypeScript 默认会尝试推断：

```typescript
// 问题：defaultValue 的类型被推断为 string，导致泛型 T 也被推断为 string
function createStore<T>(config: {
  initial: T;
  defaultValue: T;
}) {
  return config;
}

const store = createStore({
  initial: 42,
  defaultValue: 'default',  // ❌ T 被推断为 string | number
});
```

### 解决：`NoInfer<T>`

```typescript
function createStore<T>(config: {
  initial: T;
  defaultValue: NoInfer<T>;  // 阻止从此位置推断 T
}) {
  return config;
}

const store = createStore({
  initial: 42,
  defaultValue: 0,  // ✅ T 仅从 initial 推断为 number
});

// 错误会正确报告：
createStore({
  initial: 42,
  defaultValue: 'default',  // ❌ Type 'string' is not assignable to type 'number'
});
```

### 更多 NoInfer 场景

```typescript
// 场景 1：React 组件的 defaultProps
type Props<T> = {
  items: T[];
  renderItem: (item: NoInfer<T>) => ReactNode;
  keyExtractor: (item: NoInfer<T>) => string;
};

// 场景 2：API 客户端的响应类型
function apiCall<TResponse>(config: {
  url: string;
  transform: (data: unknown) => NoInfer<TResponse>;
}): Promise<TResponse>;

// TResponse 从调用时的泛型参数或返回值上下文推断，
// 而不是从 transform 函数的实现推断
```

---

## 5. 控制流分析（Control Flow Analysis）

### 类型收窄（Type Narrowing）

```typescript
function process(value: string | number | boolean) {
  if (typeof value === 'string') {
    value; // ^? string
    value.toUpperCase(); // ✅
  } else if (typeof value === 'number') {
    value; // ^? number
    value.toFixed(2); // ✅
  } else {
    value; // ^? boolean
    value.valueOf(); // ✅
  }
}

// 标签联合（Tagged Union / Discriminated Union）
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;  // shape 已收窄为 circle
    case 'rectangle':
      return shape.width * shape.height;   // shape 已收窄为 rectangle
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // exhaustive check
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 自定义类型守卫（Type Predicate）

```typescript
// 基础类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 对象类型守卫
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

function isAdmin(value: User | Admin): value is Admin {
  return value.type === 'admin';
}

function greet(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(`Admin: ${person.name}`);
    console.log(`Permissions: ${person.permissions.join(', ')}`);
  } else {
    console.log(`User: ${person.name}`);
    // person.permissions  // ❌ Property 'permissions' does not exist on type 'User'
  }
}

// 数组过滤类型守卫
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

const maybeValues = [1, null, 2, undefined, 3];
const values = maybeValues.filter(isDefined);
//    ^? number[]（而非 (number | null | undefined)[]）
```

---

## 6. 泛型推断的优先级

当多个位置都可以推断同一个泛型参数时，TypeScript 有特定的优先级：

```typescript
function example<T>(a: T, b: T): T {
  return a;
}

// 多个位置推断 T：取"最佳公共类型"
const r1 = example(1, 'hello');  // T = string | number

// 一个位置更精确时
type Animal = { name: string };
type Dog = Animal & { breed: string };

function adopt<T extends Animal>(pet: T): T {
  return pet;
}

const dog: Dog = { name: 'Buddy', breed: 'Labrador' };
const adopted = adopt(dog);  // T 推断为 Dog（而非 Animal）
```

---

## 常见陷阱

| 陷阱 | 示例 | 修正 |
|------|------|------|
| **as const 后无法修改** | `const arr = [1, 2] as const; arr.push(3)` | 需要可变时用 `readonly` 注解或复制 |
| **satisfies 不检查 excess properties** | `{ a: 1, b: 2 } satisfies { a: number }` | 这是设计行为；如需严格检查用类型注解 |
| **NoInfer 需要 TS 5.4+** | 旧版本不可用 | 可用 `T & {}` 模拟或升级 TS |
| **类型守卫的 false 分支不窄化** | `if (!isString(x))` 后 x 仍为 unknown | 使用 `else` 分支或 `asserts` |

---

## 练习

### Easy

1. 使用 `as const` 和 `typeof` 从配置对象中提取精确的路由参数类型。
2. 用 `satisfies` 确保一个颜色对象满足 `Record<string, [number, number, number]>`，同时保留精确的字面量键名。

### Medium

1. 实现一个 `safeParse` 函数，使用 `NoInfer` 确保解析目标类型仅从泛型参数推断。
2. 写一个自定义类型守卫 `isNonEmptyArray<T>`，使过滤后的数组类型排除空数组。

### Hard

1. 实现 `Exact<T, U>` 类型，检查 T 是否完全匹配 U（无多余属性，无不匹配属性）。

---

## 延伸阅读

- [TypeScript 5.4 Release Notes — NoInfer](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
- [Total TypeScript — satisfies](https://www.totaltypescript.com/satisfies-operator)
- [TypeScript Handbook — Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
