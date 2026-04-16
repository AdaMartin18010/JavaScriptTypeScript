import { describe, it, expect, vi } from 'vitest';
import {
  TreeTypeFactory,
  Forest,
  CharacterStyleFactory,
  ConnectionPool,
  DatabaseConnection
} from './flyweight.js';

describe('flyweight pattern', () => {
  it('TreeTypeFactory should share tree types across trees', () => {
    // Clear the static map for a clean test
    (TreeTypeFactory as unknown as { types: Map<string, unknown> }).types = new Map();

    const forest = new Forest();
    forest.plantTree(1, 1, 'Oak', 'Green', 'Rough');
    forest.plantTree(2, 2, 'Oak', 'Green', 'Rough');
    forest.plantTree(3, 3, 'Pine', 'Dark Green', 'Smooth');

    expect(forest.getTreeCount()).toBe(3);
    expect(forest.getTypeCount()).toBe(2);
  });

  it('CharacterStyleFactory should reuse styles', () => {
    const style1 = CharacterStyleFactory.getStyle('Arial', 12, 'black');
    const style2 = CharacterStyleFactory.getStyle('Arial', 12, 'black');
    const style3 = CharacterStyleFactory.getStyle('Arial', 14, 'black');

    expect(style1).toBe(style2);
    expect(style1).not.toBe(style3);
  });

  it('ConnectionPool should reuse released connections', () => {
    const pool = new ConnectionPool(2);
    const conn1 = pool.acquire();
    const conn2 = pool.acquire();

    expect(conn1).not.toBe(conn2);

    pool.release(conn1);
    const conn3 = pool.acquire();
    expect(conn1).toBe(conn3);
  });

  it('ConnectionPool should throw when exhausted', () => {
    const pool = new ConnectionPool(1);
    pool.acquire();
    expect(() => pool.acquire()).toThrow('Connection pool exhausted');
  });

  it('DatabaseConnection should only allow queries when acquired', () => {
    const conn = new DatabaseConnection(1);
    expect(() => conn.query('SELECT 1')).toThrow('Connection not acquired');

    conn.acquire();
    expect(() => conn.query('SELECT 1')).not.toThrow();
  });

  it('DatabaseConnection should track in-use status', () => {
    const conn = new DatabaseConnection(1);
    expect(conn.isInUse()).toBe(false);

    conn.acquire();
    expect(conn.isInUse()).toBe(true);

    conn.release();
    expect(conn.isInUse()).toBe(false);
  });
});
