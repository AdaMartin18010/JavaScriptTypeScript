/**
 * @file Iterator Helpers Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  basicChainDemo,
  infiniteIteratorDemo,
  flatMapDemo,
  reduceDemo,
  predicateDemo,
  dropDemo,
  forEachDemo,
  lazyEvaluationDemo,
} from './iterator-helpers.js';

describe('ES2025 Iterator Helpers', () => {
  it('basicChainDemo', () => {
    expect(basicChainDemo()).toEqual([20, 40, 60]);
  });

  it('infiniteIteratorDemo', () => {
    expect(infiniteIteratorDemo()).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  it('flatMapDemo', () => {
    expect(flatMapDemo()).toEqual(['hello', 'world', 'es2025', 'iterator', 'helpers']);
  });

  it('reduceDemo', () => {
    expect(reduceDemo()).toBe(15);
  });

  it('predicateDemo', () => {
    const result = predicateDemo();
    expect(result.some).toBe(true);
    expect(result.every).toBe(true);
    expect(result.find).toBe(6);
  });

  it('dropDemo', () => {
    expect(dropDemo()).toEqual([4, 5, 6]);
  });

  it('forEachDemo', () => {
    expect(forEachDemo()).toEqual([2, 4, 6]);
  });

  it('lazyEvaluationDemo', () => {
    const result = lazyEvaluationDemo();
    expect(result[0]).toBe('before-consume=0');
    expect(result[1]).toBe('result=6,8');
  });
});
