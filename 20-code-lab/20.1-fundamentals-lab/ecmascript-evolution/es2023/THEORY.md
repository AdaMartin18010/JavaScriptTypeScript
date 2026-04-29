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

### 3.2 Hashbang Grammar

```js
#!/usr/bin/env node
// 脚本可直接作为可执行文件运行（Node.js ≥ 20 已原生支持）
console.log('Hello from ES2023 hashbang');
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 不可变方法性能更差 | 现代引擎对副本方法有优化，大数组可测后再决策 |
| `findLast` 仅用于数字数组 | 适用于任何可索引集合，包括 `TypedArray` |
| 旧环境无法使用 | core-js 提供完整 polyfill，Babel 可转译 |

### 3.4 扩展阅读

- [ECMAScript 2023 Language Specification](https://262.ecma-international.org/14.0/)
- [MDN: Array.prototype.toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [MDN: Array.prototype.findLast](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
- [TC39 Proposal: Change Array by Copy](https://github.com/tc39/proposal-change-array-by-copy)
- [V8 Dev: New in JavaScript ES2023](https://v8.dev/features/tags/es2023)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
