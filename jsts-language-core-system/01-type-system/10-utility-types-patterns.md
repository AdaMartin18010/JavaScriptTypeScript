# 工具类型与实用模式

> TypeScript 内置工具类型详解与自定义工具类型实践
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 内置工具类型

### 1.1 属性修饰

```typescript
interface User {
  name: string;
  age: number;
  email?: string;
}

// 全部可选
type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

// 全部必需
type RequiredUser = Required<User>;
// { name: string; age: number; email: string; }

// 全部只读
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; readonly email?: string; }
```

### 1.2 属性选择

```typescript
// 选取部分属性
type UserPreview = Pick<User, "name" | "email">;
// { name: string; email?: string; }

// 排除部分属性
type UserPublic = Omit<User, "email">;
// { name: string; age: number; }

// 提取联合类型
type UserKeys = keyof User; // "name" | "age" | "email"
```

### 1.3 类型提取

```typescript
// 提取函数返回类型
type Return = ReturnType<() => string>; // string

// 提取函数参数类型
type Params = Parameters<(a: number, b: string) => void>; // [number, string]

// 提取构造函数参数
type CParams = ConstructorParameters<typeof Date>; // [string | number | Date]

// 提取实例类型
type Instance = InstanceType<typeof Date>; // Date
```

---

## 2. 映射类型（Mapped Types）

### 2.1 基础映射

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type UserNullable = Nullable<User>;
// { name: string | null; age: number | null; email: string | null | undefined; }
```

### 2.2 键重映射（TS 4.1+）

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; getEmail: () => string | undefined; }
```

### 2.3 过滤属性

```typescript
type RemoveOptional<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

type UserRequired = RemoveOptional<User>;
// { name: string; age: number; }
```

---

## 3. 条件类型模式

### 3.1 分配性条件

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// string[] | number[]（分配）

type NonDistArray<T> = [T] extends [any] ? T[] : never;
type MixedArray = NonDistArray<string | number>;
// (string | number)[]（非分配）
```

### 3.2 infer 提取

```typescript
// 提取数组元素
type Element<T> = T extends (infer E)[] ? E : T;
type Num = Element<number[]>; // number

// 提取 Promise 值
type Awaited<T> = T extends Promise<infer R> ? R : T;
type Val = Awaited<Promise<string>>; // string

// 提取函数返回值
type Unwrap<T> = T extends (...args: any[]) => infer R ? R : T;
```

---

## 4. 自定义工具类型库

### 4.1 深度工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// 深度部分
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

// 深度必填
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object | undefined
    ? DeepRequired<NonNullable<T[K]>>
    : T[K];
};
```

### 4.2 类型守卫工具

```typescript
// 非空过滤
type NonNull<T> = T extends null | undefined ? never : T;

// 提取可调用
type Callable = (...args: any[]) => any;

// 是否为 never
type IsNever<T> = [T] extends [never] ? true : false;

// 是否为 any
type IsAny<T> = 0 extends (1 & T) ? true : false;
```

---

## 5. 实用模式

### 5.1 类型安全的 EventEmitter

```typescript
type EventMap = {
  click: { x: number; y: number };
  submit: { data: FormData };
  error: { message: string };
};

class TypedEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(payload: T[K]) => void> } = {};

  emit<K extends keyof T>(event: K, payload: T[K]) {
    this.listeners[event]?.forEach(fn => fn(payload));
  }

  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(handler);
  }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on("click", ({ x, y }) => console.log(x, y)); // 类型安全
```

### 5.2 API 响应类型

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function fetchUser(): Promise<ApiResponse<User>> {
  // ...
}

const result = await fetchUser();
if (result.success) {
  result.data.name; // ✅ User 类型
} else {
  result.error;     // ✅ string 类型
}
```

### 5.3 配置合并

```typescript
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never;
};
```

---

## 6. TS 5.4+ 新工具

```typescript
// NoInfer<T>：防止类型推断拓宽
function createNode<T>(value: T, options: { tag: NoInfer<T> }) {
  return { value, tag: options.tag };
}

createNode("hello", { tag: "hello" }); // ✅
createNode("hello", { tag: 42 });      // ❌ Type 'number' is not assignable
```

---

**参考规范**：TypeScript Handbook: Utility Types | TypeScript Handbook: Mapped Types
