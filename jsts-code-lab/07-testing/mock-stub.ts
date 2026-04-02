/**
 * @file Mock 与 Stub 测试替身模式
 * @category Testing → Test Doubles
 * @difficulty medium
 * @tags testing, mock, stub, fake, spy, test-doubles
 * 
 * @description
 * 测试替身用于隔离被测代码，控制依赖行为：
 * - Dummy: 占位对象，仅用于填充参数
 * - Fake: 简化实现，用于替代真实组件
 * - Stub: 提供预定义的响应
 * - Spy: 记录调用信息
 * - Mock: 验证交互行为
 */

// ============================================================================
// 1. 假对象 (Fake) - 简化实现
// ============================================================================

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// 内存中的假存储实现
export class FakeUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, { ...user });
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // 测试辅助方法
  seed(users: User[]): void {
    users.forEach(u => this.users.set(u.id, u));
  }

  clear(): void {
    this.users.clear();
  }
}

// 假邮件服务
export interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

export class FakeEmailService implements EmailService {
  sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  async send(to: string, subject: string, body: string): Promise<void> {
    this.sentEmails.push({ to, subject, body });
    console.log(`[FakeEmail] 发送邮件给 ${to}: ${subject}`);
  }

  getSentCount(): number {
    return this.sentEmails.length;
  }

  wasEmailSent(to: string, subjectPattern?: RegExp): boolean {
    return this.sentEmails.some(
      e => e.to === to && (!subjectPattern || subjectPattern.test(e.subject))
    );
  }

  clear(): void {
    this.sentEmails = [];
  }
}

// ============================================================================
// 2. Stub - 预定义响应
// ============================================================================

export class StubPaymentGateway {
  private shouldSucceed = true;
  private responseDelay = 0;
  private nextTransactionId = 'TXN-001';

  setShouldSucceed(succeed: boolean): void {
    this.shouldSucceed = succeed;
  }

  setResponseDelay(ms: number): void {
    this.responseDelay = ms;
  }

  setNextTransactionId(id: string): void {
    this.nextTransactionId = id;
  }

  async charge(amount: number, cardToken: string): Promise<PaymentResult> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldSucceed) {
      return {
        success: true,
        transactionId: this.nextTransactionId,
        amount
      };
    } else {
      return {
        success: false,
        error: 'Payment declined',
        errorCode: 'DECLINED'
      };
    }
  }
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  error?: string;
  errorCode?: string;
}

// Stub HTTP 客户端
export class StubHttpClient {
  private responses: Map<string, unknown> = new Map();
  private defaultResponse: unknown = { error: 'Not stubbed' };

  stubGet(url: string, response: unknown): void {
    this.responses.set(`GET ${url}`, response);
  }

  stubPost(url: string, response: unknown): void {
    this.responses.set(`POST ${url}`, response);
  }

  setDefaultResponse(response: unknown): void {
    this.defaultResponse = response;
  }

  async get<T>(url: string): Promise<T> {
    const response = this.responses.get(`GET ${url}`) || this.defaultResponse;
    return response as T;
  }

  async post<T>(url: string, _body: unknown): Promise<T> {
    const response = this.responses.get(`POST ${url}`) || this.defaultResponse;
    return response as T;
  }

  clear(): void {
    this.responses.clear();
  }
}

// ============================================================================
// 3. Spy - 调用记录
// ============================================================================

export class SpyLogger {
  calls: Array<{ level: string; message: string; timestamp: number }> = [];

  debug(message: string): void {
    this.record('debug', message);
  }

  info(message: string): void {
    this.record('info', message);
  }

  warn(message: string): void {
    this.record('warn', message);
  }

  error(message: string): void {
    this.record('error', message);
  }

  private record(level: string, message: string): void {
    this.calls.push({ level, message, timestamp: Date.now() });
  }

  // 断言辅助方法
  wasCalledWith(level: string, messagePattern?: RegExp): boolean {
    return this.calls.some(
      c => c.level === level && (!messagePattern || messagePattern.test(c.message))
    );
  }

  getCallsByLevel(level: string): typeof this.calls {
    return this.calls.filter(c => c.level === level);
  }

  getCallCount(): number {
    return this.calls.length;
  }

  clear(): void {
    this.calls = [];
  }
}

// Spy 函数包装器
export function createSpy<T extends (...args: any[]) => any>(
  originalFn?: T
): SpyFunction<T> {
  const calls: Array<{ args: Parameters<T>; returnValue: ReturnType<T> }> = [];

  const spy = function (...args: Parameters<T>): ReturnType<T> {
    const returnValue = originalFn ? originalFn(...args) : undefined as ReturnType<T>;
    calls.push({ args, returnValue });
    return returnValue;
  } as SpyFunction<T>;

  spy.calls = calls;
  spy.wasCalledWith = (...expectedArgs: Parameters<T>): boolean => {
    return calls.some(c => 
      JSON.stringify(c.args) === JSON.stringify(expectedArgs)
    );
  };
  spy.getCallCount = (): number => calls.length;
  spy.reset = (): void => { calls.length = 0; };

  return spy;
}

export interface SpyFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  calls: Array<{ args: Parameters<T>; returnValue: ReturnType<T> }>;
  wasCalledWith(...args: Parameters<T>): boolean;
  getCallCount(): number;
  reset(): void;
}

// ============================================================================
// 4. Mock - 行为验证
// ============================================================================

export interface MockExpectation<T = unknown> {
  method: string;
  args?: unknown[];
  returns?: T;
  throws?: Error;
  times?: number;
}

export class MockObject<T extends object> {
  private expectations: MockExpectation[] = [];
  private actualCalls: Array<{ method: string; args: unknown[] }> = [];
  private stubbedMethods: Map<string, (...args: unknown[]) => unknown> = new Map();

  expect(method: keyof T): MockExpectationBuilder<T> {
    return new MockExpectationBuilder(this, method as string);
  }

  addExpectation(expectation: MockExpectation): void {
    this.expectations.push(expectation);
  }

  stub<K extends keyof T>(method: K, implementation: (...args: unknown[]) => unknown): void {
    this.stubbedMethods.set(method as string, implementation);
  }

  createMock(): T {
    const mock = {} as T;
    const self = this;

    // 创建代理拦截所有方法调用
    return new Proxy(mock, {
      get(target, prop) {
        if (typeof prop === 'string') {
          return (...args: unknown[]) => {
            self.actualCalls.push({ method: prop, args });

            const stub = self.stubbedMethods.get(prop);
            if (stub) {
              return stub(...args);
            }

            // 查找匹配的期望
            const expectation = self.expectations.find(e => e.method === prop);
            if (expectation?.throws) {
              throw expectation.throws;
            }
            return expectation?.returns;
          };
        }
        return target[prop as keyof T];
      }
    });
  }

  verify(): boolean {
    for (const expectation of this.expectations) {
      const matchingCalls = this.actualCalls.filter(
        c => c.method === expectation.method &&
             (!expectation.args || JSON.stringify(c.args) === JSON.stringify(expectation.args))
      );

      const expectedTimes = expectation.times ?? 1;
      if (matchingCalls.length !== expectedTimes) {
        throw new Error(
          `期望方法 "${expectation.method}" 被调用 ${expectedTimes} 次，实际调用了 ${matchingCalls.length} 次`
        );
      }
    }
    return true;
  }

  verifyAllCalled(): boolean {
    for (const expectation of this.expectations) {
      const wasCalled = this.actualCalls.some(c => c.method === expectation.method);
      if (!wasCalled) {
        throw new Error(`期望方法 "${expectation.method}" 未被调用`);
      }
    }
    return true;
  }

  reset(): void {
    this.expectations = [];
    this.actualCalls = [];
    this.stubbedMethods.clear();
  }
}

class MockExpectationBuilder<T extends object> {
  private expectation: MockExpectation = { method: '' };

  constructor(private mock: MockObject<T>, method: string) {
    this.expectation.method = method;
  }

  withArgs(...args: unknown[]): this {
    this.expectation.args = args;
    return this;
  }

  returns(value: unknown): this {
    this.expectation.returns = value;
    return this;
  }

  throws(error: Error): this {
    this.expectation.throws = error;
    return this;
  }

  times(count: number): this {
    this.expectation.times = count;
    return this;
  }

  once(): this {
    return this.times(1);
  }

  never(): this {
    return this.times(0);
  }

  apply(): void {
    this.mock.addExpectation(this.expectation);
  }
}

// ============================================================================
// 5. Dummy - 占位对象
// ============================================================================

export class DummyUser implements User {
  id = 'dummy-id';
  name = 'Dummy User';
  email = 'dummy@example.com';
}

// 使用 Dummy 填充不需要的参数
export function processOrder(
  orderId: string,
  _currentUser: User, // Dummy
  amount: number
): string {
  return `Order ${orderId} processed for $${amount}`;
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Mock 与 Stub 测试替身演示 ===\n');

  // Fake 示例
  console.log('--- Fake 假对象 ---');
  const userRepo = new FakeUserRepository();
  userRepo.seed([
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ]);
  console.log(`已种子化 ${(await userRepo.findAll()).length} 个用户`);

  // Stub 示例
  console.log('\n--- Stub 存根 ---');
  const paymentGateway = new StubPaymentGateway();
  paymentGateway.setShouldSucceed(true);
  paymentGateway.setNextTransactionId('TXN-ABC-123');
  
  const result = await paymentGateway.charge(99.99, 'card_token_123');
  console.log(`支付结果: ${result.success ? '成功' : '失败'}, 交易ID: ${result.transactionId}`);

  // Spy 示例
  console.log('\n--- Spy 间谍 ---');
  const spyLogger = new SpyLogger();
  spyLogger.info('应用启动');
  spyLogger.error('发生错误');
  spyLogger.info('操作完成');
  
  console.log(`总调用次数: ${spyLogger.getCallCount()}`);
  console.log(`错误调用: ${spyLogger.wasCalledWith('error')}`);

  // 函数 Spy
  const add = (a: number, b: number): number => a + b;
  const spiedAdd = createSpy(add);
  spiedAdd(1, 2);
  spiedAdd(3, 4);
  console.log(`add 被调用 ${spiedAdd.getCallCount()} 次`);
  console.log(`add(1, 2) 被调用: ${spiedAdd.wasCalledWith(1, 2)}`);

  // Mock 示例
  console.log('\n--- Mock 模拟对象 ---');
  interface Calculator {
    add(a: number, b: number): number;
    multiply(a: number, b: number): number;
  }

  const mockCalc = new MockObject<Calculator>();
  mockCalc.expect('add').withArgs(2, 3).returns(5).once().apply();
  mockCalc.expect('multiply').returns(10).times(2).apply();

  const calculator = mockCalc.createMock();
  calculator.add(2, 3);
  calculator.multiply(4, 5);
  calculator.multiply(6, 7);

  try {
    mockCalc.verify();
    console.log('所有期望都已满足 ✓');
  } catch (error) {
    console.log(`验证失败: ${error}`);
  }

  // Dummy 示例
  console.log('\n--- Dummy 占位对象 ---');
  const dummy = new DummyUser();
  const orderResult = processOrder('ORD-001', dummy, 199.99);
  console.log(orderResult);
}

// ============================================================================
// 导出
// ============================================================================

;

;
