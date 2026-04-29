# 算法 — 理论基础

## 1. 复杂度分析

### 时间复杂度

| 复杂度 | 名称 | 示例 |
|--------|------|------|
| O(1) | 常数 | 哈希表查找 |
| O(log n) | 对数 | 二分查找 |
| O(n) | 线性 | 数组遍历 |
| O(n log n) | 线性对数 | 快速排序、归并排序 |
| O(n²) | 平方 | 冒泡排序、选择排序 |
| O(2ⁿ) | 指数 | 子集枚举 |

### 空间复杂度

- 原地算法: O(1) 额外空间
- 递归算法: O(log n) 到 O(n) 栈空间
- 动态规划: O(n) 到 O(n²) 表格空间

## 2. 核心算法类别对比

| 类别 | 代表算法 | 时间复杂度 | 空间复杂度 | 适用场景 | 关键思想 |
|------|---------|-----------|-----------|---------|---------|
| **排序** | 快速排序 | O(n log n) 平均 | O(log n) | 通用排序 | 分治 + 基准划分 |
| **排序** | 归并排序 | O(n log n) | O(n) | 稳定排序、链表排序 | 分治 + 合并 |
| **排序** | 堆排序 | O(n log n) | O(1) | 内存受限排序 | 完全二叉树 + 堆化 |
| **搜索** | 二分查找 | O(log n) | O(1) | 有序数组查找 | 区间折半 |
| **搜索** | 哈希查找 | O(1) 平均 | O(n) | 精确匹配 | 散列函数 |
| **图** | Dijkstra | O((V+E) log V) | O(V) | 单源最短路径（非负权） | 贪心 + 优先队列 |
| **图** | Bellman-Ford | O(VE) | O(V) | 含负权最短路径 | 动态松弛 |
| **图** | Floyd-Warshall | O(V³) | O(V²) | 全源最短路径 | 动态规划 |
| **DP** | 0/1 背包 | O(nW) | O(W) | 资源约束优化 | 状态转移方程 |
| **DP** | 最长公共子序列 | O(mn) | O(min(m,n)) | 序列比对 | 子问题重叠 |
| **贪心** | 活动选择 | O(n log n) | O(1) | 区间调度 | 局部最优即全局最优 |
| **贪心** | Huffman 编码 | O(n log n) | O(n) | 数据压缩 | 构建最优前缀树 |

## 3. 排序算法

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|---------|---------|------|--------|
| 快速排序 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 插入排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 计数排序 | O(n+k) | O(n+k) | O(k) | 稳定 |

## 4. 图算法

- **DFS/BFS**: 图遍历基础
- **Dijkstra**: 单源最短路径（非负权）
- **Bellman-Ford**: 单源最短路径（可处理负权）
- **Floyd-Warshall**: 全源最短路径
- **拓扑排序**: 有向无环图的线性排序
- **最小生成树**: Prim、Kruskal

## 5. 动态规划

解决具有**最优子结构**和**重叠子问题**的问题：

- **记忆化搜索**: 自顶向下，递归 + 缓存
- **表格法**: 自底向上，迭代填充 DP 表
- **空间优化**: 滚动数组、只保留必要状态

经典问题：背包问题、最长公共子序列、编辑距离、硬币找零。

## 6. 代码示例：Dijkstra 最短路径

```typescript
interface Edge {
  to: number;
  weight: number;
}

function dijkstra(graph: Edge[][], start: number): number[] {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  dist[start] = 0;

  for (let i = 0; i < n; i++) {
    // 找到未访问的最小距离节点
    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }

    if (dist[u] === Infinity) break;
    visited[u] = true;

    // 松弛操作
    for (const { to, weight } of graph[u]) {
      if (dist[u] + weight < dist[to]) {
        dist[to] = dist[u] + weight;
      }
    }
  }

  return dist;
}

// 使用优先队列优化版本 O((V+E) log V)
function dijkstraPQ(graph: Edge[][], start: number): number[] {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;

  const pq: [number, number][] = [[0, start]]; // [distance, node]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d > dist[u]) continue;

    for (const { to, weight } of graph[u]) {
      if (dist[u] + weight < dist[to]) {
        dist[to] = dist[u] + weight;
        pq.push([dist[to], to]);
      }
    }
  }

  return dist;
}
```

## 7. 代码示例：二分查找（ lower_bound ）

```typescript
function lowerBound(arr: number[], target: number): number {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left; // 第一个 >= target 的位置
}
```

## 8. 与相邻模块的关系

- **04-data-structures**: 算法依赖的数据结构
- **08-performance**: 算法性能优化
- **54-intelligent-performance**: AI 辅助算法优化

## 9. 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **CLRS** | 《算法导论》第 3/4 版 — 算法理论圣经 | [MIT Press](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) |
| **LeetCode** | 算法在线评测与面试题库 | [leetcode.com](https://leetcode.com/) |
| **VisuAlgo** | 算法可视化交互学习 | [visualgo.net](https://visualgo.net/) |
| **CP-Algorithms** | 竞赛编程算法百科 | [cp-algorithms.com](https://cp-algorithms.com/) |
| **Algorithm Design** | Kleinberg & Tardos 经典教材 | [Pearson](https://www.pearson.com/en-us/subject-catalog/p/algorithm-design/P200000005792) |
| **The Art of Computer Programming** | Knuth 卷 1-4B | [Stanford](https://www-cs-faculty.stanford.edu/~knuth/taocp.html) |
| **MIT 6.006** | 算法导论公开课 | [MIT OpenCourseWare](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/) |
| **Big-O Cheat Sheet** | 复杂度速查表 | [bigocheatsheet.com](https://www.bigocheatsheet.com/) |
