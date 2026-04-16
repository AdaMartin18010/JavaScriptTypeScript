import { describe, it, expect } from 'vitest';
import { EdgeCache, GeoRouter, EdgeRuntime, EdgeABTesting } from './edge-runtime.js';

describe('EdgeCache', () => {
  it('stores and retrieves values', async () => {
    const cache = new EdgeCache();
    await cache.put('k1', 'v1', 60);
    expect(await cache.get('k1')).toBe('v1');
  });

  it('expires values', async () => {
    const cache = new EdgeCache();
    await cache.put('k1', 'v1', 0);
    await new Promise(r => setTimeout(r, 10));
    expect(await cache.get('k1')).toBeUndefined();
  });

  it('matches request and stores response', async () => {
    const cache = new EdgeCache();
    const req = { url: 'https://example.com/api', method: 'GET', headers: {} };
    await cache.putResponse(req, { status: 200, headers: {}, body: 'ok' }, 60);
    const hit = await cache.match(req);
    expect(hit?.status).toBe(200);
  });
});

describe('GeoRouter', () => {
  it('routes by country', async () => {
    const router = new GeoRouter();
    router.routeByCountry('CN', () => ({ status: 200, headers: {}, body: 'CN' }));
    const res = await router.route({ url: '', method: 'GET', headers: {}, cf: { colo: 'PEK', country: 'CN', city: 'Beijing', continent: 'AS', latitude: 0, longitude: 0, timezone: '' } });
    expect(res.body).toBe('CN');
  });

  it('falls back to default when no CF data', async () => {
    const router = new GeoRouter();
    const res = await router.route({ url: '', method: 'GET', headers: {} });
    expect(res.status).toBe(200);
    expect(res.body).toBe('Default edge response');
  });
});

describe('EdgeRuntime', () => {
  it('registers handler and fetches', async () => {
    const runtime = new EdgeRuntime();
    runtime.registerHandler('/api/hello', async () => ({ status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Hello' }));
    const res = await runtime.fetch({ url: 'https://example.com/api/hello', method: 'GET', headers: {} });
    expect(res.status).toBe(200);
    expect(res.body).toBe('Hello');
  });
});

describe('EdgeABTesting', () => {
  it('deterministically assigns variant', () => {
    const ab = new EdgeABTesting();
    ab.addExperiment('exp1', [{ name: 'a', weight: 50 }, { name: 'b', weight: 50 }]);
    const v1 = ab.assignVariant('exp1', 'user-1');
    const v2 = ab.assignVariant('exp1', 'user-1');
    expect(v1).toBe(v2);
    expect(['a', 'b']).toContain(v1);
  });
});
