import { describe, it, expect, vi } from 'vitest';
import { PriorityQueue, TaskQueue, WorkerPool, DeadLetterQueue } from './task-queue';

describe('PriorityQueue', () => {
  it('orders by priority ascending', () => {
    const pq = new PriorityQueue<{ id: string; priority: number }>();
    pq.enqueue({ id: 'a', priority: 5 });
    pq.enqueue({ id: 'b', priority: 1 });
    pq.enqueue({ id: 'c', priority: 3 });
    expect(pq.dequeue()!.id).toBe('b');
    expect(pq.dequeue()!.id).toBe('c');
    expect(pq.dequeue()!.id).toBe('a');
  });
});

describe('TaskQueue', () => {
  it('executes tasks and emits completed', async () => {
    const tq = new TaskQueue({ concurrency: 1 });
    const listener = vi.fn();
    tq.on('completed', listener);
    tq.registerHandler('add', async (task) => {});
    tq.add('add', { a: 1 });
    await new Promise(r => setTimeout(r, 50));
    expect(listener).toHaveBeenCalled();
  });

  it('pauses and clears queue', () => {
    const tq = new TaskQueue({ concurrency: 1 });
    tq.add('job', null);
    tq.pause();
    expect(tq.getStatus().paused).toBe(true);
    tq.clear();
    expect(tq.getStatus().pending).toBe(0);
  });
});

describe('WorkerPool', () => {
  it('executes tasks and resolves', async () => {
    const pool = new WorkerPool(2);
    let count = 0;
    pool.registerHandler('inc', async () => { count++; });
    await pool.execute('inc', null);
    expect(count).toBe(1);
  });
});

describe('DeadLetterQueue', () => {
  it('adds failed tasks and retry removes them', () => {
    const dlq = new DeadLetterQueue();
    const task = { id: 't1', type: 'x', payload: null, priority: 1, attempts: 3, maxAttempts: 3, createdAt: 1, scheduledAt: 1 };
    dlq.add(task as any, new Error('fail'));
    expect(dlq.getStats().count).toBe(1);
    const tq = new TaskQueue();
    tq.registerHandler('x', async () => {});
    expect(dlq.retry('t1', tq)).toBe(true);
    expect(dlq.getStats().count).toBe(0);
  });
});
