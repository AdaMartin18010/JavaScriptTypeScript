---
title: "极限与余极限：reduce/merge/spread 的普遍性质"
description: "从范畴论极限视角重新理解 JS/TS 中的聚合模式"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~3600 words
references:
  - Leinster, Basic Category Theory (2014)
  - Spivak, Category Theory for the Sciences (2014)
---

# 极限与余极限：reduce/merge/spread 的普遍性质

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 算法设计者、函数式编程爱好者
> **配套代码**: [code-examples/limit-colimit-examples.ts](code-examples/limit-colimit-examples.ts)

---

## 目录

- [极限与余极限：reduce/merge/spread 的普遍性质](#极限与余极限reducemergespread-的普遍性质)
  - [目录](#目录)
  - [1. 极限与余极限的定义](#1-极限与余极限的定义)
    - [1.1 锥与余锥](#11-锥与余锥)
    - [1.2 极限与余极限](#12-极限与余极限)
  - [2. Array.prototype.reduce 作为等化子](#2-arrayprototypereduce-作为等化子)
    - [2.1 等化子（Equalizer）](#21-等化子equalizer)
    - [2.2 reduce 的普遍性质](#22-reduce-的普遍性质)
  - [3. Object.assign 与余积](#3-objectassign-与余积)
    - [3.1 余积（Coproduct）](#31-余积coproduct)
    - [3.2 Object.assign 的范畴论语义](#32-objectassign-的范畴论语义)
  - [4. Promise.all 作为积的极限](#4-promiseall-作为积的极限)
    - [4.1 Promise.all 的极限直觉](#41-promiseall-的极限直觉)
  - [5. Promise.race 作为余极限](#5-promiserace-作为余极限)
    - [5.1 Promise.race 的余极限直觉](#51-promiserace-的余极限直觉)
  - [6. 拉回（Pullback）与类型交集](#6-拉回pullback与类型交集)
    - [6.1 拉回的定义](#61-拉回的定义)
    - [6.2 类型交集作为拉回](#62-类型交集作为拉回)
  - [7. 推出（Pushout）与类型联合](#7-推出pushout与类型联合)
    - [7.1 推出的定义](#71-推出的定义)
    - [7.2 判别式联合类型作为推出](#72-判别式联合类型作为推出)
  - [8. 其他极限实例](#8-其他极限实例)
  - [参考文献](#参考文献)

---

## 1. 极限与余极限的定义

### 1.1 锥与余锥

给定范畴 $\mathbf{C}$ 中的一个图表（Diagram）$D: \mathbf{J} \to \mathbf{C}$：

- **锥**（Cone）：对象 $C$ 加上到 $D(j)$ 的态射族 $\{c_j: C \to D(j)\}$，使得所有三角形交换
- **余锥**（Cocone）：对象 $C$ 加上从 $D(j)$ 的态射族 $\{c_j: D(j) \to C\}$，使得所有三角形交换

### 1.2 极限与余极限

- **极限**（Limit）：具有泛性质的锥——对于任何其他锥，存在唯一的态射到极限
- **余极限**（Colimit）：具有泛性质的余锥——对于任何其他余锥，存在唯一的态射从余极限

```
极限的泛性质：

      C
     /|\
    / | \
   /  |  \
  v   |   v
D(i) <-L-> D(j)

对于任何锥 C，存在唯一的 u: C -> L
```

---

## 2. Array.prototype.reduce 作为等化子

### 2.1 等化子（Equalizer）

等化子是极限的特例：给定两个并行态射 $f, g: A \to B$，等化子是 $eq: E \to A$ 使得 $f \circ eq = g \circ eq$。

### 2.2 reduce 的普遍性质

`Array.prototype.reduce` 将列表"折叠"为单一值，具有等化子的普遍性质：

```typescript
// reduce 将 [a1, a2, ..., an] "等同化"为单个值
const sum = (nums: number[]): number => nums.reduce((a, b) => a + b, 0);
```

**普遍性质**：对于任何满足结合律的二元运算 `op`，`reduce(op, init)` 是"最一般的"聚合方式。

---

## 3. Object.assign 与余积

### 3.1 余积（Coproduct）

余积 $A + B$ 带有注入态射 $i_1: A \to A + B$ 和 $i_2: B \to A + B$。

### 3.2 Object.assign 的范畴论语义

```typescript
const merge = <A extends object, B extends object>(a: A, b: B): A & B =>
  ({ ...a, ...b });
```

`merge` 类似于余积的合并操作，但不是严格的范畴论余积（因为属性可能冲突）。

---

## 4. Promise.all 作为积的极限

### 4.1 Promise.all 的极限直觉

`Promise.all([p1, p2, ..., pn])` 是**积的极限**（Limit over Discrete Diagram）：

```typescript
// 极限：一个 Promise<[T1, T2, ..., Tn]> 加上到每个 pi 的投影
const limitPromiseAll = <T, U>(p1: Promise<T>, p2: Promise<U>): Promise<[T, U]> =>
  Promise.all([p1, p2]);

// 投影 π1
const project1 = <T, U>(p: Promise<[T, U]>): Promise<T> => p.then(([t, _]) => t);

// 投影 π2
const project2 = <T, U>(p: Promise<[T, U]>): Promise<U> => p.then(([_, u]) => u);
```

**泛性质**：`Promise.all` 是"最一般的"同时等待所有 Promise 完成的方式。

---

## 5. Promise.race 作为余极限

### 5.1 Promise.race 的余极限直觉

`Promise.race([p1, p2, ..., pn])` 是**余极限**（Colimit）：

```typescript
const colimitPromiseRace = <T, U>(p1: Promise<T>, p2: Promise<U>): Promise<T | U> =>
  Promise.race([p1, p2]);
```

**泛性质**：`Promise.race` 是"最一般的"从某个最先完成的 Promise 接收结果的方式。

---

## 6. 拉回（Pullback）与类型交集

### 6.1 拉回的定义

给定 $f: A \to C$ 和 $g: B \to C$，拉回 $P$ 是满足 $f \circ p_1 = g \circ p_2$ 的"最一般的"对象。

### 6.2 类型交集作为拉回

```typescript
interface HasName { name: string; }
interface HasAge { age: number; }

// Person = HasName & HasAge = 拉回
type Person = HasName & HasAge;
```

---

## 7. 推出（Pushout）与类型联合

### 7.1 推出的定义

给定 $f: C \to A$ 和 $g: C \to B$，推出 $P$ 是"最一般的"对象接收 $A$ 和 $B$。

### 7.2 判别式联合类型作为推出

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };
```

---

## 8. 其他极限实例

| 极限类型 | JS/TS 实例 | 范畴论语义 |
|---------|-----------|-----------|
| 等化子 | `Array.prototype.reduce` | 聚合的普遍性质 |
| 余等化子 | `Array.prototype.filter` | 划分的普遍性质 |
| 积 | `Promise.all`, 对象展开 | 同时满足多个条件 |
| 余积 | `Promise.race`, 联合类型 | 任一条件满足 |
| 拉回 | 类型交集 `A & B` | 共同约束 |
| 推出 | 联合类型 `A \| B` | 共同扩展 |
| 终端对象 | `void` | 唯一输出 |
| 初始对象 | `never` | 不可能输入 |

---

## 参考文献

1. Leinster, T. (2014). *Basic Category Theory*. Cambridge University Press.
2. Spivak, D. I. (2014). *Category Theory for the Sciences*. MIT Press.
3. Riehl, E. (2016). *Category Theory in Context*. Dover. (Ch. 3)
