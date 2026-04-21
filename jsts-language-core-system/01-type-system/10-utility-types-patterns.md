# 工具类型与实用模式

> 内置 Utility Types 的完整解读与自定义工具类型模式库
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 属性修饰工具类型

### 1.1 `Partial<T>`

将所有属性变为可选：

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

### 1.2 `Required<T>`

将所有属性变为必选：

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

### 1.3 `Readonly<T>`

将所有属性变为只读：

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### 1.4 深度版本

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
```

---

## 2. 属性选择工具类型

### 2.1 `Pick<T, K>`

从 T 中选择指定属性：

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  name: string;
  age: number;
  email: string;
}

type UserPreview = Pick<User, "name" | "email">;
// { name: string; email: string; }
```

### 2.2 `Omit<T, K>`

从 T 中排除指定属性：

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutEmail = Omit<User, "email">;
// { name: string; age: number; }
```

### 2.3 `Extract<T, U>` 与 `Exclude<T, U>`

```typescript
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type T1 = Extract<"a" | "b" | "c", "a" | "c">; // "a" | "c"
type T2 = Exclude<"a" | "b" | "c", "a">;       // "b" | "c"
```

---

## 3. 类型转换工具类型

### 3.1 `Record<K, T>`

构造键值对类型：

```typescript
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type PageNames = "home" | "about" | "contact";
type PageInfo = Record<PageNames, { title: string; path: string }>;
```

### 3.2 `ReturnType<T>`

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
```

### 3.3 `Parameters<T>`

```typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

### 3.4 `InstanceType<T>`

```typescript
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
```

---

## 4. 自定义工具类型模式库

### 4.1 `Nullable<T>` / `NonNullable<T>`

```typescript
type Nullable<T> = T | null;
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 4.2 `Flatten<T>`

```typescript
type Flatten<T extends any[]> = T extends [infer F, ...infer R]
  ? [...(F extends any[] ? Flatten<F> : [F]), ...Flatten<R>]
  : [];
```

### 4.3 `TupleToUnion<T>`

```typescript
type TupleToUnion<T extends any[]> = T[number];

type U = TupleToUnion<["a", "b", "c"]>; // "a" | "b" | "c"
```

### 4.4 `UnionToIntersection<T>`

```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type I = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }
```

---

## 5. TS 5.x 新增工具类型

### 5.1 `NoInfer<T>`（TS 5.4）

```typescript
type NoInfer<T> = [T][T extends any ? 0 : never];

// 用途：阻止特定位置参与类型推断
function createStore<T>(initial: T, validate: (state: NoInfer<T>) => boolean): T {
  return initial;
}
```

---

**参考规范**：TypeScript Handbook: Utility Types
