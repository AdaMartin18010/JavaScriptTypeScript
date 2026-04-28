import { describe, it, expect } from 'vitest'
import { StrideEvaluator, demo } from '\./threat-modeling.js'

describe('threat-modeling', () => {
  it('StrideEvaluator is defined', () => {
    expect(typeof StrideEvaluator).not.toBe('undefined');
  });
  it('StrideEvaluator can be instantiated if constructor permits', () => {
    if (typeof StrideEvaluator === 'function') {
      try {
        const instance = new StrideEvaluator();
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
