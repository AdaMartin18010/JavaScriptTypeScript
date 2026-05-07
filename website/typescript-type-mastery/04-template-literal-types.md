---
title: 04 模板字面量类型
description: 掌握 TypeScript 模板字面量类型的字符串级运算：路径类型、事件名生成、路由参数提取、CSS 变量类型安全等实战模式。
---

# 04 模板字面量类型

> **前置知识**：泛型、条件类型、infer
>
> **目标**：能够使用模板字面量类型实现类型安全的路由、事件系统和配置键路径

---

## 1. 基础字符串级类型运算

### 核心语法

```typescript
type EventName<T extends string, U extends string> = `${T}_${U}`;

type UserEvent = EventName<'user', 'created' | 'updated' | 'deleted'>;
//   ^? 'user_created' | 'user_updated' | 'user_deleted'
```

### 内置字符串操作类型

```typescript
// TS 4.1+ 内置
type S1 = Uppercase<'hello'>;    // 'HELLO'
type S2 = Lowercase<'HELLO'>;    // 'hello'
type S3 = Capitalize<'hello'>;   // 'Hello'
type S4 = Uncapitalize<'Hello'>; // 'hello'

// 组合使用
type KebabCase<S extends string> = S extends `${infer C}${infer Rest}`
  ? `${Lowercase<C>}${Rest extends Capitalize<Rest> ? `-${KebabCase<Rest>}` : KebabCase<Rest>}`
  : S;

type K1 = KebabCase<'userName'>;  // 'user-name'
type K2 = KebabCase<'apiKey'>;    // 'api-key'
```

---

## 2. 路径类型（Path Types）

### 对象路径提取

```typescript
// 提取对象的所有嵌套路径（作为字符串联合类型）
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? `${K}` | `${K}.${Path<T[K]>}`
        : never;
    }[keyof T]
  : never;

interface User {
  name: string;
  address: {
    city: string;
    zip: number;
  };
}

type UserPath = Path<User>;
//   ^? 'name' | 'address' | 'address.city' | 'address.zip'

// 根据路径获取值类型
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

type V1 = PathValue<User, 'address.city'>;  // string
type V2 = PathValue<User, 'name'>;          // string
```

### 实战：类型安全的 get 函数

```typescript
function get<T extends object, P extends Path<T>>(
  obj: T,
  path: P
): PathValue<T, P> {
  const keys = path.split('.');
  let result: any = obj;
  for (const key of keys) {
    result = result?.[key];
  }
  return result;
}

const user: User = {
  name: 'Alice',
  address: { city: 'Beijing', zip: 100000 },
};

const city = get(user, 'address.city');
//    ^? string — 类型自动推断

// 错误路径会在编译时报错：
// get(user, 'address.country');  // ❌ Type '"address.country"' is not assignable
```

---

## 3. 路由参数提取

### 从路由模式提取参数

```typescript
// 提取 /user/:id/profile 中的参数名
type RouteParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof RouteParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};

// 简化版（处理单层参数）
type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type P1 = ExtractParams<'/user/:id'>;              // { id: string }
type P2 = ExtractParams<'/user/:id/profile'>;      // { id: string }
type P3 = ExtractParams<'/user/:userId/post/:postId'>;  // { userId: string } & { postId: string }

// 类型安全的路由匹配函数
type Route = '/user/:id' | '/user/:id/post/:postId';

declare function matchRoute<R extends Route>(
  route: R,
  params: ExtractParams<R>
): void;

matchRoute('/user/:id', { id: '123' });           // ✅
matchRoute('/user/:id/post/:postId', { userId: '1', postId: '2' });  // ✅
// matchRoute('/user/:id', { userId: '123' });    // ❌ 参数名不匹配
```

---

## 4. CSS 变量类型安全

### 设计令牌类型系统

```typescript
// 定义主题令牌
type Colors = 'primary' | 'secondary' | 'danger';
type Shades = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// 生成所有 CSS 变量名
type ColorToken = `--color-${Colors}-${Shades}`;
//   ^? '--color-primary-50' | '--color-primary-100' | ... | '--color-danger-900'

// 类型安全的 CSS 变量访问
function getColorVariable(token: ColorToken): string {
  return `var(${token})`;
}

getColorVariable('--color-primary-500');  // ✅
// getColorVariable('--color-primary-999');  // ❌ 编译错误

// 更复杂的：带语义层级的令牌
type SemanticColors = 'background' | 'text' | 'border';
type States = '' | '-hover' | '-active' | '-disabled';

type SemanticToken = `--${SemanticColors}${States}`;

// 映射到具体值
type TokenMap = Record<SemanticToken, string>;
const tokens: TokenMap = {
  '--background': '#ffffff',
  '--background-hover': '#f5f5f5',
  '--text': '#333333',
  '--text-disabled': '#999999',
  // ...
};
```

---

## 5. 事件系统类型安全

### 自动推断事件回调类型

```typescript
// 根据事件名推断回调参数类型
type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'page:view': { path: string; referrer?: string };
};

// 从 EventMap 生成事件名联合类型
type EventNames = keyof EventMap;

// 类型安全的事件监听
type EventCallback<E extends EventNames> = (payload: EventMap[E]) => void;

function on<E extends EventNames>(event: E, callback: EventCallback<E>): void {
  // 实现...
}

on('user:login', (payload) => {
  console.log(payload.userId);     // ✅ 推断为 string
  console.log(payload.timestamp);  // ✅ 推断为 number
});

on('page:view', (payload) => {
  console.log(payload.path);       // ✅ 推断为 string
  console.log(payload.referrer);   // ✅ 推断为 string | undefined
});

// 错误的事件参数会在编译时报错：
// on('user:login', (payload) => payload.path);  // ❌ Property 'path' does not exist
```

---

## 6. SQL 查询类型安全（极限挑战）

```typescript
// 简化示意：从 SELECT 字符串推断返回类型
type TableSchema = {
  users: { id: number; name: string; email: string };
  posts: { id: number; title: string; userId: number };
};

// 解析 SELECT 子句
type ParseSelect<T extends string> = T extends `SELECT ${infer Columns} FROM ${infer Table}`
  ? Table extends keyof TableSchema
    ? Columns extends '*'
      ? TableSchema[Table]
      : Pick<TableSchema[Table], ExtractColumns<Columns>>
    : never
  : never;

type ExtractColumns<T extends string> = T extends `${infer Col}, ${infer Rest}`
  ? Col extends keyof TableSchema[keyof TableSchema]
    ? Col | ExtractColumns<Rest>
    : ExtractColumns<Rest>
  : T extends keyof TableSchema[keyof TableSchema]
  ? T
  : never;

// 使用
type Q1 = ParseSelect<'SELECT id, name FROM users'>;
//   ^? { id: number; name: string }

type Q2 = ParseSelect<'SELECT * FROM posts'>;
//   ^? { id: number; title: string; userId: number }
```

---

## 常见陷阱

| 陷阱 | 示例 | 修正 |
|------|------|------|
| **递归深度超限** | 深层嵌套对象的路径类型 | 限制递归深度或改用运行时检查 |
| **联合类型膨胀** | 大量模板组合导致类型过大 | 使用接口替代联合，或拆分类型定义 |
| **infer 与模板结合** | `T extends \`${infer A}${infer B}\`` | 注意 greedy matching，可能需要更精确的模式 |

---

## 练习

### Easy

1. 实现 `EndsWith<S, E>` — 判断字符串 S 是否以 E 结尾。
2. 实现 `StartsWith<S, E>` — 判断字符串 S 是否以 E 开头。

### Medium

1. 实现 `CamelCase<S>` — 将 `snake_case` 转为 `camelCase`。
2. 实现 `DeepPath<T, Depth = 3>` — 提取对象最多 Depth 层的路径。

### Hard

1. 实现 `ReplaceAll<S, From, To>` — 将字符串中所有 From 替换为 To。
2. 实现 `ParseURL<T>` — 从 URL 字符串提取协议、主机、路径和查询参数类型。

---

## 延伸阅读

- [TypeScript Handbook — Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Total TypeScript — String Manipulation](https://www.totaltypescript.com/)
- [type-challenges — String exercises](https://github.com/type-challenges/type-challenges)
