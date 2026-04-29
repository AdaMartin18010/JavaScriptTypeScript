# 形式化验证 — 理论基础

## 1. 形式化方法概述

形式化验证是使用数学方法证明系统正确性的技术。与测试（发现错误）不同，形式化验证可以**证明错误不存在**（在模型范围内）。

## 2. 主要技术路径

### 2.1 模型检测（Model Checking）

- 枚举系统所有可能状态
- 验证时序逻辑公式（LTL、CTL）
- 工具：SPIN、TLA+、NuSMV
- 局限：状态爆炸问题

### 2.2 定理证明（Theorem Proving）

- 基于逻辑公理系统手动或半自动推导
- 交互式证明助手：Coq、Isabelle、Agda、Lean
- 适用：复杂算法、密码学协议

### 2.3 抽象解释（Abstract Interpretation）

- 通过抽象域近似程序语义
- 自动静态分析：Astrée、Infer
- 适用：运行时错误检测（空指针、数组越界）

### 2.4 SMT 求解

- 可满足性模理论（Satisfiability Modulo Theories）
- 工具：Z3、CVC5、Yices
- 适用：约束求解、符号执行

## 3. 形式化方法对比

| 方法 | 自动化程度 | 适用规模 | 学习曲线 | 典型工具 |
|------|-----------|----------|----------|----------|
| 模型检测 | 全自动 | 中小规模 | 中 | SPIN、TLA+、NuSMV |
| 定理证明 | 半自动 | 任意规模 | 高 | Coq、Isabelle、Lean |
| 抽象解释 | 全自动 | 大规模 | 低 | Astrée、Infer、Frama-C |
| SMT 求解 | 全自动 | 中小规模 | 中 | Z3、CVC5、Yices |

## 4. 在 JS/TS 中的应用

- **TypeScript 类型系统**: 基于结构子类型的轻量级形式化验证
- **Refinement Types**: 在基本类型上附加谓词（如 `x: number & x > 0`）
- **Property-based Testing**: QuickCheck 风格的随机测试，验证不变量
- **Symbolic Execution**: 符号执行 JS 代码，探索所有执行路径

## 5. 代码示例：TLA+ 规范片段

```tla
---- MODULE DistributedLock ----
EXTENDS Naturals, FiniteSets

CONSTANTS Nodes, MaxClock
VARIABLES clock, owner, requestQueue

TypeInvariant ==
  /\ clock \in [Nodes -> 0..MaxClock]
  /\ owner \in Nodes \union {None}
  /\ requestQueue \in Seq(Nodes)

Safety ==
  (* 任意时刻最多一个节点持有锁 *)
  owner /= None => \A n \in Nodes \ {owner}: clock[n] < clock[owner]

Liveness ==
  (* 请求锁的节点最终能获得锁 *)
  \A n \in Nodes:
    [](n \in Range(requestQueue) => <>(owner = n))
====
```

## 6. 权威参考

- [TLA+ Home Page](https://lamport.azurewebsites.net/tla/tla.html) — Leslie Lamport 官方
- [Software Foundations](https://softwarefoundations.cis.upenn.edu/) — Coq 形式化验证教材
- [Microsoft Z3](https://github.com/Z3Prover/z3) — SMT 求解器
- [Infer by Meta](https://fbinfer.com/) — 静态分析工具

## 7. 与相邻模块的关系

- **40-type-theory-formal**: 类型理论的形式化基础
- **41-formal-semantics**: 程序语义的形式化定义
- **79-compiler-design**: 编译器的形式化验证
