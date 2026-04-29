# 递归算法

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/recursion`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决自相似问题的优雅表达问题。通过递归、尾递归优化与迭代将复杂问题分解为可复用的子问题。

### 1.2 形式化基础

- **递归**由基例（base case）和递归步（recursive step）构成。
- **尾递归**：递归调用是函数的最后操作，可被编译器优化为迭代（TCO）。
- **时间/空间**：递归深度 n 带来 O(n) 调用栈空间；尾递归优化后空间可降至 O(1)。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 基例 | 递归终止的条件分支 | base-cases.ts |
| 尾递归 | 可优化的线性递归形式 | tail-recursion.ts |
| 分治 | 将问题分解为独立子问题递归求解 | divide-conquer.ts |

---

## 二、设计原理

### 2.1 为什么存在

自相似问题（树、图、数学归纳）用递归表达最为自然。递归将复杂问题分解为规模更小的同构子问题，是分治和回溯算法的核心思想。

### 2.2 递归 vs 迭代 vs 尾递归

| 形式 | 优点 | 缺点 | 空间复杂度 | 适用场景 |
|------|------|------|-----------|---------|
| 普通递归 | 简洁、与数学定义直接映射 | 栈溢出风险 | O(n) | 树形遍历、回溯 |
| 迭代 | 安全可控、无栈溢出 | 代码冗长、状态手动维护 | O(1) | 线性结构、性能敏感 |
| 尾递归 | 递归的简洁 + 迭代的性能潜力 | JS 引擎 TCO 支持有限 | O(1)（需优化）| 线性递归、函数式风格 |

### 2.3 与相关技术的对比

与迭代对比：递归表达力更强，迭代通常性能更优。尾递归试图兼顾两者，但 JavaScript 仅在严格模式且引擎支持（如 Safari JSC）时生效。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **二叉树遍历** 的递归、迭代与尾递归三种实现对比：

```typescript
// tree-traversal.ts
// 递归 / 迭代 / 尾递归 二叉树中序遍历

interface TreeNode<T> {
  val: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

// 1. 经典递归：代码最短，但深树可能栈溢出
function inorderRecursive<T>(root: TreeNode<T> | undefined, out: T[] = []): T[] {
  if (!root) return out;
  inorderRecursive(root.left, out);
  out.push(root.val);
  inorderRecursive(root.right, out);
  return out;
}

// 2. 迭代：显式栈，无调用栈溢出风险
function inorderIterative<T>(root: TreeNode<T> | undefined): T[] {
  const out: T[] = [];
  const stack: TreeNode<T>[] = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop()!;
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}

// 3. 尾递归风格（需配合蹦床 trampoline 才能在 JS 中安全运行）
type Tramp<T> = T | (() => Tramp<T>);
function trampoline<T>(f: Tramp<T>): T {
  while (typeof f === 'function') f = (f as () => Tramp<T>)();
  return f;
}

function inorderTail<T>(
  root: TreeNode<T> | undefined,
  cont: (acc: T[]) => T[] = x => x
): () => Tramp<T[]> {
  return () => {
    if (!root) return cont([]);
    return inorderTail(root.left, leftAcc =>
      inorderTail(root.right, rightAcc =>
        cont([...leftAcc, root.val, ...rightAcc])
      )()
    )();
  };
}

// 可运行示例
const tree: TreeNode<number> = {
  val: 4,
  left: { val: 2, left: { val: 1 }, right: { val: 3 } },
  right: { val: 6, left: { val: 5 }, right: { val: 7 } },
};

console.log('Recursive:', inorderRecursive(tree));   // [1,2,3,4,5,6,7]
console.log('Iterative:', inorderIterative(tree));   // [1,2,3,4,5,6,7]
console.log('Tail+Tramp:', trampoline(inorderTail(tree))); // [1,2,3,4,5,6,7]
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 尾递归一定被优化 | JS 引擎对尾递归优化（TCO）支持不一致；Node/V8 已移除 ES6 TCO |
| 递归比迭代更慢 | 递归有函数调用开销，但可读性可能更重要；可用蹦床消除栈风险 |
| 所有递归都能改尾递归 | 树的多分支递归无法直接改尾递归，需引入 CPS 转换 |

### 3.3 扩展阅读

- [Tail Call Optimization — ECMAScript Spec](https://262.ecma-international.org/14.0/?_gl=1*1x3v6yq*_ga*MTM2NjY3NDE2OC4xNzE3MTY0NTg2*_ga_TDCK4DWEPP*MTcxNzE2NDU4NS4xLjEuMTcxNzE2NjM5My4wLjAuMA..#sec-tail-position-calls)
- [Recursion in Functional Programming — freeCodeCamp](https://www.freecodecamp.org/news/how-recursion-works/)
- [Trampolines in JavaScript — ExploringJS](https://exploringjs.com/es6/ch_tail-calls.html)
- [Tree Traversal VisuAlgo](https://visualgo.net/en/bst)
- `20.4-data-algorithms/algorithms/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
