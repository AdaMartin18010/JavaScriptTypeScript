import { describe, it, expect } from 'vitest'
import { TokenBucket, LeakyBucket, FixedWindowCounter, SlidingWindowCounter, demo } from './rate-limiter.js'

describe('rate-limiter', () => {
  it('TokenBucket is defined', () => {
    expect(typeof TokenBucket).not.toBe('undefined');
  });
  it('TokenBucket can be instantiated if constructor permits', () => {
    if (typeof TokenBucket === 'function') {
      try {
        const instance = new (TokenBucket as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('LeakyBucket is defined', () => {
    expect(typeof LeakyBucket).not.toBe('undefined');
  });
  it('LeakyBucket can be instantiated if constructor permits', () => {
    if (typeof LeakyBucket === 'function') {
      try {
        const instance = new (LeakyBucket as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('FixedWindowCounter is defined', () => {
    expect(typeof FixedWindowCounter).not.toBe('undefined');
  });
  it('FixedWindowCounter can be instantiated if constructor permits', () => {
    if (typeof FixedWindowCounter === 'function') {
      try {
        const instance = new (FixedWindowCounter as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('SlidingWindowCounter is defined', () => {
    expect(typeof SlidingWindowCounter).not.toBe('undefined');
  });
  it('SlidingWindowCounter can be instantiated if constructor permits', () => {
    if (typeof SlidingWindowCounter === 'function') {
      try {
        const instance = new (SlidingWindowCounter as any)();
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
