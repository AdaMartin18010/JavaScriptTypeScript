/**
 * @file Dijkstra 最短路径算法
 * @category Graph Database → Shortest Path
 * @difficulty medium
 * @tags dijkstra, shortest-path, weighted-graph, priority-queue
 *
 * @description
 * 实现 Dijkstra 单源最短路径算法，适用于带权有向/无向图：
 * - 使用最小堆（优先队列）优化，时间复杂度 O((V+E) log V)
 * - 支持获取单源到所有节点的最短距离
 * - 支持获取两点间的具体最短路径
 * - 检测不可达节点
 */

/** 带权边 */
export interface WeightedEdge {
  /** 目标节点 ID */
  to: string;
  /** 边权重（必须为非负数） */
  weight: number;
}

/** 单条路径结果 */
export interface ShortestPathResult {
  /** 路径节点序列 */
  path: string[];
  /** 总权重 */
  totalWeight: number;
}

/** Dijkstra 全源结果 */
export interface DijkstraResult {
  /** 节点 ID → 最短距离 */
  distances: Map<string, number>;
  /** 节点 ID → 前驱节点（用于重建路径） */
  predecessors: Map<string, string | null>;
}

/** 最小堆节点 */
interface HeapNode {
  nodeId: string;
  distance: number;
}

/**
 * 最小二叉堆（优先队列）
 *
 * 用于 Dijkstra 算法中高效获取当前距离最小的节点。
 */
class MinHeap {
  private heap: HeapNode[] = [];

  insert(node: HeapNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): HeapNode | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].distance <= this.heap[index].distance) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].distance < this.heap[smallest].distance) {
        smallest = left;
      }
      if (right < length && this.heap[right].distance < this.heap[smallest].distance) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/**
 * 带权图（基于邻接表）
 */
export class WeightedGraph {
  private adjacency = new Map<string, WeightedEdge[]>();

  /**
   * 添加节点（若不存在）
   * @param id - 节点 ID
   */
  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  /**
   * 添加带权边
   * @param from - 起始节点
   * @param to - 目标节点
   * @param weight - 权重（必须 >= 0）
   * @param bidirectional - 是否为无向边（双向添加）
   */
  addEdge(from: string, to: string, weight: number, bidirectional = false): void {
    if (weight < 0) {
      throw new Error('Dijkstra algorithm does not support negative edge weights');
    }
    if (!this.adjacency.has(from)) this.addNode(from);
    if (!this.adjacency.has(to)) this.addNode(to);

    this.adjacency.get(from)!.push({ to, weight });
    if (bidirectional) {
      this.adjacency.get(to)!.push({ to: from, weight });
    }
  }

  /**
   * 获取节点的邻居
   * @param nodeId - 节点 ID
   */
  getNeighbors(nodeId: string): WeightedEdge[] {
    return this.adjacency.get(nodeId) ?? [];
  }

  /**
   * 获取所有节点 ID
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
   * 获取边数量
   */
  getEdgeCount(): number {
    let count = 0;
    for (const edges of this.adjacency.values()) {
      count += edges.length;
    }
    return count;
  }
}

/**
 * Dijkstra 最短路径计算器
 */
export class Dijkstra {
  /**
   * 计算从源节点到所有其他节点的最短距离和路径信息
   * @param graph - 带权图
   * @param source - 源节点 ID
   * @returns Dijkstra 计算结果
   */
  static compute(graph: WeightedGraph, source: string): DijkstraResult {
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();
    const visited = new Set<string>();
    const heap = new MinHeap();

    // 初始化
    for (const node of graph.getNodes()) {
      distances.set(node, node === source ? 0 : Infinity);
      predecessors.set(node, null);
    }

    if (!distances.has(source)) {
      throw new Error(`Source node "${source}" does not exist in the graph`);
    }

    heap.insert({ nodeId: source, distance: 0 });

    while (!heap.isEmpty()) {
      const current = heap.extractMin()!;

      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      const neighbors = graph.getNeighbors(current.nodeId);
      for (const edge of neighbors) {
        if (visited.has(edge.to)) continue;

        const newDistance = current.distance + edge.weight;
        if (newDistance < (distances.get(edge.to) ?? Infinity)) {
          distances.set(edge.to, newDistance);
          predecessors.set(edge.to, current.nodeId);
          heap.insert({ nodeId: edge.to, distance: newDistance });
        }
      }
    }

    return { distances, predecessors };
  }

  /**
   * 获取从源节点到目标节点的最短路径
   * @param graph - 带权图
   * @param source - 源节点
   * @param target - 目标节点
   * @returns 最短路径结果，若不可达则返回 null
   */
  static shortestPath(graph: WeightedGraph, source: string, target: string): ShortestPathResult | null {
    const result = this.compute(graph, source);
    const distance = result.distances.get(target);

    if (distance === undefined || distance === Infinity) {
      return null;
    }

    // 重建路径
    const path: string[] = [];
    let current: string | null = target;
    while (current !== null) {
      path.unshift(current);
      current = result.predecessors.get(current) ?? null;
    }

    if (path[0] !== source) {
      return null;
    }

    return { path, totalWeight: distance };
  }

  /**
   * 获取从源节点到所有可达节点的最短距离
   * @param graph - 带权图
   * @param source - 源节点
   * @returns 节点到距离的映射
   */
  static distancesFrom(graph: WeightedGraph, source: string): Map<string, number> {
    return this.compute(graph, source).distances;
  }
}

export function demo(): void {
  console.log('=== Dijkstra 最短路径 ===\n');

  const graph = new WeightedGraph();

  // 构建示例图
  // A --4--> B --1--> C
  // |         |         |
  // 2         3         5
  // |         |         |
  // D --2--> E --1--> F
  graph.addEdge('A', 'B', 4, true);
  graph.addEdge('A', 'D', 2, true);
  graph.addEdge('B', 'C', 1, true);
  graph.addEdge('B', 'E', 3, true);
  graph.addEdge('D', 'E', 2, true);
  graph.addEdge('E', 'F', 1, true);
  graph.addEdge('C', 'F', 5, true);

  console.log('图节点数:', graph.getNodeCount());
  console.log('图边数:', graph.getEdgeCount());

  const result = Dijkstra.compute(graph, 'A');
  console.log('\n从 A 出发的最短距离:');
  for (const [node, dist] of result.distances) {
    const distStr = dist === Infinity ? '∞' : String(dist);
    console.log(`  A -> ${node}: ${distStr}`);
  }

  const pathAF = Dijkstra.shortestPath(graph, 'A', 'F');
  if (pathAF) {
    console.log(`\nA -> F 最短路径: ${pathAF.path.join(' -> ')} (权重: ${pathAF.totalWeight})`);
  }

  const pathAC = Dijkstra.shortestPath(graph, 'A', 'C');
  if (pathAC) {
    console.log(`A -> C 最短路径: ${pathAC.path.join(' -> ')} (权重: ${pathAC.totalWeight})`);
  }
}
