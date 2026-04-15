import { describe, it, expect } from 'vitest';
import {
  union,
  intersection,
  difference,
  symmetricDifference,
  Cache,
  unique,
  frequency,
  demo
} from './map-set';

describe('map-set', () => {
  describe('set operations', () => {
    it('should return union of two sets', () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([3, 4, 5]);
      expect([...union(a, b)]).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return intersection of two sets', () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([2, 3, 4]);
      expect([...intersection(a, b)]).toEqual([2, 3]);
    });

    it('should return difference of two sets', () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([2, 3, 4]);
      expect([...difference(a, b)]).toEqual([1]);
    });

    it('should return symmetric difference of two sets', () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([2, 3, 4]);
      expect([...symmetricDifference(a, b)]).toEqual([1, 4]);
    });
  });

  describe('Cache', () => {
    it('should store and retrieve values', () => {
      const cache = new Cache<string, number>();
      cache.set('a', 1, 10000);
      expect(cache.get('a')).toBe(1);
    });

    it('should return undefined for missing keys', () => {
      const cache = new Cache<string, number>();
      expect(cache.get('missing')).toBeUndefined();
    });

    it('should expire entries after TTL', async () => {
      const cache = new Cache<string, number>();
      cache.set('a', 1, 10);
      expect(cache.get('a')).toBe(1);
      await new Promise(r => setTimeout(r, 20));
      expect(cache.get('a')).toBeUndefined();
    });
  });

  describe('unique', () => {
    it('should remove duplicates from array', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should work with strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('frequency', () => {
    it('should count frequencies correctly', () => {
      const freq = frequency(['a', 'b', 'a', 'c', 'a', 'b']);
      expect(freq.get('a')).toBe(3);
      expect(freq.get('b')).toBe(2);
      expect(freq.get('c')).toBe(1);
    });

    it('should return empty map for empty array', () => {
      expect(frequency([]).size).toBe(0);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
