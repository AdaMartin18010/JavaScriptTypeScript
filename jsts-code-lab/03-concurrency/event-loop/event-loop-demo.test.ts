import { describe, it, expect } from 'vitest';
import { nestedMicrotasks, mixedTasks, EventLoopSimulator } from './event-loop-demo.js';

describe('event loop demo', () => {
  it('nestedMicrotasks should not throw', () => {
    expect(() => nestedMicrotasks()).not.toThrow();
  });

  it('mixedTasks should not throw', () => {
    expect(() => mixedTasks()).not.toThrow();
  });

  it('EventLoopSimulator should run tasks in correct order', () => {
    const simulator = new EventLoopSimulator();
    const log: string[] = [];
    simulator.sync(() => log.push('sync'));
    simulator.promiseThen(() => log.push('micro1'));
    simulator.setTimeout(() => log.push('macro1'));
    simulator.promiseThen(() => log.push('micro2'));
    simulator.setTimeout(() => log.push('macro2'));
    const result = simulator.run();
    expect(result).toEqual([
      'microtask executed',
      'microtask executed',
      'macrotask executed',
      'macrotask executed',
    ]);
  });
});
