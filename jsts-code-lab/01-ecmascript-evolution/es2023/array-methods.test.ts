import { describe, it, expect } from 'vitest';
import { updateItemsReactStyle, reducer, numbers, letters, items, arr, nums, data } from './array-methods';

describe('ES2023 array methods', () => {
  it('toSorted should not mutate original array', () => {
    const original = [3, 1, 2];
    const sorted = original.toSorted((a, b) => a - b);
    expect(sorted).toEqual([1, 2, 3]);
    expect(original).toEqual([3, 1, 2]);
  });

  it('toReversed should not mutate original array', () => {
    const original = ['a', 'b', 'c'];
    const reversed = original.toReversed();
    expect(reversed).toEqual(['c', 'b', 'a']);
    expect(original).toEqual(['a', 'b', 'c']);
  });

  it('toSpliced should return new array without mutating original', () => {
    const original = ['a', 'b', 'c', 'd', 'e'];
    const spliced = original.toSpliced(2, 2, 'x', 'y');
    expect(spliced).toEqual(['a', 'b', 'x', 'y', 'e']);
    expect(original).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('with should replace element immutably', () => {
    const original = [1, 2, 3];
    const replaced = original.with(1, 99);
    expect(replaced).toEqual([1, 99, 3]);
    expect(original).toEqual([1, 2, 3]);
  });

  it('findLast and findLastIndex should search from end', () => {
    const array = [5, 12, 8, 130, 44, 8];
    expect(array.findLast((n) => n > 10)).toBe(44);
    expect(array.findLastIndex((n) => n > 10)).toBe(4);
  });

  it('updateItemsReactStyle should replace item immutably', () => {
    const items = ['a', 'b', 'c'];
    expect(updateItemsReactStyle(items, 1, 'z')).toEqual(['a', 'z', 'c']);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('reducer should sort asc without mutating state', () => {
    const state = { items: [3, 1, 2], sortOrder: 'desc' as const };
    const newState = reducer(state, { type: 'SORT_ASC' });
    expect(newState.items).toEqual([1, 2, 3]);
    expect(newState.sortOrder).toBe('asc');
    expect(state.items).toEqual([3, 1, 2]);
  });
});
