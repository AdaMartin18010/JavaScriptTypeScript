import { describe, it, expect } from 'vitest'
import { ResourceQuotaLimiter } from './resource-quota.js'

describe('resource-quota', () => {
  it('ResourceQuotaLimiter is defined', () => {
    expect(typeof ResourceQuotaLimiter).not.toBe('undefined');
  });

  it('checkRateLimit allows requests within quota', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', { maxRequestsPerMinute: 5 });
    const result = limiter.checkRateLimit('tenant-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('consumeResource allows consumption within limit', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', { maxUsers: 3 });
    const result = limiter.consumeResource('tenant-1', 'maxUsers', 2);
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(2);
  });

  it('consumeResource rejects over limit', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', { maxUsers: 1 });
    limiter.consumeResource('tenant-1', 'maxUsers', 1);
    const result = limiter.consumeResource('tenant-1', 'maxUsers', 1);
    expect(result.allowed).toBe(false);
  });

  it('releaseResource decreases usage', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', { maxUsers: 5 });
    limiter.consumeResource('tenant-1', 'maxUsers', 3);
    limiter.releaseResource('tenant-1', 'maxUsers', 1);
    const report = limiter.getUsageReport('tenant-1');
    expect(report.maxUsers.used).toBe(2);
  });

  it('getUsageReport returns all resources', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', {
      maxRequestsPerMinute: 100,
      maxStorageBytes: 1024,
      maxUsers: 10,
      maxProjects: 5
    });
    const report = limiter.getUsageReport('tenant-1');
    expect(Object.keys(report).length).toBe(4);
    expect(report.maxUsers.percentage).toBe(0);
  });

  it('setQuota updates partial values', () => {
    const limiter = new ResourceQuotaLimiter();
    limiter.setQuota('tenant-1', { maxUsers: 10 });
    limiter.setQuota('tenant-1', { maxProjects: 20 });
    const report = limiter.getUsageReport('tenant-1');
    expect(report.maxUsers.limit).toBe(10);
    expect(report.maxProjects.limit).toBe(20);
  });
});
