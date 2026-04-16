import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WorkspaceDependencyGraph,
  ChangesetManager,
  TaskRunner,
} from './monorepo-workspaces';
import type { WorkspacePackage } from './monorepo-workspaces';

describe('WorkspaceDependencyGraph', () => {
  let graph: WorkspaceDependencyGraph;

  beforeEach(() => {
    graph = new WorkspaceDependencyGraph();
  });

  const createPkg = (name: string, deps: Record<string, string> = {}): WorkspacePackage => ({
    name,
    path: `packages/${name}`,
    version: '1.0.0',
    dependencies: deps,
    devDependencies: {},
  });

  it('should perform topological sort', () => {
    graph.addPackage(createPkg('core'));
    graph.addPackage(createPkg('utils', { core: '^1.0.0' }));
    graph.addPackage(createPkg('app', { core: '^1.0.0', utils: '^1.0.0' }));

    const sorted = graph.topologicalSort();
    expect(sorted.indexOf('core')).toBeLessThan(sorted.indexOf('utils'));
    expect(sorted.indexOf('utils')).toBeLessThan(sorted.indexOf('app'));
  });

  it('should detect circular dependencies', () => {
    graph.addPackage(createPkg('a', { b: '^1.0.0' }));
    graph.addPackage(createPkg('b', { a: '^1.0.0' }));

    expect(() => graph.topologicalSort()).toThrow('Circular dependency detected');
  });

  it('should find affected packages', () => {
    graph.addPackage(createPkg('core'));
    graph.addPackage(createPkg('utils', { core: '^1.0.0' }));
    graph.addPackage(createPkg('app', { core: '^1.0.0', utils: '^1.0.0' }));

    const affected = graph.getAffectedPackages(['core']);
    expect(affected).toContain('core');
    expect(affected).toContain('utils');
    expect(affected).toContain('app');
  });

  it('should find circular dependencies via findCircularDependencies', () => {
    graph.addPackage(createPkg('a', { b: '^1.0.0' }));
    graph.addPackage(createPkg('b', { a: '^1.0.0' }));

    const cycles = graph.findCircularDependencies();
    expect(cycles.length).toBeGreaterThan(0);
  });
});

describe('ChangesetManager', () => {
  it('should summarize changesets', () => {
    const manager = new ChangesetManager();
    manager.add({
      id: '1',
      summary: 'Fix bug',
      releases: [
        { name: 'pkg-a', type: 'patch' },
        { name: 'pkg-b', type: 'minor' },
      ],
    });
    manager.add({
      id: '2',
      summary: 'Breaking change',
      releases: [{ name: 'pkg-a', type: 'major' }],
    });

    const summary = manager.summarize();
    expect(summary.get('pkg-a')).toBe('major');
    expect(summary.get('pkg-b')).toBe('minor');
  });

  it('should generate version plan', () => {
    const manager = new ChangesetManager();
    manager.add({
      id: '1',
      summary: 'Feature',
      releases: [{ name: 'pkg-a', type: 'minor' }],
    });

    const packages = new Map([
      ['pkg-a', { name: 'pkg-a', path: '', version: '1.0.0', dependencies: {}, devDependencies: {} }],
    ]);

    const plan = manager.generateVersionPlan(packages);
    expect(plan).toHaveLength(1);
    expect(plan[0].newVersion).toBe('1.1.0');
  });
});

describe('TaskRunner', () => {
  it('should run tasks in topological order', async () => {
    const runner = new TaskRunner();
    const order: string[] = [];

    runner.register({ name: 'a', command: 'echo a' });
    runner.register({ name: 'b', command: 'echo b', dependencies: ['a'] });
    runner.register({ name: 'c', command: 'echo c', dependencies: ['b'] });

    const logSpy = vi.spyOn(console, 'log').mockImplementation((msg: string) => {
      if (msg.includes('Completed')) order.push(msg.replace(/.*Completed: /, ''));
    });

    await runner.runParallel(['a', 'b', 'c']);

    expect(order).toEqual(['a', 'b', 'c']);
    logSpy.mockRestore();
  });

  it('should throw for missing task dependencies', async () => {
    const runner = new TaskRunner();
    runner.register({ name: 'b', command: 'echo b', dependencies: ['a'] });

    await expect(runner.runParallel(['b'])).rejects.toThrow('Dependencies not met');
  });
});
