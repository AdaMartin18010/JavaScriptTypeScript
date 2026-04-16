import { describe, it, expect, vi } from 'vitest';
import { InMemoryCache, CacheAside, ReadThroughCache, WriteThroughCache, MultiLevelCache } from './cache-patterns.js';

describe('InMemoryCache', () => {
  it('stores and retrieves values with ttl', () => {
    const cache = new InMemoryCache(10000);
    cache.set('a', 1, 5000, ['t1']);
    expect(cache.get<number>('a')).toBe(1);
    cache.invalidateByTag('t1');
    expect(cache.get<number>('a')).toBeUndefined();
  });

  it('expires entries', () => {
    vi.useFakeTimers();
    const cache = new InMemoryCache(1000);
    cache.set('a', 1);
    vi.advanceTimersByTime(1001);
    expect(cache.get<number>('a')).toBeUndefined();
    vi.useRealTimers();
  });
});

describe('CacheAside', () => {
  it('fetches on miss', async () => {
    const cache = new InMemoryCache();
    let calls = 0;
    const aside = new CacheAside(cache, async (k) => { calls++; return 'val'; }, 1000);
    expect(await aside.get('k')).toBe('val');
    expect(await aside.get('k')).toBe('val');
    expect(calls).toBe(1);
  });
});

describe('ReadThroughCache', () => {
  it('loads missing key', async () => {
    const cache = new InMemoryCache();
    const rtc = new ReadThroughCache(cache, async (k) => 'loaded');
    expect(await rtc.get('k')).toBe('loaded');
    expect(cache.get('k')).toBe('loaded');
  });
});

describe('WriteThroughCache', () => {
  it('writes to both cache and writer', async () => {
    const cache = new InMemoryCache();
    const written: Record<string, string> = {};
    const wtc = new WriteThroughCache(cache, async (k, v) => { written[k] = v as string; });
    await wtc.set('k', 'v');
    expect(cache.get('k')).toBe('v');
    expect(written['k']).toBe('v');
  });
});

describe('MultiLevelCache', () => {
  it('fills l1 and l2 on miss', async () => {
    const mlc = new MultiLevelCache();
    let loads = 0;
    const val = await mlc.get('k', async () => { loads++; return 'data'; });
    expect(val).toBe('data');
    expect(loads).toBe(1);
    const val2 = await mlc.get('k', async () => { loads++; return 'data2'; });
    expect(val2).toBe('data');
    expect(loads).toBe(1);
  });
});
