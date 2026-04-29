# 变量系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/02-variables`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块探讨变量声明、作用域和闭包机制，解决变量生命周期管理与内存泄漏预防的问题。涵盖 `var`、`let`、`const` 的语义差异与最佳实践。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 作用域链 | 变量解析的层级查找机制 | scope-chain.ts |
| TDZ | 暂时性死区，let/const 的访问限制 | temporal-dead-zone.ts |
| 闭包 | 函数与其词法环境的组合 | closures.ts |

---

## 二、设计原理

### 2.1 为什么存在

变量是程序状态的基本单元。理解作用域、提升和闭包机制，是掌握 JavaScript 异步编程和模块化设计的必要前提。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| const 优先 | 防止意外重赋值 | 需要区分可变性 | 绝大多数场景 |
| let 必要时 | 允许合法变更 | 需要更多审查 | 循环与累加 |

### 2.3 特性对比表：`var` vs `let` vs `const`

| 特性 | `var` | `let` | `const` |
|------|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为 `undefined`） | 是（处于 TDZ） | 是（处于 TDZ） |
| 重复声明 | 允许 | 不允许（SyntaxError） | 不允许（SyntaxError） |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 暂时性死区 (TDZ) | 无 | 有 | 有 |
| 全局对象属性 | 会成为 `window`/`global` 属性 | 不会 | 不会 |
| 推荐使用 | ❌ 遗留代码 | ✅ 需要重新赋值时 | ✅ 默认首选 |

### 2.4 与相关技术的对比

与其他语言作用域对比：JS 函数作用域 + 提升机制较为独特。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 变量系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：作用域、提升与 TDZ

```typescript
// 1. var 的函数作用域与提升
function varDemo() {
  console.log(x); // undefined（提升但未初始化）
  var x = 10;
  if (true) {
    var x = 20;   // 覆盖外层 x，因为 var 是函数作用域
  }
  console.log(x); // 20
}

// 2. let/const 的块级作用域
function letDemo() {
  // console.log(y); // ReferenceError: Cannot access 'y' before initialization（TDZ）
  let y = 10;
  if (true) {
    let y = 20;   // 独立的块级变量
    console.log(y); // 20
  }
  console.log(y); // 10
}

// 3. const 只保证引用不变
const config = { apiUrl: 'https://api.example.com' };
config.apiUrl = 'https://api.v2.com'; // ✅ 允许，修改的是对象内容
// config = {}; // ❌ TypeError: Assignment to constant variable

// 4. TDZ 在循环中的典型表现
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 10); // 0, 1, 2（块级绑定每次迭代新建）
}
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 10); // 3, 3, 3（共享同一个 var i）
}
```

### 3.3 闭包与私有状态封装

```typescript
// 闭包实现模块化私有状态
function createCounter(initial = 0) {
  let count = initial; // 私有变量，外部无法直接访问

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    },
    reset() {
      count = initial;
      return count;
    },
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.getValue());  // 12
console.log(counter.count);       // undefined（私有）
```

### 3.4 闭包在异步编程中的应用

```typescript
// 使用闭包保持异步操作中的迭代状态
function fetchWithRetry(url: string, maxRetries = 3) {
  let attempt = 0;

  async function doFetch(): Promise<Response> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 8000); // 指数退避
      await new Promise(r => setTimeout(r, delay));
      return doFetch(); // 递归重试，闭包保持 attempt 状态
    }
  }

  return doFetch();
}
```

### 3.5 内存泄漏场景与预防

```typescript
// 内存泄漏模式 1：意外的全局变量
function leakyFunction() {
  // 非严格模式下，未声明的变量会成为全局属性
  // 'use strict' 可防止此问题
  leakedVar = 'I am global'; // 泄漏！
}

// 内存泄漏模式 2：闭包引用 DOM 节点
function createLeakyHandler() {
  const hugeData = new Array(1_000_000).fill('x');
  const element = document.getElementById('button');

  element?.addEventListener('click', () => {
    console.log(hugeData.length); // hugeData 和 element 被闭包长期引用
  });
}

// ✅ 修复：弱引用或及时清理
function createSafeHandler() {
  const hugeData = new Array(1_000_000).fill('x');
  const element = document.getElementById('button');

  const handler = () => {
    console.log(hugeData.length);
  };

  element?.addEventListener('click', handler);

  // 清理函数
  return () => {
    element?.removeEventListener('click', handler);
  };
}

// 内存泄漏模式 3：定时器未清理
function startPolling(callback: () => void) {
  const timer = setInterval(callback, 1000);

  // 返回清理函数，由调用方在组件卸载时调用
  return () => clearInterval(timer);
}
```

### 3.6 现代私有字段（#private）

```typescript
class SecureBankAccount {
  // 真正私有的字段，外部完全不可访问（ES2022+）
  #balance: number;
  #transactions: Array<{ amount: number; date: Date }> = [];

  constructor(initialBalance: number) {
    this.#balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.#balance += amount;
    this.#transactions.push({ amount, date: new Date() });
  }

  getBalance(): number {
    return this.#balance;
  }

  // 私有方法
  #audit(): boolean {
    return this.#transactions.reduce((sum, t) => sum + t.amount, 0) === this.#balance;
  }
}

const account = new SecureBankAccount(100);
account.deposit(50);
console.log(account.getBalance()); // 150
// console.log(account.#balance); // ❌ 编译错误：私有字段外部不可访问
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| var 和 let 只是语法差异 | var 存在变量提升和函数作用域问题 |
| const 保证值不可变 | const 只保证引用不变，对象内容可变 |
| TDZ 只在 let/const 声明前存在 | TDZ 从作用域起始到声明语句结束始终存在 |
| 闭包只捕获值 | 闭包捕获的是变量引用，循环中需特别注意 |
| 所有函数都创建闭包 | 只有引用外部变量的函数才形成闭包 |

### 3.8 扩展阅读

- [MDN 变量指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [MDN：let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN：const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [MDN：var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN：Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [ECMAScript® 2025 — Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [MDN: Private Class Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [JavaScript Info: Variable Scope](https://javascript.info/closure)
- [V8 Blog: Orinoco — Generational Garbage Collector](https://v8.dev/blog/orinoco)
- [2ality: Variables and Scoping in ES6](https://2ality.com/2015/02/es6-scoping.html)
- [Google Developers: JavaScript Memory Management](https://developer.chrome.com/docs/devtools/memory-problems/)
- `10-fundamentals/10.1-language-semantics/02-variables/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
