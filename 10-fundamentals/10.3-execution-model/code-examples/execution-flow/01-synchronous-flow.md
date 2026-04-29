# 同步执行流（Synchronous Flow）

> **形式化定义**：同步执行流是 JavaScript 最基本的执行模式，代码按照书写顺序**逐行执行**，每条语句完成后才执行下一条。在同步模式下，调用栈（Call Stack）依次压入和弹出执行上下文，形成严格的**后进先出（LIFO）**执行顺序。ECMA-262 §9.4 定义了执行上下文栈的管理规则。
>
> 对齐版本：ECMAScript 2025 (ES16) §9.4 | TypeScript 5.8–6.0

---

## 1. 概念定义 (Concept Definition)

### 1.1 形式化定义

同步执行的数学表示：

```
同步执行: stmt₁; stmt₂; ...; stmtₙ
语义: eval(stmt₁) → eval(stmt₂) → ... → eval(stmtₙ)
```

### 1.2 概念层级图谱

```mermaid
mindmap
  root((同步执行流))
    基本特征
      顺序执行
      阻塞调用
      调用栈管理
    执行模型
      语句级顺序
      表达式求值
      函数调用链
    对比
      异步执行
      并发模型
```

---

## 2. 属性与特征 (Properties & Characteristics)

### 2.1 同步 vs 异步对比矩阵

| 特性 | 同步 | 异步 |
|------|------|------|
| 执行顺序 | 严格顺序 | 回调/事件驱动 |
| 阻塞性 | 阻塞 | 非阻塞 |
| 错误处理 | try/catch | .catch() / 回调错误参数 |
| 代码可读性 | 线性 | 回调嵌套或 async/await |
| 适用场景 | CPU 计算 | I/O 操作 |

---

## 3. 关系分析 (Relationship Analysis)

### 3.1 同步调用链

```mermaid
graph TD
    A[main()] --> B[fn1()]
    B --> C[fn2()]
    C --> D[fn3()]
    D --> E[return]
    E --> F[return fn2]
    F --> G[return fn1]
    G --> H[return main]
```

---

## 4. 机制解释 (Mechanism Explanation)

### 4.1 同步执行流程

```mermaid
flowchart TD
    A[语句 1] --> B[执行完成]
    B --> C[语句 2]
    C --> D[执行完成]
    D --> E[语句 3]
    E --> F[执行完成]
```

---

## 5. 论证与分析 (Argumentation & Analysis)

### 5.1 同步执行的优缺点

| 优点 | 缺点 |
|------|------|
| 代码直观、易调试 | I/O 操作阻塞主线程 |
| 错误处理简单 | 无法并发处理多个任务 |
| 状态一致性好 | 用户体验差（UI 卡顿） |

---

## 6. 实例与示例 (Examples)

### 6.1 正例：同步计算

```javascript
function calculate() {
  const a = 1 + 2;      // 3
  const b = a * 3;      // 9
  const c = b - 4;      // 5
  return c;
}

console.log(calculate()); // 5
```

### 6.2 调用栈可视化

```javascript
function first() {
  second();
}
function second() {
  third();
}
function third() {
  // 在错误对象中捕获当前调用栈
  const stack = new Error('trace').stack;
  console.log(stack);
}

first();
// 输出（简化）：
// Error: trace
//     at third (<anonymous>:9:17)
//     at second (<anonymous>:6:3)
//     at first (<anonymous>:3:3)
//     at <anonymous>:13:1
```

### 6.3 同步 I/O 阻塞演示（Node.js）

```javascript
const fs = require('node:fs');

console.time('sync-read');
// 同步读取阻塞事件循环直到文件读取完成
try {
  const data = fs.readFileSync('/tmp/large-file.txt', 'utf-8');
  console.log(`Read ${data.length} bytes`);
} catch (err) {
  console.error('Read failed:', err.message);
}
console.timeEnd('sync-read');
// 在文件读取期间，事件循环中的其他回调（如定时器、I/O 事件）均被阻塞
```

### 6.4 CPU 密集型同步任务的性能陷阱

```javascript
// 同步长时间计算会阻塞主线程
function heavyComputation(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}

// 在浏览器中这将导致 UI 冻结
// 在 Node.js 中将阻塞所有并发请求处理
console.time('heavy');
const result = heavyComputation(1e8);
console.timeEnd('heavy');
console.log('Result:', result);

// 改进方案：使用 setImmediate / MessageChannel / Worker 将计算拆分为异步块
```

---

## 7. 权威参考与国际化对齐 (References)

- **ECMA-262 §9.4** — Execution Contexts
- **MDN: Event Loop** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop>
- **MDN: Call Stack** — <https://developer.mozilla.org/en-US/docs/Glossary/Call_stack>
- **V8 Blog — Stack Traces** — <https://v8.dev/docs/stack-trace-api>
- **Node.js Docs — Event Loop** — <https://nodejs.org/en/learn/asynchronous-work/event-loop-its-role>
- **JavaScript.Info — Event Loop** — <https://javascript.info/event-loop>
- **ECMA-262 §9.4** — 执行上下文栈管理: <https://tc39.es/ecma262/#sec-execution-contexts>
- **Philip Roberts: What the heck is the event loop?** — <https://www.youtube.com/watch?v=8aGhZQkoFbQ> (JSConf 2014)

---

## 8. 思维表征总结 (Cognitive Representations)

### 8.1 同步执行模型

```
同步执行: A → B → C → D
每个步骤完成后才执行下一步
```

---

## 9. 公理化表述与形式证明 (Axiomatization & Formal Proof)

### 9.1 公理化基础

**公理 1（顺序执行）**：
> 同步代码按书写顺序执行，前一条语句完成后才执行后一条。

### 9.2 定理与证明

**定理 1（同步执行的可预测性）**：
> 给定相同的输入，同步代码总是产生相同的输出和副作用顺序。

*证明*：
> 同步代码没有并发竞争条件，执行顺序完全由代码结构决定。
> ∎

---

## 10. 推理链与演绎分析 (Deductive Reasoning Chain)

### 10.1 演绎推理

```mermaid
graph TD
    A[同步函数调用] --> B[压入调用栈]
    B --> C[执行函数体]
    C --> D[弹出调用栈]
    D --> E[返回结果]
```

### 10.2 反事实推理

> **反设**：JavaScript 没有同步执行模式。
> **推演结果**：所有操作都需异步回调，最简单的计算也变得复杂。
> **结论**：同步执行是编程语言的基础，异步是对同步的扩展。

---

**参考规范**：ECMA-262 §9.4 | MDN: Event Loop
