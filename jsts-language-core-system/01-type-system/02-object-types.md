# 对象类型与结构类型系统

> TypeScript 的结构子类型（Structural Subtyping）与名义类型系统的对比
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 结构子类型

TypeScript 使用**结构子类型（Structural Subtyping）**：类型兼容性由成员决定，而非声明关系。

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

const p3d: Point3D = { x: 1, y: 2, z: 3 };
const p2d: Point2D = p3d; // ✅ 合法：Point3D 有 Point2D 的所有成员
```

### 1.1 与名义类型的对比

```typescript
// 名义类型系统（Java/C#）：类型名决定兼容性
class NamedA { name: string; }
class NamedB { name: string; }
// NamedA 和 NamedB 即使有相同结构也不兼容

// 结构类型系统（TypeScript）：结构决定兼容性
interface StructA { name: string; }
interface StructB { name: string; }
const a: StructA = { name: "test" };
const b: StructB = a; // ✅ 兼容，因为结构相同
```

---

## 2. 对象字面量类型

### 2.1 基本语法

```typescript
const person: { name: string; age: number } = {
  name: "Alice",
  age: 30
};
```

### 2.2 可选属性

```typescript
type Config = {
  host: string;
  port?: number;      // 可选
  timeout?: number;   // 可选
};

const config1: Config = { host: "localhost" };
const config2: Config = { host: "localhost", port: 3000 };
```

### 2.3 只读属性

```typescript
type ReadonlyPoint = {
  readonly x: number;
  readonly y: number;
};

const p: ReadonlyPoint = { x: 1, y: 2 };
p.x = 3; // ❌ Cannot assign to 'x' because it is a read-only property
```

### 2.4 索引签名

```typescript
type Dictionary = {
  [key: string]: number;
};

const scores: Dictionary = {
  math: 90,
  english: 85
};
```

---

## 3. 方法定义语法

```typescript
interface Person {
  // 方法简写（推荐）
  greet(name: string): string;

  // 函数属性
  farewell: (name: string) => string;

  // 带 this 参数
  sayHello(this: Person): void;
}
```

### 3.1 方法 vs 函数属性的区别

```typescript
interface MethodExample {
  // 方法：可被继承/重写，bivariant 检查
  method(x: string | number): void;

  // 函数属性：严格逆变检查
  property: (x: string) => void;
}
```

---

## 4. 对象类型的严格检查

### 4.1 多余属性检查（Excess Property Checks）

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: (config.width || 10) ** 2
  };
}

// ❌ 错误：对象字面量只能指定已知属性
createSquare({ colour: "red", width: 100 });

// ✅ 绕过：使用类型断言或中间变量
createSquare({ colour: "red", width: 100 } as SquareConfig);

const options = { colour: "red", width: 100 };
createSquare(options); // ✅ 因为 options 没有被推断为对象字面量类型
```

### 4.2 弱类型检测

```typescript
interface WeakType {
  name?: string;
  age?: number;
}

// 当对象没有任何与弱类型共同的属性时，报错
const w: WeakType = { firstName: "Alice" }; // ❌ 类型不兼容
```

---

## 5. 实用工具类型

### 5.1 内置工具类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial：所有属性可选
type PartialUser = Partial<User>;

// Required：所有属性必选
type RequiredUser = Required<User>;

// Readonly：所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick：选取部分属性
type UserPreview = Pick<User, "id" | "name">;

// Omit：排除部分属性
type UserPublic = Omit<User, "email">;

// Record：构造键值对类型
type UsersById = Record<string, User>;
```

---

**参考规范**：TypeScript Handbook: Object Types | ECMA-262 §6.1.7 The Object Type
