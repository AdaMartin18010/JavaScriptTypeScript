# 顶层 await

> ES2022 顶层 await 的执行语义与模块加载顺序影响
>
> 对齐版本：ECMAScript 2022 (ES13) 及之后

---

## 1. 语法与基本语义

模块顶层可以直接使用 `await`：

```javascript
// data.js
const response = await fetch("/api/config");
export const config = await response.json();
```

### 1.1 隐式 async 模块包装

顶层 await 的模块在内部被包装为 async 函数：

```javascript
// 源码
const data = await fetchData();
export { data };

// 大致等价的内部处理：
export default (async () => {
  const data = await fetchData();
  return { data };
})();
```

---

## 2. 模块加载顺序影响

### 2.1 顶层 await 导致的模块执行暂停

```javascript
// slow.js
await new Promise(resolve => setTimeout(resolve, 1000));
export const value = "loaded";

// main.js
import { value } from "./slow.js";
console.log(value); // 1 秒后输出 "loaded"
```

### 2.2 依赖模块的加载阻塞

```javascript
// a.js
import { b } from "./b.js"; // b.js 有顶层 await，a.js 等待
console.log(b);

// b.js
await new Promise(r => setTimeout(r, 500));
export const b = "B";
```

---

## 3. 与动态导入的结合

```javascript
// 条件导入
const locale = navigator.language;
const messages = await import(`./locales/${locale}.js`);

// 并行动态导入
const [moduleA, moduleB] = await Promise.all([
  import("./a.js"),
  import("./b.js")
]);
```

---

## 4. 浏览器与 Node.js 支持

### 4.1 模块类型要求

顶层 await 只能在 ES Module 中使用：

```html
<!-- 浏览器 -->
<script type="module">
  const data = await fetch("/api");
</script>
```

```javascript
// Node.js（package.json 中 "type": "module"）
const fs = await import("fs");
```

### 4.2 错误处理

```javascript
try {
  const data = await riskyOperation();
} catch (error) {
  console.error("Module init failed:", error);
}
```

---

## 5. 最佳实践

### 5.1 避免过长的顶层 await

```javascript
// ❌ 阻塞模块初始化
const data = await fetchHugeDataset(); // 10 秒

// ✅ 延迟加载
export async function getData() {
  return fetchHugeDataset();
}
```

### 5.2 并行加载策略

```javascript
// ✅ 并行加载
const [config, translations] = await Promise.all([
  fetch("/api/config"),
  fetch("/api/translations")
]);
```

### 5.3 降级方案

```javascript
// 为不支持顶层 await 的环境提供降级
let config;
try {
  config = await loadConfig();
} catch {
  config = defaultConfig;
}
export { config };
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 顶层 await 导致的启动延迟 | 模块等待 I/O 阻塞后续模块加载 | 使用 Promise.all 并行化 |
| 隐式模块 async 的副作用 | 模块导出变为 Promise-like | 确保消费者正确处理 |
| 循环依赖 + 顶层 await | 可能导致死锁 | 避免循环依赖中的顶层 await |

---

**参考规范**：ECMA-262 §16.2.1.5 AsyncModuleExecutionFulfilled
