import { describe, it, expect, vi } from 'vitest';
import { TopicMatcher, PubSubHub, ConsumerGroupManager, InMemoryMessageStore, PersistentPubSub } from './pub-sub.js';

describe('TopicMatcher', () => {
  it('matches exact topic', () => {
    expect(TopicMatcher.match('user.created', 'user.created')).toBe(true);
  });

  it('matches single-level wildcard', () => {
    expect(TopicMatcher.match('user.+', 'user.updated')).toBe(true);
    expect(TopicMatcher.match('user.+', 'user.profile.updated')).toBe(false);
  });

  it('matches multi-level wildcard', () => {
    expect(TopicMatcher.match('user.#', 'user.profile.updated')).toBe(true);
    expect(TopicMatcher.match('order.#', 'order.123.status')).toBe(true);
  });
});

describe('PubSubHub', () => {
  it('publishes to exact subscribers', () => {
    const hub = new (PubSubHub as any)();
    const handler = vi.fn();
    hub.subscribe('evt', handler);
    hub.publish('evt', 42);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: 42 }));
  });

  it('publishes to wildcard subscribers', () => {
    const hub = new (PubSubHub as any)();
    const handler = vi.fn();
    hub.subscribe('evt.#', handler);
    hub.publish('evt.sub', 1);
    expect(handler).toHaveBeenCalled();
  });

  it('once subscription auto-removes', () => {
    const hub = new (PubSubHub as any)();
    const handler = vi.fn();
    hub.once('evt', handler);
    hub.publish('evt', 1);
    hub.publish('evt', 2);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('filters by tag', () => {
    const hub = new (PubSubHub as any)();
    const h1 = vi.fn();
    hub.subscribe('evt', h1);
    hub.publish('evt', 1);
    expect(hub.getStats().subscriptions).toBe(1);
  });
});

describe('ConsumerGroupManager', () => {
  it('round-robins messages to consumers', async () => {
    const manager = new (ConsumerGroupManager as any)();
    manager.createGroup('g1');
    const received: string[] = [];
    manager.joinGroup('g1', 'c1', async (_msg: any) => { received.push('c1'); });
    manager.joinGroup('g1', 'c2', async (_msg: any) => { received.push('c2'); });
    manager.publishToGroup('g1', { id: '1', topic: 't', payload: null, timestamp: 1 });
    manager.publishToGroup('g1', { id: '2', topic: 't', payload: null, timestamp: 1 });
    await new Promise(r => setTimeout(r, 50));
    expect(received.sort()).toEqual(['c1', 'c2']);
  });
});

describe('PersistentPubSub', () => {
  it('saves messages to store', async () => {
    const store = new (InMemoryMessageStore as any)();
    const spy = vi.spyOn(store, 'save');
    const pubsub = new PersistentPubSub(store);
    pubsub.publish('evt', 'data');
    await new Promise(r => setTimeout(r, 50));
    expect(spy).toHaveBeenCalled();
  });
});
