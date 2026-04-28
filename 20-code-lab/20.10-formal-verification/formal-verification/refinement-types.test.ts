import { describe, it, expect } from 'vitest';
import {
  asPositiveInt,
  assertPositiveInt,
  asNonEmptyArray,
  assertNonEmptyArray,
  asRangeInt,
  assertRangeInt,
  asEvenInt,
  assertEvenInt,
  safeDivide,
  safeHead,
  binarySearchOnSorted,
  asSortedArray
} from './refinement-types.js';

describe('RefinementTypes', () => {
  it('should assert positive int', () => {
    expect(() => assertPositiveInt(5)).not.toThrow();
    expect(() => assertPositiveInt(0)).toThrow();
    expect(() => assertPositiveInt(-1)).toThrow();
  });

  it('should cast to positive int', () => {
    const v = asPositiveInt(42);
    expect(v).toBe(42);
  });

  it('should assert non-empty array', () => {
    expect(() => assertNonEmptyArray([1])).not.toThrow();
    expect(() => assertNonEmptyArray([])).toThrow();
  });

  it('should return safe head', () => {
    const arr = asNonEmptyArray([10, 20]);
    expect(safeHead(arr)).toBe(10);
  });

  it('should assert range int', () => {
    expect(() => assertRangeInt(5, 1, 10)).not.toThrow();
    expect(() => assertRangeInt(0, 1, 10)).toThrow();
    expect(() => assertRangeInt(11, 1, 10)).toThrow();
  });

  it('should assert even int', () => {
    expect(() => assertEvenInt(4)).not.toThrow();
    expect(() => assertEvenInt(3)).toThrow();
  });

  it('should perform safe divide', () => {
    const d = asPositiveInt(2);
    expect(safeDivide(10, d)).toBe(5);
  });

  it('should binary search on sorted array', () => {
    const arr = asSortedArray([1, 3, 5, 7, 9]);
    expect(binarySearchOnSorted(arr, 5)).toBe(2);
    expect(binarySearchOnSorted(arr, 4)).toBe(-1);
  });
});
