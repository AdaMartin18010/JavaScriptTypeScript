# 全局对象与 globalThis

> JavaScript 全局作用域的统一抽象
>
> 对齐版本：ECMAScript 2020 (ES11) 及之后

---

## 1. 全局对象的差异

不同 JavaScript 运行环境有不同的全局对象：

| 环境 | 全局对象 | 说明 |
|------|---------|------|
| 浏览器 | `window` | 包含 DOM、BOM API |
| Node.js | `global` | 包含 process、Buffer 等 |
| Web Worker | `self` | 与 window 类似但无 DOM |
| 严格模式函数 | `undefined` | 严格模式下函数内 this 为 undefined |

---

## 2. globalThis（ES2020）

`globalThis` 提供**跨平台统一的全局 this 引用**：

```javascript
// 在所有环境中都指向全局对象
console.log(globalThis === window);     // true（浏览器）
console.log(globalThis === global);     // true（Node.js）
console.log(globalThis === self);       // true（Web Worker）
```

**优势**：
- 无需环境检测即可访问全局对象
- 在模块和严格模式下可靠工作

---

## 3. 全局变量声明

### 3.1 var 声明与全局对象

```javascript
var globalVar = 1;
console.log(globalThis.globalVar); // 1（var 声明成为全局对象属性）
```

### 3.2 let/const 与全局对象

```javascript
let globalLet = 2;
const globalConst = 3;
console.log(globalThis.globalLet);   // undefined
console.log(globalThis.globalConst); // undefined
```

### 3.3 直接赋值与全局对象

```javascript
// 非严格模式下，直接赋值会创建全局对象属性
function test() {
  undeclared = 1; // 非严格模式：globalThis.undeclared = 1
}
```

---

## 4. 全局环境记录

全局环境记录由两部分组成：
- **对象环境记录**：管理 `var` 声明和函数声明，绑定到全局对象
- **声明式环境记录**：管理 `let/const/class` 声明

```
GlobalEnvironmentRecord: {
  ObjectEnvironmentRecord: { /* var, function */ },
  DeclarativeEnvironmentRecord: { /* let, const, class */ },
  GlobalThisValue: globalThis
}
```

---

## 5. 最佳实践

### 5.1 避免全局变量污染

```javascript
// ❌ 避免
var utils = { ... }; // 污染全局

// ✅ 使用模块
export const utils = { ... };
```

### 5.2 globalThis 的适用场景

```javascript
// 跨平台存储全局状态（谨慎使用）
globalThis.__app_config__ = { version: "1.0.0" };

// 检查 Polyfill 是否已存在
if (!globalThis.structuredClone) {
  globalThis.structuredClone = polyfill;
}
```

---

**参考规范**：ECMA-262 §9.3.4 Global Environment Records | ECMA-262 §19.1.1 The globalThis Property
