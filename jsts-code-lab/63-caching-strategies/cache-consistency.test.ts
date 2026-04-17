import { describe, it, expect } from 'vitest';
import { CacheConsistencyCoordinator, VersionedCache } from './cache-consistency.js';

describe('CacheConsistencyCoordinator', () => {
  it('registers nodes', () => {
    const coordinator = new CacheConsistencyCoordinator();
    const node = { id: 'a', get: async () => null, set: async () => {}, delete: async () => {} };
    coordinator.registerNode(node);
    expect(() => coordinator.invalidateAfterWrite('a', 'key', async () => {})).not.toThrow();
  });

  it('broadcasts invalidation messages', () => {
    const coordinator = new CacheConsistencyCoordinator();
    const messages: Array<{ key: string; type: string }> = [];

    coordinator.subscribe(msg => messages.push(msg));
    coordinator.broadcast({
      type: 'invalidate',
      key: 'test',
      sourceNode: 'a',
      timestamp: Date.now()
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].key).toBe('test');
  });

  it('handles invalidation by deleting key', async () => {
    const coordinator = new CacheConsistencyCoordinator();
    const data = new Map<string, string>();
    data.set('key', 'value');

    const node = {
      id: 'b',
      get: async (k: string) => data.get(k) ?? null,
      set: async () => {},
      delete: async (k: string) => data.delete(k)
    };

    coordinator.registerNode(node);
    await coordinator.handleInvalidation('b', {
      type: 'invalidate',
      key: 'key',
      sourceNode: 'a',
      timestamp: Date.now()
    });

    expect(data.has('key')).toBe(false);
  });

  it('ignores own messages', async () => {
    const coordinator = new CacheConsistencyCoordinator();
    const data = new Map<string, string>();
    data.set('key', 'value');

    const node = {
      id: 'a',
      get: async (k: string) => data.get(k) ?? null,
      set: async () => {},
      delete: async (k: string) => data.delete(k)
    };

    coordinator.registerNode(node);
    await coordinator.handleInvalidation('a', {
      type: 'invalidate',
      key: 'key',
      sourceNode: 'a',
      timestamp: Date.now()
    });

    expect(data.has('key')).toBe(true);
  });

  it('handles update messages', async () => {
    const coordinator = new CacheConsistencyCoordinator();
    const data = new Map<string, string>();

    const node = {
      id: 'b',
      get: async (k: string) => data.get(k) ?? null,
      set: async (k: string, v: string) => data.set(k, v),
      delete: async () => {}
    };

    coordinator.registerNode(node);
    await coordinator.handleInvalidation('b', {
      type: 'update',
      key: 'key',
      value: 'updated',
      sourceNode: 'a',
      timestamp: Date.now()
    });

    expect(data.get('key')).toBe('updated');
  });

  it('performs delayed double delete', async () => {
    const coordinator = new CacheConsistencyCoordinator();
    const data = new Map<string, string>();
    data.set('key', 'value');

    const node = {
      id: 'a',
      get: async (k: string) => data.get(k) ?? null,
      set: async () => {},
      delete: async (k: string) => data.delete(k)
    };

    coordinator.registerNode(node);
    await coordinator.delayedDoubleDelete('a', 'key', async () => {}, 10);
    expect(data.has('key')).toBe(false);
  });
});

describe('VersionedCache', () => {
  it('increments version on set', () => {
    const cache = new VersionedCache();
    const v1 = cache.set('key', 'a');
    const v2 = cache.set('key', 'b');
    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);
  });

  it('merges higher version', () => {
    const cache = new VersionedCache();
    cache.set('key', 'local');
    const merged = cache.merge('key', { value: 'remote', version: 5, timestamp: Date.now() });
    expect(merged).toBe(true);
    expect(cache.get('key')?.value).toBe('remote');
  });

  it('rejects lower version merge', () => {
    const cache = new VersionedCache();
    cache.set('key', 'local');
    const merged = cache.merge('key', { value: 'old', version: 0, timestamp: Date.now() });
    expect(merged).toBe(false);
    expect(cache.get('key')?.value).toBe('local');
  });

  it('accepts merge for new key', () => {
    const cache = new VersionedCache();
    const merged = cache.merge('new', { value: 'val', version: 1, timestamp: Date.now() });
    expect(merged).toBe(true);
  });

  it('deletes entries', () => {
    const cache = new VersionedCache();
    cache.set('key', 'val');
    expect(cache.delete('key')).toBe(true);
    expect(cache.get('key')).toBeUndefined();
  });
});
