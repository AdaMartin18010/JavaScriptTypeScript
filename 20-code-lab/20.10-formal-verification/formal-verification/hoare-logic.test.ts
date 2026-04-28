import { describe, it, expect } from 'vitest';
import { HoareLogic, verifiedBinarySearch, verifiedInsertionSort } from './hoare-logic.js';

describe('HoareLogic', () => {
  it('should verify binary search', () => {
    expect(verifiedBinarySearch([1, 3, 5, 7, 9], 7)).toBe(3);
    expect(verifiedBinarySearch([1, 3, 5, 7, 9], 4)).toBe(-1);
  });

  it('should verify insertion sort', () => {
    expect(verifiedInsertionSort([5, 2, 4, 6, 1, 3])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should enforce Hoare triples', () => {
    const hoare = new HoareLogic<number>();
    hoare.require('non-negative', x => x >= 0).ensure('approx', (x, out) => Math.abs((out as number) ** 2 - x) < 0.001);
    expect(hoare.execute(25, Math.sqrt)).toBe(5);
    expect(() => hoare.execute(-1, Math.sqrt)).toThrow();
  });
});
