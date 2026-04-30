---
title: "极限与余极限：reduce/merge/spread 的普遍性质"
description: "从范畴论极限视角重新理解 JS/TS 中的聚合模式"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P1
estimated-length: 3500 words
references:
  - Leinster, Basic Category Theory (2014)
  - Spivak, Category Theory for the Sciences (2014)
---

# 极限与余极限：reduce/merge/spread 的普遍性质

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 算法设计者、函数式编程爱好者

---

## 目录

- [极限与余极限：reduce/merge/spread 的普遍性质](#极限与余极限reducemergespread-的普遍性质)
  - [目录](#目录)
  - [1. 极限与余极限的定义](#1-极限与余极限的定义)
  - [2. Array.prototype.reduce 作为等化子](#2-arrayprototypereduce-作为等化子)
  - [3. Object.assign 与余积](#3-objectassign-与余积)
  - [4. Promise.all 作为积的极限](#4-promiseall-作为积的极限)
  - [5. Promise.race 作为余极限](#5-promiserace-作为余极限)
  - [6. 拉回与类型交集](#6-拉回与类型交集)
  - [7. 推出与类型联合](#7-推出与类型联合)
  - [8. 其他极限实例](#8-其他极限实例)
  - [参考文献](#参考文献)

---

## 1. 极限与余极限的定义

> 🚧 **骨架占位符**：锥（Cone）、余锥（Cocone）、泛性质（Universal Property）的定义。

---

## 2. Array.prototype.reduce 作为等化子

> 🚧 **骨架占位符**：`reduce` 的普遍性质，从极限视角解释为什么 reduce 是"最一般的"聚合。

---

## 3. Object.assign 与余积

> 🚧 **骨架占位符**：`Object.assign(a, b)` 作为余积的注入，与范畴和的关系。

---

## 4. Promise.all 作为积的极限

> 🚧 **骨架占位符**：`Promise.all([p1, p2])` 作为离散图上的极限（Limit over discrete diagram）。

---

## 5. Promise.race 作为余极限

> 🚧 **骨架占位符**：`Promise.race([p1, p2])` 作为余极限，以及其与极限的对偶关系。

---

## 6. 拉回与类型交集

> 🚧 **骨架占位符**：`A & B` 作为拉回（Pullback），类型守卫作为拉回的条件。

---

## 7. 推出与类型联合

> 🚧 **骨架占位符**：`A | B` 作为推出（Pushout），判别式联合类型（Discriminated Union）的推出语义。

---

## 8. 其他极限实例

> 🚧 **骨架占位符**：等化子（Equalizer）、余等化子（Coequalizer）、终端/初始对象作为极限的特例。

---

## 参考文献

1. Leinster, T. (2014). *Basic Category Theory*. Cambridge University Press.
2. Spivak, D. I. (2014). *Category Theory for the Sciences*. MIT Press.
3. Riehl, E. (2016). *Category Theory in Context*. Dover. (Ch. 3)
