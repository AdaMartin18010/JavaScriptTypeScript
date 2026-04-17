import { describe, it, expect } from 'vitest';
import { UnionFind, UndirectedGraph, ConnectedComponents } from './graph-connected-components.js';

describe('UnionFind', () => {
  it('should initially place each element in its own set', () => {
    const uf = new UnionFind();
    uf.add('A');
    uf.add('B');
    expect(uf.isConnected('A', 'B')).toBe(false);
    expect(uf.getComponentCount()).toBe(2);
  });

  it('should connect elements via union', () => {
    const uf = new UnionFind();
    uf.union('A', 'B');
    expect(uf.isConnected('A', 'B')).toBe(true);
    expect(uf.getComponentCount()).toBe(1);
  });

  it('should return false for union of already connected elements', () => {
    const uf = new UnionFind();
    uf.union('A', 'B');
    expect(uf.union('A', 'B')).toBe(false);
  });

  it('should return components correctly', () => {
    const uf = new UnionFind();
    uf.union('A', 'B');
    uf.union('C', 'D');
    const components = uf.getComponents();
    expect(components).toHaveLength(2);
    expect(components.some(c => c.includes('A') && c.includes('B'))).toBe(true);
    expect(components.some(c => c.includes('C') && c.includes('D'))).toBe(true);
  });

  it('should throw for non-existent element', () => {
    const uf = new UnionFind();
    expect(() => uf.find('X')).toThrow('does not exist');
  });

  it('should support transitive connections', () => {
    const uf = new UnionFind();
    uf.union('A', 'B');
    uf.union('B', 'C');
    expect(uf.isConnected('A', 'C')).toBe(true);
  });
});

describe('ConnectedComponents', () => {
  it('should find components with UnionFind', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('D', 'E');

    const components = ConnectedComponents.findWithUnionFind(graph);
    expect(components).toHaveLength(2);
    expect(components.some(c => c.includes('A'))).toBe(true);
    expect(components.some(c => c.includes('D'))).toBe(true);
  });

  it('should find components with DFS', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('1', '2');
    graph.addEdge('3', '4');
    graph.addNode('5');

    const components = ConnectedComponents.findWithDFS(graph);
    expect(components).toHaveLength(3);
  });

  it('should find components with BFS', () => {
    const graph = new UndirectedGraph();
    graph.addEdge('X', 'Y');
    graph.addEdge('Y', 'Z');

    const components = ConnectedComponents.findWithBFS(graph);
    expect(components).toHaveLength(1);
    expect(components[0]).toContain('X');
    expect(components[0]).toContain('Y');
    expect(components[0]).toContain('Z');
  });

  it('should return single node as one component', () => {
    const graph = new UndirectedGraph();
    graph.addNode('Solo');

    const components = ConnectedComponents.findWithDFS(graph);
    expect(components).toHaveLength(1);
    expect(components[0]).toEqual(['Solo']);
  });
});
