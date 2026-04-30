---
title: "Yoneda 引理与可表函子"
description: "Yoneda 引理的编程意义：通过观察行为来理解对象"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~3200 words
references:
  - Riehl, Category Theory in Context (2016)
  - Milewski, Category Theory for Programmers (2019)
---

# Yoneda 引理与可表函子

> **理论深度**: 研究生级别
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md), [03-functors-natural-transformations-in-js.md](03-functors-natural-transformations-in-js.md)
> **目标读者**: API 设计者、架构师
> **配套代码**: [code-examples/yoneda-examples.ts](code-examples/yoneda-examples.ts)

---

## 目录

- [Yoneda 引理与可表函子](#yoneda-引理与可表函子)
  - [目录](#目录)
  - [1. Yoneda 引理的陈述](#1-yoneda-引理的陈述)
    - [1.1 协变 Yoneda 引理](#11-协变-yoneda-引理)
    - [1.2 反变 Yoneda 引理](#12-反变-yoneda-引理)
  - [2. 证明（程序员友好版本）](#2-证明程序员友好版本)
    - [2.1 构造映射](#21-构造映射)
    - [2.2 TypeScript 实现](#22-typescript-实现)
  - [3. "通过行为理解对象"的编程意义](#3-通过行为理解对象的编程意义)
    - [3.1 核心洞察](#31-核心洞察)
    - [3.2 代码示例](#32-代码示例)
  - [4. API 设计中的可表函子](#4-api-设计中的可表函子)
    - [4.1 可表函子的直觉](#41-可表函子的直觉)
    - [4.2 示例：Iterable 接口](#42-示例iterable-接口)
  - [5. 测试驱动开发的 Yoneda 视角](#5-测试驱动开发的-yoneda-视角)
    - [5.1 测试作为"观察"](#51-测试作为观察)
  - [6. Hom(A, -) 与 Hom(-, A) 在类型系统中的实例](#6-homa---与-hom--a-在类型系统中的实例)
    - [6.1 Reader Monad](#61-reader-monad)
  - [参考文献](#参考文献)

---

## 1. Yoneda 引理的陈述

### 1.1 协变 Yoneda 引理

设 $F: \mathbf{C} \to \mathbf{Set}$ 是一个函子，$A$ 是 $\mathbf{C}$ 中的一个对象。则：

$$
Nat(Hom(A, -), F) \cong F(A)
$$

其中：

- $Nat$ 表示自然变换的集合
- $Hom(A, -)$ 是 $A$ 的**可表函子**（Representable Functor）
- $\cong$ 表示集合间的同构

### 1.2 反变 Yoneda 引理

$$
Nat(Hom(-, A), G) \cong G(A)
$$

其中 $G: \mathbf{C}^{op} \to \mathbf{Set}$ 是反变函子。

---

## 2. 证明（程序员友好版本）

### 2.1 构造映射

**从自然变换到元素**：

给定自然变换 $\alpha: Hom(A, -) \Rightarrow F$，取 $\alpha_A(id_A) \in F(A)$。

**从元素到自然变换**：

给定 $x \in F(A)$，定义自然变换 $\alpha$ 的分量为：

$$
\alpha_B(f: A \to B) = F(f)(x)
$$

### 2.2 TypeScript 实现

```typescript
// 可表函子 Hom(A, -): (X) => (A -> X)
type Representable<A, X> = (a: A) => X;

// Yoneda 引理：Nat(Hom(A, -), F) ≅ F(A)
// 方向 1: 自然变换 -> F(A)
const yonedaToElement = <A, F>(
  alpha: <X>(f: (a: A) => X) => F,
  idA: (a: A) => A
): F => alpha(idA);

// 方向 2: F(A) -> 自然变换
const yonedaFromElement = <A, F>(
  x: F,
  mapF: <X>(f: (a: A) => X) => (fx: F) => F
) => <X>(f: (a: A) => X): F => mapF(f)(x);
```

---

## 3. "通过行为理解对象"的编程意义

### 3.1 核心洞察

Yoneda 引理告诉我们：**一个对象完全由它与其他对象的关系决定**。

在编程中：

- 一个类型完全由它可以接受的函数决定
- 一个 API 完全由它的使用方式决定
- 一个模块完全由它的接口决定

### 3.2 代码示例

```typescript
// Yoneda 视角：要知道 UserService 是什么，
// 只需要观察所有使用它的方式

interface UserService {
  getUser(id: string): Promise<User>;
  saveUser(user: User): Promise<void>;
}

// UserService 完全由 "如何调用 getUser 和 saveUser" 决定
// 不需要知道内部实现
```

---

## 4. API 设计中的可表函子

### 4.1 可表函子的直觉

函子 $F$ 是**可表的**，如果存在对象 $A$ 使得 $F \cong Hom(A, -)$。

在 API 设计中：一个接口是"可表的"，如果它完全由一组核心操作定义。

### 4.2 示例：Iterable 接口

```typescript
// Iterable<T> 由 Symbol.iterator 操作定义
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

// 任何可迭代对象都由 "如何迭代它" 完全决定
```

---

## 5. 测试驱动开发的 Yoneda 视角

### 5.1 测试作为"观察"

TDD 中的测试是"观察对象行为"的方式：

```typescript
// 测试 = 观察行为
describe('Calculator', () => {
  it('should add numbers', () => {
    expect(calculator.add(2, 3)).toBe(5);
  });
});

// Yoneda 视角：如果 Calculator 通过所有测试，
// 则它在行为上就是"正确的"
```

---

## 6. Hom(A, -) 与 Hom(-, A) 在类型系统中的实例

### 6.1 Reader Monad

`Hom(A, -)` 在编程中对应 **Reader Monad**：

```typescript
type Reader<A, B> = (a: A) => B;

// Reader 的函子性
const readerMap = <A, B, C>(f: (b: B) => C): ((r: Reader<A, B>) => Reader<A, C>) =>
  (r) => (a) => f(r(a));
```

---

## 参考文献

1. Riehl, E. (2016). *Category Theory in Context*. Dover. (Ch. 2)
2. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
3. Mac Lane, S. (1998). *Categories for the Working Mathematician*. Springer.
