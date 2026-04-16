import { describe, it, expect } from 'vitest';
import {
  binarySearch,
  binarySearchRecursive,
  findFirst,
  findLast,
  searchInsert,
  demo
} from './binary-search';

describe('binary-search', () => {
  const arr = [1, 3, 5, 7, 9, 11, 13, 15];

  describe('binarySearch', () => {
    it('should find existing elements', () => {
      expect(binarySearch(arr, 7)).toBe(3);
      expect(binarySearch(arr, 1)).toBe(0);
      expect(binarySearch(arr, 15)).toBe(7);
    });

    it('should return -1 for missing elements', () => {
      expect(binarySearch(arr, 4)).toBe(-1);
      expect(binarySearch(arr, 0)).toBe(-1);
      expect(binarySearch(arr, 16)).toBe(-1);
    });

    it('should support custom comparator', () => {
      const words = ['apple', 'banana', 'cherry', 'date'];
      expect(binarySearch(words, 'cherry', (a, b) => a.localeCompare(b))).toBe(2);
    });
  });

  describe('binarySearchRecursive', () => {
    it('should find existing elements', () => {
      expect(binarySearchRecursive(arr, 7)).toBe(3);
      expect(binarySearchRecursive(arr, 1)).toBe(0);
    });

    it('should return -1 for missing elements', () => {
      expect(binarySearchRecursive(arr, 4)).toBe(-1);
    });
  });

  describe('findFirst', () => {
    it('should find first occurrence', () => {
      const dup = [1, 2, 2, 2, 3, 4, 5];
      expect(findFirst(dup, 2)).toBe(1);
      expect(findFirst(dup, 6)).toBe(-1);
    });
  });

  describe('findLast', () => {
    it('should find last occurrence', () => {
      const dup = [1, 2, 2, 2, 3, 4, 5];
      expect(findLast(dup, 2)).toBe(3);
      expect(findLast(dup, 6)).toBe(-1);
    });
  });

  describe('searchInsert', () => {
    it('should return index of existing element', () => {
      expect(searchInsert(arr, 7)).toBe(3);
    });

    it('should return insert position for missing element', () => {
      expect(searchInsert(arr, 6)).toBe(3);
      expect(searchInsert(arr, 0)).toBe(0);
      expect(searchInsert(arr, 16)).toBe(8);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
