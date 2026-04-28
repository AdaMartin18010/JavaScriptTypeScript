import { describe, it, expect, vi } from 'vitest';
import { CacheKeyGenerator, ResponseCache, CachePolicyEngine, EdgeCacheManager, CacheMiddleware } from './caching-layer.js';

describe('CacheKeyGenerator', () => {
  it('normalizes query param order', () => {
    const gen = new CacheKeyGenerator();
    const a = gen.generate({ method: 'GET', path: '/api', query: { b: '2', a: '1' } });
    const b = gen.generate({ method: 'GET', path: '/api', query: { a: '1', b: '2' } });
    expect(a).toBe(b);
  });
});

describe('ResponseCache', () => {
  it('stores and retrieves cached response', () => {
    const cache = new ResponseCache();
    const resp = { status: 200, headers: {}, body: 'ok' };
    cache.set('k1', resp, { ttl: 60 });
    expect(cache.get('k1')?.body).toBe('ok');
    expect(cache.has('k1')).toBe(true);
    cache.stopCleanup();
  });

  it('expires entries after ttl', () => {
    vi.useFakeTimers();
    const cache = new ResponseCache();
    cache.set('k1', { status: 200, headers: {}, body: 'ok' }, { ttl: 1 });
    vi.advanceTimersByTime(1100);
    expect(cache.get('k1')).toBeNull();
    cache.stopCleanup();
    vi.useRealTimers();
  });

  it('evicts lru when max size reached', () => {
    const cache = new ResponseCache({ maxSize: 2 });
    cache.set('a', { status: 200, headers: {}, body: 'a' }, { ttl: 60 });
    cache.set('b', { status: 200, headers: {}, body: 'b' }, { ttl: 60 });
    cache.set('c', { status: 200, headers: {}, body: 'c' }, { ttl: 60 });
    expect(cache.getStats().size).toBe(2);
    cache.stopCleanup();
  });

  it('invalidates by tag', () => {
    const cache = new ResponseCache();
    cache.set('a', { status: 200, headers: {}, body: 'a' }, { ttl: 60, tags: ['t1'] });
    cache.set('b', { status: 200, headers: {}, body: 'b' }, { ttl: 60, tags: ['t1'] });
    expect(cache.invalidateByTag('t1')).toBe(2);
    cache.stopCleanup();
  });
});

describe('CachePolicyEngine', () => {
  it('returns null for non-GET', () => {
    const engine = new CachePolicyEngine();
    expect(engine.getPolicy('POST', '/api')).toBeNull();
  });

  it('matches path policy', () => {
    const engine = new CachePolicyEngine();
    engine.addPathPolicy(/^\/static/, { ttl: 3600 });
    expect(engine.getPolicy('GET', '/static/img.png')?.ttl).toBe(3600);
  });

  it('shouldCache respects no-store', () => {
    const engine = new CachePolicyEngine();
    expect(engine.shouldCache(
      { method: 'GET', headers: {} },
      { status: 200, headers: { 'cache-control': 'no-store' } }
    )).toBe(false);
  });
});

describe('EdgeCacheManager', () => {
  it('registers edges and invalidates globally', () => {
    const manager = new EdgeCacheManager();
    const cache = new ResponseCache();
    manager.registerEdge('e1', cache);
    cache.set('a', { status: 200, headers: {}, body: 'a' }, { ttl: 60, tags: ['t1'] });
    const result = manager.invalidateGlobal('t1');
    expect(result[0].count).toBe(1);
  });
});
