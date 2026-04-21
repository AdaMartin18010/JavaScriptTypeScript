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

**内存模型**：

```
createCounter 的词法环境
  ├── count: 1
  └── 被返回的对象引用
        ├── increment: function → 引用 createCounter 的环境
        ├── decrement: function → 引用 createCounter 的环境
        └── get: function → 引用 createCounter 的环境
```

`count` 变量被闭包引用，因此不会被垃圾回收。即使 `createCounter()` 执行完毕，其词法环境仍被保留。

### 2.2 每个闭包独立的环境

```javascript
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log(add5(2));  // 7
console.log(add10(2)); // 12

// add5 和 add10 引用不同的词法环境
```

---

## 3. 闭包实战模式

### 3.1 模块模式（Module Pattern）

```javascript
const myModule = (function() {
  let privateVar = 0;

  function privateMethod() {
    return privateVar;
  }

  return {
    increment() {
      return ++privateVar;
    },
    decrement() {
      return --privateVar;
    },
    get() {
      return privateVar;
    }
  };
})();

myModule.increment(); // 1
myModule.increment(); // 2
console.log(myModule.get()); // 2
// privateVar 和 privateMethod 无法从外部访问
```

### 3.2 函数柯里化（Currying）

```javascript
const multiply = (a) => (b) => a * b;
const triple = multiply(3);
const double = multiply(2);

console.log(triple(5));  // 15
console.log(double(5));  // 10
```

### 3.3 记忆化（Memoization）

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fib = memoize(function(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fib(100)); // 快速计算
```

### 3.4 私有字段的模拟（ES2022 之前）

```javascript
function createPerson(name) {
  let _age = 0; // 私有变量

  return {
    getName() {
      return name;
    },
    getAge() {
      return _age;
    },
    setAge(age) {
      if (age < 0) throw new Error("Age cannot be negative");
      _age = age;
    }
  };
}

const person = createPerson("Alice");
person.setAge(30);
console.log(person.getAge()); // 30
console.log(person._age);     // undefined（无法访问）
```

---

## 4. 闭包与内存泄漏

### 4.1 意外的闭包引用

```javascript
function processHugeData() {
  const hugeData = new Array(1000000).fill("x");

  return function() {
    console.log("done"); // 没有引用 hugeData，但整个词法环境被保留
  };
}

const fn = processHugeData();
// hugeData 不会被释放！fn 持有对整个词法环境的引用
```

### 4.2 DOM 引用导致的泄漏

```javascript
function setupHandler() {
  const element = document.getElementById("button");
  const bigData = new Array(10000).fill("data");

  element.addEventListener("click", function() {
    console.log("clicked");
    // 闭包引用了 element 和 bigData
  });

  // 即使 element 从 DOM 中移除，事件监听器仍持有引用
}
```

### 4.3 解决方案：控制闭包捕获范围

```javascript
function processHugeData() {
  const hugeData = new Array(1000000).fill("x");
  const result = hugeData.slice(0, 10); // 只保留需要的数据

  return function() {
    return result; // 只引用 result，不引用 hugeData
  };
}

// 或者使用 WeakRef（非必需数据）
function cacheWithWeakRef() {
  const cache = new WeakMap();

  return {
    set(key, value) {
      cache.set(key, value);
    },
    get(key) {
      return cache.get(key);
    }
  };
}
```

---

## 5. 循环中的闭包陷阱

### 5.1 经典问题（var）

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出: 3, 3, 3（共享同一个 i）
```

**原因**：`var` 是函数作用域，三个闭包共享同一个 `i`。当定时器执行时，`i` 已经是 3。

### 5.2 解决方案

```javascript
// 方案 1：使用 let（每次迭代新绑定）
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出: 0, 1, 2

// 方案 2：IIFE 创建新作用域
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}

// 方案 3：forEach
[0, 1, 2].forEach(i => {
  setTimeout(() => console.log(i), 0);
});
```

---

## 6. 闭包与 this

闭包不会捕获 `this`，它引用的是**词法环境中的变量**，而 `this` 是**动态绑定**的。

```javascript
const obj = {
  name: "Alice",
  greet() {
    // ❌ 问题：普通函数的 this 是动态的
    setTimeout(function() {
      console.log("Hello, " + this.name); // this 可能是 window/undefined
    }, 0);
  },
  greetFixed() {
    // ✅ 方案 1：箭头函数继承外层 this
    setTimeout(() => {
      console.log("Hello, " + this.name); // this = obj
    }, 0);
  },
  greetFixed2() {
    // ✅ 方案 2：闭包捕获 self
    const self = this;
    setTimeout(function() {
      console.log("Hello, " + self.name); // self = obj
    }, 0);
  }
};
```

---

## 7. ES2022 私有类字段：闭包的替代

ES2022 引入的真正私有字段，提供了闭包之外的私有状态方案：

```javascript
class Counter {
  #count = 0; // 真正私有，无法从外部访问

  increment() {
    return ++this.#count;
  }

  get() {
    return this.#count;
  }
}

const c = new Counter();
c.increment(); // 1
console.log(c.#count); // ❌ SyntaxError: Private field must be declared
```

**闭包 vs 私有字段**：

| 特性 | 闭包 | 私有字段 |
|------|------|---------|
| 兼容性 | ES3+ | ES2022+ |
| 内存开销 | 每个实例独立词法环境 | 共享类定义 |
| 继承支持 | 需要额外处理 | 原生支持 |
| 性能 | 略有开销 | 更优 |
| 调试 | 难以访问私有状态 | 可通过 DevTools 访问 |

---

**参考规范**：ECMA-262 §9.2 Lexical Environments | ECMA-262 §15.7.1 Class Definitions
