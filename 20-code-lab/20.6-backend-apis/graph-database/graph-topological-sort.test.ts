import { describe, it, expect } from 'vitest';
import { DirectedGraph, TopologicalSort } from './graph-topological-sort.js';

describe('DirectedGraph', () => {
  it('should add nodes and edges', () => {
    const graph = new DirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    expect(graph.getNodeCount()).toBe(3);
    expect(graph.getInDegree('C')).toBe(1);
    expect(graph.getInDegree('A')).toBe(0);
  });

  it('should return neighbors', () => {
    const graph = new DirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    expect(graph.getNeighbors('A')).toEqual(['B', 'C']);
  });
});

describe('TopologicalSort.kahn', () => {
  it('should return a valid topological order for DAG', () => {
    const graph = new DirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('C', 'D');

    const result = TopologicalSort.kahn(graph);
    expect(result.success).toBe(true);
    expect(result.order).toHaveLength(4);
    expect(result.order![0]).toBe('A');
    expect(result.order![3]).toBe('D');
  });

  it('should detect cycle', () => {
    const graph = new DirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A');

    const result = TopologicalSort.kahn(graph);
    expect(result.success).toBe(false);
    expect(result.cycle).toBeDefined();
    expect(result.cycle!.length).toBeGreaterThan(0);
  });

  it('should handle empty graph', () => {
    const graph = new DirectedGraph();
    const result = TopologicalSort.kahn(graph);
    expect(result.success).toBe(true);
    expect(result.order).toEqual([]);
  });

  it('should handle single node', () => {
    const graph = new DirectedGraph();
    graph.addNode('A');
    const result = TopologicalSort.kahn(graph);
    expect(result.success).toBe(true);
    expect(result.order).toEqual(['A']);
  });
});

describe('TopologicalSort.dfs', () => {
  it('should return a valid topological order for DAG', () => {
    const graph = new DirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');

    const result = TopologicalSort.dfs(graph);
    expect(result.success).toBe(true);
    expect(result.order).toEqual(['A', 'B', 'C']);
  });

  it('should detect cycle', () => {
    const graph = new DirectedGraph();
    graph.addEdge('X', 'Y');
    graph.addEdge('Y', 'Z');
    graph.addEdge('Z', 'X');

    const result = TopologicalSort.dfs(graph);
    expect(result.success).toBe(false);
  });
});

describe('TopologicalSort.hasCycle', () => {
  it('should return false for DAG', () => {
    const graph = new DirectedGraph();
    graph.addEdge('1', '2');
    expect(TopologicalSort.hasCycle(graph)).toBe(false);
  });

  it('should return true for cyclic graph', () => {
    const graph = new DirectedGraph();
    graph.addEdge('1', '2');
    graph.addEdge('2', '1');
    expect(TopologicalSort.hasCycle(graph)).toBe(true);
  });
});
