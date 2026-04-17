import { describe, it, expect } from 'vitest';
import { UndirectedGraph, BipartiteChecker } from './graph-bipartite.js';

describe('UndirectedGraph', () => {
  it('should add nodes and edges', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('A', 'B');
    expect(graph.getNodes()).toContain('A');
    expect(graph.getNodes()).toContain('B');
  });
});

describe('BipartiteChecker.checkBFS', () => {
  it('should identify bipartite graph', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'D');
    graph.addEdge('D', 'A');

    const result = BipartiteChecker.checkBFS(graph);
    expect(result.isBipartite).toBe(true);
    expect(result.groups).toBeDefined();
    expect(result.groups![0].length + result.groups![1].length).toBe(4);
  });

  it('should identify non-bipartite graph (triangle)', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A');

    const result = BipartiteChecker.checkBFS(graph);
    expect(result.isBipartite).toBe(false);
    expect(result.oddCycle).toBeDefined();
  });

  it('should handle single node', () => {
    const graph = new UndirectedGraph();
    graph.addNode('A');

    const result = BipartiteChecker.checkBFS(graph);
    expect(result.isBipartite).toBe(true);
    expect(result.groups![0]).toContain('A');
  });

  it('should handle empty graph', () => {
    const graph = new UndirectedGraph();
    const result = BipartiteChecker.checkBFS(graph);
    expect(result.isBipartite).toBe(true);
  });

  it('should partition star graph correctly', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('Center', 'A');
    graph.addEdge('Center', 'B');
    graph.addEdge('Center', 'C');

    const result = BipartiteChecker.checkBFS(graph);
    expect(result.isBipartite).toBe(true);
    const centerGroup = result.groups!.find(g => g.includes('Center'));
    expect(centerGroup).toBeDefined();
    expect(centerGroup).toHaveLength(1);
  });
});

describe('BipartiteChecker.checkDFS', () => {
  it('should identify bipartite graph', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('1', '2');
    graph.addEdge('2', '3');
    graph.addEdge('3', '4');

    const result = BipartiteChecker.checkDFS(graph);
    expect(result.isBipartite).toBe(true);
  });

  it('should identify non-bipartite graph', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('1', '2');
    graph.addEdge('2', '3');
    graph.addEdge('3', '1');

    const result = BipartiteChecker.checkDFS(graph);
    expect(result.isBipartite).toBe(false);
  });
});
