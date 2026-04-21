# 接口与类型别名

> `interface` 与 `type` 的本质区别、选用策略与高级模式
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基本语法对比

### 1.1 对象形状定义

```typescript
// interface
interface Point {
  x: number;
  y: number;
}

// type alias
type Point2 = {
  x: number;
  y: number;
};
```

### 1.2 函数类型

```typescript
// interface
interface Add {
  (a: number, b: number): number;
}

// type alias
type Add2 = (a: number, b: number) => number;
```

### 1.3 可索引类型

```typescript
// interface
interface StringArray {
  [index: number]: string;
}

// type alias
type StringArray2 = { [index: number]: string };
```

---

## 2. 核心差异

### 2.1 声明合并（Declaration Merging）

**`interface` 支持声明合并**，这是其与 `type` 最根本的区别：

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并后的 User：{ name: string; age: number; }
const user: User = { name: "Alice", age: 30 };
```

声明合并的场景：
- **第三方库类型扩展**：为已有接口添加属性
- **模块增强**：扩展全局对象（如 `Window`、`Process`）

```typescript
// 扩展 Window 对象
declare global {
  interface Window {
    myLib: MyLibrary;
  }
}
```

**`type` 不支持声明合并**：

```typescript
type User2 = { name: string };
type User2 = { age: number }; // ❌ Error: Duplicate identifier 'User2'
```

### 2.2 扩展方式

```typescript
// interface 使用 extends
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// type 使用交叉类型
type Animal2 = { name: string };
type Dog2 = Animal2 & { breed: string };

// interface 可以 extends type
type Nameable = { name: string };
interface Person extends Nameable {
  age: number;
}

// type 可以与 interface 交叉
type Employee = Person & { employeeId: number };
```

### 2.3 性能差异

在大型项目中，`interface` 的声明合并特性可能导致编译器需要检查更多的声明位置。但在绝大多数场景下，性能差异可以忽略不计。

---

## 3. 选用策略

### 3.1 优先使用 `interface` 的场景

| 场景 | 原因 |
|------|------|
| 面向对象/类层次 | `extends` 语义更清晰 |
| 库/框架的公共 API | 允许用户通过声明合并扩展 |
| 需要多次扩展的定义 | 声明合并更自然 |
| 类实现（`implements`）| interface 是传统的 OOP 模式 |

```typescript
// 库设计示例
interface Plugin {
  name: string;
  install(): void;
}

// 用户可通过声明合并扩展 Plugin 定义
declare module "my-framework" {
  interface Plugin {
    version?: string;
  }
}
```

### 3.2 优先使用 `type` 的场景

| 场景 | 原因 |
|------|------|
| 联合类型 | `interface` 无法定义联合类型 |
| 元组类型 | `interface` 无法定义元组 |
| 映射类型 | 类型运算需要 `type` |
| 条件类型 | `interface` 不支持条件类型 |
| 工具类型/类型运算 | `type` 更灵活 |

```typescript
// 联合类型只能用 type
type Status = "pending" | "success" | "error";
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// 元组只能用 type
type Point3D = [number, number, number];

// 映射类型只能用 type
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// 条件类型只能用 type
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 3.3 官方推荐

TypeScript 团队没有明确的"一刀切"推荐，但社区普遍遵循：

> **默认使用 `interface`，需要类型运算时使用 `type`**

---

## 4. 高级模式

### 4.1 接口的多次声明合并实践

```typescript
// 在 .d.ts 声明文件中扩展第三方库
// node_modules/@types/express/index.d.ts
interface Request {
  user?: User;
}

// 项目中的扩展声明文件：types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      traceId: string;
      requestTime: number;
    }
  }
}
```

### 4.2 类型别名的递归定义

```typescript
// 类型别名支持递归（需特定结构）
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// 接口也支持递归
interface TreeNode {
  value: string;
  children: TreeNode[];
}
```

### 4.3 混合使用策略

```typescript
// 核心数据结构用 interface（可扩展）
interface User {
  id: string;
  name: string;
}

// 派生类型用 type（灵活运算）
type UserInput = Omit<User, "id">;
type UserUpdate = Partial<User>;
type UserResponse = User & { createdAt: Date };

// API 响应类型用 type（联合类型）
type ApiResponse<T> = 
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

---

## 5. 常见陷阱

### 5.1 错误消息差异

`interface` 和 `type` 在类型错误消息中的显示方式不同：

```typescript
interface IFoo {
  a: string;
  b: number;
}

type TFoo = {
  a: string;
  b: number;
};

const i: IFoo = { a: 1, b: 2 }; // 错误消息显示 'IFoo'
const t: TFoo = { a: 1, b: 2 }; // 错误消息显示对象形状（匿名）
```

### 5.2 扩展时的冲突处理

```typescript
interface A {
  x: string;
}

interface B extends A {
  x: number; // ❌ Interface 'B' incorrectly extends interface 'A'
}

// type 的交叉类型处理冲突 differently
type A2 = { x: string };
type B2 = A2 & { x: number }; // ✅ 合法，但 x 变为 never
const b: B2 = { x: "hello" }; // ❌ Type 'string' is not assignable to type 'never'
```

### 5.3 `implements` 的兼容性

```typescript
interface CanWalk {
  walk(): void;
}

interface CanSwim {
  swim(): void;
}

// 类可以同时实现多个 interface
class Duck implements CanWalk, CanSwim {
  walk() {}
  swim() {}
}

// 类不能 implements type alias 的联合类型
type CanMove = CanWalk | CanSwim;
// class Wrong implements CanMove {} // ❌ 类只能实现对象类型或对象类型交集
```

---

## 6. 最新进展

TypeScript 6.0 未对 `interface` 与 `type` 的核心语义做变更，但默认启用 `strict: true` 后，两者在类型严格性检查上的表现更加一致。

TS 7.0（Project Corsa）的 Go 重写不会改变 `interface` 与 `type` 的语言语义，但可能优化声明合并在大规模项目中的编译性能。

---

## 决策流程图

```
需要定义的类型是什么？
    │
    ├── 联合类型 / 元组 / 条件类型 / 映射类型 ──→ 使用 type
    │
    ├── 需要声明合并（扩展第三方类型） ────────→ 使用 interface
    │
    ├── 类需要 implements ──────────────────→ 使用 interface
    │
    └── 简单对象形状 ───────────────────────→ interface 或 type 均可
```

---

**参考规范**：TypeScript Handbook: Interfaces | TypeScript Handbook: Type Aliases
