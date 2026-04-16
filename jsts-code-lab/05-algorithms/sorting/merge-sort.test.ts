import { describe, it, expect } from 'vitest';
import { mergeSort, mergeSortInPlace, demo } from './merge-sort.js';

describe('merge-sort', () => {
  describe('mergeSort', () => {
    it('should sort numbers', () => {
      expect(mergeSort([64, 34, 25, 12, 22, 11, 90]))
        .toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty and single-element arrays', () => {
      expect(mergeSort([])).toEqual([]);
      expect(mergeSort([42])).toEqual([42]);
    });

    it('should sort with custom comparator', () => {
      expect(mergeSort(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b)))
        .toEqual(['apple', 'banana', 'cherry']);
    });

    it('should be stable', () => {
      const items = [
        { name: 'A', score: 2 },
        { name: 'B', score: 1 },
        { name: 'C', score: 2 }
      ];
      const sorted = mergeSort(items, (a, b) => a.score - b.score);
      expect(sorted.map(i => i.name)).toEqual(['B', 'A', 'C']);
    });
  });

  describe('mergeSortInPlace', () => {
    it('should sort array in place', () => {
      const arr = [64, 34, 25, 12, 22, 11, 90];
      mergeSortInPlace(arr);
      expect(arr).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty array', () => {
      const arr: number[] = [];
      mergeSortInPlace(arr);
      expect(arr).toEqual([]);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
