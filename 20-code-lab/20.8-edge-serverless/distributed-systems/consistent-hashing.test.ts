import { describe, it, expect } from 'vitest';
import { ConsistentHashRing } from './consistent-hashing.js';

describe('ConsistentHashRing', () => {
  it('should add nodes and return them', () => {
    const ring = new ConsistentHashRing();
    ring.addNode({ id: 'node-a' });
    ring.addNode({ id: 'node-b' });
    expect(ring.getNodes()).toEqual(['node-a', 'node-b']);
    expect(ring.getVirtualNodeCount()).toBeGreaterThan(0);
  });

  it('should throw when adding a duplicate node', () => {
    const ring = new ConsistentHashRing();
    ring.addNode({ id: 'node-a' });
    expect(() => ring.addNode({ id: 'node-a' })).toThrow();
  });

  it('should route keys to a node', () => {
    const ring = new ConsistentHashRing();
    ring.addNode({ id: 'node-a' });
    expect(ring.getNode('key-1')).toBe('node-a');
  });

  it('should return undefined for empty ring', () => {
    const ring = new ConsistentHashRing();
    expect(ring.getNode('key-1')).toBeUndefined();
  });

  it('should distribute keys among multiple nodes', () => {
    const ring = new ConsistentHashRing({ virtualNodes: 200 });
    ring.addNode({ id: 'node-a' });
    ring.addNode({ id: 'node-b' });
    ring.addNode({ id: 'node-c' });

    const distribution = new Map<string, number>();
    for (let i = 0; i < 1000; i++) {
      const node = ring.getNode(`key-${i}`);
      if (node) {
        distribution.set(node, (distribution.get(node) || 0) + 1);
      }
    }

    expect(distribution.size).toBe(3);
    for (const count of distribution.values()) {
      expect(count).toBeGreaterThan(100);
    }
  });

  it('should minimally remap keys on node removal', () => {
    const ring = new ConsistentHashRing({ virtualNodes: 200 });
    ring.addNode({ id: 'node-a' });
    ring.addNode({ id: 'node-b' });
    ring.addNode({ id: 'node-c' });

    const before = new Map<string, string>();
    for (let i = 0; i < 1000; i++) {
      const key = `key-${i}`;
      const node = ring.getNode(key);
      if (node) before.set(key, node);
    }

    ring.removeNode('node-b');

    let changed = 0;
    for (let i = 0; i < 1000; i++) {
      const key = `key-${i}`;
      const afterNode = ring.getNode(key);
      if (before.get(key) !== afterNode) {
        changed++;
      }
    }

    // 移除一个节点后，理想情况下只有约 1/3 的键需要迁移
    expect(changed).toBeGreaterThan(0);
    expect(changed).toBeLessThan(500);
  });

  it('should respect node weights', () => {
    const ring = new ConsistentHashRing({ virtualNodes: 100 });
    ring.addNode({ id: 'light', weight: 1 });
    ring.addNode({ id: 'heavy', weight: 3 });

    let heavyCount = 0;
    for (let i = 0; i < 1000; i++) {
      const node = ring.getNode(`key-${i}`);
      if (node === 'heavy') heavyCount++;
    }

    expect(heavyCount / 1000).toBeGreaterThan(0.55);
  });
});
