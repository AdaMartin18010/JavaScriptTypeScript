/**
 * @file Array.fromAsync Tests (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 */

import { describe, it, expect } from 'vitest';
import {
  basicFromAsyncDemo,
  mappingFromAsyncDemo,
  asyncIteratorDemo,
  comparisonDemo,
} from './array-from-async.js';

const hasArrayFromAsync = typeof (Array as unknown as { fromAsync?: Function }).fromAsync === 'function';
const itIf = hasArrayFromAsync ? it : it.skip;

describe('ES2026 Array.fromAsync', () => {
  itIf('basicFromAsyncDemo', async () => {
    expect(await basicFromAsyncDemo()).toEqual([1, 2, 3]);
  });

  itIf('mappingFromAsyncDemo', async () => {
    expect(await mappingFromAsyncDemo()).toEqual(['A', 'B', 'C']);
  });

  itIf('asyncIteratorDemo', async () => {
    expect(await asyncIteratorDemo()).toEqual([10, 20, 30]);
  });

  itIf('comparisonDemo', async () => {
    const result = await comparisonDemo();
    expect(result.fromAsync).toEqual([2, 4, 6]);
    expect(result.promiseAll).toEqual([2, 4, 6]);
  });
});
