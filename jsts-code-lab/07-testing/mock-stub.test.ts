import { describe, it, expect } from 'vitest';
import {
  FakeUserRepository,
  FakeEmailService,
  StubPaymentGateway,
  StubHttpClient,
  SpyLogger,
  createSpy,
  MockObject,
  DummyUser,
  processOrder,
  demo
} from './mock-stub';

describe('mock-stub', () => {
  describe('FakeUserRepository', () => {
    it('should save and find users', async () => {
      const repo = new FakeUserRepository();
      await repo.save({ id: '1', name: 'Alice', email: 'alice@example.com' });
      const user = await repo.findById('1');
      expect(user?.name).toBe('Alice');
    });

    it('should seed and clear', async () => {
      const repo = new FakeUserRepository();
      repo.seed([{ id: '1', name: 'Bob', email: 'bob@example.com' }]);
      expect((await repo.findAll()).length).toBe(1);
      repo.clear();
      expect((await repo.findAll()).length).toBe(0);
    });
  });

  describe('FakeEmailService', () => {
    it('should record sent emails', async () => {
      const service = new FakeEmailService();
      await service.send('a@example.com', 'Hello', 'Body');
      expect(service.getSentCount()).toBe(1);
      expect(service.wasEmailSent('a@example.com')).toBe(true);
    });

    it('should support pattern matching', async () => {
      const service = new FakeEmailService();
      await service.send('a@example.com', 'Welcome', 'Body');
      expect(service.wasEmailSent('a@example.com', /Welcome/)).toBe(true);
      expect(service.wasEmailSent('a@example.com', /Goodbye/)).toBe(false);
    });
  });

  describe('StubPaymentGateway', () => {
    it('should return success when configured', async () => {
      const gateway = new StubPaymentGateway();
      gateway.setShouldSucceed(true);
      gateway.setNextTransactionId('TXN-001');
      const result = await gateway.charge(100, 'token');
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN-001');
    });

    it('should return failure when configured', async () => {
      const gateway = new StubPaymentGateway();
      gateway.setShouldSucceed(false);
      const result = await gateway.charge(100, 'token');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('DECLINED');
    });
  });

  describe('StubHttpClient', () => {
    it('should return stubbed responses', async () => {
      const client = new StubHttpClient();
      client.stubGet('/users', [{ id: 1 }]);
      const result = await client.get('/users');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should return default response for unstubbed requests', async () => {
      const client = new StubHttpClient();
      client.setDefaultResponse({ error: 'default' });
      const result = await client.get('/missing');
      expect(result).toEqual({ error: 'default' });
    });
  });

  describe('SpyLogger', () => {
    it('should record log calls', () => {
      const logger = new SpyLogger();
      logger.info('start');
      logger.error('oops');
      expect(logger.getCallCount()).toBe(2);
      expect(logger.wasCalledWith('error')).toBe(true);
      expect(logger.getCallsByLevel('info').length).toBe(1);
    });
  });

  describe('createSpy', () => {
    it('should track function calls', () => {
      const add = (a: number, b: number) => a + b;
      const spy = createSpy(add);
      expect(spy(1, 2)).toBe(3);
      expect(spy(3, 4)).toBe(7);
      expect(spy.getCallCount()).toBe(2);
      expect(spy.wasCalledWith(1, 2)).toBe(true);
    });
  });

  describe('MockObject', () => {
    it('should verify expected calls', () => {
      interface Calc {
        add(a: number, b: number): number;
      }
      const mock = new MockObject<Calc>();
      mock.expect('add').withArgs(1, 2).returns(3).once().apply();
      const calc = mock.createMock();
      expect(calc.add(1, 2)).toBe(3);
      expect(mock.verify()).toBe(true);
    });

    it('should throw when call count mismatch', () => {
      interface Calc {
        add(a: number, b: number): number;
      }
      const mock = new MockObject<Calc>();
      mock.expect('add').returns(0).times(2).apply();
      const calc = mock.createMock();
      calc.add(1, 1);
      expect(() => mock.verify()).toThrow('期望方法 "add" 被调用 2 次');
    });
  });

  describe('DummyUser & processOrder', () => {
    it('should process order with dummy user', () => {
      const dummy = new DummyUser();
      expect(processOrder('ORD-001', dummy, 199.99)).toBe('Order ORD-001 processed for $199.99');
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
