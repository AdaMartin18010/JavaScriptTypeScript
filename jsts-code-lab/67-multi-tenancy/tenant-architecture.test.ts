import { describe, it, expect } from 'vitest';
import { TenantManager, TenantIsolatedStore, QuotaManager, DatabaseRouter } from './tenant-architecture';

describe('TenantManager', () => {
  it('creates tenant with generated id', () => {
    const mgr = new TenantManager();
    const t = mgr.createTenant({ name: 'Acme', plan: 'pro', settings: {} });
    expect(t.id).toBeDefined();
    expect(t.plan).toBe('pro');
    expect(mgr.getTenant(t.id)).toEqual(t);
  });

  it('sets and clears context', () => {
    const mgr = new TenantManager();
    mgr.setContext('req1', { tenantId: 't1', permissions: ['read'] });
    expect(mgr.getContext('req1')?.tenantId).toBe('t1');
    mgr.clearContext('req1');
    expect(mgr.getContext('req1')).toBeUndefined();
  });
});

describe('TenantIsolatedStore', () => {
  it('isolates data per tenant', () => {
    const store = new TenantIsolatedStore<string>();
    store.set('t1', 'k', 'v1');
    store.set('t2', 'k', 'v2');
    expect(store.get('t1', 'k')).toBe('v1');
    expect(store.get('t2', 'k')).toBe('v2');
  });

  it('queries across tenants', () => {
    const store = new TenantIsolatedStore<number>();
    store.set('t1', 'k', 5);
    store.set('t2', 'k', 7);
    const results = store.queryAcrossTenants(v => (v as number) > 5);
    expect(results.length).toBe(1);
    expect(results[0].tenantId).toBe('t2');
  });
});

describe('QuotaManager', () => {
  it('checks quota and rate limit', () => {
    const mgr = new TenantManager();
    const tenant = mgr.createTenant({ name: 'Free', plan: 'free', settings: {} });
    const qm = new QuotaManager(mgr);
    expect(qm.checkQuota(tenant.id, 'maxUsers')).toBe(true);
    qm.incrementUsage(tenant.id, 'maxUsers', 5);
    expect(qm.checkQuota(tenant.id, 'maxUsers')).toBe(false);
    expect(qm.checkRateLimit(tenant.id)).toBe(true);
  });

  it('generates usage report', () => {
    const mgr = new TenantManager();
    const tenant = mgr.createTenant({ name: 'Pro', plan: 'pro', settings: {} });
    const qm = new QuotaManager(mgr);
    qm.incrementUsage(tenant.id, 'maxProjects', 3);
    const report = qm.getUsageReport(tenant.id);
    expect(report.maxProjects.used).toBe(3);
    expect(report.maxProjects.limit).toBe(10);
  });
});

describe('DatabaseRouter', () => {
  it('routes by schema strategy', () => {
    const router = new DatabaseRouter('schema');
    const conn = router.getConnection('t1');
    expect(conn.schema).toBe('t1');
  });

  it('routes by shard strategy deterministically', () => {
    const router = new DatabaseRouter('shard');
    const conn1 = router.getConnection('tenant-a');
    const conn2 = router.getConnection('tenant-a');
    expect(conn1.shard).toBe(conn2.shard);
  });
});
