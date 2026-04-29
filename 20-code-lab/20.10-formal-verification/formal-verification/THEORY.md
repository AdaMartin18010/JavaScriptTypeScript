# 形式化验证 — 理论基础

## 1. 形式化方法概述

形式化验证是使用数学方法证明系统正确性的技术。与测试（发现错误）不同，形式化验证可以**证明错误不存在**（在模型范围内）。

---

## 2. 主要技术路径

### 2.1 模型检测（Model Checking）

- 枚举系统所有可能状态
- 验证时序逻辑公式（LTL、CTL）
- 工具：SPIN、TLA+、NuSMV
- 局限：状态爆炸问题

### 2.2 定理证明（Theorem Proving）

- 基于逻辑公理系统手动或半自动推导
- 交互式证明助手：Coq、Isabelle、Agda、Lean
- 适用：复杂算法、密码学协议

### 2.3 抽象解释（Abstract Interpretation）

- 通过抽象域近似程序语义
- 自动静态分析：Astrée、Infer
- 适用：运行时错误检测（空指针、数组越界）

### 2.4 SMT 求解

- 可满足性模理论（Satisfiability Modulo Theories）
- 工具：Z3、CVC5、Yices
- 适用：约束求解、符号执行

---

## 3. 形式化方法对比

| 方法 | 自动化程度 | 适用规模 | 学习曲线 | 典型工具 |
|------|-----------|----------|----------|----------|
| 模型检测 | 全自动 | 中小规模 | 中 | SPIN、TLA+、NuSMV |
| 定理证明 | 半自动 | 任意规模 | 高 | Coq、Isabelle、Lean |
| 抽象解释 | 全自动 | 大规模 | 低 | Astrée、Infer、Frama-C |
| SMT 求解 | 全自动 | 中小规模 | 中 | Z3、CVC5、Yices |

---

## 4. 在 JS/TS 中的应用

### 4.1 TypeScript 类型系统作为轻量级形式化验证

TypeScript 的结构子类型系统可捕获大量运行时错误：

```typescript
// 编译期排除 null 解引用
function safeDivide(a: number, b: number): number | undefined {
  if (b === 0) return undefined;
  return a / b;
}

const result = safeDivide(10, 0);
// result 类型为 number | undefined
// 直接访问 result.toFixed(1) 会编译错误
if (result !== undefined) {
  console.log(result.toFixed(1)); // ✅ 安全
}
```

### 4.2 Refinement Types（精化类型）

通过 branded types / nominal typing 模拟精化类型：

```typescript
// 定义正数类型
declare const PositiveBrand: unique symbol;
type Positive = number & { [PositiveBrand]: true };

function assertPositive(n: number): Positive {
  if (n <= 0) throw new Error(`Expected positive, got ${n}`);
  return n as Positive;
}

function sqrt(n: Positive): number {
  return Math.sqrt(n);
}

sqrt(4);           // ❌ 编译错误：Argument of type 'number' is not assignable to parameter of type 'Positive'.
sqrt(assertPositive(4)); // ✅
```

**使用模板字面量类型验证格式：**

```typescript
type Email = `${string}@${string}.${string}`;

function sendEmail(to: Email, subject: string): void {
  console.log(`Sending to ${to}: ${subject}`);
}

sendEmail('alice@example.com', 'Hello'); // ✅
sendEmail('invalid-email', 'Hello');      // ❌ 编译错误
```

### 4.3 Property-based Testing（基于属性的测试）

```typescript
import * as fc from 'fast-check';

// 测试数组排序的不变量
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);

    // 属性 1：结果长度不变
    expect(sorted.length).toBe(arr.length);

    // 属性 2：结果有序
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!);
    }

    // 属性 3：是原数组的排列（多重集合相等）
    expect(sorted.toSorted()).toEqual(arr.toSorted());
  })
);
```

**测试函数不变量：**

```typescript
// 测试 reverse(reverse(x)) === x
fc.assert(
  fc.property(fc.array(fc.anything()), (arr) => {
    expect(arr.reverse().reverse()).toEqual(arr);
  })
);

// 测试加法交换律
fc.assert(
  fc.property(fc.integer(), fc.integer(), (a, b) => {
    expect(a + b).toBe(b + a);
  })
);
```

### 4.4 符号执行与 SMT 求解

使用 Z3 JavaScript 绑定进行约束求解：

```typescript
import { init } from 'z3-solver';

async function proveArrayBounds() {
  const { Context } = await init();
  const Z3 = Context('main');

  const n = Z3.Int.const('n');
  const i = Z3.Int.const('i');

  // 证明：如果 0 <= i < n，则访问 a[i] 不会越界
  const solver = new Z3.Solver();
  solver.add(Z3.And(i.ge(0), i.lt(n)));

  // 检查是否可能 i >= n（即越界）
  solver.push();
  solver.add(i.ge(n));
  const outOfBounds = await solver.check();
  console.log('Can i >= n?', outOfBounds); // unsat（不可能）
  solver.pop();

  // 检查是否可能 i < 0
  solver.add(i.lt(0));
  const negative = await solver.check();
  console.log('Can i < 0?', negative); // unsat（不可能）
}

proveArrayBounds();
```

---

## 5. 代码示例

### 5.1 TLA+ 规范片段

```tla
---- MODULE DistributedLock ----
EXTENDS Naturals, FiniteSets

CONSTANTS Nodes, MaxClock
VARIABLES clock, owner, requestQueue

TypeInvariant ==
  /\ clock \in [Nodes -> 0..MaxClock]
  /\ owner \in Nodes \union {None}
  /\ requestQueue \in Seq(Nodes)

Safety ==
  (* 任意时刻最多一个节点持有锁 *)
  owner /= None => \A n \in Nodes \ {owner}: clock[n] < clock[owner]

Liveness ==
  (* 请求锁的节点最终能获得锁 *)
  \A n \in Nodes:
    [](n \in Range(requestQueue) => <>(owner = n))
====
```

### 5.2 Lean 4 证明片段

```lean4
-- 证明列表反转是自逆的：reverse (reverse xs) = xs
inductive List (α : Type) where
  | nil : List α
  | cons : α → List α → List α

def append : List α → List α → List α
  | .nil, ys => ys
  | .cons x xs, ys => .cons x (append xs ys)

def reverse : List α → List α
  | .nil => .nil
  | .cons x xs => append (reverse xs) (.cons x .nil)

theorem reverse_append {α} (xs ys : List α) :
  reverse (append xs ys) = append (reverse ys) (reverse xs) := by
  induction xs with
  | nil => simp [reverse, append]
  | cons x xs ih => simp [reverse, append, ih]; admit

theorem reverse_involutive {α} (xs : List α) : reverse (reverse xs) = xs := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [reverse, reverse_append, ih, append]
```

### 5.3 Coq 基础证明

```coq
(* 证明加法交换律：forall n m, n + m = m + n *)
Require Import Arith.

Lemma plus_n_O : forall n, n = n + 0.
Proof.
  induction n.
  - reflexivity.
  - simpl. rewrite <- IHn. reflexivity.
Qed.

Lemma plus_Sn_m : forall n m, S (n + m) = n + S m.
Proof.
  intros n m. induction n.
  - reflexivity.
  - simpl. rewrite IHn. reflexivity.
Qed.

Theorem plus_comm : forall n m, n + m = m + n.
Proof.
  intros n m. induction n.
  - simpl. symmetry. apply plus_n_O.
  - simpl. rewrite IHn. apply plus_Sn_m.
Qed.
```

---

## 6. 在真实系统中的应用

### AWS TLS 形式化验证

AWS 使用 SAW (Software Analysis Workbench) 和 Coq 验证 s2n TLS 实现：

```c
// s2n 中经形式化验证的 HMAC 实现核心不变量
// 证明：HMAC(k, m) 对任意长度消息 m 均满足密码学安全规约
// 工具链：SAW + Cryptol → LLVM bitcode → 定理证明
```

### seL4 微内核

seL4 使用 Isabelle/HOL 完整形式化验证了操作系统的功能正确性：

- 约 10,000 行 C 代码 ↔ 200,000+ 行 Isabelle 证明脚本
- 证明覆盖：功能正确性、二进制验证、信息流安全

---

## 7. 权威参考

- [TLA+ Home Page](https://lamport.azurewebsites.net/tla/tla.html) — Leslie Lamport 官方
- [Learn TLA+](https://learntla.com/) — Hillel Wayne 撰写的 TLA+ 入门教程
- [Software Foundations](https://softwarefoundations.cis.upenn.edu/) — Coq 形式化验证教材
- [Certified Programming with Dependent Types (CPDT)](http://adam.chlipala.net/cpdt/) — Adam Chlipala 的 Coq 高级教程
- [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/) — Lean 官方教材
- [Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/nng4) — 交互式 Lean 入门游戏
- [Microsoft Z3](https://github.com/Z3Prover/z3) — SMT 求解器
- [Z3 Guide](https://microsoft.github.io/z3guide/) — Z3 官方教程与 Playground
- [Infer by Meta](https://fbinfer.com/) — 静态分析工具
- [fast-check](https://fast-check.dev/) — JS/TS 属性测试库
- [seL4 Proofs](https://sel4.systems/About/seL4-proofs.pml) — seL4 形式化验证项目
- [AWS s2n Formal Verification](https://aws.github.io/s2n-tls/usage-guide/ch15-formal-verification.html) — AWS TLS 形式化验证实践

## 8. 与相邻模块的关系

- **40-type-theory-formal**: 类型理论的形式化基础
- **41-formal-semantics**: 程序语义的形式化定义
- **79-compiler-design**: 编译器的形式化验证
