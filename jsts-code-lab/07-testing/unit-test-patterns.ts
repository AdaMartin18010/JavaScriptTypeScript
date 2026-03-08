/**
 * @file 单元测试模式
 * @category Testing → Unit Tests
 * @difficulty medium
 * @tags testing, unit-test, patterns, best-practices
 */

// ============================================================================
// 1. AAA 模式 (Arrange-Act-Assert)
// ============================================================================

function add(a: number, b: number): number {
  return a + b;
}

// 测试示例 (使用 Vitest/Jest 语法)
/*
describe('add', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const a = 2;
    const b = 3;
    const expected = 5;
    
    // Act
    const result = add(a, b);
    
    // Assert
    expect(result).toBe(expected);
  });
});
*/

// ============================================================================
// 2. 测试替身 (Test Doubles)
// ============================================================================

// 模拟对象
interface Database {
  query(sql: string): Promise<unknown[]>;
}

class MockDatabase implements Database {
  private responses = new Map<string, unknown[]>();

  setResponse(sql: string, data: unknown[]): void {
    this.responses.set(sql, data);
  }

  async query(sql: string): Promise<unknown[]> {
    return this.responses.get(sql) || [];
  }
}

// 存根 (Stub)
class StubEmailService {
  private shouldSucceed = true;

  setShouldSucceed(value: boolean): void {
    this.shouldSucceed = value;
  }

  async send(to: string, subject: string): Promise<boolean> {
    return this.shouldSucceed;
  }
}

// 间谍 (Spy)
class SpyLogger {
  logs: string[] = [];

  log(message: string): void {
    this.logs.push(message);
  }

  wasCalledWith(message: string): boolean {
    return this.logs.includes(message);
  }
}

// ============================================================================
// 3. 参数化测试
// ============================================================================

interface TestCase<T, R> {
  input: T;
  expected: R;
  description: string;
}

function runParameterizedTests<T, R>(
  fn: (input: T) => R,
  cases: TestCase<T, R>[]
): void {
  for (const testCase of cases) {
    const { input, expected, description } = testCase;
    const result = fn(input);
    const passed = JSON.stringify(result) === JSON.stringify(expected);
    console.log(`${passed ? '✓' : '✗'} ${description}`);
    if (!passed) {
      console.log(`  Expected: ${JSON.stringify(expected)}`);
      console.log(`  Got: ${JSON.stringify(result)}`);
    }
  }
}

// ============================================================================
// 4. 边界测试
// ============================================================================

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const emailTestCases: TestCase<string, boolean>[] = [
  { input: 'test@example.com', expected: true, description: 'valid email' },
  { input: '', expected: false, description: 'empty string' },
  { input: 'test@', expected: false, description: 'missing domain' },
  { input: '@example.com', expected: false, description: 'missing local' },
  { input: 'test@@example.com', expected: false, description: 'double @' },
  { input: 'a'.repeat(250) + '@example.com', expected: true, description: 'very long local' }
];

// ============================================================================
// 5. 异步测试模式
// ============================================================================

async function fetchUserData(userId: string): Promise<{ id: string; name: string }> {
  // 模拟 API 调用
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id: userId, name: 'User ' + userId });
    }, 100);
  });
}

// 测试模式
/*
it('should fetch user data', async () => {
  const user = await fetchUserData('123');
  expect(user.id).toBe('123');
  expect(user.name).toBe('User 123');
});

it('should handle fetch error', async () => {
  await expect(fetchUserData('invalid'))
    .rejects
    .toThrow('User not found');
});
*/

// ============================================================================
// 6. Setup 和 Teardown 模式
// ============================================================================

class TestDatabase {
  private data = new Map<string, unknown>();

  setup(): void {
    this.data.clear();
    // 插入测试数据
    this.data.set('test-user', { id: '1', name: 'Test' });
  }

  teardown(): void {
    this.data.clear();
  }

  get(id: string): unknown {
    return this.data.get(id);
  }
}

// ============================================================================
// 7. 快照测试概念
// ============================================================================

function createSnapshot(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function matchSnapshot(actual: unknown, expected: string): boolean {
  return createSnapshot(actual) === expected;
}

// ============================================================================
// 8. 属性测试 (Property-based Testing) 概念
// ============================================================================

function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function propertyTest<T>(
  generator: () => T,
  property: (value: T) => boolean,
  iterations = 100
): boolean {
  for (let i = 0; i < iterations; i++) {
    const value = generator();
    if (!property(value)) {
      console.log('Property failed for:', value);
      return false;
    }
  }
  return true;
}

// 示例：加法交换律
const commutativityTest = propertyTest(
  () => [generateRandomInt(-1000, 1000), generateRandomInt(-1000, 1000)],
  ([a, b]) => add(a, b) === add(b, a),
  1000
);

// ============================================================================
// 导出
// ============================================================================

export {
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
  commutativityTest
};

export type { Database, TestCase };

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 单元测试模式演示 ===\n');

  // 1. AAA 模式演示
  console.log('--- AAA 模式 (Arrange-Act-Assert) ---');
  console.log('测试 add(2, 3):');
  // Arrange
  const a = 2;
  const b = 3;
  const expected = 5;
  // Act
  const result = add(a, b);
  // Assert
  console.log(`  结果: ${result}, 期望: ${expected}, ${result === expected ? '✓ 通过' : '✗ 失败'}`);

  // 2. 参数化测试
  console.log('\n--- 参数化测试 ---');
  console.log('测试 validateEmail:');
  runParameterizedTests(validateEmail, emailTestCases);

  // 3. 测试替身
  console.log('\n--- 测试替身 ---');
  
  // Mock
  const mockDb = new MockDatabase();
  mockDb.setResponse('SELECT * FROM users', [{ id: 1, name: 'Alice' }]);
  const users = await mockDb.query('SELECT * FROM users');
  console.log(`MockDatabase 查询结果: ${JSON.stringify(users)}`);

  // Stub
  const stubEmail = new StubEmailService();
  stubEmail.setShouldSucceed(true);
  const emailResult = await stubEmail.send('test@example.com', 'Hello');
  console.log(`StubEmailService 发送结果: ${emailResult ? '成功' : '失败'}`);

  // Spy
  const spyLogger = new SpyLogger();
  spyLogger.log('Error occurred');
  spyLogger.log('Operation completed');
  console.log(`SpyLogger 被调用次数: ${spyLogger.logs.length}`);
  console.log(`是否记录 'Error occurred': ${spyLogger.wasCalledWith('Error occurred') ? '是' : '否'}`);

  // 4. Setup/Teardown
  console.log('\n--- Setup/Teardown ---');
  const testDb = new TestDatabase();
  testDb.setup();
  console.log(`Setup 后获取 test-user: ${JSON.stringify(testDb.get('test-user'))}`);
  testDb.teardown();
  console.log(`Teardown 后获取 test-user: ${testDb.get('test-user') ?? 'undefined'}`);

  // 5. 快照测试
  console.log('\n--- 快照测试 ---');
  const data = { id: 1, name: 'Test', items: [1, 2, 3] };
  const snapshot = createSnapshot(data);
  console.log('生成的快照:');
  console.log(snapshot);
  console.log(`快照匹配: ${matchSnapshot(data, snapshot) ? '✓ 是' : '✗ 否'}`);

  // 6. 异步测试
  console.log('\n--- 异步测试 ---');
  console.log('获取用户数据...');
  const user = await fetchUserData('123');
  console.log(`获取结果: ${JSON.stringify(user)}`);

  // 7. 属性测试
  console.log('\n--- 属性测试 ---');
  console.log('测试加法交换律 (a + b = b + a):');
  const propertyPassed = propertyTest(
    () => [generateRandomInt(-100, 100), generateRandomInt(-100, 100)],
    ([a, b]) => add(a, b) === add(b, a),
    100
  );
  console.log(`测试结果: ${propertyPassed ? '✓ 通过' : '✗ 失败'}`);

  console.log('\n=== 演示结束 ===\n');
}
