# Formal Semantics (41-formal-semantics)

本模块提供操作语义与公理语义的简化可运行模型。

## 目录

- `00-operational-semantics/` - 小步/大步操作语义
- `02-axiomatic-semantics/` - Hoare 逻辑与最弱前置条件

## 关联模块

- `20.10-formal-verification/type-theory-formal/` - 类型理论
- `20.10-formal-verification/formal-verification/` - 形式化验证

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `index.ts`
- `operational-semantics.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

---

## 语义学方法论对比

| 特性 | 操作语义（Operational） | 指称语义（Denotational） | 公理语义（Axiomatic） |
|------|----------------------|------------------------|-------------------|
| **核心思想** | 定义程序执行的步骤序列 | 将程序映射到数学对象（函数） | 用逻辑断言描述程序前后条件 |
| **关注点** | "如何"执行（How） | "是什么"（What） | "正确性"（Correctness） |
| **表示形式** | 转移关系 / 抽象机 | 语义函数 ⟦·⟧ : 语法 → 数学域 | Hoare 三元组 {P} C {Q} |
| **可执行性** | ✅ 可直接解释执行 | ❌ 纯数学定义 | ⚠️ 需定理证明器辅助 |
| **组合性** | 较弱（依赖具体机器） | 强（数学函数天然可组合） | 中等（规则可组合推导） |
| **证明难度** | 中等 | 高（需构造数学模型） | 中等（需逻辑推理） |
| **适用场景** | 语言实现、类型安全证明 | 程序分析、编译器验证 | 程序验证、契约式编程 |
| **代表工作** | Plotkin — SOS | Scott & Strachey | Hoare、Dijkstra |
| **现代工具** | PLT Redex、K Framework | Coq（数学域建模）、Lean | Why3、Dafny、Frama-C |

### 语义学层次关系

```
语法（Syntax）
    ↓ 解释
操作语义 ──→ 抽象机状态转移
    ↓ 抽象                     ↓ 验证
指称语义 ←── 数学函数        公理语义
    ↓ 证明等价
指称 ⟺ 操作 的可靠性（Soundness）与完备性（Completeness）
```

## 代码示例：小步操作语义（Small-Step Semantics）

小步语义将程序执行分解为原子步骤，每一步对应一个状态转移。

```typescript
// src/operational-semantics.ts

// ==================== 抽象语法树 ====================

type Expr =
  | { kind: 'Num'; value: number }
  | { kind: 'Add'; left: Expr; right: Expr }
  | { kind: 'Mul'; left: Expr; right: Expr }
  | { kind: 'Var'; name: string }
  | { kind: 'Assign'; name: string; expr: Expr }
  | { kind: 'Seq'; first: Expr; second: Expr }
  | { kind: 'If'; cond: Expr; thenBranch: Expr; elseBranch: Expr }
  | { kind: 'While'; cond: Expr; body: Expr }
  | { kind: 'Skip' }

// 环境：变量名到值的映射
type Env = Map<string, number>

// 配置：表达式 + 当前环境
type Config = { expr: Expr; env: Env }

// ==================== 语法构造器 ====================

const Num = (value: number): Expr => ({ kind: 'Num', value })
const Add = (left: Expr, right: Expr): Expr => ({ kind: 'Add', left, right })
const Mul = (left: Expr, right: Expr): Expr => ({ kind: 'Mul', left, right })
const Var = (name: string): Expr => ({ kind: 'Var', name })
const Assign = (name: string, expr: Expr): Expr => ({ kind: 'Assign', name, expr })
const Seq = (first: Expr, second: Expr): Expr => ({ kind: 'Seq', first, second })
const If = (cond: Expr, thenBranch: Expr, elseBranch: Expr): Expr => ({
  kind: 'If', cond, thenBranch, elseBranch
})
const While = (cond: Expr, body: Expr): Expr => ({ kind: 'While', cond, body })
const Skip = (): Expr => ({ kind: 'Skip' })

// ==================== 小步转移关系（→） ====================

/**
 * 单步转移函数：Config → Config | null
 * 返回 null 表示无法继续转移（终止或 stuck）
 */
function step(config: Config): Config | null {
  const { expr, env } = config

  switch (expr.kind) {
    // ── 值已经是范式，无法继续 ──
    case 'Num':
      return null

    // ── 变量查找 ──
    case 'Var': {
      const value = env.get(expr.name)
      if (value === undefined) {
        throw new Error(`Unbound variable: ${expr.name}`)
      }
      return { expr: Num(value), env }
    }

    // ── 加法：小步归约 ──
    case 'Add': {
      // 左操作数可规约？
      const leftStep = step({ expr: expr.left, env })
      if (leftStep) {
        return { expr: Add(leftStep.expr, expr.right), env: leftStep.env }
      }
      // 右操作数可规约？
      const rightStep = step({ expr: expr.right, env })
      if (rightStep) {
        return { expr: Add(expr.left, rightStep.expr), env: rightStep.env }
      }
      // 两者都是值，执行加法
      if (expr.left.kind === 'Num' && expr.right.kind === 'Num') {
        return { expr: Num(expr.left.value + expr.right.value), env }
      }
      throw new Error('Invalid Add expression')
    }

    // ── 乘法：与加法类似 ──
    case 'Mul': {
      const leftStep = step({ expr: expr.left, env })
      if (leftStep) {
        return { expr: Mul(leftStep.expr, expr.right), env: leftStep.env }
      }
      const rightStep = step({ expr: expr.right, env })
      if (rightStep) {
        return { expr: Mul(expr.left, rightStep.expr), env: rightStep.env }
      }
      if (expr.left.kind === 'Num' && expr.right.kind === 'Num') {
        return { expr: Num(expr.left.value * expr.right.value), env }
      }
      throw new Error('Invalid Mul expression')
    }

    // ── 赋值：先规约右侧表达式 ──
    case 'Assign': {
      const exprStep = step({ expr: expr.expr, env })
      if (exprStep) {
        return { expr: Assign(expr.name, exprStep.expr), env: exprStep.env }
      }
      if (expr.expr.kind === 'Num') {
        const newEnv = new Map(env)
        newEnv.set(expr.name, expr.expr.value)
        return { expr: Skip(), env: newEnv }
      }
      throw new Error('Invalid Assign expression')
    }

    // ── 序列：先执行第一个，执行完后执行第二个 ──
    case 'Seq': {
      if (expr.first.kind === 'Skip') {
        return { expr: expr.second, env }
      }
      const firstStep = step({ expr: expr.first, env })
      if (firstStep) {
        return { expr: Seq(firstStep.expr, expr.second), env: firstStep.env }
      }
      return null
    }

    // ── 条件分支 ──
    case 'If': {
      const condStep = step({ expr: expr.cond, env })
      if (condStep) {
        return { expr: If(condStep.expr, expr.thenBranch, expr.elseBranch), env: condStep.env }
      }
      if (expr.cond.kind === 'Num') {
        return { expr: expr.cond.value !== 0 ? expr.thenBranch : expr.elseBranch, env }
      }
      throw new Error('Invalid If condition')
    }

    // ── While 循环展开为 If ──
    case 'While': {
      return {
        expr: If(
          expr.cond,
          Seq(expr.body, While(expr.cond, expr.body)),
          Skip()
        ),
        env
      }
    }

    // ── Skip 是终止状态 ──
    case 'Skip':
      return null
  }
}

// ==================== 多步执行与追踪 ====================

/**
 * 多步归约：反复应用 step 直到终止
 */
function evaluate(config: Config): { final: Config; trace: Config[] } {
  const trace: Config[] = [config]
  let current = config

  while (true) {
    const next = step(current)
    if (!next) break
    trace.push(next)
    current = next
  }

  return { final: current, trace }
}

/**
 * 格式化打印配置
 */
function printConfig(config: Config): string {
  const envStr = Array.from(config.env.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
  return `⟨${printExpr(config.expr)}, {${envStr}}⟩`
}

function printExpr(expr: Expr): string {
  switch (expr.kind) {
    case 'Num': return `${expr.value}`
    case 'Var': return expr.name
    case 'Add': return `(${printExpr(expr.left)} + ${printExpr(expr.right)})`
    case 'Mul': return `(${printExpr(expr.left)} * ${printExpr(expr.right)})`
    case 'Assign': return `${expr.name} := ${printExpr(expr.expr)}`
    case 'Seq': return `${printExpr(expr.first)}; ${printExpr(expr.second)}`
    case 'If': return `if ${printExpr(expr.cond)} then ${printExpr(expr.thenBranch)} else ${printExpr(expr.elseBranch)}`
    case 'While': return `while ${printExpr(expr.cond)} do ${printExpr(expr.body)}`
    case 'Skip': return 'skip'
  }
}

// ==================== 示例执行 ====================

// 示例：计算阶乘的 while 循环
// n := 5; fact := 1; while n > 0 do (fact := fact * n; n := n - 1)
const factorialProgram = Seq(
  Assign('n', Num(5)),
  Seq(
    Assign('fact', Num(1)),
    While(
      Var('n'),  // 在简化语义中，非零即真
      Seq(
        Assign('fact', Mul(Var('fact'), Var('n'))),
        Assign('n', Add(Var('n'), Num(-1)))
      )
    )
  )
)

// 执行并打印追踪
const result = evaluate({ expr: factorialProgram, env: new Map() })
console.log('=== Small-Step Operational Semantics Trace ===')
result.trace.forEach((cfg, i) => {
  console.log(`Step ${i}: ${printConfig(cfg)}`)
})
console.log(`\nFinal: ${printConfig(result.final)}`)
// 预期结果：fact = 120

// 示例：展示 confluence（汇合性）
// (2 + 3) * (4 + 5) 可以从左或从右开始规约，最终结果相同
const confluenceExample = Mul(
  Add(Num(2), Num(3)),
  Add(Num(4), Num(5))
)
const confluenceResult = evaluate({ expr: confluenceExample, env: new Map() })
console.log('\n=== Confluence Example ===')
confluenceResult.trace.forEach((cfg, i) => {
  console.log(`Step ${i}: ${printConfig(cfg)}`)
})
```

### 小步 vs 大步语义对比

| 特性 | 小步语义（Small-Step） | 大步语义（Big-Step / Natural） |
|------|----------------------|------------------------------|
| **转移粒度** | 单条指令 | 整个表达式/语句 |
| **中间状态** | 暴露所有中间状态 | 直接到最终结果 |
| **非终止行为** | 可建模无限循环 | 无法区分 stuck 与 diverge |
| **并发建模** | 方便（交错语义） | 困难 |
| **证明技术** | 结构归纳 + 共归纳 | 结构归纳 |
| **工具映射** | 解释器、步进调试器 | 编译器求值 |

## 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

## 权威外部资源

- [Operational Semantics — Wikipedia](https://en.wikipedia.org/wiki/Operational_semantics)
- [Denotational Semantics — Wikipedia](https://en.wikipedia.org/wiki/Denotational_semantics)
- [Plotkin — A Structural Approach to Operational Semantics (SOS)](https://homepages.inf.ed.ac.uk/gdp/publications/sos_jlap.pdf)
- [Winskel — The Formal Semantics of Programming Languages (MIT Press)](https://mitpress.mit.edu/9780262731034/)
- [Pierce — Types and Programming Languages (TAPL)](https://www.cis.upenn.edu/~bcpierce/tapl/)
- [Software Foundations — Vol 2: Programming Language Foundations](https://softwarefoundations.cis.upenn.edu/plf-current/index.html)
- [K Framework — Runtime Verification](https://kframework.org/)
- [PLT Redex — Brown University](https://redex.racket-lang.org/)

---

> 📅 理论深化更新：2026-04-27
