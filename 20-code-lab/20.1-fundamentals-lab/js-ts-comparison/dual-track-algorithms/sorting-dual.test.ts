import { describe, it, expect } from 'vitest';
import { jsQuickSort, tsQuickSort } from './sorting-dual.js';

describe('jsQuickSort', () => {
  it('should sort numbers with default comparator', () => {
    expect(jsQuickSort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
  });

  it('should sort strings', () => {
    expect(jsQuickSort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should use custom compareFn', () => {
    expect(jsQuickSort([3, 1, 4], (a: number, b: number) => b - a)).toEqual([4, 3, 1]);
  });
});

describe('tsQuickSort', () => {
  it('should sort numbers with default comparator', () => {
    expect(tsQuickSort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
  });

  it('should sort strings', () => {
    expect(tsQuickSort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should use custom compareFn', () => {
    expect(tsQuickSort([3, 1, 4], (a: number, b: number) => b - a)).toEqual([4, 3, 1]);
  });
});

describe('jsQuickSort vs tsQuickSort equivalence', () => {
  it('should produce identical results for random number arrays', () => {
    const input = Array.from({ length: 50 }, () => Math.floor(Math.random() * 200) - 100);
    const jsResult = jsQuickSort(input);
    const tsResult = tsQuickSort(input);
    expect(jsResult).toEqual(tsResult);
  });

  it('should produce identical results for object arrays with custom comparator', () => {
    const input = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 },
    ];
    const compare = (a: { age: number }, b: { age: number }) => a.age - b.age;
    expect(jsQuickSort(input, compare)).toEqual(tsQuickSort(input, compare));
  });
});
