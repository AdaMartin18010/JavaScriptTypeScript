import { describe, it, expect } from 'vitest';
import { MessageStream, StreamProcessor, EventStore } from './stream-processing';

describe('MessageStream', () => {
  it('adds and reads entries', () => {
    const stream = new MessageStream();
    const id = stream.add({ name: 'alice' });
    expect(stream.length()).toBe(1);
    const entries = stream.read('-', 10);
    expect(entries[0].id).toBe(id);
    expect(entries[0].fields.name).toBe('alice');
  });

  it('trims to max length', () => {
    const stream = new MessageStream({ maxLength: 2 });
    stream.add({ a: 1 });
    stream.add({ a: 2 });
    stream.add({ a: 3 });
    expect(stream.length()).toBe(2);
  });
});

describe('StreamProcessor', () => {
  it('creates stream and reads group messages', () => {
    const sp = new StreamProcessor();
    sp.xadd('orders', { amount: 10 });
    sp.xgroupCreate('orders', 'processors');
    sp.xadd('orders', { amount: 20 });
    const msgs = sp.xreadgroup('orders', 'processors', 'c1', 10);
    expect(msgs.length).toBe(2);
    expect(sp.xpending('orders', 'processors').length).toBe(2);
    expect(sp.xack('orders', 'processors', msgs[0].id)).toBe(1);
  });

  it('claims idle messages', () => {
    const sp = new StreamProcessor();
    sp.xadd('orders', { amount: 5 });
    sp.xgroupCreate('orders', 'processors');
    const msgs = sp.xreadgroup('orders', 'processors', 'c1', 1);
    const claimed = sp.xclaim('orders', 'processors', 'c2', 0, msgs[0].id);
    expect(claimed.length).toBe(1);
  });
});

describe('EventStore', () => {
  it('appends and replays events', () => {
    const store = new EventStore();
    store.append({ aggregateId: 'a1', aggregateType: 'Order', type: 'Created', payload: { v: 1 }, version: 1 });
    store.append({ aggregateId: 'a1', aggregateType: 'Order', type: 'Paid', payload: { v: 2 }, version: 2 });
    const state = store.replay<{ sum: number }>('a1', (s, e) => ({ sum: s.sum + (e.payload as any).v }), { sum: 0 });
    expect(state.sum).toBe(3);
    expect(store.getCurrentVersion('a1')).toBe(2);
  });
});
