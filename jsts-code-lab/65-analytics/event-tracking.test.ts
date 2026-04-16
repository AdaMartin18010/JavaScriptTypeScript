import { describe, it, expect, vi } from 'vitest';
import { EventTracker, SessionManager } from './event-tracking';

describe('EventTracker', () => {
  it('tracks events with session', () => {
    const tracker = new EventTracker({ autoStart: false });
    const event = tracker.track('click');
    expect(event.name).toBe('click');
    expect(event.sessionId).toBeDefined();
    tracker.stop();
  });

  it('filters events by name', () => {
    const tracker = new EventTracker({ autoStart: false });
    tracker.track('a');
    tracker.track('b');
    tracker.stop();
    expect(tracker.getEvents({ name: 'a' }).length).toBe(1);
  });

  it('flushes batch on stop', () => {
    const tracker = new EventTracker({ autoStart: false, batchSize: 5 });
    tracker.track('x');
    tracker.stop();
    expect(tracker.getEvents().length).toBe(1);
  });
});

describe('SessionManager', () => {
  it('creates and retrieves session', () => {
    const sm = new SessionManager();
    const s1 = sm.getCurrentSession();
    const s2 = sm.getCurrentSession();
    expect(s1.id).toBe(s2.id);
  });

  it('sets user id on session', () => {
    const sm = new SessionManager();
    sm.setUserId('u1');
    expect(sm.getCurrentSession().userId).toBe('u1');
  });

  it('ends session and creates new one after timeout', () => {
    vi.useFakeTimers();
    const sm = new SessionManager({ timeout: 1000 });
    const s1 = sm.getCurrentSession();
    vi.advanceTimersByTime(1001);
    const s2 = sm.getCurrentSession();
    expect(s1.id).not.toBe(s2.id);
    vi.useRealTimers();
  });
});
