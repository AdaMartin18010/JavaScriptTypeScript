# Lambda 演算

> **定位**：`20-code-lab/20.10-formal-verification/type-theory-formal/00-lambda-calculus`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块从类型理论根基出发，解决函数式编程与类型系统的理论基础问题。Lambda 演算是所有函数式语言和静态类型系统的共同祖先，理解它是掌握高阶函数、闭包和类型推断的前提。

### 1.2 形式化基础

无类型 Lambda 演算（λ-calculus）的语法定义为：

```
e ::= x            (变量)
    | λx.e         (抽象)
    | e e          (应用)
```

核心规约规则为 β-归约：`(λx.e₁) e₂ → e₁[x := e₂]`。Church-Rosser 定理保证：若表达式 `e` 可归约到 `e₁` 和 `e₂`，则存在 `e₃` 使 `e₁` 和 `e₂` 均可归约到 `e₃`。这一合流性质是函数式语言引用透明性的理论根基。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| β-归约 | 函数应用的代换求值 | beta-reduction.md |
| Church 编码 | 仅用 Lambda 构造数据类型 | church-encoding.ts |
| 合流性 (Confluence) | 不同归约路径最终收敛 | confluence.md |

---

## 二、设计原理

### 2.1 为什么存在

Lambda 演算由 Alonzo Church 于 1936 年提出，旨在形式化"可计算性"概念。它证明了通用计算无需指令集、状态或副作用——仅函数抽象与应用即足够。这一发现直接催生了 Lisp、ML、Haskell 及 JavaScript 的箭头函数等现代语言构造。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 无类型 λ | 表达力极强（图灵完备） | 无法静态排错 | 元理论研究 |
| 简单类型 λ | 终止性保证 | 表达能力受限 | 程序语言基础教学 |
| 多态类型 λ (System F) | 参数化抽象 | 类型推断不可判定 | 泛型类型系统 |

### 2.3 与相关技术的对比

| 维度 | 无类型 λ | 简单类型 λ (λ→) | System F (λ2) | 依赖类型 (λΠ) |
|------|----------|------------------|---------------|---------------|
| 类型标注 | 无 | 显式 | 显式/隐式 | 依赖值 |
| 图灵完备 | 是 | 否（强归约） | 是 | 可选 |
| 类型推断 | N/A | 可判定 (Hindley-Milner) | 不可判定 | 部分可判定 |
| 表达能力 | 最高 | 受限 | 参数化多态 | 证明即程序 |
| 现实语言映射 | JS (无类型子集) | 早期 ML | Haskell, Rust 泛型 | Agda, Coq, Lean |
| 终止保证 | 无 | 是 | 否 | 可选 |

与图灵机对比：Lambda 演算与图灵机在计算能力上等价，但前者更贴近现代编程语言的函数抽象。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Lambda 演算 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：Church 编码与组合子（TypeScript 实现）

```typescript
// lambda-calculus.ts — Church 编码与组合子演示，可运行 (Node.js / 浏览器)

// 用函数表示布尔值
const TRUE = <T, F>(x: T) => (y: F) => x;
const FALSE = <T, F>(x: T) => (y: F) => y;
const IF = <T>(cond: (x: T) => (y: T) => T) => (thenBranch: T) => (elseBranch: T) =>
  cond(thenBranch)(elseBranch);

// Church 数值：n 是接收 f 和 x 的高阶函数，将 f 应用 n 次到 x
const ZERO = <T>(f: (x: T) => T) => (x: T) => x;
const SUCC = <T>(n: (f: (x: T) => T) => (x: T) => T) =>
  (f: (x: T) => T) => (x: T) => f(n(f)(x));

const ONE = SUCC(ZERO);
const TWO = SUCC(ONE);
const THREE = SUCC(TWO);

// 将 Church 数值转换为 JS number
const churchToNum = (n: (f: (x: number) => number) => (x: number) => number): number =>
  n((x) => x + 1)(0);

// 加法：将 m 的 SUCC 应用 n 次
const ADD = <T>(m: (f: (x: T) => T) => (x: T) => T) =>
  (n: (f: (x: T) => T) => (x: T) => T) =>
    (f: (x: T) => T) => (x: T) => m(f)(n(f)(x));

// 乘法：组合
const MUL = <T>(m: (f: (x: T) => T) => (x: T) => T) =>
  (n: (f: (x: T) => T) => (x: T) => T) =>
    (f: (x: T) => T) => (x: T) => m(n(f))(x);

// Y 组合子（固定点组合子）— 注意：严格语言需要 Z 组合子
// 这里使用 Z 组合子以支持 TypeScript 的严格求值
const Z = <A, B>(f: (rec: (a: A) => B) => (a: A) => B) =>
  ((x: (y: (a: A) => B) => (a: A) => B) => f((v) => x(x)(v))) (
    (x: (y: (a: A) => B) => (a: A) => B) => f((v) => x(x)(v))
  );

// 阶乘（使用 Z 组合子）
const factorial = Z<number, number>((rec) => (n) =>
  n === 0 ? 1 : n * rec(n - 1)
);

// ===== 演示 =====
console.log('Church ZERO:', churchToNum(ZERO)); // 0
console.log('Church THREE:', churchToNum(THREE)); // 3
console.log('2 + 3 =', churchToNum(ADD(TWO)(THREE))); // 5
console.log('2 * 3 =', churchToNum(MUL(TWO)(THREE))); // 6

console.log('IF TRUE 10 20 =', IF(TRUE)(10)(20)); // 10
console.log('IF FALSE 10 20 =', IF(FALSE)(10)(20)); // 20

console.log('factorial 5 =', factorial(5)); // 120
```

#### 进阶：Church 配对（Pair）与列表编码

```typescript
// Church 配对：PAIR a b = λf. f a b
const PAIR = <A, B>(a: A) => (b: B) => <R>(f: (x: A) => (y: B) => R) => f(a)(b);
const FIRST = <A, B>(p: (f: (x: A) => (y: B) => A) => A) => p((x) => (_y) => x);
const SECOND = <A, B>(p: (f: (x: A) => (y: B) => B) => B) => p((_x) => (y) => y);

// 列表编码：NIL = λc.λn.n   CONS = λh.λt.λc.λn. c h (t c n)
const NIL = <H, R>(c: (h: H) => (t: R) => R) => (n: R) => n;
const CONS = <H>(h: H) => <R>(t: (c: (h: H) => (t: R) => R) => (n: R) => R) =>
  (c: (h: H) => (t: R) => R) => (n: R) => c(h)(t(c)(n));

// 构建列表 [1, 2, 3] 的 Church 编码
const list123 = CONS(1)(CONS(2)(CONS(3)(NIL)));

// 将 Church 列表转换为 JS 数组
const churchListToArray = <H>(list: (c: (h: H) => (t: H[]) => H[]) => (n: H[]) => H[]): H[] =>
  list((h) => (t) => [h, ...t])([]);

console.log('Church list [1,2,3]:', churchListToArray(list123)); // [1, 2, 3]

// 映射：MAP f list = list (λh.λt. CONS (f h) t) NIL
const MAP = <A, B>(f: (a: A) => B) => (list: (c: (h: A) => (t: any) => any) => (n: any) => any) =>
  list((h: A) => (t: any) => CONS(f(h))(t))(NIL);

const doubled = MAP((x: number) => x * 2)(list123);
console.log('doubled:', churchListToArray(doubled)); // [2, 4, 6]
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Lambda 演算只是理论玩具 | Lambda 演算是 JS 箭头函数、闭包和 Promise 的理论基础 |
| Y 组合子可以直接用于生产 | 严格求值语言（如 JS）需要 Z 组合子，否则栈溢出 |

### 3.3 扩展阅读

- [TAPL: Chapter 5 — The Untyped Lambda-Calculus](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [Henk Barendregt: The Lambda Calculus, Its Syntax and Semantics](https://www.sciencedirect.com/bookseries/studies-in-logic-and-the-foundations-of-mathematics/vol/103)
- [Raul Rojas: A Tutorial Introduction to the Lambda Calculus](https://arxiv.org/abs/1503.09060)
- [CompCert: Verified Compilation of Lambda Calculus](https://compcert.org/)
- `20.10-formal-verification/type-theory-formal/`

## 四、权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| TAPL (Types and Programming Languages) | [www.cis.upenn.edu/~bcpierce/tapl](https://www.cis.upenn.edu/~bcpierce/tapl/) | 类型理论经典教材，第5章 λ 演算 |
| Barendregt: The Lambda Calculus | [elsevier.com/books/the-lambda-calculus/barendregt/978-0-444-86748-3](https://www.elsevier.com/books/the-lambda-calculus/barendregt/978-0-444-86748-3) | λ 演算权威专著 |
| Church, 1936 — 原始论文 | [doi.org/10.2307/2268480](https://doi.org/10.2307/2268480) | 形式化可计算性的开创性工作 |
| Rojas 教程 (arXiv) | [arxiv.org/abs/1503.09060](https://arxiv.org/abs/1503.09060) | 免费入门的 λ 演算教程 |
| PLFA — Programming Language Foundations in Agda | [plfa.inf.ed.ac.uk](https://plfa.inf.ed.ac.uk/) | 使用依赖类型形式化 PLT |
| Software Foundations (Coq) | [softwarefoundations.cis.upenn.edu](https://softwarefoundations.cis.upenn.edu/) | UPenn 形式化验证课程 |
| Lambda Calculus in JavaScript | [github.com/tc39/proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching) | TC39 模式匹配提案（λ 演算的现代应用） |
| Hindley-Milner 类型推断 | [wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) | 简单类型 λ 的类型推断算法 |
| To Mock a Mockingbird (Smullyan) | [wikipedia.org/wiki/To_Mock_a_Mockingbird](https://en.wikipedia.org/wiki/To_Mock_a_Mockingbird) | 通过谜题学习组合子逻辑 |
| ECMA-262 规范 — 函数语义 | [tc39.es/ecma262/#sec-ecmascript-function-objects](https://tc39.es/ecma262/#sec-ecmascript-function-objects) | JS 函数对象规范定义 |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
