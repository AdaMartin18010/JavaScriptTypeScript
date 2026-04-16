import { describe, it, expect } from 'vitest';
import { ServiceRegistry, CircuitBreaker, RetryPolicy, LoadBalancer, ServiceProxy } from './service-mesh';

describe('ServiceRegistry', () => {
  it('registers and discovers healthy instances', () => {
    const registry = new ServiceRegistry();
    registry.register({ id: 's1', name: 'svc', host: 'h', port: 80, metadata: {}, health: 'healthy', lastHeartbeat: Date.now() });
    expect(registry.discover('svc').length).toBe(1);
    registry.deregister('svc', 's1');
    expect(registry.discover('svc').length).toBe(0);
    registry.destroy();
  });
});

describe('CircuitBreaker', () => {
  it('opens after failures and recovers', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 2, successThreshold: 1, resetTimeout: 10 });
    const fail = () => { throw new Error('oops'); };
    await expect(cb.execute(fail)).rejects.toThrow('oops');
    await expect(cb.execute(fail)).rejects.toThrow('oops');
    await expect(cb.execute(fail)).rejects.toThrow('OPEN');
    // wait for reset timeout
    await new Promise(r => setTimeout(r, 20));
    // half-open, one success closes
    expect(await cb.execute(async () => 'ok')).toBe('ok');
    expect(cb.getState()).toBe('CLOSED');
  });
});

describe('RetryPolicy', () => {
  it('retries on retryable errors', async () => {
    const rp = new RetryPolicy({ maxAttempts: 3, delay: 1, backoff: 'fixed', retryableErrors: ['ECONNRESET'] });
    let calls = 0;
    const fn = () => { calls++; throw new Error('ECONNRESET'); };
    await expect(rp.execute(fn)).rejects.toThrow('ECONNRESET');
    expect(calls).toBe(3);
  });

  it('does not retry non-retryable errors', async () => {
    const rp = new RetryPolicy({ maxAttempts: 3, delay: 1 });
    let calls = 0;
    const fn = () => { calls++; throw new Error('OTHER'); };
    await expect(rp.execute(fn)).rejects.toThrow('OTHER');
    expect(calls).toBe(1);
  });
});

describe('LoadBalancer', () => {
  const instances = [
    { id: 'a', name: 'svc', host: 'h', port: 80, metadata: {}, health: 'healthy', lastHeartbeat: 0 },
    { id: 'b', name: 'svc', host: 'h', port: 81, metadata: {}, health: 'healthy', lastHeartbeat: 0 }
  ] as any;

  it('round-robin cycles', () => {
    const lb = new LoadBalancer('round-robin');
    expect(lb.select(instances)!.id).toBe('a');
    expect(lb.select(instances)!.id).toBe('b');
    expect(lb.select(instances)!.id).toBe('a');
  });

  it('random returns an instance', () => {
    const lb = new LoadBalancer('random');
    expect(['a', 'b']).toContain(lb.select(instances)!.id);
  });
});

describe('ServiceProxy', () => {
  it('calls service through proxy', async () => {
    const registry = new ServiceRegistry();
    registry.register({ id: 'a', name: 'svc', host: 'localhost', port: 80, metadata: {}, health: 'healthy', lastHeartbeat: Date.now() });
    const proxy = new ServiceProxy(registry);
    const res = await proxy.call('svc', '/test');
    expect((res as any).success).toBe(true);
  });
});
