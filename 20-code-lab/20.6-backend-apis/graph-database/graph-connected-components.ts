/**
 * @file 连通分量检测
 * @category Graph Database → Connected Components
 * @difficulty medium
 * @tags connected-components, union-find, dfs, bfs, undirected-graph
 *
 * @description
 * 实现无向图的连通分量检测：
 * - DFS/BFS 遍历检测
 * - 并查集（Union-Find）算法
 * - 路径压缩与按秩合并优化
 * - 支持获取每个连通分量的节点集合
 */

/** 并查集节点 */
interface UnionFindNode {
  parent: string;
  rank: number;
}

/**
 * 并查集（Union-Find / Disjoint Set Union）
 *
 * 用于高效管理元素的分组与合并操作，近乎 O(1) 的查询与合并效率。
 */
export class UnionFind {
  private nodes = new Map<string, UnionFindNode>();

  /**
   * 添加元素到并查集
   * @param id - 元素 ID
   */
  add(id: string): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { parent: id, rank: 0 });
    }
  }

  /**
   * 查找元素的根节点（带路径压缩）
   * @param id - 元素 ID
   * @returns 根节点 ID
   */
  find(id: string): string {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Element "${id}" does not exist in Union-Find`);
    }

    if (node.parent !== id) {
      node.parent = this.find(node.parent); // 路径压缩
    }
    return node.parent;
  }

  /**
   * 合并两个元素所在的集合（按秩合并）
   * @param a - 元素 A
   * @param b - 元素 B
   * @returns 是否发生了合并（若已在同一集合则返回 false）
   */
  union(a: string, b: string): boolean {
    this.add(a);
    this.add(b);

    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return false;

    const nodeA = this.nodes.get(rootA)!;
    const nodeB = this.nodes.get(rootB)!;

    // 按秩合并：将秩较小的树合并到秩较大的树下
    if (nodeA.rank < nodeB.rank) {
      nodeA.parent = rootB;
    } else if (nodeA.rank > nodeB.rank) {
      nodeB.parent = rootA;
    } else {
      nodeB.parent = rootA;
      nodeA.rank++;
    }

    return true;
  }

  /**
   * 检查两个元素是否在同一个集合
   * @param a - 元素 A
   * @param b - 元素 B
   */
  isConnected(a: string, b: string): boolean {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false;
    return this.find(a) === this.find(b);
  }

  /**
   * 获取集合数量
   */
  getComponentCount(): number {
    const roots = new Set<string>();
    for (const id of this.nodes.keys()) {
      roots.add(this.find(id));
    }
    return roots.size;
  }

  /**
   * 获取所有连通分量
   * @returns 每个连通分量的节点数组
   */
  getComponents(): string[][] {
    const components = new Map<string, string[]>();
    for (const id of this.nodes.keys()) {
      const root = this.find(id);
      if (!components.has(root)) {
        components.set(root, []);
      }
      components.get(root)!.push(id);
    }
    return Array.from(components.values());
  }

  /**
   * 获取元素数量
   */
  getSize(): number {
    return this.nodes.size;
  }
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

  getNodeCount(): number {
    return this.adjacency.size;
  }
}

/**
 * 连通分量检测器
 */
export class ConnectedComponents {
  /**
   * 使用 Union-Find 检测连通分量
   * @param graph - 无向图
   * @returns 每个连通分量的节点数组
   */
  static findWithUnionFind(graph: UndirectedGraph): string[][] {
    const uf = new UnionFind();

    for (const node of graph.getNodes()) {
      uf.add(node);
    }

    const processed = new Set<string>();
    for (const node of graph.getNodes()) {
      for (const neighbor of graph.getNeighbors(node)) {
        const edgeKey = [node, neighbor].sort().join('-');
        if (!processed.has(edgeKey)) {
          uf.union(node, neighbor);
          processed.add(edgeKey);
        }
      }
    }

    return uf.getComponents();
  }

  /**
   * 使用 DFS 检测连通分量
   * @param graph - 无向图
   * @returns 每个连通分量的节点数组
   */
  static findWithDFS(graph: UndirectedGraph): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    const dfs = (node: string, component: string[]): void => {
      visited.add(node);
      component.push(node);
      for (const neighbor of graph.getNeighbors(node)) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    };

    for (const node of graph.getNodes()) {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs(node, component);
        components.push(component);
      }
    }

    return components;
  }

  /**
   * 使用 BFS 检测连通分量
   * @param graph - 无向图
   * @returns 每个连通分量的节点数组
   */
  static findWithBFS(graph: UndirectedGraph): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const node of graph.getNodes()) {
      if (visited.has(node)) continue;

      const component: string[] = [];
      const queue: string[] = [node];
      visited.add(node);

      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);

        for (const neighbor of graph.getNeighbors(current)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      components.push(component);
    }

    return components;
  }
}

export function demo(): void {
  console.log('=== 连通分量检测 ===\n');

  const graph = new UndirectedGraph();

  // 连通分量 1
  graph.addEdge('A', 'B');
  graph.addEdge('B', 'C');
  graph.addEdge('A', 'C');

  // 连通分量 2
  graph.addEdge('D', 'E');

  // 孤立节点
  graph.addNode('F');

  console.log('图节点数:', graph.getNodeCount());

  const ufComponents = ConnectedComponents.findWithUnionFind(graph);
  console.log('\nUnion-Find 检测到的连通分量:');
  ufComponents.forEach((comp, i) => {
    console.log(`  分量 ${i + 1}: [${comp.join(', ')}]`);
  });

  const dfsComponents = ConnectedComponents.findWithDFS(graph);
  console.log('\nDFS 检测到的连通分量:');
  dfsComponents.forEach((comp, i) => {
    console.log(`  分量 ${i + 1}: [${comp.join(', ')}]`);
  });

  // 并查集演示
  console.log('\n--- 并查集操作 ---');
  const uf = new UnionFind();
  ['A', 'B', 'C', 'D', 'E'].forEach(x => uf.add(x));
  uf.union('A', 'B');
  uf.union('B', 'C');
  console.log('A 和 C 连通:', uf.isConnected('A', 'C'));
  console.log('A 和 D 连通:', uf.isConnected('A', 'D'));
  console.log('集合数量:', uf.getComponentCount());
}
