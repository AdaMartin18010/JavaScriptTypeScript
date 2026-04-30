---
title: "控制流的范畴论构造"
description: "if/else/while/try-catch/async 的范畴语义分析"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P2
estimated-length: 3000 words
references:
  - Pierce, Types and Programming Languages (2002)
  - Harper, Practical Foundations for Programming Languages (2016)
---

# 控制流的范畴论构造

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 编译器开发者、语言研究者

---

## 目录

- [控制流的范畴论构造](#控制流的范畴论构造)
  - [目录](#目录)
  - [1. 顺序执行：态射组合](#1-顺序执行态射组合)
  - [2. 条件分支：余积的 Case 分析](#2-条件分支余积的-case-分析)
  - [3. 循环：初始代数的 Fold](#3-循环初始代数的-fold)
  - [4. 异常：余单子的扩展](#4-异常余单子的扩展)
  - [5. 异步：单子变换](#5-异步单子变换)
  - [6. Generator：余自由单子](#6-generator余自由单子)
  - [参考文献](#参考文献)

---

## 1. 顺序执行：态射组合

> 🚧 **骨架占位符**：顺序执行语句 `a; b` 作为态射组合 $g \circ f$。

---

## 2. 条件分支：余积的 Case 分析

> 🚧 **骨架占位符**：`if/else` 作为余积的 case 分析 $[f, g]: A + B \to C$。

---

## 3. 循环：初始代数的 Fold

> 🚧 **骨架占位符**：`while` 作为初始代数（Initial Algebra）的 fold，`for` 作为列表的迭代。

---

## 4. 异常：余单子的扩展

> 🚧 **骨架占位符**：`try/catch` 作为余单子（Comonad）的扩展，或 Exception Monad。

---

## 5. 异步：单子变换

> 🚧 **骨架占位符**：`async/await` 作为单子变换（Monad Transformer），组合多个计算效应。

---

## 6. Generator：余自由单子

> 🚧 **骨架占位符**：`function*` 作为余自由单子（Cofree Monad），迭代器的范畴论语义。

---

## 参考文献

1. Pierce, B. C. (2002). *Types and Programming Languages*. MIT Press.
2. Harper, R. (2016). *Practical Foundations for Programming Languages* (2nd ed.). Cambridge.
3. Moggi, E. (1991). "Notions of Computation and Monads." *Information and Computation*, 93(1), 55-92.
