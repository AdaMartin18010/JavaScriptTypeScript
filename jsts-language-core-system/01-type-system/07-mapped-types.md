# 映射类型（Mapped Types）

> 基于 key remapping 的类型变换与条件映射
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

---

## 2. Key Remapping（TS 4.1+）

### 2.1 as 子句

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }
```

### 2.2 过滤键

```typescript
type RemoveKind<T> = {
  [K in keyof T as K extends "kind" ? never : K]: T[K];
};

type Clean = RemoveKind<{ kind: "circle"; radius: number }>;
// { radius: number; }
```

---

## 3. 条件映射

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

---

## 4. 实战模式

### 4.1 API 响应转换

```typescript
type ApiResponse<T> = {
  [K in keyof T as `${string & K}Response`]: T[K];
};
```

### 4.2 Event Handler 映射

```typescript
type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string };
};

type Handlers = {
  [K in keyof EventMap as `on${Capitalize<string & K>}`]: (e: EventMap[K]) => void;
};
// { onClick: (e: { x: number; y: number }) => void; onKeydown: (e: { key: string }) => void; }
```

---

**参考规范**：TypeScript Handbook: Mapped Types | TS 4.1 Key Remapping
