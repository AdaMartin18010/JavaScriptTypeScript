# Realm 与全局对象（Realm & Global Object）

> **形式化定义**：Realm（领域）是 ECMA-262 规范中定义的独立执行环境，包含一组内置对象（Intrinsics）、一个全局对象和一个全局环境记录。每个 JavaScript 执行上下文都在某个 Realm 中运行。ECMA-262 §9.3 定义了 Realm Record。
>
> 对齐版本：ECMA-262 16th ed §9.3 | TypeScript 5.8–6.0

---

## 1. 概念定义

### 1.1 Realm Record 的结构

```
Realm Record: {
  [[Intrinsics]]:       → 内置对象映射表
  [[GlobalObject]]:     → 全局对象 (window / global / globalThis)
  [[GlobalEnv]]:        → 全局环境记录
  [[TemplateMap]]:      → 模板字面量缓存
  [[LoadedModules]]:    → 已加载模块表
}
```

### 1.2 为什么需要 Realm？

Realm 的存在使得以下场景成为可能：

| 场景 | Realm 数量 | 说明 |
|------|-----------|------|
| 普通网页 | 1 | 默认 Realm |
| iframe | N | 每个 iframe 有自己的 Realm |
| Web Worker | N | Worker 运行在独立 Realm |
| ShadowRealm API | N | 程序化的 Realm 创建 |
| VM / 沙箱 | N | 如 Node.js 的 vm 模块 |

```javascript
// 不同 Realm 的 Array 不相等
const iframe = document.createElement('iframe')
document.body.appendChild(iframe)
const iframeArray = iframe.contentWindow.Array
console.log(Array === iframeArray)  // false
console.log([] instanceof iframeArray)  // false！
```

---

## 2. Intrinsics（内置对象映射）

### 2.1 关键内置对象

Realm 的 `[[Intrinsics]]` 字段包含所有标准内置对象的引用：

| 内置对象 | 全局访问路径 | 用途 |
|---------|-----------|------|
| `%Object%` | `Object` | 对象构造函数 |
| `%Array%` | `Array` | 数组构造函数 |
| `%Function%` | `Function` | 函数构造函数 |
| `%Promise%` | `Promise` | Promise 构造函数 |
| `%EvalError%` | `EvalError` | 错误类型 |
| `%JSON%` | `JSON` | JSON 工具对象 |
| `%Reflect%` | `Reflect` | 反射 API |
| `%Proxy%` | `Proxy` | 代理构造函数 |

### 2.2 跨 Realm 的原型链断裂

```javascript
const iframe = document.createElement('iframe')
document.body.appendChild(iframe)
const win = iframe.contentWindow

const arr = []
console.log(arr instanceof Array)           // true
console.log(arr instanceof win.Array)       // false！不同 Realm

// 安全的跨 Realm 类型检测
console.log(Array.isArray(arr))             // true ✅ 不依赖 Realm
console.log(Object.prototype.toString.call(arr))  // '[object Array]' ✅
```

---

## 3. ShadowRealm（ECMAScript 提案）

### 3.1 概念

ShadowRealm API 允许在 JavaScript 中程序化创建新的 Realm：

```javascript
// 提案语法（尚未广泛实现）
const realm = new ShadowRealm()
const result = realm.evaluate(`
  globalThis.x = 42
  x + 1
`)  // 返回 43，但不会影响当前 Realm 的全局对象
```

### 3.2 与 iframe / Worker 的区别

| 特性 | iframe | Worker | ShadowRealm |
|------|--------|--------|-------------|
| DOM 访问 | ✅ | ❌ | ❌ |
| 网络请求 | ✅ | ✅ | 受限 |
| 通信方式 | postMessage | postMessage | 返回值 |
| 创建开销 | 高（完整文档） | 中（新线程） | 低（纯 JS） |
| 标准化状态 | 成熟 | 成熟 | Stage 3 |

---

## 4. 全局对象的一致性

### 4.1 `globalThis` 的引入

ES2020 引入 `globalThis` 作为跨平台的统一全局对象访问方式：

| 环境 | 全局对象 | `globalThis` |
|------|---------|-------------|
| 浏览器 | `window` | ✅ 统一 |
| Node.js | `global` | ✅ 统一 |
| Web Worker | `self` | ✅ 统一 |
| Deno | `window` | ✅ 统一 |

---

## 5. 参考文献

- **ECMA-262 §9.3** — Realms
- **ECMA-262 §18** — The Global Object
- **ShadowRealm Proposal** — <https://github.com/tc39/proposal-shadowrealm>
- **MDN: globalThis** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis>

---

> 📅 最后更新：2026-04-27
> 📏 字节数：~3,500+
