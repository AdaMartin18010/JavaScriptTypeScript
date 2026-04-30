# ES2023 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2023`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

ES2023（ECMAScript 14）引入了 4 组不可变数组方法以及从末端搜索的 API，解决 `Array.prototype.sort`/`reverse`/`splice` 等可变操作带来的副作用与调试难题。

### 1.2 形式化基础

不可变操作满足引用透明性：`toSorted(arr, compareFn)` 返回新数组且不改变 `arr` 的内存视图，语义上等价于 `arr.slice().sort(compareFn)`，但引擎可执行优化路径。

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| 不可变数组方法 | 返回副本而非就地修改原数组 | `toSorted`, `toReversed`, `toSpliced`, `with` |
| 末端搜索 | 从数组末尾向前查找匹配元素 | `findLast`, `findLastIndex` |
| `Hashbang` | 脚本首行允许 `#!/usr/bin/env node` 语法 | CLI 工具 |

---

## 二、设计原理

### 2.1 为什么存在

React/Vue 等框架要求状态不可变，`arr.sort()` 违反该原则且导致难以追踪的副作用。ES2023 在语言层面提供不可变原语，减少样板代码与拷贝开销。

### 2.2 特性速查表

| 特性 | 方法签名 | 对应可变方法 | 返回值 |
|------|----------|-------------|--------|
| 排序副本 | `arr.toSorted(compareFn?)` | `arr.sort()` | 新数组 |
| 反转副本 | `arr.toReversed()` | `arr.reverse()` | 新数组 |
| 替换副本 | `arr.with(index, value)` | `arr[index] = value` | 新数组 |
| 拼接副本 | `arr.toSpliced(start, deleteCount, ...items)` | `arr.splice(...)` | 新数组 |
| 末端查找 | `arr.findLast(predicate)` | — | 元素/undefined |
| 末端索引 | `arr.findLastIndex(predicate)` | — | 索引/`-1` |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生不可变方法 | 语义清晰、引擎优化 | 旧浏览器需 polyfill | 现代运行时 |
| `arr.slice().sort()` | 全平台兼容 | 额外拷贝、语义噪音 | 遗留系统 |

---

## 三、实践映射

### 3.1 从理论到代码

```js
// === 不可变数组方法 ===
const nums = [3, 1, 4, 1, 5];

// toSorted: 原数组不变
const sorted = nums.toSorted((a, b) => a - b);
console.log(sorted); // [1, 1, 3, 4, 5]
console.log(nums);   // [3, 1, 4, 1, 5] 不变

// toReversed
const rev = nums.toReversed();
console.log(rev); // [5, 1, 4, 1, 3]

// with: 非破坏性替换
const patched = nums.with(2, 99);
console.log(patched); // [3, 1, 99, 1, 5]

// toSpliced
const spliced = nums.toSpliced(1, 2, 'a', 'b');
console.log(spliced); // [3, 'a', 'b', 1, 5]

// === 末端查找 ===
const users = [
  { id: 1, role: 'user' },
  { id: 2, role: 'admin' },
  { id: 3, role: 'user' },
  { id: 4, role: 'admin' },
];

// 找最后一个 admin
const lastAdmin = users.findLast(u => u.role === 'admin');
console.log(lastAdmin.id); // 4

const lastAdminIndex = users.findLastIndex(u => u.role === 'admin');
console.log(lastAdminIndex); // 3
```

### 3.2 与 TypedArray 的兼容性

```js
// ES2023 方法同样适用于所有 TypedArray 变体
const uint8 = new Uint8Array([3, 1, 4, 1, 5]);

const sortedUint8 = uint8.toSorted((a, b) => b - a);
console.log(sortedUint8); // Uint8Array [5, 4, 3, 1, 1]
console.log(uint8);       // Uint8Array [3, 1, 4, 1, 5] 原数组不变

// BigInt64Array 同样支持
const bigints = new BigInt64Array([3n, 1n, 4n]);
const sortedBigints = bigints.toSorted((a, b) => (a < b ? -1 : 1));
console.log(sortedBigints); // BigInt64Array [1n, 3n, 4n]
```

### 3.3 React 状态管理中的不可变更新

```tsx
// 使用 ES2023 方法简化 React 状态更新
import { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn ES2023', done: false },
    { id: 2, text: 'Build app', done: false },
  ]);

  function toggleTodo(id: number) {
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return;

    // ✅ ES2023: 简洁的不可变替换
    setTodos(prev => prev.with(index, {
      ...prev[index],
      done: !prev[index].done,
    }));

    // ❌ 旧方式: 需要展开或使用 slice + concat
    // setTodos(prev => [
    //   ...prev.slice(0, index),
    //   { ...prev[index], done: !prev[index].done },
    //   ...prev.slice(index + 1),
    // ]);
  }

  function removeTodo(id: number) {
    const index = todos.findIndex(t => t.id === id);
    setTodos(prev => prev.toSpliced(index, 1));
  }

  function addTodo(text: string) {
    const newTodo = { id: Date.now(), text, done: false };
    setTodos(prev => prev.toSpliced(prev.length, 0, newTodo));
  }

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => toggleTodo(todo.id)}>Toggle</button>
          <button onClick={() => removeTodo(todo.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

### 3.4 Hashbang Grammar

```js
#!/usr/bin/env node
// 脚本可直接作为可执行文件运行（Node.js ≥ 20 已原生支持）
console.log('Hello from ES2023 hashbang');
```

### 3.5 Polyfill 与兼容性处理

```js
// core-js polyfill 使用方式
import 'core-js/actual/array/to-sorted';
import 'core-js/actual/array/to-reversed';
import 'core-js/actual/array/to-spliced';
import 'core-js/actual/array/with';
import 'core-js/actual/array/find-last';
import 'core-js/actual/array/find-last-index';

// 或者使用 es-shims
const toSorted = require('array.prototype.tosorted');
const shimmed = toSorted.shim(); // 自动挂载到 Array.prototype
```

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| 不可变方法性能更差 | 现代引擎对副本方法有优化，大数组可测后再决策 |
| `findLast` 仅用于数字数组 | 适用于任何可索引集合，包括 `TypedArray` |
| 旧环境无法使用 | core-js 提供完整 polyfill，Babel 可转译 |
| `toSpliced` 与 `slice` 等价 | `toSpliced` 可在任意位置插入/删除，`slice` 仅截取 |

### 3.7 扩展阅读

- [ECMAScript 2023 Language Specification](https://262.ecma-international.org/14.0/)
- [MDN: Array.prototype.toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [MDN: Array.prototype.findLast](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
- [TC39 Proposal: Change Array by Copy](https://github.com/tc39/proposal-change-array-by-copy)
- [V8 Dev: New in JavaScript ES2023](https://v8.dev/features/tags/es2023)
- [core-js: ES2023 Polyfills](https://github.com/zloirock/core-js#ecmascript-array)
- [Can I Use: ES2023 Array Methods](https://caniuse.com/?search=toSorted)
- [SpiderMonkey ES2023 Implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=1798015)
- [Node.js v20 Release Notes — Hashbang](https://nodejs.org/en/blog/release/v20.0.0)
- `30-knowledge-base/30.1-language-evolution`

---

### 3.5 引擎优化与内存考量

```js
// 现代引擎（V8 12+、SpiderMonkey 125+）对 toSorted 采用写时复制优化
const large = new Array(1_000_000).fill(0).map((_, i) => i);
console.time('native');
const sorted1 = large.toSorted((a, b) => b - a);
console.timeEnd('native');
console.time('manual');
const sorted2 = large.slice().sort((a, b) => b - a);
console.timeEnd('manual');
```

### 3.6 findLast 在时间序列分析中的应用

```js
const prices = [100, 105, 102, 110, 108, 115, 113];
const lastBelow110 = prices.findLast(p => p < 110); // 108
const lastIndex = prices.findLastIndex(p => p < 110); // 4
```

---

## 更多权威参考链接

- [V8 Blog: ES2023 Features](https://v8.dev/features/tags/es2023) -- V8 引擎实现与优化细节
- [SpiderMonkey Change Array By Copy](https://bugzilla.mozilla.org/show_bug.cgi?id=1712140) -- Firefox 实现跟踪
- [Node.js v20 Array Methods](https://nodejs.org/docs/latest-v20.x/api/globals.html) -- Node.js 全局 API 文档
- [Safari Release Notes: ES2023](https://webkit.org/blog/13966/webkit-features-in-safari-16-6/) -- WebKit 支持说明

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
