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

### 代码示例：简单类型 λ 演算（Simply Typed Lambda Calculus）

```typescript
// stlc.ts — 简单类型 λ 演算的类型检查器

type STLCType = { kind: "int" } | { kind: "bool" } | { kind: "arrow"; from: STLCType; to: STLCType };

type STLCTerm =
  | { kind: "var"; name: string }
  | { kind: "abs"; param: string; paramType: STLCType; body: STLCTerm }
  | { kind: "app"; func: STLCTerm; arg: STLCTerm }
  | { kind: "lit"; value: number | boolean };

class TypeChecker {
  private env = new Map<string, STLCType>();

  check(term: STLCTerm): STLCType {
    switch (term.kind) {
      case "var": {
        const t = this.env.get(term.name);
        if (!t) throw new TypeError(`Unbound variable: ${term.name}`);
        return t;
      }
      case "lit":
        return typeof term.value === "number" ? { kind: "int" } : { kind: "bool" };
      case "abs": {
        const old = this.env.get(term.param);
        this.env.set(term.param, term.paramType);
        const bodyType = this.check(term.body);
        if (old) this.env.set(term.param, old);
        else this.env.delete(term.param);
        return { kind: "arrow", from: term.paramType, to: bodyType };
      }
      case "app": {
        const funcType = this.check(term.func);
        const argType = this.check(term.arg);
        if (funcType.kind !== "arrow") {
          throw new TypeError(`Expected function, got ${funcType.kind}`);
        }
        if (!this.typeEqual(funcType.from, argType)) {
          throw new TypeError(
            `Argument type mismatch: expected ${this.typeToString(funcType.from)}, got ${this.typeToString(argType)}`
          );
        }
        return funcType.to;
      }
    }
  }

  private typeEqual(a: STLCType, b: STLCType): boolean {
    if (a.kind !== b.kind) return false;
    if (a.kind === "arrow" && b.kind === "arrow") {
      return this.typeEqual(a.from, b.from) && this.typeEqual(a.to, b.to);
    }
    return true;
  }

  private typeToString(t: STLCType): string {
    if (t.kind === "int") return "int";
    if (t.kind === "bool") return "bool";
    return `(${this.typeToString(t.from)} -> ${this.typeToString(t.to)})`;
  }
}

// 使用：λx:int. x + 1 的类型是 int -> int
const identityInt: STLCTerm = {
  kind: "abs",
  param: "x",
  paramType: { kind: "int" },
  body: { kind: "var", name: "x" },
};

const checker = new TypeChecker();
console.log(checker.typeToString(checker.check(identityInt))); // "(int -> int)"
```

### 代码示例：TypeScript 类型级编程（类型作为编译期 λ 演算）

```typescript
// type-level-lambda.ts — TypeScript 类型系统即 λ 演算

// 类型层面的 Church 布尔值
type True = <T, F>(t: T, f: F) => T;
type False = <T, F>(t: T, f: F) => F;
type Bool = <T, F>(t: T, f: F) => T | F;

type If<C extends Bool, T, F> = C extends True ? T : F;

// Church 数值（Peano 编码）
type Zero = <F, X>(f: F, x: X) => X;
type Succ<N> = <F, X>(f: F, x: X) => N extends (f: F, x: X) => infer R ? R : never;

// 实用类型构造
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type Not<A extends boolean> = A extends true ? false : true;

type And<A extends boolean, B extends boolean> = A extends true ? (B extends true ? true : false) : false;

// 递归类型：计算元组长度
type Length<T extends readonly unknown[]> = T["length"];

type Head<T extends readonly unknown[]> = T extends [infer H, ...unknown[]] ? H : never;

type Tail<T extends readonly unknown[]> = T extends [unknown, ...infer R] ? R : [];

// 使用
type Len3 = Length<[1, 2, 3]>; // 3
type First = Head<["a", "b", "c"]>; // "a"
type Rest = Tail<["a", "b", "c"]>; // ["b", "c"]
```

### 代码示例：Mini-TypeScript 类型检查器核心

```typescript
// mini-tsc.ts — TypeScript 子集的类型检查器骨架

interface Type {
  kind: "primitive" | "object" | "union" | "function";
  name?: string;
  types?: Type[];       // union
  params?: Param[];     // function
  ret?: Type;           // function
  props?: Property[];   // object
}

interface Param {
  name: string;
  type: Type;
}

interface Property {
  name: string;
  type: Type;
  optional: boolean;
}

const tNumber: Type = { kind: "primitive", name: "number" };
const tString: Type = { kind: "primitive", name: "string" };
const tBoolean: Type = { kind: "primitive", name: "boolean" };

class MiniTypeChecker {
  private scopes: Map<string, Type>[] = [new Map()];

  enterScope(): void { this.scopes.push(new Map()); }
  exitScope(): void { if (this.scopes.length > 1) this.scopes.pop(); }

  define(name: string, type: Type): void {
    this.scopes[this.scopes.length - 1].set(name, type);
  }

  lookup(name: string): Type | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const t = this.scopes[i].get(name);
      if (t) return t;
    }
    return undefined;
  }

  isAssignable(from: Type, to: Type): boolean {
    if (from.kind === "primitive" && to.kind === "primitive") {
      return from.name === to.name;
    }
    if (to.kind === "union") {
      return to.types!.some((t) => this.isAssignable(from, t));
    }
    if (from.kind === "function" && to.kind === "function") {
      if (from.params!.length !== to.params!.length) return false;
      return (
        from.params!.every((p, i) => this.isAssignable(to.params![i].type, p.type))
        && this.isAssignable(from.ret!, to.ret!)
      );
    }
    if (from.kind === "object" && to.kind === "object") {
      return to.props!.every((tp) => {
        const fp = from.props!.find((p) => p.name === tp.name);
        if (!fp) return tp.optional;
        return this.isAssignable(fp.type, tp.type);
      });
    }
    return false;
  }
}

// 验证
const checker = new MiniTypeChecker();
checker.define("x", tNumber);
console.log(checker.lookup("x")?.name); // "number"
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| TAPL | 书籍 | www.cis.upenn.edu/~bcpierce/tapl |
| SF (Software Foundations) | 课程 | softwarefoundations.cis.upenn.edu |
| Agda Standard Library | 文档 | agda.github.io/agda-stdlib |
| TypeScript Compiler API | 参考 | github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API |
| POPL — Principles of Programming Languages | 会议 | sigplan.org/Conferences/POPL |
| ICFP — International Conference on Functional Programming | 会议 | icfp.sigplan.org |
| Lean Prover — Theorem Proving | 文档 | lean-lang.org/theorem_proving |
| Type Challenges | 练习 | github.com/type-challenges/type-challenges |
| PLFA — Programming Language Foundations in Agda | 书籍 | plfa.inf.ed.ac.uk |
| Cornell CS 4110 | 课程 | cs.cornell.edu/courses/cs4110 |

---

*最后更新: 2026-04-29*
