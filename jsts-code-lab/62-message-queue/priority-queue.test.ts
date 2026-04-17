import { describe, it, expect } from 'vitest';
import { PriorityQueue, PriorityScheduler } from './priority-queue.js';

describe('PriorityQueue', () => {
  it('enqueues and dequeues by priority', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'low', priority: 10, timestamp: 0 });
    queue.enqueue({ id: 'b', payload: 'high', priority: 1, timestamp: 0 });
    queue.enqueue({ id: 'c', payload: 'medium', priority: 5, timestamp: 0 });

    expect(queue.dequeue()!.payload).toBe('high');
    expect(queue.dequeue()!.payload).toBe('medium');
    expect(queue.dequeue()!.payload).toBe('low');
  });

  it('returns undefined when empty', () => {
    const queue = new PriorityQueue<string>();
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.peek()).toBeUndefined();
  });

  it('reports correct size', () => {
    const queue = new PriorityQueue<string>();
    expect(queue.size()).toBe(0);
    queue.enqueue({ id: 'a', payload: 'x', priority: 1, timestamp: 0 });
    expect(queue.size()).toBe(1);
    queue.dequeue();
    expect(queue.size()).toBe(0);
  });

  it('respects max size', () => {
    const queue = new PriorityQueue<string>({ maxSize: 2 });
    expect(queue.enqueue({ id: 'a', payload: 'x', priority: 1, timestamp: 0 })).toBe(true);
    expect(queue.enqueue({ id: 'b', payload: 'y', priority: 2, timestamp: 0 })).toBe(true);
    expect(queue.enqueue({ id: 'c', payload: 'z', priority: 3, timestamp: 0 })).toBe(false);
  });

  it('peeks without removing', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'x', priority: 1, timestamp: 0 });
    expect(queue.peek()!.payload).toBe('x');
    expect(queue.size()).toBe(1);
  });

  it('dequeues many items', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'a', priority: 3, timestamp: 0 });
    queue.enqueue({ id: 'b', payload: 'b', priority: 2, timestamp: 0 });
    queue.enqueue({ id: 'c', payload: 'c', priority: 1, timestamp: 0 });

    const items = queue.dequeueMany(2);
    expect(items).toHaveLength(2);
    expect(items[0].priority).toBe(1);
    expect(items[1].priority).toBe(2);
    expect(queue.size()).toBe(1);
  });

  it('gets items by priority range', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'a', priority: 1, timestamp: 0 });
    queue.enqueue({ id: 'b', payload: 'b', priority: 5, timestamp: 0 });
    queue.enqueue({ id: 'c', payload: 'c', priority: 10, timestamp: 0 });

    const items = queue.getByPriorityRange(1, 5);
    expect(items).toHaveLength(2);
  });

  it('updates priority and reorders', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'a', priority: 5, timestamp: 0 });
    queue.enqueue({ id: 'b', payload: 'b', priority: 10, timestamp: 0 });

    queue.updatePriority('a', 1);
    expect(queue.dequeue()!.id).toBe('a');
  });

  it('returns false when updating non-existent item', () => {
    const queue = new PriorityQueue<string>();
    expect(queue.updatePriority('missing', 1)).toBe(false);
  });

  it('removes specific item', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'a', priority: 1, timestamp: 0 });
    const removed = queue.remove('a');
    expect(removed!.id).toBe('a');
    expect(queue.isEmpty()).toBe(true);
  });

  it('returns undefined when removing non-existent item', () => {
    const queue = new PriorityQueue<string>();
    expect(queue.remove('missing')).toBeUndefined();
  });

  it('converts to sorted array', () => {
    const queue = new PriorityQueue<string>();
    queue.enqueue({ id: 'a', payload: 'a', priority: 3, timestamp: 0 });
    queue.enqueue({ id: 'b', payload: 'b', priority: 1, timestamp: 0 });
    queue.enqueue({ id: 'c', payload: 'c', priority: 2, timestamp: 0 });

    const sorted = queue.toSortedArray();
    expect(sorted.map(m => m.priority)).toEqual([1, 2, 3]);
    // Original queue should be empty after toSortedArray
  });
});

describe('PriorityScheduler', () => {
  it('submits and processes tasks in priority order', async () => {
    const scheduler = new PriorityScheduler<string>();
    const processed: string[] = [];

    scheduler.onProcess(async msg => {
      processed.push(msg.payload);
    });

    scheduler.submit('a', 'low', 10);
    scheduler.submit('b', 'high', 1);

    await scheduler.processAll();
    expect(processed).toEqual(['high', 'low']);
  });

  it('returns stats', () => {
    const scheduler = new PriorityScheduler<string>();
    scheduler.submit('a', 'x', 1);
    expect(scheduler.getStats().size).toBe(1);
    expect(scheduler.getStats().isProcessing).toBe(false);
  });

  it('returns false when processing empty queue', async () => {
    const scheduler = new PriorityScheduler<string>();
    const result = await scheduler.processNext();
    expect(result).toBe(false);
  });
});
