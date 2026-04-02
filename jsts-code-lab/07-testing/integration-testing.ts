/**
 * @file 集成测试模式
 * @category Testing → Integration Tests
 * @difficulty medium
 * @tags testing, integration-test, api-testing, database-testing
 * 
 * @description
 * 集成测试验证多个组件协同工作的正确性：
 * - API 集成测试
 * - 数据库集成测试
 * - 服务间集成测试
 * - 测试容器模式
 */

// ============================================================================
// 1. 测试环境管理
// ============================================================================

export interface TestEnvironment {
  setup(): Promise<void>;
  teardown(): Promise<void>;
  getContext(): Record<string, unknown>;
}

export class DatabaseTestEnvironment implements TestEnvironment {
  private connection: MockDatabaseConnection | null = null;

  async setup(): Promise<void> {
    console.log('[TestEnv] 初始化测试数据库...');
    this.connection = new MockDatabaseConnection('test-db');
    await this.connection.connect();
    // 创建测试数据
    await this.seedData();
  }

  async teardown(): Promise<void> {
    console.log('[TestEnv] 清理测试数据库...');
    await this.connection?.disconnect();
    this.connection = null;
  }

  getContext(): { db: MockDatabaseConnection } {
    return { db: this.connection! };
  }

  private async seedData(): Promise<void> {
    // 插入测试数据
    await this.connection?.query(`
      INSERT INTO users (id, name, email) VALUES 
      ('1', 'Test User', 'test@example.com')
    `);
  }
}

// ============================================================================
// 2. 模拟数据库连接
// ============================================================================

export class MockDatabaseConnection {
  private data: Map<string, unknown[]> = new Map();
  private connected = false;

  constructor(private name: string) {}

  async connect(): Promise<void> {
    this.connected = true;
    console.log(`[DB] 连接到 ${this.name}`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log(`[DB] 断开 ${this.name} 连接`);
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    if (!this.connected) throw new Error('数据库未连接');
    
    // 简单模拟 SQL 查询
    const table = sql.match(/FROM\s+(\w+)/i)?.[1];
    if (table && sql.includes('SELECT')) {
      return this.data.get(table) || [];
    }
    
    if (sql.includes('INSERT')) {
      const table = sql.match(/INTO\s+(\w+)/i)?.[1];
      if (table) {
        const existing = this.data.get(table) || [];
        this.data.set(table, existing);
      }
    }
    
    return [];
  }

  async transaction<T>(fn: (trx: MockDatabaseConnection) => Promise<T>): Promise<T> {
    console.log('[DB] 开始事务');
    try {
      const result = await fn(this);
      console.log('[DB] 提交事务');
      return result;
    } catch (error) {
      console.log('[DB] 回滚事务');
      throw error;
    }
  }
}

// ============================================================================
// 3. API 集成测试
// ============================================================================

export interface ApiTestClient {
  get(url: string): Promise<{ status: number; body: unknown }>;
  post(url: string, body: unknown): Promise<{ status: number; body: unknown }>;
  put(url: string, body: unknown): Promise<{ status: number; body: unknown }>;
  delete(url: string): Promise<{ status: number; body: unknown }>;
}

export class MockApiTestClient implements ApiTestClient {
  private handlers: Map<string, (body?: unknown) => { status: number; body: unknown }> = new Map();

  register(method: string, path: string, handler: (body?: unknown) => { status: number; body: unknown }): void {
    this.handlers.set(`${method} ${path}`, handler);
  }

  async get(url: string): Promise<{ status: number; body: unknown }> {
    return this.request('GET', url);
  }

  async post(url: string, body: unknown): Promise<{ status: number; body: unknown }> {
    return this.request('POST', url, body);
  }

  async put(url: string, body: unknown): Promise<{ status: number; body: unknown }> {
    return this.request('PUT', url, body);
  }

  async delete(url: string): Promise<{ status: number; body: unknown }> {
    return this.request('DELETE', url);
  }

  private async request(method: string, url: string, body?: unknown): Promise<{ status: number; body: unknown }> {
    const handler = this.handlers.get(`${method} ${url}`);
    if (handler) {
      return handler(body);
    }
    return { status: 404, body: { error: 'Not found' } };
  }
}

// ============================================================================
// 4. 集成测试套件
// ============================================================================

export interface IntegrationTestSuite {
  name: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  tests: Array<{
    name: string;
    run: () => Promise<void>;
  }>;
}

export class IntegrationTestRunner {
  private suites: IntegrationTestSuite[] = [];

  addSuite(suite: IntegrationTestSuite): void {
    this.suites.push(suite);
  }

  async run(): Promise<{ passed: number; failed: number }> {
    let passed = 0;
    let failed = 0;

    for (const suite of this.suites) {
      console.log(`\n=== 测试套件: ${suite.name} ===`);
      
      try {
        if (suite.setup) await suite.setup();

        for (const test of suite.tests) {
          try {
            await test.run();
            console.log(`  ✓ ${test.name}`);
            passed++;
          } catch (error) {
            console.log(`  ✗ ${test.name}: ${error}`);
            failed++;
          }
        }

        if (suite.teardown) await suite.teardown();
      } catch (error) {
        console.error(`  套件设置失败: ${error}`);
        failed += suite.tests.length;
      }
    }

    console.log(`\n=== 测试结果: ${passed} 通过, ${failed} 失败 ===`);
    return { passed, failed };
  }
}

// ============================================================================
// 5. 端到端测试模式
// ============================================================================

export interface UserFlow {
  name: string;
  steps: Array<{
    action: string;
    expected: string;
  }>;
}

export class UserFlowTester {
  private context: Record<string, unknown> = {};

  async execute(flow: UserFlow, actions: Record<string, () => Promise<unknown>>): Promise<boolean> {
    console.log(`\n执行用户流程: ${flow.name}`);
    
    for (const step of flow.steps) {
      console.log(`  > ${step.action}`);
      
      const action = actions[step.action];
      if (!action) {
        console.log(`  ✗ 未知动作: ${step.action}`);
        return false;
      }

      try {
        const result = await action();
        this.context[step.action] = result;
        console.log(`  ✓ 预期: ${step.expected}`);
      } catch (error) {
        console.log(`  ✗ 失败: ${error}`);
        return false;
      }
    }
    
    return true;
  }

  getContext(): Record<string, unknown> {
    return { ...this.context };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 集成测试模式演示 ===\n');

  // 创建测试运行器
  const runner = new IntegrationTestRunner();
  const dbEnv = new DatabaseTestEnvironment();

  // 数据库集成测试套件
  runner.addSuite({
    name: '数据库集成测试',
    setup: () => dbEnv.setup(),
    teardown: () => dbEnv.teardown(),
    tests: [
      {
        name: '应该能查询用户',
        run: async () => {
          const { db } = dbEnv.getContext();
          const users = await db.query('SELECT * FROM users');
          if (users.length === 0) throw new Error('未找到用户');
        }
      },
      {
        name: '应该支持事务',
        run: async () => {
          const { db } = dbEnv.getContext();
          await db.transaction(async (trx) => {
            await trx.query('INSERT INTO users VALUES (2, "Alice", "alice@example.com")');
          });
        }
      }
    ]
  });

  // API 集成测试套件
  const apiClient = new MockApiTestClient();
  apiClient.register('GET', '/api/users', () => ({
    status: 200,
    body: { users: [{ id: '1', name: 'Test' }] }
  }));
  apiClient.register('POST', '/api/users', (body) => ({
    status: 201,
    body: { id: '2', ...(body as object) }
  }));

  runner.addSuite({
    name: 'API 集成测试',
    tests: [
      {
        name: 'GET /api/users 应该返回用户列表',
        run: async () => {
          const response = await apiClient.get('/api/users');
          if (response.status !== 200) throw new Error('状态码错误');
        }
      },
      {
        name: 'POST /api/users 应该创建用户',
        run: async () => {
          const response = await apiClient.post('/api/users', { name: 'New User' });
          if (response.status !== 201) throw new Error('创建失败');
        }
      }
    ]
  });

  // 运行测试
  await runner.run();

  // 用户流程测试
  console.log('\n=== 用户流程测试 ===');
  const flowTester = new UserFlowTester();
  const userFlow: UserFlow = {
    name: '用户注册和登录流程',
    steps: [
      { action: 'register', expected: '用户注册成功' },
      { action: 'login', expected: '登录成功，返回 token' },
      { action: 'getProfile', expected: '返回用户信息' }
    ]
  };

  await flowTester.execute(userFlow, {
    register: async () => ({ userId: '123' }),
    login: async () => ({ token: 'abc123' }),
    getProfile: async () => ({ name: 'Test User' })
  });
}

// ============================================================================
// 导出
// ============================================================================

;

;
