---
title: "单子与代数效应：Promise/Async 与 Rust Result 的深度对比"
description: "从单子三元组到代数效应处理器，系统对比 JS/TS 与 Rust 的计算模型，含完整形式化定义、精确直觉类比、正例与反例"
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P0
actual-length: ~12000 words
references:
  - Moggi, Notions of Computation and Monads (1991)
  - Plotkin & Pretnar, Handlers of Algebraic Effects (2009)
  - Wadler, Monads for Functional Programming (1995)
  - The Rust Programming Language (2nd ed., 2023)
---

# 单子与代数效应：Promise/Async 与 Rust Result 的深度对比

> **理论深度**: 研究生级别
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md), [03-functors-natural-transformations-in-js.md](03-functors-natural-transformations-in-js.md)
> **目标读者**: 语言设计者、高级框架开发者、全栈架构师
> **配套代码**: [code-examples/](#)

---

## 目录

- [单子与代数效应：Promise/Async 与 Rust Result 的深度对比](#单子与代数效应promiseasync-与-rust-result-的深度对比)
  - [目录](#目录)
  - [0. 从一个真实的故事开始](#0-从一个真实的故事开始)
  - [1. 为什么需要计算效应的形式化理论？](#1-为什么需要计算效应的形式化理论)
    - [1.1 痛点：回调地狱不是语法问题，而是语义问题](#11-痛点回调地狱不是语法问题而是语义问题)
    - [1.2 历史脉络：从 GOTO 到 Monad 的三十年](#12-历史脉络从-goto-到-monad-的三十年)
    - [1.3 没有这些理论，我们会错过什么？](#13-没有这些理论我们会错过什么)
  - [2. 单子的范畴论定义：从观察到形式化](#2-单子的范畴论定义从观察到形式化)
    - [2.1 实际观察：计算不总是纯粹的](#21-实际观察计算不总是纯粹的)
    - [2.2 抽象问题：如何组合带有上下文的计算](#22-抽象问题如何组合带有上下文的计算)
    - [2.3 形式化定义：单子三元组](#23-形式化定义单子三元组)
    - [2.4 Kleisli 范畴与 bind 操作](#24-kleisli-范畴与-bind-操作)
    - [2.5 精确直觉类比：单子不是"盒子"](#25-精确直觉类比单子不是盒子)
  - [3. Promise 作为单子三元组](#3-promise-作为单子三元组)
    - [3.1 正例：Promise 的函子性](#31-正例promise-的函子性)
    - [3.2 反例：Promise.then 不是严格的 map](#32-反例promisethen-不是严格的-map)
    - [3.3 正例：Promise 的单子结构完整实现](#33-正例promise-的单子结构完整实现)
    - [3.4 反例：Promise.resolve 的 assimilation 陷阱](#34-反例promiseresolve-的-assimilation-陷阱)
    - [3.5 单子律验证](#35-单子律验证)
  - [4. async/await 作为 do-notation](#4-asyncawait-作为-do-notation)
    - [4.1 历史背景：Haskell 的 do-notation 解决了什么问题](#41-历史背景haskell-的-do-notation-解决了什么问题)
    - [4.2 正例：async/await 的脱糖语义](#42-正例asyncawait-的脱糖语义)
    - [4.3 反例：隐式异常包装导致的类型欺骗](#43-反例隐式异常包装导致的类型欺骗)
    - [4.4 反例：并发顺序的迷惑性](#44-反例并发顺序的迷惑性)
  - [5. Rust Result 作为 Either Monad](#5-rust-result-作为-either-monad)
    - [5.1 正例：显式错误传播的 Either 结构](#51-正例显式错误传播的-either-结构)
    - [5.2 反例：? 操作符在闭包中的编译失败](#52-反例-操作符在闭包中的编译失败)
    - [5.3 正例：? 操作符的 Kleisli 语义](#53-正例-操作符的-kleisli-语义)
    - [5.4 反例：Result 的误用——将错误当控制流](#54-反例result-的误用将错误当控制流)
  - [6. 对称差分析：Promise vs Result vs Maybe vs Continuation](#6-对称差分析promise-vs-result-vs-maybe-vs-continuation)
    - [6.1 四个计算模型的精确差异](#61-四个计算模型的精确差异)
    - [6.2 边界条件与场景分析](#62-边界条件与场景分析)
    - [6.3 决策矩阵：什么时候选什么](#63-决策矩阵什么时候选什么)
  - [7. Rust ? 操作符与 TS try/catch 的范畴论差异](#7-rust--操作符与-ts-trycatch-的范畴论差异)
    - [7.1 显式 vs 隐式错误传播](#71-显式-vs-隐式错误传播)
    - [7.2 正例：结构化效应的可组合性](#72-正例结构化效应的可组合性)
    - [7.3 反例：非结构化效应的隐藏成本](#73-反例非结构化效应的隐藏成本)
  - [8. React Fiber 与代数效应的范畴论模型](#8-react-fiber-与代数效应的范畴论模型)
    - [8.1 代数效应的核心思想：perform/handle](#81-代数效应的核心思想performhandle)
    - [8.2 正例：Hooks 作为效应操作的 Handler](#82-正例hooks-作为效应操作的-handler)
    - [8.3 反例：违反 Hooks 规则导致的运行时崩溃](#83-反例违反-hooks-规则导致的运行时崩溃)
    - [8.4 精确类比与局限](#84-精确类比与局限)
  - [9. Effect System 的范畴论语境](#9-effect-system-的范畴论语境)
    - [9.1 正例：Koka 的精确效应跟踪](#91-正例koka-的精确效应跟踪)
    - [9.2 反例：效应标注的过度工程](#92-反例效应标注的过度工程)
  - [10. 综合对比与迁移决策框架](#10-综合对比与迁移决策框架)
    - [完整对比矩阵](#完整对比矩阵)
    - [决策框架](#决策框架)
    - [范畴论视角的核心洞察](#范畴论视角的核心洞察)
  - [参考文献](#参考文献)

---

## 0. 从一个真实的故事开始

2013年，Node.js 已经流行了四年，但每个中级 JavaScript 开发者都曾在深夜被回调地狱折磨过。假设你要读取一个配置文件，解析其中的数据库连接字符串，然后查询用户列表，最后发送邮件通知——在纯回调风格下，代码会螺旋向下缩进：

```javascript
// 2013 年的真实噩梦
readConfig("config.json", function(err, config) {
  if (err) { handleError(err); return; }
  parseConnectionString(config.db, function(err, conn) {
    if (err) { handleError(err); return; }
    queryUsers(conn, function(err, users) {
      if (err) { handleError(err); return; }
      notifyUsers(users, function(err) {
        if (err) { handleError(err); return; }
        console.log("done");
      });
    });
  });
});
```

Promise 的出现（ES2015）让代码变得扁平：`.then().then().then().catch()`。async/await（ES2017）让它几乎看起来像同步代码。表面上看，这是语法糖的进化。但如果我们只停留在语法层面，就会错过一个关键洞察：**这些演进不是偶然的，它们对应着范畴论中单子（Monad）的逐步具现化**。Promise 是单子，`async/await` 是 Haskell 中 do-notation 的 JavaScript 方言，`await` 本质上是 Kleisli 组合的语法糖。

理解这一点为什么重要？因为当你在 2024 年面对以下问题时——"为什么 Rust 的 `?` 不能用于闭包？"、"为什么 React Hooks 不能放在 if 语句里？"、"为什么 Promise.all 不是单子 join？"——只有范畴论的视角能给出统一的、不依赖于具体语言实现细节的回答。

---

## 1. 为什么需要计算效应的形式化理论？

### 1.1 痛点：回调地狱不是语法问题，而是语义问题

回调地狱的表层问题似乎是缩进太深，但深层问题是**组合性（Composability）的缺失**。考虑两个纯函数 `f: A → B` 和 `g: B → C`，它们的组合 `g ∘ f` 是直接的。但如果 `f` 可能抛出异常、可能异步执行、可能修改全局状态，那么 `g ∘ f` 就不再是简单的函数组合——你需要考虑异常传播、回调注册、状态同步。

计算效应（Computational Effects）是指任何让函数超越"输入→输出"纯数学模型的行为：异常、状态、非确定性、输入输出、异步、连续性。每种效应都打破了函数的直接可组合性。

### 1.2 历史脉络：从 GOTO 到 Monad 的三十年

**1968-1980：结构化编程革命**。Dijkstra 的 "GOTO Considered Harmful" 指出了非结构化控制流的危害。Pascal、C 等语言用 `if/else`、`while`、`for` 取代了 GOTO。但这些控制结构仍然是**在原始范畴中**操作——它们不改变函数的类型签名。

**1988-1991：Moggi 的关键洞察**。Eugenio Moggi 在爱丁堡大学发现，不同的计算效应可以用不同的**单子**来建模。状态效应是 State Monad `S → (A × S)`，异常效应是 Either Monad `A + E`，非确定性是 List Monad `List(A)`，异步是 Future Monad `Future(A)`。这不是类比——每种效应都有精确的范畴论语义。

Moggi 的论文标题 "Notions of Computation and Monads" 点明了核心思想：**"Notions of Computation"（计算的概念）先于 Monad**。人们已经知道有异常、状态、异步这些计算模式，Moggi 证明它们都共享同一个数学结构。

**1995：Wadler 将 Monad 带入主流**。Philip Wadler 在 "Monads for Functional Programming" 中展示了 Haskell IO Monad 如何用纯函数模拟命令式 I/O。这是从理论到实践的桥梁。

**2009：Plotkin & Pretnar 提出代数效应**。Gordon Plotkin 和 Matija Pretnar 发现单子有一个局限：效应的组合需要预先定义（如 Monad Transformer）。代数效应通过 `perform`（触发效应）和 `handle`（处理效应）分离了效应的产生和消费，使得用户可以自定义效应解释器而无需修改产生效应的代码。

**2015-2020：工业界的逐步采纳**。React Fiber（2017）用代数效应思想实现了可中断渲染；Rust 的 `?` 操作符（2015）将 Kleisli 组合内建为语言特性；JavaScript 的 `async/await`（2017）本质上是 Promise Monad 的 do-notation。

### 1.3 没有这些理论，我们会错过什么？

如果没有范畴论对计算效应的形式化，我们至少会错过三个关键洞察：

**第一，错误传播的两种本质不同的方式**。Rust 的 `Result<T, E>` 和 JavaScript 的 `try/catch` 看起来都是"错误处理"，但前者是**结构化效应**（在类型系统中显式表示），后者是**控制效应**（通过非局部跳转实现）。这决定了前者可组合、可静态分析，后者不可组合、运行时才能发现遗漏。

**第二，async/await 不是魔法**。`await` 不是暂停执行——它是 Kleisli 组合 `>>=` 的语法糖。理解这一点，你才能理解为什么 `await` 不能在普通函数中使用（因为没有 Kleisli 范畴的上下文），以及为什么 `for await...of` 的语义等价于 List Monad 的 `sequence`。

**第三，Hooks 的限制不是 React 团队的任性**。React Hooks 的"不能放在 if 里"、"必须按相同顺序调用"，本质上是**在没有语言级代数效应支持的情况下，用调用约定模拟 Handler 语义**的必然代价。

---

## 2. 单子的范畴论定义：从观察到形式化

### 2.1 实际观察：计算不总是纯粹的

写一个函数 `parseInt: string → number`。在纯数学中，给定 `"42"` 返回 `42`，给定 `"hello"` 应该返回什么？如果不返回任何东西，函数就不是全函数（total function）。现实中我们会抛出异常、返回默认值、或返回 `null`。每一种选择对应一种不同的计算模型：

| 选择 | 类型签名 | 计算模型 | 对应单子 |
|------|---------|---------|---------|
| 抛出异常 | `string → number`（实际不诚实）| 控制效应 | Continuation Monad |
| 返回 `null` | `string → number \| null` | 部分性 | Maybe Monad |
| 返回 `{ok, value}` 或 `{err, msg}` | `string → Result<number, string>` | 异常 | Either Monad |
| 异步解析 | `string → Promise<number>` | 延迟计算 | Promise Monad |
| 打印错误日志 | `string → IO<number>` | 输入输出 | IO Monad |

关键观察：**每种选择不仅改变了返回值，还改变了"组合这些计算的方式"**。`null` 需要 null-check 才能继续；`Promise` 需要 `.then()` 才能继续；`Result` 需要 `match` 或 `?` 才能继续。

### 2.2 抽象问题：如何组合带有上下文的计算

给定两个计算 `A → T(B)` 和 `B → T(C)`，其中 `T` 是某种"上下文包装器"（如 `Promise`、`Result`、`Maybe`），如何得到 `A → T(C)`？

在普通函数中，组合是直接的：`g ∘ f`。但在效应计算中，`f` 返回 `T(B)` 而 `g` 接受 `B`——类型不匹配。我们需要一个操作将 `T(B)` "解包"给 `g` 使用，同时保留 `T` 的上下文。

这个操作就是 `bind`（或 `flatMap`、`>>=`），它是单子理论的核心。

### 2.3 形式化定义：单子三元组

一个**单子**（Monad）是范畴 $\mathbf{C}$ 上的三元组 $(T, \eta, \mu)$，其中：

- $T: \mathbf{C} \to \mathbf{C}$ 是一个**自函子**（Endofunctor），将每个对象 $A$ 映射到 $T(A)$，将每个态射 $f: A \to B$ 映射到 $T(f): T(A) \to T(B)$。在编程中，$T$ 是类型构造子，如 `Promise<T>`、`Result<T, E>`、`Array<T>`。

- $\eta: id_\mathbf{C} \Rightarrow T$ 是**单位自然变换**（Unit），将普通值提升为带有上下文的值。在编程中，$\eta_A: A \to T(A)$ 对应 `Promise.resolve`、`Ok`、`Some`。

- $\mu: T^2 \Rightarrow T$ 是**乘法自然变换**（Multiplication / Join），将嵌套的上下文展平为单层上下文。在编程中，$\mu_A: T(T(A)) \to T(A)$ 对应 `.then(id)` 对 `Promise<Promise<T>>` 的展平、`flatten` 对 `Array<Array<T>>` 的展平。

单子必须满足以下**单子律**（Monad Laws）：

$$
\text{结合律:} \quad \mu_A \circ T(\mu_A) = \mu_A \circ \mu_{T(A)} : T^3(A) \to T(A)
$$

这条律的含义是：对于嵌套三层的上下文（如 `Promise<Promise<Promise<T>>>`），先展平内层再展平外层，与先展平外层再展平内层，结果相同。这意味着"展平"操作具有结合性，不会因展平顺序不同而产生不同结果。

$$
\text{左单位律:} \quad \mu_A \circ T(\eta_A) = id_{T(A)} : T(A) \to T(A)
$$

这条律的含义是：将一个已经带有上下层的值再用 $\eta$ 包装一层，然后展平，等价于什么都不做。例如，`Promise.resolve(Promise.resolve(x)).then(id)` 等价于 `Promise.resolve(x)`。

$$
\text{右单位律:} \quad \mu_A \circ \eta_{T(A)} = id_{T(A)} : T(A) \to T(A)
$$

这条律的含义是：将一个带有上下文的值直接包装进外层上下文再展平，等价于原值。例如，`Promise.resolve(px).then(id)` 等价于 `px`。

用交换图表示：

```
T³(A) --T(μ_A)--> T²(A)
   |                |
   | μ_{T(A)}       | μ_A
   v                v
T²(A) ---μ_A----> T(A)
```

这张图表示：从 $T^3(A)$ 出发，先应用 $T(\mu_A)$（对内部的 $T^2(A)$ 展平）得到 $T^2(A)$，再应用 $\mu_A$ 得到 $T(A)$；或者先应用 $\mu_{T(A)}$（对外层的 $T^2$ 展平）得到 $T^2(A)$，再应用 $\mu_A$ 得到 $T(A)$。两条路径结果相同。

### 2.4 Kleisli 范畴与 bind 操作

给定单子 $(T, \eta, \mu)$，可以构造**Kleisli 范畴** $\mathbf{C}_T$，其中：

- 对象与原始范畴 $\mathbf{C}$ 相同；
- 态射 $A \to_T B$ 定义为原始范畴中的 $A \to T(B)$。在编程中，这就是"返回 Promise 的函数"、"返回 Result 的函数"。

Kleisli 组合定义为：

$$
(f \gg= g)(a) = \mu_B(T(g)(f(a))) = \mu_B(g^\sharp(f(a)))
$$

其中 $g^\sharp = T(g)$ 是 $g$ 通过函子 $T$ 的提升。在编程中，Kleisli 组合就是 `bind` 或 `flatMap`：

```typescript
// bind: (A -> Promise<B>) 和 (B -> Promise<C>) 组合为 (A -> Promise<C>)
const bind = <A, B>(ma: Promise<A>, f: (a: A) => Promise<B>): Promise<B> =>
  ma.then(f);
```

**为什么这个定义成立？** `ma.then(f)` 中，`ma` 的类型是 `Promise<A>`，`f` 的类型是 `A → Promise<B>`。如果 `f` 返回 `Promise<B>`，那么 `.then()` 内部检测到返回值是 Thenable，会自动展平为 `Promise<B>` 而非 `Promise<Promise<B>>`。这个自动展平就是 $\mu_B$ 的操作。

### 2.5 精确直觉类比：单子不是"盒子"

许多教程将单子类比为"盒子"或"容器"——你往里面放东西，然后可以 map 或 flatMap。这个类比在入门时有帮助，但它是**危险的误导**。

**精确类比：单子是"带有上下文的计算管道"**。

想象一条工厂的生产线。普通函数是一条简单的传送带：原料 $A$ 进去，产品 $B$ 出来。单子则是**每条传送带都带有一个"环境控制室"**：

- **Promise 单子**：控制室里有一个"等待灯"。当上游产品到达时，灯变绿，传送带启动；如果上游永远不来（超时），灯变红，整条线挂起。`Promise.resolve(x)` 是"不等待，立即绿灯"。
- **Result 单子**：控制室里有一个"质检台"。每个产品都必须通过质检才能继续；如果不合格，触发紧急停止并返回质检报告。`Ok(x)` 是"免检通过"。
- **Maybe 单子**：控制室里有一个"过滤器"。`null` 或 `undefined` 被直接丢入废料箱，不会继续 downstream。`Some(x)` 是"正常放行"。
- **State 单子**：控制室里有一个"账本"。每次产品经过，账本上记录一条日志，下一条传送带可以看到账本的最新状态。

**这个类比的适用范围**：它准确传达了单子的核心语义——"计算不是孤立的，它携带了影响后续计算的环境信息"。它也解释了为什么单子需要 $\eta$（启动一个正常的流水线，不需要特殊环境）和 $\mu$（两条都有环境控制室的线串联时，不需要两个控制室叠加，合并成一个即可）。

**这个类比的局限性**：

1. "管道"暗示了数据的线性流动，但某些单子（如 List Monad 表示非确定性计算）更像"分叉路口"而非单管道。一个输入可能产生多个输出。
2. "环境控制室"暗示了有状态的机制，但某些单子（如 Identity Monad $T(A) = A$）没有任何额外机制，只是形式上的包装。
3. 这个类比没有直接解释单子律为什么重要。单子律不是"工程规范"，而是保证组合**结合性**和**单位元**的数学公理——没有它们，组合的顺序会改变结果，代码将不可推理。

---

## 3. Promise 作为单子三元组

### 3.1 正例：Promise 的函子性

Promise 首先是一个**函子**（Functor）。函子性意味着我们可以将任意普通函数 $f: A \to B$ "提升"为在 Promise 上下文上操作的函数 $T(f): Promise\langle A \rangle \to Promise\langle B \rangle$。

```typescript
// map: (A -> B) -> Promise<A> -> Promise<B>
// 对应范畴论中的 T(f): T(A) -> T(B)
const promiseMap = <A, B>(f: (a: A) => B): ((pa: Promise<A>) => Promise<B>) =>
  (pa) => pa.then(f);

// 正例：将 string 解析为 number
const parseNumber = (s: string): number => parseInt(s, 10);
const pa: Promise<string> = Promise.resolve("42");
const pb: Promise<number> = promiseMap(parseNumber)(pa);
// pb 将解析为 42
```

为什么这是正确的？因为 `pa.then(f)` 的语义是：当 `pa` 解析为值 `a` 时，应用 `f(a)` 得到 `b`，然后将 `b` 包装为 `Promise.resolve(b)` 返回。这精确对应函子 $T(f)$ 的定义。

函子律验证：

- **保持恒等态射**：$T(id_A) = id_{T(A)}$。对应代码：`pa.then(x => x)` 等价于 `pa`。
- **保持复合**：$T(g \circ f) = T(g) \circ T(f)$。对应代码：`pa.then(f).then(g)` 等价于 `pa.then(x => g(f(x)))`。

### 3.2 反例：Promise.then 不是严格的 map

```typescript
// 反例：Promise.then 同时扮演了 map 和 bind 的角色
const pa = Promise.resolve(5);

// 情形 A：f 返回非 Promise，.then 表现为 map
const f = (x: number): number => x * 2;
const r1 = pa.then(f);  // Promise<number>

// 情形 B：g 返回 Promise，.then 表现为 bind（自动展平）
const g = (x: number): Promise<number> => Promise.resolve(x * 2);
const r2 = pa.then(g);  // Promise<number>（不是 Promise<Promise<number>>！）
```

**为什么会错？** 从严格的范畴论语义看，`map`（函子操作）和 `bind`（单子操作）是两个不同的东西。`map` 接受 `A → B`，`bind` 接受 `A → T(B)`。Promise 的 `.then()` 通过运行时检查返回值是否是 Thenable 来自动切换行为，这在类型上是不诚实的。在 Haskell 中，`fmap` 和 `>>=` 是两个完全不同的函数，类型系统确保你不会混淆。

**后果**：这个设计导致 TypeScript 的类型推断有时不准确。例如：

```typescript
const h = (x: number): number | Promise<number> =>
  Math.random() > 0.5 ? x * 2 : Promise.resolve(x * 2);

const r3 = pa.then(h);
// r3 的类型是 Promise<number | Promise<number>>
// 但运行时行为是：如果 h 返回 Promise，then 会自动展平
// 类型系统和运行时语义不一致！
```

**如何修正**：在严格函数式风格中，应该显式区分 `map` 和 `flatMap`：

```typescript
// 严格区分
const map = <A, B>(f: (a: A) => B) => (pa: Promise<A>): Promise<B> =>
  pa.then(a => Promise.resolve(f(a)));

const flatMap = <A, B>(f: (a: A) => Promise<B>) => (pa: Promise<A>): Promise<B> =>
  pa.then(f);  // 这里 f 返回 Promise，不会额外包装
```

### 3.3 正例：Promise 的单子结构完整实现

```typescript
// 类型构造子 T(A) = Promise<A>

// η_A: A -> Promise<A> —— 单位，将普通值提升为已解析的 Promise
const unit = <A>(a: A): Promise<A> => Promise.resolve(a);

// μ_A: Promise<Promise<A>> -> Promise<A> —— 乘法，展平嵌套 Promise
const join = <A>(ppa: Promise<Promise<A>>): Promise<A> =>
  ppa.then(pa => pa);
// 等价于：ppa.then(id)

// bind (>>=): Promise<A> -> (A -> Promise<B>) -> Promise<B>
const bind = <A, B>(pa: Promise<A>, f: (a: A) => Promise<B>): Promise<B> =>
  pa.then(f);

// Kleisli 组合 (>=>): (A -> Promise<B>) -> (B -> Promise<C>) -> (A -> Promise<C>)
const kleisliCompose = <A, B, C>(
  f: (a: A) => Promise<B>,
  g: (b: B) => Promise<C>
): ((a: A) => Promise<C>) =>
  (a) => bind(f(a), g);
```

### 3.4 反例：Promise.resolve 的 assimilation 陷阱

Promise/A+ 规范规定：`Promise.resolve(promise)` 不会创建 `Promise<Promise<T>>`，而是直接返回 `promise` 本身。这被称为 **assimilation（同化）**。

```typescript
// 反例：assimilation 导致 η 不是严格的单位元
const px = Promise.resolve(42);
const py = Promise.resolve(px);

// 你期望 py 是 Promise<Promise<number>>
// 但实际上 py === px，类型是 Promise<number>
console.log(py === px);  // true
```

**为什么会错？** 从范畴论语义看，$\eta_{T(A)}: T(A) \to T^2(A)$ 应该将 `Promise<number>` 映射为 `Promise<Promise<number>>`。但 assimilation 使得这个映射在对象层面"坍缩"了。这在数学上不构成严格的问题（因为我们可以将 `Promise<Promise<T>>` 和 `Promise<T>` 视为在 Promise 语义下等价），但它确实意味着 Promise 的数学结构与严格的 Set 范畴上的单子有微妙的差异。

**后果**：当你试图在 Promise 上实现某些通用的单子变换器（Monad Transformer）时，assimilation 会导致意外的行为。例如，如果你想在 Promise 外再包装一层 Writer 效应，assimilation 可能让两层包装意外地合并为一层。

**如何修正**：如果你确实需要严格的嵌套语义（例如在测试框架或形式化验证中），需要自己实现一个不与原生 Promise assimilation 的变体：

```typescript
// StrictPromise：不使用 assimilation
class StrictPromise<A> {
  constructor(private run: () => Promise<A>) {}

  static resolve<A>(a: A): StrictPromise<A> {
    return new StrictPromise(() => Promise.resolve(a));
  }

  static wrap<A>(pa: Promise<A>): StrictPromise<A> {
    return new StrictPromise(() => pa);
  }

  then<B>(f: (a: A) => StrictPromise<B>): StrictPromise<B> {
    return new StrictPromise(() => this.run().then(a => f(a).run()));
  }
}

// 现在可以严格嵌套
const spx = StrictPromise.resolve(42);              // StrictPromise<number>
const spy = StrictPromise.resolve(spx);             // StrictPromise<StrictPromise<number>>
// 不会 assimilation
```

### 3.5 单子律验证

**左单位律**：$\mu \circ T\eta = id$

```typescript
// 对于任意 Promise<A> pa：
// (μ ∘ T(η))(pa) = join(map(η)(pa)) = pa.then(a => resolve(a)).then(id)
// 由 assimilation 定律，pa.then(resolve).then(id) === pa

// 更形式化的证明（用等式推理）：
const verifyLeftUnit = async <A>(pa: Promise<A>): Promise<boolean> => {
  const lhs = await pa.then(a => Promise.resolve(a)).then(x => x);
  const rhs = await pa;
  return lhs === rhs;  // Promise/A+ 保证这一点
};
```

**右单位律**：$\mu \circ \eta_T = id$

```typescript
// 对于任意 Promise<A> pa：
// (μ ∘ η_T)(pa) = join(resolve(pa)) = resolve(pa).then(id) === pa
// 因为 Promise.resolve(pa) 返回 pa（assimilation）

const verifyRightUnit = async <A>(pa: Promise<A>): Promise<boolean> => {
  const lhs = await Promise.resolve(pa).then(x => x);
  const rhs = await pa;
  return lhs === rhs;  // true（因为 lhs 和 rhs 是同一个对象引用）
};
```

**结合律**：$\mu \circ T\mu = \mu \circ \mu_T$

```typescript
// 对于任意 Promise<Promise<Promise<A>>> pppa：
// (μ ∘ T(μ))(pppa) = pppa.then(join).then(id)
//                  = pppa.then(ppa => ppa.then(id)).then(id)
// (μ ∘ μ_T)(pppa) = join(join(pppa))
//                 = pppa.then(id).then(id)

const verifyAssoc = async <A>(pppa: Promise<Promise<Promise<A>>>): Promise<boolean> => {
  const lhs = await pppa.then(ppa => ppa.then(x => x)).then(x => x);
  const rhs = await pppa.then(x => x).then(x => x);
  // 两者都是将三层 Promise 展平为一层
  return JSON.stringify(await lhs) === JSON.stringify(await rhs);
};
```

---

## 4. async/await 作为 do-notation

### 4.1 历史背景：Haskell 的 do-notation 解决了什么问题

在 Haskell 中，单子组合最初写为显式的 `>>=` 链：

```haskell
action = getLine >>= \line ->
         putStrLn line >>= \_ ->
         return (length line)
```

这种写法虽然精确，但嵌套括号让控制流难以追踪。1995年 Haskell 引入 do-notation，允许用类命令式语法书写单子程序：

```haskell
action = do
  line <- getLine
  putStrLn line
  return (length line)
```

编译器（脱糖器）将其翻译回 `>>=` 链。do-notation 不改变语义，它改变的是**认知负荷**——将嵌套的 Kleisli 组合转换为线性的、从上到下的阅读顺序。

### 4.2 正例：async/await 的脱糖语义

JavaScript 的 `async/await` 是 Promise 单子的 do-notation。

```typescript
// async/await 写法（do-notation）
async function compute(): Promise<number> {
  const user = await fetchUser("123");      // user <- fetchUser "123"
  const orders = await fetchOrders(user.id); // orders <- fetchOrders(user.id)
  return orders.length;                      // return (length orders)
}

// 脱糖后的 Promise 链（Kleisli 组合）
function computeDesugared(): Promise<number> {
  return fetchUser("123").then(user =>
    fetchOrders(user.id).then(orders =>
      Promise.resolve(orders.length)
    )
  );
}
```

**脱糖规则的对照表**：

| async/await 语法 | 脱糖后的 Promise 操作 | 范畴论语义 |
|-----------------|---------------------|-----------|
| `await ma` | `ma.then(x => ...)` | Kleisli 组合中的值提取 |
| `return e`（在 async 函数中）| `Promise.resolve(e)` | 单位 $\eta$ |
| 顺序语句 `s1; s2` | `s1.then(_ => s2)` | Kleisli 组合的串联 |
| `const x = await ma; ...` | `ma.then(x => ...)` | 绑定变量后继续组合 |
| `try { ... } catch (e) { ... }` | `.then(..., catchHandler)` 或 `.catch(...)` | 效应 Handler |

### 4.3 反例：隐式异常包装导致的类型欺骗

```typescript
// 反例：async 函数隐式将所有 throw 包装为 reject
async function parseConfig(input: string): Promise<Config> {
  const parsed = JSON.parse(input);  // 如果 input 非法，抛出 SyntaxError
  if (!parsed.apiUrl) {
    throw new Error("missing apiUrl");  // 等价于 return Promise.reject(...)
  }
  return parsed;
}

// 类型签名说返回 Promise<Config>
// 但实际上它也可能返回 Promise<never>（通过 reject）
// TypeScript 的类型系统不区分 resolve 和 reject 类型！
```

**为什么会错？** `async` 函数的类型签名 `Promise<Config>` 在 TypeScript 中**不携带错误类型信息**。编译器知道这个函数可能 reject，但 reject 的类型是 `any`。这与 Rust 的 `Result<Config, ParseError>` 形成鲜明对比——后者在类型中精确标注了错误类型。

**后果**：调用者可能忘记处理异常路径，而 TypeScript 编译器不会报错：

```typescript
// 危险：没有错误处理，但编译通过
const config = await parseConfig(userInput);
// 如果 userInput 是非法 JSON，这里会抛出未捕获的异常
makeRequest(config.apiUrl);
```

**如何修正**：在 TypeScript 中模拟 Rust 的 Result 语义：

```typescript
// 显式 Result 类型
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

async function parseConfigSafe(input: string): Promise<Result<Config, Error>> {
  try {
    const parsed = JSON.parse(input);
    if (!parsed.apiUrl) {
      return { ok: false, error: new Error("missing apiUrl") };
    }
    return { ok: true, value: parsed };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// 现在调用者被强制处理错误
const result = await parseConfigSafe(userInput);
if (!result.ok) {
  console.error("Config parse failed:", result.error.message);
  process.exit(1);
}
makeRequest(result.value.apiUrl);  // 类型安全
```

### 4.4 反例：并发顺序的迷惑性

```typescript
// 反例：看起来顺序执行，实际上部分并行
async function fetchAll() {
  // 你以为这是顺序执行？不！两个 fetch 同时启动
  const users = await fetch("/users");     // 请求 A 启动
  const orders = await fetch("/orders");   // 请求 B 启动——等等，真的是这样吗？
  return { users, orders };
}
```

仔细看：上面这个例子中，两个 fetch 确实是**顺序执行**的，因为 `await` 会暂停直到第一个 fetch 完成，然后才启动第二个。但如果写成下面这样，行为就完全不同了：

```typescript
// 真正的同时启动（并行）
async function fetchAllParallel() {
  const usersPromise = fetch("/users");     // 请求 A 立即启动
  const ordersPromise = fetch("/orders");   // 请求 B 立即启动
  const users = await usersPromise;         // 等待 A 完成
  const orders = await ordersPromise;       // 等待 B 完成（可能已经完成了）
  return { users, orders };
}
```

**反直觉之处**：`await` 只等待它右侧的表达式，但右侧表达式的求值时机取决于它出现在代码中的位置。在上面的并行版本中，`fetch("/users")` 和 `fetch("/orders")` 是在遇到 `await` 之前就求值的——它们只是普通的函数调用，返回 Promise。`await` 等待的是已经启动的操作。

**如何修正**：明确区分"启动操作"和"等待结果"：

```typescript
// 好的实践：显式标注并行意图
async function fetchAllExplicit() {
  // 同时启动
  const [users, orders] = await Promise.all([
    fetch("/users"),
    fetch("/orders")
  ]);
  return { users, orders };
}

// 或者如果你真的需要顺序（例如第二个请求依赖第一个的结果）
async function fetchAllSequential() {
  const users = await fetch("/users");
  // 明确：只有在 users 返回后才启动下一个请求
  const orders = await fetch(`/orders?user=${users.id}`);
  return { users, orders };
}
```

---

## 5. Rust Result 作为 Either Monad

### 5.1 正例：显式错误传播的 Either 结构

Rust 的 `Result<T, E>` 在范畴论中对应 **Either Monad**（也称为 Error Monad）：

$$
T(A) = A + E = \text{Ok}(A) \mid \text{Err}(E)
$$

这个公式读作：类型构造子 $T$ 作用在 $A$ 上，产生一个**和类型**（Sum Type），它要么是包含 $A$ 值的 `Ok` 变体，要么是包含 $E$ 值的 `Err` 变体。在集合论语义中，$A + E$ 是 $A$ 和 $E$ 的不交并集。

```rust
// 函子性：map 对 Ok 分支应用函数，对 Err 分支原样传递
impl<T, E> Result<T, E> {
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Result<U, E> {
        match self {
            Ok(t) => Ok(f(t)),
            Err(e) => Err(e),
        }
    }
}

// 正例：安全的数值转换
fn parse_positive(s: &str) -> Result<u32, String> {
    match s.parse::<u32>() {
        Ok(n) if n > 0 => Ok(n),
        Ok(_) => Err("must be positive".to_string()),
        Err(e) => Err(format!("parse error: {}", e)),
    }
}

let r1 = parse_positive("42");      // Ok(42)
let r2 = parse_positive("-5");      // Err("must be positive")
let r3 = parse_positive("hello");   // Err("parse error: ...")
```

为什么这是正确的？因为 `Result` 的 `map` 精确满足函子律：

- `result.map(|x| x)` 等价于 `result`（保持恒等）。
- `result.map(f).map(g)` 等价于 `result.map(|x| g(f(x)))`（保持复合）。

### 5.2 反例：? 操作符在闭包中的编译失败

```rust
// 反例：? 不能在普通闭包内部使用
fn process_numbers(inputs: Vec<&str>) -> Result<Vec<u32>, String> {
    // 编译错误：? 不能在返回非 Result 的闭包中使用
    let numbers: Vec<u32> = inputs
        .iter()
        .map(|s| s.parse::<u32>()?)  // ❌ 错误！
        .collect();
    Ok(numbers)
}
```

**为什么会错？** `?` 操作符的语义是：如果表达式是 `Err(e)`，立即从当前函数返回 `Err(e)`。但在 `.map()` 的闭包中，闭包的返回类型是 `u32`（不是 `Result<u32, _>`），所以 `?` 没有地方"提前返回"。`?` 需要当前上下文是一个返回 `Result`（或 `Option`）的函数。

**如何修正**：使用 `collect()` 对 `Result` 迭代器的特殊支持：

```rust
// 正确：collect() 可以将 Iterator<Result<T, E>> 收集为 Result<Vec<T>, E>
fn process_numbers(inputs: Vec<&str>) -> Result<Vec<u32>, ParseIntError> {
    let numbers: Result<Vec<u32>, _> = inputs
        .iter()
        .map(|s| s.parse::<u32>())  // Iterator<Result<u32, ParseIntError>>
        .collect();                  // 遇到第一个 Err 就返回，否则收集为 Vec
    numbers
}
```

这个修正为什么有效？因为 Rust 的 `collect()` 对 `Result` 实现了特殊的短路语义：如果在收集过程中遇到第一个 `Err`，整个 `collect()` 立即返回该 `Err`。这本质上是 List Monad 的 `sequence` 操作：将 `List<Result<T, E>>` 转换为 `Result<List<T>, E>`。

### 5.3 正例：? 操作符的 Kleisli 语义

```rust
// ? 操作符：and_then 的语法糖
fn read_config(path: &str) -> Result<Config, io::Error> {
    let content = fs::read_to_string(path)?;  // 如果失败，return Err(...)
    let config: Config = serde_json::from_str(&content)?;  // 如果失败，return Err(...)
    Ok(config)
}

// 等价于：
fn read_config_desugared(path: &str) -> Result<Config, io::Error> {
    fs::read_to_string(path).and_then(|content| {
        serde_json::from_str(&content).map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))
    })
}
```

**Kleisli 语义**：`?` 将 `Result<T, E>` 解包为 `T`，如果失败则短路返回。这正是 Kleisli 组合中 bind 的行为：

$$
\text{bind}: Result\langle A, E \rangle \times (A \to Result\langle B, E \rangle) \to Result\langle B, E \rangle
$$

在 Rust 中，`x?` 等价于：

```rust
match x {
    Ok(v) => v,
    Err(e) => return Err(From::from(e)),  // 自动类型转换后返回
}
```

### 5.4 反例：Result 的误用——将错误当控制流

```rust
// 反例：用 Err 表示"没找到"，但实际上"没找到"是正常结果
fn find_user(id: u64) -> Result<User, String> {
    let users = get_all_users();
    match users.iter().find(|u| u.id == id) {
        Some(u) => Ok(u.clone()),
        None => Err("User not found".to_string()),  // ❌ 错误：这不是错误！
    }
}
```

**为什么会错？** "用户不存在"在这个上下文中是一个**正常的结果**，不是**错误条件**。将其包装为 `Err` 会导致两个问题：

1. **调用者被迫处理"错误"**，即使这是预期内的行为。
2. **类型签名撒谎**：`Result<User, String>` 暗示函数可能失败，但实际上"没找到"是查询的合理结果之一。

**如何修正**：使用 `Option<User>` 表示可能不存在的值：

```rust
// 正确：Option 表示可能存在或不存在的值
fn find_user(id: u64) -> Option<User> {
    let users = get_all_users();
    users.iter().find(|u| u.id == id).cloned()
}

// 调用者明确处理"不存在"的情况
match find_user(42) {
    Some(user) => println!("Found: {}", user.name),
    None => println!("User 42 not found"),  // 正常分支，不是错误恢复
}

// 如果确实需要错误（例如在业务逻辑层"用户必须存在"）
fn get_user_required(id: u64) -> Result<User, BusinessError> {
    find_user(id).ok_or(BusinessError::UserNotFound(id))
}
```

**精确直觉类比**：`Option` 是"有或无的二选一"，`Result` 是"成功或失败的二选一"。将"无"包装为"失败"，就像把"抽屉是空的"报告为"抽屉坏了"——虽然都能表达"没有拿到东西"，但语义完全不同。

---

## 6. 对称差分析：Promise vs Result vs Maybe vs Continuation

### 6.1 四个计算模型的精确差异

表面上看，Promise、Result、Maybe（Option）和异常/Continuation 都是"处理某种特殊情况的机制"。但它们对应范畴论中四个**结构不同**的计算模型。

| 维度 | Promise（Future Monad） | Result（Either Monad） | Maybe（Option Monad） | try/catch（Continuation） |
|------|----------------------|---------------------|---------------------|------------------------|
| **类型构造子** | $T(A) = Future(A)$ | $T(A) = A + E$ | $T(A) = 1 + A$ | $T(A) = (A \to R) \to R$ |
| **效应本质** | 时间延迟 | 异常分支 | 部分性（可空）| 非局部控制流 |
| **上下文信息** | 异步状态（pending/fulfilled/rejected）| 错误值 $E$ | 无额外信息 | 调用栈的延续 |
| **组合方式** | 时间顺序（ happens-later ）| 错误传播（短路）| 空值传播（短路）| 栈展开 |
| **成功路径** |  exactly one | exactly one | zero or one | exactly one |
| **失败路径** |  one（reject reason）| one（Err value）| one（None）| 任意（任意异常类型）|
| **重试能力** | 原生（重新执行 Promise 工厂）| 需手动 | 需手动 | 需 catch 块 |
| **可组合性** | 高（Monad + Applicative）| 高（Monad）| 高（Monad）| 低（非结构化）|

**$T(A) = 1 + A$ 的含义**：`Option` 或 `Maybe` 类型构造子。$1$ 表示单位类型（在 Rust 中是 `()`，在 Haskell 中是 `()`），对应 `None` 或 `Nothing`。$A$ 对应 `Some(a)`。所以 `Option<T>` 要么是 `None`（单位类型的唯一值），要么是 `Some(T)`。

**$T(A) = (A \to R) \to R$ 的含义**：Continuation Monad 的类型构造子。它表示"一个接受延续（continuation）并返回结果 $R$ 的计算"。在 JavaScript 中，`throw` 本质上捕获了当前调用栈的延续，将控制流转移到最近的 catch 块，这可以形式化为 Continuation Monad 的操作。

**精确差异的核心**：Promise 和 Result 都是单子，但封装了**不同维度**的效应：Promise 封装的是**时间维度**（计算尚未发生），Result 封装的是**空间维度**（计算有两个出口）。Maybe 是 Result 在 $E = 1$（单位类型）时的特例。Continuation 则不是单子——它虽然是 Monad，但 JavaScript 的 `try/catch` 实现不遵循单子律，因为它没有显式的 $\eta$ 和 $\mu$。

### 6.2 边界条件与场景分析

**场景 A：简单的空值检查**

```typescript
// Maybe/Option 最合适
function findById<T>(items: T[], id: string): T | undefined {
  return items.find(item => (item as any).id === id);
}
```

不要用 `Result`：引入错误类型是过度设计。不要用 `Promise`：没有异步操作。

**场景 B：文件读取**

```rust
// Result 最合适：IO 错误有具体的错误信息
fn read_file(path: &str) -> Result<String, io::Error> {
    fs::read_to_string(path)
}
```

不要用 `Option`：文件不存在、权限不足等错误需要传递给调用者。在 JavaScript 中，Promise 更合适因为文件读取是异步的。

**场景 C：异步网络请求**

```typescript
// Promise 是唯一选择（在 JS/TS 中）
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

在 Rust 中，`async fn` 返回 `Future<Output = Result<User, Error>>`，所以它是 Promise（时间效应）和 Result（错误效应）的**叠加**。

**场景 D：快速失败 vs 累积错误**

```rust
// Result 的默认行为是"快速失败"（短路）
fn validate_all(inputs: Vec<&str>) -> Result<Vec<u32>, ParseIntError> {
    inputs.iter().map(|s| s.parse()).collect()  // 遇到第一个错误就停止
}

// 如果需要累积所有错误，需要不同的数据结构
fn validate_all_accumulate(inputs: Vec<&str>) -> Result<Vec<u32>, Vec<String>> {
    let (oks, errs): (Vec<_>, Vec<_>) = inputs.iter()
        .map(|s| s.parse::<u32>())
        .partition(|r| r.is_ok());

    if !errs.is_empty() {
        Err(errs.into_iter().map(|e| e.unwrap_err().to_string()).collect())
    } else {
        Ok(oks.into_iter().map(|r| r.unwrap()).collect())
    }
}
```

### 6.3 决策矩阵：什么时候选什么

| 条件 | 推荐 | 不推荐 | 理由 |
|------|------|--------|------|
| 值可能不存在，但无额外错误信息 | `Option<T>` / `T \| undefined` | `Result<T, E>` | `Option` 语义精确，避免虚构错误 |
| 操作可能失败，有具体错误原因 | `Result<T, E>` | `Option<T>` | 错误信息丢失，调试困难 |
| 操作是异步的 | `Promise<T>` / `Future<T>` | `Result<T, E>`（同步）| 同步模型无法表达时间延迟 |
| 需要组合多个可能失败的操作 | `Result` + `?` / `Promise` + `await` | `try/catch`（大范围）| 结构化效应可组合，非结构化不可组合 |
| 需要同时执行多个独立异步操作 | `Promise.all` | 顺序 `await` | `Promise.all` 是 Applicative 的 `sequence`，表达并行语义 |
| 需要错误恢复（fallback）| `.or_else()` / `.catch()` | 手动 match + 嵌套 | 单子操作符保持语义一致性 |
| 性能关键路径（零成本抽象）| Rust `Result` | JS `Promise` | Promise 有运行时调度开销 |
| 与现有 JS 生态集成 | `Promise` + `async/await` | Rust `Result`（需要绑定）| 生态系统兼容性优先 |

---

## 7. Rust ? 操作符与 TS try/catch 的范畴论差异

### 7.1 显式 vs 隐式错误传播

Rust 的 `?` 操作符和 TypeScript 的 `try/catch` 都处理错误，但它们的**范畴论语义完全不同**。

```rust
// Rust：显式的、结构化的错误传播
fn read_config(path: &str) -> Result<Config, io::Error> {
    let text = fs::read_to_string(path)?;   // 类型签名强制处理：Result<String, io::Error>
    let config = toml::from_str(&text)?;     // 类型签名强制处理：Result<Config, toml::Error>
    Ok(config)
}
```

每个 `?` 点都是一个**显式的 Kleisli 组合**。错误类型在函数签名中完全可见。如果 `read_to_string` 返回 `io::Error` 而 `from_str` 返回 `toml::Error`，编译器要求你处理类型不匹配（通过 `From` trait 转换或显式映射）。

```typescript
// TypeScript：隐式的、非结构化的错误传播
function readConfig(path: string): Config {
    const text = fs.readFileSync(path);     // 可能抛出，但类型签名不显示
    const config = toml.parse(text);        // 可能抛出，但类型签名不显示
    return config;
}
```

错误通过**非局部控制流**（栈展开）传播。类型签名 `Config` 是**不诚实的**——它声称"给我一个字符串，给你一个 Config"，但实际上可能抛出一百种不同的异常。

### 7.2 正例：结构化效应的可组合性

```rust
// Rust：错误处理是可组合的
fn step1() -> Result<A, E1> { ... }
fn step2(a: A) -> Result<B, E2> { ... }
fn step3(b: B) -> Result<C, E3> { ... }

// 组合成一个完整的流水线
fn pipeline() -> Result<C, CombinedError> {
    let a = step1()?;    // Kleisli 组合点 1
    let b = step2(a)?;   // Kleisli 组合点 2
    let c = step3(b)?;   // Kleisli 组合点 3
    Ok(c)
}

// 也可以部分组合
let partial: Result<B, _> = step1()?.and_then(step2);
```

为什么可组合？因为每个函数的类型签名都诚实标注了效应（`Result<T, E>`）。组合两个诚实函数，得到的仍然是诚实的函数。这是 Kleisli 范畴的核心性质。

```typescript
// TypeScript：错误处理不可组合（没有类型保证）
function step1(): A { ... }      // 可能抛出
function step2(a: A): B { ... }  // 可能抛出
function step3(b: B): C { ... }  // 可能抛出

// 组合看起来简单，但没有类型安全保证
function pipeline(): C {
    const a = step1();    // 可能抛出任意异常
    const b = step2(a);   // 可能抛出任意异常
    const c = step3(b);   // 可能抛出任意异常
    return c;
}

// 你不知道 pipeline 可能抛出什么，类型签名不会告诉你
```

### 7.3 反例：非结构化效应的隐藏成本

```typescript
// 反例：try/catch 捕获了不该捕获的异常
function processData(input: string): Data {
    try {
        const parsed = JSON.parse(input);
        return transform(parsed);
    } catch (e) {
        // 捕获了 JSON.parse 的 SyntaxError——但也捕获了 transform 的 Bug！
        // 如果 transform 因为代码错误抛出 TypeError，这里会吞掉它
        return defaultData;
    }
}
```

**为什么会错？** `try/catch` 捕获的是**语法块中任何位置**抛出的任何异常，没有机制区分"预期的错误"（JSON 解析失败）和"意外的 Bug"（transform 中的空指针）。这导致 Bug 被静默吞掉，程序进入不一致状态。

**如何修正**：在 TypeScript 中区分异常类型：

```typescript
// 修正：区分预期错误和意外错误
class ParseError extends Error {}

function processData(input: string): Data {
    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        // 只处理 JSON 解析错误
        if (e instanceof SyntaxError) {
            return defaultData;
        }
        throw e;  // 重新抛出非预期的错误
    }
    // transform 的错误不会被上面的 catch 捕获
    return transform(parsed);
}
```

但这个修正仍然是**运行时**的区分——编译器无法帮你检查。相比之下，Rust 的 `Result` 在**编译时**就保证了错误路径的处理。

---

## 8. React Fiber 与代数效应的范畴论模型

### 8.1 代数效应的核心思想：perform/handle

在单子理论中，效应的产生和处理是**耦合**的。例如，`IO` Monad 将"打印到控制台"作为硬编码的效应操作。如果你想改变"打印"的行为（例如重定向到日志文件），你需要修改使用 `putStrLn` 的代码，或者使用 Monad Transformer。

代数效应（Algebraic Effects）的核心创新是**分离效应的产生和处理**：

- **`perform`（或 `operation`）**：在计算中声明"我需要某个效应"，但不指定如何实现。
- **`handle`**：在调用处定义"当这个效应发生时，做什么"。

```eff
// Eff 语言中的代数效应（概念示例）
effect Log {
  log : string -> unit
}

// 产生效应的代码——不知道日志写到哪里
let compute () =
  perform (log "starting");
  let result = 42 in
  perform (log "done");
  result

// 调用处定义如何处理日志
let _ =
  handle compute () with
  | log msg k -> print_endline msg; k ()  // k 是 continuation
  | return v -> v
```

这里 `k` 是**延续**（Continuation），代表"效应发生后的剩余计算"。代数效应的强大之处在于：你可以在不修改 `compute` 的情况下，改变 `log` 的行为——写入文件、发送到远程服务器、或完全忽略。

### 8.2 正例：Hooks 作为效应操作的 Handler

React Hooks 可以看作是在没有语言级代数效应支持的情况下，用**调用约定**模拟的 Handler 语义：

```typescript
// useState 模拟了代数效应中的 "get/set state"
// 但实现方式是通过调用约定而非语言特性
function Counter() {
  const [count, setCount] = useState(0);  // "perform State.get/set"

  useEffect(() => {
    document.title = `Count: ${count}`;   // "perform Effect.sideEffect"
  }, [count]);                            // Handler 的依赖数组

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

React Fiber 架构在底层实现了代数效应的核心机制：

- **`perform(effect)`** ≈ 创建更新任务 `Update = { lane, payload, callback }`
- **`handle(effect, handler)`** ≈ Fiber 调度器从更新队列中取出任务，执行对应的 reducer
- **Continuation `k`** ≈ `Fiber.alternate`（当前 Fiber 的快照，用于恢复执行）

### 8.3 反例：违反 Hooks 规则导致的运行时崩溃

```typescript
// 反例：在条件语句中调用 Hook——违反代数效应的线性使用规则
function BadComponent({ showCount }: { showCount: boolean }) {
  if (showCount) {
    const [count, setCount] = useState(0);  // ❌ 运行时错误或不可预测行为
  }

  const [name, setName] = useState("");     // 这里的 Hook 调用顺序可能不稳定
  return <div>{name}</div>;
}
```

**为什么会错？** React Hooks 依赖**调用顺序**来识别哪个 Hook 对应哪个状态槽位。第一次渲染时，React 记录 `useState` 的调用顺序：槽位 0、槽位 1……如果第二次渲染时 `showCount` 变为 `false`，第一个 `useState` 不执行，第二个 `useState` 被误认为槽位 0，导致状态错位。

从代数效应视角看，Hooks 是**通过调用栈位置模拟的 perform 操作**。如果调用顺序改变，Fiber 调度器无法匹配 perform 操作和对应的 handler 状态。在真正的代数效应语言（如 Eff、Koka）中，`perform` 是语法构造，编译器确保其使用规则；但在 JavaScript 中，React 只能用 ESLint 规则在静态分析层面模拟这种保证。

**如何修正**：始终在最顶层调用 Hooks，确保每次渲染的调用顺序一致。

```typescript
// 正确：Hooks 总是在顶层，按固定顺序调用
function GoodComponent({ showCount }: { showCount: boolean }) {
  const [count, setCount] = useState(0);   // 槽位 0 —— 始终存在
  const [name, setName] = useState("");    // 槽位 1 —— 始终存在

  return (
    <div>
      {showCount && <span>{count}</span>}
      <span>{name}</span>
    </div>
  );
}
```

### 8.4 精确类比与局限

**精确类比：React Hooks 是"没有 perform 关键字的代数效应模拟"**。

想象一个餐厅：

- **真正的代数效应**（如 Eff 语言）：服务员有一个专门的铃铛（`perform`），按一下表示"需要加水"，厨师听到后决定怎么响应（`handle`）。铃铛是语言的一部分，不可能按错。
- **React Hooks**：服务员没有铃铛，而是按照固定的顺序做动作——第一步总是"拿菜单"，第二步总是"点菜"，第三步总是"要求加水"。厨师（React 运行时）通过"第几步"来判断服务员需要什么。如果你改变动作顺序（比如在某些情况下跳过"点菜"），厨师会困惑。

**这个类比的适用范围**：它准确解释了为什么 Hooks 的顺序不能改变，以及为什么规则检测器（ESLint）是必要的安全网。

**这个类比的局限性**：

1. 真正的代数效应允许一个操作被多个不同的 handler 处理（嵌套 handler），而 React Hooks 的 state handler 是全局唯一的。
2. 代数效应的 continuation `k` 可以被调用零次、一次或多次，而 React Fiber 的 continuation 本质上是单次恢复（虽然 Suspense 和 Concurrent Mode 让它看起来像可中断的）。
3. 这个类比没有涵盖 Fiber 的优先级调度——这是 React 特有的工程创新，不是代数效应理论的一部分。

---

## 9. Effect System 的范畴论语境

### 9.1 正例：Koka 的精确效应跟踪

效应系统（Effect System）扩展了类型系统，使**计算效应成为类型信息的一部分**：

$$
\Gamma \vdash e : A \; ! \; \Delta
$$

这个判断读作：在类型环境 $\Gamma$ 下，表达式 $e$ 具有类型 $A$，并且可能产生效应集合 $\Delta$。例如 $\Delta = \{ IO, State, Exception \}$ 表示这个表达式可能执行 IO、修改状态或抛出异常。

Koka 语言（Leijen, 2014）是现代效应系统的代表：

```koka
// 函数签名显式标注效应
fun divide(x: int, y: int): exn int   // exn = 可能抛出异常
  if y == 0 then throw("Division by zero")
  else x / y

// 纯函数：无效应
fun add(x: int, y: int): total int
  x + y

// 带状态的函数
fun counter(): <state<int>> int
  val n = get()
  set(n + 1)
  n
```

**为什么精确效应跟踪重要？** 它解决了单子的一个核心问题：**组合性**。在 Haskell 中，如果你有两个 Monad——`State` 和 `Exception`——组合它们需要 Monad Transformer：`StateT s (Except e) a`。这很快变得复杂。代数效应和效应系统通过**行多态**（Row Polymorphism）让效应自然地组合：一个函数可以有效应 $\{ exn, state \}$，另一个可以有 $\{ io, state \}$，调用第一个的函数自动继承 $\{ exn, state \}$，无需显式 Transformer。

### 9.2 反例：效应标注的过度工程

```koka
// 反例：过度标注导致类型签名膨胀
fun simpleGreeting(name: string): <console, exceptions, heap<div>, nontermination> string
  if name.is-empty then throw("empty name")
  else println("Hello, " ++ name)
```

**为什么会错？** 效应系统的精确性是有代价的：类型签名变得非常冗长。在上面的例子中，`heap<div>` 和 `nontermination` 可能是编译器推断出的隐藏效应。对于简单的应用代码，这种精确性带来的认知负担可能超过收益。

**边界条件**：效应系统在以下场景 ROI 最高：

1. **库作者**：需要精确标注 API 的效应契约，让用户知道调用函数会带来什么副作用。
2. **安全关键代码**：需要证明某些代码路径绝对不执行 I/O 或修改全局状态。
3. **编译器优化**：纯函数（`total`）可以自动并行化、缓存、重排顺序。

对于应用层开发，完全显式的效应标注通常是**过度工程**。TypeScript 的实用主义——不追踪效应，依赖开发者自觉——在大多数业务场景下是合理的权衡。

---

## 10. 综合对比与迁移决策框架

### 完整对比矩阵

| 维度 | JS Promise | Rust Result | Haskell IO | Eff/Koka 效应 |
|------|-----------|-------------|-----------|--------------|
| **理论模型** | Future Monad | Either Monad | IO Monad | 代数效应 |
| **Unit** | `Promise.resolve(x)` | `Ok(x)` | `return x` | `x`（无包装）|
| **Bind** | `.then(f)` | `and_then(f)` / `?` | `>>=` | `do x <- e` |
| **错误传播** | 隐式（reject）| 显式（`Result<T, E>`）| 显式（`Either`）| 显式（`exn` 效应）|
| **异步模型** | Event Loop | OS 线程 + async runtime | Green Threads | 语言级协程 |
| **类型诚实度** | 低（reject 类型不标注）| 高 | 高 | 高 |
| **效应组合** | 不原生支持 | Monad Transformer | Monad Transformer | 行多态 |
| **运行时开销** | 调度队列开销 | 零成本 | 轻量 | 轻量 |
| **学习曲线** | 低 | 中 | 高 | 高 |
| **生态成熟度** | 极高 | 高 | 中 | 低 |

### 决策框架

**场景 1：前端 Web 应用（浏览器环境）**

- 选择：JS `Promise` + `async/await`
- 理由：浏览器原生支持，生态完整。TS 的 `Result` 模拟库（如 `neverthrow`）可以使用，但与 DOM API 的 Promise 集成需要适配层。

**场景 2：后端 API 服务（Node.js）**

- 选择：TS `Promise` 为主，关键路径引入 `neverthrow` 模拟 Result
- 理由：Node.js 生态深度绑定 Promise。在输入验证、业务规则校验等场景使用显式 Result 类型可以提高可靠性。

**场景 3：系统编程 / CLI 工具**

- 选择：Rust `Result` + `?`
- 理由：零成本抽象，编译时保证错误处理。CLI 工具的错误传播链非常适合 `?` 的 Kleisli 语义。

**场景 4：高可靠性分布式系统**

- 选择：Rust + 自定义效应类型（或通过类型状态模式）
- 理由：需要编译时保证资源管理、错误处理、并发安全。Rust 的所有权 + Result + Send/Sync trait 提供了最强的静态保证。

**场景 5：快速原型 / 初创项目**

- 选择：TypeScript + 渐进类型
- 理由：开发速度优先。Promise 的隐式错误传播虽然不够安全，但减少了样板代码，适合验证想法。

**场景 6：需要可插拔效应语义（如插件系统）**

- 选择：代数效应语言（Eff、Koka）或通过解释器模式在 TS/Rust 中模拟
- 理由：只有代数效应支持在不修改产生效应代码的情况下，自定义效应解释器。

### 范畴论视角的核心洞察

1. **Promise 和 Result 都是单子，但封装了正交维度**。Promise 封装时间，Result 封装分支。Rust 的 `async fn` 返回 `Future<Output = Result<T, E>>`，这是两个单子的叠加。

2. **async/await 和 ? 都是 do-notation 的方言**。它们降低了 Kleisli 组合的心智负担，但没有改变底层语义。理解脱糖规则，才能理解边界行为。

3. **隐式 vs 显式是设计权衡，不是优劣判断**。TypeScript 的隐式异常传播牺牲了安全性，换取了开发速度；Rust 的显式 Result 牺牲了开发速度，换取了可靠性。范畴论告诉你代价在哪里，但不替你做决定。

4. **React Hooks 是代数效应在宿主语言限制下的工程妥协**。它的限制（顺序调用、顶层调用）不是 React 团队的任性，而是在没有 `perform`/`handle` 语法的情况下，用调用约定模拟 Handler 语义的必然结果。

5. **效应系统代表了编程语言理论的前沿**。Koka 的行多态效应系统可能在未来十年影响主流语言的设计。TC39 的 Explicit Resource Management 提案（`using` 关键字）可以看作 JS 向结构化效应迈出的第一步。

---

## 参考文献

1. Moggi, E. (1991). "Notions of Computation and Monads." *Information and Computation*, 93(1), 55-92.
2. Plotkin, G., & Pretnar, M. (2009). "Handlers of Algebraic Effects." *ESOP 2009*, 80-94.
3. Wadler, P. (1995). "Monads for Functional Programming." *Advanced Functional Programming*, 24-52.
4. Klabnik, S., & Nichols, C. (2023). *The Rust Programming Language* (2nd ed.). No Starch Press.
5. Leijen, D. (2014). "Koka: Programming with Row Polymorphic Effect Types." *MSFP 2014*.
6. Bauer, A., & Pretnar, M. (2015). "Programming with Algebraic Effects and Handlers." *J. Log. Algebr. Methods Program.*, 84(1), 108-123.
7. React Core Team. "React Fiber Architecture." (Technical documentation)
8. ECMA-262. *ECMAScript® 2025 Language Specification*. (§27.2 Promise Objects)
9. Wadler, P. (1998). "The Marriage of Effects and Monads." *ICFP 1998*.
10. Harper, R. (2016). *Practical Foundations for Programming Languages* (2nd ed.). Cambridge University Press.
