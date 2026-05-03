---
title: 类型系统
description: "TypeScript 类型系统核心概念导读，覆盖结构类型、泛型、条件类型与类型推断"
---

# 类型系统深入解析 (10.2)

> 深入理解 TypeScript 类型系统的理论基础与工程实践，从结构类型论到高级类型编程。

## 类型系统的核心设计哲学

TypeScript 的类型系统建立在**结构子类型（Structural Subtyping）**之上，而非传统的名义子类型（Nominal Subtyping）。
这意味着类型兼容性由结构的形状决定，而非显式的继承声明：

```typescript
interface Point &#123; x: number; y: number; &#125;
interface Vector &#123; x: number; y: number; &#125;

const p: Point = &#123; x: 1, y: 2 &#125;;
const v: Vector = p; // ✅ 结构兼容，无需显式关系
```

```mermaid
flowchart TB
    subgraph 名义类型
        A[Animal] --> B[Dog]
        A --> C[Cat]
        B -.x.-> C
    end
    subgraph 结构类型
        D[&#123; name: string &#125;] --> E[&#123; name: string; age: number &#125;]
        D --> F[&#123; name: string; breed: string &#125;]
        E -.✅.-> F
    end
```

## 类型层次结构

```mermaid
flowchart BT
    unknown --> any
    any --> string
    any --> number
    any --> boolean
    any --> object
    any --> symbol
    any --> bigint
    any --> void
    any --> null
    any --> undefined
    any --> never
    object --> Array
    object --> Function
    object --> Date
    object --> RegExp
    object --> &#123; &#125;
    never -.x.-> any
```

## 核心概念速查

### 泛型：参数化类型

```typescript
// 基础泛型
function identity&lt;T&gt;(arg: T): T &#123; return arg; &#125;

// 约束泛型
function longest&lt;T extends &#123; length: number &#125;&gt;(a: T, b: T): T &#123;
  return a.length &gt;= b.length ? a : b;
&#125;

// 映射类型
type Readonly&lt;T&gt; = &#123;
  readonly [P in keyof T]: T[P];
&#125;;

// 条件类型
type NonNullable&lt;T&gt; = T extends null | undefined ? never : T;
```

### 类型推断与类型收窄

```typescript
// 控制流分析收窄
function process(value: string | number) &#123;
  if (typeof value === 'string') &#123;
    value.toUpperCase(); // ✅ string 方法
  &#125; else &#123;
    value.toFixed(2);    // ✅ number 方法
  &#125;
&#125;

// 判别联合类型
type Shape =
  | &#123; kind: 'circle'; radius: number &#125;
  | &#123; kind: 'square'; side: number &#125;;

function area(s: Shape) &#123;
  switch (s.kind) &#123;
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
  &#125;
&#125;
```

### 逆变、协变与双变

```mermaid
flowchart LR
    subgraph 协变 Covariant
        A[Dog] --> B[Animal]
        C[Array&lt;Dog&gt;] --> D[Array&lt;Animal&gt;]
    end
    subgraph 逆变 Contravariant
        E[Animal] --> F[Dog]
        G[(x: Animal) => void] --> H[(x: Dog) => void]
    end
```

| 位置 | 默认行为 | 说明 |
|------|----------|------|
| 返回值 | 协变 | `() => Dog` 可赋值给 `() => Animal` |
| 参数 | 逆变 | `(x: Animal) => void` 可赋值给 `(x: Dog) => void` |
| 属性 | 协变 | 对象属性默认协变 |
| 数组元素 | 协变 | `Dog[]` 可赋值给 `Animal[]`（但不安全） |

## 核心文档

| 文档 | 主题 | 文件 |
|------|------|------|
| 结构类型 vs 名义类型 | 两种类型系统的对比 | [查看](../../10-fundamentals/10.2-type-system/structural-vs-nominal.md) |
| 渐进类型理论 | 从动态到静态类型的演进 | [查看](../../10-fundamentals/10.2-type-system/gradual-typing-theory.md) |
| Signals 范式 | 响应式类型系统 | [查看](../../10-fundamentals/10.2-type-system/signals-paradigm.md) |

## 代码示例

| 示例 | 主题 | 文件 |
|------|------|------|
| 01 | 类型系统基础 | [查看](../../10-fundamentals/10.2-type-system/code-examples/01-foundations.md) |
| 02 | 类型推断与注解 | [查看](../../10-fundamentals/10.2-type-system/code-examples/02-type-inference-annotations.md) |
| 03 | Interface vs Type Alias | [查看](../../10-fundamentals/10.2-type-system/code-examples/03-interfaces-vs-type-aliases.md) |
| 04 | 联合与交叉类型 | [查看](../../10-fundamentals/10.2-type-system/code-examples/04-unions-intersections.md) |
| 05 | 类型收窄 | [查看](../../10-fundamentals/10.2-type-system/code-examples/05-narrowing-guards.md) |
| 06 | 泛型深度 | [查看](../../10-fundamentals/10.2-type-system/code-examples/06-generics-deep-dive.md) |
| 08 | 条件类型 | [查看](../../10-fundamentals/10.2-type-system/code-examples/08-conditional-types.md) |
| 10 | 工具类型模式 | [查看](../../10-fundamentals/10.2-type-system/code-examples/10-utility-types-patterns.md) |
| 12 | 变型 | [查看](../../10-fundamentals/10.2-type-system/code-examples/12-variance.md) |
| 15 | TS 5.x / 6.x 新特性 | [查看](../../10-fundamentals/10.2-type-system/code-examples/15-ts5-ts6-new-type-features.md) |
| 16 | TS 7 Go 编译器预览 | [查看](../../10-fundamentals/10.2-type-system/code-examples/16-ts7-go-compiler-preview.md) |

## 交叉引用

- **[语言语义深入解析](./language-semantics)** — 类型系统的语言基础
- **[执行模型深入解析](./execution-model)** — 类型擦除后的运行时行为
- **[TypeScript 类型系统专题](/typescript-type-system/)** — 完整的类型系统专题（19篇深度文档）
- **[编程范式理论](/programming-paradigms/)** — 类型论与形式语义

---

 [← 返回首页](/)
