# 模板字面量类型

> 字符串层面的类型编程：模板字面量类型与内置字符串操作类型
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础模板字面量类型

模板字面量类型允许在类型层面进行字符串拼接：

```typescript
type Greeting = "Hello";
type Name = "World";
type Message = `${Greeting}, ${Name}!`; // "Hello, World!"

// 联合类型的展开
type Color = "red" | "blue";
type Size = "small" | "large";
type Style = `${Color}-${Size}`;
// "red-small" | "red-large" | "blue-small" | "blue-large"
```

---

## 2. 内置字符串操作类型

TS 4.1+ 提供了四个内置字符串操作类型：

```typescript
type T1 = Uppercase<"hello">;     // "HELLO"
type T2 = Lowercase<"WORLD">;     // "world"
type T3 = Capitalize<"hello">;    // "Hello"
type T4 = Uncapitalize<"Hello">;  // "hello"
```

---

## 3. 高级字符串类型编程

### 3.1 模式匹配与推断

```typescript
// 提取事件名前缀
type EventName<T> = T extends `${infer Prefix}:${infer Event}` ? Event : never;

type E = EventName<"user:created">; // "created"
```

### 3.2 递归字符串解析

```typescript
// 将 camelCase 转为 kebab-case
type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Lowercase<C>}${KebabCase<T>}`
    : `${Lowercase<C>}-${KebabCase<T>}`
  : S;

type K = KebabCase<"helloWorldFoo">; // "hello-world-foo"
```

### 3.3 分隔符解析类型

```typescript
// 按路径分隔符拆分
type PathKeys<T extends string> =
  T extends `${infer K}.${infer Rest}` ? K | PathKeys<Rest> : T;

type P = PathKeys<"a.b.c">; // "a" | "b" | "c"
```

---

## 4. 实战模式

### 4.1 类型安全的事件系统

```typescript
type EventMap = {
  "user:created": { userId: string };
  "user:deleted": { userId: string };
  "order:placed": { orderId: string; total: number };
};

type EventName = keyof EventMap;

type EventPayload<T extends EventName> = EventMap[T];

function emit<T extends EventName>(name: T, payload: EventPayload<T>) {
  // payload 类型根据 name 自动推断
}

emit("user:created", { userId: "123" }); // ✅
emit("order:placed", { orderId: "456", total: 100 }); // ✅
// emit("user:created", { orderId: "123" }); // ❌
```

### 4.2 CSS 变量类型

```typescript
type CSSVariable<T extends string> = `--${T}`;

type ThemeVar = CSSVariable<"primary-color" | "secondary-color">;
// "--primary-color" | "--secondary-color"
```

### 4.3 路由参数提取

```typescript
type ExtractParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type Params = ExtractParams<"/users/:id/posts/:postId">;
// { id: string; postId: string; }
```

---

## 5. 性能与限制

- 字符串类型递归深度有限制（约 50 层）
- 联合类型展开可能导致类型爆炸（`"a" | "b"` × `"x" | "y"` = 4 个组合）
- 复杂模板字面量类型可能影响编译性能

---

**参考规范**：TypeScript Handbook: Template Literal Types
