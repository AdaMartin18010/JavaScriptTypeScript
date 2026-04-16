import { describe, it, expect, vi } from 'vitest';
import {
  SingletonTS,
  SingletonJSWithDefense,
} from './singleton-js.js';

describe('SingletonTS', () => {
  it('should return the same instance', () => {
    const a = SingletonTS.getInstance();
    const b = SingletonTS.getInstance();
    expect(a).toBe(b);
  });

  it('should set and get values with generic types', () => {
    const instance = SingletonTS.getInstance();
    instance.set('config', { debug: true });
    expect(instance.get<{ debug: boolean }>('config')).toEqual({ debug: true });
  });

  it('should check key existence', () => {
    const instance = SingletonTS.getInstance();
    instance.set('key', 'value');
    expect(instance.has('key')).toBe(true);
    expect(instance.has('missing')).toBe(false);
  });
});

describe('SingletonJSWithDefense', () => {
  it('should return the same instance', () => {
    const a = SingletonJSWithDefense.getInstance();
    const b = SingletonJSWithDefense.getInstance();
    expect(a).toBe(b);
  });

  it('should set and get values', () => {
    const instance = SingletonJSWithDefense.getInstance();
    instance.set('key', 'value');
    expect(instance.get('key')).toBe('value');
  });

  it('should throw for non-string keys in set', () => {
    const instance = SingletonJSWithDefense.getInstance();
    // @ts-expect-error testing invalid input
    expect(() => instance.set(123, 'value')).toThrow(TypeError);
  });

  it('should throw for non-string keys in get', () => {
    const instance = SingletonJSWithDefense.getInstance();
    // @ts-expect-error testing invalid input
    expect(() => instance.get(123)).toThrow(TypeError);
  });
});
