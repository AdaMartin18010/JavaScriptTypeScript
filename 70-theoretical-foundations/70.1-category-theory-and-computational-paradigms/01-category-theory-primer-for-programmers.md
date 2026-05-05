---
title: "程序员视角的范畴论基础"
description: "为 JS/TS 开发者建立范畴论直觉，从编程实践中的重复模式自然浮现抽象概念"
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~9000 words
english-abstract: "This paper presents a comprehensive programmer-oriented primer on category theory, establishing the mathematical foundations required for subsequent formal analyses of JavaScript and TypeScript systems. The theoretical contribution lies in reconstructing fundamental categorical concepts—including objects, morphisms, functors, natural transformations, and monads—from recurrent everyday programming patterns such as function composition, Array.map, and Promise chains, demonstrating that these abstract mathematical structures are not alien to practical software development but emerge naturally from repeated idioms. Methodologically, each concept is introduced through carefully constructed intuition analogies backed by runnable TypeScript examples, followed by rigorous boundary case analysis and counter-examples that clarify exactly when categorical intuition productively applies and when it encounters meaningful limitations. The engineering value enables practicing developers to recognize deep structural similarities across seemingly unrelated APIs, design more composable and reusable libraries, and reason about type-safe transformations using functor laws and compositional principles derived directly from category theory. By grounding abstract mathematics in familiar code patterns, the paper effectively lowers the barrier to formal reasoning for working programmers without sacrificing mathematical precision."
references:
  - Awodey, Category Theory (2nd ed., 2010)
  - Pierce, Basic Category Theory for Computer Scientists (1991)
  - Milewski, Category Theory for Programmers (2019)
---

> **Executive Summary** (English): This paper establishes category-theoretic intuition for JavaScript/TypeScript developers by grounding abstract concepts in everyday programming patterns. Rather than presenting definitions axiomatically, it reconstructs categorical structures—categories, functors, natural transformations, and monads—from recurrent code patterns such as function composition, Array.map, and Promise chains. The theoretical contribution is a pedagogical bridge between practical JS/TS idioms and rigorous category theory, demonstrating that TypeScript's type system, generic containers, and pipeline operators are concrete instances of categorical abstractions. Methodologically, each concept is introduced via a 'precise intuition analogy' backed by runnable TypeScript examples, followed by boundary case analysis (counter-examples) that clarifies when categorical intuition fails. The engineering value lies in enabling developers to recognize structural similarities across seemingly unrelated APIs, design more composable libraries, and reason about type-safe transformations using the functor laws and compositional principles derived from category theory.

# 程序员视角的范畴论基础

> **理论深度**: 入门级（为后续章节建立共同语言）
> **目标读者**: 有 JS/TS 经验的开发者，无范畴论背景
> **建议阅读时间**: 60 分钟
> **核心目标**: 理解"为什么数学家要发明这些概念"，而非背诵定义

---

## 目录

- [程序员视角的范畴论基础](#程序员视角的范畴论基础)
  - [目录](#目录)
  - [0. 从一段重复的代码开始](#0-从一段重复的代码开始)
  - [1. 范畴：不是新发明，是对旧模式的命名](#1-范畴不是新发明是对旧模式的命名)
    - [1.1 函数组合：你每天都在用，只是没叫它"态射组合"](#11-函数组合你每天都在用只是没叫它态射组合)
    - [1.2 为什么数学家要发明"范畴"这个概念](#12-为什么数学家要发明范畴这个概念)
    - [1.3 范畴的四个组成部分：用代码说话](#13-范畴的四个组成部分用代码说话)
    - [1.4 两条公理：结合律与单位律的编程直觉](#14-两条公理结合律与单位律的编程直觉)
  - [2. 程序员已经生活在范畴中](#2-程序员已经生活在范畴中)
    - [2.1 Set 范畴：类型与函数的世界](#21-set-范畴类型与函数的世界)
    - [2.2 Poset 范畴：子类型关系构成的隐形范畴](#22-poset-范畴子类型关系构成的隐形范畴)
    - [2.3 Mon 范畴：字符串拼接、数组追加、数字加法的共同结构](#23-mon-范畴字符串拼接数组追加数字加法的共同结构)
  - [3. 态射的分类：用"可逆性"理解映射](#3-态射的分类用可逆性理解映射)
    - [3.1 单态射 ≈ 无损编码器](#31-单态射--无损编码器)
    - [3.2 满态射 ≈ 全覆盖处理器](#32-满态射--全覆盖处理器)
    - [3.3 同构 ≈ 双向可逆的类型转换](#33-同构--双向可逆的类型转换)
    - [3.4 反例：什么时候"可逆"的直觉会失效](#34-反例什么时候可逆的直觉会失效)
  - [4. 函子：容器的"结构保持映射"](#4-函子容器的结构保持映射)
    - [4.1 从 Array.map 说起：函子的精确直觉](#41-从-arraymap-说起函子的精确直觉)
    - [4.2 Promise.then：异步世界的函子](#42-promisethen异步世界的函子)
    - [4.3 反变函子：箭头方向的反转](#43-反变函子箭头方向的反转)
    - [4.4 违反函子律的代码：一个真实 bug](#44-违反函子律的代码一个真实-bug)
  - [5. 自然变换：不同实现之间的"适配器"](#5-自然变换不同实现之间的适配器)
    - [5.1 精确直觉：自然变换 ≈ 与 map 可交换的转换](#51-精确直觉自然变换--与-map-可交换的转换)
    - [5.2 Array.flat 的自然性证明](#52-arrayflat-的自然性证明)
    - [5.3 reverse 不是自然变换：一个重要的反例](#53-reverse-不是自然变换一个重要的反例)
  - [6. 范畴论视角下的编程概念重构](#6-范畴论视角下的编程概念重构)
    - [6.1 管道（Pipeline）= 组合的可视化语法糖](#61-管道pipeline-组合的可视化语法糖)
    - [6.2 泛型 = 多态态射](#62-泛型--多态态射)
    - [6.3 类型系统 = 程序的"编译期范畴"](#63-类型系统--程序的编译期范畴)
  - [7. 过度抽象的风险与范畴论的局限性](#7-过度抽象的风险与范畴论的局限性)
    - [7.1 不是所有代码都需要范畴论语言](#71-不是所有代码都需要范畴论语言)
    - [7.2 TS 类型系统不是严格的范畴](#72-ts-类型系统不是严格的范畴)
    - [7.3 范畴论模型的盲区](#73-范畴论模型的盲区)
  - [8. 通往深层理论的路径](#8-通往深层理论的路径)
  - [参考文献](#参考文献)

---

## 0. 从一段重复的代码开始

想象你正在维护一个数据处理管道。你写了这样的代码：

```typescript
// 没有抽象的时代：每个容器都要手写转换逻辑
function doubleNumbers(arr: number[]): number[] {
  const result: number[] = [];
  for (const x of arr) {
    result.push(x * 2);
  }
  return result;
}

function stringifyNumbers(arr: number[]): string[] {
  const result: string[] = [];
  for (const x of arr) {
    result.push(x.toString());
  }
  return result;
}

// Promise 版本也要重写一遍
async function doublePromises(arr: Promise<number>[]): Promise<number[]> {
  const result: number[] = [];
  for (const p of arr) {
    result.push((await p) * 2);
  }
  return result;
}
```

你感到一种重复——不是代码的重复，是**模式的重复**。三个函数共享同一个结构："打开容器，对每个元素应用函数，把结果装回去"。

范畴论的本质就是**识别并命名这种模式**。数学家发现，这种模式在数学中无处不在（集合上的映射、向量空间上的线性变换、拓扑空间上的连续函数），于是他们发明了一个统一的语言来描述它。**范畴论不是从天上掉下来的抽象，而是从千万个具体例子中提炼出的共同结构。**

---

## 1. 范畴：不是新发明，是对旧模式的命名

### 1.1 函数组合：你每天都在用，只是没叫它"态射组合"

你每天都在写函数组合：

```typescript
// 方式一：嵌套调用
const result = saveToDB(validate(parseJSON(requestBody)));

// 方式二：链式调用（也是组合）
const result2 = requestBody
  .pipe(parseJSON)
  .pipe(validate)
  .pipe(saveToDB);
```

数学家看了这段代码，会说："你在态射组合"。他们把这个操作记作 $g \circ f$，意思是"先执行 $f$，再执行 $g$"。

```typescript
// 用 TypeScript 显式写出组合
const compose = <A, B, C>(g: (b: B) => C, f: (a: A) => B) =>
  (a: A): C => g(f(a));

const pipeline = compose(saveToDB, compose(validate, parseJSON));
```

**精确直觉类比**：态射组合 ≈ 函数的"管道连接"。两个函数能组合，当前者的输出类型等于后者的输入类型时。就像水管接口必须匹配一样。

### 1.2 为什么数学家要发明"范畴"这个概念

20世纪40年代，数学家们面临一个问题：拓扑学、代数学、逻辑学各自发展出了一套"把结构A映射到结构B"的理论，但这些理论在形式上惊人地相似。拓扑学家研究连续映射，代数学家研究同态，逻辑学家研究推导规则——他们是否在做同一件事？

Eilenberg 和 Mac Lane 发明了范畴论来回答这个问题。**范畴论不是拓扑学或代数学的替代品，而是它们的"通用接口"**——就像 TypeScript 的泛型接口 `Transformer<A, B>` 可以描述字符串转换、数字转换、DOM转换一样。

```typescript
// 编程中的类比：不同领域共享同一个接口
interface Transformer<A, B> {
  transform(input: A): B;
}

// 字符串处理实现了 Transformer
class UpperCaser implements Transformer<string, string> {
  transform(s: string) { return s.toUpperCase(); }
}

// 数组处理也实现了 Transformer
class Doubler implements Transformer<number[], number[]> {
  transform(arr: number[]) { return arr.map(x => x * 2); }
}

// 范畴论就是数学界的 "Transformer" 接口
```

### 1.3 范畴的四个组成部分：用代码说话

一个范畴由四部分组成。不要从定义开始理解，从**你已经写过的代码**开始理解：

| 范畴论术语 | 编程直觉 | TypeScript 对应 |
|-----------|---------|----------------|
| **对象** (Object) | 数据的"类型" | `number`, `string`, `UserDTO` |
| **态射** (Morphism) | 从类型 A 到类型 B 的纯函数 | `(a: A) => B` |
| **组合** (Composition) | 函数的管道连接 | `compose(g, f)` |
| **恒等** (Identity) | 什么都不做的函数 | `x => x` |

```typescript
// ========== 对象 ==========
// 对象不是值，是"类型"。范畴论不关心 42 和 43 的区别，
// 它关心的是 number 和 string 作为整体之间的关系。
type User = { id: number; name: string };
type Order = { userId: number; total: number };

// ========== 态射 ==========
// 从 User 到 Order 的态射：提取用户的某个属性或进行转换
const getUserName: (u: User) => string = (u) => u.name;
const createEmptyOrder: (u: User) => Order = (u) => ({
  userId: u.id,
  total: 0
});

// ========== 组合 ==========
// 从 User 到 string，通过 Order 中转
const getOrderSummary: (u: User) => string = (u) => {
  const order = createEmptyOrder(u);
  return `User ${u.name} has order total: ${order.total}`;
};
// 这就是 compose(getOrderSummaryText, createEmptyOrder)

// ========== 恒等 ==========
// 恒等态射：输出和输入完全一样
const idUser: (u: User) => User = (u) => u;
const idString: (s: string) => string = (s) => s;

// 恒等态射的作用：在组合中作为"零元素"
// compose(f, id) === f === compose(id, f)
```

**关键洞察**：范畴论的对象不是值，是类型。态射不是操作，是类型之间的映射关系。这与面向对象编程中"对象是实例"的直觉不同，需要刻意调整。

### 1.4 两条公理：结合律与单位律的编程直觉

范畴论要求组合满足两条定律。不要用"公理"这个词吓唬自己——它们是你已经依赖的编程常识。

**结合律** (Associativity)：

```typescript
// 你从来不会怀疑这个等式：
// (a + b) + c === a + (b + c)

// 函数组合也一样：
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;
const h = (x: number) => x.toString();

// 下面两种方式结果永远相同
const way1 = compose(h, compose(g, f)); // h ∘ (g ∘ f)
const way2 = compose(compose(h, g), f); // (h ∘ g) ∘ f

// 验证
console.log(way1(5) === way2(5)); // true
```

结合律的实质：**组合的顺序由数据依赖决定，与括号怎么放无关**。当你写 `a.pipe(b).pipe(c)` 时，你已经在依赖结合律了。

**单位律** (Identity Laws)：

```typescript
// 恒等函数在组合中"透明"
const process = (x: number): string => x.toString();

// 以下三者等价
const wayA = compose(process, idNumber); // process ∘ id
const wayB = process;                     // process
const wayC = compose(idString, process);  // id ∘ process

const idNumber = (x: number) => x;
const idString = (x: string) => x;

// 这就像是数组操作中的 .filter(() => true) ——什么都没做，但可以占位
```

单位律的实质：**恒等函数是组合的"零元素"**，就像数字加法中的 0、乘法中的 1。它的存在让我们可以讨论"什么都不做"的情况，这对于证明和推导至关重要。

---

## 2. 程序员已经生活在范畴中

### 2.1 Set 范畴：类型与函数的世界

**Set** 是最接近程序员直觉的范畴：

- 对象：集合（TypeScript 中对应"类型"）
- 态射：集合间的函数
- 组合：函数组合
- 恒等：恒等函数

```typescript
// Set 范畴中的态射示例

// 态射 1: number -> string
const numberToString: (n: number) => string = (n) => n.toString();

// 态射 2: string -> number (可能失败，所以用 Option)
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };
const stringToNumber: (s: string) => Option<number> = (s) => {
  const n = parseFloat(s);
  return isNaN(n) ? { tag: 'none' } : { tag: 'some', value: n };
};

// 注意：parseFloat 不是 Set 范畴的态射，因为它的输出类型不确定
// 在严格的 Set 范畴中，态射必须是"全函数"——每个输入都有确定的输出
```

**反例与边界**：TypeScript 的函数不都是 Set 范畴的态射。

```typescript
// 反例 1: 偏函数（Partial Function）
const reciprocal = (x: number): number => 1 / x;
// reciprocal(0) === Infinity，不是真正的"无定义"
// 但在数学中，1/0 根本没有定义

// 反例 2: 有副作用的函数
let counter = 0;
const increment = (): number => { counter++; return counter; };
// 调用 increment() 两次结果不同，违反了"纯函数"假设

// 反例 3: any 类型破坏了集合的清晰边界
const anythingGoes = (x: any): any => x.whatever;
// any 不是具体的集合，它是"所有集合的混乱并集"
```

### 2.2 Poset 范畴：子类型关系构成的隐形范畴

**Poset**（偏序集）是一个特殊的范畴：任意两个对象之间最多只有一个态射。它描述的"关系"不是函数，而是"小于等于"。

TypeScript 的子类型系统就是一个 Poset：

```typescript
// 在 TS 子类型 Poset 中：
// 如果 A 是 B 的子类型（A ≤ B），则存在唯一态射 A -> B

interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

// Dog ≤ Animal：Dog 可以赋值给 Animal
const myDog: Dog = { name: 'Rex', bark: () => {} };
const myAnimal: Animal = myDog; // 这就是 "Dog -> Animal" 的态射

// 反过来不行：Animal 不一定是 Dog
// const myDog2: Dog = myAnimal; // ❌ 编译错误
```

**精确直觉类比**：Poset 范畴 ≈ TypeScript 的子类型层次结构。

- 对象 = 类型
- 态射 = 子类型关系（隐式的类型转换）
- 组合 = 子类型的传递性（如果 A ≤ B 且 B ≤ C，则 A ≤ C）
- 恒等 = 自反性（A ≤ A）

```typescript
// 子类型关系的传递性 = 态射组合
interface Mammal extends Animal {
  warmBlooded: true;
}

// Dog ≤ Mammal ≤ Animal
// 所以存在组合态射 Dog -> Animal
// 这就是 "组合"在 Poset 中的体现
```

**反例**：TypeScript 的子类型关系不是严格的偏序，因为存在递归和交叉类型：

```typescript
// 反例：交叉类型让事情变复杂
type Both = Dog & Mammal;
// Both 同时是 Dog 和 Mammal 的子类型
// 但在严格偏序中，这应该只对应一个唯一的态射
// TS 的类型系统比纯 Poset 更复杂
```

### 2.3 Mon 范畴：字符串拼接、数组追加、数字加法的共同结构

**Mon** 是幺半群（Monoid）的范畴。数学家发现，下面三种操作共享同一个深层结构：

```typescript
// 操作 1: 字符串拼接
const concatStrings = (a: string, b: string): string => a + b;
const emptyString = "";

// 操作 2: 数组追加
const concatArrays = <T>(a: T[], b: T[]): T[] => [...a, ...b];
const emptyArray = <T>(): T[] => [];

// 操作 3: 数字加法
const addNumbers = (a: number, b: number): number => a + b;
const zero = 0;
```

这三个操作都满足：

1. **结合律**：`(a ⊕ b) ⊕ c === a ⊕ (b ⊕ c)`
2. **单位元**：`a ⊕ empty === a === empty ⊕ a`

数学家把这个结构命名为**幺半群**。在范畴论中，幺半群本身可以看作只有一个对象的范畴。

```typescript
// 用 TypeScript 接口抽象幺半群
type Monoid<A> = {
  empty: A;
  concat: (a: A, b: A) => A;
};

// 字符串幺半群
const StringMonoid: Monoid<string> = {
  empty: "",
  concat: (a, b) => a + b
};

// 数组幺半群
const ArrayMonoid = <T>(): Monoid<T[]> => ({
  empty: [],
  concat: (a, b) => [...a, ...b]
});

// 数字加法幺半群
const SumMonoid: Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b
};

// 数字乘法幺半群（单位元是 1）
const ProductMonoid: Monoid<number> = {
  empty: 1,
  concat: (a, b) => a * b
};

// === 通用折叠函数：不需要知道具体是哪个幺半群 ===
const fold = <A>(monoid: Monoid<A>, items: A[]): A =>
  items.reduce(monoid.concat, monoid.empty);

// 用同一个 fold 处理完全不同的数据结构
console.log(fold(StringMonoid, ["a", "b", "c"]));      // "abc"
console.log(fold(ArrayMonoid<number>(), [[1], [2], [3]])); // [1, 2, 3]
console.log(fold(SumMonoid, [1, 2, 3, 4]));              // 10
console.log(fold(ProductMonoid, [2, 3, 4]));             // 24
```

**思维脉络**：程序员先发现 `reduce` 可以统一处理数组聚合，然后发现 `reduce` 本身依赖于"结合律+单位元"的结构，最后发现这个结构就是幺半群。**范畴论把这个发现过程反过来教给你**：先给你幺半群的定义，让你一眼看出所有满足这个定义的代码都可以用同一个抽象处理。

**反例**：不是所有二元操作都是幺半群。

```typescript
// 反例 1: 减法（不满足结合律）
// (5 - 3) - 1 = 1, 但 5 - (3 - 1) = 3

// 反例 2: 平均值（没有合适的单位元）
// avg(a, b) = (a + b) / 2
// avg(avg(2, 4), 6) = avg(3, 6) = 4.5
// avg(2, avg(4, 6)) = avg(2, 5) = 3.5
// 不满足结合律

// 反例 3: 除法（没有单位元能满足 a / 1 = a = 1 / a）
// 1 是右单位元，但不是左单位元
```

---

## 3. 态射的分类：用"可逆性"理解映射

### 3.1 单态射 ≈ 无损编码器

**编程直觉**：单态射 (Monomorphism) 是"不会把两个不同的输入压缩成同一个输出"的函数。

```typescript
// 单态射示例：不同的输入一定产生不同的输出
const encodeUserId: (id: number) => string = (id) => `user_${id}`;
// encodeUserId(1) === "user_1"
// encodeUserId(2) === "user_2"
// 如果 encodeUserId(a) === encodeUserId(b)，则 a === b

// 非单态射示例：信息损失了
const getFirstName: (fullName: string) => string = (fullName) =>
  fullName.split(' ')[0];
// getFirstName("John Smith") === "John"
// getFirstName("John Doe") === "John"
// 两个不同的输入产生了相同的输出

// === 实际应用：数据验证中的单态射检查 ===
// 在设计数据库 schema 时，你实际上在问：
// "这个映射是不是单态射？"如果是，它可以作为主键。

interface RawRecord {
  email: string;
  name: string;
  age: number;
}

// 错误的映射（不是单态射：多人可能同名）
const byName = (r: RawRecord) => r.name;

// 正确的映射（是单态射：email 唯一标识用户）
const byEmail = (r: RawRecord) => r.email;

// 类型系统层面的"单射性"验证
type IsInjective<F extends (x: any) => any> =
  F extends (x: infer X) => infer Y ? true : false;
// 注：TS 类型系统无法在运行时验证单射性，这是范畴论模型的局限
```

### 3.2 满态射 ≈ 全覆盖处理器

**编程直觉**：满态射 (Epimorphism) 是"输出空间被完全覆盖"的函数。对于每一个可能的输出，至少有一个输入能映射到它。

```typescript
// 满态射示例（在限定域上）
const modulo10: (n: number) => number = (n) => n % 10;
// 如果我们只关心输出域 {0, 1, 2, ..., 9}：
// 每个数字 0-9 都有无限多个输入映射到它
// 所以 modulo10 在输出域 0-9 上是满射

// 非满态射示例
const toPositive: (n: number) => number = (n) => Math.abs(n);
// 输出域中的负数永远不会出现
// -5 没有对应的输入（因为没有数字的绝对值是 -5）

// === 实际应用：API 设计中的满射性 ===
// 如果一个 API 响应类型声明了 5 种状态，
// 但服务器只返回 3 种，那你的 "serverResponse -> status" 映射
// 就不是满态射——类型系统被骗了。

type Status = 'pending' | 'success' | 'error' | 'timeout' | 'cancelled';

// 假设这是后端实际返回的
function mapLegacyStatus(code: number): Status {
  if (code === 0) return 'success';
  if (code === 1) return 'error';
  return 'pending'; // timeout 和 cancelled 永远不会出现
}
// 这不是满态射，导致下游代码可能写了永远无法到达的分支
```

### 3.3 同构 ≈ 双向可逆的类型转换

**编程直觉**：同构 (Isomorphism) 是"信息无损的双向转换"。两个对象同构，意味着它们有完全相同的结构，只是表示方式不同。

```typescript
// 同构示例 1: 点坐标的不同表示
interface Cartesian { x: number; y: number; }
interface Polar { r: number; theta: number; }

const toPolar = (c: Cartesian): Polar => ({
  r: Math.sqrt(c.x ** 2 + c.y ** 2),
  theta: Math.atan2(c.y, c.x)
});

const toCartesian = (p: Polar): Cartesian => ({
  x: p.r * Math.cos(p.theta),
  y: p.r * Math.sin(p.theta)
});

// 验证同构：toCartesian(toPolar(c)) ≈ c
const original: Cartesian = { x: 3, y: 4 };
const roundTripped = toCartesian(toPolar(original));
console.log(
  Math.abs(original.x - roundTripped.x) < 1e-10 &&
  Math.abs(original.y - roundTripped.y) < 1e-10
); // true（浮点误差内）

// 同构示例 2: 日期字符串和 Date 对象
const isoToDate = (s: string): Date => new Date(s);
const dateToIso = (d: Date): string => d.toISOString();

// 注意：这不是严格的同构，因为 Date 丢失了时区信息！
// dateToIso(isoToDate("2024-01-01T00:00:00+08:00"))
// 会返回 UTC 时间，不是原来的字符串

// === 真正的同构示例 3: Record 和 Map ===
// 在键为 string 的情况下，Record<K, V> 和 Map<K, V> 是同构的
const recordToMap = <V>(record: Record<string, V>): Map<string, V> =>
  new Map(Object.entries(record));

const mapToRecord = <V>(map: Map<string, V>): Record<string, V> =>
  Object.fromEntries(map.entries());

const originalRecord = { a: 1, b: 2 };
console.log(
  JSON.stringify(mapToRecord(recordToMap(originalRecord))) ===
  JSON.stringify(originalRecord)
); // true
```

### 3.4 反例：什么时候"可逆"的直觉会失效

```typescript
// 反例 1: JSON.stringify 不是同构
const obj = { a: 1, date: new Date() };
const str = JSON.stringify(obj);
const revived = JSON.parse(str);
// revived.date 是字符串 "2024-..."，不是 Date 对象
// 信息丢失了！

// 反例 2: 浮点数运算破坏了同构
const encode = (x: number): number => x * 0.1;
const decode = (x: number): number => x / 0.1;
console.log(decode(encode(0.3)) === 0.3); // false！
// 0.3 * 0.1 / 0.1 ≠ 0.3（浮点精度问题）

// 反例 3: TypeScript 的运行时类型擦除
const serializeUser = (u: { name: string; age: number }): string =>
  JSON.stringify(u);
// 反序列化后丢失了类型信息
// 这是 TS 类型系统与运行时之间的"不同构"

// 反例 4: 范畴论中，满态射+单态射 ≠ 同构（在某些范畴中）
// 在 Set 范畴中，单+满=同构。但在其他范畴中不一定。
// 这与编程中"双向映射看起来可逆但实际上有坑"的情况类似
```

---

## 4. 函子：容器的"结构保持映射"

### 4.1 从 Array.map 说起：函子的精确直觉

你已经无数次写过 `arr.map(f)`。范畴论会问："`map` 有什么特别的性质，让它能统一出现在 Array、Promise、Option、Tree 中？"

**精确直觉类比**：函子 ≈ "容器的结构保持映射"。

不是"容器"这个词的字面意思。更精确地说：**函子是一个"把函数提升（lift）到容器层面"的机制**，且这个提升保持组合结构。

```typescript
// ========== 没有函子抽象时 ==========
// 你需要为每种容器、每种变换写重复代码

// 数组版本
function processNumbers(arr: number[]): string[] {
  const result: string[] = [];
  for (const n of arr) {
    result.push(n.toString());
  }
  return result;
}

// 树版本（假设有 Tree 结构）
interface Tree<A> {
  tag: 'leaf' | 'node';
  value?: A;
  left?: Tree<A>;
  right?: Tree<A>;
}

function processTreeNumbers(tree: Tree<number>): Tree<string> {
  if (tree.tag === 'leaf') {
    return { tag: 'leaf', value: tree.value?.toString() };
  }
  return {
    tag: 'node',
    left: tree.left ? processTreeNumbers(tree.left) : undefined,
    right: tree.right ? processTreeNumbers(tree.right) : undefined
  };
}

// Option 版本
type Option<A> = { tag: 'some'; value: A } | { tag: 'none' };
function processOptionNumber(opt: Option<number>): Option<string> {
  if (opt.tag === 'none') return { tag: 'none' };
  return { tag: 'some', value: opt.value.toString() };
}
```

所有三个函数的结构完全相同："如果容器里有值，对值应用函数；如果容器是空的/叶子的，保持容器形状"。函子就是把这个模式抽象出来。

```typescript
// ========== 有了函子抽象后 ==========
// 通用的 Functor 接口
interface Functor<F> {
  map<A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B>;
}

// HKT (Higher-Kinded Type) 在 TS 中需要技巧模拟
type HKT<F, A> = any; // 简化表示

// 实际实现：每个容器提供自己的 map
const ArrayFunctor = {
  map: <A, B>(arr: A[], f: (a: A) => B): B[] => arr.map(f)
};

const OptionFunctor = {
  map: <A, B>(opt: Option<A>, f: (a: A) => B): Option<B> =>
    opt.tag === 'none' ? { tag: 'none' } : { tag: 'some', value: f(opt.value) }
};

const TreeFunctor = {
  map: <A, B>(tree: Tree<A>, f: (a: A) => B): Tree<B> => {
    if (tree.tag === 'leaf') {
      return { tag: 'leaf', value: tree.value === undefined ? undefined : f(tree.value) };
    }
    return {
      tag: 'node',
      left: tree.left ? TreeFunctor.map(tree.left, f) : undefined,
      right: tree.right ? TreeFunctor.map(tree.right, f) : undefined
    };
  }
};

// 现在可以写通用的处理逻辑
const toString = (n: number): string => n.toString();

const arrResult = ArrayFunctor.map([1, 2, 3], toString);
const optResult = OptionFunctor.map({ tag: 'some', value: 42 }, toString);
const treeResult = TreeFunctor.map(
  { tag: 'leaf', value: 42 },
  toString
);
```

**函子律**（Functor Laws）不是额外的约束，它们是"map 不破坏容器结构"的数学表达：

```typescript
// 律 1: 恒等律 —— map 一个什么都不做的函数，应该也什么都不做
const arr = [1, 2, 3];
const id = <A>(x: A): A => x;
console.log(
  JSON.stringify(arr.map(id)) === JSON.stringify(arr)
); // true

// 律 2: 组合律 —— 连续 map 两个函数，等于 map 它们的组合
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;

const way1 = arr.map(x => g(f(x)));    // map (g ∘ f)
const way2 = arr.map(f).map(g);        // map g ∘ map f

console.log(
  JSON.stringify(way1) === JSON.stringify(way2)
); // true

// 违反律 2 的真实 bug：
class BadArray<T> extends Array<T> {
  map<U>(f: (t: T) => U): BadArray<U> {
    const result = new BadArray<U>();
    for (let i = 0; i < this.length; i++) {
      result.push(f(this[i]));
    }
    result.push(undefined as U); // 偷偷多加了一个元素！
    return result;
  }
}

const bad = new BadArray(1, 2, 3);
const badWay1 = bad.map(x => g(f(x)));
const badWay2 = bad.map(f).map(g);
console.log(badWay1.length === badWay2.length); // false！违反了函子律
```

### 4.2 Promise.then：异步世界的函子

Promise.then 也是函子，但它的"容器"含义更抽象：Promise 是一个"将来会有值的容器"。

```typescript
// Promise 作为函子
// F(A) = Promise<A>
// F(f) = promise.then(f)

const p = Promise.resolve(5);

// 律 1: 恒等律
Promise.resolve(42).then(x => x); // Promise<42> ✅

// 律 2: 组合律
const f = (x: number) => x + 1;
const g = (x: number) => x.toString();

const way1 = Promise.resolve(5).then(x => g(f(x)));
const way2 = Promise.resolve(5).then(f).then(g);

// 两者最终都产生 Promise<"6">
Promise.all([way1, way2]).then(([a, b]) => {
  console.log(a === b); // true
});

// === 实际编程价值 ===
// 函子律保证了你可以自由重构代码：
// 把 .then(f).then(g) 合并为 .then(x => g(f(x))) 不会改变语义
// 或者反过来拆分，用于调试和复用中间结果
```

### 4.3 反变函子：箭头方向的反转

**精确直觉**：反变函子 (Contravariant Functor) 是"前置处理器"的抽象。当你需要把函数参数类型从 `Animal` 改为 `Dog` 时，箭头方向反转了。

```typescript
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

// 如果 Dog ≤ Animal（Dog 是 Animal 的子类型）
// 那么 Handler<Animal> ≤ Handler<Dog>
// 箭头方向反转了！

type Handler<A> = (a: A) => void;

const handleAnimal: Handler<Animal> = (a) => console.log(a.name);
const handleDog: Handler<Dog> = handleAnimal; // ✅ 合法

// 为什么？因为 handleAnimal 只需要 .name
// 任何 Dog 都有 .name，所以 handleAnimal 可以安全地处理 Dog

// 比较器也是反变函子
type Comparator<A> = (a1: A, a2: A) => number;

const compareAnimals: Comparator<Animal> = (a, b) =>
  a.name.localeCompare(b.name);

const compareDogs: Comparator<Dog> = compareAnimals; // ✅ 合法
// 按 Animal 的标准比较 Dog 是完全可行的

// === 对比：协变 vs 反变 ===
// 返回值位置是协变（子类型方向相同）
type Producer<A> = () => A;
const dogProducer: Producer<Dog> = () => ({ name: 'Rex', bark: () => {} });
const animalProducer: Producer<Animal> = dogProducer; // ✅ Dog -> Animal

// 参数位置是反变（子类型方向反转）
// (Animal -> void) 可以赋值给 (Dog -> void)
// 因为 Dog 比 Animal "小"，但 Dog 的处理器比 Animal 的处理器 "大"
```

### 4.4 违反函子律的代码：一个真实 bug

```typescript
// 反例：一个看起来合理的 "map" 实现，实际上违反了函子律

class LoggingArray<T> {
  constructor(private items: T[]) {}

  map<U>(f: (t: T) => U): LoggingArray<U> {
    console.log(`Mapping ${this.items.length} items`);
    return new LoggingArray(this.items.map(f));
  }
}

// 问题：LoggingArray.map 在每次调用时都有副作用（打印日志）
// arr.map(f).map(g) 会打印两次，但 arr.map(x => g(f(x))) 只打印一次
// 这在纯函数范畴中破坏了等式

// 另一个更隐蔽的违反：
class CachedMap<K, V> extends Map<K, V> {
  private mapCount = 0;

  override map?  // Map 没有 map 方法，但假设我们添加一个
  // 如果我们实现一个带缓存的 map：
  transform<U>(f: (v: V) => U): CachedMap<K, U> {
    this.mapCount++;
    const result = new CachedMap<K, U>();
    for (const [k, v] of this) {
      // 假设我们实现了缓存逻辑...
      result.set(k, f(v));
    }
    return result;
  }
}

// 最严重的情况：Set 上的 "map"
// Set 天然地不满足函子律，因为 map 可能改变集合大小！
const set = new Set([1, 2, 3]);
// 如果我们有 set.map(x => x % 2)
// 结果会是 Set(0, 1) —— 大小从 3 变成 2
// set.map(f).map(g) 和 set.map(x => g(f(x))) 的结果可能完全不同
// 因为去重发生在不同的阶段
```

---

## 5. 自然变换：不同实现之间的"适配器"

### 5.1 精确直觉：自然变换 ≈ 与 map 可交换的转换

你已经见过自然变换，只是没叫它这个名字。`Array.prototype.flat` 就是一个自然变换。

**精确直觉**：自然变换是两个函子之间的"结构保持转换"。它不仅转换了容器类型，还保证"先转换容器再 map"与"先 map 再转换容器"结果相同。

```typescript
// flatten: Array<Array<A>> -> Array<A> 是自然变换

// 自然性条件图示：
//  Array<Array<A>> --map(map(f))--> Array<Array<B>>
//       | flatten                           | flatten
//       v                                   v
//  Array<A> --------map(f)----------> Array<B>
//
// 要求：下路径 == 右路径

const flatten = <A>(arr: A[][]): A[] => arr.flat();

const f = (x: number) => x.toString();
const nested = [[1, 2], [3, 4]];

// 路径 1: 先 flatten，再 map
const path1 = flatten(nested).map(f);
// [1, 2, 3, 4].map(f) -> ["1", "2", "3", "4"]

// 路径 2: 先 map(map(f))，再 flatten
const path2 = flatten(nested.map(inner => inner.map(f)));
// flatten([["1", "2"], ["3", "4"]]) -> ["1", "2", "3", "4"]

console.log(JSON.stringify(path1) === JSON.stringify(path2)); // true ✅
```

### 5.2 Array.flat 的自然性证明

```typescript
// 更系统的验证：定义一个测试框架来验证自然性

function checkNaturality<A, B>(
  nested: A[][],
  f: (a: A) => B,
  transform: <T>(x: T[][]) => T[],
  map: <X, Y>(xs: X[], g: (x: X) => Y) => Y[]
): boolean {
  // 下路径: transform ∘ map(map(f))
  const lowerPath = map(transform(nested), f);
  // 右路径: map(f) ∘ transform
  const rightPath = transform(nested.map(inner => inner.map(f)));

  return JSON.stringify(lowerPath) === JSON.stringify(rightPath);
}

// 验证 flatten 的自然性
console.log(checkNaturality(
  [[1, 2], [3, 4]],
  x => x * 2,
  (x) => x.flat(),
  (xs, g) => xs.map(g)
)); // true

// === 另一个自然变换示例：Promise.all ===
// Promise.all: (Promise<A>[]) -> Promise<A[]>

const promises = [Promise.resolve(1), Promise.resolve(2)];

// 自然性：Promise.all ∘ map(map(f)) === map(f) ∘ Promise.all
// 注意这里的 map 是 Promise.then
const path1_all = Promise.all(promises).then(arr => arr.map(f));
const path2_all = Promise.all(promises.map(p => p.then(f)));

Promise.all([path1_all, path2_all]).then(([a, b]) => {
  console.log(JSON.stringify(a) === JSON.stringify(b)); // true ✅
});
```

### 5.3 reverse 不是自然变换：一个重要的反例

```typescript
// reverse 看起来很像自然变换，但它不是！

const reverse = <A>(arr: A[]): A[] => [...arr].reverse();
const f = (x: number) => [x, x]; // number -> number[]

// 自然性要求：reverse(map(f)(arr)) === map(f)(reverse(arr))
const arr = [1, 2, 3];

const left = reverse(arr.map(f));
// [[1,1], [2,2], [3,3]] reversed -> [[3,3], [2,2], [1,1]]

const right = arr.reverse().map(f);
// [3, 2, 1] mapped -> [[3,3], [2,2], [1,1]]

// 等等，这看起来相等？让我们换个 f：
const g = (x: number) => x * 10 + 1; // 不是数组返回

const left2 = reverse(arr.map(g));
// [11, 21, 31] reversed -> [31, 21, 11]

const right2 = arr.reverse().map(g);
// [3, 2, 1] mapped -> [31, 21, 11]

console.log(JSON.stringify(left2) === JSON.stringify(right2)); // true

// 再用一个更巧妙的例子：
const h = (x: number, index: number) => x + index; // 注意：这依赖索引！
// arr.map((x, i) => x + i):
// [1+0, 2+1, 3+2] = [1, 3, 5]
// reversed: [5, 3, 1]

// arr.reverse().map((x, i) => x + i):
// [3, 2, 1] mapped: [3+0, 2+1, 1+2] = [3, 3, 3]
// 完全不同！

// 根本原因：reverse 改变了元素的"上下文"（位置）
// 而 map 可能依赖于这个上下文（索引）
// 所以 reverse 与 "依赖索引的 map" 不可交换

// 但这说明了一个更深层的问题：
// 严格来说，reverse 不是 Array 函子上的自然变换，
// 因为它不保持"带索引的数组"结构。
// 但对于纯值变换（不依赖索引），它看起来像是自然的。
```

**关键洞察**：判断一个转换是不是自然变换，要看它是否与"所有可能的 map"可交换。只要存在一个 map 使得交换律失败，它就不是自然变换。

---

## 6. 范畴论视角下的编程概念重构

### 6.1 管道（Pipeline）= 组合的可视化语法糖

```typescript
// 没有管道抽象时：俄罗斯套娃
const result1 = encodeURIComponent(
  JSON.stringify(
    validateInput(
      parseRequest(req)
    )
  )
);

// 有了管道（用函数组合实现）
const pipe = <A, B, C, D>(
  f: (a: A) => B,
  g: (b: B) => C,
  h: (c: C) => D
) => (a: A): D => h(g(f(a)));

const processRequest = pipe(parseRequest, validateInput, JSON.stringify);
// 等价于：processRequest = stringify ∘ validate ∘ parse

// 或者使用更现代的 pipe 语法（需要自定义）
const result2 = req
  |> parseRequest
  |> validateInput
  |> JSON.stringify
  |> encodeURIComponent;

// 范畴论语义：管道就是态射组合的可读化表示
// f |> g |> h 对应 h ∘ g ∘ f
```

### 6.2 泛型 = 多态态射

```typescript
// 泛型函数 = 对所有类型都"自然"的态射

// id 函数是最简单的自然变换：对所有 A，id_A: A -> A
const id = <A>(x: A): A => x;

// 为什么它是"自然的"？因为它不依赖类型的具体内容
// 无论你是 id<number> 还是 id<string>，行为完全相同

// 另一个例子：常量函数
const constant = <A, B>(b: B) => (_a: A): B => b;
// constant(b) 是一个从任意 A 到 B 的态射

// 对比：非自然的"多态"
const badId = <A>(x: A): A => {
  if (typeof x === 'number') return (x as number + 1) as A; // 违反恒等！
  return x;
};
// 这个函数对 number 和 string 行为不同，不是真正的多态态射
```

### 6.3 类型系统 = 程序的"编译期范畴"

```typescript
// 在 TS 类型系统中：
// 对象 = 类型
// 态射 = 类型之间的可赋值关系 / 函数签名

// 函数类型构造是范畴论中的"指数对象"
// (A -> B) 对应范畴论中的 B^A

// 这解释了为什么 curry 是自然的：
const curry = <A, B, C>(
  f: (a: A, b: B) => C
): (a: A) => (b: B) => C =>
  (a) => (b) => f(a, b);

// curry 建立了同构：
// (A × B -> C) ≅ (A -> (B -> C))
// 即：C^(A×B) ≅ (C^B)^A

// 验证：curry 和 uncurry 互为逆
const uncurry = <A, B, C>(
  f: (a: A) => (b: B) => C
): (a: A, b: B) => C =>
  (a, b) => f(a)(b);

const original = (a: number, b: string): boolean => a.toString() === b;
const curried = curry(original);
const uncurried = uncurry(curried);

console.log(original(42, "42") === uncurried(42, "42")); // true
// curry 和 uncurry 是同构映射！
```

---

## 7. 过度抽象的风险与范畴论的局限性

### 7.1 不是所有代码都需要范畴论语言

```typescript
// 反例：强行用范畴论语言描述简单的业务逻辑

// 正常的业务代码
function getFullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

// 过度抽象的版本
const getFullNameCategory = <A extends { firstName: string; lastName: string }>(
  user: A
): string =>
  [user.firstName, user.lastName]
    .reduce((acc, s) => acc.concat(s), "")
    .replace(/(.+)(.+)/, "$1 $2");
// 这没有带来任何实际价值，只是让代码更难读
```

范畴论的价值在于**识别跨领域的模式**，不在于**替换日常业务代码的写法**。

### 7.2 TS 类型系统不是严格的范畴

```typescript
// 1. any 类型破坏了所有结构
const anything: any = 42;
const alsoAnything: string = anything; // 类型系统失效了

// 2. 子类型关系不是严格的偏序
// string | number 和 number | string 是同一个类型
// 但 TS 的类型系统在某些边缘情况下会表现出非传递性

// 3. 递归类型可能导致无限展开
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
// 这在范畴论中需要特殊的处理方式（极限/余极限）

// 4. 副作用函数不是真正的态射
let globalState = 0;
const impure = (): number => { globalState++; return globalState; };
// impure() !== impure() —— 这不是函数，是过程
```

### 7.3 范畴论模型的盲区

```typescript
// 盲区 1: 性能
// 范畴论只关心"是否相等"，不关心"计算代价"
const sum1 = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
const sum2 = (arr: number[]): number => {
  let total = 0;
  for (const x of arr) total += x;
  return total;
};
// 范畴论说它们"相等"，但性能不同

// 盲区 2: 时间/空间复杂度
// 范畴论不区分 O(n) 和 O(n²) 的算法

// 盲区 3: 错误处理的具体语义
// Either monad 和 try-catch 在范畴论语义上可能相同，
// 但在用户体验、调试、日志记录上完全不同

// 盲区 4: 并发与竞态条件
// 范畴论通常假设"组合顺序不影响结果"
// 但并发代码中，顺序就是一切
let balance = 100;
const withdraw = (amount: number) => { balance -= amount; };
// 两个并发的 withdraw(50) 可能让 balance 变成 0 或 50，
// 取决于执行顺序——范畴论的纯函数假设完全失效
```

---

## 8. 通往深层理论的路径

```
本文件（范畴论基础：对象、态射、函子、自然变换）
    ↓
02-笛卡尔闭范畴与 TypeScript（积、指数、求值 = 元组、函数、调用）
    ↓
03-函子与自然变换深化（协变/反变/双函子、函子组合）
    ↓
04-单子与代数效应（Promise、Array.flatMap、Reader/State）
    ↓
05-极限与余极限（reduce、Promise.all、类型交集/联合）
    ↓
06-伴随函子（自由构造、类型推断）
    ↓
07-Yoneda 引理（"行为决定对象"、API 设计哲学）
    ↓
08-Topos 理论（类型判断、子对象分类器）
```

| 章节 | 核心问题 |
|------|---------|
| 02-CCC | 为什么函数类型 `(A) => B` 对应数学中的"指数" $B^A$？ |
| 03-Functors | Array.map、Promise.then 的函子性在类型系统层面意味着什么？ |
| 04-Monads | Promise 链式调用 vs Rust Result 的深层结构差异 |
| 05-Limits | reduce、Promise.all、merge 共享的"最一般"性质是什么？ |
| 06-Adjunctions | TS 的类型推断为什么能"猜测"出最通用的类型？ |
| 07-Yoneda | 为什么说"一个对象的全部信息都包含在它与其他对象的关系中"？ |
| 08-Topos | 子类型、条件类型、类型守卫的统一理论基础 |

---

## 参考文献

1. Awodey, S. (2010). *Category Theory* (2nd ed.). Oxford University Press.
2. Pierce, B. C. (1991). *Basic Category Theory for Computer Scientists*. MIT Press.
3. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
4. Leinster, T. (2014). *Basic Category Theory*. Cambridge University Press.
5. Riehl, E. (2016). *Category Theory in Context*. Dover Publications.
6. Mac Lane, S. (1998). *Categories for the Working Mathematician* (2nd ed.). Springer.
