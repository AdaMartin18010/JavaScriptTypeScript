# 实用类型模式

> 常用类型工具的实现原理与实战应用
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础工具类型

```typescript
// 全部可选
type Partial<T> = { [P in keyof T]?: T[P]; };

// 全部必选
type Required<T> = { [P in keyof T]-?: T[P]; };

// 全部只读
type Readonly<T> = { readonly [P in keyof T]: T[P]; };

// 选取属性
type Pick<T, K extends keyof T> = { [P in K]: T[P]; };

// 排除属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 属性映射
type Record<K extends keyof any, T> = { [P in K]: T; };
```

---

## 2. 条件工具类型

```typescript
// 排除
type Exclude<T, U> = T extends U ? never : T;

// 提取
type Extract<T, U> = T extends U ? T : never;

// 非空
type NonNullable<T> = T extends null | undefined ? never : T;

// 返回类型
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

// 参数类型
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

---

## 3. 实战模式

### 3.1 DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### 3.2 DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### 3.3 Nullable Properties

```typescript
type Nullable<T> = { [P in keyof T]: T[P] | null };
```

### 3.4 Flatten 类型

```typescript
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;
```

---

**参考规范**：TypeScript Handbook: Utility Types | lib.es5.d.ts
