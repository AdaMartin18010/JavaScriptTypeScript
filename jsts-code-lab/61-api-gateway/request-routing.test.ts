import { describe, it, expect } from 'vitest';
import { PathMatcher, Router, DynamicRouter, authMiddleware } from './request-routing';

describe('PathMatcher', () => {
  it('converts static pattern to regex', () => {
    const { regex, params } = PathMatcher.patternToRegex('/users/:id');
    expect(regex.test('/users/123')).toBe(true);
    expect(params).toEqual(['id']);
  });

  it('matches wildcard patterns', () => {
    const result = PathMatcher.match('/files/*', '/files/a/b.txt');
    expect(result.matched).toBe(true);
    expect(result.params?.wildcard).toBe('a/b.txt');
  });

  it('isStatic returns true for no params', () => {
    expect(PathMatcher.isStatic('/health')).toBe(true);
    expect(PathMatcher.isStatic('/users/:id')).toBe(false);
  });
});

describe('Router', () => {
  it('matches static route quickly', () => {
    const router = new Router();
    router.get('/health', () => ({ status: 200, headers: {}, body: 'ok' }));
    const match = router.match({ id: '1', method: 'GET', path: '/health', headers: {}, query: {}, timestamp: 0 });
    expect(match).not.toBeNull();
    expect(match!.route.pattern).toBe('/health');
  });

  it('matches dynamic route and extracts params', async () => {
    const router = new Router();
    router.get('/users/:id', (req) => ({ status: 200, headers: {}, body: (req as any).params.id }));
    const res = await router.execute({ id: '1', method: 'GET', path: '/users/42', headers: {}, query: {}, timestamp: 0 });
    expect(res.status).toBe(200);
    expect((res.body as any)).toBe('42');
  });

  it('groups routes under prefix', () => {
    const router = new Router();
    router.group('/api', api => {
      api.get('/status', () => ({ status: 200, headers: {}, body: null }));
    });
    const match = router.match({ id: '1', method: 'GET', path: '/api/status', headers: {}, query: {}, timestamp: 0 });
    expect(match).not.toBeNull();
  });

  it('returns 404 when no route matches', async () => {
    const router = new Router();
    const res = await router.execute({ id: '1', method: 'GET', path: '/none', headers: {}, query: {}, timestamp: 0 });
    expect(res.status).toBe(404);
  });
});

describe('DynamicRouter', () => {
  it('resolves to a healthy endpoint', () => {
    const dr = new DynamicRouter();
    dr.bindRoute('/api/users', 'user-svc');
    dr.registerService('user-svc', { serviceId: 'user-svc', host: 'localhost', port: 8080, health: 'healthy' });
    const ep = dr.resolve({ id: '1', method: 'GET', path: '/api/users', headers: {}, query: {}, timestamp: 0 });
    expect(ep?.host).toBe('localhost');
  });

  it('returns null when no healthy endpoints', () => {
    const dr = new DynamicRouter();
    dr.bindRoute('/api/users', 'user-svc');
    dr.registerService('user-svc', { serviceId: 'user-svc', host: 'localhost', port: 8080, health: 'unhealthy' });
    const ep = dr.resolve({ id: '1', method: 'GET', path: '/api/users', headers: {}, query: {}, timestamp: 0 });
    expect(ep).toBeNull();
  });
});

describe('authMiddleware', () => {
  it('rejects missing authorization', async () => {
    const middleware = authMiddleware(() => true);
    const next = async () => ({ status: 200, headers: {}, body: null });
    const res = await middleware({ id: '1', method: 'GET', path: '/', headers: {}, query: {}, timestamp: 0 }, { status: 200, headers: {}, body: null }, next);
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const middleware = authMiddleware(() => false);
    const next = async () => ({ status: 200, headers: {}, body: null });
    const res = await middleware({ id: '1', method: 'GET', path: '/', headers: { authorization: 'Bearer bad' }, query: {}, timestamp: 0 }, { status: 200, headers: {}, body: null }, next);
    expect(res.status).toBe(401);
  });
});
