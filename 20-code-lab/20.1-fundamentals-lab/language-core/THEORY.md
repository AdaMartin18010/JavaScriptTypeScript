# 语言核心 — 理论基础

## 1. JavaScript 类型系统

JavaScript 拥有 8 种基本数据类型：

- **原始类型**: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`
- **引用类型**: `object`（含 Array、Function、Date、RegExp 等）

### 类型转换规则

- **抽象相等（==）**: 触发强制类型转换，`0 == '0'` 为 true
- **严格相等（===）**: 不转换类型，`0 === '0'` 为 false
- **真值/假值**: `false`, `0`, `''`, `null`, `undefined`, `NaN` 为假值；其余为真值

---

## 2. 执行上下文与作用域

### 执行上下文类型

- **全局执行上下文**: 程序入口，创建全局对象（浏览器为 `window`，Node.js 为 `global`）
- **函数执行上下文**: 每次函数调用创建，包含变量环境、词法环境、`this` 绑定
- **Eval 执行上下文**: `eval()` 代码执行时的上下文

### 作用域链

```javascript
function outer() {
  const a = 1
  function inner() {
    const b = 2
    console.log(a + b) // 访问 outer 的 a，形成作用域链
  }
  inner()
}
```

---

## 3. 闭包

闭包是函数与其词法环境的组合，使函数可以访问定义时的外部变量：

- **私有变量**: 模块模式、工厂函数
- **状态保持**: 事件处理器、回调函数保留上下文
- **内存影响**: 闭包引用的变量不会被垃圾回收

---

## 4. this 绑定规则

| 调用方式 | this 指向 |
|---------|----------|
| `obj.method()` | obj |
| `func()` | undefined（严格模式）/ global（非严格） |
| `new Func()` | 新创建的对象 |
| `func.call/apply(obj)` | 显式指定的 obj |
| 箭头函数 | 词法继承（定义时的 this） |

---

## 5. 原型链

```
对象 → __proto__ → 原型对象 → __proto__ → Object.prototype → null
```

- `Object.create(proto)`: 创建以 proto 为原型的对象
- `Object.setPrototypeOf`: 动态修改原型（性能影响）
- `class` 语法糖：底层仍为原型继承

---

## 6. 核心机制对比：作用域 vs 闭包 vs 原型

| 机制 | 本质 | 生命周期 | 数据共享方式 | 典型用途 |
|------|------|----------|-------------|----------|
| **作用域（Scope）** | 词法作用域链（Lexical Environment） | 函数执行期间 | 嵌套函数可访问外层变量 | 变量隔离、避免全局污染 |
| **闭包（Closure）** | 函数 + 其词法环境的引用 | 只要引用存在就一直存活 | 通过返回的函数持续访问 | 私有变量、状态保持、柯里化 |
| **原型（Prototype）** | 对象间的委托链接（Delegation Chain） | 随对象存在 | 所有实例共享原型方法 | 方法复用、继承、行为委托 |

---

## 7. Code Example：作用域、闭包、原型的协同

```javascript
// === 作用域：变量隔离 ===
function makeCounter() {
  // `count` 被作用域限制在 makeCounter 内部
  let count = 0;

  // === 闭包：状态保持 ===
  return {
    increment() {
      // 内部函数通过闭包访问外层 `count`
      return ++count;
    },
    decrement() {
      return --count;
    },
    get value() {
      return count;
    }
  };
}

const counterA = makeCounter();
const counterB = makeCounter();

// counterA 和 counterB 拥有独立的闭包环境
counterA.increment(); // 1
counterA.increment(); // 2
counterB.increment(); // 1（互不影响）

// === 原型：方法复用 ===
function Person(name) {
  this.name = name;
}

// 通过原型共享方法，避免每个实例重复创建函数对象
Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

const alice = new Person('Alice');
const bob = new Person('Bob');

// alice 和 bob 共享同一个 greet 方法（通过原型委托）
console.log(alice.greet()); // "Hello, I'm Alice"
console.log(bob.greet());   // "Hello, I'm Bob"
console.log(alice.greet === bob.greet); // true

// === 三者协同：模块模式 + 原型继承 ===
const CounterModule = (function() {
  // 作用域隔离私有变量
  const privateData = new WeakMap();

  class AdvancedCounter {
    constructor(initial = 0) {
      privateData.set(this, { count: initial });
    }
    increment() {
      const data = privateData.get(this);
      data.count++;
      return data.count;
    }
  }

  return { AdvancedCounter };
})();

const c = new CounterModule.AdvancedCounter(10);
c.increment(); // 11
```

---

## 8. 与相邻模块的关系

- **01-ecmascript-evolution**: ECMAScript 标准演进
- **10-js-ts-comparison**: JavaScript 与 TypeScript 的差异
- **14-execution-flow**: 执行流与调用栈

---

## 9. 权威链接

- [ECMA-262 – Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts)
- [MDN – Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [MDN – Prototype Inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript Info – Scope & Closure](https://javascript.info/closure)
- [V8 Blog – Fast Properties](https://v8.dev/blog/fast-properties)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)
