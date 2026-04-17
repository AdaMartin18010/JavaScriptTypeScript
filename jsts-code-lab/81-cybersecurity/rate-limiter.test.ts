import { describe, it, expect } from 'vitest';
import {
  TokenBucket,
  SlidingWindowLimiter,
  FixedWindowLimiter,
  MultiKeyRateLimiter,
} from './rate-limiter.js';

describe('TokenBucket', () => {
  it('should allow requests when bucket has tokens', () => {
    const bucket = new TokenBucket({ capacity: 5, refillRate: 1 });
    const result = bucket.consume();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should reject requests when bucket is empty', () => {
    const bucket = new TokenBucket({ capacity: 2, refillRate: 0.001 });
    bucket.consume();
    bucket.consume();
    const result = bucket.consume();
    expect(result.allowed).toBe(false);
  });

  it('should refill tokens over time', async () => {
    const bucket = new TokenBucket({ capacity: 2, refillRate: 10 });
    bucket.consume();
    bucket.consume();

    await new Promise(r => setTimeout(r, 150));
    const result = bucket.consume();
    expect(result.allowed).toBe(true);
  });

  it('should throw on invalid capacity', () => {
    expect(() => new TokenBucket({ capacity: 0, refillRate: 1 })).toThrow('Capacity must be greater than 0');
  });

  it('should throw on invalid refill rate', () => {
    expect(() => new TokenBucket({ capacity: 5, refillRate: 0 })).toThrow('Refill rate must be greater than 0');
  });

  it('should throw on invalid consume amount', () => {
    const bucket = new TokenBucket({ capacity: 5, refillRate: 1 });
    expect(() => bucket.consume(0)).toThrow('Tokens to consume must be greater than 0');
  });

  it('peek should return current state without consuming', () => {
    const bucket = new TokenBucket({ capacity: 5, refillRate: 1 });
    const before = bucket.peek();
    expect(before.remaining).toBe(5);

    bucket.consume();
    const after = bucket.peek();
    expect(after.remaining).toBe(4);
  });
});

describe('SlidingWindowLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new SlidingWindowLimiter({ windowSizeMs: 1000, maxRequests: 3 });
    expect(limiter.allow().allowed).toBe(true);
    expect(limiter.allow().allowed).toBe(true);
    expect(limiter.allow().allowed).toBe(true);
  });

  it('should reject requests exceeding limit', () => {
    const limiter = new SlidingWindowLimiter({ windowSizeMs: 1000, maxRequests: 2 });
    limiter.allow();
    limiter.allow();
    const result = limiter.allow();
    expect(result.allowed).toBe(false);
  });

  it('should reset after window passes', async () => {
    const limiter = new SlidingWindowLimiter({ windowSizeMs: 100, maxRequests: 1 });
    limiter.allow();
    await new Promise(r => setTimeout(r, 150));
    const result = limiter.allow();
    expect(result.allowed).toBe(true);
  });

  it('should provide correct stats', () => {
    const limiter = new SlidingWindowLimiter({ windowSizeMs: 1000, maxRequests: 5 });
    limiter.allow();
    limiter.allow();
    const stats = limiter.getStats();
    expect(stats.currentRequests).toBe(2);
  });

  it('should throw on invalid window size', () => {
    expect(() => new SlidingWindowLimiter({ windowSizeMs: 0, maxRequests: 1 })).toThrow();
  });
});

describe('FixedWindowLimiter', () => {
  it('should allow requests within window limit', () => {
    const limiter = new FixedWindowLimiter({ windowSizeMs: 1000, maxRequests: 3 });
    expect(limiter.allow().allowed).toBe(true);
    expect(limiter.allow().allowed).toBe(true);
    expect(limiter.allow().allowed).toBe(true);
  });

  it('should reject requests exceeding window limit', () => {
    const limiter = new FixedWindowLimiter({ windowSizeMs: 1000, maxRequests: 2 });
    limiter.allow();
    limiter.allow();
    expect(limiter.allow().allowed).toBe(false);
  });

  it('should include retryAfter when rejected', () => {
    const limiter = new FixedWindowLimiter({ windowSizeMs: 1000, maxRequests: 1 });
    limiter.allow();
    const result = limiter.allow();
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});

describe('MultiKeyRateLimiter', () => {
  it('should track limits per key independently', () => {
    const limiter = new MultiKeyRateLimiter({ capacity: 2, refillRate: 10 });
    expect(limiter.consume('user-a').allowed).toBe(true);
    expect(limiter.consume('user-a').allowed).toBe(true);
    expect(limiter.consume('user-b').allowed).toBe(true);
  });

  it('should reject when single key exceeds limit', () => {
    const limiter = new MultiKeyRateLimiter({ capacity: 1, refillRate: 0.001 });
    limiter.consume('user-a');
    const result = limiter.consume('user-a');
    expect(result.allowed).toBe(false);
  });

  it('should return default state for unknown key', () => {
    const limiter = new MultiKeyRateLimiter({ capacity: 5, refillRate: 1 });
    const state = limiter.peek('new-user');
    expect(state).not.toBeNull();
    expect(state!.remaining).toBe(5);
  });

  it('should reset a specific key', () => {
    const limiter = new MultiKeyRateLimiter({ capacity: 1, refillRate: 0.001 });
    limiter.consume('user-a');
    limiter.reset('user-a');
    const result = limiter.consume('user-a');
    expect(result.allowed).toBe(true);
  });

  it('should track active key count', () => {
    const limiter = new MultiKeyRateLimiter({ capacity: 5, refillRate: 1 });
    limiter.consume('a');
    limiter.consume('b');
    expect(limiter.getActiveKeyCount()).toBe(2);
  });
});
