# 词法环境与变量环境

> 执行上下文的内部结构：Environment Record、作用域链与变量生命周期
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 词法环境（Lexical Environment）

词法环境是 ECMAScript 中作用域的实现机制，由两部分组成：

```
LexicalEnvironment = {
  EnvironmentRecord: { /* 变量和函数的绑定 */ },
  OuterLexicalEnvironment: /* 外层词法环境引用 */
}
```

---

## 2. 环境记录类型

### 2.1 声明式环境记录（Declarative Environment Record）

存储 `let`、`const`、`class`、`function` 声明：

```javascript
{
  const x = 1;
  let y = 2;
  function fn() {}
  // 这些绑定存储在声明式环境记录中
}
```

### 2.2 对象环境记录（Object Environment Record）

存储 `var` 声明和 `with` 语句：

```javascript
// var 声明在全局作用域中成为全局对象的属性
var globalVar = 1; // window.globalVar（浏览器）

// with 语句创建对象环境记录
with (obj) {
  console.log(property); // 从 obj 中查找
}
```

### 2.3 函数环境记录（Function Environment Record）

函数调用时创建，包含 `this` 绑定和参数：

```javascript
function greet(name) {
  const message = `Hello, ${name}`;
  // name 和 message 存储在函数环境记录中
  // this 绑定也在此记录中
}
```

### 2.4 全局环境记录（Global Environment Record）

全局作用域的复合记录，由对象环境记录（var）和声明式环境记录（let/const）组成。

### 2.5 模块环境记录（Module Environment Record）

模块作用域，包含导入和导出的绑定。

---

## 3. 作用域链

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";
  function inner() {
    const innerVar = "inner";
    console.log(innerVar); // 当前环境
    console.log(outerVar); // 外层环境
    console.log(global);   // 全局环境
  }
  inner();
}
```

词法环境链：

```
inner() LexicalEnvironment
  ├── EnvironmentRecord: { innerVar }
  └── OuterEnv ──► outer() LexicalEnvironment
                    ├── EnvironmentRecord: { outerVar, inner }
                    └── OuterEnv ──► Global LexicalEnvironment
                                      ├── EnvironmentRecord: { global }
                                      └── OuterEnv ──► null
```

---

## 4. 块级作用域

```javascript
{
  const blockVar = "block";
}
// blockVar 不可访问

// if、for、while 等语句也创建块级作用域
if (true) {
  let x = 1;
}
// x 不可访问

// for 循环的每次迭代创建新的词法环境
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

---

## 5. 创建与销毁

### 5.1 创建时机

- **全局环境**：脚本/模块开始时创建
- **函数环境**：函数被调用时创建
- **块级环境**：进入块级语句时创建（let/const）

### 5.2 销毁时机

执行离开作用域后，环境记录不再被引用时，由垃圾回收器回收。

---

## 6. 变量环境（VariableEnvironment）

变量环境是词法环境的一个历史遗留组件，专门用于存储 `var` 声明：

```javascript
// 在全局执行上下文中
LexicalEnvironment = GlobalEnv   // let/const/class
VariableEnvironment = GlobalEnv  // var

// 在函数执行上下文中
LexicalEnvironment = FunctionEnv  // let/const/class/function
VariableEnvironment = FunctionEnv // var
```

**注意**：在现代代码中，LexicalEnvironment 和 VariableEnvironment 通常指向同一个环境记录。

---

**参考规范**：ECMA-262 §9.2 Lexical Environments | ECMA-262 §9.3 Environment Records
