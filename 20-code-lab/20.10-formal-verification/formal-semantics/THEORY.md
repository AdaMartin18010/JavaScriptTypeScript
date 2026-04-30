# Formal Semantics (41-formal-semantics)

本模块提供操作语义与公理语义的简化可运行模型。

## 目录

- `00-operational-semantics/` - 小步/大步操作语义
- `02-axiomatic-semantics/` - Hoare 逻辑与最弱前置条件

## 关联模块

- `20.10-formal-verification/type-theory-formal/` - 类型理论
- `20.10-formal-verification/formal-verification/` - 形式化验证

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `index.ts`
- `operational-semantics.ts`

> **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

---

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括：

1. **抽象语法树（AST）建模**：将程序语法结构化为可解释的代数数据类型（ADT）
2. **环境-存储分离（Environment-Store Separation）**：区分变量绑定位置与内存存储值，支持别名与引用分析
3. **结构化操作语义（SOS）规则编码**：将规范中的推理规则转化为可执行的解释器逻辑

---

## 语义学方法论对比

| 特性 | 操作语义（Operational） | 指称语义（Denotational） | 公理语义（Axiomatic） |
|------|----------------------|------------------------|-------------------|
| **核心思想** | 定义程序执行的步骤序列 | 将程序映射到数学对象（函数） | 用逻辑断言描述程序前后条件 |
| **关注点** | "如何"执行（How） | "是什么"（What） | "正确性"（Correctness） |
| **表示形式** | 转移关系 / 抽象机 | 语义函数 ⟦·⟧ : 语法 → 数学域 | Hoare 三元组 {P} C {Q} |
| **可执行性** | 可直接解释执行 | 纯数学定义 | 需定理证明器辅助 |
| **组合性** | 较弱（依赖具体机器） | 强（数学函数天然可组合） | 中等（规则可组合推导） |
| **证明难度** | 中等 | 高（需构造数学模型） | 中等（需逻辑推理） |
| **适用场景** | 语言实现、类型安全证明 | 程序分析、编译器验证 | 程序验证、契约式编程 |
| **代表工作** | Plotkin — SOS | Scott & Strachey | Hoare、Dijkstra |
| **现代工具** | PLT Redex、K Framework | Coq（数学域建模）、Lean | Why3、Dafny、Frama-C |

### 语义学层次关系

```
语法（Syntax）
    ↓ 解释
操作语义 ──→ 抽象机状态转移
    ↓ 抽象                     ↓ 验证
指称语义 ←── 数学函数        公理语义
    ↓ 证明等价
指称 ⟺ 操作 的可靠性（Soundness）与完备性（Completeness）
```

## 代码示例：小步操作语义（Small-Step Semantics）

小步语义将程序执行分解为原子步骤，每一步对应一个状态转移。

```typescript
// src/operational-semantics.ts

// ==================== 抽象语法树 ====================

type Expr =
  | { kind: 'Num'; value: number }
  | { kind: 'Add'; left: Expr; right: Expr }
  | { kind: 'Mul'; left: Expr; right: Expr }
  | { kind: 'Var'; name: string }
  | { kind: 'Assign'; name: string; expr: Expr }
  | { kind: 'Seq'; first: Expr; second: Expr }
  | { kind: 'If'; cond: Expr; thenBranch: Expr; elseBranch: Expr }
  | { kind: 'While'; cond: Expr; body: Expr }
  | { kind: 'Skip' }

// 环境：变量名到值的映射
type Env = Map<string, number>

// 配置：表达式 + 当前环境
type Config = { expr: Expr; env: Env }

// ==================== 语法构造器 ====================

const Num = (value: number): Expr => ({ kind: 'Num', value })
const Add = (left: Expr, right: Expr): Expr => ({ kind: 'Add', left, right })
const Mul = (left: Expr, right: Expr): Expr => ({ kind: 'Mul', left, right })
const Var = (name: string): Expr => ({ kind: 'Var', name })
const Assign = (name: string, expr: Expr): Expr => ({ kind: 'Assign', name, expr })
const Seq = (first: Expr, second: Expr): Expr => ({ kind: 'Seq', first, second })
const If = (cond: Expr, thenBranch: Expr, elseBranch: Expr): Expr => ({
  kind: 'If', cond, thenBranch, elseBranch
})
const While = (cond: Expr, body: Expr): Expr => ({ kind: 'While', cond, body })
const Skip = (): Expr => ({ kind: 'Skip' })

// ==================== 小步转移关系（→） ====================

/**
 * 单步转移函数：Config → Config | null
 * 返回 null 表示无法继续转移（终止或 stuck）
 */
function step(config: Config): Config | null {
  const { expr, env } = config

  switch (expr.kind) {
    // ── 值已经是范式，无法继续 ──
    case 'Num':
      return null

    // ── 变量查找 ──
    case 'Var': {
      const value = env.get(expr.name)
      if (value === undefined) {
        throw new Error(`Unbound variable: ${expr.name}`)
      }
      return { expr: Num(value), env }
    }

    // ── 加法：小步归约 ──
    case 'Add': {
      // 左操作数可规约？
      const leftStep = step({ expr: expr.left, env })
      if (leftStep) {
        return { expr: Add(leftStep.expr, expr.right), env: leftStep.env }
      }
      // 右操作数可规约？
      const rightStep = step({ expr: expr.right, env })
      if (rightStep) {
        return { expr: Add(expr.left, rightStep.expr), env: rightStep.env }
      }
      // 两者都是值，执行加法
      if (expr.left.kind === 'Num' && expr.right.kind === 'Num') {
        return { expr: Num(expr.left.value + expr.right.value), env }
      }
      throw new Error('Invalid Add expression')
    }

    // ── 乘法：与加法类似 ──
    case 'Mul': {
      const leftStep = step({ expr: expr.left, env })
      if (leftStep) {
        return { expr: Mul(leftStep.expr, expr.right), env: leftStep.env }
      }
      const rightStep = step({ expr: expr.right, env })
      if (rightStep) {
        return { expr: Mul(expr.left, rightStep.expr), env: rightStep.env }
      }
      if (expr.left.kind === 'Num' && expr.right.kind === 'Num') {
        return { expr: Num(expr.left.value * expr.right.value), env }
      }
      throw new Error('Invalid Mul expression')
    }

    // ── 赋值：先规约右侧表达式 ──
    case 'Assign': {
      const exprStep = step({ expr: expr.expr, env })
      if (exprStep) {
        return { expr: Assign(expr.name, exprStep.expr), env: exprStep.env }
      }
      if (expr.expr.kind === 'Num') {
        const newEnv = new Map(env)
        newEnv.set(expr.name, expr.expr.value)
        return { expr: Skip(), env: newEnv }
      }
      throw new Error('Invalid Assign expression')
    }

    // ── 序列：先执行第一个，执行完后执行第二个 ──
    case 'Seq': {
      if (expr.first.kind === 'Skip') {
        return { expr: expr.second, env }
      }
      const firstStep = step({ expr: expr.first, env })
      if (firstStep) {
        return { expr: Seq(firstStep.expr, expr.second), env: firstStep.env }
      }
      return null
    }

    // ── 条件分支 ──
    case 'If': {
      const condStep = step({ expr: expr.cond, env })
      if (condStep) {
        return { expr: If(condStep.expr, expr.thenBranch, expr.elseBranch), env: condStep.env }
      }
      if (expr.cond.kind === 'Num') {
        return { expr: expr.cond.value !== 0 ? expr.thenBranch : expr.elseBranch, env }
      }
      throw new Error('Invalid If condition')
    }

    // ── While 循环展开为 If ──
    case 'While': {
      return {
        expr: If(
          expr.cond,
          Seq(expr.body, While(expr.cond, expr.body)),
          Skip()
        ),
        env
      }
    }

    // ── Skip 是终止状态 ──
    case 'Skip':
      return null
  }
}

// ==================== 多步执行与追踪 ====================

/**
 * 多步归约：反复应用 step 直到终止
 */
function evaluate(config: Config): { final: Config; trace: Config[] } {
  const trace: Config[] = [config]
  let current = config

  while (true) {
    const next = step(current)
    if (!next) break
    trace.push(next)
    current = next
  }

  return { final: current, trace }
}

/**
 * 格式化打印配置
 */
function printConfig(config: Config): string {
  const envStr = Array.from(config.env.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
  return `<${printExpr(config.expr)}, {${envStr}}>`
}

function printExpr(expr: Expr): string {
  switch (expr.kind) {
    case 'Num': return `${expr.value}`
    case 'Var': return expr.name
    case 'Add': return `(${printExpr(expr.left)} + ${printExpr(expr.right)})`
    case 'Mul': return `(${printExpr(expr.left)} * ${printExpr(expr.right)})`
    case 'Assign': return `${expr.name} := ${printExpr(expr.expr)}`
    case 'Seq': return `${printExpr(expr.first)}; ${printExpr(expr.second)}`
    case 'If': return `if ${printExpr(expr.cond)} then ${printExpr(expr.thenBranch)} else ${printExpr(expr.elseBranch)}`
    case 'While': return `while ${printExpr(expr.cond)} do ${printExpr(expr.body)}`
    case 'Skip': return 'skip'
  }
}

// ==================== 示例执行 ====================

// 示例：计算阶乘的 while 循环
// n := 5; fact := 1; while n > 0 do (fact := fact * n; n := n - 1)
const factorialProgram = Seq(
  Assign('n', Num(5)),
  Seq(
    Assign('fact', Num(1)),
    While(
      Var('n'),  // 在简化语义中，非零即真
      Seq(
        Assign('fact', Mul(Var('fact'), Var('n'))),
        Assign('n', Add(Var('n'), Num(-1)))
      )
    )
  )
)

// 执行并打印追踪
const result = evaluate({ expr: factorialProgram, env: new Map() })
console.log('=== Small-Step Operational Semantics Trace ===')
result.trace.forEach((cfg, i) => {
  console.log(`Step ${i}: ${printConfig(cfg)}`)
})
console.log(`\nFinal: ${printConfig(result.final)}`)
// 预期结果：fact = 120

// 示例：展示 confluence（汇合性）
// (2 + 3) * (4 + 5) 可以从左或从右开始规约，最终结果相同
const confluenceExample = Mul(
  Add(Num(2), Num(3)),
  Add(Num(4), Num(5))
)
const confluenceResult = evaluate({ expr: confluenceExample, env: new Map() })
console.log('\n=== Confluence Example ===')
confluenceResult.trace.forEach((cfg, i) => {
  console.log(`Step ${i}: ${printConfig(cfg)}`)
})
```

### 小步 vs 大步语义对比

| 特性 | 小步语义（Small-Step） | 大步语义（Big-Step / Natural） |
|------|----------------------|------------------------------|
| **转移粒度** | 单条指令 | 整个表达式/语句 |
| **中间状态** | 暴露所有中间状态 | 直接到最终结果 |
| **非终止行为** | 可建模无限循环 | 无法区分 stuck 与 diverge |
| **并发建模** | 方便（交错语义） | 困难 |
| **证明技术** | 结构归纳 + 共归纳 | 结构归纳 |
| **工具映射** | 解释器、步进调试器 | 编译器求值 |

## 代码示例：Hoare 逻辑（公理语义）

```typescript
// hoare-logic.ts
// 简化版 Hoare 三元组验证器

type Assertion = (env: Map<string, number>) => boolean;

interface HoareTriple {
  pre: Assertion;
  command: string; // 简化表示
  post: Assertion;
}

// 赋值公理：{P[e/x]} x := e {P}
// 即：将后置条件 P 中的 x 替换为 e，得到前置条件
function assignmentAxiom(
  varName: string,
  exprValue: number,
  post: Assertion
): Assertion {
  return (env) => {
    const tempEnv = new Map(env);
    tempEnv.set(varName, exprValue);
    return post(tempEnv);
  };
}

// 顺序组合规则：{P} C1 {R} 且 {R} C2 {Q} ⇒ {P} C1;C2 {Q}
function seqRule(
  triple1: HoareTriple,
  triple2: HoareTriple
): HoareTriple | null {
  // 检查中间条件是否匹配（简化版本）
  const midMatch = triple1.post.toString() === triple2.pre.toString();
  if (!midMatch) return null;
  return { pre: triple1.pre, command: `${triple1.command}; ${triple2.command}`, post: triple2.post };
}

// 条件规则：{P ∧ B} C1 {Q} 且 {P ∧ ¬B} C2 {Q} ⇒ {P} if B then C1 else C2 {Q}
function ifRule(
  pre: Assertion,
  cond: Assertion,
  thenTriple: HoareTriple,
  elseTriple: HoareTriple,
  post: Assertion
): HoareTriple {
  return { pre, command: 'if B then C1 else C2', post };
}

// 循环不变式规则：{I ∧ B} C {I} ⇒ {I} while B do C {I ∧ ¬B}
function whileRule(
  invariant: Assertion,
  cond: Assertion,
  bodyTriple: HoareTriple
): HoareTriple {
  return {
    pre: invariant,
    command: 'while B do C',
    post: (env) => invariant(env) && !cond(env),
  };
}

// 验证示例：验证 {n ≥ 0} fact := 1; i := 1; while i ≤ n do (fact := fact * i; i := i + 1) {fact = n!}
function verifyFactorial() {
  const n = 5;
  const env = new Map<string, number>([['n', n]]);

  // 循环不变式：fact = (i-1)! ∧ 1 ≤ i ≤ n+1
  const invariant: Assertion = (e) => {
    const fact = e.get('fact') ?? 1;
    const i = e.get('i') ?? 1;
    const N = e.get('n') ?? n;
    return fact === factorial(i - 1) && i >= 1 && i <= N + 1;
  };

  const pre: Assertion = (e) => (e.get('n') ?? 0) >= 0;
  const post: Assertion = (e) => (e.get('fact') ?? 0) === factorial(e.get('n') ?? 0);

  console.log('Precondition holds:', pre(env));
  console.log('Postcondition target:', post(env));
  console.log('Invariant construction required for full verification.');
}

function factorial(x: number): number {
  return x <= 1 ? 1 : x * factorial(x - 1);
}

verifyFactorial();
```

## 代码示例：大步语义（Big-Step Semantics）

```typescript
// big-step-semantics.ts
// 大步语义直接定义表达式到最终值的映射

type BExpr =
  | { kind: 'Num'; value: number }
  | { kind: 'Add'; left: BExpr; right: BExpr }
  | { kind: 'Var'; name: string };

type BEnv = Map<string, number>;

function bigEval(expr: BExpr, env: BEnv): number {
  switch (expr.kind) {
    case 'Num':
      return expr.value;
    case 'Var': {
      const v = env.get(expr.name);
      if (v === undefined) throw new Error(`Unbound: ${expr.name}`);
      return v;
    }
    case 'Add':
      return bigEval(expr.left, env) + bigEval(expr.right, env);
  }
}

// 大步语义与小步语义的等价性（对于终止程序）：
// ∀e, env.  smallStepEval(e, env) = bigEval(e, env)
// 证明思路：对表达式结构进行归纳

// 大步语义下的 while 循环（使用不动点/递归）
function bigWhile(
  cond: (env: BEnv) => boolean,
  body: (env: BEnv) => BEnv,
  env: BEnv
): BEnv {
  if (!cond(env)) return env;
  return bigWhile(cond, body, body(env));
}
```

## 代码示例：λ 演算核心（归约语义）

```typescript
// lambda-calculus.ts
// 无类型 λ 演算的简化实现

type LambdaTerm =
  | { kind: 'Var'; name: string }
  | { kind: 'Abs'; param: string; body: LambdaTerm }
  | { kind: 'App'; func: LambdaTerm; arg: LambdaTerm };

const Var = (name: string): LambdaTerm => ({ kind: 'Var', name });
const Abs = (param: string, body: LambdaTerm): LambdaTerm => ({ kind: 'Abs', param, body });
const App = (func: LambdaTerm, arg: LambdaTerm): LambdaTerm => ({ kind: 'App', func, arg });

// α 等价（重命名绑定变量）
function alphaEquivalent(a: LambdaTerm, b: LambdaTerm): boolean {
  return toDeBruijn(a) === toDeBruijn(b);
}

// 简化为 De Bruijn 索引字符串表示
function toDeBruijn(term: LambdaTerm, ctx: string[] = []): string {
  switch (term.kind) {
    case 'Var': {
      const idx = ctx.indexOf(term.name);
      return idx >= 0 ? `#${idx}` : term.name; // 自由变量保留名称
    }
    case 'Abs':
      return `(λ ${toDeBruijn(term.body, [term.param, ...ctx])})`;
    case 'App':
      return `(${toDeBruijn(term.func, ctx)} ${toDeBruijn(term.arg, ctx)})`;
  }
}

// β 归约（替换，简化版，不做捕获避免）
function betaReduce(term: LambdaTerm): LambdaTerm | null {
  if (term.kind !== 'App' || term.func.kind !== 'Abs') return null;
  return substitute(term.func.body, term.func.param, term.arg);
}

function substitute(body: LambdaTerm, name: string, value: LambdaTerm): LambdaTerm {
  switch (body.kind) {
    case 'Var':
      return body.name === name ? value : body;
    case 'Abs':
      if (body.param === name) return body;
      return { kind: 'Abs', param: body.param, body: substitute(body.body, name, value) };
    case 'App':
      return {
        kind: 'App',
        func: substitute(body.func, name, value),
        arg: substitute(body.arg, name, value),
      };
  }
}

// 示例：(λx. λy. x y) (λz. z)
const example = App(Abs('x', Abs('y', App(Var('x'), Var('y')))), Abs('z', Var('z')));
console.log('De Bruijn:', toDeBruijn(example));
```

## 代码示例：环境-存储分离的引用语义

```typescript
// environment-store-semantics.ts
// 引入存储（Store/Heap）以支持可变引用与别名分析

interface Store {
  nextAddr: number;
  heap: Map<number, number>;
}

interface EConfig {
  expr: Expr;
  env: Map<string, number>;   // 变量 → 地址
  store: Store;                // 地址 → 值
}

function allocate(store: Store, value: number): number {
  const addr = store.nextAddr++;
  store.heap.set(addr, value);
  return addr;
}

function updateStore(store: Store, addr: number, value: number): Store {
  store.heap.set(addr, value);
  return store;
}

// 引用语义下的赋值：修改存储中的值，而非环境
function refStep(config: EConfig): EConfig | null {
  const { expr, env, store } = config;
  // ... 扩展 step 以支持地址间接层
  return null;
}

// 别名检测：两个变量指向同一地址
function mayAlias(env: Map<string, number>, a: string, b: string): boolean {
  return env.get(a) === env.get(b);
}
```

## 代码示例：异常的操作语义

```typescript
// exception-semantics.ts
// 扩展小步语义以支持 throw / try-catch

type ExExpr =
  | Expr
  | { kind: 'Throw'; value: ExExpr }
  | { kind: 'Try'; body: ExExpr; catchVar: string; handler: ExExpr }

function exStep(config: { expr: ExExpr; env: Env }): { expr: ExExpr; env: Env } | null {
  const { expr, env } = config;
  // 简化：若当前表达式为 Throw(NUM)，则向上传播
  // 直到遇到 Try 包装器，捕获到 handler
  // 这是结构化操作语义（SOS）的典型实现模式
  return null; // 占位
}
```

## 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

## 权威外部资源

- [Operational Semantics — Wikipedia](https://en.wikipedia.org/wiki/Operational_semantics)
- [Denotational Semantics — Wikipedia](https://en.wikipedia.org/wiki/Denotational_semantics)
- [Axiomatic Semantics — Wikipedia](https://en.wikipedia.org/wiki/Axiomatic_semantics)
- [Plotkin — A Structural Approach to Operational Semantics (SOS)](https://homepages.inf.ed.ac.uk/gdp/publications/sos_jlap.pdf)
- [Winskel — The Formal Semantics of Programming Languages (MIT Press)](https://mitpress.mit.edu/9780262731034/)
- [Pierce — Types and Programming Languages (TAPL)](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [Software Foundations — Vol 2: Programming Language Foundations](https://softwarefoundations.cis.upenn.edu/plf-current/index.html)
- [K Framework — Runtime Verification](https://kframework.org/)
- [PLT Redex — Brown University](https://redex.racket-lang.org/)
- [Hoare Logic — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/logic-hoare/)
- [Dafny — Microsoft Research](https://dafny.org/) — 支持 Hoare 逻辑的程序验证语言
- [Why3 — Program Verification Platform](https://why3.lri.fr/) — 公理语义验证工具
- [CompCert — Verified Compiler](https://compcert.org/) — 经形式化验证的 C 编译器
- [Lambda Calculus — Stanford Encyclopedia](https://plato.stanford.edu/entries/lambda-calculus/)
- [Coq Proof Assistant](https://coq.inria.fr/) — 交互式定理证明
- [Lean Theorem Prover](https://lean-lang.org/) — 现代定理证明器
- [SE4F: Semantics Engineering with PLT Redex](https://redex.racket-lang.org/) — 操作语义工程化教程
- [Harvard CS152: Programming Languages](https://canvas.harvard.edu/courses//cpp) — 形式语义课程
- [MIT 6.821: Program Analysis](https://ocw.mit.edu/courses/6-820-fundamentals-of-program-analysis-fall-2015/) — 程序分析基础

---

> 理论深化更新：2026-04-30
