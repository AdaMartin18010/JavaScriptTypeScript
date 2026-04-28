import { describe, it, expect } from 'vitest';
import { verifiedGCD, verifiedPartition, verifiedFactorial } from './program-correctness-proofs.js';

describe('ProgramCorrectnessProofs', () => {
  it('should compute GCD correctly', () => {
    expect(verifiedGCD(48, 18)).toBe(6);
    expect(verifiedGCD(100, 35)).toBe(5);
    expect(verifiedGCD(7, 3)).toBe(1);
  });

  it('should throw on non-positive GCD input', () => {
    expect(() => verifiedGCD(0, 5)).toThrow();
    expect(() => verifiedGCD(-1, 5)).toThrow();
  });

  it('should partition array correctly', () => {
    const arr = [3, 6, 8, 10, 1, 2, 1];
    const pivotIndex = verifiedPartition([...arr], 0, arr.length - 1);
    expect(pivotIndex).toBeGreaterThanOrEqual(0);
    expect(pivotIndex).toBeLessThan(arr.length);
  });

  it('should throw on invalid partition indices', () => {
    expect(() => verifiedPartition([1, 2], 0, 5)).toThrow();
    expect(() => verifiedPartition([1, 2], 1, 0)).toThrow();
  });

  it('should compute factorial correctly', () => {
    expect(verifiedFactorial(0)).toBe(1);
    expect(verifiedFactorial(1)).toBe(1);
    expect(verifiedFactorial(5)).toBe(120);
  });

  it('should throw on negative factorial input', () => {
    expect(() => verifiedFactorial(-1)).toThrow();
  });
});
