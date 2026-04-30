---
dimension: 综合
sub-dimension: Formal verification
created: 2026-04-28
---

# CATEGORY.md — Formal Verification

## 模块归属声明

本模块归属 **「综合」** 维度，聚焦形式化验证（Formal Verification）核心概念与工程实践。

## 包含内容

- 霍尔逻辑（Hoare Logic）与程序正确性证明
- 基于属性的测试（Property-Based Testing）
- 有界模型检验（Bounded Model Checking）
- 精化类型（Refinement Types）与轻量级验证

## 子模块目录结构

| 子模块 | 说明 | 关键概念 |
|--------|------|----------|
| `hoare-logic/` | 霍尔逻辑与前置/后置条件 | `{P} C {Q}`、循环不变式、最弱前置条件 |
| `property-based-testing/` | 基于属性的测试 | 不变式、生成器、Shrink、fast-check |
| `bounded-model-checking/` | 有界模型检验 | SAT/SMT、状态爆炸、反例生成 |
| `program-correctness-proofs/` | 程序正确性证明 | 归纳证明、终止性、部分正确性 |
| `refinement-types/` | 精化类型 | 依赖类型子集、Liquid Types、运行时断言 |

## 代码示例

### 霍尔逻辑：循环不变式验证

```typescript
// hoare-sum.ts — 用循环不变式证明求和正确性
/**
 * 前置条件: n >= 0
 * 后置条件: result == sum(i=0..n-1, i)
 * 循环不变式: result == sum(i=0..i-1, i) && i <= n
 */
function sumUpTo(n: number): number {
  if (n < 0) throw new Error('Precondition violated: n >= 0');

  let result = 0;
  let i = 0;

  // 初始化: result=0, i=0 → sum(空集)=0 ✓
  while (i < n) {
    // 维持不变式: result += i; i++
    result += i;
    i++;
    // 不变式保持: result == sum(0..i-1)
  }

  // 终止: i == n, result == sum(0..n-1)
  return result;
}

// 运行时断言作为轻量级验证
function assertInvariant(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Invariant violated: ${msg}`);
}
```

### 霍尔逻辑：数组二分查找正确性

```typescript
// hoare-binary-search.ts — 二分查找的霍尔三元组验证
/**
 * 前置条件: arr 已按升序排列，且包含可比较元素
 * 后置条件: 若返回值 >= 0，则 arr[返回值] === target
 *           若返回值 === -1，则 target 不在 arr 中
 * 循环不变式: 若 target 在 arr 中，则 target 在 arr[lo..hi) 范围内
 */
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length;

  // 不变式: target ∈ arr → target ∈ arr[lo..hi)
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      lo = mid + 1; // target 在右半部
    } else {
      hi = mid;     // target 在左半部
    }
  }

  // 终止: lo === hi，target 不在 arr[lo..hi) 中
  return -1;
}

// 运行时断言验证
function testBinarySearch() {
  const arr = [1, 3, 5, 7, 9, 11];
  assertInvariant(binarySearch(arr, 5) === 2, 'finds existing element');
  assertInvariant(binarySearch(arr, 4) === -1, 'returns -1 for missing');
  assertInvariant(binarySearch([], 1) === -1, 'handles empty array');
}
```

### 基于属性的测试：fast-check

```typescript
// property-test.ts — 用数学性质替代示例测试
import fc from 'fast-check';

// 性质 1: 排序的幂等性 sort(sort(arr)) === sort(arr)
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    const once = [...arr].sort((a, b) => a - b);
    const twice = [...once].sort((a, b) => a - b);
    return JSON.stringify(once) === JSON.stringify(twice);
  })
);

// 性质 2: 数组反转的自反性 reverse(reverse(arr)) ≈ arr
fc.assert(
  fc.property(fc.array(fc.anything()), (arr) => {
    const rev = [...arr].reverse();
    const back = [...rev].reverse();
    return JSON.stringify(arr) === JSON.stringify(back);
  })
);

// 性质 3: 自定义数据生成器
interface User {
  id: number;
  email: string;
}
const userArbitrary = fc.record({
  id: fc.integer({ min: 1 }),
  email: fc.string({ unit: 'grapheme-ascii', minLength: 3 }).map((s) => `${s}@example.com`),
});

// 性质 4: 数学性质——加法交换律
fc.assert(
  fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a)
);

// 性质 5: 函数性质——filter 的幂等性
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    const isPositive = (x: number) => x > 0;
    const once = arr.filter(isPositive);
    const twice = once.filter(isPositive);
    return JSON.stringify(once) === JSON.stringify(twice);
  })
);
```

### 有界模型检验：状态机验证

```typescript
// state-machine-bmc.ts — 模拟有界模型检验思想
interface State {
  balance: number;
  locked: boolean;
}

type Action = { type: 'deposit'; amount: number } | { type: 'withdraw'; amount: number } | { type: 'lock' } | { type: 'unlock' };

function transition(s: State, a: Action): State {
  switch (a.type) {
    case 'deposit':
      return { ...s, balance: s.balance + a.amount };
    case 'withdraw':
      if (s.locked) throw new Error('Account locked');
      if (s.balance < a.amount) throw new Error('Insufficient funds');
      return { ...s, balance: s.balance - a.amount };
    case 'lock':
      return { ...s, locked: true };
    case 'unlock':
      return { ...s, locked: false };
  }
}

// BMC: 枚举所有长度 <= N 的动作序列，检查安全属性
function bmcCheck(initial: State, actions: Action[], maxDepth: number): boolean {
  // 安全属性: balance >= 0 始终成立
  if (initial.balance < 0) return false;
  if (maxDepth === 0) return true;

  for (const a of actions) {
    try {
      const next = transition(initial, a);
      if (!bmcCheck(next, actions, maxDepth - 1)) return false;
    } catch {
      // 异常 = 规约被违反
      return false;
    }
  }
  return true;
}
```

### 精化类型：运行时契约

```typescript
// refinement-types.ts — 轻量级精化类型模拟

type PositiveInt = number & { __brand: 'PositiveInt' };
function PositiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) {
    throw new TypeError(`Expected positive integer, got ${n}`);
  }
  return n as PositiveInt;
}

type NonEmptyArray<T> = [T, ...T[]];
function NonEmptyArray<T>(arr: T[]): NonEmptyArray<T> {
  if (arr.length === 0) throw new TypeError('Array must not be empty');
  return arr as NonEmptyArray<T>;
}

// 使用契约增强的类型安全
function factorial(n: PositiveInt): PositiveInt {
  return n <= 1 ? (1 as PositiveInt) : PositiveInt(n * factorial(PositiveInt(n - 1)));
}

function head<T>(arr: NonEmptyArray<T>): T {
  return arr[0];
}
```

### 纯函数与引用透明性

```typescript
// purity.ts — 形式化验证的基础：纯函数

// 引用透明：相同输入始终产生相同输出，无副作用
function pureAdd(a: number, b: number): number {
  return a + b;
}

// 非引用透明：依赖外部状态
let counter = 0;
function impureAdd(a: number, b: number): number {
  counter++; // 副作用
  return a + b + counter;
}

// 不可变数据结构：保证引用透明
function immutableUpdate<T>(arr: readonly T[], index: number, value: T): readonly T[] {
  return arr.map((item, i) => (i === index ? value : item));
}

const original = [1, 2, 3] as const;
const updated = immutableUpdate(original, 1, 99);
console.log(original); // [1, 2, 3] — 未改变
console.log(updated);  // [1, 99, 3]

// 等式推理：pureAdd(1, 2) 可安全替换为 3，不影响程序语义
// 形式化验证依赖此性质进行代数化简
```

### 轻量级验证：契约式设计

```typescript
// contracts.ts — 运行时契约（Design by Contract）

class Contract {
  static requires(cond: boolean, msg: string) {
    if (!cond) throw new Error(`Precondition failed: ${msg}`);
  }
  static ensures<T>(result: T, cond: (r: T) => boolean, msg: string): T {
    if (!cond(result)) throw new Error(`Postcondition failed: ${msg}`);
    return result;
  }
  static invariant<T>(obj: T, cond: (o: T) => boolean, msg: string) {
    if (!cond(obj)) throw new Error(`Invariant violated: ${msg}`);
  }
}

class BankAccount {
  private balance = 0;

  deposit(amount: number) {
    Contract.requires(amount > 0, 'amount must be positive');
    this.balance += amount;
    Contract.invariant(this, (a) => a.balance >= 0, 'balance >= 0');
  }

  withdraw(amount: number) {
    Contract.requires(amount > 0, 'amount must be positive');
    Contract.requires(amount <= this.balance, 'insufficient funds');
    this.balance -= amount;
    Contract.invariant(this, (a) => a.balance >= 0, 'balance >= 0');
  }

  getBalance(): number {
    return Contract.ensures(
      this.balance,
      (b) => b >= 0,
      'balance must be non-negative'
    );
  }
}
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| fast-check | 文档 | [dubzzz.github.io/fast-check](https://dubzzz.github.io/fast-check/) — 属性测试库 |
| Z3 Theorem Prover | 工具 | [github.com/Z3Prover/z3](https://github.com/Z3Prover/z3) — Microsoft SMT 求解器 |
| Hoare Logic (Wikipedia) | 百科 | [en.wikipedia.org/wiki/Hoare_logic](https://en.wikipedia.org/wiki/Hoare_logic) |
| Liquid Haskell | 项目 | [ucsd-progsys.github.io/liquidhaskell](https://ucsd-progsys.github.io/liquidhaskell/) — 精化类型 |
| TLA+ | 工具 | [lamport.azurewebsites.net/tla/tla.html](https://lamport.azurewebsites.net/tla/tla.html) — Leslie Lamport 规约语言 |
| Coq Proof Assistant | 工具 | [coq.inria.fr](https://coq.inria.fr) — 交互式定理证明 |
| CompCert | 项目 | [compcert.org](https://compcert.org) — 经形式化验证的 C 编译器 |
| seL4 | 项目 | [sel4.systems](https://sel4.systems) — 经形式化验证的操作系统内核 |
| Spin Model Checker | 工具 | [spinroot.com](https://spinroot.com) — 经典模型检验工具 |
| NASA JPL 编码规范 | 标准 | [lars-lab.jpl.nasa.gov/JPL_Coding_Standard_C.pdf](https://lars-lab.jpl.nasa.gov/JPL_Coding_Standard_C.pdf) — 高可靠软件规范 |
| Dafny | 工具 | [github.com/dafny-lang/dafny](https://github.com/dafny-lang/dafny) — Microsoft 程序验证语言 |
| Why3 | 工具 | [why3.lri.fr](https://why3.lri.fr/) — 程序验证平台 |
| Frama-C | 工具 | [frama-c.com](https://frama-c.com/) — C 程序分析框架 |
| CBMC | 工具 | [github.com/diffblue/cbmc](https://github.com/diffblue/cbmc) — C 有界模型检验器 |
| K Framework | 工具 | [runtimeverification.com/blog/k-framework](https://runtimeverification.com/blog/k-framework/) — 语义框架 |
| Alloy Analyzer | 工具 | [alloytools.org](https://alloytools.org/) — 轻量级形式化建模 |
| Property-Based Testing (QuickCheck) | 论文 | [Koen Claessen, John Hughes](https://dl.acm.org/doi/10.1145/351240.351266) — QuickCheck 原始论文 |
| Design by Contract (Eiffel) | 百科 | [en.wikipedia.org/wiki/Design_by_contract](https://en.wikipedia.org/wiki/Design_by_contract) |
| TypeScript Functional Programming | 指南 | [gcanti.github.io/fp-ts/](https://gcanti.github.io/fp-ts/) — fp-ts 函数式编程库 |
| JSCheck (Douglas Crockford) | 工具 | [github.com/douglascrockford/JSCheck](https://github.com/douglascrockford/JSCheck) — JS 属性测试 |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 bounded-model-checking.test.ts
- 📄 bounded-model-checking.ts
- 📄 formal-verification.test.ts
- 📄 hoare-logic.test.ts
- 📄 hoare-logic.ts
- 📄 index.ts
- 📄 program-correctness-proofs.test.ts
- 📄 program-correctness-proofs.ts
- 📄 property-based-testing.test.ts
- 📄 property-based-testing.ts
- 📄 refinement-types.test.ts
- ... 等 23 个条目

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。

---

*最后更新: 2026-04-29*
