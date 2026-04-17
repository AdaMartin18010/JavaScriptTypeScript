import { describe, it, expect } from 'vitest';
import { LRUCache, LRUKCache } from './lru-cache.js';

describe('LRUCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'apple');
    expect(cache.get('a')).toBe('apple');
  });

  it('returns undefined for missing keys', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts least recently used when exceeding max size', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.set('c', 'c');
    cache.set('d', 'd');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('updates access order on get', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.set('c', 'c');
    cache.get('a'); // a becomes most recently used
    cache.set('d', 'd'); // should evict b
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('updates value and access order on set', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'old');
    cache.set('b', 'b');
    cache.set('a', 'new'); // a becomes most recently used
    expect(cache.get('a')).toBe('new');
  });

  it('deletes specific key', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    expect(cache.delete('a')).toBe(true);
    expect(cache.has('a')).toBe(false);
    expect(cache.delete('missing')).toBe(false);
  });

  it('clears all entries', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('returns keys in LRU order', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.set('c', 'c');
    cache.get('a');
    expect(cache.keys()).toEqual(['a', 'c', 'b']);
  });

  it('reports stats correctly', () => {
    const cache = new LRUCache<string>({ maxSize: 3 });
    cache.set('a', 'a');
    cache.set('b', 'b');
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(3);
    expect(stats.newestKey).toBe('b');
    expect(stats.oldestKey).toBe('a');
  });
});

describe('LRUKCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUKCache<string>(3, 2);
    cache.set('a', 'apple');
    expect(cache.get('a')).toBe('apple');
  });

  it('evicts items with fewer than k accesses first', () => {
    const cache = new LRUKCache<string>(3, 2);
    cache.set('a', 'a');
    cache.set('b', 'b');
    cache.get('a'); // a has 2 accesses
    cache.set('c', 'c');
    cache.set('d', 'd'); // should evict b (only 1 access)
    expect(cache.get('a')).toBe('a');
    expect(cache.get('b')).toBeUndefined();
  });

  it('deletes entries', () => {
    const cache = new LRUKCache<string>(3, 2);
    cache.set('a', 'a');
    expect(cache.delete('a')).toBe(true);
    expect(cache.get('a')).toBeUndefined();
  });
});
