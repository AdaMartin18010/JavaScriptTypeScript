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
| 桶排序 | 非比较排序，按值域分桶 | bucket-sort.ts |

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
| 基数排序 | O(d·(n + k)) | O(d·(n + k)) | O(n + k) | 稳定 | 定长键值（如字符串、UUID） |

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

### 3.4 基数排序 — 按位分桶，稳定线性时间

```typescript
// radix-sort.ts — 基数排序适合定长整数或字符串键

function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return arr;
  const max = Math.max(...arr.map(Math.abs));
  let exp = 1;
  const output = [...arr];

  while (Math.floor(max / exp) > 0) {
    countingSortByDigit(output, exp);
    exp *= 10;
  }

  // 处理负数：分离后合并
  const negatives = output.filter(x => x < 0).reverse();
  const positives = output.filter(x => x >= 0);
  return negatives.concat(positives);
}

function countingSortByDigit(arr: number[], exp: number): void {
  const n = arr.length;
  const output = new Array(n).fill(0);
  const count = new Array(10).fill(0);

  for (let i = 0; i < n; i++) {
    const digit = Math.floor(Math.abs(arr[i]) / exp) % 10;
    count[digit]++;
  }
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(Math.abs(arr[i]) / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < n; i++) arr[i] = output[i];
}

console.log('RadixSort:', radixSort([170, -45, 75, -90, 802, 24, 2, 66]));
// [-90, -45, 2, 24, 66, 75, 170, 802]
```

### 3.5 自定义比较器与稳定排序技巧

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

### 3.6 希尔排序（Shell Sort）— 递减增量排序

```typescript
// shell-sort.ts — 插入排序的泛化，对大规模数据有效
function shellSort(arr: number[]): number[] {
  const result = [...arr];
  let gap = Math.floor(result.length / 2);

  while (gap > 0) {
    for (let i = gap; i < result.length; i++) {
      const temp = result[i];
      let j = i;
      while (j >= gap && result[j - gap] > temp) {
        result[j] = result[j - gap];
        j -= gap;
      }
      result[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }

  return result;
}

console.log('ShellSort:', shellSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]
```

### 3.7 桶排序 — 按值域分桶后各自排序

```typescript
// bucket-sort.ts — 均匀分布数据的高效排序
function bucketSort(arr: number[], bucketSize = 5): number[] {
  if (arr.length === 0) return arr;

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketCount = Math.floor((max - min) / bucketSize) + 1;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  for (const num of arr) {
    const idx = Math.floor((num - min) / bucketSize);
    buckets[idx].push(num);
  }

  const result: number[] = [];
  for (const bucket of buckets) {
    // 每个桶使用插入排序
    result.push(...insertionSort(bucket));
  }
  return result;
}

function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log('BucketSort:', bucketSort([0.42, 0.32, 0.33, 0.52, 0.37, 0.47, 0.51]));
```

### 3.8 拓扑排序 — 有向无环图（DAG）的线性排序

```typescript
// topological-sort.ts — Kahn 算法（入度表法）
function topologicalSort(graph: Map<string, Set<string>>): string[] {
  const inDegree = new Map<string, number>();
  const result: string[] = [];
  const queue: string[] = [];

  // 初始化入度
  for (const [node, edges] of graph) {
    if (!inDegree.has(node)) inDegree.set(node, 0);
    for (const neighbor of edges) {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
    }
  }

  // 入度为 0 的节点入队
  for (const [node, degree] of inDegree) {
    if (degree === 0) queue.push(node);
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (result.length !== inDegree.size) {
    throw new Error('Graph contains cycles');
  }

  return result;
}

// 依赖关系图：task -> [依赖的任务]
const taskGraph = new Map<string, Set<string>>([
  ['build', new Set(['lint', 'test'])],
  ['lint', new Set()],
  ['test', new Set(['compile'])],
  ['compile', new Set()],
  ['deploy', new Set(['build'])],
]);

console.log(topologicalSort(taskGraph));
// ['lint', 'compile', 'test', 'build', 'deploy']
```

### 3.9 常见误区

| 误区 | 正确理解 |
|------|---------|
| 快速排序空间复杂度 O(1) | 递归调用栈平均 O(log n)，最坏 O(n) |
| 稳定排序不重要 | 多字段排序时稳定性影响结果一致性 |
| JS `.sort()` 总是快排 | V8 使用 Timsort（混合稳定排序），非纯快排 |
| 计数排序通用 | 仅适用于已知小范围整数或可分桶数据 |

### 3.10 扩展阅读

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
- [Google Research — Timsort Analysis](https://research.google/pubs/pub44601/) — Timsort 形式化分析与正确性证明
- [V8 Source — array-sort.cc](https://chromium.googlesource.com/v8/v8.git/+/refs/heads/main/src/builtins/array-sort.cc) — V8 排序实现源码级参考
- [Shell Sort — Wikipedia](https://en.wikipedia.org/wiki/Shellsort)
- [Bucket Sort — Wikipedia](https://en.wikipedia.org/wiki/Bucket_sort)
- [Topological Sorting — Wikipedia](https://en.wikipedia.org/wiki/Topological_sorting)
- [Kahn's Algorithm — CP-Algorithms](https://cp-algorithms.com/graph/topological-sort.html)
- [Heap Sort — Wikipedia](https://en.wikipedia.org/wiki/Heapsort)
- [Counting Sort — Wikipedia](https://en.wikipedia.org/wiki/Counting_sort)
- [Radix Sort — Wikipedia](https://en.wikipedia.org/wiki/Radix_sort)
- [Insertion Sort — Wikipedia](https://en.wikipedia.org/wiki/Insertion_sort)
- [JavaScript Engine Array Sort Internals — Mathias Bynens](https://v8.dev/blog/array-sort)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
