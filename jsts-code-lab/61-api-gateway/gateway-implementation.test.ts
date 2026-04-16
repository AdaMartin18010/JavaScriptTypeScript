import { describe, it, expect, vi } from 'vitest';
import { GatewayRouter, RateLimiter, CircuitBreaker, APIGateway } from './gateway-implementation';

describe('GatewayRouter', () => {
  it('matches static path and method', () => {
    const router = new GatewayRouter();
    router.addRoute({ path: '/api/users', methods: ['GET'], target: 'users' });
    const req = { id: '1', path: '/api/users', method: 'GET', headers: {}, timestamp: 0 };
    expect(router.match(req)?.target).toBe('users');
  });

  it('matches wildcard methods', () => {
    const router = new GatewayRouter();
    router.addRoute({ path: '/api/users', methods: ['*'], target: 'users' });
    expect(router.match({ id: '1', path: '/api/users', method: 'DELETE', headers: {}, timestamp: 0 })?.target).toBe('users');
  });

  it('extracts path parameters', () => {
    const router = new GatewayRouter();
    const params = router.extractParams('/api/users/123', '/api/users/:id');
    expect(params.id).toBe('123');
  });
});

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter(60000, 2);
    expect(limiter.isAllowed('c1').allowed).toBe(true);
    expect(limiter.isAllowed('c1').allowed).toBe(true);
    expect(limiter.isAllowed('c1').allowed).toBe(false);
  });

  it('resets after window passes', () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter(1000, 1);
    expect(limiter.isAllowed('c1').allowed).toBe(true);
    expect(limiter.isAllowed('c1').allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter.isAllowed('c1').allowed).toBe(true);
    vi.useRealTimers();
  });
});

describe('CircuitBreaker', () => {
  it('opens after threshold failures', async () => {
    const cb = new CircuitBreaker(2, 30000);
    await expect(cb.execute('svc', async () => { throw new Error('fail'); })).rejects.toThrow('fail');
    await expect(cb.execute('svc', async () => { throw new Error('fail'); })).rejects.toThrow('fail');
    await expect(cb.execute('svc', async () => 'ok')).rejects.toThrow('OPEN');
  });

  it('closes after success in half-open', async () => {
    vi.useFakeTimers();
    const cb = new CircuitBreaker(1, 1000);
    await expect(cb.execute('svc', async () => { throw new Error('fail'); })).rejects.toThrow('fail');
    vi.advanceTimersByTime(1001);
    const result = await cb.execute('svc', async () => 'ok');
    expect(result).toBe('ok');
    vi.useRealTimers();
  });
});

describe('APIGateway', () => {
  it('returns 429 when rate limited', async () => {
    const gw = new APIGateway();
    gw.route({ path: '/api', methods: ['GET'], target: 'svc' });
    const req = { id: '1', path: '/api', method: 'GET', headers: { 'x-client-id': 'c1' }, timestamp: 0 };
    for (let i = 0; i < 100; i++) {
      await gw.handle(req);
    }
    const res = await gw.handle(req);
    expect(res.status).toBe(429);
  });

  it('returns 404 for unmatched route', async () => {
    const gw = new APIGateway();
    const res = await gw.handle({ id: '1', path: '/none', method: 'GET', headers: {}, timestamp: 0 });
    expect(res.status).toBe(404);
  });
});
