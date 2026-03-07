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
  const queue: Array<{ vertex: string; path: string[] }> = [{ vertex: start, path: [start] }];

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

export { Graph as default };
