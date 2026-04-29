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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 形式语义只是学术游戏 | 形式语义是编译器优化和验证的基础 |
| 运行时断言等于形式验证 | 运行时断言仅检测错误，无法证明不存在错误 |

### 3.3 扩展阅读

- [Hoare: An Axiomatic Basis for Computer Programming (CACM 1969)](https://doi.org/10.1145/363235.363259)
- [Software Foundations: Verifiable C / Separation Logic](https://softwarefoundations.cis.upenn.edu/)
- [Dafny: A Language and Program Verifier](https://dafny.org/)
- [ACSL: ANSI/ISO C Specification Language](https://frama-c.com/acsl.html)
- `20.10-formal-verification/formal-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
