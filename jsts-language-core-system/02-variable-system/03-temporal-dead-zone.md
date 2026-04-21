# 暂时性死区（Temporal Dead Zone）

> let/const 声明前的不可访问期及其底层机制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. TDZ 现象

```javascript
console.log(a); // undefined（var 声明提升）
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

`let` 和 `const` 声明的变量在声明前存在**暂时性死区**：在作用域开始处到声明处之间，访问会抛出 `ReferenceError`。

---

## 2. 底层机制

### 2.1 变量创建三阶段

| 阶段 | var | let/const |
|------|-----|-----------|
| 创建（Create） | 进入作用域时 | 进入作用域时 |
| 初始化（Initialize） | 创建时同时初始化 | 执行到声明语句时 |
| 赋值（Assign） | 执行到赋值语句时 | 执行到赋值语句时 |

`let`/`const` 的创建和初始化被分开，中间阶段就是 TDZ。

---

## 3. TDZ 触发场景

```javascript
// 场景 1：声明前访问
let x = x; // ReferenceError: x is not defined

// 场景 2：函数参数默认值
function foo(a = b, b) { /* ... */ }
foo(undefined, 1); // ReferenceError: Cannot access 'b' before initialization

// 场景 3：typeof
console.log(typeof undeclared); // "undefined"
console.log(typeof tdz); // ReferenceError
let tdz;

// 场景 4：循环中的闭包
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2（每个迭代新绑定）
}
```

---

## 4. const 的 TDZ 差异

```javascript
const c; // SyntaxError: Missing initializer

const d = 1;
d = 2;   // TypeError: Assignment to constant variable
```

`const` 要求声明时初始化，且不能重新赋值（但对象属性可变）。

---

## 5. 与 var 的对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数级 | 块级 | 块级 |
| 提升 | 是（初始化为 undefined） | 是（TDZ） | 是（TDZ） |
| 重复声明 | 允许 | 报错 | 报错 |
| 重新赋值 | 允许 | 允许 | 报错 |

---

## 6. 最佳实践

```javascript
// ✅ 在作用域顶部声明
function example() {
  let x, y, z;
  // ... 使用
}

// ✅ 优先使用 const
const PI = 3.14;
const config = { host: "localhost" };

// ✅ 需要重新赋值时使用 let
let count = 0;
count++;
```

## 7. 类声明的 TDZ

```javascript
const obj = new MyClass(); // ReferenceError

class MyClass {}
```

类声明也有 TDZ，与 `let`/`const` 类似。

## 8. 函数声明与 TDZ

```javascript
// 函数声明在块级作用域中
{
  console.log(foo()); // ✅ "foo"
  function foo() { return "foo"; }
}

// 但在严格模式下，块级函数有 TDZ（部分浏览器）
"use strict";
{
  console.log(bar()); // 可能 ReferenceError
  function bar() { return "bar"; }
}
```

## 9. 为什么需要 TDZ

TDZ 的设计目的是：

1. **防止错误**：访问未初始化的变量通常是编程错误
2. **语义清晰**：`let`/`const` 的声明和初始化是分开的
3. **与 const 一致**：`const` 必须先初始化

对比 `var` 的 `undefined`：

```javascript
console.log(a); // undefined（静默失败）
var a = 1;

console.log(b); // ReferenceError（立即失败）
let b = 2;
```

## 10. TDZ 与块级作用域

```javascript
let x = 1;
{
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 2;
}
```

内部 `x` 的声明提升到了块顶部，形成了 TDZ，遮蔽了外部 `x`。

## 11. 循环中的 TDZ

```javascript
for (let i = 0; i < 3; i++) {
  // 每次迭代创建新的词法环境
  let j = i;
  setTimeout(() => console.log(j), 0); // 0, 1, 2
}

// 对比 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}
```

## 12. TDZ 调试技巧

```javascript
// 使用 typeof 检测未声明变量
console.log(typeof undeclaredVar); // "undefined"（安全）

// 但 typeof 不能检测 TDZ
console.log(typeof tdz); // ReferenceError
let tdz;

// 使用 try/catch 安全访问
try {
  console.log(maybeTDZ);
} catch (e) {
  if (e instanceof ReferenceError) {
    console.log("变量尚未初始化");
  }
}
```

## 13. switch 语句中的 TDZ

```javascript
const x = 1;
switch (x) {
  case 1:
    let y = 1;
    console.log(y); // 1
    break;
  case 2:
    // y 的 TDZ 延伸到这里！
    console.log(y); // ReferenceError
    break;
}
```

`switch` 的 `case` 共享同一个块级作用域。

---

**参考规范**：ECMA-262 §8.1.1.5.3 GetBindingValue

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
