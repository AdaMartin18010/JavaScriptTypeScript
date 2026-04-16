import { describe, it, expect, vi } from 'vitest';
import { PubSub, TaskQueue, DelayQueue } from './queue-implementation';

describe('PubSub', () => {
  it('subscribes and publishes', () => {
    const ps = new PubSub();
    const handler = vi.fn();
    ps.subscribe('topic', handler);
    ps.publish('topic', 'hello');
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: 'hello' }));
  });

  it('unsubscribes correctly', () => {
    const ps = new PubSub();
    const handler = vi.fn();
    const unsub = ps.subscribe('topic', handler);
    unsub();
    ps.publish('topic', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('TaskQueue', () => {
  it('processes tasks by priority', async () => {
    const tq = new TaskQueue();
    const order: number[] = [];
    tq.registerHandler('job', async (payload) => { order.push(payload as number); });
    await tq.enqueue('job', 2, 5);
    await tq.enqueue('job', 1, 1);
    await new Promise(r => setTimeout(r, 50));
    expect(order).toEqual([2, 1]);
  });

  it('retries failed tasks', async () => {
    const tq = new TaskQueue();
    let attempts = 0;
    tq.registerHandler('job', async () => { attempts++; throw new Error('fail'); });
    await tq.enqueue('job', null, 1);
    await new Promise(r => setTimeout(r, 100));
    expect(attempts).toBeGreaterThanOrEqual(2);
  });
});

describe('DelayQueue', () => {
  it('publishes after delay', () => {
    vi.useFakeTimers();
    const dq = new DelayQueue();
    const handler = vi.fn();
    dq.subscribe('reminder', handler);
    dq.start();
    dq.schedule('reminder', 'meet', 1000);
    vi.advanceTimersByTime(1000);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: 'meet' }));
    dq.stop();
    vi.useRealTimers();
  });

  it('tracks pending count', () => {
    const dq = new DelayQueue();
    dq.schedule('reminder', 'a', 5000);
    expect(dq.getPendingCount()).toBe(1);
  });
});
