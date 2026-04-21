# 闭包深度解析

> 闭包的词法环境引用机制、内存模型与实战模式
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 闭包的定义

**闭包（Closure）** 是一个函数及其引用的**外层词法环境**的组合。即使外层函数已经返回，内层函数仍然可以访问外层函数的变量。

```javascript
function outer() {
  const secret = "I am from outer";
  return function inner() {
    return secret; // inner 闭包引用了 outer 的词法环境
  };
}

const fn = outer();
console.log(fn()); // "I am from outer"（outer 已返回，但 secret 仍存活）
```

---

## 2. 闭包的内部机制

### 2.1 词法环境的引用保持

```javascript
function createCounter() {
  let count = 0; // 在 createCounter 的词法环境中
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
```

内部实现：
- `createCounter` 执行时创建词法环境，包含 `count`
- 返回的对象方法都**闭包引用**了该词法环境
- `createCounter` 执行完毕后，由于方法仍引用该环境，**环境不会被垃圾回收**

### 2.2 变量捕获（Capture by Reference）

JavaScript 闭包捕获的是**变量的引用**，而非值的快照：

```javascript
function createFunctions() {
  const functions = [];
  for (var i = 0; i < 3; i++) {
    functions.push(() => i);
  }
  return functions;
}

const fns = createFunctions();
console.log(fns[0]()); // 3（共享同一个 i）
console.log(fns[1]()); // 3
console.log(fns[2]()); // 3
```

---

## 3. 闭包与循环

### 3.1 var 循环闭包问题

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出: 3, 3, 3
```

**原因**：所有回调共享同一个 `i`，循环结束时 `i = 3`。

### 3.2 let 的每次迭代新绑定

```javascript
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// 输出: 0, 1, 2
```

**原因**：每次迭代创建新的词法环境和新的 `j` 绑定。

### 3.3 IIFE 解决方案（ES5 兼容）

```javascript
for (var i = 0; i < 3; i++) {
  (function (capturedI) {
    setTimeout(() => console.log(capturedI), 0);
  })(i);
}
// 输出: 0, 1, 2
```

---

## 4. 闭包的内存影响

### 4.1 闭包导致的内存泄漏

```javascript
function leak() {
  const hugeData = new Array(1000000).fill("x");
  return () => console.log("leak");
  // hugeData 被闭包引用，即使返回的函数不使用它
}
```

**解决方案**：只返回需要的数据：

```javascript
function noLeak() {
  const hugeData = new Array(1000000).fill("x");
  const result = process(hugeData);
  return () => result; // 只闭包引用 result
}
```

### 4.2 V8 的闭包优化

V8 引擎会分析闭包实际引用的变量，只保留必要的绑定，而非整个词法环境。

---

## 5. 闭包实战模式

### 5.1 模块模式（Module Pattern）

```javascript
const CounterModule = (function () {
  let count = 0;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
})();
```

### 5.2 柯里化（Currying）

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
```

### 5.3 函数工厂

```javascript
function makeMultiplier(factor) {
  return (number) => number * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 意外的变量共享 | 多个闭包引用同一变量 | 使用 let 或 IIFE 创建独立绑定 |
| 闭包中的 this 问题 | 闭包不绑定 this | 使用箭头函数或 .bind() |
| 过度闭包导致性能问题 | 大量闭包引用大对象 | 只暴露必要的数据 |
| 循环引用导致内存泄漏 | 闭包与 DOM 元素相互引用 | 及时移除事件监听器 |

---

**参考规范**：ECMA-262 §9.2 Lexical Environments | ECMA-262 §9.11 GetThisEnvironment
