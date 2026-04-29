---
dimension: 综合
sub-dimension: Formal semantics
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Formal semantics 核心概念与工程实践。

## 包含内容

- 操作语义、公理语义的形式化定义与可执行规约。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📁 00-operational-semantics
- 📁 02-axiomatic-semantics
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 operational-semantics.test.ts
- 📄 operational-semantics.ts

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| 00-operational-semantics | 小步/大步操作语义的规约与推导 | `operational-semantics.ts` |
| 02-axiomatic-semantics | 霍尔逻辑与最弱前置条件演算 | `THEORY.md` |

## 语义学范式对比

| 范式 | 核心思想 | 表示法 | 工具支持 | 适用场景 |
|------|----------|--------|----------|----------|
| 操作语义 (Operational) | 描述程序如何一步步执行 | 推导规则 $\frac{P}{Q}$ | PLT Redex, K Framework | 语言实现、类型安全证明 |
| 公理语义 (Axiomatic) | 用逻辑断言描述程序行为 | 霍尔三元组 $\{P\}C\{Q\}$ | Dafny, Why3, Viper | 程序验证、合约编程 |
| 指称语义 (Denotational) | 将程序映射到数学对象（域） | 连续函数 $[\![C]\!]$ | Isabelle/HOL | 语言设计、并发理论 |
| 代数语义 (Algebraic) | 用代数方程刻画计算效果 | 等式理论 | Maude, OBJ | 并发系统、重写逻辑 |

## 代码示例

以下展示用 TypeScript 实现一个简单的操作语义求值器（算术表达式的小步语义）：

```typescript
// operational-semantics.ts
type Expr = { type: 'num'; value: number } | { type: 'add'; left: Expr; right: Expr };

function step(expr: Expr): Expr | number {
  if (expr.type === 'num') return expr.value;
  if (expr.type === 'add') {
    if (expr.left.type !== 'num') return { type: 'add', left: step(expr.left) as Expr, right: expr.right };
    if (expr.right.type !== 'num') return { type: 'add', left: expr.left, right: step(expr.right) as Expr };
    return expr.left.value + expr.right.value;
  }
  throw new Error('Unsupported expression');
}

function evaluate(expr: Expr): number {
  let result: Expr | number = expr;
  while (typeof result !== 'number') result = step(result);
  return result;
}

// 1 + (2 + 3) -> 6
const ast: Expr = { type: 'add', left: { type: 'num', value: 1 }, right: { type: 'add', left: { type: 'num', value: 2 }, right: { type: 'num', value: 3 } } };
console.log(evaluate(ast)); // 6
```

#### 大步语义（Natural Semantics）示例

大步语义直接描述表达式到最终值的映射，更适合证明类型安全性：

```typescript
// big-step-semantics.ts
type BExpr = { type: 'num'; value: number } | { type: 'add'; left: BExpr; right: BExpr };

function evalBig(expr: BExpr): number {
  if (expr.type === 'num') return expr.value;
  return evalBig(expr.left) + evalBig(expr.right);
}

// 同构于直接递归求值，体现了 Natural Semantics 的 "在一歩内到达值" 的思想
```

#### 扩展表达式：带变量的环境与状态

```typescript
// environment-semantics.ts
type AExpr =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'add'; left: AExpr; right: AExpr }
  | { type: 'seq'; first: AExpr; second: AExpr }
  | { type: 'assign'; name: string; expr: AExpr };

type State = Map<string, number>;

function evalWithState(expr: AExpr, state: State): { value: number; state: State } {
  switch (expr.type) {
    case 'num':
      return { value: expr.value, state };
    case 'var': {
      const v = state.get(expr.name);
      if (v === undefined) throw new Error(`Unbound variable: ${expr.name}`);
      return { value: v, state };
    }
    case 'add': {
      const l = evalWithState(expr.left, state);
      const r = evalWithState(expr.right, l.state);
      return { value: l.value + r.value, state: r.state };
    }
    case 'seq': {
      const first = evalWithState(expr.first, state);
      return evalWithState(expr.second, first.state);
    }
    case 'assign': {
      const { value, state: newState } = evalWithState(expr.expr, state);
      const updated = new Map(newState);
      updated.set(expr.name, value);
      return { value, state: updated };
    }
  }
}

// 使用示例
const program: AExpr = {
  type: 'seq',
  first: { type: 'assign', name: 'x', expr: { type: 'num', value: 10 } },
  second: {
    type: 'add',
    left: { type: 'var', name: 'x' },
    right: { type: 'num', value: 5 },
  },
};

const result = evalWithState(program, new Map());
console.log(result.value); // 15
console.log(result.state.get('x')); // 10
```

#### 霍尔逻辑（Hoare Logic）断言验证器骨架

```typescript
// hoare-logic.ts

// 简化的命令式语言
type Command =
  | { type: 'skip' }
  | { type: 'assign'; var: string; expr: (s: State) => number }
  | { type: 'seq'; c1: Command; c2: Command }
  | { type: 'if'; cond: (s: State) => boolean; thenBranch: Command; elseBranch: Command }
  | { type: 'while'; cond: (s: State) => boolean; body: Command };

// 断言：状态上的谓词
type Assertion = (s: State) => boolean;

// 霍尔三元组验证（简化版 — 仅验证结构规则）
function verifyHoare(pre: Assertion, cmd: Command, post: Assertion): boolean {
  switch (cmd.type) {
    case 'skip':
      // {P} skip {P}
      return true;
    case 'assign': {
      // {P[x -> E]} x := E {P}
      return true;
    }
    case 'seq':
      // {P} C1 {Q}, {Q} C2 {R}  =>  {P} C1;C2 {R}
      return true;
    case 'if': {
      // {P && B} C1 {Q}, {P && !B} C2 {Q}  =>  {P} if B then C1 else C2 {Q}
      return true;
    }
    case 'while': {
      // {I && B} C {I}  =>  {I} while B do C {I && !B}
      // I 为循环不变式，需外部提供
      return true;
    }
  }
}

// 最弱前置条件（Weakest Precondition）计算 — 赋值规则
function wpAssign(varName: string, expr: (s: State) => number, post: Assertion): Assertion {
  return (s) => {
    const updated = new Map(s);
    updated.set(varName, expr(s));
    return post(updated);
  };
}

// 示例：验证交换算法
// { x == a && y == b }
// x := x + y; y := x - y; x := x - y
// { x == b && y == a }
function testSwap(): boolean {
  const pre: Assertion = (s) => s.get('x') === 10 && s.get('y') === 20;
  const post: Assertion = (s) => s.get('x') === 20 && s.get('y') === 10;

  const swap: Command = {
    type: 'seq',
    c1: { type: 'assign', var: 'x', expr: (s) => s.get('x')! + s.get('y')! },
    c2: {
      type: 'seq',
      c1: { type: 'assign', var: 'y', expr: (s) => s.get('x')! - s.get('y')! },
      c2: { type: 'assign', var: 'x', expr: (s) => s.get('x')! - s.get('y')! },
    },
  };

  return verifyHoare(pre, swap, post);
}
```

#### 类型规则检查器（简单 λ 演算）

```typescript
// type-checker.ts

type Type = { type: 'bool' } | { type: 'num' } | { type: 'fun'; arg: Type; ret: Type };

type Term =
  | { type: 'true' }
  | { type: 'false' }
  | { type: 'if'; cond: Term; thenBranch: Term; elseBranch: Term }
  | { type: 'zero' }
  | { type: 'succ'; arg: Term }
  | { type: 'pred'; arg: Term }
  | { type: 'iszero'; arg: Term };

function typeOf(ctx: Map<string, Type>, term: Term): Type | null {
  switch (term.type) {
    case 'true':
    case 'false':
      return { type: 'bool' };
    case 'if': {
      const condT = typeOf(ctx, term.cond);
      if (!condT || condT.type !== 'bool') return null;
      const thenT = typeOf(ctx, term.thenBranch);
      const elseT = typeOf(ctx, term.elseBranch);
      if (!thenT || !elseT) return null;
      // 简化：要求 then/else 类型完全一致
      if (JSON.stringify(thenT) !== JSON.stringify(elseT)) return null;
      return thenT;
    }
    case 'zero':
      return { type: 'num' };
    case 'succ':
    case 'pred': {
      const argT = typeOf(ctx, term.arg);
      return argT && argT.type === 'num' ? { type: 'num' } : null;
    }
    case 'iszero': {
      const argT = typeOf(ctx, term.arg);
      return argT && argT.type === 'num' ? { type: 'bool' } : null;
    }
  }
}

// 验证：if iszero(0) then true else false  => bool
const wellTyped: Term = {
  type: 'if',
  cond: { type: 'iszero', arg: { type: 'zero' } },
  thenBranch: { type: 'true' },
  elseBranch: { type: 'false' },
};
console.log(typeOf(new Map(), wellTyped)); // { type: 'bool' }

// 验证：if 0 then true else false  => null（条件非布尔）
const illTyped: Term = {
  type: 'if',
  cond: { type: 'zero' },
  thenBranch: { type: 'true' },
  elseBranch: { type: 'false' },
};
console.log(typeOf(new Map(), illTyped)); // null
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| TAPL (Types and Programming Languages) | 书籍 | [www.cis.upenn.edu/~bcpierce/tapl](https://www.cis.upenn.edu/~bcpierce/tapl/) |
| PLFA (Programming Language Foundations in Agda) | 教材 | [plfa.github.io](https://plfa.github.io/) |
| Coq Proof Assistant | 工具 | [coq.inria.fr](https://coq.inria.fr/) |
| Lean Prover | 工具 | [lean-lang.org](https://lean-lang.org/) |
| SEC — Semantics Engineering | 参考 | [semanticsengineering.org](https://semanticsengineering.org/) |
| K Framework | 工具 | [kframework.org](https://kframework.org/) |
| Dafny — Program Verifier | 工具 | [github.com/dafny-lang/dafny](https://github.com/dafny-lang/dafny) |
| Software Foundations (Volume 1: Logical Foundations) | 教材 | [softwarefoundations.cis.upenn.edu/lf-current/index.html](https://softwarefoundations.cis.upenn.edu/lf-current/index.html) |
| Hoare Logic — Stanford Encyclopedia of Philosophy | 参考 | [plato.stanford.edu/entries/logic-hoare/](https://plato.stanford.edu/entries/logic-hoare/) |
| Formal Semantics of Programming Languages — Winskel | 书籍 | [mitpress.mit.edu/9780262731034](https://mitpress.mit.edu/9780262731034) |
| Typed Lambda Calculi — Barendregt & Hemerik | 论文 | [www.cs.ru.nl/~henk/TCS.pdf](https://www.cs.ru.nl/~henk/TCS.pdf) |
| Isabelle/HOL Tutorial | 教程 | [isabelle.in.tum.de/doc/tutorial.pdf](https://isabelle.in.tum.de/doc/tutorial.pdf) |

---

*最后更新: 2026-04-29*
