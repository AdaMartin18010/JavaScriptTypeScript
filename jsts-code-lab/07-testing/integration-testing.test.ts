import { describe, it, expect } from 'vitest';
import {
  DatabaseTestEnvironment,
  MockDatabaseConnection,
  MockApiTestClient,
  IntegrationTestRunner,
  UserFlowTester,
  demo
} from './integration-testing';

describe('integration-testing', () => {
  describe('MockDatabaseConnection', () => {
    it('should connect and disconnect', async () => {
      const db = new MockDatabaseConnection('test');
      await db.connect();
      expect(async () => await db.disconnect()).not.toThrow();
    });

    it('should throw when querying disconnected db', async () => {
      const db = new MockDatabaseConnection('test');
      await expect(db.query('SELECT * FROM users')).rejects.toThrow('数据库未连接');
    });

    it('should support transactions', async () => {
      const db = new MockDatabaseConnection('test');
      await db.connect();
      const result = await db.transaction(async (trx) => {
        return 'tx-done';
      });
      expect(result).toBe('tx-done');
    });
  });

  describe('DatabaseTestEnvironment', () => {
    it('should setup and teardown', async () => {
      const env = new DatabaseTestEnvironment();
      await env.setup();
      const ctx = env.getContext();
      expect(ctx.db).toBeInstanceOf(MockDatabaseConnection);
      await env.teardown();
    });
  });

  describe('MockApiTestClient', () => {
    it('should return registered responses', async () => {
      const client = new MockApiTestClient();
      client.register('GET', '/users', () => ({ status: 200, body: [{ id: 1 }] }));
      const response = await client.get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1 }]);
    });

    it('should return 404 for unregistered routes', async () => {
      const client = new MockApiTestClient();
      const response = await client.get('/missing');
      expect(response.status).toBe(404);
    });

    it('should support POST', async () => {
      const client = new MockApiTestClient();
      client.register('POST', '/users', (body) => ({ status: 201, body }));
      const response = await client.post('/users', { name: 'Alice' });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ name: 'Alice' });
    });
  });

  describe('IntegrationTestRunner', () => {
    it('should run suites and report results', async () => {
      const runner = new IntegrationTestRunner();
      runner.addSuite({
        name: 'suite-1',
        tests: [
          { name: 'passing test', run: async () => {} }
        ]
      });
      const result = await runner.run();
      expect(result.passed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should count failed tests', async () => {
      const runner = new IntegrationTestRunner();
      runner.addSuite({
        name: 'suite-1',
        tests: [
          { name: 'failing test', run: async () => { throw new Error('fail'); } }
        ]
      });
      const result = await runner.run();
      expect(result.passed).toBe(0);
      expect(result.failed).toBe(1);
    });
  });

  describe('UserFlowTester', () => {
    it('should execute user flow', async () => {
      const tester = new UserFlowTester();
      const flow = {
        name: 'signup',
        steps: [
          { action: 'register', expected: '注册成功' },
          { action: 'login', expected: '登录成功' }
        ]
      };
      const result = await tester.execute(flow, {
        register: async () => ({ id: 1 }),
        login: async () => ({ token: 'abc' })
      });
      expect(result).toBe(true);
    });

    it('should return false for unknown action', async () => {
      const tester = new UserFlowTester();
      const flow = {
        name: 'bad-flow',
        steps: [{ action: 'unknown', expected: 'fail' }]
      };
      const result = await tester.execute(flow, {});
      expect(result).toBe(false);
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
