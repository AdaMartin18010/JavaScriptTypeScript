---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 05-algorithms

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块实现经典算法并分析其复杂度。算法是语言无关的，但本模块聚焦于利用 JavaScript/TypeScript 的语言特性（如高阶函数、生成器、尾递归优化提示、TypedArray）来表达和优化这些算法。

**非本模块内容**：机器学习算法、特定领域的业务算法。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法基础
  ├── 04-data-structures    → 数据结构
  └── 05-algorithms（本模块）→ 算法实现与优化
```

## 子模块目录

| 子模块 | 说明 | 关键文件 |
|---|---|---|
| sorting | 排序算法：快排、归并、堆排、计数排序、基数排序 | `sorting/README.md` |
| searching | 搜索算法：二分查找、线性查找、插值查找、字符串匹配 | `searching/README.md` |
| graph | 图算法：DFS、BFS、Dijkstra、A*、拓扑排序、最小生成树 | `graph/README.md` |
| dynamic-programming | 动态规划：背包、最长公共子序列、编辑距离、状态压缩 | `dynamic-programming/README.md` |
| greedy | 贪心算法：活动选择、哈夫曼编码、最小生成树（Prim/Kruskal） | `greedy/README.md` |

## 核心代码示例

### 快速排序（Quick Sort）

```ts
function quickSort<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left: T[] = [];
  const right: T[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}
console.log(quickSort([3, 6, 8, 10, 1, 2, 1]));
```

### 二分查找（Binary Search）

```ts
function binarySearch<T>(arr: T[], target: T): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

### Dijkstra 最短路径

```ts
function dijkstra(graph: Map<string, Map<string, number>>, start: string): Map<string, number> {
  const dist = new Map<string, number>();
  const visited = new Set<string>();
  const pq = new Map<string, number>();

  for (const node of graph.keys()) dist.set(node, Infinity);
  dist.set(start, 0);
  pq.set(start, 0);

  while (pq.size > 0) {
    const [u] = [...pq.entries()].sort((a, b) => a[1] - b[1])[0];
    pq.delete(u);
    if (visited.has(u)) continue;
    visited.add(u);

    const neighbors = graph.get(u) ?? new Map();
    for (const [v, weight] of neighbors) {
      const alt = (dist.get(u) ?? Infinity) + weight;
      if (alt < (dist.get(v) ?? Infinity)) {
        dist.set(v, alt);
        pq.set(v, alt);
      }
    }
  }
  return dist;
}
```

## 权威外部链接

- [VisuAlgo — 算法可视化](https://visualgo.net/en)
- [GeeksforGeeks — 算法基础](https://www.geeksforgeeks.org/fundamentals-of-algorithms/)
- [CP-Algorithms — 经典算法与数据结构](https://cp-algorithms.com/)
- [MIT OpenCourseWare — Introduction to Algorithms (6.006)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)
- [Princeton Algorithms (Sedgewick & Wayne)](https://algs4.cs.princeton.edu/home/)
- [Wikipedia — List of algorithms](https://en.wikipedia.org/wiki/List_of_algorithms)

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
