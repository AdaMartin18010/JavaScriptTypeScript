---
title: "伴随函子：类型推断与编译器的自由-遗忘伴随"
description: "从伴随函子视角理解类型推断、自动补全和 React Hooks 的语义"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P1
estimated-length: 3500 words
references:
  - Pierce, Types and Programming Languages (2002)
  - Awodey, Category Theory (2010)
---

# 伴随函子：类型推断与编译器的自由-遗忘伴随

> **理论深度**: 研究生级别
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 编译器开发者、类型系统研究者

---

## 目录

- [伴随函子：类型推断与编译器的自由-遗忘伴随](#伴随函子类型推断与编译器的自由-遗忘伴随)
  - [目录](#目录)
  - [1. 伴随的定义](#1-伴随的定义)
  - [2. 单位与余单位](#2-单位与余单位)
  - [3. 类型推断作为自由-遗忘伴随](#3-类型推断作为自由-遗忘伴随)
  - [4. IDE 自动补全的伴随语义](#4-ide-自动补全的伴随语义)
  - [5. React Hooks 的伴随升降](#5-react-hooks-的伴随升降)
  - [6. 伴随与极限的关系](#6-伴随与极限的关系)
  - [参考文献](#参考文献)

---

## 1. 伴随的定义

> 🚧 **骨架占位符**：伴随函子对 $F \dashv G$ 的定义，Hom-集同构 $Hom(FA, B) \cong Hom(A, GB)$。

---

## 2. 单位与余单位

> 🚧 **骨架占位符**：单位 $\eta: id \to G \circ F$ 和余单位 $\varepsilon: F \circ G \to id$ 的编程实例。

---

## 3. 类型推断作为自由-遗忘伴随

> 🚧 **骨架占位符**：
>
> - 遗忘函子 $U: \mathbf{Typed} \to \mathbf{Untyped}$（忘记类型）
> - 自由函子 $F: \mathbf{Untyped} \to \mathbf{Typed}$（推断最一般类型）
> - $F \dashv U$ 的语义：类型推断是"最优的"

---

## 4. IDE 自动补全的伴随语义

> 🚧 **骨架占位符**：代码补全作为从部分程序到完整程序的"自由构造"。

---

## 5. React Hooks 的伴随升降

> 🚧 **骨架占位符**：`useState` 作为从值到状态的"自由构造"，伴随的升降（Lift/Colimit）语义。

---

## 6. 伴随与极限的关系

> 🚧 **骨架占位符**：左伴随保持余极限，右伴随保持极限（Adjoint Functor Theorem 的直观解释）。

---

## 参考文献

1. Pierce, B. C. (2002). *Types and Programming Languages*. MIT Press. (Ch. 30)
2. Awodey, S. (2010). *Category Theory* (2nd ed.). Oxford University Press. (Ch. 9)
3. Riehl, E. (2016). *Category Theory in Context*. Dover. (Ch. 4)
