import { describe, it, expect } from 'vitest';
import { EventStore, Order, CommandHandler, OrderProjection } from './cqrs-pattern.js';

describe('CQRS pattern', () => {
  it('EventStore should append and retrieve events', () => {
    const store = new EventStore();
    const event = {
      id: 'e1',
      type: 'OrderCreated',
      aggregateId: 'a1',
      timestamp: Date.now(),
      version: 1,
      payload: { customerId: 'c1', items: [], totalAmount: 0 },
    };
    store.append(event);
    expect(store.getEventsForAggregate('a1').length).toBe(1);
    expect(store.getEventsByType('OrderCreated').length).toBe(1);
  });

  it('EventStore should detect concurrency conflict', () => {
    const store = new EventStore();
    store.append({ id: 'e1', type: 'OrderCreated', aggregateId: 'a1', timestamp: 1, version: 1, payload: {} });
    expect(() =>
      { store.append({ id: 'e2', type: 'OrderCreated', aggregateId: 'a1', timestamp: 2, version: 3, payload: {} }); }
    ).toThrow('并发冲突');
  });

  it('Order should create and pay', () => {
    const order = Order.create('o1', 'c1', [{ productId: 'p1', quantity: 1, price: 100 }]);
    expect(order.status).toBe('pending');
    expect(order.totalAmount).toBe(100);
    order.pay('pay1');
    expect(order.status).toBe('paid');
    expect(() => { order.pay('pay2'); }).toThrow('订单状态不允许支付');
  });

  it('Order should ship after payment', () => {
    const order = Order.create('o2', 'c1', [{ productId: 'p1', quantity: 1, price: 100 }]);
    expect(() => { order.ship('track1'); }).toThrow('订单未支付，无法发货');
    order.pay('pay1');
    order.ship('track1');
    expect(order.status).toBe('shipped');
  });

  it('CommandHandler should process CreateOrder, PayOrder, ShipOrder', async () => {
    const store = new EventStore();
    const handler = new CommandHandler(store);
    await handler.handle({ type: 'CreateOrder', aggregateId: 'o3', payload: { customerId: 'c1', items: [{ productId: 'p1', quantity: 1, price: 100 }] } });
    await handler.handle({ type: 'PayOrder', aggregateId: 'o3', payload: { paymentId: 'pay1' } });
    await handler.handle({ type: 'ShipOrder', aggregateId: 'o3', payload: { trackingNumber: 'track1' } });
    expect(store.getEventsForAggregate('o3').length).toBe(3);
  });

  it('OrderProjection should rebuild views from events', async () => {
    const store = new EventStore();
    const handler = new CommandHandler(store);
    const projection = new OrderProjection(store);
    await handler.handle({ type: 'CreateOrder', aggregateId: 'o4', payload: { customerId: 'c1', items: [{ productId: 'p1', quantity: 2, price: 50 }] } });
    await handler.handle({ type: 'PayOrder', aggregateId: 'o4', payload: { paymentId: 'pay1' } });
    projection.rebuild();
    const view = projection.getOrderById('o4');
    expect(view?.status).toBe('paid');
    expect(view?.totalAmount).toBe(100);
    expect(projection.getTotalSales()).toBe(100);
  });
});
