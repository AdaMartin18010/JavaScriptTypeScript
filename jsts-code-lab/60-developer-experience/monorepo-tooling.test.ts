import { describe, it, expect } from 'vitest';
import { ProjectGraph, WorkspaceParser } from './monorepo-tooling';

describe('ProjectGraph', () => {
  it('topologicalSort returns correct build order', () => {
    const graph = new ProjectGraph();
    graph.addPackage({ name: 'utils', path: 'p/utils', version: '1', internalDependencies: [] });
    graph.addPackage({ name: 'core', path: 'p/core', version: '1', internalDependencies: ['utils'] });
    graph.addPackage({ name: 'app', path: 'p/app', version: '1', internalDependencies: ['core'] });
    const result = graph.topologicalSort();
    expect(result.hasCycle).toBe(false);
    expect(result.order).toEqual(['utils', 'core', 'app']);
  });

  it('findCycles detects circular dependencies', () => {
    const graph = new ProjectGraph();
    graph.addPackage({ name: 'a', path: 'p/a', version: '1', internalDependencies: ['b'] });
    graph.addPackage({ name: 'b', path: 'p/b', version: '1', internalDependencies: ['c'] });
    graph.addPackage({ name: 'c', path: 'p/c', version: '1', internalDependencies: ['a'] });
    const cycles = graph.findCycles();
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('getAffectedProjects returns downstream projects', () => {
    const graph = new ProjectGraph();
    graph.addPackage({ name: 'shared', path: 'p/shared', version: '1', internalDependencies: [] });
    graph.addPackage({ name: 'web', path: 'p/web', version: '1', internalDependencies: ['shared'] });
    graph.addPackage({ name: 'api', path: 'p/api', version: '1', internalDependencies: ['shared'] });
    const affected = graph.getAffectedProjects(['shared'], 'transitive');
    expect(affected.sort()).toEqual(['api', 'shared', 'web'].sort());
  });
});

describe('WorkspaceParser', () => {
  it('parses packages into graph with reverse edges', () => {
    const parser = new WorkspaceParser();
    const graph = parser.parse([
      { name: 'a', path: 'p/a', version: '1', internalDependencies: ['b'] },
      { name: 'b', path: 'p/b', version: '1', internalDependencies: [] }
    ]);
    expect(graph.getNode('b')!.dependents).toContain('a');
  });
});
