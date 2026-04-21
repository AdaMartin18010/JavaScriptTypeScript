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

**核心原理**：函数在创建时会捕获其外层词法环境的引用，这个引用随函数一起存在，形成闭包。

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
counter.decrement(); // 1
console.log(counter.get()); // 1
```

内部实现过程：

1. `createCounter` 执行时创建词法环境，包含 `count = 0`
2. 返回的对象方法都**闭包引用**了该词法环境
3. `createCounter` 执行完毕后，由于方法仍引用该环境，**环境不会被垃圾回收**
4. 每次调用方法时，通过词法环境引用找到 `count`

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

**原因**：所有闭包引用的是同一个 `i` 变量，循环结束后 `i = 3`。

**使用 let 解决**：

```javascript
function createFunctions() {
  const functions = [];
  for (let i = 0; i < 3; i++) { // let 每次迭代创建新绑定
    functions.push(() => i);
  }
  return functions;
}

const fns = createFunctions();
console.log(fns[0]()); // 0
console.log(fns[1]()); // 1
console.log(fns[2]()); // 2
```

---

## 3. 闭包与循环

### 3.1 var 循环闭包问题（经典面试题）

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出: 3, 3, 3
```

**原因分析**：

- `var i` 是函数作用域变量，整个循环共享同一个 `i`
- `setTimeout` 回调在循环结束后才执行，此时 `i = 3`
- 所有回调引用的是同一个 `i`

### 3.2 let 的每次迭代新绑定

```javascript
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// 输出: 0, 1, 2
```

**原因分析**：

- ES6 规定 `for (let ...)` 每次迭代创建新的词法环境
- 每次迭代有自己的 `j` 绑定
- 每个 `setTimeout` 回调捕获的是各自迭代的 `j`

### 3.3 IIFE 解决方案（ES5 兼容）

```javascript
for (var i = 0; i < 3; i++) {
  (function (capturedI) {
    setTimeout(() => console.log(capturedI), 0);
  })(i);
}
// 输出: 0, 1, 2
```

**原理**：IIFE 创建新的函数作用域，将当前的 `i` 值作为参数传入，每个回调捕获的是 IIFE 的参数，互不影响。

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

**问题**：`hugeData` 被闭包引用，即使返回的函数从不使用它，也无法被垃圾回收。

**解决方案**：只暴露需要的数据：

```javascript
function noLeak() {
  const hugeData = new Array(1000000).fill("x");
  const result = process(hugeData); // 只保留处理结果
  return () => result; // 只闭包引用 result
}
```

### 4.2 V8 的闭包优化

V8 引擎会分析闭包实际引用的变量，只保留必要的绑定：

```javascript
function outer() {
  const a = "used";
  const b = "unused";
  return () => a; // V8 优化：只保留对 a 的引用
}
```

但开发者不应依赖此优化，应主动避免不必要的闭包引用。

---

## 5. 闭包实战模式

### 5.1 模块模式（Module Pattern）

```javascript
const CounterModule = (function () {
  let count = 0;

  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count,
    reset: () => { count = 0; }
  };
})();

CounterModule.increment();
CounterModule.increment();
console.log(CounterModule.get()); // 2
CounterModule.reset();
console.log(CounterModule.get()); // 0
```

**优点**：

- 封装私有状态（`count` 外部无法直接访问）
- 避免全局命名空间污染

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
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
```

### 5.3 函数工厂

```javascript
function makeMultiplier(factor) {
  return (number) => number * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);
const halve = makeMultiplier(0.5);

console.log(double(5));  // 10
console.log(triple(5));  // 15
console.log(halve(10));  // 5
```

### 5.4 记忆化（Memoization）

```javascript
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(50)); // 快速计算，因为中间结果被缓存
```

### 5.5 私有方法模拟（ES5 风格）

```javascript
function createPerson(name) {
  // 私有变量
  let age = 0;

  // 私有方法
  function validateAge(newAge) {
    return newAge >= 0 && newAge <= 150;
  }

  // 公共接口
  return {
    getName: () => name,
    getAge: () => age,
    setAge: (newAge) => {
      if (validateAge(newAge)) {
        age = newAge;
      }
    }
  };
}

const person = createPerson("Alice");
person.setAge(30);
console.log(person.getAge()); // 30
console.log(person.age);      // undefined（私有）
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 意外的变量共享 | 多个闭包引用同一变量 | 使用 `let` 或 IIFE 创建独立绑定 |
| 闭包中的 `this` 问题 | 闭包不绑定 `this` | 使用箭头函数或 `.bind()` |
| 过度闭包导致性能问题 | 大量闭包引用大对象 | 只暴露必要的数据 |
| 循环引用导致内存泄漏 | 闭包与 DOM 元素相互引用 | 及时移除事件监听器 |
| 误解变量捕获时机 | 以为捕获的是值的快照 | 理解捕获的是变量引用 |

### 6.1 闭包中的 this 问题

```javascript
const obj = {
  name: "Alice",
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined（this 指向全局对象）
    }, 0);
  }
};

// 解决方案 1：箭头函数
const obj2 = {
  name: "Alice",
  greet: function() {
    setTimeout(() => {
      console.log(this.name); // "Alice"（箭头函数捕获外层 this）
    }, 0);
  }
};

// 解决方案 2：保存 this 引用
const obj3 = {
  name: "Alice",
  greet: function() {
    const self = this;
    setTimeout(function() {
      console.log(self.name); // "Alice"
    }, 0);
  }
};

// 解决方案 3：bind
const obj4 = {
  name: "Alice",
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // "Alice"
    }.bind(this), 0);
  }
};
```

---

**参考规范**：ECMA-262 §9.2 Lexical Environments | ECMA-262 §9.11 GetThisEnvironment
