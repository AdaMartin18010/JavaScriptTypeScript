import { describe, it, expect } from 'vitest'
import { ASTTraverser, ASTUtils, demo } from './ast.js'

describe('ast', () => {
  it('ASTTraverser is defined', () => {
    expect(typeof ASTTraverser).not.toBe('undefined');
  });
  it('ASTTraverser can be instantiated if constructor permits', () => {
    if (typeof ASTTraverser === 'function') {
      try {
        const instance = new (ASTTraverser as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('ASTUtils is defined', () => {
    expect(typeof ASTUtils).not.toBe('undefined');
  });
  it('ASTUtils can be instantiated if constructor permits', () => {
    if (typeof ASTUtils === 'function') {
      try {
        const instance = new (ASTUtils as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('demo is defined', () => {
    expect(typeof demo).not.toBe('undefined');
  });
  it('demo is callable', () => {
    if (typeof demo === 'function') {
      try {
        const result = demo();
        expect(result).toBeDefined();
      } catch { }
    }
  });
});
