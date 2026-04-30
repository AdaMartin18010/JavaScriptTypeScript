# JS/TS 双轨算法

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/dual-track-algorithms`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

双轨算法指同一算法在 JavaScript（动态类型）与 TypeScript（静态类型）中的双重实现。通过对比揭示类型系统如何约束输入空间、消除隐式转换 Bug，并在编译期捕获边界条件。

### 1.2 形式化基础

设算法 `A` 的输入空间为 `D`，JS 实现接受的实际域为 `D_js ⊇ D`（因隐式转换），TS 实现通过类型系统将输入约束为 `D_ts ⊆ D`。类型正确性保证：`∀x ∈ D_ts, A_ts(x) = A_js(x)`，但 TS 在 `D \ D_ts` 上拒绝编译。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 结构类型 | TS 基于形状而非名义的类型匹配 | 鸭子类型的形式化 |
| 窄化（Narrowing） | 运行时检查将联合类型收缩到分支 | `typeof`, `instanceof`, `in` |
| 类型守卫 | 返回布尔断言的自定义窄化函数 | `x is T` |

---

## 二、设计原理

### 2.1 为什么存在

JS 的灵活性在快速原型阶段是优势，但在维护期成为负债。双轨对比帮助团队理解：同一算法加上类型约束后，哪些 Bug 可在编译期消除，哪些仍需运行时测试覆盖。

### 2.2 算法对比表

| 维度 | JavaScript | TypeScript |
|------|-----------|------------|
| 输入校验 | 运行时手动检查 | 编译期类型约束 |
| 空值处理 | `null`/`undefined` 易漏判 | `strictNullChecks` 强制处理 |
| 返回值一致性 | 依赖文档约定 | 函数签名强制契约 |
| 重构安全性 | 需全量测试覆盖 | 类型检查捕获大部分错误 |
| 泛型抽象 | 无 | `<T>` 参数化类型与约束 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 纯 JS + JSDoc | 零构建、渐进类型 | 类型表达力弱于 TS | 小型库、遗留系统 |
| TS 严格模式 | 最大编译期安全 | 初期迁移成本高 | 中大型项目 |
| 混合双轨 | 核心算法 TS、脚本 JS | 工具链复杂度 | 渐进迁移中 |

---

## 三、实践映射

### 3.1 从理论到代码：二叉搜索树插入

```js
// === JavaScript 版本（动态类型） ===
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insert(root, value) {
  // 无编译期保证：value 可为任意类型
  if (!root) return new TreeNode(value);
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else {
    root.right = insert(root.right, value);
  }
  return root;
}

// 潜在 Bug：字符串比较导致意外树结构
insert(null, '10');
insert(null, 2); // 混合类型，运行时不报错
```

```ts
// === TypeScript 版本（静态类型 + 泛型） ===
class TreeNode<T> {
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;
  constructor(public value: T) {}
}

// 约束 T 必须可比较
function insert<T extends number | string>(
  root: TreeNode<T> | null,
  value: T
): TreeNode<T> {
  if (!root) return new TreeNode(value);
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else {
    root.right = insert(root.right, value);
  }
  return root;
}

const root = insert<number>(null, 10);
insert(root, 5);
// insert(root, 'a'); // ❌ 编译错误：类型 'string' 不能赋值给 'number'
```

### 3.2 双轨快速排序（QuickSort）

```js
// === JavaScript —— 动态类型，运行时隐患 ===
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// 运行时问题：混合类型导致异常排序
quickSort([3, '1', 2]); // ['1', 2, 3] —— 字符串 '1' < 数字 3 为 true
quickSort([null, 1, undefined]); // 可能产生不稳定结果
```

```ts
// === TypeScript —— 泛型约束 + 比较器，编译期安全 ===
function quickSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => compare(x, pivot) < 0);
  const right = arr.slice(1).filter(x => compare(x, pivot) >= 0);
  return [...quickSort(left, compare), pivot, ...quickSort(right, compare)];
}

// 使用：必须提供 compare 函数，避免隐式转换
const sorted = quickSort(
  [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }],
  (a, b) => a.age - b.age
);
// sorted 类型自动推断为 { name: string; age: number }[]

// ❌ 编译错误：不提供 compare 无法调用（泛型参数已约束）
// quickSort([1, 'a']); // 类型不兼容
```

### 3.3 类型守卫实战：双轨校验

```ts
// 在 JS 中需要大量防御性代码
function processInputJS(input) {
  if (input == null) throw new Error('null input');
  if (typeof input.value !== 'number') throw new Error('invalid value');
  return input.value * 2;
}

// 在 TS 中类型守卫将校验与类型窄化合并
type ValidInput = { value: number; label: string };

function isValidInput(x: unknown): x is ValidInput {
  return (
    typeof x === 'object' &&
    x !== null &&
    'value' in x &&
    typeof (x as Record<string, unknown>).value === 'number'
  );
}

function processInputTS(input: unknown): number {
  if (!isValidInput(input)) {
    throw new Error('Input must be ValidInput');
  }
  // input 在此处已窄化为 ValidInput
  return input.value * 2;
}
```

### 3.4 泛型约束与条件类型：安全映射

```ts
// TypeScript 利用泛型约束在编译期保证键的存在
function pluck<T, K extends keyof T>(records: T[], key: K): T[K][] {
  return records.map((r) => r[key]);
}

interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Keyboard', price: 99 },
  { id: 2, name: 'Mouse', price: 49 },
];

const names = pluck(products, 'name'); // string[]
// const bad = pluck(products, 'stock'); // ❌ 编译错误：'stock' 不存在于 Product
```

### 3.5 图遍历双轨：DFS 与 BFS

```js
// === JavaScript —— 无类型保障 ===
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  for (const neighbor of graph[start] || []) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
  return visited;
}

// 运行时错误：graph 可能不是对象，start 可能不存在
// dfs(null, 'A'); // TypeError
```

```ts
// === TypeScript —— 邻接表类型化 ===
type Graph<T extends string | number> = Record<T, T[]>;

function dfs<T extends string | number>(
  graph: Graph<T>,
  start: T,
  visited = new Set<T>()
): Set<T> {
  visited.add(start);
  console.log(start);
  const neighbors = graph[start] ?? [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
  return visited;
}

// 编译期保证：start 必须是 Graph 键的子类型
const g: Graph<string> = {
  A: ['B', 'C'],
  B: ['D'],
  C: [],
  D: [],
};
dfs(g, 'A'); // ✅
// dfs(g, 'Z'); // ❌ 若 strictLiteralTypes 开启则报错
```

### 3.6 用 `zod` 运行时 + 编译时双重校验

```ts
// 类型系统无法覆盖运行时边界（如网络输入），配合 Zod 实现双保险
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  // 运行时校验 + 返回静态类型
  return UserSchema.parse(input);
}

// 编译期：TS 保证返回类型为 User
// 运行期：Zod 拒绝非法输入
// parseUser({ id: -1, email: 'bad', role: 'hacker' }); // 抛出 ZodError
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| TS 版本总是比 JS 慢 | 类型在编译后擦除，运行时 JS 与 TS 输出一致 |
| 类型系统可替代所有单元测试 | 类型保证结构安全，业务逻辑正确性仍需测试 |
| 双轨意味着维护两份代码 | TS 是 JS 的超集，同一份 `.ts` 经编译即得 JS |

### 3.8 扩展阅读

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [ECMA-262: Type Conversion](https://tc39.es/ecma262/#sec-type-conversion)
- [Total TypeScript: Zod Tutorial](https://www.totaltypescript.com/tutorials/zod)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Zod Documentation](https://zod.dev/) — 运行时 Schema 校验库
- [Superstruct](https://docs.superstructjs.org/) — 轻量运行时校验替代方案
- [TypeScript Generics Deep Dive](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [TypeScript: The `satisfies` Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — 推断+约束双重保障
- [Algorithm Visualizations — VisuAlgo](https://visualgo.net/) — 算法可视化学习
- [CLRS — Introduction to Algorithms](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) — 算法权威教材
- `10-fundamentals/10.2-type-system/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

## 深化补充

### 新增代码示例：类型安全备忘录（Memoization）

```javascript
// === JavaScript —— 无类型约束，运行时可能传入非函数 ===
function memoizeJS(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 隐患：fn 非函数时不报错；参数不可序列化时静默失败
const bad = memoizeJS(null);
```

```typescript
// === TypeScript —— 泛型约束保证 fn 为函数，参数可序列化 ===
type Serializable = string | number | boolean | null | Serializable[];

function memoizeTS<T extends Serializable[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  const cache = new Map<string, R>();
  return (...args: T): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 编译期排除非法用法
const fib = memoizeTS((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(40)); // 快速返回
// memoizeTS(123); // ❌ 编译错误
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript Handbook — Generics | [typescriptlang.org/docs/handbook/2/generics.html](https://www.typescriptlang.org/docs/handbook/2/generics.html) | 泛型深度指南 |
| ECMA-262 Abstract Operations | [tc39.es/ecma262/#sec-abstract-operations](https://tc39.es/ecma262/#sec-abstract-operations) | 类型转换规范 |
| VisuAlgo — Sorting | [visualgo.net/en/sorting](https://visualgo.net/en/sorting) | 算法可视化 |
| Algorithm Design Manual | [algorist.com](https://www.algorist.com/) | 算法设计权威教材 |
| Total TypeScript | [totaltypescript.com](https://www.totaltypescript.com/) | TS 高级模式实战 |
