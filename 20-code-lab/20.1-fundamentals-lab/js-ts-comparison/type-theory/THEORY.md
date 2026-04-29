# 类型理论基础

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/type-theory`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块从类型理论视角审视 TypeScript 的类型系统，解决理解结构性类型、协变逆变等深层概念的理论基础问题。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 结构类型 | 基于成员而非声明的类型等价 | structural.ts |
| 类型变型 | 协变、逆变与不变的参数化规则 | variance.ts |

---

## 二、设计原理

### 2.1 为什么存在

TypeScript 的设计深受类型理论影响。理解结构类型、子类型和类型推断的理论基础，能帮助开发者预判类型系统的行为并设计更合理的类型架构。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 名义类型 | 错误信息明确 | 灵活性差 | Java/C# 风格 |
| 结构类型 | 鸭子类型灵活 | 意外兼容风险 | TypeScript 风格 |

### 2.3 与相关技术的对比

与 Java/C# 名义类型对比：结构类型更灵活，但错误信息可能较晦涩。

---

## 三、类型理论对比：Hindley-Milner vs 结构类型系统

| 维度 | Hindley-Milner（HM） | TypeScript 结构类型 |
|------|---------------------|---------------------|
| **理论基础** | 基于 **λ 演算** 的完整类型推断系统 | 基于 **集合论子类型关系** 的实用类型系统 |
| **类型推断** | **全局、完整、最一般化**（Principal Type） | **局部、启发式、上下文敏感**（基于赋值和控制流） |
| **显式注解** | 可完全无注解（ML/Haskell 风格） | 边界/递归/重载场景需显式注解 |
| **类型等价** | 名义 + 参数化（代数数据类型） | **结构等价**（成员兼容性） |
| **子类型支持** | 无原生子类型（ML）/ 通过类型类（Haskell） | **核心机制**，基于宽度/深度子类型 |
| **泛型机制** | 参数多态（Parametric Polymorphism） | 参数多态 + 约束多态（`extends`） |
| **类型可操作性** | 受限（无类型级编程） | **极强**（条件类型、映射类型、模板字面量类型） |
| **类型安全性** | **健全（Sound）**：良类型程序不会 stuck | **有意不完整**：为灵活性牺牲部分健全性（如 `any`, 双变函数参数） |
| **soundness 保证** | 编译通过 → 运行时无类型错误 | 编译通过 ≠ 运行时无类型错误（设计权衡） |
| **代表语言** | ML, Haskell, Elm, F#（部分） | TypeScript, Flow |
| **最佳场景** | 学术/函数式编程、高可靠性系统 | 大型工业级 JS 代码库、渐进式类型化 |

> **核心洞察**：
>
> - **Hindley-Milner** 追求**类型系统的数学完备性**：给定程序，算法 W 可自动推断出最一般的（principal）类型，无需任何注解。代价是表达能力受限（如不支持子类型）。
> - **TypeScript 结构类型** 追求**工程实用性**：允许逐步迁移 JavaScript，支持复杂的类型级元编程，接受 `any` 等逃逸舱口。代价是放弃全局完备推断和部分 soundness。

---

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 类型理论基础 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 代码示例：类型推断与类型级编程

#### 4.2.1 Hindley-Milner 风格的类型推断（TypeScript 模拟）

```typescript
// type-inference-hm-style.ts
// 模拟 HM 系统的核心类型推断概念

// ===== 基础类型 =====
type TInt = { kind: 'Int' };
type TBool = { kind: 'Bool' };
type TStr = { kind: 'String' };

// 类型变量（对应 HM 中的类型变量 α, β...）
type TVar<N extends string> = { kind: 'Var'; name: N };

// 函数类型（对应 HM 中的 arrow type: α → β）
type TFun<A, B> = { kind: 'Fun'; arg: A; ret: B };

// ===== TypeScript 的局部推断 =====

// HM 中可自动推断为 Int → Int
const double = (x: number) => x * 2;
// TypeScript 推断: (x: number) => number

// HM 中可自动推断为 α → α（多态/泛化）
const identity = <T>(x: T) => x;
// TypeScript 推断: <T>(x: T) => T

// HM 中可自动推断为 (α → β) → (α → β)
const apply = <A, B>(f: (x: A) => B) => (x: A) => f(x);
// TypeScript 推断: <A, B>(f: (x: A) => B) => (x: A) => B

// ===== 递归类型推断 =====
// HM 系统处理递归需显式 fixpoint 或 letrec
// TypeScript 可通过条件类型递归实现

type Length<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R]
  ? 1 + Length<R>
  : 0;

type L3 = Length<[1, 2, 3]>; // 推断为 3
type L0 = Length<[]>;        // 推断为 0

// ===== 树遍历的类型级推断 =====
interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

// TypeScript 可推断递归结构的深度类型
type TreeDepth<T> = T extends TreeNode<infer V>
  ? 1 + Max<
      T['left'] extends TreeNode<V> ? TreeDepth<T['left']> : 0,
      T['right'] extends TreeNode<V> ? TreeDepth<T['right']> : 0
    >
  : 0;

type Max<A extends number, B extends number> = [A, B] extends [infer X, infer Y]
  ? X extends Y ? X : Y extends X ? Y : A // 简化版：实际需数值比较
  : never;
```

#### 4.2.2 结构子类型的形式化表达

```typescript
// structural-subtyping-formal.ts
// 用 TypeScript 类型模拟结构子类型的核心规则

// ===== 宽度子类型（Width Subtyping）=====
// 规则：{ a: A, b: B } <: { a: A }
// （更多属性的类型是更少属性类型的子类型）

interface Wide { a: string; b: number; c: boolean }
interface Narrow { a: string }

const wide: Wide = { a: 'x', b: 1, c: true };
const narrow: Narrow = wide; // ✅ 宽度子类型：Wide <: Narrow

// ===== 深度子类型（Depth Subtyping）=====
// 规则：{ x: { y: A } } <: { x: { y: B } } 当 A <: B
// （嵌套属性的子类型关系递归保持）

interface DeepSub { x: { y: number; z: string } }
interface DeepSuper { x: { y: number } }

const deepSub: DeepSub = { x: { y: 1, z: 'a' } };
const deepSuper: DeepSuper = deepSub; // ✅ 深度子类型

// ===== 函数子类型（Function Subtyping）=====
// 规则：(A → B) <: (C → D) 当 C <: A 且 B <: D
// 参数位置逆变（contravariant），返回位置协变（covariant）

type Animal = { name: string };
type Dog = Animal & { breed: string };

// 参数逆变：接受 Animal 的函数是接受 Dog 的函数的子类型
let animalHandler: (a: Animal) => void = (a) => console.log(a.name);
let dogHandler: (d: Dog) => void = (d) => console.log(d.breed);

animalHandler = dogHandler; // ❌ 错误：参数位置需逆变
dogHandler = animalHandler; // ✅ 正确：(Animal → void) <: (Dog → void)

// 返回协变：返回 Dog 的函数是返回 Animal 的函数的子类型
let makeAnimal: () => Animal = () => ({ name: 'Generic' });
let makeDog: () => Dog = () => ({ name: 'Buddy', breed: 'Labrador' });

makeAnimal = makeDog; // ✅ 正确：(Dog → Dog) 的返回可替换为 Animal
// makeDog = makeAnimal; // ❌ 错误：缺少 breed

// ===== TypeScript 4.7+ 显式变型修饰符 =====
interface Covariant<out T> {
  getValue(): T;
}

interface Contravariant<in T> {
  consume(value: T): void;
}

interface Invariant<in out T> {
  getValue(): T;
  consume(value: T): void;
}

const cov: Covariant<Dog> = { getValue: () => ({ name: 'x', breed: 'y' }) };
const covAnimal: Covariant<Animal> = cov; // ✅ out 修饰符允许协变
```

#### 4.2.3 类型级编程：条件类型与映射类型

```typescript
// type-level-programming.ts
// TypeScript 的类型级计算能力远超 HM 系统

// ===== 路径类型推断 =====
type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}` | `${K}.${Path<T[K]>}`
    : `${K}`
  : never;

interface User {
  id: number;
  profile: {
    name: string;
    address: {
      city: string;
      zip: number;
    };
  };
}

type UserPaths = Path<User>;
// "id" | "profile" | "profile.name" | "profile.address" | "profile.address.city" | "profile.address.zip"

// ===== 深度 Partial / Required =====
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object | undefined ? DeepRequired<NonNullable<T[P]>> : T[P];
};

// ===== 类型安全的 EventEmitter =====
type EventMap = Record<string, any[]>;

interface TypedEmitter<Events extends EventMap> {
  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean;
}

// 使用
type MyEvents = {
  'user:login': [userId: number, timestamp: Date];
  'user:logout': [userId: number];
  'error': [error: Error, context: string];
};

const emitter: TypedEmitter<MyEvents> = createEmitter();
emitter.on('user:login', (id, ts) => {
  // id: number, ts: Date — 自动推断
  console.log(`User ${id} logged in at ${ts.toISOString()}`);
});
// emitter.emit('user:login', 'wrong'); // ❌ 编译错误：参数类型不匹配
```

### 4.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| TypeScript 使用名义类型 | TS 是结构类型系统，不依赖声明名称 |
| any 是安全的顶层类型 | any 会关闭类型检查，应避免滥用 |
| TypeScript 类型系统是完全 sound 的 | TS 有意为灵活性牺牲部分 soundness（如 `any`, 函数参数双变） |
| 类型推断等价于 Hindley-Milner | TS 使用局部上下文敏感推断，非全局 HM 算法 W |

### 4.4 扩展阅读

- [TAPL (Types and Programming Languages)](https://www.cis.upenn.edu/~bcpierce/tapl/) — Benjamin Pierce 类型理论经典教材
- `20.10-formal-verification/type-theory-formal/`

---

## 五、权威参考链接

- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — TypeScript 官方类型兼容性文档
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — 泛型与子类型关系
- [TypeScript Handbook: Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) — typeof 类型操作符
- [TypeScript 4.7: Variance Annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters) — 显式变型修饰符
- [Hindley-Milner Type Inference (Wikipedia)](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) — HM 系统百科
- [TAPL Official Site](https://www.cis.upenn.edu/~bcpierce/tapl/) — Benjamin Pierce 《Types and Programming Languages》
- [The Evolution of TypeScript's Type System](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html) — TypeScript 面向对象背景开发者指南
- [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges) — 类型体操练习集，深入理解类型级编程
- [ECMA-262: The Type System of JavaScript](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values) — ECMAScript 运行时数据类型规范
- [Composable Type-Safe SQL in TypeScript (Drizzle)](https://orm.drizzle.team/docs/overview) — 类型安全 SQL 的实践前沿

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
