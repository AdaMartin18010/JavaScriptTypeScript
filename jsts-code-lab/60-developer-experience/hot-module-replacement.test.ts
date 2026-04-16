// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { HMRRuntime, CSSHMRHandler, ModuleDependencyGraph } from './hot-module-replacement.js';

describe('HMRRuntime', () => {
  it('registers module with hot context', () => {
    const hmr = new HMRRuntime();
    const mod = hmr.registerModule('/src/a.ts');
    expect(mod.id).toBe('/src/a.ts');
    expect(mod.hot).toBeDefined();
  });

  it('ModuleDependencyGraph returns affected dependents', () => {
    const graph = new ModuleDependencyGraph();
    graph.addDependency('/src/a.ts', '/src/b.ts');
    graph.addDependency('/src/b.ts', '/src/c.ts');
    const affected = graph.getAffectedModules('/src/c.ts');
    expect(affected.sort()).toEqual(['/src/a.ts', '/src/b.ts'].sort());
  });
});

describe('CSSHMRHandler', () => {
  it('injects and updates style element', () => {
    const handler = new CSSHMRHandler();
    handler.update('/src/style.css', 'body { color: red; }');
    const el = document.querySelector('style[data-hmr-id="/src/style.css"]');
    expect(el).not.toBeNull();
    expect(el!.textContent).toBe('body { color: red; }');
    handler.update('/src/style.css', 'body { color: blue; }');
    expect(el!.textContent).toBe('body { color: blue; }');
    handler.remove('/src/style.css');
    expect(document.querySelector('style[data-hmr-id="/src/style.css"]')).toBeNull();
  });
});

describe('ModuleDependencyGraph', () => {
  it('tracks dependencies and affected modules', () => {
    const graph = new ModuleDependencyGraph();
    graph.addDependency('app', 'utils');
    graph.addDependency('app', 'components');
    graph.addDependency('components', 'utils');
    expect(graph.getDependencies('app')).toContain('utils');
    expect(graph.getAffectedModules('utils')).toContain('app');
  });

  it('removes module and cleans edges', () => {
    const graph = new ModuleDependencyGraph();
    graph.addDependency('a', 'b');
    graph.removeModule('a');
    expect(graph.getDependents('b')).toEqual([]);
  });
});
