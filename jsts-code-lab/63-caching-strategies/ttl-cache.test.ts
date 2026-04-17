import { describe, it, expect, vi } from 'vitest';
import { TTLCache, TieredTTLCache } from './ttl-cache.js';

describe('TTLCache', () => {
  it('stores and retrieves values', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple');
    expect(cache.get('a')).toBe('apple');
  });

  it('returns undefined for expired entries', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple', -1); // already expired
    expect(cache.get('a')).toBeUndefined();
  });

  it('deletes expired entries on get', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple', -1);
    cache.get('a');
    expect(cache.size()).toBe(0);
  });

  it('checks existence with has', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple');
    expect(cache.has('a')).toBe(true);
    cache.set('b', 'banana', -1);
    expect(cache.has('b')).toBe(false);
  });

  it('deletes entries', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple');
    expect(cache.delete('a')).toBe(true);
    expect(cache.delete('missing')).toBe(false);
  });

  it('extends ttl with touch', () => {
    const cache = new TTLCache<string>({ defaultTTL: 100 });
    cache.set('a', 'apple');
    const oldTTL = cache.getTTL('a');
    cache.touch('a', 500);
    expect(cache.getTTL('a')).toBeGreaterThan(oldTTL);
  });

  it('returns false when touching non-existent key', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    expect(cache.touch('missing')).toBe(false);
  });

  it('returns remaining ttl', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple');
    expect(cache.getTTL('a')).toBeGreaterThan(0);
    expect(cache.getTTL('a')).toBeLessThanOrEqual(1000);
  });

  it('returns -1 for missing key ttl', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    expect(cache.getTTL('missing')).toBe(-1);
  });

  it('cleans up expired entries', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'apple', -1);
    cache.set('b', 'banana');
    const cleaned = cache.cleanup();
    expect(cleaned).toBe(1);
    expect(cache.size()).toBe(1);
  });

  it('tracks stats', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.get('missing'); // miss
    cache.set('a', 'apple');
    cache.get('a'); // hit
    cache.get('a'); // hit
    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.667, 2);
  });

  it('evicts oldest when exceeding max size', () => {
    const cache = new TTLCache<string>({ defaultTTL: 10000, maxSize: 2 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.set('c', 'c');
    expect(cache.size()).toBe(2);
  });

  it('calls onExpire when entry expires', () => {
    const onExpire = vi.fn();
    const cache = new TTLCache<string>({ defaultTTL: 1000, onExpire });
    cache.set('a', 'apple', -1);
    cache.cleanup();
    expect(onExpire).toHaveBeenCalledWith('a', 'apple');
  });

  it('returns only valid keys', () => {
    const cache = new TTLCache<string>({ defaultTTL: 1000 });
    cache.set('a', 'a');
    cache.set('b', 'b', -1);
    expect(cache.keys()).toEqual(['a']);
  });
});

describe('TieredTTLCache', () => {
  it('reads from hot cache first', () => {
    const cache = new TieredTTLCache<string>({ hotTTL: 1000, warmTTL: 5000, hotSize: 10, warmSize: 10 });
    cache.set('a', 'apple');
    expect(cache.get('a')).toBe('apple');
  });

  it('promotes warm to hot on access', () => {
    const cache = new TieredTTLCache<string>({ hotTTL: 1000, warmTTL: 5000, hotSize: 10, warmSize: 10 });
    cache.set('a', 'apple');
    cache.hot.delete('a'); // simulate eviction from hot
    expect(cache.get('a')).toBe('apple');
  });

  it('deletes from both tiers', () => {
    const cache = new TieredTTLCache<string>({ hotTTL: 1000, warmTTL: 5000, hotSize: 10, warmSize: 10 });
    cache.set('a', 'apple');
    cache.delete('a');
    expect(cache.get('a')).toBeUndefined();
  });
});
