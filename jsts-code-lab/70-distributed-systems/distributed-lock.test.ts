import { describe, it, expect } from 'vitest';
import { DistributedLock } from './distributed-lock.js';

describe('DistributedLock', () => {
  it('should acquire and release a lock', async () => {
    const lock = new DistributedLock();
    const acquired = await lock.acquire('res-1', 'owner-a');
    expect(acquired).toBe(true);
    expect(lock.isLocked('res-1')).toBe(true);

    lock.release('res-1', 'owner-a');
    expect(lock.isLocked('res-1')).toBe(false);
  });

  it('should block another owner from acquiring the same lock', async () => {
    const lock = new DistributedLock({ maxRetries: 1, retryDelayMs: 10 });
    await lock.acquire('res-1', 'owner-a');
    const acquired = await lock.acquire('res-1', 'owner-b');
    expect(acquired).toBe(false);
  });

  it('should support reentrant locks', async () => {
    const lock = new DistributedLock();
    await lock.acquire('res-1', 'owner-a');
    await lock.acquire('res-1', 'owner-a');

    lock.release('res-1', 'owner-a');
    expect(lock.isLocked('res-1')).toBe(true);

    lock.release('res-1', 'owner-a');
    expect(lock.isLocked('res-1')).toBe(false);
  });

  it('should throw when non-owner tries to release', async () => {
    const lock = new DistributedLock();
    await lock.acquire('res-1', 'owner-a');
    expect(() => lock.release('res-1', 'owner-b')).toThrow();
  });

  it('should expire after ttl', async () => {
    const lock = new DistributedLock({ ttlMs: 50 });
    await lock.acquire('res-1', 'owner-a');
    expect(lock.isLocked('res-1')).toBe(true);

    await new Promise(r => setTimeout(r, 80));
    expect(lock.isLocked('res-1')).toBe(false);
  });

  it('should allow force release', async () => {
    const lock = new DistributedLock();
    await lock.acquire('res-1', 'owner-a');
    lock.forceRelease('res-1');
    expect(lock.isLocked('res-1')).toBe(false);
  });
});
