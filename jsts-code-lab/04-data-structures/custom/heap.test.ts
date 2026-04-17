import { describe, it, expect } from 'vitest';
import { MinHeap, MaxHeap, heapSort, findKthSmallest, findKthLargest, demo } from './heap.js';

describe('heap', () => {
  describe('MinHeap', () => {
    it('should extract elements in ascending order', () => {
      const heap = new MinHeap<number>();
      [5, 3, 8, 1, 9].forEach(v => heap.insert(v));
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(9);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should build heap from array', () => {
      const heap = MinHeap.fromArray([4, 10, 3, 5, 1]);
      expect(heap.peek()).toBe(1);
      const sorted = heap.toArray().map(() => heap.extractMin()!).filter(Boolean);
      // re-build to extract all
      const heap2 = MinHeap.fromArray([4, 10, 3, 5, 1]);
      const all: number[] = [];
      while (!heap2.isEmpty()) all.push(heap2.extractMin()!);
      expect(all).toEqual([1, 3, 4, 5, 10]);
    });

    it('should support custom comparator', () => {
      const heap = new MinHeap<{ p: number }>((a, b) => b.p - a.p);
      heap.insert({ p: 1 }).insert({ p: 10 }).insert({ p: 5 });
      expect(heap.extractMin()).toEqual({ p: 10 });
    });
  });

  describe('MaxHeap', () => {
    it('should extract elements in descending order', () => {
      const heap = new MaxHeap<number>();
      [5, 3, 8, 1, 9].forEach(v => heap.insert(v));
      expect(heap.extractMax()).toBe(9);
      expect(heap.extractMax()).toBe(8);
      expect(heap.extractMax()).toBe(5);
      expect(heap.extractMax()).toBe(3);
      expect(heap.extractMax()).toBe(1);
      expect(heap.extractMax()).toBeUndefined();
    });
  });

  describe('heapSort', () => {
    it('should sort numbers', () => {
      expect(heapSort([64, 34, 25, 12, 22, 11, 90]))
        .toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should sort with custom comparator', () => {
      expect(heapSort(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b)))
        .toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('findKthSmallest', () => {
    it('should find 3rd smallest', () => {
      expect(findKthSmallest([7, 10, 4, 3, 20, 15], 3)).toBe(7);
    });

    it('should return undefined for out of range k', () => {
      expect(findKthSmallest([1, 2], 0)).toBeUndefined();
      expect(findKthSmallest([1, 2], 5)).toBeUndefined();
    });
  });

  describe('findKthLargest', () => {
    it('should find 2nd largest', () => {
      expect(findKthLargest([7, 10, 4, 3, 20, 15], 2)).toBe(15);
    });

    it('should return undefined for out of range k', () => {
      expect(findKthLargest([1, 2], 0)).toBeUndefined();
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => { demo(); }).not.toThrow();
    });
  });
});
