---
title: 07 测试策略
description: 掌握 Lit Web Components 的测试方法：Web Test Runner、Playwright、Storybook 交互测试、视觉回归测试和可访问性测试。
---

# 07 测试策略

> **前置知识**：Lit 组件开发、基础测试概念
>
> **目标**：能够建立完整的 Web Components 测试体系

---

## 1. Web Test Runner

### 1.1 配置

```javascript
// web-test-runner.config.js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'src/**/*.test.ts',
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  coverage: true,
  nodeResolve: true,
};
```

### 1.2 组件测试

```typescript
// src/button/button.test.ts
import { html, fixture, expect } from '@open-wc/testing';
import './button.js';

describe('ds-button', () => {
  it('renders with default properties', async () => {
    const el = await fixture(html`<ds-button>Click me</ds-button>`);

    expect(el).to.exist;
    expect(el.textContent).to.equal('Click me');
    expect(el.variant).to.equal('primary');
  });

  it('renders different variants', async () => {
    const el = await fixture(html`<ds-button variant="secondary">Secondary</ds-button>`);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('variant--secondary')).to.be.true;
  });

  it('dispatches click event', async () => {
    const el = await fixture(html`<ds-button>Click</ds-button>`);
    const spy = sinon.spy();

    el.addEventListener('click', spy);
    el.shadowRoot?.querySelector('button')?.click();

    expect(spy.calledOnce).to.be.true;
  });

  it('is accessible', async () => {
    const el = await fixture(html`<ds-button>Accessible</ds-button>`);
    await expect(el).to.be.accessible();
  });
});
```

### 1.3 异步测试

```typescript
import { aTimeout, oneEvent } from '@open-wc/testing';

describe('async behavior', () => {
  it('waits for async update', async () => {
    const el = await fixture(html`<my-async-component></my-async-component>`);

    // 触发异步操作
    el.loadData();

    // 等待事件
    const { detail } = await oneEvent(el, 'data-loaded');
    expect(detail.items).to.have.length(3);
  });

  it('handles loading state', async () => {
    const el = await fixture(html`<my-async-component></my-async-component>`);

    el.loadData();
    expect(el.loading).to.be.true;

    await aTimeout(100); // 等待 100ms
    expect(el.loading).to.be.false;
  });
});
```

---

## 2. Playwright E2E 测试

### 2.1 配置

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

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
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
});
```

### 2.2 E2E 测试用例

```typescript
// e2e/button.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ds-button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button');
  });

  test('renders correctly', async ({ page }) => {
    const button = page.locator('ds-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Click me');
  });

  test('handles click interaction', async ({ page }) => {
    const button = page.locator('ds-button');

    await button.click();

    // 验证副作用
    await expect(page.locator('.toast')).toContainText('Clicked!');
  });

  test('is accessible', async ({ page }) => {
    const button = page.locator('ds-button');

    // 键盘导航
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('works in form submission', async ({ page }) => {
    await page.goto('/form-example');

    await page.fill('ds-input[name="email"]', 'test@example.com');
    await page.click('ds-button[type="submit"]');

    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## 3. Storybook 交互测试

### 3.1 配置

```javascript
// .storybook/main.ts
module.exports = {
  stories: ['../src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/web-components-vite',
};
```

### 3.2 交互测试

```typescript
// src/button/button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { within, userEvent, expect } from '@storybook/test';
import './button.js';

const meta: Meta = {
  title: 'Components/Button',
  component: 'ds-button',
};

export default meta;
type Story = StoryObj;

export const ClickInteraction: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // 模拟用户点击
    await userEvent.click(button);

    // 验证结果
    await expect(button).toHaveAttribute('data-clicked', 'true');
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();

    // 验证点击无效果
    await userEvent.click(button);
    await expect(button).not.toHaveAttribute('data-clicked');
  },
};
```

---

## 4. 视觉回归测试

### 4.1 Chromatic 配置

```bash
# 安装
npm install --save-dev chromatic
```

```json
// package.json
{
  "scripts": {
    "chromatic": "chromatic --project-token=YOUR_TOKEN"
  }
}
```

### 4.2 截图测试

```typescript
// src/button/button.stories.ts
export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
  parameters: {
    chromatic: {
      viewports: [320, 768, 1200], // 多视口截图
      delay: 300, // 等待动画完成
    },
  },
};
```

---

## 5. 可访问性测试

### 5.1 axe-core 集成

```typescript
// src/button/button.test.ts
import { runWCTests } from '@axe-core/webdriverjs';

describe('accessibility', () => {
  it('has no accessibility violations', async () => {
    const el = await fixture(html`<ds-button>A11y Test</ds-button>`);

    const results = await runWCTests(el);
    expect(results.violations).to.have.length(0);
  });

  it('supports keyboard navigation', async () => {
    const el = await fixture(html`<ds-button>Keyboard</ds-button>`);
    const button = el.shadowRoot?.querySelector('button');

    // Tab 聚焦
    button?.focus();
    expect(document.activeElement).to.equal(button);

    // Enter 触发
    await sendKeys({ press: 'Enter' });
    // 验证触发结果
  });
});
```

---

## 6. 测试金字塔

```
        /\
       /  \     E2E Tests (Playwright)
      /----\    5-10% 覆盖率
     /      \
    /--------\   Integration Tests (Storybook)
   /          \  20-30% 覆盖率
  /------------\ Unit Tests (Web Test Runner)
 /              \ 60-70% 覆盖率
/----------------\
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **忽略 Shadow DOM** | 测试工具无法穿透 Shadow DOM | 使用 shadowRoot 查询或专用工具 |
| **异步更新未等待** | 属性变化后 DOM 未更新 | 使用 elementUpdated 或 await |
| **浏览器兼容性** | 只在 Chrome 测试 | 多浏览器测试矩阵 |
| **视觉回归噪声** | 字体渲染差异导致误报 | 统一测试环境配置 |

---

## 练习

1. 为 `<ds-input>` 编写完整的测试套件：渲染、事件、验证、可访问性。
2. 使用 Playwright 测试一个包含多个 Lit 组件的表单页面。
3. 配置 Storybook + Chromatic 进行视觉回归测试。

---

## 延伸阅读

- [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)
- [Playwright](https://playwright.dev/)
- [Storybook Testing](https://storybook.js.org/docs/writing-tests)
- [axe-core](https://github.com/dequelabs/axe-core)
