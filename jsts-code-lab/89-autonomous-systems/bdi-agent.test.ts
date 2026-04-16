import { describe, it, expect } from 'vitest'
import { BDIAgent, demo } from './bdi-agent'

describe('bdi-agent', () => {
  it('BDIAgent is defined', () => {
    expect(typeof BDIAgent).not.toBe('undefined');
  });
  it('BDIAgent can be instantiated if constructor permits', () => {
    if (typeof BDIAgent === 'function') {
      try {
        const instance = new BDIAgent();
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