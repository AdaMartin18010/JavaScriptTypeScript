---
title: 语言核心实验室
description: "JavaScript/TypeScript 语言核心实验：变量系统、类型、控制流、函数与执行模型"
---

# 语言核心 (00-09)

> 语言核心实验室覆盖 JavaScript/TypeScript 语言最基础的机制。通过动手实验，你将深入理解变量系统、类型系统、控制流、函数、执行模型等核心概念。

## 学习路径

```mermaid
flowchart LR
    A[变量系统] --> B[类型与运算符]
    B --> C[控制流]
    C --> D[函数与闭包]
    D --> E[对象与原型]
    E --> F[执行模型]
    F --> G[异步编程]
    G --> H[模块化]
    style A fill:#4ade80,color:#000
    style H fill:#f472b6,color:#000
```

## 核心实验模块

| 编号 | 模块 | 实验数 | 核心概念 |
|------|------|--------|----------|
| **00** | language-core | 20 | 变量提升、作用域、this绑定 |
| **01** | ecmascript-evolution | 23 | ES2020-ES2025新特性 |
| **02** | design-patterns | 24 | 创建型/结构型/行为型模式 |
| **03** | concurrency | 6 | Event Loop、Promise、Async/Await |
| **04** | data-structures | 6 | 数组、链表、树、图 |
| **05** | algorithms | 6 | 排序、搜索、动态规划 |
| **06** | architecture-patterns | 4 | MVC、MVVM、微前端 |
| **07** | testing | 5 | 单元测试、TDD、Mock |
| **08** | performance | 5 | 时间复杂度、内存优化 |
| **09** | real-world-examples | 7 | 真实项目案例分析 |

## 关键实验预览

### 变量系统实验室

```javascript
// 实验：理解 let/const/var 的差异
console.log(a); // undefined（变量提升）
var a = 1;

console.log(b); // ReferenceError（TDZ）
let b = 2;

// 实验：块级作用域
for (var i = 0; i &lt; 3; i++) &#123;
  setTimeout(() => console.log(i), 100); // 3, 3, 3
&#125;

for (let j = 0; j &lt; 3; j++) &#123;
  setTimeout(() => console.log(j), 100); // 0, 1, 2
&#125;
```

### 类型系统实验室

```typescript
// 实验：结构类型 vs 名义类型
interface Point &#123; x: number; y: number &#125;
interface Vector &#123; x: number; y: number &#125;

const p: Point = &#123; x: 1, y: 2 &#125;;
const v: Vector = p; // ✅ TypeScript 中合法

// 实验：类型收窄
function process(value: string | number) &#123;
  if (typeof value === 'string') &#123;
    value.toUpperCase(); // ✅ string 方法
  &#125; else &#123;
    value.toFixed(2);    // ✅ number 方法
  &#125;
&#125;
```

### 闭包实验室

```javascript
// 实验：闭包与私有状态
function createCounter() &#123;
  let count = 0; // 私有变量
  return &#123;
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
  &#125;;
&#125;

const counter1 = createCounter();
const counter2 = createCounter();
counter1.increment(); // 1
counter1.increment(); // 2
counter2.increment(); // 1（独立状态）
```

## 实验环境

每个实验都包含：

- **环境准备**：所需的工具和依赖
- **核心代码**：可直接运行的示例
- **验证步骤**：确认理解的检查清单
- **扩展挑战**：深入探索的进阶任务
- **参考解答**：实验完成后的对照答案

## 常见困惑与解答

### var 为什么还存在？

`var` 在 ES6 之前是唯一的变量声明方式。保留它的原因：

- 向后兼容数十亿行现有代码
- 函数作用域在某些场景下有用（如循环中的回调）
- 全局变量自动成为 `window` 属性（某些库依赖此行为）

**建议**：新项目一律使用 `let`/`const`，仅在有明确需求时使用 `var`。

### this 绑定为什么如此复杂？

JavaScript 的 `this` 绑定规则按优先级排序：

1. **new 绑定**：`new Foo()` → `this = 新对象`
2. **显式绑定**：`call/apply/bind` → `this = 指定对象`
3. **隐式绑定**：`obj.method()` → `this = obj`
4. **默认绑定**：`method()` → `this = window/undefined`（严格模式）
5. **箭头函数**：继承外层 `this`，不可改变

```javascript
const obj = {
  name: 'obj',
  regular() { console.log(this.name) },
  arrow: () => console.log(this.name)
}

obj.regular()  // 'obj'
obj.arrow()    // undefined（继承全局 this）

const fn = obj.regular
fn()           // undefined（默认绑定）
```

### 为什么 `typeof null === 'object'`？

这是 JavaScript 的原始 bug。在语言最早的实现中，值类型标记（type tag）用低三位表示：

- `000` = 对象
- `null` 的机器码是 `0x00`，低三位也是 `000`

修复此 bug 会破坏大量现有代码，因此在 TC39 中被标记为「不可修复的历史包袱」。

## 参考资源

- [语言语义导读](/fundamentals/language-semantics) — 语言特性的理论解析
- [类型系统导读](/fundamentals/type-system) — TypeScript 类型系统基础
- [执行模型导读](/fundamentals/execution-model) — 代码运行时的底层机制
- [对象模型深度专题](/object-model/) — 原型链与面向对象
- [JavaScript 语法速查表](/cheatsheets/javascript-cheatsheet) — 核心语法速查

---

 [← 返回代码实验室首页](./)
