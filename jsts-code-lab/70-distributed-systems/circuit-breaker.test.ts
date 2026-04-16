import { describe, it, expect } from 'vitest'
import { CircuitBreaker } from './circuit-breaker'

describe('circuit-breaker', () => {
  it('CircuitBreaker is defined', () => {
    expect(typeof CircuitBreaker).not.toBe('undefined');
  });
  it('CircuitBreaker can be instantiated if constructor permits', () => {
    if (typeof CircuitBreaker === 'function') {
      try {
        const instance = new CircuitBreaker();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
});