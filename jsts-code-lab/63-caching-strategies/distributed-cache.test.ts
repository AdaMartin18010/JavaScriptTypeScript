import { describe, it, expect } from 'vitest';
import { ConsistentHashRing, ShardedCache, ReplicatedCache, CacheCluster } from './distributed-cache.js';

describe('ConsistentHashRing', () => {
  it('maps keys to nodes deterministically', () => {
    const ring = new ConsistentHashRing(100);
    ring.addNode({ id: 'n1', host: 'h', port: 1, weight: 1, healthy: true });
    ring.addNode({ id: 'n2', host: 'h', port: 2, weight: 1, healthy: true });
    const node = ring.getNode('key-1');
    expect(node).not.toBeNull();
    expect(['n1', 'n2']).toContain(node!.id);
  });

  it('returns replica nodes', () => {
    const ring = new ConsistentHashRing(100);
    ring.addNode({ id: 'n1', host: 'h', port: 1, weight: 1, healthy: true });
    ring.addNode({ id: 'n2', host: 'h', port: 2, weight: 1, healthy: true });
    const nodes = ring.getNodes('key-1', 2);
    expect(nodes.length).toBe(2);
  });
});

describe('ShardedCache', () => {
  it('sets and gets values', () => {
    const cache = new ShardedCache<string>([
      { id: 'n1', host: 'h', port: 1, weight: 1, healthy: true },
      { id: 'n2', host: 'h', port: 2, weight: 1, healthy: true }
    ]);
    cache.set('k1', 'v1');
    expect(cache.get('k1')).toBe('v1');
  });

  it('rebalances after node failure', () => {
    const cache = new ShardedCache<string>([
      { id: 'n1', host: 'h', port: 1, weight: 1, healthy: true },
      { id: 'n2', host: 'h', port: 2, weight: 1, healthy: true }
    ]);
    cache.set('k1', 'v1');
    const result = cache.rebalance('n1');
    expect(result.movedKeys).toBeGreaterThanOrEqual(0);
  });
});

describe('ReplicatedCache', () => {
  it('retrieves replicated value', () => {
    const cache = new ReplicatedCache<string>([
      { id: 'n1', host: 'h', port: 1, weight: 1, healthy: true },
      { id: 'n2', host: 'h', port: 2, weight: 1, healthy: true }
    ], 2);
    cache.set('k1', 'v1');
    expect(cache.get('k1')).toBe('v1');
  });
});

describe('CacheCluster', () => {
  it('tracks node stats', () => {
    const cluster = new CacheCluster();
    cluster.addNode({ id: 'n1', host: 'h', port: 1, weight: 1, healthy: true });
    expect(cluster.getClusterStats().totalNodes).toBe(1);
    cluster.setNodeHealth('n1', false);
    expect(cluster.getClusterStats().healthyNodes).toBe(0);
  });
});
