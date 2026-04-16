import { describe, it, expect, vi } from 'vitest';
import {
  RoundRobinStrategy,
  WeightedRoundRobinStrategy,
  LeastConnectionsStrategy,
  ConsistentHashStrategy,
  LoadBalancer
} from './load-balancing.js';

describe('RoundRobinStrategy', () => {
  const backends = [
    { id: 'a', host: 'h', port: 1, weight: 1, connections: 0, healthy: true },
    { id: 'b', host: 'h', port: 2, weight: 1, connections: 0, healthy: true }
  ];

  it('distributes evenly', () => {
    const rr = new RoundRobinStrategy();
    expect(rr.select(backends)!.id).toBe('a');
    expect(rr.select(backends)!.id).toBe('b');
    expect(rr.select(backends)!.id).toBe('a');
  });

  it('skips unhealthy backends', () => {
    const rr = new RoundRobinStrategy();
    const list = [...backends, { id: 'c', host: 'h', port: 3, weight: 1, connections: 0, healthy: false }];
    expect(rr.select(list)!.id).not.toBe('c');
  });
});

describe('WeightedRoundRobinStrategy', () => {
  const backends = [
    { id: 'a', host: 'h', port: 1, weight: 5, connections: 0, healthy: true },
    { id: 'b', host: 'h', port: 2, weight: 1, connections: 0, healthy: true }
  ];

  it('selects according to weights over many iterations', () => {
    const wrr = new WeightedRoundRobinStrategy();
    const counts: Record<string, number> = {};
    for (let i = 0; i < 60; i++) {
      const b = wrr.select(backends)!;
      counts[b.id] = (counts[b.id] || 0) + 1;
    }
    expect(counts['a']).toBeGreaterThan(counts['b']);
  });
});

describe('LeastConnectionsStrategy', () => {
  it('selects backend with fewest connections', () => {
    const strategy = new LeastConnectionsStrategy();
    const backends = [
      { id: 'a', host: 'h', port: 1, weight: 1, connections: 5, healthy: true },
      { id: 'b', host: 'h', port: 2, weight: 1, connections: 2, healthy: true }
    ];
    expect(strategy.select(backends)!.id).toBe('b');
  });
});

describe('ConsistentHashStrategy', () => {
  it('selects same backend for same key', () => {
    const strategy = new ConsistentHashStrategy(100);
    const backends = [
      { id: 'a', host: 'h', port: 1, weight: 1, connections: 0, healthy: true },
      { id: 'b', host: 'h', port: 2, weight: 1, connections: 0, healthy: true }
    ];
    const first = strategy.selectByKey('key-1', backends);
    const second = strategy.selectByKey('key-1', backends);
    expect(first!.id).toBe(second!.id);
  });
});

describe('LoadBalancer', () => {
  it('tracks connections on select and release', () => {
    const lb = new LoadBalancer(new RoundRobinStrategy());
    lb.addBackend({ id: 's1', host: 'h', port: 1, weight: 1 });
    lb.addBackend({ id: 's2', host: 'h', port: 2, weight: 1 });
    lb.select();
    lb.select();
    expect(lb.getStats().totalConnections).toBe(2);
    lb.release('s1');
    expect(lb.getStats().totalConnections).toBe(1);
  });
});
