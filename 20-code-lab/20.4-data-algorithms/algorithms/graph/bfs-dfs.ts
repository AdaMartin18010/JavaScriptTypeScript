/**
 * @file 图遍历算法
 * @category Algorithms → Graph
 * @difficulty medium
 * @tags graph, bfs, dfs, traversal
 */

// ============================================================================
// 1. 图的表示
// ============================================================================

export class Graph {
  private adjacencyList = new Map<string, string[]>();

  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(from: string, to: string): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.push(to);
  }

  addUndirectedEdge(v1: string, v2: string): void {
    this.addEdge(v1, v2);
    this.addEdge(v2, v1);
  }

  getNeighbors(vertex: string): string[] {
    return this.adjacencyList.get(vertex) || [];
  }

  getVertices(): string[] {
    return Array.from(this.adjacencyList.keys());
  }
}

// ============================================================================
// 2. 广度优先搜索 (BFS)
// ============================================================================

export function bfs(graph: Graph, start: string, target?: string): string[] {
  const visited = new Set<string>();
  const queue: string[] = [start];
  const result: string[] = [];

  visited.add(start);

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    if (target && vertex === target) {
      return result;
    }

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

// BFS 查找最短路径
export function bfsShortestPath(graph: Graph, start: string, target: string): string[] | null {
  const visited = new Set<string>();
  const queue: { vertex: string; path: string[] }[] = [{ vertex: start, path: [start] }];

  visited.add(start);

  while (queue.length > 0) {
    const { vertex, path } = queue.shift()!;

    if (vertex === target) {
      return path;
    }

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ vertex: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null;
}

// ============================================================================
// 3. 深度优先搜索 (DFS)
// ============================================================================

// 递归实现
export function dfsRecursive(graph: Graph, start: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(vertex: string): void {
    visited.add(vertex);
    result.push(vertex);

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  dfs(start);
  return result;
}

// 迭代实现
export function dfsIterative(graph: Graph, start: string): string[] {
  const visited = new Set<string>();
  const stack: string[] = [start];
  const result: string[] = [];

  while (stack.length > 0) {
    const vertex = stack.pop()!;

    if (!visited.has(vertex)) {
      visited.add(vertex);
      result.push(vertex);

      // 将邻居压入栈
      for (const neighbor of graph.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return result;
}

// ============================================================================
// 4. 检测环
// ============================================================================

export function hasCycle(graph: Graph): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycleUtil(vertex: string): boolean {
    visited.add(vertex);
    recursionStack.add(vertex);

    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        if (hasCycleUtil(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(vertex);
    return false;
  }

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      if (hasCycleUtil(vertex)) return true;
    }
  }

  return false;
}

// ============================================================================
// 5. 拓扑排序
// ============================================================================

export function topologicalSort(graph: Graph): string[] | null {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];

  function visit(vertex: string): boolean {
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
  console.log("=== Graph Algorithms Demo ===");

  // 构建图
  console.log("\n1. Graph Construction:");
  const graph = new Graph();
  graph.addEdge("A", "B");
  graph.addEdge("A", "C");
  graph.addEdge("B", "D");
  graph.addEdge("B", "E");
  graph.addEdge("C", "F");
  graph.addEdge("E", "F");

  console.log("   Graph structure:");
  console.log("   A -> B, C");
  console.log("   B -> D, E");
  console.log("   C -> F");
  console.log("   E -> F");
  console.log("   Vertices:", graph.getVertices());

  // BFS
  console.log("\n2. Breadth-First Search (BFS):");
  console.log("   BFS from A:", bfs(graph, "A"));
  console.log("   BFS from A to F:", bfs(graph, "A", "F"));

  // BFS 最短路径
  console.log("\n3. BFS Shortest Path (unweighted):");
  const shortestPath = bfsShortestPath(graph, "A", "F");
  console.log("   Shortest path A -> F:", shortestPath);
  console.log("   Path length:", shortestPath ? shortestPath.length - 1 : "N/A");

  // DFS
  console.log("\n4. Depth-First Search (DFS):");
  console.log("   DFS (recursive) from A:", dfsRecursive(graph, "A"));
  console.log("   DFS (iterative) from A:", dfsIterative(graph, "A"));

  // 环检测
  console.log("\n5. Cycle Detection:");
  const acyclicGraph = new Graph();
  acyclicGraph.addEdge("A", "B");
  acyclicGraph.addEdge("B", "C");
  acyclicGraph.addEdge("C", "D");
  console.log("   Acyclic graph (A->B->C->D) has cycle:", hasCycle(acyclicGraph));

  const cyclicGraph = new Graph();
  cyclicGraph.addEdge("A", "B");
  cyclicGraph.addEdge("B", "C");
  cyclicGraph.addEdge("C", "A");
  console.log("   Cyclic graph (A->B->C->A) has cycle:", hasCycle(cyclicGraph));

  // 拓扑排序
  console.log("\n6. Topological Sort:");
  const dag = new Graph();
  dag.addEdge("Foundation", "Walls");
  dag.addEdge("Foundation", "Plumbing");
  dag.addEdge("Walls", "Roof");
  dag.addEdge("Plumbing", "Roof");
  dag.addEdge("Walls", "Electrical");
  dag.addEdge("Roof", "Paint");
  dag.addEdge("Electrical", "Paint");

  const topoOrder = topologicalSort(dag);
  console.log("   Construction steps:");
  console.log("   Foundation -> Walls, Plumbing");
  console.log("   Walls -> Roof, Electrical");
  console.log("   Plumbing -> Roof");
  console.log("   Roof -> Paint");
  console.log("   Electrical -> Paint");
  console.log("   Topological order:", topoOrder);

  // 无向图
  console.log("\n7. Undirected Graph:");
  const undirected = new Graph();
  undirected.addUndirectedEdge("1", "2");
  undirected.addUndirectedEdge("1", "3");
  undirected.addUndirectedEdge("2", "4");
  
  console.log("   Neighbors of 1:", undirected.getNeighbors("1"));
  console.log("   Neighbors of 2:", undirected.getNeighbors("2"));

  // 迷宫示例
  console.log("\n8. Maze Pathfinding:");
  const maze = new Graph();
  // Simple 3x3 grid maze
  // S . .
  // # . #
  // . . E
  maze.addEdge("(0,0)", "(0,1)");
  maze.addEdge("(0,1)", "(1,1)");
  maze.addEdge("(1,1)", "(2,1)");
  maze.addEdge("(2,1)", "(2,2)");
  maze.addEdge("(2,0)", "(2,1)");

  const mazePath = bfsShortestPath(maze, "(0,0)", "(2,2)");
  console.log("   Maze path from S(0,0) to E(2,2):");
  console.log("   ", mazePath);

  console.log("=== End of Demo ===\n");
}
