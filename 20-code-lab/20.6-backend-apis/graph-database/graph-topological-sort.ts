/**
 * @file 拓扑排序
 * @category Graph Database → Topological Sort
 * @difficulty medium
 * @tags topological-sort, directed-acyclic-graph, dag, cycle-detection
 *
 * @description
 * 实现有向无环图（DAG）的拓扑排序：
 * - Kahn 算法（基于入度）
 * - DFS 后序遍历算法
 * - 环检测（判断图是否为 DAG）
 * - 获取所有合法拓扑序列
 */

/** 有向图（基于邻接表） */
export class DirectedGraph {
  private adjacency = new Map<string, string[]>();
  private inDegree = new Map<string, number>();

  /**
   * 添加节点
   * @param id - 节点 ID
   */
  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
      this.inDegree.set(id, 0);
    }
  }

  /**
   * 添加有向边
   * @param from - 起始节点
   * @param to - 目标节点
   */
  addEdge(from: string, to: string): void {
    if (!this.adjacency.has(from)) this.addNode(from);
    if (!this.adjacency.has(to)) this.addNode(to);

    this.adjacency.get(from)!.push(to);
    this.inDegree.set(to, (this.inDegree.get(to) || 0) + 1);
  }

  /**
   * 获取节点的出边邻居
   */
  getNeighbors(nodeId: string): string[] {
    return this.adjacency.get(nodeId) ?? [];
  }

  /**
   * 获取节点的入度
   */
  getInDegree(nodeId: string): number {
    return this.inDegree.get(nodeId) ?? 0;
  }

  /**
   * 获取所有节点
   */
  getNodes(): string[] {
    return Array.from(this.adjacency.keys());
  }

  /**
   * 获取节点数量
   */
  getNodeCount(): number {
    return this.adjacency.size;
  }

  /**
   * 创建当前图的深拷贝（用于算法中修改）
   */
  clone(): DirectedGraph {
    const cloned = new DirectedGraph();
    for (const node of this.getNodes()) {
      cloned.addNode(node);
    }
    for (const [from, neighbors] of this.adjacency) {
      for (const to of neighbors) {
        cloned.addEdge(from, to);
      }
    }
    return cloned;
  }
}

/** 拓扑排序结果 */
export interface TopologicalSortResult {
  /** 排序是否成功（若为 false 表示图中存在环） */
  success: boolean;
  /** 拓扑序列（success 为 true 时有效） */
  order?: string[];
  /** 检测到的环（success 为 false 时可能存在） */
  cycle?: string[];
}

/**
 * 拓扑排序器
 *
 * 提供 Kahn 算法和 DFS 两种拓扑排序实现。
 */
export class TopologicalSort {
  /**
   * Kahn 算法（基于入度）
   *
   * 时间复杂度 O(V + E)，适用于大多数场景。
   * @param graph - 有向图
   * @returns 拓扑排序结果
   */
  static kahn(graph: DirectedGraph): TopologicalSortResult {
    const inDegree = new Map<string, number>();
    for (const node of graph.getNodes()) {
      inDegree.set(node, graph.getInDegree(node));
    }

    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node);
    }

    const order: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      for (const neighbor of graph.getNeighbors(current)) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (order.length !== graph.getNodeCount()) {
      return { success: false, cycle: this.findCycle(graph) };
    }

    return { success: true, order };
  }

  /**
   * DFS 后序遍历算法
   *
   * 时间复杂度 O(V + E)，会返回一个有效的拓扑序列。
   * @param graph - 有向图
   * @returns 拓扑排序结果
   */
  static dfs(graph: DirectedGraph): TopologicalSortResult {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const order: string[] = [];

    const visit = (node: string): boolean => {
      if (recStack.has(node)) return false; // 发现环
      if (visited.has(node)) return true;

      recStack.add(node);
      visited.add(node);

      for (const neighbor of graph.getNeighbors(node)) {
        if (!visit(neighbor)) return false;
      }

      recStack.delete(node);
      order.unshift(node);
      return true;
    };

    for (const node of graph.getNodes()) {
      if (!visited.has(node)) {
        if (!visit(node)) {
          return { success: false, cycle: this.findCycle(graph) };
        }
      }
    }

    return { success: true, order };
  }

  /**
   * 检测图中是否存在环
   * @param graph - 有向图
   * @returns 是否存在环
   */
  static hasCycle(graph: DirectedGraph): boolean {
    return !this.kahn(graph).success;
  }

  /**
   * 获取图中一个环（如果存在）
   * @param graph - 有向图
   * @returns 环上的节点序列，若无环则返回空数组
   */
  private static findCycle(graph: DirectedGraph): string[] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const parent = new Map<string, string>();

    const visit = (node: string): string[] | null => {
      visited.add(node);
      recStack.add(node);

      for (const neighbor of graph.getNeighbors(node)) {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, node);
          const cycle = visit(neighbor);
          if (cycle) return cycle;
        } else if (recStack.has(neighbor)) {
          // 发现环，重建环路径
          const cycle: string[] = [neighbor];
          let current = node;
          while (current !== neighbor) {
            cycle.unshift(current);
            current = parent.get(current) ?? neighbor;
            if (cycle.includes(current) && current !== neighbor) break;
          }
          return cycle;
        }
      }

      recStack.delete(node);
      return null;
    };

    for (const node of graph.getNodes()) {
      if (!visited.has(node)) {
        const cycle = visit(node);
        if (cycle) return cycle;
      }
    }

    return [];
  }
}

export function demo(): void {
  console.log('=== 拓扑排序 ===\n');

  // 课程依赖图
  const graph = new DirectedGraph();
  graph.addEdge('数学', '算法');
  graph.addEdge('编程基础', '算法');
  graph.addEdge('编程基础', 'Web开发');
  graph.addEdge('算法', '机器学习');
  graph.addEdge('数学', '机器学习');
  graph.addEdge('Web开发', '全栈开发');

  console.log('课程依赖图节点:', graph.getNodes().join(', '));

  const kahnResult = TopologicalSort.kahn(graph);
  if (kahnResult.success && kahnResult.order) {
    console.log('\nKahn 算法拓扑序列:', kahnResult.order.join(' -> '));
  }

  const dfsResult = TopologicalSort.dfs(graph);
  if (dfsResult.success && dfsResult.order) {
    console.log('DFS 算法拓扑序列:', dfsResult.order.join(' -> '));
  }

  // 环检测
  console.log('\n--- 环检测 ---');
  const cyclicGraph = new DirectedGraph();
  cyclicGraph.addEdge('A', 'B');
  cyclicGraph.addEdge('B', 'C');
  cyclicGraph.addEdge('C', 'A');

  console.log('有环图:', TopologicalSort.hasCycle(cyclicGraph) ? '存在环' : '无环');
  const cyclicResult = TopologicalSort.kahn(cyclicGraph);
  if (!cyclicResult.success) {
    console.log('检测到的环:', cyclicResult.cycle?.join(' -> '));
  }
}
