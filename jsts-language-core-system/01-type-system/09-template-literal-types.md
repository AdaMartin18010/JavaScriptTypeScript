# 模板字面量类型

> 字符串类型的模板化构造与模式匹配
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础语法

```typescript
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

type Color = "red" | "blue";
type Quantity = "one" | "two";
type SeussFish = `${Quantity | Color} fish`;
// "one fish" | "two fish" | "red fish" | "blue fish"
```

---

## 2. 内置字符串操作类型

```typescript
type A = Uppercase<"hello">;  // "HELLO"
type B = Lowercase<"HELLO">;  // "hello"
type C = Capitalize<"hello">; // "Hello"
type D = Uncapitalize<"Hello">; // "hello"
```

---

## 3. 实战模式

### 3.1 CSS 属性名生成

```typescript
type Vertical = "top" | "middle" | "bottom";
type Horizontal = "left" | "center" | "right";

type Alignment = `${Vertical}-${Horizontal}` | `${Vertical}` | `${Horizontal}`;
```

### 3.2 API 路由类型

```typescript
type APIRoutes = `/api/users/${number}` | `/api/posts/${string}`;

function fetchAPI(url: APIRoutes): Promise<unknown> {
  return fetch(url);
}

fetchAPI("/api/users/123"); // ✅
fetchAPI("/api/posts/hello"); // ✅
fetchAPI("/api/other"); // ❌
```

### 3.3 事件名生成

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type UserEvents = EventName<"create" | "update" | "delete">;
// "onCreate" | "onUpdate" | "onDelete"
```

---

**参考规范**：TypeScript Handbook: Template Literal Types | TS 4.1 Template Literal Types
