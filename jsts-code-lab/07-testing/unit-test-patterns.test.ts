import { describe, it, expect } from 'vitest';
import {
  add,
  validateEmail,
  fetchUserData,
  MockDatabase,
  StubEmailService,
  SpyLogger,
  runParameterizedTests,
  TestDatabase,
  createSnapshot,
  matchSnapshot,
  propertyTest,
  generateRandomInt,
  demo
} from './unit-test-patterns.js';

describe('unit-test-patterns', () => {
  describe('add', () => {
    it('should add two numbers', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@@example.com')).toBe(false);
    });
  });

  describe('fetchUserData', () => {
    it('should resolve with user data', async () => {
      const user = await fetchUserData('123');
      expect(user.id).toBe('123');
      expect(user.name).toBe('User 123');
    });
  });

  describe('MockDatabase', () => {
    it('should return configured responses', async () => {
      const db = new MockDatabase();
      db.setResponse('SELECT * FROM users', [{ id: 1 }]);
      const result = await db.query('SELECT * FROM users');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should return empty array for unknown queries', async () => {
      const db = new MockDatabase();
      const result = await db.query('SELECT 1');
      expect(result).toEqual([]);
    });
  });

  describe('StubEmailService', () => {
    it('should return success when configured', async () => {
      const service = new StubEmailService();
      service.setShouldSucceed(true);
      expect(await service.send('a@b.com', 'Hello')).toBe(true);
    });

    it('should return failure when configured', async () => {
      const service = new StubEmailService();
      service.setShouldSucceed(false);
      expect(await service.send('a@b.com', 'Hello')).toBe(false);
    });
  });

  describe('SpyLogger', () => {
    it('should track logged messages', () => {
      const logger = new SpyLogger();
      logger.log('msg1');
      logger.log('msg2');
      expect(logger.wasCalledWith('msg1')).toBe(true);
      expect(logger.logs.length).toBe(2);
    });
  });

  describe('runParameterizedTests', () => {
    it('should run multiple test cases', () => {
      // This function only logs, so we just ensure it doesn't throw
      const cases = [
        { input: 'test@example.com', expected: true, description: 'valid' },
        { input: 'bad', expected: false, description: 'invalid' }
      ];
      expect(() => { runParameterizedTests(validateEmail, cases); }).not.toThrow();
    });
  });

  describe('TestDatabase', () => {
    it('should setup and teardown', () => {
      const db = new TestDatabase();
      db.setup();
      expect(db.get('test-user')).toEqual({ id: '1', name: 'Test' });
      db.teardown();
      expect(db.get('test-user')).toBeUndefined();
    });
  });

  describe('snapshot helpers', () => {
    it('should create and match snapshot', () => {
      const data = { a: 1, b: [2, 3] };
      const snapshot = createSnapshot(data);
      expect(matchSnapshot(data, snapshot)).toBe(true);
      expect(matchSnapshot({ a: 2 }, snapshot)).toBe(false);
    });
  });

  describe('propertyTest', () => {
    it('should pass for commutative addition', () => {
      const result = propertyTest(
        () => [generateRandomInt(-100, 100), generateRandomInt(-100, 100)],
        ([a, b]) => add(a, b) === add(b, a),
        100
      );
      expect(result).toBe(true);
    });

    it('should fail for incorrect property', () => {
      const result = propertyTest(
        () => generateRandomInt(1, 10),
        (n) => n > 100,
        10
      );
      expect(result).toBe(false);
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
