import { describe, it, expect } from 'vitest';
import { WeightedGraph, Dijkstra } from './graph-dijkstra.js';

describe('WeightedGraph', () => {
  it('should add nodes and edges', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 5, true);
    expect(graph.getNodeCount()).toBe(2);
    expect(graph.getEdgeCount()).toBe(2);
  });

  it('should throw on negative weight', () => {
    const graph = new WeightedGraph();
    expect(() => graph.addEdge('A', 'B', -1)).toThrow('negative edge weights');
  });

  it('should return correct neighbors', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 5);
    graph.addEdge('A', 'C', 3);
    const neighbors = graph.getNeighbors('A');
    expect(neighbors.length).toBe(2);
    expect(neighbors.map(n => n.to)).toContain('B');
    expect(neighbors.map(n => n.to)).toContain('C');
  });
});

describe('Dijkstra', () => {
  it('should compute shortest distances from source', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 4, true);
    graph.addEdge('A', 'D', 2, true);
    graph.addEdge('B', 'C', 1, true);
    graph.addEdge('D', 'E', 2, true);
    graph.addEdge('E', 'C', 3, true);

    const distances = Dijkstra.distancesFrom(graph, 'A');
    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(4);
    expect(distances.get('D')).toBe(2);
    expect(distances.get('E')).toBe(4);
    expect(distances.get('C')).toBe(5);
  });

  it('should find shortest path between two nodes', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 4, true);
    graph.addEdge('A', 'D', 2, true);
    graph.addEdge('B', 'C', 1, true);
    graph.addEdge('D', 'B', 1, true);

    const path = Dijkstra.shortestPath(graph, 'A', 'C');
    expect(path).not.toBeNull();
    expect(path!.path).toEqual(['A', 'D', 'B', 'C']);
    expect(path!.totalWeight).toBe(4);
  });

  it('should return null for unreachable node', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 1, true);
    graph.addNode('C');

    const path = Dijkstra.shortestPath(graph, 'A', 'C');
    expect(path).toBeNull();
  });

  it('should throw for non-existent source', () => {
    const graph = new WeightedGraph();
    graph.addNode('A');
    expect(() => Dijkstra.compute(graph, 'Z')).toThrow('does not exist');
  });

  it('should handle single node graph', () => {
    const graph = new WeightedGraph();
    graph.addNode('A');
    const distances = Dijkstra.distancesFrom(graph, 'A');
    expect(distances.get('A')).toBe(0);
  });

  it('should handle direct path as shortest', () => {
    const graph = new WeightedGraph();
    graph.addEdge('A', 'B', 1, true);
    graph.addEdge('A', 'C', 5, true);
    graph.addEdge('B', 'C', 1, true);

    const path = Dijkstra.shortestPath(graph, 'A', 'C');
    expect(path!.path).toEqual(['A', 'B', 'C']);
    expect(path!.totalWeight).toBe(2);
  });
});
