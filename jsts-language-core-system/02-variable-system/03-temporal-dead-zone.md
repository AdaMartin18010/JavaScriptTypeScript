# 暂时性死区（Temporal Dead Zone）

> TDZ 的语义、表现形式与常见陷阱
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. TDZ 的定义

**暂时性死区（Temporal Dead Zone）** 是指从块级作用域开始到变量声明处之间的区域。在此区域内访问变量会抛出 `ReferenceError`。

```javascript
{
  // TDZ 开始
  console.log(x); // ❌ ReferenceError: Cannot access 'x' before initialization
  let x = 5;      // TDZ 结束
}
```

---

## 2. TDZ 的表现形式

### 2.1 let / const

```javascript
console.log(a); // ❌ ReferenceError
let a = 1;

console.log(b); // ❌ ReferenceError
const b = 2;
```

### 2.2 class 声明

```javascript
const p = new Person(); // ❌ ReferenceError: Cannot access 'Person' before initialization
class Person {}
```

### 2.3 默认参数中的 TDZ

```javascript
function foo(a = b, b) { // ❌ ReferenceError: Cannot access 'b' before initialization
  return a + b;
}
```

### 2.4 typeof 在 TDZ 中的行为

```javascript
// var：typeof 返回 "undefined"
console.log(typeof undeclaredVar); // "undefined"

// let/const：typeof 抛出 ReferenceError
console.log(typeof tdzVar); // ❌ ReferenceError
let tdzVar = 1;
```

这是 TDZ 最反直觉的行为之一：`typeof` 通常对未声明变量是安全的，但在 TDZ 中不安全。

---

## 3. TDZ 的本质

### 3.1 绑定已创建，但未初始化

在编译阶段，`let`/`const`/`class` 的绑定已经创建，但处于**未初始化**状态。

```javascript
// 编译阶段
// let x 的绑定已创建，但未初始化

console.log(x); // ❌ 访问未初始化的绑定 → ReferenceError
let x = 5;
```

### 3.2 与 var 的对比

```javascript
// var：绑定创建并初始化为 undefined
console.log(v); // undefined
var v = 1;

// let：绑定创建但未初始化
console.log(l); // ❌ ReferenceError
let l = 1;
```

---

## 4. 常见陷阱

### 4.1 循环中的 TDZ

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}

// 每次迭代创建新的绑定
// i 的值被闭包正确捕获
```

### 4.2 switch 中的 TDZ

```javascript
switch (x) {
  case 0:
    let y = 0;
    break;
  case 1:
    let y = 1; // ❌ SyntaxError: Identifier 'y' has already been declared
    break;
}

// 整个 switch 块共享一个作用域
// 解决方案：加花括号创建块级作用域
switch (x) {
  case 0: {
    let y = 0;
    break;
  }
  case 1: {
    let y = 1;
    break;
  }
}
```

---

**参考规范**：ECMA-262 §8.1.1.5.3 GetBindingValue | ECMA-262 §13.3.1 Let and Const Declarations
