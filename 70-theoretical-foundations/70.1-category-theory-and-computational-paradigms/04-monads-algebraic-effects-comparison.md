---
title: "单子与代数效应：Promise/Async 与 Rust Result 的深度对比"
description: "从单子三元组到代数效应处理器，系统对比 JS/TS 与 Rust 的计算模型"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P0
estimated-length: 5000 words
references:
  - Moggi, Notions of Computation and Monads (1991)
  - Plotkin & Pretnar, Handlers of Algebraic Effects (2009)
  - Pierce, Types and Programming Languages (2002)
---

# 单子与代数效应：Promise/Async 与 Rust Result 的深度对比

> **理论深度**: 研究生级别
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md), [03-functors-natural-transformations-in-js.md](03-functors-natural-transformations-in-js.md)
> **目标读者**: 语言设计者、高级框架开发者

---

## 目录

- [单子与代数效应：Promise/Async 与 Rust Result 的深度对比](#单子与代数效应promiseasync-与-rust-result-的深度对比)
  - [目录](#目录)
  - [1. 单子的完整定义](#1-单子的完整定义)
  - [2. Promise 作为单子三元组](#2-promise-作为单子三元组)
  - [3. async/await 作为 do-notation](#3-asyncawait-作为-do-notation)
  - [4. Rust 的 Result\<T, E\> 作为 Either Monad](#4-rust-的-resultt-e-作为-either-monad)
  - [5. Rust 的 ? 操作符与 TS 的 try/catch 的范畴论差异](#5-rust-的--操作符与-ts-的-trycatch-的范畴论差异)
  - [6. React Algebra Effects 的范畴论模型](#6-react-algebra-effects-的范畴论模型)
  - [7. Effect System 的范畴论语境](#7-effect-system-的范畴论语境)
  - [8. 正例与反例对比表](#8-正例与反例对比表)
  - [参考文献](#参考文献)

---

## 1. 单子的完整定义

> 🚧 **骨架占位符**：单子三元组 $(T, \eta, \mu)$ 的完整定义，Kleisli 范畴，单子律的结合律与单位律。

---

## 2. Promise 作为单子三元组

> 🚧 **骨架占位符**：Promise 的 $T$, $\eta$, $\mu$ 完整形式化，已有内容深化。

---

## 3. async/await 作为 do-notation

> 🚧 **骨架占位符**：async/await 的 desugaring 到 monadic bind，与 Haskell do-notation 的对比。

---

## 4. Rust 的 Result<T, E> 作为 Either Monad

> 🚧 **骨架占位符**：`Result<T, E>` 的 monad 实例，`?` 操作符作为 Kleisli 组合。

---

## 5. Rust 的 ? 操作符与 TS 的 try/catch 的范畴论差异

> 🚧 **骨架占位符**：`?` 的显式传播 vs `try/catch` 的隐式捕获，在范畴论语义上的根本差异。

---

## 6. React Algebra Effects 的范畴论模型

> 🚧 **骨架占位符**：React Fiber 模拟代数效应的范畴论语义，已有内容深化。

---

## 7. Effect System 的范畴论语境

> 🚧 **骨架占位符**：Koka、Eff、ReScript 的效应系统如何在范畴论语境中理解。

---

## 8. 正例与反例对比表

> 🚧 **骨架占位符**：每种 monad 给出 TS 和 Rust 的完整可运行代码示例，包括边界情况。

---

## 参考文献

1. Moggi, E. (1991). "Notions of Computation and Monads." *Information and Computation*, 93(1), 55-92.
2. Plotkin, G., & Pretnar, M. (2009). "Handlers of Algebraic Effects." *ESOP 2009*.
3. Pierce, B. C. (2002). *Types and Programming Languages*. MIT Press.
4. Wadler, P. (1995). "Monads for Functional Programming." *Advanced Functional Programming*.
5. React Core Team. "React Fiber Architecture." (Technical documentation)
