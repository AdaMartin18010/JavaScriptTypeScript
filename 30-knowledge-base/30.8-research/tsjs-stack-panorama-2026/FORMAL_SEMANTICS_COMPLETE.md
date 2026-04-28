---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 形式语义完全指南

> **理论深度**: 研究生级别
> **参考来源**: ECMA-262 §5.2, Giovannini et al. (2025), Ye & Oliveira (2024), Hoare Logic extensions
> **适用范围**: JS/TS 语言实现、静态分析工具开发、类型系统研究

---

## 目录

- [JavaScript/TypeScript 形式语义完全指南](#javascripttypescript-形式语义完全指南)
  - [目录](#目录)
  - [1. 引言：形式语义学概览](#1-引言形式语义学概览)
    - [1.1 为什么需要形式语义？](#11-为什么需要形式语义)
    - [1.2 JS/TS 语义的特殊挑战](#12-jsts-语义的特殊挑战)
  - [2. 操作语义 (Operational Semantics)](#2-操作语义-operational-semantics)
    - [2.1 大步语义 (Big-Step Semantics)](#21-大步语义-big-step-semantics)
      - [2.1.1 数学表示](#211-数学表示)
      - [2.1.2 推理规则（Inference Rules）](#212-推理规则inference-rules)
      - [2.1.3 JS/TS 具体例子](#213-jsts-具体例子)
      - [2.1.4 JS 环境记录模型](#214-js-环境记录模型)
    - [2.2 小步语义 (Small-Step Semantics)](#22-小步语义-small-step-semantics)
      - [2.2.1 数学表示](#221-数学表示)
      - [2.2.2 推理规则](#222-推理规则)
      - [2.2.3 JS/TS 具体例子](#223-jsts-具体例子)
      - [2.2.4 调用栈与求值上下文](#224-调用栈与求值上下文)
      - [2.2.5 大步 vs 小步语义对比](#225-大步-vs-小步语义对比)
    - [2.3 类型导向操作语义 (Type-Directed Operational Semantics)](#23-类型导向操作语义-type-directed-operational-semantics)
      - [2.3.1 核心思想](#231-核心思想)
      - [2.3.2 Gradual Typing 的 TDOS](#232-gradual-typing-的-tdos)
      - [2.3.3 TS 具体例子](#233-ts-具体例子)
      - [2.3.4  blame 追踪与错误定位](#234--blame-追踪与错误定位)
  - [3. 指称语义 (Denotational Semantics)](#3-指称语义-denotational-semantics)
    - [3.1 基础指称语义](#31-基础指称语义)
      - [3.1.1 语义域 (Semantic Domains)](#311-语义域-semantic-domains)
      - [3.1.2 解释函数 (Denotation Function)](#312-解释函数-denotation-function)
      - [3.1.3 JS/TS 具体例子](#313-jsts-具体例子)
      - [3.1.4 递归函数的不动点语义](#314-递归函数的不动点语义)
    - [3.2 Gradual Typing 的指称语义 (Giovannini et al. 2025)](#32-gradual-typing-的指称语义-giovannini-et-al-2025)
      - [3.2.1 核心概念](#321-核心概念)
      - [3.2.2 抽象解释框架](#322-抽象解释框架)
      - [3.2.3 边界语义 (Cast Semantics)](#323-边界语义-cast-semantics)
      - [3.2.4 TS 具体例子](#324-ts-具体例子)
      - [3.2.5 组合性与单调性](#325-组合性与单调性)
    - [3.3 TS 类型擦除的语义解释](#33-ts-类型擦除的语义解释)
      - [3.3.1 擦除映射](#331-擦除映射)
      - [3.3.2 擦除正确性](#332-擦除正确性)
  - [4. 公理语义 (Axiomatic Semantics)](#4-公理语义-axiomatic-semantics)
    - [4.1 Hoare 逻辑基础](#41-hoare-逻辑基础)
      - [4.1.1 Hoare 三元组](#411-hoare-三元组)
      - [4.1.2 推理规则](#412-推理规则)
      - [4.1.3 最弱前置条件](#413-最弱前置条件)
    - [4.2 JS/TS 的 Hoare 逻辑扩展](#42-jsts-的-hoare-逻辑扩展)
      - [4.2.1 动态类型断言](#421-动态类型断言)
      - [4.2.2 引用与别名](#422-引用与别名)
      - [4.2.3 异常与完成记录](#423-异常与完成记录)
      - [4.2.4 TS 具体例子](#424-ts-具体例子)
    - [4.3 分离逻辑与内存推理](#43-分离逻辑与内存推理)
      - [4.3.1 分离逻辑基础](#431-分离逻辑基础)
      - [4.3.2 JS 对象与原型链](#432-js-对象与原型链)
      - [4.3.3 数组与索引验证](#433-数组与索引验证)
  - [5. 语义关系与一致性](#5-语义关系与一致性)
    - [5.1 三种语义的对应关系](#51-三种语义的对应关系)
    - [5.2 可靠性与完备性](#52-可靠性与完备性)
    - [5.3 Gradual Guarantee](#53-gradual-guarantee)
  - [6. 附录：数学符号参考](#6-附录数学符号参考)
    - [6.1 逻辑符号](#61-逻辑符号)
    - [6.2 语义符号](#62-语义符号)
    - [6.3 类型符号](#63-类型符号)
  - [参考文献](#参考文献)

---

## 1. 引言：形式语义学概览

### 1.1 为什么需要形式语义？

形式语义（Formal Semantics）使用严格的数学方法定义编程语言的含义，消除自然语言规范的歧义。对于 JavaScript/TypeScript：

| 语义类型 | 核心问题 | 应用场景 |
|---------|---------|---------|
| **操作语义** | "程序如何执行？" | 解释器实现、调试器设计、执行轨迹分析 |
| **指称语义** | "程序表示什么数学对象？" | 类型系统正确性证明、程序等价性验证 |
| **公理语义** | "程序满足什么逻辑性质？" | 静态分析、程序验证、合约检查 |

### 1.2 JS/TS 语义的特殊挑战

```
┌─────────────────────────────────────────────────────────────────┐
│                    JS/TS 语义层次结构                            │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: TypeScript 类型系统 (静态语义)                         │
│           ├── 类型检查规则 (类型推导、子类型)                     │
│           └── 擦除语义 (Erasure Semantics)                      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: ECMAScript 运行时语义 (动态语义)                       │
│           ├── 执行上下文、环境记录                               │
│           ├── 抽象语法树 → 完成记录                              │
│           └── 引用规范类型 (Reference Specification Type)        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: 宿主环境语义 (HTML/Node.js)                            │
│           ├── 事件循环 (Event Loop)                              │
│           └── 任务队列与微任务                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 操作语义 (Operational Semantics)

操作语义通过定义**抽象机器**的状态转换来描述程序执行。分为两种主要风格：

### 2.1 大步语义 (Big-Step Semantics)

> **定义**: 大步语义（又称自然语义）直接描述表达式到最终值的完整求值关系，忽略中间步骤。

#### 2.1.1 数学表示

大步语义使用**判断形式** (judgment form)：

$$
\langle e, \sigma \rangle \Downarrow v
$$

表示：在环境 $\sigma$ 下，表达式 $e$ 求值得到值 $v$。

#### 2.1.2 推理规则（Inference Rules）

**常量规则** (Const):
$$
\frac{}{
  \langle c, \sigma \rangle \Downarrow c
}
\quad \text{(B-Const)}
$$

**变量查找** (Var):
$$
\frac{
  \sigma(x) = v
}{
  \langle x, \sigma \rangle \Downarrow v
}
\quad \text{(B-Var)}
$$

**加法规则** (Add):
$$
\frac{
  \langle e_1, \sigma \rangle \Downarrow n_1 \quad
  \langle e_2, \sigma \rangle \Downarrow n_2 \quad
  n = n_1 + n_2
}{
  \langle e_1 + e_2, \sigma \rangle \Downarrow n
}
\quad \text{(B-Add)}
$$

**函数应用** (App):
$$
\frac{
  \langle e_1, \sigma \rangle \Downarrow \lambda x.e \\
  \langle e_2, \sigma \rangle \Downarrow v_2 \\
  \langle e, \sigma[x \mapsto v_2] \rangle \Downarrow v
}{
  \langle e_1\, e_2, \sigma \rangle \Downarrow v
}
\quad \text{(B-App)}
$$

#### 2.1.3 JS/TS 具体例子

```typescript
// 示例表达式
const result = (x => x + 1)(5);

// 大步语义推导树
// 环境: σ = ∅
// 表达式: (λx.x+1)(5)

// 推导过程:
⟨(λx.x+1)(5), ∅⟩ ⇓ 6
├── ⟨(λx.x+1), ∅⟩ ⇓ λx.x+1           (B-Const)
├── ⟨5, ∅⟩ ⇓ 5                        (B-Const)
└── ⟨x+1, {x:5}⟩ ⇓ 6                  (B-Add)
    ├── ⟨x, {x:5}⟩ ⇓ 5                (B-Var)
    └── ⟨1, {x:5}⟩ ⇓ 1                (B-Const)
```

**完整推导树**：

$$
\frac{
  \frac{}{
    \langle (x) \Rightarrow x + 1, \emptyset \rangle \Downarrow \lambda x.(x + 1)
  }
  \quad
  \frac{}{
    \langle 5, \emptyset \rangle \Downarrow 5
  }
  \quad
  \frac{
    \frac{
      \sigma'(x) = 5
    }{
      \langle x, \sigma' \rangle \Downarrow 5
    }
    \quad
    \frac{}{
      \langle 1, \sigma' \rangle \Downarrow 1
    }
  }{
    \langle x + 1, \sigma' \rangle \Downarrow 6
  }
}{
  \langle ((x) \Rightarrow x + 1)(5), \emptyset \rangle \Downarrow 6
}
$$

其中 $\sigma' = \emptyset[x \mapsto 5]$。

#### 2.1.4 JS 环境记录模型

ECMA-262 使用**环境记录** (Environment Records) 而非简单映射：

$$
\text{Env} = \text{DeclarativeEnvironmentRecord} \mid \text{ObjectEnvironmentRecord}
$$

```
环境记录链式结构:
┌──────────────────────────────────────┐
│  Global Environment Record           │
│  - Object: globalThis                │
│  - Declarative: 全局 let/const       │
└──────────────┬───────────────────────┘
               │ Outer
┌──────────────▼───────────────────────┐
│  Function Environment Record         │
│  - ThisBinding: call 的 this 值      │
│  - Bindings: 参数、局部变量          │
└──────────────┬───────────────────────┘
               │ Outer
┌──────────────▼───────────────────────┐
│  Block Environment Record            │
│  - Bindings: 块级 let/const          │
└──────────────────────────────────────┘
```

---

### 2.2 小步语义 (Small-Step Semantics)

> **定义**: 小步语义（又称结构化操作语义, SOS）描述**单步**状态转换，通过重复应用规则直到达到最终值。

#### 2.2.1 数学表示

小步语义使用转换关系：

$$
\langle e, \sigma \rangle \rightarrow \langle e', \sigma' \rangle \quad \text{或} \quad \langle e, \sigma \rangle \rightarrow v
$$

#### 2.2.2 推理规则

**左操作数求值** (Add-L):
$$
\frac{
  \langle e_1, \sigma \rangle \rightarrow \langle e_1', \sigma' \rangle
}{
  \langle e_1 + e_2, \sigma \rangle \rightarrow \langle e_1' + e_2, \sigma' \rangle
}
\quad \text{(S-Add-L)}
$$

**右操作数求值** (Add-R):
$$
\frac{
  \langle e_2, \sigma \rangle \rightarrow \langle e_2', \sigma' \rangle
}{
  \langle n_1 + e_2, \sigma \rangle \rightarrow \langle n_1 + e_2', \sigma' \rangle
}
\quad \text{(S-Add-R)}
$$

**加法计算** (Add-Compute):
$$
\frac{
  n = n_1 + n_2
}{
  \langle n_1 + n_2, \sigma \rangle \rightarrow n
}
\quad \text{(S-Add)}
$$

**函数应用** (App-β):
$$
\frac{}{
  \langle (\lambda x.e)\, v, \sigma \rangle \rightarrow \langle e, \sigma[x \mapsto v] \rangle
}
\quad \text{(S-β)}
$$

#### 2.2.3 JS/TS 具体例子

```typescript
// 表达式: (x => x + 1)(2 + 3)

// 小步推导序列 (→ 表示单步):
⟨(x => x + 1)(2 + 3), ∅⟩
→ ⟨(x => x + 1)(5), ∅⟩           // 应用 S-Add (2+3=5)
→ ⟨x + 1, {x: 5}⟩                 // 应用 S-β
→ ⟨5 + 1, {x: 5}⟩                 // 应用 S-Var
→ ⟨6, {x: 5}⟩                     // 应用 S-Add
→ 6                               // 值

// 完整的求值轨迹:
Step 1: 2 + 3 → 5                 (S-Add)
Step 2: (λx.x+1)(5) → x+1{x↦5}    (S-β)
Step 3: x{x↦5} → 5                (S-Var)
Step 4: 5 + 1 → 6                 (S-Add)
```

#### 2.2.4 调用栈与求值上下文

小步语义可以显式建模**调用栈**：

$$
\text{Frame} = \langle \square\, e_2, \sigma \rangle \mid \langle v_1\, \square, \sigma \rangle \mid \langle \square + e_2, \sigma \rangle \mid \dots
$$

$$
\text{State} = \langle e, \sigma, \vec{F} \rangle
$$

```typescript
// 复杂表达式: f(g(1))(2)
// 其中 f = x => (y => x + y)
//       g = x => x * 2

// 初始状态:
State₀ = ⟨f(g(1))(2), ∅, []⟩

// 求值步骤:
State₀ → ⟨f(g(1)), ∅, [(□)(2)]⟩        // 创建应用帧
      → ⟨f, ∅, [(□)(g(1)), (□)(2)]⟩    // 创建函数位置帧
      → ⟨λx.(y => x + y), ∅, [(□)(g(1)), (□)(2)]⟩
      → ⟨(y => g(1) + y), ∅, [(□)(2)]⟩ // 应用 f, 继续 g(1)
      → ...
```

#### 2.2.5 大步 vs 小步语义对比

| 特性 | 大步语义 | 小步语义 |
|------|---------|---------|
| **求值粒度** | 完整求值 | 单步转换 |
| **顺序性** | 隐式（通过规则前提） | 显式状态序列 |
| **非终止检测** | 困难 | 容易（无限序列） |
| **并发建模** | 复杂 | 自然（交错语义） |
| **实现对应** | 解释器（递归求值） | 抽象机（状态机） |

---

### 2.3 类型导向操作语义 (Type-Directed Operational Semantics)

> **参考**: Ye & Oliveira (2024), "Type-Directed Operational Semantics"

#### 2.3.1 核心思想

传统操作语义在**动态阶段**处理类型错误。类型导向操作语义 (TDOS) 将**类型信息**传播到运行时，实现更精确的语义：

$$
\text{Typed Configuration} = \langle e : \tau, \sigma, \eta \rangle
$$

其中：

- $e : \tau$ 是带有类型标注的表达式
- $\sigma$ 是值环境
- $\eta$ 是**类型环境**（运行时类型信息）

#### 2.3.2 Gradual Typing 的 TDOS

对于 Gradual Type System（如 TypeScript），TDOS 定义**边界转换** (Boundary Transitions)：

```
类型转换函数:
γ : StaticType × DynamicValue → TypedValue
```

**静态→动态边界** (Inject):
$$
\frac{
  \langle e, \sigma, \eta \rangle \Downarrow v : \tau \quad
  \tau \neq \star
}{
  \langle e : \tau \Rightarrow \star, \sigma, \eta \rangle \Downarrow \langle v, \tau \rangle^\star : \star
}
\quad \text{(TD-Inject)}
$$

**动态→静态边界** (Project):
$$
\frac{
  \langle e, \sigma, \eta \rangle \Downarrow \langle v, \tau' \rangle^\star : \star \quad
  \tau' <: \tau
}{
  \langle e : \star \Rightarrow \tau, \sigma, \eta \rangle \Downarrow v : \tau
}
\quad \text{(TD-Project-OK)}
$$

$$
\frac{
  \langle e, \sigma, \eta \rangle \Downarrow \langle v, \tau' \rangle^\star : \star \quad
  \tau' \not<: \tau
}{
  \langle e : \star \Rightarrow \tau, \sigma, \eta \rangle \Downarrow \text{blame}(\ell)
}
\quad \text{(TD-Project-Fail)}
$$

#### 2.3.3 TS 具体例子

```typescript
// TypeScript 渐进类型示例
function identity<T>(x: T): T {
  return x;
}

// 调用场景
const a: any = "hello";
const s: string = identity<string>(a);  // 边界: any → string

// TDOS 推导:
// 1. a 在动态类型环境中求值: ⟨a, σ, η⟩ ⇓ ⟨"hello", ⊤⟩* : *
// 2. 应用 inject: "hello" 被包装为 tagged value
// 3. 函数应用前执行 project: 检查 ⊤ <: string
// 4. 成功，解包传入函数

// 失败案例:
const n: number = 42;
const str: string = identity<string>(n as any);  // 运行时错误!

// TDOS 失败推导:
// 1. n 求值: 42 : number
// 2. as any 执行 inject: ⟨42, number⟩* : *
// 3. identity<string> 要求 project 到 string
// 4. number <: string ? 否! → blame(l)
```

#### 2.3.4  blame 追踪与错误定位

$$
\text{Blame Label} \quad \ell \in \text{Label}
$$

当类型转换失败时，TDOS 产生 blame 指出**责任方**：

```typescript
// 边界标注示例
function f(x: any /* ℓ₁ */): string /* ℓ₂ */ {
  return x as string;  // 边界: * ⇒ string @ ℓ₁
}

const result = f(42);  // blame ℓ₁: 调用者提供了 number 而非 string
```

**Blame 规则**:

$$
\frac{
  \text{contract}(e) = \tau_1 \xrightarrow{\ell} \tau_2 \\
  \langle e_1, \sigma, \eta \rangle \Downarrow \lambda x.e : \tau_1 \xrightarrow{\ell} \tau_2 \\
  \langle e_2, \sigma, \eta \rangle \Downarrow v : \tau_1' \quad
  \tau_1' \not<: \tau_1
}{
  \langle e_1\, e_2, \sigma, \eta \rangle \Downarrow \text{blame}(\ell)
}
\quad \text{(TD-Blame-Arg)}
$$

---

## 3. 指称语义 (Denotational Semantics)

指称语义将程序**映射到数学对象**（通常是域论中的元素），使得程序性质可以通过数学推理证明。

### 3.1 基础指称语义

#### 3.1.1 语义域 (Semantic Domains)

定义值域 $V$ 和计算域 $C$：

$$
\begin{aligned}
V &= \mathbb{Z} + \mathbb{B} + \text{String} + (V \to C) + \{\text{undefined}, \text{null}\} + \text{Obj} \\
C &= V_\bot \quad \text{(提升值域，包含 } \bot \text{ 表示非终止)}
\end{aligned}
$$

其中：

- $\mathbb{Z}$: 整数
- $\mathbb{B} = \{\text{true}, \text{false}\}$: 布尔值
- $V \to C$: 函数（从值到计算的映射）
- $\text{Obj}$: 对象（属性名字符串到值的有限映射）

#### 3.1.2 解释函数 (Denotation Function)

$$
\llbracket - \rrbracket : \text{Expr} \to (\text{Env} \to C)
$$

**常量**:
$$
\llbracket n \rrbracket(\rho) = n \quad \text{for } n \in \mathbb{Z}
$$

**变量**:
$$
\llbracket x \rrbracket(\rho) = \rho(x)
$$

**加法**:
$$
\llbracket e_1 + e_2 \rrbracket(\rho) =
\begin{cases}
n_1 + n_2 & \text{if } \llbracket e_1 \rrbracket(\rho) = n_1 \text{ and } \llbracket e_2 \rrbracket(\rho) = n_2 \\
\text{string-concat}(s_1, s_2) & \text{if } \llbracket e_1 \rrbracket(\rho) = s_1 \text{ and } \llbracket e_2 \rrbracket(\rho) = s_2 \\
\bot & \text{otherwise (JS 类型强制更复杂)}
\end{cases}
$$

**Lambda 抽象**:
$$
\llbracket \lambda x.e \rrbracket(\rho) = \lambda v. \llbracket e \rrbracket(\rho[x \mapsto v])
$$

**函数应用**:
$$
\llbracket e_1\, e_2 \rrbracket(\rho) =
\begin{cases}
f(v) & \text{if } \llbracket e_1 \rrbracket(\rho) = f \in (V \to C) \\
       & \text{and } \llbracket e_2 \rrbracket(\rho) = v \\
\bot & \text{otherwise}
\end{cases}
$$

#### 3.1.3 JS/TS 具体例子

```typescript
// 表达式: (x => x + 10)(5)

// 指称语义计算:
⟦(x => x + 10)(5)⟧(∅)
= ⟦(x => x + 10)⟧(∅) (⟦5⟧(∅))
= (λv. ⟦x + 10⟧(∅[x↦v])) (5)
= ⟦x + 10⟧(∅[x↦5])
= ⟦x⟧(∅[x↦5]) + ⟦10⟧(∅[x↦5])
= 5 + 10
= 15
```

#### 3.1.4 递归函数的不动点语义

递归函数使用**最小不动点** (Least Fixed Point)：

$$
\llbracket \text{fix}\, f \rrbracket = \bigsqcup_{n \geq 0} f^n(\bot)
$$

```typescript
// 递归阶乘
const fact = (n: number): number =>
  n === 0 ? 1 : n * fact(n - 1);

// 指称语义: fact = fix(λf.λn. n=0 ? 1 : n * f(n-1))
// 展开:
// fact⁰ = ⊥
// fact¹ = λn. n=0 ? 1 : ⊥
// fact² = λn. n=0 ? 1 : n * ((n-1)=0 ? 1 : ⊥)
// ...
// fact^ω = λn. if n≥0 then n! else ⊥
```

---

### 3.2 Gradual Typing 的指称语义 (Giovannini et al. 2025)

> **核心论文**: "Gradual Typing with Decidable Gradual Guarantees" (Giovannini et al., 2025)

#### 3.2.1 核心概念

Gradual Typing 允许**静态类型**和**动态类型**代码混合使用，通过**一致性关系** (Consistency Relation) 而非相等关系连接：

$$
\tau \sim \tau' \quad \text{(类型一致性)}
$$

**一致性规则**:

$$
\frac{}{
  \star \sim \tau
}
\quad \text{(Cons-L)}
\qquad
\frac{}{
  \tau \sim \star
}
\quad \text{(Cons-R)}
\qquad
\frac{}{
  \tau \sim \tau
}
\quad \text{(Cons-Refl)}
$$

$$
\frac{
  \tau_1 \sim \tau_1' \quad \tau_2 \sim \tau_2'
}{
  \tau_1 \to \tau_2 \sim \tau_1' \to \tau_2'
}
\quad \text{(Cons-Fun)}
$$

#### 3.2.2 抽象解释框架

Giovannini et al. (2025) 使用**抽象解释** (Abstract Interpretation) 定义 Gradual Typing 语义：

$$
\text{Concrete Domain } C \xrightarrow{\gamma} \text{ Abstract Domain } A \xrightarrow{\alpha} C
$$

**类型到抽象值的映射**:

| 类型 | 抽象值 |
|------|-------|
| `number` | $\mathbb{Z}_\bot$ |
| `string` | $\text{String}_\bot$ |
| `boolean` | $\mathbb{B}_\bot$ |
| `T \| U` | $\alpha(T) \cup \alpha(U)$ |
| `T & U` | $\alpha(T) \cap \alpha(U)$ |
| `any` ($\star$) | $\top$ (全集) |
| `unknown` | $\top$ (但需显式检查) |
| `never` | $\bot$ (空集) |

#### 3.2.3 边界语义 (Cast Semantics)

类型转换的指称语义使用**嵌入-投影对** (Embedding-Projection Pair, EP Pair)：

$$
\text{Cast}(\tau_1 \Rightarrow \tau_2) = \langle e: V_{\tau_1} \to V_{\tau_2}, p: V_{\tau_2} \to V_{\tau_1} \rangle
$$

**具体规则**:

```
精确类型转换 (Identity):
Cast(number ⇒ number) = ⟨id, id⟩

动态类型转换 (Wrap):
Cast(number ⇒ any) = ⟨λx.⟨x,number⟩*, λ⟨x,τ⟩*.x⟩

静态化转换 (Check):
Cast(any ⇒ number) = ⟨λ⟨x,τ⟩*.if τ<:number then x else blame,
                     λx.⟨x,number⟩*⟩
```

#### 3.2.4 TS 具体例子

```typescript
// 场景 1: 精确转换 (无运行时开销)
const n1: number = 42;
const n2: number = n1;  // Cast(number ⇒ number) = id

// 指称: ⟦n2⟧ = id(⟦n1⟧) = ⟦n1⟧ = 42

// 场景 2: 静态到动态 (包装)
const s: string = "hello";
const a: any = s;        // Cast(string ⇒ *) = wrap

// 指称: ⟦a⟧ = ⟨"hello", string⟩* : *
// 运行时表示: { value: "hello", typeTag: "string" }

// 场景 3: 动态到静态 (检查)
const a2: any = 42;
const n: number = a2 as number;  // Cast(* ⇒ number) = check + unwrap

// 指称: ⟦n⟧ = let ⟨v,τ⟩* = ⟦a2⟧ in
//            if τ <: number then v else blame
//       = let ⟨42,number⟩* in 42 = 42

// 场景 4: 转换失败
const a3: any = "oops";
const n2: number = a3 as number;  // 运行时错误!

// 指称: let ⟨"oops",string⟩* in
//       if string <: number then ... else blame
//       = blame (因为 string ⊄ number)
```

#### 3.2.5 组合性与单调性

Gradual Typing 的关键性质是**单调性** (Monotonicity)：

$$
\text{If } \tau_1 <: \tau_2 \text{ then } \llbracket e : \tau_1 \rrbracket \sqsubseteq \llbracket e : \tau_2 \rrbracket
$$

这保证了**渐进式迁移**的安全性：添加更多类型标注不会破坏已有程序。

---

### 3.3 TS 类型擦除的语义解释

#### 3.3.1 擦除映射

TypeScript 的类型系统在运行时完全擦除：

$$
\text{erase} : \text{TypedTerm} \to \text{UntypedTerm}
$$

**擦除规则**:

```
erase(x : τ) = x
erase(λx:τ.e) = λx.erase(e)
erase(e₁ e₂) = erase(e₁) erase(e₂)
erase(e as τ) = erase(e)          // 类型断言擦除
erase(<τ>e) = erase(e)            // 类型参数擦除
```

#### 3.3.2 擦除正确性

**定理** (Erasure Correctness): 如果 $\Gamma \vdash e : \tau$ 在 TS 中成立，则 $\llbracket e \rrbracket_\text{TS} \cong \llbracket \text{erase}(e) \rrbracket_\text{JS}$。

```typescript
// 擦除示例
const identity = <T>(x: T): T => x;

// 擦除后:
const identity = (x) => x;

// 语义等价性:
// ⟦identity<number>(5)⟧_TS = ⟦identity⟧_JS(5) = 5
```

---

## 4. 公理语义 (Axiomatic Semantics)

公理语义通过**逻辑断言**描述程序行为，核心是 Hoare 逻辑及其扩展。

### 4.1 Hoare 逻辑基础

#### 4.1.1 Hoare 三元组

$$
\{P\}\, C\, \{Q\}
$$

含义：如果前置条件 $P$ 在执行命令 $C$ 前成立，且 $C$ 终止，则后置条件 $Q$ 在 $C$ 后成立。

#### 4.1.2 推理规则

**空语句** (Skip):
$$
\frac{}{
  \{P\}\, \text{skip}\, \{P\}
}
\quad \text{(H-Skip)}
$$

**赋值** (Assign):
$$
\frac{}{
  \{P[e/x]\}\, x := e\, \{P\}
}
\quad \text{(H-Assign)}
$$

**顺序** (Seq):
$$
\frac{
  \{P\}\, C_1\, \{R\} \quad
  \{R\}\, C_2\, \{Q\}
}{
  \{P\}\, C_1; C_2\, \{Q\}
}
\quad \text{(H-Seq)}
$$

**条件** (If):
$$
\frac{
  \{P \land b\}\, C_1\, \{Q\} \quad
  \{P \land \neg b\}\, C_2\, \{Q\}
}{
  \{P\}\, \text{if } b \text{ then } C_1 \text{ else } C_2\, \{Q\}
}
\quad \text{(H-If)}
$$

**循环** (While):
$$
\frac{
  \{I \land b\}\, C\, \{I\}
}{
  \{I\}\, \text{while } b \text{ do } C\, \{I \land \neg b\}
}
\quad \text{(H-While)}
$$

**推论** (Consequence):
$$
\frac{
  P \Rightarrow P' \quad
  \{P'\}\, C\, \{Q'\} \quad
  Q' \Rightarrow Q
}{
  \{P\}\, C\, \{Q\}
}
\quad \text{(H-Conseq)}
$$

#### 4.1.3 最弱前置条件

$$
\text{wp}(C, Q) = \text{ strongest } P \text{ such that } \{P\}\, C\, \{Q\}
$$

**计算规则**:

```
wp(skip, Q) = Q
wp(x := e, Q) = Q[e/x]
wp(C₁; C₂, Q) = wp(C₁, wp(C₂, Q))
wp(if b then C₁ else C₂, Q) = (b ⇒ wp(C₁, Q)) ∧ (¬b ⇒ wp(C₂, Q))
```

---

### 4.2 JS/TS 的 Hoare 逻辑扩展

#### 4.2.1 动态类型断言

JS/TS 需要处理**动态类型检查**：

$$
\{\text{typeof}(x) = \tau\}\, C\, \{Q\}
$$

```typescript
// 示例: 类型守卫后的断言
function process(x: string | number) {
  if (typeof x === 'string') {
    // {typeof(x) = 'string'}
    return x.toUpperCase();
    // {result = toUpper(x) ∧ typeof(x) = 'string'}
  } else {
    // {typeof(x) = 'number'}
    return x * 2;
    // {result = x * 2 ∧ typeof(x) = 'number'}
  }
  // {typeof(result) = 'string' ∨ typeof(result) = 'number'}
}
```

#### 4.2.2 引用与别名

JS 的引用语义需要**别名分析**：

$$
\{x \mapsto v_1 * y \mapsto v_2\}\, C\, \{Q\}
$$

其中 $*$ 是分离逻辑中的**分离合取** (separating conjunction)，表示 $x$ 和 $y$ 指向不同内存位置。

#### 4.2.3 异常与完成记录

ECMAScript 使用**完成记录** (Completion Records)：

$$
\text{Completion} = \langle \text{type}, \text{value}, \text{target} \rangle
$$

其中 type $\in \{\text{normal}, \text{return}, \text{throw}, \text{break}, \text{continue}\}$。

**Hoare 规则扩展**:

$$
\frac{
  \{P \land e \neq \text{undefined}\}\, C\, \{Q\}
}{
  \{P\}\, \text{if } (e)\, C\, \{Q \lor (e = \text{undefined} \land P)\}
}
$$

#### 4.2.4 TS 具体例子

```typescript
// 示例 1: 数组操作验证
function findMax(arr: number[]): number {
  // 前置: {arr.length > 0}
  let max = arr[0];
  // 不变量: {max ∈ arr[0..i) ∧ i ≤ arr.length}
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  // 后置: {max = max(arr[0..arr.length)) ∧ max ∈ arr}
  return max;
}

// 示例 2: 对象不变量
class BankAccount {
  private balance: number;

  // 不变量: {balance ≥ 0}

  deposit(amount: number): void {
    // 前置: {amount ≥ 0}
    this.balance += amount;
    // 后置: {balance = old(balance) + amount ∧ balance ≥ 0}
  }

  withdraw(amount: number): boolean {
    // 前置: {amount ≥ 0}
    if (this.balance >= amount) {
      this.balance -= amount;
      // 后置: {balance = old(balance) - amount ∧ balance ≥ 0}
      return true;
    }
    // 后置: {balance = old(balance) ∧ balance ≥ 0}
    return false;
  }
}
```

---

### 4.3 分离逻辑与内存推理

#### 4.3.1 分离逻辑基础

分离逻辑 (Separation Logic) 专门用于推理**堆内存**操作：

**基本断言**:

- $x \mapsto v$: 位置 $x$ 存储值 $v$
- $\text{emp}$: 空堆
- $P * Q$: 分离合取（$P$ 和 $Q$ 分别在不同的不相交堆上成立）

**关键推理规则**:

**帧规则** (Frame Rule):
$$
\frac{
  \{P\}\, C\, \{Q\}
}{
  \{P * R\}\, C\, \{Q * R\}
}
\quad \text{(SL-Frame)}
$$

含义：程序 $C$ 只能访问 $P$ 描述的内存；$R$ 部分不受影响。

#### 4.3.2 JS 对象与原型链

```
对象断言:
obj(x, {f₁: v₁, ..., fₙ: vₙ})  ≡  x.f₁ ↦ v₁ * ... * x.fₙ ↦ vₙ

原型链断言:
proto(x, p)  ≡  x 的原型是 p
```

```typescript
// 对象创建与操作
const obj = { a: 1, b: 2 };

// 分离逻辑断言: {emp}
// obj = {a:1, b:2}
// 后置: {obj.a ↦ 1 * obj.b ↦ 2}

obj.c = 3;
// 前置: {obj.a ↦ 1 * obj.b ↦ 2}
// 后置: {obj.a ↦ 1 * obj.b ↦ 2 * obj.c ↦ 3}
```

#### 4.3.3 数组与索引验证

$$
\text{array}(a, [v_0, \dots, v_{n-1}]) \equiv a.\text{length} \mapsto n * \bigstar_{i=0}^{n-1} a[i] \mapsto v_i
$$

```typescript
function map<T, U>(arr: T[], f: (x: T) => U): U[] {
  // 前置: {array(arr, vs) ∧ |vs| = n}
  const result: U[] = [];
  // 不变量: {array(arr, vs) * array(result, us) ∧ |us| = i}
  for (let i = 0; i < arr.length; i++) {
    result.push(f(arr[i]));
  }
  // 后置: {array(arr, vs) * array(result, us) ∧ |us| = n ∧ ∀j.us[j] = f(vs[j])}
  return result;
}
```

---

## 5. 语义关系与一致性

### 5.1 三种语义的对应关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                        程序 P                                       │
└──────────────┬───────────────────────┬──────────────────────────────┘
               │                       │
       ┌───────▼───────┐      ┌────────▼────────┐      ┌──────────────▼───────┐
       │  操作语义      │      │   指称语义       │      │    公理语义          │
       │               │      │                 │      │                      │
       │ ⟨P, σ⟩ → σ'   │      │  ⟦P⟧ : Env → V  │      │ {P} C {Q}            │
       │               │      │                 │      │                      │
       │ "如何执行"    │      │ "表示什么"      │      │ "满足什么性质"       │
       └───────┬───────┘      └────────┬────────┘      └──────────────┬───────┘
               │                       │                              │
               └───────────────────────┼──────────────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   一致性定理        │
                            │                     │
                            │  ⟦P⟧(σ) = v  ⟺    │
                            │  ⟨P, σ⟩ →* v      │
                            │                     │
                            │  {true} P {Q}  ⟺  │
                            │  Q(⟦P⟧)           │
                            └─────────────────────┘
```

### 5.2 可靠性与完备性

| 性质 | 定义 | 说明 |
|------|------|------|
| **可靠性** (Soundness) | 如果 $\vdash \{P\}\, C\, \{Q\}$，则 $\models \{P\}\, C\, \{Q\}$ | 证明系统不会接受错误的断言 |
| **完备性** (Completeness) | 如果 $\models \{P\}\, C\, \{Q\}$，则 $\vdash \{P\}\, C\, \{Q\}$ | 所有正确的断言都可证明 |
| **相对完备性** | 在表达能力足够的断言语言下完备 | Hoare 逻辑的实用目标 |

### 5.3 Gradual Guarantee

Siek & Taha (2015) 提出的 Gradual Typing 核心定理：

```
定理 (Gradual Guarantee):
设 e 是带有部分类型标注的程序，e' 是 e 的精化版本（用具体类型替换部分 any）。

1. 静态保证: 如果 e 类型检查通过，则 e' 也类型检查通过
2. 动态保证: 如果 e 求值得 v，则 e' 求值得 v' 且 v 与 v' 行为等价
```

$$
\frac{
  \Gamma \vdash e : \tau \quad
  e' \sqsubseteq e \quad
  \Gamma' \sqsubseteq \Gamma
}{
  \Gamma' \vdash e' : \tau'
}
\quad \text{(Static Gradual Guarantee)}
$$

---

## 6. 附录：数学符号参考

### 6.1 逻辑符号

| 符号 | 含义 | 读法 |
|------|------|------|
| $\vdash$ | 推导/证明 | proves |
| $\models$ | 满足/语义蕴含 | models |
| $\Rightarrow$ | 逻辑蕴含 | implies |
| $\Leftrightarrow$ | 逻辑等价 | iff |
| $\forall$ | 全称量词 | for all |
| $\exists$ | 存在量词 | there exists |
| $\in$ | 属于 | in |
| $\subseteq$ | 子集 | subset |
| $\sqcup$ | 最小上界 | join |
| $\sqcap$ | 最大下界 | meet |
| $\bot$ | 底部/未定义 | bottom |
| $\top$ | 顶部/任意 | top |

### 6.2 语义符号

| 符号 | 含义 |
|------|------|
| $\langle e, \sigma \rangle \Downarrow v$ | 大步语义求值 |
| $\langle e, \sigma \rangle \rightarrow \langle e', \sigma' \rangle$ | 小步语义转换 |
| $\llbracket e \rrbracket$ | 指称/解释 |
| $\{P\}\, C\, \{Q\}$ | Hoare 三元组 |
| $\sigma[x \mapsto v]$ | 环境更新 |
| $e[v/x]$ | 表达式替换 |
| $\star$ | 动态类型/any |
| $\sim$ | 一致性关系 |

### 6.3 类型符号

| 符号 | 含义 |
|------|------|
| $\tau, \sigma$ | 类型变量 |
| $\tau_1 \to \tau_2$ | 函数类型 |
| $\tau_1 + \tau_2$ | 和类型 (union) |
| $\tau_1 \times \tau_2$ | 积类型 (tuple) |
| $\mu \alpha. \tau$ | 递归类型 |
| $\forall \alpha. \tau$ | 全称类型 (泛型) |
| $\exists \alpha. \tau$ | 存在类型 |

---

## 参考文献

1. **ECMA-262** (2025). *ECMAScript® 2025 Language Specification*. TC39.
   - §5.2: Algorithm Conventions
   - §6.2.4: The Reference Specification Type
   - §9.5: Jobs and Host Operations

2. **Giovannini et al.** (2025). "Gradual Typing with Decidable Gradual Guarantees". *POPL 2025*.
   - 指称语义框架
   - 一致性关系的形式化
   - 抽象解释视角

3. **Ye & Oliveira** (2024). "Type-Directed Operational Semantics". *ESOP 2024*.
   - 类型导向操作语义
   - blame 追踪机制
   - 边界语义

4. **Siek & Taha** (2015). "Gradual Typing for Functional Languages". *Scheme and Functional Programming Workshop*.
   - Gradual Guarantee
   - 一致性关系

5. **Hoare** (1969). "An Axiomatic Basis for Computer Programming". *Communications of the ACM*.
   - 经典 Hoare 逻辑

6. **O'Hearn, Reynolds & Yang** (2001). "Local Reasoning about Programs that Alter Data Structures". *CSL*.
   - 分离逻辑基础

7. **Guha et al.** (2010). "The Essence of JavaScript". *ECOOP*.
   - JavaScript 核心语义

8. **Swamy et al.** (2023). "Safe Interoperability between Rust and JavaScript". *PLDI*.
   - 边界语义与内存安全

---

*文档版本: v1.0*
*最后更新: 2025*
*作者: JS/TS 形式语义研究小组*
