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

### 堆排序（Heap Sort）— 利用数组模拟完全二叉树

```ts
function heapSort(arr: number[]): number[] {
  const n = arr.length;
  const heap = [...arr];

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

  // 建大顶堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  // 逐次提取最大值
  for (let i = n - 1; i > 0; i--) {
    [heap[0], heap[i]] = [heap[i], heap[0]];
    heapify(i, 0);
  }
  return heap;
}
console.log(heapSort([12, 11, 13, 5, 6, 7]));
```

### 图的 BFS 与 DFS（邻接表表示）

```ts
const graph = new Map<string, string[]>([
  ['A', ['B', 'C']],
  ['B', ['D', 'E']],
  ['C', ['F']],
  ['D', []],
  ['E', ['F']],
  ['F', []],
]);

function bfs(start: string): string[] {
  const visited = new Set<string>();
  const queue = [start];
  const result: string[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);
    queue.push(...(graph.get(node) ?? []));
  }
  return result;
}

function dfs(start: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  function visit(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);
    (graph.get(node) ?? []).forEach(visit);
  }
  visit(start);
  return result;
}

console.log('BFS:', bfs('A')); // [ 'A', 'B', 'C', 'D', 'E', 'F' ]
console.log('DFS:', dfs('A')); // [ 'A', 'B', 'D', 'E', 'F', 'C' ]
```

### 滑动窗口最大值（双端队列优化）

```ts
function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = [];
  const result: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}
console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [ 3, 3, 5, 5, 6, 7 ]
```

### A* 寻路算法（简化网格版）

```ts
// a-star-grid.ts
interface Node {
  x: number;
  y: number;
  g: number; // 从起点代价
  h: number; // 启发式代价
  f: number; // g + h
  parent?: Node;
}

function astar(
  grid: number[][], // 0 = walkable, 1 = obstacle
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const open: Node[] = [];
  const closed = new Set<string>();

  const heuristic = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); // 曼哈顿距离

  open.push({ x: start[0], y: start[1], g: 0, h: heuristic(start, end), f: heuristic(start, end) });

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const key = `${current.x},${current.y}`;

    if (current.x === end[0] && current.y === end[1]) {
      const path: [number, number][] = [];
      let node: Node | undefined = current;
      while (node) {
        path.unshift([node.x, node.y]);
        node = node.parent;
      }
      return path;
    }

    closed.add(key);

    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (nx < 0 || nx >= rows || ny < 0 || ny >= cols || grid[nx][ny] === 1) continue;
      if (closed.has(`${nx},${ny}`)) continue;

      const g = current.g + 1;
      const h = heuristic([nx, ny], end);
      const existing = open.find((n) => n.x === nx && n.y === ny);

      if (!existing || g < existing.g) {
        const node: Node = { x: nx, y: ny, g, h, f: g + h, parent: current };
        if (!existing) open.push(node);
        else Object.assign(existing, node);
      }
    }
  }

  return []; // 不可达
}

// 使用
const grid = [
  [0, 0, 0, 0],
  [1, 1, 0, 1],
  [0, 0, 0, 0],
];
console.log(astar(grid, [0, 0], [2, 3]));
```

### 拓扑排序（Kahn 算法）

```ts
// topological-sort.ts
function topologicalSort(adj: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>();
  for (const [u, vs] of adj) {
    if (!inDegree.has(u)) inDegree.set(u, 0);
    for (const v of vs) {
      inDegree.set(v, (inDegree.get(v) ?? 0) + 1);
    }
  }

  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([k]) => k);
  const result: string[] = [];

  while (queue.length) {
    const u = queue.shift()!;
    result.push(u);
    for (const v of adj.get(u) ?? []) {
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v) === 0) queue.push(v);
    }
  }

  if (result.length !== inDegree.size) throw new Error('Cycle detected');
  return result;
}

// 使用：任务依赖排序
const deps = new Map<string, string[]>([
  ['build', ['test', 'deploy']],
  ['test', ['lint']],
  ['lint', []],
  ['deploy', []],
]);
console.log(topologicalSort(deps)); // [ 'lint', 'test', 'build', 'deploy' ]
```

### 编辑距离（动态规划）

```ts
// edit-distance.ts
function minDistance(word1: string, word2: string): number {
  const m = word1.length;
  const n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }

  return dp[m][n];
}

console.log(minDistance('horse', 'ros')); // 3
console.log(minDistance('intention', 'execution')); // 5
```

### 0-1 背包问题（动态规划 + 空间优化）

```ts
// knapsack.ts
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  // 一维 DP：dp[j] 表示容量 j 时的最大价值
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    // 逆序遍历，防止重复选择
    for (let j = capacity; j >= weights[i]; j--) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}

console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9
```

## 权威外部链接

- [VisuAlgo — 算法可视化](https://visualgo.net/en)
- [GeeksforGeeks — 算法基础](https://www.geeksforgeeks.org/fundamentals-of-algorithms/)
- [CP-Algorithms — 经典算法与数据结构](https://cp-algorithms.com/)
- [MIT OpenCourseWare — Introduction to Algorithms (6.006)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)
- [Princeton Algorithms (Sedgewick & Wayne)](https://algs4.cs.princeton.edu/home/)
- [Wikipedia — List of algorithms](https://en.wikipedia.org/wiki/List_of_algorithms)
- [Introduction to Algorithms (CLRS) — 第 3 / 4 版](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)
- [MDN — TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) — JS 高性能数值计算基础
- [V8 Blog — Fast properties](https://v8.dev/blog/fast-properties) — 理解引擎层数据结构优化
- [ECMA-262 Specification](https://tc39.es/ecma262/) — JS 语言标准对数组与迭代行为的定义
- [LeetCode Patterns](https://seanprashad.com/leetcode-patterns/) — 高频算法题型与模式总结
- [Algorithmica — 现代竞赛算法](https://algorithmica.org/en)
- [A* Pathfinding for Beginners — Stanford Game AI](https://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html)
- [Red Blob Games — Pathfinding](https://www.redblobgames.com/pathfinding/a-star/introduction.html) — 交互式寻路教程
- [Dynamic Programming Patterns — Educative](https://www.educative.io/courses/grokking-dynamic-programming-patterns-for-coding-interviews) — DP 模式化学习
- [Competitive Programmer's Handbook — CSES](https://cses.fi/book/book.pdf) — 竞赛编程手册
- [JavaScript Algorithms — trekhleb](https://github.com/trekhleb/javascript-algorithms) — JS 算法开源仓库

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
