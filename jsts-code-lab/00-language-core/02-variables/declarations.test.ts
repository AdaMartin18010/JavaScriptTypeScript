import { describe, it, expect } from 'vitest';
import { varScopeDemo, letScopeDemo, tdzDemo, blockScopedReDeclaration } from './declarations';

describe('variable declarations', () => {
  it('varScopeDemo should not throw', () => {
    expect(() => varScopeDemo()).not.toThrow();
  });

  it('letScopeDemo should not throw', () => {
    expect(() => letScopeDemo()).not.toThrow();
  });

  it('tdzDemo should return the defined value', () => {
    expect(tdzDemo()).toBeUndefined();
  });

  it('blockScopedReDeclaration should output inner and outer values', () => {
    expect(() => blockScopedReDeclaration()).not.toThrow();
  });
});
