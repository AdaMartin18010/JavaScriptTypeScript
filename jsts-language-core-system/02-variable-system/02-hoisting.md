# 提升机制（Hoisting）

> var/let/const/function/class 声明的编译期行为差异
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 提升的本质

**提升不是物理移动代码**，而是在编译阶段为变量创建绑定并分配内存空间。

---

## 2. var 的提升

`var` 声明在编译阶段提升，初始化为 `undefined`：

```javascript
console.log(x); // undefined（不是 ReferenceError）
var x = 5;

// 等价于：
var x;
console.log(x); // undefined
x = 5;
```

---

## 3. let / const 的提升

`let` 和 `const` 也提升，但处于**暂时性死区（TDZ）**，未初始化：

```javascript
console.log(y); // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 5;

console.log(z); // ❌ ReferenceError
const z = 10;
```

---

## 4. 函数声明的提升

函数声明整体提升（包括函数体）：

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

---

## 6. 优先级

同一作用域内，提升优先级：

```
函数声明 > var 变量 > let/const/class
```

```javascript
var foo = 1;
function foo() {}
console.log(typeof foo); // "number"（var 覆盖了函数声明）
```

---

## 7. 最佳实践

```
1. 始终先声明后使用
2. 使用 let/const 替代 var
3. 函数声明放在作用域顶部
4. 使用 ESLint: no-use-before-define
```

---

**参考规范**：ECMA-262 §8.2 CreateGlobalFunctionBinding | ECMA-262 §13.3.1 Let and Const Declarations
