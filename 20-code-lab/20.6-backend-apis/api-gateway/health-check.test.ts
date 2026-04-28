import { describe, it, expect } from 'vitest';
import { HealthChecker, ServiceHealthMonitor } from './health-check.js';

describe('HealthChecker', () => {
  it('registers checks', () => {
    const checker = new HealthChecker();
    checker.register({ name: 'db', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    expect(checker.getResult('db')).toBeUndefined();
  });

  it('runs check and stores result', async () => {
    const checker = new HealthChecker();
    const result = await checker.runCheck({
      name: 'db',
      interval: 1000,
      timeout: 500,
      retries: 1,
      check: () => {}
    });
    expect(result.name).toBe('db');
    expect(result.status).toBe('pass');
    expect(checker.getResult('db')).toBeDefined();
  });

  it('marks failed check correctly', async () => {
    const checker = new HealthChecker();
    const result = await checker.runCheck({
      name: 'db',
      interval: 1000,
      timeout: 10,
      retries: 1,
      check: () => new Promise((_, reject) => setTimeout(reject, 100))
    });
    expect(result.status).toBe('fail');
    expect(result.message).toBeDefined();
  });

  it('returns healthy status when all pass', async () => {
    const checker = new HealthChecker();
    await checker.runCheck({ name: 'a', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    await checker.runCheck({ name: 'b', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    const status = checker.getStatus();
    expect(status.status).toBe('healthy');
    expect(status.checks).toHaveLength(2);
  });

  it('returns unhealthy when any check fails', async () => {
    const checker = new HealthChecker();
    await checker.runCheck({ name: 'a', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    await checker.runCheck({
      name: 'b',
      interval: 1000,
      timeout: 10,
      retries: 1,
      check: () => { throw new Error('fail'); }
    });
    const status = checker.getStatus();
    expect(status.status).toBe('unhealthy');
  });

  it('reports ready when all checks pass', async () => {
    const checker = new HealthChecker();
    await checker.runCheck({ name: 'a', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    expect(checker.isReady()).toBe(true);
  });

  it('reports not ready when no checks exist', () => {
    const checker = new HealthChecker();
    expect(checker.isReady()).toBe(false);
  });

  it('reports alive when no critical failures', async () => {
    const checker = new HealthChecker();
    await checker.runCheck({ name: 'a', interval: 1000, timeout: 500, retries: 1, check: () => {} });
    expect(checker.isAlive()).toBe(true);
  });
});

describe('ServiceHealthMonitor', () => {
  it('registers services', () => {
    const monitor = new ServiceHealthMonitor();
    monitor.register('svc-a', 'http://a:8080');
    expect(monitor.getAllServices()).toHaveLength(1);
  });

  it('marks service healthy on success', () => {
    const monitor = new ServiceHealthMonitor();
    monitor.register('svc-a', 'http://a:8080');
    monitor.updateHealth('svc-a', true, 50);
    expect(monitor.isHealthy('svc-a')).toBe(true);
    expect(monitor.getHealthyServices()).toHaveLength(1);
  });

  it('marks service unhealthy after threshold failures', () => {
    const monitor = new ServiceHealthMonitor({ failureThreshold: 2 });
    monitor.register('svc-a', 'http://a:8080');
    monitor.updateHealth('svc-a', false, 0);
    expect(monitor.isHealthy('svc-a')).toBe(false);
    monitor.updateHealth('svc-a', false, 0);
    expect(monitor.getUnhealthyServices()).toHaveLength(1);
  });

  it('resets failures on success', () => {
    const monitor = new ServiceHealthMonitor({ failureThreshold: 2 });
    monitor.register('svc-a', 'http://a:8080');
    monitor.updateHealth('svc-a', false, 0);
    monitor.updateHealth('svc-a', true, 50);
    expect(monitor.isHealthy('svc-a')).toBe(true);
  });
});
