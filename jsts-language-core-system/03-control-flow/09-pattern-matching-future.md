# 模式匹配（Pattern Matching）

> **形式化定义**：模式匹配（Pattern Matching）是 TC39 处于 Stage 1 的提案，旨在为 ECMAScript 提供声明式的结构解构和条件匹配语法。该特性受 Haskell、Rust、Scala 等函数式语言启发，允许基于值的**结构形状**而非仅仅是**类型**进行分支选择。当前实现主要依赖 TypeScript 的类型收窄和 ECMAScript 的解构赋值，未来可能引入原生 `match` 表达式。
>
> 对齐版本：TC39 Pattern Matching Proposal (Stage 1) | TypeScript 5.8–6.0

---

## 1. 概念定义 (Concept Definition)

### 1.1 形式化定义

TC39 提案定义了模式匹配的语法：

> *"Pattern matching is a mechanism for checking a value against a pattern and, if the match succeeds, extracting data from the value according to the pattern."*

模式匹配的数学表示：

```
match (E) {
  when P₁: S₁;
  when P₂: S₂;
  default: Sₙ;
}
≡  E matches P₁ → S₁
   E matches P₂ → S₂
   otherwise → Sₙ
```

### 1.2 概念层级图谱

```mermaid
mindmap
  root((模式匹配))
    当前实现
      解构赋值
      switch + case
      if + typeof
      TypeScript 类型收窄
    提案语法
      match 表达式
      when 子句
      嵌套模式
      守卫子句
    应用
      AST 遍历
      Redux Reducer
      状态机
      解析器
    对比
      switch
      if/else
      类型收窄
```

---

## 2. 属性与特征 (Properties & Characteristics)

### 2.1 模式匹配属性矩阵

| 特性 | 当前 JS/TS | TC39 提案 |
|------|-----------|-----------|
| 结构匹配 | 解构 + if | `when { x, y }` |
| 值匹配 | switch | `when 42` |
| 数组匹配 | 数组解构 | `when [a, b, ...rest]` |
| 守卫条件 | if | `when x if x > 0` |
| 穷尽检查 | TS 编译器 | 原生支持 |
| 表达式返回值 | 三元运算符 | match 表达式 |

---

## 3. 关系分析 (Relationship Analysis)

### 3.1 模式匹配与类型收窄的关系

```typescript
// TypeScript 类型收窄（当前最佳实践）
function process(shape: Circle | Square | Triangle) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  } else if (shape.kind === "square") {
    return shape.size ** 2;
  } else {
    return 0.5 * shape.base * shape.height;
  }
}
```

---

## 4. 机制解释 (Mechanism Explanation)

### 4.1 TC39 提案语法示例

```javascript
// 提案中的 match 语法（尚未标准化）
const result = match (shape) {
  when { kind: "circle", radius }: Math.PI * radius ** 2,
  when { kind: "square", size }: size ** 2,
  when { kind: "triangle", base, height }: 0.5 * base * height,
  default: 0
};
```

---

## 5. 论证与分析 (Argumentation & Analysis)

### 5.1 模式匹配的优势

| 优势 | 说明 |
|------|------|
| 声明式 | 描述"是什么"而非"怎么做" |
| 穷尽性 | 编译器可检查是否覆盖所有情况 |
| 可组合 | 模式可嵌套、可扩展 |
| 表达式 | match 可作为表达式返回值 |

---

## 6. 实例与示例 (Examples)

### 6.1 正例：Redux Reducer

```typescript
// 使用 TypeScript 的 Discriminated Union
type Action =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: number }
  | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment": return state + action.payload;
    case "decrement": return state - action.payload;
    case "reset": return 0;
    default: return state; // 穷尽检查确保不会执行
  }
}
```

---

## 7. 权威参考与国际化对齐 (References)

- **TC39 Pattern Matching Proposal** — <https://github.com/tc39/proposal-pattern-matching>
- **TypeScript Handbook: Narrowing** — <https://www.typescriptlang.org/docs/handbook/2/narrowing.html>

---

## 8. 思维表征总结 (Cognitive Representations)

### 8.1 模式匹配 vs switch

| 特性 | switch | 模式匹配 |
|------|--------|---------|
| 匹配方式 | 严格相等 | 结构匹配 |
| 绑定变量 | ❌ | ✅ |
| 嵌套匹配 | ❌ | ✅ |
| 守卫条件 | ❌ | ✅ |
| 表达式返回值 | ❌ | ✅ |

---

## 9. 公理化表述与形式证明 (Axiomatization & Formal Proof)

### 9.1 公理化基础

**公理 1（模式匹配的完备性）**：
> match 表达式必须覆盖所有可能的输入值，否则为不完备匹配。

### 9.2 定理与证明

**定理 1（Discriminated Union 的穷尽性）**：
> TypeScript 编译器可验证 switch/case 是否覆盖联合类型的所有成员。

*证明*：
> TypeScript 的类型系统追踪联合类型的成员，若 switch 未覆盖所有成员，编译器报 `TS2366`。
> ∎

---

## 10. 推理链与演绎分析 (Deductive Reasoning Chain)

### 10.1 演绎推理

```mermaid
graph TD
    A[match value] --> B{匹配模式1?}
    B -->|是| C[执行分支1]
    B -->|否| D{匹配模式2?}
    D -->|是| E[执行分支2]
    D -->|否| F[执行 default]
```

### 10.2 反事实推理

> **反设**：JavaScript 原生支持模式匹配。
> **推演结果**：复杂的条件分支将大幅简化，Redux 等库的代码将更声明式。
> **结论**：模式匹配是 JavaScript 语法演进的自然方向，当前可通过 TypeScript 的类型收窄模拟。

---

**参考规范**：TC39 Pattern Matching Proposal | TypeScript Handbook: Narrowing


---

## 9. 公理化表述与形式证明 (Axiomatization & Formal Proof)

### 9.1 公理化基础

**公理 1（控制流完备性）**：
> 任何程序的控制流可通过顺序、分支、循环三种基本结构组合实现（Bohm-Jacopini 定理）。

**公理 2（短路求值的最小计算）**：
> 逻辑运算符在满足结果确定性的前提下，求值最少的操作数。

**公理 3（异常传播的确定性）**：
> 异常一旦抛出，沿调用栈向上传播，直到被捕获或到达全局上下文。

### 9.2 定理与证明

**定理 1（条件分支的互斥性）**：
> 在 `if...else if...else` 链中，至多一个分支被执行。

*证明*：
> ECMA-262 规定条件分支按顺序求值，首个 truthy 条件对应的分支执行后，跳过后续所有分支。
> ∎

**定理 2（finally 的执行保证）**：
> `finally` 块中的代码无论 `try` 块如何完成（正常、return、throw），都会执行。

*证明*：
> ECMA-262 §13.15.8 规定 finally 块的完成记录优先级高于 try/catch。
> ∎

**定理 3（循环终止的必要条件）**：
> `for`、`while`、`do...while` 循环终止的必要条件是循环体内存在使循环条件最终为 falsy 的操作。

*证明*：
> 若循环条件永真且循环体内无 break/return/throw，根据 ECMA-262 §14.7，循环将无限执行。
> ∎

### 9.3 真值表：控制流运算符行为

| a | b | a && b | a || b | a ?? b | !a |
|---|---|--------|--------|--------|-----|
| true | true | true | true | true | false |
| true | false | false | true | true | false |
| false | true | false | true | false | true |
| false | false | false | false | false | true |
| null | any | null | any | any | true |
| undefined | any | undefined | any | any | true |
| 0 | "d" | "d" | 0 | 0 | true |
| "" | "d" | "d" | "" | "" | true |

---

## 10. 推理链与演绎分析 (Deductive Reasoning Chain)

### 10.1 演绎推理：从代码结构到执行路径

```mermaid
graph TD
    A[程序入口] --> B{条件判断}
    B -->|条件A| C[路径1]
    B -->|条件B| D[路径2]
    B -->|默认| E[路径3]
    C --> F[路径合并]
    D --> F
    E --> F
    F --> G[程序出口]
```

### 10.2 归纳推理：从运行时行为推导控制流问题

| 现象 | 可能原因 | 解决方案 |
|------|---------|---------|
| 意外执行分支 | 条件判断逻辑错误 | 审查布尔表达式 |
| 无限循环 | 循环条件永真 | 检查终止条件 |
| 跳过预期代码 | 提前 return/continue | 检查控制流语句 |
| 资源未释放 | 异常中断流程 | 使用 try...finally 或 using |
| 异步操作未等待 | 缺少 await | 添加 await 或 Promise 链 |

### 10.3 反事实推理

> **反设**：ECMAScript 不支持任何控制流语句（if/switch/loop/try）。
>
> **推演结果**：
>
> 1. 所有程序只能顺序执行，无法根据条件选择路径
> 2. 重复操作必须通过递归实现，存在栈溢出风险
> 3. 错误处理无法分离正常逻辑与异常逻辑
> 4. 图灵完备性仍可通过函数调用和递归保持，但表达力大幅下降
>
> **结论**：控制流语句是结构化编程的基石，提供了表达复杂算法的基本构件。

---

## 11. 形式语义说明

### 11.1 操作语义

操作语义（Operational Semantics）描述了语句如何改变程序状态：

```
(if (C) S₁ else S₂, σ) → (S₁, σ)  if eval(C, σ) = true
(if (C) S₁ else S₂, σ) → (S₂, σ)  if eval(C, σ) = false
```

其中 σ 表示程序状态（变量绑定集合）。

### 11.2 指称语义

指称语义（Denotational Semantics）将语句映射为数学函数：

```
[[if (C) S₁ else S₂]](σ) =
  [[S₁]](σ)  if [[C]](σ) = true
  [[S₂]](σ)  if [[C]](σ) = false
```

---

## 12. 性能与最佳实践

### 12.1 性能考量

| 结构 | 时间复杂度 | 空间复杂度 | 备注 |
|------|-----------|-----------|------|
| if...else | O(1) | O(1) | 条件求值 |
| switch | O(n) 最坏 | O(1) | n = case 数量 |
| try...catch | 无异常时 O(1) | O(1) | 有异常时开销大 |
| for 循环 | O(迭代次数) | O(1) | 取决于循环体 |
| Promise.then | O(1) | O(1) | 微任务队列调度 |
| async/await | O(1) | O(1) | 生成器状态机开销 |

### 12.2 最佳实践总结

```javascript
// ✅ 优先使用严格相等
if (x === 5) { /* ... */ }

// ✅ 使用 switch 进行离散值匹配
switch (status) {
  case "active": /* ... */ break;
  case "inactive": /* ... */ break;
  default: /* ... */;
}

// ✅ 使用 ?? 而非 || 进行默认值赋值
const port = config.port ?? 3000;

// ✅ 使用可选链进行安全访问
const name = user?.profile?.name;

// ✅ 使用 using 管理资源
using file = await openFile(path);

// ✅ 并行异步操作使用 Promise.all
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ✅ 生成器实现惰性序列
function* range(n) { for (let i = 0; i < n; i++) yield i; }
```

---

## 13. 思维模型总结

### 13.1 控制流选择速查矩阵

| 需求 | 推荐结构 | 替代方案 |
|------|---------|---------|
| 布尔条件分支 | if...else | 三元运算符 ?: |
| 离散值匹配 | switch | 对象映射表 |
| 计数循环 | for | while |
| 条件循环 | while / do...while | for (;;) |
| 遍历可迭代对象 | for...of | Array.forEach |
| 遍历对象属性 | for...in + hasOwn | Object.keys |
| 错误处理 | try...catch...finally | Promise.catch |
| 资源管理 | using / await using | try...finally |
| 默认值赋值 | ?? | ||（仅布尔场景）|
| 安全深层访问 | ?. | && 链 |
| 异步顺序执行 | await | Promise.then 链 |
| 异步并行执行 | Promise.all | Promise.race |
| 惰性序列 | function* | 闭包 |
| 异步数据流 | async function* | 事件流 |

---

## 14. 权威参考完整列表

| 来源 | 链接 | 相关章节 |
|------|------|---------|
| ECMA-262 | tc39.es/ecma262 | §13-14 |
| TypeScript Handbook | typescriptlang.org/docs | Control Flow Analysis |
| MDN: Control flow | developer.mozilla.org | Statements |
| MDN: Loops | developer.mozilla.org | Loops_and_iteration |
| MDN: Exception | developer.mozilla.org | try...catch |

---

**参考规范**：ECMA-262 §13-14 | MDN: Control flow | TypeScript Handbook

---

## 15. 高级主题与前沿发展

### 15.1 TC39 相关提案

| 提案 | 阶段 | 说明 |
|------|------|------|
| Pattern Matching | Stage 1 | 原生模式匹配语法 |
| Pipeline Operator | Stage 2 | 管道操作符 |> |
| Record & Tuple | Stage 2 | 不可变数据结构 |
| Decorators | Stage 3 | 装饰器语法 |

### 15.2 与其他语言的对比

| 特性 | JavaScript | Python | Rust | Haskell |
|------|-----------|--------|------|---------|
| 异常处理 | try/catch | try/except | Result<T,E> | Either |
| 资源管理 | using (ES2023) | with | RAII | bracket |
| 模式匹配 | 提案中 | match | match | 原生支持 |
| 异步 | async/await | async/await | async/await | IO Monad |

---

**参考规范**：ECMA-262 §13-14 | TC39 Proposals | MDN: Control flow
