---
title: "伴随函子：类型推断与编译器的自由-遗忘伴随"
description: "从伴随函子视角理解类型推断、自动补全和 React Hooks 的语义"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~3600 words
references:
  - Pierce, Types and Programming Languages (2002)
  - Awodey, Category Theory (2010)
---

# 伴随函子：类型推断与编译器的自由-遗忘伴随

> **理论深度**: 研究生级别
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 编译器开发者、类型系统研究者
> **配套代码**: [code-examples/adjunction-examples.ts](code-examples/adjunction-examples.ts)

---

## 目录

- [伴随函子：类型推断与编译器的自由-遗忘伴随](#伴随函子类型推断与编译器的自由-遗忘伴随)
  - [目录](#目录)
  - [1. 伴随的定义](#1-伴随的定义)
    - [1.1 伴随函子对](#11-伴随函子对)
    - [1.2 编程直觉](#12-编程直觉)
  - [2. 单位与余单位](#2-单位与余单位)
    - [2.1 单位（Unit）](#21-单位unit)
    - [2.2 余单位（Counit）](#22-余单位counit)
  - [3. 类型推断作为自由-遗忘伴随](#3-类型推断作为自由-遗忘伴随)
    - [3.1 遗忘函子](#31-遗忘函子)
    - [3.2 自由函子](#32-自由函子)
    - [3.3 伴随关系](#33-伴随关系)
  - [4. IDE 自动补全的伴随语义](#4-ide-自动补全的伴随语义)
    - [4.1 部分程序到完整程序](#41-部分程序到完整程序)
  - [5. React Hooks 的伴随升降](#5-react-hooks-的伴随升降)
    - [5.1 useState 作为自由构造](#51-usestate-作为自由构造)
  - [6. 伴随与极限的关系](#6-伴随与极限的关系)
    - [6.1 左伴随保持余极限](#61-左伴随保持余极限)
    - [6.2 右伴随保持极限](#62-右伴随保持极限)
  - [参考文献](#参考文献)

---

## 1. 伴随的定义

### 1.1 伴随函子对

两个函子 $F: \mathbf{C} \to \mathbf{D}$ 和 $G: \mathbf{D} \to \mathbf{C}$ 构成**伴随**（Adjunction），记作 $F \dashv G$，如果：

$$
Hom_\mathbf{D}(F(A), B) \cong Hom_\mathbf{C}(A, G(B))
$$

这个同构是**自然的**，意味着它不依赖于具体对象的选择。

### 1.2 编程直觉

伴随的核心直觉：**F 是"最自由的"构造，G 是"最保守的"提取**。

```typescript
// F: 从无类型程序构造类型化程序（类型推断）
// G: 从类型化程序提取无类型程序（类型擦除）

// F ⊣ G 意味着：
// "类型推断是最一般的类型化构造"
// "类型擦除是最保守的信息提取"
```

---

## 2. 单位与余单位

### 2.1 单位（Unit）

单位 $\eta: id_\mathbf{C} \Rightarrow G \circ F$：

```typescript
// η: UntypedProgram -> TypedProgram(UntypedProgram)
// 即：为无类型程序推断类型

const unit = (untyped: string): TypedProgram =>
  inferTypes(untyped); // 类型推断 = "最一般的"类型化
```

### 2.2 余单位（Counit）

余单位 $\varepsilon: F \circ G \Rightarrow id_\mathbf{D}$：

```typescript
// ε: TypedProgram -> UntypedProgram(TypedProgram)
// 即：类型化程序擦除类型后再推断（可能丢失信息）

const counit = (typed: TypedProgram): TypedProgram =>
  inferTypes(eraseTypes(typed));
```

---

## 3. 类型推断作为自由-遗忘伴随

### 3.1 遗忘函子

$U: \mathbf{Typed} \to \mathbf{Untyped}$ 遗忘类型信息：

```typescript
const forgetful = (typed: TypedProgram): UntypedProgram => typed.code;
```

### 3.2 自由函子

$F: \mathbf{Untyped} \to \mathbf{Typed}$ 推断最一般的类型：

```typescript
const free = (untyped: UntypedProgram): TypedProgram =>
  inferMostGeneralTypes(untyped);
```

### 3.3 伴随关系

$F \dashv U$ 意味着：对于任何无类型程序 $p$ 和类型化程序 $q$：

$$
\text{类型推断}(p) \leq q \iff p \leq \text{类型擦除}(q)
$$

即：$p$ 的类型推断结果比 $q$ 更一般，当且仅当 $p$ 是 $q$ 擦除类型后的子集。

---

## 4. IDE 自动补全的伴随语义

### 4.1 部分程序到完整程序

自动补全可以看作是从**部分程序**到**完整程序**的自由构造：

```typescript
// F: PartialProgram -> CompleteProgram（自动补全）
// G: CompleteProgram -> PartialProgram（截取部分）

const autocomplete = (partial: string): string[] =>
  suggestCompletions(partial); // "最自由"的补全建议
```

---

## 5. React Hooks 的伴随升降

### 5.1 useState 作为自由构造

`useState` 将普通值提升为响应式状态：

```typescript
// F: Value -> State（自由构造）
// G: State -> Value（提取当前值）

const liftToState = <T>(initial: T): State<T> => ({
  value: initial,
  setValue: (v: T) => { /* 更新 */ }
});

const extractValue = <T>(state: State<T>): T => state.value;
```

---

## 6. 伴随与极限的关系

### 6.1 左伴随保持余极限

**定理**：如果 $F \dashv G$，则 $F$ 保持余极限（即 $F(colim D) = colim(F \circ D)$）。

**推论**：类型推断（自由函子）保持余极限——如果无类型程序的组合是余极限，则其类型推断也是余极限。

### 6.2 右伴随保持极限

**定理**：如果 $F \dashv G$，则 $G$ 保持极限。

**推论**：类型擦除（遗忘函子）保持极限——类型化程序的极限擦除后仍然是无类型程序的极限。

---

## 参考文献

1. Pierce, B. C. (2002). *Types and Programming Languages*. MIT Press. (Ch. 30)
2. Awodey, S. (2010). *Category Theory* (2nd ed.). Oxford University Press. (Ch. 9)
3. Riehl, E. (2016). *Category Theory in Context*. Dover. (Ch. 4)
