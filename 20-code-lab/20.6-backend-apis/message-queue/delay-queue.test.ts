import { describe, it, expect, vi } from 'vitest';
import { TimingWheel, DelayQueue, CronParser, Scheduler } from './delay-queue.js';

describe('TimingWheel', () => {
  it('schedules a message without error', () => {
    const wheel = new TimingWheel(100, 10);
    wheel.start();
    wheel.schedule(200, { id: '1', payload: 'hello', attempts: 0, maxAttempts: 3, priority: 1, createdAt: Date.now() });
    wheel.stop();
  });
});

describe('DelayQueue', () => {
  it('delays and cancels message', () => {
    const dq = new DelayQueue<string>();
    const id = dq.delay('task', 1000);
    expect(dq.getStatus().pending).toBe(1);
    expect(dq.cancel(id)).toBe(true);
    expect(dq.getStatus().pending).toBe(0);
  });

  it('peek returns next message', () => {
    const dq = new DelayQueue<number>();
    dq.delay(1, 5000);
    dq.delay(2, 1000);
    expect(dq.peek()?.payload).toBe(2);
  });
});

describe('CronParser', () => {
  it('returns next run for simple cron', () => {
    const next = CronParser.getNextRun('0 0 * * *');
    expect(next.getHours()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('throws on invalid cron', () => {
    expect(() => CronParser.getNextRun('* *')).toThrow('Invalid cron');
  });
});

describe('Scheduler', () => {
  it('schedules and retrieves tasks', () => {
    const scheduler = new Scheduler();
    const id = scheduler.schedule('daily', '0 0 * * *', () => {});
    expect(scheduler.getTasks().length).toBe(1);
    expect(scheduler.getTasks()[0].id).toBe(id);
  });

  it('disables and enables task', () => {
    const scheduler = new Scheduler();
    const id = scheduler.schedule('job', '*/1 * * * *', () => {});
    expect(scheduler.disable(id)).toBe(true);
    expect(scheduler.getTasks()[0].enabled).toBe(false);
    expect(scheduler.enable(id)).toBe(true);
    expect(scheduler.getTasks()[0].enabled).toBe(true);
  });
});
