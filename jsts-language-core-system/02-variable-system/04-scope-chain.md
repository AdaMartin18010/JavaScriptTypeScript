# 作用域链（Scope Chain）

> 变量查找机制：从局部到全局的层级解析过程
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 作用域类型

### 1.1 全局作用域

```javascript
const globalVar = "I am global";
// 在任何地方都可访问（除非被遮蔽）
```

### 1.2 函数作用域

```javascript
function outer() {
  const funcVar = "I am in function";
  if (true) {
    console.log(funcVar); // ✅ 块内可访问函数作用域变量
  }
}
```

### 1.3 块级作用域（ES6+）

```javascript
if (true) {
  const blockVar = "I am in block";
}
// console.log(blockVar); // ❌ ReferenceError
```

### 1.4 模块作用域

```javascript
// module.js
const moduleVar = "I am in module";
// 只在当前模块内可访问，不污染全局
```

---

## 2. 词法作用域 vs 动态作用域

### 2.1 JavaScript 的词法作用域

变量的作用域在**代码编写时**确定，而非运行时：

```javascript
const x = "global";

function outer() {
  const x = "outer";
  return function inner() {
    console.log(x); // "outer"（词法作用域：使用 outer 的 x）
  };
}

const fn = outer();
fn(); // "outer"
```

### 2.2 动态作用域对比

如果 JS 使用动态作用域，`fn()` 会输出 `"global"`（调用处的变量）。

### 2.3 eval / with 的动态作用域例外

```javascript
const x = "global";
function test() {
  eval("console.log(x)"); // 如果使用 eval 传入的代码定义了 x，会动态影响
}
```

**注意**：`with` 已弃用，`eval` 在严格模式下不影响外部作用域。

---

## 3. 作用域链的构建

### 3.1 词法环境的外层引用

```javascript
const global = "global";

function foo() {
  const a = "foo";
  function bar() {
    const b = "bar";
    console.log(a); // 通过作用域链找到 foo 的 a
    console.log(global); // 通过作用域链找到全局的 global
  }
  bar();
}
```

作用域链：

```
bar() LexicalEnvironment → foo() LexicalEnvironment → Global LexicalEnvironment
```

### 3.2 作用域链的查找过程

1. 在当前作用域查找变量
2. 未找到 → 沿外层引用（outerEnv）向上查找
3. 直到全局作用域
4. 仍未找到 → `ReferenceError`

---

## 4. 遮蔽（Shadowing）

### 4.1 变量遮蔽

```javascript
const name = "global";

function test() {
  const name = "local"; // 遮蔽全局的 name
  console.log(name);    // "local"
}
```

### 4.2 全局遮蔽

```javascript
var name = "global name"; // 成为 window.name
let name2 = "global name2"; // 不会成为 window.name2
```

---

## 5. 实战影响

### 5.1 闭包与作用域链

```javascript
function createCounter() {
  let count = 0; // 被闭包引用，不会释放
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
}
```

### 5.2 循环作用域（var vs let）

```javascript
// var：共享同一个变量
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}

// let：每次迭代新绑定
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0); // 0, 1, 2
}
```

### 5.3 模块作用域隔离

ES Module 的顶级变量不会污染全局作用域：

```javascript
// utils.js
const helper = "helper"; // 模块私有
export const public = "public"; // 显式导出
```

---

**参考规范**：ECMA-262 §9.2 Lexical Environments | ECMA-262 §9.3 Environment Records
