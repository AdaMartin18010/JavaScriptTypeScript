import { describe, it, expect } from 'vitest';
import { getCountryNameTraditional, getCountryNameModern, getAvatarUrl, getPoolSize, processUser } from './optional-chaining.js';

describe('optional chaining (ES2020)', () => {
  it('getCountryNameModern should return undefined for missing nested property', () => {
    const user = { name: 'Alice', address: { city: 'Beijing' } };
    expect(getCountryNameModern(user)).toBeUndefined();
  });

  it('getCountryNameTraditional and modern should behave the same', () => {
    const user = { name: 'Alice', address: { city: 'Beijing' } };
    expect(getCountryNameTraditional(user)).toBe(getCountryNameModern(user));
  });

  it('getAvatarUrl should safely traverse deeply nested optional properties', () => {
    const response = {
      data: {
        users: [{ profile: { avatar: { url: 'https://example.com/avatar.png' } } }],
      },
    };
    expect(getAvatarUrl(response)).toBe('https://example.com/avatar.png');
    expect(getAvatarUrl({})).toBeUndefined();
  });

  it('getPoolSize should return default when config is empty', () => {
    expect(getPoolSize({})).toBe(10);
    expect(getPoolSize({ server: { database: { connection: { pool: { max: 50 } } } } })).toBe(50);
  });

  it('processUser should not throw on null user', () => {
    expect(() => processUser(null)).not.toThrow();
  });
});
