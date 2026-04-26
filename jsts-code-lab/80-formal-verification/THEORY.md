# 形式化验证理论

> 本文档为 `80-formal-verification` 模块提供理论基础，涵盖 Hoare 逻辑、分离逻辑、模型检测与 TLA+ 的核心概念，并映射到代码实验室中的可运行实现。

---

## 目录

- [形式化验证理论](#形式化验证理论)
  - [目录](#目录)
  - [1. Hoare 逻辑基础](#1-hoare-逻辑基础)
    - [1.1 Hoare 三元组](#11-hoare-三元组)
    - [1.2 最强前置条件与最弱前置条件](#12-最强前置条件与最弱前置条件)
  - [2. 分离逻辑 (Separation Logic)](#2-分离逻辑-separation-logic)
    - [2.1 堆断言与分离合取](#21-堆断言与分离合取)
    - [2.2 框架规则 (Frame Rule)](#22-框架规则-frame-rule)
    - [2.3 与 JavaScript 的关联](#23-与-javascript-的关联)
  - [3. 模型检测 (Model Checking)](#3-模型检测-model-checking)
    - [3.1 概念定义](#31-概念定义)
    - [3.2 线性时序逻辑 (LTL)](#32-线性时序逻辑-ltl)
    - [3.3 状态爆炸问题](#33-状态爆炸问题)
  - [4. TLA+ 与状态机规约](#4-tla-与状态机规约)
    - [4.1 TLA+ 核心概念](#41-tla-核心概念)
    - [4.2 规范结构](#42-规范结构)
    - [4.3 与分布式系统的映射](#43-与分布式系统的映射)
  - [5. 与代码实现的映射](#5-与代码实现的映射)
    - [5.1 代码实验室中的形式化验证模块](#51-代码实验室中的形式化验证模块)
    - [5.2 从理论到代码的翻译示例](#52-从理论到代码的翻译示例)
  - [6. 学习路径与前置知识](#6-学习路径与前置知识)
    - [前置要求](#前置要求)
    - [后续进阶](#后续进阶)

---

## 1. Hoare 逻辑基础

### 1.1 Hoare 三元组

Hoare 逻辑使用三元组 `{P} C {Q}` 描述程序语句 `C` 的前置条件 `P` 和后置条件 `Q`：

```
{P} C {Q}  ⟺  若执行 C 前 P 成立，且 C 终止，则执行后 Q 成立
```

**核心推理规则**：

| 规则 | 形式 |
|------|------|
| 赋值规则 | `{Q[x/e]} x := e {Q}` |
| 顺序规则 | `{P} C₁ {R}, {R} C₂ {Q} ⊢ {P} C₁; C₂ {Q}` |
| 条件规则 | `{P∧B} C₁ {Q}, {P∧¬B} C₂ {Q} ⊢ {P} if B then C₁ else C₂ {Q}` |
| 循环规则 | `{P∧B} C {P} ⊢ {P} while B do C {P∧¬B}` |

**循环不变式 (Loop Invariant)**：
循环规则中的 `P` 即为循环不变式——在每次循环迭代前后均保持为真的谓词。证明循环正确性的关键是构造并验证循环不变式。

### 1.2 最强前置条件与最弱前置条件

- **最弱前置条件 (wp)**：`wp(C, Q)` 是使得 `{wp(C, Q)} C {Q}` 成立的最弱谓词。
- **最强后置条件 (sp)**：`sp(P, C)` 是 `{P} C {sp(P, C)}` 成立的最强谓词。

```
wp(x := e, Q) = Q[x/e]
wp(C₁; C₂, Q) = wp(C₁, wp(C₂, Q))
wp(if B then C₁ else C₂, Q) = (B → wp(C₁, Q)) ∧ (¬B → wp(C₂, Q))
```

---

## 2. 分离逻辑 (Separation Logic)

### 2.1 堆断言与分离合取

分离逻辑扩展了 Hoare 逻辑，专门处理**指针和堆内存**的推理。引入分离合取运算符 `*` (separating conjunction)：

```
P * Q  ⟺  堆可被划分为不相交的两部分，一部分满足 P，另一部分满足 Q
```

**核心断言**：

| 断言 | 含义 |
|------|------|
| `emp` | 空堆 |
| `x ↦ v` | 地址 `x` 处存储值为 `v` |
| `P * Q` | 堆可分割，分别满足 P 和 Q |
| `P -* Q` | 若将满足 P 的堆与当前堆合并，则合并后的堆满足 Q |

### 2.2 框架规则 (Frame Rule)

```
{P} C {Q}           {P} C {Q}
───────────────  ⊢  ─────────────────
{P * R} C {Q * R}   {P * R} C {Q * R}   (Mod(C) ∩ Free(R) = ∅)
```

框架规则是分离逻辑的核心：若程序 `C` 在局部堆上正确运行，则它在更大的全局堆上（添加不相关的 `R`）也同样正确，且不会破坏 `R`。

### 2.3 与 JavaScript 的关联

JavaScript 的引用类型（对象、数组、闭包）均分配在堆上。分离逻辑为分析以下问题提供了形式化基础：

- 对象所有权与借用（类似 Rust 的所有权模型思想）
- 内存泄漏检测：是否存在无法到达的堆单元
- 并发安全：SharedArrayBuffer 上的数据竞争分析

---

## 3. 模型检测 (Model Checking)

### 3.1 概念定义

模型检测是一种**自动验证**有限状态系统是否满足给定时序逻辑规约的技术。

```
M ⊨ φ

其中：
  M = (S, S₀, R, L)  为 Kripke 结构（状态、初始状态、迁移关系、标签函数）
  φ  为 CTL* / LTL 时序逻辑公式
```

### 3.2 线性时序逻辑 (LTL)

| 运算符 | 含义 |
|--------|------|
| `□p` (G p) | 始终 p |
| `◇p` (F p) | 最终 p |
| `○p` (X p) | 下一状态 p |
| `p U q` | p 一直成立直到 q 成立 |

**典型规约**：

- 安全性 (Safety)：`□¬(critical₁ ∧ critical₂)` — 两进程永不同时进入临界区
- 活性 (Liveness)：`□(request → ◇grant)` — 请求终将得到响应

### 3.3 状态爆炸问题

模型检测的主要挑战是**状态空间随变量数指数增长**。常用缓解技术：

- **符号模型检测**（使用 BDD  compact 表示状态集合）
- **抽象解释**（Over-approximation，验证抽象模型）
- **偏序归约**（利用独立性减少等价状态探索）

---

## 4. TLA+ 与状态机规约

### 4.1 TLA+ 核心概念

TLA+ (Temporal Logic of Actions) 是 Leslie Lamport 设计的规约语言，基于以下数学对象：

- **状态 (State)**：变量到值的映射
- **行为 (Behavior)**：无限状态序列 `s₁ → s₂ → s₃ → ...`
- **动作 (Action)**：状态间的关系，表示状态迁移的谓词

### 4.2 规范结构

一个典型的 TLA+ 规范形式为：

```tla
Spec ≜ Init ∧ □[Next]_{vars} ∧ Liveness
```

| 部分 | 含义 |
|------|------|
| `Init` | 初始状态谓词 |
| `Next` | 下一步动作（状态迁移） |
| `□[Next]_{vars}` | 始终执行 `Next` 或 vars 不改变 (stuttering) |
| `Liveness` | 活性条件（如 `WF_vars(Next)`） |

### 4.3 与分布式系统的映射

`70-distributed-systems/THEORY.md` 中讨论的 Raft、2PC、Saga 等协议，均可使用 TLA+ 进行形式化规约。TLA+ 尤其适合验证：

- 共识算法的安全性（Safety）：不会选举两个不同 Leader
- 活性（Liveness）：请求最终会被提交
- 边界条件：网络分区恢复后的行为

---

## 5. 与代码实现的映射

### 5.1 代码实验室中的形式化验证模块

`80-formal-verification/` 目录下的 TypeScript 实现，按以下主题组织：

| 代码文件 | 对应理论 | 说明 |
|----------|---------|------|
| `loop-invariant-*.ts` | Hoare 逻辑 §1 | 循环不变式的构造与验证 |
| `separation-logic-*.ts` | 分离逻辑 §2 | 堆操作的权限模型演示 |
| `model-checking-*.ts` | 模型检测 §3 | 简单的 LTL 语义检查器 |
| `tla-plus-patterns/` | TLA+ §4 | 常见规约模式的 TypeScript 模拟 |

### 5.2 从理论到代码的翻译示例

**Hoare 三元组** → TypeScript 断言函数：

```typescript
// {x > 0} x = x + 1 {x > 1}
function increment(x: number): number {
  assert(x > 0, 'Precondition failed');
  const result = x + 1;
  assert(result > 1, 'Postcondition failed');
  return result;
}
```

**分离逻辑** → 所有权追踪：

```typescript
// {x ↦ 5 * y ↦ 10}
// swap(x, y)
// {x ↦ 10 * y ↦ 5}
function swap(a: { value: number }, b: { value: number }): void {
  const temp = a.value;
  a.value = b.value;
  b.value = temp;
}
```

---

## 6. 学习路径与前置知识

### 前置要求

1. `02-design-patterns/THEORY.md` — 设计原则与模块化思维
2. `04-data-structures/THEORY.md` — 算法复杂度与不变式
3. `70-distributed-systems/THEORY.md` — 分布式协议的安全性与活性

### 后续进阶

- `77-quantum-computing/THEORY.md` — 量子算法的形式化证明
- `41-formal-semantics/THEORY.md` — 操作语义与类型安全

---

> **参考**
>
> - C.A.R. Hoare. "An Axiomatic Basis for Computer Programming" (1969)
> - Reynolds, J.C. "Separation Logic: A Logic for Shared Mutable Data Structures" (2002)
> - Edmund M. Clarke et al. "Model Checking" (1999)
> - Leslie Lamport. "Specifying Systems" (2002)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `bounded-model-checking.ts`
- `hoare-logic.ts`
- `index.ts`
- `program-correctness-proofs.ts`
- `property-based-testing.ts`
- `refinement-types.ts`
- `separation-logic.ts`
- `smt-solver-bridge.ts`
- `symbolic-execution.ts`
- `temporal-logic.ts`
- `tla-plus-patterns.ts`
- `tlaplus-lite.ts`
- `type-safe-state-machine.ts`
- `type-safe-statemachine.ts`
- `verification-framework.ts`
- `weakest-precondition.ts`
- `z3-smt-bridge.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
