# 子类型关系

> **定位**：`20-code-lab/20.10-formal-verification/type-theory-formal/02-subtyping`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决类型层次结构中安全替换的形式化问题。子类型（Subtyping）规定了何时一个类型的值可以安全地用在期望另一类型的地方，是理解 TypeScript 结构性类型、Java 继承和 Rust trait 对象的理论基础。

### 1.2 形式化基础

子类型关系 `S <: T`（读作 S 是 T 的子类型）由以下核心规则定义：

- **自反性**：`S <: S`
- **传递性**：`S <: U` 且 `U <: T` ⇒ `S <: T`
- **宽度子类型**：`{x: A, y: B} <: {x: A}`（更多字段的子类型）
- **函数子类型**：`A → B <: A' → B'` 当且仅当 `A' <: A` 且 `B <: B'`（参数逆变，返回值协变）

TypeScript 采用**结构子类型**：`S <: T` 当且仅当 `S` 的所有成员都满足 `T` 对应成员的类型要求，与名称无关。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 协变 (Covariant) | `S <: T ⇒ F<S> <: F<T>` | variance.ts |
| 逆变 (Contravariant) | `S <: T ⇒ F<T> <: F<S>` | variance.ts |
| 不变 (Invariant) | 既不协变也不逆变 | variance.ts |

---

## 二、设计原理

### 2.1 为什么存在

现实世界存在自然的类型层次（动物 ⊃ 狗）。子类型允许代码在更抽象的层面编写，提高复用性，同时由类型检查器保证运行时不发生“方法未找到”等错误。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 名义子类型 | 意图明确、错误清晰 | 不够灵活 | Java / C# |
| 结构子类型 | 鸭子类型、松耦合 | 意外兼容风险 | TypeScript / OCaml |

### 2.3 与相关技术的对比

| 维度 | 宽度子类型 | 深度子类型 | 名义子类型 | 结构子类型 |
|------|------------|------------|------------|------------|
| 比较依据 | 字段数量 | 字段类型递归 | 声明名称 | 成员结构 |
| 兼容性 | 超集兼容子集 | 递归成员兼容 | 严格继承链 | 结构匹配即可 |
| 性能 | O(n) | O(n²) 可能 | O(1) | O(n) |
| 错误信息 | 明确 | 明确 | 最清晰 | 可能意外 |
| 接口演化 | 安全（添加字段） | 安全 | 需显式继承 | 安全 |
| 代表语言 | TS / OCaml | TS / OCaml | Java / Swift | TypeScript |

| 位置 | TypeScript 默认 | 可配置 | 常见触发场景 |
|------|-----------------|--------|-------------|
| 返回值 | 协变 | `covariant` | 函数返回更具体类型 |
| 参数 | 逆变 | `contravariant` | 回调函数参数类型 |
| 可变位置 | 不变 | `invariant` | `Array<T>` / `T[]` |
| 只读位置 | 协变 | `readonly` | `ReadonlyArray<T>` |

与 Java/C# 名义类型对比：结构类型更灵活，但错误信息可能较晦涩。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 子类型关系 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：协变/逆变/不变的 TypeScript 演示

```typescript
// subtyping.ts — 方差与子类型规则演示，可运行 (tsc --strict)

// === 宽度子类型 ===
interface Animal { name: string }
interface Dog extends Animal { breed: string }

const dog: Dog = { name: 'Rex', breed: 'Husky' };
const animal: Animal = dog; // OK: Dog <: Animal（宽度）

// === 函数子类型：参数逆变，返回值协变 ===
let handleAnimal: (a: Animal) => void;
let handleDog: (d: Dog) => void;

// 安全：期望处理 Animal 的地方，可以传入处理 Dog 的函数
// 因为函数只会使用 Animal 的字段，Dog 一定也有
handleAnimal = handleDog; // ❌ TS 错误：参数位置逆变

// 安全：期望处理 Dog 的地方，可以传入处理 Animal 的函数
// 因为函数保证只访问 Animal 的字段，Dog 的额外字段不会被误用
handleDog = handleAnimal; // ✅ OK: (Animal → void) <: (Dog → void)

// === 数组的不变性 ===
let animals: Animal[] = [];
let dogs: Dog[] = [];

// animals = dogs; // ❌ TS Error: Array 在 T 上是不变的
// 原因：若允许，则 animals.push(cat) 会破坏 dogs 的类型安全

// 只读数组协变
let readonlyAnimals: readonly Animal[] = dogs; // ✅ OK

// === 泛型方差演示 ===
interface Producer<out T> { // 显式协变（TS 4.7+）
  produce(): T;
}

interface Consumer<in T> { // 显式逆变（TS 4.7+）
  consume(value: T): void;
}

interface Storage<T> { // 默认不变
  get(): T;
  set(value: T): void;
}

const dogProducer: Producer<Dog> = { produce: () => dog };
const animalProducer: Producer<Animal> = dogProducer; // ✅ 协变安全

const animalConsumer: Consumer<Animal> = {
  consume: (a) => console.log(a.name),
};
const dogConsumer: Consumer<Dog> = animalConsumer; // ✅ 逆变安全

// ===== 结构子类型的意外兼容 =====
interface Vector2D { x: number; y: number }
interface Point { x: number; y: number }

const v: Vector2D = { x: 1, y: 2 };
const p: Point = v; // ✅ 结构匹配，与名称无关

// 防御：使用 branded type 避免意外兼容
interface UserId { __brand: 'UserId'; value: string }
interface OrderId { __brand: 'OrderId'; value: string }

function createUserId(v: string): UserId {
  return v as unknown as UserId;
}

const uid: UserId = createUserId('u-123');
// const oid: OrderId = uid; // ❌ 品牌类型阻止意外兼容

// === 验证运行时 ===
console.log('Width subtyping: Dog <: Animal');
console.log('Function: (Animal→void) <: (Dog→void)');
console.log('Readonly array: readonly Animal[] 接受 Dog[]');
console.log('Structural match: Vector2D ≡ Point');
```

### 3.2 代码示例：条件类型与子类型推导

```typescript
// conditional-subtyping.ts

type IsSubType<S, T> = S extends T ? true : false;

type Tests = [
  IsSubType<Dog, Animal>,           // true
  IsSubType<Animal, Dog>,           // false
  IsSubType<{x:1}, {x:number}>,     // true (深度子类型)
  IsSubType<string, string | number> // true (联合类型超集)
];

// 分配性条件类型：裸类型参数触发分配律
type ToArray<T> = T extends any ? T[] : never;
type R1 = ToArray<string | number>; // string[] | number[]

// 包装后阻止分配
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### 3.3 代码示例：Tuple 子类型与变长参数

```typescript
// tuple-subtyping.ts

type Point2D = [number, number];
type Point3D = [number, number, number];

// Tuple 长度固定，因此 Point3D 不是 Point2D 的子类型
const p3: Point3D = [1, 2, 3];
// const p2: Point2D = p3; // ❌ Error: 目标需要 2 个元素，但源有 3 个

// 函数 rest 参数的协变特性
function drawPoint2D(...coords: Point2D) { }
function drawPoint3D(...coords: Point3D) { }

// drawPoint3D = drawPoint2D; // ✅ 参数更少，更抽象，可安全替换
// drawPoint2D = drawPoint3D; // ❌ 参数更多，可能访问不存在的索引
```

### 3.4 代码示例：Mapped Types 与方差

```typescript
// mapped-variance.ts

interface Box<T> {
  value: T;
}

// 默认不变
type BoxAnimal = Box<Animal>;
type BoxDog = Box<Dog>;

// const ba: BoxAnimal = {} as BoxDog; // ❌ 不变

// 显式协变映射
type ReadonlyBox<out T> = { readonly value: T };
const rbDog: ReadonlyBox<Dog> = { value: dog };
const rbAnimal: ReadonlyBox<Animal> = rbDog; // ✅ 协变安全

// 显式逆变映射
type ListenerBox<in T> = { listen: (value: T) => void };
const lbAnimal: ListenerBox<Animal> = { listen: (a) => console.log(a.name) };
const lbDog: ListenerBox<Dog> = lbAnimal; // ✅ 逆变安全
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| TypeScript 使用名义类型 | TS 是结构类型系统，不依赖声明名称 |
| 数组是协变的 | 数组在可变位置是不变的，只读数组才是协变的 |
| 泛型参数默认协变 | TS 泛型参数默认不变（invariant），需显式标注 `in`/`out` |
| 条件类型总是分配 | 仅裸类型参数触发分配性，包装后（如 `[T]`）不分配 |

### 3.6 扩展阅读

- [TAPL: Chapter 15 — Subtyping](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [TAPL: Chapter 16 — Metatheory of Subtyping](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [TypeScript Handbook: Generics — Variance](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook: Structural Type System](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Scala Variance Overview](https://docs.scala-lang.org/tour/variances.html)
- [Cook & Cardelli: A Denotational Semantics of Inheritance](https://doi.org/10.1145/96709.96721)
- [Microsoft — TypeScript Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [TypeScript Deep Dive — Type System](https://basarat.gitbook.io/typescript/type-system)
- `20.10-formal-verification/type-theory-formal/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
