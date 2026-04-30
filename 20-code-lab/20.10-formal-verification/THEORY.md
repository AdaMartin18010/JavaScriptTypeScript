# 形式化验证：理论基础

> **定位**：`20-code-lab/20.10-formal-verification/`
> **关联**：`10-fundamentals/10.1-language-semantics/proofs/`

---

## 一、核心理论

### 1.1 形式化方法谱系

| 方法 | 严格性 | 可扩展性 | JS/TS 应用 |
|------|--------|---------|-----------|
| **Hoare Logic** | 高 | 低 | 关键函数正确性 |
| **Model Checking** | 高 | 中 | 状态机验证 |
| **Property-Based Testing** | 中 | 高 | 随机生成测试用例 |
| **Type Systems** | 中 | 高 | TypeScript 静态检查 |
| **AI-Assisted Review** | 低 | 极高 | Copilot Code Review |

### 1.2 Hoare 三元组

```
{P} C {Q}
```

- **P**：前置条件（Precondition）
- **C**：命令/程序
- **Q**：后置条件（Postcondition）

**示例**：

```
{x > 0} x = x + 1 {x > 1}
```

---

## 二、验证方法深度对比

| 方法 | 自动化程度 | 证明保证 | 适用系统规模 | 学习曲线 | 典型工具 | JS/TS 结合方式 |
|------|-----------|---------|------------|---------|---------|---------------|
| **Model Checking** | 全自动 | 完全 | 小-中（状态爆炸限制） | 中 | TLA+, SPIN, NuSMV | 协议/状态机建模后验证 |
| **Theorem Proving** | 半自动/交互式 | 完全 | 大 | 极高 | Coq, Isabelle, Agda | 提取可执行代码或验证算法 |
| **Symbolic Execution** | 全自动 | 路径级 | 中 | 中 | KLEE, Angr, Rosette | 发现边界条件和路径约束 |
| **Abstract Interpretation** | 全自动 | 近似 | 大 | 高 | Astree, Infer | 静态分析工具底层理论 |
| **Refinement Types** | 半自动 | 类型级 | 中 | 高 | Liquid Haskell | 类型系统扩展（ research 阶段） |
| **Fuzzing** | 全自动 | 概率性 | 大 | 低 | AFL, libFuzzer | 配合 property-based testing |

---

## 三、设计原理

### 3.1 为什么 JS/TS 缺乏形式化验证

| 障碍 | 说明 | 缓解方向 |
|------|------|---------|
| 动态类型 | 运行时类型不确定 | TypeScript + 运行时检查 |
| 闭包与原型 | 复杂的状态空间 | 局部验证 + 不变性模式 |
| 宿主环境依赖 | DOM/Node API 难以建模 | 抽象规范 + Mock |

### 3.2 实用主义形式化

本项目的核心理念：在 JS/TS 生态中，**类型系统**是最实用的形式化工具。

```
TypeScript 类型检查 = 轻量级形式化验证
  - 前置条件：函数参数类型
  - 后置条件：函数返回类型
  - 不变性：readonly / const
  - 可达性分析：控制流类型收窄
```

---

## 四、代码示例：TLA+ 规格 — 分布式互斥算法

```tla
(* DistributedMutex.tla — TLA+ 规格：基于令牌的分布式互斥 *)
------------------------------- MODULE DistributedMutex -------------------------------
EXTENDS Naturals, Sequences, FiniteSets

CONSTANTS Nodes, Token

VARIABLES
  hasToken,    \* 节点是否持有令牌
  inCS,        \* 节点是否在临界区
  requestQueue \* 请求队列

TypeInvariant ==
  /\ hasToken \in [Nodes -> BOOLEAN]
  /\ inCS \in [Nodes -> BOOLEAN]
  /\ requestQueue \in Seq(Nodes)

Init ==
  /\ hasToken = [n \in Nodes |-> n = Token]  \* 初始只有一个节点持有令牌
  /\ inCS = [n \in Nodes |-> FALSE]
  /\ requestQueue = <<>>

\* 请求进入临界区
Request(n) ==
  /\ ~hasToken[n]
  /\ requestQueue' = Append(requestQueue, n)
  /\ UNCHANGED <<hasToken, inCS>>

\* 持有令牌进入临界区
EnterCS(n) ==
  /\ hasToken[n]
  /\ inCS[n] = FALSE
  /\ inCS' = [inCS EXCEPT ![n] = TRUE]
  /\ UNCHANGED <<hasToken, requestQueue>>

\* 退出临界区并传递令牌
ExitCS(n) ==
  /\ inCS[n]
  /\ IF requestQueue = <<>>
     THEN
       \* 无人等待，保留令牌
       /\ hasToken' = hasToken
       /\ requestQueue' = requestQueue
     ELSE
       \* 将令牌传给队列中的下一个节点
       /\ LET next == Head(requestQueue)
          IN hasToken' = [hasToken EXCEPT ![n] = FALSE, ![next] = TRUE]
       /\ requestQueue' = Tail(requestQueue)
  /\ inCS' = [inCS EXCEPT ![n] = FALSE]

Next ==
  \E n \in Nodes : Request(n) \/ EnterCS(n) \/ ExitCS(n)

\* 安全性：互斥 —— 任意时刻最多一个节点在临界区
Mutex ==
  Cardinality({n \in Nodes : inCS[n]}) \leq 1

\* 活性：请求最终能进入临界区（无饥饿）
NoStarvation ==
  \A n \in Nodes : hasToken[n] ~> inCS[n]

Spec == Init /\ [][Next]_<<hasToken, inCS, requestQueue>>

===================================================================================
```

**验证步骤**：

1. 安装 TLA+ Toolbox 或 `tlc` 命令行工具
2. 模型检查 `Mutex` 不变量确保安全性
3. 验证 `NoStarvation` 活性属性

---

## 五、代码示例：Coq 证明 — 列表反转正确性

```coq
(* ListRev.v — Coq 证明：列表反转保持长度 *)
Require Import List.
Import ListNotations.

(* 定义反转函数 *)
Fixpoint rev {A : Type} (l : list A) : list A :=
  match l with
  | [] => []
  | x :: xs => rev xs ++ [x]
  end.

(* 定理：反转后的列表长度与原列表相同 *)
Theorem rev_length : forall (A : Type) (l : list A),
  length (rev l) = length l.
Proof.
  intros A l.
  induction l as [| x xs IH].
  - (* 基本情况：空列表 *)
    simpl. reflexivity.
  - (* 归纳步骤：x :: xs *)
    simpl.
    rewrite app_length.
    simpl.
    rewrite IH.
    lia.
Qed.

(* 定理：反转是 involution（rev (rev l) = l） *)
Theorem rev_involutive : forall (A : Type) (l : list A),
  rev (rev l) = l.
Proof.
  intros A l.
  induction l as [| x xs IH].
  - simpl. reflexivity.
  - simpl.
    rewrite rev_app_distr.
    simpl.
    rewrite IH.
    reflexivity.
Qed.
```

**与 JS/TS 的桥梁**：通过 Coq 的 `Extract Inductive` 和 `Extraction` 机制，可将验证过的算法提取为 OCaml/Haskell/Scheme 代码，再转译为 TypeScript。

---

## 六、代码示例：Symbolic Execution 概念（TypeScript 伪代码）

```typescript
// symbolic-execution-concept.ts — 符号执行原理演示

type SymbolicValue = { type: 'symbol'; name: string } | { type: 'concrete'; value: unknown };

interface PathConstraint {
  condition: string;
  satisfiable: boolean;
}

// 符号执行引擎简化模型
class SymbolicExecutor {
  private pathConstraints: PathConstraint[] = [];

  // 符号化分支：探索两条路径
  symbolicBranch(condition: string): { trueBranch: boolean; falseBranch: boolean } {
    // 使用 SMT 求解器检查可行性（概念演示）
    const trueSat = this.checkSatisfiable([...this.pathConstraints, { condition, satisfiable: true }]);
    const falseSat = this.checkSatisfiable([...this.pathConstraints, { condition: `!(${condition})`, satisfiable: true }]);

    return { trueBranch: trueSat, falseBranch: falseSat };
  }

  private checkSatisfiable(constraints: PathConstraint[]): boolean {
    // 实际实现调用 Z3 / CVC5 等 SMT 求解器
    console.log('Checking constraints:', constraints.map((c) => c.condition));
    return true; // 简化假设
  }
}

// 应用：自动发现除零错误
function symbolicDivide(x: SymbolicValue, y: SymbolicValue): SymbolicValue {
  const executor = new SymbolicExecutor();
  const { trueBranch, falseBranch } = executor.symbolicBranch('y == 0');

  if (trueBranch) {
    console.warn('发现潜在除零错误路径！');
  }
  if (falseBranch) {
    console.log('安全路径：y != 0');
  }

  return { type: 'symbol', name: `(${x.name} / ${y.name})` };
}
```

---

## 七、代码示例：Property-Based Testing（fast-check）

```typescript
// property-based-test.spec.ts — 基于属性的测试
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// 被测函数：自定义排序
function stableSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  return [...arr].sort(compare);
}

describe('stableSort properties', () => {
  // 属性 1：输出长度与输入相同
  it('should preserve array length', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = stableSort(arr, (a, b) => a - b);
        return sorted.length === arr.length;
      })
    );
  });

  // 属性 2：输出是有序的
  it('should produce sorted output', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = stableSort(arr, (a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] < sorted[i - 1]) return false;
        }
        return true;
      })
    );
  });

  // 属性 3：排序是幂等的（idempotent）
  it('should be idempotent', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const once = stableSort(arr, (a, b) => a - b);
        const twice = stableSort(once, (a, b) => a - b);
        return JSON.stringify(once) === JSON.stringify(twice);
      })
    );
  });

  // 属性 4：包含相同的多重集合元素
  it('should preserve elements as a multiset', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = stableSort(arr, (a, b) => a - b);
        const sortedInput = [...arr].sort((a, b) => a - b);
        return JSON.stringify(sorted) === JSON.stringify(sortedInput);
      })
    );
  });
});
```

**关键点**：Property-based testing 通过随机生成输入并验证不变属性，能发现人类难以构造的边界用例（如空数组、全相同元素、极大/极小值）。

---

## 八、代码示例：TypeScript 中的轻量契约（Design by Contract）

```typescript
// contracts.ts — 运行时契约检查，作为形式化规范的可执行近似

class ContractViolation extends Error {
  constructor(kind: 'pre' | 'post' | 'invariant', message: string) {
    super(`[${kind.toUpperCase()}CONDITION] ${message}`);
  }
}

// 前置条件检查
function requires(condition: boolean, message: string): asserts condition {
  if (!condition) throw new ContractViolation('pre', message);
}

// 后置条件检查
function ensures<T>(result: T, predicate: (r: T) => boolean, message: string): T {
  if (!predicate(result)) throw new ContractViolation('post', message);
  return result;
}

// 应用示例：带契约的二分查找
function binarySearch(arr: number[], target: number): number {
  requires(arr.length > 0, 'Array must not be empty');
  requires(
    arr.every((v, i) => i === 0 || v >= arr[i - 1]),
    'Array must be sorted in ascending order'
  );

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return ensures(mid, (r) => arr[r] === target, 'Result must point to target');
    }
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return ensures(-1, (r) => !arr.includes(target), 'If not found, array must not contain target');
}

// 使用
console.log(binarySearch([1, 3, 5, 7, 9], 5)); // 2
console.log(binarySearch([1, 3, 5, 7, 9], 4)); // -1
// binarySearch([3, 1, 2], 1); // 抛出 ContractViolation
```

---

## 九、扩展阅读

- `10-fundamentals/10.1-language-semantics/theorems/`
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/FORMAL_SEMANTICS_COMPLETE.md`

---

## 十、权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **TLA+** | Leslie Lamport 时序逻辑规格语言 | [lamport.azurewebsites.net/tla/tla.html](https://lamport.azurewebsites.net/tla/tla.html) |
| **Learn TLA+** | TLA+ 入门教程 | [learntla.com](https://www.learntla.com/) |
| **Coq** | 交互式定理证明器 | [coq.inria.fr](https://coq.inria.fr/) |
| **Software Foundations** | Coq 基础教材（免费） | [softwarefoundations.cis.upenn.edu](https://softwarefoundations.cis.upenn.edu/) |
| **Isabelle/HOL** | 高阶逻辑定理证明器 | [isabelle.in.tum.de](https://isabelle.in.tum.de/) |
| **KLEE** | LLVM 符号执行引擎 | [klee.github.io](https://klee.github.io/) |
| **CompCert** | 经过验证的 C 编译器 | [compcert.org](https://compcert.org/) |
| **Formal Methods Wiki** | 形式化方法资源汇总 | [formalmethods.wikidot.com](https://formalmethods.wikidot.com/) |
| **Z3 Theorem Prover** | 微软出品的 SMT 求解器 | [github.com/Z3Prover/z3](https://github.com/Z3Prover/z3) |
| **Dafny** | 支持验证的编程语言 | [github.com/dafny-lang/dafny](https://github.com/dafny-lang/dafny) |
| **fast-check** | JS/TS 属性测试库 | [dubzzz.github.io/fast-check.github.com/](https://dubzzz.github.io/fast-check.github.com/) |
| **JSVerify** | JavaScript 属性测试库 | [jsverify.github.io](https://jsverify.github.io/) |
| **Rust Kani** | Rust 代码模型检查器 | [github.com/model-checking/kani](https://github.com/model-checking/kani) |
| **TLA+ in JS** | JavaScript 状态机验证案例 | [hillelwayne.com/post/tla-in-js/](https://hillelwayne.com/post/tla-in-js/) |
| **Practical TLA+** | 实用 TLA+ 编程书籍 | [lamport.azurewebsites.net/tla/practical-tla.html](https://lamport.azurewebsites.net/tla/practical-tla.html) |
| **TypeScript Type Challenges** | 类型系统形式化练习 | [github.com/type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) |
| **Hoare Logic** | 霍尔逻辑维基百科 | [en.wikipedia.org/wiki/Hoare_logic](https://en.wikipedia.org/wiki/Hoare_logic) |
| **Microsoft Boogie** | 中间验证语言 | [github.com/boogie-org/boogie](https://github.com/boogie-org/boogie) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
