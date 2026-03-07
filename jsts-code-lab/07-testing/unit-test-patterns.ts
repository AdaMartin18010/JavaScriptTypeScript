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
