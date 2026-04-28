import { describe, it, expect } from 'vitest';
import { SmartTestSelector, DependencyGraph, ImpactAnalyzer } from './smart-test-selector.js';

describe('DependencyGraph', () => {
  it('maps files to tests', () => {
    const graph = new DependencyGraph();
    graph.addTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['a.ts'], coveredFunctions: [], avgDurationMs: 10
    });
    const tests = graph.getTestsForFile('a.ts');
    expect(tests.length).toBe(1);
    expect(tests[0].id).toBe('t1');
  });

  it('maps functions to tests', () => {
    const graph = new DependencyGraph();
    graph.addTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: [], coveredFunctions: ['foo'], avgDurationMs: 10
    });
    const tests = graph.getTestsForFunction('foo');
    expect(tests.length).toBe(1);
  });
});

describe('ImpactAnalyzer', () => {
  it('scores tests by file match', () => {
    const graph = new DependencyGraph();
    graph.addTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['math.ts'], coveredFunctions: [], avgDurationMs: 10
    });
    const analyzer = new ImpactAnalyzer();
    const scores = analyzer.analyzeImpact([{ filePath: 'math.ts', changeType: 'modified', linesAdded: 1, linesDeleted: 0, functionsChanged: [] }], graph);
    expect(scores.get('t1')).toBeGreaterThan(0);
  });

  it('scores tests by function match', () => {
    const graph = new DependencyGraph();
    graph.addTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: [], coveredFunctions: ['add'], avgDurationMs: 10
    });
    const analyzer = new ImpactAnalyzer();
    const scores = analyzer.analyzeImpact([{ filePath: 'math.ts', changeType: 'modified', linesAdded: 1, linesDeleted: 0, functionsChanged: ['add'] }], graph);
    expect(scores.get('t1')).toBeGreaterThan(0);
  });
});

describe('SmartTestSelector', () => {
  it('selects tests affected by changes', () => {
    const selector = new SmartTestSelector();
    selector.registerTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['math.ts'], coveredFunctions: ['add'], avgDurationMs: 10
    });
    selector.registerTest({
      id: 't2', name: 'test2', filePath: 'b.test.ts',
      dependencies: [], coveredFiles: ['api.ts'], coveredFunctions: [], avgDurationMs: 20
    });

    const result = selector.selectTests([{
      filePath: 'math.ts', changeType: 'modified', linesAdded: 1, linesDeleted: 0, functionsChanged: ['add']
    }]);

    expect(result.selectedTests.some(t => t.id === 't1')).toBe(true);
    expect(result.selectedTests.some(t => t.id === 't2')).toBe(false);
  });

  it('includes historically failing tests', () => {
    const selector = new SmartTestSelector();
    selector.registerTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['a.ts'], coveredFunctions: [], avgDurationMs: 10, lastFailureTime: Date.now() - 1000
    });

    const result = selector.selectTests([], { includeHistoricalFailures: true });
    expect(result.selectedTests.some(t => t.id === 't1')).toBe(true);
  });

  it('forces inclusion of specified tests', () => {
    const selector = new SmartTestSelector();
    selector.registerTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['a.ts'], coveredFunctions: [], avgDurationMs: 10
    });

    const result = selector.selectTests([], { forceInclude: ['t1'] });
    expect(result.selectedTests.some(t => t.id === 't1')).toBe(true);
  });

  it('formats result as string', () => {
    const selector = new SmartTestSelector();
    selector.registerTest({
      id: 't1', name: 'test1', filePath: 'a.test.ts',
      dependencies: [], coveredFiles: ['a.ts'], coveredFunctions: [], avgDurationMs: 10
    });
    const result = selector.selectTests([{ filePath: 'a.ts', changeType: 'modified', linesAdded: 1, linesDeleted: 0, functionsChanged: [] }]);
    const formatted = selector.formatResult(result);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('Smart Test Selection Report');
  });
});
