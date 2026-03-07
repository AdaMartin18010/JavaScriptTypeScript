/**
 * @file 图与图算法
 * @category Data Structures → Custom
 * @difficulty hard
 * @tags graph, bfs, dfs, dijkstra, adjacency-list
 */

// ============================================================================
// 1. 图的表示 (邻接表)
// ============================================================================

export class Graph<T> {
  private adjacencyList = new Map<T, T[]>();

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(from: T, to: T): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.push(to);
  }

  addUndirectedEdge(v1: T, v2: T): void {
    this.addEdge(v1, v2);
    this.addEdge(v2, v1);
  }

  getNeighbors(vertex: T): T[] {
    return this.adjacencyList.get(vertex) || [];
  }

  hasVertex(vertex: T): boolean {
    return this.adjacencyList.has(vertex);
  }

  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }
}

// ============================================================================
// 2. 深度优先搜索 (DFS)
// ============================================================================

export function dfs<T>(graph: Graph<T>, start: T, target: T): T[] | null {
  const visited = new Set<T>();
  const path: T[] = [];

  function search(vertex: T): boolean {
    if (visited.has(vertex)) return false;
    
    visited.add(vertex);
    path.push(vertex);

    if (vertex === target) return true;

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (search(neighbor)) return true;
    }

    path.pop();
    return false;
  }

  return search(start) ? path : null;
}

// ============================================================================
// 3. 广度优先搜索 (BFS)
// ============================================================================

export function bfs<T>(graph: Graph<T>, start: T, target: T): T[] | null {
  const visited = new Set<T>();
  const queue: { vertex: T; path: T[] }[] = [{ vertex: start, path: [start] }];

  while (queue.length > 0) {
    const { vertex, path } = queue.shift()!;

    if (vertex === target) return path;

    if (visited.has(vertex)) continue;
    visited.add(vertex);

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        queue.push({ vertex: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null;
}

// ============================================================================
// 4. 带权图与 Dijkstra 算法
// ============================================================================

export class WeightedGraph<T> {
  private adjacencyList = new Map<T, Map<T, number>>();

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, new Map());
    }
  }

  addEdge(from: T, to: T, weight: number): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.set(to, weight);
  }

  getNeighbors(vertex: T): Map<T, number> {
    return this.adjacencyList.get(vertex) || new Map();
  }
}

export function dijkstra<T>(graph: WeightedGraph<T>, start: T, end: T): { path: T[]; distance: number } | null {
  const distances = new Map<T, number>();
  const previous = new Map<T, T | null>();
  const unvisited = new Set<T>();

  // 初始化
  for (const vertex of graph['adjacencyList'].keys()) {
    distances.set(vertex, vertex === start ? 0 : Infinity);
    previous.set(vertex, null);
    unvisited.add(vertex);
  }

  while (unvisited.size > 0) {
    // 找到未访问中距离最小的
    let current: T | null = null;
    let minDistance = Infinity;
    
    for (const vertex of unvisited) {
      const distance = distances.get(vertex)!;
      if (distance < minDistance) {
        minDistance = distance;
        current = vertex;
      }
    }

    if (current === null || current === end) break;
    unvisited.delete(current);

    // 更新邻居距离
    for (const [neighbor, weight] of graph.getNeighbors(current)) {
      if (!unvisited.has(neighbor)) continue;
      
      const newDistance = distances.get(current)! + weight;
      if (newDistance < distances.get(neighbor)!) {
        distances.set(neighbor, newDistance);
        previous.set(neighbor, current);
      }
    }
  }

  // 重构路径
  if (distances.get(end) === Infinity) return null;

  const path: T[] = [];
  let current: T | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current)!;
  }

  return { path, distance: distances.get(end)! };
}

// ============================================================================
// 5. 拓扑排序
// ============================================================================

export function topologicalSort<T>(graph: Graph<T>): T[] | null {
  const visited = new Set<T>();
  const temp = new Set<T>();
  const result: T[] = [];

  function visit(vertex: T): boolean {
    if (temp.has(vertex)) return false; // 检测到环
    if (visited.has(vertex)) return true;

    temp.add(vertex);
    
    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visit(neighbor)) return false;
    }

    temp.delete(vertex);
    visited.add(vertex);
    result.unshift(vertex);
    return true;
  }

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      if (!visit(vertex)) return null; // 有环
    }
  }

  return result;
}

// ============================================================================
// 导出
// ============================================================================

export { Graph as default };
