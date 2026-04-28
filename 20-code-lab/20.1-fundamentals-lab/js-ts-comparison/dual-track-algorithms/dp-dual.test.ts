import { describe, it, expect } from 'vitest';
import { jsKnapsack, tsKnapsack, jsLCS, tsLCS } from './dp-dual.js';

describe('jsKnapsack', () => {
  it('should solve basic 0/1 knapsack', () => {
    const weights = [1, 2, 3];
    const values = [6, 10, 12];
    const capacity = 5;
    expect(jsKnapsack(weights, values, capacity)).toBe(22); // items 2+3
  });

  it('should return 0 for zero capacity', () => {
    expect(jsKnapsack([1, 2], [10, 20], 0)).toBe(0);
  });
});

describe('tsKnapsack', () => {
  it('should solve basic 0/1 knapsack', () => {
    const weights = [1, 2, 3];
    const values = [6, 10, 12];
    const capacity = 5;
    expect(tsKnapsack(weights, values, capacity)).toBe(22);
  });
});

describe('jsLCS', () => {
  it('should compute LCS of two strings', () => {
    expect(jsLCS('ABCDGH', 'AEDFHR')).toBe(3); // ADH
  });

  it('should handle non-string inputs by coercion', () => {
    expect(jsLCS(123, 13)).toBe(2); // "123" vs "13" => "13"
  });
});

describe('tsLCS', () => {
  it('should compute LCS of two strings', () => {
    expect(tsLCS('ABCDGH', 'AEDFHR')).toBe(3);
  });
});

describe('js vs ts equivalence', () => {
  it('knapsack should yield identical results for the same input', () => {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 8;
    expect(jsKnapsack(weights, values, capacity)).toBe(tsKnapsack(weights, values, capacity));
  });

  it('LCS should yield identical results for the same strings', () => {
    const a = 'AGGTAB';
    const b = 'GXTXAYB';
    expect(jsLCS(a, b)).toBe(tsLCS(a, b));
  });
});
