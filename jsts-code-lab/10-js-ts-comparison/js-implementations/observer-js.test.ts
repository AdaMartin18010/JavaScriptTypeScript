import { describe, it, expect, vi } from 'vitest';
import {
  TypedEventEmitter,
  EventEmitterJS,
  EventEmitterJSDefensive,
  userEventBus,
} from './observer-js.js';

describe('TypedEventEmitter', () => {
  it('should subscribe and emit events', () => {
    const emitter = new TypedEventEmitter<{ test: number }>();
    const listener = vi.fn();
    emitter.on('test', listener);
    emitter.emit('test', 42);

    expect(listener).toHaveBeenCalledWith(42);
  });

  it('should unsubscribe from events', () => {
    const emitter = new TypedEventEmitter<{ test: number }>();
    const listener = vi.fn();
    const unsubscribe = emitter.on('test', listener);
    unsubscribe();
    emitter.emit('test', 42);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should support once subscriptions', () => {
    const emitter = new TypedEventEmitter<{ test: number }>();
    const listener = vi.fn();
    emitter.once('test', listener);
    emitter.emit('test', 1);
    emitter.emit('test', 2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('should return listener count', () => {
    const emitter = new TypedEventEmitter<{ test: number }>();
    emitter.on('test', () => {});
    emitter.on('test', () => {});

    expect(emitter.listenerCount('test')).toBe(2);
  });

  it('should remove all listeners', () => {
    const emitter = new TypedEventEmitter<{ test: number }>();
    emitter.on('test', () => {});
    emitter.removeAllListeners('test');

    expect(emitter.listenerCount('test')).toBe(0);
  });

  it('should remove all listeners globally', () => {
    const emitter = new TypedEventEmitter<{ a: number; b: string }>();
    emitter.on('a', () => {});
    emitter.on('b', () => {});
    emitter.removeAllListeners();

    expect(emitter.listenerCount('a')).toBe(0);
    expect(emitter.listenerCount('b')).toBe(0);
  });
});

describe('EventEmitterJS', () => {
  it('should support basic pub/sub', () => {
    const emitter = new EventEmitterJS();
    const listener = vi.fn();
    emitter.on('event', listener);
    emitter.emit('event', 'data');

    expect(listener).toHaveBeenCalledWith('data');
  });

  it('should support off', () => {
    const emitter = new EventEmitterJS();
    const listener = vi.fn();
    emitter.on('event', listener);
    emitter.off('event', listener);
    emitter.emit('event', 'data');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should support once', () => {
    const emitter = new EventEmitterJS();
    const listener = vi.fn();
    emitter.once('event', listener);
    emitter.emit('event', 1);
    emitter.emit('event', 2);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('EventEmitterJSDefensive', () => {
  it('should warn for unregistered events', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const emitter = new EventEmitterJSDefensive();
    emitter.on('unregistered', () => {});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not registered'));
    warnSpy.mockRestore();
  });

  it('should throw for non-function listeners', () => {
    const emitter = new EventEmitterJSDefensive();
    // @ts-expect-error testing invalid input
    expect(() => emitter.on('test', 'not-a-function')).toThrow(TypeError);
  });

  it('should emit with validation', () => {
    const emitter = new EventEmitterJSDefensive();
    emitter.registerEvent('validated');
    const listener = vi.fn();
    emitter.on('validated', listener);

    emitter.emitWithValidation('validated', 42, (v) => typeof v === 'number');
    expect(listener).toHaveBeenCalledWith(42);

    expect(() =>
      emitter.emitWithValidation('validated', 'bad', (v) => typeof v === 'number')
    ).toThrow(TypeError);
  });
});

describe('userEventBus', () => {
  it('should be a shared event bus instance', () => {
    expect(userEventBus).toBeInstanceOf(TypedEventEmitter);
  });
});
