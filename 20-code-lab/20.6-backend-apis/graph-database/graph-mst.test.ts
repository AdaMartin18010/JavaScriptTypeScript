import { describe, it, expect } from 'vitest';
import { UndirectedWeightedGraph, MinimumSpanningTree } from './graph-mst.js';

describe('UndirectedWeightedGraph', () => {
  it('should add nodes and edges', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 5);
    expect(graph.getNodeCount()).toBe(2);
    expect(graph.getAllEdges()).toHaveLength(1);
  });

  it('should deduplicate edges in getAllEdges', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 5);
    const edges = graph.getAllEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0].weight).toBe(5);
  });
});

describe('MinimumSpanningTree.kruskal', () => {
  it('should build MST for connected graph', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 1);
    graph.addEdge('B', 'C', 2);
    graph.addEdge('A', 'C', 3);

    const result = MinimumSpanningTree.kruskal(graph);
    expect(result.success).toBe(true);
    expect(result.edges).toHaveLength(2);
    expect(result.totalWeight).toBe(3);
  });

  it('should return empty MST for empty graph', () => {
    const graph = new UndirectedWeightedGraph();
    const result = MinimumSpanningTree.kruskal(graph);
    expect(result.success).toBe(false);
    expect(result.edges).toHaveLength(0);
  });

  it('should find correct MST for complex graph', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'D', 1);
    graph.addEdge('B', 'D', 2);
    graph.addEdge('B', 'C', 5);
    graph.addEdge('D', 'C', 3);

    const result = MinimumSpanningTree.kruskal(graph);
    expect(result.success).toBe(true);
    expect(result.totalWeight).toBe(6);
  });
});

describe('MinimumSpanningTree.prim', () => {
  it('should build MST for connected graph', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 1);
    graph.addEdge('B', 'C', 2);
    graph.addEdge('A', 'C', 3);

    const result = MinimumSpanningTree.prim(graph, 'A');
    expect(result.success).toBe(true);
    expect(result.edges).toHaveLength(2);
    expect(result.totalWeight).toBe(3);
  });

  it('should throw for non-existent start node', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addNode('A');
    expect(() => MinimumSpanningTree.prim(graph, 'Z')).toThrow('does not exist');
  });

  it('should return empty MST for empty graph', () => {
    const graph = new UndirectedWeightedGraph();
    const result = MinimumSpanningTree.prim(graph);
    expect(result.success).toBe(false);
  });

  it('should produce same total weight as Kruskal', () => {
    const graph = new UndirectedWeightedGraph();
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'D', 1);
    graph.addEdge('B', 'D', 2);
    graph.addEdge('B', 'C', 5);
    graph.addEdge('D', 'C', 3);

    const kruskal = MinimumSpanningTree.kruskal(graph);
    const prim = MinimumSpanningTree.prim(graph);
    expect(kruskal.totalWeight).toBe(prim.totalWeight);
  });
});
