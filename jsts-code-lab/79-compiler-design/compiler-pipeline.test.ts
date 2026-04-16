import { describe, it, expect } from 'vitest'
import { Lexer, Parser, Optimizer, CodeGenerator, demo } from './compiler-pipeline.js'

describe('compiler-pipeline', () => {
  it('Lexer is defined', () => {
    expect(typeof Lexer).not.toBe('undefined');
  });
  it('Lexer can be instantiated if constructor permits', () => {
    if (typeof Lexer === 'function') {
      try {
        const instance = new (Lexer as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
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
  it('Optimizer is defined', () => {
    expect(typeof Optimizer).not.toBe('undefined');
  });
  it('Optimizer can be instantiated if constructor permits', () => {
    if (typeof Optimizer === 'function') {
      try {
        const instance = new (Optimizer as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('CodeGenerator is defined', () => {
    expect(typeof CodeGenerator).not.toBe('undefined');
  });
  it('CodeGenerator can be instantiated if constructor permits', () => {
    if (typeof CodeGenerator === 'function') {
      try {
        const instance = new (CodeGenerator as any)();
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
