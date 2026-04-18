# 里程碑总路线图

> 本文档串联 5 个里程碑的理论基础、关键算法与代码实现，并关联到 `jsts-code-lab` 中的对应模块。

---

## 路线图总览

```
M1: Mini Parser
    │
    ▼ 输出 AST
M2: Type Checker Basics
    │
    ▼ 扩展类型表示与环境
M3: Generic Inference
    │
    ▼ 扩展类型求值
M4: Conditional Types
    │
    ▼ 类型层面实践
M5: Type Challenges
```

---

## Milestone 1: Mini Parser —— 从源代码到 AST

### 目标

实现一个递归下降解析器，支持 TypeScript 子集：变量声明（带类型注解）、函数声明、接口声明、基本表达式。

### 理论基础

**上下文无关文法（CFG）**

本解析器处理的简化文法：

```bnf
Program     ::= Statement*
Statement   ::= VarDecl | FunctionDecl | InterfaceDecl | ExprStmt
VarDecl     ::= ("let" | "const") Identifier (":" Type)? ("=" Expr)? ";"
FunctionDecl::= "function" Identifier TypeParams? "(" Params? ")" (":" Type)? Block
InterfaceDecl::= "interface" Identifier "{" PropertyDecl* "}"
Type        ::= Identifier | Primitive | ArrayType | FunctionType
Primitive   ::= "number" | "string" | "boolean" | "null" | "undefined"
ArrayType   ::= Type "[]"
FunctionType::= "(" Types? ")" "=>" Type
Expr        ::= Literal | Identifier | BinaryExpr | CallExpr
```

**递归下降解析（Recursive Descent Parsing）**

每个非终结符对应一个解析函数。例如 `parseStatement()` 根据当前 Token 的类型分发到具体的解析方法。这种技术直接、易于调试，是教学首选。

**与 `jsts-code-lab/79-compiler-design/` 的关联**

| 本工作坊 | 代码实验室 | 说明 |
|---------|----------|------|
| `lexer.ts` | `79-compiler-design/lexer.ts` | 实验室版本支持完整 JS Token；本版仅支持 TS 子集 |
| `parser.ts` | `79-compiler-design/parser.ts` | 实验室版本支持完整表达式优先级；本版增加类型注解解析 |
| `ast.ts` | `79-compiler-design/ast.ts` | 实验室版本为完整 ESTree；本版增加 TypeAnnotation 节点 |

---

## Milestone 2: Type Checker Basics —— 结构化类型系统

### 目标

基于 M1 的 AST，实现基础类型检查：原始类型推断、赋值兼容性、函数签名检查、接口形状检查。

### 理论基础

**类型环境（Type Environment / Γ）**

类型检查是一个在环境 Γ 下推导表达式类型的过程：

```
Γ ⊢ e : τ    （在环境 Γ 下，表达式 e 具有类型 τ）
```

环境是栈结构：进入函数体时 pushScope()，退出时 popScope()。

**结构子类型（Structural Subtyping）**

TypeScript 采用结构子类型，而非 Java/C# 的名义子类型：

```
τ₁ <: τ₂  ⟺  τ₂ 的所有成员都在 τ₁ 中存在且类型兼容
```

本阶段实现宽度子类型（width subtyping）：`{ x: number, y: number }` 可赋值给 `{ x: number }`。

**与 `jsts-code-lab/40-type-theory-formal/` 的关联**

| 概念 | 理论文件 | 说明 |
|------|---------|------|
| 结构子类型 | `02-subtyping/structural-subtyping.ts` | 实验室版本包含深度子类型规则；本版聚焦宽度子类型 |
| 类型环境 | `THEORY.md` §2.2 | 自然演绎风格的类型判断规则 |

---

## Milestone 3: Generic Inference —— 基于约束的推断

### 目标

扩展类型检查器，支持泛型函数声明、调用点类型推断、泛型约束。

### 理论基础

**Hindley-Milner vs TypeScript 推断**

| 特性 | HM 算法 | TypeScript |
|------|---------|-----------|
| 策略 | 全局合一（Unification） | 局部约束推断 |
| 多态 | let-多态 | 显式泛型参数 |
| 子类型 | 不支持 | 结构子类型 |
| 上下文类型 | 不支持 | 支持 |

本阶段实现的是 **TypeScript 风格的约束推断**，而非完整 HM：

1. 为泛型参数创建类型变量（如 `T`）
2. 在函数调用时，对比实参类型与形参类型，生成替换映射（substitution）
3. 应用替换到返回类型

**合一（Unification）的简化版**

```
unify(T, number)  →  { T ↦ number }
unify(Array<T>, Array<number>)  →  { T ↦ number }
unify(T, U)  →  错误（未绑定变量）
```

**与 `jsts-code-lab/40-type-theory-formal/` 的关联**

| 概念 | 理论文件 | 说明 |
|------|---------|------|
| 合一算法 | `01-type-inference/hindley-milner.ts` | 实验室版本实现完整 HM；本版是 TS 风格的简化 |
| 约束推断 | `THEORY.md` §4.1 | TS 使用自底向上的约束收集 |

---

## Milestone 4: Conditional Types —— 类型级条件分支

### 目标

实现 TypeScript 条件类型 `T extends U ? X : Y` 和 `infer` 关键字的类型求值。

### 理论基础

**条件类型的语义**

条件类型是**类型层面的三元运算符**：

```
T extends U ? X : Y
```

求值规则：

1. 若 `T` 是 `U` 的子类型，结果为 `X`
2. 否则结果为 `Y`
3. 若 `T` 是未确定的泛型参数，则类型保持延迟求值（deferred）

**infer 关键字**

`infer` 在条件类型中引入**类型变量绑定**：

```
T extends Array<infer U> ? U : never
```

当 `T = Array<string>` 时，`U` 被绑定为 `string`，结果为 `string`。

这本质上是**模式匹配（Pattern Matching）**在类型层面的应用。

**映射类型（Mapped Types）**

```
{ [K in keyof T]: X }
```

语义：对 `T` 的每个属性键 `K`，创建新属性，类型为 `X`（可引用 `K`）。

本阶段实现映射类型的简化版，支持 `keyof` 展开和属性遍历。

---

## Milestone 5: Type Challenges —— 类型体操工坊

### 目标

12 道渐进式类型体操题目，覆盖 TypeScript 类型系统的核心技巧。

### 难度分级

| 级别 | 题目 | 核心技巧 |
|------|------|---------|
| 🟢 简单 | 1-3 | 泛型参数、索引访问、递归映射 |
| 🟡 中等 | 4-7 | 条件类型、infer、keyof、映射类型 |
| 🔴 困难 | 8-10 | 模板字面量、递归类型、函数类型变换 |
| ⚫ 地狱 | 11-12 | 分布式条件类型、类型级解析器 |

### 与前面里程碑的关系

Milestone 1-4 是**值层面**（运行时）实现类型系统；Milestone 5 是**类型层面**（编译时）使用类型系统。

这种对照设计让你理解：

- 在值层面，`genericSolver.ts` 如何求解泛型参数？
- 在类型层面，`Exclude<T, U>` 如何用条件类型实现相同逻辑？
- 真实 TypeScript 编译器将类型层面的表达式**编译**为值层面的类型检查算法

---

## 学习检查清单

完成本工作坊后，你应该能够：

- [ ] 手写一个递归下降解析器处理类型注解
- [ ] 解释结构子类型与名义子类型的区别
- [ ] 实现基础的类型替换（substitution）算法
- [ ] 说明 `infer` 在类型层面的模式匹配机制
- [ ] 独立完成 type-challenges 中 "medium" 级别的题目
- [ ] 阅读 TypeScript `checker.ts` 源码时不感到完全陌生

---

> "Types are the leaven of programming; they make it digestible." —— Robin Milner
