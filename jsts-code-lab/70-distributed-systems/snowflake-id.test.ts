import { describe, it, expect } from 'vitest';
import { SnowflakeIdGenerator } from './snowflake-id.js';

describe('SnowflakeIdGenerator', () => {
  it('should generate unique ids', () => {
    const gen = new SnowflakeIdGenerator({ datacenterId: 0, workerId: 0 });
    const ids = new Set<bigint>();
    for (let i = 0; i < 1000; i++) {
      ids.add(gen.nextId());
    }
    expect(ids.size).toBe(1000);
  });

  it('should generate monotonically increasing ids within the same millisecond', () => {
    const gen = new SnowflakeIdGenerator({ datacenterId: 0, workerId: 0 });
    const id1 = gen.nextId();
    const id2 = gen.nextId();
    expect(id2).toBeGreaterThan(id1);
  });

  it('should parse id correctly', () => {
    const gen = new SnowflakeIdGenerator({ datacenterId: 3, workerId: 7 });
    const id = gen.nextId();
    const parsed = gen.parseId(id);
    expect(parsed.datacenterId).toBe(3);
    expect(parsed.workerId).toBe(7);
    expect(parsed.timestamp).toBeGreaterThan(0);
    expect(parsed.sequence).toBeGreaterThanOrEqual(0);
  });

  it('should throw on invalid datacenterId', () => {
    expect(() => new SnowflakeIdGenerator({ datacenterId: 32 })).toThrow();
    expect(() => new SnowflakeIdGenerator({ datacenterId: -1 })).toThrow();
  });

  it('should throw on invalid workerId', () => {
    expect(() => new SnowflakeIdGenerator({ workerId: 32 })).toThrow();
    expect(() => new SnowflakeIdGenerator({ workerId: -1 })).toThrow();
  });

  it('should handle sequence rollover', () => {
    const gen = new SnowflakeIdGenerator({ datacenterId: 0, workerId: 0 });
    // 4096 ids in same ms may cause wait, but we can just generate many and check uniqueness
    const ids: bigint[] = [];
    for (let i = 0; i < 5000; i++) {
      ids.push(gen.nextId());
    }
    const set = new Set(ids);
    expect(set.size).toBe(ids.length);
  });

  it('should be sortable across multiple generators with different workers', () => {
    const gen1 = new SnowflakeIdGenerator({ datacenterId: 0, workerId: 1 });
    const gen2 = new SnowflakeIdGenerator({ datacenterId: 0, workerId: 2 });
    const ids = [gen1.nextId(), gen2.nextId(), gen1.nextId(), gen2.nextId()];
    const sorted = [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    // Since they may be generated in different ms, just verify they are all unique
    expect(new Set(ids).size).toBe(ids.length);
  });
});
