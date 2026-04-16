import { describe, it, expect } from 'vitest';
import { createValidator, withPrivacy, reactive, effect, createLoggerFn, singleton } from './proxies.js';

describe('proxies', () => {
  it('createValidator should reject invalid age', () => {
    const person = createValidator({ name: '', age: 0 });
    person.name = 'Alice';
    person.age = 30;
    expect(person.age).toBe(30);
    expect(() => {
      person.age = -5;
    }).toThrow('Invalid age');
  });

  it('withPrivacy should block access to underscore properties', () => {
    const secure = withPrivacy({ public: 'visible', _private: 'secret' });
    expect(secure.public).toBe('visible');
    expect(() => secure._private).toThrow('Access to private property "_private"');
    expect(Object.keys(secure)).toEqual(['public']);
  });

  it('reactive and effect should track dependencies', () => {
    const state = reactive({ count: 0 });
    let effectCount = 0;
    effect(() => {
      effectCount++;
      // accessing state.count triggers track
      state.count;
    });
    expect(effectCount).toBe(1);
    state.count = 5;
    expect(effectCount).toBe(2);
  });

  it('createLoggerFn should return correct result', () => {
    const loggedAdd = createLoggerFn((a: number, b: number) => a + b);
    expect(loggedAdd(2, 3)).toBe(5);
  });

  it('singleton decorator should return same instance', () => {
    @singleton
    class Service {}
    const s1 = new Service();
    const s2 = new Service();
    expect(s1).toBe(s2);
  });
});
