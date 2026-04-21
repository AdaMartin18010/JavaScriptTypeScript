# 全局对象

> 全局对象的属性、跨环境差异与最佳实践
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 全局对象的定义

全局对象是全局作用域中的 `this` 值（非严格模式函数调用），提供内置构造函数和函数：

```javascript
// 浏览器
globalThis === window; // true
this === window;       // true（全局作用域）

// Node.js
globalThis === global; // true
this === module.exports; // 模块中不同
```

---

## 2. 全局对象的属性

### 2.1 内置构造函数

```javascript
Object, Function, Array, String, Number, Boolean, Date, RegExp, Error
Map, Set, WeakMap, WeakSet, Promise, Symbol, BigInt, Proxy, Reflect
```

### 2.2 内置函数

```javascript
eval, isFinite, isNaN, parseFloat, parseInt, decodeURI, decodeURIComponent
encodeURI, encodeURIComponent

// 已弃用，避免使用
escape, unescape
```

### 2.3 内置对象

```javascript
Math, JSON, Intl, Atomics
```

### 2.4 全局值

```javascript
undefined, NaN, Infinity
```

---

## 3. 跨环境差异

| 特性 | 浏览器 | Node.js | Web Worker |
|------|--------|---------|-----------|
| 全局对象 | `window` | `global` | `self` |
| DOM API | ✅ | ❌ | 部分 |
| `require` | ❌ | ✅ | ❌ |
| `process` | ❌ | ✅ | ❌ |
| `document` | ✅ | ❌ | ❌ |
| `console` | ✅ | ✅ | ✅ |

---

## 4. globalThis

ES2020 引入 `globalThis` 作为跨环境的统一访问方式：

```javascript
// 所有环境
console.log(globalThis);

// Polyfill（旧环境）
if (typeof globalThis === "undefined") {
  (function() {
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
    throw new Error("Unable to locate global object");
  })().globalThis = (function() {
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
  })();
}
```

### 4.1 与模块的关系

```javascript
// ES Module 中
console.log(this);        // undefined
console.log(globalThis);  // 全局对象

// 传统脚本中
console.log(this);        // 全局对象
console.log(globalThis);  // 全局对象
```

---

## 5. 全局污染与避免

```javascript
// ❌ 避免修改全局对象
globalThis.myLib = { ... };

// ✅ 使用模块导出
export const myLib = { ... };

// ✅ 需要全局访问时使用 globalThis
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = require("node-fetch");
}
```

### 5.1 检测全局对象

```javascript
function getGlobal() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("Unable to locate global object");
}
```

### 5.2 严格模式下的全局访问

```javascript
"use strict";
function test() {
  // this 是 undefined
  console.log(this); // undefined
}
```

## 6. 全局对象的属性枚举

```javascript
// 获取全局对象所有可枚举属性
const globalProps = Object.keys(globalThis);

// 获取所有属性（包括不可枚举）
const allProps = Object.getOwnPropertyNames(globalThis);

// 获取属性描述符
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "parseInt");
// { value: [Function: parseInt], writable: true, enumerable: false, configurable: true }
```

## 7. 框架中的全局对象使用

```javascript
// jQuery 的 noConflict
const jq = jQuery.noConflict(); // 释放全局 $ 和 jQuery

// lodash 的模块化导入
import _ from "lodash"; // 不污染全局

// polyfill 的 globalThis 检测
if (!globalThis.fetch) {
  globalThis.fetch = fetchPolyfill;
}
```

## 8. 安全考虑

```javascript
// ❌ 危险的 eval
eval(userInput); // 在当前词法环境执行

// ✅ 安全的替代方案
const fn = new Function("return " + userInput); // 在全局环境执行

// ❌ 全局污染
globalThis.secretKey = "abc123";

// ✅ 使用闭包或模块
const module = (() => {
  const secretKey = "abc123";
  return { /* 受控的 API */ };
})();
```

## 9. 不同运行时的全局对象

### 9.1 Node.js

```javascript
// global 对象
console.log(global.process.version); // Node.js 版本
console.log(global.Buffer);          // Buffer 构造函数
console.log(global.__dirname);       // 当前目录
```

### 9.2 Deno

```javascript
// Deno 的全局对象
console.log(Deno.version);           // Deno 版本
console.log(Deno.readFile);          // Deno API
```

### 9.3 Bun

```javascript
// Bun 的全局对象
console.log(Bun.version);            // Bun 版本
console.log(Bun.file);               // Bun API
```

---

**参考规范**：ECMA-262 §19.1 The Global Object

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
