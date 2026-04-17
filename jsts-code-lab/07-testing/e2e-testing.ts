/**
 * @file E2E 端到端测试模式
 * @category Testing → E2E Tests
 * @difficulty hard
 * @tags testing, e2e, end-to-end, browser-automation
 * 
 * @description
 * 端到端测试模拟真实用户场景，验证整个应用流程：
 * - 页面对象模式 (Page Object Model)
 * - 屏幕截图对比
 * - 跨浏览器测试
 * - 可视回归测试
 */

// ============================================================================
// 1. 页面对象模式 (Page Object Model)
// ============================================================================

export interface Page {
  navigate(url: string): Promise<void>;
  find(selector: string): Promise<ElementHandle>;
  findAll(selector: string): Promise<ElementHandle[]>;
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  getText(selector: string): Promise<string>;
  screenshot(): Promise<Buffer>;
}

export interface ElementHandle {
  click(): Promise<void>;
  type(text: string): Promise<void>;
  getText(): Promise<string>;
  getAttribute(name: string): Promise<string | null>;
  isVisible(): Promise<boolean>;
}

// 基础页面类
export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.navigate(url);
  }

  async takeScreenshot(name: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    console.log(`[Screenshot] 保存截图: ${name} (${screenshot.length} bytes)`);
  }
}

// 登录页面对象
export class LoginPage extends BasePage {
  private readonly selectors = {
    username: '[data-testid="username"]',
    password: '[data-testid="password"]',
    submitButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    welcomeMessage: '[data-testid="welcome-message"]'
  };

  async login(username: string, password: string): Promise<void> {
    await this.page.type(this.selectors.username, username);
    await this.page.type(this.selectors.password, password);
    await this.page.click(this.selectors.submitButton);
  }

  async getErrorMessage(): Promise<string> {
    return this.page.getText(this.selectors.errorMessage);
  }

  async isWelcomeMessageVisible(): Promise<boolean> {
    try {
      const element = await this.page.find(this.selectors.welcomeMessage);
      return await element.isVisible();
    } catch {
      return false;
    }
  }
}

// 产品列表页面对象
export class ProductListPage extends BasePage {
  private readonly selectors = {
    productCard: '[data-testid="product-card"]',
    productName: '[data-testid="product-name"]',
    productPrice: '[data-testid="product-price"]',
    addToCartButton: '[data-testid="add-to-cart"]',
    cartCount: '[data-testid="cart-count"]',
    searchInput: '[data-testid="search-input"]'
  };

  async searchProducts(query: string): Promise<void> {
    await this.page.type(this.selectors.searchInput, query);
    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  async getProductCount(): Promise<number> {
    const products = await this.page.findAll(this.selectors.productCard);
    return products.length;
  }

  async addProductToCart(index: number): Promise<void> {
    const buttons = await this.page.findAll(this.selectors.addToCartButton);
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async getCartCount(): Promise<string> {
    return this.page.getText(this.selectors.cartCount);
  }
}

// ============================================================================
// 2. 模拟页面实现
// ============================================================================

export class MockPage implements Page {
  private url = '';
  private elements = new Map<string, MockElement>();

  constructor(private mockHtml = '') {}

  async navigate(url: string): Promise<void> {
    this.url = url;
    console.log(`[Browser] 导航到: ${url}`);
    this.parseMockHtml();
  }

  async find(selector: string): Promise<ElementHandle> {
    const element = this.elements.get(selector);
    if (!element) throw new Error(`元素未找到: ${selector}`);
    return element;
  }

  async findAll(selector: string): Promise<ElementHandle[]> {
    const results: ElementHandle[] = [];
    for (const [key, value] of this.elements) {
      if (key.startsWith(selector) || key.includes(selector.replace('[', '').replace(']', ''))) {
        results.push(value);
      }
    }
    return results;
  }

  async click(selector: string): Promise<void> {
    const element = await this.find(selector);
    await element.click();
  }

  async type(selector: string, text: string): Promise<void> {
    const element = await this.find(selector);
    await element.type(text);
  }

  async getText(selector: string): Promise<string> {
    const element = await this.find(selector);
    return element.getText();
  }

  async screenshot(): Promise<Buffer> {
    return Buffer.from(`Screenshot of ${this.url}`);
  }

  private parseMockHtml(): void {
    // 模拟解析 HTML 创建元素
    this.elements.set('[data-testid="username"]', new MockElement('input', ''));
    this.elements.set('[data-testid="password"]', new MockElement('input', ''));
    this.elements.set('[data-testid="login-button"]', new MockElement('button', '登录'));
    this.elements.set('[data-testid="welcome-message"]', new MockElement('div', '欢迎回来!'));
  }
}

class MockElement implements ElementHandle {
  private text: string;
  private attributes = new Map<string, string>();
  private visible = true;

  constructor(private tag: string, initialText = '') {
    this.text = initialText;
  }

  async click(): Promise<void> {
    console.log(`[Element] 点击 ${this.tag}`);
  }

  async type(text: string): Promise<void> {
    this.text = text;
    console.log(`[Element] 输入: ${text}`);
  }

  async getText(): Promise<string> {
    return this.text;
  }

  async getAttribute(name: string): Promise<string | null> {
    return this.attributes.get(name) || null;
  }

  async isVisible(): Promise<boolean> {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }
}

// ============================================================================
// 3. 视觉回归测试
// ============================================================================

export interface ScreenshotOptions {
  threshold?: number; // 差异阈值 0-1
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
}

export class VisualRegressionTester {
  private baselineScreenshots = new Map<string, Buffer>();

  async captureBaseline(name: string, page: Page, options?: ScreenshotOptions): Promise<void> {
    const screenshot = await page.screenshot();
    this.baselineScreenshots.set(name, screenshot);
    console.log(`[Visual] 基线截图已保存: ${name}`);
  }

  async compare(name: string, page: Page, options: ScreenshotOptions = {}): Promise<ComparisonResult> {
    const baseline = this.baselineScreenshots.get(name);
    if (!baseline) {
      throw new Error(`基线截图不存在: ${name}`);
    }

    const current = await page.screenshot();
    const diff = this.calculateDiff(baseline, current);
    const threshold = options.threshold || 0.1;
    const passed = diff <= threshold;

    return {
      name,
      passed,
      diffPercentage: diff,
      threshold
    };
  }

  private calculateDiff(baseline: Buffer, current: Buffer): number {
    // 简化的差异计算（实际应使用像素比较算法如 pixelmatch）
    if (baseline.length === current.length) {
      let diffCount = 0;
      for (let i = 0; i < baseline.length; i++) {
        if (baseline[i] !== current[i]) diffCount++;
      }
      return diffCount / baseline.length;
    }
    return 1; // 完全不同
  }
}

export interface ComparisonResult {
  name: string;
  passed: boolean;
  diffPercentage: number;
  threshold: number;
}

// ============================================================================
// 4. 跨浏览器测试支持
// ============================================================================

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface BrowserCapabilities {
  type: BrowserType;
  headless: boolean;
  viewport: { width: number; height: number };
  userAgent?: string;
}

export class CrossBrowserTester {
  private browsers = new Map<BrowserType, BrowserCapabilities>();

  addBrowser(capabilities: BrowserCapabilities): void {
    this.browsers.set(capabilities.type, capabilities);
  }

  async runOnAllBrowsers<T>(
    testFn: (browser: BrowserCapabilities, page: Page) => Promise<T>
  ): Promise<Map<BrowserType, T | Error>> {
    const results = new Map<BrowserType, T | Error>();

    for (const [type, capabilities] of this.browsers) {
      console.log(`[CrossBrowser] 在 ${type} 上运行测试...`);
      try {
        const mockPage = new MockPage();
        const result = await testFn(capabilities, mockPage);
        results.set(type, result);
      } catch (error) {
        results.set(type, error as Error);
      }
    }

    return results;
  }
}

// ============================================================================
// 5. E2E 测试场景定义
// ============================================================================

export interface E2EScenario {
  name: string;
  steps: {
    description: string;
    action: (context: TestContext) => Promise<void>;
  }[];
}

export interface TestContext {
  page: Page;
  data: Record<string, unknown>;
}

export class E2ETestRunner {
  private scenarios: E2EScenario[] = [];

  addScenario(scenario: E2EScenario): void {
    this.scenarios.push(scenario);
  }

  async run(): Promise<{ passed: number; failed: number }> {
    let passed = 0;
    let failed = 0;

    for (const scenario of this.scenarios) {
      console.log(`\n=== E2E 场景: ${scenario.name} ===`);
      const context: TestContext = {
        page: new MockPage(),
        data: {}
      };

      try {
        for (const step of scenario.steps) {
          console.log(`  > ${step.description}`);
          await step.action(context);
        }
        console.log(`  ✓ 场景完成`);
        passed++;
      } catch (error) {
        console.log(`  ✗ 场景失败: ${error}`);
        failed++;
      }
    }

    return { passed, failed };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== E2E 端到端测试演示 ===\n');

  // 页面对象模式示例
  console.log('--- 页面对象模式 ---');
  const mockPage = new MockPage();
  const loginPage = new LoginPage(mockPage);
  
  await loginPage.navigate('https://example.com/login');
  await loginPage.login('user@example.com', 'password123');
  const isLoggedIn = await loginPage.isWelcomeMessageVisible();
  console.log(`登录状态: ${isLoggedIn ? '成功' : '失败'}`);

  // 视觉回归测试
  console.log('\n--- 视觉回归测试 ---');
  const visualTester = new VisualRegressionTester();
  await visualTester.captureBaseline('homepage', mockPage);
  const comparison = await visualTester.compare('homepage', mockPage);
  console.log(`视觉对比结果: ${comparison.passed ? '通过' : '失败'} (${(comparison.diffPercentage * 100).toFixed(2)}% 差异)`);

  // 跨浏览器测试
  console.log('\n--- 跨浏览器测试 ---');
  const crossBrowserTester = new CrossBrowserTester();
  crossBrowserTester.addBrowser({
    type: 'chromium',
    headless: true,
    viewport: { width: 1920, height: 1080 }
  });
  crossBrowserTester.addBrowser({
    type: 'firefox',
    headless: true,
    viewport: { width: 1920, height: 1080 }
  });

  const browserResults = await crossBrowserTester.runOnAllBrowsers(async (browser, page) => {
    await page.navigate('https://example.com');
    return { loaded: true, browser: browser.type };
  });

  for (const [browser, result] of browserResults) {
    if (result instanceof Error) {
      console.log(`  ✗ ${browser}: ${result.message}`);
    } else {
      console.log(`  ✓ ${browser}: 测试通过`);
    }
  }

  // E2E 场景测试
  console.log('\n--- E2E 场景测试 ---');
  const e2eRunner = new E2ETestRunner();
  
  e2eRunner.addScenario({
    name: '完整购买流程',
    steps: [
      {
        description: '浏览产品列表',
        action: async (ctx) => {
          ctx.data.products = ['Product 1', 'Product 2'];
        }
      },
      {
        description: '添加商品到购物车',
        action: async (ctx) => {
          ctx.data.cartItems = 1;
        }
      },
      {
        description: '进入结算页面',
        action: async (ctx) => {
          ctx.data.checkoutReady = true;
        }
      },
      {
        description: '完成支付',
        action: async (ctx) => {
          if (!ctx.data.checkoutReady) throw new Error('结算未就绪');
          ctx.data.orderComplete = true;
        }
      }
    ]
  });

  await e2eRunner.run();
}

// ============================================================================
// 导出
// ============================================================================

export { MockElement };

;
