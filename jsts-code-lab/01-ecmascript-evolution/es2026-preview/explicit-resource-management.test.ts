/**
 * @file Explicit Resource Management Tests (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 */

import { describe, it, expect } from 'vitest';
import {
  basicUsingDemo,
  multipleResourcesDemo,
  asyncResourceDemo,
  disposableStackDemo,
  deferPatternDemo,
} from './explicit-resource-management.js';

describe('ES2026 Explicit Resource Management', () => {
  it('basicUsingDemo', () => {
    const result = basicUsingDemo();
    expect(result.logs).toEqual(['file-handle acquired', 'file-handle disposed']);
    expect(result.result).toBe(42);
  });

  it('multipleResourcesDemo', () => {
    expect(multipleResourcesDemo()).toEqual([
      'open A',
      'open B',
      'use A and B',
      'close B',
      'close A',
    ]);
  });

  it('asyncResourceDemo', async () => {
    expect(await asyncResourceDemo()).toEqual([
      'async open db-connection',
      'query db',
      'async close db-connection',
    ]);
  });

  it('disposableStackDemo', () => {
    expect(disposableStackDemo()).toEqual([
      'using file',
      'dispose file',
      'dispose first',
    ]);
  });

  it('deferPatternDemo', () => {
    expect(deferPatternDemo()).toEqual([
      'process data.txt',
      'done',
      'cleanup data.txt.tmp',
    ]);
  });
});
