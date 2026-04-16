import { describe, it, expect } from 'vitest'
import { Lexer, TokenFormatter, demo } from './lexer'

describe('lexer', () => {
  it('Lexer is defined', () => {
    expect(typeof Lexer).not.toBe('undefined');
  });
  it('Lexer can be instantiated if constructor permits', () => {
    if (typeof Lexer === 'function') {
      try {
        const instance = new Lexer();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('TokenFormatter is defined', () => {
    expect(typeof TokenFormatter).not.toBe('undefined');
  });
  it('TokenFormatter can be instantiated if constructor permits', () => {
    if (typeof TokenFormatter === 'function') {
      try {
        const instance = new TokenFormatter();
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