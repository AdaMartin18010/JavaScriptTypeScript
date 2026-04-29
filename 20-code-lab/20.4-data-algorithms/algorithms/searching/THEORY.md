# 搜索算法

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/searching`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决有序与无序数据集的高效查找问题。涵盖线性搜索、二分搜索和插值搜索的时间空间权衡。

### 1.2 形式化基础

- **线性搜索**：遍历比较，时间复杂度 O(n)。
- **二分搜索**：每次排除一半，时间复杂度 O(log n)，要求数据有序且支持随机访问。
- **插值搜索**：利用数值分布估计位置，时间复杂度 O(log log n)（均匀分布最优），最坏 O(n)。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 二分搜索 | 有序数据的 O(log n) 查找 | binary-search.ts |
| 哈希查找 | 均摊 O(1) 的键值定位 | hash-lookup.ts |
| 插值搜索 | 基于值分布的位置预测 | interpolation-search.ts |

---

## 二、设计原理

### 2.1 为什么存在

数据查找是最高频的操作之一。理解不同搜索算法的时间空间特征，能在具体场景下做出最优选择。

### 2.2 算法对比

| 算法 | 时间复杂度 | 空间复杂度 | 前提条件 | 适用场景 |
|------|-----------|-----------|---------|---------|
| 线性搜索 | O(n) | O(1) | 无 | 小规模、无序数据 |
| 二分搜索 | O(log n) | O(1) | 有序 + 随机访问 | 静态有序集合、频繁查询 |
| 插值搜索 | O(log log n) ~ O(n) | O(1) | 有序 + 数值均匀分布 | 大规模均匀分布数据（如字典） |
| 哈希查找 | O(1) 均摊 | O(n) | 哈希函数 + 额外空间 | 键值对频繁查找 |

### 2.3 与相关技术的对比

与索引对比：搜索通用但慢，索引（B+Tree、Inverted Index）快但需要预处理和维护。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **TypeScript 二分搜索** 的迭代与递归实现，以及插值搜索参考：

```typescript
// searching.ts
// 线性、二分、插值搜索

function linearSearch<T>(arr: T[], target: T): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// 二分搜索：迭代版，无栈溢出风险
function binarySearch<T>(arr: T[], target: T): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = (left + right) >>> 1; // 无溢出位移除法
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// 二分搜索：递归版
function binarySearchRecursive<T>(
  arr: T[],
  target: T,
  left = 0,
  right = arr.length - 1
): number {
  if (left > right) return -1;
  const mid = (left + right) >>> 1;
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
  return binarySearchRecursive(arr, target, left, mid - 1);
}

// 插值搜索：适合均匀分布的大数组
function interpolationSearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right && target >= arr[left] && target <= arr[right]) {
    if (left === right) return arr[left] === target ? left : -1;
    const pos = left + Math.floor(
      ((target - arr[left]) / (arr[right] - arr[left])) * (right - left)
    );
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) left = pos + 1;
    else right = pos - 1;
  }
  return -1;
}

// 可运行示例
const sorted = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
console.log('Linear 50:', linearSearch(sorted, 50));            // 4
console.log('Binary 50:', binarySearch(sorted, 50));            // 4
console.log('BinaryRec 50:', binarySearchRecursive(sorted, 50)); // 4
console.log('Interpol 50:', interpolationSearch(sorted, 50));    // 4
console.log('Binary 99:', binarySearch(sorted, 99));            // -1
```

### 3.2 字符串匹配：KMP 算法

```typescript
// kmp.ts — Knuth-Morris-Pratt 线性时间字符串搜索

function buildLPS(pattern: string): number[] {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

function kmpSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [];
  const lps = buildLPS(pattern);
  const indices: number[] = [];
  let i = 0;
  let j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        indices.push(i - j);
        j = lps[j - 1];
      }
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return indices;
}

console.log(kmpSearch('abcabcabcdabc', 'abc'));
// [0, 3, 6, 10]
```

### 3.3 指数搜索（Exponential Search）— 无界或超长数组

```typescript
function exponentialSearch<T>(arr: T[], target: T): number {
  if (arr[0] === target) return 0;
  let bound = 1;
  while (bound < arr.length && arr[bound] <= target) {
    bound *= 2;
  }
  return binarySearch(
    arr.slice(bound / 2, Math.min(bound + 1, arr.length)),
    target
  );
}
```

### 3.4 常见误区

| 误区 | 正确理解 |
|------|---------|
| 二分搜索只能用于数组 | 任何支持随机访问的有序集合均可（如 TypedArray） |
| 哈希搜索总是 O(1) | 冲突严重时退化，且需要额外空间 |
| 插值搜索总是优于二分 | 数据分布不均匀时性能可能退化为 O(n) |
| `(left + right) / 2` 安全 | 大数组可能溢出，应使用 `left + ((right - left) >>> 1)` |

### 3.5 扩展阅读

- [Binary Search — Wikipedia](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Interpolation Search — GeeksforGeeks](https://www.geeksforgeeks.org/interpolation-search/)
- [Searching Algorithms VisuAlgo](https://visualgo.net/en/sea)
- [Lower Bounds for Comparison-Based Search](https://en.wikipedia.org/wiki/Decision_tree_model)
- [Knuth-Morris-Pratt algorithm — Stanford](https://www.cs.princeton.edu/courses/archive/spring20/cos226/lectures/53SubstringSearch.pdf)
- [The Art of Computer Programming, Vol. 3 — Searching and Sorting](https://www-cs-faculty.stanford.edu/~knuth/taocp.html)
- [Algorithms (Sedgewick & Wayne) — 第 3 章 查找](https://algs4.cs.princeton.edu/30searching/)
- [LeetCode Binary Search Pattern](https://leetcode.com/tag/binary-search/)
- `20.4-data-algorithms/algorithms/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
