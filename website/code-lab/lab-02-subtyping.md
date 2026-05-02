---
title: "子类型关系实验室：从结构兼容到方差规则的类型安全探索"
description: "通过4个渐进式实验深入探索TypeScript子类型系统的核心机制，涵盖宽度子类型、深度子类型、函数子类型与递归类型的形式化规则及工程实践"
date: 2026-05-01
tags: ["code-lab", "子类型", "TypeScript", "类型系统", "协变", "逆变", "结构类型", "类型安全", "类型收窄"]
category: "code-lab"
---

# 子类型关系实验室：从结构兼容到方差规则的类型安全探索

> **实验场宣言**：TypeScript 的子类型系统不是「类型的包含关系」，而是**结构兼容性的形式化判定算法**。
> 它决定了何时一个值可以安全地替换另一个值，是理解接口扩展、泛型约束、类型收窄和不可变数据设计的理论基石。
> 本实验室通过 4 个从基础到高级的渐进实验，将子类型从「隐式行为」提升为「显式设计工具」。

---

## 实验室导航图

```mermaid
graph LR
    subgraph 对象结构层
        A[实验1<br/>宽度子类型] --> B[实验2<br/>深度子类型]
    end
    subgraph 函数与泛型层
        B --> C[实验3<br/>函数子类型]
        C --> D[实验4<br/>递归类型与方差]
    end

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e8f5e9
    style D fill:#fce4ec
```

| 实验编号 | 主题 | 核心概念 | 难度 |
|----------|------|----------|------|
| 实验 1 | 宽度子类型与结构兼容性 | 字段超集、名义类型 vs 结构类型、意外兼容 | ⭐⭐ |
| 实验 2 | 深度子类型与嵌套结构 | 递归成员兼容、对象字面量检查、 fresh object literal | ⭐⭐⭐ |
| 实验 3 | 函数子类型与参数/返回值方差 | 参数逆变、返回值协变、strictFunctionTypes | ⭐⭐⭐⭐ |
| 实验 4 | 递归类型、方差标注与条件类型 | 递归条件类型、显式方差 `in`/`out`、尾递归优化 | ⭐⭐⭐⭐⭐ |

---

## 引言

子类型（Subtyping）是类型系统的核心关系之一。
记号 `S <: T` 表示「S 是 T 的子类型」，即任何期望 `T` 类型值的地方，都可以安全地使用 `S` 类型的值而不会出现类型错误。
TypeScript 采用**结构子类型（Structural Subtyping）**：两个类型的兼容性完全由它们的成员结构决定，与类型的声明名称无关。
这与 Java、C# 等语言的**名义子类型（Nominal Subtyping）**形成鲜明对比——后者要求显式的 `extends` 或 `implements` 声明。

结构子类型的灵活性使 TypeScript 非常适合 JavaScript 生态的渐进式采用，但也引入了「意外兼容」的风险：两个语义上完全不同的类型可能因为结构相似而被判定为兼容。
本实验室通过可控的代码实验，系统性地探索宽度子类型、深度子类型、函数子类型和递归类型的形式化规则，并展示如何在工程中利用这些规则（或通过 branded types 规避其风险）。

---

## 前置知识

在开始实验之前，建议掌握以下核心概念：

- **TypeScript 基础类型**：接口（interface）、类型别名（type alias）、联合类型（union）、交集类型（intersection）
- **函数类型**：参数类型、返回值类型、可选参数、剩余参数的类型签名
- **泛型基础**：泛型参数、泛型约束（`extends`）、泛型默认值
- **集合论基础**：子集（`⊆`）、超集（`⊇`）关系对理解子类型规则的直觉帮助

---

## 实验 1：宽度子类型与结构兼容性

### 理论背景

宽度子类型（Width Subtyping）是结构子类型系统的最基本规则：**如果类型 `S` 包含类型 `T` 的所有字段（且对应字段类型兼容），那么 `S` 是 `T` 的子类型**。形式化表示为：

```
若 S 有字段 { x1: A1, x2: A2, ..., xn: An, ..., xm: Am }
且 T 有字段 { x1: A1, x2: A2, ..., xn: An }
则 S <: T
```

直觉上，`S` 比 `T` 「更宽」（有更多字段），所以 `S` 可以安全地用在任何期望 `T` 的地方——多余的字段只是被「忽略」了。
这一规则在面向对象编程中对应「子类可以继承父类并添加新成员」。

TypeScript 的接口 `extends` 语法显式利用了宽度子类型：`interface Dog extends Animal` 要求 `Dog` 包含 `Animal` 的所有字段，并可以添加额外字段。
但即使没有显式 `extends`，只要结构匹配，TypeScript 也判定为兼容。

### 实验代码

```typescript
// === 阶段 A：基础宽度子类型 ===
interface Animal {
  name: string;
  age: number;
}

interface Dog {
  name: string;
  age: number;
  breed: string;
}

const myDog: Dog = {
  name: 'Rex',
  age: 3,
  breed: 'Husky',
};

// Dog 是 Animal 的子类型：Dog <: Animal
const myAnimal: Animal = myDog; // ✅ OK

// 反向不成立：Animal 没有 breed 字段
// const myDog2: Dog = myAnimal; // ❌ Error: Property 'breed' is missing

// === 阶段 B：结构兼容性的「意外」行为 ===
interface Vector2D {
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

const v: Vector2D = { x: 1, y: 2 };
const p: Point = v; // ✅ 结构相同即兼容，名称无关

// 这在几何语义上可能是错误的：Vector2D 和 Point 有不同的操作语义
function translate(v: Vector2D, dx: number, dy: number): Vector2D {
  return { x: v.x + dx, y: v.y + dy };
}

// 但 TypeScript 允许传入 Point，因为结构兼容
const moved = translate(p, 5, 5); // ✅ 类型检查通过

// === 阶段 C：可选属性与宽度子类型 ===
interface UserBasic {
  id: string;
  name: string;
}

interface UserDetailed {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

const detailed: UserDetailed = { id: '1', name: 'Alice', email: 'alice@example.com' };
const basic: UserBasic = detailed; // ✅ UserDetailed <: UserBasic

// 带可选属性的超集仍然是子类型
function displayUser(user: UserBasic) {
  console.log(user.name);
}
displayUser(detailed); // ✅ OK

// === 阶段 D：对象字面量的 freshness 检查 ===
// 对象字面量在赋值时触发「严格对象字面量检查」（excess property checking）

function createAnimal(a: Animal): Animal {
  return a;
}

// 直接传入对象字面量：触发 freshness 检查
// createAnimal({ name: 'Cat', age: 2, breed: 'Persian' });
// ❌ Error: Object literal may only specify known properties, and 'breed' does not exist in type 'Animal'

// 先赋值给变量再传入：不触发 freshness 检查（因为变量可能通过其他途径被创建）
const catWithBreed = { name: 'Cat', age: 2, breed: 'Persian' };
createAnimal(catWithBreed); // ✅ OK（宽度子类型生效）

// === 阶段 E：接口扩展的显式宽度子类型 ===
interface Serializable {
  toJSON(): string;
}

interface Persistable extends Serializable {
  id: string;
  save(): Promise<void>;
}

interface Auditable extends Persistable {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 类型层次：Auditable <: Persistable <: Serializable
const record: Auditable = {
  id: 'rec-123',
  toJSON: () => '{"id":"rec-123"}',
  save: async () => { /* ... */ },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin',
};

const serializable: Serializable = record; // ✅ OK
const persistable: Persistable = record;   // ✅ OK

// === 阶段 F：用交叉类型和类型断言防御意外兼容 ===
// Branded Type 模式：在类型上附加不可见标记以实现名义类型效果

type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

const uid: UserId = createUserId('user-123');
const oid: OrderId = createOrderId('order-456');

// 以下赋值被阻止，尽管底层都是 string
// const wrong: UserId = oid; // ❌ Error: Type 'OrderId' is not assignable to type 'UserId'

function findUser(id: UserId): { name: string } {
  return { name: 'Alice' };
}

// findUser('plain-string'); // ❌ Error
findUser(uid); // ✅ OK
```

### 预期观察

1. **宽度方向**：`Dog`（更多字段）是 `Animal`（更少字段）的子类型，子类型方向与直觉中的「继承方向」一致
2. **名称无关**：`Vector2D` 和 `Point` 因结构完全相同而互相兼容，这是结构子类型的特性也是风险来源
3. **Freshness 保护**：对象字面量直接赋值时触发严格属性检查，防止拼写错误和意外字段传入
4. **显式层次**：接口 `extends` 创建了清晰的类型层次，便于代码维护和意图表达
5. **Branded Types**：通过 `& { readonly __brand: 'Name' }` 在编译期实现名义类型效果，防止语义不兼容的类型混用

### 变体探索

**变体 1-1**：使用 `satisfies` 运算符保持类型推断同时检查兼容性

```typescript
type RGB = [number, number, number];

const palette = {
  red: [255, 0, 0] as const,
  green: [0, 255, 0] as const,
  blue: [0, 0, 255] as const,
} satisfies Record<string, RGB>;

// palette.red 推断为 readonly [255, 0, 0]，而非 (number | string)[]
// 同时保证每个值都符合 RGB 类型
```

**变体 1-2**：使用 `unique symbol` 实现更严格的品牌类型

```typescript
declare const __userId: unique symbol;
type StrictUserId = string & { readonly [__userId]: true };

function strictUserId(id: string): StrictUserId {
  return id as StrictUserId;
}

// StrictUserId 与 OrderId 完全不兼容，即使两者都是 string & object
```

---

## 实验 2：深度子类型与嵌套结构

### 理论背景

深度子类型（Depth Subtyping）规定：如果两个对象的顶层字段兼容，且其**嵌套字段也递归兼容**，则这两个对象类型构成子类型关系。形式化地：

```
若 S <: T，且对于 S 和 T 的每个共同字段 k，S[k] <: T[k]
则 { ...S } <: { ...T }
```

深度子类型是 TypeScript 接口嵌套扩展和深层对象赋值的基础。例如，`DeepUser`（所有字段递归只读）可以赋值给 `User`（可写），因为只读属性是读写属性的子类型（协变位置）。

然而，深度子类型在**可变位置**（mutable positions）上会引发类型安全问题。如果允许 `Dog[]` 赋值给 `Animal[]`，那么通过 `Animal[]` 接口向数组中放入 `Cat` 会破坏 `Dog[]` 的类型不变性。因此 TypeScript 规定**数组在元素类型上是协变的**（在 `strictNullChecks` 下），但写入操作会触发类型检查。

### 实验代码

```typescript
// === 阶段 A：嵌套对象的深度子类型 ===
interface Address {
  city: string;
  zip: number;
}

interface Person {
  name: string;
  address: Address;
}

interface Employee {
  name: string;
  address: {
    city: string;
    zip: number;
    country: string; // 嵌套字段更宽
  };
  employeeId: string;
}

const emp: Employee = {
  name: 'Bob',
  address: { city: 'Shanghai', zip: 200000, country: 'China' },
  employeeId: 'E123',
};

// Employee 不是 Person 的子类型，因为 address 字段：
// Employee['address'] 有更多字段，但 Person['address'] 要求恰好 { city, zip }
// const person: Person = emp; // ❌ Error: Type '{ city: string; zip: number; country: string; }' is not assignable to type 'Address'

// 修正：使 Address 的字段更宽（允许额外字段）
interface FlexibleAddress {
  city: string;
  zip: number;
  [key: string]: unknown; // 索引签名允许额外字段
}

interface FlexiblePerson {
  name: string;
  address: FlexibleAddress;
}

const flexiblePerson: FlexiblePerson = emp; // ✅ OK

// === 阶段 B：递归接口的深度子类型 ===
interface TreeNode {
  value: string;
  children?: TreeNode[];
}

interface RichTreeNode {
  value: string;
  metadata: Record<string, unknown>;
  children?: RichTreeNode[];
}

const richTree: RichTreeNode = {
  value: 'root',
  metadata: { depth: 0 },
  children: [
    { value: 'child1', metadata: { depth: 1 } },
    {
      value: 'child2',
      metadata: { depth: 1 },
      children: [
        { value: 'grandchild', metadata: { depth: 2 } },
      ],
    },
  ],
};

// RichTreeNode 不是 TreeNode 的子类型（metadata 字段不匹配）
// const simpleTree: TreeNode = richTree; // ❌ Error

// 但子树如果结构匹配，可以安全赋值
const simpleSubTree: TreeNode = {
  value: 'sub',
  children: [
    { value: 'a' },
    { value: 'b' },
  ],
};

// === 阶段 C：只读属性的深度协变 ===
interface MutableConfig {
  apiUrl: string;
  timeout: number;
  nested: {
    retryCount: number;
  };
}

interface ImmutableConfig {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly nested: {
    readonly retryCount: number;
  };
}

const immutable: ImmutableConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  nested: { retryCount: 3 },
};

// ImmutableConfig <: MutableConfig（只读是读写的子类型）
const mutable: MutableConfig = immutable; // ✅ OK

// 反向不成立
// const imm2: ImmutableConfig = { apiUrl: '', timeout: 0, nested: { retryCount: 0 } };
// 实际上 MutableConfig 可以赋值给 ImmutableConfig，因为只读约束更宽松

// === 阶段 D：元组的长度固定性与子类型 ===
type Point2D = [number, number];
type Point3D = [number, number, number];

const p3: Point3D = [1, 2, 3];
// const p2: Point2D = p3; // ❌ Error: 目标需要 2 个元素，但源有 3 个

// 元组的长度是类型的一部分，因此 Point3D 不是 Point2D 的子类型
// 这与对象宽度子类型不同：元组是「精确宽度」的

// === 阶段 E：联合类型与深度子类型 ===
type Status = 'idle' | 'loading' | 'success' | 'error';

interface StateIdle { status: 'idle'; }
interface StateLoading { status: 'loading'; progress: number; }
interface StateSuccess { status: 'success'; data: unknown; }
interface StateError { status: 'error'; error: Error; }

type AppState = StateIdle | StateLoading | StateSuccess | StateError;

// 判别式联合（Discriminated Union）中的子类型收窄
function handleState(state: AppState) {
  switch (state.status) {
    case 'idle':
      // state 被收窄为 StateIdle
      console.log('Waiting...');
      break;
    case 'loading':
      // state 被收窄为 StateLoading，可以安全访问 progress
      console.log(`Loading: ${state.progress}%`);
      break;
    case 'success':
      console.log('Data loaded');
      break;
    case 'error':
      console.error(state.error.message);
      break;
  }
}

// === 阶段 F：条件类型中的深度子类型判断 ===
type IsSubType<S, T> = S extends T ? true : false;

type Tests = [
  IsSubType<{ x: 1 }, { x: number }>,     // true: 1 <: number
  IsSubType<{ x: number }, { x: 1 }>,     // false
  IsSubType<{ x: { y: 1 } }, { x: { y: number } }>, // true: 深度子类型
  IsSubType<{ x: { y: number } }, { x: { y: 1 } }>, // false
  IsSubType<string, string | number>,     // true: 联合类型的子类型规则
];

// 分配性条件类型：裸类型参数触发分配
 type DeepValue<T, K extends string> =
  K extends `${infer Head}.${infer Rest}`
    ? Head extends keyof T
      ? DeepValue<T[Head], Rest>
      : never
    : K extends keyof T
      ? T[K]
      : never;

 type Nested = { a: { b: { c: number } } };
 type V1 = DeepValue<Nested, 'a.b.c'>; // number
 type V2 = DeepValue<Nested, 'a.b'>;    // { c: number }
```

### 预期观察

1. **递归兼容**：深度子类型要求嵌套字段递归兼容，`Employee['address']` 因多出 `country` 字段而不兼容 `Address`
2. **索引签名**：`[key: string]: unknown` 索引签名允许接口接受具有额外字段的对象，放宽了深度子类型约束
3. **元组精确性**：元组类型对长度敏感，`Point3D` 不是 `Point2D` 的子类型，这区别于对象的宽度子类型
4. **只读协变**：只读属性可以安全地赋值给可写属性，因为只读是更强的约束（承诺不修改）
5. **条件类型判断**：`IsSubType` 利用条件类型的分发性判断子类型关系，是类型体操的基础工具

### 变体探索

**变体 2-1**：实现递归的 `DeepReadonly<T>`

```typescript
type DeepReadonly<T> =
  T extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

interface MutableUser {
  name: string;
  addresses: { city: string; zip: number }[];
}

type ImmutableUser = DeepReadonly<MutableUser>;
// addresses 数组和内部对象也变为只读
```

**变体 2-2**：使用 `in` 和 `out` 方差标注（TypeScript 4.7+）

```typescript
interface Producer<out T> {
  produce(): T; // T 只出现在输出位置，协变
}

interface Consumer<in T> {
  consume(value: T): void; // T 只出现在输入位置，逆变
}

interface Storage<T> {
  get(): T;
  set(value: T): void; // T 同时出现在输入和输出位置，不变
}
```

---

## 实验 3：函数子类型与参数/返回值方差

### 理论背景

函数类型是类型系统中最复杂的部分之一，因为函数同时涉及**输入**（参数）和**输出**（返回值），而这两个位置的子类型规则相反：

- **返回值位置**：协变（Covariant）。如果 `Dog <: Animal`，那么 `() => Dog <: () => Animal`。直观上，一个返回 `Dog` 的函数可以用在期望 `Animal` 的地方，因为调用方得到的值「比期望的更多」。
- **参数位置**：逆变（Contravariant）。如果 `Dog <: Animal`，那么 `(Animal) => void <: (Dog) => void`。直观上，一个能处理所有 `Animal` 的函数，一定可以处理 `Dog`（因为 `Dog` 是 `Animal` 的子类型）。但反过来不行：一个只能处理 `Dog` 的函数，遇到 `Cat`（也是 `Animal`）就会出错。

形式化规则（函数子类型规则）：

```
(A → B) <: (A' → B')  当且仅当  A' <: A  且  B <: B'
```

参数类型方向反转（逆变），返回值类型方向保持（协变）。TypeScript 在 `strictFunctionTypes` 开启时强制执行参数位置的严格逆变；关闭时（为兼容旧代码）允许参数双向协变（bivariance），这会破坏类型安全。

### 实验代码

```typescript
// === 阶段 A：返回值协变 ===
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }
interface Cat extends Animal { meow(): void; }

type AnimalFactory = () => Animal;
type DogFactory = () => Dog;

declare const makeDog: DogFactory;

// 返回值协变：DogFactory <: AnimalFactory
const makeAnimal: AnimalFactory = makeDog; // ✅ OK

// 使用返回的 Animal
const animal = makeAnimal();
// animal.bark(); // ❌ Error: 'bark' does not exist on type 'Animal'
// 安全：尽管底层是 Dog，但类型系统只允许访问 Animal 的字段

// === 阶段 B：参数逆变 ===
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

declare const handleAnimal: AnimalHandler;

// 参数逆变：AnimalHandler <: DogHandler
const handleDog: DogHandler = handleAnimal; // ✅ OK

// 底层逻辑：handleAnimal 只访问 name 字段，Dog 一定有 name
handleDog({ name: 'Rex', bark: () => console.log('woof') });

// 反向不成立（strictFunctionTypes 开启时）
declare const handleDogOnly: DogHandler;
// const handleAnimal2: AnimalHandler = handleDogOnly; // ❌ Error
// 原因：handleDogOnly 可能调用 dog.bark()，但传入 Cat 时没有 bark 方法

// === 阶段 C：strictFunctionTypes 的影响 ===
// strictFunctionTypes = true（推荐）
// 方法参数为严格逆变

class EventEmitter<T> {
  private listeners: Array<(event: T) => void> = [];

  addListener(listener: (event: T) => void) {
    this.listeners.push(listener);
  }

  emit(event: T) {
    this.listeners.forEach(l => l(event));
  }
}

const dogEmitter = new EventEmitter<Dog>();
// dogEmitter.addListener((animal: Animal) => console.log(animal.name));
// ❌ strictFunctionTypes 下报错：参数位置要求严格逆变
// 若关闭 strictFunctionTypes，此处通过但运行时会丢失 bark 访问

// === 阶段 D：方法声明 vs 函数属性声明的方差差异 ===
interface MethodStyle {
  handle(event: Animal): void; // 方法声明
}

interface PropertyStyle {
  handle: (event: Animal) => void; // 函数属性声明
}

// 方法声明在 TypeScript 中默认允许参数双向协变（bivariance）
// 这是为了兼容常见的设计模式（如 EventHandler 赋值）
// 函数属性声明在 strictFunctionTypes 下严格逆变

// === 阶段 E：回调函数的逆变应用 ===
interface Task<T> {
  data: T;
  execute(handler: (result: T) => void): void;
}

// 由于 T 在回调参数位置，Task<Dog> 的 handler 参数类型是 (result: Dog) => void
// 因此可以传入 (result: Animal) => void 的函数
const dogTask: Task<Dog> = {
  data: { name: 'Rex', bark() {} },
  execute(handler) {
    handler(this.data);
  },
};

dogTask.execute((animal: Animal) => {
  console.log(animal.name); // 安全：只访问 Animal 的字段
});

// === 阶段 F：高阶函数中的方差组合 ===
type Mapper<T, U> = (item: T) => U;

// Mapper 在 T 上逆变，在 U 上协变
// 若 Dog <: Animal，则：
// Mapper<Animal, string> <: Mapper<Dog, string>     （T 位置逆变）
// Mapper<Dog, Dog> <: Mapper<Dog, Animal>           （U 位置协变）

declare const animalToString: Mapper<Animal, string>;
const dogToString: Mapper<Dog, string> = animalToString; // ✅ T 位置逆变

declare const dogToDog: Mapper<Dog, Dog>;
const dogToAnimal: Mapper<Dog, Animal> = dogToDog; // ✅ U 位置协变

// 综合：Mapper<Animal, Dog> <: Mapper<Dog, Animal>
declare const animalToDog: Mapper<Animal, Dog>;
const dogToAnimal2: Mapper<Dog, Animal> = animalToDog; // ✅ 同时满足 T 逆变和 U 协变
```

### 预期观察

1. **返回值协变**：`DogFactory` 可以赋值给 `AnimalFactory`，因为调用方得到的值满足 `Animal` 约束
2. **参数逆变**：`AnimalHandler` 可以赋值给 `DogHandler`，因为处理更抽象类型的函数一定能处理更具体的类型
3. **strictFunctionTypes**：开启后方法参数严格逆变，关闭时允许双向协变但会隐藏类型安全漏洞
4. **方法 vs 属性**：方法声明默认参数双向协变，函数属性声明在 `strictFunctionTypes` 下严格逆变
5. **高阶函数**：`Mapper<T, U>` 同时在 `T` 上逆变、在 `U` 上协变，体现了方差的多重组合

### 变体探索

**变体 3-1**：使用 `Parameters` 和 `ReturnType` 进行函数类型变换

```typescript
type MyFunction = (x: number, y: string) => boolean;

type P = Parameters<MyFunction>;     // [number, string]
type R = ReturnType<MyFunction>;     // boolean

// 构造新的函数类型：交换参数顺序
type Swapped = (...args: [P[1], P[0]]) => R; // (y: string, x: number) => boolean
```

**变体 3-2**：实现类型安全的柯里化（Curry）

```typescript
type Curry<T extends (...args: any[]) => any> =
  Parameters<T> extends [infer First, ...infer Rest]
    ? (arg: First) => Rest extends []
      ? ReturnType<T>
      : Curry<(...args: Rest) => ReturnType<T>>
    : () => ReturnType<T>;

function add(a: number, b: number, c: number): number {
  return a + b + c;
}

type CurriedAdd = Curry<typeof add>;
// (a: number) => (b: number) => (c: number) => number
```

---

## 实验 4：递归类型、方差标注与条件类型

### 理论背景

递归类型（Recursive Types）是指在其定义中引用自身的类型。在 TypeScript 中，递归类型通常通过**递归条件类型**（Recursive Conditional Types）实现，例如 `DeepReadonly<T>`、`DeepPartial<T>` 等。TypeScript 对递归类型深度有限制（约 50 层），超过限制会报错 `Type instantiation is excessively deep and possibly infinite`。TypeScript 4.5+ 引入了**尾递归消除（Tail Recursion Elimination, TRE）**，优化了特定模式的递归类型，允许更深的递归层次。

显式方差标注（TypeScript 4.7+）允许开发者在接口和类型别名上显式声明泛型参数的方差：`out` 表示协变，`in` 表示逆变。这不仅是文档价值，还能帮助 TypeScript 编译器在复杂类型推导中做出更精确的判断，并在不必要时跳过昂贵的结构化比较。

条件类型的**分配性**（Distributivity）是另一个关键机制：当条件类型中的被检查类型 `T` 是「裸类型参数」（naked type parameter）时，类型会自动分发到联合类型的每个成员上。这一机制是许多类型体操工具（如 `UnionToIntersection`）的基础。

### 实验代码

```typescript
// === 阶段 A：递归条件类型的基础实现 ===
// 将 T 的所有嵌套属性转为可选

type DeepPartial<T> =
  T extends object
    ? T extends Function
      ? T
      : { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

interface Company {
  name: string;
  ceo: {
    name: string;
    address: {
      city: string;
      zip: number;
    };
  };
  employees: Array<{
    name: string;
    role: string;
  }>;
}

type PartialCompany = DeepPartial<Company>;
// 所有层级的属性都变为可选

// === 阶段 B：尾递归优化版本 ===
// 未优化的递归可能导致「类型实例化过深」错误

type DeepFlattenNaive<T> =
  T extends readonly (infer U)[]
    ? DeepFlattenNaive<U>
    : T;

// 尾递归优化版本（TypeScript 4.5+）
type DeepFlatten<T, Acc extends readonly unknown[] = []> =
  T extends readonly [infer First, ...infer Rest]
    ? DeepFlatten<Rest, [...Acc, ...(First extends readonly unknown[] ? DeepFlatten<First> : [First])]>
    : [...Acc, ...(T extends readonly unknown[] ? T : [T])];

type Flattened = DeepFlatten<[1, [2, [3, 4]], 5]>;
// [1, 2, 3, 4, 5]

// === 阶段 C：显式方差标注 ===
// TypeScript 4.7+ 支持在接口和类型别名上显式标注方差

interface Box<out T> {
  readonly value: T; // T 只出现在 out 位置（返回值/只读属性）
}

interface Sink<in T> {
  write(value: T): void; // T 只出现在 in 位置（参数）
}

interface Pipe<in T, out U> {
  process(value: T): U; // T 逆变，U 协变
}

const dogBox: Box<Dog> = { value: { name: 'Rex', bark() {} } };
const animalBox: Box<Animal> = dogBox; // ✅ 协变：Box<Dog> <: Box<Animal>

const animalSink: Sink<Animal> = {
  write(animal) { console.log(animal.name); }
};
const dogSink: Sink<Dog> = animalSink; // ✅ 逆变：Sink<Animal> <: Sink<Dog>

// === 阶段 D：联合类型的子类型规则 ===
// S <: T1 | T2  当且仅当  S <: T1 或 S <: T2

type AnimalOrPlant = Animal | { species: string };
const dogForUnion: AnimalOrPlant = { name: 'Rex', bark() {} }; // ✅ Dog <: Animal

// 交集类型的子类型规则
// S <: T1 & T2  当且仅当  S <: T1 且 S <: T2
interface Flyable { fly(): void; }
interface Swimmable { swim(): void; }
type Duck = Flyable & Swimmable;

const mallard: Duck = {
  fly: () => console.log('flap'),
  swim: () => console.log('paddle'),
};

// Duck <: Flyable 且 Duck <: Swimmable
const flyer: Flyable = mallard;     // ✅ OK
const swimmer: Swimmable = mallard; // ✅ OK

// === 阶段 E：分配性条件类型 ===
// 裸类型参数触发分配性

type ToArray<T> = T extends any ? T[] : never;
type Distributed = ToArray<string | number>;
// string[] | number[]（分配到联合类型的每个成员）

// 包装后阻止分配
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type NonDistributed = ToArrayNonDist<string | number>;
// (string | number)[]（不分配）

// 应用：UnionToIntersection
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

type Mixed = UnionToIntersection<{ a: 1 } | { b: 2 }>;
// { a: 1 } & { b: 2 }

// === 阶段 F：递归类型中的类型安全模式 ===
// 树形结构的类型安全操作

interface BinaryTree<T> {
  value: T;
  left?: BinaryTree<T>;
  right?: BinaryTree<T>;
}

function mapTree<T, U>(tree: BinaryTree<T>, fn: (value: T) => U): BinaryTree<U> {
  return {
    value: fn(tree.value),
    left: tree.left ? mapTree(tree.left, fn) : undefined,
    right: tree.right ? mapTree(tree.right, fn) : undefined,
  };
}

const numTree: BinaryTree<number> = {
  value: 1,
  left: { value: 2 },
  right: { value: 3, left: { value: 4 } },
};

const strTree = mapTree(numTree, n => `value-${n}`);
// strTree 被推断为 BinaryTree<string>

// 深度限制保护
 type DeepObject<T, Depth extends number = 5> =
  Depth extends 0
    ? T
    : { value: T; nested?: DeepObject<T, [-1] extends [0] ? 0 : never> }; // 简化示意
```

### 预期观察

1. **递归深度**：未优化的递归条件类型在深层嵌套时可能触发编译器深度限制，尾递归优化版本可以处理更深的结构
2. **显式方差**：`Box<out T>` 明确声明协变，`Sink<in T>` 明确声明逆变，帮助编译器优化类型检查性能
3. **联合子类型**：`Dog` 是 `Animal | Plant` 的子类型，因为 `Dog <: Animal`；交集要求同时满足所有成员
4. **分配性控制**：裸类型参数触发分配性，`[T]` 包装后阻止分配，这一区别是高级类型工具的基础
5. **递归数据结构**：`BinaryTree<T>` 展示了如何对递归类型进行类型安全的泛型变换

### 变体探索

**变体 4-1**：实现路径类型（Dot Notation）的类型安全访问

```typescript
type Path<T, K extends keyof T = keyof T> =
  K extends string
    ? T[K] extends object
      ? `${K}` | `${K}.${Path<T[K]>}`
      : `${K}`
    : never;

type UserPaths = Path<{ name: string; address: { city: string; zip: number } }>;
// 'name' | 'address' | 'address.city' | 'address.zip'
```

**变体 4-2**：使用 `infer` 实现类型级的模式匹配

```typescript
// 从字符串中提取前缀和剩余部分
type ExtractPrefix<S extends string> =
  S extends `${infer Prefix}::${infer Rest}`
    ? { prefix: Prefix; rest: Rest }
    : never;

type Parsed = ExtractPrefix<'app::config::database'>;
// { prefix: 'app'; rest: 'config::database' }
```

---

## 实验总结

通过本实验室的 4 个渐进实验，我们系统性地探索了 TypeScript 子类型系统的核心机制及其工程应用：

| 实验 | 核心收获 | 工程应用 |
|------|----------|----------|
| 实验 1 | 理解了宽度子类型的「超集是子集」规则及结构类型的意外兼容风险 | 使用 branded types 和 `satisfies` 防止语义不兼容的类型混用 |
| 实验 2 | 掌握了深度子类型的递归兼容规则及元组、联合类型的特殊行为 | 设计深层不可变数据结构（`DeepReadonly`），实现类型安全的配置系统 |
| 实验 3 | 实践了函数类型的参数逆变和返回值协变规则，理解了 `strictFunctionTypes` 的影响 | 编写类型安全的事件处理器、回调函数和高阶函数 |
| 实验 4 | 探索了递归条件类型、显式方差标注和条件类型分配性 | 构建类型安全的树形操作、路径访问器和泛型工具库 |

**关键陷阱与最佳实践**：

- **陷阱 1**：认为 TypeScript 使用名义类型系统。TS 是纯粹的结构性类型系统，两个同构的不同名类型完全兼容
- **陷阱 2**：在可变位置（如数组元素、对象属性）上假设协变是安全的。`animals.push(cat)` 会破坏 `dogs` 数组的不变性
- **陷阱 3**：关闭 `strictFunctionTypes` 以规避类型错误。这会隐藏真正的类型安全漏洞，应在团队规范中强制开启
- **陷阱 4**：递归类型不设置深度保护。在运行时递归深度可能超出 TypeScript 的类型递归限制
- **最佳实践 1**：对表示不同语义但底层类型相同的值（如 `UserId` 和 `OrderId`）使用 branded types
- **最佳实践 2**：在公共 API 的接口定义中使用显式方差标注（`in`/`out`），既提高代码可读性，也优化编译性能
- **最佳实践 3**：使用 `satisfies` 运算符在保持类型推断精度的同时检查结构兼容性

---

## 延伸阅读

### 类型理论经典

- [TAPL: Chapter 15 — Subtyping](https://www.cis.upenn.edu/~bcpierce/tapl/) — Benjamin C. Pierce 的经典类型理论教材，子类型章节
- [TAPL: Chapter 16 — Metatheory of Subtyping](https://www.cis.upenn.edu/~bcpierce/tapl/) — 子类型的元理论：传递性、最小类型、最大类型
- [Cook & Cardelli: A Denotational Semantics of Inheritance](https://doi.org/10.1145/96709.96721) — 继承与子类型的指称语义基础论文
- [Featherweight TypeScript](https://arxiv.org/abs/2307.03118) — TypeScript 形式化语义论文，精确描述结构子类型规则

### TypeScript 官方与权威文档

- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — 官方结构子类型兼容性文档
- [TypeScript Handbook: Generics — Variance](https://www.typescriptlang.org/docs/handbook/2/generics.html) — 泛型方差详解
- [TypeScript 4.7 Variance Annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters) — 显式方差标注官方说明
- [TypeScript 4.9 satisfies Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — `satisfies` 运算符文档
- [Microsoft — TypeScript Structural Type System](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — 微软官方类型兼容性指南

### 语言对比与深度文章

- [Scala Variance Overview](https://docs.scala-lang.org/tour/variances.html) — Scala 语言中的方差概念，与 TypeScript 对比
- [Anders Hejlsberg — TypeScript: Static types for dynamic worlds (YouTube)](https://www.youtube.com/watch?v=ET4kT88JRXs) — TypeScript 设计者讲解类型系统设计哲学
- [TypeScript Deep Dive — Type System](https://basarat.gitbook.io/typescript/type-system) — Basarat Ali Syed 的深度类型系统教程
- [Soundiness: A Song of JavaScript and TypeScript](https://soundiness.github.io/) — JavaScript 与 TypeScript 类型系统 soundiness 研究

*本实验室遵循 JS/TS 全景知识库的理论-实践闭环原则。*
