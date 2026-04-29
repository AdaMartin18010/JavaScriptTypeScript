# 类型推断

> **定位**：`20-code-lab/20.10-formal-verification/type-theory-formal/01-type-inference`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决在不显式标注类型的情况下，自动推导表达式类型的算法问题。类型推断是 ML 家族语言与 TypeScript 的核心特性，它将类型系统的可用性与形式化的安全性结合。

### 1.2 形式化基础

Hindley-Milner (HM) 类型推断的核心算法（Algorithm W）基于统一（unification）。给定表达式 `e` 和环境 `Γ`，推断算法输出最一般的类型（principal type）`τ` 和替换 `S`，使得 `S(Γ) ⊢ e : τ`。Robinson 统一算法保证：若类型方程 `τ₁ = τ₂` 可解，则存在最一般合一子（mgu）。HM 的复杂度为 O(n) 平均情况，但最坏情况下接近指数级。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 最一般类型 (Principal Type) | 所有合法类型中最宽泛的一个 | principal-type.md |
| 统一 (Unification) | 求解类型方程的替换过程 | unification.md |
|  let-多态性  | `let x = e₁ in e₂` 中 `x` 可被实例化为多态类型 | let-polymorphism.md |

---

## 二、设计原理

### 2.1 为什么存在

显式类型标注在快速原型和复杂泛型场景下成为负担。类型推断让开发者获得静态类型安全的同时保持动态语言的编写体验，这一折中使 TypeScript 和 Rust 成为现代开发的主流选择。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 完全推断 | 代码简洁 | 错误信息晦涩 | ML / Haskell |
| 局部推断 | 错误信息清晰 | 需部分标注 | TypeScript / Rust |
| 无推断 | 显式自文档 | 冗长 | Java / C |

### 2.3 与相关技术的对比

| 维度 | Hindley-Milner | 双向类型检查 | 局部类型推断 | 全局类型推断 |
|------|----------------|--------------|--------------|--------------|
| 推断方向 | 单向（自底向上） | 双向（检查 + 合成） | 混合 | 单向（自顶向下） |
| 多态支持 | let-多态性 | 显式泛型 | 受限 | 受限 |
| 复杂类型 | 不支持高阶类型 | 支持 | 部分支持 | 有限 |
| 错误定位 | 较差（远离错误源） | 优秀 | 良好 | 中等 |
| 代表语言 | Haskell, ML | Rust, Scala 3 | TypeScript | C# `var` |
| 复杂度 | O(n) 平均 | 线性 | 多项式 | 线性 |

与显式类型对比：HM 推断在保持完整性的同时消除了冗余标注，但对高阶多态（如 Haskell 的 Rank-N 类型）需要扩展。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 类型推断 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：简化的 HM Algorithm W（TypeScript 实现）

```typescript
// type-inference.ts — 简化 HM 类型推断演示，可运行 (Node.js / 浏览器)

type Type =
  | { tag: 'Var'; name: string }   // 类型变量
  | { tag: 'Con'; name: string }   // 类型构造器（如 int, bool）
  | { tag: 'Arr'; from: Type; to: Type }; // 函数类型

function tVar(name: string): Type { return { tag: 'Var', name }; }
function tCon(name: string): Type { return { tag: 'Con', name }; }
function tArr(from: Type, to: Type): Type { return { tag: 'Arr', from, to }; }

let varCounter = 0;
function freshVar(): Type {
  return tVar(`t${varCounter++}`);
}

function typeToString(t: Type): string {
  switch (t.tag) {
    case 'Var': return t.name;
    case 'Con': return t.name;
    case 'Arr': return `(${typeToString(t.from)} -> ${typeToString(t.to)})`;
  }
}

// 替换：类型变量 → 类型
type Subst = Map<string, Type>;

function apply(s: Subst, t: Type): Type {
  switch (t.tag) {
    case 'Var': return s.get(t.name) ?? t;
    case 'Con': return t;
    case 'Arr': return tArr(apply(s, t.from), apply(s, t.to));
  }
}

function applySubstToEnv(s: Subst, env: Map<string, Type>): Map<string, Type> {
  const out = new Map<string, Type>();
  env.forEach((t, k) => out.set(k, apply(s, t)));
  return out;
}

function compose(s2: Subst, s1: Subst): Subst {
  const out = new Map<string, Type>();
  s1.forEach((t, k) => out.set(k, apply(s2, t)));
  s2.forEach((t, k) => { if (!out.has(k)) out.set(k, t); });
  return out;
}

function occursIn(x: string, t: Type): boolean {
  switch (t.tag) {
    case 'Var': return t.name === x;
    case 'Con': return false;
    case 'Arr': return occursIn(x, t.from) || occursIn(x, t.to);
  }
}

// Robinson 统一
function unify(t1: Type, t2: Type): Subst {
  if (t1.tag === 'Var' && t2.tag === 'Var' && t1.name === t2.name) return new Map();
  if (t1.tag === 'Var') {
    if (occursIn(t1.name, t2)) throw new Error(`Occurs check failed: ${t1.name} in ${typeToString(t2)}`);
    return new Map([[t1.name, t2]]);
  }
  if (t2.tag === 'Var') {
    if (occursIn(t2.name, t1)) throw new Error(`Occurs check failed: ${t2.name} in ${typeToString(t1)}`);
    return new Map([[t2.name, t1]]);
  }
  if (t1.tag === 'Con' && t2.tag === 'Con' && t1.name === t2.name) return new Map();
  if (t1.tag === 'Arr' && t2.tag === 'Arr') {
    const s1 = unify(t1.from, t2.from);
    const s2 = unify(apply(s1, t1.to), apply(s1, t2.to));
    return compose(s2, s1);
  }
  throw new Error(`Cannot unify ${typeToString(t1)} with ${typeToString(t2)}`);
}

// 表达式
type Expr =
  | { tag: 'Var'; x: string }
  | { tag: 'App'; func: Expr; arg: Expr }
  | { tag: 'Abs'; x: string; body: Expr }
  | { tag: 'Let'; x: string; value: Expr; body: Expr }
  | { tag: 'Num'; n: number };

function infer(env: Map<string, Type>, e: Expr): { type: Type; subst: Subst } {
  switch (e.tag) {
    case 'Var': {
      const t = env.get(e.x);
      if (!t) throw new Error(`Unbound variable: ${e.x}`);
      return { type: t, subst: new Map() };
    }
    case 'Num':
      return { type: tCon('int'), subst: new Map() };
    case 'Abs': {
      const argT = freshVar();
      const newEnv = new Map(env);
      newEnv.set(e.x, argT);
      const { type: bodyT, subst } = infer(newEnv, e.body);
      return { type: tArr(apply(subst, argT), bodyT), subst };
    }
    case 'App': {
      const { type: funcT, subst: s1 } = infer(env, e.func);
      const { type: argT, subst: s2 } = infer(applySubstToEnv(s1, env), e.arg);
      const resultT = freshVar();
      const s3 = unify(apply(s2, funcT), tArr(argT, resultT));
      return { type: apply(s3, resultT), subst: compose(s3, compose(s2, s1)) };
    }
    case 'Let': {
      const { type: valT, subst: s1 } = infer(env, e.value);
      const newEnv = applySubstToEnv(s1, env);
      newEnv.set(e.x, valT);
      const { type: bodyT, subst: s2 } = infer(newEnv, e.body);
      return { type: bodyT, subst: compose(s2, s1) };
    }
  }
}

// ===== 演示 =====
// \x -> x
const idExpr: Expr = { tag: 'Abs', x: 'x', body: { tag: 'Var', x: 'x' } };

// \x -> \y -> x
const constExpr: Expr = {
  tag: 'Abs', x: 'x',
  body: { tag: 'Abs', x: 'y', body: { tag: 'Var', x: 'x' } }
};

// let id = \x -> x in id 42
const letExpr: Expr = {
  tag: 'Let', x: 'id', value: idExpr,
  body: { tag: 'App', func: { tag: 'Var', x: 'id' }, arg: { tag: 'Num', n: 42 } }
};

function demo(name: string, e: Expr) {
  varCounter = 0;
  const { type } = infer(new Map(), e);
  console.log(`${name} : ${typeToString(type)}`);
}

demo('id', idExpr);        // (t0 -> t0)
demo('const', constExpr);  // (t0 -> (t1 -> t0))
demo('let', letExpr);      // int
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 类型推断总是能找到最一般类型 | 高阶多态（Rank-N）下 HM 推断不可判定 |
| TypeScript 使用 HM 推断 | TS 使用结构化类型 + 双向检查，与 HM 名义类型系统不同 |

### 3.3 扩展阅读

- [TAPL: Chapter 22 — Type Reconstruction](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [Damas & Milner: Principal Type-Schemes for Functional Programs (POPL 1982)](https://doi.org/10.1145/582153.582176)
- [TypeScript Compiler Internals: Type Inference](https://github.com/microsoft/TypeScript-Compiler-Notes)
- [Algorithm W Step-by-Step](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.65.7733)
- `20.10-formal-verification/type-theory-formal/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
