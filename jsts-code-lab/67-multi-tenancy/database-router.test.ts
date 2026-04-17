import { describe, it, expect } from 'vitest'
import { TenantDatabaseRouter } from './database-router.js'

describe('database-router', () => {
  it('TenantDatabaseRouter is defined', () => {
    expect(typeof TenantDatabaseRouter).not.toBe('undefined');
  });

  it('throws when initialized with empty shards', () => {
    expect(() => new TenantDatabaseRouter([])).toThrow('At least one database shard is required');
  });

  it('routes tenant to a shard', () => {
    const router = new TenantDatabaseRouter([
      { id: 'shard-0', host: 'db0', port: 5432, database: 'app' },
      { id: 'shard-1', host: 'db1', port: 5432, database: 'app' }
    ]);

    const conn = router.route('tenant-1');
    expect(conn).toBeDefined();
    expect(conn.schema).toBe('tenant-1');
  });

  it('caches connections for same tenant', () => {
    const router = new TenantDatabaseRouter([
      { id: 'shard-0', host: 'db0', port: 5432, database: 'app' }
    ]);

    const conn1 = router.route('tenant-1');
    const conn2 = router.route('tenant-1');
    expect(conn1).toBe(conn2);
  });

  it('addRule routes matching tenants to specific shard', () => {
    const router = new TenantDatabaseRouter([
      { id: 'shard-0', host: 'db0', port: 5432, database: 'app' },
      { id: 'shard-1', host: 'db1', port: 5432, database: 'app' }
    ]);

    router.addRule({ tenantPattern: /^vip-/, targetShard: 1 });
    const conn = router.route('vip-customer');
    expect(conn.host).toBe('db1');
  });

  it('release removes cached connection', () => {
    const router = new TenantDatabaseRouter([
      { id: 'shard-0', host: 'db0', port: 5432, database: 'app' }
    ]);

    router.route('tenant-1');
    expect(router.getActiveConnectionCount()).toBe(1);
    expect(router.release('tenant-1')).toBe(true);
    expect(router.getActiveConnectionCount()).toBe(0);
  });

  it('clear removes all connections', () => {
    const router = new TenantDatabaseRouter([
      { id: 'shard-0', host: 'db0', port: 5432, database: 'app' }
    ]);

    router.route('tenant-1');
    router.route('tenant-2');
    router.clear();
    expect(router.getActiveConnectionCount()).toBe(0);
  });
});
