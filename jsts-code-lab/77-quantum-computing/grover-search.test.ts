import { describe, it, expect } from 'vitest';
import { runGroverSearch } from './grover-search.js';

describe('Grover Search', () => {
  it('finds target in N=4 with 1 iteration deterministically', () => {
    const n = 2;
    const target = 2;
    const result = runGroverSearch(n, target);
    expect(result.success).toBe(true);
    expect(result.measured).toBe(target);
  });

  it('finds target in N=8 with high probability', () => {
    const n = 3;
    const target = 5;
    const runs = 200;
    let successes = 0;
    for (let i = 0; i < runs; i++) {
      const r = runGroverSearch(n, target);
      if (r.success) successes++;
    }
    // For N=8, optimal iterations = 2, success probability ≈ 0.945
    expect(successes / runs).toBeGreaterThan(0.9);
  });
});
