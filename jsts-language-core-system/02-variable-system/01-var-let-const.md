# var、let 与 const

> 三种声明方式的全面对比：作用域、提升、重复声明与最佳实践
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 基础对比

```javascript
var x = 1;      // 函数作用域，可提升，可重复声明
let y = 2;      // 块级作用域，TDZ，不可重复声明
const z = 3;    // 块级作用域，TDZ，不可重复声明，不可重新赋值
```

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数级 | 块级 `{}` | 块级 `{}` |
| 提升 | 是（初始化为 undefined） | 是（TDZ） | 是（TDZ） |
| 重复声明 | ✅ 允许 | ❌ SyntaxError | ❌ SyntaxError |
| 重新赋值 | ✅ 允许 | ✅ 允许 | ❌ TypeError |
| 声明时初始化 | 可选 | 可选 | **必需** |
| 全局对象属性 | ✅ 成为属性 | ❌ 不成为 | ❌ 不成为 |

---

## 2. 作用域差异

### 2.1 var 的函数作用域

```javascript
function test() {
  if (true) {
    var x = 1; // 整个函数可访问
  }
  console.log(x); // 1 ✅
}

test();
console.log(typeof x); // "undefined"
```

### 2.2 let/const 的块级作用域

```javascript
function test() {
  if (true) {
    let y = 1;
    const z = 2;
  }
  console.log(y); // ❌ ReferenceError
  console.log(z); // ❌ ReferenceError
}
```

### 2.3 循环中的差异

```javascript
// var：共享同一个变量
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}

// let：每次迭代新绑定
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

---

## 3. 提升（Hoisting）行为

### 3.1 var 的提升

```javascript
console.log(a); // undefined（不是 ReferenceError）
var a = 1;

// 等价于：
var a;
console.log(a); // undefined
a = 1;
```

### 3.2 let/const 的 TDZ

```javascript
console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 2;

console.log(c); // ❌ ReferenceError
const c = 3;
```

### 3.3 函数声明的提升

```javascript
// 函数声明整体提升
foo(); // ✅ "foo"
function foo() { return "foo"; }

// 函数表达式不提升
bar(); // ❌ TypeError: bar is not a function
var bar = function() { return "bar"; };
```

---

## 4. 全局对象绑定

```javascript
var globalVar = 1;
let globalLet = 2;
const globalConst = 3;

console.log("globalVar" in globalThis); // true
console.log("globalLet" in globalThis);  // false
console.log("globalConst" in globalThis); // false

console.log(globalThis.globalVar); // 1
console.log(globalThis.globalLet); // undefined
```

**原因**：`var` 创建在全局对象的属性上，而 `let`/`const` 创建在全局词法环境的声明式记录中。

---

## 5. const 的深入理解

### 5.1 不可重新赋值 ≠ 不可变

```javascript
const obj = { a: 1 };
obj.a = 2;      // ✅ 允许（修改属性）
obj.b = 3;      // ✅ 允许（添加属性）
obj = {};       // ❌ TypeError（重新赋值）

const arr = [1, 2];
arr.push(3);    // ✅ 允许
arr = [];       // ❌ TypeError
```

### 5.2 冻结对象

```javascript
const obj = Object.freeze({ a: 1 });
obj.a = 2; // 严格模式下 TypeError，非严格静默失败

// 深度冻结
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });
  return obj;
}
```

---

## 6. 最佳实践

### 6.1 默认使用 const

```javascript
// ✅ 优先 const
const PI = 3.14159;
const config = { host: "localhost", port: 3000 };
const handler = (event) => { /* ... */ };

// ✅ 需要重新赋值时用 let
let count = 0;
let currentUser = null;

// ❌ 避免 var
var x = 1; // 不要这样
```

### 6.2 声明位置

```javascript
// ✅ 在作用域顶部声明
function process(data) {
  let result;
  let errors = [];
  
  // 使用...
}

// ❌ 避免分散声明
function bad() {
  let a = 1;
  // ... 很多代码 ...
  let b = 2; // 声明太迟
}
```

### 6.3 解构声明

```javascript
// ✅ 使用解构
const { name, age } = user;
const [first, ...rest] = array;

// ✅ 配合默认值
const { role = "user" } = config;
```

---

## 7. 常见陷阱

### 7.1 TDZ 与 typeof

```javascript
// typeof 对未声明变量安全
console.log(typeof undeclared); // "undefined"

// 但对 TDZ 变量不安全
console.log(typeof tdz); // ❌ ReferenceError
let tdz;
```

### 7.2 switch 块的共享作用域

```javascript
const x = 1;
switch (x) {
  case 1:
    let y = 1;
    break;
  case 2:
    let y = 2; // ❌ SyntaxError: Identifier 'y' has already been declared
}
```

### 7.3 const 的临时死区

```javascript
const x = x + 1; // ❌ ReferenceError: Cannot access 'x' before initialization
```

---

**参考规范**：ECMA-262 §14.3.1.2 Let and Const Declarations

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
