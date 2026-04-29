# Mini TypeScript

> **定位**：`20-code-lab/20.10-formal-verification/type-theory-formal/03-mini-typescript`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块通过实现一个极简的 TypeScript 子集（Mini TS），解决理解真实编译器类型检查流水线的问题。从词法分析、语法分析到类型检查，完整走通编译器前端的核心阶段。

### 1.2 形式化基础

Mini TS 的类型系统可形式化为 judgments `Γ ⊢ e : T`，包含：

- **基础类型**：`number`, `string`, `boolean`
- **函数类型**：`T₁ → T₂`
- **对象类型**：`{ l₁: T₁, ..., lₙ: Tₙ }`
- **子类型规则**：宽度子类型 + 函数子类型
- **类型检查规则**：标准 simply-typed lambda calculus 扩展

Mini TS 拒绝隐式 `any`，要求所有顶层声明显式标注或可从初始化表达式推断。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 抽象语法树 (AST) | 源代码的结构化表示 | ast.ts |
| 符号表 (Symbol Table) | 标识符到类型/声明的映射 | symbol-table.ts |
| 类型检查 (Type Checking) | 遍历 AST 推导并验证类型 | type-checker.ts |

---

## 二、设计原理

### 2.1 为什么存在

TypeScript 编译器超过 10 万行代码，初学者难以把握核心逻辑。Mini TS 剥离语法糖、模块系统和 JSX，保留类型检查的本质，使编译器原理可教学、可实验。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自研 Mini TS | 完全可控、可教学 | 功能有限 | 学习 / 验证 |
| 改造 tsc | 功能完整 | 代码复杂 | 生产工具 |
| 使用 Babel | 插件生态丰富 | 无类型检查 | 转译 |

### 2.3 与相关技术的对比

| 维度 | Mini TS (教学) | TypeScript Compiler (tsc) | stc (实验) | Babel + TS preset |
|------|----------------|---------------------------|------------|-------------------|
| 类型检查 | 完整（子集） | 完整 | 追求更快 | 无（仅剥离类型） |
| 代码行数 | ~500 | ~100k+ | ~20k | ~50k+（含生态） |
| 目标 | 教学理解 | 生产 | 替代 tsc | 快速转译 |
| 架构 | 单文件 | 多阶段流水线 | Rust 核心 | AST 变换插件 |
| 错误恢复 | 简单 | 极佳 | 中等 | N/A |
| 增量编译 | 无 | 有 | 设计目标 | 有 |

与完整 TypeScript 对比：Mini TS 是理解的工具，tsc 是生产的工具。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Mini TypeScript 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：Mini TS 类型检查器核心

```typescript
// mini-typescript.ts — 极简 TypeScript 子集类型检查器，可运行 (Node.js / 浏览器)

// ===== AST 定义 =====
type Expr =
  | { tag: 'Num'; value: number }
  | { tag: 'Str'; value: string }
  | { tag: 'Bool'; value: boolean }
  | { tag: 'Var'; name: string }
  | { tag: 'Obj'; fields: Map<string, Expr> }
  | { tag: 'Get'; obj: Expr; field: string }
  | { tag: 'Func'; params: { name: string; type: Type }[]; body: Expr; ret: Type }
  | { tag: 'Call'; func: Expr; args: Expr[] }
  | { tag: 'Let'; name: string; type: Type | null; value: Expr; body: Expr };

type Type =
  | { tag: 'Num' }
  | { tag: 'Str' }
  | { tag: 'Bool' }
  | { tag: 'Obj'; fields: Map<string, Type> }
  | { tag: 'Func'; params: Type[]; ret: Type }
  | { tag: 'Never' };

const tNum: Type = { tag: 'Num' };
const tStr: Type = { tag: 'Str' };
const tBool: Type = { tag: 'Bool' };
const tNever: Type = { tag: 'Never' };

function typeToString(t: Type): string {
  switch (t.tag) {
    case 'Num': return 'number';
    case 'Str': return 'string';
    case 'Bool': return 'boolean';
    case 'Never': return 'never';
    case 'Obj': return `{ ${Array.from(t.fields.entries()).map(([k, v]) => `${k}: ${typeToString(v)}`).join(', ')} }`;
    case 'Func': return `(${t.params.map(typeToString).join(', ')}) => ${typeToString(t.ret)}`;
  }
}

function typeEqual(a: Type, b: Type): boolean {
  if (a.tag !== b.tag) return false;
  switch (a.tag) {
    case 'Num': case 'Str': case 'Bool': case 'Never': return true;
    case 'Obj': {
      const bf = (b as Extract<Type, { tag: 'Obj' }>).fields;
      if (a.fields.size !== bf.size) return false;
      for (const [k, v] of a.fields) {
        const bv = bf.get(k);
        if (!bv || !typeEqual(v, bv)) return false;
      }
      return true;
    }
    case 'Func': {
      const bf = b as Extract<Type, { tag: 'Func' }>;
      if (a.params.length !== bf.params.length) return false;
      return a.params.every((p, i) => typeEqual(p, bf.params[i])) && typeEqual(a.ret, bf.ret);
    }
  }
}

// 子类型检查：S <: T ?
function isSubtype(sub: Type, sup: Type): boolean {
  if (typeEqual(sub, sup)) return true;
  if (sub.tag === 'Never') return true;
  if (sub.tag === 'Obj' && sup.tag === 'Obj') {
    // 宽度子类型：sub 必须包含 sup 的所有字段，且对应字段 <: sup 字段
    for (const [k, vt] of sup.fields) {
      const st = sub.fields.get(k);
      if (!st || !isSubtype(st, vt)) return false;
    }
    return true;
  }
  return false;
}

// 类型检查
function typecheck(env: Map<string, Type>, e: Expr): Type {
  switch (e.tag) {
    case 'Num': return tNum;
    case 'Str': return tStr;
    case 'Bool': return tBool;
    case 'Var': {
      const t = env.get(e.name);
      if (!t) throw new Error(`Unknown variable: ${e.name}`);
      return t;
    }
    case 'Obj': {
      const fields = new Map<string, Type>();
      e.fields.forEach((expr, name) => fields.set(name, typecheck(env, expr)));
      return { tag: 'Obj', fields };
    }
    case 'Get': {
      const ot = typecheck(env, e.obj);
      if (ot.tag !== 'Obj') throw new Error('Property access on non-object');
      const ft = ot.fields.get(e.field);
      if (!ft) throw new Error(`Unknown property: ${e.field}`);
      return ft;
    }
    case 'Func': {
      const newEnv = new Map(env);
      for (const p of e.params) newEnv.set(p.name, p.type);
      const bodyT = typecheck(newEnv, e.body);
      if (!isSubtype(bodyT, e.ret)) throw new Error(`Return type mismatch: ${typeToString(bodyT)} <: ${typeToString(e.ret)}?`);
      return { tag: 'Func', params: e.params.map((p) => p.type), ret: e.ret };
    }
    case 'Call': {
      const ft = typecheck(env, e.func);
      if (ft.tag !== 'Func') throw new Error('Call on non-function');
      if (ft.params.length !== e.args.length) throw new Error('Arity mismatch');
      for (let i = 0; i < e.args.length; i++) {
        const at = typecheck(env, e.args[i]);
        if (!isSubtype(at, ft.params[i])) throw new Error(`Arg ${i} type mismatch`);
      }
      return ft.ret;
    }
    case 'Let': {
      const vt = typecheck(env, e.value);
      const annotated = e.type ?? vt;
      if (e.type && !isSubtype(vt, e.type)) throw new Error('Let annotation mismatch');
      const newEnv = new Map(env);
      newEnv.set(e.name, annotated);
      return typecheck(newEnv, e.body);
    }
  }
}

// ===== 演示 =====
// let add = (x: number, y: number): number => x + y in add(1, 2)
// 模拟：
const addExpr: Expr = {
  tag: 'Let', name: 'add', type: null,
  value: {
    tag: 'Func',
    params: [{ name: 'x', type: tNum }, { name: 'y', type: tNum }],
    body: { tag: 'Var', name: 'x' }, // 简化：返回 x
    ret: tNum,
  },
  body: {
    tag: 'Call',
    func: { tag: 'Var', name: 'add' },
    args: [{ tag: 'Num', value: 1 }, { tag: 'Num', value: 2 }],
  },
};

console.log('add(1,2) :', typeToString(typecheck(new Map(), addExpr))); // number

// 对象宽度子类型：
// let p = { x: 1, y: 2 } in (p as { x: number }).x
const pointExpr: Expr = {
  tag: 'Let', name: 'p', type: null,
  value: {
    tag: 'Obj',
    fields: new Map([
      ['x', { tag: 'Num', value: 1 }],
      ['y', { tag: 'Num', value: 2 }],
    ]),
  },
  body: {
    tag: 'Get',
    obj: { tag: 'Var', name: 'p' },
    field: 'x',
  },
};

console.log('point.x :', typeToString(typecheck(new Map(), pointExpr))); // number
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Mini TS 的类型规则就是 tsc 的规则 | tsc 包含大量隐式转换、上下文类型和重载，远更复杂 |
| 结构子类型总是安全的 | 可变字段和函数参数位置的子类型需额外约束（方差） |

### 3.3 扩展阅读

- [Mini-TypeScript by Sandro Maglione](https://github.com/SandroMaglione/mini_tss)
- [TypeScript Compiler Internals](https://github.com/microsoft/TypeScript-Compiler-Notes)
- [Crafting Interpreters by Robert Nystrom](https://craftinginterpreters.com/)
- [TypeScript Compiler Architecture Overview](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- `20.10-formal-verification/type-theory-formal/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
