import { describe, it, expect, vi } from 'vitest';
import {
  FixedWindowRateLimiter,
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter,
  LeakyBucketRateLimiter,
  DistributedRateLimiter
} from './rate-limiting';

describe('FixedWindowRateLimiter', () => {
  it('allows requests up to maxRequests', () => {
    const limiter = new FixedWindowRateLimiter({ windowMs: 60000, maxRequests: 2 });
    expect(limiter.check('u1').allowed).toBe(true);
    expect(limiter.check('u1').allowed).toBe(true);
    expect(limiter.check('u1').allowed).toBe(false);
    limiter.stopCleanup();
  });

  it('resets in new window', () => {
    vi.useFakeTimers();
    const limiter = new FixedWindowRateLimiter({ windowMs: 1000, maxRequests: 1 });
    expect(limiter.check('u1').allowed).toBe(true);
    expect(limiter.check('u1').allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter.check('u1').allowed).toBe(true);
    limiter.stopCleanup();
    vi.useRealTimers();
  });
});

describe('SlidingWindowRateLimiter', () => {
  it('records and blocks over limit', () => {
    const limiter = new SlidingWindowRateLimiter({ windowMs: 1000, maxRequests: 2 });
    expect(limiter.record('u1').allowed).toBe(true);
    expect(limiter.record('u1').allowed).toBe(true);
    expect(limiter.record('u1').allowed).toBe(false);
  });

  it('current count reflects recorded requests', () => {
    const limiter = new SlidingWindowRateLimiter({ windowMs: 1000, maxRequests: 5 });
    limiter.record('u1');
    limiter.record('u1');
    expect(limiter.getCurrentCount('u1')).toBe(2);
  });
});

describe('TokenBucketRateLimiter', () => {
  it('allows burst up to bucket size', () => {
    const limiter = new TokenBucketRateLimiter(3, 1);
    expect(limiter.tryConsume('u1')).toBe(true);
    expect(limiter.tryConsume('u1')).toBe(true);
    expect(limiter.tryConsume('u1')).toBe(true);
    expect(limiter.tryConsume('u1')).toBe(false);
  });

  it('refills tokens over time', () => {
    vi.useFakeTimers();
    const limiter = new TokenBucketRateLimiter(1, 1);
    expect(limiter.tryConsume('u1')).toBe(true);
    expect(limiter.tryConsume('u1')).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(limiter.tryConsume('u1')).toBe(true);
    vi.useRealTimers();
  });
});

describe('LeakyBucketRateLimiter', () => {
  it('allows requests up to bucket size', () => {
    const limiter = new LeakyBucketRateLimiter(2, 1);
    expect(limiter.add('u1').allowed).toBe(true);
    expect(limiter.add('u1').allowed).toBe(true);
    expect(limiter.add('u1').allowed).toBe(false);
  });

  it('leaks over time allowing more requests', () => {
    vi.useFakeTimers();
    const limiter = new LeakyBucketRateLimiter(1, 1);
    expect(limiter.add('u1').allowed).toBe(true);
    expect(limiter.add('u1').allowed).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(limiter.add('u1').allowed).toBe(true);
    vi.useRealTimers();
  });
});

describe('DistributedRateLimiter', () => {
  it('allows request under limit using store', async () => {
    const store = {
      async get() { return null; },
      async set() {},
      async incr() { return 1; },
      async expire() {}
    };
    const limiter = new DistributedRateLimiter(store, { windowMs: 60000, maxRequests: 2 });
    const r1 = await limiter.check('u1');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);
  });
});
