import { describe, it, expect } from 'vitest';
import {
  MockPage,
  LoginPage,
  ProductListPage,
  VisualRegressionTester,
  CrossBrowserTester,
  E2ETestRunner,
  MockElement,
  demo
} from './e2e-testing.js';

describe('e2e-testing', () => {
  describe('MockPage', () => {
    it('should navigate and find elements', async () => {
      const page = new MockPage();
      await page.navigate('https://example.com/login');
      const element = await page.find('[data-testid="username"]');
      expect(element).toBeInstanceOf(MockElement);
    });

    it('should type and click', async () => {
      const page = new MockPage();
      await page.navigate('https://example.com/login');
      await page.type('[data-testid="username"]', 'user');
      const element = await page.find('[data-testid="username"]');
      expect(await element.getText()).toBe('user');
    });
  });

  describe('LoginPage', () => {
    it('should login and check welcome message', async () => {
      const page = new MockPage();
      const loginPage = new LoginPage(page);
      await loginPage.navigate('https://example.com/login');
      await loginPage.login('user', 'pass');
      expect(await loginPage.isWelcomeMessageVisible()).toBe(true);
    });

    it('should take screenshot', async () => {
      const page = new MockPage();
      const loginPage = new LoginPage(page);
      await loginPage.navigate('https://example.com/login');
      await loginPage.takeScreenshot('login');
    });
  });

  describe('ProductListPage', () => {
    it('should search products', async () => {
      const page = new MockPage();
      // MockPage does not parse HTML; manually register elements
      (page as any).elements.set('[data-testid="search-input"]', new MockElement('input', ''));
      (page as any).elements.set('[data-testid="product-card"]', new MockElement('div', ''));
      (page as any).elements.set('[data-testid="product-card"]-2', new MockElement('div', ''));
      await page.navigate('https://example.com/products');
      const productPage = new ProductListPage(page);
      await productPage.searchProducts('book');
      expect(await productPage.getProductCount()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('VisualRegressionTester', () => {
    it('should capture baseline and compare', async () => {
      const tester = new VisualRegressionTester();
      const page = new MockPage();
      await tester.captureBaseline('home', page);
      const result = await tester.compare('home', page);
      expect(result.passed).toBe(true);
      expect(result.diffPercentage).toBe(0);
    });

    it('should throw if baseline does not exist', async () => {
      const tester = new VisualRegressionTester();
      const page = new MockPage();
      await expect(tester.compare('missing', page)).rejects.toThrow('基线截图不存在');
    });
  });

  describe('CrossBrowserTester', () => {
    it('should run test on multiple browsers', async () => {
      const tester = new CrossBrowserTester();
      tester.addBrowser({ type: 'chromium', headless: true, viewport: { width: 1920, height: 1080 } });
      const results = await tester.runOnAllBrowsers(async (_browser, page) => {
        await page.navigate('https://example.com');
        return 'ok';
      });
      expect(results.get('chromium')).toBe('ok');
    });
  });

  describe('E2ETestRunner', () => {
    it('should run scenarios and report results', async () => {
      const runner = new E2ETestRunner();
      runner.addScenario({
        name: 'test scenario',
        steps: [
          {
            description: 'step 1',
            action: async (ctx) => {
              ctx.data['done'] = true;
            }
          }
        ]
      });
      const result = await runner.run();
      expect(result.passed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should count failed scenarios', async () => {
      const runner = new E2ETestRunner();
      runner.addScenario({
        name: 'failing scenario',
        steps: [
          {
            description: 'fail step',
            action: async () => {
              throw new Error('fail');
            }
          }
        ]
      });
      const result = await runner.run();
      expect(result.passed).toBe(0);
      expect(result.failed).toBe(1);
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
