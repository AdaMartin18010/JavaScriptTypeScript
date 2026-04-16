import { describe, it, expect, vi } from 'vitest';
import { EventTracker, FunnelAnalyzer, UserPathAnalyzer, MetricsCalculator } from './analytics-engine';

describe('EventTracker', () => {
  it('tracks events and allows filtering', () => {
    const tracker = new EventTracker();
    tracker.track('click', { x: 1 });
    tracker.track('scroll', { y: 2 });
    expect(tracker.getEvents().length).toBe(2);
    expect(tracker.getEvents({ name: 'click' }).length).toBe(1);
  });

  it('notifies listeners', () => {
    const tracker = new EventTracker();
    const listener = vi.fn();
    tracker.onTrack(listener);
    tracker.track('click');
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'click' }));
  });
});

describe('FunnelAnalyzer', () => {
  const events = [
    { name: 'view', userId: 'u1', timestamp: 1, properties: {} },
    { name: 'cart', userId: 'u1', timestamp: 2, properties: {} },
    { name: 'buy', userId: 'u1', timestamp: 3, properties: {} },
    { name: 'view', userId: 'u2', timestamp: 1, properties: {} }
  ];

  it('computes funnel steps', () => {
    const analyzer = new FunnelAnalyzer();
    const result = analyzer.analyze(events, [
      { name: 'View', event: 'view' },
      { name: 'Cart', event: 'cart' },
      { name: 'Buy', event: 'buy' }
    ], 'user');
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
    expect(result[2].count).toBe(1);
  });
});

describe('UserPathAnalyzer', () => {
  it('analyzes session paths', () => {
    const analyzer = new UserPathAnalyzer();
    const events = [
      { name: 'a', sessionId: 's1', timestamp: 1, properties: {} },
      { name: 'b', sessionId: 's1', timestamp: 2, properties: {} }
    ];
    expect(analyzer.analyzePaths(events, 's1')).toEqual(['a', 'b']);
  });
});

describe('MetricsCalculator', () => {
  const events = [
    { name: 'open', sessionId: 's1', timestamp: 1, properties: {} },
    { name: 'open', sessionId: 's2', timestamp: 1, properties: {} },
    { name: 'purchase', sessionId: 's1', timestamp: 10, properties: {} }
  ];

  it('calculates conversion rate', () => {
    expect(MetricsCalculator.conversionRate(events, 'purchase', 'open')).toBe(50);
  });

  it('calculates average time between events', () => {
    expect(MetricsCalculator.averageTimeBetween(events, 'open', 'purchase')).toBe(9);
  });
});
