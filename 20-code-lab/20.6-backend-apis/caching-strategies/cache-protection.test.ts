import { describe, it, expect } from 'vitest';
import {
  BloomFilter,
  CachePenetrationGuard,
  CacheBreakdownGuard,
  CacheAvalancheGuard,
  CacheGuardian
} from './cache-protection.js';

describe('BloomFilter', () => {
  it('confirms added items might exist', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('a');
    bf.add('b');
    expect(bf.mightContain('a')).toBe(true);
    expect(bf.mightContain('b')).toBe(true);
  });

  it('may have false positives but not false negatives', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('a');
    expect(bf.mightContain('a')).toBe(true);
    // False positives are possible, but false negatives impossible
    expect(bf.mightContain('never-added')).toBe(false);
  });
});

describe('CachePenetrationGuard', () => {
  it('caches null values to prevent penetration', async () => {
    const guard = new CachePenetrationGuard<string, string>({ nullTTL: 1000 });
    guard.preload(['existing']);

    let loadCount = 0;
    const loader = async () => { loadCount++; return null; };

    // First call loads
    await guard.get('existing', loader);
    expect(loadCount).toBe(1);

    // Second call returns cached null
    await guard.get('existing', loader);
    expect(loadCount).toBe(1);
  });

  it('blocks non-existent keys via bloom filter', async () => {
    const guard = new CachePenetrationGuard<string, string>();
    let loadCount = 0;
    const loader = async () => { loadCount++; return 'value'; };

    const result = await guard.get('unknown', loader);
    expect(result).toBeNull();
    expect(loadCount).toBe(0);
  });

  it('allows existing keys through bloom filter', async () => {
    const guard = new CachePenetrationGuard<string, string>();
    guard.preload(['known']);

    const result = await guard.get('known', async () => 'value');
    expect(result).toBe('value');
  });
});

describe('CacheBreakdownGuard', () => {
  it('prevents duplicate loads with mutex', async () => {
    const guard = new CacheBreakdownGuard<string, string>();
    let loadCount = 0;
    const loader = async () => {
      loadCount++;
      await new Promise(r => setTimeout(r, 50));
      return 'value';
    };

    const getter = () => undefined;

    // Fire two concurrent requests
    const p1 = guard.get('key', getter, loader);
    const p2 = guard.get('key', getter, loader);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe('value');
    expect(r2).toBe('value');
    expect(loadCount).toBe(1); // Only loaded once
  });

  it('returns cached value immediately', async () => {
    const guard = new CacheBreakdownGuard<string, string>();
    let loadCount = 0;
    const result = await guard.get(
      'key',
      () => 'cached',
      async () => { loadCount++; return 'loaded'; }
    );
    expect(result).toBe('cached');
    expect(loadCount).toBe(0);
  });

  it('times out long loaders', async () => {
    const guard = new CacheBreakdownGuard<string, string>({ lockTimeout: 50 });
    await expect(guard.get(
      'key',
      () => undefined,
      async () => { await new Promise(r => setTimeout(r, 100)); return 'value'; }
    )).rejects.toThrow('Lock timeout');
  });
});

describe('CacheAvalancheGuard', () => {
  it('adds jitter to TTL', () => {
    const guard = new CacheAvalancheGuard({ jitterRange: 100 });
    const ttl = guard.calculateTTL(1000);
    expect(ttl).toBeGreaterThanOrEqual(1000);
    expect(ttl).toBeLessThanOrEqual(1100);
  });

  it('applies jitter to multiple items', () => {
    const guard = new CacheAvalancheGuard({ jitterRange: 100 });
    const items = [{ key: 'a', ttl: 1000 }, { key: 'b', ttl: 1000 }];
    const result = guard.applyJitter(items);
    expect(result[0].adjustedTTL).not.toBe(result[1].adjustedTTL);
  });

  it('warms up cache with scattered loads', async () => {
    const guard = new CacheAvalancheGuard();
    const loaded: string[] = [];
    const cache = new Map<string, { value: string; ttl: number }>();

    await guard.warmup(
      ['a', 'b'],
      async key => { loaded.push(key); return key; },
      (key, value, ttl) => cache.set(key, { value, ttl }),
      1000
    );

    expect(loaded).toHaveLength(2);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(true);
  });
});

describe('CacheGuardian', () => {
  it('integrates all protections', async () => {
    const guardian = new CacheGuardian<string, string>();
    guardian.preload(['user:1']);

    const cache = new Map<string, { value: string; expiresAt: number }>();

    const result = await guardian.get(
      'user:1',
      () => cache.get('user:1')?.value,
      (key, value, ttl) => cache.set(key, { value, expiresAt: Date.now() + ttl }),
      async () => 'Alice',
      1000
    );

    expect(result).toBe('Alice');
    expect(cache.has('user:1')).toBe(true);
  });

  it('handles null results with penetration guard', async () => {
    const guardian = new CacheGuardian<string, string>();
    const cache = new Map<string, { value: string; expiresAt: number }>();

    const result = await guardian.get(
      'unknown',
      () => cache.get('unknown')?.value,
      (key, value, ttl) => cache.set(key, { value, expiresAt: Date.now() + ttl }),
      async () => null,
      1000
    );

    expect(result).toBeNull();
  });
});
