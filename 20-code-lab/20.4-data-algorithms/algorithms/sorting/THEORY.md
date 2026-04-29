# 排序算法

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/sorting`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决数据排序的效率与稳定性问题。对比快速、归并、堆和计数排序在不同场景下的适用性。

### 1.2 形式化基础

- **比较排序下界**：任何基于比较的排序算法最坏时间复杂度为 Ω(n log n)。
- **稳定性**：相等元素在排序后保持原始相对顺序。
- **原地排序**：额外空间复杂度为 O(1)（不计递归栈）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 快速排序 | 分治 pivot 的平均 O(n log n) | quicksort.ts |
| 稳定性 | 相等元素原始顺序的保持 | stable-sort.ts |
| 原地性 | 是否使用常数额外空间 | in-place.ts |

---

## 二、设计原理

### 2.1 为什么存在

排序是算法基础中的基础。不同排序算法在稳定性、空间复杂度和适应性上有差异，理解这些权衡是算法设计的起点。

### 2.2 算法对比

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 | 适用场景 |
|------|---------|---------|------|--------|---------|
| 快速排序 | O(n log n) | O(n²) | O(log n) 栈 | 不稳定 | 通用场景，缓存友好 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 | 链表排序、外部排序 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 | 内存受限、确定性需求 |
| 计数排序 | O(n + k) | O(n + k) | O(k) | 稳定 | 小范围整数排序 |

### 2.3 与相关技术的对比

与无序集合对比：排序后支持范围查询和二分，但维护有序有开销。JavaScript `Array.prototype.sort()` 通常采用 Timsort（V8）或 QuickSort + InsertionSort 混合策略。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **TypeScript 快速排序**（Hoare partition）与 **归并排序** 的完整实现：

```typescript
// sorting.ts
// 快速排序 + 归并排序

function quickSort<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地快排（Hoare partition，减少空间）
function quickSortInPlace<T>(arr: T[], left = 0, right = arr.length - 1): void {
  if (left >= right) return;
  const pivotIndex = partition(arr, left, right);
  quickSortInPlace(arr, left, pivotIndex);
  quickSortInPlace(arr, pivotIndex + 1, right);
}

function partition<T>(arr: T[], left: number, right: number): number {
  const pivot = arr[Math.floor((left + right) / 2)];
  let i = left - 1;
  let j = right + 1;
  while (true) {
    do { i++; } while (arr[i] < pivot);
    do { j--; } while (arr[j] > pivot);
    if (i >= j) return j;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 归并排序：稳定、O(n log n) 保证
function mergeSort<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge<T>(left: T[], right: T[]): T[] {
  const result: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// 可运行示例
const unsorted = [64, 34, 25, 12, 22, 11, 90, 22];
console.log('QuickSort:', quickSort([...unsorted]));
// [11, 12, 22, 22, 25, 34, 64, 90]

const inPlaceArr = [...unsorted];
quickSortInPlace(inPlaceArr);
console.log('QuickInPlace:', inPlaceArr);

console.log('MergeSort:', mergeSort([...unsorted]));
// [11, 12, 22, 22, 25, 34, 64, 90]（稳定，两个22顺序保持）
```

### 3.2 堆排序 — 原地 O(1) 额外空间

```typescript
function heapSort(arr: number[]): number[] {
  const heap = [...arr];
  const n = heap.length;

  function heapify(size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && heap[left] > heap[largest]) largest = left;
    if (right < size && heap[right] > heap[largest]) largest = right;
    if (largest !== root) {
      [heap[root], heap[largest]] = [heap[largest], heap[root]];
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [heap[0], heap[i]] = [heap[i], heap[0]];
    heapify(i, 0);
  }
  return heap;
}

console.log('HeapSort:', heapSort([...unsorted]));
```

### 3.3 计数排序 — 非比较排序，O(n + k)

```typescript
function countingSort(arr: number[], maxVal: number): number[] {
  const count = new Array(maxVal + 1).fill(0);
  for (const v of arr) count[v]++;
  const result: number[] = [];
  for (let i = 0; i < count.length; i++) {
    while (count[i]-- > 0) result.push(i);
  }
  return result;
}

console.log('CountingSort:', countingSort([4, 2, 2, 8, 3, 3, 1], 8));
// [1, 2, 2, 3, 3, 4, 8]
```

### 3.4 自定义比较器与稳定排序技巧

```typescript
// 多字段排序：先按年龄升序，再按姓名升序（稳定性保证相对顺序）
interface User {
  name: string;
  age: number;
}

const users: User[] = [
  { name: 'Bob', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Charlie', age: 30 },
];

// 利用 V8 Timsort 的稳定性
const sorted = users
  .sort((a, b) => a.name.localeCompare(b.name))
  .sort((a, b) => a.age - b.age);

console.log(sorted);
// [Alice 25, Bob 30, Charlie 30] — Bob 在 Charlie 之前（稳定）
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| 快速排序空间复杂度 O(1) | 递归调用栈平均 O(log n)，最坏 O(n) |
| 稳定排序不重要 | 多字段排序时稳定性影响结果一致性 |
| JS `.sort()` 总是快排 | V8 使用 Timsort（混合稳定排序），非纯快排 |
| 计数排序通用 | 仅适用于已知小范围整数或可分桶数据 |

### 3.6 扩展阅读

- [Sorting Algorithms — Wikipedia](https://en.wikipedia.org/wiki/Sorting_algorithm)
- [Quicksort — Hoare Partition](https://en.wikipedia.org/wiki/Quicksort)
- [Timsort — Python/V8 采用的稳定混合排序](https://en.wikipedia.org/wiki/Timsort)
- [Sorting VisuAlgo](https://visualgo.net/en/sorting)
- [V8 Blog — Elements kinds in V8](https://v8.dev/blog/elements-kinds) — 理解引擎对数组排序的优化
- [MDN — Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [Introsort — std::sort 实现策略](https://en.wikipedia.org/wiki/Introsort)
- [The Art of Computer Programming, Vol. 3 — Sorting and Searching](https://www-cs-faculty.stanford.edu/~knuth/taocp.html)
- [Algorithms (Sedgewick & Wayne) — 第 2 章 排序](https://algs4.cs.princeton.edu/20sorting/)
- [LeetCode Top Interview Questions — Sorting](https://leetcode.com/problem-list/top-interview-questions/)
- `20.4-data-algorithms/algorithms/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
