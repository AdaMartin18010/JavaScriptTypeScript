# 函数

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/04-functions`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块深入研究函数作为一等公民的特性，解决高阶函数、柯里化和函数组合在实际开发中的应用问题。涵盖箭头函数、生成器和异步函数。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 一等函数 | 函数作为值传递与返回 | first-class.ts |
| 闭包 | 词法作用域的持久化引用 | closures.ts |
| 生成器 | 可暂停/恢复的迭代器函数 | generators.ts |

---

## 二、设计原理

### 2.1 为什么存在

函数是 JavaScript 的核心抽象机制。作为一等公民，函数支持高阶组合、惰性求值和闭包，这使得 JS 具备强大的表达力和函数式编程能力。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 纯函数 | 可测试、可缓存 | 需要额外传参 | 数据转换 |
| 副作用函数 | 直接操作外部 | 难以追踪依赖 | I/O 操作 |

### 2.3 特性对比表：函数声明 vs 函数表达式 vs 箭头函数

| 特性 | 函数声明 (Function Declaration) | 函数表达式 (Function Expression) | 箭头函数 (Arrow Function) |
|------|-------------------------------|--------------------------------|--------------------------|
| 语法 | `function foo() {}` | `const foo = function() {}` | `const foo = () => {}` |
| 变量提升 | 整体提升（含体） | 仅变量名提升，赋值不提升 | 无提升 |
| 自有 `this` | 有（运行时绑定） | 有（运行时绑定） | 无（继承词法 this） |
| `arguments` 对象 | 有 | 有 | 无（用剩余参数 `...args`） |
| 作为构造函数 | 可以 `new` | 可以 `new` | 不可以 |
| `prototype` 属性 | 有 | 有 | 无 |
| 隐式返回 | 不支持 | 不支持 | 单行表达式可省略 `{}` 隐式返回 |
| 适用场景 | 通用、需要递归或提升 | 回调、闭包、条件定义 | 简短回调、需要词法 this |

### 2.4 与相关技术的对比

与面向对象语言对比：JS 函数作为一等公民提供了更灵活的抽象能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 函数 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：三种函数定义的行为差异

```typescript
// 1. 函数声明 — 整体提升，可在定义前调用
console.log(declared(2)); // 4
function declared(x: number): number {
  return x * x;
}

// 2. 函数表达式 — 提升的是变量，不是函数体
// console.log(expressed(2)); // ReferenceError: Cannot access 'expressed' before initialization
const expressed = function (x: number): number {
  return x * x;
};

// 3. 箭头函数 — 无自身 this，适合回调与简短逻辑
const arrow = (x: number): number => x * x;

// 4. this 绑定差异演示
const obj = {
  name: 'Alice',
  greetDecl: function () {
    return `Hello, ${this.name}`; // this = obj
  },
  greetArrow: () => {
    return `Hello, ${(obj as any).name}`; // 词法 this，此处指向外层（如 global/module）
  },
  greetMethod() {
    setTimeout(function () {
      // console.log(this.name); // undefined 或报错，this 指向全局/timer
    }, 0);
    setTimeout(() => {
      console.log(this.name); // "Alice" — 继承词法 this
    }, 0);
  },
};

// 5. 高阶函数：柯里化示例
function curry<T, U, V>(fn: (a: T, b: U) => V) {
  return (a: T) => (b: U) => fn(a, b);
}
const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
console.log(curriedAdd(3)(4)); // 7
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 箭头函数完全等价于普通函数 | 箭头函数无自身 this、arguments 和原型 |
| async 函数总是返回 Promise | 即使返回非 Promise 值也会被包装 |

### 3.4 扩展阅读

- [MDN 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN：箭头函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN：async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN：生成器函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [ECMAScript® 2025 — ECMAScript Function Objects](https://tc39.es/ecma262/#sec-ecmascript-function-objects)
- `10-fundamentals/10.1-language-semantics/04-functions/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
