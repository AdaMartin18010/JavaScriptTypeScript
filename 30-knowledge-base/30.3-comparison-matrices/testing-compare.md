---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 测试框架对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **GitHub Stars** | 15k | 43k | 70k |
| **测试类型** | 单元/集成 | 单元/集成 | E2E (端到端) |
| **运行环境** | Node / Edge | Node | Node (控制浏览器) |
| **执行速度** | ⚡ 极快 | 🐢 较慢 | 🐢 较慢 (真实浏览器) |
| **TypeScript 支持** | 🟢 原生 | 🔵 需配置 | 🟢 原生 |
| **ESM 支持** | ⭐⭐⭐ 完美 | ⭐⭐ 一般 | ⭐⭐⭐ 完美 |
| **配置复杂度** | ⭐ 低 | ⭐⭐ 中 | ⭐⭐ 中 |
| **快照测试** | ✅ | ✅ | ✅ |
| **Mock 功能** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **覆盖率** | ✅ c8/v8 | ✅ Istanbul | ❌ (需结合其他工具) |
| **UI 模式** | ✅ 内置 | ❌ | ✅ 内置 |
| **浏览器测试** | ❌ | ❌ (需配合) | ⭐⭐⭐ 核心功能 |
| **并行执行** | ⭐⭐⭐ 默认 | ⭐⭐ 需配置 | ⭐⭐⭐ 默认 |
| **Watch 模式** | ✅ | ✅ | ✅ |

## 详细分析

### Vitest

```bash
npm install -D vitest
```

- **定位**: 由 Vite 驱动的下一代测试框架
- **核心优势**: 与 Vite 生态无缝集成，极快执行速度
- **特点**:
  - 兼容 Jest API，迁移成本低
  - 原生 ESM 支持
  - 极快的 HMR (热模块替换)
  - 内置 TypeScript 支持
  - 与 Vite 配置共享
- **适用场景**: Vite 项目、追求速度的单元测试、现代 ES 项目

```typescript
// sum.test.ts
import { describe, it, expect } from 'vitest'
import { sum } from './sum'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  it('matches snapshot', () => {
    expect({ name: 'test', value: 42 }).toMatchSnapshot()
  })
})
```

```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### Jest

```bash
npm install -D jest @types/jest ts-jest
```

- **定位**: 最成熟的 JavaScript 测试框架
- **核心优势**: 生态最丰富，社区资源最多
- **特点**:
  - Snapshot Testing 开创者
  - 完善的 Mock 功能
  - 丰富的匹配器 (matchers)
  - 广泛的 IDE 支持
- **劣势**: ESM 支持较复杂、配置相对繁琐、启动较慢
- **适用场景**: 传统项目、需要丰富插件生态的项目

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/*.test.ts']
}
```

```typescript
// sum.test.ts
import { sum } from './sum'

describe('sum', () => {
  test('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  // Mock 示例
  test('mock function', () => {
    const mockFn = jest.fn()
    mockFn('arg')
    expect(mockFn).toHaveBeenCalledWith('arg')
  })
})
```

### Playwright

```bash
npm init playwright@latest
```

- **定位**: 现代 Web 应用的端到端测试框架
- **核心优势**: 多浏览器支持、可靠性高、开发者体验优秀
- **特点**:
  - 支持 Chromium、Firefox、WebKit
  - 自动等待机制
  - 可视化测试 (截图对比)
  - 强大的代码生成器 (`codegen`)
  - Trace Viewer 调试工具
  - 组件测试 (实验性)
- **适用场景**: E2E 测试、跨浏览器测试、关键业务流程验证

```typescript
// example.spec.ts
import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com')
  await expect(page).toHaveTitle(/Example Domain/)
})

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

## 功能对比详解

### 单元/集成测试

| 功能 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **断言库** | 内置 (Chai-like) | 内置 (Jasmine-like) | 内置 |
| **Mock** | vi.fn() / vi.mock() | jest.fn() / jest.mock() | 有限支持 |
| **Spy** | vi.spyOn() | jest.spyOn() | - |
| **Timer Mock** | vi.useFakeTimers() | jest.useFakeTimers() | - |
| **模块 Mock** | ✅ | ✅ | - |
| **Setup/Teardown** | beforeEach/afterAll | beforeEach/afterAll | beforeEach/afterAll |
| **并发测试** | test.concurrent | - | ✅ 默认 |
| **数据驱动** | test.each | test.each | test.each |

### 测试环境

| 环境 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **Node.js** | ✅ | ✅ | ✅ |
| **JSDOM** | ✅ | ✅ | - |
| **Happy DOM** | ✅ | - | - |
| **真实浏览器** | ❌ | ❌ | ✅ |
| **Edge Runtime** | ✅ | ❌ | ⚠️ 部分 |

### 开发者体验

| 特性 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **IDE 插件** | ✅ | ✅ 最完善 | ✅ |
| **UI 界面** | ✅ Vitest UI | ❌ | ✅ Playwright UI |
| **VS Code 调试** | ✅ | ✅ | ✅ |
| **测试过滤** | ✅ t / f 模式 | ✅ | ✅ |
| **失败重试** | ❌ | ✅ | ✅ |

## 性能对比

| 指标 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **启动时间** | 极快 | 慢 | 中 |
| **执行速度** | 极快 | 慢 | 慢 (浏览器) |
| **内存占用** | 低 | 高 | 高 |
| **并行能力** | 优秀 | 良好 | 优秀 |
| **大型项目表现** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 高级代码示例

### Vitest — 高级 Mock、Spy 与模块模拟

```typescript
// advanced-mock.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';

// 模块级 Mock（自动提升）
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    readFileSync: vi.fn().mockReturnValue('mocked content'),
  };
});

// 定时器模拟
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('advanced vitest patterns', () => {
  it('should spy on object methods', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spy = vi.spyOn(calculator, 'add').mockReturnValue(100);
    expect(calculator.add(1, 2)).toBe(100);
    expect(spy).toHaveBeenCalledWith(1, 2);
    spy.mockRestore(); // 恢复原始实现
  });

  it('should handle async with fake timers', async () => {
    const fn = vi.fn();
    setTimeout(fn, 1000);
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalled();
  });

  it('should stub environment variables', () => {
    vi.stubEnv('API_KEY', 'test-key-123');
    expect(process.env.API_KEY).toBe('test-key-123');
    vi.unstubAllEnvs();
  });
});
```

### Vitest + React Testing Library 组件测试

```tsx
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders and handles click', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible via aria-label', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    expect(screen.getByLabelText('Close dialog')).toBeDefined();
  });
});
```

### Playwright — 视觉回归与 API  mocking

```typescript
// visual-and-api.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Advanced Playwright Patterns', () => {
  test('visual regression of dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 截图对比（首次运行生成基线）
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('mock API responses', async ({ page }) => {
    // 拦截并替换 API 响应
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Mock User', role: 'admin' }),
      });
    });

    await page.goto('/profile');
    await expect(page.locator('h1')).toHaveText('Mock User');
  });

  test('test mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('upload file', async ({ page }) => {
    await page.goto('/upload');

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('#upload-button'),
    ]);

    await fileChooser.setFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('id,name\n1,Alice\n2,Bob'),
    });

    await expect(page.locator('.upload-success')).toBeVisible();
  });
});
```

### Playwright — Trace Viewer 与调试

```typescript
// playwright.config.ts snippet
export default defineConfig({
  use: {
    trace: 'retain-on-failure', // 失败时保留 trace
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

```bash
# 运行后打开交互式 Trace Viewer
npx playwright show-trace test-results/
```

## 选型建议

### 按测试类型选择

| 测试类型 | 推荐工具 |
|----------|----------|
| 单元测试 | Vitest (新项目) / Jest (旧项目) |
| 集成测试 | Vitest / Jest |
| 端到端测试 | Playwright |
| 组件测试 | Vitest + Testing Library / Playwright CT |
| 视觉回归 | Playwright + 截图对比 |
| API 测试 | Vitest / Jest / Playwright |

### 按项目类型选择

| 项目类型 | 推荐 |
|----------|------|
| Vite 项目 | Vitest |
| Create React App | Jest (内置) |
| Next.js | Vitest (单元) + Playwright (E2E) |
| 传统 Node 项目 | Jest 或 Vitest |
| 需要跨浏览器测试 | Playwright |

### 组合方案

```bash
# 推荐的测试组合
npm install -D vitest @testing-library/react
npm install -D @playwright/test
```

| 层级 | 工具 | 占比 |
|------|------|------|
| 单元测试 | Vitest | 70% |
| 集成测试 | Vitest | 20% |
| E2E 测试 | Playwright | 10% |

## 配置示例

### 完整测试配置 (Vitest + Playwright)

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@playwright/test": "^1.x",
    "@vitest/coverage-v8": "^1.x",
    "@vitest/ui": "^1.x",
    "vitest": "^1.x"
  }
}
```

## 迁移建议

### Jest → Vitest

- 替换 `jest` 导入为 `vitest`
- 配置 `globals: true` 以兼容全局 API
- 更新 mock 语法 (大部分兼容)

### 注意事项

- Playwright 用于 E2E，不替代单元测试框架
- Vitest 和 Jest 可以共存，但不推荐
- 覆盖率工具选择：V8 (快) vs Istanbul (准)

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Vitest 官方文档 | <https://vitest.dev/> | 下一代测试框架 |
| Vitest UI 模式 | <https://vitest.dev/guide/ui.html> | 交互式测试浏览器 |
| Jest 官方文档 | <https://jestjs.io/> | 成熟测试框架 |
| Jest ESM 支持 | <https://jestjs.io/docs/ecmascript-modules> | ESM 迁移指南 |
| Playwright 官方文档 | <https://playwright.dev/> | E2E 测试框架 |
| Playwright Component Testing | <https://playwright.dev/docs/test-components> | 组件测试 |
| Playwright Visual Comparison | <https://playwright.dev/docs/test-snapshots> | 截图对比 |
| Testing Library | <https://testing-library.com/> | 以用户为中心的测试 |
| React Testing Library | <https://testing-library.com/docs/react-testing-library/intro/> | React 组件测试 |
| @testing-library/jest-dom | <https://github.com/testing-library/jest-dom> | 自定义 DOM 匹配器 |
| MSW (Mock Service Worker) | <https://mswjs.io/> | API Mock 库 |
| Istanbul / nyc | <https://istanbul.js.org/> | 覆盖率工具 |
| c8 Coverage | <https://github.com/bcoe/c8> | V8 原生覆盖率 |
| Storybook Test Runner | <https://storybook.js.org/docs/writing-tests/test-runner> | UI 组件测试 |
| Cypress | <https://www.cypress.io/> | 替代 E2E 方案 |
| WebdriverIO | <https://webdriver.io/> | 跨浏览器自动化 |

---

> 📅 最后更新: 2026-04-29
