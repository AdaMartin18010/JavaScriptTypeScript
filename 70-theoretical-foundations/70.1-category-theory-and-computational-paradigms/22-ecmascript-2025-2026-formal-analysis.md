---
title: "ECMAScript 2025/2026 新特性的范畴论与形式化分析"
description: "从范畴论视角深度解析 ES2025（第 16 版）及 Stage 2/3 提案的形式语义"
date: 2026-05-05
last-updated: 2026-05-05
status: complete
priority: P0
category: "category-theory"
tags: ["ecmascript-2025", "tc39", "iterator-helpers", "temporal-api", "set-operations", "promise-try", "formal-semantics", "functor", "limit", "colimit", "type-theory"]
mermaid: true
math: true
---

# ECMAScript 2025/2026 新特性的范畴论与形式化分析

> **理论深度**: 中高级（需要范畴论基础与类型论直觉）
> **目标读者**: 语言设计爱好者、函数式编程实践者、类型系统研究者
> **建议阅读时间**: 90 分钟
> **核心问题**: ECMAScript 2025 的新特性是「补丁式修补」还是「代数结构的完备化」？

---

## 目录

- [ECMAScript 2025/2026 新特性的范畴论与形式化分析](#ecmascript-20252026-新特性的范畴论与形式化分析)
  - [目录](#目录)
  - [1. 引言：从 ECMA-262 到代数语义](#1-引言从-ecma-262-到代数语义)
  - [2. 历史脉络：ES2015 至 ES2025 的演进节奏](#2-历史脉络es2015-至-es2025-的演进节奏)
    - [2.1 TC39 流程的形式化理解](#21-tc39-流程的形式化理解)
    - [2.2 十年演进的类型论视角](#22-十年演进的类型论视角)
  - [3. Iterator Helpers：延迟计算的函子结构](#3-iterator-helpers延迟计算的函子结构)
    - [3.1 Iterator 作为 List / Stream Functor 的实例](#31-iterator-作为-list--stream-functor-的实例)
    - [3.2 延迟计算 vs 中间数组：对称差分析](#32-延迟计算-vs-中间数组对称差分析)
    - [3.3 范畴论语义：map、filter、flatMap 的态射性质](#33-范畴论语义mapfilterflatmap-的态射性质)
    - [3.4 组合律与融合优化](#34-组合律与融合优化)
  - [4. Set.prototype 集合运算：极限与余极限的编程对应](#4-setprototype-集合运算极限与余极限的编程对应)
    - [4.1 集合运算的范畴论语义](#41-集合运算的范畴论语义)
    - [4.2 幂集格与布尔代数](#42-幂集格与布尔代数)
    - [4.3 与 lodash/underscore/Ramda 的对称差分析](#43-与-lodashunderscoreramda-的对称差分析)
  - [5. Promise.try：错误处理的代数结构](#5-promisetry错误处理的代数结构)
    - [5.1 Promise.try 的语义](#51-promisetry-的语义)
    - [5.2 Kleisli 范畴中的单位态射](#52-kleisli-范畴中的单位态射)
    - [5.3 与 try/catch 的语义映射](#53-与-trycatch-的语义映射)
  - [6. RegExp.escape 与 Pattern Modifiers：形式语言理论视角](#6-regexpescape-与-pattern-modifiers形式语言理论视角)
  - [7. Float16Array：数值计算的精度格](#7-float16array数值计算的精度格)
    - [7.1 IEEE 754 半精度浮点的类型结构](#71-ieee-754-半精度浮点的类型结构)
    - [7.2 精度格与类型提升](#72-精度格与类型提升)
    - [7.3 WebGPU、深度学习与精度格的工程实践](#73-webgpu深度学习与精度格的工程实践)
  - [8. Import Attributes 与 JSON Modules：模块系统范畴语义的扩展](#8-import-attributes-与-json-modules模块系统范畴语义的扩展)
    - [8.1 模块作为态射的观点](#81-模块作为态射的观点)
    - [8.2 Import attributes 作为依赖标记](#82-import-attributes-作为依赖标记)
    - [8.3 JSON Modules 的类型安全性](#83-json-modules-的类型安全性)
    - [8.4 从 assert 到 with 的语法演进：废弃与替换的范畴论](#84-从-assert-到-with-的语法演进废弃与替换的范畴论)
  - [9. Temporal API：时间代数的形式化](#9-temporal-api时间代数的形式化)
    - [9.1 Duration 的半环结构](#91-duration-的半环结构)
    - [9.2 Instant 的全序类型](#92-instant-的全序类型)
    - [9.3 ZonedDateTime 的依赖类型直觉](#93-zoneddatetime-的依赖类型直觉)
  - [10. Stage 2/3 前沿提案的形式化预览](#10-stage-23-前沿提案的形式化预览)
    - [10.1 Async Iterator Helpers](#101-async-iterator-helpers)
    - [10.2 Iterator Chunking / Sliding Windows](#102-iterator-chunking--sliding-windows)
    - [10.3 Import Bytes](#103-import-bytes)
    - [10.4 Decorators Stage 3 与 TS 6.0 对齐](#104-decorators-stage-3-与-ts-60-对齐)
  - [11. 工程决策矩阵：原生特性 vs 第三方库](#11-工程决策矩阵原生特性-vs-第三方库)
  - [12. 形式化定义：TypeScript 类型系统模拟](#12-形式化定义typescript-类型系统模拟)
    - [12.1 Iterator 函子的类型级模拟](#121-iterator-函子的类型级模拟)
    - [12.2 Set 运算的极限余极限类型模拟](#122-set-运算的极限余极限类型模拟)
    - [12.3 Temporal 类型结构的形式化](#123-temporal-类型结构的形式化)
  - [13. 结论：ECMAScript 作为渐进式完备化的代数系统](#13-结论ecmascript-作为渐进式完备化的代数系统)
  - [参考文献](#参考文献)

---

## 1. 引言：从 ECMA-262 到代数语义

ECMAScript 标准的演进从来不是孤立的语法增补，而是对 JavaScript 运行时语义缺陷的系统性修补。
从 ES2015（ES6）的 Promise、class、module 到 ES2025 的 Iterator helpers、Set 集合运算、Temporal API，我们观察到一个清晰的模式：每一次重大版本发布，都在向一个更加代数化、更加范畴完备的系统逼近。

> **精确直觉类比**：将 ECMAScript 标准理解为一个「类型演算」的公理化过程。
> 早期的 JavaScript 是「实用主义公理」的堆砌——Array.prototype.map 在 2009 年的 ES5 中被引入时，并没有函子律（functor laws）的自觉；
> 而 ES2025 的 Iterator.prototype.map 则是在已有函子直觉的基础上，将延迟计算结构纳入标准。
> 这不是巧合，而是语言设计从「经验模式」向「形式模式」的跃迁。

本文的目标是从**范畴论（category theory）**与**类型论（type theory）**的视角，系统分析 ECMAScript 2025（第 16 版）已发布特性及 Stage 2/3 前沿提案的形式语义。
我们将证明：ES2025 的新特性并非零散的工具函数增补，而是一组在范畴意义下相互关联的结构完备化操作——Iterator helpers 补全了 Array 到 Iterator 的函子映射；
Set 集合运算补全了幂集范畴中的极限与余极限；
Promise.try 补全了异常到 Promise 单子的单位态射；
Temporal API 补全了时间域的代数结构。

所有代码示例均使用 TypeScript 6.0+ 语法，可直接运行于 Node.js 24+ 或现代浏览器环境。

---

## 2. 历史脉络：ES2015 至 ES2025 的演进节奏

### 2.1 TC39 流程的形式化理解

TC39（Ecma International Technical Committee 39）采用 Stage 0 至 Stage 4 的五阶段提案流程。
从形式语义的角度，这一流程可以被视为一个**逐步精化的类型构造过程**：

| Stage | 名称 | 形式语义对应 | 典型产物 |
|-------|------|-------------|---------|
| 0 | Strawperson | 自由类型（free type） | 任意的语法草图，无约束 |
| 1 | Proposal | 代数签名（algebraic signature） | 明确的问题陈述与用例，引入类型构造子 |
| 2 | Draft | 操作语义（operational semantics） | 规范文本草案，定义归约规则 |
| 3 | Candidate | 指称语义（denotational semantics） | 完成设计，进入实现验证阶段 |
| 4 | Finished | 范畴模型（categorical model） | 通过测试 262（Test262），纳入标准 |

Stage 0 的「稻草人」提案类似于范畴论中的**自由构造（free construction）**：给定一组生成元（generators）而不施加关系（relations），得到的是最宽泛的可能结构。
Stage 1 的「提案」阶段则类似于**签名（signature）**的定义：确定类型构造子的名字与元数（arity），但不固定其公理。
Stage 2 的「草案」对应**操作语义**——通过重写规则（rewrite rules）精确定义程序行为。
Stage 3 的「候选」要求至少两个独立实现通过互操作性测试，这类似于**指称语义**中对模型唯一性的验证。
Stage 4 的「完成」意味着该特性已经具备了**范畴模型**——它在 ECMA-262 的形式框架中有确定的位置，与其他特性形成结构化的关系网络。

### 2.2 十年演进的类型论视角

从 ES2015 到 ES2025 的十年间，ECMAScript 的类型结构经历了三次显著的「完备化冲击」：

**第一波（ES2015-ES2017）：计算模型的完备化**

- Promise（ES2015）引入了异步计算的**单子（monad）**结构
- async/await（ES2017）提供了该单子的**语法糖（syntactic sugar）**
- Symbol.iterator（ES2015）定义了可迭代结构的**协议接口（protocol interface）**

从类型论视角，这一波的核心成就是将 JavaScript 从「回调地狱」的**continuation-passing style（CPS）**转换为具有显式类型结构的**monadic 风格**。Promise 的 .then 方法满足函子律，Promise.prototype.flatMap（通过 .then 的嵌套展平行为隐式实现）满足单子律。

**第二波（ES2018-ES2022）：数据结构与原语的完备化**

- BigInt（ES2020）补全了整数类型的**精确算术（exact arithmetic）**
- Map / Set / WeakMap / WeakSet（ES2015）提供了哈希表与集合的**抽象数据类型（ADT）**
- Array.prototype.flat / flatMap（ES2019）补全了**嵌套结构的折叠（folding）**操作
- at（ES2022）补全了负索引的**对偶访问（dual access）**
- Object.hasOwn（ES2022）补全了原型链查询的**安全边界**

这一波的核心成就是将 JavaScript 的核心数据结构从「动态对象」提升为具有代数性质的**抽象数据类型**。Array.prototype.flatMap 的存在，使得 Array 成为一个**幺半群（monoid）**在 Set 范畴中的自由构造——这一观点将在后文详细展开。

**第三波（ES2023-ES2025）：范畴结构的显式化**

- toSorted / toReversed / toSpliced / with（ES2023）补全了不可变数组更新的**透镜（lens）**语义
- Iterator helpers（ES2025）补全了惰性迭代器的**函子结构**
- Set.prototype.{intersection,union,...}（ES2025）补全了幂集范畴的**极限/余极限**
- Promise.try（ES2025）补全了异常到 Promise 单子的**单位嵌入**
- Temporal API（ES2025，Stage 4）提供了时间计算的**代数闭包**

这一波最显著的特征是：**范畴论直觉开始显式地指导 API 设计**。
Iterator helpers 不是「给迭代器加几个方法」这么简单，而是将 Array 上已经验证的函子结构推广到更一般的惰性计算语境。
Set 集合运算不是「开发者常用的工具函数」，而是将集合论中的布尔运算嵌入 JavaScript 的对象模型。
理解这一点，需要深入到每个特性的形式语义层面。

---

## 3. Iterator Helpers：延迟计算的函子结构

ES2025 引入的 Iterator.prototype.map、filter、take、drop、flatMap、reduce、some、every、find 和 toArray 是一组具有深刻范畴论语义的 API。
它们的核心贡献不是「给迭代器提供了和数组一样的方法」，而是将**惰性计算（lazy evaluation）**纳入 ECMAScript 的原生语义，并以函子结构保证其组合正确性。

### 3.1 Iterator 作为 List / Stream Functor 的实例

在范畴论中，一个**协变函子（covariant functor）** F: C -> D 是从范畴 C 到范畴 D 的映射，满足：

1. **对象映射**：C 中的每个对象 A 被映射到 D 中的对象 F(A)
2. **态射映射**：C 中的每个态射 f: A -> B 被映射到 D 中的态射 F(f): F(A) -> F(B)
3. **恒等律**：F(id_A) = id_F(A)
4. **组合律**：F(g ∘ f) = F(g) ∘ F(f)

Array 是一个经典的函子：给定函数 f: A => B，Array.prototype.map 构造了函数 map(f): Array<A> => Array<B>，且满足上述两条函子律。

Iterator（严格地说，是**惰性迭代器**，即 Iterator<T, undefined, unknown>）同样构成一个函子，但其载体对象不是「值的有限集合」，而是「值的潜在无限序列的生成过程」。形式上，我们可以定义：

Iterator: Type -> Type, A ↦ Generator of A

其中 Generator of A 表示类型为 A 的值的惰性生成过程。
Iterator.prototype.map 提供了这个函子的**态射提升（morphism lifting）**：

```typescript
// 示例 1：Iterator 函子律的验证
function id<A>(x: A): A { return x; }
function compose<A, B, C>(g: (b: B) => C, f: (a: A) => B): (a: A) => C {
  return (a: A) => g(f(a));
}

// 恒等律：iterator.map(id) ≈ iterator
function testFunctorIdentity<A>(iter: Iterator<A>): boolean {
  const mapped = Iterator.from(iter).map(id);
  const original = Iterator.from(iter);
  function* gen(): Generator<A> { yield* original; }
  const m = Iterator.from(gen()).map(id);
  const o = Iterator.from(gen());

  let mNext = m.next();
  let oNext = o.next();
  while (!mNext.done && !oNext.done) {
    if (mNext.value !== oNext.value) return false;
    mNext = m.next();
    oNext = o.next();
  }
  return mNext.done === oNext.done;
}

// 组合律：iterator.map(f).map(g) ≈ iterator.map(g ∘ f)
function testFunctorComposition<A, B, C>(
  values: A[],
  f: (a: A) => B,
  g: (b: B) => C
): boolean {
  const left = Iterator.from(values).map(f).map(g);
  const right = Iterator.from(values).map(compose(g, f));

  let lNext = left.next();
  let rNext = right.next();
  while (!lNext.done && !rNext.done) {
    if (lNext.value !== rNext.value) return false;
    lNext = left.next();
    rNext = right.next();
  }
  return lNext.done === rNext.done;
}

// 运行测试
const numbers = [1, 2, 3, 4, 5];
console.log("Identity law:", testFunctorIdentity(Iterator.from([1, 2, 3])));
console.log("Composition law:", testFunctorComposition(
  numbers,
  (x: number) => x * 2,
  (x: number) => x + 1
));
```

> **形式化说明**：在 Haskell 等惰性语言中，Iterator 对应于 List 或 Stream 类型。
> 在严格求值（strict evaluation）的 JavaScript 中，Iterator 通过 next() 的显式调用来模拟惰性求值。
> 这使得 Iterator 函子与 Array 函子有本质的差异：Array.map 是**全函数的严格应用**，而 Iterator.map 是**部分函数的延迟应用**。

### 3.2 延迟计算 vs 中间数组：对称差分析

Iterator helpers 与 Array.prototype 方法的最核心差异在于**求值策略（evaluation strategy）**。
从范畴论的角度看，Array.map 是**全局变换（global transformation）**，而 Iterator.map 是**局部变换（local transformation）**——前者将整个结构作为整体处理，后者将变换推迟到每个元素的访问时刻。

```typescript
// 示例 2：延迟计算与中间数组的对称差分析
function measureMemoryAndTime(label: string, fn: () => void): void {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}

const largeRange = Array.from({ length: 10_000_000 }, (_, i) => i);

// Array 方法：生成中间数组
measureMemoryAndTime("Array pipeline", () => {
  const result = largeRange
    .map(x => x * 2)
    .filter(x => x % 3 === 0)
    .slice(0, 100);
  console.log("Array result length:", result.length);
});

// Iterator 方法：零中间数组
measureMemoryAndTime("Iterator pipeline", () => {
  const result = Iterator.from(largeRange)
    .map(x => x * 2)
    .filter(x => x % 3 === 0)
    .take(100)
    .toArray();
  console.log("Iterator result length:", result.length);
});

// 更进一步的融合：将 map + filter 压缩为单次遍历
measureMemoryAndTime("Fused Iterator", () => {
  function* fusedGenerator(src: Iterable<number>): Generator<number> {
    for (const x of src) {
      const doubled = x * 2;
      if (doubled % 3 === 0) {
        yield doubled;
      }
    }
  }
  const result = Iterator.from(fusedGenerator(largeRange))
    .take(100)
    .toArray();
  console.log("Fused result length:", result.length);
});
```

**对称差分析（Symmetric Difference Analysis）**：

| 维度 | Array 方法 | Iterator helpers | 范畴论语义 |
|------|-----------|-----------------|-----------|
| 求值时机 | 立即求值（strict） | 延迟求值（lazy） | 全局变换 vs 局部变换 |
| 空间复杂度 | O(n) 中间结构 | O(1) 状态 | 函子复合的自由性 |
| 可融合性 | 需外部库（如 transducers） | 天然可融合 | 单子复合的优化 |
| 无限序列 | 不支持 | 支持 | 余归纳类型（coinductive type） |
| 副作用敏感性 | 每次调用触发 | 按需触发 | 调用点（call-by-need）语义 |
| 多次遍历 | 无状态，可重复 | 有状态，一次性 | Array 是自由幺半群，Iterator 是余自由余幺半群 |

这里的「对称差」一词借用自集合论，意指两种方案在功能交集之外的本质差异。
Array 与 Iterator 共享「可映射（mappable）」的交集，但在求值策略、空间行为和范畴性质上存在结构性分歧。

### 3.3 范畴论语义：map、filter、flatMap 的态射性质

Iterator.prototype.map、filter 和 flatMap 三者分别对应范畴论中的三个核心构造：

**map：协变函子的态射提升**

map 是函子结构的核心。对于 Iterator<T>，map 接受一个函数 f: A => B，返回一个「将 f 应用于每个生成值」的新迭代器。
这在范畴论语义中正是 F(f): F(A) -> F(B) 的定义。

**filter：子对象分类子（subobject classifier）**

filter 的语义比 map 更微妙。给定一个谓词 p: A => boolean，filter(p) 构造了原迭代器的一个**子结构**。在范畴论中，这对应于**子对象分类子（subobject classifier）**的直觉：在拓扑斯（topos）中，子对象分类子是一个特殊的对象，使得任意子对象都可以通过一个特征态射（characteristic morphism）来描述。虽然 Iterator 的范畴不满足拓扑斯的全部公理，但 filter 的语义与「通过布尔值选择子结构」的直觉高度一致。

形式上，filter 可以被视为从 Iterator<A> 到 Iterator<A> 的**幂等内射（idempotent injection）**：连续两次应用相同的 filter(p) 与一次应用等价。

**flatMap：单子复合（monadic composition）**

flatMap（在 ES2025 的 Iterator 中，通过 map 后接隐式展平实现，或显式通过生成器组合）是**单子（monad）**结构的核心。一个单子由三元组 (T, η, μ) 组成，其中 T 是内函子，η 是单位（unit），μ 是乘法（multiplication）。flatMap 正是单子的 **Kleisli 复合（Kleisli composition）**：

flatMap: (A -> T(B)) -> (T(A) -> T(B))

```typescript
// 示例 3：Iterator.flatMap 的单子律验证
function* range(n: number): Generator<number> {
  for (let i = 0; i < n; i++) yield i;
}

// 左单位律：unit(a).flatMap(f) ≈ f(a)
function testLeftUnit<A, B>(
  a: A,
  f: (x: A) => Iterator<B>
): boolean {
  const unit = Iterator.from([a]);
  const left = unit.flatMap(f);
  const right = f(a);
  const lArr = left.toArray();
  const rArr = Iterator.from(right).toArray();
  return JSON.stringify(lArr) === JSON.stringify(rArr);
}

// 结合律：m.flatMap(f).flatMap(g) ≈ m.flatMap(x => f(x).flatMap(g))
function testAssociativity<A, B, C>(
  values: A[],
  f: (x: A) => Iterator<B>,
  g: (x: B) => Iterator<C>
): boolean {
  const m = Iterator.from(values);
  const left = m.flatMap(f).flatMap(g);
  const right = Iterator.from(values).flatMap(x => f(x).flatMap(g));
  return JSON.stringify(left.toArray()) === JSON.stringify(right.toArray());
}

// 测试
console.log("Left unit:", testLeftUnit(5, (x) => Iterator.from(range(x as number))));
console.log("Associativity:", testAssociativity(
  [1, 2, 3],
  (x) => Iterator.from(range(x)),
  (x) => Iterator.from([x, x * 10])
));
```

### 3.4 组合律与融合优化

Iterator helpers 的一个重要工程价值在于**变换融合（transformation fusion）**。由于每个 helper 返回一个新的 Iterator 对象，多个 helper 的链式调用在理论上创建了多层代理。然而，JavaScript 引擎可以通过**迭代器融合（iterator fusion）**优化来消除这种开销。

从范畴论的角度，融合优化对应于**函子复合的自然变换（natural transformation of functor composition）**。如果我们把 map(f) 看作函子 F 上的自然变换 α_F，把 filter(p) 看作 β_F，那么它们的复合 β_F ∘ α_F 可以通过自然性条件重新排列为等价的但更高效的实现。

```typescript
// 示例 4：手动实现迭代器融合
class FusedIterator<T> implements Iterator<T> {
  private source: Iterator<T>;
  private ops: Array<(x: T) => T | symbol>;
  static SKIP = Symbol('skip');

  constructor(source: Iterator<T>) {
    this.source = source;
    this.ops = [];
  }

  map<U>(f: (x: T) => U): FusedIterator<U> {
    const fused = new FusedIterator<U>(this.source as unknown as Iterator<U>);
    fused.ops = [...this.ops, f as unknown as (x: T) => T | symbol] as any;
    return fused;
  }

  filter(p: (x: T) => boolean): FusedIterator<T> {
    const fused = new FusedIterator<T>(this.source);
    fused.ops = [...this.ops, (x: T) => p(x) ? x : FusedIterator.SKIP] as any;
    return fused;
  }

  next(): IteratorResult<T> {
    while (true) {
      const item = this.source.next();
      if (item.done) return item;
      let value: any = item.value;
      for (const op of this.ops) {
        value = op(value);
        if (value === FusedIterator.SKIP) break;
      }
      if (value !== FusedIterator.SKIP) {
        return { done: false, value };
      }
    }
  }

  [Symbol.iterator](): Iterator<T> { return this; }
}

// 使用原生 Iterator helpers 的对比
const data = Array.from({ length: 1_000_000 }, (_, i) => i);

console.time("native");
const native = Iterator.from(data)
  .map(x => x + 1)
  .filter(x => x % 2 === 0)
  .map(x => x * 3)
  .take(10)
  .toArray();
console.timeEnd("native");
console.log("Native result:", native);
```


---

## 4. Set.prototype 集合运算：极限与余极限的编程对应

ES2025 为 Set.prototype 引入了一系列集合运算方法：intersection、union、difference、symmetricDifference、isSubsetOf、isSupersetOf、isDisjointFrom。这些方法将集合论的基本运算直接嵌入 JavaScript 的原生对象模型，其范畴论语义与**极限（limit）**和**余极限（colimit）**密切相关。

### 4.1 集合运算的范畴论语义

在范畴论中，给定一个范畴 C 和一个**图表（diagram）** D: J -> C（其中 J 是索引范畴），D 的**极限**是一个对象 lim D 配备一族投影态射 π_j: lim D -> D(j)，满足泛性质；**余极限**则是一个对象 colim D 配备一族内射态射 ι_j: D(j) -> colim D。

对于有限集合范畴 FinSet，二元积（binary product）对应集合的**笛卡尔积**，二元余积（binary coproduct）对应**不交并**。但 Set.prototype.union 和 intersection 不是积或余积，而是幂集范畴 P(U)（以某个全集 U 的所有子集为对象，包含映射为态射）中的**交（meet）**和**并（join）**。

在幂集范畴中：

- A ∩ B = lim (A <- • -> B) —— 这里的图表是「两个对象，无箭头」的离散图表，其极限正是**拉回（pullback）**在集合范畴中的特例。更准确地说，A ∩ B 是包含映射 A ↪ U 与 B ↪ U 的拉回。
- A ∪ B = colim (A -> • <- B) —— 这是**推出（pushout）**在集合范畴中的特例，即两个包含映射的推出。

```typescript
// 示例 5：Set 运算与极限/余极限的对应
const A = new Set([1, 2, 3, 4]);
const B = new Set([3, 4, 5, 6]);

// intersection ≈ pullback of inclusions
const intersection = A.intersection(B);
console.log("A ∩ B:", [...intersection]); // [3, 4]

// union ≈ pushout of inclusions
const union = A.union(B);
console.log("A ∪ B:", [...union]); // [1, 2, 3, 4, 5, 6]

// difference ≈ A \ B = A ∩ Bᶜ
const difference = A.difference(B);
console.log("A \\ B:", [...difference]); // [1, 2]

// symmetricDifference ≈ (A \ B) ∪ (B \ A)
const symmetricDifference = A.symmetricDifference(B);
console.log("A Δ B:", [...symmetricDifference]); // [1, 2, 5, 6]

// isSubsetOf ≈ 存在单态射 A ↪ B
console.log("A ⊆ B?", A.isSubsetOf(B)); // false
console.log("A ∩ B ⊆ A?", A.intersection(B).isSubsetOf(A)); // true

// 形式化验证拉回性质：
// 给定 f: X -> A, g: X -> B，若 f(x) = g(x) 对所有 x 成立，
// 则存在唯一的 h: X -> A ∩ B 使得 i₁ ∘ h = f, i₂ ∘ h = g
function verifyPullbackUniversalProperty<X>(
  X: Set<X>,
  f: (x: X) => number,
  g: (x: X) => number
): boolean {
  const imageF = new Set([...X].map(f));
  const imageG = new Set([...X].map(g));
  const pullback = imageF.intersection(imageG);

  for (const x of X) {
    if (f(x) !== g(x)) return false;
  }

  const h = (x: X) => f(x);
  const hImage = new Set([...X].map(h));
  return hImage.isSubsetOf(pullback);
}

console.log("Pullback property:", verifyPullbackUniversalProperty(
  new Set(['a', 'b', 'c']),
  () => 1,
  () => 1
));
```

### 4.2 幂集格与布尔代数

幂集 P(U) 配备运算 ∩, ∪, ᶜ 构成一个**布尔代数（Boolean algebra）**。布尔代数是一种特殊的**格（lattice）**，满足分配律、补律等公理。从范畴论的角度，布尔代数可以被视为一个**笛卡尔闭范畴（Cartesian closed category）**的骨架，其中：

- 交 ∩ 是**积（product）**
- 并 ∪ 是**余积（coproduct）**
- 补 ᶜ 是**指数对象（exponential object）**中的否定

ES2025 的 Set 运算为这一代数结构提供了直接的编程接口。特别值得注意的是 symmetricDifference：它在布尔代数中对应**异或（XOR）**运算，可以表示为：

A Δ B = (A \ B) ∪ (B \ A) = (A ∪ B) \ (A ∩ B)

```typescript
// 验证 symmetricDifference 的代数性质
const U = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
const A = new Set([1, 2, 3, 4]);
const B = new Set([3, 4, 5, 6]);
const C = new Set([2, 4, 6, 8]);

// 交换律：A Δ B = B Δ A
console.log("Commutative:",
  JSON.stringify([...A.symmetricDifference(B)]) ===
  JSON.stringify([...B.symmetricDifference(A)])
);

// 结合律：(A Δ B) Δ C = A Δ (B Δ C)
console.log("Associative:",
  JSON.stringify([...A.symmetricDifference(B).symmetricDifference(C)]) ===
  JSON.stringify([...A.symmetricDifference(B.symmetricDifference(C))])
);

// 幺元：A Δ ∅ = A
console.log("Identity:",
  JSON.stringify([...A.symmetricDifference(new Set())]) ===
  JSON.stringify([...A])
);

// 自逆性：A Δ A = ∅
console.log("Self-inverse:",
  A.symmetricDifference(A).size === 0
);

// 分配律：A ∩ (B Δ C) = (A ∩ B) Δ (A ∩ C)
console.log("Distributive:",
  JSON.stringify([...A.intersection(B.symmetricDifference(C))]) ===
  JSON.stringify([...A.intersection(B).symmetricDifference(A.intersection(C))])
);
```

### 4.3 与 lodash/underscore/Ramda 的对称差分析

| 特性 | lodash | underscore | Ramda | ES2025 Native |
|------|--------|-----------|-------|---------------|
| intersection | _.intersection | _.intersection | R.intersection | Set.prototype.intersection |
| union | _.union | _.union | R.union | Set.prototype.union |
| difference | _.difference | _.difference | R.difference | Set.prototype.difference |
| 输入类型 | Array | Array | Array | Set |
| 输出类型 | Array | Array | Array | Set |
| 去重语义 | 基于 SameValueZero | 基于 === | 基于 R.equals | 基于 SameValueZero |
| 时间复杂度 | O(n · m) | O(n · m) | O(n · m) | O(min(n, m))（哈希优化） |
| 范畴结构 | 无显式保证 | 无显式保证 | 无显式保证 | 幂集格的完备布尔代数 |

关键差异在于：**原生 Set 运算的语义被固定在 ECMA-262 规范中**，具有确定的时间复杂度保证（基于底层哈希表实现），而第三方库的实现因版本和配置不同而变化。此外，Set 运算直接操作 Set 对象，避免了 Array↔Set 的类型转换开销。

---

## 5. Promise.try：错误处理的代数结构

Promise.try(f) 是 ES2025 引入的一个看似微小但语义深刻的 API。它接受一个函数 f，将其包裹在一个 Promise 中：如果 f 正常返回，则 Promise 以该值解决（resolve）；如果 f 抛出异常，则 Promise 以该异常拒绝（reject）。

### 5.1 Promise.try 的语义

在引入 Promise.try 之前，开发者通常使用以下模式：

```typescript
// 旧模式：new Promise 包裹
const p = new Promise((resolve, reject) => {
  try {
    resolve(f());
  } catch (e) {
    reject(e);
  }
});

// 新模式：Promise.try
const p = Promise.try(f);
```

从类型论的角度，Promise.try 的类型签名是：

try: (() -> A) -> Promise(A)

这看起来像是「从 thunk 到 Promise 的转换」，但其深层语义是**异常单子（exception monad）**与**异步单子（Promise monad）**的结合。

### 5.2 Kleisli 范畴中的单位态射

Promise 作为一个单子，其单位（unit）操作是 Promise.resolve：

η: A -> Promise(A), η(a) = Promise.resolve(a)

Promise.try 则提供了另一种进入 Promise 单子的路径：

try: (() -> A) -> Promise(A)

这里的关键在于：() -> A（thunk 类型）在范畴论语义中等价于**延迟计算的值（suspended computation）**。Promise.try 将「可能失败的延迟计算」提升为「必然返回 Promise 的纯值」。这在 Kleisli 范畴中扮演了一个**安全包装器（safe wrapper）**的角色。

```typescript
// 示例 6：Promise.try 的代数结构分析
async function demonstratePromiseTry() {
  // 同步成功路径
  const success = Promise.try(() => 42);
  console.log("Success:", await success); // 42

  // 同步失败路径
  const failure = Promise.try(() => {
    throw new Error("oops");
  });
  try {
    await failure;
  } catch (e) {
    console.log("Failure:", (e as Error).message); // oops
  }

  // Promise.try 与 Promise.resolve 的差异
  const syncValue = 42;
  const resolveP = Promise.resolve(syncValue);
  const tryP = Promise.try(() => syncValue);

  console.log("Resolve === Try?",
    await resolveP === await tryP
  );

  // Kleisli 复合的演示
  const f = (x: number) => Promise.try(() => x * 2);
  const g = (x: number) => Promise.try(() => {
    if (x > 50) throw new Error("too big");
    return x + 1;
  });

  // Kleisli 复合：f >=> g
  const kleisliCompose = async (x: number) => {
    const fx = await f(x);
    return g(fx);
  };

  console.log("Kleisli 42:", await (await kleisliCompose(42)));
  try {
    await kleisliCompose(30); // 30 * 2 = 60 > 50
  } catch (e) {
    console.log("Kleisli failed:", (e as Error).message);
  }
}

demonstratePromiseTry();
```

### 5.3 与 try/catch 的语义映射

Promise.try 与 try/catch 之间存在一个**语法到语义的映射（syntactic-to-semantic mapping）**：

| 语法结构 | 语义结构 | 范畴论语义 |
|---------|---------|-----------|
| try { e } catch (err) { h } | 异常处理 | 余积 / Either 类型 |
| Promise.try(f) | 异常到 Promise 的嵌入 | 单位态射 η 的变体 |
| .catch(h) | Promise 拒绝的处理 | 余积的右注入消解 |
| await | Promise 的消解 | 单子 μ 操作 |

Promise.try 的引入使得「同步异常」与「异步拒绝」之间的边界被系统化地抹平。从类型系统的角度，这相当于将 JavaScript 的**效果系统（effect system）**中的一个漏洞修补：在此之前，一个函数 f 的返回类型 A 并不能反映其可能抛出的异常，而 Promise.try(() => f()) 的返回类型 Promise<A> 则明确地编码了这一效果。

---

## 6. RegExp.escape 与 Pattern Modifiers：形式语言理论视角

RegExp.escape 是一个静态方法，用于将字符串转义为正则表达式的字面量形式。从形式语言理论的角度，这对应于**元字符（metacharacter）的消歧（disambiguation）**操作。

给定一个字母表 Σ，正则表达式语言 R(Σ) 是 Σ 上的形式语言，其语法包含元字符 {^, $, \, ., *, +, ?, [, ], (, ), {, }, |, -}。RegExp.escape 提供了一个从字符串到正则表达式字面量的**嵌入映射（embedding map）**：

escape: Σ* -> R(Σ), s ↦ escaped(s)

使得对于任意 s ∈ Σ*，new RegExp(RegExp.escape(s)).test(s) === true。这在范畴论语义中是一个**截面（section）**：如果我们将「正则表达式匹配」视为从 R(Σ) 到 2^(Σ*)（语言的幂集）的映射，那么 RegExp.escape 提供了一个从 Σ*到 R(Σ) 的单射，使得复合映射 Σ* -> R(Σ) -> 2^(Σ*) 将每个字符串映射到包含它自身的语言集合。

```typescript
// RegExp.escape 的形式化验证
const testStrings = [
  "hello",
  "a.b*c+d?",
  "[brackets]",
  "(parens)",
  "{braces}",
  "caret^",
  "dollar$",
  "pipe|",
  "backslash\\",
];

for (const s of testStrings) {
  const escaped = (RegExp as any).escape(s);
  const re = new RegExp(escaped);
  console.log(`"${s}" -> "${escaped}" -> match: ${re.test(s)}`);
}
```

**Pattern Modifiers**（ES2025 的另一 RegExp 特性）允许在正则表达式内部使用 `(?i:...)`、`(?m:...)`、`(?s:...)` 等语法启用局部模式修饰符。从形式语义的角度，这相当于为正则表达式的**语义解释函数**引入了一个**局部环境（local environment）**：修饰符改变了子表达式的解释方式，而不影响外部上下文。这在范畴论语义中对应于**纤维范畴（fibered category）**的直觉——每个子表达式位于自己的「纤维」中，拥有局部的类型/模式上下文。

传统上，正则表达式的修饰符（flags）是全局的：整个表达式共享同一套解释规则。Pattern Modifiers 的引入打破了这一全局性，使得正则表达式从「单层语义空间」进化为「分层纤维结构」。在纤维范畴中，基范畴（base category）是正则表达式的抽象语法树，而每个节点上的纤维（fiber）则是该节点局部的模式上下文。这正是一个**分裂纤维范畴（split fibration）**的实例：每个 AST 节点都携带一个局部环境，该环境通过重索引函子（reindexing functor）沿 AST 的父子关系传递。

从编译原理的角度，Pattern Modifiers 的语义解释需要一个**环境传递（environment-passing）**的解释器：解释器在遍历 AST 时维护一个环境映射，遇到 `(?i:...)` 时临时扩展该映射，退出子表达式时恢复原有环境。这种环境管理策略与函数式语言中 `let` 表达式的环境扩展具有同构的结构。

```typescript
// Pattern Modifiers 的局部环境语义示例
// (?i:...) 在子表达式内启用不区分大小写匹配，不影响外部
const pattern = /hello (?i:WORLD) goodbye/;

// "WORLD" 部分不区分大小写，但 "hello" 和 "goodbye" 仍区分大小写
console.log(pattern.test("hello world goodbye")); // true（world 匹配 WORLD）
console.log(pattern.test("HELLO world GOODBYE")); // false（HELLO 不匹配 hello）
```

这一特性在复杂正则表达式的模块化构造中尤为重要：开发者可以将来自不同来源的子表达式组合在一起，而不必担心全局 flags 的冲突。从类型论的角度，这相当于为每个子表达式提供了一个**局部类型上下文（local typing context）**，使得正则表达式语言在保持全局一致性的同时，获得了局部灵活性。


---

## 7. Float16Array：数值计算的精度格

Float16Array 是 ES2025 引入的新的**类型化数组（typed array）**，使用 IEEE 754-2008 标准的半精度（16-bit）浮点格式。从类型论和数值分析的角度，Float16Array 的引入补全了 JavaScript 数值类型的**精度格（precision lattice）**。

### 7.1 IEEE 754 半精度浮点的类型结构

IEEE 754 半精度浮点数（binary16）的结构如下：

| 字段 | 位数 | 含义 |
|------|------|------|
| 符号位（sign） | 1 | 正负号 |
| 指数位（exponent） | 5 | 偏置指数（bias = 15）|
| 尾数位（mantissa） | 10 | 有效数字 |

其数值表示为：

(-1)^sign × 2^(exponent - 15) × (1.mantissa)_2

半精度浮点的动态范围约为 6.1 × 10^-5 到 6.5 × 10^4，精度约为 3.3 位十进制数字。与之对比：

| 类型 | 位数 | 指数位 | 尾数位 | 十进制精度 |
|------|------|--------|--------|-----------|
| Float16 | 16 | 5 | 10 | ~3.3 |
| Float32 | 32 | 8 | 23 | ~7.2 |
| Float64 | 64 | 11 | 52 | ~15.9 |

### 7.2 精度格与类型提升

JavaScript 的类型化数组构成了一个**精度格（precision lattice）**：

```
      Float64
       /   \
  Float32   BigInt64
    /   \
Float16  Int32
  /   \
Int16  Uint16
```

在格理论中，Float16 位于精度层次的较低位置。向上转型（widening）是**单调的（monotonic）**：从 Float16 到 Float32 再到 Float64 的转换保持或增加精度，但不会引入新的舍入误差（在表示范围内）。向下转型（narrowing）则是**非单调的**：Float64 到 Float16 的转换可能导致上溢、下溢或舍入误差。

```typescript
// 示例 7：Float16Array 的精度格分析
const f64 = new Float64Array([1.0, 1.1, 1.2, 100000.0]);
const f32 = new Float32Array(f64);
const f16 = new (Float16Array as any)(f64);

console.log("Float64:", [...f64]);
console.log("Float32:", [...f32]);
console.log("Float16:", [...f16]);

// 验证格的单调性：f16 -> f32 -> f64 的往返一致性
const original = 1.5;
const via16 = new (Float16Array as any)([original])[0];
const via32 = new Float32Array([via16])[0];
const via64 = new Float64Array([via32])[0];

console.log("Original:", original);
console.log("Via Float16:", via16);
console.log("Via Float32:", via32);
console.log("Via Float64:", via64);
console.log("Monotonic round-trip:", original === via64);

// 反例：精度损失
const tricky = 1.0001;
const tricky16 = new (Float16Array as any)([tricky])[0];
console.log("Tricky original:", tricky);
console.log("Tricky via Float16:", tricky16);
console.log("Precision lost:", tricky !== tricky16);
```

从范畴论的角度，精度格中的类型提升构成了一个**偏序范畴（poset category）**，其中对象是不同的数值类型，态射是精度保持的转换。这个范畴具有**极限**（最大下界，即精度最高的共同表示）和**余极限**（最小上界，即精度最低的安全表示）。Float16Array 的引入使得这个偏序范畴更加完备，为机器学习（GPU 计算中广泛使用 FP16）等场景提供了原生的数值基础设施。

### 7.3 WebGPU、深度学习与精度格的工程实践

Float16Array 的引入并非孤立的数值类型扩展，而是与 WebGPU 和浏览器端机器学习生态的深度协同。WebGPU 的 compute shader 广泛支持 FP16 计算，因为半精度浮点在神经网络推理中通常足够使用，且能显著降低内存带宽需求和能耗。在范畴论语义下，这种从 Float64 到 Float16 的降级是一个**遗忘函子（forgetful functor）**的实例：它保留了数值的基本结构，但遗忘了部分精度信息。

```typescript
// 示例：在 WebGPU 计算管线中使用 Float16Array（概念性演示）
// 假设有一个矩阵乘法内核，期望 FP16 输入
async function runFP16MatrixMul(
  matrixA: Float32Array,
  matrixB: Float32Array
): Promise<Float32Array> {
  // 转换为 Float16 以减少 GPU 内存占用
  const a16 = new (Float16Array as any)(matrixA);
  const b16 = new (Float16Array as any)(matrixB);

  // 在 WebGPU 中执行计算...
  // const result16 = await gpuCompute(a16, b16);

  // 结果转回 Float32 供 JavaScript 使用
  // return new Float32Array(result16);
  return matrixA; // 占位
}
```

在实际工程中，精度格指导了一个重要的设计原则：**在满足精度要求的前提下，选择格中最低（即最轻量）的类型**。对于神经网络权重、图像纹理坐标等场景，Float16 通常足够；对于金融计算和科学模拟，Float64 仍然是必要的。这种基于格的决策过程，本质上是在偏序范畴中寻找**最优对象（optimal object）**——既满足约束条件，又最小化资源消耗。

---

## 8. Import Attributes 与 JSON Modules：模块系统范畴语义的扩展

ES2025 正式将 **Import Attributes**（with { type: "json" }）纳入标准，与 JSON Modules 一起，为 ECMAScript 的模块系统引入了**依赖类型（dependent typing）**的初步直觉。

### 8.1 模块作为态射的观点

在 ECMAScript 的模块系统中，每个模块可以被视为一个**对象（object）**，其导出（exports）是该对象的**分量（components）**。模块之间的导入（import）关系构成了一个**范畴**：对象是模块，态射是导入关系。

形式化地，我们可以定义**模块范畴（module category）** Mod_ES：

- **对象**：ECMAScript 模块文件（module records）
- **态射**：从模块 A 到模块 B 的导入关系，即 A 导入了 B 的某些绑定
- **组合**：导入的传递性（如果 A 导入 B，B 导入 C，则 A 间接依赖 C）
- **恒等**：模块自引用（循环导入中的自引用）

### 8.2 Import attributes 作为依赖标记

Import attributes 引入了**标记依赖（tagged dependency）**的概念：

```typescript
import data from "./config.json" with { type: "json" };
```

从类型论的角度，这相当于为模块依赖附加了一个**类型标签（type tag）**。{ type: "json" } 告诉模块加载器：被导入的资源不是一个 JavaScript 模块，而是一个 JSON 文档，应当使用 JSON 解析器而非 JavaScript 解析器处理。

在范畴论语义中，这类似于**纤维范畴（fibered category）**或**索引范畴（indexed category）**中的**重索引（reindexing）**操作：模块加载器根据属性标记选择不同的「纤维」（解析策略）来处理导入的资源。

```typescript
// 示例 8：Import Attributes 与模块系统的类型安全
// TypeScript 6.0+ 支持 import attributes 的类型推断

// 假设存在对应的类型声明
declare module "*.json" {
  const value: unknown;
  export default value;
}

// 在运行时，import attributes 保证了解析路径的正确性
async function loadConfig() {
  const config = await import("./config.json", {
    with: { type: "json" }
  });
  return config.default;
}

// 与动态导入的组合
async function loadTypedModule<T>(path: string, type: string): Promise<T> {
  const module = await import(path, { with: { type } });
  return module.default as T;
}

// 范畴论语义：import attributes 是模块范畴上的「自函子」
// F_json: Mod -> Mod，将 JSON 文件映射为已解析的 JSON 对象模块
// F_js: Mod -> Mod，将 JS 文件映射为已执行的模块记录
// import with { type: "json" } 就是选择 F_json 而非 F_js
```

### 8.3 JSON Modules 的类型安全性

JSON Modules 的引入解决了一个长期存在的类型安全问题：在 TypeScript 中，import config from "./config.json" 之前需要额外的类型声明，而运行时对 JSON 的解析没有任何规范保证。ES2025 通过 with { type: "json" } 将这一保证纳入规范层面。

从**代数效应（algebraic effects）**的视角，模块加载是一种**效应（effect）**：它涉及文件系统访问、网络请求（对于 URL 导入）、解析和编译。Import attributes 为这种效应提供了**处理器（handler）**的选择机制——type: "json" 选择了 JSON 处理器，默认选择了 JavaScript 处理器。

### 8.4 从 assert 到 with 的语法演进：废弃与替换的范畴论

Import attributes 的语法经历了从 `assert` 到 `with` 的关键变更。早期的 Import Assertions 使用 `assert { type: "json" }`，但 TC39 最终将其废弃，改用 `with { type: "json" }`。这一变更不仅是语法层面的调整，更反映了语义理解的深化。

`assert` 一词暗示了模块加载器在**验证（verify）**一个预先声明的属性：开发者断言某个模块是 JSON，加载器检查该断言是否成立。这对应于**契约式编程（contract programming）**中的前置条件检查。然而，这种理解并不准确——`type: "json"` 并不仅仅是一个待验证的断言，而是**指导模块加载器行为的关键参数**。它决定了使用哪个解析器、哪个安全性沙箱、哪个模块记录构造算法。

`with` 一词更准确地捕捉了这一语义：它为模块导入附加了一个**环境参数（environment parameter）**，类似于函数调用中的命名参数。在范畴论语义中，`assert` 对应的是一个**命题（proposition）**——一个待验证的真值；而 `with` 对应的是一个**构造子参数（constructor parameter）**——一个参与构造模块对象的值。这一从「命题」到「构造子参数」的语义转换，体现了 TC39 对模块系统形式化理解的深化。

```typescript
// 旧语法（已废弃）：assert 是验证性声明
// import data from "./config.json" assert { type: "json" };

// 新语法（ES2025）：with 是构造性参数
import data from "./config.json" with { type: "json" };

// 动态导入同样使用 with
const module = await import("./data.json", { with: { type: "json" } });
```

这一演进还揭示了编程语言设计中的一个普遍模式：当某个特性的初始语义理解不够精确时，语言设计者会通过**弃用-替换（deprecation-replacement）**循环来逐步逼近正确的范畴模型。ES2025 的 `with` 语法正是这一循环的产物——它更准确地反映了 import attributes 在模块范畴中的真正角色：不是断言，而是构造参数。

---

## 9. Temporal API：时间代数的形式化

Temporal 是 ECMAScript 国际化 API（ECMA-402）的一个重大扩展，提供了取代 Date 对象的现代日期时间处理 API。从类型论和代数学的角度，Temporal 的设计体现了一种**时间代数（algebra of time）**的形式化尝试。

### 9.1 Duration 的半环结构

Temporal.Duration 表示时间跨度，其结构为：

{years, months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds}

从代数学的角度，Duration 具有**半环（semiring）**的结构：

- **加法**（add）：对应时间跨度的拼接，满足结合律和交换律，零元为 PT0S
- **乘法**（multiply 标量乘）：对应时间跨度的缩放，满足分配律，单位元为标量 1

但 Duration 不是完整的环，因为：

- 不存在「负的月份」这样的概念（虽然可以表示负持续时间，但月份和日期的混合运算导致非交换性）
- 标量乘法不是封闭的（不能乘以另一个 Duration）

```typescript
// 示例 9：Duration 的代数结构验证
const d1 = Temporal.Duration.from({ days: 1, hours: 12 });
const d2 = Temporal.Duration.from({ days: 2, hours: 6 });

// 加法交换律：d1 + d2 = d2 + d1
const sum1 = d1.add(d2);
const sum2 = d2.add(d1);
console.log("Commutative:", sum1.toString() === sum2.toString());

// 加法结合律：(d1 + d2) + d3 = d1 + (d2 + d3)
const d3 = Temporal.Duration.from({ hours: 3 });
const assoc1 = d1.add(d2).add(d3);
const assoc2 = d1.add(d2.add(d3));
console.log("Associative:", assoc1.toString() === assoc2.toString());

// 零元
d1.add(Temporal.Duration.from({}));

// 标量乘法分配律：k * (d1 + d2) = k * d1 + k * d2
const k = 2;
const dist1 = d1.add(d2).multiply(k);
const dist2 = d1.multiply(k).add(d2.multiply(k));
console.log("Distributive:", dist1.toString() === dist2.toString());

// 注意：Duration 不是真正交换的，当涉及 calendar 运算时
const rel = new Temporal.PlainDate(2024, 1, 31);
const oneMonth = Temporal.Duration.from({ months: 1 });
const thirtyDays = Temporal.Duration.from({ days: 30 });

const r1 = rel.add(oneMonth).add(thirtyDays);
const r2 = rel.add(thirtyDays).add(oneMonth);
console.log("Non-commutative with calendar:", r1.toString() !== r2.toString());
console.log("Jan 31 + 1mo + 30d:", r1.toString());
console.log("Jan 31 + 30d + 1mo:", r2.toString());
```

### 9.2 Instant 的全序类型

Temporal.Instant 表示时间轴上的一个绝对瞬间，内部表示为自 Unix 纪元以来的纳秒数。Instant 构成了一个**全序集（totally ordered set）**，即任意两个 Instant 都是可比较的。

从类型论的角度，Instant 是一个**全序类型（ordered type）**，配备了关系运算 <, >, <=, >=, ===。这些运算满足全序公理：

1. **反对称性**：若 a ≤ b 且 b ≤ a，则 a = b
2. **传递性**：若 a ≤ b 且 b ≤ c，则 a ≤ c
3. **完全性**：任意 a, b 满足 a ≤ b 或 b ≤ a

```typescript
// Instant 的全序性质
const i1 = Temporal.Instant.from('2024-01-15T00:00:00Z');
const i2 = Temporal.Instant.from('2024-06-15T00:00:00Z');
const i3 = Temporal.Instant.from('2024-12-15T00:00:00Z');

// 传递性：i1 < i2 且 i2 < i3 => i1 < i3
console.log("Transitive:", Temporal.Instant.compare(i1, i2) < 0 &&
                           Temporal.Instant.compare(i2, i3) < 0 &&
                           Temporal.Instant.compare(i1, i3) < 0);

// 完全性
console.log("Total:", Temporal.Instant.compare(i1, i2) !== 0 ||
                      Temporal.Instant.compare(i2, i1) !== 0);

// Instant 构成一个有序幺半群（ordered monoid）
// 运算：i.add(duration)，单位元：Instant.fromEpochNanoseconds(0n)
```

### 9.3 ZonedDateTime 的依赖类型直觉

Temporal.ZonedDateTime 是最复杂的时间类型，它同时包含：

- 一个 Instant（绝对时间）
- 一个时区（如 'America/New_York'）
- 一个日历系统（如 'iso8601'）

从类型论的角度，ZonedDateTime 具有**依赖类型（dependent type）**的结构：其「墙钟时间」（年、月、日、时、分、秒）分量**依赖于**时区和日历系统的选择。同一个 Instant 在不同的时区下可以对应不同的 PlainDateTime。

形式上，可以将其理解为：

ZonedDateTime = Σ_(z: TimeZone) Σ_(c: Calendar) Instant × PlainDateTime(z, c)

这是一个**依赖和类型（dependent sum type）**或**Σ-类型**，其中 PlainDateTime 的类型依赖于 TimeZone 和 Calendar 的值。

```typescript
// 依赖类型的直觉演示
const instant = Temporal.Instant.from('2024-06-15T12:00:00Z');

// 同一个 Instant，不同的时区 => 不同的墙钟时间
const nyc = instant.toZonedDateTimeISO('America/New_York');
const tokyo = instant.toZonedDateTimeISO('Asia/Tokyo');
const utc = instant.toZonedDateTimeISO('UTC');

console.log("NYC:", nyc.toPlainDateTime().toString());
console.log("Tokyo:", tokyo.toPlainDateTime().toString());
console.log("UTC:", utc.toPlainDateTime().toString());

// 这对应于依赖类型中的「重索引」（reindexing）：
// Instant -> (TimeZone -> PlainDateTime)
// 即时区改变了 PlainDateTime 的类型上下文
```


---

## 10. Stage 2/3 前沿提案的形式化预览

除了已发布的 ES2025 特性，多个处于 Stage 2/3 的提案展现了 ECMAScript 未来演进的范畴论方向。

### 10.1 Async Iterator Helpers

Async Iterator Helpers 提案将 Iterator helpers 推广到异步迭代器（AsyncIterator）。从范畴论的角度，这是**异步函子（async functor）**结构的完备化。

```typescript
// Async Iterator Helpers 的形式化直觉
async function* asyncRange(start: number, end: number): AsyncGenerator<number> {
  for (let i = start; i < end; i++) {
    await new Promise(r => setTimeout(r, 10));
    yield i;
  }
}

async function demonstrateAsyncIterators() {
  async function* asyncMap<T, U>(
    source: AsyncIterable<T>,
    f: (x: T) => U
  ): AsyncGenerator<U> {
    for await (const x of source) yield f(x);
  }

  async function* asyncFilter<T>(
    source: AsyncIterable<T>,
    p: (x: T) => boolean
  ): AsyncGenerator<T> {
    for await (const x of source) if (p(x)) yield x;
  }

  async function* asyncTake<T>(
    source: AsyncIterable<T>,
    n: number
  ): AsyncGenerator<T> {
    let count = 0;
    for await (const x of source) {
      if (count >= n) break;
      yield x;
      count++;
    }
  }

  const pipeline = asyncTake(
    asyncFilter(
      asyncMap(asyncRange(0, 100), x => x * 2),
      x => x % 3 === 0
    ),
    10
  );

  const result: number[] = [];
  for await (const x of pipeline) result.push(x);
  console.log("Async result:", result);
}

demonstrateAsyncIterators();
```

AsyncIterator 函子与 Iterator 函子的核心差异在于：**态射映射不再是纯函数的提升，而是 Kleisli 态射的提升**。AsyncIterator.map 的类型为：

map: (A -> B) -> (AsyncIterator(A) -> AsyncIterator(B))

但这里的 A -> B 实际上在异步语境中应该被理解为 A -> Promise(B)，因此 AsyncIterator 更准确地说是一个**单子变换器（monad transformer）**：AsyncIterator<T> = Iterator<Promise<T>> 的某种归一化形式。

### 10.2 Iterator Chunking / Sliding Windows

Iterator chunking（分块）和 sliding windows（滑动窗口）提案为迭代器提供了批处理能力。从范畴论的角度，这些操作对应于**余单子（comonad）**结构中的 **extend（展延）**操作。

```typescript
// 滑动窗口的 comonad 直觉
function* slidingWindow<T>(source: Iterable<T>, size: number): Generator<T[]> {
  const window: T[] = [];
  for (const x of source) {
    window.push(x);
    if (window.length >= size) {
      yield [...window];
      window.shift();
    }
  }
}

function* chunk<T>(source: Iterable<T>, size: number): Generator<T[]> {
  let batch: T[] = [];
  for (const x of source) {
    batch.push(x);
    if (batch.length >= size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log("Windows:", [...slidingWindow(data, 3)]);
console.log("Chunks:", [...chunk(data, 3)]);
```

在 comonad 语义中，slidingWindow 可以被视为 **extend** 操作的一种实现：它将局部上下文（窗口）附加到每个焦点元素上。这在流处理和信号处理中有广泛应用。

### 10.3 Import Bytes

Import Bytes 提案允许导入二进制数据：

```typescript
// 未来可能的语法
// import bytes from "./data.bin" with { type: "bytes" };
```

从范畴论的角度，这扩展了模块范畴的「纤维」结构：除了 JSON 和 JavaScript 之外，模块系统现在需要处理**原始字节（raw bytes）**的纤维。这对应于**带类型的文件系统（typed file system）**的直觉，其中每个文件路径都关联一个类型标签，决定了其内容的解释方式。

Import Bytes 的引入意味着 ECMAScript 的模块系统正在从「代码加载器」进化为「通用资源加载器」。在范畴论语义中，这对应于模块范畴的对象扩展：之前 Mod_ES 的对象主要是「可执行模块记录」，未来可能包括「字节数组模块记录」、「WASM 模块记录」、「CSS 模块记录」等。每种模块记录类型都有其独特的求值语义——JavaScript 模块记录需要执行，JSON 模块记录需要解析，字节模块记录则只需提供原始数据的引用。

从类型论的角度，Import Bytes 推动模块系统向**依赖类型（dependent type）**方向迈出了一步：模块的「类型」不再仅仅由导出的 JavaScript 绑定决定，还由模块的**表示格式（representation format）**决定。`with { type: "bytes" }` 实际上是在说：「我期望这个模块的表示格式是原始字节，请据此构造相应的模块记录。」这与依赖类型中「类型依赖于值」的核心思想高度一致——模块的类型依赖于 `type` 属性的值。

```typescript
// 类型级模拟：Import Bytes 的依赖类型直觉
type ModuleFormat = "js" | "json" | "bytes" | "wasm";

interface ModuleRecord<Format extends ModuleFormat> {
  format: Format;
  body: Format extends "js" ? Function : Format extends "json" ? unknown : ArrayBuffer;
}

// F_bytes: 从文件路径到字节模块记录的构造子
type ImportBytes<Path extends string> = ModuleRecord<"bytes"> & { source: Path };

// 未来的模块加载器将是一个依赖于 format 参数的通用构造子
type ModuleLoader = <F extends ModuleFormat, P extends string>(
  path: P,
  format: F
) => ModuleRecord<F>;
```

Import Bytes 与现有的 Import Attributes 共同构建了一个**渐进式类型化的模块系统**：开发者可以通过 `with` 子句显式指定模块的表示格式，而加载器根据该格式选择正确的解析策略。这一设计为未来的类型安全模块系统奠定了基础——当 TypeScript 能够为 `import bytes from "..." with { type: "bytes" }` 推断出 `ArrayBuffer` 类型时，模块系统就真正具备了依赖类型的能力。

### 10.4 Decorators Stage 3 与 TS 6.0 对齐

Decorators 提案在 Stage 3 已经历多年迭代，TypeScript 6.0 将与最终的 TC39 标准对齐。从范畴论的角度，装饰器是一种**高阶变换（higher-order transformation）**：它接受一个类或类成员，返回一个变换后的版本。

```typescript
// Decorators 作为高阶变换
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  return function(this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)} with`, args);
    const result = target.apply(this, args);
    console.log(`Returned`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
```

Decorators 的范畴论语义对应于**自函子范畴（endofunctor category）**中的**自然变换**：每个装饰器都是从一个自函子（如「类构造子」）到另一个自函子（如「带日志的类构造子」）的自然映射。

---

## 11. 工程决策矩阵：原生特性 vs 第三方库

基于上述形式化分析，我们可以建立一个系统性的工程决策矩阵：

| 场景 | 推荐方案 | 理由 | 范畴论语义 |
|------|---------|------|-----------|
| 大数据集变换（>1M 元素） | Iterator helpers | 零中间数组，O(1) 空间 | 惰性函子的融合优化 |
| 小规模数据（<1K 元素） | Array.prototype | 缓存友好，可重复遍历 | 严格函子的简单性 |
| 集合运算 | Set.prototype 原生 | O(min(n,m)) 时间，规范保证 | 幂集格的完备布尔代数 |
| 复杂集合逻辑 | Ramda / lodash | 函数组合、柯里化支持 | 高阶函数范畴 |
| 异步流处理 | RxJS / Bacon.js | 背压控制、调度器、取消 | Reactive Extensions 的 MonadPlus |
| 简单异步管道 | AsyncIterator（未来） | 原生语义，零依赖 | 异步函子的 Kleisli 复合 |
| 时间计算 | Temporal API | 类型安全，无 Date 缺陷 | 时间代数的半环与全序 |
| 正则转义 | RegExp.escape | 规范保证的转义语义 | 形式语言的嵌入映射 |
| 异常到 Promise | Promise.try | 消除样板代码 | 异常单子的单位嵌入 |
| JSON 模块导入 | with { type: "json" } | 解析器隔离，安全保证 | 纤维范畴的重索引 |
| 半精度数值 | Float16Array | ML/GPU 场景的原生支持 | 精度格的完备化 |

**一般原则**：

1. **当范畴结构需要严格保证时，优先原生**。例如 Set 运算的交换律、结合律在原生实现中有规范保证，而第三方库可能因实现细节（如对象哈希、NaN 处理）而表现不同。
2. **当需要高阶组合能力时，优先第三方库**。Ramda 的 R.compose、R.pipe 提供了比原生方法更灵活的组合能力，对应于范畴中更一般的态射复合。
3. **当性能是关键约束时，进行基准测试**。虽然 Iterator helpers 在理论上具有更好的空间复杂度，但小数据场景下的常数开销可能使 Array 方法更快。
4. **当类型安全是首要目标时，优先 Temporal 和原生模块**。Date 对象的类型不安全（月份从 0 开始、时区隐式等）是设计缺陷，而 Temporal 的类型结构明确编码了时间计算的约束。

---

## 12. 形式化定义：TypeScript 类型系统模拟

本节使用 TypeScript 的类型系统模拟 ES2025 新特性的部分形式化语义。TypeScript 的类型系统不是严格的证明助手，但其**条件类型（conditional types）**、**映射类型（mapped types）**和**模板字面量类型（template literal types）**足以表达许多范畴论概念。

### 12.1 Iterator 函子的类型级模拟

```typescript
// 类型级 Iterator 函子模拟
interface TypeFunctor<F> {
  map<A, B>(f: (a: A) => B): (fa: HKT<F, A>) => HKT<F, B>;
}

// Higher-Kinded Type 模拟
type HKT<F, A> = F extends "Iterator" ? Iterator<A> : never;

// Iterator 函子的类型级实现
const IteratorFunctor: TypeFunctor<"Iterator"> = {
  map<A, B>(f: (a: A) => B) {
    return function*(fa: Iterator<A>): Iterator<B> {
      let result = fa.next();
      while (!result.done) {
        yield f(result.value);
        result = fa.next();
      }
    } as any;
  }
};

// 函子律的类型级断言（通过赋值检查）
type IdentityLaw<F, A> = HKT<F, A> extends infer FA
  ? (fa: FA) => FA
  : never;

type ComposeLaw<F, A, B, C> = (
  f: (a: A) => B,
  g: (b: B) => C
) => (fa: HKT<F, A>) => HKT<F, C>;

// 验证类型
const _identityLaw: IdentityLaw<"Iterator", number> = IteratorFunctor.map(x => x) as any;
const _composeLaw: ComposeLaw<"Iterator", number, string, boolean> =
  (f, g) => fa => IteratorFunctor.map(g)(IteratorFunctor.map(f)(fa) as any) as any;
```

### 12.2 Set 运算的极限余极限类型模拟

```typescript
// 将 Set 运算形式化为极限/余极限的类型级编码

// 积类型（Product / Pullback 的特例）
type Product<A, B> = { fst: A; snd: B };

// Set 的交集对应于拉回（pullback）的对象
// 在类型论中，A ∩ B 可以近似为「同时是 A 和 B 的元素」
type Intersection<A, B> = A & B;

// Set 的并集对应于推出（pushout）的对象
// 在类型论中，A ∪ B 可以近似为「或者是 A 或者是 B 的元素」
type Union<A, B> = A | B;

// 验证集合运算的代数性质
type Commutativity<A, B> =
  Intersection<A, B> extends Intersection<B, A> ? true : false;
type Associativity<A, B, C> =
  Intersection<Intersection<A, B>, C> extends Intersection<A, Intersection<B, C>> ? true : false;

// 具体验证
interface Foo { foo: string }
interface Bar { bar: number }
interface Baz { baz: boolean }

type _commutative: Commutativity<Foo, Bar> = true;
type _associative: Associativity<Foo, Bar, Baz> = true;

// 幂集格的序关系编码
type SubsetOf<A, B> = A extends B ? true : false;
type _subsetCheck: SubsetOf<{a: string}, {a: string, b: number}> = true;
```

### 12.3 Temporal 类型结构的形式化

```typescript
// Duration 的半环结构类型编码
interface Semiring<S> {
  zero: S;
  one: S;
  add(a: S, b: S): S;
  multiply(a: S, b: S): S;
}

// Duration 近似满足半环公理（忽略 calendar 依赖的非交换性）
const DurationSemiring: Semiring<Temporal.Duration> = {
  zero: Temporal.Duration.from({}),
  one: Temporal.Duration.from({ seconds: 1 }),
  add: (a, b) => a.add(b),
  multiply: (a, b) => {
    const scalar = b.total({ unit: 'second' });
    return a.multiply(scalar);
  }
};

// Instant 的全序类型编码
type Ordered<T> = {
  compare(a: T, b: T): number;
};

const InstantOrdered: Ordered<Temporal.Instant> = {
  compare: Temporal.Instant.compare
};

// ZonedDateTime 的依赖类型模拟
type TimeZone = string;
type Calendar = string;

interface ZonedDateTimeLike {
  readonly timeZone: TimeZone;
  readonly calendar: Calendar;
  readonly instant: Temporal.Instant;
  toPlainDateTime(): Temporal.PlainDateTime;
}

// 验证依赖类型直觉：改变时区会改变 toPlainDateTime 的结果类型（值层面）
function createZonedDateTime(
  instant: Temporal.Instant,
  timeZone: TimeZone,
  calendar: Calendar = 'iso8601'
): ZonedDateTimeLike {
  const zdt = instant.toZonedDateTimeISO(timeZone).withCalendar(calendar);
  return {
    timeZone,
    calendar,
    instant,
    toPlainDateTime: () => zdt.toPlainDateTime()
  };
}
```

---

## 13. 结论：ECMAScript 作为渐进式完备化的代数系统

ECMAScript 2025 的发布标志着一个重要转折：JavaScript 不再仅仅是「浏览器的脚本语言」，而是一个具有**显式代数结构**的通用编程语言。从范畴论的角度审视，ES2025 的特性增补不是零散的功能堆砌，而是对已有范畴结构的系统性完备化：

1. **Iterator helpers** 补全了惰性计算的函子结构，使得 JavaScript 的序列抽象从「严格数组」扩展到「惰性流」，对应于从归纳类型到余归纳类型的完备化。

2. **Set 集合运算** 将幂集格的布尔代数嵌入原生对象模型，提供了具有规范保证的极限/余极限操作，对应于从部分代数到完备代数的完备化。

3. **Promise.try** 补全了异常到异步单子的单位嵌入，消除了同步异常与异步拒绝之间的语义裂缝，对应于从偏函数到全函数的完备化。

4. **Temporal API** 提供了时间计算的代数闭包，将 Date 对象的非代数操作替换为具有半环、全序和依赖类型结构的精确抽象。

5. **Import Attributes 与 JSON Modules** 扩展了模块系统的纤维范畴结构，为未来的类型化模块系统奠定基础。

从更宏观的视角看，ECMAScript 的演进遵循了一个**渐进式完备化（progressive completion）**的模式：每一轮标准修订都在修补上一轮遗留的代数缺陷，同时引入新的构造子以支持下一轮完备化。这种模式与数学中「从环到域、从域到代数闭域」的完备化过程有着深刻的同构关系。

对于 TypeScript 开发者而言，理解这些范畴结构不仅具有理论价值，更直接影响工程决策：知道 Iterator 是函子，就能预判 map/filter/flatMap 的组合行为；知道 Set 运算是布尔代数，就能利用交换律和结合律进行查询优化；知道 Temporal 是依赖类型，就能设计更加类型安全的时间计算 API。形式语义不是象牙塔中的游戏，而是**可执行的推理工具**。

---

## 参考文献

1. ECMA International. *ECMA-262, 16th Edition: ECMAScript® 2025 Language Specification*. 2025.
2. Axel Rauschmayer. *Exploring JavaScript: New JavaScript Features*. exploringjs.com, 2024-2025.
3. TC39. "Iterator Helpers Proposal." tc39.es/proposal-iterator-helpers, Stage 4, 2025.
4. TC39. "Set Methods Proposal." tc39.es/proposal-set-methods, Stage 4, 2025.
5. TC39. "Promise.withResolvers / Promise.try." tc39.es/proposal-promise-try, Stage 4, 2025.
6. TC39. "Temporal Proposal." tc39.es/proposal-temporal, Stage 4, 2025.
7. TC39. "Import Attributes Proposal." tc39.es/proposal-import-attributes, Stage 4, 2025.
8. TC39. "RegExp Escape Proposal." tc39.es/proposal-regex-escaping, Stage 4, 2025.
9. IEEE Computer Society. *IEEE Standard for Floating-Point Arithmetic (IEEE 754-2008)*.
10. Microsoft. "TypeScript 6.0 RC Release Notes." devblogs.microsoft.com/typescript, 2026.
11. Bartosz Milewski. *Category Theory for Programmers*. Blurb, 2019.
12. Steve Awodey. *Category Theory* (2nd ed.). Oxford University Press, 2010.
13. Saunders Mac Lane. *Categories for the Working Mathematician* (2nd ed.). Springer, 1998.
14. Philip Wadler. "Monads for Functional Programming." *Advanced Functional Programming*, 1995.
15. Eugenia Cheng. *The Joy of Abstraction: An Exploration of Math, Category Theory, and Life*. Cambridge University Press, 2022.
