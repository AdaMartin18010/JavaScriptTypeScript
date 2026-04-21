# 闭包（Closure）

> 词法作用域与执行上下文的生命周期延伸
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 闭包的定义

闭包是函数与其词法环境的组合，使函数可以访问其**定义时**的外部变量：

```javascript
function outer() {
  const count = 0;
  return function inner() {
    return ++count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

---

## 2. 闭包的内存模型

```javascript
function createCounter() {
  let count = 0; // 被闭包引用，不会被 GC
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
}

const counter = createCounter();
// counter 持有对 createCounter 词法环境的引用
// count 变量持续存在于内存中
```

---

## 3. 闭包实战模式

### 3.1 模块模式

```javascript
const module = (function() {
  let privateVar = 0;
  
  return {
    increment() {
      return ++privateVar;
    },
    get() {
      return privateVar;
    }
  };
})();
```

### 3.2 柯里化

```javascript
const multiply = (a) => (b) => a * b;
const triple = multiply(3);
console.log(triple(5)); // 15
```

### 3.3 事件处理器保留状态

```javascript
function createButtonHandler(id) {
  let clickCount = 0;
  return function() {
    clickCount++;
    console.log(`Button ${id} clicked ${clickCount} times`);
  };
}

document.getElementById("btn1").onclick = createButtonHandler(1);
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
// hugeData 不会被释放！
```

### 4.2 解决方案

```javascript
function processHugeData() {
  const hugeData = new Array(1000000).fill("x");
  const result = hugeData.slice(0, 10);
  
  return function() {
    return result; // 只保留需要的数据
  };
}
```

---

**参考规范**：ECMA-262 §9.2 Lexical Environments
