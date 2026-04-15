import { describe, it, expect } from 'vitest';
import {
  fibMemo,
  fibDP,
  fibOptimized,
  climbStairs,
  maxSubArray,
  lengthOfLIS,
  minDistance,
  knapsack,
  demo
} from './fibonacci-dp';

describe('fibonacci-dp', () => {
  describe('fibMemo', () => {
    it('should compute fibonacci numbers', () => {
      expect(fibMemo(0)).toBe(0);
      expect(fibMemo(1)).toBe(1);
      expect(fibMemo(10)).toBe(55);
      expect(fibMemo(20)).toBe(6765);
    });
  });

  describe('fibDP', () => {
    it('should compute fibonacci numbers with tabulation', () => {
      expect(fibDP(0)).toBe(0);
      expect(fibDP(1)).toBe(1);
      expect(fibDP(10)).toBe(55);
    });
  });

  describe('fibOptimized', () => {
    it('should compute fibonacci with O(1) space', () => {
      expect(fibOptimized(0)).toBe(0);
      expect(fibOptimized(1)).toBe(1);
      expect(fibOptimized(50)).toBe(12586269025);
    });
  });

  describe('climbStairs', () => {
    it('should count ways to climb stairs', () => {
      expect(climbStairs(1)).toBe(1);
      expect(climbStairs(2)).toBe(2);
      expect(climbStairs(3)).toBe(3);
      expect(climbStairs(4)).toBe(5);
      expect(climbStairs(5)).toBe(8);
    });
  });

  describe('maxSubArray', () => {
    it('should find maximum subarray sum (Kadane)', () => {
      expect(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6);
      expect(maxSubArray([1])).toBe(1);
      expect(maxSubArray([5, 4, -1, 7, 8])).toBe(23);
    });
  });

  describe('lengthOfLIS', () => {
    it('should find length of longest increasing subsequence', () => {
      expect(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4);
      expect(lengthOfLIS([0, 1, 0, 3, 2, 3])).toBe(4);
      expect(lengthOfLIS([7, 7, 7, 7, 7, 7])).toBe(1);
      expect(lengthOfLIS([])).toBe(0);
    });
  });

  describe('minDistance', () => {
    it('should compute edit distance', () => {
      expect(minDistance('horse', 'ros')).toBe(3);
      expect(minDistance('intention', 'execution')).toBe(5);
      expect(minDistance('', 'abc')).toBe(3);
      expect(minDistance('abc', 'abc')).toBe(0);
    });
  });

  describe('knapsack', () => {
    it('should solve 0/1 knapsack', () => {
      expect(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)).toBe(9);
      expect(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 5)).toBe(7);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
