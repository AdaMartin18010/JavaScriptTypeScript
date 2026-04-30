---
title: "函子与自然变换在 JavaScript/TypeScript 中的体现"
description: "从 Array.map 到 Promise.then，系统分析 JS/TS 中的函子性和自然性"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P1
estimated-length: 3000 words
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
  - [2. 反变函子](#2-反变函子)
  - [3. 双函子](#3-双函子)
  - [4. 自然变换](#4-自然变换)
  - [5. 函子的组合与复合](#5-函子的组合与复合)
  - [6. TS 类型系统与范畴的等价性讨论](#6-ts-类型系统与范畴的等价性讨论)
  - [参考文献](#参考文献)

---

## 1. 协变函子

> 🚧 **骨架占位符**：`Array.map`, `Promise.then`, `Option.map`, `Tree.map` 的函子性证明。

---

## 2. 反变函子

> 🚧 **骨架占位符**：`Contravariant` 类型、`(a: A) => void` 中的 A 的反变性、`Comparer` 函子。

---

## 3. 双函子

> 🚧 **骨架占位符**：`Promise.all` 作为积函子、`Either` 作为和函子、`Function` 作为指数函子。

---

## 4. 自然变换

> 🚧 **骨架占位符**：`Array.map(f).flat()` vs `Array.flatMap(f)` 的自然性条件、`reverse . map = map . reverse`。

---

## 5. 函子的组合与复合

> 🚧 **骨架占位符**：函子组合 $F \circ G$、Endofunctor（自函子）的例子。

---

## 6. TS 类型系统与范畴的等价性讨论

> 🚧 **骨架占位符**：讨论 TypeScript 的类型系统是否与某个良定义的范畴等价，以及等价性受限的原因。

---

## 参考文献

1. Mac Lane, S. (1998). *Categories for the Working Mathematician* (2nd ed.). Springer.
2. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
3. Riehl, E. (2016). *Category Theory in Context*. Dover.
