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

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| var 和 let 只是语法差异 | var 存在变量提升和函数作用域问题 |
| const 保证值不可变 | const 只保证引用不变，对象内容可变 |

### 3.4 扩展阅读

- [MDN 变量指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [MDN：let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN：const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [MDN：var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN：Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [ECMAScript® 2025 — Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- `10-fundamentals/10.1-language-semantics/02-variables/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
