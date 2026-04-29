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
