import { describe, it, expect } from 'vitest';
import { BasicSingleton, ConfigManager, createSingleton, Logger, getDatabase, TestableSingleton } from './singleton.js';

describe('singleton pattern', () => {
  it('BasicSingleton should return same instance', () => {
    const s1 = BasicSingleton.getInstance();
    const s2 = BasicSingleton.getInstance();
    expect(s1).toBe(s2);
  });

  it('ConfigManager should act as module singleton', () => {
    const config = new ConfigManager();
    config.set('key1', 'value1');
    expect(config.get('key1')).toBe('value1');
    expect(config.has('key1')).toBe(true);
    expect(config.has('missing')).toBe(false);
  });

  it('createSingleton should return same instance from closure', () => {
    let callCount = 0;
    const getInstance = createSingleton(() => {
      callCount++;
      return { id: callCount };
    });
    const a = getInstance();
    const b = getInstance();
    expect(a).toBe(b);
    expect(callCount).toBe(1);
  });

  it('Logger decorator should enforce singleton', () => {
    const l1 = new Logger();
    const l2 = new Logger();
    expect(l1).toBe(l2);
    l1.log('test');
    expect(l1.getLogs().length).toBeGreaterThan(0);
  });

  it('getDatabase should return same Database instance', () => {
    const db1 = getDatabase();
    const db2 = getDatabase();
    expect(db1).toBe(db2);
    expect(db1.query('SELECT 1')).toBe('Result of SELECT 1');
  });

  it('TestableSingleton should allow reset for testing', () => {
    TestableSingleton.resetInstance();
    const s1 = TestableSingleton.getInstance();
    s1.increment();
    expect(s1.getCount()).toBe(1);
    TestableSingleton.resetInstance();
    const s2 = TestableSingleton.getInstance();
    expect(s2.getCount()).toBe(0);
  });
});
