/**
 * @file 二分图检测
 * @category Graph Database → Bipartite Graph
 * @difficulty medium
 * @tags bipartite, two-coloring, graph-coloring, bfs
 *
 * @description
 * 实现二分图（二部图）检测与着色：
 * - BFS 两色着色法
 * - DFS 两色着色法
 * - 检测图中是否存在奇数长度环
 * - 返回两种颜色组的节点划分
 */

/** 着色结果 */
export interface BipartiteResult {
  /** 是否为二分图 */
  isBipartite: boolean;
  /** 颜色分组（0 和 1），若非二分图则为空 */
  groups?: [string[], string[]];
  /** 检测到的奇数环（若非二分图） */
  oddCycle?: string[];
}

/** 无向图 */
export class UndirectedGraph {
  private adjacency = new Map<string, string[]>();

  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  addEdge(a: string, b: string): void {
    if (!this.adjacency.has(a)) this.addNode(a);
    if (!this.adjacency.has(b)) this.addNode(b);

    this.adjacency.get(a)!.push(b);
    this.adjacency.get(b)!.push(a);
  }

  getNeighbors(id: string): string[] {
    return this.adjacency.get(id) ?? [];
  }

  getNodes(): string[] {
    return Array.from(this.adjacency.keys());
  }
}

/**
 * 二分图检测器
 */
export class BipartiteChecker {
  /**
   * BFS 两色着色法检测二分图
   * @param graph - 无向图
   * @returns 二分图检测结果
   */
  static checkBFS(graph: UndirectedGraph): BipartiteResult {
    const colors = new Map<string, 0 | 1>();
    const parent = new Map<string, string | null>();

    const bfs = (start: string): { isBipartite: boolean; oddCycle?: string[] } => {
      const queue: string[] = [start];
      colors.set(start, 0);
      parent.set(start, null);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentColor = colors.get(current)!;
        const nextColor: 0 | 1 = currentColor === 0 ? 1 : 0;

        for (const neighbor of graph.getNeighbors(current)) {
          if (!colors.has(neighbor)) {
            colors.set(neighbor, nextColor);
            parent.set(neighbor, current);
            queue.push(neighbor);
          } else if (colors.get(neighbor) === currentColor) {
            // 发现冲突，重建奇数环
            const cycle = this.reconstructOddCycle(parent, current, neighbor);
            return { isBipartite: false, oddCycle: cycle };
          }
        }
      }

      return { isBipartite: true };
    };

    for (const node of graph.getNodes()) {
      if (!colors.has(node)) {
        const result = bfs(node);
        if (!result.isBipartite) {
          return { isBipartite: false, oddCycle: result.oddCycle };
        }
      }
    }

    const group0: string[] = [];
    const group1: string[] = [];
    for (const [node, color] of colors) {
      if (color === 0) group0.push(node);
      else group1.push(node);
    }

    return { isBipartite: true, groups: [group0, group1] };
  }

  /**
   * DFS 两色着色法检测二分图
   * @param graph - 无向图
   * @returns 二分图检测结果
   */
  static checkDFS(graph: UndirectedGraph): BipartiteResult {
    const colors = new Map<string, 0 | 1>();

    const dfs = (node: string, color: 0 | 1): boolean => {
      colors.set(node, color);

      for (const neighbor of graph.getNeighbors(node)) {
        if (!colors.has(neighbor)) {
          if (!dfs(neighbor, color === 0 ? 1 : 0)) return false;
        } else if (colors.get(neighbor) === color) {
          return false;
        }
      }

      return true;
    };

    for (const node of graph.getNodes()) {
      if (!colors.has(node)) {
        if (!dfs(node, 0)) {
          return { isBipartite: false };
        }
      }
    }

    const group0: string[] = [];
    const group1: string[] = [];
    for (const [node, color] of colors) {
      if (color === 0) group0.push(node);
      else group1.push(node);
    }

    return { isBipartite: true, groups: [group0, group1] };
  }

  private static reconstructOddCycle(
    parent: Map<string, string | null>,
    nodeA: string,
    nodeB: string
  ): string[] {
    // 找到 nodeA 和 nodeB 的最近公共祖先
    const pathA: string[] = [];
    let cur: string | null = nodeA;
    while (cur !== null) {
      pathA.unshift(cur);
      cur = parent.get(cur) ?? null;
    }

    const pathB: string[] = [];
    cur = nodeB;
    while (cur !== null) {
      pathB.unshift(cur);
      cur = parent.get(cur) ?? null;
    }

    // 找到公共前缀的最后一个节点
    let lcaIndex = 0;
    while (lcaIndex < pathA.length && lcaIndex < pathB.length && pathA[lcaIndex] === pathB[lcaIndex]) {
      lcaIndex++;
    }

    const cycle = [
      ...pathA.slice(lcaIndex - 1),
      ...pathB.slice(lcaIndex).reverse(),
    ];

    return cycle;
  }
}

export function demo(): void {
  console.log('=== 二分图检测 ===\n');

  // 二分图示例（人员-技能匹配）
  const bipartiteGraph = new UndirectedGraph();
  bipartiteGraph.addEdge('Alice', 'JavaScript');
  bipartiteGraph.addEdge('Alice', 'TypeScript');
  bipartiteGraph.addEdge('Bob', 'Python');
  bipartiteGraph.addEdge('Bob', 'TypeScript');
  bipartiteGraph.addEdge('Charlie', 'Rust');
  bipartiteGraph.addEdge('Charlie', 'Python');

  const result1 = BipartiteChecker.checkBFS(bipartiteGraph);
  console.log('人员-技能图是二分图:', result1.isBipartite);
  if (result1.groups) {
    console.log('  组 0:', result1.groups[0].join(', '));
    console.log('  组 1:', result1.groups[1].join(', '));
  }

  // 非二分图示例（三角形）
  const triangleGraph = new UndirectedGraph();
  triangleGraph.addEdge('A', 'B');
  triangleGraph.addEdge('B', 'C');
  triangleGraph.addEdge('C', 'A');

  const result2 = BipartiteChecker.checkBFS(triangleGraph);
  console.log('\n三角形图是二分图:', result2.isBipartite);
  if (result2.oddCycle) {
    console.log('  奇数环:', result2.oddCycle.join(' -> '));
  }

  // 四边形（二分图）
  const squareGraph = new UndirectedGraph();
  squareGraph.addEdge('1', '2');
  squareGraph.addEdge('2', '3');
  squareGraph.addEdge('3', '4');
  squareGraph.addEdge('4', '1');

  const result3 = BipartiteChecker.checkDFS(squareGraph);
  console.log('\n四边形图是二分图:', result3.isBipartite);
  if (result3.groups) {
    console.log('  组 0:', result3.groups[0].join(', '));
    console.log('  组 1:', result3.groups[1].join(', '));
  }
}
