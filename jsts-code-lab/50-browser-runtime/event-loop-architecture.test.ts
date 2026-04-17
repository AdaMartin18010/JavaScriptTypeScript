import { describe, it, expect } from 'vitest';
import { TaskScheduler, LongTaskSplitter, BatchedMicrotaskProcessor, IdleTaskScheduler } from './event-loop-architecture.js';

describe('TaskScheduler', () => {
  it('schedules microtasks before macrotasks', async () => {
    const scheduler = new TaskScheduler();
    const order: string[] = [];
    scheduler.queueMacrotask(() => order.push('macro'));
    scheduler.queueMicrotask(() => order.push('micro'));
    await new Promise(r => setTimeout(r, 50));
    expect(order).toEqual(['micro', 'macro']);
  });

  it('prioritizes high microtasks', async () => {
    const scheduler = new TaskScheduler();
    const order: string[] = [];
    scheduler.queueMicrotask(() => order.push('normal'), 'normal');
    scheduler.queueMicrotask(() => order.push('high'), 'high');
    await new Promise(r => setTimeout(r, 50));
    expect(order).toEqual(['high', 'normal']);
  });
});

describe('LongTaskSplitter', () => {
  it('splits work and yields', async () => {
    const splitter = new LongTaskSplitter();
    const processed: number[] = [];
    const progress: number[] = [];
    await splitter.split([1, 2, 3, 4], (n: any) => processed.push(n), { chunkSize: 2, onProgress: (c: any) => progress.push(c) });
    expect(processed).toEqual([1, 2, 3, 4]);
    expect(progress.length).toBe(2);
  });

  it('can be cancelled', async () => {
    const splitter = new LongTaskSplitter();
    const processed: number[] = [];
    const p = splitter.split([1, 2, 3, 4], (n: any) => processed.push(n), { chunkSize: 1 });
    splitter.cancel();
    await p;
    expect(processed.length).toBeLessThanOrEqual(1);
  });
});

describe('BatchedMicrotaskProcessor', () => {
  it('batches tasks and flushes', async () => {
    const batcher = new BatchedMicrotaskProcessor();
    const order: string[] = [];
    batcher.add(() => order.push('a'));
    batcher.add(() => order.push('b'));
    expect(order.length).toBe(0);
    await new Promise<void>(r => { queueMicrotask(() => { r(); }); });
    await new Promise<void>(r => { queueMicrotask(() => { r(); }); });
    expect(order).toEqual(['a', 'b']);
  });
});

describe('IdleTaskScheduler', () => {
  it('schedules task with polyfill', async () => {
    const scheduler = new IdleTaskScheduler();
    let called = false;
    scheduler.addTask((deadline: any) => { called = true; expect(deadline.timeRemaining()).toBeGreaterThanOrEqual(0); });
    await new Promise(r => setTimeout(r, 20));
    expect(called).toBe(true);
  });
});
