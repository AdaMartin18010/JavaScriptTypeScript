# 映射类型

> 基于键集合动态构造类型的强大机制
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础映射类型

映射类型允许基于一个已有类型的键集合来创建新类型：

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; }

type PartialUser = Partial<User>;
// { name?: string; age?: number; }
```

### 1.1 `keyof` 与索引访问类型

```typescript
type UserKeys = keyof User; // "name" | "age"

type UserNameType = User["name"]; // string
type UserValues = User[keyof User]; // string | number
```

### 1.2 修饰符

映射类型支持添加或移除修饰符：

```typescript
// 添加 readonly 和 ?
type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P];
};

// 移除 readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 移除可选
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

---

## 2. 键重映射（Key Remapping）

TS 4.1+ 引入 `as` 子句，允许在映射时变换键：

```typescript
// 键名前添加前缀
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }
```

### 2.1 过滤键

```typescript
// 只保留 string 类型的属性
type StringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Person {
  name: string;
  age: number;
  email: string;
}

type StringProps = StringProperties<Person>;
// { name: string; email: string; }
```

### 2.2 模板字面量键

```typescript
type EventCallbacks<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Config {
  load: string;
  save: string;
}

type ConfigEvents = EventCallbacks<Config>;
// { onLoad: (value: string) => void; onSave: (value: string) => void; }
```

---

## 3. 内置映射类型

### 3.1 属性修饰

| 类型 | 作用 |
|------|------|
| `Partial<T>` | 所有属性变为可选 |
| `Required<T>` | 所有属性变为必选 |
| `Readonly<T>` | 所有属性变为只读 |
| `Mutable<T>`（自定义） | 移除只读修饰符 |

### 3.2 属性选择

| 类型 | 作用 |
|------|------|
| `Pick<T, K>` | 从 T 中选择 K 属性 |
| `Omit<T, K>` | 从 T 中排除 K 属性 |
| `Extract<T, U>` | 从联合类型 T 中提取可赋值给 U 的成员 |
| `Exclude<T, U>` | 从联合类型 T 中排除可赋值给 U 的成员 |

### 3.3 类型转换

| 类型 | 作用 |
|------|------|
| `Record<K, T>` | 构造键为 K、值为 T 的对象类型 |
| `ReturnType<T>` | 获取函数返回类型 |
| `Parameters<T>` | 获取函数参数元组类型 |
| `InstanceType<T>` | 获取类实例类型 |

---

## 4. 递归映射类型

### 4.1 深度 `Partial` / `Readonly`

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Company {
  name: string;
  address: {
    city: string;
    zip: number;
  };
}

type PartialCompany = DeepPartial<Company>;
// { name?: string; address?: { city?: string; zip?: number; }; }
```

### 4.2 递归映射的边界与限制

```typescript
// 注意：递归类型在 TS 中有深度限制（默认约 50 层）
// 对于循环引用类型，需要特殊处理

interface Node {
  value: string;
  children: Node[];
}

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
```

---

## 5. 实战模式

### 5.1 API 响应转换类型

```typescript
interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
}

// 将 snake_case 转换为 camelCase
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type Camelize<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] extends string
    ? T[K]
    : T[K] extends object
    ? Camelize<T[K]>
    : T[K];
};

type User = Camelize<ApiUser>;
// { id: number; firstName: string; lastName: string; createdAt: string; }
```

### 5.2 表单验证类型生成

```typescript
interface FormFields {
  username: string;
  email: string;
  age: number;
}

type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

type FormErrors = ValidationErrors<FormFields>;
// { username?: string[]; email?: string[]; age?: string[]; }
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 映射类型与联合类型的键 | `keyof (A \| B)` 不等于 `(keyof A) \| (keyof B)` | 使用 `keyof` 前理解其语义 |
| 键重映射丢失原键 | `as` 转换后原键不存在 | 确保新键名正确生成 |
| 递归类型深度超限 | 深层嵌套对象导致编译错误 | 限制递归深度；使用接口循环引用 |
| `Pick`/`Omit` 与可选属性 | `Pick` 保留原属性的可选性 | 如需改变，再包一层 `Required` |

---

**参考规范**：TypeScript Handbook: Mapped Types | TypeScript Handbook: Template Literal Types
