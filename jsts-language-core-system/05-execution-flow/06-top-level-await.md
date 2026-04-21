# 顶层 await（Top-Level Await）

> 模块顶层使用 await 的语义、影响与最佳实践
>
> 对齐版本：ECMAScript 2022 (ES13) | ES2025

---

## 1. 基本用法

```javascript
// module.js
const response = await fetch("/api/config");
const config = await response.json();

export { config };
```

---

## 2. 模块加载语义

顶层 await 会阻塞模块图的执行：

```javascript
// a.js
console.log("a start");
await new Promise(resolve => setTimeout(resolve, 100));
console.log("a end");
export const value = "a";

// b.js
import { value } from "./a.js";
console.log("b", value);

// main.js
import "./b.js";
console.log("main");

// 输出：
// a start
// a end
// b a
// main
```

---

## 3. 使用场景

### 3.1 动态导入

```javascript
const { default: lodash } = await import("lodash");
```

### 3.2 初始化

```javascript
const connection = await createDatabaseConnection();
export { connection };
```

### 3.3 资源加载

```javascript
const config = await (await fetch("/config.json")).json();
export default config;
```

---

## 4. 注意事项

### 4.1 性能影响

顶层 await 会阻塞依赖该模块的所有模块：

```javascript
// ❌ 避免在通用工具模块中使用顶层 await
export const data = await fetchData(); // 阻塞所有导入 utils 的模块

// ✅ 使用函数延迟加载
export async function getData() {
  return await fetchData();
}
```

### 4.2 仅适用于模块

```javascript
// ❌ 脚本中不能使用顶层 await
<script>
  const data = await fetch("/api"); // SyntaxError
</script>

// ✅ 模块中可以使用
<script type="module">
  const data = await fetch("/api"); // ✅
</script>
```

---

**参考规范**：ECMA-262 §16.2.1.5 TopLevelModuleEvaluationJob
