import { describe, it, expect } from 'vitest';
import { WriteThroughCache, WriteBehindCache, WriteAroundCache, BatchWriteCache } from './write-strategies.js';

function createAdapters<T>() {
  const mem = new Map<string, T>();
  const db = new Map<string, T>();
  const cache = {
    get: async (k: string) => mem.get(k) ?? null,
    set: async (k: string, v: T) => { mem.set(k, v); },
    delete: async (k: string) => { mem.delete(k); }
  };
  const source = {
    get: async (k: string) => db.get(k) ?? null,
    set: async (k: string, v: T) => { db.set(k, v); },
    delete: async (k: string) => { db.delete(k); }
  };
  return { cache, source, mem, db };
}

describe('WriteThroughCache', () => {
  it('writes to cache and source simultaneously', async () => {
    const { cache, source, mem, db } = createAdapters<string>();
    const wt = new WriteThroughCache(cache, source);
    await wt.set('k', 'v');
    expect(mem.get('k')).toBe('v');
    expect(db.get('k')).toBe('v');
    expect(wt.getStats().writes).toBe(1);
  });
});

describe('WriteBehindCache', () => {
  it('queues writes and flushes to source', async () => {
    const { cache, source, mem, db } = createAdapters<string>();
    const wb = new WriteBehindCache(cache, source, { flushInterval: 10000 });
    await wb.set('k', 'v');
    expect(mem.get('k')).toBe('v');
    expect(db.get('k')).toBeUndefined();
    await wb.flush();
    expect(db.get('k')).toBe('v');
    wb.stopFlushTimer();
  });
});

describe('WriteAroundCache', () => {
  it('writes to source and updates cache', async () => {
    const { cache, source, mem, db } = createAdapters<string>();
    const wa = new WriteAroundCache(cache, source);
    await wa.set('k', 'v');
    expect(db.get('k')).toBe('v');
    expect(mem.get('k')).toBe('v');
  });
});

describe('BatchWriteCache', () => {
  it('batches and flushes writes', async () => {
    const { cache, source, mem, db } = createAdapters<string>();
    const bw = new BatchWriteCache(cache, source, { maxBatchSize: 2 });
    await bw.set('a', '1');
    await bw.set('b', '2');
    expect(mem.get('a')).toBe('1');
    expect(db.get('a')).toBe('1');
    expect(db.get('b')).toBe('2');
  });
});
