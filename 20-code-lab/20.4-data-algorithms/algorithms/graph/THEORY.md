# 图算法

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/graph`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决图结构数据的遍历与路径查找问题。涵盖 DFS、BFS、最短路径（Dijkstra、Bellman-Ford）和启发式搜索（A*）等经典算法。

### 1.2 形式化基础

- **图** G = (V, E)，V 为顶点集，E 为边集。
- **BFS/DFS** 时间复杂度均为 O(V + E)，空间复杂度 O(V)。
- **Dijkstra** 在无权/正权图中单源最短路径时间复杂度 O((V + E) log V)（优先队列优化）。
- **Bellman-Ford** 支持负权边，时间复杂度 O(V·E)，可检测负权环。
- **A\*** 在可采纳启发式下保证最优，时间复杂度取决于启发函数质量。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 邻接表 | 空间高效的图存储结构 | adjacency-list.ts |
| 拓扑排序 | 有向无环图的线性化排序 | topological-sort.ts |
| 松弛操作 | 更新最短路径估计值 | dijkstra.ts |
| 负权环检测 | Bellman-Ford 的图合法性验证 | bellman-ford.ts |

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
| Bellman-Ford | O(V·E) | O(V) | 含负权边的单源最短路径 | 可检测负权环 |
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

### 3.2 A* 启发式搜索

A*在 Dijkstra 基础上引入启发函数 `h(v)`，优先探索离目标更近的节点。当启发函数**可采纳**（admissible，即从不高估实际代价）时，A* 保证最优。

```typescript
// astar.ts
type Heuristic = (node: string, target: string) => number;

function astar(
  g: Graph,
  start: string,
  target: string,
  h: Heuristic
): { path: string[]; cost: number } | null {
  const open = new Set<string>([start]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  for (const v of g.keys()) {
    gScore.set(v, Infinity);
    fScore.set(v, Infinity);
  }
  gScore.set(start, 0);
  fScore.set(start, h(start, target));

  while (open.size) {
    let current = '';
    let minF = Infinity;
    for (const node of open) {
      const f = fScore.get(node)!;
      if (f < minF) {
        minF = f;
        current = node;
      }
    }

    if (current === target) {
      const path: string[] = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
      }
      return { path, cost: gScore.get(target)! };
    }

    open.delete(current);
    for (const { to, weight } of g.get(current) || []) {
      const tentative = gScore.get(current)! + weight;
      if (tentative < gScore.get(to)!) {
        cameFrom.set(to, current);
        gScore.set(to, tentative);
        fScore.set(to, tentative + h(to, target));
        open.add(to);
      }
    }
  }
  return null;
}

// 示例：网格图中使用曼哈顿距离作为启发函数
function manhattan(a: string, b: string): number {
  const [ax, ay] = a.split(',').map(Number);
  const [bx, by] = b.split(',').map(Number);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}
```

### 3.3 拓扑排序 (Kahn 算法)

拓扑排序将**有向无环图（DAG）**线性化，常用于任务调度与依赖解析。

```typescript
// topological-sort.ts
function topologicalSort(g: Graph): string[] | null {
  const inDegree = new Map<string, number>();
  for (const v of g.keys()) inDegree.set(v, 0);
  for (const edges of g.values()) {
    for (const { to } of edges) {
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [v, d] of inDegree) if (d === 0) queue.push(v);

  const result: string[] = [];
  while (queue.length) {
    const v = queue.shift()!;
    result.push(v);
    for (const { to } of g.get(v) || []) {
      const newDeg = inDegree.get(to)! - 1;
      inDegree.set(to, newDeg);
      if (newDeg === 0) queue.push(to);
    }
  }

  // 若结果节点数不足，说明存在环
  return result.length === inDegree.size ? result : null;
}
```

### 3.4 并查集 (Union-Find)

用于高效判断图中两节点是否连通（如 Kruskal 最小生成树前置步骤）。

```typescript
// union-find.ts
class UnionFind {
  private parent = new Map<string, string>();
  private rank = new Map<string, number>();

  makeSet(x: string) {
    this.parent.set(x, x);
    this.rank.set(x, 0);
  }

  find(x: string): string {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!)); // 路径压缩
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const xr = this.find(x);
    const yr = this.find(y);
    if (xr === yr) return false;
    // 按秩合并
    if ((this.rank.get(xr) || 0) < (this.rank.get(yr) || 0)) {
      this.parent.set(xr, yr);
    } else if ((this.rank.get(xr) || 0) > (this.rank.get(yr) || 0)) {
      this.parent.set(yr, xr);
    } else {
      this.parent.set(yr, xr);
      this.rank.set(xr, (this.rank.get(xr) || 0) + 1);
    }
    return true;
  }
}
```

### 3.5 Bellman-Ford 算法（负权边支持）

```typescript
// bellman-ford.ts — 支持负权边与负权环检测

function bellmanFord(g: Graph, start: string): { dist: Map<string, number>; hasNegativeCycle: boolean } {
  const dist = new Map<string, number>();
  for (const v of g.keys()) dist.set(v, Infinity);
  dist.set(start, 0);

  const edges: Array<{ from: string; to: string; weight: number }> = [];
  for (const [from, list] of g) {
    for (const { to, weight } of list) edges.push({ from, to, weight });
  }

  // 松弛 V-1 次
  for (let i = 0; i < g.size - 1; i++) {
    for (const { from, to, weight } of edges) {
      const nd = (dist.get(from) ?? Infinity) + weight;
      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
      }
    }
  }

  // 第 V 次松弛检测负权环
  for (const { from, to, weight } of edges) {
    if ((dist.get(from) ?? Infinity) + weight < (dist.get(to) ?? Infinity)) {
      return { dist, hasNegativeCycle: true };
    }
  }

  return { dist, hasNegativeCycle: false };
}

// 使用
const bfResult = bellmanFord(g, 'A');
if (bfResult.hasNegativeCycle) {
  console.warn('图中存在负权环，最短路径无意义');
}
```

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| 邻接矩阵总是更好 | 稀疏图用邻接表更省空间（O(E) vs O(V²)） |
| DFS 和 BFS 结果等价 | 遍历顺序不同，适用场景也不同 |
| Dijkstra 适用于负权边 | 负权边会导致贪心失效，应使用 Bellman-Ford |
| A* 任何启发式都最优 | 启发式必须可采纳（admissible）且一致（consistent） |

### 3.7 扩展阅读

- [Graph Algorithms — CLRS 第 22–24 章](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)
- [Dijkstra's Algorithm — Wikipedia](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [Bellman-Ford Algorithm — Stanford CS161](https://web.stanford.edu/class/cs161/) — 负权边与负权环检测权威讲解
- [A* Search Algorithm — Red Blob Games](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Graph Traversals VisuAlgo](https://visualgo.net/en/dfsbfs)
- [Algorithms, 4th Edition — Sedgewick & Wayne](https://algs4.cs.princeton.edu/) — 普林斯顿大学经典算法教材，含 Java 实现与可视化
- [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/) — MIT 公开课，图算法章节权威讲解
- [CP-Algorithms — Graph Section](https://cp-algorithms.com/graph/) — 竞赛编程图算法百科，含形式化证明与代码
- [NetworkX Documentation](https://networkx.org/documentation/stable/) — Python 图算法库官方文档，算法描述具有高度权威性
- [Stanford ACM-ICPC Notebook — Graph Algorithms](https://github.com/jaehyunp/stanfordacm/blob/master/code/GraphAlgorithms.dijkstra.cpp) — 竞赛级标准实现参考

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
