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

---

*最后更新: 2026-04-29*
