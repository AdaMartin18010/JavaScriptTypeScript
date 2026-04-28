import { describe, it, expect } from 'vitest';
import { ConsumerGroup, PartitionAssignors, PartitionConsumer } from './consumer-group.js';

describe('PartitionAssignors', () => {
  const partitions = [
    { id: 0, topic: 't' },
    { id: 1, topic: 't' },
    { id: 2, topic: 't' },
    { id: 3, topic: 't' }
  ];
  const consumers = ['a', 'b'];

  it('round-robin distributes evenly', () => {
    const assignment = PartitionAssignors.roundRobin(consumers, partitions);
    expect(assignment.get('a')!.length).toBe(2);
    expect(assignment.get('b')!.length).toBe(2);
  });

  it('range assigns contiguous partitions', () => {
    const assignment = PartitionAssignors.range(consumers, partitions);
    expect(assignment.get('a')!.length).toBe(2);
    expect(assignment.get('a')![0].id).toBe(0);
    expect(assignment.get('a')![1].id).toBe(1);
    expect(assignment.get('b')![0].id).toBe(2);
    expect(assignment.get('b')![1].id).toBe(3);
  });

  it('sticky preserves existing assignments', () => {
    const current = new Map([['a', [partitions[0], partitions[2]]]]);
    const assignment = PartitionAssignors.sticky(['a', 'b'], partitions, current);
    expect(assignment.get('a')!.map(p => p.id)).toContain(0);
    expect(assignment.get('a')!.map(p => p.id)).toContain(2);
  });

  it('handles empty consumers', () => {
    const assignment = PartitionAssignors.roundRobin([], partitions);
    expect(assignment.size).toBe(0);
  });
});

describe('ConsumerGroup', () => {
  const partitions = [
    { id: 0, topic: 'orders' },
    { id: 1, topic: 'orders' },
    { id: 2, topic: 'orders' }
  ];

  it('assigns partitions on join', () => {
    const group = new ConsumerGroup('g', partitions);
    const assigned = group.join('c1');
    expect(assigned.length).toBeGreaterThan(0);
    expect(group.getConsumers()).toHaveLength(1);
  });

  it('rebalances when new consumer joins', () => {
    const group = new ConsumerGroup('g', partitions);
    group.join('c1');
    const initial = group.getAssignment().get('c1')!.length;
    group.join('c2');
    expect(group.getAssignment().get('c1')!.length).toBeLessThan(initial);
  });

  it('rebalances when consumer leaves', () => {
    const group = new ConsumerGroup('g', partitions);
    group.join('c1');
    group.join('c2');
    group.leave('c1');
    expect(group.getAssignment().get('c1')).toBeUndefined();
    expect(group.getAssignment().get('c2')!.length).toBe(3);
  });

  it('updates heartbeat', () => {
    const group = new ConsumerGroup('g', partitions, { sessionTimeout: 1000 });
    group.join('c1');
    group.heartbeat('c1');
    expect(group.isConsumerAlive('c1')).toBe(true);
  });

  it('detects dead consumers', () => {
    const group = new ConsumerGroup('g', partitions, { sessionTimeout: 50 });
    group.join('c1');
    expect(group.isConsumerAlive('c1')).toBe(true);
  });

  it('cleans up dead consumers', async () => {
    const group = new ConsumerGroup('g', partitions, { sessionTimeout: 10 });
    group.join('c1');
    await new Promise(r => setTimeout(r, 20));
    const removed = group.cleanup();
    expect(removed).toContain('c1');
    expect(group.getConsumers()).toHaveLength(0);
  });

  it('commits and retrieves offsets', () => {
    const group = new ConsumerGroup('g', partitions);
    group.commitOffset('orders', 0, 100);
    expect(group.getOffset('orders', 0)).toBe(100);
  });

  it('only advances offsets forward', () => {
    const group = new ConsumerGroup('g', partitions);
    group.commitOffset('orders', 0, 100);
    group.commitOffset('orders', 0, 50);
    expect(group.getOffset('orders', 0)).toBe(100);
  });

  it('returns empty assignment for unknown consumer', () => {
    const group = new ConsumerGroup('g', partitions);
    expect(group.getAssignment().get('unknown')).toBeUndefined();
  });
});

describe('PartitionConsumer', () => {
  it('joins group and gets partitions', () => {
    const group = new ConsumerGroup('g', [{ id: 0, topic: 't' }]);
    const consumer = new PartitionConsumer(group, 'c1');
    const partitions = consumer.join();
    expect(partitions.length).toBe(1);
  });

  it('processes messages and commits offsets', async () => {
    const group = new ConsumerGroup('g', [{ id: 0, topic: 't' }]);
    const consumer = new PartitionConsumer(group, 'c1');
    consumer.join();

    let processed = false;
    consumer.onMessage(async () => { processed = true; });
    await consumer.process({ offset: 5, partition: 0, topic: 't', payload: {}, timestamp: Date.now() });

    expect(processed).toBe(true);
    expect(group.getOffset('t', 0)).toBe(5);
  });

  it('leaves group', () => {
    const group = new ConsumerGroup('g', [{ id: 0, topic: 't' }]);
    const consumer = new PartitionConsumer(group, 'c1');
    consumer.join();
    consumer.leave();
    expect(group.getConsumers()).toHaveLength(0);
  });
});
