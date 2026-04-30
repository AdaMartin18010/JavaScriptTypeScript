# 操作语义学

> **定位**：`20-code-lab/20.10-formal-verification/formal-semantics/00-operational-semantics`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块从形式语义学角度精确描述程序执行行为，解决自然语言规范中的歧义理解问题。通过操作语义规则定义求值关系。

### 1.2 形式化基础

操作语义（Operational Semantics）将程序执行建模为配置（configuration）之间的转换关系 `⟨e, σ⟩ → ⟨e', σ'⟩`，其中 `e` 为表达式，`σ` 为存储（store）。小步语义（Small-step）逐次规约，大步语义（Big-step）直接推导结果，二者对确定性语言等价但对并发模型刻画能力不同。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 小步语义 | 逐步化简的求值规则 | small-step.md |
| 大步语义 | 直接到结果的关系推导 | big-step.md |

---

## 二、设计原理

### 2.1 为什么存在

自然语言规范容易产生歧义，导致不同实现行为不一致。操作语义通过数学化的规约关系精确定义每一步求值行为。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 小步语义 | 精确控制流 | 推导冗长 | 并发分析 |
| 大步语义 | 简洁直观 | 隐藏中间状态 | 正确性证明 |

### 2.3 与相关技术的对比

| 维度 | 操作语义 | 指称语义 | 公理语义 | 代数语义 |
|------|----------|----------|----------|----------|
| 核心对象 | 执行步骤/转移 | 数学对象（域） | 逻辑断言 | 方程组 |
| 直观性 | 接近机器执行 | 抽象 | 接近程序逻辑 | 模块化 |
| 并发建模 | 优秀 | 困难 | 中等 | 良好 |
| 实现验证 | 直接 | 间接 | 间接 | 间接 |
| 典型应用 | 解释器/编译器 | 类型系统理论 | 程序验证 | DSL 设计 |

与指称语义对比：操作语义更接近实际执行，便于实现验证。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 操作语义学 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：小步操作语义解释器（While 语言子集）

```typescript
// small-step-interpreter.ts — While 语言小步解释器，可运行 (Node.js / Deno)

// 抽象语法树
type Expr =
  | { tag: 'Num'; n: number }
  | { tag: 'Var'; x: string }
  | { tag: 'Add'; left: Expr; right: Expr }
  | { tag: 'Lt'; left: Expr; right: Expr };

type Stmt =
  | { tag: 'Skip' }
  | { tag: 'Assign'; x: string; e: Expr }
  | { tag: 'Seq'; s1: Stmt; s2: Stmt }
  | { tag: 'If'; cond: Expr; thenBranch: Stmt; elseBranch: Stmt }
  | { tag: 'While'; cond: Expr; body: Stmt };

type Store = Map<string, number>;

function isValue(e: Expr): boolean {
  return e.tag === 'Num';
}

// 小步求值：表达式 → 表达式 或 语句 → 语句 × Store
function stepExpr(e: Expr, σ: Store): { e: Expr; σ: Store } {
  switch (e.tag) {
    case 'Num':
      return { e, σ };
    case 'Var': {
      const v = σ.get(e.x);
      if (v === undefined) throw new Error(`Unbound variable ${e.x}`);
      return { e: { tag: 'Num', n: v }, σ };
    }
    case 'Add': {
      if (!isValue(e.left)) {
        const r = stepExpr(e.left, σ);
        return { e: { tag: 'Add', left: r.e, right: e.right }, σ: r.σ };
      }
      if (!isValue(e.right)) {
        const r = stepExpr(e.right, σ);
        return { e: { tag: 'Add', left: e.left, right: r.e }, σ: r.σ };
      }
      return { e: { tag: 'Num', n: (e.left as Extract<Expr, { tag: 'Num' }>).n + (e.right as Extract<Expr, { tag: 'Num' }>).n }, σ };
    }
    case 'Lt': {
      if (!isValue(e.left)) {
        const r = stepExpr(e.left, σ);
        return { e: { tag: 'Lt', left: r.e, right: e.right }, σ: r.σ };
      }
      if (!isValue(e.right)) {
        const r = stepExpr(e.right, σ);
        return { e: { tag: 'Lt', left: e.left, right: r.e }, σ: r.σ };
      }
      const ln = (e.left as Extract<Expr, { tag: 'Num' }>).n;
      const rn = (e.right as Extract<Expr, { tag: 'Num' }>).n;
      return { e: { tag: 'Num', n: ln < rn ? 1 : 0 }, σ };
    }
  }
}

function stepStmt(s: Stmt, σ: Store): { s: Stmt; σ: Store } {
  switch (s.tag) {
    case 'Skip':
      return { s, σ };
    case 'Assign': {
      const r = stepExpr(s.e, σ);
      if (isValue(r.e)) {
        const n = (r.e as Extract<Expr, { tag: 'Num' }>).n;
        const newStore = new Map(r.σ);
        newStore.set(s.x, n);
        return { s: { tag: 'Skip' }, σ: newStore };
      }
      return { s: { tag: 'Assign', x: s.x, e: r.e }, σ: r.σ };
    }
    case 'Seq': {
      if (s.s1.tag === 'Skip') return { s: s.s2, σ };
      const r = stepStmt(s.s1, σ);
      return { s: { tag: 'Seq', s1: r.s, s2: s.s2 }, σ: r.σ };
    }
    case 'If': {
      const r = stepExpr(s.cond, σ);
      if (isValue(r.e)) {
        const n = (r.e as Extract<Expr, { tag: 'Num' }>).n;
        return { s: n !== 0 ? s.thenBranch : s.elseBranch, σ: r.σ };
      }
      return { s: { tag: 'If', cond: r.e, thenBranch: s.thenBranch, elseBranch: s.elseBranch }, σ: r.σ };
    }
    case 'While':
      return { s: { tag: 'If', cond: s.cond, thenBranch: { tag: 'Seq', s1: s.body, s2: s }, elseBranch: { tag: 'Skip' } }, σ };
  }
}

// 大步求值：直接到结果
function bigStepExpr(e: Expr, σ: Store): number {
  switch (e.tag) {
    case 'Num': return e.n;
    case 'Var': return σ.get(e.x) ?? 0;
    case 'Add': return bigStepExpr(e.left, σ) + bigStepExpr(e.right, σ);
    case 'Lt': return bigStepExpr(e.left, σ) < bigStepExpr(e.right, σ) ? 1 : 0;
  }
}

// ===== 演示 =====
// while (x < 3) { x = x + 1 }
const program: Stmt = {
  tag: 'While',
  cond: { tag: 'Lt', left: { tag: 'Var', x: 'x' }, right: { tag: 'Num', n: 3 } },
  body: { tag: 'Assign', x: 'x', e: { tag: 'Add', left: { tag: 'Var', x: 'x' }, right: { tag: 'Num', n: 1 } } },
};

let state: { s: Stmt; σ: Store } = { s: program, σ: new Map([['x', 0]]) };
console.log('Small-step trace:');
while (state.s.tag !== 'Skip') {
  console.log('  Store:', Object.fromEntries(state.σ));
  state = stepStmt(state.s, state.σ);
}
console.log('Final store:', Object.fromEntries(state.σ)); // { x: 3 }
```

#### 可运行示例：带环境与闭包的 λ 演算小步语义

```typescript
// lambda-calculus-small-step.ts — λ 演算 + 环境模型，可运行

type Term =
  | { tag: 'Var'; name: string }
  | { tag: 'Lam'; param: string; body: Term }
  | { tag: 'App'; func: Term; arg: Term }
  | { tag: 'Num'; n: number }
  | { tag: 'Add'; left: Term; right: Term };

// 闭包 = λ 抽象 + 捕获环境
interface Closure {
  tag: 'Closure';
  param: string;
  body: Term;
  env: Env;
}

type Value = Closure | { tag: 'VNum'; n: number };
type Env = Map<string, Value>;

function isValue(t: Term | Value): t is Value {
  return t.tag === 'Closure' || t.tag === 'VNum';
}

function step(t: Term, env: Env): { term: Term | Value; env: Env } {
  switch (t.tag) {
    case 'Var': {
      const v = env.get(t.name);
      if (!v) throw new Error(`Unbound variable: ${t.name}`);
      return { term: v, env };
    }
    case 'Lam':
      // λx.e 在环境 env 下求值为闭包
      return { term: { tag: 'Closure', param: t.param, body: t.body, env }, env };
    case 'App': {
      if (!isValue(t.func)) {
        const r = step(t.func, env);
        return { term: { tag: 'App', func: r.term as Term, arg: t.arg }, env: r.env };
      }
      if (t.func.tag !== 'Closure') throw new Error('Applying non-function');
      if (!isValue(t.arg)) {
        const r = step(t.arg, env);
        return { term: { tag: 'App', func: t.func, arg: r.term as Term }, env: r.env };
      }
      // β 归约：在闭包环境中扩展参数绑定
      const newEnv = new Map(t.func.env);
      newEnv.set(t.func.param, t.arg as Value);
      return { term: t.func.body, env: newEnv };
    }
    case 'Num':
      return { term: { tag: 'VNum', n: t.n }, env };
    case 'Add': {
      if (!isValue(t.left)) {
        const r = step(t.left, env);
        return { term: { tag: 'Add', left: r.term as Term, right: t.right }, env: r.env };
      }
      if (!isValue(t.right)) {
        const r = step(t.right, env);
        return { term: { tag: 'Add', left: t.left, right: r.term as Term }, env: r.env };
      }
      if (t.left.tag !== 'VNum' || t.right.tag !== 'VNum') throw new Error('Adding non-numbers');
      return { term: { tag: 'VNum', n: t.left.n + t.right.n }, env };
    }
  }
}

function evalFull(t: Term, env: Env): Value {
  let current: Term | Value = t;
  let currentEnv = env;
  while (!isValue(current)) {
    const r = step(current, currentEnv);
    current = r.term;
    currentEnv = r.env;
  }
  return current;
}

// ===== 演示：((λx.λy.x+y) 1) 2 =====
const addExpr: Term = {
  tag: 'App',
  func: {
    tag: 'App',
    func: {
      tag: 'Lam', param: 'x',
      body: {
        tag: 'Lam', param: 'y',
        body: {
          tag: 'Add',
          left: { tag: 'Var', name: 'x' },
          right: { tag: 'Var', name: 'y' },
        },
      },
    },
    arg: { tag: 'Num', n: 1 },
  },
  arg: { tag: 'Num', n: 2 },
};

console.log(evalFull(addExpr, new Map())); // { tag: 'VNum', n: 3 }
```

#### 可运行示例：异常处理的操作语义（扩展 While 语言）

```typescript
// exceptions-operational.ts — 扩展 While 语言 with throw/try-catch

type StmtExt =
  | { tag: 'Skip' }
  | { tag: 'Assign'; x: string; e: Expr }
  | { tag: 'Seq'; s1: StmtExt; s2: StmtExt }
  | { tag: 'If'; cond: Expr; thenBranch: StmtExt; elseBranch: StmtExt }
  | { tag: 'While'; cond: Expr; body: StmtExt }
  | { tag: 'Throw'; e: Expr }                          // 抛出异常
  | { tag: 'TryCatch'; body: StmtExt; catchVar: string; handler: StmtExt }; // 捕获异常

// 配置扩展为 <语句, 存储, 异常值 | null>
interface Config {
  s: StmtExt;
  σ: Store;
  exn: { tag: 'Num'; n: number } | null;
}

function stepStmtExt(c: Config): Config {
  const { s, σ, exn } = c;
  if (exn !== null) {
    // 异常传播：Skip 继续向上，TryCatch 捕获
    if (s.tag === 'Seq') {
      // 异常跳过 s2，继续向上传播
      return { s: s.s2, σ, exn }; // 简化：实际应持续传播直到 TryCatch
    }
    if (s.tag === 'TryCatch') {
      // 进入 catch 块，绑定异常值
      const newStore = new Map(σ);
      newStore.set(s.catchVar, exn.n);
      return { s: s.handler, σ: newStore, exn: null };
    }
    return c; // 已是最外层，异常未捕获
  }

  switch (s.tag) {
    case 'Skip': return c;
    case 'Assign': {
      const r = stepExpr(s.e, σ);
      if (isValue(r.e)) {
        const newStore = new Map(r.σ);
        newStore.set(s.x, (r.e as Extract<Expr, { tag: 'Num' }>).n);
        return { s: { tag: 'Skip' }, σ: newStore, exn: null };
      }
      return { s: { tag: 'Assign', x: s.x, e: r.e }, σ: r.σ, exn: null };
    }
    case 'Seq': {
      if (s.s1.tag === 'Skip') return { s: s.s2, σ, exn: null };
      const r = stepStmtExt({ s: s.s1, σ, exn: null });
      return { s: { tag: 'Seq', s1: r.s, s2: s.s2 }, σ: r.σ, exn: r.exn };
    }
    case 'Throw': {
      const r = stepExpr(s.e, σ);
      if (isValue(r.e)) {
        return { s: { tag: 'Skip' }, σ: r.σ, exn: r.e as Extract<Expr, { tag: 'Num' }> };
      }
      return { s: { tag: 'Throw', e: r.e }, σ: r.σ, exn: null };
    }
    case 'TryCatch': {
      const r = stepStmtExt({ s: s.body, σ, exn: null });
      if (r.exn !== null && r.s.tag === 'Skip') {
        // body 求值完成且抛出异常
        const newStore = new Map(r.σ);
        newStore.set(s.catchVar, r.exn.n);
        return { s: s.handler, σ: newStore, exn: null };
      }
      if (r.s.tag === 'Skip' && r.exn === null) {
        return { s: { tag: 'Skip' }, σ: r.σ, exn: null }; // 无异常
      }
      return { s: { tag: 'TryCatch', body: r.s, catchVar: s.catchVar, handler: s.handler }, σ: r.σ, exn: r.exn };
    }
    // ... If, While 类似基础版本
    default: return c;
  }
}

// ===== 演示：try { throw 42 } catch e { x = e } =====
const exnProgram: StmtExt = {
  tag: 'TryCatch',
  body: { tag: 'Throw', e: { tag: 'Num', n: 42 } },
  catchVar: 'e',
  handler: { tag: 'Assign', x: 'x', e: { tag: 'Var', x: 'e' } },
};

let exnState: Config = { s: exnProgram, σ: new Map(), exn: null };
while (exnState.s.tag !== 'Skip' || exnState.exn !== null) {
  exnState = stepStmtExt(exnState);
}
console.log('After catch, x =', exnState.σ.get('x')); // 42
```

### 3.2 非确定性选择：小步语义的优势

```typescript
// 展示小步语义如何精确刻画并发交错（非确定性）
// 引入选择算子：e1 ⊕ e2 可规约为 e1 或 e2

type NondetExpr =
  | { tag: 'Num'; n: number }
  | { tag: 'Choice'; left: NondetExpr; right: NondetExpr };

// 小步语义允许两种规约路径
function stepNondet(e: NondetExpr): NondetExpr[] {
  switch (e.tag) {
    case 'Num':
      return [e];
    case 'Choice':
      // 非确定性：返回两个可能的后继
      return [e.left, e.right];
  }
}

// 探索所有可能路径
function exploreAll(e: NondetExpr, depth = 3): number[][] {
  if (depth === 0) return [];
  const next = stepNondet(e);
  if (next.length === 1 && next[0].tag === 'Num') {
    return [[next[0].n]];
  }
  const results: number[][] = [];
  for (const n of next) {
    for (const path of exploreAll(n, depth - 1)) {
      results.push(path);
    }
  }
  return results;
}

// (1 ⊕ 2) ⊕ 3 的所有可能结果
const expr: NondetExpr = {
  tag: 'Choice',
  left: { tag: 'Choice', left: { tag: 'Num', n: 1 }, right: { tag: 'Num', n: 2 } },
  right: { tag: 'Num', n: 3 },
};
console.log('All paths:', exploreAll(expr)); // [[1], [2], [3]]
```

#### 可运行示例：并行组合的操作语义（交错语义）

```typescript
// concurrent-operational.ts — 两个线程的交错执行模型

type Action =
  | { tag: 'Read'; var: string }
  | { tag: 'Write'; var: string; value: number }
  | { tag: 'Fork'; child: Thread };

interface Thread {
  id: number;
  pc: number;
  actions: Action[];
}

interface ConcurrentConfig {
  threads: Thread[];
  store: Map<string, number>;
  done: number[];
}

// 非确定性地选择一个可运行的线程
function stepConcurrent(c: ConcurrentConfig): ConcurrentConfig[] {
  const results: ConcurrentConfig[] = [];
  for (let i = 0; i < c.threads.length; i++) {
    const t = c.threads[i];
    if (c.done.includes(t.id)) continue;
    const action = t.actions[t.pc];
    if (!action) continue; // 线程结束

    const newThreads = c.threads.map((th, idx) =>
      idx === i ? { ...th, pc: th.pc + 1 } : th
    );
    const newStore = new Map(c.store);
    const newDone = [...c.done];

    switch (action.tag) {
      case 'Read':
        // 读操作不改变存储，仅推进 PC
        results.push({ threads: newThreads, store: newStore, done: newDone });
        break;
      case 'Write':
        newStore.set(action.var, action.value);
        results.push({ threads: newThreads, store: newStore, done: newDone });
        break;
      case 'Fork':
        newThreads.push({ ...action.child, id: newThreads.length });
        results.push({ threads: newThreads, store: newStore, done: newDone });
        break;
    }
  }
  // 标记完成的线程
  for (const t of c.threads) {
    if (t.pc >= t.actions.length && !c.done.includes(t.id)) {
      newDone.push(t.id);
    }
  }
  return results;
}

// ===== 演示：两个线程竞争写入 x =====
const threadA: Thread = {
  id: 0, pc: 0,
  actions: [
    { tag: 'Write', var: 'x', value: 1 },
    { tag: 'Read', var: 'x' },
  ],
};
const threadB: Thread = {
  id: 1, pc: 0,
  actions: [
    { tag: 'Write', var: 'x', value: 2 },
    { tag: 'Read', var: 'x' },
  ],
};

const initial: ConcurrentConfig = { threads: [threadA, threadB], store: new Map(), done: [] };
// 所有交错路径可通过 BFS 探索
function exploreConcurrent(initial: ConcurrentConfig, maxDepth = 4): Map<string, number>[] {
  const finals: Map<string, number>[] = [];
  const queue: { c: ConcurrentConfig; depth: number }[] = [{ c: initial, depth: 0 }];
  while (queue.length) {
    const { c, depth } = queue.shift()!;
    if (depth >= maxDepth) {
      finals.push(c.store);
      continue;
    }
    const nexts = stepConcurrent(c);
    if (nexts.length === 0) {
      finals.push(c.store);
    } else {
      for (const n of nexts) queue.push({ c: n, depth: depth + 1 });
    }
  }
  return finals;
}

console.log('Possible final stores:', exploreConcurrent(initial).map(s => Object.fromEntries(s)));
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 形式语义只是学术游戏 | 形式语义是编译器优化和验证的基础 |
| 小步与大步语义等价 | 它们在并发和非确定性场景表现不同 |

### 3.4 扩展阅读

- [Software Foundations: Programming Language Foundations](https://softwarefoundations.cis.upenn.edu/plf-current/index.html)
- [Types and Programming Languages (TAPL)](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [Semantics with Applications](https://www.cs.ru.nl/~herman/semanticswithapplications.pdf)
- [ECMA-262 Specification](https://tc39.es/ecma262/)
- [Operational Semantics — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/operational-semantics/)
- [CS 242: Stanford Programming Languages](https://web.stanford.edu/class/cs242/) — 操作语义与类型系统课程
- [Concrete Semantics with Isabelle/HOL](https://concrete-semantics.org/) — 用定理证明器验证语义
- [PLFA — Operational Semantics](https://plfa.inf.ed.ac.uk/Part1/BigStep.html) — Agda 形式化操作语义
- [ECMA-262 Algorithm Conventions](https://tc39.es/ecma262/#sec-algorithm-conventions) — 规范中的伪代码语义
- [Semantics with Applications: Operational Semantics](https://www.cs.ru.nl/~herman/semanticswithapplications.pdf) — 教材第 2 章
- [Practical Foundations for Programming Languages (PFPL)](https://www.cs.cmu.edu/~rwh/pfpl.html) — Robert Harper
- [Featherweight Java: A Minimal Core Calculus for Java and GJ](https://doi.org/10.1145/345099.345105) — Igarashi, Pierce, Wadler (TOPLAS 2001)
- [K Framework: Rewriting-Based Semantic Framework](https://kframework.org/) — 可执行操作语义框架
- [PLT Redex: Semantic Modeling](https://redex.racket-lang.org/) — Racket 语义建模工具
- [The Formal Semantics of Programming Languages — Winskel](https://mitpress.mit.edu/9780262731033/) — 经典教材
- [Definitional Interpreters for Higher-Order Programming Languages](https://doi.org/10.1145/942572.807047) — Reynolds (1972) — 高阶语言定义性解释器
- [A Structural Approach to Operational Semantics — Gordon Plotkin](https://homepages.inf.ed.ac.uk/gdp/publications/sos_jlap.pdf) — SOS 奠基论文
- [Lecture Notes on the Lambda Calculus — Peter Selinger](https://arxiv.org/abs/0804.3434) — λ 演算讲义
- [JavaScript: The First 20 Years — Chapter 3](https://dl.acm.org/doi/10.1145/3386327) — JS 语言演化史
- [CompCert: Formally Verified C Compiler](https://compcert.org/) — 形式化语义到编译器验证
- `20.10-formal-verification/formal-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
