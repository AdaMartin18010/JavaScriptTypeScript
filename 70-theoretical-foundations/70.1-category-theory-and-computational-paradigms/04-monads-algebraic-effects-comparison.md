---
title: "单子与代数效应：Promise/Async 与 Rust Result 的深度对比"
description: "从单子三元组到代数效应处理器，系统对比 JS/TS 与 Rust 的计算模型，含完整形式化定义与可运行代码"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P0
actual-length: ~5200 words
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
  - [1. 单子的完整范畴论定义](#1-单子的完整范畴论定义)
    - [1.1 单子三元组](#11-单子三元组)
    - [1.2 Kleisli 范畴与 bind 操作](#12-kleisli-范畴与-bind-操作)
    - [1.3 单子作为计算效应的封装](#13-单子作为计算效应的封装)
  - [2. Promise 作为单子三元组](#2-promise-作为单子三元组)
    - [2.1 Promise 的函子性](#21-promise-的函子性)
    - [2.2 Promise 的单子结构](#22-promise-的单子结构)
    - [2.3 Promise 单子律的完整验证](#23-promise-单子律的完整验证)
  - [3. async/await 作为 do-notation](#3-asyncawait-作为-do-notation)
    - [3.1 Haskell do-notation 的回顾](#31-haskell-do-notation-的回顾)
    - [3.2 async/await 的脱糖语义](#32-asyncawait-的脱糖语义)
    - [3.3 async/await 的范畴论语义优势](#33-asyncawait-的范畴论语义优势)
  - [4. Rust 的 Result\<T, E\> 作为 Either Monad](#4-rust-的-resultt-e-作为-either-monad)
    - [4.1 Either Monad 的定义](#41-either-monad-的定义)
    - [4.2 Rust ? 操作符的 Kleisli 语义](#42-rust--操作符的-kleisli-语义)
    - [4.3 Result 与 Promise 的单子对比](#43-result-与-promise-的单子对比)
  - [5. Rust 的 ? 操作符与 TS try/catch 的范畴论差异](#5-rust-的--操作符与-ts-trycatch-的范畴论差异)
    - [5.1 显式 vs 隐式错误传播](#51-显式-vs-隐式错误传播)
    - [5.2 范畴论语义差异](#52-范畴论语义差异)
    - [5.3 形式化对比](#53-形式化对比)
  - [6. React Algebra Effects 的范畴论模型](#6-react-algebra-effects-的范畴论模型)
    - [6.1 代数效应的基本概念](#61-代数效应的基本概念)
    - [6.2 React Fiber 的代数效应模拟](#62-react-fiber-的代数效应模拟)
    - [6.3 Hooks 作为效应操作的 Handler](#63-hooks-作为效应操作的-handler)
  - [7. Effect System 的范畴论语境](#7-effect-system-的范畴论语境)
    - [7.1 效应系统的类型](#71-效应系统的类型)
    - [7.2 Koka 的效应系统](#72-koka-的效应系统)
    - [7.3 Eff 语言](#73-eff-语言)
    - [7.4 ReScript 的效应标注](#74-rescript-的效应标注)
    - [7.5 效应系统与范畴论的统一](#75-效应系统与范畴论的统一)
  - [8. 正例与反例对比矩阵](#8-正例与反例对比矩阵)
    - [8.1 单子实现对比](#81-单子实现对比)
    - [8.2 边界情况与反例](#82-边界情况与反例)
  - [9. 综合对比与迁移决策框架](#9-综合对比与迁移决策框架)
    - [9.1 决策矩阵](#91-决策矩阵)
    - [9.2 范畴论视角的核心洞察](#92-范畴论视角的核心洞察)
  - [参考文献](#参考文献)

---

## 1. 单子的完整范畴论定义

### 1.1 单子三元组

单子（Monad）是范畴论中用于封装**计算效应**（Computational Effects）的核心结构。一个单子由三元组 $(T, \eta, \mu)$ 构成，其中：

- $T: \mathbf{C} \to \mathbf{C}$ 是一个**自函子**（Endofunctor）
- $\eta: id_\mathbf{C} \Rightarrow T$ 是**单位自然变换**（Unit）
- $\mu: T^2 \Rightarrow T$ 是**乘法自然变换**（Multiplication/Join）

满足以下**单子律**（Monad Laws）：

$$
\text{结合律:} \quad \mu \circ T\mu = \mu \circ \mu_T \\
\text{左单位律:} \quad \mu \circ T\eta = id_T \\
\text{右单位律:} \quad \mu \circ \eta_T = id_T
$$

用交换图表示：

```
T³T --Tμ--> T²T
 |          |
 μT         μ
 |          |
 v          v
T²T --μ-->  TT

TT --Tη--> T²T
 |          |
id         μ
 |          |
 v          v
TT ======> TT
```

### 1.2 Kleisli 范畴与 bind 操作

单子诱导出一个**Kleisli 范畴** $\mathbf{C}_T$，其中：

- 对象与 $\mathbf{C}$ 相同
- 态射 $A \to_T B$ 定义为 $\mathbf{C}$ 中的 $A \to T(B)$
- Kleisli 组合（Fish 操作符）：$(f \gg= g)(a) = \mu(g^\sharp(f(a)))$

在编程中，Kleisli 组合对应 `bind` 或 `flatMap`：

```typescript
// TypeScript 中的 bind（>>=）
const bind = <A, B>(ma: Promise<A>, f: (a: A) => Promise<B>): Promise<B> =>
  ma.then(f);  // ma :: Promise<A>, f :: A -> Promise<B>
```

### 1.3 单子作为计算效应的封装

Moggi (1991) 的核心洞察：不同的计算效应对应不同的单子：

| 效应 | 单子 $T(A)$ | 编程语言实例 |
|------|------------|-------------|
| 状态 | $S \to (A \times S)$ | `State` monad (Haskell) |
| 异常 | $A + E$ | `Result<T, E>` (Rust), `Either<E, A>` |
| 非确定性 | $\mathcal{P}(A)$ | `List` monad |
| 输入/输出 | $IO(A)$ | `IO` monad (Haskell) |
| 连续体 | $(A \to R) \to R$ | Continuation monad |
| 异步 | $Promise\langle A \rangle$ | JS `Promise` |

---

## 2. Promise 作为单子三元组

### 2.1 Promise 的函子性

Promise 首先是一个**函子**。给定函数 $f: A \to B$，可以提升为 $T(f): Promise\langle A \rangle \to Promise\langle B \rangle$：

```typescript
// map: (A -> B) -> Promise<A> -> Promise<B>
const promiseMap = <A, B>(f: (a: A) => B): ((pa: Promise<A>) => Promise<B>) =>
  (pa) => pa.then(f);
```

**函子律验证**：

- $T(id_A) = id_{T(A)}$：`pa.then(x => x) === pa`
- $T(g \circ f) = T(g) \circ T(f)$：`pa.then(f).then(g) === pa.then(x => g(f(x)))`

### 2.2 Promise 的单子结构

**类型构造子**：$T(A) = Promise\langle A \rangle$

**单位（Unit/Return）**：$\eta_A: A \to Promise\langle A \rangle$

```typescript
// η_A = Promise.resolve
const unit = <A>(a: A): Promise<A> => Promise.resolve(a);
```

**乘法（Join/Flatten）**：$\mu_A: Promise\langle Promise\langle A \rangle \rangle \to Promise\langle A \rangle$

```typescript
// μ_A = .then(id) 的展平
const join = <A>(ppa: Promise<Promise<A>>): Promise<A> => ppa.then(pa => pa);
// 等价于：ppa.then(id) 或直接 ppa.then(x => x)
```

**Kleisli 组合（Bind）**：$\gg=: Promise\langle A \rangle \times (A \to Promise\langle B \rangle) \to Promise\langle B \rangle$

```typescript
const bind = <A, B>(pa: Promise<A>, f: (a: A) => Promise<B>): Promise<B> =>
  pa.then(f);  // 自动展平 Promise<Promise<B>> 为 Promise<B>
```

### 2.3 Promise 单子律的完整验证

**左单位律**：$\mu \circ T\eta = id$

```typescript
// 对于任意 Promise<A> pa：
// μ(T(η)(pa)) = pa.then(a => η(a)).then(id) = pa.then(a => Promise.resolve(a)).then(x => x)
// 由于 Promise.resolve(a) 立即解析为 a，.then(x => x) 返回原始 Promise
// 因此：pa.then(Promise.resolve).then(x => x) === pa
```

形式化证明：

$$
\begin{aligned}
(\mu_A \circ T\eta_A)(pa) &= \mu_A(pa.\text{then}(\eta_A)) \\
&= pa.\text{then}(\eta_A).\text{then}(id) \\
&= pa.\text{then}(a \mapsto \eta_A(a)).\text{then}(x \mapsto x) \\
&= pa.\text{then}(a \mapsto Promise.resolve(a)).\text{then}(x \mapsto x) \\
&\equiv pa \quad \text{(由 Promise/A+ 规范的 assimilation 定律)}
\end{aligned}
$$

**右单位律**：$\mu \circ \eta_T = id$

```typescript
// 对于任意 Promise<A> pa：
// μ(η(pa)) = Promise.resolve(pa).then(x => x) === pa
// 因为 Promise.resolve(pa) 创建一个已解析为 pa 的 Promise，.then(x => x) 返回 pa
```

**结合律**：$\mu \circ T\mu = \mu \circ \mu_T$

```typescript
// 对于任意 Promise<Promise<Promise<A>>> pppa：
// (μ ∘ Tμ)(pppa) = pppa.then(μ).then(id) = pppa.then(ppa => ppa.then(id)).then(id)
// (μ ∘ μ_T)(pppa) = pppa.then(id).then(id).then(id) = pppa.then(id).then(id)
// 两者等价：展平三层 Promise 为单层
```

---

## 3. async/await 作为 do-notation

### 3.1 Haskell do-notation 的回顾

在 Haskell 中，do-notation 是单子操作的语法糖：

```haskell
-- do-notation
do
  x <- ma      -- ma >>= (\x -> ...)
  y <- mb x    -- mb x >>= (\y -> ...)
  return (x + y)

-- 脱糖后
ma >>= (\x -> mb x >>= (\y -> return (x + y)))
```

### 3.2 async/await 的脱糖语义

JavaScript 的 `async/await` 是 Promise 单子的 do-notation：

```typescript
// async/await 写法（do-notation）
async function compute(): Promise<number> {
  const x = await fetchUser();      // x <- fetchUser
  const y = await fetchOrders(x);   // y <- fetchOrders(x)
  return x.id + y.length;           // return (x.id + y.length)
}

// 脱糖后的 Promise 链（Kleisli 组合）
function computeDesugared(): Promise<number> {
  return fetchUser().then(x =>
    fetchOrders(x).then(y =>
      Promise.resolve(x.id + y.length)
    )
  );
}
```

**脱糖规则**：

| async/await | Promise 链（Kleisli） |
|------------|---------------------|
| `await ma` | `ma.then(x => ...)` |
| `return e` | `Promise.resolve(e)` |
| 顺序语句 `s1; s2` | `s1.then(_ => s2)` |
| `try/catch` | `.then(..., catchHandler)` |

### 3.3 async/await 的范畴论语义优势

async/await 的核心认知优势在于：它将**嵌套的 Kleisli 组合**转换为**线性的 do-notation**，降低了开发者的心智负担。

从范畴论视角：

- **嵌套 `.then()`** = 显式的 Kleisli 组合 $f \gg= g \gg= h$
- **async/await** = 隐式的 Kleisli 组合，通过语法糖隐藏了 $\mu$（flatten）操作

---

## 4. Rust 的 Result&lt;T, E&gt; 作为 Either Monad

### 4.1 Either Monad 的定义

`Result<T, E>` 在范畴论中对应 **Either Monad**（也称为 Error Monad）：

$$
T(A) = A + E = \text{Ok}(A) \mid \text{Err}(E)
$$

**函子性**：

```rust
// Rust 实现
impl<T, E> Result<T, E> {
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Result<U, E> {
        match self {
            Ok(t) => Ok(f(t)),
            Err(e) => Err(e),
        }
    }
}
```

**单子结构**：

```rust
// Unit: T -> Result<T, E>
fn ok<T, E>(value: T) -> Result<T, E> { Ok(value) }

// Bind (>>=): Result<T, E> -> (T -> Result<U, E>) -> Result<U, E>
impl<T, E> Result<T, E> {
    pub fn and_then<U, F: FnOnce(T) -> Result<U, E>>(self, f: F) -> Result<U, E> {
        match self {
            Ok(t) => f(t),
            Err(e) => Err(e),
        }
    }
}
```

### 4.2 Rust ? 操作符的 Kleisli 语义

Rust 的 `?` 操作符是 `and_then` 的语法糖，类似于 async/await 对 Promise.then 的脱糖：

```rust
// ? 操作符写法（do-notation）
fn compute() -> Result<i32, String> {
    let x = fetch_user()?;       // x <- fetch_user
    let y = fetch_orders(x)?;    // y <- fetch_orders(x)
    Ok(x.id + y.len())           // return (x.id + y.len())
}

// 脱糖后的 and_then 链
fn compute_desugared() -> Result<i32, String> {
    fetch_user().and_then(|x| {
        fetch_orders(x).and_then(|y| {
            Ok(x.id + y.len())
        })
    })
}
```

### 4.3 Result 与 Promise 的单子对比

| 维度 | Rust `Result<T, E>` | JS `Promise<T>` | 范畴论语义 |
|------|-------------------|-----------------|-----------|
| 类型构造子 | $A + E$ | $Future(A)$ | 和类型 vs 时态类型 |
| Unit | `Ok(value)` | `Promise.resolve(value)` | $\eta_A$ |
| Bind | `and_then` | `.then` | $\gg=$ |
| 错误传播 | `?` 操作符（显式）| `.catch` / try-catch（隐式）| 显式 Kleisli vs 隐式 Handler |
| 组合方式 | 同步 | 异步 | 即时计算 vs 延迟计算 |
| 错误类型 | 静态（编译时确定）| 动态（运行时抛出）| 结构化效应 vs 非结构化效应 |

---

## 5. Rust 的 ? 操作符与 TS try/catch 的范畴论差异

### 5.1 显式 vs 隐式错误传播

Rust 的 `?` 操作符实现了**显式的、结构化的错误传播**：

```rust
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // 如果失败，立即返回 Err
    let mut contents = String::new();
    file.read_to_string(&mut contents)?; // 如果失败，立即返回 Err
    Ok(contents)
}
```

每个 `?` 都是一个**显式的 Kleisli 组合点**，错误类型在类型签名中可见。

TypeScript 的 `try/catch` 实现了**隐式的、非结构化的错误传播**：

```typescript
function readFile(path: string): string {
    const file = fs.readFileSync(path); // 可能抛出，但类型签名不显示
    return file.toString();
}
```

错误通过**非局部控制流**（栈展开）传播，类型签名无法捕获。

### 5.2 范畴论语义差异

从范畴论语义看，两者的根本差异在于**效应的表示方式**：

**Rust Result** = **结构化效应**（Structured Effects）

- 错误是类型系统的一等公民
- 效应通过类型传递：$A \to B$ 变为 $A \to B + E$
- 对应 **代数效应**（Algebraic Effects）的显式 handler

**JS try/catch** = **非结构化效应**（Unstructured Effects）

- 错误通过副作用传播
- 类型签名不反映效应：$A \to B$ 仍然是 $A \to B$
- 对应 **控制效应**（Control Effects），类似于 `call/cc`

### 5.3 形式化对比

Rust 的函数类型在 Kleisli 范畴中：

$$
f: A \to_T B \quad \text{（类型系统中显式标注效应 E）}
$$

JS 的函数类型在原始范畴中（效应隐式）：

$$
f: A \to B \quad \text{（效应通过非局部跳转实现）}
$$

这意味着：

- **Rust**：编译器可以**静态验证**所有错误路径是否被处理
- **JS**：错误处理是**运行时约定**，依赖开发者遵守

---

## 6. React Algebra Effects 的范畴论模型

### 6.1 代数效应的基本概念

代数效应（Algebraic Effects）由 Plotkin & Pretnar (2009) 提出，是一种形式化计算效应的框架：

- **Effect Operation**（效应操作）：如 `throw`, `read`, `write`, `yield`
- **Handler**（处理器）：定义如何解释效应操作
- **Continuation**（延续）：代表"剩余计算"的函数

形式化定义：

$$
\frac{E \vdash e_1 : T_1 \quad E, x:T_1 \vdash e_2 : T_2}{E \vdash \text{do } x \leftarrow e_1 \text{ in } e_2 : T_2} \quad (\text{Do})
$$

$$
\frac{E \vdash e : T_1 \quad E \vdash h : T_1 \Rightarrow T_2}{E \vdash \text{handle } e \text{ with } h : T_2} \quad (\text{Handle})
$$

### 6.2 React Fiber 的代数效应模拟

React 通过 Fiber 架构模拟了代数效应的语义：

```
Fiber 节点 F = (type, props, state, child, sibling, return, effectTag, nextEffect)

代数效应操作模拟：
perform(effect, payload) ≈ 创建更新任务 U = (effect, payload, resolve, reject)

handle(effect, handler) ≈
  调度器从更新队列 dequeue U
  执行 handler(U.payload)
  调用 U.resolve/U.reject 恢复执行

Continuation K = Fiber.alternate (当前 Fiber 的上一次状态快照)
```

### 6.3 Hooks 作为效应操作的 Handler

React Hooks 可以看作是一组预定义的效应处理器：

| Hook | 效应操作 | Handler 语义 |
|------|---------|-------------|
| `useState` | `get/set state` | 状态读写处理 |
| `useEffect` | `perform side effect` | 副作用调度处理 |
| `useContext` | `read context` | 上下文读取处理 |
| `useReducer` | `dispatch action` | 状态转换处理 |

**关键限制**：JavaScript 原生不支持 `perform`/`handle` 语法，React 通过**调用约定**（Hooks Rules）在库层面模拟了这一语义。

---

## 7. Effect System 的范畴论语境

### 7.1 效应系统的类型

效应系统（Effect System）扩展了类型系统，使**效应**成为类型信息的一部分：

$$
\Gamma \vdash e : A \; ! \; \Delta
$$

其中 $\Delta$ 是效应集合（如 `{IO, Exception, State}`）。

### 7.2 Koka 的效应系统

Koka (Leijen, 2014) 是现代效应系统的代表：

```koka
// 函数类型显式标注效应
fun divide( x : int, y : int ) : exn int   // exn = 可能抛出异常
  if y == 0 then throw("Division by zero")
  else x / y

// 纯函数（无副作用）
fun add( x : int, y : int ) : total int
  x + y
```

### 7.3 Eff 语言

Eff (Bauer & Pretnar, 2015) 是代数效应的直接实现：

```eff
// 定义效应
operation throw : string -> empty

// 使用效应
let divide x y =
  if y == 0 then throw "Division by zero"
  else x / y

// 处理效应
let safe_divide x y =
  handle divide x y with
  | throw msg -> None
  | return v -> Some v
```

### 7.4 ReScript 的效应标注

ReScript 通过类型系统实现了轻量级效应跟踪：

```rescript
// @raises 标注可能的异常
@raises("RangeError")
let parseInt = (s: string): int => ...

// 调用者必须处理异常
let x = try parseInt("42") catch { | _ => 0 }
```

### 7.5 效应系统与范畴论的统一

效应系统可以在范畴论语境中统一理解：

- **无效应**（Total）= 笛卡尔闭范畴中的纯函数 $A \to B$
- **异常效应**（Exception）= Either Monad $A \to B + E$
- **状态效应**（State）= State Monad $A \to S \to (B \times S)$
- **非确定性**（Nondeterminism）= List Monad $A \to \mathcal{P}(B)$
- **异步**（Async）= Promise Monad $A \to Future(B)$

**效应系统的范畴论语义**：

给定效应签名 $\Sigma$，可以构造**效应代数**（Effect Algebra），其模型对应于不同的计算范畴。Handler 对应于从自由模型到具体模型的**同态**。

---

## 8. 正例与反例对比矩阵

### 8.1 单子实现对比

| 特性 | JS Promise | Rust Result | Haskell IO | 范畴论语义 |
|------|-----------|-------------|-----------|-----------|
| **Unit (return)** | `Promise.resolve(x)` | `Ok(x)` | `return x` | $\eta_A(x)$ |
| **Bind (>>=)** | `.then(f)` | `and_then(f)` | `>>=` | $\mu \circ T(f)$ |
| **Map** | `.then(f)` (非单子的) | `map(f)` | `fmap f` | $T(f)$ |
| **Join** | `.then(x => x)` | `flatten` (自定义) | `join` | $\mu_A$ |
| **错误恢复** | `.catch(f)` | `or_else(f)` | `catchError` | Handler |
| **并发组合** | `Promise.all` | `Iterator::collect` | `sequence` | 积的极限 |
| **竞争组合** | `Promise.race` | 无内置 | `race` | 余极限 |

### 8.2 边界情况与反例

**反例 1：Promise 的 `.then` 不是严格的 map**

```typescript
// Promise.then 同时扮演了 map 和 bind 的角色
// 如果 f 返回非 Promise，.then 表现为 map
// 如果 f 返回 Promise，.then 表现为 bind（自动 flatten）
const pa = Promise.resolve(5);
const f = (x: number) => x * 2;           // 非 Promise 返回
const g = (x: number) => Promise.resolve(x * 2); // Promise 返回

pa.then(f);  // map 行为：返回 Promise<number>
pa.then(g);  // bind 行为：返回 Promise<number>（自动展平）
```

这违反了严格的范畴论语义，但提供了工程上的便利。

**反例 2：Rust ? 操作符在闭包中的限制**

```rust
// 错误：? 不能在闭包内部使用（除非闭包返回 Result）
let result: Result<Vec<i32>, _> = vec![1, 2, 3]
    .iter()
    .map(|x| parse_int(x)?)  // ❌ 编译错误
    .collect();

// 正确：使用 try_fold 或显式 match
let result: Result<Vec<i32>, _> = vec![1, 2, 3]
    .iter()
    .try_fold(vec![], |mut acc, x| {
        acc.push(parse_int(x)?);  // ✅ try_fold 的闭包返回 Result
        Ok(acc)
    });
```

**反例 3：JS async/await 的隐式异常传播**

```typescript
// async 函数隐式将所有异常包装为拒绝的 Promise
async function risky(): Promise<number> {
    throw new Error("oops");  // 等价于 return Promise.reject(new Error("oops"))
}

// 调用者可能忘记处理
const x = await risky();  // 如果没有 try/catch，异常会向上传播
```

这与 Rust 的显式 `?` 形成对比：Rust 编译器会强制处理 `Result`，而 JS 不会。

---

## 9. 综合对比与迁移决策框架

### 9.1 决策矩阵

| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 需要编译时错误保证 | Rust Result | 类型系统强制处理所有错误路径 |
| 需要异步组合 | JS Promise + async/await | 原生语言支持，生态系统成熟 |
| 需要纯函数保证 | Haskell Maybe/Either | 类型系统区分纯/不纯函数 |
| 需要细粒度效应跟踪 | Koka/Eff | 效应系统精确标注每种副作用 |
| 需要与现有 JS 生态集成 | TS + Promise | 渐进迁移成本最低 |
| 需要高性能系统编程 | Rust Result | 零成本抽象，无运行时开销 |

### 9.2 范畴论视角的核心洞察

1. **Promise 和 Result 都是单子**，但封装了不同的计算效应（异步 vs 同步错误）
2. **async/await 和 ? 都是 do-notation**，但错误传播方式不同（隐式 vs 显式）
3. **React Hooks 模拟了代数效应**，但受限于 JS 语言特性，无法完全实现
4. **效应系统代表了 PL 理论的前沿**，可能在未来影响 TS 的设计（如 TC39 的 Explicit Resource Management 提案）
5. **从范畴论视角，所有计算模型都可以统一理解**，为语言选择和迁移提供了数学基础

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
