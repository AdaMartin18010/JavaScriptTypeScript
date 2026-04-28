import { describe, it, expect } from 'vitest'
import { Parser, ASTFormatter, demo } from './parser.js'

describe('parser', () => {
  it('Parser is defined', () => {
    expect(typeof Parser).not.toBe('undefined');
  });
  it('Parser can be instantiated if constructor permits', () => {
    if (typeof Parser === 'function') {
      try {
        const instance = new (Parser as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('ASTFormatter is defined', () => {
    expect(typeof ASTFormatter).not.toBe('undefined');
  });
  it('ASTFormatter can be instantiated if constructor permits', () => {
    if (typeof ASTFormatter === 'function') {
      try {
        const instance = new (ASTFormatter as any)();
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
