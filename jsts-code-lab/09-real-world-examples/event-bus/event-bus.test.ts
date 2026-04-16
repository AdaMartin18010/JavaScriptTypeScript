import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EventBus,
  CommandBus,
  QueryBus,
  createLoggingMiddleware,
  createValidationMiddleware,
} from './event-bus.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus({ enableAsyncDispatch: false, enableHistory: true });
  });

  it('should subscribe and publish events', async () => {
    const handler = vi.fn();
    bus.subscribe('test:event', handler);
    await bus.publish('test:event', { data: 1 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].payload).toEqual({ data: 1 });
  });

  it('should unsubscribe from events', async () => {
    const handler = vi.fn();
    const unsubscribe = bus.subscribe('test:event', handler);
    unsubscribe();
    await bus.publish('test:event', { data: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support one-time subscriptions', async () => {
    const handler = vi.fn();
    bus.once('test:event', handler);
    await bus.publish('test:event', { data: 1 });
    await bus.publish('test:event', { data: 2 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should filter events', async () => {
    const handler = vi.fn();
    bus.subscribe('test:event', handler, {
      filter: e => (e.payload as { value: number }).value > 10,
    });

    await bus.publish('test:event', { value: 5 });
    await bus.publish('test:event', { value: 20 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should wait for specific events', async () => {
    const promise = bus.waitFor('test:event', 1000, e =>
      (e.payload as { id: string }).id === 'target'
    );

    bus.publish('test:event', { id: 'other' });
    bus.publish('test:event', { id: 'target' });

    const event = await promise;
    expect(event.payload).toEqual({ id: 'target' });
  });

  it('should record and replay history', async () => {
    bus.subscribe('test:event', () => {});
    await bus.publish('test:event', { id: 1 });
    await bus.publish('test:event', { id: 2 });

    expect(bus.getHistory().length).toBe(2);

    const replayHandler = vi.fn();
    bus.subscribe('test:event', replayHandler);
    const count = await bus.replay(r => (r.event.payload as { id: number }).id === 1);

    expect(count).toBe(1);
    expect(replayHandler).toHaveBeenCalledTimes(1);
  });

  it('should provide accurate stats', async () => {
    bus.subscribe('a', () => {});
    bus.subscribe('a', () => {});
    bus.subscribe('b', () => {});
    bus.use(createLoggingMiddleware());

    const stats = bus.getStats();
    expect(stats.subscriberCount).toBe(2);
    expect(stats.subscriptionCount).toBe(3);
    expect(stats.middlewareCount).toBe(1);
  });
});

describe('CommandBus', () => {
  it('should register and execute commands', async () => {
    const eventBus = new EventBus({ enableAsyncDispatch: false });
    const commandBus = new CommandBus(eventBus);
    const handler = vi.fn().mockResolvedValue({ success: true });

    commandBus.register('createUser', handler);
    const result = await commandBus.execute('createUser', { name: 'Alice' });

    expect(handler).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should throw for unregistered commands', async () => {
    const eventBus = new EventBus({ enableAsyncDispatch: false });
    const commandBus = new CommandBus(eventBus);

    await expect(commandBus.execute('unknown', {})).rejects.toThrow(
      'No handler registered for command: unknown'
    );
  });

  it('should support middleware', async () => {
    const eventBus = new EventBus({ enableAsyncDispatch: false });
    const commandBus = new CommandBus(eventBus);
    const middleware = vi.fn().mockImplementation(async (cmd, next) => next());
    const handler = vi.fn().mockResolvedValue({ ok: true });

    commandBus.use(middleware);
    commandBus.register('test', handler);
    await commandBus.execute('test', {});

    expect(middleware).toHaveBeenCalled();
  });
});

describe('QueryBus', () => {
  it('should register and execute queries', async () => {
    const queryBus = new QueryBus();
    const handler = vi.fn().mockResolvedValue([{ id: 1 }]);

    queryBus.register('getUsers', handler);
    const result = await queryBus.query('getUsers', {});

    expect(handler).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should cache query results', async () => {
    const queryBus = new QueryBus();
    const handler = vi.fn().mockResolvedValue({ cached: true });

    queryBus.register('getConfig', handler);
    await queryBus.query('getConfig', {}, { cacheKey: 'config', cacheTtlMs: 1000 });
    await queryBus.query('getConfig', {}, { cacheKey: 'config', cacheTtlMs: 1000 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should clear cache by pattern', async () => {
    const queryBus = new QueryBus();
    const handler = vi.fn().mockResolvedValue({});

    queryBus.register('getConfig', handler);
    await queryBus.query('getConfig', {}, { cacheKey: 'app:config', cacheTtlMs: 1000 });
    queryBus.clearCache('app:');
    await queryBus.query('getConfig', {}, { cacheKey: 'app:config', cacheTtlMs: 1000 });

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
