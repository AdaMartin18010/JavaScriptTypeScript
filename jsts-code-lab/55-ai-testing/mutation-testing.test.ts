import { describe, it, expect } from 'vitest';
import {
  MutationEngine,
  ArithmeticOperatorMutator,
  RelationalOperatorMutator,
  LogicalOperatorMutator,
  ConstantMutator,
  BoundaryMutator,
  MutantStatus
} from './mutation-testing.js';

describe('ArithmeticOperatorMutator', () => {
  it('generates arithmetic mutations', () => {
    const mutator = new ArithmeticOperatorMutator();
    const mutants = mutator.apply('a + b');
    expect(mutants.length).toBeGreaterThan(0);
    expect(mutants.some(m => m.replacement === '-')).toBe(true);
  });
});

describe('RelationalOperatorMutator', () => {
  it('generates relational mutations', () => {
    const mutator = new RelationalOperatorMutator();
    const mutants = mutator.apply('if (a > b)');
    expect(mutants.some(m => m.replacement === '>=')).toBe(true);
    expect(mutants.some(m => m.replacement === '<')).toBe(true);
  });
});

describe('LogicalOperatorMutator', () => {
  it('swaps && and ||', () => {
    const mutator = new LogicalOperatorMutator();
    const mutants = mutator.apply('a && b || c');
    expect(mutants.some(m => m.original === '&&' && m.replacement === '||')).toBe(true);
    expect(mutants.some(m => m.original === '||' && m.replacement === '&&')).toBe(true);
  });
});

describe('ConstantMutator', () => {
  it('flips boolean constants', () => {
    const mutator = new ConstantMutator();
    const mutants = mutator.apply('return true;');
    expect(mutants.some(m => m.original === 'true' && m.replacement === 'false')).toBe(true);
  });

  it('mutates number constants', () => {
    const mutator = new ConstantMutator();
    const mutants = mutator.apply('const x = 5;');
    expect(mutants.some(m => m.original === '5' && m.replacement === '6')).toBe(true);
  });
});

describe('BoundaryMutator', () => {
  it('mutates array index boundaries', () => {
    const mutator = new BoundaryMutator();
    const mutants = mutator.apply('arr[i]');
    expect(mutants.some(m => m.replacement === '[i + 1]')).toBe(true);
    expect(mutants.some(m => m.replacement === '[i - 1]')).toBe(true);
  });
});

describe('MutationEngine', () => {
  it('generates mutants from multiple operators', () => {
    const engine = new MutationEngine();
    const code = 'function add(a, b) { return a + b > 0; }';
    const mutants = engine.generateMutants(code);
    expect(mutants.length).toBeGreaterThan(0);
    expect(new Set(mutants.map(m => m.type)).size).toBeGreaterThan(1);
  });

  it('deduplicates identical mutants', () => {
    const engine = new MutationEngine();
    const code = 'a + a';
    const mutants = engine.generateMutants(code);
    // 两个 + 位置不同，所以应该保留
    expect(mutants.length).toBeGreaterThanOrEqual(2);
  });

  it('runs mutation test and reports score', () => {
    const engine = new MutationEngine();
    const code = 'function max(a, b) { if (a > b) return a; return b; }';
    const report = engine.run(code, () => ({ passed: true }));
    expect(report.totalMutants).toBeGreaterThan(0);
    expect(report.mutationScore).toBe(0);
    expect(report.survived).toBe(report.totalMutants);
  });

  it('marks mutants as killed when tests fail', () => {
    const engine = new MutationEngine();
    const code = 'function max(a, b) { if (a > b) return a; return b; }';
    const report = engine.run(code, (mutated) => {
      if (mutated.includes('a < b')) return { passed: false };
      return { passed: true };
    });
    expect(report.killed).toBeGreaterThan(0);
    const killed = report.mutants.filter(m => m.status === MutantStatus.KILLED);
    expect(killed.length).toBeGreaterThan(0);
  });
});
