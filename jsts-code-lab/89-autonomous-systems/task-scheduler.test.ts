import { describe, it, expect } from 'vitest';
import { PriorityQueue, TaskScheduler } from './task-scheduler.js';

describe('PriorityQueue', () => {
  it('should dequeue items in priority order', () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    pq.enqueue(5);
    pq.enqueue(1);
    pq.enqueue(3);

    expect(pq.dequeue()).toBe(1);
    expect(pq.dequeue()).toBe(3);
    expect(pq.dequeue()).toBe(5);
  });

  it('should peek at the highest priority item without removing', () => {
    const pq = new PriorityQueue<string>((a, b) => a.localeCompare(b));
    pq.enqueue('banana');
    pq.enqueue('apple');

    expect(pq.peek()).toBe('apple');
    expect(pq.size()).toBe(2);
  });

  it('should report empty correctly', () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    expect(pq.isEmpty()).toBe(true);
    pq.enqueue(1);
    expect(pq.isEmpty()).toBe(false);
  });

  it('should return undefined when dequeueing empty queue', () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    expect(pq.dequeue()).toBeUndefined();
  });
});

describe('TaskScheduler', () => {
  it('should execute tasks by priority', () => {
    const scheduler = new TaskScheduler('priority');
    const order: string[] = [];

    scheduler.submit({ id: 'low', name: 'low', priority: 1, execute: () => { order.push('low'); return null; } });
    scheduler.submit({ id: 'high', name: 'high', priority: 10, execute: () => { order.push('high'); return null; } });

    scheduler.runAll();
    expect(order[0]).toBe('high');
    expect(order[1]).toBe('low');
  });

  it('should track completed and failed tasks', () => {
    const scheduler = new TaskScheduler('priority');
    scheduler.submit({ id: 'ok', name: 'ok', priority: 1, execute: () => 'success' });
    scheduler.submit({ id: 'fail', name: 'fail', priority: 1, execute: () => { throw new Error('boom'); } });

    const result = scheduler.runAll();
    expect(result.completed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.tasks.find(t => t.id === 'fail')?.status).toBe('failed');
  });

  it('should support deadline scheduling', () => {
    const scheduler = new TaskScheduler('deadline');
    const order: string[] = [];

    scheduler.submit({ id: 'later', name: 'later', priority: 1, deadline: Date.now() + 1000, execute: () => { order.push('later'); return null; } });
    scheduler.submit({ id: 'sooner', name: 'sooner', priority: 1, deadline: Date.now() + 100, execute: () => { order.push('sooner'); return null; } });

    scheduler.runAll();
    expect(order[0]).toBe('sooner');
  });

  it('should allow cancelling pending tasks', () => {
    const scheduler = new TaskScheduler('priority');
    scheduler.submit({ id: 'cancelled', name: 'cancelled', priority: 1, execute: () => 'done' });
    scheduler.submit({ id: 'run', name: 'run', priority: 1, execute: () => 'done' });

    expect(scheduler.cancel('cancelled')).toBe(true);
    const result = scheduler.runAll();
    expect(result.cancelled).toBe(1);
    expect(result.completed).toBe(1);
  });

  it('should reject cancelling non-existent task', () => {
    const scheduler = new TaskScheduler('priority');
    expect(scheduler.cancel('non-existent')).toBe(false);
  });

  it('should throw on duplicate task id', () => {
    const scheduler = new TaskScheduler('priority');
    scheduler.submit({ id: 'dup', name: 'dup', priority: 1, execute: () => null });
    expect(() => scheduler.submit({ id: 'dup', name: 'dup', priority: 1, execute: () => null })).toThrow('already exists');
  });

  it('should report pending count correctly', () => {
    const scheduler = new TaskScheduler('priority');
    scheduler.submit({ id: 'a', name: 'a', priority: 1, execute: () => null });
    scheduler.submit({ id: 'b', name: 'b', priority: 1, execute: () => null });
    expect(scheduler.getPendingCount()).toBe(2);
    scheduler.runAll();
    expect(scheduler.getPendingCount()).toBe(0);
  });

  it('should switch policy dynamically', () => {
    const scheduler = new TaskScheduler('fifo');
    const order: string[] = [];

    scheduler.submit({ id: 'first', name: 'first', priority: 1, execute: () => { order.push('first'); return null; } });
    scheduler.submit({ id: 'second', name: 'second', priority: 10, execute: () => { order.push('second'); return null; } });

    scheduler.setPolicy('priority');
    scheduler.runAll();
    expect(order[0]).toBe('second');
  });
});
