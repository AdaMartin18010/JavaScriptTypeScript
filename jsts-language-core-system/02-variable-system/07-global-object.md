# 全局对象

> 全局对象的属性与跨环境差异
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

## 5. 最佳实践

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

---

**参考规范**：ECMA-262 §19.1 The Global Object
