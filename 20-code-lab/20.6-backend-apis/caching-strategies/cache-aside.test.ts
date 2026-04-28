import { describe, it, expect } from 'vitest';
import { CacheAside, InMemoryCacheProvider, MockDataSource } from './cache-aside.js';

describe('CacheAside', () => {
  it('loads from source on first get and caches', async () => {
    const cache = new InMemoryCacheProvider<string>();
    const db = new MockDataSource<string>(0);
    db.seed('a', 'alice');
    const aside = new CacheAside(cache, db);
    const v1 = await aside.get('a');
    const v2 = await aside.get('a');
    expect(v1).toBe('alice');
    expect(v2).toBe('alice');
    expect(aside.getStats().misses).toBe(1);
    expect(aside.getStats().hits).toBe(1);
  });

  it('updates cache and source on set', async () => {
    const cache = new InMemoryCacheProvider<string>();
    const db = new MockDataSource<string>(0);
    const aside = new CacheAside(cache, db);
    await aside.set('b', 'bob');
    expect(await db.get('b')).toBe('bob');
    expect(await aside.get('b')).toBe('bob');
    expect(aside.getStats().writes).toBe(1);
  });

  it('deletes from both cache and source', async () => {
    const cache = new InMemoryCacheProvider<string>();
    const db = new MockDataSource<string>(0);
    db.seed('c', 'carol');
    const aside = new CacheAside(cache, db);
    await aside.get('c');
    await aside.delete('c');
    expect(await db.get('c')).toBeNull();
    expect(cache.get('c')).toBeUndefined();
    expect(aside.getStats().deletes).toBe(1);
  });

  it('batch getMany fetches missing keys', async () => {
    const cache = new InMemoryCacheProvider<string>();
    const db = new MockDataSource<string>(0);
    db.seed('x', 'xray');
    const aside = new CacheAside(cache, db);
    const results = await aside.getMany(['x', 'y']);
    expect(results.get('x')).toBe('xray');
    expect(results.get('y')).toBeNull();
  });
});
