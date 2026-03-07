/**
 * @file 空值合并运算符测试
 */

import { describe, it, expect } from 'vitest';
import {
  configurePort,
  greet,
  enableFeature,
  createServerWithNullish,
  getUserDisplayName,
  type User
} from '../../01-ecmascript-evolution/es2020/nullish-coalescing.js';

describe('Nullish Coalescing', () => {
  describe('configurePort', () => {
    it('should return user port when provided', () => {
      expect(configurePort(8080)).toBe(8080);
    });

    it('should return default when undefined', () => {
      expect(configurePort(undefined)).toBe(3000);
    });

    it('should return 0 when user provides 0 (not nullish)', () => {
      expect(configurePort(0)).toBe(0);
    });
  });

  describe('greet', () => {
    it('should use provided name', () => {
      expect(greet('Alice')).toBe('Hello, Alice');
    });

    it('should use default for undefined', () => {
      expect(greet(undefined)).toBe('Hello, Guest');
    });

    it('should allow empty string (not nullish)', () => {
      expect(greet('')).toBe('Hello, ');
    });
  });

  describe('enableFeature', () => {
    it('should return true when undefined', () => {
      expect(enableFeature(undefined)).toBe(true);
    });

    it('should return false when explicitly false', () => {
      expect(enableFeature(false)).toBe(false);
    });

    it('should return true when explicitly true', () => {
      expect(enableFeature(true)).toBe(true);
    });
  });

  describe('createServerWithNullish', () => {
    it('should use all defaults for empty config', () => {
      const config = createServerWithNullish({});
      expect(config).toEqual({
        host: 'localhost',
        port: 3000,
        ssl: false,
        timeout: 5000
      });
    });

    it('should not override 0 port', () => {
      const config = createServerWithNullish({ port: 0 });
      expect(config.port).toBe(0);
    });

    it('should merge partial config', () => {
      const config = createServerWithNullish({ host: '0.0.0.0', ssl: true });
      expect(config).toEqual({
        host: '0.0.0.0',
        port: 3000,
        ssl: true,
        timeout: 5000
      });
    });
  });

  describe('getUserDisplayName', () => {
    it('should return user name when available', () => {
      const user: User = { profile: { name: 'Alice' } };
      expect(getUserDisplayName(user)).toBe('Alice');
    });

    it('should return Anonymous when name missing', () => {
      const user: User = { profile: {} };
      expect(getUserDisplayName(user)).toBe('Anonymous');
    });

    it('should return Anonymous for null user', () => {
      expect(getUserDisplayName(null)).toBe('Anonymous');
    });
  });
});
