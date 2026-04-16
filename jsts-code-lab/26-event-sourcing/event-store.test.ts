import { describe, it, expect } from 'vitest';
import { EventStore, Order, OrderProjection, Saga } from './event-store.js';

describe('EventStore', () => {
  it('appends and reads events', async () => {
    const store = new EventStore();
    const events = [{ id: 'e1', type: 'Created', aggregateId: 'a1', aggregateVersion: 1, timestamp: new Date(), payload: {} }];
    await store.appendEvents('a1', 0, events);
    const stream = await store.getEvents('a1');
    expect(stream.length).toBe(1);
    expect(stream[0].type).toBe('Created');
  });

  it('publishes to subscribers', async () => {
    const store = new EventStore();
    const received: any[] = [];
    store.subscribe('Created', (e: any) => received.push(e));
    const events = [{ id: 'e1', type: 'Created', aggregateId: 'a1', aggregateVersion: 1, timestamp: new Date(), payload: {} }];
    await store.appendEvents('a1', 0, events);
    expect(received.length).toBe(1);
  });
});

describe('Order aggregate', () => {
  it('creates, adds items, pays, and replays', () => {
    const order = Order.create('o1', 'c1');
    expect(order.getStatus()).toBe('pending');
    order.addItem('p1', 2, 100);
    expect(order.getTotalAmount()).toBe(200);
    order.pay('pay1');
    expect(order.getStatus()).toBe('paid');
    const events = order.getUncommittedEvents();
    const restored = new Order();
    restored.loadFromHistory(events);
    expect(restored.getStatus()).toBe('paid');
    expect(restored.getTotalAmount()).toBe(200);
  });
});

describe('OrderProjection', () => {
  it('projects order state', () => {
    const proj = new OrderProjection();
    const ts = new Date();
    proj.handleEvent({ id: 'e1', type: 'OrderCreated', aggregateId: 'o1', aggregateVersion: 1, timestamp: ts, payload: {} });
    proj.handleEvent({ id: 'e2', type: 'ItemAddedToOrder', aggregateId: 'o1', aggregateVersion: 2, timestamp: ts, payload: { quantity: 3, price: 10 } });
    proj.handleEvent({ id: 'e3', type: 'OrderPaid', aggregateId: 'o1', aggregateVersion: 3, timestamp: ts, payload: {} });
    const o = proj.getOrder('o1');
    expect(o?.status).toBe('paid');
    expect(o?.totalAmount).toBe(30);
    expect(o?.itemCount).toBe(3);
  });
});

describe('Saga', () => {
  it('executes steps successfully', async () => {
    const saga = new Saga();
    const log: string[] = [];
    saga.addStep({ name: 's1', action: async () => { log.push('s1'); }, compensate: async () => { log.push('c1'); } });
    saga.addStep({ name: 's2', action: async () => { log.push('s2'); }, compensate: async () => { log.push('c2'); } });
    await saga.execute();
    expect(saga.getState()).toBe('completed');
    expect(log).toContain('s1');
    expect(log).toContain('s2');
  });

  it('compensates on failure', async () => {
    const saga = new Saga();
    const log: string[] = [];
    saga.addStep({ name: 's1', action: async () => { log.push('s1'); }, compensate: async () => { log.push('c1'); } });
    saga.addStep({ name: 's2', action: async () => { throw new Error('fail'); }, compensate: async () => { log.push('c2'); } });
    await expect(saga.execute()).rejects.toThrow('fail');
    expect(saga.getState()).toBe('failed');
    expect(log).toContain('c1');
  });
});
