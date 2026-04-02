/**
 * @file E2E 测试框架
 * @category Testing → E2E
 * @difficulty medium
 * @tags e2e-testing, playwright, puppeteer, automation
 * 
 * @description
 * 端到端测试实现：
 * - 页面操作
 * - 断言库
 * - 测试夹具
 * - 并行执行
 */

// ============================================================================
// 1. 页面操作 API
// ============================================================================

export interface Page {
  goto(url: string): Promise<void>;
  click(selector: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  select(selector: string, value: string): Promise<void>;
  press(key: string): Promise<void>;
  screenshot(path?: string): Promise<Buffer>;
  textContent(selector: string): Promise<string | null>;
  innerText(selector: string): Promise<string>;
  getAttribute(selector: string, name: string): Promise<string | null>;
  isVisible(selector: string): Promise<boolean>;
  isEnabled(selector: string): Promise<boolean>;
  waitForSelector(selector: string, timeout?: number): Promise<void>;
  waitForNavigation(): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
}

// ============================================================================
// 2. E2E 测试上下文
// ============================================================================

export class E2EContext {
  private page: Page;
  private testName: string;
  private steps: Array<{ action: string; timestamp: number }> = [];

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName;
  }

  async goto(url: string): Promise<void> {
    this.log('goto', url);
    await this.page.goto(url);
  }

  async click(selector: string): Promise<void> {
    this.log('click', selector);
    await this.page.click(selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    this.log('fill', `${selector} = ${value}`);
    await this.page.fill(selector, value);
  }

  async type(selector: string, value: string, delay = 50): Promise<void> {
    this.log('type', `${selector} = ${value}`);
    await this.page.click(selector);
    for (const char of value) {
      await this.page.press(char);
      await this.sleep(delay);
    }
  }

  async select(selector: string, value: string): Promise<void> {
    this.log('select', `${selector} = ${value}`);
    await this.page.select(selector, value);
  }

  async hover(selector: string): Promise<void> {
    this.log('hover', selector);
    await this.page.click(selector); // 简化实现
  }

  async screenshot(name?: string): Promise<void> {
    const filename = name || `screenshot-${Date.now()}.png`;
    this.log('screenshot', filename);
    await this.page.screenshot(filename);
  }

  // 断言方法
  async expectToHaveText(selector: string, expected: string): Promise<void> {
    const actual = await this.page.innerText(selector);
    if (actual !== expected) {
      throw new AssertionError(
        `Expected "${selector}" to have text "${expected}", but got "${actual}"`
      );
    }
  }

  async expectToContainText(selector: string, expected: string): Promise<void> {
    const actual = await this.page.innerText(selector);
    if (!actual.includes(expected)) {
      throw new AssertionError(
        `Expected "${selector}" to contain "${expected}", but got "${actual}"`
      );
    }
  }

  async expectToBeVisible(selector: string): Promise<void> {
    const visible = await this.page.isVisible(selector);
    if (!visible) {
      throw new AssertionError(`Expected "${selector}" to be visible`);
    }
  }

  async expectToBeHidden(selector: string): Promise<void> {
    const visible = await this.page.isVisible(selector);
    if (visible) {
      throw new AssertionError(`Expected "${selector}" to be hidden`);
    }
  }

  async expectToHaveValue(selector: string, expected: string): Promise<void> {
    const actual = await this.page.getAttribute(selector, 'value');
    if (actual !== expected) {
      throw new AssertionError(
        `Expected "${selector}" to have value "${expected}", but got "${actual}"`
      );
    }
  }

  async expectToHaveAttribute(selector: string, attr: string, expected: string): Promise<void> {
    const actual = await this.page.getAttribute(selector, attr);
    if (actual !== expected) {
      throw new AssertionError(
        `Expected "${selector}" to have attribute "${attr}"="${expected}", but got "${actual}"`
      );
    }
  }

  async waitForSelector(selector: string, timeout = 5000): Promise<void> {
    this.log('waitForSelector', selector);
    await this.page.waitForSelector(selector, timeout);
  }

  async waitForText(selector: string, text: string, timeout = 5000): Promise<void> {
    this.log('waitForText', `${selector}: "${text}"`);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const content = await this.page.textContent(selector);
      if (content?.includes(text)) return;
      await this.sleep(100);
    }
    throw new Error(`Timeout waiting for text "${text}" in "${selector}"`);
  }

  // 实用方法
  async clearCookies(): Promise<void> {
    this.log('clearCookies', '');
    // 简化实现
  }

  async setViewport(width: number, height: number): Promise<void> {
    this.log('setViewport', `${width}x${height}`);
    // 简化实现
  }

  getSteps() {
    return this.steps;
  }

  private log(action: string, details: string): void {
    this.steps.push({ action: `${action}: ${details}`, timestamp: Date.now() });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

// ============================================================================
// 3. 测试夹具
// ============================================================================

export interface TestFixture<T> {
  setup(): Promise<T>;
  teardown(value: T): Promise<void>;
}

export class FixtureManager {
  private fixtures: Map<string, { value: unknown; fixture: TestFixture<unknown> }> = new Map();

  async use<T>(name: string, fixture: TestFixture<T>): Promise<T> {
    if (this.fixtures.has(name)) {
      return this.fixtures.get(name)!.value as T;
    }

    const value = await fixture.setup();
    this.fixtures.set(name, { value, fixture });
    return value;
  }

  async cleanup(): Promise<void> {
    for (const [name, { value, fixture }] of this.fixtures) {
      await fixture.teardown(value);
    }
    this.fixtures.clear();
  }
}

// 常用夹具
export const Fixtures = {
  // 模拟浏览器页面
  mockPage(): TestFixture<Page> {
    const mockPage: Page = {
      goto: async () => {},
      click: async () => {},
      fill: async () => {},
      select: async () => {},
      press: async () => {},
      screenshot: async () => Buffer.from([]),
      textContent: async () => '',
      innerText: async () => '',
      getAttribute: async () => null,
      isVisible: async () => true,
      isEnabled: async () => true,
      waitForSelector: async () => {},
      waitForNavigation: async () => {},
      evaluate: async <T>(fn: () => T): Promise<T> => fn()
    };

    return {
      setup: async () => mockPage,
      teardown: async () => {}
    };
  },

  // 测试数据库
  testDatabase(): TestFixture<{ query: (sql: string) => Promise<unknown[]> }> {
    return {
      setup: async () => ({
        query: async (sql: string) => {
          console.log(`[Test DB] ${sql}`);
          return [];
        }
      }),
      teardown: async () => {
        console.log('[Test DB] Cleaned up');
      }
    };
  },

  // 测试用户
  authenticatedUser(user = { id: '1', email: 'test@example.com' }): TestFixture<typeof user> {
    return {
      setup: async () => user,
      teardown: async () => {}
    };
  }
};

// ============================================================================
// 4. 测试运行器
// ============================================================================

export interface TestCase {
  name: string;
  fn: (context: E2EContext) => Promise<void>;
  skip?: boolean;
  only?: boolean;
}

export class E2ETestRunner {
  private tests: TestCase[] = [];
  private beforeEachHooks: Array<(context: E2EContext) => Promise<void>> = [];
  private afterEachHooks: Array<(context: E2EContext) => Promise<void>> = [];
  private fixtures: FixtureManager = new FixtureManager();

  test(name: string, fn: (context: E2EContext) => Promise<void>): void {
    this.tests.push({ name, fn });
  }

  testSkip(name: string, fn: (context: E2EContext) => Promise<void>): void {
    this.tests.push({ name, fn, skip: true });
  }

  testOnly(name: string, fn: (context: E2EContext) => Promise<void>): void {
    this.tests.push({ name, fn, only: true });
  }

  beforeEach(fn: (context: E2EContext) => Promise<void>): void {
    this.beforeEachHooks.push(fn);
  }

  afterEach(fn: (context: E2EContext) => Promise<void>): void {
    this.afterEachHooks.push(fn);
  }

  async run(): Promise<{ passed: number; failed: number; skipped: number }> {
    const results = { passed: 0, failed: 0, skipped: 0 };
    
    // 检查是否有 only 测试
    const hasOnly = this.tests.some(t => t.only);
    const testsToRun = hasOnly ? this.tests.filter(t => t.only) : this.tests;

    console.log(`\nRunning ${testsToRun.length} E2E tests...\n`);

    for (const test of testsToRun) {
      if (test.skip) {
        console.log(`⏭️  SKIP: ${test.name}`);
        results.skipped++;
        continue;
      }

      const mockPage = await this.fixtures.use('page', Fixtures.mockPage());
      const context = new E2EContext(mockPage, test.name);

      try {
        // 执行 beforeEach
        for (const hook of this.beforeEachHooks) {
          await hook(context);
        }

        // 执行测试
        await test.fn(context);

        // 执行 afterEach
        for (const hook of this.afterEachHooks) {
          await hook(context);
        }

        console.log(`✅ PASS: ${test.name}`);
        results.passed++;
      } catch (error) {
        console.log(`❌ FAIL: ${test.name}`);
        console.error(`   ${(error as Error).message}`);
        results.failed++;
      }
    }

    await this.fixtures.cleanup();

    console.log(`\nResults: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`);
    return results;
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== E2E 测试框架 ===\n');

  const runner = new E2ETestRunner();

  // 全局设置
  runner.beforeEach(async (ctx) => {
    await ctx.goto('https://example.com');
  });

  // 测试用例
  runner.test('user can login', async (ctx) => {
    await ctx.click('[data-testid="login-button"]');
    await ctx.fill('[data-testid="email-input"]', 'user@example.com');
    await ctx.fill('[data-testid="password-input"]', 'password123');
    await ctx.click('[data-testid="submit-button"]');
    await ctx.waitForSelector('[data-testid="dashboard"]', 5000);
    await ctx.expectToBeVisible('[data-testid="dashboard"]');
  });

  runner.test('user can add item to cart', async (ctx) => {
    await ctx.goto('https://example.com/products');
    await ctx.click('[data-testid="product-1"]');
    await ctx.click('[data-testid="add-to-cart"]');
    await ctx.expectToContainText('[data-testid="cart-count"]', '1');
  });

  runner.test('form validation shows errors', async (ctx) => {
    await ctx.click('[data-testid="submit-button"]');
    await ctx.expectToBeVisible('[data-testid="error-message"]');
    await ctx.expectToContainText('[data-testid="error-message"]', 'required');
  });

  runner.testSkip('wip: checkout flow', async (ctx) => {
    // 未完成
  });

  // 运行测试
  const results = await runner.run();

  console.log('\nE2E 测试要点:');
  console.log('- 使用 data-testid 定位元素，避免依赖样式');
  console.log('- 显式等待替代固定等待时间');
  console.log('- 每个测试应该独立，不依赖其他测试');
  console.log('- 使用夹具管理测试数据');
  console.log('- 失败时自动截图保留现场');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
