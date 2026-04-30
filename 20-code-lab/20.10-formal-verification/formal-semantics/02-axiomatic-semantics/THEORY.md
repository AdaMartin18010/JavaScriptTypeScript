# 公理语义学

> **定位**：`20-code-lab/20.10-formal-verification/formal-semantics/02-axiomatic-semantics`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块从形式语义学角度精确描述程序正确性，解决自然语言规范中的歧义理解问题。通过 Hoare 三元组与最弱前置条件（Weakest Precondition）建立程序逻辑与程序行为之间的形式化桥梁。

### 1.2 形式化基础

Hoare 三元组记为 `{P} C {Q}`，其中 `P` 为前置条件，`C` 为命令，`Q` 为后置条件。其含义为：若程序状态满足 `P`，执行 `C` 后终止的状态必满足 `Q`。最弱前置条件 `wp(C, Q)` 定义为使 `{P} C {Q}` 成立的最弱断言 `P`。关键规则：

```
{wp(C, Q)} C {Q}    (wp 是最弱的)
{P} C {Q}  ↔  P ⇒ wp(C, Q)
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Hoare 三元组 | `{P} C {Q}` 形式化正确性陈述 | hoare-triples.md |
| 最弱前置条件 | 保证后置条件的最弱先决断言 | wp-calculus.md |
| 循环不变式 | 循环每次迭代前后保持的断言 | invariants.md |

---

## 二、设计原理

### 2.1 为什么存在

自然语言规范容易产生歧义，导致不同实现行为不一致。公理语义通过程序逻辑精确定义程序在逻辑层面的行为，使正确性证明成为可能。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Hoare 逻辑 | 直观、模块化 | 并发支持弱 | 顺序程序验证 |
| 分离逻辑 | 支持指针/共享状态 | 推理复杂 | 堆操作验证 |
| 动态逻辑 | 支持模态性质 | 工具支持少 | 交互式系统 |

### 2.3 与相关技术的对比

| 维度 | Hoare 逻辑 | 分离逻辑 (Separation Logic) | 动态逻辑 | WP 演算 |
|------|------------|----------------------------|----------|---------|
| 状态模型 | 全局状态 | 局部堆 + 分离合取 | Kripke 结构 | 谓词转换器 |
| 指针别名 | 困难 | 原生支持 | 中等 | 中等 |
| 自动化程度 | 中 | 中 | 低 | 高 |
| 工具代表 | KeY, Boogie | VeriFast, Iris | KIV | Why3, Dafny |
| 并发支持 | 需扩展 | 原生支持 | 原生支持 | 有限 |
| 典型应用 | 教学方法论 | 操作系统内核 | 协议验证 | 工业级程序验证 |

与操作语义对比：公理语义关注逻辑正确性，操作语义关注执行步骤。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 公理语义学 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：基于断言的运行时契约检查（契约式设计）

```typescript
// contracts.ts — 运行时 Hoare 风格契约检查，可运行 (Node.js / 浏览器)

class ContractViolation extends Error {
  constructor(kind: 'pre' | 'post' | 'invariant', message: string) {
    super(`Contract violation (${kind}): ${message}`);
  }
}

function requires<T>(predicate: (arg: T) => boolean, message?: string) {
  return (arg: T): T => {
    if (!predicate(arg)) {
      throw new ContractViolation('pre', message ?? 'Precondition failed');
    }
    return arg;
  };
}

function ensures<T, R>(
  fn: (arg: T) => R,
  predicate: (result: R, arg: T) => boolean,
  message?: string
): (arg: T) => R {
  return (arg: T) => {
    const result = fn(arg);
    if (!predicate(result, arg)) {
      throw new ContractViolation('post', message ?? 'Postcondition failed');
    }
    return result;
  };
}

function invariant<T>(
  obj: T,
  predicate: (o: T) => boolean,
  message?: string
): T {
  if (!predicate(obj)) {
    throw new ContractViolation('invariant', message ?? 'Invariant violated');
  }
  return obj;
}

// ===== 演示：带契约的账户转账 =====
interface Account {
  balance: number;
}

// 前置条件：金额必须为正；后置条件：余额非负
const transferOut = ensures(
  (amount: number) => {
    requires((a: number) => a > 0, 'Amount must be positive')(amount);
    return amount;
  },
  (result, amount) => result >= 0,
  'Balance must not be negative'
);

function makeTransfer(account: Account, amount: number): Account {
  const validAmount = transferOut(amount);
  const newAccount = { balance: account.balance - validAmount };
  return invariant(newAccount, (a) => a.balance >= 0, 'Account invariant');
}

// 合法调用
console.log(makeTransfer({ balance: 100 }, 30)); // { balance: 70 }

// 非法调用（违反前置条件）
try {
  makeTransfer({ balance: 100 }, -10);
} catch (e) {
  console.log((e as Error).message); // Contract violation (pre): Amount must be positive
}

// 非法调用（违反后置条件/不变式）
try {
  makeTransfer({ balance: 100 }, 200);
} catch (e) {
  console.log((e as Error).message); // Contract violation (invariant): Account invariant
}

// 循环不变式示例：数组求和
function sum(arr: number[]): number {
  requires((a: number[]) => a.length >= 0)(arr);
  let s = 0;
  let i = 0;
  // 循环不变式：s === sum(arr[0..i))
  while (i < arr.length) {
    s = s + arr[i];
    i = i + 1;
    // 检查不变式（简化版，仅检查 i 范围）
    invariant({ s, i }, (st) => st.i >= 0 && st.i <= arr.length, 'Loop range invariant');
  }
  // 终止时：i === arr.length ⇒ s === sum(arr[0..arr.length)) === sum(arr)
  return s;
}

console.log('Sum:', sum([1, 2, 3, 4])); // 10
```

### 3.2 完整循环不变式：二分查找

```typescript
// binary-search.ts — 带完整形式化注释的二分查找实现

function binarySearch(arr: number[], target: number): number {
  // 前置条件：数组已排序
  // requires: forall i, j. 0 <= i < j < arr.length => arr[i] <= arr[j]

  let low = 0;
  let high = arr.length - 1;

  // 循环不变式：
  // 1. 0 <= low <= high + 1 <= arr.length
  // 2. target 若存在于原数组，则必在 [low, high] 区间内
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const val = arr[mid];

    if (val === target) {
      // 后置条件：返回有效索引且 arr[return] === target
      return mid;
    } else if (val < target) {
      low = mid + 1; // 保持不变式：target 不在 [low, mid]
    } else {
      high = mid - 1; // 保持不变式：target 不在 [mid, high]
    }
  }

  // 终止时：low > high，结合不变式可知 target 不在数组中
  // 后置条件：返回 -1 表示未找到
  return -1;
}

// 变体函数验证（查找插入位置）
function lowerBound(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length; // 注意：high 初始为 arr.length

  // 循环不变式：结果在 [low, high) 中
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  // 终止时：low === high，为第一个 >= target 的位置
  // 后置条件：0 <= return <= arr.length
  //           forall i < return. arr[i] < target
  //           forall i >= return. arr[i] >= target
  return low;
}

console.log(binarySearch([1, 3, 5, 7, 9], 5)); // 2
console.log(lowerBound([1, 3, 5, 7, 9], 6)); // 3
```

### 3.3 数组边界验证的形式化契约

```typescript
// array-contracts.ts — 基于契约的数组安全操作

class SafeArray<T> {
  #data: T[];

  constructor(data: T[]) {
    this.#data = [...data];
  }

  // { arr !== null }
  // 后置: 返回值 === arr.length
  get length(): number {
    return this.#data.length;
  }

  // { 0 <= index < this.length }
  // 后置: 返回值 === this.#data[index]
  get(index: number): T {
    requires((i: number) => i >= 0 && i < this.length, 'Index out of bounds')(index);
    return this.#data[index];
  }

  // { 0 <= index <= this.length }
  // 后置: this.length === old(this.length) + 1
  //       this.#data[index] === item
  insert(index: number, item: T): void {
    requires((i: number) => i >= 0 && i <= this.length, 'Invalid insert position')(index);
    this.#data.splice(index, 0, item);
  }

  // { this.length > 0 }
  // 后置: 返回值 === this.#data[0] 且 this.length === old(this.length) - 1
  shift(): T {
    requires((_: unknown) => this.length > 0, 'Cannot shift from empty array')({});
    return this.#data.shift()!;
  }
}

// 使用示例
const safe = new SafeArray([10, 20, 30]);
console.log(safe.get(1)); // 20
try {
  safe.get(5);
} catch (e) {
  console.log((e as Error).message); // Contract violation (pre): Index out of bounds
}
```

### 3.4 分离逻辑的简化演示：资源所有权

```typescript
// ownership.ts — 运行时资源所有权检查（分离逻辑的 JS 隐喻）

class OwnershipError extends Error {}

class OwnedResource<T> {
  #value: T | null;
  #owner: symbol;
  #freed = false;

  constructor(value: T) {
    this.#value = value;
    this.#owner = Symbol('owner');
  }

  // 借用检查：获取只读引用（不转移所有权）
  borrow<R>(fn: (val: T) => R, caller: symbol): R {
    if (this.#freed) throw new OwnershipError('Use after free');
    if (caller !== this.#owner) throw new OwnershipError('Borrow checker: invalid owner');
    return fn(this.#value!);
  }

  // 转移所有权（分离逻辑中的 "*" 隐喻）
  transfer(newOwner: symbol): symbol {
    if (this.#freed) throw new OwnershipError('Double free');
    const oldOwner = this.#owner;
    (this as any).#owner = newOwner;
    return oldOwner;
  }

  // 释放资源（独占操作）
  free(caller: symbol): void {
    if (this.#freed) throw new OwnershipError('Double free');
    if (caller !== this.#owner) throw new OwnershipError('Free by non-owner');
    this.#freed = true;
    this.#value = null;
  }
}

// 演示
const ownerA = Symbol('A');
const res = new OwnedResource({ handle: 'file-1' });

res.borrow((v) => console.log(v.handle), ownerA); // OK

const ownerB = Symbol('B');
res.transfer(ownerB);
try {
  res.borrow((v) => console.log(v), ownerA); // 错误：所有权已转移
} catch (e) {
  console.log((e as Error).message);
}
res.free(ownerB); // OK
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 形式语义只是学术游戏 | 形式语义是编译器优化和验证的基础 |
| 运行时断言等于形式验证 | 运行时断言仅检测错误，无法证明不存在错误 |
| Hoare 逻辑只能验证整数程序 | 现代工具（Dafny、Why3）支持数组、指针、并发 |

### 3.3 扩展阅读

- [Hoare: An Axiomatic Basis for Computer Programming (CACM 1969)](https://doi.org/10.1145/363235.363259)
- [Dijkstra: Guarded Commands, Nondeterminacy and Formal Derivation of Programs (CACM 1975)](https://doi.org/10.1145/360933.360975)
- [Software Foundations: Verifiable C / Separation Logic](https://softwarefoundations.cis.upenn.edu/)
- [Dafny: A Language and Program Verifier](https://dafny.org/)
- [ACSL: ANSI/ISO C Specification Language](https://frama-c.com/acsl.html)
- [Why3: A Platform for Deductive Program Verification](https://why3.lri.fr/)
- [VST (Verified Software Toolchain)](https://vst.cs.princeton.edu/) — 基于 Coq 的 C 程序验证工具链
- [NASA PVS Specification and Verification System](https://pvs.csl.sri.com/)
- [Iris: Higher-Order Concurrent Separation Logic](https://iris-project.org/)
- [Microsoft Boogie](https://github.com/boogie-org/boogie) — 中间验证语言与工具
- [KeY Project](https://www.key-project.org/) — Java 程序验证平台
- [ Separation Logic Tutorial — John Reynolds](https://www.cs.cmu.edu/~jcr/seplogic.pdf)
- [The Science of Programming — David Gries](https://www.springer.com/gp/book/9780387964805)
- `20.10-formal-verification/formal-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
