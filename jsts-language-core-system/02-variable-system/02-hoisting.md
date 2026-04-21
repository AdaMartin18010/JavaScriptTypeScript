# 提升机制（Hoisting）

> var/let/const/function/class 声明的编译期行为差异
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 提升的本质

**提升不是物理移动代码**，而是在编译阶段为变量创建绑定并分配内存空间。JavaScript 引擎采用两阶段处理：

1. **编译阶段（Creation Phase）**：扫描声明，创建绑定
2. **执行阶段（Execution Phase）**：逐行执行，赋值和求值

---

## 2. var 的提升行为

`var` 声明在编译阶段提升，绑定创建后立即初始化为 `undefined`：

```javascript
console.log(x); // undefined（不是 ReferenceError）
var x = 42;
console.log(x); // 42

// 等价于引擎看到的逻辑：
var x;           // 编译阶段：声明提升，初始化为 undefined
console.log(x);  // undefined
x = 42;          // 执行阶段：赋值
console.log(x);  // 42
```

### 2.1 函数作用域内的 var

```javascript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10（var 不受块级限制）
}
```

### 2.2 重复声明

```javascript
var x = 1;
var x = 2; // 允许，后声明覆盖前声明
```

---

## 3. let / const 的提升行为

`let` 和 `const` 也提升，但绑定创建后**不初始化**，进入**暂时性死区（TDZ）**：

```javascript
console.log(y); // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 5;

console.log(z); // ❌ ReferenceError
const z = 10;
```

### 3.1 TDZ 的范围

```javascript
// TDZ 从块级作用域开始到声明处结束
{
  // TDZ 开始
  console.log(a); // ❌ ReferenceError
  let a = 1;      // TDZ 结束
}
```

### 3.2 typeof 在 TDZ 中的行为

```javascript
// var：typeof 返回 "undefined"
console.log(typeof undeclaredVar); // "undefined"

// let/const：typeof 抛出 ReferenceError
console.log(typeof tdzVar); // ❌ ReferenceError
let tdzVar = 1;
```

---

## 4. 函数声明的提升

函数声明**整体提升**，包括函数体：

```javascript
sayHello(); // ✅ "Hello!"

function sayHello() {
  console.log("Hello!");
}
```

### 4.1 函数表达式不提升

```javascript
sayHi(); // ❌ TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// 等价于：
var sayHi;       // 提升，初始化为 undefined
sayHi();         // undefined() → TypeError
sayHi = function() { ... };
```

### 4.2 箭头函数不提升

```javascript
const greet = () => "Hello"; // 不提升
```

---

## 5. class 声明的提升

类声明提升但处于 TDZ（类似 let）：

```javascript
const p = new Person(); // ❌ ReferenceError: Cannot access 'Person' before initialization

class Person {}
```

### 5.1 类表达式

```javascript
const Animal = class {};
```

---

## 6. 提升优先级

同一作用域内，提升优先级：

```
函数声明 > var 变量 > let/const/class
```

```javascript
var foo = 1;
function foo() {}
console.log(typeof foo); // "number"（var 赋值覆盖了函数声明）

// 等价于：
function foo() {} // 函数声明提升
var foo;          // var 声明提升（已存在，忽略）
foo = 1;          // 赋值
console.log(typeof foo); // "number"
```

---

## 7. 最佳实践

```
1. 始终先声明后使用（即使 var 可以提升）
2. 使用 let/const 替代 var，避免意外的提升行为
3. 函数声明放在作用域顶部
4. 配置 ESLint: no-use-before-define
```

---

**参考规范**：ECMA-262 §8.2 CreateGlobalFunctionBinding | ECMA-262 §13.3.1 Let and Const Declarations
