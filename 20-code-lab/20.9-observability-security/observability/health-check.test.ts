import { describe, it, expect } from 'vitest';
import {
  HealthStatus,
  MemoryHealthCheck,
  DiskHealthCheck,
  DependencyHealthCheck,
  CustomHealthCheck,
  HealthRegistry,
  HealthFormatter
} from './health-check.js';

describe('MemoryHealthCheck', () => {
  it('returns a health check result', () => {
    const check = new MemoryHealthCheck('memory', 90);
    const result = check.check();
    expect(result.name).toBe('memory');
    expect(Object.values(HealthStatus)).toContain(result.status);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeGreaterThan(0);
  });
});

describe('DiskHealthCheck', () => {
  it('returns a health check result', () => {
    const check = new DiskHealthCheck('disk', 90);
    const result = check.check();
    expect(result.name).toBe('disk');
    expect(Object.values(HealthStatus)).toContain(result.status);
  });
});

describe('DependencyHealthCheck', () => {
  it('returns healthy when check passes', async () => {
    const check = new DependencyHealthCheck('db', () => true, 1000);
    const result = await check.check();
    expect(result.status).toBe(HealthStatus.HEALTHY);
  });

  it('returns unhealthy when check fails', async () => {
    const check = new DependencyHealthCheck('db', () => false, 1000);
    const result = await check.check();
    expect(result.status).toBe(HealthStatus.UNHEALTHY);
  });

  it('returns unhealthy on timeout', async () => {
    const check = new DependencyHealthCheck('db', () => new Promise(() => {}), 10);
    const result = await check.check();
    expect(result.status).toBe(HealthStatus.UNHEALTHY);
    expect(result.message).toContain('timed out');
  });
});

describe('CustomHealthCheck', () => {
  it('executes custom function', () => {
    const check = new CustomHealthCheck('custom', () => ({
      name: 'custom', status: HealthStatus.HEALTHY, durationMs: 0, timestamp: Date.now()
    }));
    const result = check.check();
    expect(result.status).toBe(HealthStatus.HEALTHY);
  });
});

describe('HealthRegistry', () => {
  it('runs liveness checks', async () => {
    const registry = new HealthRegistry();
    registry.registerLiveness(new CustomHealthCheck('live', () => ({
      name: 'live', status: HealthStatus.HEALTHY, durationMs: 0, timestamp: Date.now()
    })));
    const result = await registry.checkLiveness();
    expect(result.status).toBe(HealthStatus.HEALTHY);
    expect(result.checks.length).toBe(1);
  });

  it('aggregates degraded status', async () => {
    const registry = new HealthRegistry();
    registry.registerReadiness(new CustomHealthCheck('a', () => ({
      name: 'a', status: HealthStatus.HEALTHY, durationMs: 0, timestamp: Date.now()
    })));
    registry.registerReadiness(new CustomHealthCheck('b', () => ({
      name: 'b', status: HealthStatus.DEGRADED, durationMs: 0, timestamp: Date.now()
    })));
    const result = await registry.checkReadiness();
    expect(result.status).toBe(HealthStatus.DEGRADED);
  });

  it('aggregates unhealthy status', async () => {
    const registry = new HealthRegistry();
    registry.registerReadiness(new CustomHealthCheck('a', () => ({
      name: 'a', status: HealthStatus.HEALTHY, durationMs: 0, timestamp: Date.now()
    })));
    registry.registerReadiness(new CustomHealthCheck('b', () => ({
      name: 'b', status: HealthStatus.UNHEALTHY, durationMs: 0, timestamp: Date.now()
    })));
    const result = await registry.checkReadiness();
    expect(result.status).toBe(HealthStatus.UNHEALTHY);
  });

  it('runs all check types', async () => {
    const registry = new HealthRegistry();
    registry.registerLiveness(new CustomHealthCheck('live', () => ({
      name: 'live', status: HealthStatus.HEALTHY, durationMs: 0, timestamp: Date.now()
    })));
    const all = await registry.checkAll();
    expect(all.liveness).toBeDefined();
    expect(all.readiness).toBeDefined();
    expect(all.startup).toBeDefined();
  });
});

describe('HealthFormatter', () => {
  it('formats healthy as HTTP 200', () => {
    const health = {
      status: HealthStatus.HEALTHY,
      checks: [],
      totalDurationMs: 10,
      timestamp: Date.now()
    };
    const response = HealthFormatter.toHttpResponse(health);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('formats unhealthy as HTTP 503', () => {
    const health = {
      status: HealthStatus.UNHEALTHY,
      checks: [],
      totalDurationMs: 10,
      timestamp: Date.now()
    };
    const response = HealthFormatter.toHttpResponse(health);
    expect(response.statusCode).toBe(503);
  });

  it('formats degraded as HTTP 200', () => {
    const health = {
      status: HealthStatus.DEGRADED,
      checks: [],
      totalDurationMs: 10,
      timestamp: Date.now()
    };
    const response = HealthFormatter.toHttpResponse(health);
    expect(response.statusCode).toBe(200);
  });

  it('formats to prometheus metrics', () => {
    const health = {
      status: HealthStatus.HEALTHY,
      checks: [{ name: 'db', status: HealthStatus.HEALTHY, durationMs: 5, timestamp: Date.now() }],
      totalDurationMs: 10,
      timestamp: Date.now()
    };
    const prom = HealthFormatter.toPrometheusFormat(health);
    expect(prom).toContain('health_check_status');
    expect(prom).toContain('db');
  });
});
