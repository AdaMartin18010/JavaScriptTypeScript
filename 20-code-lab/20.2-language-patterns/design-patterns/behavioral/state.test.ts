import { describe, it, expect, vi } from 'vitest';
import {
  Document,
  Order,
  createStateMachine
} from './state.js';

describe('state pattern', () => {
  it('Document should transition from Draft -> Moderation -> Published', () => {
    const doc = new Document('My Article');
    expect(doc.getStateName()).toBe('Draft');

    doc.publish();
    expect(doc.getStateName()).toBe('Moderation');

    doc.publish();
    expect(doc.getStateName()).toBe('Published');
  });

  it('Published document reject should return to Draft', () => {
    const doc = new Document('Article');
    doc.publish();
    doc.publish();
    expect(doc.getStateName()).toBe('Published');

    doc.reject();
    expect(doc.getStateName()).toBe('Draft');
  });

  it('Order should transition through full lifecycle', () => {
    const order = new Order(['Item1', 'Item2']);
    expect(order.getStateName()).toBe('Pending');

    order.pay();
    expect(order.getStateName()).toBe('Paid');

    order.ship();
    expect(order.getStateName()).toBe('Shipped');

    order.deliver();
    expect(order.getStateName()).toBe('Delivered');
  });

  it('Pending order should be cancellable', () => {
    const order = new Order(['Item1']);
    order.cancel();
    expect(order.getStateName()).toBe('Cancelled');
  });

  it('Paid order should be cancellable with refund', () => {
    const order = new Order(['Item1']);
    order.pay();
    order.cancel();
    expect(order.getStateName()).toBe('Cancelled');
  });

  it('Shipped order should not be cancellable', () => {
    const order = new Order(['Item1']);
    order.pay();
    order.ship();
    order.cancel();
    expect(order.getStateName()).toBe('Shipped');
  });

  it('createStateMachine should handle state transitions', () => {
    const machine = createStateMachine({
      initial: 'idle',
      states: {
        idle: { on: { START: 'running' } },
        running: { on: { PAUSE: 'paused', STOP: 'idle' } },
        paused: { on: { RESUME: 'running', STOP: 'idle' } }
      }
    });

    expect(machine.getState()).toBe('idle');
    expect(machine.send('START')).toBe(true);
    expect(machine.getState()).toBe('running');
    expect(machine.send('PAUSE')).toBe(true);
    expect(machine.getState()).toBe('paused');
    expect(machine.send('RESUME')).toBe(true);
    expect(machine.getState()).toBe('running');
    expect(machine.send('STOP')).toBe(true);
    expect(machine.getState()).toBe('idle');
  });

  it('createStateMachine should return false for invalid transitions', () => {
    const machine = createStateMachine({
      initial: 'idle',
      states: {
        idle: { on: { START: 'running' } },
        running: {}
      }
    });

    expect(machine.send('INVALID')).toBe(false);
    expect(machine.getState()).toBe('idle');
  });

  it('createStateMachine should call entry and exit hooks', () => {
    const entrySpy = vi.fn();
    const exitSpy = vi.fn();

    const machine = createStateMachine({
      initial: 'a',
      states: {
        a: { on: { NEXT: 'b' }, exit: exitSpy },
        b: { on: { NEXT: 'a' }, entry: entrySpy }
      }
    });

    machine.send('NEXT');
    expect(exitSpy).toHaveBeenCalled();
    expect(entrySpy).toHaveBeenCalled();
  });
});
