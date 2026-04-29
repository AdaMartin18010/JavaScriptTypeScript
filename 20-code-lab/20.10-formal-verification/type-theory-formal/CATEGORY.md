---
dimension: 综合
sub-dimension: Type theory formal
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Type theory formal 核心概念与工程实践。

## 包含内容

- λ演算、类型推断、子类型关系与 Mini-TypeScript 形式化规约。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📁 00-lambda-calculus
- 📁 01-type-inference
- 📁 02-subtyping
- 📁 03-mini-typescript
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 lambda-calculus.test.ts
- 📄 lambda-calculus.ts

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| 00-lambda-calculus | 无类型与简单类型 λ 演算的可执行模型 | `lambda-calculus.ts` |
| 01-type-inference | Hindley-Milner 类型推断算法实现 | `THEORY.md` |
| 02-subtyping | 记录与函数子类型的形式化规则 | `THEORY.md` |
| 03-mini-typescript | TypeScript 子集的形式化语法与类型检查器 | `index.ts` |

## 类型系统对比

| 类型系统 | 核心特性 | 类型推断 | 表达能力 | 代表语言 |
|----------|----------|----------|----------|----------|
| Simply Typed λ (λ→) | 基础类型 → 函数类型 | 无需推断（全标注） | 低 | 早期 Pascal |
| Hindley-Milner (HM) | 参数多态 + let-泛化 | 完全自动推断 | 中 | ML, Haskell, F# |
| System F (λ2) | 显式类型抽象 / 应用 | 部分推断（限制多） | 高 | Java 泛型, C# |
| System Fω | 高阶类型构造器 | 需辅助标注 | 很高 | Haskell (Kind) |
| 依赖类型 (λΠ) | 类型依赖项（项即类型） | 交互式证明 | 极高 | Coq, Agda, Lean, Idris |

## 代码示例

以下展示一个极简的 λ 演算解释器与 β 归约：

```typescript
// lambda-calculus.ts
type Term = { kind: 'var'; name: string } | { kind: 'abs'; param: string; body: Term } | { kind: 'app'; func: Term; arg: Term };

function substitute(term: Term, name: string, value: Term): Term {
  switch (term.kind) {
    case 'var': return term.name === name ? value : term;
    case 'abs': return term.param === name ? term : { kind: 'abs', param: term.param, body: substitute(term.body, name, value) };
    case 'app': return { kind: 'app', func: substitute(term.func, name, value), arg: substitute(term.arg, name, value) };
  }
}

function reduce(term: Term): Term {
  if (term.kind !== 'app') return term;
  const f = reduce(term.func);
  if (f.kind === 'abs') return reduce(substitute(f.body, f.param, term.arg));
  return { kind: 'app', func: f, arg: reduce(term.arg) };
}

// (λx. x) y -> y
const expr: Term = { kind: 'app', func: { kind: 'abs', param: 'x', body: { kind: 'var', name: 'x' } }, arg: { kind: 'var', name: 'y' } };
console.log(JSON.stringify(reduce(expr))); // {"kind":"var","name":"y"}
```

#### Hindley-Milner 类型推断核心（W 算法简化版）

```typescript
// hm-inference-snippet.ts
type Type = { kind: 'var'; name: string } | { kind: 'arrow'; from: Type; to: Type } | { kind: 'int' };

function unify(a: Type, b: Type, subst: Map<string, Type>): boolean {
  // 实际实现需处理 occurs check 与递归替换
  if (a.kind === 'var') { subst.set(a.name, b); return true; }
  if (b.kind === 'var') { subst.set(b.name, a); return true; }
  if (a.kind === 'int' && b.kind === 'int') return true;
  if (a.kind === 'arrow' && b.kind === 'arrow') {
    return unify(a.from, b.from, subst) && unify(a.to, b.to, subst);
  }
  return false;
}
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| TAPL | 书籍 | [www.cis.upenn.edu/~bcpierce/tapl](https://www.cis.upenn.edu/~bcpierce/tapl/) |
| SF (Software Foundations) | 课程 | [softwarefoundations.cis.upenn.edu](https://softwarefoundations.cis.upenn.edu/) |
| Agda Standard Library | 文档 | [agda.github.io/agda-stdlib](https://agda.github.io/agda-stdlib/) |
| TypeScript Compiler API | 参考 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| POPL — Principles of Programming Languages | 会议 | [sigplan.org/Conferences/POPL](https://www.sigplan.org/Conferences/POPL/) |
| ICFP — International Conference on Functional Programming | 会议 | [icfp.sigplan.org](https://icfp.sigplan.org/) |
| Lean Prover — Theorem Proving | 文档 | [lean-lang.org/theorem_proving/](https://lean-lang.org/theorem_proving/) |

---

*最后更新: 2026-04-29*
