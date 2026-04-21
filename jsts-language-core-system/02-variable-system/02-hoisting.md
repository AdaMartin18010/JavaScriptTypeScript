# 提升机制（Hoisting）

> JavaScript 编译阶段如何将声明提升到作用域顶部
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 变量提升

### 1.1 var 的声明提升

`var` 声明的变量在编译阶段被提升到作用域顶部，并初始化为 `undefined`：

```javascript
console.log(x); // undefined（而非 ReferenceError）
var x = 10;

// 等价于：
var x;
console.log(x); // undefined
x = 10;
```

### 1.2 let / const 的声明提升（但未初始化）

`let` 和 `const` 也会被提升，但不会被初始化，进入**暂时性死区（TDZ）**：

```javascript
console.log(y); // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

---

## 2. 函数提升

### 2.1 函数声明的完整提升

函数声明的**整个定义**（包括函数体）被提升：

```javascript
sayHello(); // ✅ "Hello!"

function sayHello() {
  console.log("Hello!");
}
```

### 2.2 函数表达式的部分提升

函数表达式只有**变量部分**被提升，赋值不提升：

```javascript
sayHi(); // ❌ TypeError: sayHi is not a function

var sayHi = function () {
  console.log("Hi!");
};

// 等价于：
var sayHi;
sayHi(); // sayHi 此时是 undefined
sayHi = function () { ... };
```

### 2.3 箭头函数与提升

箭头函数作为表达式，遵循变量提升规则：

```javascript
console.log(arrow); // undefined
var arrow = () => "arrow";

console.log(arrow2); // ❌ TDZ
let arrow2 = () => "arrow2";
```

---

## 3. 类提升

类声明的提升行为类似于 `let/const`：**提升但进入 TDZ**：

```javascript
const obj = new MyClass(); // ❌ ReferenceError: Cannot access 'MyClass' before initialization

class MyClass {
  constructor() {
    this.name = "MyClass";
  }
}
```

类表达式同理：

```javascript
console.log(MyExpr); // undefined
var MyExpr = class {};
```

---

## 4. 导入提升

ES Module 的导入声明被提升到模块顶部：

```javascript
// 即使写在文件底部，导入也会在模块开始时执行
foo(); // ✅ 合法

import { foo } from "./foo.js";
```

---

## 5. 提升的内部机制

### 5.1 编译阶段 vs 执行阶段

```
编译阶段：
  1. 扫描作用域内的所有声明
  2. 创建绑定（var → 初始化为 undefined；let/const/class → 创建但未初始化）

执行阶段：
  1. 按代码顺序执行
  2. 遇到 let/const 的初始化语句时，完成绑定初始化
```

### 5.2 环境记录的创建过程

- **var**：在 VariableEnvironment 中创建绑定，初始化为 `undefined`
- **let/const/class**：在 LexicalEnvironment 中创建绑定，保持未初始化状态直到执行到声明语句

---

## 6. 最佳实践

1. **先声明后使用**：即使函数声明可以安全提升，也建议按逻辑顺序组织代码
2. **函数声明放在作用域顶部**：提高可读性
3. **避免在块级作用域中使用函数声明**：不同浏览器的实现 historically 不一致

```javascript
// ✅ 推荐
function main() {
  const data = fetchData();
  process(data);
}

main();
```

---

**参考规范**：ECMA-262 §9.3 Environment Records | ECMA-262 §13.3 Declarations and the Variable Statement
