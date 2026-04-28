---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 函数式编程理论 (Functional Programming Theory)

> 本文档深入探讨 JavaScript/TypeScript 中的函数式编程理论，涵盖从数学基础到实际应用的全方位内容。

---

## 目录

- [函数式编程理论 (Functional Programming Theory)](#函数式编程理论-functional-programming-theory)
  - [目录](#目录)
  - [1. 函数式编程的数学基础（Lambda演算）](#1-函数式编程的数学基础lambda演算)
    - [1.1 理论解释](#11-理论解释)
    - [1.2 数学定义](#12-数学定义)
    - [1.3 Church 编码](#13-church-编码)
    - [1.4 TypeScript 实现](#14-typescript-实现)
    - [1.5 实际应用](#15-实际应用)
  - [2. 纯函数和引用透明性](#2-纯函数和引用透明性)
    - [2.1 理论解释](#21-理论解释)
    - [2.2 数学定义](#22-数学定义)
    - [2.3 范畴论语境](#23-范畴论语境)
    - [2.4 TypeScript 实现](#24-typescript-实现)
    - [2.5 实际应用](#25-实际应用)
  - [3. 不可变数据结构的理论和实现](#3-不可变数据结构的理论和实现)
    - [3.1 理论解释](#31-理论解释)
    - [3.2 数学定义](#32-数学定义)
    - [3.3 持久化数据结构理论](#33-持久化数据结构理论)
    - [3.4 TypeScript 实现](#34-typescript-实现)
    - [3.5 实际应用](#35-实际应用)
  - [4. 高阶函数和函数组合](#4-高阶函数和函数组合)
    - [4.1 理论解释](#41-理论解释)
    - [4.2 数学定义](#42-数学定义)
    - [4.3 范畴论语境](#43-范畴论语境)
    - [4.4 TypeScript 实现](#44-typescript-实现)
    - [4.5 实际应用](#45-实际应用)
  - [5. 函子（Functor）、应用函子（Applicative）、单子（Monad）](#5-函子functor应用函子applicative单子monad)
    - [5.1 理论解释](#51-理论解释)
    - [5.2 数学定义](#52-数学定义)
    - [5.3 TypeScript 实现](#53-typescript-实现)
    - [5.4 实际应用](#54-实际应用)
  - [6. 惰性求值和流](#6-惰性求值和流)
    - [6.1 理论解释](#61-理论解释)
    - [6.2 TypeScript 实现](#62-typescript-实现)
  - [7. 尾递归优化](#7-尾递归优化)
    - [7.1 理论解释](#71-理论解释)
    - [7.2 数学定义](#72-数学定义)
    - [7.3 TypeScript 实现](#73-typescript-实现)
    - [7.4 实际应用](#74-实际应用)
  - [8. 函数式错误处理（Maybe、Either）](#8-函数式错误处理maybeeither)
    - [8.1 理论解释](#81-理论解释)
    - [8.2 TypeScript 实现](#82-typescript-实现)
    - [8.3 实际应用](#83-实际应用)
  - [9. 响应式编程（FRP）理论](#9-响应式编程frp理论)
    - [9.1 理论解释](#91-理论解释)
    - [9.2 TypeScript 实现](#92-typescript-实现)
    - [9.3 实际应用](#93-实际应用)
  - [10. fp-ts、Ramda、Lodash/fp 的对比](#10-fp-tsramdalodashfp-的对比)
    - [10.1 库概述](#101-库概述)
    - [10.2 fp-ts 示例](#102-fp-ts-示例)
    - [10.3 Ramda 示例](#103-ramda-示例)
    - [10.4 Lodash/fp 示例](#104-lodashfp-示例)
    - [10.5 对比总结](#105-对比总结)
  - [总结](#总结)
  - [参考资源](#参考资源)

---

## 1. 函数式编程的数学基础（Lambda演算）

### 1.1 理论解释

Lambda演算（Lambda Calculus）是由数学家 Alonzo Church 于 1930 年代提出的一种形式化系统，它是函数式编程的理论基础。
Lambda演算极其精简，仅包含三个基本元素，却能表达所有可计算函数。

### 1.2 数学定义

Lambda演算的核心语法（BNF表示）：

```
<expression> ::= <variable>
               | <function>
               | <application>

<function>   ::= λ<variable>.<expression>

<application> ::= <expression> <expression>
```

**转换规则（Reduction Rules）：**

1. **α-转换（Alpha Conversion）** - 变量重命名：

   ```
   λx.M ≡ λy.M[y/x]   (y 不在 M 的自由变量中)
   ```

2. **β-规约（Beta Reduction）** - 函数应用：

   ```
   (λx.M) N → M[N/x]
   ```

3. **η-转换（Eta Conversion）** - 外延等价：

   ```
   λx.(M x) ≡ M   (x 不在 M 的自由变量中)
   ```

### 1.3 Church 编码

**Church 布尔值：**

```
TRUE  = λt.λf.t
FALSE = λt.λf.f
IF    = λb.λt.λf.b t f
NOT   = λb.b FALSE TRUE
AND   = λb1.λb2.b1 b2 FALSE
OR    = λb1.λb2.b1 TRUE b2
```

**Church 数（自然数编码）：**

```
0 = λf.λx.x
1 = λf.λx.f x
2 = λf.λx.f (f x)
n = λf.λx.fⁿ x

SUCC = λn.λf.λx.f (n f x)
ADD  = λm.λn.λf.λx.m f (n f x)
MULT = λm.λn.λf.m (n f)
```

### 1.4 TypeScript 实现

```typescript
// ============================================
// Lambda演算在 TypeScript 中的实现
// ============================================

// 1. Church 布尔值
type Bool<T> = (t: T) => (f: T) => T;

const TRUE = <T>(t: T) => (f: T): T => t;
const FALSE = <T>(t: T) => (f: T): T => f;

// IF 组合子
const IF = <T>(b: Bool<T>) => (t: T) => (f: T): T => b(t)(f);

// 布尔运算
const NOT = <T>(b: Bool<T>): Bool<T> =>
  (t: T) => (f: T) => b(f)(t);

const AND = <T>(b1: Bool<T>) => (b2: Bool<T>): Bool<T> =>
  (t: T) => (f: T) => b1(b2(t)(f))(f);

const OR = <T>(b1: Bool<T>) => (b2: Bool<T>): Bool<T> =>
  (t: T) => (f: T) => b1(t)(b2(t)(f));

// 使用示例
const result1 = IF(TRUE)("yes")("no");  // "yes"
const result2 = IF(FALSE)("yes")("no"); // "no"

// 2. Church 数
type ChurchNum = <T>(f: (x: T) => T) => (x: T) => T;

const ZERO: ChurchNum = f => x => x;
const ONE: ChurchNum = f => x => f(x);
const TWO: ChurchNum = f => x => f(f(x));
const THREE: ChurchNum = f => x => f(f(f(x)));

// 后继函数
const SUCC = (n: ChurchNum): ChurchNum =>
  f => x => f(n(f)(x));

// 加法
const ADD = (m: ChurchNum) => (n: ChurchNum): ChurchNum =>
  f => x => m(f)(n(f)(x));

// 乘法
const MULT = (m: ChurchNum) => (n: ChurchNum): ChurchNum =>
  f => m(n(f));

// 指数
const POW = (m: ChurchNum) => (n: ChurchNum): ChurchNum =>
  n(m);

// Church 数转 JavaScript 数字
const churchToNum = (n: ChurchNum): number =>
  n(x => x + 1)(0);

// JavaScript 数字转 Church 数
const numToChurch = (n: number): ChurchNum =>
  n === 0 ? ZERO : SUCC(numToChurch(n - 1));

// 使用示例
const four = ADD(TWO)(TWO);
const six = MULT(TWO)(THREE);
const eight = POW(TWO)(THREE);

console.log(churchToNum(four));  // 4
console.log(churchToNum(six));   // 6
console.log(churchToNum(eight)); // 8

// 3. Y组合子（不动点组合子）
// 用于实现递归
type RecFunc<T> = (f: RecFunc<T>) => T;

// 严格求值版本的 Y 组合子（Z 组合子）
const Z = <T>(f: (g: (x: T) => T) => (x: T) => T): (x: T) => T =>
  ((x: RecFunc<(x: T) => T>) => f((y: T) => x(x)(y)))
  ((x: RecFunc<(x: T) => T>) => f((y: T) => x(x)(y)));

// 使用 Z 组合子实现阶乘
const factorial = Z<number>(fact => n =>
  n === 0 ? 1 : n * fact(n - 1)
);

console.log(factorial(5)); // 120

// 4. SKI 组合子演算
// S: λx.λy.λz.x z (y z)
// K: λx.λy.x
// I: λx.x

const S = <A, B, C>(x: (z: C) => A) =>
  (y: (z: C) => B) =>
  (z: C): A => x(z)(y(z));

const K = <A, B>(x: A) => (y: B): A => x;
const I = <A>(x: A): A => x;

// 用 SKI 实现 I: I = S K K
const I_from_SKI = <A>(x: A): A => S(K)(K)(x);
```

### 1.5 实际应用

```typescript
// ============================================
// Lambda演算在实际编程中的应用
// ============================================

// 1. 高阶函数的数学基础
// map 本质上是函子范畴中的 fmap
const map = <A, B>(f: (a: A) => B) =>
  (arr: A[]): B[] => arr.map(f);

// 2. 组合子的实际应用 - 函数管道
const pipe = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduce((v, f) => f(v), x);

const compose = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduceRight((v, f) => f(v), x);

// 3. 柯里化（Currying）
// 源自 Haskell Curry 的数学工作
const curry = <A, B, C>(f: (a: A, b: B) => C) =>
  (a: A) => (b: B): C => f(a, b);

const uncurry = <A, B, C>(f: (a: A) => (b: B) => C) =>
  (a: A, b: B): C => f(a)(b);

// 4. 实际应用：验证组合子逻辑
const validateUser = (user: { age: number; name: string }) =>
  pipe(
    (u: typeof user) => ({ ...u, isAdult: u.age >= 18 }),
    (u) => ({ ...u, hasName: u.name.length > 0 }),
    (u) => ({ ...u, isValid: u.isAdult && u.hasName })
  )(user);

const user = validateUser({ age: 25, name: "Alice" });
// { age: 25, name: "Alice", isAdult: true, hasName: true, isValid: true }
```

---

## 2. 纯函数和引用透明性

### 2.1 理论解释

**纯函数（Pure Function）** 是指在相同的输入下总是返回相同的输出，且不会产生副作用的函数。纯函数是函数式编程的核心概念，它使得代码更易于推理、测试和并行化。

**引用透明性（Referential Transparency）** 是指表达式可以被其值替换而不影响程序的行为。具有引用透明性的代码更容易理解和优化。

### 2.2 数学定义

**纯函数的形式化定义：**

对于函数 `f: A → B`，若满足以下条件，则称 f 为纯函数：

1. **确定性（Determinism）**：

   ```
   ∀x ∈ A, f(x) 是单值的
   ```

2. **无副作用（No Side Effects）**：

   ```
   f 不改变任何外部状态，也不依赖外部可变状态
   ```

**引用透明性的形式化定义：**

对于表达式 `e` 和程序上下文 `C`，若满足：

```
C[e] ≡ C[v]  其中 e ↓ v（e 求值为 v）
```

则称 `e` 具有引用透明性。

### 2.3 范畴论语境

在范畴论中，纯函数对应于**态射（Morphism）**：

- 类型作为对象（Objects）
- 纯函数作为态射（Morphisms）
- 函数组合作为态射的组合

**范畴公理：**

1. **结合律**：`h ∘ (g ∘ f) = (h ∘ g) ∘ f`
2. **单位元**：`id ∘ f = f ∘ id = f`

### 2.4 TypeScript 实现

```typescript
// ============================================
// 纯函数和引用透明性的 TypeScript 实现
// ============================================

// 2.4.1 纯函数示例

// 纯函数：相同输入总是产生相同输出，无副作用
const pureAdd = (a: number, b: number): number => a + b;
const pureMultiply = (a: number, b: number): number => a * b;

// 纯函数：字符串操作
const pureUpperCase = (s: string): string => s.toUpperCase();
const pureReverse = (s: string): string => s.split('').reverse().join('');

// 纯函数：数组操作
const pureSort = <T>(arr: T[], compare: (a: T, b: T) => number): T[] =>
  [...arr].sort(compare); // 创建新数组，不修改原数组

const pureFilter = <T>(predicate: (x: T) => boolean) =>
  (arr: T[]): T[] => arr.filter(predicate);

// 2.4.2 非纯函数示例（需要避免）

// 非纯：依赖外部状态
let counter = 0;
const impureIncrement = (): number => ++counter; // 修改外部状态

// 非纯：依赖可变全局状态
let taxRate = 0.1;
const impureCalculateTax = (price: number): number => price * taxRate;

// 非纯：I/O 操作
const impureLog = (msg: string): void => console.log(msg); // 副作用

// 非纯：随机数
const impureRandom = (): number => Math.random(); // 非确定性

// 非纯：时间依赖
const impureGetTimestamp = (): number => Date.now(); // 依赖外部状态

// 2.4.3 将非纯函数转化为纯函数

// 方法1：显式传递依赖
interface TaxConfig { rate: number; }
const pureCalculateTax = (config: TaxConfig) => (price: number): number =>
  price * config.rate;

// 方法2：使用 Reader Monad 模式（函数组合）
type Reader<R, A> = (r: R) => A;

const ask = <R>(): Reader<R, R> => r => r;

const pureCalculateTaxReader: Reader<TaxConfig, (price: number) => number> =
  config => price => price * config.rate;

// 方法3：将随机性参数化
interface RNG { next(): [number, RNG]; }

const pureRandom = (rng: RNG): [number, RNG] => rng.next();

// 线性同余生成器（纯函数式随机数）
const makeLCG = (seed: number): RNG => ({
  next(): [number, RNG] {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    const newSeed = (a * seed + c) % m;
    return [newSeed / m, makeLCG(newSeed)];
  }
});

// 使用纯函数式随机数
const rng1 = makeLCG(12345);
const [r1, rng2] = pureRandom(rng1);
const [r2, rng3] = pureRandom(rng2);
console.log(r1, r2); // 可重现的随机数序列

// 2.4.4 引用透明性验证

// 引用透明的表达式可以被值替换
const x = 2 + 3;
// 等价于
const y = 5;

// 纯函数保证引用透明
const add5 = (n: number): number => n + 5;
const result1 = add5(10);
const result2 = 15; // 可以直接替换为结果
console.log(result1 === result2); // true

// 2.4.5 副作用隔离（Effect System 模式）

// 定义效果类型
type IO<A> = () => A;

// 延迟执行的 IO
const pureLog = (msg: string): IO<void> => () => console.log(msg);

// 组合 IO 操作
const ioMap = <A, B>(fa: IO<A>, f: (a: A) => B): IO<B> =>
  () => f(fa());

const ioFlatMap = <A, B>(fa: IO<A>, f: (a: A) => IO<B>): IO<B> =>
  () => f(fa())();

// 使用示例
const program: IO<void> = ioFlatMap(
  pureLog("Step 1"),
  () => pureLog("Step 2")
);

// 延迟执行副作用，直到明确调用
// program(); // 实际执行副作用
```

### 2.5 实际应用

```typescript
// ============================================
// 纯函数在实际开发中的应用
// ============================================

// 2.5.1 状态管理（Redux 风格的纯函数 reducer）

interface State {
  count: number;
  users: User[];
}

interface User {
  id: string;
  name: string;
}

type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'DECREMENT'; payload: number }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string };

// 纯函数 reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + action.payload };
    case 'DECREMENT':
      return { ...state, count: state.count - action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      };
    default:
      return state;
  }
};

// 2.5.2 记忆化（Memoization）

// 纯函数可以被安全地记忆化
const memoize = <A, B>(f: (a: A) => B): ((a: A) => B) => {
  const cache = new Map<A, B>();
  return (a: A): B => {
    if (cache.has(a)) return cache.get(a)!;
    const result = f(a);
    cache.set(a, result);
    return result;
  };
};

// 斐波那契数列（带记忆化）
const fib = memoize((n: number): number => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fib(50)); // 快速计算大数

// 2.5.3 并行计算

// 纯函数可以安全地并行执行
const parallelMap = async <T, R>(
  arr: T[],
  f: (x: T) => R,
  concurrency: number = 4
): Promise<R[]> => {
  const chunks = chunk(arr, concurrency);
  const results: R[] = [];

  for (const chunkItem of chunks) {
    const chunkResults = await Promise.all(chunkItem.map(f));
    results.push(...chunkResults);
  }

  return results;
};

const chunk = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// 2.5.4 可测试性

// 纯函数易于测试
import { describe, it, expect } from 'vitest';

describe('pure functions', () => {
  it('add should be deterministic', () => {
    expect(pureAdd(2, 3)).toBe(5);
    expect(pureAdd(2, 3)).toBe(5); // 总是相同结果
  });

  it('reducer should be pure', () => {
    const state: State = { count: 0, users: [] };
    const action: Action = { type: 'INCREMENT', payload: 5 };

    const newState = reducer(state, action);

    expect(newState.count).toBe(5);
    expect(state.count).toBe(0); // 原状态未被修改
  });
});

// 2.5.5 时间旅行调试

// 纯函数允许保存和重放状态序列
class TimeTravelDebugger<T> {
  private history: T[] = [];
  private index = -1;

  push(state: T): void {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(state);
    this.index++;
  }

  undo(): T | undefined {
    if (this.index > 0) {
      this.index--;
      return this.history[this.index];
    }
    return undefined;
  }

  redo(): T | undefined {
    if (this.index < this.history.length - 1) {
      this.index++;
      return this.history[this.index];
    }
    return undefined;
  }
}

// 使用示例
const debugger = new TimeTravelDebugger<State>();
let state: State = { count: 0, users: [] };

debugger.push(state);
state = reducer(state, { type: 'INCREMENT', payload: 5 });
debugger.push(state);
state = reducer(state, { type: 'INCREMENT', payload: 3 });
debugger.push(state);

state = debugger.undo()!; // 回退到 count = 5
console.log(state.count); // 5
```

---

## 3. 不可变数据结构的理论和实现

### 3.1 理论解释

**不可变性（Immutability）** 是指数据结构一旦创建就不能被修改。任何修改操作都会返回一个新的数据结构，而不是修改原有数据。

**结构共享（Structural Sharing）** 是实现高效不可变数据结构的关键技术，它通过共享未修改的部分来减少内存使用。

### 3.2 数学定义

**不可变性的代数性质：**

对于数据结构 `D`，操作 `op` 满足：

```
∀d ∈ D: op(d) = d' 且 d ≠ d'
```

即操作不改变原数据结构，而是产生新结构。

**持久化数据结构（Persistent Data Structure）**：

- 版本历史保持可用
- 每次修改创建新版本
- 旧版本仍然有效

**部分持久化（Partial Persistence）**：只读访问历史版本
**完全持久化（Full Persistence）**：读写访问历史版本
**汇合持久化（Confluent Persistence）**：支持版本合并

### 3.3 持久化数据结构理论

**位向量（Bit Vector）持久化**：

```
Vector: 32叉树，深度为 log₃₂(n)
访问复杂度: O(log₃₂(n)) ≈ O(1) 实际
```

**HAMT（Hash Array Mapped Trie）**：

```
使用哈希值作为路径
每个节点最多 32 个子节点（5 位哈希段）
插入/查找复杂度: O(log₃₂(n))
```

### 3.4 TypeScript 实现

```typescript
// ============================================
// 不可变数据结构的 TypeScript 实现
// ============================================

// 3.4.1 不可变列表（Persistent List）

interface ListNode<T> {
  readonly value: T;
  readonly next: ListNode<T> | null;
  readonly size: number;
}

class ImmutableList<T> {
  private constructor(
    private readonly head: ListNode<T> | null
  ) {}

  static empty<T>(): ImmutableList<T> {
    return new ImmutableList<T>(null);
  }

  static of<T>(...items: T[]): ImmutableList<T> {
    let list = ImmutableList.empty<T>();
    for (let i = items.length - 1; i >= 0; i--) {
      list = list.prepend(items[i]);
    }
    return list;
  }

  // O(1) 前置操作
  prepend(value: T): ImmutableList<T> {
    const newNode: ListNode<T> = {
      value,
      next: this.head,
      size: (this.head?.size ?? 0) + 1
    };
    return new ImmutableList(newNode);
  }

  // O(n) 获取，但保持不可变性
  get(index: number): T | undefined {
    let current = this.head;
    let i = 0;
    while (current !== null && i < index) {
      current = current.next;
      i++;
    }
    return current?.value;
  }

  // O(n) 反转（产生新列表）
  reverse(): ImmutableList<T> {
    let result = ImmutableList.empty<T>();
    let current = this.head;
    while (current !== null) {
      result = result.prepend(current.value);
      current = current.next;
    }
    return result;
  }

  // 函数式 map
  map<R>(f: (x: T) => R): ImmutableList<R> {
    const result: R[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(f(current.value));
      current = current.next;
    }
    return ImmutableList.of(...result.reverse());
  }

  // 转换为数组（复制）
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  get size(): number {
    return this.head?.size ?? 0;
  }
}

// 3.4.2 不可变向量（基于 HAMT 的简化实现）

const BRANCHING_FACTOR = 32;
const MASK = BRANCHING_FACTOR - 1; // 0x1F

type VectorNode<T> =
  | { type: 'leaf'; values: readonly T[] }
  | { type: 'internal'; children: readonly VectorNode<T>[] };

class ImmutableVector<T> {
  private constructor(
    private readonly root: VectorNode<T>,
    private readonly _size: number,
    private readonly shift: number
  ) {}

  static empty<T>(): ImmutableVector<T> {
    return new ImmutableVector<T>(
      { type: 'leaf', values: [] },
      0,
      0
    );
  }

  get size(): number {
    return this._size;
  }

  // 获取元素 O(log₃₂(n))
  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;

    let node = this.root;
    let level = this.shift;

    while (node.type === 'internal') {
      const childIndex = (index >> level) & MASK;
      node = node.children[childIndex];
      level -= 5;
    }

    return node.values[index & MASK];
  }

  // 设置元素（产生新向量）O(log₃₂(n))
  set(index: number, value: T): ImmutableVector<T> {
    if (index < 0 || index > this._size) {
      throw new Error('Index out of bounds');
    }

    if (index === this._size) {
      return this.push(value);
    }

    return new ImmutableVector(
      this.setInNode(this.root, index, value, this.shift),
      this._size,
      this.shift
    );
  }

  private setInNode(
    node: VectorNode<T>,
    index: number,
    value: T,
    shift: number
  ): VectorNode<T> {
    if (node.type === 'leaf') {
      const newValues = [...node.values];
      newValues[index & MASK] = value;
      return { type: 'leaf', values: newValues };
    }

    const childIndex = (index >> shift) & MASK;
    const newChildren = [...node.children];
    newChildren[childIndex] = this.setInNode(
      node.children[childIndex],
      index,
      value,
      shift - 5
    );
    return { type: 'internal', children: newChildren };
  }

  // 添加元素 O(log₃₂(n)) 均摊
  push(value: T): ImmutableVector<T> {
    if (this._size === 0) {
      return new ImmutableVector(
        { type: 'leaf', values: [value] },
        1,
        0
      );
    }

    // 简化的 push 实现（实际需要更复杂的树重新平衡）
    const newSize = this._size + 1;
    return new ImmutableVector(
      this.pushToNode(this.root, value, this.shift, this._size),
      newSize,
      this.shift
    );
  }

  private pushToNode(
    node: VectorNode<T>,
    value: T,
    shift: number,
    index: number
  ): VectorNode<T> {
    if (node.type === 'leaf') {
      if (node.values.length < BRANCHING_FACTOR) {
        return { type: 'leaf', values: [...node.values, value] };
      }
      // 需要分裂（简化处理）
      return {
        type: 'internal',
        children: [node, { type: 'leaf', values: [value] }]
      };
    }

    // 内部节点的处理
    const childIndex = (index >> shift) & MASK;
    const newChildren = [...node.children];

    if (childIndex < node.children.length) {
      newChildren[childIndex] = this.pushToNode(
        node.children[childIndex],
        value,
        shift - 5,
        index
      );
    } else {
      newChildren.push({ type: 'leaf', values: [value] });
    }

    return { type: 'internal', children: newChildren };
  }

  // 转换为数组
  toArray(): T[] {
    const result: T[] = new Array(this._size);
    for (let i = 0; i < this._size; i++) {
      result[i] = this.get(i)!;
    }
    return result;
  }
}

// 3.4.3 不可变映射（Immutable Map）

interface MapEntry<K, V> {
  readonly key: K;
  readonly value: V;
}

class ImmutableMap<K, V> {
  private constructor(
    private readonly buckets: ReadonlyArray<ReadonlyArray<MapEntry<K, V>>>,
    private readonly _size: number
  ) {}

  static empty<K, V>(): ImmutableMap<K, V> {
    return new ImmutableMap<K, V>([], 0);
  }

  private hash(key: K): number {
    const str = JSON.stringify(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  get(key: K): V | undefined {
    const h = this.hash(key);
    const bucket = this.buckets[h % this.buckets.length];
    if (!bucket) return undefined;

    for (const entry of bucket) {
      if (JSON.stringify(entry.key) === JSON.stringify(key)) {
        return entry.value;
      }
    }
    return undefined;
  }

  set(key: K, value: V): ImmutableMap<K, V> {
    const h = this.hash(key);
    const bucketIndex = this.buckets.length > 0 ? h % this.buckets.length : 0;

    // 重新计算 buckets 大小
    const newBucketSize = Math.max(this.buckets.length, 16);
    const newBuckets: MapEntry<K, V>[][] = Array.from(
      { length: newBucketSize },
      (_, i) => [...(this.buckets[i] || [])]
    );

    const bucket = newBuckets[bucketIndex];
    const existingIndex = bucket.findIndex(
      e => JSON.stringify(e.key) === JSON.stringify(key)
    );

    if (existingIndex >= 0) {
      bucket[existingIndex] = { key, value };
      return new ImmutableMap(newBuckets, this._size);
    } else {
      bucket.push({ key, value });
      return new ImmutableMap(newBuckets, this._size + 1);
    }
  }

  delete(key: K): ImmutableMap<K, V> {
    const h = this.hash(key);
    const bucketIndex = h % this.buckets.length;
    const bucket = this.buckets[bucketIndex];

    if (!bucket) return this;

    const newBucket = bucket.filter(
      e => JSON.stringify(e.key) !== JSON.stringify(key)
    );

    if (newBucket.length === bucket.length) return this;

    const newBuckets = [...this.buckets];
    newBuckets[bucketIndex] = newBucket;

    return new ImmutableMap(newBuckets, this._size - 1);
  }

  get size(): number {
    return this._size;
  }

  entries(): IterableIterator<[K, V]> {
    function* gen(buckets: ReadonlyArray<ReadonlyArray<MapEntry<K, V>>>) {
      for (const bucket of buckets) {
        for (const entry of bucket) {
          yield [entry.key, entry.value] as [K, V];
        }
      }
    }
    return gen(this.buckets);
  }
}

// 3.4.4 不可变记录（Record）

type RecordShape = Record<string, unknown>;

class ImmutableRecord<T extends RecordShape> {
  private constructor(
    private readonly data: T
  ) {}

  static of<T extends RecordShape>(data: T): ImmutableRecord<T> {
    return new ImmutableRecord({ ...data });
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): ImmutableRecord<T> {
    return new ImmutableRecord({ ...this.data, [key]: value });
  }

  update<K extends keyof T>(
    key: K,
    f: (value: T[K]) => T[K]
  ): ImmutableRecord<T> {
    return this.set(key, f(this.data[key]));
  }

  merge(other: Partial<T>): ImmutableRecord<T> {
    return new ImmutableRecord({ ...this.data, ...other });
  }

  delete<K extends keyof T>(key: K): ImmutableRecord<Omit<T, K>> {
    const { [key]: _, ...rest } = this.data;
    return new ImmutableRecord(rest as Omit<T, K>);
  }

  toObject(): T {
    return { ...this.data };
  }
}

// 3.4.5 使用原生对象实现简单不可变性

// 冻结对象（浅层）
const freeze = <T>(obj: T): Readonly<T> => Object.freeze(obj);

// 深冻结
const deepFreeze = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;

  Object.freeze(obj);

  for (const key of Object.keys(obj)) {
    deepFreeze((obj as Record<string, unknown>)[key]);
  }

  return obj;
};

// 不可变更新辅助函数
const setIn = <T>(
  obj: Record<string, unknown>,
  path: string[],
  value: T
): Record<string, unknown> => {
  if (path.length === 0) return obj;

  const [head, ...tail] = path;

  if (tail.length === 0) {
    return { ...obj, [head]: value };
  }

  return {
    ...obj,
    [head]: setIn((obj[head] as Record<string, unknown>) || {}, tail, value)
  };
};

const updateIn = <T>(
  obj: Record<string, unknown>,
  path: string[],
  f: (value: T) => T
): Record<string, unknown> => {
  const current = path.reduce((o, k) => (o as Record<string, T>)[k], obj) as T;
  return setIn(obj, path, f(current));
};
```

### 3.5 实际应用

```typescript
// ============================================
// 不可变数据结构在实际开发中的应用
// ============================================

// 3.5.1 React/Redux 风格的状态管理

interface AppState {
  user: {
    id: string;
    name: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

// 使用不可变更新
const updateTheme = (
  state: AppState,
  theme: 'light' | 'dark'
): AppState => ({
  ...state,
  user: {
    ...state.user,
    preferences: {
      ...state.user.preferences,
      theme
    }
  }
});

// 或使用 path 辅助
const updateThemeWithPath = (
  state: AppState,
  theme: 'light' | 'dark'
): AppState => setIn(
  state as Record<string, unknown>,
  ['user', 'preferences', 'theme'],
  theme
) as AppState;

// 3.5.2 Undo/Redo 功能

class UndoManager<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];

  constructor(initial: T) {
    this.present = initial;
  }

  get state(): T {
    return this.present;
  }

  update(updater: (state: T) => T): void {
    this.past = [...this.past, this.present];
    this.present = updater(this.present);
    this.future = [];
  }

  undo(): boolean {
    if (this.past.length === 0) return false;

    this.future = [this.present, ...this.future];
    this.present = this.past[this.past.length - 1];
    this.past = this.past.slice(0, -1);
    return true;
  }

  redo(): boolean {
    if (this.future.length === 0) return false;

    this.past = [...this.past, this.present];
    this.present = this.future[0];
    this.future = this.future.slice(1);
    return true;
  }
}

// 3.5.3 函数式状态更新管道

interface Document {
  content: string;
  version: number;
  lastModified: Date;
}

// 纯函数状态转换
const incrementVersion = (doc: Document): Document => ({
  ...doc,
  version: doc.version + 1
});

const updateTimestamp = (doc: Document): Document => ({
  ...doc,
  lastModified: new Date()
});

const appendContent = (text: string) => (doc: Document): Document => ({
  ...doc,
  content: doc.content + text
});

// 组合更新
const editDocument = (text: string) => (doc: Document): Document =>
  pipe(
    doc,
    appendContent(text),
    incrementVersion,
    updateTimestamp
  );

// 辅助函数 pipe
function pipe<T>(value: T, ...fns: Array<(x: T) => T>): T {
  return fns.reduce((v, f) => f(v), value);
}

// 3.5.4 版本控制数据结构

class VersionedVector<T> {
  private versions: ImmutableVector<T>[] = [];
  private currentVersion = -1;

  constructor(initial: ImmutableVector<T> = ImmutableVector.empty()) {
    this.versions.push(initial);
    this.currentVersion = 0;
  }

  get current(): ImmutableVector<T> {
    return this.versions[this.currentVersion];
  }

  update(updater: (v: ImmutableVector<T>) => ImmutableVector<T>): void {
    // 删除当前版本之后的所有版本
    this.versions = this.versions.slice(0, this.currentVersion + 1);

    const newVersion = updater(this.current);
    this.versions.push(newVersion);
    this.currentVersion++;
  }

  checkout(version: number): boolean {
    if (version < 0 || version >= this.versions.length) {
      return false;
    }
    this.currentVersion = version;
    return true;
  }

  get versionCount(): number {
    return this.versions.length;
  }
}

// 3.5.5 与第三方库集成（Immer 风格）

// 使用原生 Proxy 实现简单的 Immer
function produce<T>(
  base: T,
  recipe: (draft: T) => void
): T {
  const copies = new Map<object, object>();

  const handler: ProxyHandler<object> = {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop];
      if (typeof value === 'object' && value !== null) {
        return createProxy(value);
      }
      return value;
    },
    set(target, prop, value) {
      const copy = getOrCreateCopy(target);
      (copy as Record<string | symbol, unknown>)[prop] = value;
      return true;
    }
  };

  function getOrCreateCopy<T extends object>(obj: T): T {
    if (!copies.has(obj)) {
      copies.set(obj, Array.isArray(obj) ? [...obj] : { ...obj });
    }
    return copies.get(obj) as T;
  }

  function createProxy<T extends object>(obj: T): T {
    return new Proxy(obj, handler) as T;
  }

  const draft = createProxy(base as object);
  recipe(draft as T);

  // 简化实现：返回修改后的根对象
  return (copies.get(base as object) ?? base) as T;
}

// 使用示例
const state = {
  user: { name: 'Alice', age: 30 },
  todos: [{ id: 1, text: 'Learn FP' }]
};

const newState = produce(state, draft => {
  draft.user.age = 31;
  draft.todos.push({ id: 2, text: 'Practice TypeScript' });
});

console.log(state.user.age); // 30 (未改变)
console.log(newState.user.age); // 31
```

---

## 4. 高阶函数和函数组合

### 4.1 理论解释

**高阶函数（Higher-Order Function, HOF）** 是指至少满足下列条件之一的函数：

1. 接受一个或多个函数作为参数
2. 返回一个函数作为结果

**函数组合（Function Composition）** 是将多个函数组合成一个新函数的过程。数学上表示为：`(f ∘ g)(x) = f(g(x))`

### 4.2 数学定义

**高阶函数的类型签名：**

```
map: (A → B) → List(A) → List(B)
filter: (A → Bool) → List(A) → List(A)
reduce: ((B, A) → B) → B → List(A) → B
compose: (B → C) → (A → B) → (A → C)
curry: (A × B → C) → (A → (B → C))
```

**函数组合的性质：**

1. **结合律**：`f ∘ (g ∘ h) = (f ∘ g) ∘ h`
2. **恒等元**：`f ∘ id = id ∘ f = f`
3. **分配律**：`(f ∘ g)(x) = f(g(x))`

**函子（Functor）定律：**

```
map(id) = id
map(f ∘ g) = map(f) ∘ map(g)
```

### 4.3 范畴论语境

在范畴论中：

- **对象**：类型（Types）
- **态射**：纯函数
- **组合**：函数组合 `∘`
- **单位态射**：恒等函数 `id`

**幺半群（Monoid）与 reduce：**

```
(M, ⊕, e) 其中
- M: 集合
- ⊕: 二元运算 (M × M → M)
- e: 单位元
满足：
- 结合律: (a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)
- 单位元: a ⊕ e = e ⊕ a = a
```

### 4.4 TypeScript 实现


```typescript
// 4.4.7 遍历和可折叠

// 左折叠
const foldl = <A, B>(f: (acc: B, x: A) => B) => (initial: B) =>
  (arr: A[]): B => arr.reduce(f, initial);

// 右折叠
const foldr = <A, B>(f: (x: A, acc: B) => B) => (initial: B) =>
  (arr: A[]): B => arr.reduceRight((acc, x) => f(x, acc), initial);

// 遍历（Traversable）
const traverse = <A, B>(f: (a: A) => Promise<B>) =>
  (arr: A[]): Promise<B[]> => Promise.all(arr.map(f));

// 序列（Sequence）
const sequence = <A>(arr: Promise<A>[]): Promise<A[]> => Promise.all(arr);

// 4.4.8 点自由风格（Point-free Style）

// 非点自由风格
const getUserNames1 = (users: { name: string }[]): string[] =>
  users.map(user => user.name);

// 点自由风格
const prop = <K extends string>(key: K) =>
  <T extends Record<K, unknown>>(obj: T): T[K] => obj[key];

const getUserNames = map(prop('name'));

// 点自由：计算偶数两倍的和
const isEven = (n: number): boolean => n % 2 === 0;
const double = (n: number): number => n * 2;
const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
const sumOfEvenDoubles = composeMany(sum, map(double), filter(isEven));
```

### 4.5 实际应用

```typescript
// 数据处理管道
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  country: string;
  orders: Array<{ id: number; amount: number }>;
}

const processUserData = (users: User[]) =>
  pipeMany(
    filter((u: User) => u.age >= 18),
    sortBy((u: User) => u.name),
    map((u: User) => ({
      ...u,
      totalSpent: u.orders.reduce((sum, o) => sum + o.amount, 0)
    })),
    filter((u: User & { totalSpent: number }) => u.totalSpent > 1000),
    groupBy((u: User & { totalSpent: number }) => u.country)
  )(users);

// 中间件组合
type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>;

const composeMiddleware = <T>(...middlewares: Middleware<T>[]) =>
  async (ctx: T) => {
    let index = 0;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = middlewares[i];
      if (fn) await fn(ctx, () => dispatch(i + 1));
    };
    await dispatch(0);
  };
```

---

## 5. 函子（Functor）、应用函子（Applicative）、单子（Monad）

### 5.1 理论解释

这些概念源自**范畴论（Category Theory）**，是函数式编程中处理上下文和效果的强大抽象。

### 5.2 数学定义

**函子定律：**

```
map(id) = id
map(f . g) = map(f) . map(g)
```

**单子定律：**

```
return a >>= f = f a                      (左单位元)
m >>= return = m                           (右单位元)
(m >>= f) >>= g = m >>= (x -> f x >>= g)   (结合律)
```

### 5.3 TypeScript 实现

```typescript
// Maybe 类型
interface None { readonly _tag: 'None'; }
interface Some<A> { readonly _tag: 'Some'; readonly value: A; }
type Maybe<A> = None | Some<A>;

const none = <A>(): Maybe<A> => ({ _tag: 'None' });
const some = <A>(value: A): Maybe<A> => ({ _tag: 'Some', value });

// Maybe Functor
const maybeMap = <A, B>(f: (a: A) => B) => (ma: Maybe<A>): Maybe<B> =>
  ma._tag === 'Some' ? some(f(ma.value)) : none<B>();

// Maybe Monad
const maybeChain = <A, B>(f: (a: A) => Maybe<B>) => (ma: Maybe<A>): Maybe<B> =>
  ma._tag === 'Some' ? f(ma.value) : none<B>();

// Either 类型
type Either<E, A> =
  | { readonly _tag: 'Left'; readonly left: E }
  | { readonly _tag: 'Right'; readonly right: A };

const left = <E, A>(e: E): Either<E, A> => ({ _tag: 'Left', left: e });
const right = <E, A>(a: A): Either<E, A> => ({ _tag: 'Right', right: a });

// Either Monad
const eitherChain = <E, A, B>(f: (a: A) => Either<E, B>) =>
  (ea: Either<E, A>): Either<E, B> =>
    ea._tag === 'Right' ? f(ea.right) : ea as Either<E, B>;

// IO Monad
type IO<A> = () => A;

const ioMap = <A, B>(f: (a: A) => B) => (fa: IO<A>): IO<B> => () => f(fa());
const ioChain = <A, B>(f: (a: A) => IO<B>) => (fa: IO<A>): IO<B> =>
  () => f(fa())();

// Reader Monad
type Reader<R, A> = (r: R) => A;

const readerMap = <R, A, B>(f: (a: A) => B) => (fa: Reader<R, A>): Reader<R, B> =>
  r => f(fa(r));
const readerChain = <R, A, B>(f: (a: A) => Reader<R, B>) =>
  (fa: Reader<R, A>): Reader<R, B> => r => f(fa(r))(r);
const ask = <R>(): Reader<R, R> => r => r;

// State Monad
type State<S, A> = (s: S) => [A, S];

const stateMap = <S, A, B>(f: (a: A) => B) => (fa: State<S, A>): State<S, B> => s => {
  const [a, s1] = fa(s);
  return [f(a), s1];
};

const stateChain = <S, A, B>(f: (a: A) => State<S, B>) =>
  (fa: State<S, A>): State<S, B> => s => {
    const [a, s1] = fa(s);
    return f(a)(s1);
  };

const get = <S>(): State<S, S> => s => [s, s];
const put = <S>(s: S): State<S, void> => () => [undefined, s];
const modify = <S>(f: (s: S) => S): State<S, void> => s => [undefined, f(s)];
```

### 5.4 实际应用

```typescript
// 表单验证（使用 Applicative）
interface FormError { field: string; message: string; }

const validateName = (name: string): Either<FormError[], string> => {
  if (name.length < 2) return left([{ field: 'name', message: 'Too short' }]);
  return right(name);
};

const validateEmail = (email: string): Either<FormError[], string> => {
  if (!email.includes('@')) return left([{ field: 'email', message: 'Invalid' }]);
  return right(email);
};

// 安全的深层属性访问
interface Profile {
  address?: { city?: { name?: string } };
}

const getCityName = (profile: Profile): Maybe<string> =>
  profile.address === undefined ? none() :
  profile.address.city === undefined ? none() :
  profile.address.city.name === undefined ? none() :
  some(profile.address.city.name);

// 使用 State Monad 管理状态
type CounterState = { count: number; history: number[] };

const increment = (n: number): State<CounterState, number> => s => {
  const newCount = s.count + n;
  return [newCount, { count: newCount, history: [...s.history, newCount] }];
};

// 依赖注入（Reader）
interface Config { dbHost: string; apiKey: string; }

const fetchUser = (id: string): Reader<Config, Promise<{ id: string }>> =>
  config => Promise.resolve({ id, host: config.dbHost } as { id: string });
```

---

## 6. 惰性求值和流

### 6.1 理论解释

惰性求值（Lazy Evaluation）是一种求值策略，表达式只在需要时才进行求值。

### 6.2 TypeScript 实现

```typescript
// 惰性值
interface Lazy<A> { (): A; }

const lazy = <A>(f: () => A): Lazy<A> => {
  let evaluated = false;
  let value: A;
  return () => {
    if (!evaluated) { value = f(); evaluated = true; }
    return value;
  };
};

const force = <A>(l: Lazy<A>): A => l();

// 惰性列表
type LazyList<A> =
  | { _tag: 'Nil' }
  | { _tag: 'Cons'; head: A; tail: Lazy<LazyList<A>> };

const nil = <A>(): LazyList<A> => ({ _tag: 'Nil' });
const cons = <A>(head: A, tail: Lazy<LazyList<A>>): LazyList<A> =>
  ({ _tag: 'Cons', head, tail });

// 无限序列
const iterate = <A>(f: (a: A) => A, seed: A): LazyList<A> =>
  cons(seed, lazy(() => iterate(f, f(seed))));

const naturals = iterate(n => n + 1, 0);
const powersOf2 = iterate(n => n * 2, 1);

// 惰性操作
const take = <A>(n: number, list: LazyList<A>): A[] => {
  const result: A[] = [];
  let current = list;
  for (let i = 0; i < n && current._tag === 'Cons'; i++) {
    result.push(current.head);
    current = current.tail();
  }
  return result;
};

const map = <A, B>(f: (a: A) => B) => (list: LazyList<A>): LazyList<B> =>
  list._tag === 'Nil' ? nil<B>() :
  cons(f(list.head), lazy(() => map(f)(list.tail())));

const filter = <A>(p: (a: A) => boolean) => (list: LazyList<A>): LazyList<A> =>
  list._tag === 'Nil' ? nil<A>() :
  p(list.head) ? cons(list.head, lazy(() => filter(p)(list.tail()))) :
  filter(p)(list.tail());

// 使用示例
const evenNumbers = filter((n: number) => n % 2 === 0)(naturals);
const first10Evens = take(10, evenNumbers);
// [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```

---

## 7. 尾递归优化

### 7.1 理论解释

尾递归（Tail Recursion）是递归的特殊形式，递归调用是函数的最后一个操作。支持尾调用优化的编译器可以将尾递归转换为循环，避免栈溢出。

### 7.2 数学定义

**尾调用优化（TCO）原理：**

```
如果函数调用是尾调用，可以复用当前栈帧
尾递归是特殊的尾调用：f(...) 直接返回 f(...) 的结果
```

### 7.3 TypeScript 实现

```typescript
// 非尾递归 - 可能导致栈溢出
const factorialNaive = (n: number): number =>
  n <= 1 ? 1 : n * factorialNaive(n - 1);

// 尾递归版本
const factorialTCO = (n: number, acc: number = 1): number =>
  n <= 1 ? acc : factorialTCO(n - 1, n * acc);

// 手动蹦床优化（Trampoline）
type Thunk<A> = () => A | Thunk<A>;

const trampoline = <A>(fn: Thunk<A>): A => {
  let result = fn();
  while (typeof result === 'function') {
    result = (result as Thunk<A>)();
  }
  return result;
};

const factorialTrampoline = (n: number): number => {
  const go = (n: number, acc: number): Thunk<number> =>
    n <= 1 ? () => acc : () => go(n - 1, n * acc);
  return trampoline(go(n, 1));
};

// 通用的尾递归包装器
const tailRec = <A, B>(
  initial: A,
  step: (a: A) => { done: true; value: B } | { done: false; value: A }
): B => {
  let current = initial;
  while (true) {
    const result = step(current);
    if (result.done) return result.value;
    current = result.value;
  }
};

// 使用尾递归
const factorial = (n: number): number =>
  tailRec([n, 1] as [number, number], ([n, acc]) =>
    n <= 1 ? { done: true, value: acc } : { done: false, value: [n - 1, n * acc] }
  );

const fibonacci = (n: number): number =>
  tailRec([n, 0, 1] as [number, number, number], ([n, a, b]) =>
    n === 0 ? { done: true, value: a } : { done: false, value: [n - 1, b, a + b] }
  );

// 数组操作的尾递归
const reverse = <T>(arr: T[]): T[] => {
  const go = (i: number, acc: T[]): Thunk<T[]> =>
    i < 0 ? () => acc : () => go(i - 1, [...acc, arr[i]]);
  return trampoline(go(arr.length - 1, []));
};

const map = <T, R>(arr: T[], f: (x: T) => R): R[] => {
  const go = (i: number, acc: R[]): Thunk<R[]> =>
    i >= arr.length ? () => acc : () => go(i + 1, [...acc, f(arr[i])]);
  return trampoline(go(0, []));
};
```

### 7.4 实际应用

```typescript
// 树遍历的尾递归优化
interface Tree<A> {
  value: A;
  left?: Tree<A>;
  right?: Tree<A>;
}

// 非尾递归 - 深度优先
const sumTreeNaive = (tree: Tree<number>): number =>
  tree.value +
  (tree.left ? sumTreeNaive(tree.left) : 0) +
  (tree.right ? sumTreeNaive(tree.right) : 0);

// 尾递归版本 - 使用 CPS（Continuation Passing Style）
const sumTreeCPS = (tree: Tree<number>, cont: (n: number) => number = x => x): number => {
  const leftSum = tree.left ? (k: (n: number) => number) => sumTreeCPS(tree.left!, k) : null;
  const rightSum = tree.right ? (k: (n: number) => number) => sumTreeCPS(tree.right!, k) : null;

  if (leftSum && rightSum) {
    return leftSum(l => rightSum(r => cont(tree.value + l + r)));
  } else if (leftSum) {
    return leftSum(l => cont(tree.value + l));
  } else if (rightSum) {
    return rightSum(r => cont(tree.value + r));
  }
  return cont(tree.value);
};
```

---

## 8. 函数式错误处理（Maybe、Either）

### 8.1 理论解释

Maybe 和 Either 是函数式编程中处理可能失败计算的类型安全方式，避免了 null 检查和异常抛出。

### 8.2 TypeScript 实现

```typescript
// Maybe 类型及其操作
type Maybe<A> = None | Some<A>;
interface None { _tag: 'None'; }
interface Some<A> { _tag: 'Some'; value: A; }

const none = <A>(): Maybe<A> => ({ _tag: 'None' });
const some = <A>(a: A): Maybe<A> => ({ _tag: 'Some', value: a });
const fromNullable = <A>(a: A | null | undefined): Maybe<A> =>
  a == null ? none<A>() : some<A>(a);

const maybe = {
  map: <A, B>(f: (a: A) => B) => (ma: Maybe<A>): Maybe<B> =>
    ma._tag === 'Some' ? some(f(ma.value)) : none<B>(),

  chain: <A, B>(f: (a: A) => Maybe<B>) => (ma: Maybe<A>): Maybe<B> =>
    ma._tag === 'Some' ? f(ma.value) : none<B>(),

  getOrElse: <A>(defaultValue: A) => (ma: Maybe<A>): A =>
    ma._tag === 'Some' ? ma.value : defaultValue,

  fold: <A, B>(onNone: () => B, onSome: (a: A) => B) => (ma: Maybe<A>): B =>
    ma._tag === 'Some' ? onSome(ma.value) : onNone(),

  filter: <A>(p: (a: A) => boolean) => (ma: Maybe<A>): Maybe<A> =>
    ma._tag === 'Some' && p(ma.value) ? ma : none<A>(),

  alt: <A>(that: Maybe<A>) => (ma: Maybe<A>): Maybe<A> =>
    ma._tag === 'Some' ? ma : that
};

// Either 类型及其操作
type Either<E, A> = Left<E> | Right<A>;
interface Left<E> { _tag: 'Left'; left: E; }
interface Right<A> { _tag: 'Right'; right: A; }

const left = <E, A>(e: E): Either<E, A> => ({ _tag: 'Left', left: e });
const right = <E, A>(a: A): Either<E, A> => ({ _tag: 'Right', right: a });

const either = {
  map: <E, A, B>(f: (a: A) => B) => (ea: Either<E, A>): Either<E, B> =>
    ea._tag === 'Right' ? right<E, B>(f(ea.right)) : ea as Either<E, B>,

  mapLeft: <E, F>(f: (e: E) => F) => <A>(ea: Either<E, A>): Either<F, A> =>
    ea._tag === 'Left' ? left<F, A>(f(ea.left)) : ea as Either<F, A>,

  chain: <E, A, B>(f: (a: A) => Either<E, B>) => (ea: Either<E, A>): Either<E, B> =>
    ea._tag === 'Right' ? f(ea.right) : ea as Either<E, B>,

  getOrElse: <E, A>(onLeft: (e: E) => A) => (ea: Either<E, A>): A =>
    ea._tag === 'Right' ? ea.right : onLeft(ea.left),

  fold: <E, A, B>(onLeft: (e: E) => B, onRight: (a: A) => B) => (ea: Either<E, A>): B =>
    ea._tag === 'Right' ? onRight(ea.right) : onLeft(ea.left),

  bimap: <E, F, A, B>(f: (e: E) => F, g: (a: A) => B) => (ea: Either<E, A>): Either<F, B> =>
    ea._tag === 'Right' ? right<F, B>(g(ea.right)) : left<F, B>(f(ea.left)),

  tryCatch: <E, A>(f: () => A, onError: (e: unknown) => E): Either<E, A> => {
    try { return right<E, A>(f()); }
    catch (e) { return left<E, A>(onError(e)); }
  }
};

// Validation（累积错误）
type Validation<E, A> = Failure<E> | Success<A>;
interface Failure<E> { _tag: 'Failure'; errors: E[]; }
interface Success<A> { _tag: 'Success'; value: A; }

const failure = <E, A>(errors: E[]): Validation<E, A> => ({ _tag: 'Failure', errors });
const success = <E, A>(value: A): Validation<E, A> => ({ _tag: 'Success', value });

const validation = {
  map: <E, A, B>(f: (a: A) => B) => (va: Validation<E, A>): Validation<E, B> =>
    va._tag === 'Success' ? success<E, B>(f(va.value)) : va as Validation<E, B>,

  ap: <E, A, B>(vf: Validation<E, (a: A) => B>) => (va: Validation<E, A>): Validation<E, B> =>
    vf._tag === 'Failure' ? va._tag === 'Failure'
      ? failure<E, B>([...vf.errors, ...va.errors])
      : vf as Validation<E, B>
    : va._tag === 'Failure'
      ? va as Validation<E, B>
      : success<E, B>(vf.value(va.value))
};
```

### 8.3 实际应用

```typescript
// API 调用错误处理
interface ApiError { code: number; message: string; }

const fetchUser = (id: string): Promise<Either<ApiError, User>> =>
  fetch(`/api/users/${id}`)
    .then(r => r.ok ? r.json() : Promise.reject({ code: r.status, message: r.statusText }))
    .then(data => right<ApiError, User>(data))
    .catch(e => left<ApiError, User>(e));

// 安全地组合多个操作
const getUserEmailDomain = (id: string): Promise<Maybe<string>> =>
  fetchUser(id).then(result =>
    result._tag === 'Right'
      ? maybe.map((email: string) => email.split('@')[1])(fromNullable(result.right.email))
      : Promise.resolve(none<string>())
  );

// 表单验证（累积错误）
interface Person { name: string; age: number; email: string; }
type FieldError = { field: keyof Person; message: string };

const validatePerson = (data: Partial<Person>): Validation<FieldError[], Person> => {
  const vName = data.name && data.name.length >= 2
    ? success<FieldError[], string>(data.name)
    : failure<FieldError[], string>([{ field: 'name', message: 'Name too short' }]);

  const vAge = data.age !== undefined && data.age >= 0 && data.age <= 150
    ? success<FieldError[], number>(data.age)
    : failure<FieldError[], number>([{ field: 'age', message: 'Invalid age' }]);

  const vEmail = data.email && data.email.includes('@')
    ? success<FieldError[], string>(data.email)
    : failure<FieldError[], string>([{ field: 'email', message: 'Invalid email' }]);

  return validation.ap(
    validation.ap(
      validation.map((name: string) => (age: number) => (email: string): Person =>
        ({ name, age, email }))(vName),
      vAge
    ),
    vEmail
  );
};
```

---

## 9. 响应式编程（FRP）理论

### 9.1 理论解释

函数式响应式编程（FRP）结合了函数式编程和响应式编程，使用纯函数处理随时间变化的数据。

### 9.2 TypeScript 实现

```typescript
// Observable 基础实现
interface Observer<A> {
  next: (value: A) => void;
  error: (err: Error) => void;
  complete: () => void;
}

interface Subscription { unsubscribe(): void; }

type TeardownLogic = (() => void) | void;

class Observable<A> {
  constructor(private _subscribe: (observer: Observer<A>) => TeardownLogic) {}

  subscribe(observer: Partial<Observer<A>>): Subscription {
    const full: Observer<A> = {
      next: observer.next || (() => {}),
      error: observer.error || ((e) => { throw e; }),
      complete: observer.complete || (() => {})
    };
    const teardown = this._subscribe(full);
    return { unsubscribe: () => { if (teardown) teardown(); } };
  }

  // 操作符
  map<B>(f: (a: A) => B): Observable<B> {
    return new Observable(observer =>
      this.subscribe({
        next: x => observer.next(f(x)),
        error: e => observer.error(e),
        complete: () => observer.complete()
      })
    );
  }

  filter(p: (a: A) => boolean): Observable<A> {
    return new Observable(observer =>
      this.subscribe({
        next: x => { if (p(x)) observer.next(x); },
        error: e => observer.error(e),
        complete: () => observer.complete()
      })
    );
  }

  scan<B>(f: (acc: B, a: A) => B, seed: B): Observable<B> {
    return new Observable(observer => {
      let acc = seed;
      return this.subscribe({
        next: x => { acc = f(acc, x); observer.next(acc); },
        error: e => observer.error(e),
        complete: () => observer.complete()
      });
    });
  }

  take(n: number): Observable<A> {
    return new Observable(observer => {
      let count = 0;
      const sub = this.subscribe({
        next: x => {
          if (count < n) {
            observer.next(x);
            count++;
            if (count >= n) {
              observer.complete();
              sub.unsubscribe();
            }
          }
        },
        error: e => observer.error(e),
        complete: () => observer.complete()
      });
      return () => sub.unsubscribe();
    });
  }

  debounceTime(ms: number): Observable<A> {
    return new Observable(observer => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return this.subscribe({
        next: x => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => observer.next(x), ms);
        },
        error: e => observer.error(e),
        complete: () => observer.complete()
      });
    });
  }

  // 静态创建方法
  static of<A>(...values: A[]): Observable<A> {
    return new Observable(observer => {
      values.forEach(v => observer.next(v));
      observer.complete();
    });
  }

  static fromEvent<K extends keyof HTMLElementEventMap>(
    el: HTMLElement, event: K
  ): Observable<HTMLElementEventMap[K]> {
    return new Observable(observer => {
      const handler = (e: HTMLElementEventMap[K]) => observer.next(e);
      el.addEventListener(event, handler);
      return () => el.removeEventListener(event, handler);
    });
  }

  static interval(ms: number): Observable<number> {
    return new Observable(observer => {
      let i = 0;
      const id = setInterval(() => observer.next(i++), ms);
      return () => clearInterval(id);
    });
  }

  static merge<A>(...observables: Observable<A>[]): Observable<A> {
    return new Observable(observer => {
      const subs = observables.map(o => o.subscribe(observer));
      return () => subs.forEach(s => s.unsubscribe());
    });
  }
}

// BehaviorSubject - 总是有当前值
class BehaviorSubject<A> extends Observable<A> {
  private _value: A;
  private _observers: Observer<A>[] = [];

  constructor(initial: A) {
    super(observer => {
      observer.next(this._value);
      this._observers.push(observer);
      return () => {
        const idx = this._observers.indexOf(observer);
        if (idx >= 0) this._observers.splice(idx, 1);
      };
    });
    this._value = initial;
  }

  get value(): A { return this._value; }

  next(value: A): void {
    this._value = value;
    this._observers.forEach(o => o.next(value));
  }
}
```

### 9.3 实际应用

```typescript
// 搜索自动完成
const searchInput = document.getElementById('search') as HTMLInputElement;
const searchResults = document.getElementById('results') as HTMLDivElement;

Observable.fromEvent(searchInput, 'input')
  .map(e => (e.target as HTMLInputElement).value)
  .filter(q => q.length >= 2)
  .debounceTime(300)
  .subscribe(query => {
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(results => {
        searchResults.innerHTML = results.map((r: any) =>
          `<div>${r.name}</div>`
        ).join('');
      });
  });

// 状态管理
interface AppState {
  user: { id: string; name: string } | null;
  loading: boolean;
  error: string | null;
}

const store = new BehaviorSubject<AppState>({
  user: null,
  loading: false,
  error: null
});

// 选择器
const selectUser = () => store.map(s => s.user);
const selectLoading = () => store.map(s => s.loading);

// 更新状态
const setUser = (user: AppState['user']) =>
  store.next({ ...store.value, user, loading: false });

const setLoading = () =>
  store.next({ ...store.value, loading: true, error: null });

// 订阅更新
selectUser().subscribe(user => {
  console.log('User changed:', user);
});
```

---

## 10. fp-ts、Ramda、Lodash/fp 的对比

### 10.1 库概述

| 特性 | fp-ts | Ramda | Lodash/fp |
|------|-------|-------|-----------|
| 类型安全 | 优秀（TypeScript优先） | 中等（有类型定义） | 中等（有类型定义） |
| 函数式纯度 | 高 | 高 | 中等 |
| 学习曲线 | 陡峭 | 中等 | 平缓 |
| 社区活跃度 | 活跃 | 活跃 | 活跃 |
| 包大小 | ~50KB | ~20KB | ~70KB |
| 设计理念 | 范畴论驱动 | 实用函数式 | Lodash的FP版本 |

### 10.2 fp-ts 示例

```typescript
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

// 使用 fp-ts 处理异步操作
const fetchUser = (id: string): TE.TaskEither<Error, User> =>
  TE.tryCatch(
    () => fetch(`/api/users/${id}`).then(r => r.json()),
    (e) => new Error(String(e))
  );

const getUserName = (id: string): T.Task<string> =>
  pipe(
    id,
    fetchUser,
    TE.map(user => user.name),
    TE.getOrElse(() => T.of('Unknown'))
  );

// 组合多个验证
import * as RA from 'fp-ts/ReadonlyArray';
import { sequenceT } from 'fp-ts/Apply';

const validateAll = sequenceT(E.Apply)([
  validateName('John'),
  validateEmail('john@example.com'),
  validateAge(25)
]);
```

### 10.3 Ramda 示例

```typescript
import * as R from 'ramda';

// 数据转换管道
const processUsers = R.pipe(
  R.filter<User>(R.propEq('active', true)),
  R.sortBy(R.prop('name')),
  R.map(R.evolve({ age: R.add(1) })),
  R.groupBy(R.prop('country'))
);

// 镜头（Lens）操作
const userNameLens = R.lensPath(['user', 'profile', 'name']);
const updateName = R.set(userNameLens, 'New Name');

// 函数组合
const getFullName = R.pipe(
  R.props(['firstName', 'lastName']),
  R.join(' ')
);

// 柯里化
const multiplyBy = R.multiply;
const double = multiplyBy(2);
const triple = multiplyBy(3);
```

### 10.4 Lodash/fp 示例

```typescript
import fp from 'lodash/fp';

// 数据处理
const processData = fp.flow(
  fp.filter('isActive'),
  fp.sortBy('createdAt'),
  fp.map(fp.pick(['id', 'name', 'email'])),
  fp.keyBy('id')
);

// 对象操作
const updateUser = fp.flow(
  fp.set('lastLogin', new Date()),
  fp.update('loginCount', fp.add(1)),
  fp.omit(['password'])
);

// 字符串处理
const slugify = fp.flow(
  fp.toLower,
  fp.trim,
  fp.replace(/\s+/g, '-'),
  fp.replace(/[^a-z0-9-]/g, '')
);
```

### 10.5 对比总结

```typescript
// 相同功能的三种实现

// === 场景：获取用户的邮箱域名 ===
interface User { email?: string; }

// fp-ts 方式（类型安全优先）
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

const getDomainFpTs = (user: User): O.Option<string> =>
  pipe(
    O.fromNullable(user.email),
    O.map(email => email.split('@')),
    O.chain(parts => parts.length > 1 ? O.some(parts[1]) : O.none)
  );

// Ramda 方式（函数组合优先）
import * as R from 'ramda';

const getDomainRamda = R.pipe(
  R.prop('email'),
  R.ifElse(
    R.isNil,
    R.always(null),
    R.pipe(
      R.split('@'),
      R.nth(1)
    )
  )
);

// Lodash/fp 方式（实用主义）
import fp from 'lodash/fp';

const getDomainLodash = fp.flow(
  fp.get('email'),
  fp.cond([
    [fp.isNil, fp.constant(null)],
    [fp.stubTrue, fp.flow(fp.split('@'), fp.nth(1))]
  ])
);

// === 选择建议 ===
// - 新项目 + TypeScript: fp-ts（最强的类型安全）
// - JavaScript 项目: Ramda（更纯粹的函数式）
// - 迁移现有项目: Lodash/fp（学习成本低）
```

---

## 总结

本文档全面覆盖了函数式编程的理论基础和实践应用：

1. **Lambda演算** 提供了函数式编程的数学基础
2. **纯函数** 使代码可预测、可测试
3. **不可变数据** 避免了意外副作用
4. **高阶函数** 实现了强大的抽象能力
5. **Functor/Applicative/Monad** 提供了类型安全的效果组合
6. **惰性求值** 优化了性能和内存使用
7. **尾递归** 避免了栈溢出
8. **Maybe/Either** 提供了类型安全的错误处理
9. **FRP** 优雅地处理异步和事件
10. **fp-ts/Ramda/Lodash** 各有优势，可根据需求选择

函数式编程不仅仅是技术选择，更是一种思维方式——通过组合纯函数来构建可靠的软件系统。

---

## 参考资源

- [Category Theory for Programmers](https://bartoszmilewski.com/2014/10/28/category-theory-for-programmers-the-preface/)
- [fp-ts 文档](https://gcanti.github.io/fp-ts/)
- [Ramda 文档](https://ramdajs.com/)
- [Lodash FP 指南](https://github.com/lodash/lodash/wiki/FP-Guide)
- [Mostly Adequate Guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide)
