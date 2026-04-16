import { describe, it, expect } from 'vitest';
import { quickSort, quickSortInPlace, quickSortIterative, demo } from './quick-sort.js';

describe('quick-sort', () => {
  describe('quickSort', () => {
    it('should sort numbers', () => {
      expect(quickSort([3, 6, 8, 10, 1, 2, 1]))
        .toEqual([1, 1, 2, 3, 6, 8, 10]);
    });

    it('should handle empty and single-element arrays', () => {
      expect(quickSort([])).toEqual([]);
      expect(quickSort([42])).toEqual([42]);
    });

    it('should sort with custom comparator', () => {
      expect(quickSort(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b)))
        .toEqual(['apple', 'banana', 'cherry']);
    });

    it('should sort objects by property', () => {
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ];
      const sorted = quickSort(people, (a, b) => a.age - b.age);
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'Charlie']);
    });
  });

  describe('quickSortInPlace', () => {
    it('should sort array in place', () => {
      const arr = [64, 34, 25, 12, 22, 11, 90];
      quickSortInPlace(arr);
      expect(arr).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('quickSortIterative', () => {
    it('should sort array iteratively', () => {
      const arr = [64, 34, 25, 12, 22, 11, 90];
      quickSortIterative(arr);
      expect(arr).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
