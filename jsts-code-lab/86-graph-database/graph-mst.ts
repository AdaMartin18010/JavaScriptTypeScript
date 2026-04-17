/**
 * @file 最小生成树（MST）
 * @category Graph Database → Minimum Spanning Tree
 * @difficulty medium
 * @tags mst, kruskal, prim, union-find, greedy
 *
 * @description
 * 实现最小生成树算法：
 * - Kruskal 算法（基于边排序 + 并查集）
 * - Prim 算法（基于优先队列）
 * - 支持带权无向图
 * - 返回 MST 的边集合和总权重
 */

import { UnionFind } from './graph-connected-components.js';

/** 带权边 */
export interface Edge {
  /** 起始节点 */
  from: string;
  /** 目标节点 */
  to: string;
  /** 边权重 */
  weight: number;
}

/** MST 结果 */
export interface MSTResult {
  /** MST 中的边 */
  edges: Edge[];
  /** 总权重 */
  totalWeight: number;
  /** 是否成功构建（图不连通时可能失败） */
  success: boolean;
}

/** 最小堆节点 */
interface PrimHeapNode {
  nodeId: string;
  weight: number;
  from: string;
}

/** 最小二叉堆 */
class MinHeap {
  private heap: PrimHeapNode[] = [];

  insert(node: PrimHeapNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): PrimHeapNode | undefined {
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

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].weight <= this.heap[index].weight) break;
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

      if (left < length && this.heap[left].weight < this.heap[smallest].weight) smallest = left;
      if (right < length && this.heap[right].weight < this.heap[smallest].weight) smallest = right;
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/** 无向带权图（用于 MST） */
export class UndirectedWeightedGraph {
  private adjacency = new Map<string, Map<string, number>>();

  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Map());
    }
  }

  addEdge(a: string, b: string, weight: number): void {
    if (!this.adjacency.has(a)) this.addNode(a);
    if (!this.adjacency.has(b)) this.addNode(b);

    this.adjacency.get(a)!.set(b, weight);
    this.adjacency.get(b)!.set(a, weight);
  }

  getNeighbors(id: string): Map<string, number> {
    return this.adjacency.get(id) ?? new Map();
  }

  getNodes(): string[] {
    return Array.from(this.adjacency.keys());
  }

  getNodeCount(): number {
    return this.adjacency.size;
  }

  /**
   * 获取所有边（去重）
   */
  getAllEdges(): Edge[] {
    const edges: Edge[] = [];
    const seen = new Set<string>();

    for (const [from, neighbors] of this.adjacency) {
      for (const [to, weight] of neighbors) {
        const key = [from, to].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from, to, weight });
        }
      }
    }

    return edges;
  }
}

/**
 * 最小生成树计算器
 */
export class MinimumSpanningTree {
  /**
   * Kruskal 算法
   *
   * 时间复杂度 O(E log E)。适用于稀疏图。
   * @param graph - 无向带权图
   * @returns MST 结果
   */
  static kruskal(graph: UndirectedWeightedGraph): MSTResult {
    const edges = graph.getAllEdges().sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind();
    const mstEdges: Edge[] = [];
    let totalWeight = 0;

    for (const node of graph.getNodes()) {
      uf.add(node);
    }

    for (const edge of edges) {
      if (uf.union(edge.from, edge.to)) {
        mstEdges.push(edge);
        totalWeight += edge.weight;
      }
    }

    // 检查图是否连通
    const success = mstEdges.length === graph.getNodeCount() - 1 && graph.getNodeCount() > 0;

    return { edges: mstEdges, totalWeight, success };
  }

  /**
   * Prim 算法
   *
   * 时间复杂度 O((V + E) log V)。适用于稠密图。
   * @param graph - 无向带权图
   * @param startNode - 起始节点（默认为第一个节点）
   * @returns MST 结果
   */
  static prim(graph: UndirectedWeightedGraph, startNode?: string): MSTResult {
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
      return { edges: [], totalWeight: 0, success: false };
    }

    const start = startNode ?? nodes[0];
    if (!nodes.includes(start)) {
      throw new Error(`Start node "${start}" does not exist in the graph`);
    }

    const visited = new Set<string>();
    const mstEdges: Edge[] = [];
    let totalWeight = 0;
    const heap = new MinHeap();

    visited.add(start);

    // 将起始节点的所有边加入堆
    for (const [neighbor, weight] of graph.getNeighbors(start)) {
      heap.insert({ nodeId: neighbor, weight, from: start });
    }

    while (!heap.isEmpty()) {
      const min = heap.extractMin()!;

      if (visited.has(min.nodeId)) continue;

      visited.add(min.nodeId);
      mstEdges.push({ from: min.from, to: min.nodeId, weight: min.weight });
      totalWeight += min.weight;

      for (const [neighbor, weight] of graph.getNeighbors(min.nodeId)) {
        if (!visited.has(neighbor)) {
          heap.insert({ nodeId: neighbor, weight, from: min.nodeId });
        }
      }
    }

    const success = visited.size === nodes.length;
    return { edges: mstEdges, totalWeight, success };
  }
}

export function demo(): void {
  console.log('=== 最小生成树 ===\n');

  const graph = new UndirectedWeightedGraph();

  // 示例图（城市网络）
  graph.addEdge('北京', '上海', 1200);
  graph.addEdge('北京', '广州', 2100);
  graph.addEdge('上海', '广州', 1400);
  graph.addEdge('上海', '深圳', 1500);
  graph.addEdge('广州', '深圳', 140);
  graph.addEdge('北京', '深圳', 2200);

  console.log('图节点:', graph.getNodes().join(', '));

  const kruskalResult = MinimumSpanningTree.kruskal(graph);
  console.log('\nKruskal 算法:');
  console.log('  成功:', kruskalResult.success);
  console.log('  总权重:', kruskalResult.totalWeight);
  kruskalResult.edges.forEach(e => {
    console.log(`    ${e.from} - ${e.to}: ${e.weight}`);
  });

  const primResult = MinimumSpanningTree.prim(graph);
  console.log('\nPrim 算法:');
  console.log('  成功:', primResult.success);
  console.log('  总权重:', primResult.totalWeight);
  primResult.edges.forEach(e => {
    console.log(`    ${e.from} - ${e.to}: ${e.weight}`);
  });
}
