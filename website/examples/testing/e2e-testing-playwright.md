---
title: "Playwright E2E 测试实战"
description: "从零构建企业级端到端测试体系：Playwright 安装配置、核心架构、定位器策略、视觉回归、CI/CD 集成与并行执行策略的完整实战指南"
date: 2026-05-01
tags: ["示例", "Playwright", "E2E Testing", "端到端测试", "自动化测试", "测试工程", "CI/CD"]
category: "examples"
---

# Playwright E2E 测试实战

端到端（End-to-End，E2E）测试是保障现代 Web 应用质量的关键防线。与单元测试和集成测试不同，E2E 测试在真实浏览器环境中模拟用户行为，验证整个应用链路—from 用户点击到数据库持久化—是否按预期工作。[Microsoft Playwright](https://playwright.dev/) 作为新一代浏览器自动化框架，凭借其多浏览器支持、自动等待机制、强大的追踪与调试能力，已成为业界构建 E2E 测试体系的首选工具。

本文档将带你从零开始，构建一套可维护、可扩展、可融入 CI/CD 管道的 Playwright 测试工程。阅读前建议先了解 [测试工程](/testing-engineering/) 专题中的测试策略与分层模型。

---

## 目录

- [Playwright E2E 测试实战](#playwright-e2e-测试实战)
  - [目录](#目录)
  - [环境准备与安装配置](#环境准备与安装配置)
    - [初始化项目](#初始化项目)
    - [`playwright.config.ts` 详解](#playwrightconfigts-详解)
  - [核心概念：Browser / Context / Page](#核心概念browser--context--page)
    - [Browser](#browser)
    - [BrowserContext](#browsercontext)
    - [Page](#page)
  - [定位器策略与最佳实践](#定位器策略与最佳实践)
    - [定位器优先级金字塔](#定位器优先级金字塔)
    - [实战代码示例](#实战代码示例)
    - [自定义 Fixture 封装复用定位器](#自定义-fixture-封装复用定位器)
  - [断言体系与自动等待](#断言体系与自动等待)
    - [自动等待原理](#自动等待原理)
    - [常用断言分类](#常用断言分类)
    - [软断言（Soft Assertions）](#软断言soft-assertions)
  - [视觉回归测试](#视觉回归测试)
    - [配置与基准图管理](#配置与基准图管理)
    - [全页与局部截图比对](#全页与局部截图比对)
    - [处理动态内容与动画](#处理动态内容与动画)
    - [更新基准图的工作流](#更新基准图的工作流)
  - [CI/CD 集成方案](#cicd-集成方案)
    - [GitHub Actions 示例](#github-actions-示例)
    - [Docker 化执行](#docker-化执行)
    - [报告与通知集成](#报告与通知集成)
  - [并行执行策略与分片](#并行执行策略与分片)
    - [进程级并行（Workers）](#进程级并行workers)
    - [测试文件级并行](#测试文件级并行)
    - [CI 分片（Sharding）](#ci-分片sharding)
  - [实战：完整的电商结账流程测试](#实战完整的电商结账流程测试)
    - [业务流程图](#业务流程图)
    - [测试代码](#测试代码)
  - [调试与故障排查](#调试与故障排查)
    - [Trace Viewer](#trace-viewer)
    - [UI 模式](#ui-模式)
    - [有头调试](#有头调试)
    - [常见 flaky test 根因与对策](#常见-flaky-test-根因与对策)
  - [参考资料](#参考资料)

---

## 环境准备与安装配置

### 初始化项目

Playwright 提供了便捷的初始化命令，可一键生成推荐的项目结构、配置文件和示例测试。

```bash
# 在现有前端项目根目录执行
npm init -y
npm install -D @playwright/test
npx playwright install
```

`npx playwright install` 会自动下载 Chromium、Firefox 和 WebKit 的浏览器二进制文件。若仅需特定浏览器，可指定：

```bash
npx playwright install chromium
```

### `playwright.config.ts` 详解

配置文件是整个测试工程的指挥中枢。以下是一份面向生产环境的推荐配置：

```typescript
// playwright.config.ts
import &#123; defineConfig, devices &#125; from '@playwright/test';

export default defineConfig(&#123;
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', &#123; open: 'never' &#125;],
    ['json', &#123; outputFile: 'test-results/results.json' &#125;],
    ['junit', &#123; outputFile: 'test-results/results.xml' &#125;],
  ],
  use: &#123;
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  &#125;,
  projects: [
    &#123;
      name: 'chromium',
      use: &#123; ...devices['Desktop Chrome'] &#125;,
    &#125;,
    &#123;
      name: 'firefox',
      use: &#123; ...devices['Desktop Firefox'] &#125;,
    &#125;,
    &#123;
      name: 'webkit',
      use: &#123; ...devices['Desktop Safari'] &#125;,
    &#125;,
    &#123;
      name: 'Mobile Chrome',
      use: &#123; ...devices['Pixel 5'] &#125;,
    &#125;,
    &#123;
      name: 'Mobile Safari',
      use: &#123; ...devices['iPhone 12'] &#125;,
    &#125;,
  ],
  webServer: &#123;
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  &#125;,
&#125;);
```

配置要点解析：

| 配置项 | 说明 |
|--------|------|
| `fullyParallel` | 允许同一文件内的测试用例并行执行，提升效率 |
| `retries` | CI 环境自动重试 2 次，消除 flaky test 的偶发失败噪声 |
| `trace` | 首次重试时录制完整的 trace，用于事后复盘 |
| `webServer` | 自动启动被测应用的开发服务器，实现"零配置"运行 |
| `projects` | 定义多浏览器、多视口矩阵，确保跨端一致性 |

---

## 核心概念：Browser / Context / Page

理解 Playwright 的三层架构模型，是编写高效测试的前提。

```
Browser (1个进程)
  └── BrowserContext (1个独立会话/隔离环境)
        └── Page (1个标签页)
```

### Browser

`Browser` 代表一个浏览器实例，由 Playwright 启动并管理其进程。通常一个测试套件只需一个 Browser 实例，所有测试用例复用它以降低资源开销。

```typescript
import &#123; chromium &#125; from '@playwright/test';

const browser = await chromium.launch(&#123;
  headless: true,        // CI 环境通常使用无头模式
  slowMo: 50,            // 减速 50ms，便于观察执行过程
  args: ['--disable-gpu', '--no-sandbox'],
&#125;);
```

### BrowserContext

`BrowserContext` 是浏览器的一个独立会话，类比于浏览器的"隐私窗口"。每个 Context 拥有完全隔离的 Cookie、LocalStorage、SessionStorage 和缓存。在测试隔离性要求高的场景下，**每个测试用例应创建独立的 Context**。

```typescript
// 在 beforeEach 中创建隔离的上下文
const context = await browser.newContext(&#123;
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  viewport: &#123; width: 1280, height: 720 &#125;,
  permissions: ['geolocation'],
  geolocation: &#123; latitude: 31.2304, longitude: 121.4737 &#125;,
&#125;);

// 预置登录态：注入已认证的存储状态
await context.addInitScript(() => &#123;
  window.localStorage.setItem('auth_token', 'mock-jwt-token');
&#125;);
```

### Page

`Page` 对应浏览器标签页，是测试脚本最常交互的对象。Playwright 的 `page` fixture 已自动处理 Context 和 Page 的生命周期，在绝大多数测试中用不到显式创建 Browser/Context。

```typescript
import &#123; test, expect &#125; from '@playwright/test';

test('搜索功能验证', async (&#123; page &#125;) => &#123;
  // page 已自动关联到独立的 BrowserContext
  await page.goto('/search');
  await page.getByPlaceholder('输入关键词').fill('Playwright');
  await page.getByRole('button', &#123; name: /搜索/ &#125;).click();
  await expect(page.getByRole('listitem')).toHaveCount(5);
&#125;);
```

Playwright 的 Fixture 机制自动保证：

- 每个测试用例获得独立的 `Page` 实例
- 测试失败时自动录制 trace、截图和视频
- 测试结束后清理上下文，避免状态泄漏

---

## 定位器策略与最佳实践

可靠的元素定位是 E2E 测试稳定性的基石。Playwright 提供了多层次、语义化的定位器 API，优先推荐按以下顺序选择：

### 定位器优先级金字塔

| 优先级 | 定位方式 | 示例 | 推荐理由 |
|--------|----------|------|----------|
| 1 | 角色 + 可访问名 | `getByRole('button', &#123;name: '提交'&#125;)` | 基于 ARIA 语义，最贴近用户交互方式 |
| 2 | 标签文本 | `getByLabel('邮箱地址')` | 直接关联表单控件与 label |
| 3 | 占位符 | `getByPlaceholder('请输入密码')` | 适用于无 label 的输入框 |
| 4 | 文本内容 | `getByText(/订单已提交/)` | 验证可见文本，但需避免过度匹配 |
| 5 | 测试 ID | `getByTestId('checkout-submit')` | 当语义定位不可行时的兜底方案 |
| 6 | CSS/XPath | `locator('.btn-primary')` | 最脆弱，仅作为最后手段 |

### 实战代码示例

```typescript
import &#123; test, expect &#125; from '@playwright/test';

test.describe('定位器策略演示', () => &#123;
  test.beforeEach(async (&#123; page &#125;) => &#123;
    await page.goto('/demo');
  &#125;);

  test('使用语义角色定位', async (&#123; page &#125;) => &#123;
    // 优先使用 ARIA 角色 + 精确名称
    const submitBtn = page.getByRole('button', &#123; name: '立即提交', exact: true &#125;);
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
  &#125;);

  test('表单控件的标签关联', async (&#123; page &#125;) => &#123;
    // 通过 label 文本定位输入框，无需关心 DOM 结构
    await page.getByLabel('收货人姓名').fill('张三');
    await page.getByLabel('联系电话').fill('13800138000');
  &#125;);

  test('列表项的过滤与遍历', async (&#123; page &#125;) => &#123;
    // 定位表格中的特定行
    const row = page.getByRole('row').filter(&#123;
      has: page.getByRole('cell', &#123; name: '订单 #2026-001' &#125;),
    &#125;);
    await row.getByRole('button', &#123; name: '查看详情' &#125;).click();
  &#125;);

  test('动态内容的链式定位', async (&#123; page &#125;) => &#123;
    // 先定位容器，再在其内部查找元素，缩小搜索范围
    const cartPanel = page.locator('[data-testid="cart-drawer"]');
    await cartPanel.getByRole('button', &#123; name: '去结算' &#125;).click();
  &#125;);
&#125;);
```

### 自定义 Fixture 封装复用定位器

对于高频使用的页面组件，可通过 Fixture 封装为 Page Object 模式：

```typescript
// fixtures.ts
import &#123; test as base, expect &#125; from '@playwright/test';

export const test = base.extend(&#123;
  loginPage: async (&#123; page &#125;, use) => &#123;
    const goto = () => page.goto('/login');
    const fillCredentials = (u: string, p: string) =>
      Promise.all([
        page.getByLabel('用户名').fill(u),
        page.getByLabel('密码').fill(p),
      ]);
    const submit = () => page.getByRole('button', &#123; name: '登录' &#125;).click();
    const expectError = (msg: string) =>
      expect(page.getByRole('alert')).toContainText(msg);

    await use(&#123; goto, fillCredentials, submit, expectError &#125;);
  &#125;,
&#125;);
```

---

## 断言体系与自动等待

Playwright 的断言库 `expect` 围绕**自动等待**设计，彻底消除了传统 Selenium 式测试中随处可见的 `sleep` 和手动轮询。

### 自动等待原理

当执行如下代码时：

```typescript
await expect(page.getByText('加载完成')).toBeVisible();
```

Playwright 并非立即检查一次就抛错，而是持续轮询该定位器，直到：

- 条件满足（通过）
- 超时（默认 5 秒，可配置）

这一机制大幅降低了因网络抖动或渲染时序导致的 flaky test。

### 常用断言分类

**元素状态断言：**

```typescript
const banner = page.getByRole('banner');

await expect(banner).toBeVisible();          // 可见
await expect(banner).toBeHidden();           // 隐藏
await expect(banner).toBeEnabled();          // 可交互
await expect(banner).toHaveClass(/active/);  // CSS 类匹配
await expect(banner).toHaveAttribute('aria-expanded', 'true');
```

**内容断言：**

```typescript
const title = page.getByRole('heading', &#123; level: 1 &#125;);

await expect(title).toHaveText('仪表盘');               // 精确匹配
await expect(title).toContainText('仪表');              // 子串匹配
await expect(title).toHaveCount(1);                    // 元素数量
await expect(page).toHaveTitle(/管理后台/);             // 页面标题
await expect(page).toHaveURL(/\/dashboard/);           // URL 匹配
```

**表单值断言：**

```typescript
const emailInput = page.getByLabel('邮箱');

await expect(emailInput).toHaveValue('user@example.com');
await expect(emailInput).toBeEmpty();
await expect(emailInput).toHaveJSProperty('validationMessage', '请填写此字段');
```

**请求/响应断言：**

```typescript
// 等待特定 API 请求完成并断言其响应
test('提交订单后同步状态', async (&#123; page &#125;) => &#123;
  const responsePromise = page.waitForResponse('**/api/orders');
  await page.getByRole('button', &#123; name: '提交订单' &#125;).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  expect(await response.json()).toEqual(
    expect.objectContaining(&#123; status: 'created' &#125;)
  );
&#125;);
```

### 软断言（Soft Assertions）

默认情况下，一个断言失败会立即终止测试。使用软断言可在一次执行中收集所有失败点：

```typescript
import &#123; test, expect &#125; from '@playwright/test';

test('页面完整性检查', async (&#123; page &#125;) => &#123;
  await page.goto('/dashboard');

  await expect.soft(page.getByRole('heading')).toHaveText('仪表盘');
  await expect.soft(page.getByRole('navigation')).toBeVisible();
  await expect.soft(page.getByTestId('stats-cards')).toHaveCount(4);
  await expect.soft(page.getByRole('contentinfo')).toContainText('版权所有');

  // 必须显式结束，如果有软断言失败则标记用例失败
  expect(test.info().errors).toHaveLength(0);
&#125;);
```

---

## 视觉回归测试

视觉回归测试（Visual Regression Testing）通过像素级比对截图，捕捉 UI 的非预期变化。Playwright 内置了强大的截图比对能力，无需引入额外工具。

### 配置与基准图管理

```typescript
// playwright.config.ts
export default defineConfig(&#123;
  use: &#123;
    // 为每个操作系统和浏览器组合维护独立的快照
    snapshotDir: 'tests/__snapshots__',
    // 忽略 antialiasing 差异、CSS 动画等噪声
    expect: &#123;
      toHaveScreenshot: &#123;
        maxDiffPixels: 100,
        threshold: 0.2,
        animations: 'disabled',
      &#125;,
    &#125;,
  &#125;,
&#125;);
```

### 全页与局部截图比对

```typescript
import &#123; test, expect &#125; from '@playwright/test';

test('首页视觉回归', async (&#123; page &#125;) => &#123;
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 全页截图比对
  await expect(page).toHaveScreenshot('homepage.png', &#123;
    fullPage: true,
  &#125;);
&#125;);

test('弹窗视觉回归', async (&#123; page &#125;) => &#123;
  await page.goto('/settings');
  await page.getByRole('button', &#123; name: '修改头像' &#125;).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toHaveScreenshot('avatar-modal.png', &#123;
    mask: [page.getByTestId('user-avatar')], // 遮罩动态内容
  &#125;);
&#125;);
```

### 处理动态内容与动画

```typescript
test('遮罩动态日期和广告位', async (&#123; page &#125;) => &#123;
  await page.goto('/news');

  await expect(page).toHaveScreenshot('news-page.png', &#123;
    mask: [
      page.locator('.live-clock'),      // 实时时钟
      page.locator('.ad-banner'),       // 随机广告
    ],
    clip: &#123; x: 0, y: 0, width: 1280, height: 800 &#125;, // 限定裁剪区域
  &#125;);
&#125;);
```

### 更新基准图的工作流

```bash
# 当 UI 变更是预期行为时，更新快照
npx playwright test --update-snapshots

# 仅更新特定项目的快照
npx playwright test --project=chromium --update-snapshots
```

---

## CI/CD 集成方案

将 Playwright 测试集成到持续集成管道，是发挥其价值的关键环节。Playwright 官方维护了对 GitHub Actions、GitLab CI、Azure Pipelines、Jenkins 等主流平台的支持。

### GitHub Actions 示例

```yaml
# .github/workflows/playwright.yml
name: Playwright E2E Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 30
```

### Docker 化执行

Playwright 提供了预装浏览器依赖的 Docker 镜像，确保 CI 环境与本地环境的一致性：

```dockerfile
# Dockerfile.e2e
FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

### 报告与通知集成

```typescript
// playwright.config.ts
export default defineConfig(&#123;
  reporter: [
    ['list'],                                    // 终端实时输出
    ['html', &#123; open: 'never' &#125;],               // 自托管 HTML 报告
    ['blob', &#123; outputDir: 'blob-report' &#125;],     // 分布式 CI 合并
    ['@currents/playwright'],                    // 第三方云端看板
  ],
&#125;);
```

HTML 报告包含了 trace 查看器、截图、视频和测试步骤的完整时序，是排查失败用例的首要入口：

```bash
npx playwright show-report playwright-report
```

---

## 并行执行策略与分片

随着测试套件规模增长，串行执行的耗时会成为 CI 管道的瓶颈。Playwright 提供了多维度并行机制。

### 进程级并行（Workers）

默认情况下，Playwright 会基于 CPU 核心数自动分配 worker 进程。每个 worker 在独立的进程中运行测试文件，保证完全的进程隔离：

```typescript
// playwright.config.ts
export default defineConfig(&#123;
  workers: process.env.CI ? 4 : undefined, // CI 指定 4 个 worker
  fullyParallel: true,                     // 同一文件内的用例也并行
&#125;);
```

### 测试文件级并行

通过 `test.describe.configure` 可细粒度控制并行行为：

```typescript
import &#123; test &#125; from '@playwright/test';

// 该 describe 块内的所有用例串行执行（适用于共享状态的测试）
test.describe.configure(&#123; mode: 'serial' &#125;);
test.describe('订单状态机流转', () => &#123;
  test('创建订单', async (&#123; page &#125;) => &#123; /* ... */ &#125;);
  test('支付订单', async (&#123; page &#125;) => &#123; /* ... */ &#125;);
  test('发货订单', async (&#123; page &#125;) => &#123; /* ... */ &#125;);
&#125;);
```

### CI 分片（Sharding）

对于超大型测试套件，可在多台 CI Runner 上进行分片执行：

```yaml
# GitHub Actions 矩阵分片
strategy:
  fail-fast: false
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]

- name: Run tests
  run: npx playwright test --shard=$&#123;&#123; matrix.shardIndex &#125;&#125;/$&#123;&#123; matrix.shardTotal &#125;&#125;
```

分片机制确保每个 runner 只执行总测试集的 1/N，最终将各分片的 blob 报告合并为完整报告：

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

---

## 实战：完整的电商结账流程测试

以下是一个覆盖真实业务场景的完整测试套件，演示了从浏览商品到完成支付的全链路验证。该示例整合了前文介绍的所有核心能力。

### 业务流程图

```mermaid
graph TD
    A[浏览商品列表] --> B[进入商品详情]
    B --> C[加入购物车]
    C --> D[进入结算页]
    D --> E[填写收货地址]
    E --> F[选择支付方式]
    F --> G[提交订单]
    G --> H&#123;支付成功?&#125;
    H -->|是| I[跳转订单详情]
    H -->|否| J[显示支付失败提示]
```

### 测试代码

```typescript
// e2e/checkout.spec.ts
import &#123; test, expect &#125; from '@playwright/test';

test.describe('电商结账流程', () => &#123;
  test.beforeEach(async (&#123; page &#125;) => &#123;
    // 模拟已登录状态
    await page.addInitScript(() => &#123;
      window.localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock');
    &#125;);
    await page.goto('/products');
  &#125;);

  test('用户可完成完整下单流程', async (&#123; page &#125;) => &#123;
    // Step 1: 浏览商品并进入详情
    await page.getByRole('link', &#123; name: '无线降噪耳机 Pro' &#125;).click();
    await expect(page).toHaveURL(/\/products\/headphone-pro/);
    await expect(page.getByRole('heading', &#123; name: '无线降噪耳机 Pro' &#125;)).toBeVisible();

    // Step 2: 加入购物车
    await page.getByRole('button', &#123; name: '加入购物车' &#125;).click();
    await expect(page.getByRole('status')).toContainText('已成功加入购物车');

    // Step 3: 进入购物车并结算
    await page.getByRole('link', &#123; name: '购物车' &#125;).click();
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    await page.getByRole('button', &#123; name: '去结算' &#125;).click();

    // Step 4: 填写收货地址
    await page.getByLabel('收货人').fill('张三');
    await page.getByLabel('手机号').fill('13800138000');
    await page.getByLabel('省/直辖市').selectOption('上海市');
    await page.getByLabel('详细地址').fill('浦东新区陆家嘴环路 1000 号');

    // Step 5: 选择支付方式
    await page.getByRole('radio', &#123; name: '支付宝' &#125;).check();

    // Step 6: 拦截支付请求并模拟成功响应
    await page.route('**/api/orders', async (route) => &#123;
      await route.fulfill(&#123;
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(&#123;
          orderId: 'ORD-20260501-001',
          status: 'paid',
          totalAmount: 1299.00,
          payUrl: null,
        &#125;),
      &#125;);
    &#125;);

    // Step 7: 提交订单
    const submitBtn = page.getByRole('button', &#123; name: '确认支付' &#125;);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Step 8: 验证订单详情页
    await expect(page).toHaveURL(/\/orders\/ORD-20260501-001/);
    await expect(page.getByRole('heading', &#123; name: '订单详情' &#125;)).toBeVisible();
    await expect(page.getByTestId('order-status')).toHaveText('已支付');
    await expect(page.getByTestId('order-amount')).toHaveText('¥1,299.00');
  &#125;);

  test('库存不足时阻止下单', async (&#123; page &#125;) => &#123;
    await page.goto('/products/limited-edition');
    await page.getByRole('button', &#123; name: '加入购物车' &#125;).click();
    await page.getByRole('link', &#123; name: '购物车' &#125;).click();
    await page.getByRole('button', &#123; name: '去结算' &#125;).click();

    // 模拟后端返回库存不足
    await page.route('**/api/orders', async (route) => &#123;
      await route.fulfill(&#123;
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify(&#123; code: 'INSUFFICIENT_STOCK', message: '库存不足' &#125;),
      &#125;);
    &#125;);

    await page.getByRole('button', &#123; name: '确认支付' &#125;).click();
    await expect(page.getByRole('alert')).toContainText('库存不足，请减少购买数量或选择其他商品');
  &#125;);
&#125;);
```

---

## 调试与故障排查

Playwright 提供了业界领先的调试工具链，能显著缩短定位 flaky test 的时间。

### Trace Viewer

Trace 是 Playwright 最强大的调试资产，记录了测试执行过程中的每一步操作、DOM 快照、网络请求和控制台日志：

```bash
# 本地打开 trace 文件
npx playwright show-trace test-results/checkout-E2E/trace.zip
```

在配置中确保 `trace: 'on-first-retry'` 或 `trace: 'retain-on-failure'` 已开启。

### UI 模式

Playwright 1.32+ 引入了交互式 UI 模式，支持在浏览器中实时运行、调试和探索测试：

```bash
npx playwright test --ui
```

### 有头调试

```bash
# 以有头模式运行特定测试，配合 inspector 逐步执行
npx playwright test --headed --debug e2e/checkout.spec.ts
```

### 常见 flaky test 根因与对策

| 症状 | 根因 | 解决方案 |
|------|------|----------|
| `TimeoutError` 等待元素 | 异步数据未加载完 | 使用 `await page.waitForResponse()` 或 `toBeVisible()` |
| 元素被遮挡无法点击 | 动画或弹层未消失 | 在配置中禁用动画 `animations: 'disabled'` |
| 测试本地通过 CI 失败 | 时序差异或资源竞争 | 增加 retries，使用固定 worker 数 |
| 视觉回归误报 | 字体渲染差异 | 在 Docker 容器中执行截图比对 |
| 登录态丢失 | 跨测试状态污染 | 确保每个 test 使用独立的 context/page |

---

## 参考资料

1. **Playwright 官方文档**：*"Playwright enables reliable end-to-end testing for modern web apps."* — [playwright.dev](https://playwright.dev/)。当前最权威、更新最及时的 Playwright 使用指南，涵盖 API 参考、最佳实践和 CI 集成。

2. **Google Chrome Labs — Web Vitals**：虽然本文聚焦 E2E 测试，但 Playwright 同样可以用于性能指标的采集。Google 的 Web Vitals 文档定义了现代 Web 性能的核心度量标准，为测试与性能工程的交叉领域提供了理论基础。

3. **Martin Fowler — *TestPyramid***：Fowler 提出的测试金字塔模型是构建健康测试体系的经典框架。Playwright 所处的 E2E 层位于金字塔顶端，提醒我们应在单元测试和集成测试充分覆盖的前提下，策略性地投入 E2E 测试资源。

4. **W3C — Web Accessibility Initiative (WAI-ARIA)**：Playwright 的定位器策略强烈依赖 ARIA 角色和可访问属性。W3C 的 ARIA 规范是编写可被稳定定位的 UI 组件的根本依据，也是实现无障碍访问的技术标准。

5. **Microsoft Engineering Blog — *How we test Visual Studio Code***：VS Code 团队分享了其如何使用 Playwright 维护大规模 E2E 测试套件的经验，包括分片策略、flaky test 治理和性能优化，对构建企业级测试体系具有极高的参考价值。

---

> 本文档是 [测试工程](/testing-engineering/) 专题的实战延伸。如果你想深入理解测试策略设计、测试金字塔分层模型以及测试驱动开发（TDD）的理论基础，请前往专题主页继续阅读。
