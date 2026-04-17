/**
 * @file Set Mathematical Methods Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  basicSetOperationsDemo,
  subsetRelationDemo,
  permissionIntersectionDemo,
  iterableArgumentDemo,
  tagAnalysisDemo,
} from './set-methods.js';

describe('ES2025 Set Mathematical Methods', () => {
  it('basicSetOperationsDemo', () => {
    const result = basicSetOperationsDemo();
    expect([...result.union]).toEqual(['React', 'Vue', 'Angular', 'Node.js']);
    expect([...result.intersection]).toEqual(['React', 'Vue']);
    expect([...result.difference]).toEqual(['Angular']);
    expect([...result.symmetricDifference]).toEqual(['Angular', 'Node.js']);
  });

  it('subsetRelationDemo', () => {
    const result = subsetRelationDemo();
    expect(result.isSubset).toBe(true);
    expect(result.isSuperset).toBe(true);
    expect(result.isDisjoint).toBe(true);
  });

  it('permissionIntersectionDemo', () => {
    const result = permissionIntersectionDemo();
    expect([...result]).toEqual(['admin']);
  });

  it('iterableArgumentDemo', () => {
    expect(iterableArgumentDemo()).toBe(true);
  });

  it('tagAnalysisDemo', () => {
    const result = tagAnalysisDemo();
    expect([...result.allTags]).toEqual(['javascript', 'typescript', 'es2025', 'react']);
    expect([...result.commonTags]).toEqual(['typescript', 'es2025']);
    expect([...result.uniqueTagsA]).toEqual(['javascript']);
  });
});
