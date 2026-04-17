# JavaScript 与 TypeScript 语义模型对比理论

> 本文档为 `10-js-ts-comparison` 模块提供理论基础，建立 JS/TS 的**三层语义模型**（动态语义、静态语义、擦除语义），分析渐进类型边界的行为，并映射编译阶段的形式化语义。

---

## 目录

- [JavaScript 与 TypeScript 语义模型对比理论](#javascript-与-typescript-语义模型对比理论)
  - [目录](#目录)
  - [1. 三层语义模型](#1-三层语义模型)
  - [2. 动态语义层 (Dynamic Semantics)](#2-动态语义层-dynamic-semantics)
    - [2.1 JS 的动态类型系统](#21-js-的动态类型系统)
    - [2.2 类型强制转换 (Coercion) 语义](#22-类型强制转换-coercion-语义)
  - [3. 静态语义层 (Static Semantics)](#3-静态语义层-static-semantics)
    - [3.1 TypeScript 的静态类型作为谓词](#31-typescript-的静态类型作为谓词)
    - [3.2 结构子类型的形式化](#32-结构子类型的形式化)
    - [3.3 any 的语义：渐进类型的核心](#33-any-的语义渐进类型的核心)
  - [4. 擦除语义层 (Erasure Semantics)](#4-擦除语义层-erasure-semantics)
    - [4.1 类型擦除 (Type Erasure)](#41-类型擦除-type-erasure)
    - [4.2 擦除语义的工程影响](#42-擦除语义的工程影响)
  - [5. 渐进类型边界 (Gradual Typing Boundary)](#5-渐进类型边界-gradual-typing-boundary)
    - [5.1 渐进类型精化格](#51-渐进类型精化格)
    - [5.2 动态边界处的类型不一致](#52-动态边界处的类型不一致)
    - [5.3 安全边界策略](#53-安全边界策略)
  - [6. 编译阶段映射](#6-编译阶段映射)
    - [6.1 TypeScript 编译器管道](#61-typescript-编译器管道)
    - [6.2 各阶段的形式化对应](#62-各阶段的形式化对应)
  - [7. 与代码实现的映射](#7-与代码实现的映射)
    - [7.1 代码实验室结构](#71-代码实验室结构)
    - [7.2 关键代码映射](#72-关键代码映射)
    - [7.3 交叉引用](#73-交叉引用)

---

## 1. 三层语义模型

JavaScript 与 TypeScript 的关系，不能简单地用"带类型的 JS"来概括。
从形式化语义角度看，TypeScript 引入了三个相互关联但性质不同的语义层：

```
┌─────────────────────────────────────────────────────────────┐
│                    源代码 (Source)                           │
│         TypeScript (.ts) 或 JavaScript (.js)                │
├─────────────────────────────────────────────────────────────┤
│  静态语义层 (Static)                                          │
│  ├── 类型检查器 (Type Checker)                                │
│  ├── 结构化子类型判断                                         │
│  └── 约束推断与错误报告                                       │
├─────────────────────────────────────────────────────────────┤
│  擦除语义层 (Erasure)                                         │
│  ├── 类型注解删除                                             │
│  ├── 装饰器/枚举降级                                          │
│  └── 模块语法转换 (ESM → CJS)                                 │
├─────────────────────────────────────────────────────────────┤
│  动态语义层 (Dynamic)                                         │
│  ├── V8/SpiderMonkey 解释执行                                 │
│  ├── 运行时类型标签 (hidden class/map)                        │
│  └── JIT 编译与优化                                           │
└─────────────────────────────────────────────────────────────┘
```

**关键洞察**：

- **JavaScript** 只有动态语义层和（极弱的）静态语法检查。
- **TypeScript** 在 JS 之上增加了静态语义层和擦除语义层，但**不改变**动态语义。

---

## 2. 动态语义层 (Dynamic Semantics)

### 2.1 JS 的动态类型系统

JavaScript 的运行时值带有**内部类型标签**（Spec 中的 Type）：

| 内部类型 |  typeof 结果 | 说明 |
|----------|-------------|------|
| Undefined | `"undefined"` | 未初始化值 |
| Null | `"object"` (历史 bug) | 空引用 |
| Boolean | `"boolean"` | 布尔值 |
| String | `"string"` | 字符串 |
| Symbol | `"symbol"` | 唯一符号 |
| Number | `"number"` | IEEE 754 双精度浮点 |
| BigInt | `"bigint"` | 任意精度整数 |
| Object | `"object"/"function"` | 引用类型（含函数） |

### 2.2 类型强制转换 (Coercion) 语义

JS 的动态语义中最复杂的是**抽象操作 (Abstract Operations)**，如 `ToPrimitive`、`ToNumber`、`ToString`。这些操作定义了 `+`、`==` 等运算符在遇到不同类型时的行为。

**示例**：`[] + {}`

```
1. [] 经 ToPrimitive 得 ""（空字符串）
2. {} 经 ToPrimitive 得 "[object Object]"
3. 字符串拼接得 "[object Object]"
```

TypeScript 的静态类型系统**无法阻止**这些动态强制转换导致的意外行为，因为 TS 不检查运算符的运行时语义。

---

## 3. 静态语义层 (Static Semantics)

### 3.1 TypeScript 的静态类型作为谓词

TypeScript 的类型可以被视为**值的集合**（Set-theoretic Types）：

```
type string  ≈  { v | typeof v === "string" }
type number  ≈  { v | typeof v === "number" }
type A | B   ≈  A ∪ B
type A & B   ≈  A ∩ B
type never   ≈  ∅
type unknown ≈  Universal Set
```

### 3.2 结构子类型的形式化

TypeScript 的接口兼容不依赖名称，而依赖结构：

```
Γ ⊢ τ₁ <: τ₂  ⟺  ∀m ∈ Members(τ₂), ∃m' ∈ Members(τ₁):
                    m'.name = m.name  ∧  Γ ⊢ m'.type <: m.type
```

**逆变与协变**：

- 对象属性默认**协变**（子类型可以拥有更具体的属性类型）
- 函数参数默认**双变**（Bivariant），可通过 `strictFunctionTypes` 改为**逆变**
- 泛型参数默认**不变**，可用 `in`/`out` 修饰符显式声明变型

### 3.3 any 的语义：渐进类型的核心

`any` 是 TypeScript 渐进类型的关键：

```
∀τ, any <: τ  ∧  τ <: any
```

这意味着 `any` 既是最顶类型又是最底类型，破坏了类型格的正常结构，也导致了**类型安全性漏洞**。

---

## 4. 擦除语义层 (Erasure Semantics)

### 4.1 类型擦除 (Type Erasure)

TypeScript 的编译过程本质上是**类型擦除**：所有类型注解、接口声明、泛型参数在编译后完全消失。

```typescript
// Source
function identity<T>(x: T): T { return x; }
identity<number>(42);

// Compiled (JS)
function identity(x) { return x; }
identity(42);
```

### 4.2 擦除语义的工程影响

由于类型在运行时完全不存在，以下模式在 TS 中是不可能的：

- **运行时类型反射**：`typeof x` 返回的是 JS 的内部类型标签，而非 TS 类型
- **基于类型的重载**：TS 允许函数重载声明，但实现中必须手动分发
- **泛型特化**：无法像 C++ 模板那样在运行时生成不同的机器码

**补偿机制**：

- **类型谓词 (Type Predicates)**：`x is Type` 的自定义类型守卫
- **装饰器元数据 (Decorator Metadata)**：通过 `reflect-metadata` 在运行时保留部分类型信息
- **Zod/Yup 等验证库**：在运行时重建类型检查

---

## 5. 渐进类型边界 (Gradual Typing Boundary)

### 5.1 渐进类型精化格

TypeScript 的类型可以按"信息量"组织为一个**精度格 (Precision Lattice)**：

```
        unknown / any
       /    |    \
    string number  object
       \    |    /
        ...
          |
        never
```

- `any` 是"最不精确"的类型（无信息，无保证）
- `never` 是"最精确"的类型（空集，不可能的值）
- `unknown` 是安全的顶类型（可以接收任何值，但不能直接使用）

### 5.2 动态边界处的类型不一致

当 Typed 代码与 Untyped 代码交互时，可能发生**类型不一致**：

```typescript
// Untyped JS 模块
export function getData() {
  return Math.random() > 0.5 ? "ok" : 42;
}

// Typed TS 模块
import { getData } from './untyped.js';
const data: string = getData();  // 静态通过，运行时可能崩溃
```

TypeScript 对此的默认策略是**信任外部声明**（`.d.ts`），这导致了大量的"谎言"型声明问题。

### 5.3 安全边界策略

| 策略 | 实现方式 | 效果 |
|------|---------|------|
| 严格模式 | `strict: true` | 减少隐式 any，提高静态精度 |
| 类型守卫 | `typeof` / `instanceof` / `zod.parse` | 在边界处做运行时校验 |
| 模块隔离 | `isolatedModules: true` | 防止跨文件类型依赖的擦除问题 |
| 无 unchecked 索引 | `noUncheckedIndexedAccess: true` | 数组/对象索引返回 `T \| undefined` |

---

## 6. 编译阶段映射

### 6.1 TypeScript 编译器管道

```
Source (.ts)
    │
    ▼
Lexical Analysis ──▶ Tokens
    │
    ▼
Parsing ──▶ AST
    │
    ▼
Binder ──▶ Symbol Table
    │
    ▼
Type Checker ──▶ Type Diagnostics
    │
    ▼
Transformer ──▶ Erased AST
    │
    ▼
Printer ──▶ Output (.js) + Declaration (.d.ts)
```

### 6.2 各阶段的形式化对应

| 编译阶段 | 形式化对象 | 说明 |
|----------|-----------|------|
| Lexer | 正则语言 / DFA | 词法分析是正则语言的识别 |
| Parser | 上下文无关文法 (CFG) | TypeScript 语法是 CFG 的超集 |
| Binder | 作用域图 (Scope Graph) | 标识符解析的形式化模型 |
| Type Checker | 约束求解系统 | 类似 HM + 子类型约束 |
| Transformer | AST 到 AST 的函数 | 结构保持的语法转换 |

---

## 7. 与代码实现的映射

### 7.1 代码实验室结构

`10-js-ts-comparison/` 目录下的实现按以下主题组织：

| 代码文件 | 对应理论 | 说明 |
|----------|---------|------|
| `gradual-boundary-demo.ts` | 渐进类型边界 §5 | 演示 typed/untyped 边界的行为差异 |
| `compiler-phase-demo.ts` | 编译阶段 §6 | 使用真实 TS API 演示 Scanner→Parser→AST→TypeChecker→Emitter |
| `type-erasure-demo.ts` | 擦除语义 §4 | 使用真实 TS Transformer 展示类型在运行时消失的证据 |
| `compiler-api/` | 编译器工程实践 | 使用 `ts.createProgram` 进行类型提取、AST 变换、.d.ts 生成 |
| `coercion-traps-demo.ts` | 动态语义 §2.2 | JS 强制转换的陷阱合集 |

### 7.2 关键代码映射

**擦除语义演示**：

```typescript
// 编译前：泛型、接口、类型别名全部存在
interface Box<T> { value: T; }
const box: Box<number> = { value: 42 };

// 编译后：一切类型信息消失
const box = { value: 42 };
```

**渐进边界演示**：

```typescript
function unsafeCast<T>(x: unknown): T {
  return x as T;  // 绕过静态检查，将运行时风险推迟到使用点
}
```

### 7.3 交叉引用

- `40-type-theory-formal/THEORY.md` — 类型系统的数学基础
- `01-ecmascript-evolution/` — ECMAScript 语法演进与动态语义变化
- `JSTS全景综述/01_language_core.md §8-10` — TS 核心特性与形式化规则

---

> **参考**
>
> - Siek, J., Taha, W. "Gradual Typing for Functional Languages" (2006)
> - Rastogi, A. et al. "Safe & Efficient Gradual Typing for TypeScript" (Flow, 2015)
> - TypeScript Compiler Internals (microsoft/TypeScript wiki)
