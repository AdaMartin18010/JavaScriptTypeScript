import { describe, it, expect } from 'vitest';
import {
  Graph,
  bfs,
  bfsShortestPath,
  dfsRecursive,
  dfsIterative,
  hasCycle,
  topologicalSort,
  demo
} from './bfs-dfs.js';

describe('bfs-dfs', () => {
  function buildGraph(): Graph {
    const graph = new Graph();
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('B', 'E');
    graph.addEdge('C', 'F');
    graph.addEdge('E', 'F');
    return graph;
  }

  describe('Graph', () => {
    it('should add vertices and edges', () => {
      const graph = new Graph();
      graph.addEdge('A', 'B');
      expect(graph.getVertices().sort()).toEqual(['A', 'B']);
      expect(graph.getNeighbors('A')).toContain('B');
    });

    it('should support undirected edges', () => {
      const graph = new Graph();
      graph.addUndirectedEdge('A', 'B');
      expect(graph.getNeighbors('A')).toContain('B');
      expect(graph.getNeighbors('B')).toContain('A');
    });
  });

  describe('bfs', () => {
    it('should traverse in breadth-first order', () => {
      const result = bfs(buildGraph(), 'A');
      expect(result[0]).toBe('A');
      expect(result.slice(1, 3).sort()).toEqual(['B', 'C']);
    });

    it('should stop early when target found', () => {
      const result = bfs(buildGraph(), 'A', 'C');
      expect(result).toContain('C');
      expect(result[result.length - 1]).toBe('C');
    });
  });

  describe('bfsShortestPath', () => {
    it('should find shortest path', () => {
      const path = bfsShortestPath(buildGraph(), 'A', 'F');
      expect(path).not.toBeNull();
      expect(path![0]).toBe('A');
      expect(path![path!.length - 1]).toBe('F');
    });

    it('should return null when unreachable', () => {
      expect(bfsShortestPath(buildGraph(), 'A', 'Z')).toBeNull();
    });
  });

  describe('dfsRecursive', () => {
    it('should traverse all reachable nodes', () => {
      const result = dfsRecursive(buildGraph(), 'A');
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
      expect(result).toContain('D');
    });
  });

  describe('dfsIterative', () => {
    it('should traverse all reachable nodes', () => {
      const result = dfsIterative(buildGraph(), 'A');
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
      expect(result).toContain('D');
    });
  });

  describe('hasCycle', () => {
    it('should detect cycle', () => {
      const graph = new Graph();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'A');
      expect(hasCycle(graph)).toBe(true);
    });

    it('should return false for acyclic graph', () => {
      const graph = new Graph();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      expect(hasCycle(graph)).toBe(false);
    });
  });

  describe('topologicalSort', () => {
    it('should return topological order for DAG', () => {
      const graph = new Graph();
      graph.addEdge('Foundation', 'Walls');
      graph.addEdge('Walls', 'Roof');
      const order = topologicalSort(graph);
      expect(order).not.toBeNull();
      expect(order!.indexOf('Foundation')).toBeLessThan(order!.indexOf('Walls'));
      expect(order!.indexOf('Walls')).toBeLessThan(order!.indexOf('Roof'));
    });

    it('should return null for cyclic graph', () => {
      const graph = new Graph();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'A');
      expect(topologicalSort(graph)).toBeNull();
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => { demo(); }).not.toThrow();
    });
  });
});
