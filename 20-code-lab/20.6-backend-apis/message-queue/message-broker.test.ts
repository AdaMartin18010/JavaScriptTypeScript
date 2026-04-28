import { describe, it, expect, vi } from 'vitest';
import { MessageBroker } from './message-broker.js';

describe('MessageBroker', () => {
  it('declares exchanges and queues', () => {
    const broker = new MessageBroker();
    broker.declareExchange('ex1', 'direct');
    broker.declareQueue('q1');
    expect(broker.getExchanges().length).toBe(1);
    expect(broker.getQueues().length).toBe(1);
  });

  it('routes direct exchange by routing key', () => {
    const broker = new MessageBroker();
    broker.declareExchange('ex1', 'direct');
    broker.declareQueue('q1');
    broker.bindQueue('ex1', 'q1', 'key1');
    const handler = vi.fn();
    broker.consume('q1', handler);
    broker.publish('ex1', 'key1', 'msg');
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ content: 'msg' }), expect.any(Function), expect.any(Function));
  });

  it('routes fanout to all bound queues', () => {
    const broker = new MessageBroker();
    broker.declareExchange('ex1', 'fanout');
    broker.declareQueue('q1');
    broker.declareQueue('q2');
    broker.bindQueue('ex1', 'q1', '');
    broker.bindQueue('ex1', 'q2', '');
    const h1 = vi.fn();
    const h2 = vi.fn();
    broker.consume('q1', h1);
    broker.consume('q2', h2);
    broker.publish('ex1', '', 'broadcast');
    expect(h1).toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it('matches topic patterns', () => {
    const broker = new MessageBroker();
    broker.declareExchange('ex1', 'topic');
    broker.declareQueue('q1');
    broker.bindQueue('ex1', 'q1', 'order.*');
    const handler = vi.fn();
    broker.consume('q1', handler);
    broker.publish('ex1', 'order.created', 'ok');
    expect(handler).toHaveBeenCalled();
  });

  it('acks message and updates stats', () => {
    const broker = new MessageBroker();
    broker.declareQueue('q1');
    let ackFn: () => void = () => {};
    broker.consume('q1', (msg, ack) => { ackFn = ack; });
    broker.sendToQueue('q1', 'data');
    ackFn();
    expect(broker.getStats().acknowledged).toBe(1);
  });
});
