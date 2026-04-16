import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Observable,
  createSignal,
  createComputed,
  createEffect,
  DataFlowGraph,
  StateMachine,
} from './reactive-programming';

describe('Observable', () => {
  it('should emit values to subscribers', () => {
    const obs = new Observable<number>(observer => {
      observer.next(1);
      observer.next(2);
      observer.complete?.();
    });

    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    expect(values).toEqual([1, 2]);
  });

  it('should support map operator', () => {
    const obs = Observable.of(1, 2, 3).map(x => x * 2);
    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    expect(values).toEqual([2, 4, 6]);
  });

  it('should support filter operator', () => {
    const obs = Observable.of(1, 2, 3, 4).filter(x => x > 2);
    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    expect(values).toEqual([3, 4]);
  });

  it('should merge observables', () => {
    const obs = Observable.merge(Observable.of(1), Observable.of(2));
    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    expect(values).toContain(1);
    expect(values).toContain(2);
  });

  it('should create from iterable', () => {
    const obs = Observable.from([10, 20, 30]);
    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    expect(values).toEqual([10, 20, 30]);
  });

  it('should unsubscribe', () => {
    const teardown = vi.fn();
    const obs = new Observable<number>(observer => {
      observer.next(1);
      return teardown;
    });

    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(teardown).toHaveBeenCalled();
  });

  it('should debounce emissions', async () => {
    vi.useFakeTimers();
    const obs = new Observable<number>(observer => {
      let count = 0;
      const interval = setInterval(() => observer.next(++count), 50);
      return () => clearInterval(interval);
    }).debounceTime(100);

    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    vi.advanceTimersByTime(300);
    expect(values.length).toBeLessThanOrEqual(3);
    vi.useRealTimers();
  });

  it('should throttle emissions', async () => {
    vi.useFakeTimers();
    const obs = new Observable<number>(observer => {
      let count = 0;
      const interval = setInterval(() => observer.next(++count), 50);
      return () => clearInterval(interval);
    }).throttleTime(200);

    const values: number[] = [];
    obs.subscribe({ next: v => values.push(v) });

    vi.advanceTimersByTime(500);
    expect(values.length).toBeLessThanOrEqual(3);
    vi.useRealTimers();
  });
});

describe('Signal', () => {
  it('should get and set values', () => {
    const signal = createSignal(0);
    expect(signal()).toBe(0);
    signal.set(5);
    expect(signal()).toBe(5);
  });

  it('should notify subscribers', () => {
    const signal = createSignal(0);
    const listener = vi.fn();
    signal.subscribe(listener);

    signal.set(1);
    signal.set(2);
    expect(listener).toHaveBeenCalledWith(1);
    expect(listener).toHaveBeenCalledWith(2);
  });

  it('should allow unsubscribe', () => {
    const signal = createSignal(0);
    const listener = vi.fn();
    const unsubscribe = signal.subscribe(listener);
    unsubscribe();
    signal.set(1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should not notify if value unchanged', () => {
    const signal = createSignal(0);
    const listener = vi.fn();
    signal.subscribe(listener);
    signal.set(0);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('createComputed', () => {
  it('should compute derived value', () => {
    const count = createSignal(2);
    const doubled = createComputed(() => count() * 2);
    expect(doubled()).toBe(4);
  });
});

describe('createEffect', () => {
  it('should run immediately and on dependency change', () => {
    const signal = createSignal(0);
    const effect = vi.fn();
    createEffect(effect, [signal]);

    expect(effect).toHaveBeenCalledTimes(1);
    signal.set(1);
    expect(effect).toHaveBeenCalledTimes(2);
  });
});

describe('DataFlowGraph', () => {
  it('should compute derived nodes', () => {
    const graph = new DataFlowGraph();
    graph.addNode({ id: 'a', value: 2, sources: [] });
    graph.addNode({ id: 'b', value: 3, sources: [] });
    graph.addNode({
      id: 'sum',
      value: 0,
      sources: ['a', 'b'],
      compute: ([a, b]) => (a as number) + (b as number),
    });

    expect(graph.getValue<number>('sum')).toBe(5);
  });

  it('should cascade updates', () => {
    const graph = new DataFlowGraph();
    graph.addNode({ id: 'a', value: 1, sources: [] });
    graph.addNode({
      id: 'double',
      value: 0,
      sources: ['a'],
      compute: ([a]) => (a as number) * 2,
    });
    graph.addNode({
      id: 'plusOne',
      value: 0,
      sources: ['double'],
      compute: ([d]) => (d as number) + 1,
    });

    graph.updateNode('a', 5);
    expect(graph.getValue<number>('double')).toBe(10);
    expect(graph.getValue<number>('plusOne')).toBe(11);
  });

  it('should visualize graph', () => {
    const graph = new DataFlowGraph();
    graph.addNode({ id: 'a', value: 1, sources: [] });
    const viz = graph.visualize();
    expect(viz).toContain('a');
    expect(viz).toContain('数据流图');
  });
});

describe('StateMachine', () => {
  it('should transition between states', () => {
    const sm = new StateMachine<'idle' | 'running', 'start'>('idle');
    sm.addTransition({ from: 'idle', event: 'start', to: 'running' });

    expect(sm.getState()).toBe('idle');
    expect(sm.send('start')).toBe(true);
    expect(sm.getState()).toBe('running');
  });

  it('should return false for invalid transitions', () => {
    const sm = new StateMachine<'idle' | 'running', 'start'>('idle');
    expect(sm.send('start')).toBe(false);
  });

  it('should execute transition actions', () => {
    const action = vi.fn();
    const sm = new StateMachine<'a' | 'b', 'go'>('a');
    sm.addTransition({ from: 'a', event: 'go', to: 'b', action });
    sm.send('go');
    expect(action).toHaveBeenCalled();
  });

  it('should notify subscribers', () => {
    const sm = new StateMachine<'a' | 'b', 'go'>('a');
    sm.addTransition({ from: 'a', event: 'go', to: 'b' });

    const listener = vi.fn();
    sm.subscribe(listener);
    sm.send('go');

    expect(listener).toHaveBeenCalledWith('b');
  });

  it('should allow unsubscribe', () => {
    const sm = new StateMachine<'a' | 'b', 'go'>('a');
    sm.addTransition({ from: 'a', event: 'go', to: 'b' });

    const listener = vi.fn();
    const unsubscribe = sm.subscribe(listener);
    unsubscribe();
    sm.send('go');

    expect(listener).not.toHaveBeenCalled();
  });
});
