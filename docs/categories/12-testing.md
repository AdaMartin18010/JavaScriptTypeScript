# 测试框架

JavaScript/TypeScript 生态系统的测试工具链完整解决方案，从单元测试到端到端测试，从 API 模拟到覆盖率分析。

---

## 单元测试框架

### [Vitest](https://vitest.dev/) ⭐ 16.2k

由 Vite 团队开发的下一代测试框架，原生支持 ESM 和 TypeScript。

```bash
npm install -D vitest
```

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// sum.test.ts
import { test, expect } from 'vitest';
import { sum } from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

**核心特性:**
- 🚀 **极速执行** - 基于 Vite 的 HMR，比 Jest 快 10-20 倍
- 🔥 **原生 ESM** - 无需转换，直接支持 ES 模块
- 📦 **零配置** - 与 Vite 共享配置
- 🖥️ **内置 UI** - 可视化测试仪表板
- 🔍 **快照测试** - 内置高效的快照对比
- 📊 **覆盖率** - 内置 v8 覆盖率支持

**适用场景:** Vite 项目、Vue/Nuxt 应用、现代 ESM 代码库、追求极致性能的项目

---

### [Jest](https://jestjs.io/) ⭐ 44k

Facebook 开发的全面 JavaScript 测试解决方案，行业标准测试框架。

```bash
npm install -D jest @types/jest
```

```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

**核心特性:**
- ✨ **零配置** - 大多数项目无需配置即可运行
- 🔄 **隔离运行** - 每个测试文件独立运行
- 📸 **快照测试** - 捕获组件或数据的快照
- 🔍 **代码覆盖率** - 内置 Istanbul 覆盖率报告
- ⏱️ **Mock 功能** - 强大的函数和模块模拟
- 🧪 **多环境** - 支持 Node.js 和浏览器环境

**适用场景:** React 应用、大型企业项目、需要稳定成熟的生态系统、CRA/Next.js 项目

---

### [Mocha](https://mochajs.org/) ⭐ 22.9k

灵活、可扩展的 JavaScript 测试框架，专注于简单性和异步支持。

```bash
npm install -D mocha chai
```

```javascript
// test.js
const assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
```

**核心特性:**
- 🔧 **高度灵活** - 自由选择断言库（Chai、Should.js、expect.js）
- 🌐 **浏览器支持** - 原生支持浏览器和 Node.js
- ⏱️ **异步测试** - 优秀的 async/await 和 Promise 支持
- 📝 **BDD/TDD 风格** - 支持两种开发方法论
- 🔌 **丰富插件** - 庞大的生态系统

**适用场景:** 需要灵活配置的项目、浏览器和 Node.js 共用测试、BDD/TDD 实践

---

### [AVA](https://github.com/avajs/ava) ⭐ 20.7k

面向未来的测试运行器，强调并发执行和最小化配置。

```bash
npm install -D ava
```

```javascript
// test.js
import test from 'ava';

test('foo', t => {
  t.pass();
});

test('bar', async t => {
  const bar = Promise.resolve('bar');
  t.is(await bar, 'bar');
});
```

**核心特性:**
- 🚀 **并发执行** - 测试文件并行运行
- 🎯 **ES 模块优先** - 原生支持现代 JavaScript
- 🔬 **隔离环境** - 每个测试文件独立进程
- 📸 **内置断言** - 简洁强大的断言 API
- 🎭 **快照测试** - 内置快照功能

**适用场景:** 需要高并发测试的项目、Node.js 应用、现代 ES 模块项目

---

### [uvu](https://github.com/lukeed/uvu) ⭐ 5k

极轻量级的测试运行器，速度和体积的极致追求。

```bash
npm install -D uvu
```

```javascript
// test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('Math.sqrt()', () => {
  assert.is(Math.sqrt(4), 2);
  assert.is(Math.sqrt(144), 12);
  assert.is(Math.sqrt(2), Math.SQRT2);
});

test.run();
```

**核心特性:**
- 📦 **体积超小** - 无依赖，极轻量
- ⚡ **速度极快** - 比大多数测试框架更快
- 🎯 **简单 API** - 学习成本极低
- 🔍 **TypeScript** - 原生 TS 支持

**适用场景:** 追求极致轻量的项目、嵌入式测试、快速验证

---

### [node:test](https://nodejs.org/api/test.html) (Node.js 18+)

Node.js 官方内置测试模块，无需安装额外依赖。

```javascript
// test.js
const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Math', () => {
  test('sqrt', () => {
    assert.equal(Math.sqrt(4), 2);
  });
});
```

**核心特性:**
- 📦 **内置模块** - Node.js 18+ 原生支持
- 🎯 **TAP 输出** - 标准测试输出格式
- 🔄 **异步支持** - 原生支持 Promise 和 async/await
- 🌳 **子测试** - 支持嵌套测试结构

**适用场景:** 简单的 Node.js 项目、不想引入额外依赖的项目

---

## E2E 测试框架

### [Playwright](https://playwright.dev/) ⭐ 78.6k

Microsoft 开发的现代 Web 测试和自动化框架，支持多浏览器。

```bash
npm init playwright@latest
```

```typescript
// tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has title and links to intro page', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  await expect(page).toHaveTitle(/Playwright/);
  
  const getStarted = page.getByRole('link', { name: 'Get started' });
  await expect(getStarted).toHaveAttribute('href', '/docs/intro');
});
```

**核心特性:**
- 🌐 **多浏览器** - Chromium、Firefox、WebKit 统一 API
- ⏱️ **自动等待** - 智能等待元素可交互，消除 flaky 测试
- 📱 **移动模拟** - 内置设备模拟和视口配置
- 🔧 **Codegen** - 录制操作自动生成测试代码
- 📊 **Trace Viewer** - 测试失败时的完整追踪分析
- 🌍 **多语言** - 支持 TypeScript、JavaScript、Python、Java、.NET

**适用场景:** 跨浏览器测试、现代 Web 应用、需要高可靠性的 E2E 测试

---

### [Cypress](https://www.cypress.io/) ⭐ 49.4k

现代化的前端测试工具，实时重载和时间旅行调试。

```bash
npm install -D cypress
```

```javascript
// cypress/e2e/spec.cy.js
describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com');
  });
});
```

**核心特性:**
- ⏱️ **实时重载** - 保存即刷新，即时反馈
- 🕐 **时间旅行** - 悬停命令查看 DOM 状态
- 🔍 **调试友好** - 原生访问应用代码
- 📸 **自动截图** - 失败自动截图和视频录制
- 🌐 **网络控制** - 拦截和模拟网络请求
- 🔌 **组件测试** - 支持组件级测试

**适用场景:** 前端开发者主导的测试、需要丰富调试体验、现代 SPA 应用

---

### [Puppeteer](https://pptr.dev/) ⭐ 89.7k

Google Chrome 团队开发的 Node.js API，控制无头 Chrome。

```bash
npm install -D puppeteer
```

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });
  
  await browser.close();
})();
```

**核心特性:**
- 🎯 **Chrome 原生** - 紧密集成 Chrome DevTools Protocol
- 📸 **截图/PDF** - 生成页面截图和 PDF
- 🧪 **自动化** - 表单提交、键盘输入等自动化
- 🔍 **性能分析** - 获取页面性能指标
- 🌐 **扩展测试** - Chrome 扩展测试支持
- 🔧 **WebDriver BiDi** - 实验性 Firefox 支持

**适用场景:** Chrome 自动化、网页抓取、性能分析、PDF 生成

---

### [Selenium](https://www.selenium.dev/) ⭐ 33.5k

业界标准的浏览器自动化工具，支持多语言和多浏览器。

```bash
npm install -D selenium-webdriver
```

```javascript
const { Builder, By, Key, until } = require('selenium-webdriver');

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    await driver.get('https://www.google.com');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
})();
```

**核心特性:**
- 🌍 **跨浏览器** - 支持所有主流浏览器
- 🌐 **WebDriver 标准** - W3C WebDriver 协议实现
- 🔧 **多语言** - Java、Python、C#、JavaScript 等
- 📊 **Grid 支持** - 分布式测试执行
- 🏢 **企业级** - 成熟稳定，广泛使用

**适用场景:** 企业级项目、多浏览器兼容性测试、需要广泛浏览器支持

---

### [WebdriverIO](https://webdriver.io/) ⭐ 8.9k

基于 WebDriver 协议的 Next-gen 测试自动化框架。

```bash
npm init wdio@latest .
```

```javascript
// wdio.conf.js
exports.config = {
  specs: ['./test/specs/**/*.js'],
  capabilities: [{
    browserName: 'chrome'
  }],
  framework: 'mocha'
};

// test/specs/example.e2e.js
describe('My Login application', () => {
  it('should login with valid credentials', async () => {
    await browser.url('https://the-internet.herokuapp.com/login');
    await $('#username').setValue('tomsmith');
    await $('#password').setValue('SuperSecretPassword!');
    await $('button[type="submit"]').click();
    await expect($('#flash')).toBeExisting();
  });
});
```

**核心特性:**
- 🎯 **统一 API** - WebDriver 和 Chrome DevTools 统一接口
- 📱 **移动端支持** - Appium 集成，支持 iOS/Android
- 🔧 **灵活配置** - 支持多种测试框架（Mocha、Jasmine、Cucumber）
- 🌐 **云服务** - 内置 Sauce Labs、BrowserStack 支持
- 🔍 **元素定位** - 智能元素等待和定位策略

**适用场景:** 需要 WebDriver 标准、移动端测试、多框架集成

---

## 测试工具与库

### [Testing Library](https://testing-library.com/) ⭐ 21k+

测试最佳实践库家族，引导开发者编写用户行为的测试。

```bash
# React
npm install -D @testing-library/react @testing-library/jest-dom

# Vue
npm install -D @testing-library/vue

# DOM
npm install -D @testing-library/dom
```

```jsx
// App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

**核心特性:**
- 👤 **用户中心** - 测试用户可见的行为，而非实现细节
- 🔍 **查询优先** - 优先使用 getByRole、getByText 等语义化查询
- ♿ **无障碍** - 鼓励编写无障碍友好的组件
- 🔄 **自动清理** - 测试后自动清理 DOM
- 📚 **多框架** - React、Vue、Angular、Svelte 支持

**适用场景:** 组件测试、鼓励测试最佳实践、无障碍测试

---

### [Storybook](https://storybook.js.org/) ⭐ 84k

UI 组件开发和测试的独立环境。

```bash
npx storybook@latest init
```

```tsx
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Example/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};
```

**核心特性:**
- 📝 **组件文档** - 自动生成组件文档
- 🎨 **视觉测试** - 与 Chromatic 集成视觉回归测试
- 🔧 **交互测试** - 在 Storybook 中测试组件交互
- 📱 **响应式** - 内置视口切换
- 🔌 **插件生态** - 丰富的插件系统
- 🎭 **测试集成** - 支持 Jest、Testing Library 等

**适用场景:** 组件库开发、UI 测试、设计系统文档

---

### [Chromatic](https://www.chromatic.com/)

基于 Storybook 的视觉测试和 UI 评审平台。

**核心特性:**
- 📸 **视觉回归** - 像素级 UI 对比
- 👥 **团队协作** - 视觉变更评审工作流
- 🌿 **分支集成** - PR 级视觉测试
- 📱 **多浏览器** - 跨浏览器视觉测试

---

### [MSW (Mock Service Worker)](https://mswjs.io/) ⭐ 17k

API 模拟库，使用 Service Worker 拦截请求。

```bash
npm install -D msw
```

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ]);
  }),
];

// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**核心特性:**
- 🌐 **网络层拦截** - 在浏览器网络层拦截请求
- 🔄 **环境共享** - 同一套 mock 用于开发、测试、演示
- 📡 **REST/GraphQL** - 支持两种 API 风格
- 🎯 **零侵入** - 应用代码无需修改
- 🌊 **WebSocket** - v2.6+ 支持 WebSocket 模拟

**适用场景:** API 模拟、离线开发、测试隔离、演示环境

---

### [Nock](https://github.com/nock/nock) ⭐ 12k

HTTP 服务器模拟和期望库，用于 Node.js。

```javascript
const nock = require('nock');

const scope = nock('https://api.github.com')
  .get('/repos/atom/atom/license')
  .reply(200, {
    license: {
      key: 'mit',
      name: 'MIT License',
    },
  });
```

**核心特性:**
- 🎯 **HTTP 拦截** - 拦截 Node.js HTTP 请求
- 📝 **期望断言** - 验证请求参数和头部
- 🔄 **持久化** - 记录和回放 HTTP 交互
- 🎭 **模拟响应** - 灵活定义响应内容

**适用场景:** Node.js 单元测试、HTTP 客户端测试

---

### [Sinon](https://sinonjs.org/) ⭐ 9.7k

独立的测试 spy、stub 和 mock 库。

```bash
npm install -D sinon
```

```javascript
const sinon = require('sinon');

// Spy
const myObject = { method: () => {} };
sinon.spy(myObject, 'method');

// Stub
const stub = sinon.stub().returns(42);
console.log(stub()); // 42

// Mock
const myMock = sinon.mock(myObject);
myMock.expects('method').once();
```

**核心特性:**
- 🕵️ **Spies** - 跟踪函数调用
- 🧱 **Stubs** - 替换函数行为
- 🎭 **Mocks** - 预设期望和验证
- ⏱️ **Fake Timers** - 控制时间相关代码
- 🌐 **Fake XHR** - 模拟 XMLHttpRequest

**适用场景:** 单元测试中的依赖隔离、函数行为验证

---

## 覆盖率工具

### [c8](https://github.com/bcoe/c8)

基于 V8 内置覆盖率的零配置覆盖率工具。

```bash
npm install -D c8
npx c8 npm test
```

**核心特性:**
- ⚡ **原生 V8** - 使用 V8 内置覆盖率
- 🚀 **极速** - 比 nyc 快得多
- 📦 **零配置** - 开箱即用
- 🎯 **ESM 支持** - 原生支持 ES 模块

**适用场景:** 现代 Node.js 项目、ESM 项目、追求速度的项目

---

### [nyc](https://github.com/istanbuljs/nyc)

Istanbul 的命令行代码覆盖率工具。

```bash
npm install -D nyc
npx nyc npm test
```

**核心特性:**
- 🎯 **Istanbul 生态** - 成熟的覆盖率生态
- 📊 **多格式** - 支持 HTML、LCOV、Cobertura 等报告
- 🔧 **配置丰富** - 大量配置选项
- 🌐 **广泛兼容** - 支持各种测试框架

**适用场景:** 需要丰富报告格式、复杂配置需求的项目

---

### [v8-to-istanbul](https://github.com/istanbuljs/v8-to-istanbul)

将 V8 覆盖率转换为 Istanbul 格式的桥梁工具。

```bash
npm install -D v8-to-istanbul
```

**核心特性:**
- 🔄 **格式转换** - V8 覆盖率转 Istanbul 格式
- 🎯 **兼容性** - 结合 V8 速度和 Istanbul 报告
- 🔧 **工具链** - 现代覆盖率工具链的一部分

---

## 选型指南

| 场景 | 推荐工具 | 备选方案 |
|------|---------|---------|
| **Vite 项目单元测试** | Vitest | Jest |
| **React 项目单元测试** | Jest + Testing Library | Vitest |
| **现代 E2E 测试** | Playwright | Cypress |
| **Chrome 自动化** | Puppeteer | Playwright |
| **跨浏览器兼容性** | Selenium | Playwright |
| **组件文档+测试** | Storybook + Chromatic | Ladle |
| **API 模拟** | MSW | Nock |
| **测试替身** | Jest Mock | Sinon |
| **覆盖率分析** | c8 | nyc |

---

## 最佳实践

1. **测试金字塔** - 更多单元测试，更少 E2E 测试
2. **测试用户行为** - 使用 Testing Library 测试可见行为
3. **避免实现细节** - 不测试内部状态和实现
4. **保持独立** - 每个测试相互独立，无依赖
5. **明确断言** - 每个测试有明确单一的断言目标
6. **持续集成** - 将测试集成到 CI/CD 流程
7. **代码覆盖率** - 保持合理覆盖率（建议 >80%）
8. **Mock 边界** - 仅 mock 外部依赖，不 mock 被测代码
