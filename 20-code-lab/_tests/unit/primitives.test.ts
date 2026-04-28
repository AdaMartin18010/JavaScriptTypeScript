/**
 * @file 原始类型测试
 * @description 测试 primitives.ts 中的功能
 */

import { describe, it, expect } from 'vitest';
import { roughlyEqual, EPSILON, greet } from '../../00-language-core/01-types/primitives.js';

describe('Primitives', () => {
  describe('roughlyEqual', () => {
    it('should return true for close floats', () => {
      expect(roughlyEqual(0.1 + 0.2, 0.3)).toBe(true);
    });

    it('should return false for different numbers', () => {
      expect(roughlyEqual(0.1, 0.2)).toBe(false);
    });

    it('should handle exact equality', () => {
      expect(roughlyEqual(42, 42)).toBe(true);
    });
  });

  describe('greet', () => {
    it('should return provided name', () => {
      expect(greet('Alice')).toBe('Alice');
    });

    it('should return Guest when no name provided', () => {
      expect(greet()).toBe('Guest');
    });

    it('should return Guest for undefined', () => {
      expect(greet(undefined)).toBe('Guest');
    });
  });

  describe('EPSILON', () => {
    it('should be a very small positive number', () => {
      expect(EPSILON).toBeGreaterThan(0);
      expect(EPSILON).toBeLessThan(0.0001);
    });
  });
});
