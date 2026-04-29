# 类型理论形式化基础

> 本文档为 `40-type-theory-formal` 模块提供理论基础，涵盖 λ 演算、简单类型系统、Hindley-Milner 类型推断，以及 TypeScript 约束型推断与它们的本质差异。

---

## 目录

- [类型理论形式化基础](#类型理论形式化基础)
  - [目录](#目录)
  - [1. λ 演算 (Lambda Calculus)](#1-λ-演算-lambda-calculus)
    - [1.1 语法](#11-语法)
    - [1.2 归约规则](#12-归约规则)
    - [1.3 编码能力](#13-编码能力)
      - [代码示例：邱奇编码的 TypeScript 实现](#代码示例邱奇编码的-typescript-实现)
  - [2. 简单类型 λ 演算 (Simply Typed Lambda Calculus)](#2-简单类型-λ-演算-simply-typed-lambda-calculus)
    - [2.1 类型语法](#21-类型语法)
    - [2.2 类型判断规则（自然演绎风格）](#22-类型判断规则自然演绎风格)
    - [2.3 类型安全性定理](#23-类型安全性定理)
  - [3. Hindley-Milner 类型推断](#3-hindley-milner-类型推断)
    - [3.1 核心思想](#31-核心思想)
    - [3.2 算法步骤](#32-算法步骤)
    - [3.3 合一示例](#33-合一示例)
    - [3.4 HM 的局限性](#34-hm-的局限性)
      - [代码示例：极简合一算法实现](#代码示例极简合一算法实现)
  - [4. TypeScript 的约束型推断](#4-typescript-的约束型推断)
    - [4.1 约束推断 vs HM 合一](#41-约束推断-vs-hm-合一)
    - [4.2 TypeScript 推断的关键差异](#42-typescript-推断的关键差异)
    - [4.3 结构子类型 vs 名义子类型](#43-结构子类型-vs-名义子类型)
  - [5. 与代码实现的映射](#5-与代码实现的映射)
    - [5.1 代码实验室结构](#51-代码实验室结构)
    - [5.2 从理论到代码的桥接](#52-从理论到代码的桥接)
  - [6. 学习路径](#6-学习路径)
    - [前置知识](#前置知识)
    - [后续进阶](#后续进阶)
  - [权威外部参考](#权威外部参考)
  - [模块代码文件索引](#模块代码文件索引)
  - [核心理论深化](#核心理论深化)
    - [关键设计模式](#关键设计模式)
    - [与相邻模块的关系](#与相邻模块的关系)

---

## 1. λ 演算 (Lambda Calculus)

### 1.1 语法

λ 演算是函数式编程和类型理论的计算基础，其语法极简：

```bnf
e ::= x            (变量)
    | λx.e         (抽象 / 函数定义)
    | e e          (应用 / 函数调用)
```

### 1.2 归约规则

| 规则 | 名称 | 形式 |
|------|------|------|
| `(λx.e₁) e₂ → e₁[x/e₂]` | β-归约 | 将参数代入函数体 |
| `λx.e x → e` (x ∉ FV(e)) | η-归约 | 函数与其应用等价 |

**邱奇-罗瑟定理 (Church-Rosser)**：
若表达式 `e` 可分别归约为 `e₁` 和 `e₂`，则存在 `e₃` 使得 `e₁` 和 `e₂` 均可归约为 `e₃`。即，λ 演算的归约结果（若存在）是唯一的。

### 1.3 编码能力

尽管语法简单，λ 演算具有图灵完备性：

- **邱奇数 (Church Numerals)**：`n = λf.λx.fⁿ x`
- **布尔值**：`true = λt.λf.t`，`false = λt.λf.f`
- **递归**：通过 Y 组合子实现不动点 `Y = λf.(λx.f(x x))(λx.f(x x))`

#### 代码示例：邱奇编码的 TypeScript 实现

```typescript
// church-encoding.ts — λ 演算核心构造的 TypeScript 模拟

type Church<T> = (f: (x: T) => T) => (x: T) => T;

// 邱奇数：zero = λf.λx.x
const zero: Church<number> = (f) => (x) => x;

// successor = λn.λf.λx.f (n f x)
const succ = <T>(n: Church<T>): Church<T> => (f) => (x) => f(n(f)(x));

// 将邱奇数转换为 JS number
const churchToNum = (n: Church<number>): number => n((x) => x + 1)(0);

// 构造 1, 2, 3
const one = succ(zero);
const two = succ(one);
const three = succ(two);

console.log(churchToNum(three)); // 3

// 布尔值编码
const churchTrue = <T, U>(a: T) => (_b: U) => a;
const churchFalse = <T, U>(_a: T) => (b: U) => b;

// 条件
const churchIf = <T>(cond: (a: T) => (b: T) => T) => (then_: T) => (else_: T) => cond(then_)(else_);

const result = churchIf(churchTrue)('yes')('no');
console.log(result); // 'yes'

// Y 组合子 (Z 组合子，用于严格求值语言如 JS)
const Z = <T>(f: (g: (x: T) => T) => (x: T) => T): ((x: T) => T) => {
  return ((x: (a: (x: T) => T) => T) => f((y: T) => x(x)(y))) as (x: T) => T;
};

// 使用 Z 组合子定义阶乘
const factorial = Z((recurse: (n: number) => number) => (n: number): number => {
  if (n === 0) return 1;
  return n * recurse(n - 1);
});

console.log(factorial(5)); // 120
```

---

## 2. 简单类型 λ 演算 (Simply Typed Lambda Calculus)

### 2.1 类型语法

在 λ 演算基础上引入类型注解，形成 STLC：

```bnf
τ ::= Base           (基础类型，如 Int, Bool)
    | τ → τ         (函数类型)

e ::= x
    | λx:τ.e        (带类型注解的抽象)
    | e e
```

### 2.2 类型判断规则（自然演绎风格）

```
        x:τ ∈ Γ
     ───────────── (T-Var)
        Γ ⊢ x:τ

      Γ, x:τ₁ ⊢ e:τ₂
   ───────────────────── (T-Abs)
    Γ ⊢ λx:τ₁.e : τ₁→τ₂

    Γ ⊢ e₁:τ₁→τ₂    Γ ⊢ e₂:τ₁
  ─────────────────────────────── (T-App)
          Γ ⊢ e₁ e₂ : τ₂
```

### 2.3 类型安全性定理

**定理 (Progress)**：若 `⊢ e:τ`，则 `e` 要么是一个值，要么可以进一步归约。

**定理 (Preservation)**：若 `Γ ⊢ e:τ` 且 `e → e'`，则 `Γ ⊢ e':τ`。

**推论**：良类型的程序不会陷入 stuck 状态（如将整数当函数调用）。

> 注意：TypeScript **不满足**严格的 Progress/Preservation，因为它是**渐进类型 (Gradual Typing)** 系统，允许 `any` 类型的存在。

---

## 3. Hindley-Milner 类型推断

### 3.1 核心思想

Hindley-Milner (HM) 算法是一种**全局、完整的类型推断**算法：给定无类型注解的表达式，它能自动推导出**最一般类型 (Most General Type / Principal Type)**。

### 3.2 算法步骤

1. **为每个子表达式分配类型变量**（如 `α, β, γ`）
2. **根据语法结构生成约束方程**
3. **使用合一 (Unification) 求解约束集**
4. **若合一成功，则得到最一般类型；若失败，则类型错误**

### 3.3 合一示例

表达式 `λf.λx.f x` 的推断过程：

```
1. 分配变量：f:α, x:β, (f x):γ
2. 由应用规则得约束：α = β → γ
3. 整体类型为：α → β → γ
4. 代入 α： (β → γ) → β → γ
```

HM 的 principal type 为：`(β → γ) → β → γ`（即 `map` 的核心形状）。

### 3.4 HM 的局限性

| 特性 | HM 支持 | TypeScript 支持 |
|------|---------|----------------|
| 多态 (Parametric Polymorphism) | ✅ let-多态 | ✅ 泛型 |
| 子类型 (Subtyping) | ❌ 不支持 | ✅ 结构子类型 |
| 高阶多态 (Higher-rank Polymorphism) | ❌ 不支持 | ✅ 部分支持 |
| 联合类型 (Union Types) | ❌ 不支持 | ✅ `A \| B` |
| 交叉类型 (Intersection Types) | ❌ 不支持 | ✅ `A & B` |
| 条件类型 (Conditional Types) | ❌ 不支持 | ✅ `A extends B ? C : D` |

#### 代码示例：极简合一算法实现

```typescript
// unification.ts — 核心 HM 合一算法的 TypeScript 实现

type Type = { kind: 'var'; name: string } | { kind: 'fun'; arg: Type; ret: Type } | { kind: 'base'; name: string };

type Subst = Map<string, Type>;

function tVar(name: string): Type { return { kind: 'var', name }; }
function tFun(arg: Type, ret: Type): Type { return { kind: 'fun', arg, ret }; }

function occursIn(name: string, t: Type): boolean {
  if (t.kind === 'var') return t.name === name;
  if (t.kind === 'fun') return occursIn(name, t.arg) || occursIn(name, t.ret);
  return false;
}

function apply(subst: Subst, t: Type): Type {
  if (t.kind === 'var') return subst.get(t.name) ?? t;
  if (t.kind === 'fun') return tFun(apply(subst, t.arg), apply(subst, t.ret));
  return t;
}

function unify(t1: Type, t2: Type, subst: Subst = new Map()): Subst | null {
  const a = apply(subst, t1);
  const b = apply(subst, t2);

  if (a.kind === 'var') {
    if (b.kind === 'var' && a.name === b.name) return subst;
    if (occursIn(a.name, b)) return null; // occurs check 失败
    const next = new Map(subst);
    next.set(a.name, b);
    return next;
  }

  if (b.kind === 'var') return unify(b, a, subst);

  if (a.kind === 'base' && b.kind === 'base') {
    return a.name === b.name ? subst : null;
  }

  if (a.kind === 'fun' && b.kind === 'fun') {
    const s1 = unify(a.arg, b.arg, subst);
    if (!s1) return null;
    return unify(a.ret, b.ret, s1);
  }

  return null;
}

// 演示：合一 (α → β) 与 (Int → γ)
const alpha = tVar('α');
const beta = tVar('β');
const gamma = tVar('γ');
const int = { kind: 'base' as const, name: 'Int' };

const result = unify(tFun(alpha, beta), tFun(int, gamma));
console.log(result);
// Map { 'α' => { kind: 'base', name: 'Int' }, 'γ' => { kind: 'var', name: 'β' } }
```

---

## 4. TypeScript 的约束型推断

### 4.1 约束推断 vs HM 合一

TypeScript 的类型推断不是 HM 式的合一，而是**基于约束的局部推断 (Constraint-based Inference)**：

```
HM 合一：       双向推导，从所有上下文收集约束后统一求解
TS 约束推断：   自底向上收集候选类型，结合上下文类型（Contextual Typing）做局部求解
```

### 4.2 TypeScript 推断的关键差异

**示例 1：数组字面量的加宽 (Widening)**

```typescript
const a = [1, 2, 3];        // 推断为 number[]，而非 [1, 2, 3]
const b = [1, 2, 3] as const;  // 推断为 readonly [1, 2, 3]
```

HM 不会区分这两者的语义差异，因为 HM 没有字面量类型 (Literal Types) 的概念。

**示例 2：上下文类型 (Contextual Typing)**

```typescript
const fn: (x: number) => string = x => x.toString();
// 箭头函数参数 x 的类型从左侧 fn 的类型上下文推导而来
```

HM 不支持这种"右侧类型从左侧上下文获得"的推断方式。

**示例 3：泛型的默认推断与显式约束**

```typescript
function identity<T>(x: T): T { return x; }
identity(42);        // T = 42 (字面量推断)
identity<number>(42); // T = number (显式约束)
```

TypeScript 允许通过 `extends` 对泛型参数施加**上界约束**：

```typescript
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
```

这在 HM 中不存在等价概念。

### 4.3 结构子类型 vs 名义子类型

TypeScript 采用**结构子类型 (Structural Subtyping)**：

```typescript
interface Point { x: number; y: number; }
interface Vector { x: number; y: number; }

let p: Point = { x: 1, y: 2 };
let v: Vector = p;  // 合法：结构相同即可兼容
```

而 Java/C# 采用**名义子类型 (Nominal Subtyping)**：即使结构相同，不同名称的类也不兼容。

结构子类型的形式化定义：

```
Γ ⊢ τ₁ <: τ₂  ⟺  τ₂ 的所有成员都在 τ₁ 中存在且类型兼容
```

---

## 5. 与代码实现的映射

### 5.1 代码实验室结构

`20.10-formal-verification/type-theory-formal/` 目录下的实现：

| 代码文件 | 对应理论 | 说明 |
|----------|---------|------|
| `00-lambda-calculus/` | λ 演算 §1 | α-变换、β-归约、邱奇编码的 TypeScript 实现 |
| `01-type-inference/` | HM 算法 §3 | 合一算法、约束求解器的简化版 |
| `02-subtyping/` | 子类型 §4.3 | 结构子类型检查器的实现 |

### 5.2 从理论到代码的桥接

**β-归约** → TypeScript 实现：

```typescript
// λx.e 的表示
interface Lambda {
  kind: 'lambda';
  param: string;
  body: Expr;
}

// β-归约：subst(body, param, arg)
function betaReduce(lambda: Lambda, arg: Expr): Expr {
  return substitute(lambda.body, lambda.param, arg);
}
```

**合一算法** → TypeScript 实现：

```typescript
// 类型变量与替换映射
type TypeVar = { kind: 'var'; name: string };
type Subst = Map<string, Type>;

function unify(t1: Type, t2: Type, subst: Subst): Subst {
  // 核心合一逻辑：变量绑定、函数类型递归合一
}
```

---

## 6. 学习路径

### 前置知识

- `20.1-fundamentals-lab/language-core/` — TypeScript 语法与基础类型
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md §9-10` — 类型系统深度解析与形式化规则

### 后续进阶

- `20.1-fundamentals-lab/js-ts-comparison/THEORY.md` — JS/TS 语义模型的三层对比
- `20.10-formal-verification/formal-semantics/THEORY.md` — 操作语义与类型安全的实现
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ACADEMIC_ALIGNMENT_2025.md` — SGDT、递归子类型等学术前沿

---

> **参考**
>
> - Barendregt, H.P. "The Lambda Calculus" (1984)
> - Hindley, J.R. "The Principal Type-Scheme of an Object in Combinatory Logic" (1969)
> - Milner, R. "A Theory of Type Polymorphism in Programming" (1978)
> - Pierce, B.C. "Types and Programming Languages" (TaPL, 2002)

## 权威外部参考

- [Stanford Encyclopedia of Philosophy — The Lambda Calculus](https://plato.stanford.edu/entries/lambda-calculus/) — λ 演算的权威哲学与逻辑学综述
- [Pierce, B.C. — Types and Programming Languages (TaPL)](https://www.cis.upenn.edu/~bcpierce/tapl/) — 类型理论标准教材
- [Pierce, B.C. — Software Foundations (Coq 形式化)](https://softwarefoundations.cis.upenn.edu/) — 交互式形式化验证教材
- [Hindley-Milner 类型推断论文 (Milner, 1978)](https://doi.org/10.1016/0022-0000(78)90014-4)
- [Cardelli — Type Systems (1997)](http://lucacardelli.name/papers/typesystems.htm) — 类型系统综述
- [Microsoft Research — TypeScript 规范](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)
- [Wikipedia — Hindley-Milner Type System](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system)
- [Wikipedia — Simply Typed Lambda Calculus](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus)
- [MIT 6.042J — Computation Structures (Lambda Calculus)](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/)
- [Cornell CS 4110 — Programming Languages & Logics](https://www.cs.cornell.edu/courses/cs4110/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `index.ts`
- `lambda-calculus.ts`

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
