import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CallStack,
  V8Engine,
  HostScheduler,
  EventLoop,
  analyzeExecutionOrder,
  performanceTips,
} from './event-loop-deep-dive.js';

describe('CallStack', () => {
  it('should push and pop frames', () => {
    const stack = new CallStack();
    stack.push({ functionName: 'main' });
    stack.push({ functionName: 'foo' });

    expect(stack.depth).toBe(2);
    expect(stack.peek()?.functionName).toBe('foo');

    const popped = stack.pop();
    expect(popped?.functionName).toBe('foo');
    expect(stack.depth).toBe(1);
  });

  it('should check if empty', () => {
    const stack = new CallStack();
    expect(stack.isEmpty()).toBe(true);
    stack.push({ functionName: 'main' });
    expect(stack.isEmpty()).toBe(false);
  });

  it('should return current context', () => {
    const stack = new CallStack();
    stack.push({ functionName: 'main' });
    expect(stack.currentContext()?.functionName).toBe('main');
  });
});

describe('V8Engine', () => {
  it('should execute sync code and manage call stack', () => {
    const engine = new V8Engine();
    const result = engine.executeSync(() => 42, 'testFn');

    expect(result).toBe(42);
    expect(engine.stack.isEmpty()).toBe(true);
  });

  it('should rethrow errors', () => {
    const engine = new V8Engine();
    expect(() => engine.executeSync(() => {
      throw new Error('boom');
    }, 'failingFn')).toThrow('boom');
    expect(engine.stack.isEmpty()).toBe(true);
  });
});

describe('HostScheduler', () => {
  let scheduler: HostScheduler;

  beforeEach(() => {
    scheduler = new HostScheduler();
  });

  it('should schedule and retrieve macrotasks', () => {
    const fn = vi.fn();
    scheduler.scheduleMacrotask(fn, 0);

    const task = scheduler.getDueMacrotask(Date.now());
    expect(task).not.toBeNull();
    expect(task?.fn).toBe(fn);
  });

  it('should schedule and drain microtasks', () => {
    const engine = new V8Engine();
    const fn = vi.fn();
    scheduler.scheduleMicrotask(fn);

    scheduler.drainMicrotasks(engine);
    expect(fn).toHaveBeenCalled();
  });

  it('should schedule and process animation tasks', () => {
    const engine = new V8Engine();
    const fn = vi.fn();
    scheduler.scheduleAnimationTask(fn);

    scheduler.processRenderingOpportunity(engine);
    expect(fn).toHaveBeenCalled();
  });

  it('should report pending tasks', () => {
    const now = Date.now();
    scheduler.scheduleMacrotask(() => {}, 10);
    expect(scheduler.hasPendingTasks(now + 10)).toBe(true);
    expect(scheduler.hasPendingTasks(now + 9)).toBe(false);
  });

  it('should return stats', () => {
    scheduler.scheduleMacrotask(() => {}, 100);
    scheduler.scheduleMicrotask(() => {});
    scheduler.scheduleAnimationTask(() => {});

    const stats = scheduler.stats;
    expect(stats.macro).toBe(1);
    expect(stats.micro).toBe(1);
    expect(stats.animation).toBe(1);
  });
});

describe('EventLoop', () => {
  it('should execute sync code and drain microtasks', () => {
    const loop = new EventLoop();
    const microtask = vi.fn();

    const result = loop.executeSync(() => {
      loop.queueMicrotask(microtask);
      return 42;
    }, 'main');

    expect(result).toBe(42);
    expect(microtask).toHaveBeenCalled();
  });

  it('should schedule macrotasks', () => {
    const loop = new EventLoop();
    const fn = vi.fn();
    loop.setTimeout(fn, 0);
    expect(loop.stats.macro).toBe(1);
  });

  it('should schedule animation frames', () => {
    const loop = new EventLoop();
    const fn = vi.fn();
    loop.requestAnimationFrame(fn);
    expect(loop.stats.animation).toBe(1);
  });

  it('should stop when stop() is called', async () => {
    const loop = new EventLoop();
    const runPromise = loop.run(5000);
    loop.stop();
    await runPromise;
    expect(loop.stats.tickCount).toBeGreaterThanOrEqual(0);
  });
});

describe('analyzeExecutionOrder', () => {
  it('should log analysis without errors', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    analyzeExecutionOrder();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('执行顺序分析'));
    logSpy.mockRestore();
  });
});

describe('performanceTips', () => {
  it('should contain performance tips', () => {
    expect(performanceTips.length).toBeGreaterThan(0);
    expect(performanceTips[0]).toHaveProperty('title');
    expect(performanceTips[0]).toHaveProperty('description');
  });
});
