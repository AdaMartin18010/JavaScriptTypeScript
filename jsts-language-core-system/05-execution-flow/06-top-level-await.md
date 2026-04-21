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

### 2.1 模块图阻塞

```javascript
// utils.js
export const data = await fetchData(); // 阻塞所有导入 utils 的模块

// app.js
import { data } from "./utils.js"; // 等待 utils.js 的顶层 await 完成
console.log("app");

// main.js
import "./app.js"; // 等待 app.js 完成
console.log("main");
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

### 3.4 条件导入

```javascript
const env = process.env.NODE_ENV;
const config = env === "production"
  ? await import("./config.prod.js")
  : await import("./config.dev.js");
export default config.default;
```

---

## 4. 注意事项

### 4.1 性能影响

顶层 await 会阻塞依赖该模块的所有模块：

```javascript
// ❌ 避免在通用工具模块中使用顶层 await
// utils.js
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

### 4.3 循环依赖

顶层 await 可能导致循环依赖问题：

```javascript
// a.js
import { b } from "./b.js";
export const a = await Promise.resolve("a");

// b.js
import { a } from "./a.js"; // 可能死锁！
export const b = "b";
```

---

## 5. 浏览器与运行时支持

| 环境 | 支持状态 |
|------|---------|
| Chrome 89+ | ✅ |
| Firefox 89+ | ✅ |
| Safari 15+ | ✅ |
| Node.js 14.8+ | ✅（ES Module） |
| TypeScript 3.8+ | ✅ |

---

## 6. 降级方案

```javascript
// 无顶层 await 的替代方案
// utils.js
let _config;

export async function getConfig() {
  if (!_config) {
    const res = await fetch("/config.json");
    _config = await res.json();
  }
  return _config;
}
```

## 7. 模块加载算法

顶层 await 影响模块加载顺序：

```
1. 解析模块依赖图
2. 实例化模块（创建环境记录）
3. 评估模块（执行模块体）
   - 遇到顶层 await：暂停当前模块评估
   - 等待 Promise 解决后继续
4. 依赖该模块的模块等待其评估完成
```

## 8. 并发加载

```javascript
// 并行加载（无依赖）
const [users, posts] = await Promise.all([
  import("./users.js"),
  import("./posts.js")
]);

// 串行加载（有依赖）
const config = await import("./config.js");
const api = await import("./api.js"); // 依赖 config
```

## 9. 测试中的顶层 await

```javascript
// test.mjs
import { describe, it } from "node:test";
import assert from "node:assert";

const db = await setupTestDatabase();

describe("User API", () => {
  it("should create user", async () => {
    const user = await db.createUser({ name: "Alice" });
    assert.equal(user.name, "Alice");
  });
});

await db.cleanup();
```

---

**参考规范**：ECMA-262 §16.2.1.5 TopLevelModuleEvaluationJob

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
