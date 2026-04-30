---
title: "程序员视角的范畴论基础"
description: "为 JS/TS 开发者建立范畴论直觉，无需抽象代数前置知识"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P1
estimated-length: 3000 words
references:
  - Awodey, Category Theory (2nd ed., 2010)
  - Pierce, Basic Category Theory for Computer Scientists (1991)
  - Milewski, Category Theory for Programmers (2019)
---

# 程序员视角的范畴论基础

> **理论深度**: 入门级（为后续章节建立共同语言）
> **目标读者**: 有 JS/TS 经验的开发者，无范畴论背景
> **建议阅读时间**: 45 分钟

---

## 目录

- [程序员视角的范畴论基础](#程序员视角的范畴论基础)
  - [目录](#目录)
  - [1. 为什么程序员需要范畴论？](#1-为什么程序员需要范畴论)
  - [2. 范畴的定义](#2-范畴的定义)
    - [2.1 对象与态射](#21-对象与态射)
    - [2.2 组合律与单位律](#22-组合律与单位律)
    - [2.3 交换图](#23-交换图)
  - [3. 程序员熟悉的范畴例子](#3-程序员熟悉的范畴例子)
    - [3.1 Set — 集合与函数](#31-set--集合与函数)
    - [3.2 Poset — 偏序集与单调函数](#32-poset--偏序集与单调函数)
    - [3.3 Mon — 幺半群与幺半群同态](#33-mon--幺半群与幺半群同态)
    - [3.4 TypeScript 类型范畴](#34-typescript-类型范畴)
  - [4. 态射的分类](#4-态射的分类)
  - [5. 函子的直觉](#5-函子的直觉)
  - [6. 自然变换的直觉](#6-自然变换的直觉)
  - [7. 从范畴论看编程概念](#7-从范畴论看编程概念)
  - [8. 通往深层理论的路径](#8-通往深层理论的路径)
  - [参考文献](#参考文献)

---

## 1. 为什么程序员需要范畴论？

> 🚧 **骨架占位符**：本节将阐述范畴论作为"数学中的设计模式"的编程价值，解释为什么 Haskell/Scala/TypeScript 的类型系统设计者都需要范畴论工具。

---

## 2. 范畴的定义

> 🚧 **骨架占位符**：本节将给出范畴的公理化定义（对象、态射、组合、单位元），用 TypeScript 类型和函数作为具体例子。

### 2.1 对象与态射

### 2.2 组合律与单位律

### 2.3 交换图

---

## 3. 程序员熟悉的范畴例子

> 🚧 **骨架占位符**：本节将列举程序员日常使用的范畴实例。

### 3.1 Set — 集合与函数

### 3.2 Poset — 偏序集与单调函数

### 3.3 Mon — 幺半群与幺半群同态

### 3.4 TypeScript 类型范畴

---

## 4. 态射的分类

> 🚧 **骨架占位符**：单态射（Monomorphism）、满态射（Epimorphism）、同构（Isomorphism）的定义与编程实例。

---

## 5. 函子的直觉

> 🚧 **骨架占位符**：协变函子、反变函子、双函子，用 `Array.map`、`Promise.then`、`Contravariant` 类型作为例子。

---

## 6. 自然变换的直觉

> 🚧 **骨架占位符**：自然变换作为"函子之间的映射"，用 `map(f).flat()` vs `flatMap(f)` 的自然性条件作为例子。

---

## 7. 从范畴论看编程概念

> 🚧 **骨架占位符**：将常见的编程概念（组合、管道、高阶函数、泛型）重新解释为范畴论语义。

---

## 8. 通往深层理论的路径

> 🚧 **骨架占位符**：预告后续章节将深入的内容（CCC、Adjunction、Yoneda、Topos），建立阅读路径。

---

## 参考文献

1. Awodey, S. (2010). *Category Theory* (2nd ed.). Oxford University Press.
2. Pierce, B. C. (1991). *Basic Category Theory for Computer Scientists*. MIT Press.
3. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
4. Leinster, T. (2014). *Basic Category Theory*. Cambridge University Press.
