# 词法环境

> ECMAScript 作用域的底层实现：环境记录与外部引用链
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 词法环境的结构

```
Lexical Environment = {
  Environment Record: {
    // 声明式：标识符 → 值 的映射
    // 对象式：全局对象属性
  },
  Outer Reference: Lexical Environment | null
}
```

---

## 2. 环境记录类型

| 类型 | 用途 | 示例 |
|------|------|------|
| 声明式环境记录 | 函数、块级作用域 | `let`、`const`、`function` |
| 对象环境记录 | `with` 语句 | `with (obj)` |
| 全局环境记录 | 全局作用域 | 全局对象 + 声明式记录 |
| 模块环境记录 | ES Module | 导入/导出绑定 |

---

## 3. 作用域链的形成

```javascript
function outer() {
  let a = 1;
  function middle() {
    let b = 2;
    function inner() {
      let c = 3;
      console.log(a + b + c);
    }
    inner();
  }
  middle();
}
```

作用域链：`inner → middle → outer → global`

---

## 4. 闭包与词法环境

```javascript
function createCounter() {
  let count = 0; // 被闭包捕获
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // count = 1
```

`createCounter` 的词法环境在函数返回后仍被引用，因此保留在内存中。

---

## 5. eval 与词法环境

```javascript
let x = 1;

function test() {
  let x = 2;
  eval("console.log(x)"); // 2（访问当前词法环境）
}

test();
```

`eval` 在当前词法环境中执行，可以访问和修改局部变量。

---

## 6. with 语句与环境记录

```javascript
const obj = { a: 1, b: 2 };

with (obj) {
  console.log(a); // 1（从 obj 环境记录查找）
  a = 3;          // 修改 obj.a
}

console.log(obj.a); // 3
```

`with` 语句创建一个**对象环境记录**，将对象属性映射为变量绑定。由于性能和安全问题，严格模式禁止使用 `with`。

---

## 7. 全局环境记录的特殊性

全局环境记录是**复合记录**：

```
Global Environment Record = {
  [[ObjectRecord]]: Object Environment Record,  // 绑定全局对象属性
  [[DeclarativeRecord]]: Declarative Environment Record, // 绑定 let/const/class
  [[VarNames]]: List<String>,                    // var 声明列表
  [[OuterEnv]]: null
}
```

这就是为什么 `var` 声明会成为全局对象属性，而 `let`/`const` 不会：

```javascript
var x = 1;      // 成为 globalThis.x
let y = 2;      // 存储在声明式记录中
declare class Z {} // 存储在声明式记录中
```

## 8. 模块环境记录

ES Module 使用专门的模块环境记录：

```
Module Environment Record = {
  [[OuterEnv]]: Global Environment Record,
  // 导入绑定：不可变间接引用
  // 导出绑定：局部绑定或间接引用
}
```

```javascript
// math.js
export const PI = 3.14;
export function add(a, b) { return a + b; }

// app.js
import { PI, add } from "./math.js";
// PI 和 add 是模块环境记录中的不可变绑定
```

## 9. 性能影响

- **作用域链深度**：链越长，变量查找越慢（但现代引擎已优化）
- **闭包捕获**：仅捕获引用的变量，而非整个词法环境
- **V8 优化**：频繁访问的变量会被提升到本地上下文

## 10. 词法环境的生命周期

```javascript
function createEnv() {
  let local = "I'm local";
  return function() {
    return local; // 闭包保留外层词法环境
  };
}

const fn = createEnv(); // createEnv 的局部环境理论上应销毁
// 但由于被 fn 引用，环境被保留

fn(); // "I'm local" — 环境仍然存在
```

## 11. 性能优化：隐藏类

V8 引擎优化环境记录访问：

```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// V8 为 Point 创建隐藏类，加速属性访问
```

虽然这是对象优化，但环境记录也使用类似的形状（shape）优化。

## 12. 调试词法环境

```javascript
// Chrome DevTools 中查看作用域链
function debug() {
  let a = 1;
  debugger; // 在 Sources 面板查看 Scope 链
}
```

## 13. 块级作用域的语义

```javascript
let x = 1;
{
  let x = 2;
  {
    let x = 3;
    console.log(x); // 3
  }
  console.log(x); // 2
}
console.log(x); // 1
```

每个 `{}` 创建一个新的词法环境，形成作用域嵌套。

## 14. Temporal Dead Zone 与环境记录

```javascript
{
  // TDZ 开始
  console.log(x); // ReferenceError
  // TDZ 结束
  let x = 1;
}
```

TDZ 是因为环境记录中绑定已创建但未初始化。

---

**参考规范**：ECMA-262 §9.1 Environment Records

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
