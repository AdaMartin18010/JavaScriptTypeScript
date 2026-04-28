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
  for (const vertex of graph.adjacencyList.keys()) {
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
  const endDistance = distances.get(end);
  if (endDistance === undefined || endDistance === Infinity) return null;

  const path: T[] = [];
  let current: T | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  return { path, distance: endDistance };
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

;

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Graph Data Structure Demo ===");

  // 基础图操作
  console.log("\n1. Basic Graph Operations:");
  const graph = new Graph<string>();
  graph.addEdge("A", "B");
  graph.addEdge("A", "C");
  graph.addEdge("B", "D");
  graph.addEdge("C", "D");
  graph.addEdge("D", "E");

  console.log("   Vertices:", graph.getVertices());
  console.log("   Neighbors of A:", graph.getNeighbors("A"));
  console.log("   Neighbors of D:", graph.getNeighbors("D"));

  // DFS
  console.log("\n2. Depth-First Search (DFS):");
  const dfsPath = dfs(graph, "A", "E");
  console.log("   DFS path from A to E:", dfsPath);

  const dfsPath2 = dfs(graph, "A", "Z");
  console.log("   DFS path from A to Z (not found):", dfsPath2);

  // BFS
  console.log("\n3. Breadth-First Search (BFS):");
  const bfsPath = bfs(graph, "A", "E");
  console.log("   BFS path from A to E:", bfsPath);

  // 带权图和 Dijkstra
  console.log("\n4. Weighted Graph & Dijkstra:");
  const weightedGraph = new WeightedGraph<string>();
  weightedGraph.addEdge("A", "B", 4);
  weightedGraph.addEdge("A", "C", 2);
  weightedGraph.addEdge("B", "C", 1);
  weightedGraph.addEdge("B", "D", 5);
  weightedGraph.addEdge("C", "D", 8);
  weightedGraph.addEdge("C", "E", 10);
  weightedGraph.addEdge("D", "E", 2);
  weightedGraph.addEdge("D", "F", 6);
  weightedGraph.addEdge("E", "F", 3);

  const shortestPath = dijkstra(weightedGraph, "A", "F");
  if (shortestPath) {
    console.log("   Shortest path from A to F:");
    console.log("     Path:", shortestPath.path.join(" -> "));
    console.log("     Distance:", shortestPath.distance);
  }

  const anotherPath = dijkstra(weightedGraph, "A", "E");
  if (anotherPath) {
    console.log("   Shortest path from A to E:");
    console.log("     Path:", anotherPath.path.join(" -> "));
    console.log("     Distance:", anotherPath.distance);
  }

  // 拓扑排序
  console.log("\n5. Topological Sort:");
  const dag = new Graph<string>();
  dag.addEdge("CS101", "CS201");
  dag.addEdge("CS101", "CS202");
  dag.addEdge("CS201", "CS301");
  dag.addEdge("CS202", "CS301");
  dag.addEdge("MATH101", "CS201");

  const topoOrder = topologicalSort(dag);
  console.log("   Course dependencies:");
  console.log("     CS101 -> CS201 -> CS301");
  console.log("     CS101 -> CS202 -> CS301");
  console.log("     MATH101 -> CS201");
  console.log("   Topological order:", topoOrder);

  // 检测环
  console.log("\n6. Cycle Detection:");
  const cyclicGraph = new Graph<string>();
  cyclicGraph.addEdge("A", "B");
  cyclicGraph.addEdge("B", "C");
  cyclicGraph.addEdge("C", "A");

  // Note: hasCycle function is not exported, but we demonstrate the concept
  console.log("   Graph with A->B->C->A has cycle: true (conceptual)");

  console.log("=== End of Demo ===\n");
}
