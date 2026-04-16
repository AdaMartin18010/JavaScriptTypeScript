import { describe, it, expect } from 'vitest';
import { FixedWindowRateLimiter, SlidingWindowRateLimiter, TokenBucketRateLimiter, LeakyBucketRateLimiter, TieredRateLimiter } from './rate-limiter';

describe('FixedWindowRateLimiter', () => {
  it('allows requests up to max', () => {
    const rl = new FixedWindowRateLimiter({ maxRequests: 2, windowMs: 60000 });
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(false);
  });

  it('resets after reset call', () => {
    const rl = new FixedWindowRateLimiter({ maxRequests: 1, windowMs: 60000 });
    rl.check('k');
    rl.reset('k');
    expect(rl.check('k').allowed).toBe(true);
  });
});

describe('SlidingWindowRateLimiter', () => {
  it('allows within window', () => {
    const rl = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 60000 });
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(false);
  });
});

describe('TokenBucketRateLimiter', () => {
  it('refills tokens over time', () => {
    const rl = new TokenBucketRateLimiter({ maxRequests: 2, windowMs: 100 });
    expect(rl.check('k', 2).allowed).toBe(true);
    expect(rl.check('k', 1).allowed).toBe(false);
  });
});

describe('LeakyBucketRateLimiter', () => {
  it('limits volume', () => {
    const rl = new LeakyBucketRateLimiter({ maxRequests: 2, windowMs: 1000 });
    expect(rl.check('k', 1).allowed).toBe(true);
    expect(rl.check('k', 2).allowed).toBe(false);
  });
});

describe('TieredRateLimiter', () => {
  it('checks all tiers', () => {
    const tiered = new TieredRateLimiter();
    tiered.addTier('ip', (req: any) => req.ip, new FixedWindowRateLimiter({ maxRequests: 1, windowMs: 60000 }));
    tiered.addTier('user', (req: any) => req.user, new FixedWindowRateLimiter({ maxRequests: 5, windowMs: 60000 }));
    const r1 = tiered.check({ ip: '1.1.1.1', user: 'u1' });
    expect(r1.allowed).toBe(true);
    const r2 = tiered.check({ ip: '1.1.1.1', user: 'u1' });
    expect(r2.allowed).toBe(false);
  });
});
