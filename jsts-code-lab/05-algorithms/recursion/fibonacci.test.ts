import { describe, it, expect } from 'vitest';
import {
  fibRecursive,
  fibMemo,
  fibIterative,
  createFibGenerator,
  fibGenerator,
  fibTail,
  fibFastDoubling,
  demo
} from './fibonacci.js';

describe('fibonacci', () => {
  describe('fibRecursive', () => {
    it('should compute fibonacci recursively', () => {
      expect(fibRecursive(0)).toBe(0);
      expect(fibRecursive(1)).toBe(1);
      expect(fibRecursive(10)).toBe(55);
    });
  });

  describe('fibMemo', () => {
    it('should compute fibonacci with memoization', () => {
      expect(fibMemo(0)).toBe(0);
      expect(fibMemo(1)).toBe(1);
      expect(fibMemo(50)).toBe(12586269025);
    });
  });

  describe('fibIterative', () => {
    it('should compute fibonacci iteratively', () => {
      expect(fibIterative(0)).toBe(0);
      expect(fibIterative(1)).toBe(1);
      expect(fibIterative(100)).toBe(354224848179262000000);
    });
  });

  describe('createFibGenerator', () => {
    it('should generate fibonacci sequence via closure', () => {
      const next = createFibGenerator();
      expect(next()).toBe(0);
      expect(next()).toBe(1);
      expect(next()).toBe(1);
      expect(next()).toBe(2);
      expect(next()).toBe(3);
      expect(next()).toBe(5);
    });
  });

  describe('fibGenerator', () => {
    it('should generate fibonacci sequence via generator', () => {
      const gen = fibGenerator();
      expect(gen.next().value).toBe(0);
      expect(gen.next().value).toBe(1);
      expect(gen.next().value).toBe(1);
      expect(gen.next().value).toBe(2);
      expect(gen.next().value).toBe(3);
    });
  });

  describe('fibTail', () => {
    it('should compute fibonacci with tail recursion', () => {
      expect(fibTail(0)).toBe(0);
      expect(fibTail(1)).toBe(1);
      expect(fibTail(10)).toBe(55);
      expect(fibTail(50)).toBe(12586269025);
    });
  });

  describe('fibFastDoubling', () => {
    it('should compute fibonacci with fast doubling', () => {
      expect(fibFastDoubling(0)).toBe(0);
      expect(fibFastDoubling(1)).toBe(1);
      expect(fibFastDoubling(10)).toBe(55);
      expect(fibFastDoubling(50)).toBe(12586269025);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
