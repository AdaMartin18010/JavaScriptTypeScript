/**
 * @file 堆测试
 * @description 测试 04-data-structures/custom/heap.ts
 */

import { describe, it, expect } from 'vitest';
import {
  MinHeap,
  MaxHeap,
  heapSort,
  findKthSmallest,
  findKthLargest
} from '../../04-data-structures/custom/heap.js';

describe('MinHeap', () => {
  it('should insert and extract min', () => {
    const heap = new MinHeap<number>();
    heap.insert(5).insert(2).insert(8).insert(1);
    
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBeUndefined();
  });

  it('should peek at min without removing', () => {
    const heap = new MinHeap<number>();
    heap.insert(3).insert(1).insert(2);
    
    expect(heap.peek()).toBe(1);
    expect(heap.size()).toBe(3);
  });

  it('should build from array', () => {
    const heap = MinHeap.fromArray([5, 2, 8, 1, 9]);
    
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(5);
  });

  it('should handle custom comparator', () => {
    interface Item { priority: number; name: string }
    const heap = new MinHeap<Item>((a, b) => a.priority - b.priority);
    
    heap.insert({ priority: 3, name: 'C' });
    heap.insert({ priority: 1, name: 'A' });
    heap.insert({ priority: 2, name: 'B' });
    
    expect(heap.extractMin()!.name).toBe('A');
    expect(heap.extractMin()!.name).toBe('B');
  });
});

describe('MaxHeap', () => {
  it('should insert and extract max', () => {
    const heap = new MaxHeap<number>();
    heap.insert(5).insert(2).insert(8).insert(1);
    
    expect(heap.extractMax()).toBe(8);
    expect(heap.extractMax()).toBe(5);
    expect(heap.extractMax()).toBe(2);
    expect(heap.extractMax()).toBe(1);
  });
});

describe('heapSort', () => {
  it('should sort array in ascending order', () => {
    const arr = [64, 34, 25, 12, 22, 11, 90];
    const sorted = heapSort(arr);
    
    expect(sorted).toEqual([11, 12, 22, 25, 34, 64, 90]);
    expect(arr).toEqual([64, 34, 25, 12, 22, 11, 90]); // original unchanged
  });
});

describe('findKthSmallest', () => {
  it('should find kth smallest element', () => {
    const arr = [7, 10, 4, 3, 20, 15];
    
    expect(findKthSmallest(arr, 1)).toBe(3);
    expect(findKthSmallest(arr, 2)).toBe(4);
    expect(findKthSmallest(arr, 3)).toBe(7);
    expect(findKthSmallest(arr, 6)).toBe(20);
  });

  it('should return undefined for invalid k', () => {
    const arr = [1, 2, 3];
    expect(findKthSmallest(arr, 0)).toBeUndefined();
    expect(findKthSmallest(arr, 4)).toBeUndefined();
  });
});

describe('findKthLargest', () => {
  it('should find kth largest element', () => {
    const arr = [7, 10, 4, 3, 20, 15];
    
    expect(findKthLargest(arr, 1)).toBe(20);
    expect(findKthLargest(arr, 2)).toBe(15);
    expect(findKthLargest(arr, 3)).toBe(10);
  });
});
