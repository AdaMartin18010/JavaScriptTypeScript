# ES2024 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2024`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

ES2024（ECMAScript 15）引入分组聚合原语、Promise 辅助构造、字符串 Unicode 校验以及 ArrayBuffer 转移能力，解决数据聚合、异步初始化与底层内存管理的工程痛点。

### 1.2 形式化基础

`Object.groupBy` 是一个高阶归约操作，语义上等价于 `Array.prototype.reduce` 构建 Map，但保证键的枚举顺序与迭代顺序一致，且对 `null`/`undefined` 数组抛出 `TypeError`。

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| 分组聚合 | 按回调返回值将可迭代对象分组为对象或 Map | `Object.groupBy`, `Map.groupBy` |
| Promise 构造辅助 | 将外部回调式 API 包裹为 Promise | `Promise.withResolvers` |
| Well-Formed Unicode | 检测并修复代理对不完整字符串 | `isWellFormed`, `toWellFormed` |

---

## 二、设计原理

### 2.1 为什么存在

Lodash/Underscore 的 `groupBy` 使用广泛但非标准；`new Promise((res, rej) => ...)` 的回调嵌套在复杂异步场景中冗余。ES2024 将这些高频需求标准化。

### 2.2 特性速查表

| 特性 | 方法签名 | 说明 | 提案 |
|------|----------|------|------|
| 对象分组 | `Object.groupBy(iterable, callbackFn)` | 返回对象，键强制转字符串 | tc39/proposal-array-grouping |
| Map 分组 | `Map.groupBy(iterable, callbackFn)` | 返回 Map，键任意类型 | tc39/proposal-array-grouping |
| Promise 解析器 | `Promise.withResolvers()` | 返回 `{promise, resolve, reject}` | tc39/proposal-promise-with-resolvers |
| Unicode 校验 | `str.isWellFormed()` | 检测孤立代理码元 | tc39/proposal-is-usv-string |
| Unicode 修复 | `str.toWellFormed()` | 替换孤立代理为 `\uFFFD` | tc39/proposal-is-usv-string |
| ArrayBuffer 转移 | `buf.transfer(?newLength)` | 转移底层内存块所有权 | tc39/proposal-arraybuffer-transfer |
| Atomics 异步等待 | `Atomics.waitAsync(...)` | SharedArrayBuffer 非阻塞等待 | tc39/proposal-atomics-wait-async |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| `Object.groupBy` | 原生、零依赖 | 键仅字符串/Symbol | 键为字符串的数据透视 |
| `Map.groupBy` | 任意类型键 | 非 JSON 可序列化 | 对象键/复杂键分组 |
| `Promise.withResolvers` | 避免外层变量泄漏 | 新增 API 需学习 | 需要外部 resolve 的场景 |

---

## 三、实践映射

### 3.1 从理论到代码

```js
// === Object.groupBy / Map.groupBy ===
const products = [
  { name: 'Apple', category: 'fruit', price: 1.2 },
  { name: 'Carrot', category: 'vegetable', price: 0.8 },
  { name: 'Banana', category: 'fruit', price: 0.5 },
];

// 按 category 分组为对象
const byCategory = Object.groupBy(products, p => p.category);
// {
//   fruit: [{ name: 'Apple', ... }, { name: 'Banana', ... }],
//   vegetable: [{ name: 'Carrot', ... }]
// }

// 按价格区间分组为 Map
const byPriceRange = Map.groupBy(products, p =>
  p.price > 1 ? 'expensive' : 'cheap'
);
console.log(byPriceRange.get('cheap')); // [{Carrot}, {Banana}]

// === Promise.withResolvers ===
function createCancellableRequest(url) {
  const { promise, resolve, reject } = Promise.withResolvers();
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(resolve)
    .catch(reject);

  return {
    promise,
    cancel: () => controller.abort(),
  };
}

// === String.prototype.toWellFormed ===
const bad = 'Hello \uD800'; // 孤立高位代理
console.log(bad.isWellFormed());   // false
console.log(bad.toWellFormed());   // 'Hello \uFFFD'

// === ArrayBuffer.transfer ===
const oldBuf = new ArrayBuffer(1024);
const newBuf = oldBuf.transfer(512); // 转移所有权并缩小
console.log(oldBuf.byteLength);      // 0（已分离）
console.log(newBuf.byteLength);      // 512
```

### 3.2 高级代码示例

#### `Atomics.waitAsync` 非阻塞同步原语

```javascript
// main.js — 主线程
const shared = new SharedArrayBuffer(4);
const int32 = new Int32Array(shared);

const worker = new Worker('./worker.js', { type: 'module' });
worker.postMessage(shared);

// 非阻塞等待 Worker 信号
const result = Atomics.waitAsync(int32, 0, 0);
// result.value 是 Promise
result.value.then(status => {
  console.log('Worker signaled:', status); // "ok"
  console.log('Updated value:', int32[0]); // 42
});
```

```javascript
// worker.js — Worker 线程
self.onmessage = ({ data: shared }) => {
  const int32 = new Int32Array(shared);
  // 模拟耗时计算
  performHeavyComputation();
  int32[0] = 42;
  Atomics.notify(int32, 0, 1); // 通知主线程
};
```

#### 复杂分组：多级透视表

```javascript
// 多级分组：先按 category 分，再按 priceRange 分
const inventory = [
  { name: 'MacBook', category: 'electronics', price: 1999 },
  { name: 'iPhone', category: 'electronics', price: 999 },
  { name: 'Banana', category: 'grocery', price: 1 },
  { name: 'Steak', category: 'grocery', price: 25 },
];

const pivot = Object.groupBy(inventory, item => item.category);
// 对每组继续按价格区间细分
for (const [category, items] of Object.entries(pivot)) {
  pivot[category] = Object.groupBy(
    items,
    item => item.price > 100 ? 'premium' : 'budget'
  );
}

console.log(pivot.electronics.premium); // [{MacBook}, {iPhone}]
console.log(pivot.grocery.budget);      // [{Banana}]
```

#### `Promise.withResolvers` 实现带超时限制的请求

```javascript
function fetchWithTimeout(url, timeoutMs = 5000) {
  const { promise, resolve, reject } = Promise.withResolvers();
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
    reject(new Error(`Request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  fetch(url, { signal: controller.signal })
    .then(response => {
      clearTimeout(timer);
      resolve(response);
    })
    .catch(err => {
      clearTimeout(timer);
      reject(err);
    });

  return promise;
}

// 使用示例
fetchWithTimeout('https://api.example.com/data', 3000)
  .then(r => r.json())
  .catch(console.error);
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| `groupBy` 返回数组副本 | 返回原始元素引用，修改会影响源数组 |
| `Promise.withResolvers` 只是语法糖 | 它在标准中统一了非标准库中的 Defer 模式 |
| `transfer` 是拷贝 | 是所有权转移，旧 ArrayBuffer 变为 detached |

### 3.4 扩展阅读

- [ECMAScript 2024 Language Specification](https://262.ecma-international.org/15.0/)
- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN: Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
- [MDN: ArrayBuffer.prototype.transfer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer)
- [MDN: Atomics.waitAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/waitAsync)
- [TC39 Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [V8 Features: ES2024](https://v8.dev/features/tags/es2024)
- [Can I use — Object.groupBy](https://caniuse.com/mdn-javascript_builtins_object_groupby)
- [Node.green — ES2024 compat](https://node.green/#ES2024)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
