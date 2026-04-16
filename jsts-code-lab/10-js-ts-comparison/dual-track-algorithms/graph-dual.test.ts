import { describe, it, expect } from 'vitest';
import { JsGraph, TsGraph } from './graph-dual.js';

describe('JsGraph', () => {
  it('should add vertices and edges', () => {
    const g = new JsGraph();
    g.addEdge('A', 'B', { weight: 1 });
    expect(g.hasVertex('A')).toBe(true);
    expect(g.hasVertex('B')).toBe(true);
    expect(g.getNeighbors('A')).toHaveLength(1);
  });

  it('should find path via BFS', () => {
    const g = new JsGraph();
    g.addEdge('A', 'B');
    g.addEdge('B', 'C');
    expect(g.bfs('A', 'C')).toBe(true);
    expect(g.bfs('A', 'D')).toBe(false);
  });

  it('should find path via DFS', () => {
    const g = new JsGraph();
    g.addEdge('A', 'B');
    g.addEdge('B', 'C');
    g.addEdge('A', 'D');
    expect(g.dfs('A', 'C')).toBe(true);
    expect(g.dfs('C', 'A')).toBe(false);
  });
});

describe('TsGraph', () => {
  it('should add vertices and edges with typed edges', () => {
    const g = new TsGraph<string, { weight: number; label: string }>();
    g.addEdge('A', 'B', { weight: 1, label: 'ab' });
    expect(g.hasVertex('A')).toBe(true);
    const neighbors = g.getNeighbors('A');
    expect(neighbors).toHaveLength(1);
    expect(neighbors![0].edge.label).toBe('ab');
  });

  it('should find path via BFS', () => {
    const g = new TsGraph<string, { weight: number }>();
    g.addEdge('A', 'B', { weight: 1 });
    g.addEdge('B', 'C', { weight: 1 });
    expect(g.bfs('A', 'C')).toBe(true);
    expect(g.bfs('A', 'D')).toBe(false);
  });
});

describe('JsGraph vs TsGraph equivalence', () => {
  it('should behave identically on the same string graph', () => {
    const js = new JsGraph();
    const ts = new TsGraph<string, { weight: number }>();

    const edges: [string, string, number][] = [
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['C', 'D', 3],
      ['A', 'D', 4],
    ];

    for (const [from, to, w] of edges) {
      js.addEdge(from, to, { weight: w });
      ts.addEdge(from, to, { weight: w });
    }

    for (const [from, to] of edges) {
      expect(js.bfs(from, to)).toBe(ts.bfs(from, to));
      expect(js.dfs(from, to)).toBe(ts.dfs(from, to));
    }

    expect(js.bfs('A', 'C')).toBe(ts.bfs('A', 'C'));
    expect(js.dfs('D', 'A')).toBe(ts.dfs('D', 'A'));
  });
});
