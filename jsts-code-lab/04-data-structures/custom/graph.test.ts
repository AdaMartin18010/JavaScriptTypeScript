import { describe, it, expect } from 'vitest';
import { Graph, WeightedGraph, dfs, bfs, dijkstra, topologicalSort, demo } from './graph';

describe('graph', () => {
  describe('Graph', () => {
    it('should add vertices and edges', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      expect(graph.hasVertex('A')).toBe(true);
      expect(graph.hasVertex('B')).toBe(true);
      expect(graph.getNeighbors('A')).toContain('B');
    });

    it('should support undirected edges', () => {
      const graph = new Graph<string>();
      graph.addUndirectedEdge('A', 'B');
      expect(graph.getNeighbors('A')).toContain('B');
      expect(graph.getNeighbors('B')).toContain('A');
    });

    it('should return all vertices', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'C');
      expect(graph.getVertices().sort()).toEqual(['A', 'B', 'C']);
    });
  });

  describe('dfs', () => {
    it('should find a path from start to target', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      expect(dfs(graph, 'A', 'C')).toEqual(['A', 'B', 'C']);
    });

    it('should return null when target is unreachable', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      expect(dfs(graph, 'A', 'Z')).toBeNull();
    });
  });

  describe('bfs', () => {
    it('should find shortest path in unweighted graph', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'C');
      graph.addEdge('B', 'D');
      graph.addEdge('C', 'D');
      const path = bfs(graph, 'A', 'D');
      expect(path).not.toBeNull();
      expect(path!.length).toBe(3);
    });

    it('should return null when target is unreachable', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      expect(bfs(graph, 'A', 'Z')).toBeNull();
    });
  });

  describe('WeightedGraph & dijkstra', () => {
    it('should find shortest path in weighted graph', () => {
      const graph = new WeightedGraph<string>();
      graph.addEdge('A', 'B', 4);
      graph.addEdge('A', 'C', 2);
      graph.addEdge('B', 'C', 1);
      graph.addEdge('B', 'D', 5);
      graph.addEdge('C', 'D', 8);

      const result = dijkstra(graph, 'A', 'D');
      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['A', 'B', 'D']);
      expect(result!.distance).toBe(9);
    });

    it('should return null for unreachable target', () => {
      const graph = new WeightedGraph<string>();
      graph.addEdge('A', 'B', 1);
      expect(dijkstra(graph, 'A', 'C')).toBeNull();
    });
  });

  describe('topologicalSort', () => {
    it('should return valid topological order for DAG', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'C');
      graph.addEdge('B', 'D');
      const order = topologicalSort(graph);
      expect(order).not.toBeNull();
      expect(order!.indexOf('A')).toBeLessThan(order!.indexOf('B'));
      expect(order!.indexOf('B')).toBeLessThan(order!.indexOf('D'));
    });

    it('should return null for cyclic graph', () => {
      const graph = new Graph<string>();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'A');
      expect(topologicalSort(graph)).toBeNull();
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
