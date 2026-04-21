# var / let / const 语义深度对比

> 三种变量声明方式的完整语义差异与选用策略
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. 作用域规则

### 1.1 函数作用域（var）

`var` 声明的变量属于**函数作用域**或**全局作用域**，不受块级语句限制：

```javascript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // ✅ 10（在 if 块外仍可访问）
}
```

### 1.2 块级作用域（let/const）

`let` 和 `const` 声明的变量属于**块级作用域**（`{}` 包裹的区域）：

```javascript
function example() {
  if (true) {
    let y = 10;
    const z = 20;
  }
  console.log(y); // ❌ ReferenceError: y is not defined
  console.log(z); // ❌ ReferenceError: z is not defined
}
```

### 1.3 全局作用域差异

```javascript
// 浏览器环境
var globalVar = 1;
console.log(window.globalVar); // ✅ 1（var 会成为全局对象属性）

let globalLet = 2;
console.log(window.globalLet); // ❌ undefined（let/const 不会）
```

---

## 2. 可变性

### 2.1 var / let：可重新赋值

```javascript
var a = 1;
a = 2; // ✅

let b = 1;
b = 2; // ✅
```

### 2.2 const：绑定不可变

```javascript
const c = 1;
c = 2; // ❌ TypeError: Assignment to constant variable

// 但对象的属性可以修改
const obj = { x: 1 };
obj.x = 2; // ✅
obj = {};  // ❌
```

**核心区别**：`const` 保证的是**变量绑定的不可变**，而非**值的不可变**。

---

## 3. 重复声明

```javascript
var x = 1;
var x = 2; // ✅ var 允许重复声明，后面的覆盖前面的

let y = 1;
let y = 2; // ❌ SyntaxError: Identifier 'y' has already been declared

const z = 1;
const z = 2; // ❌ SyntaxError
```

---

## 4. 初始化要求

```javascript
var a;        // ✅ undefined
console.log(a); // undefined

let b;        // ✅ undefined
console.log(b); // undefined

const c;      // ❌ SyntaxError: Missing initializer in const declaration
```

---

## 5. 选用策略

| 场景 | 推荐 | 理由 |
|------|------|------|
| 常量值 | `const` | 防止意外重新赋值 |
| 需要重新赋值的变量 | `let` | 块级作用域，更安全 |
| 循环计数器 | `let` | 每次迭代新绑定 |
| 遗留代码维护 | `var` | 仅兼容旧代码 |

**黄金法则**：

```
默认使用 const
需要重新赋值时使用 let
绝不使用 var（除非维护遗留代码）
```

---

## 6. 常见陷阱

### 6.1 循环中的 var 闭包问题

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出: 3, 3, 3（共享同一个 i）

// 解决：使用 let
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// 输出: 0, 1, 2（每次迭代新 j）
```

### 6.2 const 对象的属性修改

```javascript
const user = { name: "Alice" };
user.name = "Bob";      // ✅ 允许
user = { name: "Bob" }; // ❌ 不允许

// 如需完全不可变，使用 Object.freeze 或 as const
const frozen = Object.freeze({ name: "Alice" });
frozen.name = "Bob"; // 静默失败（严格模式下 TypeError）
```

### 6.3 TDZ（暂时性死区）

```javascript
console.log(a); // undefined（var 的 hoisting）
var a = 1;

console.log(b); // ❌ ReferenceError（let 的 TDZ）
let b = 1;
```

---

**参考规范**：ECMA-262 §13.3.1 Let and Const Declarations | ECMA-262 §13.3.2 Variable Statement
