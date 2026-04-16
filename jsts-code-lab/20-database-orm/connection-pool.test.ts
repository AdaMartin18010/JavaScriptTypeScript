import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ConnectionPool,
  MockConnectionFactory,
  DefaultPoolConfig,
} from './connection-pool.js';
import type { PooledConnection, ConnectionFactory, PoolConfig } from './connection-pool.js';

describe('ConnectionPool', () => {
  let factory: ConnectionFactory;
  let pool: ConnectionPool;

  beforeEach(() => {
    factory = new MockConnectionFactory();
    pool = new ConnectionPool(factory, {
      minConnections: 2,
      maxConnections: 5,
      acquireTimeout: 500,
      healthCheckInterval: 1000,
    });
  });

  it('should initialize with minimum connections', async () => {
    await pool.initialize();
    const stats = pool.getStats();
    expect(stats.totalConnections).toBe(2);
  });

  it('should acquire and release connections', async () => {
    await pool.initialize();
    const conn = await pool.acquire();
    expect(conn.isInUse).toBe(true);

    await pool.release(conn);
    const stats = pool.getStats();
    expect(stats.idleConnections).toBe(2);
  });

  it('should reuse released connections', async () => {
    await pool.initialize();
    const conn1 = await pool.acquire();
    await pool.release(conn1);
    const conn2 = await pool.acquire();
    expect(conn1.id).toBe(conn2.id);
  });

  it('should create new connections up to max', async () => {
    await pool.initialize();
    const conns: PooledConnection[] = [];
    for (let i = 0; i < 5; i++) {
      conns.push(await pool.acquire());
    }
    const stats = pool.getStats();
    expect(stats.totalConnections).toBe(5);
  });

  it('should queue acquisition when max reached', async () => {
    await pool.initialize();
    const conns: PooledConnection[] = [];
    for (let i = 0; i < 5; i++) {
      conns.push(await pool.acquire());
    }

    const pending = pool.acquire();
    const stats = pool.getStats();
    expect(stats.waitingRequests).toBe(1);

    // Release one to unblock pending
    await pool.release(conns[0]);
    const conn = await pending;
    expect(conn).toBeDefined();
  });

  it('should timeout queued acquisitions', async () => {
    pool = new ConnectionPool(factory, {
      minConnections: 1,
      maxConnections: 1,
      acquireTimeout: 50,
      healthCheckInterval: 1000,
    });
    await pool.initialize();
    await pool.acquire(); // hold the only connection

    await expect(pool.acquire()).rejects.toThrow('Connection acquisition timeout');
  });

  it('should reject acquisition when shutting down', async () => {
    await pool.initialize();
    await pool.shutdown();
    await expect(pool.acquire()).rejects.toThrow('Pool is shutting down');
  });

  it('should shutdown and destroy all connections', async () => {
    await pool.initialize();
    await pool.shutdown();
    const stats = pool.getStats();
    expect(stats.totalConnections).toBe(0);
  });

  it('should clear and reset pool', async () => {
    await pool.initialize();
    await pool.clear();
    const stats = pool.getStats();
    expect(stats.totalConnections).toBe(0);
    expect(stats.totalCreated).toBe(0);
  });

  it('should throw when releasing unknown connection', async () => {
    await pool.initialize();
    const fakeConn = { id: 'fake', createdAt: new Date(), lastUsedAt: new Date(), useCount: 0, isHealthy: true, isInUse: false, metadata: { host: '', database: '' } };
    await expect(pool.release(fakeConn as PooledConnection)).rejects.toThrow('Connection not found');
  });
});

describe('MockConnectionFactory', () => {
  it('should create connections with unique IDs', async () => {
    const factory = new MockConnectionFactory();
    const conn1 = await factory.create();
    const conn2 = await factory.create();
    expect(conn1.id).not.toBe(conn2.id);
  });

  it('should validate connection health', async () => {
    const factory = new MockConnectionFactory();
    const conn = await factory.create();
    expect(await factory.validate(conn)).toBe(true);
    conn.isHealthy = false;
    expect(await factory.validate(conn)).toBe(false);
  });
});

describe('DefaultPoolConfig', () => {
  it('should have sensible defaults', () => {
    expect(DefaultPoolConfig.minConnections).toBe(5);
    expect(DefaultPoolConfig.maxConnections).toBe(20);
    expect(DefaultPoolConfig.acquireTimeout).toBe(30000);
  });
});
