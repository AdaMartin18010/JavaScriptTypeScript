# 形式化验证 — 架构设计

## 1. 架构概述

本模块实现了形式化方法的简化工具集，包括 Hoare 逻辑验证器、类型检查器和属性测试框架。展示如何用数学方法保证程序正确性。架构采用"规范→验证→求解"三段式流水线，将程序源码与形式化规约作为输入，通过 weakest precondition 计算和符号执行推导验证条件，最终交由 SMT 求解器判定可满足性。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           输入层 (Input Layer)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ Source Code  │  │Specification │  │   Test Or    │                   │
│  │   (AST)      │  │ (Pre/Post/   │  │  Property    │                   │
│  │              │  │  Invariant)  │  │              │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        验证引擎层 (Verification Engine)                   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │   Hoare Triple       │  │   Symbolic Executor  │  │   Property   │  │
│  │      Parser          │  │   (Path Exploration) │  │   Generator  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘  │
│             │                         │                     │          │
│             ▼                         ▼                     ▼          │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │ Weakest Precondition │  │   Path Condition     │  │   Shrinker   │  │
│  │     Calculator       │  │   (PC) Accumulator   │  │   (Delta)    │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘  │
└─────────────┼─────────────────────────┼─────────────────────┼──────────┘
              │                         │                     │
              ▼                         ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       求解层 (Solver Layer)                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    SMT Solver Interface (Z3 / CVC5)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │  Boolean   │  │  Integer   │  │   Array    │  │  BitVec   │  │   │
│  │  │  Theory    │  │  Theory    │  │  Theory    │  │  Theory   │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       输出层 (Output Layer)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Verified    │  │Counterexample│  │  Coverage    │                   │
│  │   (Safe)     │  │   (Unsafe)   │  │    Report    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 规范解析器

| 组件 | 职责 | 输入 | 输出 |
|------|------|------|------|
| Hoare Triple Parser | `{P} C {Q}` 前置/后置条件解析 | 注释或 DSL 字符串 | AST 形式的规约树 |
| Invariant Detector | 循环不变式推断 | 循环体 AST | 候选不变式集合 |
| Assertion Checker | 运行时断言验证 | 断言语句 + 运行时状态 | 布尔结果 + 反例状态 |

### 3.2 验证引擎

| 组件 | 职责 | 关键技术 | 复杂度 |
|------|------|----------|--------|
| Weakest Precondition Calculator | 最弱前置条件计算 | Dijkstra  weakest precondition | O(n) |
| Symbolic Executor | 符号执行引擎，探索所有路径 | 路径条件累积、约束求解 | 路径指数级 |
| SMT Interface | 与 Z3 求解器的交互接口 | SMT-LIB 2.0 协议 | 依赖求解器 |

### 3.3 测试生成器

| 组件 | 职责 | 关键技术 | 代表工具 |
|------|------|----------|----------|
| Property Generator | 基于类型的随机输入生成 | 组合生成、有界枚举 | fast-check, Hypothesis |
| Shrinker | 反例最小化，定位最小失败输入 | 二分搜索、结构分解 | fast-check |
| Coverage Analyzer | 形式化覆盖度评估 | 路径覆盖、边界值覆盖 | Istanbul (辅助) |

## 4. 数据流

```
Program + Specification → Parser → Verification Engine → SMT Solver → Result (Verified/Counterexample)
```

## 5. 技术栈对比

| 特性 | 本实验室 | Dafny | Coq | TLA+ | Z3 |
|------|---------|-------|-----|------|-----|
| 验证方法 | Hoare + 符号执行 + 属性测试 | 自动定理证明 | 交互式证明 | 模型检测 | SMT 求解 |
| 自动化程度 | 高 | 高 | 低（需人工引导） | 中 | 高 |
| 学习曲线 | 低 | 中 | 高 | 中 | 中 |
| 代码集成 | TypeScript 内嵌 | 专用语言 | 专用语言 | PlusCal/TLA+ | 多语言绑定 |
| 适用阶段 | 运行时 + 单元级 | 方法级 | 系统级 | 协议级 | 约束级 |
| 工业应用 | 教学/原型 | AWS CMC | CompCert | Amazon/AWS | 微软/多家 |

## 6. 代码示例

### 6.1 Hoare 逻辑验证器核心接口

```typescript
// formal-verification/src/core/HoareLogic.ts
interface HoareTriple {
  precondition: Predicate;   // P
  command: Command;          // C
  postcondition: Predicate;  // Q
}

interface Predicate {
  evaluate(state: State): boolean;
  toSMT(): string;           // SMT-LIB 表达式
}

interface Command {
  type: 'assign' | 'seq' | 'if' | 'while' | 'skip';
  children?: Command[];
}

class WeakestPreconditionCalculator {
  /**
   * 计算命令 C 关于后置条件 Q 的最弱前置条件
   * wp(C, Q) = 使得执行 C 后 Q 成立的最弱条件
   */
  computeWp(command: Command, post: Predicate): Predicate {
    switch (command.type) {
      case 'assign': {
        // wp(x := E, Q) = Q[x/E]
        return post.substitute(command.variable, command.expression);
      }
      case 'seq': {
        // wp(C1;C2, Q) = wp(C1, wp(C2, Q))
        const wpC2 = this.computeWp(command.children![1], post);
        return this.computeWp(command.children![0], wpC2);
      }
      case 'if': {
        // wp(if B then C1 else C2, Q) = (B ⇒ wp(C1,Q)) ∧ (¬B ⇒ wp(C2,Q))
        const wpThen = this.computeWp(command.thenBranch, post);
        const wpElse = this.computeWp(command.elseBranch, post);
        return Predicate.and(
          Predicate.implies(command.condition, wpThen),
          Predicate.implies(Predicate.not(command.condition), wpElse)
        );
      }
      case 'while': {
        // wp(while B inv I do C, Q) = I ∧ (I ∧ B ⇒ wp(C,I)) ∧ (I ∧ ¬B ⇒ Q)
        // 需要用户提供循环不变式 I
        const invariant = command.invariant;
        const wpBody = this.computeWp(command.body, invariant);
        return Predicate.and(
          invariant,
          Predicate.and(
            Predicate.implies(Predicate.and(invariant, command.condition), wpBody),
            Predicate.implies(Predicate.and(invariant, Predicate.not(command.condition)), post)
          )
        );
      }
      default:
        return post;
    }
  }
}
```

### 6.2 属性测试框架接口

```typescript
// formal-verification/src/property/PropertyTest.ts
interface Arbitrary<T> {
  generate(): T;
  shrink(value: T): Iterable<T>;
}

function forall<T>(arb: Arbitrary<T>, predicate: (x: T) => boolean): void {
  for (let i = 0; i < 100; i++) {
    const value = arb.generate();
    if (!predicate(value)) {
      // 尝试 shrink 到最小反例
      let minimal = value;
      for (const smaller of arb.shrink(value)) {
        if (!predicate(smaller)) {
          minimal = smaller;
          break;
        }
      }
      throw new Error(`Property failed for: ${JSON.stringify(minimal)}`);
    }
  }
}

// 示例：验证数组反转的对合性质
forall(arrayOf(int), (arr) => {
  return arraysEqual(reverse(reverse(arr)), arr);
});
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 验证方法 | Hoare 逻辑 + 符号执行 | 教学直观性 |
| SMT 后端 | Z3（可选）| 工业级求解器 |
| 输入生成 | 基于类型 + 自定义策略 | 高覆盖率 |

## 8. 质量属性

- **严谨性**: 基于数学逻辑的严格验证
- **可教育性**: 每一步验证过程可展示
- **实用性**: 可发现测试难以覆盖的边界情况

## 9. 参考链接

- [Hoare Logic - Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/logic-hoare/) — Hoare 逻辑权威综述
- [Z3 Theorem Prover](https://github.com/Z3Prover/z3) — 微软研究院出品的 SMT 求解器
- [Dafny](https://github.com/dafny-lang/dafny) — 支持自动验证的编程语言
- [TLA+ Home Page](https://lamport.azurewebsites.net/tla/tla.html) — Leslie Lamport 的 TLA+ 官方页面
- [Property-Based Testing with fast-check](https://dubzzz.github.io/fast-check.github.com/) — JavaScript 属性测试框架
- [The Science of Deep Specification (Software Foundations)](https://softwarefoundations.cis.upenn.edu/) — 形式化验证经典教材
