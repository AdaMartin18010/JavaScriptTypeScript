---
title: "函子与自然变换在 JavaScript/TypeScript 中的体现"
description: "从 Array.map 到 Promise.then，系统分析 JS/TS 中的函子性和自然性"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~3200 words
references:
  - Mac Lane, Categories for the Working Mathematician (1998)
  - Milewski, Category Theory for Programmers (2019)
---

# 函子与自然变换在 JavaScript/TypeScript 中的体现

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 函数式编程爱好者、库设计者

---

## 目录

- [函子与自然变换在 JavaScript/TypeScript 中的体现](#函子与自然变换在-javascripttypescript-中的体现)
  - [目录](#目录)
  - [1. 协变函子](#1-协变函子)
    - [1.1 Array.map 的函子性](#11-arraymap-的函子性)
    - [1.2 Promise.then 的函子性](#12-promisethen-的函子性)
    - [1.3 Option/Maybe 函子](#13-optionmaybe-函子)
  - [2. 反变函子](#2-反变函子)
    - [2.1 函数参数位置的反变性](#21-函数参数位置的反变性)
    - [2.2 比较器函子](#22-比较器函子)
  - [3. 双函子](#3-双函子)
    - [3.1 Promise.all 作为积函子](#31-promiseall-作为积函子)
    - [3.2 Either 作为和函子](#32-either-作为和函子)
  - [4. 自然变换](#4-自然变换)
    - [4.1 定义](#41-定义)
    - [4.2 Array.flat 的自然性](#42-arrayflat-的自然性)
    - [4.3 reverse . map = map . reverse](#43-reverse--map--map--reverse)
  - [5. 函子的组合与复合](#5-函子的组合与复合)
    - [5.1 函子组合](#51-函子组合)
    - [5.2 自函子](#52-自函子)
  - [6. TS 类型系统与范畴的等价性讨论](#6-ts-类型系统与范畴的等价性讨论)
    - [6.1 TS 类型系统是否构成范畴？](#61-ts-类型系统是否构成范畴)
    - [6.2 "理想化"的 TS 范畴](#62-理想化的-ts-范畴)
  - [参考文献](#参考文献)

---

## 1. 协变函子

### 1.1 Array.map 的函子性

`Array.map` 是函子的经典实现：

```typescript
// 函子 F(A) = Array<A>
// F(f) = arr.map(f)

const arr = [1, 2, 3];
const doubled = arr.map(x => x * 2);

// 函子律验证
// 1. F(id) = id
[1, 2, 3].map(x => x); // [1, 2, 3]

// 2. F(g ∘ f) = F(g) ∘ F(f)
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;
[1, 2, 3].map(x => g(f(x)));     // [4, 6, 8]
[1, 2, 3].map(f).map(g);         // [4, 6, 8]
```

### 1.2 Promise.then 的函子性

`Promise.then` 也是函子：

```typescript
// 函子 F(A) = Promise<A>
const p = Promise.resolve(5);

// F(f) = p.then(f)
p.then(x => x * 2); // Promise<10>

// 函子律
Promise.resolve(5).then(x => x); // Promise<5>
```

### 1.3 Option/Maybe 函子

```typescript
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };

const map = <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
  fa.tag === 'some' ? { tag: 'some', value: f(fa.value) } : { tag: 'none' };
```

---

## 2. 反变函子

### 2.1 函数参数位置的反变性

在 TypeScript 中，函数参数类型是**反变**（Contravariant）的：

```typescript
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

type AnimalHandler = (a: Animal) => void;
type DogHandler = (d: Dog) => void;

const handleAnimal: AnimalHandler = (a) => console.log(a.name);
const handleDog: DogHandler = handleAnimal; // ✅ 反变
```

如果 $Dog \leq Animal$（Dog 是 Animal 的子类型），则：

$$
(Animal \to void) \leq (Dog \to void)
$$

箭头方向**反转**了！

### 2.2 比较器函子

```typescript
// 比较器：A 越大，结果越大
// 如果 B ≤ A（B 更"小"），则 Comparator<A> ≤ Comparator<B>
type Comparator<A> = (a1: A, a2: A) => number;
```

---

## 3. 双函子

### 3.1 Promise.all 作为积函子

`Promise.all` 将两个 Promise 组合为一个：

```typescript
// Bifunctor: F(A, B) = Promise<A> × Promise<B> -> Promise<A × B>
const all = <A, B>(pa: Promise<A>, pb: Promise<B>): Promise<[A, B]> =>
  Promise.all([pa, pb]);
```

### 3.2 Either 作为和函子

```typescript
type Either<E, A> = { tag: 'left'; value: E } | { tag: 'right'; value: A };

const bimap = <E1, E2, A1, A2>(
  fa: Either<E1, A1>,
  f: (e: E1) => E2,
  g: (a: A1) => A2
): Either<E2, A2> =>
  fa.tag === 'left' ? { tag: 'left', value: f(fa.value) } : { tag: 'right', value: g(fa.value) };
```

---

## 4. 自然变换

### 4.1 定义

自然变换 $\alpha: F \Rightarrow G$ 是两个函子之间的映射，满足自然性条件：

$$
\alpha_B \circ F(f) = G(f) \circ \alpha_A
$$

### 4.2 Array.flat 的自然性

```typescript
// 自然变换：flatten: Array<Array<A>> -> Array<A>
const flatten = <A>(arr: A[][]): A[] => arr.flat();

// 自然性条件：flatten ∘ map(map(f)) = map(f) ∘ flatten
const f = (x: number) => x + 1;
const nested = [[1, 2], [3, 4]];

flatten(nested.map(arr => arr.map(f)));
nested.map(arr => arr.map(f)).flat(); // 等价
```

### 4.3 reverse . map = map . reverse

```typescript
const reverse = <A>(arr: A[]): A[] => [...arr].reverse();

// 自然性：reverse 是 Array 函子的自同态
// reverse(map(f)(arr)) = map(f)(reverse(arr))
const arr = [1, 2, 3];
const f = (x: number) => x * 2;

reverse(arr.map(f));     // [6, 4, 2]
arr.reverse().map(f);    // [6, 4, 2]
```

---

## 5. 函子的组合与复合

### 5.1 函子组合

函子可以组合：$(F \circ G)(A) = F(G(A))$

```typescript
// F(A) = Array<A>, G(A) = Promise<A>
// (F ∘ G)(A) = Array<Promise<A>>
const arrOfPromises = [Promise.resolve(1), Promise.resolve(2)];
```

### 5.2 自函子

自函子（Endofunctor）是从范畴到自身的函子。`Array`, `Promise`, `Option` 都是 Set 范畴上的自函子。

---

## 6. TS 类型系统与范畴的等价性讨论

### 6.1 TS 类型系统是否构成范畴？

严格来说，TypeScript 的类型系统**不完全**构成一个良定义的范畴，原因：

1. **`any` 类型**：破坏了类型的良定义性
2. **子类型多态**：使得态射集合不是简单的函数集合
3. **递归类型**：可能导致无限类型展开
4. **副作用**：JavaScript 函数不全是纯函数

### 6.2 "理想化"的 TS 范畴

如果我们限制：

- 排除 `any` 和 `unknown`
- 只考虑全函数（Total Functions）
- 只考虑纯函数（Pure Functions）
- 限制递归类型的深度

则 TypeScript 的简单类型子集**近似构成**一个笛卡尔闭范畴。

---

## 参考文献

1. Mac Lane, S. (1998). *Categories for the Working Mathematician* (2nd ed.). Springer.
2. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
3. Riehl, E. (2016). *Category Theory in Context*. Dover.
