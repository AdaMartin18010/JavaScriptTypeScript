# 图算法

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/graph`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决图结构数据的遍历与路径查找问题。涵盖 DFS、BFS、最短路径（Dijkstra）和启发式搜索（A*）等经典算法。

### 1.2 形式化基础

- **图** G = (V, E)，V 为顶点集，E 为边集。
- **BFS/DFS** 时间复杂度均为 O(V + E)，空间复杂度 O(V)。
- **Dijkstra** 在无权/正权图中单源最短路径时间复杂度 O((V + E) log V)（优先队列优化）。
- **A\*** 在可采纳启发式下保证最优，时间复杂度取决于启发函数质量。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 邻接表 | 空间高效的图存储结构 | adjacency-list.ts |
| 拓扑排序 | 有向无环图的线性化排序 | topological-sort.ts |
| 松弛操作 | 更新最短路径估计值 | dijkstra.ts |

---

## 二、设计原理

### 2.1 为什么存在

现实世界中大量问题可以建模为图结构：社交网络、依赖关系、路径规划。图算法提供了解决这些连通性、最短路径和排序问题的系统化方法。

### 2.2 算法对比

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 | 特点 |
|------|-----------|-----------|---------|------|
| BFS | O(V + E) | O(V) | 无权图最短路径、层级遍历 | 逐层扩展，保证无权最短 |
| DFS | O(V + E) | O(V)（递归栈）| 连通性检测、拓扑排序、回溯 | 深度优先，空间常数更优 |
| Dijkstra | O((V+E) log V) | O(V) | 正权图单源最短路径 | 贪心策略，全局最优 |
| A* | 取决于启发函数 | O(V) | 游戏寻路、地图导航 | 目标导向，搜索空间更小 |

### 2.3 与相关技术的对比

与树算法对比：图更通用但算法更复杂，树有额外约束（无环、连通）可简化实现。

---

## 三、实践映射

### 3.1 从理论到代码

以下是用 **TypeScript 邻接表** 实现 BFS、DFS 与 Dijkstra 的完整示例：

```typescript
// graph-algorithms.ts
// 邻接表图 + BFS + DFS + Dijkstra

type Graph = Map<string, Array<{ to: string; weight: number }>>;

function createGraph(): Graph {
  return new Map();
}

function addEdge(g: Graph, from: string, to: string, weight = 1): void {
  if (!g.has(from)) g.set(from, []);
  if (!g.has(to)) g.set(to, []);
  g.get(from)!.push({ to, weight });
}

// BFS：无权最短路径
function bfs(g: Graph, start: string, target: string): string[] | null {
  const visited = new Set<string>();
  const queue: Array<[string, string[]]> = [[start, [start]]];
  visited.add(start);

  while (queue.length) {
    const [node, path] = queue.shift()!;
    if (node === target) return path;
    for (const { to } of g.get(node) || []) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push([to, [...path, to]]);
      }
    }
  }
  return null;
}

// DFS：递归实现
function dfs(g: Graph, start: string, target: string): string[] | null {
  const visited = new Set<string>();
  function go(node: string, path: string[]): string[] | null {
    if (node === target) return path;
    visited.add(node);
    for (const { to } of g.get(node) || []) {
      if (!visited.has(to)) {
        const res = go(to, [...path, to]);
        if (res) return res;
      }
    }
    return null;
  }
  return go(start, [start]);
}

// Dijkstra：正权图单源最短路径
function dijkstra(g: Graph, start: string): Map<string, number> {
  const dist = new Map<string, number>();
  const pq: Array<{ node: string; d: number }> = [];
  for (const v of g.keys()) dist.set(v, Infinity);
  dist.set(start, 0);
  pq.push({ node: start, d: 0 });

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { node, d } = pq.shift()!;
    if (d > dist.get(node)!) continue;
    for (const { to, weight } of g.get(node) || []) {
      const nd = d + weight;
      if (nd < dist.get(to)!) {
        dist.set(to, nd);
        pq.push({ node: to, d: nd });
      }
    }
  }
  return dist;
}

// 可运行示例
const g = createGraph();
addEdge(g, 'A', 'B', 1);
addEdge(g, 'A', 'C', 4);
addEdge(g, 'B', 'C', 2);
addEdge(g, 'B', 'D', 5);
addEdge(g, 'C', 'D', 1);

console.log('BFS A→D:', bfs(g, 'A', 'D'));
console.log('DFS A→D:', dfs(g, 'A', 'D'));
console.log('Dijkstra from A:', Object.fromEntries(dijkstra(g, 'A')));
// Dijkstra from A: { A: 0, B: 1, C: 3, D: 4 }
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 邻接矩阵总是更好 | 稀疏图用邻接表更省空间（O(E) vs O(V²)） |
| DFS 和 BFS 结果等价 | 遍历顺序不同，适用场景也不同 |
| Dijkstra 适用于负权边 | 负权边会导致贪心失效，应使用 Bellman-Ford |
| A* 任何启发式都最优 | 启发式必须可采纳（admissible）且一致（consistent） |

### 3.3 扩展阅读

- [Graph Algorithms — CLRS 第 22–24 章](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)
- [Dijkstra's Algorithm — Wikipedia](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [A* Search Algorithm — Red Blob Games](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Graph Traversals VisuAlgo](https://visualgo.net/en/dfsbfs)
- `20.4-data-algorithms/algorithms/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
