# 70.1 — 范畴论与计算范式 (Category Theory & Computational Paradigms)

> **理论深度**: 研究生级别
> **数学前置**: 建议先读 `01-category-theory-primer-for-programmers.md`
> **代码示例**: [code-examples/](code-examples/)

---

## 目标

从范畴论视角全面重新解释 JavaScript/TypeScript 的语法模型，并与 Rust 进行系统对比分析。
本方向旨在填补现有内容中"仅有范畴论 101 水平"的缺口，将 Yoneda 引理、伴随函子、极限/余极限、笛卡尔闭范畴完整证明、Topos 理论等深层工具系统引入 JS/TS 语境。

---

## 文件索引

| # | 文件 | 核心内容 | 字数 | 代码示例 |
|---|------|---------|------|----------|
| 01 | [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md) | 程序员视角的范畴论基础：范畴、函子、自然变换 | ≥8K | ≥6 |
| 02 | [02-cartesian-closed-categories-and-typescript.md](02-cartesian-closed-categories-and-typescript.md) | 证明 TS 简单类型子集构成 CCC；积/和/指数的完整形式化 | ≥8K | ≥6 |
| 03 | [03-functors-natural-transformations-in-js.md](03-functors-natural-transformations-in-js.md) | Array.map/Promise.then 的函子性；自然变换实例 | ≥8K | ≥6 |
| 04 | [04-monads-algebraic-effects-comparison.md](04-monads-algebraic-effects-comparison.md) | Promise 单子 vs Rust Result；Effect System 范畴论语境 | ≥8K | ≥6 |
| 05 | [05-limits-colimits-and-aggregation-patterns.md](05-limits-colimits-and-aggregation-patterns.md) | reduce/merge 的普遍性质；Promise.all/race 的极限语义 | ≥8K | ≥6 |
| 06 | [06-adjunctions-and-free-forgetful-pairs.md](06-adjunctions-and-free-forgetful-pairs.md) | 类型推断的自由-遗忘伴随；IDE 自动补全的伴随语义 | ≥8K | ≥6 |
| 07 | [07-yoneda-lemma-and-representable-functors.md](07-yoneda-lemma-and-representable-functors.md) | Yoneda 引理的编程意义；API 设计与 TDD 的 Yoneda 视角 | ≥8K | ≥6 |
| 08 | [08-topos-theory-and-type-systems.md](08-topos-theory-and-type-systems.md) | Topos 定义；子对象分类器 ↔ boolean；内部逻辑 | ≥8K | ≥6 |
| 09 | [09-computational-paradigms-as-categories.md](09-computational-paradigms-as-categories.md) | 命令式/函数式/OO/响应式的范畴论统一 | ≥8K | ≥6 |
| 10 | [10-rust-vs-typescript-category-theory-analysis.md](10-rust-vs-typescript-category-theory-analysis.md) | Rust vs TS 全面对比：类型系统/所有权/错误处理/并发 | ≥8K | ≥6 |
| 11 | [11-control-flow-as-categorical-constructs.md](11-control-flow-as-categorical-constructs.md) | if/else/while/try-catch/async 的范畴论构造 | ≥8K | ≥6 |
| 12 | [12-runtime-model-categorical-semantics.md](12-runtime-model-categorical-semantics.md) | Event Loop 的余单子语义；V8 编译管道的自然变换 | ≥8K | ≥6 |
| 13 | [13-variable-system-categorical-analysis.md](13-variable-system-categorical-analysis.md) | 解构赋值/闭包/作用域链/TDZ 的范畴论语义 | ≥8K | ≥6 |
| 14 | [14-event-systems-and-message-passing-categorical-semantics.md](14-event-systems-and-message-passing-categorical-semantics.md) | 事件系统/消息传递/Actor/CSP 的统一范畴语义：Promise 作为 Kleisli 范畴，Stream 作为时间索引函子 | ≥8K | ≥6 |
| 15 | [15-concurrent-computation-models.md](15-concurrent-computation-models.md) | 并发计算模型形式化：进程代数、π演算、CSP、Actor、Petri 网、JS 并发模型 | ≥8K | ≥6 |
| 16 | [16-server-components-categorical-semantics.md](16-server-components-categorical-semantics.md) | React Server Components 的余单子范畴语义：Server/Client 伴随函子、Streaming 余极限、Suspense 拉回 | ≥8K | ≥6 |
| 17 | [17-signals-paradigm-category-theory.md](17-signals-paradigm-category-theory.md) | Signal 范式的统一范畴论语义：时间索引余预层、细粒度响应式余单子 | ≥8K | ≥6 |
| 18 | [18-islands-architecture-categorical-semantics.md](18-islands-architecture-categorical-semantics.md) | Astro Islands 架构的局部化范畴语义： hydration 函子、偏序集、交互边界 | ≥8K | ≥6 |
| 19 | [19-build-tools-category-theory.md](19-build-tools-category-theory.md) | 构建工具理论的范畴论模型：依赖图范畴、增量编译函子、模块联邦余积 | ≥8K | ≥6 |
| 20 | [20-web-components-formal-semantics.md](20-web-components-formal-semantics.md) | Web Components 的形式语义：Custom Elements 初始代数、Shadow DOM 分离函子、对偶关系 | ≥8K | ≥6 |

---

## 核心理论框架

### 1. TypeScript 作为笛卡尔闭范畴 (CCC)

$$
\mathbf{TS} = (Obj, Mor, \circ, id)
$$

其中：

- $Obj$ = TypeScript 类型（忽略 `any` 和递归类型的复杂情况）
- $Mor(A, B)$ = 从 $A$ 到 $B$ 的纯函数
- $\circ$ = 函数组合
- $id_A$ = 恒等函数 `x => x`

**待证明定理**：$\mathbf{TS}$ 是笛卡尔闭范畴，即具有：

1. 终端对象 $1$ ↔ `void`
2. 二元积 $A \times B$ ↔ `{ a: A, b: B }`
3. 指数对象 $B^A$ ↔ `(a: A) => B`

### 2. 编译器作为伴随函子

$$
F \dashv U: \mathbf{Untyped} \rightleftarrows \mathbf{Typed}
$$

- $U$ = 遗忘函子（忘记类型信息）
- $F$ = 自由函子（类型推断 = 最一般的类型）
- $F \dashv U$ 意味着：类型推断是"最优的"

### 3. Promise 单子三元组

$$
(T, \eta, \mu) \text{ 其中 } T(A) = Promise\langle A \rangle
$$

- $\eta_A: A \to Promise\langle A \rangle$ = `Promise.resolve`
- $\mu_A: Promise\langle Promise\langle A \rangle \rangle \to Promise\langle A \rangle$ = `.then` 的展平

---

## 与现有内容的交叉引用

| 本文件 | 引用现有内容 | 关系 |
|--------|-------------|------|
| `02-ccc-and-typescript` | `10.2-type-system/` | 从范畴论语境深化类型系统 |
| `04-monads` | `FUNCTIONAL_PROGRAMMING_THEORY.md` §5 | 深化单子理论，增加 Rust 对比 |
| `09-paradigms` | `FRONTEND_FRAMEWORK_THEORY.md` §1 | 从范畴论统一框架形式化模型 |
| `10-rust-vs-ts` | `10.2-type-system/`, `10.3-execution-model/` | 跨语言范畴论对比 |
| `12-runtime` | `CONCURRENCY_MODELS_DEEP_DIVE.md` | 从范畴论重新解释并发模型 |

---

## 参考文献

- Awodey, *Category Theory* (2nd ed., 2010)
- Pierce, *Basic Category Theory for Computer Scientists* (1991)
- Pierce, *Types and Programming Languages* (2002)
- Mac Lane, *Categories for the Working Mathematician* (1998)
- Riehl, *Category Theory in Context* (2016)
- Milewski, *Category Theory for Programmers* (2019)
- Lambek & Scott, *Introduction to Higher-Order Categorical Logic* (1986)
- Moggi, "Notions of Computation and Monads" (1991)
- Plotkin & Pretnar, "Handlers of Algebraic Effects" (2009)
- Goldblatt, *Topoi* (1984)
- Jacobs, *Categorical Logic and Type Theory* (1999)
